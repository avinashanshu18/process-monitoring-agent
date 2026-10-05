from django.core.management.base import BaseCommand
from django.utils import timezone

from processes.models import NotificationDelivery
from processes.notifications import deliver_notification_channel, get_notification_preference


class Command(BaseCommand):
    help = "Retry recent failed notification deliveries."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=25,
            help="Maximum number of failed deliveries to retry.",
        )

    def handle(self, *args, **options):
        limit = max(1, int(options["limit"]))
        queryset = (
            NotificationDelivery.objects.filter(status=NotificationDelivery.Status.FAILED, alert__isnull=False)
            .select_related("alert", "host")
            .order_by("-created_at")[:limit]
        )

        retried = 0
        skipped = 0
        for delivery in queryset:
            owner = delivery.host.owner
            if owner is None:
                skipped += 1
                continue

            preference = get_notification_preference(owner)
            retry_event_type = f"{delivery.event_type}.retry"
            deliver_notification_channel(
                delivery.alert,
                preference,
                retry_event_type,
                delivery.channel,
            )
            delivery.metadata = {
                **(delivery.metadata or {}),
                "retry_requested_at": timezone.now().isoformat(),
            }
            delivery.save(update_fields=["metadata"])
            retried += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Retried {retried} failed delivery(s); skipped {skipped}."
            )
        )
