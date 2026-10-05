from django.conf import settings
from django.db import models
from django.utils import timezone
import secrets
import uuid


class Host(models.Model):
    class HostStatus(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        WARNING = "warning", "Warning"

    agent_id = models.CharField(max_length=64, unique=True, blank=True, null=True)
    hostname = models.CharField(max_length=255, db_index=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="owned_hosts",
        null=True,
        blank=True,
    )
    api_key = models.CharField(max_length=64, blank=True, null=True)
    display_name = models.CharField(max_length=255, blank=True)
    device_type = models.CharField(max_length=32, blank=True)
    os_name = models.CharField(max_length=100, blank=True)
    os_version = models.CharField(max_length=100, blank=True)
    architecture = models.CharField(max_length=50, blank=True)
    primary_ip = models.CharField(max_length=128, blank=True)
    agent_version = models.CharField(max_length=32, blank=True)
    cpu_count = models.IntegerField(null=True, blank=True)
    total_memory_mb = models.FloatField(null=True, blank=True)
    total_disk_gb = models.FloatField(null=True, blank=True)
    risk_score = models.IntegerField(default=0)
    latest_alert_level = models.CharField(max_length=16, blank=True)
    status = models.CharField(
        max_length=20,
        choices=HostStatus.choices,
        default=HostStatus.OFFLINE,
    )
    last_seen = models.DateTimeField(null=True, blank=True)
    monitoring_enabled = models.BooleanField(default=True)

    class Meta:
        ordering = ["hostname"]

    def __str__(self):
        return self.display_name or self.hostname

    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = self.hostname
        super().save(*args, **kwargs)

    def generate_api_key(self):
        self.api_key = secrets.token_hex(32)

    def mark_online(self):
        self.status = self.HostStatus.ONLINE
        self.last_seen = timezone.now()

    def get_latest_snapshot(self):
        return self.snapshots.order_by("-created_at").first()

    @property
    def is_online(self):
        if not self.last_seen:
            return False
        return (
            timezone.now() - self.last_seen
        ).total_seconds() < settings.HOSTLENS_OFFLINE_CRITICAL_SECONDS


class Snapshot(models.Model):
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="snapshots")
    created_at = models.DateTimeField(auto_now_add=True)
    cpu_percent = models.FloatField(null=True, blank=True)
    memory_percent = models.FloatField(null=True, blank=True)
    disk_percent = models.FloatField(null=True, blank=True)
    network_sent_mb = models.FloatField(null=True, blank=True)
    network_recv_mb = models.FloatField(null=True, blank=True)
    load_one = models.FloatField(null=True, blank=True)
    load_five = models.FloatField(null=True, blank=True)
    load_fifteen = models.FloatField(null=True, blank=True)
    uptime_seconds = models.BigIntegerField(null=True, blank=True)
    active_user_count = models.IntegerField(default=0)
    listening_ports = models.JSONField(default=list, blank=True)
    network_connections = models.JSONField(default=list, blank=True)
    network_events = models.JSONField(default=list, blank=True)
    dns_events = models.JSONField(default=list, blank=True)
    startup_items = models.JSONField(default=list, blank=True)
    service_inventory = models.JSONField(default=list, blank=True)
    software_inventory = models.JSONField(default=list, blank=True)
    user_sessions = models.JSONField(default=list, blank=True)
    file_integrity_items = models.JSONField(default=list, blank=True)
    file_events = models.JSONField(default=list, blank=True)
    auth_events = models.JSONField(default=list, blank=True)
    process_events = models.JSONField(default=list, blank=True)
    security_posture = models.JSONField(default=dict, blank=True)
    collector_sources = models.JSONField(default=list, blank=True)
    total_processes = models.IntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.host.hostname} @ {self.created_at.isoformat()}"


class Process(models.Model):
    snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE, related_name="processes")
    pid = models.IntegerField()
    ppid = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=512)
    cpu_percent = models.FloatField(null=True, blank=True)
    memory_mb = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=32, blank=True)
    username = models.CharField(max_length=255, blank=True)
    cmdline = models.TextField(blank=True)
    exe_path = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-cpu_percent", "-memory_mb", "name"]
        indexes = [
            models.Index(fields=["snapshot"]),
            models.Index(fields=["pid", "ppid"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.pid})"


class AlertRuleSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="alert_rule_settings",
    )
    cpu_warning_threshold = models.FloatField(default=82)
    cpu_critical_threshold = models.FloatField(default=95)
    memory_warning_threshold = models.FloatField(default=86)
    memory_critical_threshold = models.FloatField(default=95)
    disk_warning_threshold = models.FloatField(default=88)
    disk_critical_threshold = models.FloatField(default=96)
    process_cpu_warning_threshold = models.FloatField(default=60)
    process_memory_warning_mb = models.FloatField(default=1024)
    listening_ports_info_threshold = models.PositiveIntegerField(default=10)
    multiple_users_threshold = models.PositiveIntegerField(default=2)
    process_spike_min_delta = models.PositiveIntegerField(default=20)
    process_spike_percent_threshold = models.FloatField(default=25)
    watchlist_enabled = models.BooleanField(default=True)
    new_process_tracking_enabled = models.BooleanField(default=True)
    new_software_tracking_enabled = models.BooleanField(default=True)
    unsigned_software_alert_enabled = models.BooleanField(default=True)
    startup_drift_tracking_enabled = models.BooleanField(default=True)
    remote_session_tracking_enabled = models.BooleanField(default=True)
    file_integrity_tracking_enabled = models.BooleanField(default=True)
    auth_event_tracking_enabled = models.BooleanField(default=True)
    policy_engine_enabled = models.BooleanField(default=True)
    mobile_compliance_tracking_enabled = models.BooleanField(default=True)
    vulnerability_tracking_enabled = models.BooleanField(default=True)
    minimum_mobile_battery_percent = models.PositiveIntegerField(default=20)
    minimum_mobile_os_version = models.CharField(max_length=32, blank=True, default="17")
    muted_alert_auto_resolve = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__username"]

    def __str__(self):
        return f"{self.user.username} alert rules"


class Alert(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        ACKNOWLEDGED = "acknowledged", "Acknowledged"
        MUTED = "muted", "Muted"
        RESOLVED = "resolved", "Resolved"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="alerts")
    latest_snapshot = models.ForeignKey(
        Snapshot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts",
    )
    fingerprint = models.CharField(max_length=255, db_index=True)
    level = models.CharField(max_length=16, db_index=True)
    type = models.CharField(max_length=64, db_index=True)
    message = models.TextField()
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )
    note = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    first_seen_at = models.DateTimeField(default=timezone.now)
    last_seen_at = models.DateTimeField(default=timezone.now)
    occurrence_count = models.PositiveIntegerField(default=1)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="acknowledged_alerts",
    )
    muted_at = models.DateTimeField(null=True, blank=True)
    muted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="muted_alerts",
    )
    muted_until = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_alerts",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_seen_at", "-created_at"]
        indexes = [
            models.Index(fields=["host", "status"]),
            models.Index(fields=["host", "level"]),
            models.Index(fields=["host", "type"]),
            models.Index(fields=["status", "level"]),
        ]

    def __str__(self):
        return f"{self.host.hostname} {self.type} {self.level}"

    @property
    def is_active(self):
        return self.status in {
            self.Status.OPEN,
            self.Status.ACKNOWLEDGED,
            self.Status.MUTED,
        }


class AlertAuditLog(models.Model):
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name="audit_logs")
    action = models.CharField(max_length=32)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alert_audit_logs",
    )
    previous_status = models.CharField(max_length=16, blank=True)
    next_status = models.CharField(max_length=16, blank=True)
    note = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class HostEvent(models.Model):
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="events")
    snapshot = models.ForeignKey(
        Snapshot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    category = models.CharField(max_length=32, db_index=True)
    kind = models.CharField(max_length=64, db_index=True)
    severity = models.CharField(max_length=16, db_index=True)
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True)
    source = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    occurred_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-occurred_at", "-created_at"]
        indexes = [
            models.Index(fields=["host", "occurred_at"]),
            models.Index(fields=["host", "category"]),
            models.Index(fields=["host", "kind"]),
        ]

    def __str__(self):
        return f"{self.host.hostname} {self.kind} {self.severity}"


class SavedCheck(models.Model):
    class Category(models.TextChoices):
        POLICY = "policy", "Policy"
        MOBILE = "mobile", "Mobile"
        VULNERABILITY = "vulnerability", "Vulnerability"
        CUSTOM = "custom", "Custom"

    class Severity(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        CRITICAL = "critical", "Critical"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_checks",
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=24, choices=Category.choices, db_index=True)
    severity = models.CharField(max_length=16, choices=Severity.choices, default=Severity.WARNING)
    enabled = models.BooleanField(default=True)
    builtin = models.BooleanField(default=False)
    evaluator = models.CharField(max_length=64, db_index=True)
    config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "name"]
        constraints = [
            models.UniqueConstraint(fields=["user", "slug"], name="unique_saved_check_slug_per_user")
        ]

    def __str__(self):
        return f"{self.user.username} {self.slug}"


class SavedCheckResult(models.Model):
    class Status(models.TextChoices):
        PASS = "pass", "Pass"
        WARN = "warn", "Warn"
        FAIL = "fail", "Fail"
        UNKNOWN = "unknown", "Unknown"

    saved_check = models.ForeignKey(
        SavedCheck,
        on_delete=models.CASCADE,
        related_name="results",
    )
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="check_results")
    snapshot = models.ForeignKey(
        Snapshot,
        on_delete=models.CASCADE,
        related_name="check_results",
        null=True,
        blank=True,
    )
    status = models.CharField(max_length=16, choices=Status.choices, db_index=True)
    summary = models.CharField(max_length=255)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["host", "status"]),
            models.Index(fields=["saved_check", "created_at"]),
        ]

    def __str__(self):
        return f"{self.host.hostname} {self.saved_check.slug} {self.status}"


class AgentAction(models.Model):
    class Kind(models.TextChoices):
        REFRESH_SNAPSHOT = "refresh_snapshot", "Refresh snapshot"
        TERMINATE_PROCESS = "terminate_process", "Terminate process"
        COLLECT_DIAGNOSTICS = "collect_diagnostics", "Collect diagnostics"
        LIVE_QUERY = "live_query", "Live query"

    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        IN_PROGRESS = "in_progress", "In progress"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="agent_actions")
    snapshot = models.ForeignKey(
        Snapshot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agent_actions",
    )
    alert = models.ForeignKey(
        Alert,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agent_actions",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="requested_agent_actions",
    )
    kind = models.CharField(max_length=32, choices=Kind.choices, db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.QUEUED,
        db_index=True,
    )
    note = models.TextField(blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    result = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["host", "status"]),
            models.Index(fields=["kind", "status"]),
        ]

    def __str__(self):
        return f"{self.host.hostname} {self.kind} {self.status}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_preference",
    )
    email_enabled = models.BooleanField(default=True)
    email_address = models.EmailField(blank=True)
    slack_enabled = models.BooleanField(default=False)
    slack_webhook_url = models.URLField(blank=True)
    webhook_enabled = models.BooleanField(default=False)
    webhook_url = models.URLField(blank=True)
    notify_info = models.BooleanField(default=False)
    notify_warning = models.BooleanField(default=True)
    notify_critical = models.BooleanField(default=True)
    notify_offline = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__username"]

    def __str__(self):
        return f"{self.user.username} notification preferences"

    @property
    def effective_email_address(self):
        return self.email_address or self.user.email


class NotificationDelivery(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        SLACK = "slack", "Slack"
        WEBHOOK = "webhook", "Webhook"

    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    alert = models.ForeignKey(
        Alert,
        on_delete=models.CASCADE,
        related_name="notification_deliveries",
        null=True,
        blank=True,
    )
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="notification_deliveries")
    channel = models.CharField(max_length=16, choices=Channel.choices)
    event_type = models.CharField(max_length=64, db_index=True)
    destination = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, db_index=True)
    response_code = models.IntegerField(null=True, blank=True)
    response_excerpt = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["host", "channel"]),
            models.Index(fields=["event_type", "status"]),
        ]

    def __str__(self):
        return f"{self.host.hostname} {self.channel} {self.status}"
