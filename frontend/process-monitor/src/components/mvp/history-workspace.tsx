"use client";

import { Activity, ArrowUpRight, Clock3, Database } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useProcessMonitor } from "@/hooks/use-process-monitor";
import { salesEmail } from "@/lib/site-content";

function percent(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value.toFixed(1)}%`;
}

export default function HistoryWorkspace() {
  const { snapshot, history, error } = useProcessMonitor();

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Snapshot history"
        description="Track how each device changes over time and keep recent state within quick reach."
      >
        <div className="grid gap-6">
        <section className="shell-frame rounded-[2rem] p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <div>
              <div className="eyebrow">Historical posture</div>
              <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white">
                Recent device history without opening a full observability suite.
              </div>
              <div className="copy mt-4 max-w-2xl text-base leading-7">
                The job of this page is simple: show the last snapshots clearly enough that you can
                tell whether a device is stable, drifting, or suddenly noisy.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="panel rounded-[1.6rem] p-5">
                <div className="kicker">Snapshots</div>
                <div className="metric-value mt-3 text-white">{history.length}</div>
              </div>
              <div className="panel rounded-[1.6rem] p-5">
                <div className="kicker">Current alerts</div>
                <div className="metric-value mt-3 text-white">{snapshot?.alerts.length ?? 0}</div>
              </div>
              <div className="panel rounded-[1.6rem] p-5">
                <div className="kicker">Current processes</div>
                <div className="metric-value mt-3 text-white">{snapshot?.total_processes ?? 0}</div>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <div className="panel rounded-[2rem] p-5">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[var(--color-accent)]" />
              <div>
                <div className="font-display text-2xl font-semibold text-white">Resource trend</div>
                <div className="mt-1 text-sm text-slate-400">
                  CPU and memory usage across the most recent snapshots.
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {history.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.6rem] border border-white/8 bg-white/4 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-white">
                      {new Date(entry.created_at).toLocaleString()}
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {entry.total_processes} processes
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>CPU</span>
                        <span>{percent(entry.cpu_percent)}</span>
                      </div>
                      <div className="progress-rail h-2">
                        <span style={{ width: `${Math.min(entry.cpu_percent ?? 0, 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>Memory</span>
                        <span>{percent(entry.memory_percent)}</span>
                      </div>
                      <div className="progress-rail h-2">
                        <span style={{ width: `${Math.min(entry.memory_percent ?? 0, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Timeline table</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Snapshot-by-snapshot view for quick investigation.
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/8">
                <div className="overflow-x-auto">
                  <table className="timeline-table min-w-[640px] w-full border-collapse">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th className="text-right">CPU</th>
                        <th className="text-right">Memory</th>
                        <th className="text-right">Processes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 12).map((entry) => (
                        <tr key={entry.id} className="table-row">
                          <td className="whitespace-nowrap text-sm text-white">
                            {new Date(entry.created_at).toLocaleString()}
                          </td>
                          <td className="text-right text-sm tabular-nums text-slate-300">
                            {percent(entry.cpu_percent)}
                          </td>
                          <td className="text-right text-sm tabular-nums text-slate-300">
                            {percent(entry.memory_percent)}
                          </td>
                          <td className="text-right text-sm tabular-nums text-slate-300">
                            {entry.total_processes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Sellable retention story</div>
                  <div className="mt-1 text-sm text-slate-400">
                    History is a buyer feature, not just a dashboard feature.
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
                <p>
                  Even at MVP stage, snapshot history creates customer value because it helps answer a
                  practical question: did the device drift gradually or change abruptly?
                </p>
                <p>
                  That is the kind of concrete outcome early customers will pay for, especially when
                  the interface is clear and the onboarding friction stays low.
                </p>
              </div>
              <a
                href={`mailto:${salesEmail}?subject=HostLens%20history%20pilot`}
                className="btn-primary mt-6"
              >
                Start history pilot
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
