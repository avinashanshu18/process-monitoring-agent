"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import {
  createBillingPortalSession,
  createCheckoutSession,
} from "@/lib/billing-client";
import { salesEmail } from "@/lib/site-content";

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
  description: string;
  desktopSidebarOpen: boolean;
}

export function TopBar({
  onMenuClick,
  title,
  description,
  desktopSidebarOpen,
}: TopBarProps) {
  const { user } = useAuth();
  const router = useRouter();

  async function handleBillingClick() {
    if (!user) {
      router.push("/signup?plan=pro");
      return;
    }

    if (!user.profile.billing_ready) {
      window.location.href = `mailto:${salesEmail}?subject=HostLens%20plan%20activation`;
      return;
    }

    try {
      if (user.profile.subscription_active) {
        const session = await createBillingPortalSession();
        window.location.href = session.url;
        return;
      }

      const checkout = await createCheckoutSession(
        user.profile.requested_plan === "team" ? "team" : "pro",
      );
      window.location.href = checkout.url;
    } catch {
      router.push("/pricing");
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b border-white/8 bg-[#081019]/72 backdrop-blur-xl ${
        desktopSidebarOpen ? "lg:left-[320px]" : "lg:left-0"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-start justify-between gap-4 px-4 py-4 sm:px-5 lg:items-center lg:gap-6 lg:px-8">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-white/16 hover:bg-white/4 hover:text-white"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="font-display truncate text-xl font-semibold text-white sm:text-2xl">{title}</div>
            <div className="mt-1 hidden truncate text-sm text-slate-400 sm:block">{description}</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/22 bg-emerald-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 sm:flex">
            <Radar className="h-3.5 w-3.5" />
            Live workspace
          </div>
          {!user ? (
            <Link href="/pricing" className="btn-secondary hidden lg:inline-flex">
              <Sparkles className="h-4 w-4" />
              View pricing
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
          {!user ? (
            <button
              type="button"
              onClick={handleBillingClick}
              className="btn-primary px-4 py-3 text-sm sm:px-5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Upgrade</span>
              <span className="sm:hidden">Pro</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
