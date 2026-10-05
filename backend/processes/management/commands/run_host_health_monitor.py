import time

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Continuously evaluate host freshness and generate offline alerts."

    def add_arguments(self, parser):
        parser.add_argument(
            "--interval",
            type=int,
            default=60,
            help="Seconds between host health checks.",
        )

    def handle(self, *args, **options):
        interval = max(5, int(options["interval"]))
        self.stdout.write(
            self.style.SUCCESS(
                f"Starting HostLens health monitor loop with {interval}s interval."
            )
        )

        try:
            while True:
                call_command("check_host_health")
                time.sleep(interval)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("HostLens health monitor stopped."))
