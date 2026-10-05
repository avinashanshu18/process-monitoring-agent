"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, LogOut, Radar, ShieldCheck, Sparkles, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { appNavigation, productName, salesEmail } from "@/lib/site-content";

interface SidebarProps {
  isMobileOpen: boolean;
  desktopOpen: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

export function Sidebar({
  isMobileOpen,
  desktopOpen,
  onCloseMobile,
  onToggleDesktop,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [billingLoading, setBillingLoading] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/login");
    onCloseMobile();
  }

  async function handleBillingClick() {
    if (user) {
      router.push("/app/billing");
      onCloseMobile();
      return;
    }

    if (!user) {
      router.push("/signup?plan=pro");
      onCloseMobile();
      return;
    }
  }

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(340px,calc(100vw-20px))] transform overflow-y-auto border-r border-white/8 bg-[#071018]/92 px-4 py-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-300 sm:px-5 sm:py-5 lg:w-[320px] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <Link href="/" className="flex items-center gap-3" onClick={onCloseMobile}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-lg font-bold text-white">
                HL
              </div>
              <div>
                <div className="font-display text-xl font-semibold text-white">{productName}</div>
                <div className="mt-1 text-sm text-slate-400">Private device visibility SaaS</div>
              </div>
            </Link>
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleDesktop}
              className="hidden rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-white/16 hover:bg-white/4 hover:text-white lg:inline-flex"
              aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="panel-soft mt-6 rounded-[1.6rem] p-4 sm:mt-8 sm:rounded-[1.8rem] sm:p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              <Radar className="h-3.5 w-3.5" />
              Control rail
            </div>
            <div className="mt-3 font-display text-xl font-semibold text-white sm:text-2xl">
              See the device. Review the signal. Take action.
            </div>
            <div className="mt-3 text-sm leading-7 text-slate-400">
              The app workspace is intentionally narrow so it stays useful for real operators instead
              of dissolving into broad dashboard clutter.
            </div>
            {user ? (
              <div className="mt-5 flex items-center gap-3 rounded-[1.2rem] border border-white/8 bg-[#060b12] px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/6">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {user.full_name || user.username}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                    {user.profile.active_plan_label} workspace
                  </div>
                </div>
              </div>
            ) : null}
            {user ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/app/profile"
                  onClick={onCloseMobile}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-white/16 hover:bg-white/6"
                >
                  Profile
                </Link>
                <Link
                  href="/app/billing"
                  onClick={onCloseMobile}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-white/16 hover:bg-white/6"
                >
                  Billing
                </Link>
              </div>
            ) : null}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary mt-4 w-full justify-center"
              >
                <LogOut className="h-4 w-4" />
                Log out · {user.full_name || user.username}
              </button>
            ) : null}
          </div>

          <nav className="mt-6 space-y-2 sm:mt-8">
            {appNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 transition ${
                    isActive
                      ? "border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.09)] text-white"
                      : "border-transparent bg-white/0 text-slate-400 hover:border-white/8 hover:bg-white/4 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.6rem] border border-[rgba(119,224,195,0.16)] bg-[rgba(119,224,195,0.06)] p-4 sm:mt-auto sm:rounded-[1.8rem] sm:p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              {user?.profile.subscription_active ? "Billing" : "Founding plan"}
            </div>
            <div className="mt-3 font-display text-xl font-semibold text-white sm:text-2xl">
              {user?.profile.subscription_active
                ? `${user.profile.active_plan_label} active`
                : "$12 / month"}
            </div>
            <div className="mt-3 text-sm leading-7 text-slate-300">
              {user?.profile.subscription_active
                ? "Open Stripe billing to manage payment methods, upgrades, or cancellation."
                : user?.profile.billing_ready
                  ? "Up to 8 devices, alert review, and direct onboarding while the SaaS hardens around customer use."
                  : "Billing is still being activated in this environment, so upgrades route through direct founder support."}
            </div>
            <button
              type="button"
              onClick={handleBillingClick}
              disabled={billingLoading}
              className="btn-primary mt-5 w-full justify-center"
            >
              {billingLoading
                ? "Opening..."
                : user?.profile.subscription_active
                  ? "Open billing page"
                  : user?.profile.billing_ready
                    ? "Review billing"
                    : "Contact for Pro"}
            </button>
            {!user?.profile.subscription_active ? (
              <a
                href={`mailto:${salesEmail}?subject=HostLens%20guided%20rollout`}
                className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-slate-400 transition hover:text-white"
              >
                Need guided rollout instead?
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
