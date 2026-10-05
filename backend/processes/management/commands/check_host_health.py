from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from processes.models import Alert, AlertAuditLog, Host
from processes.notifications import dispatch_alert_notifications
from processes.views import _active_alerts_for_host, _recalculate_host_posture, _severity_rank


CONNECTIVITY_FINGERPRINT = "host_connectivity"


class Command(BaseCommand):
    help = "Evaluate host freshness, generate stale/offline alerts, and dispatch notifications."

    def handle(self, *args, **options):
        now = timezone.now()
        warning_seconds = settings.HOSTLENS_OFFLINE_WARNING_SECONDS
        critical_seconds = settings.HOSTLENS_OFFLINE_CRITICAL_SECONDS

        created_count = 0
        escalated_count = 0
        resolved_count = 0

        for host in Host.objects.filter(monitoring_enabled=True).select_related("owner"):
            connectivity_alert = (
                host.alerts.filter(
                    fingerprint=CONNECTIVITY_FINGERPRINT,
                    status__in=[Alert.Status.OPEN, Alert.Status.ACKNOWLEDGED, Alert.Status.MUTED],
                )
                .order_by("-last_seen_at")
                .first()
            )

            if not host.last_seen:
                _recalculate_host_posture(host)
                continue

            age_seconds = int((now - host.last_seen).total_seconds())
            desired_level = None
            desired_type = None
            desired_message = None
            event_type = None

            if age_seconds >= critical_seconds:
                desired_level = "critical"
                desired_type = "host_offline"
                desired_message = (
                    f"{host.display_name or host.hostname} has not checked in for {age_seconds // 60} minutes"
                )
                event_type = "host.offline"
            elif age_seconds >= warning_seconds:
                desired_level = "warning"
                desired_type = "host_stale"
                desired_message = (
                    f"{host.display_name or host.hostname} is stale and last checked in {age_seconds // 60} minutes ago"
                )
                event_type = "host.stale"

            if desired_level:
                if connectivity_alert:
                    previous_level = connectivity_alert.level
                    connectivity_alert.level = desired_level
                    connectivity_alert.type = desired_type
                    connectivity_alert.message = desired_message
                    connectivity_alert.last_seen_at = now
                    connectivity_alert.occurrence_count += 1
                    connectivity_alert.metadata = {"age_seconds": age_seconds}
                    connectivity_alert.save(
                        update_fields=[
                            "level",
                            "type",
                            "message",
                            "last_seen_at",
                            "occurrence_count",
                            "metadata",
                            "updated_at",
                        ]
                    )
                    if _severity_rank(desired_level) > _severity_rank(previous_level):
                        dispatch_alert_notifications(connectivity_alert, event_type or "host.offline")
                        escalated_count += 1
                else:
                    connectivity_alert = Alert.objects.create(
                        host=host,
                        latest_snapshot=host.get_latest_snapshot(),
                        fingerprint=CONNECTIVITY_FINGERPRINT,
                        level=desired_level,
                        type=desired_type,
                        message=desired_message,
                        status=Alert.Status.OPEN,
                        metadata={"age_seconds": age_seconds},
                        first_seen_at=now,
                        last_seen_at=now,
                        occurrence_count=1,
                    )
                    AlertAuditLog.objects.create(
                        alert=connectivity_alert,
                        action="created",
                        previous_status="",
                        next_status=Alert.Status.OPEN,
                        metadata={"reason": desired_type, "age_seconds": age_seconds},
                    )
                    dispatch_alert_notifications(connectivity_alert, event_type or "host.offline")
                    created_count += 1
            elif connectivity_alert:
                previous_status = connectivity_alert.status
                connectivity_alert.status = Alert.Status.RESOLVED
                connectivity_alert.resolved_at = now
                connectivity_alert.resolved_by = None
                connectivity_alert.save(
                    update_fields=["status", "resolved_at", "resolved_by", "updated_at"]
                )
                AlertAuditLog.objects.create(
                    alert=connectivity_alert,
                    action="auto_resolved",
                    previous_status=previous_status,
                    next_status=Alert.Status.RESOLVED,
                    metadata={"reason": "host_recovered"},
                )
                resolved_count += 1

            _recalculate_host_posture(host)

        self.stdout.write(
            self.style.SUCCESS(
                f"Host health check complete: created={created_count}, escalated={escalated_count}, resolved={resolved_count}"
            )
        )
