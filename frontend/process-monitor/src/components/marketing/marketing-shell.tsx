"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { productName, salesEmail } from "@/lib/site-content";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="site-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#081019]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-sm font-black text-white shadow-[0_12px_32px_rgba(0,0,0,0.24)]">
              HL
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg font-bold tracking-tight text-white">
                {productName}
              </div>
              <div className="truncate text-xs text-slate-400">
                Private device visibility for operator-owned fleets
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="/#features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="/install" className="transition hover:text-white">
              Install
            </Link>
            <Link href="/#pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/app" className="transition hover:text-white">
              Workspace
            </Link>
            <Link href="/login" className="transition hover:text-white">
              Sign in
            </Link>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="metric-chip hidden xl:inline-flex">
              <span className="signal-dot" />
              Team-ready web SaaS
            </div>
            <Link href="/login" className="btn-secondary hidden sm:inline-flex">
              Sign in
            </Link>
            <Link href="/signup?plan=team" className="btn-primary">
              Start Team
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex rounded-full border border-white/10 bg-white/4 p-2 text-slate-200 transition hover:bg-white/8 sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/8 px-4 py-4 sm:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200"
              >
                Features
              </Link>
              <Link
                href="/install"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200"
              >
                Install
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200"
              >
                Pricing
              </Link>
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200"
              >
                Workspace
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200"
              >
                Sign in
              </Link>
              <Link
                href="/signup?plan=team"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full justify-center"
              >
                Start Team
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      {children}

      <footer className="border-t border-white/8 bg-black/24">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.8fr_0.8fr_auto]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-lg font-bold text-white">
                  HL
                </div>
                <div>
                  <div className="font-display text-base font-semibold text-white">{productName}</div>
                  <div className="text-xs text-slate-400">Private device visibility SaaS</div>
                </div>
              </div>
              <div className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Built for agencies, MSPs, and lean internal teams that need fast answers about which
                device changed, why it matters, and whether someone already handled it.
              </div>
            </div>

            <div>
              <div className="kicker">Product</div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
                <Link href="/#features" className="transition hover:text-white">
                  Features
                </Link>
                <Link href="/install" className="transition hover:text-white">
                  Install
                </Link>
                <Link href="/pricing" className="transition hover:text-white">
                  Pricing
                </Link>
                <Link href="/app" className="transition hover:text-white">
                  Workspace
                </Link>
                <Link href="/login" className="transition hover:text-white">
                  Sign in
                </Link>
              </div>
            </div>

            <div>
              <div className="kicker">Company</div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
                <Link href="/install" className="transition hover:text-white">
                  Install guide
                </Link>
                <Link href="/pricing" className="transition hover:text-white">
                  Plans
                </Link>
                <a href={`mailto:${salesEmail}`} className="break-all transition hover:text-white">
                  {salesEmail}
                </a>
                <span className="text-slate-500">Founder onboarding for early customers</span>
              </div>
            </div>

            <div className="panel-soft rounded-[1.7rem] px-5 py-5">
              <div className="kicker">Next step</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                Create a Team account, activate billing, install the agent, and get the first device visible in one flow.
              </div>
              <Link href="/signup?plan=team" className="btn-primary mt-5 w-full justify-center">
                Start Team
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Responsive web SaaS for private device visibility.</span>
            <span>Web workspace first. Mobile companion later.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
