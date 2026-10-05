from __future__ import annotations

from datetime import datetime, timezone as datetime_timezone

import stripe
from django.conf import settings
from django.utils import timezone

from .models import AccountProfile

STRIPE_API_VERSION = "2026-02-25.clover"
PAID_BILLING_STATUSES = {
    AccountProfile.BillingStatus.ACTIVE,
    AccountProfile.BillingStatus.TRIALING,
    AccountProfile.BillingStatus.PAST_DUE,
}


def billing_is_configured():
    return bool(
        settings.STRIPE_SECRET_KEY
        and settings.STRIPE_PRICE_PRO
        and settings.STRIPE_PRICE_TEAM
        and settings.HOSTLENS_APP_URL
    )


def configure_stripe():
    stripe.api_key = settings.STRIPE_SECRET_KEY
    stripe.api_version = STRIPE_API_VERSION


def get_price_id_for_plan(plan_key: str):
    return {
        AccountProfile.PlanChoices.PRO: settings.STRIPE_PRICE_PRO,
        AccountProfile.PlanChoices.TEAM: settings.STRIPE_PRICE_TEAM,
    }.get(plan_key, "")


def get_plan_for_price_id(price_id: str | None):
    if not price_id:
        return AccountProfile.PlanChoices.FREE
    if price_id == settings.STRIPE_PRICE_PRO:
        return AccountProfile.PlanChoices.PRO
    if price_id == settings.STRIPE_PRICE_TEAM:
        return AccountProfile.PlanChoices.TEAM
    return AccountProfile.PlanChoices.FREE


def get_effective_plan(profile: AccountProfile):
    if profile.billing_status in PAID_BILLING_STATUSES and profile.active_plan in {
        AccountProfile.PlanChoices.PRO,
        AccountProfile.PlanChoices.TEAM,
    }:
        return profile.active_plan
    return AccountProfile.PlanChoices.FREE


def _period_end_from_timestamp(timestamp: int | None):
    if not timestamp:
        return None
    return datetime.fromtimestamp(timestamp, tz=datetime_timezone.utc)


def _text_or_empty(value):
    return str(value or "").strip()


def _object_get(obj, field, default=None):
    if hasattr(obj, field):
        return getattr(obj, field)
    if isinstance(obj, dict):
        return obj.get(field, default)
    return default


def ensure_customer(profile: AccountProfile):
    configure_stripe()

    if profile.stripe_customer_id:
        customer = stripe.Customer.retrieve(profile.stripe_customer_id)
        if not getattr(customer, "deleted", False):
            return customer

    full_name = f"{profile.user.first_name} {profile.user.last_name}".strip() or profile.user.username
    customer = stripe.Customer.create(
        email=profile.user.email,
        name=full_name,
        metadata={
            "user_id": str(profile.user_id),
            "username": profile.user.username,
        },
    )
    profile.stripe_customer_id = customer.id
    profile.save(update_fields=["stripe_customer_id", "updated_at"])
    return customer


def sync_profile_from_subscription(profile: AccountProfile, subscription):
    price_id = ""
    items = getattr(subscription, "items", None)
    data = getattr(items, "data", []) if items is not None else []
    if data:
        price_id = getattr(data[0].price, "id", "") or ""

    profile.stripe_subscription_id = getattr(subscription, "id", "") or ""
    profile.stripe_price_id = price_id
    profile.billing_status = (
        getattr(subscription, "status", "") or AccountProfile.BillingStatus.FREE
    )
    profile.active_plan = get_plan_for_price_id(price_id)
    profile.current_period_end = _period_end_from_timestamp(
        getattr(subscription, "current_period_end", None)
    )
    profile.cancel_at_period_end = bool(getattr(subscription, "cancel_at_period_end", False))
    if profile.billing_status not in PAID_BILLING_STATUSES:
        profile.active_plan = AccountProfile.PlanChoices.FREE
    if profile.billing_status in {
        AccountProfile.BillingStatus.ACTIVE,
        AccountProfile.BillingStatus.TRIALING,
    }:
        profile.last_payment_error = ""
        profile.billing_issue_url = ""
        profile.last_invoice_status = ""
        profile.next_payment_attempt = None
    profile.save(
        update_fields=[
            "stripe_subscription_id",
            "stripe_price_id",
            "billing_status",
            "active_plan",
            "current_period_end",
            "cancel_at_period_end",
            "last_payment_error",
            "billing_issue_url",
            "last_invoice_status",
            "next_payment_attempt",
            "updated_at",
        ]
    )


def sync_profile_from_invoice(profile: AccountProfile, invoice):
    billing_reason = _text_or_empty(_object_get(invoice, "billing_reason"))
    hosted_invoice_url = _text_or_empty(_object_get(invoice, "hosted_invoice_url"))
    invoice_status = _text_or_empty(_object_get(invoice, "status"))
    next_payment_attempt = _period_end_from_timestamp(
        _object_get(invoice, "next_payment_attempt")
    )
    last_payment_error = (
        _object_get(invoice, "last_payment_error")
        or {}
    )
    if hasattr(last_payment_error, "get"):
        error_message = _text_or_empty(last_payment_error.get("message"))
    else:
        error_message = _text_or_empty(last_payment_error)

    profile.last_invoice_status = invoice_status
    profile.next_payment_attempt = next_payment_attempt
    profile.billing_issue_url = hosted_invoice_url
    profile.last_payment_error = error_message

    if billing_reason in {"subscription_create", "subscription_cycle", "subscription_threshold"}:
        if invoice_status == "paid":
            if profile.billing_status in {
                AccountProfile.BillingStatus.PAST_DUE,
                AccountProfile.BillingStatus.UNPAID,
                AccountProfile.BillingStatus.INCOMPLETE,
            }:
                profile.billing_status = AccountProfile.BillingStatus.ACTIVE
        elif invoice_status in {"open", "uncollectible"}:
            profile.billing_status = AccountProfile.BillingStatus.PAST_DUE

    profile.save(
        update_fields=[
            "billing_status",
            "last_invoice_status",
            "next_payment_attempt",
            "billing_issue_url",
            "last_payment_error",
            "updated_at",
        ]
    )


def reset_profile_to_free(profile: AccountProfile):
    profile.active_plan = AccountProfile.PlanChoices.FREE
    profile.billing_status = AccountProfile.BillingStatus.FREE
    profile.stripe_subscription_id = ""
    profile.stripe_price_id = ""
    profile.current_period_end = None
    profile.cancel_at_period_end = False
    profile.next_payment_attempt = None
    profile.last_invoice_status = ""
    profile.last_payment_error = ""
    profile.billing_issue_url = ""
    profile.save(
        update_fields=[
            "active_plan",
            "billing_status",
            "stripe_subscription_id",
            "stripe_price_id",
            "current_period_end",
            "cancel_at_period_end",
            "next_payment_attempt",
            "last_invoice_status",
            "last_payment_error",
            "billing_issue_url",
            "updated_at",
        ]
    )
