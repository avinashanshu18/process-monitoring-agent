"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { usePolicyEngine } from "@/hooks/use-policy-engine";
import { useProcessMonitor } from "@/hooks/use-process-monitor";

function toneClass(status: string) {
  if (status === "fail" || status === "failed") {
    return "border-red-400/20 bg-red-400/10 text-red-100";
  }
  if (status === "warn" || status === "queued" || status === "in_progress") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }
  if (status === "pass" || status === "succeeded") {
    return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  }
  return "border-white/10 bg-white/5 text-slate-300";
}

function titleCase(value: string) {
  return (value || "unknown").replaceAll("_", " ").replaceAll("-", " ");
}

export default function PoliciesWorkspace() {
  const { hosts, selectedHost, setSelectedHost, snapshot, refresh: refreshMonitor } = useProcessMonitor();
  const { checks, results, actions, loading, busy, error, refresh, createCustomCheck, updateCheck, runCheck, queueAction } =
    usePolicyEngine(selectedHost || null);

  const [customName, setCustomName] = useState("");
  const [customSource, setCustomSource] = useState("processes");
  const [customField, setCustomField] = useState("name");
  const [customOperator, setCustomOperator] = useState("contains");
  const [customValue, setCustomValue] = useState("");
  const [processPid, setProcessPid] = useState("");
  const [querySource, setQuerySource] = useState("processes");
  const [queryField, setQueryField] = useState("name");
  const [queryOperator, setQueryOperator] = useState("contains");
  const [queryValue, setQueryValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const patchFindings = snapshot?.security_posture?.patch_posture?.findings ?? [];
  const failingResults = results.filter((item) => item.status === "fail");
  const warningResults = results.filter((item) => item.status === "warn");
  const mobileResults = results.filter((item) => item.category === "mobile");

  const latestAction = actions[0] ?? null;

  const topChecks = useMemo(() => checks.slice(0, 12), [checks]);

  async function handleCreateCheck() {
    if (!customName.trim()) {
      return;
    }
    await createCustomCheck({
      name: customName.trim(),
      severity: "warning",
      config: {
        source: customSource,
        field: customField,
        operator: customOperator,
        value: customValue,
        result_mode: "fail_on_match",
        limit: 10,
      },
    });
    setCustomName("");
    setCustomValue("");
    setMessage("Custom check created.");
  }

  async function handleQueueAction(kind: "refresh_snapshot" | "collect_diagnostics" | "terminate_process" | "live_query") {
    if (kind === "terminate_process" && !processPid.trim()) {
      return;
    }
    const parameters =
      kind === "terminate_process"
        ? { pid: Number(processPid) }
        : kind === "live_query"
          ? { source: querySource, field: queryField, operator: queryOperator, value: queryValue, limit: 12 }
          : {};

    await queueAction({
      kind,
      parameters,
      note:
        kind === "live_query"
          ? `Live query on ${querySource}.${queryField}`
          : kind === "terminate_process"
            ? `Terminate PID ${processPid}`
            : titleCase(kind),
    });
    setMessage(`${titleCase(kind)} queued.`);
  }

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Policies and response"
        description="Saved checks, patch posture, mobile compliance, live queries, and remediation actions in one operator surface."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr] xl:items-start">
              <div>
                <div className="eyebrow">Policy engine</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Turn raw telemetry into checks, posture, and response.
                </div>
                <div className="section-copy mt-4 text-base">
                  This is the product layer above HostLens telemetry: built-in security checks, mobile
                  compliance, patch posture, custom saved checks, and a small live action queue.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Scope</div>
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
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      refresh();
                      refreshMonitor();
                    }}
                    className="btn-secondary"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh policy view
                  </button>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-[1.6rem] border border-emerald-300/18 bg-emerald-300/10 px-5 py-4 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Saved checks</div>
              <div className="metric-value mt-3 text-white">{checks.length}</div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Failing checks</div>
              <div className="metric-value mt-3 text-white">{failingResults.length}</div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Mobile compliance</div>
              <div className="metric-value mt-3 text-white">{mobileResults.length}</div>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <div className="kicker">Patch findings</div>
              <div className="metric-value mt-3 text-white">{patchFindings.length}</div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Saved checks</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Built-in policy checks plus your custom match rules on the latest snapshot.
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {loading ? (
                  <div className="text-sm text-slate-400">Loading checks...</div>
                ) : topChecks.length === 0 ? (
                  <div className="text-sm text-slate-400">No checks available.</div>
                ) : (
                  topChecks.map((check) => (
                    <div key={check.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{check.name}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {titleCase(check.category)} · {titleCase(check.severity)} · {check.builtin ? "Built-in" : "Custom"}
                          </div>
                          <div className="mt-3 text-sm leading-7 text-slate-400">{check.description}</div>
                        </div>
                        <div className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${toneClass(check.latest_result?.status || "unknown")}`}>
                          {titleCase(check.latest_result?.status || "unknown")}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void updateCheck(check, { enabled: !check.enabled })}
                          className="btn-secondary"
                          disabled={busy}
                        >
                          {check.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void runCheck(check.id)}
                          className="btn-secondary"
                          disabled={busy}
                        >
                          <Play className="h-4 w-4" />
                          Run now
                        </button>
                      </div>
                      {check.latest_result ? (
                        <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-[#070e15] px-4 py-4 text-sm leading-7 text-slate-300">
                          {check.latest_result.summary}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="panel rounded-[2rem] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="font-display text-2xl font-semibold text-white">Patch posture</div>
                    <div className="mt-1 text-sm text-slate-400">
                      Lightweight vulnerability and patch-baseline review from the software inventory.
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="kicker">Current state</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {snapshot?.security_posture?.patch_posture?.state || "unknown"}
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {patchFindings.length === 0 ? (
                    <div className="rounded-[1.2rem] border border-white/8 bg-[#070e15] px-4 py-4 text-sm text-slate-400">
                      No patch baseline findings on the latest snapshot.
                    </div>
                  ) : (
                    patchFindings.slice(0, 6).map((finding) => (
                      <div key={`${finding.identifier}-${finding.version}`} className="rounded-[1.2rem] border border-white/8 bg-[#070e15] p-4">
                        <div className="text-sm font-semibold text-white">{finding.name}</div>
                        <div className="mt-2 text-xs text-slate-500">
                          {finding.version || "unknown version"} · minimum {finding.minimum_version}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="panel rounded-[2rem] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="font-display text-2xl font-semibold text-white">Latest results</div>
                    <div className="mt-1 text-sm text-slate-400">
                      Most recent check executions for this device.
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {results.slice(0, 8).map((result) => (
                    <div key={result.id} className="rounded-[1.2rem] border border-white/8 bg-[#070e15] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{result.check_name}</div>
                          <div className="mt-2 text-xs text-slate-500">{result.summary}</div>
                        </div>
                        <div className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${toneClass(result.status)}`}>
                          {result.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Custom check builder</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Save your own snapshot checks and run them on demand.
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <div className="kicker">Check name</div>
                  <input value={customName} onChange={(event) => setCustomName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="kicker">Source</div>
                    <select value={customSource} onChange={(event) => setCustomSource(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]">
                      <option value="processes">Processes</option>
                      <option value="software_inventory">Software</option>
                      <option value="service_inventory">Services</option>
                      <option value="startup_items">Startup items</option>
                      <option value="file_integrity_items">Integrity</option>
                      <option value="auth_events">Auth events</option>
                      <option value="network_connections">Network connections</option>
                    </select>
                  </label>
                  <label className="block">
                    <div className="kicker">Field</div>
                    <input value={customField} onChange={(event) => setCustomField(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]" />
                  </label>
                  <label className="block">
                    <div className="kicker">Operator</div>
                    <select value={customOperator} onChange={(event) => setCustomOperator(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]">
                      <option value="contains">contains</option>
                      <option value="equals">equals</option>
                      <option value="starts_with">starts with</option>
                      <option value="ends_with">ends with</option>
                      <option value="gt">greater than</option>
                      <option value="lt">less than</option>
                      <option value="exists">exists</option>
                    </select>
                  </label>
                  <label className="block">
                    <div className="kicker">Value</div>
                    <input value={customValue} onChange={(event) => setCustomValue(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]" />
                  </label>
                </div>
                <button type="button" onClick={() => void handleCreateCheck()} className="btn-primary" disabled={busy}>
                  Save custom check
                </button>
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Live query and response</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Queue a device action or a live query for the running HostLens agent.
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => void handleQueueAction("refresh_snapshot")} className="btn-secondary" disabled={busy}>
                    <RefreshCw className="h-4 w-4" />
                    Refresh snapshot
                  </button>
                  <button type="button" onClick={() => void handleQueueAction("collect_diagnostics")} className="btn-secondary" disabled={busy}>
                    <TerminalSquare className="h-4 w-4" />
                    Collect diagnostics
                  </button>
                </div>
                <label className="block">
                  <div className="kicker">Terminate process by PID</div>
                  <div className="mt-2 flex gap-3">
                    <input value={processPid} onChange={(event) => setProcessPid(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]" />
                    <button type="button" onClick={() => void handleQueueAction("terminate_process")} className="btn-secondary" disabled={busy}>
                      Kill
                    </button>
                  </div>
                </label>
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="kicker">Live query</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <select value={querySource} onChange={(event) => setQuerySource(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]">
                      <option value="processes">Processes</option>
                      <option value="software_inventory">Software</option>
                      <option value="service_inventory">Services</option>
                      <option value="startup_items">Startup items</option>
                      <option value="file_integrity_items">Integrity</option>
                      <option value="auth_events">Auth events</option>
                      <option value="network_connections">Network connections</option>
                    </select>
                    <input value={queryField} onChange={(event) => setQueryField(event.target.value)} placeholder="field" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]" />
                    <select value={queryOperator} onChange={(event) => setQueryOperator(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]">
                      <option value="contains">contains</option>
                      <option value="equals">equals</option>
                      <option value="starts_with">starts with</option>
                      <option value="ends_with">ends with</option>
                      <option value="gt">greater than</option>
                      <option value="lt">less than</option>
                      <option value="exists">exists</option>
                    </select>
                    <input value={queryValue} onChange={(event) => setQueryValue(event.target.value)} placeholder="value" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]" />
                  </div>
                  <button type="button" onClick={() => void handleQueueAction("live_query")} className="btn-primary mt-4" disabled={busy}>
                    Run live query
                  </button>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="kicker">Latest action</div>
                  {latestAction ? (
                    <div className="mt-3">
                      <div className="text-sm font-semibold text-white">{titleCase(latestAction.kind)}</div>
                      <div className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${toneClass(latestAction.status)}`}>
                        {titleCase(latestAction.status)}
                      </div>
                      {Object.keys(latestAction.result || {}).length ? (
                        <pre className="mt-4 overflow-x-auto rounded-[1.1rem] border border-white/8 bg-[#070e15] p-4 text-xs leading-6 text-slate-300">
{JSON.stringify(latestAction.result, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-slate-400">No queued or completed actions yet.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="panel rounded-[2rem] p-5 sm:p-6">
            <div className="font-display text-2xl font-semibold text-white">Action queue</div>
            <div className="mt-2 text-sm text-slate-400">
              Recent remediation and live-query runs for the selected device.
            </div>
            <div className="mt-6 grid gap-3">
              {actions.slice(0, 10).map((action) => (
                <div key={action.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{titleCase(action.kind)}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        {action.note || "No note"} · {new Date(action.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${toneClass(action.status)}`}>
                      {titleCase(action.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  );
}
