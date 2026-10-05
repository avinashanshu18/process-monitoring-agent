"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  LaptopMinimal,
  MonitorSmartphone,
  Server,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  createBillingPortalSession,
  createCheckoutSession,
  downloadJsonFile,
  fetchOnboardingKit,
  rotateOnboardingKey,
  type OnboardingKit,
} from "@/lib/billing-client";
import { planTiers, productName, salesEmail } from "@/lib/site-content";

type ReleaseArtifact = {
  filename: string;
  label: string;
  kind: string;
  target: string;
  sha256: string;
  size_bytes: number;
  url: string;
  signed?: boolean;
  notarized?: boolean;
  signature_label?: string;
};

type ReleaseManifest = {
  version: string;
  generated_at: string;
  artifacts: Record<string, ReleaseArtifact>;
};

const installTargets = [
  {
    id: "macos",
    label: "macOS",
    icon: Apple,
    headline: "Installer-package rollout for operator laptops and personal Mac fleets.",
    supporting:
      "Best for founder laptops, consulting machines, and managed personal devices where buyers expect a real installer instead of a raw binary.",
    primaryDownloadKey: "macos_pkg",
    artifactKey: "macos_pkg",
    installerKey: "macos",
    downloadKeys: ["macos_pkg", "macos_universal", "macos_arm64", "macos_amd64"],
    serviceLabel: "pkg + launch daemon",
    serviceNote: "The package installs the agent, daemon registration, and hostlensctl helper. Raw binaries stay available as fallback assets only.",
  },
  {
    id: "linux",
    label: "Linux",
    icon: Server,
    headline: "Systemd rollout for servers, VPS nodes, and compact internal fleets.",
    supporting:
      "Best for always-on hosts where service behavior, repeatability, and clear ownership matter more than a quick terminal script.",
    primaryDownloadKey: "linux_amd64",
    artifactKey: "linux_amd64",
    installerKey: "linux",
    downloadKeys: ["linux_amd64"],
    serviceLabel: "systemd",
    serviceNote: "Current release targets amd64 Linux hosts and keeps config and binary in a single controlled install path.",
  },
  {
    id: "windows",
    label: "Windows",
    icon: LaptopMinimal,
    headline: "Windows rollout for workstations and support-heavy operator environments.",
    supporting:
      "Best for workstations that need a real always-on Windows service instead of a scheduled-task workaround.",
    primaryDownloadKey: "windows_service",
    artifactKey: "windows_service",
    installerKey: "windows",
    downloadKeys: ["windows_service", "windows_amd64"],
    serviceLabel: "native Windows service",
    serviceNote: "The release now includes a first-party service wrapper that starts the Go agent under LocalSystem and removes the Task Scheduler dependency.",
  },
] as const;

const rolloutReasons = [
  "Account-bound config.json generated from the web app",
  "Installer and binary downloads with published SHA256 checksums",
  "Stable release channel with manifest-driven auto-update and service-based rollout",
];

const handoffSteps = [
  {
    title: "Create or upgrade the account",
    body: "Choose the plan that matches your device count so billing, retention, and rollout line up from the first click.",
  },
  {
    title: "Download the installer and config",
    body: "Grab the right artifact, save the account-bound config.json, and verify the checksum before install.",
  },
  {
    title: "Wait for automatic activation",
    body: "The first secure check-in attaches the device to your workspace and hands off to the web app for alert review and action.",
  },
];

function formatBytes(value: number | null | undefined) {
  if (!value) {
    return "n/a";
  }

  const units = ["B", "KB", "MB", "GB"];
  let current = value;
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current.toFixed(current >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function buildCommands(
  target: (typeof installTargets)[number],
  kit: OnboardingKit | null,
  artifact: ReleaseArtifact | null,
) {
  const binary = kit?.downloads[target.primaryDownloadKey];
  const checksumsUrl = kit?.checksums_url;

  if (!binary || !checksumsUrl) {
    return {
      downloadCommand: "Sign in to load the account-bound install commands and release assets.",
      verifyCommand: "SHA256 verification details appear after the onboarding kit loads.",
      installCommand: "The final service install command appears after you generate the config.json from the web app.",
    };
  }

  const installer = kit?.installers[target.installerKey];
  if (!installer) {
    return {
      downloadCommand: "The release binary is ready, but the installer is still being prepared for this platform.",
      verifyCommand: "SHA256 verification details appear after the onboarding kit loads.",
      installCommand: "Install instructions appear after the platform installer metadata is available.",
    };
  }

  if (target.id === "macos") {
    return {
      downloadCommand: `mkdir -p "$HOME/Downloads/HostLens" && cd "$HOME/Downloads/HostLens"
curl -L "${binary.url}" -o HostLens-macOS-Installer.pkg
curl -L "${checksumsUrl}" -o hostlens-checksums.txt`,
      verifyCommand: `grep "HostLens-macOS-Installer.pkg" hostlens-checksums.txt
shasum -a 256 HostLens-macOS-Installer.pkg
# compare against ${artifact?.sha256 ?? "the published SHA256 in the release rail"}`,
      installCommand: `sudo installer -pkg "$HOME/Downloads/HostLens/HostLens-macOS-Installer.pkg" -target /
sudo hostlensctl import-config "$HOME/Downloads/hostlens-config.json"`,
    };
  }

  if (target.id === "linux") {
    return {
      downloadCommand: `mkdir -p "$HOME/hostlens-release" && cd "$HOME/hostlens-release"
curl -L "${binary.url}" -o hostlens-agent
curl -L "${installer.url}" -o install-linux.sh
curl -L "${checksumsUrl}" -o hostlens-checksums.txt
chmod +x hostlens-agent install-linux.sh`,
      verifyCommand: `grep "hostlens-agent-linux-amd64" hostlens-checksums.txt
sha256sum hostlens-agent
# compare against ${artifact?.sha256 ?? "the published SHA256 in the release rail"}`,
      installCommand: `sudo bash install-linux.sh ./hostlens-agent "$HOME/Downloads/hostlens-config.json"`,
    };
  }

  const windowsAgent = kit?.downloads.windows_amd64;
  const windowsService = kit?.downloads.windows_service;
  if (!windowsAgent || !windowsService) {
    return {
      downloadCommand: "The Windows release bundle is still syncing. Refresh once the service wrapper artifacts are available.",
      verifyCommand: "SHA256 verification details appear after the onboarding kit loads.",
      installCommand: "Install instructions appear after the Windows service wrapper is published.",
    };
  }

  return {
    downloadCommand: `New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\\hostlens-release" | Out-Null
Set-Location "$env:USERPROFILE\\hostlens-release"
Invoke-WebRequest "${windowsAgent.url}" -OutFile "hostlens-agent.exe"
Invoke-WebRequest "${windowsService.url}" -OutFile "hostlens-service.exe"
Invoke-WebRequest "${installer.url}" -OutFile "install-windows.ps1"
Invoke-WebRequest "${checksumsUrl}" -OutFile "hostlens-checksums.txt"`,
    verifyCommand: `Select-String "hostlens-agent-windows-amd64.exe" .\\hostlens-checksums.txt
Select-String "hostlens-service-windows-amd64.exe" .\\hostlens-checksums.txt
Get-FileHash .\\hostlens-agent.exe -Algorithm SHA256
Get-FileHash .\\hostlens-service.exe -Algorithm SHA256
# compare against the published SHA256 values in hostlens-checksums.txt`,
    installCommand: `powershell -ExecutionPolicy Bypass -File .\\install-windows.ps1 -BinaryPath .\\hostlens-agent.exe -ServiceBinaryPath .\\hostlens-service.exe -ConfigPath "$env:USERPROFILE\\Downloads\\hostlens-config.json"`,
  };
}

function CommandCard({
  title,
  command,
  accent,
}: {
  title: string;
  command: string;
  accent: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="panel rounded-[1.8rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="kicker">{title}</div>
          <div className="mt-2 text-sm text-slate-400">Operator-ready command block</div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-white/16 hover:bg-white/8"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className={`mt-4 h-px w-full bg-gradient-to-r ${accent}`} />
      <pre className="mt-4 overflow-x-auto rounded-[1.3rem] border border-white/6 bg-[#050a10] px-4 py-4 text-[0.8rem] leading-7 text-slate-200">
        <code>{command}</code>
      </pre>
    </div>
  );
}

type InstallTargetId = (typeof installTargets)[number]["id"];

export function InstallPage({ checkoutStatus }: { checkoutStatus?: string }) {
  const { user, refreshUser } = useAuth();
  const [activeTarget, setActiveTarget] = useState<InstallTargetId>("macos");
  const [kit, setKit] = useState<OnboardingKit | null>(null);
  const [kitLoading, setKitLoading] = useState(false);
  const [kitError, setKitError] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [releaseManifest, setReleaseManifest] = useState<ReleaseManifest | null>(null);

  const currentTarget =
    installTargets.find((target) => target.id === activeTarget) ?? installTargets[0];

  const selectedDownloads = currentTarget.downloadKeys
    .map((key) => kit?.downloads[key])
    .filter((download): download is OnboardingKit["downloads"][string] => Boolean(download));

  const selectedArtifact = useMemo(
    () => releaseManifest?.artifacts[currentTarget.artifactKey] ?? null,
    [currentTarget.artifactKey, releaseManifest],
  );

  const commands = useMemo(
    () => buildCommands(currentTarget, kit, selectedArtifact),
    [currentTarget, kit, selectedArtifact],
  );

  useEffect(() => {
    let active = true;

    async function loadReleaseManifest() {
      try {
        const response = await fetch("/downloads/release-manifest.json", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as ReleaseManifest;
        if (active) {
          setReleaseManifest(payload);
        }
      } catch {
        // The UI still works without release metadata.
      }
    }

    void loadReleaseManifest();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadKit() {
      if (!user) {
        setKit(null);
        setKitError("");
        return;
      }

      setKitLoading(true);
      setKitError("");
      try {
        if (checkoutStatus === "success") {
          await refreshUser();
        }
        const nextKit = await fetchOnboardingKit();
        if (active) {
          setKit(nextKit);
        }
      } catch (error) {
        if (active) {
          setKitError(error instanceof Error ? error.message : "Unable to load onboarding kit.");
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
  }, [checkoutStatus, refreshUser, user]);

  async function handleBillingAction() {
    if (!user) {
      return;
    }

    if (!user.profile.billing_ready) {
      window.location.href = `mailto:${salesEmail}?subject=HostLens%20plan%20activation`;
      return;
    }

    setBillingLoading(true);
    setKitError("");
    try {
      if (user.profile.subscription_active) {
        const portal = await createBillingPortalSession();
        window.location.href = portal.url;
        return;
      }

      const checkout = await createCheckoutSession(
        user.profile.requested_plan === "team" ? "team" : "pro",
      );
      window.location.href = checkout.url;
    } catch (error) {
      setKitError(error instanceof Error ? error.message : "Unable to open billing.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleRotateKey() {
    setKitLoading(true);
    setKitError("");
    try {
      const nextKit = await rotateOnboardingKey();
      setKit(nextKit);
    } catch (error) {
      setKitError(error instanceof Error ? error.message : "Unable to rotate onboarding key.");
    } finally {
      setKitLoading(false);
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

  const CurrentIcon = currentTarget.icon;

  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pb-28 lg:pt-10">
        {checkoutStatus === "success" ? (
          <section className="mb-8">
            <div className="rounded-[1.8rem] border border-emerald-400/18 bg-emerald-400/10 px-6 py-5 text-sm text-emerald-100">
              Stripe checkout completed. Your plan is syncing now. Download the agent, save the config,
              and finish the first rollout below.
            </div>
          </section>
        ) : null}
        {checkoutStatus === "canceled" ? (
          <section className="mb-8">
            <div className="rounded-[1.8rem] border border-amber-300/18 bg-amber-300/10 px-6 py-5 text-sm text-amber-100">
              Checkout was canceled. Your account is still ready, and you can restart billing whenever
              you want.
            </div>
          </section>
        ) : null}
        {checkoutStatus === "manual" ? (
          <section className="mb-8">
            <div className="rounded-[1.8rem] border border-sky-300/18 bg-sky-300/10 px-6 py-5 text-sm text-sky-100">
              Your account is ready. Billing is not live in this environment yet, so continue with the
              install flow and use the upgrade/contact path when you want plan activation.
            </div>
          </section>
        ) : null}

        <section className="hero-stage rounded-[2.6rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="fade-up lg:pt-4">
              <div className="eyebrow">Install HostLens</div>
              <h1 className="section-title mt-8 max-w-4xl">
                From signup to first device in under 10 minutes.
              </h1>
              <p className="section-copy mt-7 text-lg">
                This flow treats rollout as part of the product: activate billing, download the right
                installer, save the account config, verify the checksum, and let the first secure check-in
                light up the workspace.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => kit && downloadJsonFile("hostlens-config.json", kit.config)}
                      disabled={!kit}
                      className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      Download config.json
                      <Download className="h-4 w-4" />
                    </button>
                    <Link href="/setup" className="btn-secondary w-full justify-center sm:w-auto">
                      Claim a device
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup?plan=team" className="btn-primary w-full justify-center sm:w-auto">
                      Start Team
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link href="/pricing" className="btn-secondary w-full justify-center sm:w-auto">
                      Review pricing
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {rolloutReasons.map((reason) => (
                  <div key={reason} className="muted-frame rounded-[1.5rem] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                      <div className="text-sm leading-7 text-slate-200">{reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up">
              <div className="shell-frame rounded-[2.2rem] p-4 sm:p-5">
                <div className="rounded-[1.8rem] border border-white/8 bg-[#050a10]/92 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-5">
                    <div>
                      <div className="kicker">Release rail</div>
                      <div className="mt-2 font-display text-3xl font-semibold text-white">
                        Customer install surface
                      </div>
                      <div className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                        A buyer should understand the billing state, trust state, and next click without
                        reading the repo or asking for rollout help.
                      </div>
                    </div>
                    <div className="rounded-full border border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      {releaseManifest ? `Release ${releaseManifest.version}` : "Release assets"}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="muted-frame rounded-[1.6rem] p-5">
                      <div className="kicker">Account status</div>
                      <div className="mt-3 font-display text-2xl font-semibold text-white">
                        {user ? `${user.profile.plan_label} workspace` : "Sign in to generate the install kit"}
                      </div>
                      <div className="mt-3 text-sm leading-7 text-slate-300">
                        {kitLoading
                          ? "Preparing your onboarding key and config..."
                          : kit
                            ? `${kit.plan_label} plan · ${kit.billing_status} billing state`
                            : "The account-bound config.json appears here after sign-in."}
                      </div>
                    </div>

                    <div className="muted-frame rounded-[1.6rem] p-5">
                      <div className="kicker">Installer trust</div>
                      <div className="mt-3 font-display text-2xl font-semibold text-white">
                        {selectedArtifact?.signature_label || (selectedArtifact ? "Verification published" : "Release metadata loading")}
                      </div>
                      <div className="mt-3 text-sm leading-7 text-slate-300">
                        {selectedArtifact
                          ? `${selectedArtifact.label} · ${formatBytes(selectedArtifact.size_bytes)} · SHA256 published`
                          : "Checksum and artifact size appear here once the release manifest is available."}
                      </div>
                    </div>
                  </div>

                  {selectedArtifact ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Signed</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {selectedArtifact.signed ? "Yes" : "Not in this environment"}
                        </div>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Notarized</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {selectedArtifact.notarized ? "Yes" : "Pending credentials"}
                        </div>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Checksum</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {selectedArtifact.sha256.slice(0, 12)}...
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {kitError ? (
                    <div className="mt-4 rounded-2xl border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                      {kitError}
                    </div>
                  ) : null}

                  {user?.profile.billing_attention_required ? (
                    <div className="mt-4 rounded-[1.6rem] border border-amber-300/18 bg-amber-300/10 px-5 py-4 text-sm leading-7 text-amber-100">
                      Billing needs attention{user.profile.last_payment_error ? `: ${user.profile.last_payment_error}` : "."}{" "}
                      Use the billing action to update payment details before adding more devices.
                    </div>
                  ) : null}

                  {user ? (
                    <div className="mt-4 rounded-[1.7rem] border border-white/8 bg-white/4 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="kicker">Onboarding API key</div>
                          <div className="mt-3 break-all font-mono text-sm text-white">
                            {kit?.onboarding_api_key ?? "Waiting for onboarding kit..."}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button type="button" onClick={handleCopyKey} className="btn-secondary" disabled={!kit}>
                            <Copy className="h-4 w-4" />
                            {copiedKey ? "Copied" : "Copy key"}
                          </button>
                          <button
                            type="button"
                            onClick={handleRotateKey}
                            className="btn-secondary"
                            disabled={kitLoading}
                          >
                            Rotate key
                          </button>
                          <button
                            type="button"
                            onClick={handleBillingAction}
                            disabled={billingLoading}
                            className="btn-secondary"
                          >
                            {billingLoading
                              ? "Opening..."
                              : user.profile.subscription_active
                                ? "Manage billing"
                                : user.profile.billing_ready
                                  ? "Activate billing"
                                  : "Contact sales"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CurrentIcon className="h-5 w-5 text-[var(--color-accent)]" />
              <div>
              <div className="kicker">Platform rollout</div>
                <div className="mt-2 font-display text-2xl font-semibold text-white">
                  {currentTarget.label} install path
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {installTargets.map((target) => {
                const Icon = target.icon;
                const isActive = target.id === currentTarget.id;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setActiveTarget(target.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-[rgba(119,224,195,0.26)] bg-[rgba(119,224,195,0.1)] text-white"
                        : "border-white/10 bg-white/4 text-slate-300 hover:border-white/16 hover:bg-white/7"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {target.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 text-sm leading-7 text-slate-300">{currentTarget.headline}</div>
            <div className="mt-3 text-sm leading-7 text-slate-400">{currentTarget.supporting}</div>

              <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-white/4 p-4">
              <div className="kicker">Service model</div>
              <div className="mt-2 font-display text-xl font-semibold text-white">
                {currentTarget.serviceLabel}
              </div>
              <div className="mt-2 text-sm leading-7 text-slate-400">{currentTarget.serviceNote}</div>
            </div>

            <div className="mt-6 space-y-3">
              {selectedDownloads.map((download) => (
                <a
                  key={download.url}
                  href={download.url}
                  download={download.filename}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200 transition hover:border-white/16 hover:bg-white/6"
                >
                  <span>{download.label}</span>
                  <Download className="h-4 w-4" />
                </a>
              ))}
              {kit?.installers[currentTarget.installerKey] ? (
                <a
                  href={kit.installers[currentTarget.installerKey].url}
                  download={kit.installers[currentTarget.installerKey].filename}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200 transition hover:border-white/16 hover:bg-white/6"
                >
                  <span>{kit.installers[currentTarget.installerKey].label}</span>
                  <Download className="h-4 w-4" />
                </a>
              ) : null}
              {kit?.checksums_url ? (
                <a
                  href={kit.checksums_url}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200 transition hover:border-white/16 hover:bg-white/6"
                >
                  <span>Release checksums</span>
                  <Download className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <CommandCard
              title="1. Download the release kit"
              command={commands.downloadCommand}
              accent="from-[rgba(119,224,195,0.7)] via-[rgba(119,224,195,0.25)] to-transparent"
            />
            <CommandCard
              title="2. Verify the binary"
              command={commands.verifyCommand}
              accent="from-[rgba(94,122,255,0.75)] via-[rgba(94,122,255,0.2)] to-transparent"
            />
            <CommandCard
              title="3. Install the service"
              command={commands.installCommand}
              accent="from-[rgba(240,181,109,0.8)] via-[rgba(240,181,109,0.24)] to-transparent"
            />
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="shell-frame rounded-[2.2rem] px-6 py-7 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <TerminalSquare className="h-5 w-5 text-[var(--color-accent)]" />
              <div className="font-display text-3xl font-semibold text-white">
                From install to activation
              </div>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {handoffSteps.map((step, index) => (
                <div key={step.title} className="panel rounded-[1.8rem] px-5 py-5">
                  <div className="kicker">0{index + 1}</div>
                  <div className="mt-4 font-display text-xl font-semibold text-white">{step.title}</div>
                  <div className="copy mt-3 text-sm leading-7">{step.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-[2.2rem] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <MonitorSmartphone className="h-5 w-5 text-[var(--color-signal)]" />
              <div className="font-display text-3xl font-semibold text-white">Plan fit</div>
            </div>
              <div className="copy mt-4 text-sm leading-7">
              The install path now behaves like part of the SaaS, not like a repo handoff. That is what
              lets the Team plan sell cleanly at $39/month.
            </div>
            <div className="mt-6 space-y-4">
              {planTiers.map((tier) => (
                <div key={tier.name} className="rounded-[1.5rem] border border-white/8 bg-white/4 px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-display text-2xl font-semibold text-white">{tier.name}</div>
                    <div className="text-sm font-semibold text-slate-300">
                      {tier.price}
                      <span className="text-slate-500">{tier.cadence}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">{tier.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="hero-stage rounded-[2.3rem] px-6 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="eyebrow">Next click</div>
                <div className="font-display mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Download the config, install the release, and let the workspace activate the device.
                </div>
                <div className="copy mt-5 max-w-2xl text-lg leading-8">
                  Buyers should feel like they are moving through a product funnel, not an engineering
                  note. That is the difference between a strong demo and a real SaaS.
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Link href={user ? "/setup" : "/signup?plan=team"} className="btn-primary w-full justify-center">
                  {user ? "Open activation" : "Create Team account"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/app" className="btn-secondary w-full justify-center">
                  Open workspace
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
