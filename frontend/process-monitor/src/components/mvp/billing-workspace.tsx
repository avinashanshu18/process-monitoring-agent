"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  LifeBuoy,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/auth/auth-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import {
  createBillingPortalSession,
  createCheckoutSession,
  type PlanKey,
} from "@/lib/billing-client";
import { planTiers, salesEmail } from "@/lib/site-content";

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString();
}

export default function BillingWorkspace() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = user?.profile.active_plan ?? "free";
  const nextUpgrade = currentPlan === "free" ? "pro" : "team";
  const currentTier = useMemo(
    () => planTiers.find((plan) => plan.name.toLowerCase() === currentPlan) ?? planTiers[0],
    [currentPlan],
  );

  async function openBillingSurface(planOverride?: Extract<PlanKey, "pro" | "team">) {
    if (!user) {
      return;
    }

    setLoadingPlan(planOverride ?? currentPlan);
    setError(null);

    try {
      if (user.profile.subscription_active) {
        const session = await createBillingPortalSession();
        window.location.href = session.url;
        return;
      }

      if (!user.profile.billing_ready) {
        window.location.href = `mailto:${salesEmail}?subject=HostLens%20plan%20activation`;
        return;
      }

      const checkout = await createCheckoutSession(planOverride ?? nextUpgrade);
      window.location.href = checkout.url;
    } catch (billingError) {
      setError(
        billingError instanceof Error ? billingError.message : "Unable to open billing right now.",
      );
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <AuthGuard>
      <LayoutWrapper
        title="Billing workspace"
        description="Review your active plan, device capacity, and the next commercial step without leaving the control surface."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
              <div>
                <div className="eyebrow">Commercial control</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Billing should feel like part of the product, not a dead-end checkout link.
                </div>
                <div className="section-copy mt-4 text-base">
                  HostLens keeps plan posture, device capacity, retention, and next-step actions
                  inside the workspace so customers always know what they are buying.
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void openBillingSurface()}
                    disabled={loadingPlan !== null}
                    className="btn-primary"
                  >
                    <CreditCard className="h-4 w-4" />
                    {user?.profile.subscription_active ? "Open Stripe billing" : "Activate paid billing"}
                  </button>
                  <Link href="/pricing" className="btn-secondary">
                    Compare public pricing
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Current billing posture</div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Active plan</div>
                    <div className="mt-2 text-base font-semibold text-white">
                      {user?.profile.active_plan_label ?? currentTier.name}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Billing status</div>
                    <div className="mt-2 text-base font-semibold text-white">
                      {user?.profile.billing_status ?? "unknown"}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Device capacity</div>
                    <div className="mt-2 text-base font-semibold text-white">
                      {user?.host_count ?? 0} / {user?.profile.host_limit ?? 0}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Renewal window</div>
                    <div className="mt-2 text-base font-semibold text-white">
                      {formatDate(user?.profile.current_period_end ?? null)}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Next payment attempt</div>
                    <div className="mt-2 text-base font-semibold text-white">
                      {formatDate(user?.profile.next_payment_attempt ?? null)}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Invoice status</div>
                    <div className="mt-2 text-base font-semibold text-white">
                      {user?.profile.last_invoice_status || "No recent invoice event"}
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-[1.3rem] border border-emerald-300/14 bg-emerald-300/8 p-4 text-sm leading-7 text-emerald-50">
                  {user?.profile.subscription_active
                    ? "Your subscription is active. Use Stripe billing to change payment methods, move plans, or cancel cleanly."
                    : user?.profile.billing_ready
                      ? "Your account is ready for self-serve checkout. Activate billing to unlock the full paid workspace."
                      : "This environment is still configured for guided activation. Use the founder support path until live Stripe is plugged in."}
                </div>
                {user?.profile.billing_attention_required ? (
                  <div className="mt-4 rounded-[1.3rem] border border-amber-300/18 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
                    {user.profile.last_payment_error || "Billing needs attention before the workspace can safely expand."}
                    {user?.profile.billing_issue_url ? (
                      <>
                        {" "}
                        <a
                          href={user.profile.billing_issue_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-amber-200/30 underline-offset-4"
                        >
                          Open the latest Stripe invoice
                        </a>
                        .
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">What your plan unlocks</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Customer-facing entitlements, not vague marketing copy.
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                  <div className="kicker">Retention</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {user?.profile.retention_days ?? 0} days of historical telemetry
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                  <div className="kicker">Alert lane</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {user?.profile.alert_tier ?? "standard"} alert workflow
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                  <div className="kicker">Support path</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {user?.profile.priority_support ? "Priority support enabled" : "Standard response path"}
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                  <div className="kicker">Workspace seats</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {user?.profile.seat_limit ?? 1} seat{(user?.profile.seat_limit ?? 1) === 1 ? "" : "s"} available
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {planTiers.map((plan) => {
                const isCurrent = plan.name.toLowerCase() === currentPlan;
                const isDisabled = loadingPlan !== null;
                const targetPlan = (plan.name.toLowerCase() === "team" ? "team" : "pro") as
                  | "pro"
                  | "team";

                return (
                  <div
                    key={plan.name}
                    className={`panel rounded-[2rem] p-5 ${isCurrent ? "border-[rgba(119,224,195,0.24)]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-2xl font-semibold text-white">{plan.name}</div>
                        <div className="mt-2 text-sm leading-7 text-slate-400">{plan.description}</div>
                      </div>
                      {isCurrent ? (
                        <span className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-5 font-display text-4xl font-semibold text-white">
                      {plan.price}
                      <span className="ml-1 text-base font-medium text-slate-400">{plan.cadence}</span>
                    </div>
                    <div className="mt-5 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex gap-3 text-sm leading-6 text-slate-300">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={isCurrent || isDisabled || plan.name === "Free"}
                      onClick={() => void openBillingSurface(targetPlan)}
                      className={`mt-6 w-full justify-center ${plan.tone === "primary" ? "btn-primary" : "btn-secondary"} ${isCurrent || plan.name === "Free" ? "cursor-default opacity-60" : ""}`}
                    >
                      {isCurrent ? "Current plan" : plan.name === "Free" ? "Included" : `Switch to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Billing support path</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Direct help for rollout, invoicing, or plan changes.
                  </div>
                </div>
              </div>
              <div className="mt-5 text-sm leading-7 text-slate-300">
                If Stripe is not configured in this environment yet, HostLens still gives customers a clean
                contact path for founder-led rollout and manual activation.
              </div>
              <a
                href={`mailto:${salesEmail}?subject=HostLens%20billing%20support`}
                className="btn-secondary mt-6"
              >
                Contact billing support
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="panel rounded-[2rem] p-5">
              <div className="font-display text-2xl font-semibold text-white">Current commercial summary</div>
              <div className="mt-4 text-sm leading-7 text-slate-300">
                {currentTier.description}
              </div>
              <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <div className="kicker">Commercial snapshot</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="text-sm text-slate-300">Requested plan</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.profile.plan_label ?? currentTier.name}
                  </div>
                  <div className="text-sm text-slate-300">Subscription active</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.profile.subscription_active ? "Yes" : "No"}
                  </div>
                  <div className="text-sm text-slate-300">Stripe readiness</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.profile.billing_ready ? "Ready" : "Founder-managed"}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
