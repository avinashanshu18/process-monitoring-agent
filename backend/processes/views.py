from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from rest_framework import status, views
from rest_framework.response import Response

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Host, Snapshot, Process
from .serializers import SnapshotInSerializer, SnapshotOutSerializer

import secrets


class IngestSnapshotView(views.APIView):
    """
    POST /api/v1/process-snapshots/
    Uses per-host api_key (Host.api_key). If host has no api_key yet,
    the global settings.PROC_MONITOR_API_KEY may be used to allow onboarding.
    """
    authentication_classes = []  # manual auth in this view

    def post(self, request):
        # Parse and validate payload
        ser = SnapshotInSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        hostname = ser.validated_data["hostname"]
        processes = ser.validated_data["processes"]

        # Read API key header provided by agent
        api_key_header = request.headers.get("X-API-Key")

        # Fetch or create host record
        host, created = Host.objects.get_or_create(hostname=hostname)

        # Authentication logic:
        #  - If host.api_key exists -> require match.
        #  - Else if global PROC_MONITOR_API_KEY exists and matches header -> allow onboarding.
        #  - Otherwise reject.
        host_key = getattr(host, "api_key", None)
        global_key = getattr(settings, "PROC_MONITOR_API_KEY", None)

        if host_key:
            if not api_key_header or api_key_header != host_key:
                return Response({"detail": "Invalid host API key"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            # host has no per-host key yet
            if global_key and api_key_header == global_key:
                # allow onboarding using global key (do NOT automatically generate host key here)
                pass
            else:
                return Response({"detail": "Host API key required or invalid"}, status=status.HTTP_401_UNAUTHORIZED)

        # Create snapshot and processes atomically
        with transaction.atomic():
            snap = Snapshot.objects.create(host=host, created_at=timezone.now())

            proc_objs = []
            for p in processes:
                proc_objs.append(Process(
                    snapshot=snap,
                    pid=p["pid"],
                    ppid=p.get("ppid"),
                    name=p["name"][:512],
                    cpu_percent=p.get("cpu_percent"),
                    memory_mb=p.get("memory_mb"),
                ))
            Process.objects.bulk_create(proc_objs)

            # Refresh snapshot from DB if needed (not strictly necessary)
            snap.refresh_from_db()

            # Serialize the snapshot WITH processes (they now exist)
            snap_data = SnapshotOutSerializer(snap).data

            # Broadcast to WebSocket group for this host (after creation)
            try:
                layer = get_channel_layer()
                async_to_sync(layer.group_send)(
                    f"process_{hostname}",
                    {"type": "send_snapshot", "data": snap_data}
                )
            except Exception:
                # We don't want WebSocket errors to break ingestion; log if you have logger.
                pass

        # Return created snapshot data
        return Response(snap_data, status=status.HTTP_201_CREATED)


class LatestSnapshotView(views.APIView):
    """
    GET /api/v1/process-snapshots/latest/?hostname=<host>
    Returns latest snapshot for the hostname; if none, 404.
    """
    def get(self, request):
        hostname = request.query_params.get("hostname")
        if not hostname:
            return Response({"detail": "hostname query param required"}, status=400)
        host = get_object_or_404(Host, hostname=hostname)
        snap = host.snapshots.order_by("-created_at").first()
        if not snap:
            return Response({"detail": "no snapshots found"}, status=404)
        return Response(SnapshotOutSerializer(snap).data, status=200)


class HostsView(views.APIView):
    """
    GET /api/v1/hosts/  -> list of hostnames that have data
    """
    def get(self, request):
        return Response({"hosts": list(Host.objects.values_list("hostname", flat=True))})


class SnapshotListView(views.APIView):
    """
    GET /api/v1/process-snapshots/history/?hostname=<host>&limit=10
    """
    def get(self, request):
        hostname = request.query_params.get("hostname")
        limit = int(request.query_params.get("limit", 10))
        if not hostname:
            return Response({"detail": "hostname required"}, status=400)
        host = get_object_or_404(Host, hostname=hostname)
        snaps = host.snapshots.order_by("-created_at")[:limit]
        return Response(SnapshotOutSerializer(snaps, many=True).data)


class RotateHostKeyView(views.APIView):
    """
    POST /api/v1/hosts/rotate-key/
    Requires X-Admin-Key header to match settings.SUPER_ADMIN_KEY
    Request body: {"hostname": "<hostname>"}
    """
    def post(self, request):
        admin_key = request.headers.get("X-Admin-Key")
        if not admin_key or admin_key != getattr(settings, "SUPER_ADMIN_KEY", ""):
            return Response({"detail": "Invalid Admin Key"}, status=status.HTTP_401_UNAUTHORIZED)

        hostname = request.data.get("hostname")
        if not hostname:
            return Response({"detail": "hostname required"}, status=400)

        host = get_object_or_404(Host, hostname=hostname)

        # Generate a new 32-char hex key
        new_key = secrets.token_hex(16)

        if not hasattr(host, "api_key"):
            return Response({"detail": "Host model has no 'api_key' field"}, status=500)

        host.api_key = new_key
        host.save()

        return Response({
            "hostname": host.hostname,
            "new_api_key": new_key
        }, status=200)
