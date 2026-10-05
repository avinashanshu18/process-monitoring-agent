"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Clock3,
  FolderTree,
  Fingerprint,
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import {
  useProcessMonitor,
  type AuthEventItem,
  type FileIntegrityItem,
  type InventoryTimelineItem,
  type StartupItem,
} from "@/hooks/use-process-monitor";

function formatDate(value: string) {
  if (!value) {
    return "No timestamp";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function formatBytes(value: number | null) {
  if (value === null || value <= 0) {
    return "n/a";
  }
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${value} B`;
}

function shortHash(value: string) {
  if (!value) {
    return "No hash";
  }
  if (value.length <= 20) {
    return value;
  }
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
}

function severityTone(value: string) {
  if (value === "critical") {
    return "border-red-400/20 bg-red-400/10 text-red-100";
  }
  if (value === "warning") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }
  return "border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] text-[var(--color-accent)]";
}

function categoryLabel(value: string) {
  return (value || "uncategorized").replaceAll("_", " ");
}

function startupIdentity(item: StartupItem) {
  return item.location || item.command || item.name;
}

function SummaryCard({
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

function TimelineItemCard({ event }: { event: InventoryTimelineItem }) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{event.title}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            {event.kind.replaceAll("_", " ")}
          </div>
        </div>
        <div
          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${severityTone(event.severity)}`}
        >
          {event.severity}
        </div>
      </div>
      <div className="mt-3 text-sm leading-7 text-slate-400">
        {event.subtitle || "No additional context"}
      </div>
      <div className="mt-4 text-xs text-slate-500">{formatDate(event.occurred_at)}</div>
    </div>
  );
}

function AuthEventCard({ event }: { event: AuthEventItem }) {
  const remote = Boolean(event.source);
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{event.username}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            {(event.event_type || "login session").replaceAll("_", " ")}
          </div>
        </div>
        <div
          className={`rounded-full border px-3 py-1.5 text-xs ${remote ? "border-red-400/20 bg-red-400/10 text-red-100" : "border-white/10 bg-white/5 text-slate-200"}`}
        >
          {remote ? "Remote" : "Local"}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="kicker">Source</div>
          <div className="mt-2 text-sm text-white">{event.source || "Local console"}</div>
        </div>
        <div>
          <div className="kicker">Terminal</div>
          <div className="mt-2 text-sm text-white">{event.terminal || "Unknown terminal"}</div>
        </div>
      </div>
      <div className="mt-4 text-sm leading-7 text-slate-400">{event.summary || "No summary"}</div>
      <div className="mt-4 text-xs text-slate-500">{formatDate(event.occurred_at)}</div>
    </div>
  );
}

export default function IntegrityWorkspace() {
  const {
    hosts,
    selectedHost,
    setSelectedHost,
    snapshot,
    inventoryTimeline,
    error,
    loading,
    refresh,
  } = useProcessMonitor();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPath, setSelectedPath] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const fileItems = snapshot?.file_integrity_items ?? [];
  const authEvents = snapshot?.auth_events ?? [];
  const startupItems = snapshot?.startup_items ?? [];
  const remoteAuthEvents = authEvents.filter((event) => Boolean(event.source));
  const visibleTimeline = useMemo(() => inventoryTimeline.slice(0, 10), [inventoryTimeline]);

  const filteredFiles = useMemo(
    () =>
      fileItems.filter((item) => {
        if (categoryFilter !== "all" && item.category !== categoryFilter) {
          return false;
        }
        if (!deferredQuery) {
          return true;
        }
        return [item.path, item.category, item.sha256, item.mode]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(deferredQuery));
      }),
    [categoryFilter, deferredQuery, fileItems],
  );

  const fileCategories = useMemo(
    () =>
      Array.from(new Set(fileItems.map((item) => item.category).filter(Boolean))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [fileItems],
  );

  useEffect(() => {
    if (!filteredFiles.length) {
      setSelectedPath("");
      return;
    }
    const existing = filteredFiles.find((item) => item.path === selectedPath);
    if (!existing) {
      setSelectedPath(filteredFiles[0]?.path ?? "");
    }
  }, [filteredFiles, selectedPath]);

  const selectedFile =
    filteredFiles.find((item) => item.path === selectedPath) ?? filteredFiles[0] ?? null;

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Integrity watch"
        description="Sensitive file drift, persistence inventory, auth history, and timeline changes for the selected device."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="eyebrow">Integrity and access watch</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Keep sensitive files, persistence surfaces, and login activity in one investigation lane.
                </div>
                <div className="section-copy mt-4 text-base">
                  HostLens tracks shell profiles, SSH controls, launch items, service units, and recent auth history so suspicious drift is visible without shelling into every device.
                </div>
              </div>
              <div className="panel rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-[var(--color-accent)]" />
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
                        <option
                          key={host.agent_id || host.hostname}
                          value={host.agent_id || host.hostname}
                        >
                          {host.display_name || host.hostname}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button type="button" onClick={refresh} className="btn-secondary mt-5">
                  <RefreshCw className="h-4 w-4" />
                  Refresh integrity data
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
                Waiting for integrity telemetry
              </div>
              <div className="copy mt-3 max-w-2xl text-sm leading-7">
                Start the agent on a claimed device and HostLens will populate this workspace with
                sensitive file inventory, persistence surfaces, auth history, and change events.
              </div>
            </section>
          ) : null}

          {snapshot ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Sensitive files"
                  value={String(fileItems.length)}
                  body="Monitored shell, SSH, launch, and system control files surfaced on the current device."
                />
                <SummaryCard
                  label="Auth events"
                  value={String(authEvents.length)}
                  body="Recent login-session history entries seen by the agent during the latest collection."
                />
                <SummaryCard
                  label="Persistence entries"
                  value={String(startupItems.length)}
                  body="Launch agents, daemons, service units, and other startup surfaces the device is exposing."
                />
                <SummaryCard
                  label="Timeline changes"
                  value={String(inventoryTimeline.length)}
                  body="Recent software, integrity, persistence, and auth drift events reconstructed from snapshots."
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="panel rounded-[2rem] p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                        <FolderTree className="h-3.5 w-3.5" />
                        Integrity explorer
                      </div>
                      <div className="mt-3 font-display text-2xl font-semibold text-white">
                        Sensitive file inventory
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        Search by path, category, mode, or hash. This surface is tuned for high-signal locations, not a noisy recursive file scan.
                      </div>
                    </div>
                    <label className="relative block min-w-[280px]">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search path, category, or hash"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-3 text-sm text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition ${
                        categoryFilter === "all"
                          ? "border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.12)] text-[var(--color-accent)]"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      All categories
                    </button>
                    {fileCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setCategoryFilter(category)}
                        className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition ${
                          categoryFilter === category
                            ? "border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.12)] text-[var(--color-accent)]"
                            : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {categoryLabel(category)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3">
                    {filteredFiles.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                        No matching integrity items for the current filter.
                      </div>
                    ) : (
                      filteredFiles.map((item) => {
                        const isActive = selectedFile?.path === item.path;
                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => setSelectedPath(item.path)}
                            className={`rounded-[1.5rem] border p-4 text-left transition ${
                              isActive
                                ? "border-[rgba(119,224,195,0.22)] bg-[rgba(119,224,195,0.1)]"
                                : "border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-semibold text-white">{item.path}</div>
                                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                                  {categoryLabel(item.category)}
                                </div>
                              </div>
                              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                                {item.mode || "mode n/a"}
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span>{formatBytes(item.size_bytes)}</span>
                              <span>•</span>
                              <span>{shortHash(item.sha256)}</span>
                              <span>•</span>
                              <span>{formatDate(item.modified_at)}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
                    <div className="font-display text-2xl font-semibold text-white">
                      Selected file detail
                    </div>
                  </div>
                  {selectedFile ? (
                    <div className="mt-5 grid gap-4">
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Path</div>
                        <div className="mt-3 break-all text-sm leading-7 text-white">
                          {selectedFile.path}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                          <div className="kicker">Category</div>
                          <div className="mt-3 text-sm font-semibold text-white">
                            {categoryLabel(selectedFile.category)}
                          </div>
                        </div>
                        <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                          <div className="kicker">Permissions</div>
                          <div className="mt-3 text-sm font-semibold text-white">
                            {selectedFile.mode || "n/a"}
                          </div>
                        </div>
                        <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                          <div className="kicker">Size</div>
                          <div className="mt-3 text-sm font-semibold text-white">
                            {formatBytes(selectedFile.size_bytes)}
                          </div>
                        </div>
                        <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                          <div className="kicker">Modified</div>
                          <div className="mt-3 text-sm font-semibold text-white">
                            {formatDate(selectedFile.modified_at)}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">SHA-256</div>
                        <div className="mt-3 break-all font-mono text-sm leading-7 text-white">
                          {selectedFile.sha256 || "No hash captured"}
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                          <div className="text-sm font-semibold text-white">Why this matters</div>
                        </div>
                        <div className="mt-3 text-sm leading-7 text-slate-400">
                          HostLens tracks high-signal control files so users can spot startup drift, shell tampering, SSH changes, and service-level persistence without trawling the filesystem.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                      Select a file from the inventory explorer to inspect its metadata.
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
                <div className="panel rounded-[2rem] p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-[var(--color-accent)]" />
                    <div className="font-display text-2xl font-semibold text-white">Auth history</div>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Recent login-session entries captured from the device. Remote entries are surfaced more aggressively because they often matter first.
                  </div>
                  <div className="mt-5 grid gap-3">
                    {authEvents.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                        No auth history collected in the latest snapshot yet.
                      </div>
                    ) : (
                      authEvents.map((event, index) => (
                        <AuthEventCard
                          key={`${event.username}-${event.terminal}-${event.occurred_at}-${index}`}
                          event={event}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="panel rounded-[2rem] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <Clock3 className="h-5 w-5 text-[var(--color-accent)]" />
                      <div className="font-display text-2xl font-semibold text-white">
                        Inventory timeline
                      </div>
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-400">
                      Drift reconstructed across snapshots so software additions, integrity changes, persistence changes, and new auth events can be reviewed in order.
                    </div>
                    <div className="mt-5 grid gap-3">
                      {visibleTimeline.length === 0 ? (
                        <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                          Timeline events will appear once HostLens has at least two snapshots to compare.
                        </div>
                      ) : (
                        visibleTimeline.map((event, index) => (
                          <TimelineItemCard key={`${event.kind}-${event.occurred_at}-${index}`} event={event} />
                        ))
                      )}
                    </div>
                  </div>

                  <div className="panel rounded-[2rem] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <UserRound className="h-5 w-5 text-[var(--color-accent)]" />
                      <div className="font-display text-2xl font-semibold text-white">
                        Persistence and session surface
                      </div>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Remote auth entries</div>
                        <div className="mt-3 font-display text-3xl font-semibold text-white">
                          {remoteAuthEvents.length}
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Startup surfaces</div>
                        <div className="mt-3 font-display text-3xl font-semibold text-white">
                          {startupItems.length}
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Risk posture</div>
                        <div
                          className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${severityTone(snapshot.risk_level)}`}
                        >
                          {snapshot.risk_level || "healthy"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {startupItems.length === 0 ? (
                        <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm leading-7 text-slate-400">
                          No startup or persistence entries were detected in the latest snapshot.
                        </div>
                      ) : (
                        startupItems.slice(0, 8).map((item) => (
                          <div
                            key={startupIdentity(item)}
                            className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-semibold text-white">
                                  {item.name || startupIdentity(item)}
                                </div>
                                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                                  {(item.type || "startup").replaceAll("_", " ")} ·{" "}
                                  {(item.scope || "system").replaceAll("_", " ")}
                                </div>
                              </div>
                              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                                {item.publisher || "Unknown publisher"}
                              </div>
                            </div>
                            <div className="mt-3 break-all text-sm leading-7 text-slate-400">
                              {item.location || item.command || "No command recorded"}
                            </div>
                          </div>
                        ))
                      )}
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
