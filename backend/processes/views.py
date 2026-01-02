# from django.shortcuts import get_object_or_404
# from django.conf import settings
# from django.db import transaction
# from django.utils import timezone

# from rest_framework import status, views
# from rest_framework.response import Response

# from asgiref.sync import async_to_sync
# from channels.layers import get_channel_layer

# from .models import Host, Snapshot, Process
# from .serializers import SnapshotInSerializer, SnapshotOutSerializer

# import secrets


# class IngestSnapshotView(views.APIView):
#     """
#     POST /api/v1/process-snapshots/
#     Uses per-host api_key (Host.api_key). If host has no api_key yet,
#     the global settings.PROC_MONITOR_API_KEY may be used to allow onboarding.
#     """
#     authentication_classes = []  # manual auth in this view

#     def post(self, request):
#         # Parse and validate payload
#         ser = SnapshotInSerializer(data=request.data)
#         ser.is_valid(raise_exception=True)
#         hostname = ser.validated_data["hostname"]
#         processes = ser.validated_data["processes"]

#         # Read API key header provided by agent
#         api_key_header = request.headers.get("X-API-Key")

#         # Fetch or create host record
#         host, created = Host.objects.get_or_create(hostname=hostname)

#         # Authentication logic:
#         #  - If host.api_key exists -> require match.
#         #  - Else if global PROC_MONITOR_API_KEY exists and matches header -> allow onboarding.
#         #  - Otherwise reject.
#         host_key = getattr(host, "api_key", None)
#         global_key = getattr(settings, "PROC_MONITOR_API_KEY", None)

#         if host_key:
#             if not api_key_header or api_key_header != host_key:
#                 return Response({"detail": "Invalid host API key"}, status=status.HTTP_401_UNAUTHORIZED)
#         else:
#             # host has no per-host key yet
#             if global_key and api_key_header == global_key:
#                 # allow onboarding using global key (do NOT automatically generate host key here)
#                 pass
#             else:
#                 return Response({"detail": "Host API key required or invalid"}, status=status.HTTP_401_UNAUTHORIZED)

#         # Create snapshot and processes atomically
#         with transaction.atomic():
#             snap = Snapshot.objects.create(host=host, created_at=timezone.now())

#             proc_objs = []
#             for p in processes:
#                 proc_objs.append(Process(
#                     snapshot=snap,
#                     pid=p["pid"],
#                     ppid=p.get("ppid"),
#                     name=p["name"][:512],
#                     cpu_percent=p.get("cpu_percent"),
#                     memory_mb=p.get("memory_mb"),
#                 ))
#             Process.objects.bulk_create(proc_objs)

#             # Refresh snapshot from DB if needed (not strictly necessary)
#             snap.refresh_from_db()

#             # Serialize the snapshot WITH processes (they now exist)
#             snap_data = SnapshotOutSerializer(snap).data

#             # Broadcast to WebSocket group for this host (after creation)
#             try:
#                 layer = get_channel_layer()
#                 async_to_sync(layer.group_send)(
#                     f"process_{hostname}",
#                     {"type": "send_snapshot", "data": snap_data}
#                 )
#             except Exception:
#                 # We don't want WebSocket errors to break ingestion; log if you have logger.
#                 pass

#         # Return created snapshot data
#         return Response(snap_data, status=status.HTTP_201_CREATED)


# class LatestSnapshotView(views.APIView):
#     """
#     GET /api/v1/process-snapshots/latest/?hostname=<host>
#     Returns latest snapshot for the hostname; if none, 404.
#     """
#     def get(self, request):
#         hostname = request.query_params.get("hostname")
#         if not hostname:
#             return Response({"detail": "hostname query param required"}, status=400)
#         host = get_object_or_404(Host, hostname=hostname)
#         snap = host.snapshots.order_by("-created_at").first()
#         if not snap:
#             return Response({"detail": "no snapshots found"}, status=404)
#         return Response(SnapshotOutSerializer(snap).data, status=200)


# class HostsView(views.APIView):
#     """
#     GET /api/v1/hosts/  -> list of hostnames that have data
#     """
#     def get(self, request):
#         return Response({"hosts": list(Host.objects.values_list("hostname", flat=True))})


# class SnapshotListView(views.APIView):
#     """
#     GET /api/v1/process-snapshots/history/?hostname=<host>&limit=10
#     """
#     def get(self, request):
#         hostname = request.query_params.get("hostname")
#         limit = int(request.query_params.get("limit", 10))
#         if not hostname:
#             return Response({"detail": "hostname required"}, status=400)
#         host = get_object_or_404(Host, hostname=hostname)
#         snaps = host.snapshots.order_by("-created_at")[:limit]
#         return Response(SnapshotOutSerializer(snaps, many=True).data)


# class RotateHostKeyView(views.APIView):
#     """
#     POST /api/v1/hosts/rotate-key/
#     Requires X-Admin-Key header to match settings.SUPER_ADMIN_KEY
#     Request body: {"hostname": "<hostname>"}
#     """
#     def post(self, request):
#         admin_key = request.headers.get("X-Admin-Key")
#         if not admin_key or admin_key != getattr(settings, "SUPER_ADMIN_KEY", ""):
#             return Response({"detail": "Invalid Admin Key"}, status=status.HTTP_401_UNAUTHORIZED)

#         hostname = request.data.get("hostname")
#         if not hostname:
#             return Response({"detail": "hostname required"}, status=400)

#         host = get_object_or_404(Host, hostname=hostname)

#         # Generate a new 32-char hex key
#         new_key = secrets.token_hex(16)

#         if not hasattr(host, "api_key"):
#             return Response({"detail": "Host model has no 'api_key' field"}, status=500)

#         host.api_key = new_key
#         host.save()

#         return Response({
#             "hostname": host.hostname,
#             "new_api_key": new_key
#         }, status=200)



"""
Production-Grade ViewSets
Includes: Permissions, Filtering, Pagination, Caching, Rate Limiting
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Avg, Max, Count, F
from django.core.cache import cache
from datetime import timedelta
import logging

from .models import Host, Snapshot, Process, Task
from .serializers import (
    HostListSerializer, HostDetailSerializer, HostCreateSerializer,
    SnapshotListSerializer, SnapshotSerializer, SnapshotCreateSerializer,
    ProcessListSerializer, ProcessSerializer, ProcessBulkCreateSerializer,
    TaskSerializer, HostStatsSerializer, MetricsTrendSerializer
)
from .permissions import IsHostOwnerOrReadOnly, HasAPIKey

logger = logging.getLogger(__name__)


# ============================================================================
# HOST VIEWSET
# ============================================================================

class HostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Host management
    
    list: Get all hosts
    retrieve: Get specific host details
    create: Register new host
    update: Update host information
    partial_update: Partial host update
    destroy: Delete host (soft delete)
    """
    queryset = Host.objects.filter(is_deleted=False).select_related('owner', 'workspace')
    permission_classes = [IsAuthenticated, IsHostOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'monitoring_enabled', 'os_name', 'workspace']
    search_fields = ['hostname', 'display_name', 'ip_address', 'tags']
    ordering_fields = ['hostname', 'created_at', 'last_seen', 'status']
    ordering = ['-last_seen']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return HostListSerializer
        elif self.action == 'create':
            return HostCreateSerializer
        return HostDetailSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        user = self.request.user
        
        # Superusers see all hosts
        if user.is_superuser:
            return self.queryset
        
        # Regular users see their own hosts or workspace hosts
        return self.queryset.filter(
            Q(owner=user) | Q(workspace__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Set owner on host creation"""
        serializer.save(owner=self.request.user)
        logger.info(f"Host created: {serializer.instance.hostname} by {self.request.user}")
    
    def perform_destroy(self, instance):
        """Soft delete host"""
        instance.soft_delete()
        logger.info(f"Host deleted: {instance.hostname} by {self.request.user}")
    
    @action(detail=True, methods=['post'])
    def regenerate_api_key(self, request, pk=None):
        """Regenerate API key for host"""
        host = self.get_object()
        host.generate_api_key()
        
        logger.warning(f"API key regenerated for host: {host.hostname} by {request.user}")
        
        return Response({
            'message': 'API key regenerated successfully',
            'api_key': host.api_key
        })
    
    @action(detail=True, methods=['get'])
    def health(self, request, pk=None):
        """Get host health status"""
        host = self.get_object()
        
        health_data = {
            'host_id': str(host.id),
            'hostname': host.hostname,
            'status': host.status,
            'health_score': host.get_health_score(),
            'last_seen': host.last_seen,
            'is_online': (timezone.now() - host.last_seen) < timedelta(minutes=5) if host.last_seen else False
        }
        
        return Response(health_data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get overall host statistics"""
        cache_key = f'host_stats_{request.user.id}'
        cached_stats = cache.get(cache_key)
        
        if cached_stats:
            return Response(cached_stats)
        
        queryset = self.get_queryset()
        
        stats = {
            'total_hosts': queryset.count(),
            'online_hosts': queryset.filter(status='online').count(),
            'offline_hosts': queryset.filter(status='offline').count(),
            'warning_hosts': queryset.filter(status='warning').count(),
            'critical_hosts': queryset.filter(status='critical').count(),
        }
        
        # Get average metrics from latest snapshots
        latest_snapshots = Snapshot.objects.filter(
            host__in=queryset,
            is_deleted=False
        ).values('host').annotate(
            latest_id=Max('created_at')
        )
        
        snapshot_ids = [s['latest_id'] for s in latest_snapshots]
        avg_metrics = Snapshot.objects.filter(
            created_at__in=snapshot_ids
        ).aggregate(
            avg_cpu=Avg('cpu_percent'),
            avg_memory=Avg('memory_percent'),
            avg_disk=Avg('disk_percent')
        )
        
        stats.update({
            'avg_cpu_percent': round(avg_metrics['avg_cpu'] or 0, 2),
            'avg_memory_percent': round(avg_metrics['avg_memory'] or 0, 2),
            'avg_disk_percent': round(avg_metrics['avg_disk'] or 0, 2)
        })
        
        serializer = HostStatsSerializer(stats)
        
        # Cache for 1 minute
        cache.set(cache_key, serializer.data, 60)
        
        return Response(serializer.data)


# ============================================================================
# SNAPSHOT VIEWSET
# ============================================================================

class SnapshotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Snapshot management
    """
    queryset = Snapshot.objects.filter(is_deleted=False).select_related('host')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['host', 'created_at']
    ordering_fields = ['created_at', 'cpu_percent', 'memory_percent']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'list':
            return SnapshotListSerializer
        elif self.action == 'create':
            return SnapshotCreateSerializer
        return SnapshotSerializer
    
    def get_queryset(self):
        """Filter snapshots by user's hosts"""
        user = self.request.user
        
        if user.is_superuser:
            return self.queryset
        
        return self.queryset.filter(
            Q(host__owner=user) | Q(host__workspace__members=user)
        ).distinct()
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest snapshot for each host"""
        host_id = request.query_params.get('host_id')
        
        if host_id:
            try:
                host = Host.objects.get(id=host_id)
                snapshot = host.get_latest_snapshot()
                if snapshot:
                    serializer = SnapshotSerializer(snapshot)
                    return Response(serializer.data)
                return Response({'error': 'No snapshots found'}, status=status.HTTP_404_NOT_FOUND)
            except Host.DoesNotExist:
                return Response({'error': 'Host not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get latest snapshot for all user's hosts
        queryset = self.get_queryset()
        latest_snapshots = queryset.values('host').annotate(
            latest_created=Max('created_at')
        )
        
        snapshot_ids = [
            Snapshot.objects.filter(
                host_id=s['host'],
                created_at=s['latest_created']
            ).first().id
            for s in latest_snapshots
        ]
        
        snapshots = Snapshot.objects.filter(id__in=snapshot_ids)
        serializer = SnapshotListSerializer(snapshots, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get metric trends over time"""
        host_id = request.query_params.get('host_id')
        hours = int(request.query_params.get('hours', 24))
        metric = request.query_params.get('metric', 'cpu_percent')
        
        if not host_id:
            return Response(
                {'error': 'host_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        time_threshold = timezone.now() - timedelta(hours=hours)
        
        snapshots = self.get_queryset().filter(
            host_id=host_id,
            created_at__gte=time_threshold
        ).order_by('created_at')
        
        data_points = [
            {
                'timestamp': snap.created_at,
                'value': getattr(snap, metric, 0) or 0
            }
            for snap in snapshots
        ]
        
        if not data_points:
            return Response({
                'metric_name': metric,
                'data_points': [],
                'avg_value': 0,
                'min_value': 0,
                'max_value': 0
            })
        
        values = [dp['value'] for dp in data_points]
        
        trend_data = {
            'metric_name': metric,
            'data_points': data_points,
            'avg_value': round(sum(values) / len(values), 2),
            'min_value': round(min(values), 2),
            'max_value': round(max(values), 2)
        }
        
        serializer = MetricsTrendSerializer(trend_data)
        return Response(serializer.data)


# ============================================================================
# PROCESS VIEWSET
# ============================================================================

class ProcessViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Process viewing (read-only)
    """
    queryset = Process.objects.select_related('snapshot', 'snapshot__host')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['snapshot', 'pid', 'ppid', 'name', 'status', 'username']
    search_fields = ['name', 'cmdline', 'username']
    ordering_fields = ['cpu_percent', 'memory_mb', 'created_at']
    ordering = ['-cpu_percent']
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'list':
            return ProcessListSerializer
        return ProcessSerializer
    
    def get_queryset(self):
        """Filter processes by user's hosts"""
        user = self.request.user
        
        if user.is_superuser:
            return self.queryset
        
        return self.queryset.filter(
            Q(snapshot__host__owner=user) | Q(snapshot__host__workspace__members=user)
        ).distinct()
    
    @action(detail=False, methods=['get'])
    def top_cpu(self, request):
        """Get top CPU-consuming processes"""
        limit = int(request.query_params.get('limit', 10))
        host_id = request.query_params.get('host_id')
        
        queryset = self.get_queryset()
        
        if host_id:
            queryset = queryset.filter(snapshot__host_id=host_id)
        
        # Get latest snapshot per host
        latest_snapshots = Snapshot.objects.filter(
            host__in=[q.snapshot.host for q in queryset]
        ).values('host').annotate(latest_created=Max('created_at'))
        
        snapshot_ids = [
            Snapshot.objects.filter(
                host_id=s['host'],
                created_at=s['latest_created']
            ).first().id
            for s in latest_snapshots
        ]
        
        top_processes = queryset.filter(
            snapshot_id__in=snapshot_ids
        ).order_by('-cpu_percent')[:limit]
        
        serializer = ProcessListSerializer(top_processes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_memory(self, request):
        """Get top memory-consuming processes"""
        limit = int(request.query_params.get('limit', 10))
        host_id = request.query_params.get('host_id')
        
        queryset = self.get_queryset()
        
        if host_id:
            queryset = queryset.filter(snapshot__host_id=host_id)
        
        top_processes = queryset.order_by('-memory_mb')[:limit]
        
        serializer = ProcessListSerializer(top_processes, many=True)
        return Response(serializer.data)


# ============================================================================
# TASK VIEWSET
# ============================================================================

class TaskViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Task monitoring
    """
    queryset = Task.objects.select_related('host', 'user')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'task_type', 'host']
    ordering_fields = ['created_at', 'started_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter tasks by user"""
        user = self.request.user
        
        if user.is_superuser:
            return self.queryset
        
        return self.queryset.filter(
            Q(user=user) | Q(host__owner=user) | Q(host__workspace__members=user)
        ).distinct()
