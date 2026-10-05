"use client";

import { useMemo } from "react";
import { Activity, AppWindowMac, Fingerprint, RefreshCw, Shield, ShieldAlert } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import {
  useProcessMonitor,
  type CollectorCapability,
  type HostSummary,
} from "@/hooks/use-process-monitor";

const DEEP_COLLECTORS = [
  {
    name: "endpoint-security",
    title: "macOS Endpoint Security",
    summary: "Privileged exec, exit, and auth telemetry for signed and entitled macOS rollout.",
    installPath:
      "/Users/avinash/Desktop/process-monitoring-agent-repo/agent/deep-collectors/macos-endpoint-security",
  },
  {
    name: "ebpf",
    title: "Linux eBPF",
    summary: "Kernel-grade process and network signal capture for Linux hosts with bpftrace or a dedicated loader.",
    installPath:
      "/Users/avinash/Desktop/process-monitoring-agent-repo/agent/deep-collectors/linux-ebpf",
  },
  {
    name: "etw",
    title: "Windows ETW",
    summary: "Kernel provider-backed process start/stop and TCP connect telemetry for Windows rollout.",
    installPath:
      "/Users/avinash/Desktop/process-monitoring-agent-repo/agent/deep-collectors/windows-etw",
  },
];

function titleCase(value: string) {
  return (value || "unknown").replaceAll("-", " ").replaceAll("_", " ");
}

function toneClass(state: string) {
  switch (state) {
    case "active":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "available":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "inactive":
      return "border-slate-400/20 bg-slate-400/10 text-slate-200";
    default:
      return "border-white/10 bg-white/5 text-slate-200";
  }
}

function buildDeepCollectorRows(capabilities: CollectorCapability[]) {
  return DEEP_COLLECTORS.map((collector) => {
    const capability = capabilities.find((item) => item.name === collector.name);
    return {
      ...collector,
      state: capability?.state || "not configured",
      layer: capability?.layer || "privileged-helper",
      detail: capability?.detail || collector.summary,
    };
  });
}

function countMobileHosts(hosts: HostSummary[]) {
  return hosts.filter((host) => host.device_type === "mobile").length;
}

export default function CollectorsWorkspace() {
  const { hosts, selectedHost, setSelectedHost, snapshot, refresh } = useProcessMonitor();

  const collectorCapabilities = snapshot?.security_posture?.collector_capabilities ?? [];
  const collectorSources = snapshot?.collector_sources ?? [];
  const activeCollectors = collectorCapabilities.filter((item) => item.state === "active").length;
  const availableCollectors = collectorCapabilities.filter((item) => item.state === "available").length;
  const deepCollectors = useMemo(
    () => buildDeepCollectorRows(collectorCapabilities),
    [collectorCapabilities],
  );
  const mobileHosts = useMemo(() => countMobileHosts(hosts), [hosts]);

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Collector control"
        description="See which telemetry layers are active, which privileged helpers still need rollout, and how mobile companion coverage fits into the fleet."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="eyebrow">Collector operations</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Make the telemetry stack visible before you sell it.
                </div>
                <div className="section-copy mt-4 text-base">
                  HostLens now tracks userspace collectors, privileged helper readiness, mobile
                  companion coverage, and last-snapshot event volume in one workspace.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Snapshot scope</div>
                </div>
                <label className="mt-5 block">
                  <div className="kicker">Device</div>
                  <select
                    value={selectedHost}
                    onChange={(event) => setSelectedHost(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                  >
                    {hosts.map((host) => (
                      <option key={host.agent_id || host.hostname} value={host.agent_id || host.hostname}>
                        {host.display_name || host.hostname}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={refresh} className="btn-secondary mt-5">
                  <RefreshCw className="h-4 w-4" />
                  Refresh collector state
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Active collectors</div>
              <div className="metric-value mt-3 text-white">{activeCollectors}</div>
              <div className="mt-3 text-sm leading-7 text-slate-400">
                Userspace or helper-backed collectors reporting into the selected snapshot.
              </div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Ready to enable</div>
              <div className="metric-value mt-3 text-white">{availableCollectors}</div>
              <div className="mt-3 text-sm leading-7 text-slate-400">
                Privileged collectors detected by the product but not active yet.
              </div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Mobile companions</div>
              <div className="metric-value mt-3 text-white">{mobileHosts}</div>
              <div className="mt-3 text-sm leading-7 text-slate-400">
                Signed-in Android or iPhone companion devices enrolled into the workspace.
              </div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Last snapshot events</div>
              <div className="metric-value mt-3 text-white">
                {(snapshot?.process_events?.length || 0) + (snapshot?.network_events?.length || 0)}
              </div>
              <div className="mt-3 text-sm leading-7 text-slate-400">
                Process lifecycle and network lifecycle events captured in the latest interval.
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Collector capability matrix</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Exactly what the selected device can do right now, by layer and state.
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {collectorCapabilities.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                    No collector capability report has been uploaded yet.
                  </div>
                ) : (
                  collectorCapabilities.map((capability) => (
                    <div
                      key={`${capability.name}-${capability.layer}`}
                      className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{titleCase(capability.name)}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {titleCase(capability.layer)}
                          </div>
                        </div>
                        <div
                          className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${toneClass(capability.state)}`}
                        >
                          {titleCase(capability.state)}
                        </div>
                      </div>
                      <div className="mt-4 text-sm leading-7 text-slate-400">{capability.detail}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Source lanes</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Collector sources that contributed to the current snapshot and their event footprint.
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {collectorSources.length === 0 ? (
                  <div className="text-sm text-slate-400">No collector sources published yet.</div>
                ) : (
                  collectorSources.map((source) => (
                    <div
                      key={source}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-slate-300"
                    >
                      {titleCase(source)}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Process events", snapshot?.process_events?.length || 0],
                  ["Network events", snapshot?.network_events?.length || 0],
                  ["DNS lookups", snapshot?.dns_events?.length || 0],
                  ["File events", snapshot?.file_events?.length || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.2rem] border border-white/8 bg-[#070e15] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-[var(--color-accent)]" />
              <div>
                <div className="font-display text-2xl font-semibold text-white">Privileged helper rollout</div>
                <div className="mt-1 text-sm text-slate-400">
                  The helpers are now in the repo. This tells you what still needs signing, a target OS,
                  or a privileged runtime to become active.
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {deepCollectors.map((collector) => (
                <div key={collector.name} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{collector.title}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {titleCase(collector.layer)}
                      </div>
                    </div>
                    <div
                      className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${toneClass(collector.state)}`}
                    >
                      {titleCase(collector.state)}
                    </div>
                  </div>
                  <div className="mt-4 text-sm leading-7 text-slate-400">{collector.detail}</div>
                  <div className="mt-4 rounded-[1.15rem] border border-white/8 bg-[#070e15] px-3 py-3 text-xs leading-6 text-slate-400">
                    {collector.installPath}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <AppWindowMac className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Mobile companion lane</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Android and iPhone are now a real signed-in telemetry companion path, not strategy-only docs.
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-white/8 bg-[#070e15] p-4">
                  <div className="kicker">Enrolled mobile devices</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{mobileHosts}</div>
                </div>
                <div className="rounded-[1.3rem] border border-white/8 bg-[#070e15] p-4">
                  <div className="kicker">Companion state</div>
                  <div className="mt-3 text-sm font-semibold text-white">
                    {collectorCapabilities.some((item) => item.name === "mobile-companion")
                      ? "Companion-ready"
                      : "Ready to enroll"}
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                Use the Expo companion in
                {" "}
                <span className="font-semibold text-white">/mobile/companion-app</span>
                {" "}
                to sign in, post heartbeats, and surface mobile battery, network, and reachability data
                into the same HostLens workspace.
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <div className="font-display text-2xl font-semibold text-white">What is still external</div>
              <div className="mt-2 text-sm text-slate-400">
                These gaps are no longer missing product code. They now depend on OS-specific rollout,
                signing, entitlement approval, or a target machine.
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  "Endpoint Security still needs Apple entitlements, signing, and root-approved runtime.",
                  "eBPF still needs a Linux host with bpftrace or a packaged helper runtime.",
                  "ETW still needs a Windows machine for validation and binary packaging.",
                  "Mobile companion export is working, but store packaging and device QA still need platform delivery.",
                ].map((item) => (
                  <div key={item} className="rounded-[1.25rem] border border-white/8 bg-[#070e15] px-4 py-4 text-sm leading-7 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
