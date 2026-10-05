from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import secrets


class AccountProfile(models.Model):
    class PlanChoices(models.TextChoices):
        FREE = "free", "Free"
        PRO = "pro", "Pro"
        TEAM = "team", "Team"

    class BillingStatus(models.TextChoices):
        FREE = "free", "Free"
        ACTIVE = "active", "Active"
        TRIALING = "trialing", "Trialing"
        PAST_DUE = "past_due", "Past Due"
        CANCELED = "canceled", "Canceled"
        INCOMPLETE = "incomplete", "Incomplete"
        UNPAID = "unpaid", "Unpaid"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="account_profile",
    )
    requested_plan = models.CharField(
        max_length=16,
        choices=PlanChoices.choices,
        default=PlanChoices.FREE,
    )
    active_plan = models.CharField(
        max_length=16,
        choices=PlanChoices.choices,
        default=PlanChoices.FREE,
    )
    billing_status = models.CharField(
        max_length=32,
        choices=BillingStatus.choices,
        default=BillingStatus.FREE,
    )
    onboarding_completed = models.BooleanField(default=False)
    onboarding_api_key = models.CharField(max_length=64, blank=True, null=True, unique=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    stripe_price_id = models.CharField(max_length=255, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    next_payment_attempt = models.DateTimeField(null=True, blank=True)
    last_invoice_status = models.CharField(max_length=64, blank=True)
    last_payment_error = models.TextField(blank=True)
    billing_issue_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__username"]

    def __str__(self):
        return f"{self.user.username} profile"

    def ensure_onboarding_api_key(self):
        if self.onboarding_api_key:
            return self.onboarding_api_key
        self.onboarding_api_key = secrets.token_hex(32)
        return self.onboarding_api_key

    def rotate_onboarding_api_key(self):
        self.onboarding_api_key = secrets.token_hex(32)
        return self.onboarding_api_key


class TeamWorkspace(models.Model):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_team_workspace",
    )
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name", "owner__username"]

    def __str__(self):
        return self.name

    def ensure_owner_membership(self):
        membership, _ = TeamMembership.objects.get_or_create(
            user=self.owner,
            defaults={
                "workspace": self,
                "role": TeamMembership.Role.OWNER,
            },
        )
        updates = []
        if membership.workspace_id != self.id:
            membership.workspace = self
            updates.append("workspace")
        if membership.role != TeamMembership.Role.OWNER:
            membership.role = TeamMembership.Role.OWNER
            updates.append("role")
        if updates:
            membership.save(update_fields=[*updates, "updated_at"])
        return membership


class TeamMembership(models.Model):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        ADMIN = "admin", "Admin"
        RESPONDER = "responder", "Responder"
        VIEWER = "viewer", "Viewer"

    workspace = models.ForeignKey(
        TeamWorkspace,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="team_membership",
    )
    role = models.CharField(max_length=24, choices=Role.choices, default=Role.VIEWER)
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["workspace__name", "joined_at", "user__username"]

    def __str__(self):
        return f"{self.user.username} in {self.workspace.name}"


class TeamInvite(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REVOKED = "revoked", "Revoked"
        EXPIRED = "expired", "Expired"

    workspace = models.ForeignKey(
        TeamWorkspace,
        on_delete=models.CASCADE,
        related_name="invites",
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_team_invites",
    )
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="accepted_team_invites",
        null=True,
        blank=True,
    )
    email = models.EmailField()
    role = models.CharField(max_length=24, choices=TeamMembership.Role.choices, default=TeamMembership.Role.VIEWER)
    token = models.CharField(max_length=64, unique=True, default=secrets.token_hex, editable=False)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} invited to {self.workspace.name}"

    @property
    def is_active(self):
        return self.status == self.Status.PENDING and self.expires_at > timezone.now()

    def mark_expired_if_needed(self):
        if self.status == self.Status.PENDING and self.expires_at <= timezone.now():
            self.status = self.Status.EXPIRED
            self.save(update_fields=["status", "updated_at"])


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def ensure_account_profile(sender, instance, created, **_kwargs):
    if created:
        AccountProfile.objects.create(user=instance)
