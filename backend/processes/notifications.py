import json
import hashlib
import hmac
import time
from urllib import error, request

from django.conf import settings
from django.core.mail import send_mail

from .models import NotificationDelivery, NotificationPreference


def get_notification_preference(user):
    preference, _ = NotificationPreference.objects.get_or_create(user=user)
    if not preference.email_address and user.email:
        preference.email_address = user.email
        preference.save(update_fields=["email_address", "updated_at"])
    return preference


def _severity_allowed(preference, alert):
    if alert.type in {"host_offline", "host_stale"} and not preference.notify_offline:
        return False
    if alert.level == "critical":
        return preference.notify_critical
    if alert.level == "warning":
        return preference.notify_warning
    return preference.notify_info


def _record_delivery(
    *,
    alert,
    channel,
    event_type,
    destination,
    status,
    response_code=None,
    response_excerpt="",
    error_message="",
    metadata=None,
):
    return NotificationDelivery.objects.create(
        alert=alert,
        host=alert.host,
        channel=channel,
        event_type=event_type,
        destination=destination,
        status=status,
        response_code=response_code,
        response_excerpt=response_excerpt[:2000],
        error_message=error_message[:2000],
        metadata=metadata or {},
    )


def _max_attempts():
    return max(1, int(getattr(settings, "HOSTLENS_NOTIFICATION_MAX_RETRIES", 0)) + 1)


def _backoff_seconds(attempt_index: int):
    base = float(getattr(settings, "HOSTLENS_NOTIFICATION_BACKOFF_SECONDS", 0.0))
    if base <= 0:
        return 0.0
    return base * (2 ** max(0, attempt_index - 1))


def _retryable_status_codes():
    raw = getattr(settings, "HOSTLENS_NOTIFICATION_RETRYABLE_STATUS_CODES", [])
    values = set()
    for item in raw:
        try:
            values.add(int(item))
        except (TypeError, ValueError):
            continue
    return values


def _delivery_confidence(success: bool, attempts: list[dict]):
    if not success:
        return "low"
    if len(attempts) == 1:
        return "high"
    return "medium"


def _sleep_before_retry(attempt_index: int):
    delay = _backoff_seconds(attempt_index)
    if delay > 0:
        time.sleep(delay)


def _headers_with_signature(payload_bytes: bytes, headers: dict | None = None):
    merged = dict(headers or {})
    secret = getattr(settings, "HOSTLENS_WEBHOOK_SIGNING_SECRET", "")
    if not secret:
        return merged
    timestamp = str(int(time.time()))
    signed_payload = timestamp.encode("utf-8") + b"." + payload_bytes
    signature = hmac.new(
        secret.encode("utf-8"),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()
    merged["X-HostLens-Timestamp"] = timestamp
    merged["X-HostLens-Signature"] = signature
    return merged


def _perform_delivery(send_callable):
    attempts = []
    retryable_codes = _retryable_status_codes()

    for attempt in range(1, _max_attempts() + 1):
        try:
            response_code, response_body = send_callable()
            ok = 200 <= response_code < 300
            attempts.append(
                {
                    "attempt": attempt,
                    "response_code": response_code,
                    "response_excerpt": response_body[:500],
                }
            )
            if ok:
                return {
                    "status": NotificationDelivery.Status.SUCCESS,
                    "response_code": response_code,
                    "response_excerpt": response_body,
                    "error_message": "",
                    "metadata": {
                        "attempt_count": len(attempts),
                        "attempts": attempts,
                        "delivery_confidence": _delivery_confidence(True, attempts),
                    },
                }
            if attempt < _max_attempts() and response_code in retryable_codes:
                _sleep_before_retry(attempt)
                continue
            return {
                "status": NotificationDelivery.Status.FAILED,
                "response_code": response_code,
                "response_excerpt": response_body,
                "error_message": f"Remote endpoint returned {response_code}",
                "metadata": {
                    "attempt_count": len(attempts),
                    "attempts": attempts,
                    "delivery_confidence": _delivery_confidence(False, attempts),
                },
            }
        except error.HTTPError as exc:
            response_excerpt = exc.read().decode("utf-8", errors="replace")
            attempts.append(
                {
                    "attempt": attempt,
                    "response_code": exc.code,
                    "response_excerpt": response_excerpt[:500],
                    "error": str(exc),
                }
            )
            if attempt < _max_attempts() and exc.code in retryable_codes:
                _sleep_before_retry(attempt)
                continue
            return {
                "status": NotificationDelivery.Status.FAILED,
                "response_code": exc.code,
                "response_excerpt": response_excerpt,
                "error_message": str(exc),
                "metadata": {
                    "attempt_count": len(attempts),
                    "attempts": attempts,
                    "delivery_confidence": _delivery_confidence(False, attempts),
                },
            }
        except Exception as exc:
            attempts.append(
                {
                    "attempt": attempt,
                    "error": str(exc),
                }
            )
            if attempt < _max_attempts():
                _sleep_before_retry(attempt)
                continue
            return {
                "status": NotificationDelivery.Status.FAILED,
                "response_code": None,
                "response_excerpt": "",
                "error_message": str(exc),
                "metadata": {
                    "attempt_count": len(attempts),
                    "attempts": attempts,
                    "delivery_confidence": _delivery_confidence(False, attempts),
                },
            }

    return {
        "status": NotificationDelivery.Status.FAILED,
        "response_code": None,
        "response_excerpt": "",
        "error_message": "Delivery exhausted all retry attempts.",
        "metadata": {
            "attempt_count": 0,
            "attempts": [],
            "delivery_confidence": "low",
        },
    }


def _alert_subject(alert, event_type):
    prefix = "Critical" if alert.level == "critical" else "Alert"
    return f"{prefix}: {alert.host.display_name or alert.host.hostname} · {event_type.replace('.', ' ')}"


def _alert_body(alert, event_type):
    return "\n".join(
        [
            f"Event: {event_type}",
            f"Host: {alert.host.display_name or alert.host.hostname}",
            f"Severity: {alert.level}",
            f"Status: {alert.status}",
            f"Type: {alert.type}",
            f"Message: {alert.message}",
            f"First seen: {alert.first_seen_at}",
            f"Last seen: {alert.last_seen_at}",
            f"Occurrences: {alert.occurrence_count}",
            f"Primary IP: {alert.host.primary_ip or 'n/a'}",
            f"Agent ID: {alert.host.agent_id or 'n/a'}",
        ]
    )


def _deliver_email(alert, preference, event_type):
    destination = preference.effective_email_address
    if not preference.email_enabled or not destination:
        return _record_delivery(
            alert=alert,
            channel=NotificationDelivery.Channel.EMAIL,
            event_type=event_type,
            destination=destination or "",
            status=NotificationDelivery.Status.SKIPPED,
            error_message="Email notifications are disabled or no email address is configured.",
        )

    result = _perform_delivery(
        lambda: (
            200,
            f"send_mail returned {send_mail(_alert_subject(alert, event_type), _alert_body(alert, event_type), settings.DEFAULT_FROM_EMAIL, [destination], fail_silently=False)}",
        )
    )
    return _record_delivery(
        alert=alert,
        channel=NotificationDelivery.Channel.EMAIL,
        event_type=event_type,
        destination=destination,
        status=result["status"],
        response_code=result["response_code"],
        response_excerpt=result["response_excerpt"],
        error_message=result["error_message"],
        metadata=result["metadata"],
    )


def _post_json(url, payload, headers=None):
    body = json.dumps(payload).encode("utf-8")
    http_request = request.Request(
        url,
        data=body,
        headers=_headers_with_signature(body, {"Content-Type": "application/json", **(headers or {})}),
        method="POST",
    )
    with request.urlopen(
        http_request,
        timeout=settings.HOSTLENS_NOTIFICATION_TIMEOUT_SECONDS,
    ) as response:
        return response.getcode(), response.read().decode("utf-8", errors="replace")


def _deliver_slack(alert, preference, event_type):
    destination = preference.slack_webhook_url
    if not preference.slack_enabled or not destination:
        return _record_delivery(
            alert=alert,
            channel=NotificationDelivery.Channel.SLACK,
            event_type=event_type,
            destination=destination or "",
            status=NotificationDelivery.Status.SKIPPED,
            error_message="Slack notifications are disabled or the webhook URL is missing.",
        )

    payload = {
        "text": f"[{alert.level.upper()}] {alert.host.display_name or alert.host.hostname}: {alert.message}",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"*HostLens {event_type.replace('.', ' ')}*\n"
                        f"*Host:* {alert.host.display_name or alert.host.hostname}\n"
                        f"*Severity:* {alert.level}\n"
                        f"*Status:* {alert.status}\n"
                        f"*Message:* {alert.message}"
                    ),
                },
            }
        ],
    }

    result = _perform_delivery(lambda: _post_json(destination, payload))
    return _record_delivery(
        alert=alert,
        channel=NotificationDelivery.Channel.SLACK,
        event_type=event_type,
        destination=destination,
        status=result["status"],
        response_code=result["response_code"],
        response_excerpt=result["response_excerpt"],
        error_message=result["error_message"],
        metadata=result["metadata"],
    )


def _deliver_webhook(alert, preference, event_type):
    destination = preference.webhook_url
    if not preference.webhook_enabled or not destination:
        return _record_delivery(
            alert=alert,
            channel=NotificationDelivery.Channel.WEBHOOK,
            event_type=event_type,
            destination=destination or "",
            status=NotificationDelivery.Status.SKIPPED,
            error_message="Webhook notifications are disabled or the webhook URL is missing.",
        )

    payload = {
        "event": event_type,
        "alert": {
            "id": str(alert.id),
            "fingerprint": alert.fingerprint,
            "level": alert.level,
            "status": alert.status,
            "type": alert.type,
            "message": alert.message,
            "first_seen_at": alert.first_seen_at.isoformat(),
            "last_seen_at": alert.last_seen_at.isoformat(),
            "occurrence_count": alert.occurrence_count,
            "note": alert.note,
            "metadata": alert.metadata,
        },
        "host": {
            "agent_id": alert.host.agent_id,
            "hostname": alert.host.hostname,
            "display_name": alert.host.display_name,
            "primary_ip": alert.host.primary_ip,
            "status": alert.host.status,
            "risk_score": alert.host.risk_score,
            "latest_alert_level": alert.host.latest_alert_level,
        },
    }

    result = _perform_delivery(
        lambda: _post_json(
            destination,
            payload,
            headers={"User-Agent": "HostLens-Webhook/1.0"},
        )
    )
    return _record_delivery(
        alert=alert,
        channel=NotificationDelivery.Channel.WEBHOOK,
        event_type=event_type,
        destination=destination,
        status=result["status"],
        response_code=result["response_code"],
        response_excerpt=result["response_excerpt"],
        error_message=result["error_message"],
        metadata=result["metadata"],
    )


def deliver_notification_channel(alert, preference, event_type, channel):
    if channel == NotificationDelivery.Channel.EMAIL:
        return _deliver_email(alert, preference, event_type)
    if channel == NotificationDelivery.Channel.SLACK:
        return _deliver_slack(alert, preference, event_type)
    if channel == NotificationDelivery.Channel.WEBHOOK:
        return _deliver_webhook(alert, preference, event_type)
    raise ValueError(f"Unsupported notification channel: {channel}")


def dispatch_alert_notifications(alert, event_type):
    owner = alert.host.owner
    if not owner:
        return []

    preference = get_notification_preference(owner)
    if not _severity_allowed(preference, alert):
        return [
            _record_delivery(
                alert=alert,
                channel=NotificationDelivery.Channel.EMAIL,
                event_type=event_type,
                destination=preference.effective_email_address or "",
                status=NotificationDelivery.Status.SKIPPED,
                error_message="Severity is disabled in notification preferences.",
            )
        ]

    deliveries = [
        deliver_notification_channel(alert, preference, event_type, NotificationDelivery.Channel.EMAIL),
        deliver_notification_channel(alert, preference, event_type, NotificationDelivery.Channel.SLACK),
        deliver_notification_channel(alert, preference, event_type, NotificationDelivery.Channel.WEBHOOK),
    ]
    return deliveries
