"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, RefreshCw } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";
import { useProcessMonitor } from "@/hooks/use-process-monitor";

const API_BASE_URL = getApiBaseUrl();

interface CompareResponse {
  hostname: string;
  agent_id: string | null;
  left_snapshot: {
    id: number;
    created_at: string;
    cpu_percent: number | null;
    memory_percent: number | null;
    disk_percent: number | null;
    total_processes: number;
  };
  right_snapshot: {
    id: number;
    created_at: string;
    cpu_percent: number | null;
    memory_percent: number | null;
    disk_percent: number | null;
    total_processes: number;
  };
  metrics: {
    cpu_percent_delta: number;
    memory_percent_delta: number;
    disk_percent_delta: number;
    process_count_delta: number;
  };
  processes: {
    new: Array<{ pid: number; name: string; username: string; cmdline: string }>;
    removed: Array<{ pid: number; name: string; username: string; cmdline: string }>;
  };
  software: Array<{
    kind: string;
    severity: string;
    title: string;
    subtitle: string;
    at: string;
  }>;
  files: {
    added: Array<Record<string, unknown>>;
    removed: Array<Record<string, unknown>>;
    changed: Array<{ previous: Record<string, unknown>; current: Record<string, unknown> }>;
  };
  startup: {
    added: Array<Record<string, unknown>>;
    removed: Array<Record<string, unknown>>;
  };
  services: {
    added: Array<Record<string, unknown>>;
    removed: Array<Record<string, unknown>>;
    changed: Array<{ previous: Record<string, unknown>; current: Record<string, unknown> }>;
  };
  network: {
    new: Array<Record<string, unknown>>;
    removed: Array<Record<string, unknown>>;
    dns: Array<Record<string, unknown>>;
    events: Array<Record<string, unknown>>;
  };
  security_posture: {
    left: Record<string, unknown>;
    right: Record<string, unknown>;
  };
  process_events: Array<Record<string, unknown>>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function deltaLabel(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}`;
}

async function requestCompare(agentId: string): Promise<CompareResponse> {
  const accessToken = getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/process-snapshots/compare/?agent_id=${encodeURIComponent(agentId)}`,
    {
      cache: "no-store",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  );
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = payload.detail;
      }
    } catch {
      // noop
    }
    throw new Error(message);
  }
  return response.json() as Promise<CompareResponse>;
}

export default function CompareWorkspace() {
  const { hosts, selectedHost, setSelectedHost, refresh } = useProcessMonitor();
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!selectedHost) {
        setCompareData(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const payload = await requestCompare(selectedHost);
        if (!active) {
          return;
        }
        setCompareData(payload);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to compare snapshots");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [selectedHost]);

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Snapshot compare"
        description="Compare the last two snapshots to see what changed across processes, software, files, and startup surfaces."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="eyebrow">Compare two moments</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Spot drift between snapshots without diffing raw JSON by hand.
                </div>
                <div className="section-copy mt-4 text-base">
                  This view highlights process churn, software changes, integrity drift, and persistence changes across the last two snapshots for the selected device.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <GitCompareArrows className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Compare target</div>
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
                <button
                  type="button"
                  onClick={() => {
                    refresh();
                    if (selectedHost) {
                      void requestCompare(selectedHost).then(setCompareData).catch((compareError: unknown) => {
                        setError(compareError instanceof Error ? compareError.message : "Unable to compare snapshots");
                      });
                    }
                  }}
                  className="btn-secondary mt-5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh compare
                </button>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="shell-frame rounded-[2rem] px-6 py-8 text-sm text-slate-400">
              Loading snapshot diff...
            </div>
          ) : null}

          {!loading && compareData ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">CPU delta</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {deltaLabel(compareData.metrics.cpu_percent_delta)}
                  </div>
                </div>
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Memory delta</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {deltaLabel(compareData.metrics.memory_percent_delta)}
                  </div>
                </div>
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Disk delta</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {deltaLabel(compareData.metrics.disk_percent_delta)}
                  </div>
                </div>
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Process count delta</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {compareData.metrics.process_count_delta > 0 ? "+" : ""}
                    {compareData.metrics.process_count_delta}
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Compared snapshots</div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Previous</div>
                      <div className="mt-3 text-sm font-semibold text-white">
                        {formatDate(compareData.left_snapshot.created_at)}
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        {compareData.left_snapshot.total_processes} processes
                      </div>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="kicker">Current</div>
                      <div className="mt-3 text-sm font-semibold text-white">
                        {formatDate(compareData.right_snapshot.created_at)}
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        {compareData.right_snapshot.total_processes} processes
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Detected change events</div>
                  <div className="mt-5 grid gap-3">
                    {compareData.software.slice(0, 8).map((event) => (
                      <div key={`${event.kind}-${event.at}-${event.title}`} className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4">
                        <div className="text-sm font-semibold text-white">{event.title}</div>
                        <div className="mt-2 text-sm text-slate-400">{event.subtitle || event.kind}</div>
                        <div className="mt-3 text-xs text-slate-500">{formatDate(event.at)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Process churn</div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="kicker">New processes</div>
                      <div className="mt-3 grid gap-3">
                        {compareData.processes.new.slice(0, 10).map((item) => (
                          <div key={`new-${item.pid}-${item.name}`} className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4">
                            <div className="text-sm font-semibold text-white">{item.name}</div>
                            <div className="mt-2 text-xs text-slate-500">PID {item.pid} · {item.username}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="kicker">Removed processes</div>
                      <div className="mt-3 grid gap-3">
                        {compareData.processes.removed.slice(0, 10).map((item) => (
                          <div key={`old-${item.pid}-${item.name}`} className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4">
                            <div className="text-sm font-semibold text-white">{item.name}</div>
                            <div className="mt-2 text-xs text-slate-500">PID {item.pid} · {item.username}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">File and service drift</div>
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                      <span className="font-semibold text-white">{compareData.files.added.length}</span> files added,
                      <span className="font-semibold text-white"> {compareData.files.removed.length}</span> removed,
                      <span className="font-semibold text-white"> {compareData.files.changed.length}</span> changed
                    </div>
                    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                      <span className="font-semibold text-white">{compareData.startup.added.length}</span> startup entries added,
                      <span className="font-semibold text-white"> {compareData.startup.removed.length}</span> removed
                    </div>
                    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                      <span className="font-semibold text-white">{compareData.services.added.length}</span> services added,
                      <span className="font-semibold text-white"> {compareData.services.changed.length}</span> state changes
                    </div>
                    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                      <span className="font-semibold text-white">{compareData.network.new.length}</span> new outbound connections,
                      <span className="font-semibold text-white"> {compareData.network.dns.length}</span> DNS events,
                      <span className="font-semibold text-white"> {compareData.network.events.length}</span> connection lifecycle events
                    </div>
                    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                      <span className="font-semibold text-white">{compareData.process_events.length}</span> process lifecycle events in the current snapshot
                    </div>
                    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                      Firewall:
                      <span className="font-semibold text-white"> {String(compareData.security_posture.left.firewall_state || "unknown")}</span>
                      {" → "}
                      <span className="font-semibold text-white">{String(compareData.security_posture.right.firewall_state || "unknown")}</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
