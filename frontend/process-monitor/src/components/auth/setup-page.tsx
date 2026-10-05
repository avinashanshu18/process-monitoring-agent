"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";

import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";
import {
  downloadJsonFile,
  fetchOnboardingKit,
  type OnboardingKit,
} from "@/lib/billing-client";

import { AuthShell } from "./auth-shell";
import { useAuth } from "./auth-provider";

async function claimDevice(
  payload: { agent_id: string; api_key: string; display_name: string },
  accessToken: string,
) {
  const response = await fetch(`${getApiBaseUrl()}/auth/claim-device/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) {
        message = body.detail;
      }
    } catch {
      // Keep generic fallback.
    }
    throw new Error(message);
  }

  return response.json();
}

const activationSteps = [
  {
    title: "Download the account config",
    body: "Use the account-bound config.json so the first device check-in attaches to your workspace automatically.",
  },
  {
    title: "Install and start the service",
    body: "Use the package or OS-specific rollout path and let the service publish its first secure snapshot.",
  },
  {
    title: "Wait for the first secure check-in",
    body: "This page polls your workspace and moves you into the app as soon as the first device is online.",
  },
];

function StatusPill({
  tone,
  children,
}: {
  tone: "live" | "waiting";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
        tone === "live"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
          : "border-sky-300/20 bg-sky-300/10 text-sky-100"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          tone === "live" ? "bg-emerald-300" : "bg-sky-300"
        }`}
      />
      {children}
    </div>
  );
}

export function SetupPage() {
  const { ready, isAuthenticated, user, refreshUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    agent_id: "",
    api_key: "",
    display_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<OnboardingKit | null>(null);
  const [kitError, setKitError] = useState("");
  const [kitLoading, setKitLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showManualClaim, setShowManualClaim] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login?next=%2Fsetup");
      return;
    }
    if (ready && user && user.host_count > 0) {
      router.replace("/app");
    }
  }, [isAuthenticated, ready, router, user]);

  useEffect(() => {
    let active = true;

    async function loadKit() {
      if (!isAuthenticated) {
        return;
      }
      setKitLoading(true);
      setKitError("");
      try {
        const nextKit = await fetchOnboardingKit();
        if (active) {
          setKit(nextKit);
        }
      } catch (nextError) {
        if (active) {
          setKitError(
            nextError instanceof Error ? nextError.message : "Unable to load onboarding kit.",
          );
        }
      } finally {
        if (active) {
          setKitLoading(false);
        }
      }
    }

    void loadKit();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!ready || !isAuthenticated || !user || user.host_count > 0) {
      return;
    }

    const interval = window.setInterval(() => {
      void refreshUser();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isAuthenticated, ready, refreshUser, user]);

  const activationState = useMemo(() => {
    if (!user) {
      return {
        tone: "waiting" as const,
        label: "Preparing workspace",
        body: "Loading your account, billing state, and install surface.",
      };
    }

    if (user.host_count > 0) {
      return {
        tone: "live" as const,
        label: "Device online",
        body: "Your first device is connected. Opening the workspace now.",
      };
    }

    return {
      tone: "waiting" as const,
      label: "Waiting for first secure check-in",
      body: "Install the service with the account config below. This page refreshes automatically every 5 seconds.",
    };
  }, [user]);

  async function handleRefresh() {
    setIsRefreshing(true);
    setError("");
    try {
      await refreshUser();
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await claimDevice(form, accessToken);
      await refreshUser();
      router.replace("/app");
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Unable to claim device.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyKey() {
    if (!kit) {
      return;
    }
    await navigator.clipboard.writeText(kit.onboarding_api_key);
    setCopiedKey(true);
    window.setTimeout(() => setCopiedKey(false), 1600);
  }

  return (
    <AuthShell
      title="Activate your first device."
      description="This is the final activation step. Download the config, install the service, and let HostLens move the device into the workspace automatically."
      footer={
        <div className="space-y-5 text-sm text-slate-400">
          <div className="grid gap-4 sm:grid-cols-3">
            {activationSteps.map((step, index) => (
              <div key={step.title} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                <div className="kicker">0{index + 1}</div>
                <div className="mt-3 font-display text-lg font-semibold text-white">{step.title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/install" className="btn-secondary">
              Open install guide
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/app" className="btn-secondary">
              Open workspace
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-[1.8rem] border border-white/8 bg-[#050a10]/75 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="kicker">Activation state</div>
              <div className="mt-3 font-display text-3xl font-semibold text-white">
                {activationState.label}
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                {activationState.body}
              </p>
            </div>
            <StatusPill tone={activationState.tone}>{activationState.label}</StatusPill>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
              <div className="kicker">Plan</div>
              <div className="mt-2 font-display text-2xl font-semibold text-white">
                {user?.profile.plan_label ?? "Loading"}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                {user ? `${user.profile.host_limit} device capacity` : "Account sync in progress"}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
              <div className="kicker">Devices connected</div>
              <div className="mt-2 font-display text-2xl font-semibold text-white">
                {user?.host_count ?? 0}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                {user
                  ? `${Math.max(user.profile.host_limit - user.host_count, 0)} remaining on this plan`
                  : "Waiting for workspace sync"}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
              <div className="kicker">Detection loop</div>
              <div className="mt-2 font-display text-2xl font-semibold text-white">Every 5s</div>
              <div className="mt-2 text-sm text-slate-400">
                This page refreshes automatically until your first device is visible.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="kicker">Recommended path</div>
                <div className="mt-3 font-display text-2xl font-semibold text-white">
                  Install with the account-bound config
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  The config already contains your onboarding key. The first agent upload auto-assigns
                  the device into this workspace and rotates into a host-specific API key behind the scenes.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => kit && downloadJsonFile("hostlens-config.json", kit.config)}
                disabled={!kit || kitLoading}
                className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {kitLoading ? "Preparing..." : "Download config.json"}
                <Download className="h-4 w-4" />
              </button>
              <Link href="/install" className="btn-secondary w-full justify-center sm:w-auto">
                Open install instructions
                <TerminalSquare className="h-4 w-4" />
              </Link>
              <button type="button" onClick={handleRefresh} className="btn-secondary" disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh now
                  </>
                )}
              </button>
            </div>

            {kitError ? (
              <div className="mt-4 rounded-2xl border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {kitError}
              </div>
            ) : null}

            {kit ? (
              <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-[#050a10]/75 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="kicker">Onboarding key</div>
                    <div className="mt-3 break-all font-mono text-sm text-white">
                      {kit.onboarding_api_key}
                    </div>
                  </div>
                  <button type="button" onClick={handleCopyKey} className="btn-secondary">
                    <Copy className="h-4 w-4" />
                    {copiedKey ? "Copied" : "Copy key"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
            <div className="kicker">What happens after install</div>
            <div className="mt-3 font-display text-2xl font-semibold text-white">
              The first check-in completes activation
            </div>
            <div className="mt-4 space-y-4">
              {[
                "The agent boots with your onboarding key and publishes its first snapshot.",
                "HostLens creates the device identity, assigns it to your account, and issues a host-specific key.",
                "This page refreshes, detects the connected device, and routes you into the app.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-[var(--color-accent)]" />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-[#050a10]/75 p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[var(--color-signal)]" />
                <div className="text-sm font-semibold text-white">Legacy recovery path</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Only use manual claim if you already ran the agent with a host-specific key or you are
                attaching an older device that predates the current onboarding flow.
              </p>
              <button
                type="button"
                onClick={() => setShowManualClaim((current) => !current)}
                className="btn-secondary mt-4"
              >
                {showManualClaim ? "Hide manual claim" : "Use manual claim instead"}
              </button>
            </div>
          </div>
        </section>

        {showManualClaim ? (
          <section className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
            <div className="kicker">Manual claim</div>
            <div className="mt-3 font-display text-2xl font-semibold text-white">
              Claim an existing device the old way
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Use this only when you already have the device agent ID and the host API key from a prior
              agent run. New installs should use the automatic onboarding path above.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="kicker">Agent ID</span>
                <input
                  required
                  value={form.agent_id}
                  onChange={(event) => setForm((current) => ({ ...current, agent_id: event.target.value }))}
                  placeholder="persistent device identifier from config.json"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                />
              </label>

              <label className="block">
                <span className="kicker">Host API key</span>
                <input
                  required
                  value={form.api_key}
                  onChange={(event) => setForm((current) => ({ ...current, api_key: event.target.value }))}
                  placeholder="issued after the first upload on older installs"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                />
              </label>

              <label className="block">
                <span className="kicker">Display name</span>
                <input
                  value={form.display_name}
                  onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))}
                  placeholder="Founder MacBook Pro"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
                {loading ? "Claiming device..." : "Claim device manually"}
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </AuthShell>
  );
}
