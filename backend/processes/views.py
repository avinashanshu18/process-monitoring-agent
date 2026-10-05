from datetime import timedelta
import secrets
import re

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from auth_system.billing import get_effective_plan
from auth_system.models import AccountProfile
from auth_system.plans import get_plan_config
from auth_system.team_access import get_workspace_owner, get_workspace_plan

from .models import (
    AgentAction,
    Alert,
    AlertAuditLog,
    AlertRuleSettings,
    Host,
    HostEvent,
    NotificationDelivery,
    Process,
    SavedCheck,
    SavedCheckResult,
    Snapshot,
)
from .notifications import dispatch_alert_notifications, get_notification_preference
from .serializers import (
    AgentActionRequestSerializer,
    AgentActionResultSerializer,
    AgentActionSerializer,
    AlertActionSerializer,
    AlertDetailSerializer,
    AlertRuleSettingsSerializer,
    AlertSerializer,
    HostSummarySerializer,
    HostEventSerializer,
    LiveQueryRequestSerializer,
    MobileHeartbeatSerializer,
    NotificationDeliverySerializer,
    NotificationPreferenceSerializer,
    SavedCheckResultSerializer,
    SavedCheckSerializer,
    SavedCheckUpsertSerializer,
    SnapshotHistorySerializer,
    SnapshotInSerializer,
    SnapshotOutSerializer,
)


WATCHLIST = {
    "aircrack-ng",
    "hydra",
    "john",
    "mimikatz",
    "msfconsole",
    "nc",
    "netcat",
    "nmap",
    "sqlmap",
    "tcpdump",
    "wireshark",
}

PATCH_BASELINES = [
    {
        "match": ["google chrome", "com.google.chrome"],
        "minimum_version": "146.0.0",
        "severity": "warning",
        "title": "Browser patch baseline",
    },
    {
        "match": ["visual studio code", "com.microsoft.vscode"],
        "minimum_version": "1.99.0",
        "severity": "warning",
        "title": "Editor patch baseline",
    },
    {
        "match": ["python", "org.python.python"],
        "minimum_version": "3.12.0",
        "severity": "warning",
        "title": "Runtime patch baseline",
    },
]

DEFAULT_SAVED_CHECKS = [
    {
        "slug": "firewall-enabled",
        "name": "Firewall enabled",
        "description": "Require host firewall to stay enabled.",
        "category": SavedCheck.Category.POLICY,
        "severity": SavedCheck.Severity.WARNING,
        "evaluator": "firewall_enabled",
    },
    {
        "slug": "disk-encryption-enabled",
        "name": "Disk encryption enabled",
        "description": "Require FileVault, BitLocker, or equivalent disk encryption.",
        "category": SavedCheck.Category.POLICY,
        "severity": SavedCheck.Severity.CRITICAL,
        "evaluator": "disk_encryption_enabled",
    },
    {
        "slug": "endpoint-protection-present",
        "name": "Endpoint protection present",
        "description": "Require antivirus or EDR posture to be detected.",
        "category": SavedCheck.Category.POLICY,
        "severity": SavedCheck.Severity.WARNING,
        "evaluator": "endpoint_protection_present",
    },
    {
        "slug": "unsigned-software-review",
        "name": "Unsigned software review",
        "description": "Fail when unsigned software is present on the device.",
        "category": SavedCheck.Category.POLICY,
        "severity": SavedCheck.Severity.WARNING,
        "evaluator": "unsigned_software_absent",
    },
    {
        "slug": "remote-session-review",
        "name": "Remote session review",
        "description": "Warn when remote sessions are present on the device.",
        "category": SavedCheck.Category.POLICY,
        "severity": SavedCheck.Severity.INFO,
        "evaluator": "remote_sessions_absent",
    },
    {
        "slug": "mobile-battery-healthy",
        "name": "Mobile battery healthy",
        "description": "Require mobile devices to report healthy battery level.",
        "category": SavedCheck.Category.MOBILE,
        "severity": SavedCheck.Severity.WARNING,
        "evaluator": "mobile_battery_minimum",
    },
    {
        "slug": "mobile-network-reachable",
        "name": "Mobile network reachable",
        "description": "Require mobile companion devices to stay reachable.",
        "category": SavedCheck.Category.MOBILE,
        "severity": SavedCheck.Severity.WARNING,
        "evaluator": "mobile_network_reachable",
    },
    {
        "slug": "mobile-low-power-review",
        "name": "Mobile low power review",
        "description": "Warn when mobile devices stay in low-power mode.",
        "category": SavedCheck.Category.MOBILE,
        "severity": SavedCheck.Severity.INFO,
        "evaluator": "mobile_low_power_disabled",
    },
    {
        "slug": "mobile-mdm-review",
        "name": "Mobile MDM review",
        "description": "Warn when mobile devices are not enrolled in MDM.",
        "category": SavedCheck.Category.MOBILE,
        "severity": SavedCheck.Severity.INFO,
        "evaluator": "mobile_mdm_enrolled",
    },
    {
        "slug": "patch-baseline-review",
        "name": "Patch baseline review",
        "description": "Review installed software against lightweight patch baselines.",
        "category": SavedCheck.Category.VULNERABILITY,
        "severity": SavedCheck.Severity.WARNING,
        "evaluator": "patch_baseline_review",
    },
]

ACTIVE_ALERT_STATUSES = [
    Alert.Status.OPEN,
    Alert.Status.ACKNOWLEDGED,
    Alert.Status.MUTED,
]


def _allow_ingest(api_key_header, host):
    global_key = getattr(settings, "PROC_MONITOR_API_KEY", "")
    return bool(api_key_header and (api_key_header == global_key or api_key_header == host.api_key))


def _default_rule_config():
    return {
        "cpu_warning_threshold": 82,
        "cpu_critical_threshold": 95,
        "memory_warning_threshold": 86,
        "memory_critical_threshold": 95,
        "disk_warning_threshold": 88,
        "disk_critical_threshold": 96,
        "process_cpu_warning_threshold": 60,
        "process_memory_warning_mb": 1024,
        "listening_ports_info_threshold": 10,
        "multiple_users_threshold": 2,
        "process_spike_min_delta": 20,
        "process_spike_percent_threshold": 25,
        "watchlist_enabled": True,
        "new_process_tracking_enabled": True,
        "new_software_tracking_enabled": True,
        "unsigned_software_alert_enabled": True,
        "startup_drift_tracking_enabled": True,
        "remote_session_tracking_enabled": True,
        "file_integrity_tracking_enabled": True,
        "auth_event_tracking_enabled": True,
        "policy_engine_enabled": True,
        "mobile_compliance_tracking_enabled": True,
        "vulnerability_tracking_enabled": True,
        "minimum_mobile_battery_percent": 20,
        "minimum_mobile_os_version": "17",
        "muted_alert_auto_resolve": True,
    }


def _rule_config_for_user(user):
    config = _default_rule_config()
    if not user:
        return config

    settings_obj, _ = AlertRuleSettings.objects.get_or_create(user=get_workspace_owner(user))
    for field in config:
        config[field] = getattr(settings_obj, field)
    return config


def _normalize_version(value):
    if not value:
        return []
    parts = re.findall(r"\d+", str(value))
    return [int(part) for part in parts[:6]]


def _version_lt(left, right):
    left_parts = _normalize_version(left)
    right_parts = _normalize_version(right)
    max_length = max(len(left_parts), len(right_parts), 1)
    left_parts += [0] * (max_length - len(left_parts))
    right_parts += [0] * (max_length - len(right_parts))
    return tuple(left_parts) < tuple(right_parts)


def _matching_software_items(snapshot):
    items = snapshot.software_inventory or []
    findings = []
    for item in items:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or item.get("identifier") or "").strip().lower()
        version = str(item.get("version") or "").strip()
        for rule in PATCH_BASELINES:
            if not any(token in name for token in rule["match"]):
                continue
            if not version:
                findings.append(
                    {
                        "name": item.get("name") or item.get("identifier") or "Unknown software",
                        "identifier": item.get("identifier") or "",
                        "version": version,
                        "minimum_version": rule["minimum_version"],
                        "severity": rule["severity"],
                        "title": rule["title"],
                        "reason": "version_missing",
                    }
                )
                break
            if _version_lt(version, rule["minimum_version"]):
                findings.append(
                    {
                        "name": item.get("name") or item.get("identifier") or "Unknown software",
                        "identifier": item.get("identifier") or "",
                        "version": version,
                        "minimum_version": rule["minimum_version"],
                        "severity": rule["severity"],
                        "title": rule["title"],
                        "reason": "below_minimum",
                    }
                )
                break
    return findings


def _update_patch_posture(snapshot, rule_config):
    posture = dict(snapshot.security_posture or {})
    findings = _matching_software_items(snapshot) if rule_config["vulnerability_tracking_enabled"] else []
    posture["patch_posture"] = {
        "state": "attention" if findings else "healthy",
        "findings_count": len(findings),
        "findings": findings[:12],
    }
    snapshot.security_posture = posture
    snapshot.save(update_fields=["security_posture"])
    return findings


def _ensure_saved_checks_for_user(user):
    owner = get_workspace_owner(user)
    checks = []
    for item in DEFAULT_SAVED_CHECKS:
        check, _ = SavedCheck.objects.get_or_create(
            user=owner,
            slug=item["slug"],
            defaults={
                "name": item["name"],
                "description": item["description"],
                "category": item["category"],
                "severity": item["severity"],
                "builtin": True,
                "evaluator": item["evaluator"],
                "enabled": True,
                "config": {},
            },
        )
        checks.append(check)
    return checks


def _snapshot_collection(snapshot, source):
    if source == "processes":
        return [
            {
                "pid": item.pid,
                "ppid": item.ppid,
                "name": item.name,
                "cpu_percent": item.cpu_percent,
                "memory_mb": item.memory_mb,
                "status": item.status,
                "username": item.username,
                "cmdline": item.cmdline,
                "exe_path": item.exe_path,
                "started_at": item.started_at.isoformat() if item.started_at else "",
            }
            for item in snapshot.processes.all()
        ]
    return getattr(snapshot, source, []) or []


def _coerce_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _custom_check_matches(snapshot, config):
    source = config.get("source") or "processes"
    field = str(config.get("field") or "").strip()
    operator = config.get("operator") or "contains"
    target = config.get("value")
    limit = min(int(config.get("limit") or 10), 50)
    if not field:
        return []

    matches = []
    for item in _snapshot_collection(snapshot, source):
        if not isinstance(item, dict):
            continue
        value = item.get(field)
        haystack = "" if value is None else str(value)
        normalized_haystack = haystack.lower()
        normalized_target = "" if target is None else str(target).lower()

        matched = False
        if operator == "contains":
            matched = bool(normalized_target and normalized_target in normalized_haystack)
        elif operator == "equals":
            matched = normalized_haystack == normalized_target
        elif operator == "starts_with":
            matched = bool(normalized_target and normalized_haystack.startswith(normalized_target))
        elif operator == "ends_with":
            matched = bool(normalized_target and normalized_haystack.endswith(normalized_target))
        elif operator == "exists":
            matched = bool(haystack)
        elif operator in {"gt", "lt"}:
            value_num = _coerce_float(value)
            target_num = _coerce_float(target)
            if value_num is not None and target_num is not None:
                matched = value_num > target_num if operator == "gt" else value_num < target_num

        if matched:
            matches.append(item)
        if len(matches) >= limit:
            break
    return matches


def _evaluate_saved_check(check, snapshot, rule_config):
    posture = snapshot.security_posture or {}
    evaluator = check.evaluator
    details = {}
    status_value = SavedCheckResult.Status.PASS
    summary = "Check passed"

    if evaluator == "firewall_enabled":
        current = str(posture.get("firewall_state") or "unknown").lower()
        details = {"firewall_state": current}
        if current != "enabled":
            status_value = SavedCheckResult.Status.FAIL
            summary = "Firewall is not enabled."
        else:
            summary = "Firewall is enabled."
    elif evaluator == "disk_encryption_enabled":
        current = str(posture.get("disk_encryption_state") or "unknown").lower()
        details = {"disk_encryption_state": current}
        if current != "enabled":
            status_value = SavedCheckResult.Status.FAIL
            summary = "Disk encryption is not enabled."
        else:
            summary = "Disk encryption is enabled."
    elif evaluator == "endpoint_protection_present":
        current = str(posture.get("antivirus_state") or "unknown").lower()
        details = {"antivirus_state": current, "products": posture.get("antivirus_products") or []}
        if current in {"not_detected", "disabled", "unknown"}:
            status_value = SavedCheckResult.Status.WARN
            summary = "Endpoint protection is missing or not detected."
        else:
            summary = "Endpoint protection is present."
    elif evaluator == "unsigned_software_absent":
        unsigned = [
            item
            for item in (snapshot.software_inventory or [])
            if isinstance(item, dict) and str(item.get("signature_state") or "").lower() == "unsigned"
        ]
        details = {"unsigned_software": unsigned[:12], "count": len(unsigned)}
        if unsigned:
            status_value = SavedCheckResult.Status.FAIL
            summary = f"{len(unsigned)} unsigned software item(s) detected."
        else:
            summary = "No unsigned software detected."
    elif evaluator == "remote_sessions_absent":
        remote_sessions = [
            item
            for item in (snapshot.user_sessions or [])
            if isinstance(item, dict) and item.get("remote")
        ]
        details = {"remote_sessions": remote_sessions[:12], "count": len(remote_sessions)}
        if remote_sessions:
            status_value = SavedCheckResult.Status.WARN
            summary = f"{len(remote_sessions)} remote session(s) detected."
        else:
            summary = "No remote sessions detected."
    elif evaluator == "mobile_battery_minimum":
        current = posture.get("battery_level_percent")
        threshold = int(rule_config.get("minimum_mobile_battery_percent") or 20)
        details = {"battery_level_percent": current, "minimum": threshold}
        if snapshot.host.device_type != "mobile":
            status_value = SavedCheckResult.Status.UNKNOWN
            summary = "Not a mobile device."
        elif current is None:
            status_value = SavedCheckResult.Status.UNKNOWN
            summary = "Battery state unavailable."
        elif float(current) < threshold:
            status_value = SavedCheckResult.Status.WARN
            summary = f"Battery level is below {threshold}%."
        else:
            summary = "Battery level is healthy."
    elif evaluator == "mobile_network_reachable":
        reachable = posture.get("is_internet_reachable")
        details = {"is_internet_reachable": reachable, "network_type": posture.get("network_type")}
        if snapshot.host.device_type != "mobile":
            status_value = SavedCheckResult.Status.UNKNOWN
            summary = "Not a mobile device."
        elif reachable is False:
            status_value = SavedCheckResult.Status.FAIL
            summary = "Mobile device is not internet reachable."
        else:
            summary = "Mobile device is reachable."
    elif evaluator == "mobile_low_power_disabled":
        low_power = bool(posture.get("low_power_mode"))
        details = {"low_power_mode": low_power}
        if snapshot.host.device_type != "mobile":
            status_value = SavedCheckResult.Status.UNKNOWN
            summary = "Not a mobile device."
        elif low_power:
            status_value = SavedCheckResult.Status.WARN
            summary = "Mobile device is in low-power mode."
        else:
            summary = "Low-power mode is not active."
    elif evaluator == "mobile_mdm_enrolled":
        current = str(posture.get("mdm_state") or "unknown").lower()
        details = {"mdm_state": current}
        if snapshot.host.device_type != "mobile":
            status_value = SavedCheckResult.Status.UNKNOWN
            summary = "Not a mobile device."
        elif current != "enrolled":
            status_value = SavedCheckResult.Status.WARN
            summary = "Mobile device is not enrolled in MDM."
        else:
            summary = "Mobile device is enrolled in MDM."
    elif evaluator == "patch_baseline_review":
        findings = _matching_software_items(snapshot) if rule_config["vulnerability_tracking_enabled"] else []
        details = {"findings": findings[:12], "count": len(findings)}
        if findings:
            status_value = SavedCheckResult.Status.WARN
            summary = f"{len(findings)} patch baseline issue(s) detected."
        else:
            summary = "Software inventory is within the configured patch baselines."
    elif evaluator == "custom_match":
        matches = _custom_check_matches(snapshot, check.config or {})
        mode = str((check.config or {}).get("result_mode") or "fail_on_match")
        details = {"matches": matches[:20], "count": len(matches), "config": check.config or {}}
        if mode == "fail_on_missing":
            if matches:
                summary = f"{len(matches)} matching item(s) found."
            else:
                status_value = SavedCheckResult.Status.FAIL
                summary = "Expected matching data was not found."
        else:
            if matches:
                status_value = SavedCheckResult.Status.FAIL
                summary = f"{len(matches)} matching item(s) triggered the check."
            else:
                summary = "No matching data triggered the check."
    else:
        status_value = SavedCheckResult.Status.UNKNOWN
        summary = "Unknown evaluator."
        details = {"evaluator": evaluator}

    return status_value, summary, details


def _record_check_results(host, snapshot, rule_config):
    if not host.owner or not rule_config.get("policy_engine_enabled", True):
        return []
    checks = _ensure_saved_checks_for_user(host.owner)
    results = []
    for check in checks:
        if not check.enabled:
            continue
        if check.category == SavedCheck.Category.MOBILE and not rule_config.get(
            "mobile_compliance_tracking_enabled", True
        ):
            continue
        if check.category == SavedCheck.Category.VULNERABILITY and not rule_config.get(
            "vulnerability_tracking_enabled", True
        ):
            continue
        status_value, summary, details = _evaluate_saved_check(check, snapshot, rule_config)
        result, _ = SavedCheckResult.objects.update_or_create(
            saved_check=check,
            snapshot=snapshot,
            defaults={
                "host": host,
                "status": status_value,
                "summary": summary,
                "details": details,
            },
        )
        results.append(result)
        if status_value in {SavedCheckResult.Status.FAIL, SavedCheckResult.Status.WARN}:
            HostEvent.objects.create(
                host=host,
                snapshot=snapshot,
                category="check",
                kind=f"check_{status_value}",
                severity="warning" if status_value == SavedCheckResult.Status.WARN else "critical",
                title=check.name,
                subtitle=summary,
                source="policy-engine",
                metadata={
                    "check_id": str(check.id),
                    "check_slug": check.slug,
                    "category": check.category,
                    "details": details,
                },
                occurred_at=snapshot.created_at,
            )
    return results


def _alert_queryset_for_user(user):
    queryset = Alert.objects.select_related("host", "latest_snapshot")
    if user.is_superuser:
        return queryset
    owner = get_workspace_owner(user)
    return queryset.filter(host__owner=owner)


def _delivery_queryset_for_user(user):
    queryset = NotificationDelivery.objects.select_related("host", "alert")
    if user.is_superuser:
        return queryset
    owner = get_workspace_owner(user)
    return queryset.filter(host__owner=owner)


def _normalize_alert_status_filters(raw_status):
    if not raw_status:
        return ACTIVE_ALERT_STATUSES
    if raw_status == "all":
        return list(Alert.Status.values)
    values = [value.strip() for value in raw_status.split(",") if value.strip()]
    allowed = set(Alert.Status.values)
    filtered = [value for value in values if value in allowed]
    return filtered or ACTIVE_ALERT_STATUSES


def _active_alerts_for_host(host):
    return host.alerts.filter(status__in=ACTIVE_ALERT_STATUSES).order_by(
        "-last_seen_at", "-created_at"
    )


def _create_audit_log(alert, action, *, actor=None, previous_status="", next_status="", note="", metadata=None):
    AlertAuditLog.objects.create(
        alert=alert,
        action=action,
        actor=actor,
        previous_status=previous_status,
        next_status=next_status,
        note=note or "",
        metadata=metadata or {},
    )


def _severity_rank(level):
    return {
        "healthy": 0,
        "info": 1,
        "warning": 2,
        "critical": 3,
    }.get(level, 0)


def _recalculate_host_posture(host):
    active_alerts = list(_active_alerts_for_host(host))
    risk_score = min(sum(_level_weight(alert.level) for alert in active_alerts[:12]), 100)
    risk_level = "healthy"
    for candidate in ("critical", "warning", "info"):
        if any(alert.level == candidate for alert in active_alerts):
            risk_level = candidate
            break

    host.risk_score = risk_score
    host.latest_alert_level = risk_level
    if not host.is_online:
        host.status = Host.HostStatus.OFFLINE
    elif risk_level in {"warning", "critical"}:
        host.status = Host.HostStatus.WARNING
    else:
        host.status = Host.HostStatus.ONLINE
    host.save(update_fields=["risk_score", "latest_alert_level", "status"])


def _level_weight(level):
    return {
        "healthy": 0,
        "info": 10,
        "warning": 24,
        "critical": 45,
    }.get(level, 0)


def _risk_level(score):
    if score >= 70:
        return "critical"
    if score >= 35:
        return "warning"
    if score > 0:
        return "info"
    return "healthy"


def _software_key(item):
    if not isinstance(item, dict):
        return ""
    return (
        str(item.get("identifier") or item.get("install_path") or item.get("name") or "")
        .strip()
        .lower()
    )


def _startup_key(item):
    if not isinstance(item, dict):
        return ""
    return (
        str(item.get("location") or item.get("command") or item.get("name") or "")
        .strip()
        .lower()
    )


def _service_key(item):
    if not isinstance(item, dict):
        return ""
    return (
        str(item.get("name") or item.get("display_name") or item.get("executable") or "")
        .strip()
        .lower()
    )


def _network_key(item):
    if not isinstance(item, dict):
        return ""
    return (
        f"{item.get('pid') or ''}|{item.get('process_name') or ''}|{item.get('protocol') or ''}|"
        f"{item.get('local_address') or ''}|{item.get('local_port') or ''}|"
        f"{item.get('remote_address') or ''}|{item.get('remote_port') or ''}|{item.get('status') or ''}"
    ).strip().lower()


def _software_alert_metadata(item):
    if not isinstance(item, dict):
        return {}
    return {
        "name": item.get("name") or "",
        "identifier": item.get("identifier") or "",
        "version": item.get("version") or "",
        "publisher": item.get("publisher") or "",
        "install_path": item.get("install_path") or "",
        "signature_state": item.get("signature_state") or "",
        "signer": item.get("signer") or "",
        "team_identifier": item.get("team_identifier") or "",
        "sha256": item.get("sha256") or "",
    }


def _file_key(item):
    if not isinstance(item, dict):
        return ""
    return str(item.get("path") or "").strip().lower()


def _auth_event_key(item):
    if not isinstance(item, dict):
        return ""
    return (
        f"{item.get('username') or ''}|{item.get('source') or ''}|{item.get('terminal') or ''}|"
        f"{item.get('occurred_at') or ''}|{item.get('status') or ''}"
    ).strip().lower()


def _parse_event_datetime(value, fallback):
    if not value:
        return fallback
    parsed = parse_datetime(value)
    if parsed is None:
        return fallback
    if timezone.is_naive(parsed):
        return timezone.make_aware(parsed, timezone.get_current_timezone())
    return parsed


def _analyze_snapshot(snapshot, processes, previous_snapshot=None, rule_config=None):
    config = rule_config or _default_rule_config()
    alerts = []

    def add_alert(level, alert_type, message, fingerprint, metadata=None):
        alerts.append(
            {
                "level": level,
                "type": alert_type,
                "message": message,
                "fingerprint": fingerprint,
                "metadata": metadata or {},
            }
        )

    if snapshot.cpu_percent is not None:
        if snapshot.cpu_percent >= config["cpu_critical_threshold"]:
            add_alert(
                "critical",
                "system_cpu",
                f"System CPU reached {snapshot.cpu_percent:.1f}%",
                "system_cpu",
                {"metric": "cpu_percent", "value": snapshot.cpu_percent},
            )
        elif snapshot.cpu_percent >= config["cpu_warning_threshold"]:
            add_alert(
                "warning",
                "system_cpu",
                f"System CPU reached {snapshot.cpu_percent:.1f}%",
                "system_cpu",
                {"metric": "cpu_percent", "value": snapshot.cpu_percent},
            )
    if snapshot.memory_percent is not None:
        if snapshot.memory_percent >= config["memory_critical_threshold"]:
            add_alert(
                "critical",
                "system_memory",
                f"System memory reached {snapshot.memory_percent:.1f}%",
                "system_memory",
                {"metric": "memory_percent", "value": snapshot.memory_percent},
            )
        elif snapshot.memory_percent >= config["memory_warning_threshold"]:
            add_alert(
                "warning",
                "system_memory",
                f"System memory reached {snapshot.memory_percent:.1f}%",
                "system_memory",
                {"metric": "memory_percent", "value": snapshot.memory_percent},
            )
    if snapshot.disk_percent is not None:
        if snapshot.disk_percent >= config["disk_critical_threshold"]:
            add_alert(
                "critical",
                "system_disk",
                f"Disk usage reached {snapshot.disk_percent:.1f}%",
                "system_disk",
                {"metric": "disk_percent", "value": snapshot.disk_percent},
            )
        elif snapshot.disk_percent >= config["disk_warning_threshold"]:
            add_alert(
                "warning",
                "system_disk",
                f"Disk usage reached {snapshot.disk_percent:.1f}%",
                "system_disk",
                {"metric": "disk_percent", "value": snapshot.disk_percent},
            )

    if snapshot.active_user_count >= config["multiple_users_threshold"]:
        add_alert(
            "info",
            "multiple_users",
            f"{snapshot.active_user_count} active users detected",
            "multiple_users",
            {"active_user_count": snapshot.active_user_count},
        )
    if len(snapshot.listening_ports or []) >= config["listening_ports_info_threshold"]:
        add_alert(
            "info",
            "listening_ports",
            f"{len(snapshot.listening_ports or [])} listening ports detected on the device",
            "listening_ports",
            {"listening_ports": snapshot.listening_ports},
        )

    previous_names = set()
    previous_total_processes = 0
    previous_software = {}
    previous_startup = {}
    previous_files = {}
    previous_auth_events = {}
    if previous_snapshot is not None:
        previous_names = {
            name.lower()
            for name in previous_snapshot.processes.values_list("name", flat=True)
            if name
        }
        previous_total_processes = previous_snapshot.total_processes or 0
        previous_software = {
            key: item
            for item in (previous_snapshot.software_inventory or [])
            if (key := _software_key(item))
        }
        previous_startup = {
            key: item
            for item in (previous_snapshot.startup_items or [])
            if (key := _startup_key(item))
        }
        previous_files = {
            key: item
            for item in (previous_snapshot.file_integrity_items or [])
            if (key := _file_key(item))
        }
        previous_auth_events = {
            key: item
            for item in (previous_snapshot.auth_events or [])
            if (key := _auth_event_key(item))
        }

    current_names = set()
    for process in processes:
        name = (process.name or "").strip()
        lower_name = name.lower()
        if lower_name:
            current_names.add(lower_name)

        if (
            process.cpu_percent is not None
            and process.cpu_percent >= config["process_cpu_warning_threshold"]
        ):
            add_alert(
                "warning",
                "process_cpu",
                f"{name} is using {process.cpu_percent:.1f}% CPU",
                f"process_cpu:{lower_name}",
                {"pid": process.pid, "cpu_percent": process.cpu_percent},
            )
        if (
            process.memory_mb is not None
            and process.memory_mb >= config["process_memory_warning_mb"]
        ):
            add_alert(
                "warning",
                "process_memory",
                f"{name} is using {process.memory_mb:.1f} MB of memory",
                f"process_memory:{lower_name}",
                {"pid": process.pid, "memory_mb": process.memory_mb},
            )
        if config["watchlist_enabled"] and lower_name in WATCHLIST:
            add_alert(
                "critical",
                "watchlist_match",
                f"Watchlist process detected: {name}",
                f"watchlist_match:{lower_name}",
                {"pid": process.pid, "watchlist_match": name},
            )

    new_names = sorted(current_names - previous_names) if config["new_process_tracking_enabled"] else []
    for new_name in new_names[:5]:
        add_alert(
            "info",
            "new_process",
            f"New process detected: {new_name}",
            f"new_process:{new_name}",
            {"process_name": new_name},
        )

    if previous_total_processes:
        process_delta = snapshot.total_processes - previous_total_processes
        process_spike_floor = max(
            config["process_spike_min_delta"],
            int(previous_total_processes * (config["process_spike_percent_threshold"] / 100)),
        )
        if process_delta >= process_spike_floor:
            add_alert(
                "warning",
                "process_spike",
                f"Process count jumped by {process_delta} since the previous snapshot",
                "process_spike",
                {
                    "process_delta": process_delta,
                    "previous_total_processes": previous_total_processes,
                    "current_total_processes": snapshot.total_processes,
                },
            )

    current_software = {
        key: item
        for item in (snapshot.software_inventory or [])
        if (key := _software_key(item))
    }
    if previous_snapshot is not None and config["new_software_tracking_enabled"]:
        for key in sorted(current_software.keys() - previous_software.keys())[:5]:
            item = current_software[key]
            name = item.get("name") or item.get("identifier") or key
            add_alert(
                "info",
                "new_software",
                f"New software detected: {name}",
                f"new_software:{key}",
                _software_alert_metadata(item),
            )
        for key in sorted(previous_software.keys() - current_software.keys())[:5]:
            item = previous_software[key]
            name = item.get("name") or item.get("identifier") or key
            add_alert(
                "warning",
                "removed_software",
                f"Software removed from inventory: {name}",
                f"removed_software:{key}",
                _software_alert_metadata(item),
            )
        for key in sorted(current_software.keys() & previous_software.keys())[:80]:
            current_item = current_software[key]
            previous_item = previous_software[key]
            current_version = str(current_item.get("version") or "").strip()
            previous_version = str(previous_item.get("version") or "").strip()
            if current_version and previous_version and current_version != previous_version:
                add_alert(
                    "info",
                    "software_version_change",
                    f"Software version changed: {current_item.get('name') or key} {previous_version} → {current_version}",
                    f"software_version_change:{key}",
                    {
                        **_software_alert_metadata(current_item),
                        "previous_version": previous_version,
                    },
                )
            current_signature = str(current_item.get("signature_state") or "").strip().lower()
            previous_signature = str(previous_item.get("signature_state") or "").strip().lower()
            if current_signature != previous_signature:
                add_alert(
                    "warning",
                    "software_signature_change",
                    f"Software trust changed: {current_item.get('name') or key} {previous_signature or 'unknown'} → {current_signature or 'unknown'}",
                    f"software_signature_change:{key}",
                    {
                        **_software_alert_metadata(current_item),
                        "previous_signature_state": previous_signature,
                    },
                )

    if config["unsigned_software_alert_enabled"]:
        for key, item in list(current_software.items())[:80]:
            signature_state = str(item.get("signature_state") or "").strip().lower()
            if signature_state != "unsigned":
                continue
            name = item.get("name") or item.get("identifier") or key
            add_alert(
                "warning",
                "unsigned_software",
                f"Unsigned software detected: {name}",
                f"unsigned_software:{key}",
                _software_alert_metadata(item),
            )

    current_startup = {
        key: item
        for item in (snapshot.startup_items or [])
        if (key := _startup_key(item))
    }
    if previous_snapshot is not None and config["startup_drift_tracking_enabled"]:
        for key in sorted(current_startup.keys() - previous_startup.keys())[:5]:
            item = current_startup[key]
            name = item.get("name") or item.get("location") or key
            add_alert(
                "warning",
                "startup_drift",
                f"New startup persistence detected: {name}",
                f"startup_drift:{key}",
                {
                    "name": item.get("name") or "",
                    "type": item.get("type") or "",
                    "scope": item.get("scope") or "",
                    "location": item.get("location") or item.get("command") or "",
                },
            )

    current_files = {
        key: item
        for item in (snapshot.file_integrity_items or [])
        if (key := _file_key(item))
    }
    if previous_snapshot is not None and config["file_integrity_tracking_enabled"]:
        for key in sorted(current_files.keys() - previous_files.keys())[:5]:
            item = current_files[key]
            add_alert(
                "warning",
                "file_integrity_new",
                f"New sensitive file observed: {item.get('path') or key}",
                f"file_integrity_new:{key}",
                item,
            )
        for key in sorted(previous_files.keys() - current_files.keys())[:5]:
            item = previous_files[key]
            add_alert(
                "warning",
                "file_integrity_removed",
                f"Sensitive file disappeared: {item.get('path') or key}",
                f"file_integrity_removed:{key}",
                item,
            )
        for key in sorted(current_files.keys() & previous_files.keys())[:80]:
            current_item = current_files[key]
            previous_item = previous_files[key]
            if (
                str(current_item.get("sha256") or "").strip()
                and str(previous_item.get("sha256") or "").strip()
                and str(current_item.get("sha256") or "").strip()
                != str(previous_item.get("sha256") or "").strip()
            ):
                add_alert(
                    "warning",
                    "file_integrity_changed",
                    f"Sensitive file changed: {current_item.get('path') or key}",
                    f"file_integrity_changed:{key}",
                    {
                        **current_item,
                        "previous_sha256": previous_item.get("sha256") or "",
                    },
                )

    if config["remote_session_tracking_enabled"]:
        remote_sessions = [
            session
            for session in (snapshot.user_sessions or [])
            if isinstance(session, dict) and session.get("remote")
        ]
        for session in remote_sessions[:3]:
            username = session.get("username") or "user"
            source = session.get("host") or "remote-host"
            add_alert(
                "info",
                "remote_session",
                f"Remote session observed: {username} from {source}",
                f"remote_session:{username}:{source}".lower(),
                {
                    "username": username,
                    "host": source,
                    "terminal": session.get("terminal") or "",
                    "started_at": session.get("started_at") or "",
                },
            )

    if config["auth_event_tracking_enabled"]:
        current_auth_events = {
            key: item
            for item in (snapshot.auth_events or [])
            if (key := _auth_event_key(item))
        }
        for key in sorted(current_auth_events.keys() - previous_auth_events.keys())[:4]:
            event = current_auth_events[key]
            source = event.get("source") or "local-console"
            level = "warning" if event.get("source") else "info"
            add_alert(
                level,
                "auth_event",
                f"New auth event observed: {event.get('username') or 'user'} via {source}",
                f"auth_event:{key}",
                event,
            )
        failed_events = [
            item
            for item in (snapshot.auth_events or [])
            if isinstance(item, dict) and str(item.get("status") or "").lower() == "failed"
        ]
        for event in failed_events[:3]:
            add_alert(
                "warning",
                "auth_failure",
                f"Failed auth observed for {event.get('username') or 'user'}",
                f"auth_failure:{_auth_event_key(event)}",
                event,
            )

    network_events = snapshot.network_events or []
    for event in network_events[:80]:
        if not isinstance(event, dict):
            continue
        if str(event.get("security_hint") or "").lower() == "remote-admin":
            add_alert(
                "warning",
                "remote_admin_connection",
                f"Remote admin traffic observed from {event.get('process_name') or 'process'}",
                f"remote_admin:{event.get('remote_address') or ''}:{event.get('remote_port') or ''}:{event.get('event_type') or ''}",
                event,
            )
        if str(event.get("remote_scope") or "").lower() == "public" and str(event.get("event_type") or "").lower() == "opened":
            add_alert(
                "info",
                "public_egress",
                f"Public outbound connection opened by {event.get('process_name') or 'process'}",
                f"public_egress:{event.get('process_name') or ''}:{event.get('remote_address') or ''}:{event.get('remote_port') or ''}",
                event,
            )

    service_inventory = snapshot.service_inventory or []
    for item in service_inventory[:120]:
        if not isinstance(item, dict):
            continue
        state = str(item.get("state") or "").lower()
        name = item.get("display_name") or item.get("name") or "service"
        if state in {"failed", "stopped"}:
            add_alert(
                "warning",
                "service_state",
                f"Service attention required: {name} is {state}",
                f"service_state:{str(item.get('name') or name).lower()}:{state}",
                item,
            )

    posture = snapshot.security_posture or {}
    if isinstance(posture, dict):
        if str(posture.get("firewall_state") or "").lower() == "disabled":
            add_alert(
                "warning",
                "firewall_disabled",
                "Device firewall appears disabled",
                "firewall_disabled",
                posture,
            )
        if str(posture.get("disk_encryption_state") or "").lower() == "disabled":
            add_alert(
                "critical",
                "disk_encryption_disabled",
                "Disk encryption appears disabled",
                "disk_encryption_disabled",
                posture,
            )
        if str(posture.get("antivirus_state") or "").lower() in {"not_detected", "disabled"}:
            add_alert(
                "warning",
                "antivirus_missing",
                "No active antivirus or endpoint protection detected",
                "antivirus_missing",
                posture,
            )
        capabilities = posture.get("collector_capabilities") or []
        for capability in capabilities[:12]:
            if not isinstance(capability, dict):
                continue
            state = str(capability.get("state") or "").lower()
            if state not in {"available", "not-enabled"}:
                continue
            if capability.get("name") not in {"endpoint-security", "ebpf", "etw"}:
                continue
            add_alert(
                "info",
                "collector_capability",
                f"Deep collector available but not active: {capability.get('name')}",
                f"collector_capability:{capability.get('name')}",
                capability,
            )

    deduped = []
    seen = set()
    for alert in alerts:
        key = (alert["type"], alert["fingerprint"], alert["message"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(alert)

    deduped = deduped[:12]
    risk_score = min(sum(_level_weight(alert["level"]) for alert in deduped), 100)
    risk_level = "healthy"
    for candidate in ("critical", "warning", "info"):
        if any(alert["level"] == candidate for alert in deduped):
            risk_level = candidate
            break

    return {
        "alerts": deduped,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "new_process_count": len(new_names),
    }


def _serialize_snapshot(snapshot):
    active_alerts = _active_alerts_for_host(snapshot.host)
    serializer = SnapshotOutSerializer(
        snapshot,
        context={
            "alerts": AlertSerializer(active_alerts[:12], many=True).data,
            "risk_score": snapshot.host.risk_score,
            "risk_level": snapshot.host.latest_alert_level or _risk_level(snapshot.host.risk_score),
        },
    )
    return serializer.data


def _inventory_events_between_snapshots(previous_snapshot, current_snapshot):
    events = []
    current_time = current_snapshot.created_at

    previous_software = {
        key: item
        for item in (previous_snapshot.software_inventory or [])
        if (key := _software_key(item))
    }
    current_software = {
        key: item
        for item in (current_snapshot.software_inventory or [])
        if (key := _software_key(item))
    }
    for key in sorted(current_software.keys() - previous_software.keys())[:6]:
        item = current_software[key]
        events.append(
            {
                "category": "software",
                "kind": "software_added",
                "severity": "info",
                "title": f"New software: {item.get('name') or key}",
                "subtitle": item.get("version") or item.get("publisher") or "",
                "at": current_time,
                "metadata": item,
                "source": "snapshot-diff",
            }
        )
    for key in sorted(previous_software.keys() - current_software.keys())[:6]:
        item = previous_software[key]
        events.append(
            {
                "category": "software",
                "kind": "software_removed",
                "severity": "warning",
                "title": f"Software removed: {item.get('name') or key}",
                "subtitle": item.get("version") or item.get("publisher") or "",
                "at": current_time,
                "metadata": item,
                "source": "snapshot-diff",
            }
        )
    for key in sorted(current_software.keys() & previous_software.keys())[:80]:
        current_item = current_software[key]
        previous_item = previous_software[key]
        if (current_item.get("version") or "") != (previous_item.get("version") or ""):
            events.append(
                {
                    "category": "software",
                    "kind": "software_version_change",
                    "severity": "info",
                    "title": f"Version changed: {current_item.get('name') or key}",
                    "subtitle": f"{previous_item.get('version') or 'unknown'} → {current_item.get('version') or 'unknown'}",
                    "at": current_time,
                    "metadata": {
                        "previous": previous_item,
                        "current": current_item,
                    },
                    "source": "snapshot-diff",
                }
            )
        if (current_item.get("signature_state") or "") != (previous_item.get("signature_state") or ""):
            events.append(
                {
                    "category": "software",
                    "kind": "software_signature_change",
                    "severity": "warning",
                    "title": f"Trust changed: {current_item.get('name') or key}",
                    "subtitle": f"{previous_item.get('signature_state') or 'unknown'} → {current_item.get('signature_state') or 'unknown'}",
                    "at": current_time,
                    "metadata": {
                        "previous": previous_item,
                        "current": current_item,
                    },
                    "source": "snapshot-diff",
                }
            )

    previous_files = {
        key: item
        for item in (previous_snapshot.file_integrity_items or [])
        if (key := _file_key(item))
    }
    current_files = {
        key: item
        for item in (current_snapshot.file_integrity_items or [])
        if (key := _file_key(item))
    }
    for key in sorted(current_files.keys() - previous_files.keys())[:6]:
        item = current_files[key]
        events.append(
            {
                "category": "integrity",
                "kind": "file_added",
                "severity": "warning",
                "title": f"Sensitive file added: {item.get('path') or key}",
                "subtitle": item.get("category") or "",
                "at": current_time,
                "metadata": item,
                "source": "snapshot-diff",
            }
        )
    for key in sorted(previous_files.keys() - current_files.keys())[:6]:
        item = previous_files[key]
        events.append(
            {
                "category": "integrity",
                "kind": "file_removed",
                "severity": "warning",
                "title": f"Sensitive file removed: {item.get('path') or key}",
                "subtitle": item.get("category") or "",
                "at": current_time,
                "metadata": item,
                "source": "snapshot-diff",
            }
        )
    for key in sorted(current_files.keys() & previous_files.keys())[:80]:
        current_item = current_files[key]
        previous_item = previous_files[key]
        if (current_item.get("sha256") or "") != (previous_item.get("sha256") or ""):
            events.append(
                {
                    "category": "integrity",
                    "kind": "file_changed",
                    "severity": "warning",
                    "title": f"Sensitive file changed: {current_item.get('path') or key}",
                    "subtitle": current_item.get("category") or "",
                    "at": current_time,
                    "metadata": {
                        "previous": previous_item,
                        "current": current_item,
                    },
                    "source": "snapshot-diff",
                }
            )

    previous_startup = {
        key: item
        for item in (previous_snapshot.startup_items or [])
        if (key := _startup_key(item))
    }
    current_startup = {
        key: item
        for item in (current_snapshot.startup_items or [])
        if (key := _startup_key(item))
    }
    for key in sorted(current_startup.keys() - previous_startup.keys())[:5]:
        item = current_startup[key]
        events.append(
            {
                "category": "service",
                "kind": "startup_added",
                "severity": "warning",
                "title": f"Persistence added: {item.get('name') or key}",
                "subtitle": item.get("location") or item.get("command") or "",
                "at": current_time,
                "metadata": item,
                "source": "snapshot-diff",
            }
        )
    for key in sorted(previous_startup.keys() - current_startup.keys())[:5]:
        item = previous_startup[key]
        events.append(
            {
                "category": "service",
                "kind": "startup_removed",
                "severity": "warning",
                "title": f"Persistence removed: {item.get('name') or key}",
                "subtitle": item.get("location") or item.get("command") or "",
                "at": current_time,
                "metadata": item,
                "source": "snapshot-diff",
            }
        )

    previous_services = {
        key: item
        for item in (previous_snapshot.service_inventory or [])
        if (key := _service_key(item))
    }
    current_services = {
        key: item
        for item in (current_snapshot.service_inventory or [])
        if (key := _service_key(item))
    }
    for key in sorted(current_services.keys() - previous_services.keys())[:6]:
        item = current_services[key]
        events.append(
            {
                "category": "service",
                "kind": "service_added",
                "severity": "info",
                "title": f"Service discovered: {item.get('display_name') or item.get('name') or key}",
                "subtitle": item.get("state") or item.get("startup_type") or "",
                "at": current_time,
                "metadata": item,
                "source": "snapshot-diff",
            }
        )
    for key in sorted(current_services.keys() & previous_services.keys())[:120]:
        current_item = current_services[key]
        previous_item = previous_services[key]
        if (current_item.get("state") or "") != (previous_item.get("state") or ""):
            events.append(
                {
                    "category": "service",
                    "kind": "service_state_change",
                    "severity": "warning",
                    "title": f"Service state changed: {current_item.get('display_name') or current_item.get('name') or key}",
                    "subtitle": f"{previous_item.get('state') or 'unknown'} → {current_item.get('state') or 'unknown'}",
                    "at": current_time,
                    "metadata": {"previous": previous_item, "current": current_item},
                    "source": "snapshot-diff",
                }
            )

    previous_connections = {
        key: item
        for item in (previous_snapshot.network_connections or [])
        if (key := _network_key(item))
    }
    current_connections = {
        key: item
        for item in (current_snapshot.network_connections or [])
        if (key := _network_key(item))
    }
    for key in sorted(current_connections.keys() - previous_connections.keys())[:10]:
        item = current_connections[key]
        if item.get("remote_address"):
            events.append(
                {
                    "category": "network",
                    "kind": "connection_opened",
                    "severity": "info",
                    "title": f"Outbound connection: {item.get('process_name') or 'process'}",
                    "subtitle": f"{item.get('remote_address') or ''}:{item.get('remote_port') or ''}",
                    "at": current_time,
                    "metadata": item,
                    "source": "snapshot-diff",
                }
            )

    previous_auth = {
        key: item
        for item in (previous_snapshot.auth_events or [])
        if (key := _auth_event_key(item))
    }
    current_auth = {
        key: item
        for item in (current_snapshot.auth_events or [])
        if (key := _auth_event_key(item))
    }
    for key in sorted(current_auth.keys() - previous_auth.keys())[:6]:
        item = current_auth[key]
        events.append(
            {
                "category": "auth",
                "kind": "auth_event",
                "severity": "warning" if item.get("source") else "info",
                "title": f"Auth event: {item.get('username') or 'user'}",
                "subtitle": item.get("summary") or item.get("source") or item.get("terminal") or "",
                "at": _parse_event_datetime(item.get("occurred_at"), current_time),
                "metadata": item,
                "source": "native-auth" if item.get("event_type") == "auth_log" else "session-history",
            }
        )

    previous_posture = previous_snapshot.security_posture or {}
    current_posture = current_snapshot.security_posture or {}
    for key, label in (
        ("firewall_state", "Firewall"),
        ("disk_encryption_state", "Disk encryption"),
        ("antivirus_state", "Endpoint protection"),
        ("mdm_state", "MDM"),
        ("gatekeeper_state", "Gatekeeper"),
        ("sip_state", "System Integrity Protection"),
    ):
        if (current_posture.get(key) or "") == (previous_posture.get(key) or ""):
            continue
        events.append(
            {
                "category": "security",
                "kind": "posture_change",
                "severity": "warning",
                "title": f"{label} posture changed",
                "subtitle": f"{previous_posture.get(key) or 'unknown'} → {current_posture.get(key) or 'unknown'}",
                "at": current_time,
                "metadata": {
                    "field": key,
                    "previous": previous_posture.get(key),
                    "current": current_posture.get(key),
                },
                "source": "snapshot-diff",
            }
        )

    return events


def _build_inventory_timeline_events(snapshots, limit=40):
    events = []
    for previous_snapshot, current_snapshot in zip(snapshots, snapshots[1:]):
        events.extend(_inventory_events_between_snapshots(previous_snapshot, current_snapshot))

    events.sort(key=lambda event: event["at"], reverse=True)
    return [
        {
            **event,
            "at": event["at"].isoformat(),
        }
        for event in events[:limit]
    ]


def _persist_host_events(host, snapshot, previous_snapshot=None):
    pending = []

    for item in snapshot.process_events or []:
        pending.append(
            HostEvent(
                host=host,
                snapshot=snapshot,
                category="process",
                kind=f"process_{item.get('event_type') or 'observed'}",
                severity="warning" if item.get("event_type") in {"started", "restarted"} else "info",
                title=f"Process {item.get('event_type') or 'observed'}: {item.get('name') or 'unknown'}",
                subtitle=item.get("cmdline") or item.get("username") or "",
                source="runtime-diff",
                metadata=item,
                occurred_at=_parse_event_datetime(item.get("occurred_at"), snapshot.created_at),
            )
        )

    for item in snapshot.file_events or []:
        pending.append(
            HostEvent(
                host=host,
                snapshot=snapshot,
                category="integrity",
                kind=f"file_event_{item.get('action') or 'observed'}",
                severity="warning",
                title=f"File {item.get('action') or 'observed'}: {item.get('path') or 'unknown'}",
                subtitle=item.get("category") or "",
                source="fsnotify",
                metadata=item,
                occurred_at=_parse_event_datetime(item.get("occurred_at"), snapshot.created_at),
            )
        )

    for item in snapshot.dns_events or []:
        pending.append(
            HostEvent(
                host=host,
                snapshot=snapshot,
                category="network",
                kind="dns_query",
                severity="info",
                title=f"DNS query: {item.get('query') or 'unknown'}",
                subtitle=item.get("source") or item.get("record_type") or "",
                source=item.get("source") or "dns-log",
                metadata=item,
                occurred_at=_parse_event_datetime(item.get("occurred_at"), snapshot.created_at),
            )
        )

    for item in snapshot.network_events or []:
        pending.append(
            HostEvent(
                host=host,
                snapshot=snapshot,
                category="network",
                kind=f"connection_{item.get('event_type') or 'observed'}",
                severity="warning" if item.get("security_hint") == "remote-admin" else "info",
                title=f"Connection {item.get('event_type') or 'observed'}: {item.get('process_name') or 'process'}",
                subtitle=f"{item.get('remote_domain') or item.get('remote_address') or ''}:{item.get('remote_port') or ''}",
                source="runtime-diff",
                metadata=item,
                occurred_at=_parse_event_datetime(item.get("occurred_at"), snapshot.created_at),
            )
        )

    for item in snapshot.auth_events or []:
        if str(item.get("status") or "").lower() == "failed":
            pending.append(
                HostEvent(
                    host=host,
                    snapshot=snapshot,
                    category="auth",
                    kind="auth_failed",
                    severity="warning",
                    title=f"Failed auth: {item.get('username') or 'user'}",
                    subtitle=item.get("summary") or item.get("source_ip") or "",
                    source=item.get("source") or "auth-log",
                    metadata=item,
                    occurred_at=_parse_event_datetime(item.get("occurred_at"), snapshot.created_at),
                )
            )

    if previous_snapshot is not None:
        for event in _inventory_events_between_snapshots(previous_snapshot, snapshot):
            pending.append(
                HostEvent(
                    host=host,
                    snapshot=snapshot,
                    category=event["category"],
                    kind=event["kind"],
                    severity=event["severity"],
                    title=event["title"],
                    subtitle=event.get("subtitle") or "",
                    source=event.get("source") or "snapshot-diff",
                    metadata=event.get("metadata") or {},
                    occurred_at=event["at"],
                )
            )

    if pending:
        HostEvent.objects.bulk_create(pending)


def _compare_snapshots(left_snapshot, right_snapshot):
    left_process_map = {
        f"{item.pid}:{(item.name or '').lower()}": item for item in left_snapshot.processes.all()
    }
    right_process_map = {
        f"{item.pid}:{(item.name or '').lower()}": item for item in right_snapshot.processes.all()
    }

    def keyed_map(items, key_fn):
        return {
            key: item
            for item in items
            if (key := key_fn(item))
        }

    left_software = keyed_map(left_snapshot.software_inventory or [], _software_key)
    right_software = keyed_map(right_snapshot.software_inventory or [], _software_key)
    left_files = keyed_map(left_snapshot.file_integrity_items or [], _file_key)
    right_files = keyed_map(right_snapshot.file_integrity_items or [], _file_key)
    left_startup = keyed_map(left_snapshot.startup_items or [], _startup_key)
    right_startup = keyed_map(right_snapshot.startup_items or [], _startup_key)
    left_services = keyed_map(left_snapshot.service_inventory or [], _service_key)
    right_services = keyed_map(right_snapshot.service_inventory or [], _service_key)
    left_connections = keyed_map(left_snapshot.network_connections or [], _network_key)
    right_connections = keyed_map(right_snapshot.network_connections or [], _network_key)

    return {
        "left_snapshot": SnapshotHistorySerializer(left_snapshot).data,
        "right_snapshot": SnapshotHistorySerializer(right_snapshot).data,
        "metrics": {
            "cpu_percent_delta": (right_snapshot.cpu_percent or 0) - (left_snapshot.cpu_percent or 0),
            "memory_percent_delta": (right_snapshot.memory_percent or 0) - (left_snapshot.memory_percent or 0),
            "disk_percent_delta": (right_snapshot.disk_percent or 0) - (left_snapshot.disk_percent or 0),
            "process_count_delta": (right_snapshot.total_processes or 0) - (left_snapshot.total_processes or 0),
        },
        "processes": {
            "new": [
                {
                    "pid": item.pid,
                    "name": item.name,
                    "username": item.username,
                    "cmdline": item.cmdline,
                }
                for key, item in list(right_process_map.items())
                if key not in left_process_map
            ][:40],
            "removed": [
                {
                    "pid": item.pid,
                    "name": item.name,
                    "username": item.username,
                    "cmdline": item.cmdline,
                }
                for key, item in list(left_process_map.items())
                if key not in right_process_map
            ][:40],
        },
        "software": _build_inventory_timeline_events([left_snapshot, right_snapshot], limit=60),
        "files": {
            "added": [right_files[key] for key in sorted(right_files.keys() - left_files.keys())[:30]],
            "removed": [left_files[key] for key in sorted(left_files.keys() - right_files.keys())[:30]],
            "changed": [
                {
                    "previous": left_files[key],
                    "current": right_files[key],
                }
                for key in sorted(right_files.keys() & left_files.keys())[:80]
                if (right_files[key].get("sha256") or "") != (left_files[key].get("sha256") or "")
            ][:30],
        },
        "startup": {
            "added": [right_startup[key] for key in sorted(right_startup.keys() - left_startup.keys())[:30]],
            "removed": [left_startup[key] for key in sorted(left_startup.keys() - right_startup.keys())[:30]],
        },
        "services": {
            "added": [right_services[key] for key in sorted(right_services.keys() - left_services.keys())[:30]],
            "removed": [left_services[key] for key in sorted(left_services.keys() - right_services.keys())[:30]],
            "changed": [
                {
                    "previous": left_services[key],
                    "current": right_services[key],
                }
                for key in sorted(right_services.keys() & left_services.keys())[:80]
                if (right_services[key].get("state") or "") != (left_services[key].get("state") or "")
            ][:30],
        },
        "network": {
            "new": [right_connections[key] for key in sorted(right_connections.keys() - left_connections.keys())[:30]],
            "removed": [left_connections[key] for key in sorted(left_connections.keys() - right_connections.keys())[:30]],
            "dns": right_snapshot.dns_events or [],
            "events": right_snapshot.network_events or [],
        },
        "auth": {
            "left": left_snapshot.auth_events or [],
            "right": right_snapshot.auth_events or [],
        },
        "security_posture": {
            "left": left_snapshot.security_posture or {},
            "right": right_snapshot.security_posture or {},
        },
        "process_events": right_snapshot.process_events or [],
    }


def _sync_persistent_alerts(host, snapshot, computed_alerts, *, actor=None, auto_resolve_muted=True):
    now = timezone.now()
    active_alerts = {}
    for alert in host.alerts.filter(status__in=ACTIVE_ALERT_STATUSES).order_by("-last_seen_at"):
        active_alerts.setdefault(alert.fingerprint, alert)

    active_fingerprints = set()
    for payload in computed_alerts:
        fingerprint = payload["fingerprint"]
        active_fingerprints.add(fingerprint)
        alert = active_alerts.get(fingerprint)
        if alert:
            previous_status = alert.status
            previous_level = alert.level
            status_changed = False
            if (
                alert.status == Alert.Status.MUTED
                and alert.muted_until
                and alert.muted_until <= now
            ):
                alert.status = Alert.Status.OPEN
                alert.muted_until = None
                status_changed = True
            alert.latest_snapshot = snapshot
            alert.level = payload["level"]
            alert.type = payload["type"]
            alert.message = payload["message"]
            alert.metadata = payload.get("metadata", {})
            alert.last_seen_at = now
            alert.occurrence_count += 1
            alert.save(
                update_fields=[
                    "latest_snapshot",
                    "level",
                    "type",
                    "message",
                    "metadata",
                    "last_seen_at",
                    "occurrence_count",
                    "status",
                    "muted_until",
                    "updated_at",
                ]
            )
            if status_changed:
                _create_audit_log(
                    alert,
                    "mute_expired",
                    actor=actor,
                    previous_status=previous_status,
                    next_status=alert.status,
                    metadata={"fingerprint": fingerprint},
                )
            if _severity_rank(alert.level) > _severity_rank(previous_level):
                dispatch_alert_notifications(alert, "alert.escalated")
            continue

        alert = Alert.objects.create(
            host=host,
            latest_snapshot=snapshot,
            fingerprint=fingerprint,
            level=payload["level"],
            type=payload["type"],
            message=payload["message"],
            status=Alert.Status.OPEN,
            metadata=payload.get("metadata", {}),
            first_seen_at=now,
            last_seen_at=now,
            occurrence_count=1,
        )
        _create_audit_log(
            alert,
            "created",
            actor=actor,
            previous_status="",
            next_status=Alert.Status.OPEN,
            metadata={"fingerprint": fingerprint},
        )
        dispatch_alert_notifications(alert, "alert.created")

    for fingerprint, alert in active_alerts.items():
        if fingerprint in active_fingerprints:
            continue
        if alert.status == Alert.Status.MUTED and not auto_resolve_muted:
            continue

        previous_status = alert.status
        alert.status = Alert.Status.RESOLVED
        alert.latest_snapshot = snapshot
        alert.resolved_at = now
        alert.resolved_by = None
        alert.save(
            update_fields=[
                "status",
                "latest_snapshot",
                "resolved_at",
                "resolved_by",
                "updated_at",
            ]
        )
        _create_audit_log(
            alert,
            "auto_resolved",
            actor=actor,
            previous_status=previous_status,
            next_status=Alert.Status.RESOLVED,
            metadata={"reason": "signal_not_present"},
        )

    _recalculate_host_posture(host)


def _hosts_for_user(user):
    if user.is_superuser:
        return Host.objects.all()
    owner = get_workspace_owner(user)
    return Host.objects.filter(owner=owner)


def _retention_cutoff_for_user(user):
    if user.is_superuser:
        return None
    retention_days = get_workspace_plan(user)["retention_days"]
    return timezone.now() - timedelta(days=retention_days)


def _resolve_host_for_user(user, hostname=None, agent_id=None):
    queryset = _hosts_for_user(user)
    if agent_id:
        return get_object_or_404(queryset, agent_id=agent_id)
    if hostname:
        return get_object_or_404(queryset, hostname=hostname)
    return None


def _slugify_check_name(value):
    slug = re.sub(r"[^a-z0-9]+", "-", str(value or "").strip().lower()).strip("-")
    return slug or f"custom-check-{secrets.token_hex(3)}"


def _resolve_agent_host(agent_id, api_key_header):
    if not agent_id:
        return None
    host = Host.objects.filter(agent_id=agent_id).first()
    if not host:
        return None
    if not _allow_ingest(api_key_header, host):
        return None
    return host


class HealthView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, _request):
        return Response({"status": "ok", "service": "device-visibility-api"})


class IngestSnapshotView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = SnapshotInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        hostname = payload["hostname"]
        agent_id = payload.get("agent_id")
        api_key_header = request.headers.get("X-API-Key")
        onboarding_profile = None
        if api_key_header and api_key_header != getattr(settings, "PROC_MONITOR_API_KEY", ""):
            onboarding_profile = (
                AccountProfile.objects.select_related("user")
                .filter(onboarding_api_key=api_key_header)
                .first()
            )

        host = None
        if agent_id:
            host = Host.objects.filter(agent_id=agent_id).first()
        if host is None and not agent_id:
            host = Host.objects.filter(hostname=hostname).first()
        is_new_host = host is None
        if host is None:
            host = Host(agent_id=agent_id, hostname=hostname)

        allow_onboarding_ingest = bool(
            onboarding_profile
            and (
                is_new_host
                or host.owner_id in {None, onboarding_profile.user_id}
            )
        )
        if not (_allow_ingest(api_key_header, host) or allow_onboarding_ingest):
            return Response(
                {"detail": "Invalid API key"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if allow_onboarding_ingest and host.owner_id in {None, onboarding_profile.user_id}:
            workspace_owner = get_workspace_owner(onboarding_profile.user)
            plan = get_workspace_plan(onboarding_profile.user)
            used_devices = workspace_owner.owned_hosts.exclude(id=host.id).count()
            if used_devices >= plan["host_limit"]:
                return Response(
                    {
                        "detail": (
                            f"The {plan['label']} plan supports up to {plan['host_limit']} devices. "
                            "Upgrade your plan before onboarding another device."
                        )
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            host.owner = workspace_owner

        if not host.api_key:
            host.generate_api_key()

        if agent_id:
            host.agent_id = agent_id
        host.hostname = hostname
        host.os_name = payload.get("os_name") or host.os_name
        host.os_version = payload.get("os_version") or host.os_version
        host.architecture = payload.get("architecture") or host.architecture
        host.device_type = payload.get("device_type") or host.device_type
        host.primary_ip = payload.get("primary_ip") or host.primary_ip
        host.agent_version = payload.get("agent_version") or host.agent_version
        host.cpu_count = payload.get("cpu_count") or host.cpu_count
        host.total_memory_mb = payload.get("total_memory_mb") or host.total_memory_mb
        host.total_disk_gb = payload.get("total_disk_gb") or host.total_disk_gb
        host.mark_online()
        alert_rule_config = _rule_config_for_user(host.owner)

        with transaction.atomic():
            host.save()
            previous_snapshot = host.snapshots.order_by("-created_at").first()
            snapshot = Snapshot.objects.create(
                host=host,
                cpu_percent=payload.get("cpu_percent"),
                memory_percent=payload.get("memory_percent"),
                disk_percent=payload.get("disk_percent"),
                network_sent_mb=payload.get("network_sent_mb"),
                network_recv_mb=payload.get("network_recv_mb"),
                load_one=payload.get("load_one"),
                load_five=payload.get("load_five"),
                load_fifteen=payload.get("load_fifteen"),
                uptime_seconds=payload.get("uptime_seconds"),
                active_user_count=payload.get("active_user_count") or 0,
                listening_ports=payload.get("listening_ports") or [],
                network_connections=payload.get("network_connections") or [],
                network_events=payload.get("network_events") or [],
                dns_events=payload.get("dns_events") or [],
                startup_items=payload.get("startup_items") or [],
                service_inventory=payload.get("service_inventory") or [],
                software_inventory=payload.get("software_inventory") or [],
                user_sessions=payload.get("user_sessions") or [],
                file_integrity_items=payload.get("file_integrity_items") or [],
                file_events=payload.get("file_events") or [],
                auth_events=payload.get("auth_events") or [],
                process_events=payload.get("process_events") or [],
                security_posture=payload.get("security_posture") or {},
                collector_sources=payload.get("collector_sources") or [],
                total_processes=len(payload["processes"]),
            )

            _update_patch_posture(snapshot, alert_rule_config)

            process_rows = [
                Process(
                    snapshot=snapshot,
                    pid=proc["pid"],
                    ppid=proc.get("ppid"),
                    name=proc["name"][:512],
                    cpu_percent=proc.get("cpu_percent"),
                    memory_mb=proc.get("memory_mb"),
                    status=(proc.get("status") or "")[:32],
                    username=(proc.get("username") or "")[:255],
                    cmdline=(proc.get("cmdline") or "")[: settings.MAX_CMDLINE_LENGTH],
                    exe_path=(proc.get("exe_path") or "")[: settings.MAX_CMDLINE_LENGTH],
                    started_at=_parse_event_datetime(proc.get("started_at"), snapshot.created_at)
                    if proc.get("started_at")
                    else None,
                )
                for proc in payload["processes"]
            ]
            Process.objects.bulk_create(process_rows)

            analysis = _analyze_snapshot(
                snapshot,
                process_rows,
                previous_snapshot,
                alert_rule_config,
            )
            _sync_persistent_alerts(
                host,
                snapshot,
                analysis["alerts"],
                auto_resolve_muted=alert_rule_config["muted_alert_auto_resolve"],
            )
            _persist_host_events(host, snapshot, previous_snapshot)
            _record_check_results(host, snapshot, alert_rule_config)
            if allow_onboarding_ingest and not onboarding_profile.onboarding_completed:
                onboarding_profile.onboarding_completed = True
                onboarding_profile.save(update_fields=["onboarding_completed", "updated_at"])

        response_data = _serialize_snapshot(snapshot)
        response_data["host_api_key"] = host.api_key

        try:
            layer = get_channel_layer()
            async_to_sync(layer.group_send)(
                f"process_{host.agent_id or hostname}",
                {"type": "send_snapshot", "data": response_data},
            )
        except Exception:
            pass

        return Response(response_data, status=status.HTTP_201_CREATED)


class MobileHeartbeatView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MobileHeartbeatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        workspace_owner = get_workspace_owner(request.user)
        plan = get_workspace_plan(request.user)
        device_id = payload["device_id"]

        host = Host.objects.filter(agent_id=device_id).first()
        if host and host.owner_id not in {None, workspace_owner.id}:
            return Response(
                {"detail": "That mobile device is already registered to another workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        is_new_host = host is None
        if host is None:
            used_devices = workspace_owner.owned_hosts.count()
            if used_devices >= plan["host_limit"]:
                return Response(
                    {
                        "detail": (
                            f"The {plan['label']} plan supports up to {plan['host_limit']} devices. "
                            "Upgrade your plan before onboarding another device."
                        )
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            host = Host(agent_id=device_id)

        host.owner = workspace_owner
        host.hostname = payload["hostname"]
        host.display_name = payload["hostname"]
        host.device_type = "mobile"
        host.os_name = payload.get("os_name") or payload.get("platform") or host.os_name
        host.os_version = payload.get("os_version") or host.os_version
        host.architecture = payload.get("platform") or host.architecture
        host.primary_ip = payload.get("primary_ip") or host.primary_ip
        host.agent_version = payload.get("app_version") or host.agent_version
        host.total_memory_mb = payload.get("total_memory_mb") or host.total_memory_mb
        host.mark_online()
        host.save()

        posture = {
            "mode": "mobile-companion",
            "collector_mode": "mobile-companion",
            "battery_state": payload.get("battery_state") or "unknown",
            "battery_level_percent": payload.get("battery_level"),
            "low_power_mode": bool(payload.get("low_power_mode")),
            "network_type": payload.get("network_type") or "unknown",
            "is_connected": bool(payload.get("is_connected")),
            "is_internet_reachable": payload.get("is_internet_reachable"),
            "manufacturer": payload.get("manufacturer") or "",
            "model_name": payload.get("model_name") or "",
            "mdm_state": "unknown",
            "physical_device": bool(payload.get("physical_device")),
            "timezone": payload.get("timezone") or "",
            "locale": payload.get("locale") or "",
            "device_year_class": payload.get("device_year_class"),
            "collector_capabilities": [
                {
                    "name": "mobile-companion",
                    "layer": "mobile-app",
                    "state": "active",
                    "detail": "Signed-in mobile telemetry companion for Android and iPhone.",
                }
            ],
        }

        snapshot = Snapshot.objects.create(
            host=host,
            cpu_percent=None,
            memory_percent=None,
            disk_percent=None,
            active_user_count=1,
            listening_ports=[],
            network_connections=[],
            network_events=[],
            dns_events=[],
            startup_items=[],
            service_inventory=[],
            software_inventory=[],
            user_sessions=[],
            file_integrity_items=[],
            file_events=[],
            auth_events=[],
            process_events=[],
            security_posture=posture,
            collector_sources=["mobile-companion"],
            total_processes=0,
        )

        _record_check_results(host, snapshot, _rule_config_for_user(workspace_owner))
        _recalculate_host_posture(host)
        response_data = _serialize_snapshot(snapshot)
        response_data["device_created"] = is_new_host
        return Response(response_data, status=status.HTTP_201_CREATED)


class LatestSnapshotView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hostname = request.query_params.get("hostname")
        agent_id = request.query_params.get("agent_id")
        if not hostname and not agent_id:
            return Response(
                {"detail": "hostname or agent_id query param required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        host = _resolve_host_for_user(request.user, hostname=hostname, agent_id=agent_id)
        retention_cutoff = _retention_cutoff_for_user(request.user)
        snapshot_queryset = host.snapshots.order_by("-created_at")
        if retention_cutoff is not None:
            snapshot_queryset = snapshot_queryset.filter(created_at__gte=retention_cutoff)
        snapshot = snapshot_queryset.first()
        if snapshot is None:
            return Response(
                {"detail": "No snapshots found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(_serialize_snapshot(snapshot))


class HostsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hosts = _hosts_for_user(request.user).order_by("hostname")
        return Response(
            {
                "hosts": HostSummarySerializer(
                    hosts,
                    many=True,
                    context={"retention_cutoff": _retention_cutoff_for_user(request.user)},
                ).data
            }
        )


class FleetSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hosts = list(_hosts_for_user(request.user).order_by("hostname"))
        plan = get_plan_config(get_effective_plan(request.user.account_profile))
        retention_cutoff = _retention_cutoff_for_user(request.user)
        latest_snapshots = []
        for host in hosts:
            queryset = host.snapshots.order_by("-created_at")
            if retention_cutoff is not None:
                queryset = queryset.filter(created_at__gte=retention_cutoff)
            latest_snapshots.append(queryset.first())

        return Response(
            {
                "devices_used": len(hosts),
                "device_limit": plan["host_limit"],
                "devices_remaining": max(plan["host_limit"] - len(hosts), 0),
                "retention_days": plan["retention_days"],
                "online_devices": sum(1 for host in hosts if host.is_online),
                "attention_devices": sum(
                    1 for host in hosts if host.latest_alert_level in {"warning", "critical"}
                ),
                "critical_devices": sum(
                    1 for host in hosts if host.latest_alert_level == "critical"
                ),
                "tracked_processes": sum(
                    (snapshot.total_processes if snapshot else 0) for snapshot in latest_snapshots
                ),
            }
        )


class SnapshotListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hostname = request.query_params.get("hostname")
        agent_id = request.query_params.get("agent_id")
        if not hostname and not agent_id:
            return Response(
                {"detail": "hostname or agent_id query param required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            limit = max(1, min(int(request.query_params.get("limit", 20)), 100))
        except ValueError:
            return Response(
                {"detail": "limit must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        host = _resolve_host_for_user(request.user, hostname=hostname, agent_id=agent_id)
        snapshots = host.snapshots.order_by("-created_at")
        retention_cutoff = _retention_cutoff_for_user(request.user)
        if retention_cutoff is not None:
            snapshots = snapshots.filter(created_at__gte=retention_cutoff)
        snapshots = snapshots[:limit]
        return Response(
            {
                "hostname": host.hostname,
                "agent_id": host.agent_id,
                "history": SnapshotHistorySerializer(snapshots, many=True).data,
            }
        )


class InventoryTimelineView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hostname = request.query_params.get("hostname")
        agent_id = request.query_params.get("agent_id")
        if not hostname and not agent_id:
            return Response(
                {"detail": "hostname or agent_id query param required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            limit = max(1, min(int(request.query_params.get("limit", 30)), 80))
        except ValueError:
            return Response(
                {"detail": "limit must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        host = _resolve_host_for_user(request.user, hostname=hostname, agent_id=agent_id)
        retention_cutoff = _retention_cutoff_for_user(request.user)
        events = host.events.order_by("-occurred_at", "-created_at")
        if retention_cutoff is not None:
            events = events.filter(occurred_at__gte=retention_cutoff)
        return Response(
            {
                "hostname": host.hostname,
                "agent_id": host.agent_id,
                "events": HostEventSerializer(events[:limit], many=True).data,
            }
        )


class SnapshotCompareView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hostname = request.query_params.get("hostname")
        agent_id = request.query_params.get("agent_id")
        if not hostname and not agent_id:
            return Response(
                {"detail": "hostname or agent_id query param required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        host = _resolve_host_for_user(request.user, hostname=hostname, agent_id=agent_id)
        snapshots = host.snapshots.order_by("-created_at")
        retention_cutoff = _retention_cutoff_for_user(request.user)
        if retention_cutoff is not None:
            snapshots = snapshots.filter(created_at__gte=retention_cutoff)

        left_id = request.query_params.get("left_id")
        right_id = request.query_params.get("right_id")
        if left_id and right_id:
            left_snapshot = get_object_or_404(snapshots, id=left_id)
            right_snapshot = get_object_or_404(snapshots, id=right_id)
        else:
            pair = list(snapshots[:2])
            if len(pair) < 2:
                return Response(
                    {"detail": "At least two snapshots are required for comparison."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            right_snapshot = pair[0]
            left_snapshot = pair[1]

        return Response(
            {
                "hostname": host.hostname,
                "agent_id": host.agent_id,
                **_compare_snapshots(left_snapshot, right_snapshot),
            }
        )


class SavedChecksView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        owner = get_workspace_owner(request.user)
        _ensure_saved_checks_for_user(owner)
        agent_id = request.query_params.get("agent_id")
        hostname = request.query_params.get("hostname")
        host = _resolve_host_for_user(request.user, hostname=hostname, agent_id=agent_id) if (agent_id or hostname) else None
        checks = SavedCheck.objects.filter(user=owner).order_by("category", "name")
        return Response(
            {
                "checks": SavedCheckSerializer(
                    checks,
                    many=True,
                    context={"host": host},
                ).data
            }
        )

    def post(self, request):
        owner = get_workspace_owner(request.user)
        serializer = SavedCheckUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        slug = _slugify_check_name(payload["name"])
        while SavedCheck.objects.filter(user=owner, slug=slug).exists():
            slug = f"{slug}-{secrets.token_hex(2)}"

        check = SavedCheck.objects.create(
            user=owner,
            name=payload["name"],
            slug=slug,
            description=payload.get("description") or "",
            category=payload["category"],
            severity=payload.get("severity") or SavedCheck.Severity.WARNING,
            enabled=payload.get("enabled", True),
            builtin=False,
            evaluator="custom_match",
            config=payload.get("config") or {},
        )
        return Response(SavedCheckSerializer(check).data, status=status.HTTP_201_CREATED)


class SavedCheckDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, check_id):
        owner = get_workspace_owner(request.user)
        check = get_object_or_404(SavedCheck, id=check_id, user=owner)
        serializer = SavedCheckUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        check.name = payload["name"]
        check.description = payload.get("description") or ""
        check.category = payload["category"]
        check.severity = payload.get("severity") or SavedCheck.Severity.WARNING
        check.enabled = payload.get("enabled", True)
        if not check.builtin:
            check.config = payload.get("config") or {}
        check.save()
        return Response(SavedCheckSerializer(check).data)


class SavedCheckResultsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        owner = get_workspace_owner(request.user)
        queryset = SavedCheckResult.objects.filter(host__owner=owner).select_related("saved_check", "host", "snapshot")

        agent_id = request.query_params.get("agent_id")
        hostname = request.query_params.get("hostname")
        if agent_id:
            queryset = queryset.filter(host__agent_id=agent_id)
        if hostname:
            queryset = queryset.filter(host__hostname=hostname)

        category = request.query_params.get("category")
        if category:
            queryset = queryset.filter(check__category=category)

        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        try:
            limit = max(1, min(int(request.query_params.get("limit", 80)), 200))
        except ValueError:
            return Response({"detail": "limit must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"results": SavedCheckResultSerializer(queryset.order_by("-created_at")[:limit], many=True).data})


class SavedCheckRunView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, check_id):
        owner = get_workspace_owner(request.user)
        check = get_object_or_404(SavedCheck, id=check_id, user=owner)
        host = _resolve_host_for_user(
            request.user,
            hostname=request.data.get("hostname"),
            agent_id=request.data.get("agent_id"),
        )
        snapshot = host.get_latest_snapshot()
        if snapshot is None:
            return Response({"detail": "No snapshot available for that host."}, status=status.HTTP_404_NOT_FOUND)
        rule_config = _rule_config_for_user(owner)
        status_value, summary, details = _evaluate_saved_check(check, snapshot, rule_config)
        result = SavedCheckResult.objects.create(
            saved_check=check,
            host=host,
            snapshot=snapshot,
            status=status_value,
            summary=summary,
            details=details,
        )
        return Response(SavedCheckResultSerializer(result).data, status=status.HTTP_201_CREATED)


class AgentActionsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = AgentAction.objects.filter(host__owner=get_workspace_owner(request.user)).select_related(
            "host",
            "requested_by",
            "snapshot",
            "alert",
        )
        agent_id = request.query_params.get("agent_id")
        if agent_id:
            queryset = queryset.filter(host__agent_id=agent_id)
        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        try:
            limit = max(1, min(int(request.query_params.get("limit", 50)), 120))
        except ValueError:
            return Response({"detail": "limit must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"actions": AgentActionSerializer(queryset.order_by("-created_at")[:limit], many=True).data})

    def post(self, request):
        serializer = AgentActionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        host = _resolve_host_for_user(request.user, agent_id=payload["agent_id"])
        action_kind = payload["kind"]
        parameters = payload.get("parameters") or {}
        alert = None
        if payload.get("alert_id"):
            alert = get_object_or_404(_alert_queryset_for_user(request.user), id=payload["alert_id"])

        if action_kind == AgentAction.Kind.TERMINATE_PROCESS and not parameters.get("pid"):
            return Response({"detail": "terminate_process requires a pid parameter."}, status=status.HTTP_400_BAD_REQUEST)
        if action_kind == AgentAction.Kind.LIVE_QUERY:
            live_query_payload = {"agent_id": payload["agent_id"], **parameters}
            live_query_serializer = LiveQueryRequestSerializer(data=live_query_payload)
            live_query_serializer.is_valid(raise_exception=True)
            parameters = {key: value for key, value in live_query_serializer.validated_data.items() if key != "agent_id"}

        action = AgentAction.objects.create(
            host=host,
            snapshot=host.get_latest_snapshot(),
            alert=alert,
            requested_by=request.user,
            kind=action_kind,
            note=payload.get("note") or "",
            parameters=parameters,
        )
        HostEvent.objects.create(
            host=host,
            snapshot=host.get_latest_snapshot(),
            category="response",
            kind="agent_action_queued",
            severity="info",
            title=f"Agent action queued: {action.kind}",
            subtitle=action.note or "",
            source="operator",
            metadata={"action_id": str(action.id), "parameters": parameters},
            occurred_at=timezone.now(),
        )
        return Response(AgentActionSerializer(action).data, status=status.HTTP_201_CREATED)


class AgentActionNextView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        agent_id = request.query_params.get("agent_id")
        host = _resolve_agent_host(agent_id, request.headers.get("X-API-Key"))
        if not host:
            return Response({"detail": "Invalid agent credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        action = (
            host.agent_actions.filter(status=AgentAction.Status.QUEUED)
            .order_by("created_at")
            .first()
        )
        if not action:
            return Response(status=status.HTTP_204_NO_CONTENT)

        action.status = AgentAction.Status.IN_PROGRESS
        action.started_at = timezone.now()
        action.save(update_fields=["status", "started_at", "updated_at"])
        return Response(AgentActionSerializer(action).data)


class AgentActionResultView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, action_id):
        serializer = AgentActionResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = get_object_or_404(AgentAction.objects.select_related("host"), id=action_id)
        host = _resolve_agent_host(action.host.agent_id, request.headers.get("X-API-Key"))
        if not host or host.id != action.host_id:
            return Response({"detail": "Invalid agent credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        action.status = serializer.validated_data["status"]
        action.result = serializer.validated_data.get("result") or {}
        if not action.started_at:
            action.started_at = timezone.now()
        if action.status in {
            AgentAction.Status.SUCCEEDED,
            AgentAction.Status.FAILED,
            AgentAction.Status.CANCELLED,
        }:
            action.completed_at = timezone.now()
        action.save(update_fields=["status", "result", "started_at", "completed_at", "updated_at"])

        severity = "info" if action.status == AgentAction.Status.SUCCEEDED else "warning"
        HostEvent.objects.create(
            host=action.host,
            snapshot=action.host.get_latest_snapshot(),
            category="response",
            kind=f"agent_action_{action.status}",
            severity=severity,
            title=f"Agent action {action.status}: {action.kind}",
            subtitle=action.note or "",
            source="agent",
            metadata={"action_id": str(action.id), "result": action.result},
            occurred_at=timezone.now(),
        )
        return Response(AgentActionSerializer(action).data)


class AlertsListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = _alert_queryset_for_user(request.user)

        status_filter = _normalize_alert_status_filters(request.query_params.get("status"))
        queryset = queryset.filter(status__in=status_filter)

        level = request.query_params.get("level")
        if level:
            levels = [value.strip() for value in level.split(",") if value.strip()]
            queryset = queryset.filter(level__in=levels)

        hostname = request.query_params.get("hostname")
        agent_id = request.query_params.get("agent_id")
        if hostname:
            queryset = queryset.filter(host__hostname=hostname)
        if agent_id:
            queryset = queryset.filter(host__agent_id=agent_id)

        search = request.query_params.get("q")
        if search:
            queryset = queryset.filter(
                Q(message__icontains=search)
                | Q(type__icontains=search)
                | Q(host__hostname__icontains=search)
                | Q(host__display_name__icontains=search)
            )

        ordering = request.query_params.get("ordering", "-last_seen_at")
        allowed_orderings = {
            "-last_seen_at",
            "last_seen_at",
            "-created_at",
            "created_at",
            "-level",
            "level",
        }
        queryset = queryset.order_by(ordering if ordering in allowed_orderings else "-last_seen_at")

        try:
            limit = max(1, min(int(request.query_params.get("limit", 100)), 250))
        except ValueError:
            return Response(
                {"detail": "limit must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        alerts = list(queryset[:limit])
        base_queryset = _alert_queryset_for_user(request.user)
        if hostname:
            base_queryset = base_queryset.filter(host__hostname=hostname)
        if agent_id:
            base_queryset = base_queryset.filter(host__agent_id=agent_id)

        counts = {
            "open": base_queryset.filter(status=Alert.Status.OPEN).count(),
            "acknowledged": base_queryset.filter(status=Alert.Status.ACKNOWLEDGED).count(),
            "muted": base_queryset.filter(status=Alert.Status.MUTED).count(),
            "resolved": base_queryset.filter(status=Alert.Status.RESOLVED).count(),
            "critical": base_queryset.filter(level="critical").count(),
            "warning": base_queryset.filter(level="warning").count(),
            "info": base_queryset.filter(level="info").count(),
        }

        return Response(
            {
                "alerts": AlertSerializer(alerts, many=True).data,
                "counts": counts,
            }
        )


class AlertDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, alert_id):
        alert = get_object_or_404(_alert_queryset_for_user(request.user), id=alert_id)
        return Response(AlertDetailSerializer(alert).data)


class AlertActionView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, alert_id):
        alert = get_object_or_404(_alert_queryset_for_user(request.user), id=alert_id)
        serializer = AlertActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["action"]
        note = (serializer.validated_data.get("note") or "").strip()
        mute_hours = serializer.validated_data.get("mute_hours")
        previous_status = alert.status
        now = timezone.now()

        if action == "acknowledge":
            alert.status = Alert.Status.ACKNOWLEDGED
            alert.acknowledged_at = now
            alert.acknowledged_by = request.user
        elif action == "mute":
            alert.status = Alert.Status.MUTED
            alert.muted_at = now
            alert.muted_by = request.user
            alert.muted_until = now + timedelta(hours=mute_hours) if mute_hours else None
        elif action == "unmute":
            alert.status = Alert.Status.OPEN
            alert.muted_until = None
        elif action == "resolve":
            alert.status = Alert.Status.RESOLVED
            alert.resolved_at = now
            alert.resolved_by = request.user
        elif action == "reopen":
            alert.status = Alert.Status.OPEN
            alert.resolved_at = None
            alert.resolved_by = None
            alert.muted_until = None
        elif action == "note":
            pass

        if note:
            alert.note = "\n\n".join(part for part in [alert.note.strip(), note] if part)

        alert.save()
        _create_audit_log(
            alert,
            action,
            actor=request.user,
            previous_status=previous_status,
            next_status=alert.status,
            note=note,
            metadata={"mute_hours": mute_hours} if mute_hours else {},
        )
        return Response(AlertDetailSerializer(alert).data)


class AlertRuleSettingsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings_obj, _ = AlertRuleSettings.objects.get_or_create(user=request.user)
        return Response(AlertRuleSettingsSerializer(settings_obj).data)

    def put(self, request):
        settings_obj, _ = AlertRuleSettings.objects.get_or_create(user=request.user)
        serializer = AlertRuleSettingsSerializer(settings_obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificationPreferenceView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        preference = get_notification_preference(request.user)
        return Response(NotificationPreferenceSerializer(preference).data)

    def put(self, request):
        preference = get_notification_preference(request.user)
        serializer = NotificationPreferenceSerializer(preference, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificationDeliveryListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = _delivery_queryset_for_user(request.user)
        alert_id = request.query_params.get("alert_id")
        if alert_id:
            queryset = queryset.filter(alert_id=alert_id)

        try:
            limit = max(1, min(int(request.query_params.get("limit", 50)), 100))
        except ValueError:
            return Response(
                {"detail": "limit must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deliveries = queryset.order_by("-created_at")[:limit]
        return Response(
            {"deliveries": NotificationDeliverySerializer(deliveries, many=True).data}
        )


class RotateHostKeyView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        admin_key = request.headers.get("X-Admin-Key")
        expected_admin_key = getattr(settings, "SUPER_ADMIN_KEY", "")
        if not admin_key or admin_key != expected_admin_key:
            return Response(
                {"detail": "Invalid admin key"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        hostname = request.data.get("hostname")
        if not hostname:
            return Response(
                {"detail": "hostname required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        host = get_object_or_404(Host, hostname=hostname)
        host.generate_api_key()
        host.save(update_fields=["api_key"])
        return Response({"hostname": host.hostname, "new_api_key": host.api_key})
