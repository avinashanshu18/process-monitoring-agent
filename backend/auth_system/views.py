"""
Authentication and account management endpoints.
"""

from datetime import timedelta
import logging
import stripe

from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from processes.models import Host
from processes.serializers import HostSummarySerializer

from .billing import (
    billing_is_configured,
    configure_stripe,
    ensure_customer,
    get_effective_plan,
    get_price_id_for_plan,
    sync_profile_from_invoice,
    sync_profile_from_subscription,
)
from .models import AccountProfile, TeamInvite, TeamMembership
from .serializers import (
    APIKeyValidationSerializer,
    BillingCheckoutSerializer,
    ClaimDeviceSerializer,
    CustomTokenObtainPairSerializer,
    OnboardingKitSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    ProfileUpdateSerializer,
    SessionInfoSerializer,
    TeamInviteAcceptSerializer,
    TeamInviteCreateSerializer,
    TeamInviteSerializer,
    TeamMembershipSerializer,
    TeamMembershipUpdateSerializer,
    TeamWorkspaceSerializer,
    TeamWorkspaceUpdateSerializer,
    UserDetailSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from .plans import get_plan_config
from .team_access import (
    can_change_roles,
    can_manage_workspace,
    ensure_team_workspace_for_owner,
    get_team_role,
    get_team_workspace,
    get_workspace_owner,
    get_workspace_plan,
    workspace_member_queryset,
)
from .throttling import BurstRateThrottle

logger = logging.getLogger(__name__)


def _build_onboarding_kit(profile: AccountProfile):
    if not profile.onboarding_api_key:
        profile.ensure_onboarding_api_key()
        profile.save(update_fields=["onboarding_api_key", "updated_at"])

    plan = get_plan_config(get_effective_plan(profile))
    base_download_url = f"{settings.HOSTLENS_APP_URL}/downloads"

    payload = {
        "plan_key": plan["key"],
        "plan_label": plan["label"],
        "billing_status": profile.billing_status,
        "billing_attention_required": profile.billing_status
        in {
            AccountProfile.BillingStatus.PAST_DUE,
            AccountProfile.BillingStatus.INCOMPLETE,
            AccountProfile.BillingStatus.UNPAID,
        },
        "billing_ready": billing_is_configured(),
        "onboarding_api_key": profile.onboarding_api_key,
        "config": {
            "endpoint": settings.HOSTLENS_AGENT_ENDPOINT,
            "api_key": profile.onboarding_api_key,
            "agent_id": "",
            "device_type": "desktop",
            "hostname_override": "",
            "interval_seconds": 60,
            "release_manifest_url": settings.HOSTLENS_RELEASE_MANIFEST_URL,
            "release_channel": settings.HOSTLENS_RELEASE_CHANNEL,
            "auto_update": True,
        },
        "downloads": {
            "macos_pkg": {
                "label": "macOS installer package",
                "url": f"{base_download_url}/HostLens-macOS-Installer.pkg",
                "filename": "HostLens-macOS-Installer.pkg",
            },
            "macos_universal": {
                "label": "macOS universal binary",
                "url": f"{base_download_url}/hostlens-agent-darwin-universal",
                "filename": "hostlens-agent-macos-universal",
            },
            "macos_arm64": {
                "label": "macOS (Apple Silicon)",
                "url": f"{base_download_url}/hostlens-agent-darwin-arm64",
                "filename": "hostlens-agent-macos-arm64",
            },
            "macos_amd64": {
                "label": "macOS (Intel)",
                "url": f"{base_download_url}/hostlens-agent-darwin-amd64",
                "filename": "hostlens-agent-macos-amd64",
            },
            "linux_amd64": {
                "label": "Linux (amd64)",
                "url": f"{base_download_url}/hostlens-agent-linux-amd64",
                "filename": "hostlens-agent-linux-amd64",
            },
            "windows_amd64": {
                "label": "Windows (amd64)",
                "url": f"{base_download_url}/hostlens-agent-windows-amd64.exe",
                "filename": "hostlens-agent-windows-amd64.exe",
            },
            "windows_service": {
                "label": "Windows service wrapper",
                "url": f"{base_download_url}/hostlens-service-windows-amd64.exe",
                "filename": "hostlens-service-windows-amd64.exe",
            },
        },
        "installers": {
            "macos": {
                "label": "Legacy macOS shell installer",
                "url": f"{base_download_url}/install-macos.sh",
                "filename": "install-macos.sh",
            },
            "linux": {
                "label": "Linux installer",
                "url": f"{base_download_url}/install-linux.sh",
                "filename": "install-linux.sh",
            },
            "windows": {
                "label": "Windows service installer",
                "url": f"{base_download_url}/install-windows.ps1",
                "filename": "install-windows.ps1",
            },
        },
        "checksums_url": f"{base_download_url}/hostlens-checksums.txt",
        "release_manifest_url": f"{base_download_url}/release-manifest.json",
    }
    return OnboardingKitSerializer(payload).data


def _workspace_host_count(user):
    owner = get_workspace_owner(user)
    return owner.owned_hosts.count()


def _workspace_member_count(user):
    workspace = get_team_workspace(user)
    if not workspace:
        return 1
    return workspace.memberships.count()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [BurstRateThrottle]


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [BurstRateThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "User registered successfully",
                "user": UserDetailSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"error": "Refresh token required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        logger.info("User logged out: %s", request.user.username)
        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [BurstRateThrottle]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [BurstRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        logger.info("Password reset requested for: %s", serializer.validated_data["email"])
        return Response(
            {"message": "If the email exists, a reset link has been sent"},
            status=status.HTTP_200_OK,
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserDetailSerializer(request.user).data)

    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserDetailSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserDetailSerializer(request.user).data)


class SessionInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auth_method = "JWT"
        if "HTTP_X_API_KEY" in request.META:
            auth_method = "API Key"
        elif request.session.session_key:
            auth_method = "Session"

        serializer = SessionInfoSerializer(
            {
                "user": request.user,
                "ip_address": request.META.get("REMOTE_ADDR"),
                "user_agent": request.META.get("HTTP_USER_AGENT", "Unknown"),
                "authenticated": True,
                "auth_method": auth_method,
                "session_created": timezone.now(),
            }
        )
        return Response(serializer.data)


class ValidateAPIKeyView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [BurstRateThrottle]

    def post(self, request):
        serializer = APIKeyValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        api_key = serializer.validated_data["api_key"]
        try:
            host = Host.objects.get(api_key=api_key, monitoring_enabled=True)
        except Host.DoesNotExist:
            return Response(
                {"valid": False, "error": "Invalid API key"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        host.last_seen = timezone.now()
        host.status = Host.HostStatus.ONLINE
        host.save(update_fields=["last_seen", "status"])
        return Response(
            {
                "valid": True,
                "host": HostSummarySerializer(host).data,
            },
            status=status.HTTP_200_OK,
        )


class ClaimDeviceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ClaimDeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        agent_id = serializer.validated_data.get("agent_id")
        hostname = serializer.validated_data.get("hostname")
        api_key = serializer.validated_data["api_key"]
        display_name = serializer.validated_data.get("display_name")

        host = Host.objects.filter(api_key=api_key, monitoring_enabled=True)
        if agent_id:
            host = host.filter(agent_id=agent_id)
        elif hostname:
            host = host.filter(hostname=hostname)

        host = host.first()
        if not host:
            return Response(
                {"detail": "Device not found for that identifier and API key."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if host.owner_id and host.owner_id != request.user.id:
            workspace = get_team_workspace(request.user)
            workspace_owner = get_workspace_owner(request.user)
            if not workspace or host.owner_id != workspace_owner.id:
                return Response(
                    {"detail": "That device is already claimed by another account."},
                    status=status.HTTP_409_CONFLICT,
                )

        workspace_owner = get_workspace_owner(request.user)
        plan = get_workspace_plan(request.user)
        used_devices = workspace_owner.owned_hosts.exclude(id=host.id).count()
        if used_devices >= plan["host_limit"]:
            return Response(
                {
                    "detail": (
                        f"The {plan['label']} plan supports up to {plan['host_limit']} devices. "
                        "Upgrade your plan before claiming another device."
                    )
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        host.owner = workspace_owner
        if display_name:
            host.display_name = display_name
        host.save(update_fields=["owner", "display_name"])

        profile = request.user.account_profile
        if not profile.onboarding_completed:
            profile.onboarding_completed = True
            profile.save(update_fields=["onboarding_completed", "updated_at"])

        return Response(
            {
                "message": "Device claimed successfully",
                "host": HostSummarySerializer(host).data,
                "user": UserDetailSerializer(request.user).data,
            },
            status=status.HTTP_200_OK,
        )


class OnboardingKitView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_build_onboarding_kit(request.user.account_profile))


class RotateOnboardingKeyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.account_profile
        profile.rotate_onboarding_api_key()
        profile.save(update_fields=["onboarding_api_key", "updated_at"])
        return Response(_build_onboarding_kit(profile))


class TeamWorkspaceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workspace = get_team_workspace(request.user)
        if workspace is None:
            effective_plan = get_effective_plan(request.user.account_profile)
            if effective_plan == AccountProfile.PlanChoices.TEAM:
                workspace = ensure_team_workspace_for_owner(request.user)
            else:
                return Response(
                    {
                        "workspace": None,
                        "role": None,
                        "can_manage": False,
                        "can_change_roles": False,
                        "seat_limit": get_plan_config(effective_plan).get("seat_limit", 1),
                    }
                )

        return Response(
            {
                "workspace": TeamWorkspaceSerializer(
                    workspace,
                    context={"app_url": settings.HOSTLENS_APP_URL},
                ).data,
                "role": get_team_role(request.user),
                "can_manage": can_manage_workspace(request.user),
                "can_change_roles": can_change_roles(request.user),
            }
        )

    def patch(self, request):
        workspace = get_team_workspace(request.user)
        if workspace is None:
            if get_effective_plan(request.user.account_profile) != AccountProfile.PlanChoices.TEAM:
                return Response(
                    {"detail": "Upgrade to the Team plan to create a shared workspace."},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            workspace = ensure_team_workspace_for_owner(request.user)

        if workspace.owner_id != request.user.id:
            return Response(
                {"detail": "Only the workspace owner can rename the workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TeamWorkspaceUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace.name = serializer.validated_data["name"]
        workspace.save(update_fields=["name", "updated_at"])
        return Response(
            {
                "workspace": TeamWorkspaceSerializer(
                    workspace,
                    context={"app_url": settings.HOSTLENS_APP_URL},
                ).data,
                "role": get_team_role(request.user),
                "can_manage": True,
                "can_change_roles": True,
            }
        )


class TeamInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        workspace = get_team_workspace(request.user)
        if workspace is None:
            if get_effective_plan(request.user.account_profile) != AccountProfile.PlanChoices.TEAM:
                return Response(
                    {"detail": "Upgrade to the Team plan to invite collaborators."},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            workspace = ensure_team_workspace_for_owner(request.user)

        if not can_manage_workspace(request.user):
            return Response(
                {"detail": "You do not have permission to invite members to this workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TeamInviteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = get_workspace_plan(request.user)
        active_member_count = workspace.memberships.count()
        pending_invites = workspace.invites.filter(status=TeamInvite.Status.PENDING, expires_at__gt=timezone.now()).count()
        if active_member_count + pending_invites >= plan.get("seat_limit", 1):
            return Response(
                {
                    "detail": (
                        f"The {plan['label']} plan supports up to {plan.get('seat_limit', 1)} seats. "
                        "Upgrade before inviting another teammate."
                    )
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        email = serializer.validated_data["email"]
        existing_membership = TeamMembership.objects.filter(user__email__iexact=email).first()
        if existing_membership:
            detail = "That email already belongs to a member of this workspace."
            if existing_membership.workspace_id != workspace.id:
                detail = "That email already belongs to another HostLens workspace."
            return Response({"detail": detail}, status=status.HTTP_409_CONFLICT)

        invite = TeamInvite.objects.filter(
            workspace=workspace,
            email=email,
            status=TeamInvite.Status.PENDING,
            expires_at__gt=timezone.now(),
        ).first()
        if invite is None:
            invite = TeamInvite.objects.create(
                workspace=workspace,
                invited_by=request.user,
                email=email,
                role=serializer.validated_data["role"],
                expires_at=timezone.now() + timedelta(days=7),
            )
        else:
            invite.role = serializer.validated_data["role"]
            invite.invited_by = request.user
            invite.save(update_fields=["role", "invited_by", "updated_at"])

        return Response(
            TeamInviteSerializer(
                invite,
                context={"app_url": settings.HOSTLENS_APP_URL},
            ).data,
            status=status.HTTP_201_CREATED,
        )


class TeamInviteAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TeamInviteAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invite = TeamInvite.objects.select_related("workspace", "workspace__owner").filter(
            token=serializer.validated_data["token"]
        ).first()
        if not invite:
            return Response({"detail": "Invite not found."}, status=status.HTTP_404_NOT_FOUND)

        invite.mark_expired_if_needed()
        if invite.status != TeamInvite.Status.PENDING:
            return Response({"detail": "That invite is no longer active."}, status=status.HTTP_409_CONFLICT)
        if invite.email.lower() != request.user.email.lower():
            return Response(
                {"detail": "This invite is tied to a different email address."},
                status=status.HTTP_403_FORBIDDEN,
            )

        existing_workspace = get_team_workspace(request.user)
        if existing_workspace and existing_workspace.id != invite.workspace_id:
            return Response(
                {"detail": "This account already belongs to another workspace."},
                status=status.HTTP_409_CONFLICT,
            )

        plan = get_plan_config(get_effective_plan(invite.workspace.owner.account_profile))
        if invite.workspace.memberships.count() >= plan.get("seat_limit", 1):
            return Response(
                {"detail": "This workspace has already reached its seat limit."},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        with transaction.atomic():
            membership, created = TeamMembership.objects.get_or_create(
                user=request.user,
                defaults={
                    "workspace": invite.workspace,
                    "role": invite.role,
                },
            )
            if not created and membership.workspace_id != invite.workspace_id:
                return Response(
                    {"detail": "This account already belongs to another workspace."},
                    status=status.HTTP_409_CONFLICT,
                )
            if not created:
                membership.role = invite.role
                membership.save(update_fields=["role", "updated_at"])

            invite.status = TeamInvite.Status.ACCEPTED
            invite.accepted_by = request.user
            invite.accepted_at = timezone.now()
            invite.save(update_fields=["status", "accepted_by", "accepted_at", "updated_at"])

        return Response(
            {
                "workspace": TeamWorkspaceSerializer(
                    invite.workspace,
                    context={"app_url": settings.HOSTLENS_APP_URL},
                ).data,
                "role": get_team_role(request.user),
            }
        )


class TeamMembershipDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, membership_id: int):
        workspace = get_team_workspace(request.user)
        if workspace is None:
            return Response({"detail": "Workspace not found."}, status=status.HTTP_404_NOT_FOUND)
        if not can_change_roles(request.user):
            return Response(
                {"detail": "Only the workspace owner can change teammate roles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership = workspace.memberships.select_related("user").filter(id=membership_id).first()
        if not membership:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        if membership.role == TeamMembership.Role.OWNER:
            return Response(
                {"detail": "The owner role cannot be reassigned from this screen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TeamMembershipUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership.role = serializer.validated_data["role"]
        membership.save(update_fields=["role", "updated_at"])
        return Response(TeamMembershipSerializer(membership).data)

    def delete(self, request, membership_id: int):
        workspace = get_team_workspace(request.user)
        if workspace is None:
            return Response({"detail": "Workspace not found."}, status=status.HTTP_404_NOT_FOUND)
        if not can_manage_workspace(request.user):
            return Response(
                {"detail": "You do not have permission to remove teammates."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership = workspace.memberships.select_related("user").filter(id=membership_id).first()
        if not membership:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        if membership.role == TeamMembership.Role.OWNER:
            return Response(
                {"detail": "The workspace owner cannot be removed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BillingCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not billing_is_configured():
            return Response(
                {"detail": "Stripe billing is not configured on this environment yet."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        serializer = BillingCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = request.user.account_profile
        plan = serializer.validated_data["plan"]
        price_id = get_price_id_for_plan(plan)
        if not price_id:
            return Response(
                {"detail": "Missing Stripe price configuration for that plan."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        profile.requested_plan = plan
        profile.save(update_fields=["requested_plan", "updated_at"])

        configure_stripe()
        customer = ensure_customer(profile)
        session = stripe.checkout.Session.create(
            mode="subscription",
            customer=customer.id,
            client_reference_id=str(request.user.id),
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{settings.HOSTLENS_APP_URL}/install?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.HOSTLENS_APP_URL}/pricing?checkout=canceled",
            allow_promotion_codes=True,
            billing_address_collection="auto",
            metadata={
                "user_id": str(request.user.id),
                "requested_plan": plan,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(request.user.id),
                    "requested_plan": plan,
                }
            },
        )

        return Response({"url": session.url, "session_id": session.id})


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not billing_is_configured():
            return Response(
                {"detail": "Stripe billing is not configured on this environment yet."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        profile = request.user.account_profile

        configure_stripe()
        customer = ensure_customer(profile)
        session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url=f"{settings.HOSTLENS_APP_URL}/app/billing",
        )
        return Response({"url": session.url})


class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = []

    def post(self, request):
        if not billing_is_configured() or not settings.STRIPE_WEBHOOK_SECRET:
            return Response(
                {"detail": "Stripe webhook is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        signature = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        configure_stripe()

        try:
            event = stripe.Webhook.construct_event(
                payload=request.body,
                sig_header=signature,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError:
            return Response({"detail": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response({"detail": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event["type"]
        event_object = event["data"]["object"]

        if event_type == "checkout.session.completed":
            customer_id = event_object.get("customer")
            profile = None
            if customer_id:
                profile = AccountProfile.objects.filter(stripe_customer_id=customer_id).first()
            if profile is None and event_object.get("client_reference_id"):
                profile = AccountProfile.objects.filter(
                    user_id=event_object["client_reference_id"]
                ).first()
                if profile and customer_id and profile.stripe_customer_id != customer_id:
                    profile.stripe_customer_id = customer_id
                    profile.save(update_fields=["stripe_customer_id", "updated_at"])

            subscription_id = event_object.get("subscription")
            if profile and subscription_id:
                subscription = stripe.Subscription.retrieve(
                    subscription_id,
                    expand=["items.data.price"],
                )
                sync_profile_from_subscription(profile, subscription)
                profile.requested_plan = subscription.metadata.get(
                    "requested_plan",
                    profile.requested_plan,
                )
                profile.save(update_fields=["requested_plan", "updated_at"])

        elif event_type in {
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
        }:
            customer_id = event_object.get("customer")
            profile = AccountProfile.objects.filter(stripe_customer_id=customer_id).first()
            if profile:
                sync_profile_from_subscription(profile, event_object)
        elif event_type in {
            "invoice.payment_failed",
            "invoice.paid",
            "invoice.payment_action_required",
        }:
            customer_id = event_object.get("customer")
            profile = AccountProfile.objects.filter(stripe_customer_id=customer_id).first()
            if profile:
                subscription_id = event_object.get("subscription")
                if subscription_id:
                    subscription = stripe.Subscription.retrieve(
                        subscription_id,
                        expand=["items.data.price"],
                    )
                    sync_profile_from_subscription(profile, subscription)
                sync_profile_from_invoice(profile, event_object)

        return Response({"received": True}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return self.queryset
        return User.objects.filter(id=self.request.user.id)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if not self.request.user.is_superuser and obj != self.request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You don't have permission to view this user")
        return obj
