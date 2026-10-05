"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, Eye, RefreshCw, ShieldAlert } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useProcessMonitor, type AlertItem } from "@/hooks/use-process-monitor";

function formatDate(value: string | null) {
  if (!value) {
    return "No timestamp";
  }
  return new Date(value).toLocaleString();
}

export default function InvestigationsWorkspace() {
  const { hosts, selectedHost, setSelectedHost, snapshot, inventoryTimeline, refresh } =
    useProcessMonitor();
  const [selectedAlertId, setSelectedAlertId] = useState("");

  const alerts = snapshot?.alerts ?? [];

  useEffect(() => {
    if (!alerts.length) {
      setSelectedAlertId("");
      return;
    }
    if (!alerts.some((alert) => alert.id === selectedAlertId)) {
      setSelectedAlertId(alerts[0]?.id ?? "");
    }
  }, [alerts, selectedAlertId]);

  const selectedAlert =
    alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0] ?? null;

  const relatedEvents = useMemo(() => {
    if (!selectedAlert) {
      return inventoryTimeline.slice(0, 8);
    }
    const keywords = [selectedAlert.type, selectedAlert.hostname, String(selectedAlert.metadata?.pid || "")]
      .filter(Boolean)
      .map((value) => value.toLowerCase());
    return inventoryTimeline
      .filter((event) => {
        const haystack = `${event.title} ${event.subtitle} ${JSON.stringify(event.metadata)}`.toLowerCase();
        return keywords.some((keyword) => keyword && haystack.includes(keyword));
      })
      .slice(0, 8);
  }, [inventoryTimeline, selectedAlert]);

  const relatedProcesses = useMemo(() => {
    if (!selectedAlert || !snapshot) {
      return snapshot?.processes.slice(0, 8) ?? [];
    }
    const processName = String(selectedAlert.metadata?.process_name || "").toLowerCase();
    const pid = Number(selectedAlert.metadata?.pid || 0);
    return snapshot.processes
      .filter((process) => {
        if (pid && process.pid === pid) {
          return true;
        }
        if (processName && process.name.toLowerCase().includes(processName)) {
          return true;
        }
        return false;
      })
      .slice(0, 8);
  }, [selectedAlert, snapshot]);

  const relatedSoftware = useMemo(() => {
    if (!snapshot) {
      return [];
    }
    return snapshot.software_inventory
      .filter((item) => (item.signature_state || "unknown") === "unsigned")
      .slice(0, 6);
  }, [snapshot]);

  const recentProcessEvents = (snapshot?.process_events ?? []).slice(0, 6);
  const recentNetworkEvents = (snapshot?.network_events ?? []).slice(0, 6);
  const recentDnsEvents = (snapshot?.dns_events ?? []).slice(0, 6);
  const collectorCapabilities = (snapshot?.security_posture?.collector_capabilities ?? []).slice(0, 6);

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Investigation console"
        description="Join alerts, process state, auth history, software trust, and event timeline in one analyst view."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="eyebrow">Case view</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Investigate a device signal without jumping between five pages.
                </div>
                <div className="section-copy mt-4 text-base">
                  This workspace links the active alert, process context, integrity changes, auth activity, and software trust into a single investigation lane.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Current scope</div>
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
                  Refresh investigation
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-[var(--color-accent)]" />
                <div className="font-display text-2xl font-semibold text-white">Active alert lane</div>
              </div>
              <div className="mt-5 grid gap-3">
                {alerts.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                    No active alerts on the selected device.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => setSelectedAlertId(alert.id)}
                      className={`rounded-[1.45rem] border p-4 text-left transition ${
                        selectedAlert?.id === alert.id
                          ? "border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.1)]"
                          : "border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/5"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{alert.message}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {alert.type.replaceAll("_", " ")} · {alert.level} · {alert.status}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-[var(--color-accent)]" />
                <div className="font-display text-2xl font-semibold text-white">Selected alert context</div>
              </div>
              {selectedAlert ? (
                <div className="mt-5 grid gap-4">
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                    <div className="text-sm font-semibold text-white">{selectedAlert.message}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                      {selectedAlert.type.replaceAll("_", " ")} · {selectedAlert.level} · {selectedAlert.status}
                    </div>
                    <div className="mt-3 text-sm text-slate-400">
                      First seen {formatDate(selectedAlert.first_seen_at)} · Last seen {formatDate(selectedAlert.last_seen_at)}
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Related processes</div>
                      <div className="mt-3 grid gap-3">
                        {relatedProcesses.length === 0 ? (
                          <div className="text-sm text-slate-400">No directly related process identified.</div>
                        ) : (
                          relatedProcesses.map((process) => (
                            <div key={`${process.pid}-${process.name}`} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                              <div className="text-sm font-semibold text-white">{process.name}</div>
                              <div className="mt-2 text-xs text-slate-500">PID {process.pid} · {process.username}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Unsigned software in scope</div>
                      <div className="mt-3 grid gap-3">
                        {relatedSoftware.length === 0 ? (
                          <div className="text-sm text-slate-400">No unsigned software detected in the latest snapshot.</div>
                        ) : (
                          relatedSoftware.map((item) => (
                            <div key={item.identifier || item.install_path || item.name} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                              <div className="text-sm font-semibold text-white">{item.name}</div>
                              <div className="mt-2 text-xs text-slate-500">{item.install_path || item.identifier}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Recent auth activity</div>
                      <div className="mt-3 grid gap-3">
                        {(snapshot?.auth_events ?? []).slice(0, 6).map((event, index) => (
                          <div key={`${event.username}-${event.occurred_at}-${index}`} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                            <div className="text-sm font-semibold text-white">{event.username}</div>
                            <div className="mt-2 text-xs text-slate-500">{event.summary || event.source || event.terminal}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Recent event stream</div>
                      <div className="mt-3 grid gap-3">
                        {relatedEvents.length === 0 ? (
                          <div className="text-sm text-slate-400">No related timeline events yet.</div>
                        ) : (
                          relatedEvents.map((event) => (
                            <div key={`${event.id}-${event.kind}`} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                              <div className="text-sm font-semibold text-white">{event.title}</div>
                              <div className="mt-2 text-xs text-slate-500">
                                {event.subtitle || event.kind} · {formatDate(event.occurred_at)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Recent process lifecycle</div>
                      <div className="mt-3 grid gap-3">
                        {recentProcessEvents.length === 0 ? (
                          <div className="text-sm text-slate-400">No process lifecycle events in the current snapshot.</div>
                        ) : (
                          recentProcessEvents.map((event, index) => (
                            <div key={`${event.pid}-${event.event_type}-${index}`} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                              <div className="text-sm font-semibold text-white">
                                {event.name} · {event.event_type}
                              </div>
                              <div className="mt-2 text-xs text-slate-500">
                                PID {event.pid || "n/a"} · {event.parent_name || "unknown parent"}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Recent DNS and outbound lookups</div>
                      <div className="mt-3 grid gap-3">
                        {recentDnsEvents.length === 0 ? (
                          <div className="text-sm text-slate-400">No recent DNS events in the current snapshot.</div>
                        ) : (
                          recentDnsEvents.map((event, index) => (
                            <div key={`${event.query}-${event.occurred_at}-${index}`} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                              <div className="text-sm font-semibold text-white">{event.query}</div>
                              <div className="mt-2 text-xs text-slate-500">
                                {event.source || "dns"} · {formatDate(event.occurred_at)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Recent connection lifecycle</div>
                      <div className="mt-3 grid gap-3">
                        {recentNetworkEvents.length === 0 ? (
                          <div className="text-sm text-slate-400">No connection open or close events in the current snapshot.</div>
                        ) : (
                          recentNetworkEvents.map((event, index) => (
                            <div key={`${event.process_name}-${event.remote_address}-${event.event_type}-${index}`} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                              <div className="text-sm font-semibold text-white">
                                {event.process_name || "process"} · {event.event_type}
                              </div>
                              <div className="mt-2 text-xs text-slate-500">
                                {event.remote_domain || event.remote_address || "no remote host"}:{event.remote_port || "n/a"} · {event.security_hint || event.remote_scope || "observed"}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Collector depth</div>
                      <div className="mt-3 grid gap-3">
                        {collectorCapabilities.length === 0 ? (
                          <div className="text-sm text-slate-400">No collector capability report available for this device.</div>
                        ) : (
                          collectorCapabilities.map((capability) => (
                            <div key={`${capability.name}-${capability.layer}`} className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                              <div className="text-sm font-semibold text-white">{capability.name}</div>
                              <div className="mt-2 text-xs text-slate-500">
                                {capability.layer} · {capability.state}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                    <div className="kicker">Security posture</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Firewall</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {snapshot?.security_posture?.firewall_state || "unknown"}
                        </div>
                      </div>
                      <div className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Disk encryption</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {snapshot?.security_posture?.disk_encryption_state || "unknown"}
                        </div>
                      </div>
                      <div className="rounded-[1.1rem] border border-white/8 bg-[#070e15] p-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Endpoint protection</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {snapshot?.security_posture?.antivirus_state || "unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                  Select an alert from the left lane to open an investigation view.
                </div>
              )}
            </div>
          </section>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
