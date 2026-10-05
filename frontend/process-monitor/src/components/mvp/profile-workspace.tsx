"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Mail, ShieldCheck, UserRound, Wallet } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/auth/auth-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

export default function ProfileWorkspace() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <LayoutWrapper
        title="Profile workspace"
        description="Account identity, workspace posture, and the controls that matter before you operate a fleet."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
              <div>
                <div className="eyebrow">Account identity</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Your operator profile should explain who owns the workspace at a glance.
                </div>
                <div className="section-copy mt-4 text-base">
                  This page keeps identity, commercial posture, and rollout status visible without
                  forcing you to hunt through raw settings forms.
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/app/billing" className="btn-primary">
                    <Wallet className="h-4 w-4" />
                    Open billing workspace
                  </Link>
                  <Link href="/settings" className="btn-secondary">
                    Alert settings
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/6">
                    <UserRound className="h-8 w-8 text-[var(--color-accent)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-2xl font-semibold text-white">
                      {user?.full_name || user?.username || "Operator"}
                    </div>
                    <div className="mt-1 truncate text-sm text-slate-400">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Username</div>
                    <div className="mt-2 text-sm font-semibold text-white">{user?.username ?? "n/a"}</div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Workspace role</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {user?.team_role ?? "owner"}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Created</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {formatDate(user?.profile.created_at ?? null)}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Last plan update</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {formatDate(user?.profile.updated_at ?? null)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Account summary</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Identity and commercial posture in one place.
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="text-sm text-slate-300">Full name</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.full_name || "Not set"}
                  </div>
                  <div className="text-sm text-slate-300">Email address</div>
                  <div className="text-right text-sm font-semibold text-white">{user?.email ?? "n/a"}</div>
                  <div className="text-sm text-slate-300">Requested plan</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.profile.plan_label ?? "n/a"}
                  </div>
                  <div className="text-sm text-slate-300">Active plan</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.profile.active_plan_label ?? "n/a"}
                  </div>
                  <div className="text-sm text-slate-300">Billing status</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.profile.billing_status ?? "unknown"}
                  </div>
                  <div className="text-sm text-slate-300">Teammate seats</div>
                  <div className="text-right text-sm font-semibold text-white">
                    {user?.profile.seat_limit ?? 1}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="panel rounded-[2rem] p-5">
                <div className="font-display text-2xl font-semibold text-white">Workspace posture</div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Devices in workspace</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{user?.host_count ?? 0}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                      of {user?.profile.host_limit ?? 0} available
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Retention</div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {user?.profile.retention_days ?? 0}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">days of history</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Alert lane</div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {user?.profile.alert_tier ?? "standard"}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                      monitoring posture
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel rounded-[2rem] p-5">
                <div className="font-display text-2xl font-semibold text-white">Next account actions</div>
                <div className="mt-5 space-y-3">
                  <Link
                    href="/setup"
                    className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-4 text-white transition hover:border-white/14 hover:bg-white/5"
                  >
                    <div>
                      <div className="text-sm font-semibold">Review onboarding</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Generate config and claim the next device cleanly.
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/app/team"
                    className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-4 text-white transition hover:border-white/14 hover:bg-white/5"
                  >
                    <div>
                      <div className="text-sm font-semibold">Review team access</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Add teammates or verify the current role layout.
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <a
                    href={`mailto:${user?.email ?? ""}`}
                    className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-4 text-white transition hover:border-white/14 hover:bg-white/5"
                  >
                    <div>
                      <div className="text-sm font-semibold">Confirm account inbox</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Keep the primary workspace email reachable for notifications.
                      </div>
                    </div>
                    <Mail className="h-4 w-4 text-slate-400" />
                  </a>
                </div>
              </div>

              <div className="panel rounded-[2rem] p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="font-display text-2xl font-semibold text-white">Operator note</div>
                    <div className="mt-1 text-sm text-slate-400">
                      The account layer is intentionally compact.
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm leading-7 text-slate-300">
                  HostLens keeps profile data limited to what helps an operator understand ownership,
                  plan posture, and notification identity. The product stays focused on device visibility,
                  not social-profile clutter.
                </div>
              </div>
            </div>
          </section>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
