"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { planTiers, productName, salesEmail } from "@/lib/site-content";

const comparisonRows = [
  {
    label: "Devices included",
    values: ["2 devices", "8 devices", "25 devices"],
  },
  {
    label: "Live device and process view",
    values: ["Included", "Included", "Included"],
  },
  {
    label: "Checks and live response",
    values: ["Basic", "Advanced", "Advanced + shared workflow"],
  },
  {
    label: "History retention",
    values: ["24 hours", "30 days", "90 days"],
  },
  {
    label: "Onboarding",
    values: ["Self-serve", "Priority help", "Priority help + team rollout"],
  },
];

export function PricingPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <section className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <div className="eyebrow">Pricing and rollout</div>
            <h1 className="font-display mt-8 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              One clear commercial path for compact device fleets.
            </h1>
          </div>
          <div className="copy max-w-2xl text-lg leading-8">
            {productName} is intentionally narrow. You are not paying for generic observability,
            enterprise padding, or a monitoring surface made of filler. You are paying for faster,
            shared answers about what your devices are doing right now.
          </div>
        </section>

        <section className="mt-14 grid gap-6 xl:grid-cols-3">
          {planTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-[2rem] p-7 ${
                tier.featured ? "shell-frame" : "panel"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="kicker">{tier.name}</div>
                {tier.featured ? (
                  <div className="rounded-full border border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    Core offer
                  </div>
                ) : null}
              </div>
              <div className="mt-5 flex items-end gap-2">
                <div className="font-display text-5xl font-semibold text-white">{tier.price}</div>
                <div className="pb-2 text-sm text-slate-400">{tier.cadence}</div>
              </div>
              <div className="copy mt-4 text-sm leading-7">{tier.description}</div>
              <div className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                    <div className="text-sm text-slate-200">{feature}</div>
                  </div>
                ))}
              </div>
              <a
                href={tier.href}
                className={`mt-8 inline-flex ${
                  tier.tone === "primary" ? "btn-primary" : "btn-secondary"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel rounded-[2rem] p-7">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
              <div className="font-display text-2xl font-semibold text-white">How onboarding works</div>
            </div>
            <div className="copy mt-6 space-y-4 text-sm leading-7">
              <p>
                The product is sold as a web-first SaaS, but early customers still get rollout help
                with installer choice, first-device validation, and alert calibration.
              </p>
              <p>
                Billing is self-serve through Stripe Checkout and the billing portal. Rollout help stays
                available so buyers can get to first value without stalling during install.
              </p>
              <p>
                The Team plan at $39/month is the primary commercial path for small shared fleets. Pro
                remains a single-operator plan, and Free is for validation only.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href="/install" className="btn-secondary">
                  View install guide
                </Link>
                <a
                  href={`mailto:${salesEmail}?subject=HostLens%20rollout%20questions`}
                  className="btn-secondary"
                >
                  Ask rollout questions
                </a>
              </div>
            </div>
          </div>

          <div className="shell-frame overflow-hidden rounded-[2rem]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-6 py-5 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Capability
                  </th>
                  {planTiers.map((tier) => (
                    <th
                      key={tier.name}
                      className="px-6 py-5 text-xs uppercase tracking-[0.18em] text-slate-500"
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="table-row">
                    <td className="px-6 py-5 text-sm text-white">{row.label}</td>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${index}`} className="px-6 py-5 text-sm text-slate-300">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <div className="shell-frame flex flex-col gap-6 rounded-[2.2rem] px-7 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="font-display text-3xl font-semibold text-white">
                Want to see the rollout before you buy?
              </div>
              <div className="copy mt-3 max-w-2xl text-sm leading-7">
                The install path, onboarding kit, and live web workspace are already part of the product.
                Review the rollout first, then move into Team if the workflow fits.
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/install" className="btn-secondary">
                View install path
              </Link>
              <Link href="/signup?plan=team" className="btn-primary">
                Start Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
