"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ShieldAlert } from "lucide-react";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  appHighlights,
  buyingTriggers,
  featureRows,
  operatingPrinciples,
  planTiers,
  productName,
  proofPoints,
  trustSignals,
} from "@/lib/site-content";

const previewProcesses = [
  { pid: 244, name: "launchd", cpu_percent: 1.4, memory_mb: 52.1 },
  { pid: 612, name: "Google Chrome", cpu_percent: 18.7, memory_mb: 924.4 },
  { pid: 842, name: "Slack", cpu_percent: 4.1, memory_mb: 512.3 },
  { pid: 991, name: "python3", cpu_percent: 7.8, memory_mb: 221.5 },
];

const previewAlerts = [
  "New process detected: ssh-agent",
  "CPU crossed the review threshold on the active device",
];

export function MarketingHome() {
  return (
    <MarketingShell>
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-8 lg:px-10 lg:pb-14 lg:pt-8">
          <div className="hero-stage rounded-[2.8rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
            <div className="floating-orb left-[-40px] top-10 h-48 w-48 bg-[rgba(119,224,195,0.18)]" />
            <div className="floating-orb bottom-8 right-[-24px] h-44 w-44 bg-[rgba(103,125,255,0.16)]" />

            <div className="relative grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
              <div className="fade-up lg:pt-6">
                <div className="eyebrow">Small-fleet device security visibility</div>
                <div className="mt-8 max-w-3xl">
                  <div className="font-display text-lg font-semibold tracking-[0.02em] text-[var(--color-accent)]">
                    {productName}
                  </div>
                  <h1 className="section-title mt-4 max-w-4xl">
                    See which device needs attention before it turns into a client escalation.
                  </h1>
                  <p className="section-copy mt-7 text-lg">
                    HostLens gives MSPs, agencies, and lean internal teams one web-first control room
                    for process visibility, policy checks, alert review, and remediation across their
                    most important devices.
                  </p>
                </div>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                  <Link href="/signup?plan=team" className="btn-primary w-full justify-center sm:w-auto">
                    Start Team
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/install" className="btn-secondary w-full justify-center sm:w-auto">
                    See the 10-minute rollout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  {proofPoints.map((item) => (
                    <div key={item.label} className="metric-chip">
                      <span className="signal-dot" />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                  {appHighlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="muted-frame rounded-[1.5rem] px-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/6 text-[var(--color-accent)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="font-display mt-4 text-lg font-semibold text-white">
                          {item.label}
                        </div>
                        <div className="copy mt-2 text-sm leading-7">{item.body}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="fade-up">
                <div className="shell-frame relative overflow-hidden rounded-[2.2rem] p-4 sm:p-5">
                  <div className="absolute inset-x-10 top-4 h-40 rounded-full bg-[radial-gradient(circle,_rgba(119,224,195,0.2),_transparent_64%)] blur-3xl" />
                  <div className="relative rounded-[1.7rem] border border-white/8 bg-[#04080f]/92 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-5">
                      <div>
                        <div className="kicker">Live workspace preview</div>
                        <div className="mt-2 font-display text-3xl font-semibold text-white">
                          Team workspace: client-facing operator laptop
                        </div>
                        <div className="mt-2 max-w-lg text-sm leading-7 text-slate-400">
                          The first screen should answer three questions immediately: what changed,
                          what matters, and what the operator should do next.
                        </div>
                      </div>
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        Status live
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                      <div className="muted-frame rounded-[1.6rem] p-5">
                        <div className="kicker">Current posture</div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <div className="text-sm text-slate-400">CPU pressure</div>
                            <div className="metric-value mt-2 text-white">24.2%</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-400">Memory pressure</div>
                            <div className="metric-value mt-2 text-white">63.8%</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-400">Risk level</div>
                            <div className="metric-value mt-2 text-white">High review</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-400">Processes tracked</div>
                            <div className="metric-value mt-2 text-white">287</div>
                          </div>
                        </div>

                        <div className="accent-divider mt-6" />

                        <div className="mt-5 space-y-3">
                          {previewAlerts.map((alert) => (
                            <div
                              key={alert}
                              className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white"
                            >
                              <div className="flex items-center gap-3">
                                <ShieldAlert className="h-4 w-4 text-[var(--color-signal)]" />
                                <span>{alert}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="muted-frame rounded-[1.6rem] p-5">
                          <div className="kicker">Top active processes</div>
                          <div className="mt-4 space-y-3">
                            {previewProcesses.map((process) => (
                              <div
                                key={process.pid}
                                className="grid gap-3 rounded-2xl border border-white/6 bg-white/3 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                              >
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-white">
                                    {process.name}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500">PID {process.pid}</div>
                                </div>
                                <div className="text-sm text-slate-300">
                                  {process.cpu_percent.toFixed(1)}% CPU
                                </div>
                                <div className="text-sm text-slate-300">
                                  {process.memory_mb.toFixed(1)} MB
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="muted-frame rounded-[1.6rem] p-5">
                            <div className="kicker">Buying reason</div>
                            <div className="mt-3 text-lg font-semibold text-white">
                              One device feels wrong
                            </div>
                            <div className="mt-2 text-sm leading-7 text-slate-400">
                              Buyers pay when the product helps them isolate that machine fast.
                            </div>
                          </div>
                          <div className="muted-frame rounded-[1.6rem] p-5">
                            <div className="kicker">Time to value</div>
                            <div className="mt-3 text-lg font-semibold text-white">
                              Under 10 minutes
                            </div>
                            <div className="mt-2 text-sm leading-7 text-slate-400">
                              Create account, activate plan, install agent, and watch the device appear in the workspace.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-strip">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-3 lg:px-10">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="flex gap-4">
                <div className="signal-dot mt-2" />
                <div>
                  <div className="kicker">{signal.label}</div>
                  <div className="mt-2 font-display text-xl font-semibold text-white">{signal.value}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">{signal.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <div className="eyebrow">Why teams buy this</div>
              <h2 className="section-title mt-8 max-w-3xl">
                Built for the exact moments when a $39 team plan is cheaper than uncertainty.
              </h2>
              <div className="section-copy mt-6">
                HostLens is intentionally narrow. That is the product advantage. Buyers do not have to
                fund an enterprise platform before they can answer a simple security question about a machine.
              </div>
              <div className="mt-8 space-y-4">
                {buyingTriggers.map((trigger) => (
                  <div key={trigger} className="muted-frame flex items-start gap-3 rounded-[1.5rem] px-4 py-4">
                    <Check className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                    <div className="text-sm leading-7 text-slate-200">{trigger}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {featureRows.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="shell-frame grid gap-5 rounded-[2rem] px-6 py-6 md:grid-cols-[auto_1fr_auto] md:items-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/8 bg-white/6 text-[var(--color-accent)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="kicker">0{index + 1}</div>
                      <div className="mt-2 font-display text-2xl font-semibold text-white">
                        {feature.title}
                      </div>
                      <div className="copy mt-3 max-w-2xl text-sm leading-7">{feature.body}</div>
                    </div>
                    <div className="hidden text-right md:block">
                      <div className="kicker">Outcome</div>
                      <div className="mt-2 max-w-xs text-sm leading-7 text-slate-300">
                        Faster clarity with less noise and less operational sprawl.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="shell-frame rounded-[2.5rem] px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div>
                <div className="eyebrow">Operating principles</div>
                <h2 className="font-display mt-7 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Premium does not mean louder. It means clearer, tighter, and more believable.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {operatingPrinciples.map((item) => (
                  <div key={item.label} className="muted-frame rounded-[1.6rem] px-5 py-5">
                    <div className="kicker">{item.label}</div>
                    <div className="mt-3 text-sm leading-7 text-slate-300">{item.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow">SaaS plans</div>
              <h2 className="font-display mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Start with one device, then move the whole response loop into the Team workspace.
              </h2>
            </div>
            <div className="max-w-xl text-sm leading-7 text-slate-400">
              Pricing stays narrow because the product is narrow. The Team plan is the main commercial
              offer for compact fleets that need shared visibility without enterprise procurement.
            </div>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {planTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-[2rem] p-7 ${
                  tier.featured ? "hero-stage" : "panel"
                }`}
              >
                {tier.featured ? (
                  <div className="mb-5 inline-flex rounded-full border border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] sm:absolute sm:right-6 sm:top-6 sm:mb-0">
                    Best start
                  </div>
                ) : null}
                <div className="kicker">{tier.name}</div>
                <div className="mt-4 flex items-end gap-2">
                  <div className="font-display text-4xl font-semibold text-white sm:text-5xl">{tier.price}</div>
                  <div className="pb-2 text-sm text-slate-400">{tier.cadence}</div>
                </div>
                <div className="copy mt-4 max-w-sm text-sm leading-7">{tier.description}</div>
                <div className="mt-7 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                      <div className="text-sm text-slate-200">{feature}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href={tier.href}
                  className={`mt-8 inline-flex w-full justify-center ${tier.tone === "primary" ? "btn-primary" : "btn-secondary"}`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="hero-stage rounded-[2.5rem] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="eyebrow">Ready for rollout</div>
                <div className="font-display mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Create an account, download the install kit, claim the device, and start operating.
                </div>
                <div className="copy mt-5 max-w-2xl text-lg leading-8">
                  The site now sells one coherent path from first impression to first live device.
                  That is the right shape for a focused SaaS trying to earn early paying customers.
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/signup?plan=pro" className="btn-primary w-full justify-center">
                  Start Pro
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/install" className="btn-secondary w-full justify-center">
                  Open install guide
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
