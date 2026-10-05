from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from auth_system.models import TeamInvite, TeamMembership
from processes.models import Host


@override_settings(PROC_MONITOR_API_KEY="global-key", SUPER_ADMIN_KEY="admin-key")
class AuthSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_creates_profile_and_tokens(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "demo",
                "email": "demo@example.com",
                "password": "StrongPassword123!",
                "password_confirm": "StrongPassword123!",
                "requested_plan": "pro",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn("tokens", response.data)
        self.assertEqual(response.data["user"]["profile"]["requested_plan"], "pro")
        self.assertEqual(response.data["user"]["profile"]["active_plan"], "free")

    def test_login_accepts_email_identifier(self):
        User.objects.create_user(
            username="demo",
            email="demo@example.com",
            password="StrongPassword123!",
        )

        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "demo@example.com", "password": "StrongPassword123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["email"], "demo@example.com")

    def test_claim_device_assigns_owner_and_completes_onboarding(self):
        user = User.objects.create_user(
            username="demo",
            email="demo@example.com",
            password="StrongPassword123!",
        )
        host = Host.objects.create(
            agent_id="agent-demo-001",
            hostname="demo.local",
            display_name="demo.local",
            api_key="a" * 64,
        )

        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/v1/auth/claim-device/",
            {
                "agent_id": "agent-demo-001",
                "api_key": "a" * 64,
                "display_name": "My Laptop",
            },
            format="json",
        )

        host.refresh_from_db()
        user.account_profile.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(host.owner_id, user.id)
        self.assertEqual(host.display_name, "My Laptop")
        self.assertTrue(user.account_profile.onboarding_completed)

    def test_claim_device_enforces_plan_limit(self):
        user = User.objects.create_user(
            username="proless",
            email="proless@example.com",
            password="StrongPassword123!",
        )
        user.account_profile.requested_plan = "free"
        user.account_profile.save(update_fields=["requested_plan", "updated_at"])

        Host.objects.create(agent_id="agent-1", hostname="one.local", api_key="1" * 64, owner=user)
        Host.objects.create(agent_id="agent-2", hostname="two.local", api_key="2" * 64, owner=user)
        Host.objects.create(agent_id="agent-3", hostname="three.local", api_key="3" * 64)

        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/v1/auth/claim-device/",
            {
                "agent_id": "agent-3",
                "api_key": "3" * 64,
                "display_name": "Third Device",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 402)
        self.assertIn("supports up to 2 devices", response.data["detail"])

    def test_profile_returns_account_profile(self):
        user = User.objects.create_user(
            username="demo",
            email="demo@example.com",
            password="StrongPassword123!",
        )
        user.account_profile.requested_plan = "team"
        user.account_profile.active_plan = "team"
        user.account_profile.billing_status = "active"
        user.account_profile.save()

        self.client.force_authenticate(user=user)
        response = self.client.get("/api/v1/auth/profile/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["profile"]["requested_plan"], "team")
        self.assertEqual(response.data["profile"]["active_plan"], "team")
        self.assertEqual(response.data["profile"]["plan_label"], "Team")

    def test_onboarding_kit_returns_account_bound_config(self):
        user = User.objects.create_user(
            username="kituser",
            email="kit@example.com",
            password="StrongPassword123!",
        )

        self.client.force_authenticate(user=user)
        response = self.client.get("/api/v1/auth/onboarding-kit/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["config"]["api_key"],
            response.data["onboarding_api_key"],
        )
        self.assertIn("process-snapshots", response.data["config"]["endpoint"])
        self.assertIn("macos_arm64", response.data["downloads"])

    def test_rotate_onboarding_key_changes_value(self):
        user = User.objects.create_user(
            username="rotateuser",
            email="rotate@example.com",
            password="StrongPassword123!",
        )
        user.account_profile.ensure_onboarding_api_key()
        user.account_profile.save(update_fields=["onboarding_api_key", "updated_at"])
        original_key = user.account_profile.onboarding_api_key

        self.client.force_authenticate(user=user)
        response = self.client.post("/api/v1/auth/onboarding-kit/rotate/", {}, format="json")

        user.account_profile.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(original_key, user.account_profile.onboarding_api_key)

    @override_settings(
        STRIPE_SECRET_KEY="sk_test_123",
        STRIPE_PRICE_PRO="price_pro",
        STRIPE_PRICE_TEAM="price_team",
        HOSTLENS_APP_URL="http://127.0.0.1:3001",
    )
    @patch("auth_system.views.ensure_customer")
    @patch("auth_system.views.stripe.checkout.Session.create")
    def test_checkout_endpoint_returns_session_url(self, create_session, ensure_customer):
        user = User.objects.create_user(
            username="billinguser",
            email="billing@example.com",
            password="StrongPassword123!",
        )
        ensure_customer.return_value = SimpleNamespace(id="cus_123")
        create_session.return_value = SimpleNamespace(url="https://checkout.stripe.test/session", id="cs_123")

        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/v1/auth/billing/checkout/",
            {"plan": "pro"},
            format="json",
        )

        user.account_profile.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["url"], "https://checkout.stripe.test/session")
        self.assertEqual(user.account_profile.requested_plan, "pro")

    @override_settings(
        STRIPE_SECRET_KEY="sk_test_123",
        STRIPE_PRICE_PRO="price_pro",
        STRIPE_PRICE_TEAM="price_team",
        HOSTLENS_APP_URL="http://127.0.0.1:3001",
    )
    @patch("auth_system.views.ensure_customer")
    @patch("auth_system.views.stripe.billing_portal.Session.create")
    def test_billing_portal_creates_customer_if_missing(self, create_portal, ensure_customer):
        user = User.objects.create_user(
            username="portaluser",
            email="portal@example.com",
            password="StrongPassword123!",
        )
        ensure_customer.return_value = SimpleNamespace(id="cus_portal_123")
        create_portal.return_value = SimpleNamespace(url="https://billing.stripe.test/session")

        self.client.force_authenticate(user=user)
        response = self.client.post("/api/v1/auth/billing/portal/", {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["url"], "https://billing.stripe.test/session")

    @override_settings(
        STRIPE_SECRET_KEY="sk_test_123",
        STRIPE_PRICE_PRO="price_pro",
        STRIPE_PRICE_TEAM="price_team",
        STRIPE_WEBHOOK_SECRET="whsec_test_123",
        HOSTLENS_APP_URL="http://127.0.0.1:3001",
    )
    @patch("auth_system.views.stripe.Subscription.retrieve")
    @patch("auth_system.views.stripe.Webhook.construct_event")
    def test_stripe_webhook_marks_account_past_due_on_payment_failure(
        self,
        construct_event,
        retrieve_subscription,
    ):
        user = User.objects.create_user(
            username="stripefail",
            email="stripefail@example.com",
            password="StrongPassword123!",
        )
        profile = user.account_profile
        profile.stripe_customer_id = "cus_fail_123"
        profile.stripe_subscription_id = "sub_fail_123"
        profile.active_plan = "team"
        profile.billing_status = "active"
        profile.save(
            update_fields=[
                "stripe_customer_id",
                "stripe_subscription_id",
                "active_plan",
                "billing_status",
                "updated_at",
            ]
        )

        construct_event.return_value = {
            "type": "invoice.payment_failed",
            "data": {
                "object": {
                    "customer": "cus_fail_123",
                    "subscription": "sub_fail_123",
                    "status": "open",
                    "billing_reason": "subscription_cycle",
                    "hosted_invoice_url": "https://pay.stripe.test/inv_123",
                    "next_payment_attempt": 1775101800,
                    "last_payment_error": {"message": "Card was declined."},
                }
            },
        }
        retrieve_subscription.return_value = SimpleNamespace(
            id="sub_fail_123",
            status="past_due",
            cancel_at_period_end=False,
            current_period_end=1775188200,
            metadata={"requested_plan": "team"},
            items=SimpleNamespace(
                data=[
                    SimpleNamespace(
                        price=SimpleNamespace(id="price_team"),
                    )
                ]
            ),
        )

        response = self.client.post(
            "/api/v1/auth/billing/webhook/",
            data="{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig_test",
        )

        profile.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(profile.billing_status, "past_due")
        self.assertEqual(profile.active_plan, "team")
        self.assertEqual(profile.last_payment_error, "Card was declined.")
        self.assertEqual(profile.billing_issue_url, "https://pay.stripe.test/inv_123")

    def test_team_workspace_auto_creates_for_team_owner(self):
        user = User.objects.create_user(
            username="teamowner",
            email="teamowner@example.com",
            password="StrongPassword123!",
        )
        user.account_profile.active_plan = "team"
        user.account_profile.billing_status = "active"
        user.account_profile.save(update_fields=["active_plan", "billing_status", "updated_at"])

        self.client.force_authenticate(user=user)
        response = self.client.get("/api/v1/auth/team-workspace/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["role"], "owner")
        self.assertEqual(response.data["workspace"]["owner"]["email"], "teamowner@example.com")
        self.assertEqual(response.data["workspace"]["members"][0]["role"], "owner")

    def test_team_invite_can_be_accepted(self):
        owner = User.objects.create_user(
            username="teamowner",
            email="teamowner@example.com",
            password="StrongPassword123!",
        )
        owner.account_profile.active_plan = "team"
        owner.account_profile.billing_status = "active"
        owner.account_profile.save(update_fields=["active_plan", "billing_status", "updated_at"])

        invited = User.objects.create_user(
            username="responder",
            email="responder@example.com",
            password="StrongPassword123!",
        )

        self.client.force_authenticate(user=owner)
        workspace_response = self.client.get("/api/v1/auth/team-workspace/")
        self.assertEqual(workspace_response.status_code, 200)

        invite_response = self.client.post(
            "/api/v1/auth/team-invites/",
            {"email": "responder@example.com", "role": "responder"},
            format="json",
        )
        self.assertEqual(invite_response.status_code, 201)
        invite = TeamInvite.objects.get(email="responder@example.com")

        self.client.force_authenticate(user=invited)
        accept_response = self.client.post(
            "/api/v1/auth/team-invites/accept/",
            {"token": invite.token},
            format="json",
        )

        self.assertEqual(accept_response.status_code, 200)
        membership = TeamMembership.objects.get(user=invited)
        self.assertEqual(membership.role, "responder")
        self.assertEqual(membership.workspace.owner_id, owner.id)

    def test_team_member_claims_device_into_workspace_owner(self):
        owner = User.objects.create_user(
            username="teamowner",
            email="teamowner@example.com",
            password="StrongPassword123!",
        )
        owner.account_profile.active_plan = "team"
        owner.account_profile.billing_status = "active"
        owner.account_profile.save(update_fields=["active_plan", "billing_status", "updated_at"])

        responder = User.objects.create_user(
            username="responder",
            email="responder@example.com",
            password="StrongPassword123!",
        )

        self.client.force_authenticate(user=owner)
        self.client.get("/api/v1/auth/team-workspace/")
        invite_response = self.client.post(
            "/api/v1/auth/team-invites/",
            {"email": "responder@example.com", "role": "responder"},
            format="json",
        )
        invite = TeamInvite.objects.get(id=invite_response.data["id"])

        self.client.force_authenticate(user=responder)
        self.client.post(
            "/api/v1/auth/team-invites/accept/",
            {"token": invite.token},
            format="json",
        )

        host = Host.objects.create(
            agent_id="team-agent-001",
            hostname="team-device.local",
            display_name="team-device.local",
            api_key="b" * 64,
        )

        response = self.client.post(
            "/api/v1/auth/claim-device/",
            {
                "agent_id": "team-agent-001",
                "api_key": "b" * 64,
                "display_name": "Responder Laptop",
            },
            format="json",
        )

        host.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(host.owner_id, owner.id)
        self.assertEqual(host.display_name, "Responder Laptop")
