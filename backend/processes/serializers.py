from django.conf import settings
from rest_framework import serializers

from .models import (
    AgentAction,
    Alert,
    AlertAuditLog,
    AlertRuleSettings,
    Host,
    HostEvent,
    NotificationDelivery,
    NotificationPreference,
    Process,
    SavedCheck,
    SavedCheckResult,
    Snapshot,
)


class ProcessInSerializer(serializers.Serializer):
    pid = serializers.IntegerField()
    ppid = serializers.IntegerField(required=False, allow_null=True)
    name = serializers.CharField(max_length=512)
    cpu_percent = serializers.FloatField(required=False, allow_null=True)
    memory_mb = serializers.FloatField(required=False, allow_null=True)
    status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cmdline = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    exe_path = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    started_at = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class NetworkConnectionInSerializer(serializers.Serializer):
    pid = serializers.IntegerField(required=False, allow_null=True)
    process_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    protocol = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    local_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    local_port = serializers.IntegerField(required=False, allow_null=True, min_value=0, max_value=65535)
    remote_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remote_port = serializers.IntegerField(required=False, allow_null=True, min_value=0, max_value=65535)
    family = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    direction = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remote_domain = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remote_scope = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    service_label = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tls_suspected = serializers.BooleanField(required=False)
    security_hint = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class StartupItemInSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    scope = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    location = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    command = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    publisher = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class SoftwareItemInSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    identifier = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    version = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    publisher = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    install_path = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    install_scope = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    install_source = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    executable_path = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    signature_state = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    signer = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    team_identifier = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    sha256 = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class UserSessionInSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    terminal = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    host = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    started_at = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remote = serializers.BooleanField(required=False)
    type = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class FileIntegrityItemInSerializer(serializers.Serializer):
    path = serializers.CharField(max_length=1024)
    category = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    modified_at = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    size_bytes = serializers.IntegerField(required=False, allow_null=True)
    sha256 = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    mode = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class FileEventInSerializer(serializers.Serializer):
    path = serializers.CharField(max_length=1024)
    category = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    action = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    occurred_at = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    sha256 = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    mode = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class AuthEventInSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    terminal = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    source = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    source_ip = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    occurred_at = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    event_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    summary = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    method = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    event_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    session = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class SnapshotInSerializer(serializers.Serializer):
    agent_id = serializers.CharField(max_length=64, required=False, allow_blank=True, allow_null=True)
    hostname = serializers.CharField(max_length=255)
    device_type = serializers.CharField(max_length=32, required=False, allow_blank=True, allow_null=True)
    agent_version = serializers.CharField(max_length=32, required=False, allow_blank=True, allow_null=True)
    os_name = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    os_version = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    architecture = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    primary_ip = serializers.CharField(max_length=128, required=False, allow_blank=True, allow_null=True)
    cpu_count = serializers.IntegerField(required=False, allow_null=True)
    total_memory_mb = serializers.FloatField(required=False, allow_null=True)
    total_disk_gb = serializers.FloatField(required=False, allow_null=True)
    cpu_percent = serializers.FloatField(required=False, allow_null=True)
    memory_percent = serializers.FloatField(required=False, allow_null=True)
    disk_percent = serializers.FloatField(required=False, allow_null=True)
    network_sent_mb = serializers.FloatField(required=False, allow_null=True)
    network_recv_mb = serializers.FloatField(required=False, allow_null=True)
    load_one = serializers.FloatField(required=False, allow_null=True)
    load_five = serializers.FloatField(required=False, allow_null=True)
    load_fifteen = serializers.FloatField(required=False, allow_null=True)
    uptime_seconds = serializers.IntegerField(required=False, allow_null=True)
    active_user_count = serializers.IntegerField(required=False, allow_null=True)
    listening_ports = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=65535),
        required=False,
        allow_empty=True,
    )
    network_connections = NetworkConnectionInSerializer(many=True, required=False, allow_empty=True)
    network_events = serializers.JSONField(required=False)
    dns_events = serializers.JSONField(required=False)
    startup_items = StartupItemInSerializer(many=True, required=False, allow_empty=True)
    service_inventory = serializers.JSONField(required=False)
    software_inventory = SoftwareItemInSerializer(many=True, required=False, allow_empty=True)
    user_sessions = UserSessionInSerializer(many=True, required=False, allow_empty=True)
    file_integrity_items = FileIntegrityItemInSerializer(many=True, required=False, allow_empty=True)
    file_events = FileEventInSerializer(many=True, required=False, allow_empty=True)
    auth_events = AuthEventInSerializer(many=True, required=False, allow_empty=True)
    process_events = serializers.JSONField(required=False)
    security_posture = serializers.JSONField(required=False)
    collector_sources = serializers.ListField(
        child=serializers.CharField(max_length=64),
        required=False,
        allow_empty=True,
    )
    processes = ProcessInSerializer(many=True, allow_empty=False)

    def validate_processes(self, value):
        max_processes = getattr(settings, "MAX_PROCESSES_PER_SNAPSHOT", 5000)
        if len(value) > max_processes:
            raise serializers.ValidationError(
                f"Process count exceeds the configured limit of {max_processes}."
            )
        return value

    def validate_network_connections(self, value):
        if len(value) > 160:
            raise serializers.ValidationError("network_connections exceeds the supported limit of 160.")
        return value

    def validate_dns_events(self, value):
        if isinstance(value, list) and len(value) > 160:
            raise serializers.ValidationError("dns_events exceeds the supported limit of 160.")
        return value

    def validate_network_events(self, value):
        if isinstance(value, list) and len(value) > 240:
            raise serializers.ValidationError("network_events exceeds the supported limit of 240.")
        return value

    def validate_startup_items(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("startup_items exceeds the supported limit of 100.")
        return value

    def validate_service_inventory(self, value):
        if isinstance(value, list) and len(value) > 240:
            raise serializers.ValidationError("service_inventory exceeds the supported limit of 240.")
        return value

    def validate_software_inventory(self, value):
        if len(value) > 240:
            raise serializers.ValidationError("software_inventory exceeds the supported limit of 240.")
        return value

    def validate_user_sessions(self, value):
        if len(value) > 32:
            raise serializers.ValidationError("user_sessions exceeds the supported limit of 32.")
        return value

    def validate_file_integrity_items(self, value):
        if len(value) > 240:
            raise serializers.ValidationError("file_integrity_items exceeds the supported limit of 240.")
        return value

    def validate_auth_events(self, value):
        if len(value) > 96:
            raise serializers.ValidationError("auth_events exceeds the supported limit of 96.")
        return value

    def validate_file_events(self, value):
        if len(value) > 200:
            raise serializers.ValidationError("file_events exceeds the supported limit of 200.")
        return value

    def validate_process_events(self, value):
        if isinstance(value, list) and len(value) > 240:
            raise serializers.ValidationError("process_events exceeds the supported limit of 240.")
        return value

    def validate_security_posture(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("security_posture must be an object.")
        return value

    def validate_collector_sources(self, value):
        if len(value) > 20:
            raise serializers.ValidationError("collector_sources exceeds the supported limit of 20.")
        return value

    def validate_cpu_percent(self, value):
        if value is not None and not 0 <= value <= 100:
            raise serializers.ValidationError("cpu_percent must be between 0 and 100.")
        return value

    def validate_memory_percent(self, value):
        if value is not None and not 0 <= value <= 100:
            raise serializers.ValidationError("memory_percent must be between 0 and 100.")
        return value

    def validate_disk_percent(self, value):
        if value is not None and not 0 <= value <= 100:
            raise serializers.ValidationError("disk_percent must be between 0 and 100.")
        return value


class MobileHeartbeatSerializer(serializers.Serializer):
    device_id = serializers.CharField(max_length=128)
    hostname = serializers.CharField(max_length=255)
    platform = serializers.CharField(max_length=32)
    os_name = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    os_version = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    manufacturer = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    model_name = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    app_version = serializers.CharField(max_length=32, required=False, allow_blank=True, allow_null=True)
    primary_ip = serializers.CharField(max_length=128, required=False, allow_blank=True, allow_null=True)
    battery_level = serializers.FloatField(required=False, allow_null=True)
    battery_state = serializers.CharField(max_length=32, required=False, allow_blank=True, allow_null=True)
    low_power_mode = serializers.BooleanField(required=False)
    network_type = serializers.CharField(max_length=32, required=False, allow_blank=True, allow_null=True)
    is_connected = serializers.BooleanField(required=False)
    is_internet_reachable = serializers.BooleanField(required=False)
    total_memory_mb = serializers.FloatField(required=False, allow_null=True)
    physical_device = serializers.BooleanField(required=False)
    timezone = serializers.CharField(max_length=64, required=False, allow_blank=True, allow_null=True)
    locale = serializers.CharField(max_length=32, required=False, allow_blank=True, allow_null=True)
    device_year_class = serializers.IntegerField(required=False, allow_null=True)

    def validate_battery_level(self, value):
        if value is not None and not 0 <= value <= 100:
            raise serializers.ValidationError("battery_level must be between 0 and 100.")
        return value


class ProcessOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Process
        fields = [
            "pid",
            "ppid",
            "name",
            "cpu_percent",
            "memory_mb",
            "status",
            "username",
            "cmdline",
            "exe_path",
            "started_at",
        ]


class AlertAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AlertAuditLog
        fields = [
            "id",
            "action",
            "actor_name",
            "previous_status",
            "next_status",
            "note",
            "metadata",
            "created_at",
        ]

    def get_actor_name(self, obj):
        if not obj.actor:
            return "System"
        return obj.actor.get_full_name() or obj.actor.username


class AlertSerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source="host.hostname", read_only=True)
    display_name = serializers.CharField(source="host.display_name", read_only=True)
    agent_id = serializers.CharField(source="host.agent_id", read_only=True)
    device_type = serializers.CharField(source="host.device_type", read_only=True)
    primary_ip = serializers.CharField(source="host.primary_ip", read_only=True)
    latest_snapshot_id = serializers.IntegerField(read_only=True)
    acknowledged_by_name = serializers.SerializerMethodField()
    muted_by_name = serializers.SerializerMethodField()
    resolved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = [
            "id",
            "hostname",
            "display_name",
            "agent_id",
            "device_type",
            "primary_ip",
            "latest_snapshot_id",
            "fingerprint",
            "level",
            "type",
            "message",
            "status",
            "note",
            "metadata",
            "first_seen_at",
            "last_seen_at",
            "occurrence_count",
            "acknowledged_at",
            "acknowledged_by_name",
            "muted_at",
            "muted_by_name",
            "muted_until",
            "resolved_at",
            "resolved_by_name",
            "created_at",
            "updated_at",
        ]

    def _user_name(self, user):
        if not user:
            return None
        return user.get_full_name() or user.username

    def get_acknowledged_by_name(self, obj):
        return self._user_name(obj.acknowledged_by)

    def get_muted_by_name(self, obj):
        return self._user_name(obj.muted_by)

    def get_resolved_by_name(self, obj):
        return self._user_name(obj.resolved_by)


class AlertDetailSerializer(AlertSerializer):
    audit_logs = AlertAuditLogSerializer(many=True, read_only=True)
    notification_deliveries = serializers.SerializerMethodField()

    class Meta(AlertSerializer.Meta):
        fields = AlertSerializer.Meta.fields + ["audit_logs", "notification_deliveries"]

    def get_notification_deliveries(self, obj):
        return NotificationDeliverySerializer(
            obj.notification_deliveries.order_by("-created_at")[:12],
            many=True,
        ).data


class AlertActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=["acknowledge", "mute", "unmute", "resolve", "reopen", "note"]
    )
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    mute_hours = serializers.IntegerField(required=False, min_value=1, max_value=720)


class AlertRuleSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertRuleSettings
        fields = [
            "cpu_warning_threshold",
            "cpu_critical_threshold",
            "memory_warning_threshold",
            "memory_critical_threshold",
            "disk_warning_threshold",
            "disk_critical_threshold",
            "process_cpu_warning_threshold",
            "process_memory_warning_mb",
            "listening_ports_info_threshold",
            "multiple_users_threshold",
            "process_spike_min_delta",
            "process_spike_percent_threshold",
            "watchlist_enabled",
            "new_process_tracking_enabled",
            "new_software_tracking_enabled",
            "unsigned_software_alert_enabled",
            "startup_drift_tracking_enabled",
            "remote_session_tracking_enabled",
            "file_integrity_tracking_enabled",
            "auth_event_tracking_enabled",
            "policy_engine_enabled",
            "mobile_compliance_tracking_enabled",
            "vulnerability_tracking_enabled",
            "minimum_mobile_battery_percent",
            "minimum_mobile_os_version",
            "muted_alert_auto_resolve",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        data = {**getattr(self.instance, "__dict__", {}), **attrs}
        threshold_pairs = [
            ("cpu_warning_threshold", "cpu_critical_threshold", "CPU"),
            ("memory_warning_threshold", "memory_critical_threshold", "Memory"),
            ("disk_warning_threshold", "disk_critical_threshold", "Disk"),
        ]
        for warning_key, critical_key, label in threshold_pairs:
            warning_value = data.get(warning_key)
            critical_value = data.get(critical_key)
            if (
                warning_value is not None
                and critical_value is not None
                and warning_value >= critical_value
            ):
                raise serializers.ValidationError(
                    {warning_key: f"{label} warning threshold must be below the critical threshold."}
                )
        return attrs


class SavedCheckSerializer(serializers.ModelSerializer):
    latest_result = serializers.SerializerMethodField()

    class Meta:
        model = SavedCheck
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "severity",
            "enabled",
            "builtin",
            "evaluator",
            "config",
            "latest_result",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["slug", "builtin", "created_at", "updated_at"]

    def get_latest_result(self, obj):
        host = self.context.get("host")
        queryset = obj.results.order_by("-created_at")
        if host is not None:
            queryset = queryset.filter(host=host)
        result = queryset.first()
        if not result:
            return None
        return SavedCheckResultSerializer(result).data


class SavedCheckUpsertSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    category = serializers.ChoiceField(
        choices=[
            SavedCheck.Category.POLICY,
            SavedCheck.Category.MOBILE,
            SavedCheck.Category.VULNERABILITY,
            SavedCheck.Category.CUSTOM,
        ]
    )
    severity = serializers.ChoiceField(
        choices=[
            SavedCheck.Severity.INFO,
            SavedCheck.Severity.WARNING,
            SavedCheck.Severity.CRITICAL,
        ],
        required=False,
        default=SavedCheck.Severity.WARNING,
    )
    enabled = serializers.BooleanField(required=False, default=True)
    config = serializers.JSONField(required=False)

    def validate_config(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("config must be an object.")
        return value


class SavedCheckResultSerializer(serializers.ModelSerializer):
    check = serializers.IntegerField(source="saved_check_id", read_only=True)
    check_name = serializers.CharField(source="saved_check.name", read_only=True)
    check_slug = serializers.CharField(source="saved_check.slug", read_only=True)
    category = serializers.CharField(source="saved_check.category", read_only=True)
    severity = serializers.CharField(source="saved_check.severity", read_only=True)
    hostname = serializers.CharField(source="host.hostname", read_only=True)
    display_name = serializers.CharField(source="host.display_name", read_only=True)
    agent_id = serializers.CharField(source="host.agent_id", read_only=True)

    class Meta:
        model = SavedCheckResult
        fields = [
            "id",
            "check",
            "check_name",
            "check_slug",
            "category",
            "severity",
            "host",
            "hostname",
            "display_name",
            "agent_id",
            "snapshot",
            "status",
            "summary",
            "details",
            "created_at",
            "updated_at",
        ]


class AgentActionSerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source="host.hostname", read_only=True)
    display_name = serializers.CharField(source="host.display_name", read_only=True)
    agent_id = serializers.CharField(source="host.agent_id", read_only=True)
    requested_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AgentAction
        fields = [
            "id",
            "hostname",
            "display_name",
            "agent_id",
            "kind",
            "status",
            "note",
            "parameters",
            "result",
            "started_at",
            "completed_at",
            "requested_by_name",
            "created_at",
            "updated_at",
        ]

    def get_requested_by_name(self, obj):
        if not obj.requested_by:
            return None
        return obj.requested_by.get_full_name() or obj.requested_by.username


class AgentActionRequestSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=AgentAction.Kind.choices)
    agent_id = serializers.CharField(max_length=64)
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    parameters = serializers.JSONField(required=False)
    alert_id = serializers.UUIDField(required=False)

    def validate_parameters(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("parameters must be an object.")
        return value


class AgentActionResultSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            AgentAction.Status.IN_PROGRESS,
            AgentAction.Status.SUCCEEDED,
            AgentAction.Status.FAILED,
            AgentAction.Status.CANCELLED,
        ]
    )
    result = serializers.JSONField(required=False)


class LiveQueryRequestSerializer(serializers.Serializer):
    agent_id = serializers.CharField(max_length=64)
    name = serializers.CharField(max_length=120, required=False, allow_blank=True, allow_null=True)
    source = serializers.ChoiceField(
        choices=[
            "processes",
            "software_inventory",
            "service_inventory",
            "startup_items",
            "file_integrity_items",
            "auth_events",
            "network_connections",
        ]
    )
    field = serializers.CharField(max_length=64)
    operator = serializers.ChoiceField(
        choices=["contains", "equals", "starts_with", "ends_with", "gt", "lt", "exists"]
    )
    value = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=50, default=10)


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "email_enabled",
            "email_address",
            "slack_enabled",
            "slack_webhook_url",
            "webhook_enabled",
            "webhook_url",
            "notify_info",
            "notify_warning",
            "notify_critical",
            "notify_offline",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class NotificationDeliverySerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source="host.hostname", read_only=True)
    display_name = serializers.CharField(source="host.display_name", read_only=True)

    class Meta:
        model = NotificationDelivery
        fields = [
            "id",
            "hostname",
            "display_name",
            "alert_id",
            "channel",
            "event_type",
            "destination",
            "status",
            "response_code",
            "response_excerpt",
            "error_message",
            "metadata",
            "created_at",
        ]


class SnapshotOutSerializer(serializers.ModelSerializer):
    agent_id = serializers.CharField(source="host.agent_id", read_only=True)
    hostname = serializers.CharField(source="host.hostname", read_only=True)
    display_name = serializers.CharField(source="host.display_name", read_only=True)
    device_type = serializers.CharField(source="host.device_type", read_only=True)
    host_status = serializers.CharField(source="host.status", read_only=True)
    last_seen = serializers.DateTimeField(source="host.last_seen", read_only=True)
    primary_ip = serializers.CharField(source="host.primary_ip", read_only=True)
    agent_version = serializers.CharField(source="host.agent_version", read_only=True)
    cpu_count = serializers.IntegerField(source="host.cpu_count", read_only=True)
    total_memory_mb = serializers.FloatField(source="host.total_memory_mb", read_only=True)
    total_disk_gb = serializers.FloatField(source="host.total_disk_gb", read_only=True)
    os_name = serializers.CharField(source="host.os_name", read_only=True)
    os_version = serializers.CharField(source="host.os_version", read_only=True)
    architecture = serializers.CharField(source="host.architecture", read_only=True)
    network_connections = serializers.JSONField(read_only=True)
    network_events = serializers.JSONField(read_only=True)
    dns_events = serializers.JSONField(read_only=True)
    startup_items = serializers.JSONField(read_only=True)
    service_inventory = serializers.JSONField(read_only=True)
    software_inventory = serializers.JSONField(read_only=True)
    user_sessions = serializers.JSONField(read_only=True)
    file_integrity_items = serializers.JSONField(read_only=True)
    file_events = serializers.JSONField(read_only=True)
    auth_events = serializers.JSONField(read_only=True)
    process_events = serializers.JSONField(read_only=True)
    security_posture = serializers.JSONField(read_only=True)
    collector_sources = serializers.JSONField(read_only=True)
    alerts = serializers.SerializerMethodField()
    risk_score = serializers.SerializerMethodField()
    risk_level = serializers.SerializerMethodField()
    processes = ProcessOutSerializer(many=True, read_only=True)

    class Meta:
        model = Snapshot
        fields = [
            "id",
            "agent_id",
            "hostname",
            "display_name",
            "device_type",
            "host_status",
            "last_seen",
            "primary_ip",
            "agent_version",
            "cpu_count",
            "total_memory_mb",
            "total_disk_gb",
            "os_name",
            "os_version",
            "architecture",
            "created_at",
            "cpu_percent",
            "memory_percent",
            "disk_percent",
            "network_sent_mb",
            "network_recv_mb",
            "load_one",
            "load_five",
            "load_fifteen",
            "uptime_seconds",
            "active_user_count",
            "listening_ports",
            "network_connections",
            "network_events",
            "dns_events",
            "startup_items",
            "service_inventory",
            "software_inventory",
            "user_sessions",
            "file_integrity_items",
            "file_events",
            "auth_events",
            "process_events",
            "security_posture",
            "collector_sources",
            "total_processes",
            "alerts",
            "risk_score",
            "risk_level",
            "processes",
        ]

    def get_alerts(self, _obj):
        return self.context.get("alerts", [])

    def get_risk_score(self, _obj):
        return self.context.get("risk_score", 0)

    def get_risk_level(self, _obj):
        return self.context.get("risk_level", "healthy")


class SnapshotHistorySerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source="host.hostname", read_only=True)

    class Meta:
        model = Snapshot
        fields = [
            "id",
            "hostname",
            "created_at",
            "cpu_percent",
            "memory_percent",
            "disk_percent",
            "uptime_seconds",
            "total_processes",
        ]


class HostSummarySerializer(serializers.ModelSerializer):
    is_online = serializers.BooleanField(read_only=True)
    latest_total_processes = serializers.SerializerMethodField()
    latest_cpu_percent = serializers.SerializerMethodField()
    latest_memory_percent = serializers.SerializerMethodField()
    latest_disk_percent = serializers.SerializerMethodField()

    class Meta:
        model = Host
        fields = [
            "agent_id",
            "hostname",
            "display_name",
            "device_type",
            "os_name",
            "os_version",
            "architecture",
            "primary_ip",
            "agent_version",
            "cpu_count",
            "total_memory_mb",
            "total_disk_gb",
            "status",
            "last_seen",
            "monitoring_enabled",
            "is_online",
            "risk_score",
            "latest_alert_level",
            "latest_total_processes",
            "latest_cpu_percent",
            "latest_memory_percent",
            "latest_disk_percent",
        ]

    def _latest_snapshot(self, obj):
        retention_cutoff = self.context.get("retention_cutoff")
        queryset = obj.snapshots.order_by("-created_at")
        if retention_cutoff is not None:
            queryset = queryset.filter(created_at__gte=retention_cutoff)
        return queryset.first()

    def get_latest_total_processes(self, obj):
        latest = self._latest_snapshot(obj)
        return latest.total_processes if latest else 0

    def get_latest_cpu_percent(self, obj):
        latest = self._latest_snapshot(obj)
        return latest.cpu_percent if latest else None

    def get_latest_memory_percent(self, obj):
        latest = self._latest_snapshot(obj)
        return latest.memory_percent if latest else None

    def get_latest_disk_percent(self, obj):
        latest = self._latest_snapshot(obj)
        return latest.disk_percent if latest else None


class HostEventSerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source="host.hostname", read_only=True)
    display_name = serializers.CharField(source="host.display_name", read_only=True)
    agent_id = serializers.CharField(source="host.agent_id", read_only=True)

    class Meta:
        model = HostEvent
        fields = [
            "id",
            "hostname",
            "display_name",
            "agent_id",
            "category",
            "kind",
            "severity",
            "title",
            "subtitle",
            "source",
            "metadata",
            "occurred_at",
            "created_at",
        ]
