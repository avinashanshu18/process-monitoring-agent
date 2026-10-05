"""
Authentication & account serializers.
"""

import logging

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .billing import billing_is_configured, get_effective_plan
from .models import AccountProfile, TeamInvite, TeamMembership, TeamWorkspace
from .plans import get_plan_config
from .team_access import get_team_role, get_team_workspace

logger = logging.getLogger(__name__)


class AccountProfileSerializer(serializers.ModelSerializer):
    active_plan_label = serializers.SerializerMethodField()
    plan_label = serializers.SerializerMethodField()
    host_limit = serializers.SerializerMethodField()
    retention_days = serializers.SerializerMethodField()
    alert_tier = serializers.SerializerMethodField()
    priority_support = serializers.SerializerMethodField()
    seat_limit = serializers.SerializerMethodField()
    subscription_active = serializers.SerializerMethodField()
    billing_ready = serializers.SerializerMethodField()
    billing_attention_required = serializers.SerializerMethodField()

    class Meta:
        model = AccountProfile
        fields = [
            "requested_plan",
            "active_plan",
            "active_plan_label",
            "billing_status",
            "plan_label",
            "host_limit",
            "retention_days",
            "alert_tier",
            "priority_support",
            "seat_limit",
            "onboarding_completed",
            "subscription_active",
            "billing_attention_required",
            "billing_ready",
            "stripe_customer_id",
            "stripe_subscription_id",
            "stripe_price_id",
            "current_period_end",
            "cancel_at_period_end",
            "next_payment_attempt",
            "last_invoice_status",
            "last_payment_error",
            "billing_issue_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "active_plan",
            "billing_status",
            "stripe_customer_id",
            "stripe_subscription_id",
            "stripe_price_id",
            "current_period_end",
            "cancel_at_period_end",
            "next_payment_attempt",
            "last_invoice_status",
            "last_payment_error",
            "billing_issue_url",
            "created_at",
            "updated_at",
        ]

    def _plan(self, obj):
        return get_plan_config(get_effective_plan(obj))

    def get_active_plan_label(self, obj):
        return get_plan_config(obj.active_plan)["label"]

    def get_plan_label(self, obj):
        return self._plan(obj)["label"]

    def get_host_limit(self, obj):
        return self._plan(obj)["host_limit"]

    def get_retention_days(self, obj):
        return self._plan(obj)["retention_days"]

    def get_alert_tier(self, obj):
        return self._plan(obj)["alert_tier"]

    def get_priority_support(self, obj):
        return self._plan(obj)["priority_support"]

    def get_seat_limit(self, obj):
        return self._plan(obj).get("seat_limit", 1)

    def get_subscription_active(self, obj):
        return obj.billing_status in {
            AccountProfile.BillingStatus.ACTIVE,
            AccountProfile.BillingStatus.TRIALING,
            AccountProfile.BillingStatus.PAST_DUE,
        }

    def get_billing_ready(self, _obj):
        return billing_is_configured()

    def get_billing_attention_required(self, obj):
        return obj.billing_status in {
            AccountProfile.BillingStatus.PAST_DUE,
            AccountProfile.BillingStatus.INCOMPLETE,
            AccountProfile.BillingStatus.UNPAID,
        }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accept either username or email in the username field.
    """

    def validate(self, attrs):
        identifier = attrs.get(self.username_field, "")
        if identifier and "@" in identifier:
            user = User.objects.filter(email__iexact=identifier.lower()).first()
            if user:
                attrs[self.username_field] = user.username

        data = super().validate(attrs)
        data["user"] = UserDetailSerializer(self.user).data

        logger.info(
            "User logged in: %s from %s",
            self.user.username,
            self.context["request"].META.get("REMOTE_ADDR"),
        )
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        token["requested_plan"] = user.account_profile.requested_plan
        return token


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class UserDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    host_count = serializers.SerializerMethodField()
    team_role = serializers.SerializerMethodField()
    team_workspace = serializers.SerializerMethodField()
    profile = AccountProfileSerializer(source="account_profile", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "last_login",
            "host_count",
            "team_role",
            "team_workspace",
            "profile",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_host_count(self, obj):
        workspace = get_team_workspace(obj)
        if workspace:
            return workspace.owner.owned_hosts.count()
        return obj.owned_hosts.count()

    def get_team_role(self, obj):
        return get_team_role(obj)

    def get_team_workspace(self, obj):
        workspace = get_team_workspace(obj)
        if not workspace:
            return None
        return {
            "id": workspace.id,
            "name": workspace.name,
            "owner_id": workspace.owner_id,
        }


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        min_length=8,
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        min_length=8,
    )
    requested_plan = serializers.ChoiceField(
        choices=AccountProfile.PlanChoices.choices,
        required=False,
        default=AccountProfile.PlanChoices.FREE,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "requested_plan",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters")
        return value.lower()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value.lower()

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        requested_plan = validated_data.pop("requested_plan", AccountProfile.PlanChoices.FREE)

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        user.account_profile.requested_plan = requested_plan
        user.account_profile.save(update_fields=["requested_plan", "updated_at"])

        logger.info("New user registered: %s (%s)", user.username, user.email)
        return user


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def validate(self, data):
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match"})
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def validate(self, data):
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match"})
        return data


class ProfileUpdateSerializer(serializers.ModelSerializer):
    requested_plan = serializers.ChoiceField(
        choices=AccountProfile.PlanChoices.choices,
        required=False,
        source="account_profile.requested_plan",
    )

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "requested_plan"]

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email__iexact=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email already in use")
        return value.lower()

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("account_profile", {})
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        if profile_data:
            profile = instance.account_profile
            for field, value in profile_data.items():
                setattr(profile, field, value)
            profile.save()

        return instance


class BillingCheckoutSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(
        choices=[
            AccountProfile.PlanChoices.PRO,
            AccountProfile.PlanChoices.TEAM,
        ]
    )


class OnboardingKitSerializer(serializers.Serializer):
    plan_key = serializers.CharField()
    plan_label = serializers.CharField()
    billing_status = serializers.CharField()
    billing_attention_required = serializers.BooleanField()
    billing_ready = serializers.BooleanField()
    onboarding_api_key = serializers.CharField()
    config = serializers.JSONField()
    downloads = serializers.JSONField()
    installers = serializers.JSONField()
    checksums_url = serializers.CharField()
    release_manifest_url = serializers.CharField()


class APIKeyValidationSerializer(serializers.Serializer):
    api_key = serializers.CharField(required=True, min_length=32, max_length=64)


class ClaimDeviceSerializer(serializers.Serializer):
    agent_id = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    hostname = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    api_key = serializers.CharField(min_length=32, max_length=64)
    display_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    def validate(self, attrs):
        if not attrs.get("agent_id") and not attrs.get("hostname"):
            raise serializers.ValidationError("agent_id or hostname is required.")
        return attrs


class SessionInfoSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True)
    ip_address = serializers.CharField(read_only=True)
    user_agent = serializers.CharField(read_only=True)
    authenticated = serializers.BooleanField(read_only=True)
    auth_method = serializers.CharField(read_only=True)
    session_created = serializers.DateTimeField(read_only=True)


class TeamMembershipUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = TeamMembershipUserSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ["id", "role", "joined_at", "updated_at", "user"]


class TeamInviteSerializer(serializers.ModelSerializer):
    invite_url = serializers.SerializerMethodField()
    invited_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TeamInvite
        fields = [
            "id",
            "email",
            "role",
            "status",
            "expires_at",
            "accepted_at",
            "created_at",
            "invite_url",
            "invited_by_name",
        ]

    def get_invite_url(self, obj):
        app_url = self.context.get("app_url", "").rstrip("/")
        return f"{app_url}/team/accept?token={obj.token}" if app_url else ""

    def get_invited_by_name(self, obj):
        return obj.invited_by.get_full_name() or obj.invited_by.username


class TeamWorkspaceSerializer(serializers.ModelSerializer):
    owner = TeamMembershipUserSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    invites = serializers.SerializerMethodField()
    seat_limit = serializers.SerializerMethodField()
    devices_used = serializers.SerializerMethodField()

    class Meta:
        model = TeamWorkspace
        fields = [
            "id",
            "name",
            "created_at",
            "updated_at",
            "owner",
            "members",
            "invites",
            "seat_limit",
            "devices_used",
        ]

    def get_members(self, obj):
        memberships = obj.memberships.select_related("user").order_by("joined_at", "user__username")
        return TeamMembershipSerializer(memberships, many=True).data

    def get_invites(self, obj):
        invites = obj.invites.select_related("invited_by").order_by("-created_at")[:20]
        return TeamInviteSerializer(
            invites,
            many=True,
            context={"app_url": self.context.get("app_url", "")},
        ).data

    def get_seat_limit(self, obj):
        return get_plan_config(get_effective_plan(obj.owner.account_profile)).get("seat_limit", 1)

    def get_devices_used(self, obj):
        return obj.owner.owned_hosts.count()


class TeamWorkspaceUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=3, max_length=120)


class TeamInviteCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=[
            TeamMembership.Role.ADMIN,
            TeamMembership.Role.RESPONDER,
            TeamMembership.Role.VIEWER,
        ]
    )

    def validate_email(self, value):
        return value.lower()


class TeamInviteAcceptSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=16, max_length=64)


class TeamMembershipUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=[
            TeamMembership.Role.ADMIN,
            TeamMembership.Role.RESPONDER,
            TeamMembership.Role.VIEWER,
        ]
    )
