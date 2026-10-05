"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CheckCheck,
  Clock3,
  Filter,
  Mail,
  MessageSquarePlus,
  Search,
  ShieldAlert,
  ShieldCheck,
  VolumeX,
  RotateCcw,
  Send,
  Webhook,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useAlertWorkflow } from "@/hooks/use-alert-workflow";

function levelTone(level: string) {
  if (level === "critical") {
    return "border-red-400/20 bg-red-400/10 text-red-100";
  }
  if (level === "warning") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }
  return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
}

function statusTone(status: string) {
  if (status === "resolved") {
    return "border-white/10 bg-white/4 text-slate-300";
  }
  if (status === "muted") {
    return "border-sky-300/20 bg-sky-300/10 text-sky-100";
  }
  if (status === "acknowledged") {
    return "border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] text-[var(--color-accent)]";
  }
  return "border-red-400/18 bg-red-400/10 text-red-100";
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "n/a";
  }
  return new Date(value).toLocaleString();
}

function deliveryIcon(channel: "email" | "slack" | "webhook") {
  if (channel === "email") {
    return Mail;
  }
  if (channel === "slack") {
    return Send;
  }
  return Webhook;
}

export default function AlertsWorkspace() {
  const {
    alerts,
    counts,
    selectedAlert,
    filters,
    setFilters,
    loadAlertDetail,
    performAction,
    loading,
    busy,
    error,
  } = useAlertWorkflow();
  const [note, setNote] = useState("");

  const deviceOptions = useMemo(() => {
    const seen = new Map<string, string>();
    alerts.forEach((alert) => {
      if (alert.agent_id) {
        seen.set(alert.agent_id, alert.display_name || alert.hostname);
      }
    });
    return Array.from(seen.entries());
  }, [alerts]);

  useEffect(() => {
    setNote(selectedAlert?.note || "");
  }, [selectedAlert]);

  async function handleSelectAlert(alertId: string) {
    const detail = await loadAlertDetail(alertId);
    setNote(detail.note || "");
  }

  async function handleAction(action: string, extra?: { mute_hours?: number }) {
    if (!selectedAlert) {
      return;
    }
    const detail = await performAction(selectedAlert.id, {
      action,
      note: action === "note" ? note : note.trim() ? note : undefined,
      ...extra,
    });
    setNote(detail.note || "");
  }

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Alert workflow"
        description="Filter active issues, open the exact signal, and move it through acknowledgement or resolution."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
              <div>
                <div className="eyebrow">Incident workflow</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Review, acknowledge, mute, and resolve real alerts.
                </div>
                <div className="section-copy mt-4 text-base">
                  HostLens now keeps alert state, notes, and audit history. This is the operating lane
                  for working an issue instead of only seeing that one exists.
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Open</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {counts?.open ?? 0}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">
                    Alerts that still need operator review.
                  </div>
                </div>
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Acknowledged</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {counts?.acknowledged ?? 0}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">
                    Signals under review but not yet closed out.
                  </div>
                </div>
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Muted</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {counts?.muted ?? 0}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">
                    Suppressed alerts that remain on the record.
                  </div>
                </div>
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Critical</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {counts?.critical ?? 0}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">
                    Highest-severity issues across the workspace.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Filters</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Narrow the alert lane by status, severity, device, or search term.
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="block">
                  <div className="kicker">Status</div>
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, status: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                  >
                    <option value="open,acknowledged,muted">Active only</option>
                    <option value="open">Open</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="muted">Muted</option>
                    <option value="resolved">Resolved</option>
                    <option value="all">All statuses</option>
                  </select>
                </label>

                <label className="block">
                  <div className="kicker">Severity</div>
                  <select
                    value={filters.level}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, level: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                  >
                    <option value="all">All severities</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </label>

                <label className="block">
                  <div className="kicker">Device</div>
                  <select
                    value={filters.device}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, device: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                  >
                    <option value="all">All devices</option>
                    {deviceOptions.map(([agentId, label]) => (
                      <option key={agentId} value={agentId}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <div className="kicker">Search</div>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={filters.query}
                      onChange={(event) =>
                        setFilters((current) => ({ ...current, query: event.target.value }))
                      }
                      placeholder="Search message, type, or hostname"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-[var(--color-signal)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Alert feed</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Click an alert to open its timeline, note, and workflow actions.
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                    Loading alerts...
                  </div>
                ) : null}
                {!loading && alerts.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                    No alerts match the current filter set.
                  </div>
                ) : null}
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => void handleSelectAlert(alert.id)}
                    className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition hover:border-white/12 hover:bg-white/5 ${
                      selectedAlert?.id === alert.id
                        ? "border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.08)]"
                        : "border-white/8 bg-white/4"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">{alert.message}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          <span className={`rounded-full border px-2 py-1 ${levelTone(alert.level)}`}>
                            {alert.level}
                          </span>
                          <span className={`rounded-full border px-2 py-1 ${statusTone(alert.status)}`}>
                            {alert.status}
                          </span>
                          <span className="rounded-full border border-white/8 bg-[#060b12] px-2 py-1">
                            {alert.display_name || alert.hostname}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div>{formatTimestamp(alert.last_seen_at)}</div>
                        <div className="mt-1">{alert.occurrence_count} sightings</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Selected alert</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Full alert detail, note taking, and action history.
                  </div>
                </div>
              </div>

              {selectedAlert ? (
                <div className="mt-5 space-y-6">
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-white">{selectedAlert.message}</div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          <span className={`rounded-full border px-2 py-1 ${levelTone(selectedAlert.level)}`}>
                            {selectedAlert.level}
                          </span>
                          <span className={`rounded-full border px-2 py-1 ${statusTone(selectedAlert.status)}`}>
                            {selectedAlert.status}
                          </span>
                          <span className="rounded-full border border-white/8 bg-[#060b12] px-2 py-1">
                            {selectedAlert.type.replaceAll("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div>First seen</div>
                        <div className="mt-1 text-sm text-slate-300">{formatTimestamp(selectedAlert.first_seen_at)}</div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-white/8 bg-[#060b12] p-4">
                        <div className="kicker">Device</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {selectedAlert.display_name || selectedAlert.hostname}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {selectedAlert.primary_ip || "No IP"} · {selectedAlert.device_type || "device"}
                        </div>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/8 bg-[#060b12] p-4">
                        <div className="kicker">Last seen</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {formatTimestamp(selectedAlert.last_seen_at)}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {selectedAlert.occurrence_count} total occurrences
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {selectedAlert.status !== "acknowledged" && selectedAlert.status !== "resolved" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAction("acknowledge")}
                        className="btn-secondary w-full justify-center"
                      >
                        <CheckCheck className="h-4 w-4" />
                        Acknowledge
                      </button>
                    ) : null}
                    {selectedAlert.status !== "muted" && selectedAlert.status !== "resolved" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAction("mute", { mute_hours: 24 })}
                        className="btn-secondary w-full justify-center"
                      >
                        <VolumeX className="h-4 w-4" />
                        Mute 24h
                      </button>
                    ) : null}
                    {selectedAlert.status === "muted" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAction("unmute")}
                        className="btn-secondary w-full justify-center"
                      >
                        <BellRing className="h-4 w-4" />
                        Unmute
                      </button>
                    ) : null}
                    {selectedAlert.status !== "resolved" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAction("resolve")}
                        className="btn-primary w-full justify-center"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Resolve
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAction("reopen")}
                        className="btn-secondary w-full justify-center"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reopen
                      </button>
                    )}
                  </div>

                  <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                    <div className="font-display text-xl font-semibold text-white">Operator notes</div>
                    <div className="mt-2 text-sm text-slate-400">
                      Keep a human decision trail with the alert record.
                    </div>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={5}
                      className="mt-4 w-full rounded-[1.25rem] border border-white/10 bg-[#060b12] px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      placeholder="Add context, remediation notes, or why this was expected."
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleAction("note")}
                      className="btn-secondary mt-4"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      Save note
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                  Pick an alert from the feed to inspect its full detail, note, and audit timeline.
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <div className="panel rounded-[2rem] p-5">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="font-display text-2xl font-semibold text-white">Audit trail</div>
                    <div className="mt-1 text-sm text-slate-400">
                      Every action taken on the selected alert.
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedAlert?.audit_logs?.length ? (
                    selectedAlert.audit_logs.map((entry) => (
                      <div key={entry.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {entry.action.replaceAll("_", " ")}
                            </div>
                            <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                              {entry.actor_name} · {formatTimestamp(entry.created_at)}
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <div>{entry.previous_status || "n/a"} → {entry.next_status || "n/a"}</div>
                          </div>
                        </div>
                        {entry.note ? (
                          <div className="mt-3 text-sm leading-7 text-slate-400">{entry.note}</div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                      No audit entries yet for the selected alert.
                    </div>
                  )}
                </div>
              </div>

              <div className="panel rounded-[2rem] p-5">
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="font-display text-2xl font-semibold text-white">Delivery history</div>
                    <div className="mt-1 text-sm text-slate-400">
                      Email, Slack, and webhook attempts tied to the selected alert.
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedAlert?.notification_deliveries?.length ? (
                    selectedAlert.notification_deliveries.map((delivery) => {
                      const Icon = deliveryIcon(delivery.channel);
                      return (
                        <div key={delivery.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white">
                                  {delivery.channel} · {delivery.event_type.replaceAll(".", " ")}
                                </div>
                                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                                  {delivery.status} · {formatTimestamp(delivery.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${
                              delivery.status === "success"
                                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                                : delivery.status === "failed"
                                  ? "border-red-400/20 bg-red-400/10 text-red-100"
                                  : "border-white/10 bg-white/4 text-slate-300"
                            }`}>
                              {delivery.status}
                            </div>
                          </div>
                          <div className="mt-3 text-sm leading-7 text-slate-400">
                            {delivery.destination || "No destination recorded"}
                          </div>
                          {delivery.error_message ? (
                            <div className="mt-3 text-sm leading-7 text-red-200">{delivery.error_message}</div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                      No delivery attempts have been recorded for the selected alert yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
