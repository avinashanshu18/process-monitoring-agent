"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  AppWindowMac,
  Fingerprint,
  FolderTree,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import {
  useProcessMonitor,
  type AlertItem,
  type SoftwareItem,
  type UserSessionItem,
} from "@/hooks/use-process-monitor";

function signatureTone(signatureState: string) {
  switch (signatureState) {
    case "platform":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
    case "trusted":
      return "border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] text-[var(--color-accent)]";
    case "managed":
      return "border-sky-300/20 bg-sky-300/10 text-sky-100";
    case "unsigned":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    default:
      return "border-white/10 bg-white/4 text-slate-300";
  }
}

function signatureLabel(signatureState: string) {
  switch (signatureState) {
    case "platform":
      return "Platform signed";
    case "trusted":
      return "Signed";
    case "managed":
      return "Managed";
    case "unsigned":
      return "Unsigned";
    default:
      return "Unknown";
  }
}

function shortHash(value: string) {
  if (!value) {
    return "n/a";
  }
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
}

function formatTimestamp(value: string) {
  if (!value) {
    return "No start time";
  }
  return new Date(value).toLocaleString();
}

function relevantSoftwareAlerts(alerts: AlertItem[]) {
  return alerts.filter((alert) =>
    ["new_software", "unsigned_software", "startup_drift", "remote_session"].includes(alert.type),
  );
}

function softwareIdentity(item: SoftwareItem) {
  return item.identifier || item.install_path || item.name;
}

function SoftwareCard({
  label,
  value,
  body,
}: {
  label: string;
  value: string;
  body: string;
}) {
  return (
    <div className="panel rounded-[1.7rem] p-5">
      <div className="kicker">{label}</div>
      <div className="mt-4 font-display text-4xl font-semibold text-white">{value}</div>
      <div className="mt-3 text-sm leading-7 text-slate-400">{body}</div>
    </div>
  );
}

function SessionCard({ session }: { session: UserSessionItem }) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{session.username}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            {session.remote ? "remote session" : "local session"}
          </div>
        </div>
        <div
          className={`rounded-full border px-3 py-1.5 text-xs ${
            session.remote
              ? "border-red-400/20 bg-red-400/10 text-red-100"
              : "border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] text-[var(--color-accent)]"
          }`}
        >
          {session.remote ? "Remote" : "Local"}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="kicker">Terminal</div>
          <div className="mt-2 text-sm text-white">{session.terminal || "No terminal"}</div>
        </div>
        <div>
          <div className="kicker">Source</div>
          <div className="mt-2 text-sm text-white">{session.host || "Local device"}</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-500">{formatTimestamp(session.started_at)}</div>
    </div>
  );
}

function AlertChip({ alert }: { alert: AlertItem }) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{alert.message}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            {alert.type.replaceAll("_", " ")} · {alert.hostname}
          </div>
        </div>
        <div
          className={`rounded-full border px-3 py-1.5 text-xs ${
            alert.level === "critical"
              ? "border-red-400/20 bg-red-400/10 text-red-100"
              : alert.level === "warning"
                ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                : "border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] text-[var(--color-accent)]"
          }`}
        >
          {alert.level}
        </div>
      </div>
    </div>
  );
}

export default function SoftwareWorkspace() {
  const {
    hosts,
    selectedHost,
    setSelectedHost,
    snapshot,
    error,
    loading,
    refresh,
  } = useProcessMonitor();
  const [query, setQuery] = useState("");
  const [trustFilter, setTrustFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const softwareInventory = snapshot?.software_inventory ?? [];
  const userSessions = snapshot?.user_sessions ?? [];
  const softwareAlerts = relevantSoftwareAlerts(snapshot?.alerts ?? []);

  const filteredSoftware = useMemo(
    () =>
      softwareInventory.filter((item) => {
        const signatureState = item.signature_state || "unknown";
        if (trustFilter !== "all" && signatureState !== trustFilter) {
          return false;
        }
        if (scopeFilter !== "all" && (item.install_scope || "system") !== scopeFilter) {
          return false;
        }
        if (!deferredQuery) {
          return true;
        }

        return [
          item.name,
          item.identifier,
          item.publisher,
          item.signer,
          item.install_path,
          item.version,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(deferredQuery));
      }),
    [deferredQuery, scopeFilter, softwareInventory, trustFilter],
  );

  const trustedCount = softwareInventory.filter((item) =>
    ["platform", "trusted", "managed"].includes(item.signature_state || "unknown"),
  ).length;
  const unsignedCount = softwareInventory.filter(
    (item) => (item.signature_state || "unknown") === "unsigned",
  ).length;
  const remoteSessions = userSessions.filter((session) => session.remote);

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Software inventory"
        description="Installed software, binary trust metadata, and operator-relevant change signals on the selected device."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="eyebrow">Software trust</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Inventory what is installed. Surface what changed. Keep trust visible.
                </div>
                <div className="section-copy mt-4 text-base">
                  This workspace ties software inventory, signature state, persistence drift, and
                  session exposure into one operator lane instead of making users hunt through raw
                  process output.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <AppWindowMac className="h-5 w-5 text-[var(--color-accent)]" />
                  <div className="font-display text-2xl font-semibold text-white">Selected device</div>
                </div>
                <label className="mt-5 block">
                  <div className="kicker">Device</div>
                  <select
                    value={selectedHost}
                    onChange={(event) => setSelectedHost(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                  >
                    {hosts.length === 0 ? (
                      <option value="">Waiting for device</option>
                    ) : (
                      hosts.map((host) => (
                        <option key={host.agent_id || host.hostname} value={host.agent_id || host.hostname}>
                          {host.display_name || host.hostname}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button type="button" onClick={refresh} className="btn-secondary mt-5">
                  Refresh inventory
                </button>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {!loading && !snapshot ? (
            <section className="shell-frame rounded-[2rem] px-6 py-8">
              <div className="font-display text-2xl font-semibold text-white">
                Waiting for software inventory
              </div>
              <div className="copy mt-3 max-w-2xl text-sm leading-7">
                Start the agent on a claimed device and HostLens will populate this workspace with
                installed software, trust metadata, and session visibility.
              </div>
            </section>
          ) : null}

          {snapshot ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SoftwareCard
                  label="Inventoried software"
                  value={String(softwareInventory.length)}
                  body="Apps or packages currently surfaced on the selected host."
                />
                <SoftwareCard
                  label="Trusted or managed"
                  value={String(trustedCount)}
                  body="Signed platform apps, trusted publishers, or managed packages."
                />
                <SoftwareCard
                  label="Unsigned"
                  value={String(unsignedCount)}
                  body="Items that should be reviewed because no signature trust was found."
                />
                <SoftwareCard
                  label="Remote sessions"
                  value={String(remoteSessions.length)}
                  body="Active sessions that did not originate from the local device."
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="panel rounded-[2rem] p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                        <FolderTree className="h-3.5 w-3.5" />
                        Inventory explorer
                      </div>
                      <div className="mt-3 font-display text-2xl font-semibold text-white">
                        Installed software and trust metadata
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        Filter by trust state, install scope, or package identity. Hash and signer
                        data stay visible so the list remains operational.
                      </div>
                    </div>
                    <label className="relative block min-w-[280px]">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search app, publisher, signer, or path"
                        className="w-full rounded-full border border-white/10 bg-white/4 py-3 pl-11 pr-4 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      />
                    </label>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <div className="kicker">Trust filter</div>
                      <select
                        value={trustFilter}
                        onChange={(event) => setTrustFilter(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      >
                        <option value="all">All trust states</option>
                        <option value="platform">Platform signed</option>
                        <option value="trusted">Signed</option>
                        <option value="managed">Managed packages</option>
                        <option value="unsigned">Unsigned</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </label>
                    <label className="block">
                      <div className="kicker">Install scope</div>
                      <select
                        value={scopeFilter}
                        onChange={(event) => setScopeFilter(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      >
                        <option value="all">All scopes</option>
                        <option value="system">System</option>
                        <option value="user">User</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-6 space-y-3">
                    {filteredSoftware.length ? (
                      filteredSoftware.map((item) => (
                        <div
                          key={softwareIdentity(item)}
                          className="rounded-[1.6rem] border border-white/8 bg-white/4 p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-base font-semibold text-white">{item.name}</div>
                                <div
                                  className={`rounded-full border px-3 py-1.5 text-xs ${signatureTone(item.signature_state || "unknown")}`}
                                >
                                  {signatureLabel(item.signature_state || "unknown")}
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                                <span>{item.version || "No version"}</span>
                                <span>{item.identifier || "No identifier"}</span>
                                <span>{item.install_source || "inventory"}</span>
                                <span>{item.install_scope || "system"}</span>
                              </div>
                            </div>
                            <div className="text-sm text-slate-300">{item.publisher || item.signer || "Unknown publisher"}</div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <div className="rounded-[1.2rem] border border-white/8 bg-[#060b12] px-3 py-3">
                              <div className="kicker">Install path</div>
                              <div className="mt-2 break-all font-mono text-[0.72rem] leading-6 text-slate-300">
                                {item.install_path || item.executable_path || "No path reported"}
                              </div>
                            </div>
                            <div className="rounded-[1.2rem] border border-white/8 bg-[#060b12] px-3 py-3">
                              <div className="kicker">Trust metadata</div>
                              <div className="mt-2 text-sm text-white">
                                {item.signer || item.team_identifier || "No signer metadata"}
                              </div>
                              <div className="mt-2 text-xs text-slate-500">
                                Team {item.team_identifier || "n/a"} · SHA {shortHash(item.sha256)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.6rem] border border-white/8 bg-white/4 px-5 py-8 text-sm leading-7 text-slate-400">
                        No software matched the current filters.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="panel rounded-[2rem] p-5">
                    <div className="flex items-center gap-3">
                      <UserRound className="h-5 w-5 text-[var(--color-accent)]" />
                      <div>
                        <div className="font-display text-xl font-semibold text-white">Session visibility</div>
                        <div className="mt-1 text-sm text-slate-400">
                          Current local and remote sessions seen on the selected device.
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {userSessions.length ? (
                        userSessions.map((session, index) => (
                          <SessionCard key={`${session.username}-${session.host}-${index}`} session={session} />
                        ))
                      ) : (
                        <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                          No session detail was reported on this snapshot.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel rounded-[2rem] p-5">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-[var(--color-accent)]" />
                      <div>
                        <div className="font-display text-xl font-semibold text-white">Software drift alerts</div>
                        <div className="mt-1 text-sm text-slate-400">
                          Inventory, trust, persistence, and session signals tied to this host.
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {softwareAlerts.length ? (
                        softwareAlerts.map((alert) => <AlertChip key={alert.id} alert={alert} />)
                      ) : (
                        <div className="rounded-[1.4rem] border border-emerald-300/18 bg-emerald-300/10 p-4 text-sm leading-7 text-emerald-100">
                          No software or session alerts are active on this snapshot.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel rounded-[2rem] p-5">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-5 w-5 text-[var(--color-accent)]" />
                      <div>
                        <div className="font-display text-xl font-semibold text-white">Trust posture</div>
                        <div className="mt-1 text-sm text-slate-400">
                          Quick counts for what looks healthy and what should be reviewed.
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Platform or signed</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{trustedCount}</div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Unsigned</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{unsignedCount}</div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Remote sessions</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{remoteSessions.length}</div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Change alerts</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{softwareAlerts.length}</div>
                      </div>
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
