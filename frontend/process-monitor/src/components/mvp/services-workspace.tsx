"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Search, Shield } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useProcessMonitor } from "@/hooks/use-process-monitor";

function serviceLabel(value: string) {
  return (value || "service").replaceAll("_", " ");
}

export default function ServicesWorkspace() {
  const { hosts, selectedHost, setSelectedHost, snapshot, refresh } = useProcessMonitor();
  const [query, setQuery] = useState("");

  const startupItems = snapshot?.startup_items ?? [];
  const serviceInventory = snapshot?.service_inventory ?? [];
  const collectorCapabilities = snapshot?.security_posture?.collector_capabilities ?? [];
  const filteredItems = useMemo(
    () =>
      serviceInventory.filter((item) =>
        [item.name, item.display_name, item.executable, item.manager, item.state, item.scope]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [query, serviceInventory],
  );

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Service and daemon watch"
        description="A dedicated workspace for launch agents, daemons, service units, and startup persistence."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="eyebrow">Service inventory</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Review persistence like an operator, not like a file browser.
                </div>
                <div className="section-copy mt-4 text-base">
                  HostLens now exposes runtime service state, launch persistence, and security posture in one operator lane.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Selected device</div>
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
                  Refresh services
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Runtime services</div>
              <div className="metric-value mt-3 text-white">{serviceInventory.length}</div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Startup persistence</div>
              <div className="metric-value mt-3 text-white">{startupItems.length}</div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Firewall</div>
              <div className="mt-3 text-base font-semibold text-white">
                {snapshot?.security_posture?.firewall_state || "unknown"}
              </div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Disk encryption</div>
              <div className="mt-3 text-base font-semibold text-white">
                {snapshot?.security_posture?.disk_encryption_state || "unknown"}
              </div>
            </div>
            <div className="panel rounded-[1.6rem] p-5 sm:col-span-2 xl:col-span-4">
              <div className="kicker">Collector capability report</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {collectorCapabilities.length === 0 ? (
                  <div className="text-sm text-slate-400">No collector capability report available yet.</div>
                ) : (
                  collectorCapabilities.map((capability) => (
                    <div
                      key={`${capability.name}-${capability.layer}`}
                      className="rounded-[1.2rem] border border-white/8 bg-[#070e15] p-3"
                    >
                      <div className="text-sm font-semibold text-white">{capability.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {capability.layer} · {capability.state}
                      </div>
                      <div className="mt-3 text-sm leading-6 text-slate-400">{capability.detail}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="font-display text-2xl font-semibold text-white">Service runtime inventory</div>
                <div className="mt-2 text-sm text-slate-400">
                  {serviceInventory.length} services captured on the selected device.
                </div>
              </div>
              <label className="relative block min-w-[280px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, display label, manager, state, or path"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-3 text-sm text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-3">
              {filteredItems.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                  No matching services.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={`${item.scope}-${item.manager}-${item.name}-${item.pid}`} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{item.display_name || item.name}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                          {serviceLabel(item.manager)} · {serviceLabel(item.scope)} · {serviceLabel(item.state)}
                        </div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                        {item.startup_type || item.unit_file_state || item.status || "Unknown status"}
                      </div>
                    </div>
                    <div className="mt-3 break-all text-sm leading-7 text-slate-400">
                      {item.executable || item.name || "No executable path recorded"}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      PID {item.pid || "n/a"} · {item.username || "system"} · {item.exit_code || "no exit code"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel rounded-[2rem] p-5 sm:p-6">
            <div className="font-display text-2xl font-semibold text-white">Startup persistence</div>
            <div className="mt-2 text-sm text-slate-400">
              Startup and scheduled task surfaces still tracked separately from runtime services.
            </div>
            <div className="mt-6 grid gap-3">
              {startupItems.slice(0, 24).map((item) => (
                <div
                  key={`${item.scope}-${item.type}-${item.location}-${item.name}`}
                  className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {serviceLabel(item.type)} · {serviceLabel(item.scope)}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      {item.publisher || "Unknown publisher"}
                    </div>
                  </div>
                  <div className="mt-3 break-all text-sm leading-7 text-slate-400">
                    {item.location || item.command || "No executable path recorded"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel rounded-[2rem] p-5 sm:p-6">
            <div className="font-display text-2xl font-semibold text-white">Device security posture</div>
            <div className="mt-2 text-sm text-slate-400">
              Runtime posture signals, extension surfaces, and device-level control state captured from the host.
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <div className="kicker">Protection controls</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Firewall", snapshot?.security_posture?.firewall_state || "unknown"],
                    ["Disk encryption", snapshot?.security_posture?.disk_encryption_state || "unknown"],
                    ["Endpoint protection", snapshot?.security_posture?.antivirus_state || "unknown"],
                    ["MDM", snapshot?.security_posture?.mdm_state || "unknown"],
                    ["Gatekeeper", snapshot?.security_posture?.gatekeeper_state || "unknown"],
                    ["SIP", snapshot?.security_posture?.sip_state || "unknown"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
                      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <div className="kicker">Extension and device surfaces</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Browser extensions</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {snapshot?.security_posture?.browser_extensions?.length || 0}
                    </div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">System extensions</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {snapshot?.security_posture?.system_extensions?.length || 0}
                    </div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">USB devices</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {snapshot?.security_posture?.usb_devices?.length || 0}
                    </div>
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
