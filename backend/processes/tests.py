from datetime import timedelta
from unittest.mock import patch

from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient

from auth_system.models import TeamInvite

from .models import (
    AgentAction,
    Alert,
    AlertRuleSettings,
    Host,
    NotificationDelivery,
    NotificationPreference,
    SavedCheck,
    Snapshot,
)


def build_payload(process_count=2):
    processes = []
    for index in range(process_count):
        processes.append(
            {
                "pid": 100 + index,
                "ppid": 1,
                "name": f"process-{index}",
                "cpu_percent": 10.0 + index,
                "memory_mb": 128.0 + index,
                "status": "running",
                "username": "tester",
                "cmdline": f"/usr/bin/process-{index}",
                "exe_path": f"/usr/bin/process-{index}",
                "started_at": f"2026-04-01T12:0{index}:00Z",
            }
        )

    return {
        "agent_id": "agent-test-host-001",
        "hostname": "test-host.local",
        "device_type": "desktop",
        "agent_version": "0.3.0",
        "os_name": "Darwin",
        "os_version": "25.4.0",
        "architecture": "arm64",
        "primary_ip": "192.168.1.40",
        "cpu_count": 8,
        "total_memory_mb": 16384,
        "total_disk_gb": 512,
        "cpu_percent": 45.5,
        "memory_percent": 55.5,
        "disk_percent": 30.0,
        "network_sent_mb": 120.5,
        "network_recv_mb": 300.25,
        "load_one": 1.2,
        "load_five": 0.8,
        "load_fifteen": 0.6,
        "uptime_seconds": 1234,
        "active_user_count": 1,
        "listening_ports": [22, 443],
        "network_connections": [
            {
                "pid": 100,
                "process_name": "process-0",
                "protocol": "tcp",
                "status": "LISTEN",
                "local_address": "0.0.0.0",
                "local_port": 443,
                "remote_address": "",
                "remote_port": 0,
                "family": "ipv4",
                "remote_scope": "none",
                "service_label": "https",
                "tls_suspected": True,
                "security_hint": "local-only",
            },
            {
                "pid": 101,
                "process_name": "process-1",
                "protocol": "tcp",
                "status": "ESTABLISHED",
                "local_address": "192.168.1.40",
                "local_port": 51742,
                "remote_address": "104.18.32.44",
                "remote_port": 443,
                "family": "ipv4",
                "direction": "egress",
                "remote_domain": "example.com",
                "remote_scope": "public",
                "service_label": "https",
                "tls_suspected": True,
                "security_hint": "encrypted",
            },
        ],
        "network_events": [
            {
                "pid": 101,
                "process_name": "process-1",
                "protocol": "tcp",
                "status": "ESTABLISHED",
                "local_address": "192.168.1.40",
                "local_port": 51742,
                "remote_address": "104.18.32.44",
                "remote_port": 443,
                "remote_domain": "example.com",
                "remote_scope": "public",
                "service_label": "https",
                "tls_suspected": True,
                "security_hint": "encrypted",
                "direction": "egress",
                "family": "ipv4",
                "event_type": "opened",
                "occurred_at": "2026-04-01T12:04:30Z",
            }
        ],
        "dns_events": [
            {
                "query": "api.example.com",
                "record_type": "A",
                "process": "process-1",
                "pid": 101,
                "answers": ["104.18.32.44"],
                "status": "observed",
                "source": "unified-log",
                "occurred_at": "2026-04-01T12:04:00Z",
            }
        ],
        "startup_items": [
            {
                "name": "com.example.sync.plist",
                "type": "launchd",
                "scope": "user",
                "location": "/Users/test/Library/LaunchAgents/com.example.sync.plist",
                "command": "",
                "publisher": "",
            }
        ],
        "service_inventory": [
            {
                "name": "com.example.sync",
                "display_name": "Example Sync",
                "manager": "launchd",
                "scope": "user",
                "state": "running",
                "sub_state": "loaded",
                "startup_type": "launchd",
                "status": "0",
                "executable": "/Applications/Example Sync.app/Contents/MacOS/Example Sync",
                "username": "tester",
                "pid": 100,
                "exit_code": "",
                "unit_file_state": "loaded",
            }
        ],
        "software_inventory": [
            {
                "name": "Google Chrome",
                "identifier": "com.google.Chrome",
                "version": "146.0.7680.165",
                "publisher": "Developer ID Application: Google LLC (EQHXZ8M8AV)",
                "install_path": "/Applications/Google Chrome.app",
                "install_scope": "system",
                "install_source": "app_bundle",
                "executable_path": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "signature_state": "trusted",
                "signer": "Developer ID Application: Google LLC (EQHXZ8M8AV)",
                "team_identifier": "EQHXZ8M8AV",
                "sha256": "chrome-demo-sha",
            }
        ],
        "user_sessions": [
            {
                "username": "tester",
                "terminal": "console",
                "host": "",
                "started_at": "2026-04-01T12:00:00Z",
                "remote": False,
                "type": "console",
            }
        ],
        "file_integrity_items": [
            {
                "path": "/Users/test/.zshrc",
                "category": "shell_profile",
                "modified_at": "2026-04-01T12:00:00Z",
                "size_bytes": 512,
                "sha256": "zshrc-sha-demo",
                "mode": "0o644",
            }
        ],
        "file_events": [
            {
                "path": "/Users/test/.zshrc",
                "category": "shell_profile",
                "action": "modified",
                "occurred_at": "2026-04-01T12:05:00Z",
                "sha256": "zshrc-sha-demo",
                "mode": "0o644",
            }
        ],
        "auth_events": [
            {
                "username": "tester",
                "terminal": "console",
                "source": "",
                "occurred_at": "Thu Apr 1 12:00",
                "event_type": "login_session",
                "status": "active",
                "summary": "tester console Thu Apr 1 12:00 still logged in",
                "source_ip": "",
                "method": "session_history",
                "event_id": "",
                "session": "console",
            }
        ],
        "process_events": [
            {
                "pid": 100,
                "ppid": 1,
                "name": "process-0",
                "parent_name": "launchd",
                "username": "tester",
                "cmdline": "/usr/bin/process-0",
                "exe_path": "/usr/bin/process-0",
                "event_type": "started",
                "occurred_at": "2026-04-01T12:03:00Z",
                "started_at": "2026-04-01T12:00:00Z",
                "session_type": "local",
            }
        ],
        "security_posture": {
            "mode": "darwin-userspace-active",
            "firewall_state": "enabled",
            "disk_encryption_state": "enabled",
            "antivirus_state": "not_detected",
            "mdm_state": "not_enrolled",
            "gatekeeper_state": "enabled",
            "sip_state": "enabled",
            "collector_mode": "darwin-userspace-active",
            "collector_capabilities": [
                {
                    "name": "endpoint-security",
                    "layer": "kernel-bridge",
                    "state": "available",
                    "detail": "Privileged helper can be attached",
                }
            ],
            "browser_extensions": [],
            "system_extensions": [],
            "usb_devices": [],
        },
        "collector_sources": ["gopsutil", "fsnotify", "darwin-unified-log"],
        "processes": processes,
    }


def build_alert_payload():
    payload = build_payload(process_count=3)
    payload["cpu_percent"] = 91.5
    payload["memory_percent"] = 96.0
    payload["disk_percent"] = 94.3
    payload["active_user_count"] = 3
    payload["listening_ports"] = [22, 80, 443, 8080, 3000, 5432, 6379, 9000, 9090, 9200, 9300]
    payload["processes"][0]["name"] = "nmap"
    payload["processes"][0]["cpu_percent"] = 77.0
    payload["processes"][0]["memory_mb"] = 2048.0
    payload["processes"][0]["cmdline"] = "/usr/bin/nmap -sV localhost"
    return payload


@override_settings(PROC_MONITOR_API_KEY="global-key", SUPER_ADMIN_KEY="admin-key")
class ProcessApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="strong-pass-123",
        )

    def test_ingest_onboards_host_and_returns_host_key(self):
        response = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Host.objects.count(), 1)
        self.assertEqual(Snapshot.objects.count(), 1)
        self.assertIn("host_api_key", response.data)
        self.assertEqual(response.data["hostname"], "test-host.local")
        self.assertEqual(response.data["agent_id"], "agent-test-host-001")
        self.assertEqual(response.data["total_processes"], 2)
        self.assertEqual(len(response.data["network_connections"]), 2)
        self.assertEqual(len(response.data["network_events"]), 1)
        self.assertEqual(len(response.data["dns_events"]), 1)
        self.assertEqual(len(response.data["startup_items"]), 1)
        self.assertEqual(len(response.data["service_inventory"]), 1)
        self.assertEqual(len(response.data["software_inventory"]), 1)
        self.assertEqual(len(response.data["user_sessions"]), 1)
        self.assertEqual(len(response.data["file_integrity_items"]), 1)
        self.assertEqual(len(response.data["file_events"]), 1)
        self.assertEqual(len(response.data["auth_events"]), 1)
        self.assertEqual(len(response.data["process_events"]), 1)
        self.assertEqual(response.data["security_posture"]["firewall_state"], "enabled")
        self.assertEqual(len(response.data["security_posture"]["collector_capabilities"]), 1)
        self.assertEqual(len(response.data["collector_sources"]), 3)

    def test_latest_and_history_return_snapshot_data(self):
        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(hostname="test-host.local")
        host.owner = self.user
        host.save(update_fields=["owner"])
        self.client.force_authenticate(user=self.user)

        latest = self.client.get(
            "/api/v1/process-snapshots/latest/",
            {"agent_id": "agent-test-host-001"},
        )
        history = self.client.get(
            "/api/v1/process-snapshots/history/",
            {"agent_id": "agent-test-host-001", "limit": 5},
        )

        self.assertEqual(latest.status_code, 200)
        self.assertEqual(history.status_code, 200)
        self.assertEqual(latest.data["hostname"], "test-host.local")
        self.assertEqual(len(latest.data["software_inventory"]), 1)
        self.assertEqual(len(latest.data["user_sessions"]), 1)
        self.assertEqual(len(latest.data["file_integrity_items"]), 1)
        self.assertEqual(len(latest.data["file_events"]), 1)
        self.assertEqual(len(latest.data["auth_events"]), 1)
        self.assertEqual(len(latest.data["network_events"]), 1)
        self.assertEqual(len(latest.data["security_posture"]["collector_capabilities"]), 1)
        self.assertEqual(len(history.data["history"]), 1)

    def test_fleet_summary_returns_plan_capacity(self):
        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])
        self.user.account_profile.requested_plan = "pro"
        self.user.account_profile.active_plan = "pro"
        self.user.account_profile.billing_status = "active"
        self.user.account_profile.save(update_fields=["requested_plan", "active_plan", "billing_status", "updated_at"])
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/fleet/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["device_limit"], 8)
        self.assertEqual(response.data["devices_used"], 1)

    def test_hosts_endpoint_requires_authenticated_owner(self):
        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(hostname="test-host.local")
        host.owner = self.user
        host.save(update_fields=["owner"])

        anonymous = self.client.get("/api/v1/hosts/")
        self.client.force_authenticate(user=self.user)
        authenticated = self.client.get("/api/v1/hosts/")

        self.assertEqual(anonymous.status_code, 401)
        self.assertEqual(authenticated.status_code, 200)
        self.assertEqual(len(authenticated.data["hosts"]), 1)

    def test_team_member_can_view_workspace_hosts(self):
        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(hostname="test-host.local")
        host.owner = self.user
        host.save(update_fields=["owner"])

        self.user.account_profile.active_plan = "team"
        self.user.account_profile.billing_status = "active"
        self.user.account_profile.save(update_fields=["active_plan", "billing_status", "updated_at"])

        teammate = User.objects.create_user(
            username="teammate",
            email="teammate@example.com",
            password="strong-pass-123",
        )

        self.client.force_authenticate(user=self.user)
        self.client.get("/api/v1/auth/team-workspace/")
        invite_response = self.client.post(
            "/api/v1/auth/team-invites/",
            {"email": "teammate@example.com", "role": "viewer"},
            format="json",
        )
        invite = TeamInvite.objects.get(id=invite_response.data["id"])

        self.client.force_authenticate(user=teammate)
        self.client.post(
            "/api/v1/auth/team-invites/accept/",
            {"token": invite.token},
            format="json",
        )

        response = self.client.get("/api/v1/hosts/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["hosts"]), 1)
        self.assertEqual(response.data["hosts"][0]["hostname"], "test-host.local")

    def test_invalid_host_key_is_rejected_after_onboarding(self):
        first = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host_key = first.data["host_api_key"]

        accepted = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY=host_key,
        )
        rejected = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="wrong-key",
        )

        self.assertEqual(accepted.status_code, 201)
        self.assertEqual(rejected.status_code, 401)

    @override_settings(MAX_PROCESSES_PER_SNAPSHOT=1)
    def test_ingest_rejects_payload_above_process_limit(self):
        response = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(process_count=2),
            format="json",
            HTTP_X_API_KEY="global-key",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("processes", response.data)

    def test_rotate_key_requires_admin_key(self):
        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )

        unauthorized = self.client.post(
            "/api/v1/hosts/rotate-key/",
            {"hostname": "test-host.local"},
            format="json",
            HTTP_X_ADMIN_KEY="wrong-admin",
        )
        authorized = self.client.post(
            "/api/v1/hosts/rotate-key/",
            {"hostname": "test-host.local"},
            format="json",
            HTTP_X_ADMIN_KEY="admin-key",
        )

        self.assertEqual(unauthorized.status_code, 401)
        self.assertEqual(authorized.status_code, 200)
        self.assertIn("new_api_key", authorized.data)

    def test_ingest_with_onboarding_key_auto_assigns_owner(self):
        self.user.account_profile.ensure_onboarding_api_key()
        self.user.account_profile.save(update_fields=["onboarding_api_key", "updated_at"])

        response = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY=self.user.account_profile.onboarding_api_key,
        )

        host = Host.objects.get(agent_id="agent-test-host-001")
        self.user.account_profile.refresh_from_db()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(host.owner_id, self.user.id)
        self.assertTrue(self.user.account_profile.onboarding_completed)
        self.assertNotEqual(response.data["host_api_key"], self.user.account_profile.onboarding_api_key)

    def test_onboarding_ingest_enforces_active_plan_limit(self):
        self.user.account_profile.ensure_onboarding_api_key()
        self.user.account_profile.save(update_fields=["onboarding_api_key", "updated_at"])

        Host.objects.create(agent_id="agent-1", hostname="one.local", api_key="1" * 64, owner=self.user)
        Host.objects.create(agent_id="agent-2", hostname="two.local", api_key="2" * 64, owner=self.user)

        response = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY=self.user.account_profile.onboarding_api_key,
        )

        self.assertEqual(response.status_code, 402)
        self.assertIn("supports up to 2 devices", response.data["detail"])

    def test_history_respects_retention_window(self):
        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])

        old_snapshot = host.snapshots.order_by("-created_at").first()
        old_snapshot.created_at = timezone.now() - timedelta(days=2)
        old_snapshot.save(update_fields=["created_at"])

        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY=host.api_key,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/v1/process-snapshots/history/",
            {"agent_id": "agent-test-host-001", "limit": 12},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["history"]), 1)

    def test_alerts_endpoint_returns_persistent_alerts(self):
        ingest = self.client.post(
            "/api/v1/process-snapshots/",
            build_alert_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/v1/alerts/")

        self.assertEqual(ingest.status_code, 201)
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.data["alerts"]), 0)
        self.assertGreater(Alert.objects.count(), 0)
        self.assertIn("status", response.data["alerts"][0])

    def test_alert_action_updates_status_and_audit_trail(self):
        first = self.client.post(
            "/api/v1/process-snapshots/",
            build_alert_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])
        self.client.force_authenticate(user=self.user)

        alert_id = first.data["alerts"][0]["id"]
        acknowledge = self.client.post(
            f"/api/v1/alerts/{alert_id}/actions/",
            {"action": "acknowledge", "note": "Expected during local scan."},
            format="json",
        )
        detail = self.client.get(f"/api/v1/alerts/{alert_id}/")

        self.assertEqual(acknowledge.status_code, 200)
        self.assertEqual(acknowledge.data["status"], "acknowledged")
        self.assertIn("Expected during local scan.", acknowledge.data["note"])
        self.assertEqual(detail.status_code, 200)
        self.assertGreaterEqual(len(detail.data["audit_logs"]), 2)

    def test_alert_auto_resolves_when_signal_disappears(self):
        first = self.client.post(
            "/api/v1/process-snapshots/",
            build_alert_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])

        second = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY=first.data["host_api_key"],
        )

        self.client.force_authenticate(user=self.user)
        resolved = self.client.get("/api/v1/alerts/", {"status": "resolved"})

        self.assertEqual(second.status_code, 201)
        self.assertEqual(resolved.status_code, 200)
        self.assertGreaterEqual(resolved.data["counts"]["resolved"], 1)

    def test_new_software_unsigned_software_and_remote_session_alerts_are_created(self):
        baseline = build_payload()
        baseline["software_inventory"] = [
            {
                "name": "Google Chrome",
                "identifier": "com.google.Chrome",
                "version": "146.0.7680.165",
                "publisher": "Developer ID Application: Google LLC (EQHXZ8M8AV)",
                "install_path": "/Applications/Google Chrome.app",
                "install_scope": "system",
                "install_source": "app_bundle",
                "executable_path": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "signature_state": "trusted",
                "signer": "Developer ID Application: Google LLC (EQHXZ8M8AV)",
                "team_identifier": "EQHXZ8M8AV",
                "sha256": "chrome-demo-sha",
            }
        ]
        baseline["user_sessions"] = [
            {
                "username": "tester",
                "terminal": "console",
                "host": "",
                "started_at": "2026-04-01T12:00:00Z",
                "remote": False,
            }
        ]
        first = self.client.post(
            "/api/v1/process-snapshots/",
            baseline,
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])

        updated = build_payload()
        updated["software_inventory"] = baseline["software_inventory"] + [
            {
                "name": "Suspicious Helper",
                "identifier": "local.suspicious.helper",
                "version": "0.1.0",
                "publisher": "",
                "install_path": "/Applications/Suspicious Helper.app",
                "install_scope": "system",
                "install_source": "app_bundle",
                "executable_path": "/Applications/Suspicious Helper.app/Contents/MacOS/Suspicious Helper",
                "signature_state": "unsigned",
                "signer": "",
                "team_identifier": "",
                "sha256": "unsigned-demo-sha",
            }
        ]
        updated["startup_items"] = baseline["startup_items"] + [
            {
                "name": "com.example.persistence.plist",
                "type": "launchd",
                "scope": "system",
                "location": "/Library/LaunchDaemons/com.example.persistence.plist",
                "command": "",
                "publisher": "",
            }
        ]
        updated["user_sessions"] = [
            {
                "username": "tester",
                "terminal": "ttys000",
                "host": "10.10.0.25",
                "started_at": "2026-04-01T12:30:00Z",
                "remote": True,
            }
        ]

        second = self.client.post(
            "/api/v1/process-snapshots/",
            updated,
            format="json",
            HTTP_X_API_KEY=first.data["host_api_key"],
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/v1/alerts/", {"status": "all"})

        alert_types = {alert["type"] for alert in response.data["alerts"]}

        self.assertEqual(second.status_code, 201)
        self.assertEqual(response.status_code, 200)
        self.assertIn("new_software", alert_types)
        self.assertIn("unsigned_software", alert_types)
        self.assertIn("startup_drift", alert_types)
        self.assertIn("remote_session", alert_types)

    def test_file_integrity_and_auth_event_alerts_are_created(self):
        baseline = build_payload()
        first = self.client.post(
            "/api/v1/process-snapshots/",
            baseline,
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])

        changed = build_payload()
        changed["file_integrity_items"] = [
            {
                "path": "/Users/test/.zshrc",
                "category": "shell_profile",
                "modified_at": "2026-04-01T13:00:00Z",
                "size_bytes": 768,
                "sha256": "zshrc-sha-demo-updated",
                "mode": "0o600",
            },
            {
                "path": "/Users/test/.ssh/authorized_keys",
                "category": "ssh_config",
                "modified_at": "2026-04-01T13:05:00Z",
                "size_bytes": 256,
                "sha256": "authorized-keys-sha",
                "mode": "0o600",
            },
        ]
        changed["auth_events"] = baseline["auth_events"] + [
            {
                "username": "tester",
                "terminal": "ttys000",
                "source": "10.0.0.10",
                "occurred_at": "Thu Apr 1 13:10",
                "event_type": "login_session",
                "status": "active",
                "summary": "tester ttys000 10.0.0.10 Thu Apr 1 13:10 still logged in",
            }
        ]

        second = self.client.post(
            "/api/v1/process-snapshots/",
            changed,
            format="json",
            HTTP_X_API_KEY=first.data["host_api_key"],
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/v1/alerts/", {"status": "all"})

        alert_types = {alert["type"] for alert in response.data["alerts"]}

        self.assertEqual(second.status_code, 201)
        self.assertEqual(response.status_code, 200)
        self.assertIn("file_integrity_changed", alert_types)
        self.assertIn("file_integrity_new", alert_types)
        self.assertIn("auth_event", alert_types)

    def test_inventory_timeline_returns_drift_events(self):
        first = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])

        changed = build_payload()
        changed["software_inventory"] = build_payload()["software_inventory"] + [
            {
                "name": "Suspicious Helper",
                "identifier": "local.suspicious.helper",
                "version": "0.1.0",
                "publisher": "",
                "install_path": "/Applications/Suspicious Helper.app",
                "install_scope": "system",
                "install_source": "app_bundle",
                "executable_path": "/Applications/Suspicious Helper.app/Contents/MacOS/Suspicious Helper",
                "signature_state": "unsigned",
                "signer": "",
                "team_identifier": "",
                "sha256": "unsigned-demo-sha",
            }
        ]
        changed["file_integrity_items"] = [
            {
                "path": "/Users/test/.zshrc",
                "category": "shell_profile",
                "modified_at": "2026-04-01T13:00:00Z",
                "size_bytes": 768,
                "sha256": "zshrc-sha-demo-updated",
                "mode": "0o600",
            }
        ]
        changed["auth_events"] = build_payload()["auth_events"] + [
            {
                "username": "tester",
                "terminal": "ttys000",
                "source": "10.0.0.10",
                "occurred_at": "Thu Apr 1 13:10",
                "event_type": "login_session",
                "status": "active",
                "summary": "tester ttys000 10.0.0.10 Thu Apr 1 13:10 still logged in",
            }
        ]

        self.client.post(
            "/api/v1/process-snapshots/",
            changed,
            format="json",
            HTTP_X_API_KEY=first.data["host_api_key"],
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/v1/process-snapshots/inventory-timeline/",
            {"agent_id": "agent-test-host-001", "limit": 20},
        )

        event_kinds = {event["kind"] for event in response.data["events"]}

        self.assertEqual(response.status_code, 200)
        self.assertIn("software_added", event_kinds)
        self.assertIn("file_changed", event_kinds)
        self.assertIn("auth_event", event_kinds)

    def test_compare_endpoint_returns_snapshot_diff(self):
        first = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.save(update_fields=["owner"])

        changed = build_payload(process_count=3)
        changed["software_inventory"] = build_payload()["software_inventory"] + [
            {
                "name": "Suspicious Helper",
                "identifier": "local.suspicious.helper",
                "version": "0.1.0",
                "publisher": "",
                "install_path": "/Applications/Suspicious Helper.app",
                "install_scope": "system",
                "install_source": "app_bundle",
                "executable_path": "/Applications/Suspicious Helper.app/Contents/MacOS/Suspicious Helper",
                "signature_state": "unsigned",
                "signer": "",
                "team_identifier": "",
                "sha256": "unsigned-demo-sha",
            }
        ]
        self.client.post(
            "/api/v1/process-snapshots/",
            changed,
            format="json",
            HTTP_X_API_KEY=first.data["host_api_key"],
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/v1/process-snapshots/compare/",
            {"agent_id": "agent-test-host-001"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["metrics"]["process_count_delta"], 1)
        self.assertIn("new", response.data["processes"])
        self.assertIn("software", response.data)

    def test_alert_rule_settings_can_be_updated(self):
        self.client.force_authenticate(user=self.user)

        read = self.client.get("/api/v1/alerts/rules/")
        write = self.client.put(
            "/api/v1/alerts/rules/",
            {
                **read.data,
                "cpu_warning_threshold": 70,
                "cpu_critical_threshold": 90,
                "watchlist_enabled": False,
                "new_software_tracking_enabled": False,
            },
            format="json",
        )

        self.assertEqual(read.status_code, 200)
        self.assertEqual(write.status_code, 200)
        self.assertEqual(write.data["cpu_warning_threshold"], 70)
        self.assertFalse(write.data["watchlist_enabled"])
        self.assertFalse(write.data["new_software_tracking_enabled"])
        self.assertEqual(AlertRuleSettings.objects.get(user=self.user).cpu_critical_threshold, 90)

    def test_notification_preferences_can_be_updated(self):
        self.client.force_authenticate(user=self.user)

        read = self.client.get("/api/v1/alerts/notifications/preferences/")
        write = self.client.put(
            "/api/v1/alerts/notifications/preferences/",
            {
                **read.data,
                "email_enabled": True,
                "email_address": "secops@example.com",
                "slack_enabled": True,
                "slack_webhook_url": "https://hooks.slack.test/services/demo",
                "notify_info": True,
            },
            format="json",
        )

        self.assertEqual(read.status_code, 200)
        self.assertEqual(write.status_code, 200)
        self.assertEqual(write.data["email_address"], "secops@example.com")
        self.assertTrue(write.data["slack_enabled"])
        self.assertTrue(NotificationPreference.objects.get(user=self.user).notify_info)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_alert_creation_sends_email_and_records_delivery(self):
        self.user.account_profile.ensure_onboarding_api_key()
        self.user.account_profile.save(update_fields=["onboarding_api_key", "updated_at"])

        preference, _ = NotificationPreference.objects.get_or_create(user=self.user)
        preference.email_enabled = True
        preference.email_address = "owner@example.com"
        preference.notify_info = True
        preference.save()

        response = self.client.post(
            "/api/v1/process-snapshots/",
            build_alert_payload(),
            format="json",
            HTTP_X_API_KEY=self.user.account_profile.onboarding_api_key,
        )

        self.assertEqual(response.status_code, 201)
        self.assertGreaterEqual(len(mail.outbox), 1)
        self.assertGreaterEqual(NotificationDelivery.objects.filter(status="success").count(), 1)

    @override_settings(
        HOSTLENS_NOTIFICATION_MAX_RETRIES=2,
        HOSTLENS_NOTIFICATION_BACKOFF_SECONDS=0,
        HOSTLENS_WEBHOOK_SIGNING_SECRET="whsec_hostlens_test",
    )
    @patch("processes.notifications._post_json")
    def test_webhook_delivery_retries_and_records_confidence(self, post_json):
        self.user.account_profile.ensure_onboarding_api_key()
        self.user.account_profile.save(update_fields=["onboarding_api_key", "updated_at"])

        preference, _ = NotificationPreference.objects.get_or_create(user=self.user)
        preference.email_enabled = False
        preference.slack_enabled = False
        preference.webhook_enabled = True
        preference.webhook_url = "https://hooks.hostlens.test/alerts"
        preference.save()

        attempts = {"count": 0}

        def flaky_webhook(*_args, **_kwargs):
            attempts["count"] += 1
            if attempts["count"] == 1:
                raise Exception("temporary failure")
            return (200, "ok")

        post_json.side_effect = flaky_webhook

        response = self.client.post(
            "/api/v1/process-snapshots/",
            build_alert_payload(),
            format="json",
            HTTP_X_API_KEY=self.user.account_profile.onboarding_api_key,
        )

        self.assertEqual(response.status_code, 201)
        delivery = NotificationDelivery.objects.filter(
            channel="webhook",
            status="success",
        ).latest("created_at")
        self.assertEqual(delivery.status, "success")
        self.assertGreaterEqual(delivery.metadata["attempt_count"], 1)
        self.assertIn(delivery.metadata["delivery_confidence"], {"high", "medium"})
        self.assertGreaterEqual(attempts["count"], 2)

    def test_host_health_command_creates_offline_alert(self):
        self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY="global-key",
        )
        host = Host.objects.get(agent_id="agent-test-host-001")
        host.owner = self.user
        host.last_seen = timezone.now() - timedelta(minutes=10)
        host.save(update_fields=["owner", "last_seen"])

        call_command("check_host_health")

        host.refresh_from_db()
        offline_alert = Alert.objects.get(host=host, fingerprint="host_connectivity")
        self.assertEqual(offline_alert.type, "host_offline")
        self.assertEqual(offline_alert.level, "critical")
        self.assertEqual(host.status, Host.HostStatus.OFFLINE)

    def test_mobile_heartbeat_creates_mobile_host_snapshot(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/v1/mobile/heartbeat/",
            {
                "device_id": "ios-device-001",
                "hostname": "Avinash iPhone",
                "platform": "ios",
                "os_name": "iOS",
                "os_version": "18.4",
                "manufacturer": "Apple",
                "model_name": "iPhone 15",
                "app_version": "0.1.0",
                "battery_level": 72.0,
                "battery_state": "charging",
                "network_type": "wifi",
                "is_connected": True,
                "is_internet_reachable": True,
                "physical_device": True,
                "timezone": "Asia/Kolkata",
                "locale": "en-IN",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        host = Host.objects.get(agent_id="ios-device-001")
        self.assertEqual(host.owner, self.user)
        self.assertEqual(host.device_type, "mobile")
        snapshot = host.get_latest_snapshot()
        self.assertEqual(snapshot.collector_sources, ["mobile-companion"])
        self.assertEqual(snapshot.security_posture["network_type"], "wifi")
        self.assertEqual(snapshot.security_posture["collector_capabilities"][0]["name"], "mobile-companion")

    def test_mobile_heartbeat_enforces_plan_limit(self):
        self.client.force_authenticate(user=self.user)
        self.user.account_profile.requested_plan = "free"
        self.user.account_profile.save(update_fields=["requested_plan", "updated_at"])
        Host.objects.create(agent_id="desktop-1", hostname="one.local", api_key="1" * 64, owner=self.user)
        Host.objects.create(agent_id="desktop-2", hostname="two.local", api_key="2" * 64, owner=self.user)

        response = self.client.post(
            "/api/v1/mobile/heartbeat/",
            {
                "device_id": "android-device-001",
                "hostname": "Pixel 9",
                "platform": "android",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 402)

    def test_saved_checks_list_and_run_against_latest_snapshot(self):
        self.user.account_profile.ensure_onboarding_api_key()
        self.user.account_profile.save(update_fields=["onboarding_api_key", "updated_at"])

        ingest = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY=self.user.account_profile.onboarding_api_key,
        )

        self.assertEqual(ingest.status_code, 201)

        self.client.force_authenticate(user=self.user)
        checks_response = self.client.get(
            "/api/v1/checks/",
            {"agent_id": "agent-test-host-001"},
        )

        self.assertEqual(checks_response.status_code, 200)
        self.assertGreaterEqual(len(checks_response.data["checks"]), 1)

        firewall_check = next(
            item for item in checks_response.data["checks"] if item["slug"] == "firewall-enabled"
        )
        run_response = self.client.post(
            f"/api/v1/checks/{firewall_check['id']}/run/",
            {"agent_id": "agent-test-host-001"},
            format="json",
        )

        self.assertEqual(run_response.status_code, 201)
        self.assertEqual(run_response.data["check_slug"], "firewall-enabled")
        self.assertEqual(run_response.data["status"], "pass")
        self.assertTrue(
            SavedCheck.objects.filter(user=self.user, slug="patch-baseline-review").exists()
        )

    def test_agent_action_queue_round_trip_completes(self):
        self.user.account_profile.ensure_onboarding_api_key()
        self.user.account_profile.save(update_fields=["onboarding_api_key", "updated_at"])

        ingest = self.client.post(
            "/api/v1/process-snapshots/",
            build_payload(),
            format="json",
            HTTP_X_API_KEY=self.user.account_profile.onboarding_api_key,
        )
        host = Host.objects.get(agent_id="agent-test-host-001")

        self.assertEqual(ingest.status_code, 201)

        self.client.force_authenticate(user=self.user)
        queued = self.client.post(
            "/api/v1/actions/",
            {
                "agent_id": "agent-test-host-001",
                "kind": "live_query",
                "note": "Review process inventory",
                "parameters": {
                    "source": "processes",
                    "field": "name",
                    "operator": "contains",
                    "value": "process",
                    "limit": 5,
                },
            },
            format="json",
        )

        self.assertEqual(queued.status_code, 201)
        action_id = queued.data["id"]

        next_action = self.client.get(
            "/api/v1/agent/actions/next/",
            {"agent_id": "agent-test-host-001"},
            HTTP_X_API_KEY=host.api_key,
        )

        self.assertEqual(next_action.status_code, 200)
        self.assertEqual(next_action.data["id"], action_id)
        self.assertEqual(next_action.data["status"], "in_progress")

        result_response = self.client.post(
            f"/api/v1/agent/actions/{action_id}/result/",
            {
                "status": "succeeded",
                "result": {"count": 2, "matches": [{"name": "process-0"}]},
            },
            format="json",
            HTTP_X_API_KEY=host.api_key,
        )

        self.assertEqual(result_response.status_code, 200)
        self.assertEqual(result_response.data["status"], "succeeded")

        action = AgentAction.objects.get(id=action_id)
        self.assertEqual(action.status, AgentAction.Status.SUCCEEDED)
        self.assertEqual(action.result["count"], 2)
