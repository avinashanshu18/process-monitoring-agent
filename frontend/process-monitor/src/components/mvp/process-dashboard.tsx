"use client";

import Link from "next/link";
import { useDeferredValue, useState, type ComponentType, type ReactNode } from "react";
import {
  Activity,
  AppWindowMac,
  ArrowUpRight,
  BellRing,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  Cpu,
  Fingerprint,
  Gauge,
  HardDrive,
  MemoryStick,
  MonitorCog,
  Network,
  Package2,
  Radar,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UserRound,
  Wifi,
  X,
} from "lucide-react";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/auth/auth-provider";
import {
  useProcessMonitor,
  type AlertItem,
  type HostSummary,
  type NetworkConnectionItem,
  type ProcessItem,
  type SoftwareItem,
  type StartupItem,
  type UserSessionItem,
} from "@/hooks/use-process-monitor";
import { salesEmail } from "@/lib/site-content";

type IconType = ComponentType<{ className?: string }>;
type InspectorView =
  | "plan"
  | "online"
  | "attention"
  | "processes"
  | "software"
  | "process"
  | "cpu"
  | "memory"
  | "disk"
  | "uptime"
  | "device"
  | "network"
  | "hardware";

function percent(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value.toFixed(1)}%`;
}

function memory(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value.toFixed(1)} MB`;
}

function storage(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value.toFixed(1)} GB`;
}

function traffic(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value.toFixed(1)} MB`;
}

function connectionLabel(connection: NetworkConnectionItem) {
  const local = `${connection.local_address || "0.0.0.0"}:${connection.local_port ?? "?"}`;
  if (connection.status === "LISTEN") {
    return local;
  }
  const remote = `${connection.remote_address || "?"}:${connection.remote_port ?? "?"}`;
  return `${local} → ${remote}`;
}

function softwareIdentity(item: SoftwareItem) {
  return item.identifier || item.install_path || item.name;
}

function average(values: Array<number | null | undefined>) {
  const validValues = values.filter(
    (value): value is number => typeof value === "number" && !Number.isNaN(value),
  );
  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function uptime(seconds: number | null) {
  if (!seconds) {
    return "n/a";
  }

  const totalMinutes = Math.floor(seconds / 60);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function lastSeen(value: string | null) {
  if (!value) {
    return "Waiting for snapshot";
  }

  return new Date(value).toLocaleString();
}

function levelMeta(level: string) {
  if (level === "critical") {
    return {
      icon: CircleAlert,
      chip: "border-red-400/20 bg-red-400/10 text-red-100",
      orb: "bg-red-400/12 text-red-200 shadow-[0_0_30px_rgba(248,113,113,0.16)]",
      label: "Critical",
    };
  }

  if (level === "warning") {
    return {
      icon: BellRing,
      chip: "border-amber-300/20 bg-amber-300/10 text-amber-100",
      orb: "bg-amber-300/12 text-amber-100 shadow-[0_0_30px_rgba(240,181,109,0.16)]",
      label: "Warning",
    };
  }

  return {
    icon: CircleCheckBig,
    chip: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    orb: "bg-emerald-300/12 text-emerald-100 shadow-[0_0_30px_rgba(119,224,195,0.16)]",
    label: "Healthy",
  };
}

function statusMeta(status: string) {
  if (status === "Live") {
    return {
      icon: Radar,
      chip: "border-emerald-400/22 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (status === "Disconnected") {
    return {
      icon: ShieldAlert,
      chip: "border-red-400/18 bg-red-400/10 text-red-100",
    };
  }

  return {
    icon: Activity,
    chip: "border-sky-300/18 bg-sky-300/10 text-sky-100",
  };
}

function processIcon(name: string): IconType {
  const value = name.toLowerCase();

  if (value.includes("chrome") || value.includes("safari") || value.includes("browser")) {
    return Wifi;
  }
  if (value.includes("code") || value.includes("codex") || value.includes("node") || value.includes("python") || value.includes("go")) {
    return TerminalSquare;
  }
  if (value.includes("virtual") || value.includes("vm")) {
    return Server;
  }
  if (value.includes("hostlens") || value.includes("agent")) {
    return ShieldCheck;
  }
  return Package2;
}

function chromeIconTone(level: string) {
  if (level === "critical") {
    return "bg-red-400/12 text-red-200";
  }
  if (level === "warning") {
    return "bg-amber-300/12 text-amber-100";
  }
  return "bg-[rgba(119,224,195,0.12)] text-[var(--color-accent)]";
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
  onClick,
}: {
  icon: IconType;
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "signal" | "warning";
  onClick?: () => void;
}) {
  const orbTone =
    tone === "warning"
      ? "bg-amber-300/12 text-amber-100 shadow-[0_0_36px_rgba(240,181,109,0.12)]"
      : tone === "signal"
        ? "bg-[rgba(94,122,255,0.12)] text-[#bdc8ff] shadow-[0_0_36px_rgba(94,122,255,0.12)]"
        : "bg-[rgba(119,224,195,0.12)] text-[var(--color-accent)] shadow-[0_0_36px_rgba(119,224,195,0.12)]";

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-white/8 ${orbTone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="kicker text-right">{label}</div>
      </div>
      <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-3 text-sm leading-7 text-slate-400">{detail}</div>
      {onClick ? (
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          Open detail
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="panel rounded-[1.8rem] p-5 text-left transition hover:border-[rgba(119,224,195,0.2)] hover:bg-white/5"
      >
        {content}
      </button>
    );
  }

  return <div className="panel rounded-[1.8rem] p-5">{content}</div>;
}

function MetricPanel({
  icon: Icon,
  label,
  value,
  subtitle,
  progress,
  onClick,
}: {
  icon: IconType;
  label: string;
  value: string;
  subtitle: string;
  progress?: number | null;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-white/6 text-[var(--color-accent)]">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="kicker">{label}</div>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>
      <div className="metric-value mt-5 text-white">{value}</div>
      {typeof progress === "number" ? (
        <div className="mt-4 progress-rail h-2">
          <span style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      ) : null}
      {onClick ? (
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          Inspect signal
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="panel rounded-[1.6rem] p-5 text-left transition hover:border-[rgba(119,224,195,0.2)] hover:bg-white/5"
      >
        {content}
      </button>
    );
  }

  return <div className="panel rounded-[1.6rem] p-5">{content}</div>;
}

function SignalChip({ level, children }: { level: string; children: ReactNode }) {
  const meta = levelMeta(level);
  const Icon = meta.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${meta.chip}`}>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

function AlertCard({ alert }: { alert: AlertItem }) {
  const meta = levelMeta(alert.level);
  const Icon = meta.icon;

  return (
    <div className={`rounded-[1.4rem] border px-4 py-4 ${meta.chip}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${meta.orb}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{alert.message}</div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.18em] opacity-80">
            {alert.level} · {alert.type.replaceAll("_", " ")}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceTile({
  host,
  active,
  onSelect,
  onInspect,
}: {
  host: HostSummary;
  active: boolean;
  onSelect: () => void;
  onInspect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect();
        onInspect?.();
      }}
      className={`panel rounded-[1.8rem] p-5 text-left transition ${
        active
          ? "border-[rgba(119,224,195,0.24)] bg-[rgba(119,224,195,0.08)]"
          : "hover:border-white/12 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-white/8 ${chromeIconTone(host.latest_alert_level || "info")}`}>
            <MonitorCog className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-xl font-semibold text-white">
              {host.display_name || host.hostname}
            </div>
            <div className="mt-1 truncate text-sm text-slate-400">
              {host.device_type || "device"} · {host.os_name} {host.os_version}
            </div>
          </div>
        </div>
        <SignalChip level={host.latest_alert_level || "info"}>
          {host.latest_alert_level || "healthy"}
        </SignalChip>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/8 bg-[#060b12] px-3 py-3">
          <div className="kicker">CPU</div>
          <div className="mt-2 text-sm font-semibold text-white">{percent(host.latest_cpu_percent)}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[#060b12] px-3 py-3">
          <div className="kicker">Memory</div>
          <div className="mt-2 text-sm font-semibold text-white">{percent(host.latest_memory_percent)}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[#060b12] px-3 py-3">
          <div className="kicker">Processes</div>
          <div className="mt-2 text-sm font-semibold text-white">{host.latest_total_processes}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{host.primary_ip || "No IP"}</span>
        <span>•</span>
        <span>Agent {host.agent_version || "pending"}</span>
        <span>•</span>
        <span>Risk {host.risk_score}/100</span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
        Open device brief
        <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

function DetailCell({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: IconType;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="kicker">{label}</div>
          <div className="mt-1 text-sm font-semibold text-white">{value}</div>
        </div>
      </div>
      {detail ? <div className="mt-3 text-xs text-slate-500">{detail}</div> : null}
    </div>
  );
}

function InspectorStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4">
      <div className="kicker">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold text-white">{value}</div>
      {detail ? <div className="mt-2 text-sm leading-6 text-slate-400">{detail}</div> : null}
    </div>
  );
}

function InspectorSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <div className="font-display text-xl font-semibold text-white">{title}</div>
        {description ? <div className="mt-2 text-sm leading-7 text-slate-400">{description}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function ProcessDashboard() {
  const { user } = useAuth();
  const {
    hosts,
    fleetSummary,
    selectedHost,
    setSelectedHost,
    snapshot,
    history,
    status,
    error,
    loading,
    refresh,
    mode,
  } = useProcessMonitor();
  const [query, setQuery] = useState("");
  const [inspector, setInspector] = useState<InspectorView | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filteredProcesses =
    snapshot?.processes.filter((process) => {
      const value = deferredQuery.trim().toLowerCase();
      if (!value) {
        return true;
      }

      return (
        process.name.toLowerCase().includes(value) ||
        String(process.pid).includes(value) ||
        process.cmdline.toLowerCase().includes(value)
      );
    }) ?? [];

  const topCpu = [...filteredProcesses]
    .sort((left, right) => (right.cpu_percent ?? 0) - (left.cpu_percent ?? 0))
    .slice(0, 6);
  const topMemory = [...filteredProcesses]
    .sort((left, right) => (right.memory_mb ?? 0) - (left.memory_mb ?? 0))
    .slice(0, 8);

  const latestAlerts = snapshot?.alerts.slice(0, 5) ?? [];
  const selectedSummary =
    hosts.find((host) => (host.agent_id || host.hostname) === selectedHost) ?? null;
  const activeStatus = statusMeta(status);
  const ActiveStatusIcon = activeStatus.icon;
  const attentionHosts = hosts.filter((host) =>
    ["warning", "critical"].includes(host.latest_alert_level || ""),
  );
  const criticalHosts = hosts.filter((host) => host.latest_alert_level === "critical");
  const onlineHosts = hosts.filter((host) => host.is_online);
  const activeUsers = Array.from(
    new Set(
      (snapshot?.processes ?? [])
        .map((process) => process.username)
        .filter((value) => Boolean(value && value.trim())),
    ),
  );
  const processStatuses = Object.entries(
    (snapshot?.processes ?? []).reduce<Record<string, number>>((accumulator, process) => {
      const key = process.status || "unknown";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
  const averageCpu = average(history.map((entry) => entry.cpu_percent));
  const averageMemory = average(history.map((entry) => entry.memory_percent));
  const averageDisk = average(history.map((entry) => entry.disk_percent));
  const maxCpu = Math.max(...history.map((entry) => entry.cpu_percent ?? 0), snapshot?.cpu_percent ?? 0);
  const maxMemory = Math.max(
    ...history.map((entry) => entry.memory_percent ?? 0),
    snapshot?.memory_percent ?? 0,
  );
  const maxDisk = Math.max(
    ...history.map((entry) => entry.disk_percent ?? 0),
    snapshot?.disk_percent ?? 0,
  );
  const diskAvailableGb =
    snapshot?.total_disk_gb && snapshot.disk_percent !== null
      ? snapshot.total_disk_gb * ((100 - snapshot.disk_percent) / 100)
      : null;
  const selectedProcessPeerCount = selectedProcess
    ? snapshot?.processes.filter((process) => process.name === selectedProcess.name).length ?? 0
    : 0;
  const selectedProcessUserCount = selectedProcess
    ? snapshot?.processes.filter((process) => process.username === selectedProcess.username).length ?? 0
    : 0;
  const listeningConnections = (snapshot?.network_connections ?? []).filter(
    (connection) => connection.status === "LISTEN",
  );
  const establishedConnections = (snapshot?.network_connections ?? []).filter(
    (connection) => connection.status === "ESTABLISHED",
  );
  const startupItems = snapshot?.startup_items ?? [];
  const softwareInventory = snapshot?.software_inventory ?? [];
  const userSessions = snapshot?.user_sessions ?? [];
  const trustedSoftware = softwareInventory.filter((item) =>
    ["platform", "trusted", "managed"].includes(item.signature_state || "unknown"),
  );
  const unsignedSoftware = softwareInventory.filter(
    (item) => (item.signature_state || "unknown") === "unsigned",
  );
  const remoteSessions = userSessions.filter((session) => session.remote);
  const softwareAlerts = (snapshot?.alerts ?? []).filter((alert) =>
    ["new_software", "unsigned_software", "startup_drift", "remote_session"].includes(alert.type),
  );
  function openProcessInspector(process: ProcessItem) {
    setSelectedProcess(process);
    setInspector("process");
  }
  const inspectorMeta = inspector
    ? {
        plan: {
          label: "Plan detail",
          title: `${user?.profile.active_plan_label || "Plan"} workspace capacity`,
          icon: Sparkles,
          summary: "Commercial limits, billing posture, and how your current customer capacity is being consumed.",
        },
        online: {
          label: "Fleet detail",
          title: "Devices currently live in the workspace",
          icon: Radar,
          summary: "Which devices are online now, how recently they checked in, and where risk is starting to form.",
        },
        attention: {
          label: "Alert posture",
          title: "Devices demanding operator attention",
          icon: ShieldAlert,
          summary: "Warning and critical devices, plus the newest signals coming off the selected machine.",
        },
        processes: {
          label: "Process detail",
          title: "Expanded runtime inventory",
          icon: TerminalSquare,
          summary: "User context, process state, command lines, and the heaviest consumers behind the headline counts.",
        },
        software: {
          label: "Software trust",
          title: "Installed software, trust state, and operator-facing drift",
          icon: AppWindowMac,
          summary: "Inventory, signature metadata, persistence drift, and session exposure tied to the selected device.",
        },
        process: {
          label: "Process inspection",
          title: selectedProcess?.name || "Selected process",
          icon: TerminalSquare,
          summary: "Exact runtime metadata for the chosen process: command, owner, PID lineage, and resource profile.",
        },
        cpu: {
          label: "CPU detail",
          title: "Processor pressure across current and recent snapshots",
          icon: Cpu,
          summary: "Current CPU, peak pressure, load averages, and the processes creating the sharpest spikes.",
        },
        memory: {
          label: "Memory detail",
          title: "Memory pressure and resident set breakdown",
          icon: MemoryStick,
          summary: "Working set saturation, biggest processes by RAM, and how the device is trending over time.",
        },
        disk: {
          label: "Disk detail",
          title: "Storage saturation and available headroom",
          icon: HardDrive,
          summary: "Current disk pressure, estimated remaining capacity, and how close the device is to operational risk.",
        },
        uptime: {
          label: "Runtime detail",
          title: "Availability window and sampling cadence",
          icon: Clock3,
          summary: "How long the host has been up, when HostLens last saw it, and how recent snapshots compare.",
        },
        device: {
          label: "Device brief",
          title: selectedSummary?.display_name || selectedSummary?.hostname || "Selected device",
          icon: MonitorCog,
          summary: "Identity, hardware profile, agent build, monitoring posture, and the pieces that matter before taking action.",
        },
        network: {
          label: "Network detail",
          title: "Traffic and listening surface",
          icon: Network,
          summary: "Network volume, listening services, and active socket exposure seen on the latest snapshot.",
        },
        hardware: {
          label: "Hardware detail",
          title: "Hardware profile and operating system shape",
          icon: Gauge,
          summary: "CPU count, RAM, disk, OS, architecture, and startup persistence surface for the current device.",
        },
      }[inspector]
    : null;
  const inspectorContent = (() => {
    if (!inspector || !snapshot) {
      return null;
    }

    if (inspector === "plan") {
      return (
        <>
          <InspectorSection
            title="Workspace limits"
            description="Commercial limits and service posture attached to the current account."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat
                label="Active plan"
                value={user?.profile.active_plan_label || "Plan"}
                detail={`${user?.profile.host_limit ?? 0} device slots · ${user?.profile.retention_days ?? 0} days retention`}
              />
              <InspectorStat
                label="Billing status"
                value={user?.profile.billing_status || "unknown"}
                detail={user?.profile.subscription_active ? "Subscription active" : "Subscription not active"}
              />
              <InspectorStat
                label="Alert tier"
                value={user?.profile.alert_tier || "standard"}
                detail={user?.profile.priority_support ? "Priority support enabled" : "Standard support path"}
              />
              <InspectorStat
                label="Current period"
                value={user?.profile.current_period_end ? lastSeen(user.profile.current_period_end) : "Not available"}
                detail="Billing renewal or period-end marker from the active subscription."
              />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Capacity consumption"
            description="How the current plan is being consumed across the fleet."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat
                label="Devices used"
                value={String(fleetSummary?.devices_used ?? 0)}
                detail={`${fleetSummary?.devices_remaining ?? 0} device slots still available`}
              />
              <InspectorStat
                label="Online now"
                value={String(fleetSummary?.online_devices ?? 0)}
                detail={`${fleetSummary?.attention_devices ?? 0} devices need attention`}
              />
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-400">
                <span>Plan utilization</span>
                <span>{fleetSummary ? `${fleetSummary.devices_used}/${fleetSummary.device_limit}` : "n/a"}</span>
              </div>
              <div className="progress-rail h-3">
                <span
                  style={{
                    width: fleetSummary
                      ? `${Math.min((fleetSummary.devices_used / Math.max(fleetSummary.device_limit, 1)) * 100, 100)}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "online") {
      return (
        <InspectorSection
          title="Online device roster"
          description="Every claimed device, its last contact time, and the present operational posture."
        >
          <div className="space-y-3">
            {hosts.map((host) => (
              <div key={host.agent_id || host.hostname} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {host.display_name || host.hostname}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                      {host.device_type || "device"} · {host.os_name} {host.os_version}
                    </div>
                  </div>
                  <SignalChip level={host.latest_alert_level || "info"}>
                    {host.is_online ? "online" : "offline"}
                  </SignalChip>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <InspectorStat label="CPU" value={percent(host.latest_cpu_percent)} />
                  <InspectorStat label="Memory" value={percent(host.latest_memory_percent)} />
                  <InspectorStat label="Last seen" value={lastSeen(host.last_seen)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                    {host.primary_ip || "No IP"}
                  </span>
                  <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                    Agent {host.agent_version || "pending"}
                  </span>
                  <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                    Risk {host.risk_score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </InspectorSection>
      );
    }

    if (inspector === "attention") {
      return (
        <>
          <InspectorSection
            title="Devices under pressure"
            description="Devices with warning or critical posture, ranked by latest observed risk."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <InspectorStat label="Attention" value={String(attentionHosts.length)} />
              <InspectorStat label="Critical" value={String(criticalHosts.length)} />
              <InspectorStat label="Latest alerts" value={String(snapshot.alerts.length)} />
            </div>
            <div className="space-y-3">
              {(attentionHosts.length ? attentionHosts : hosts.slice(0, 3)).map((host) => (
                <div key={host.agent_id || host.hostname} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{host.display_name || host.hostname}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {host.primary_ip || "No IP"} · Risk {host.risk_score}/100
                      </div>
                    </div>
                    <SignalChip level={host.latest_alert_level || "info"}>
                      {host.latest_alert_level || "healthy"}
                    </SignalChip>
                  </div>
                </div>
              ))}
            </div>
          </InspectorSection>

          <InspectorSection
            title="Latest alert stream"
            description="Most recent alert objects on the selected device."
          >
            <div className="space-y-3">
              {(snapshot.alerts.length ? snapshot.alerts : [{ id: "none", level: "info", type: "none", message: "No alerts recorded on the current snapshot." }]).map((alert) => (
                <AlertCard key={alert.id} alert={alert as AlertItem} />
              ))}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "processes") {
      return (
        <>
          <InspectorSection
            title="Runtime inventory"
            description="Expanded process context behind the fleet-wide process count."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat
                label="Visible processes"
                value={String(filteredProcesses.length)}
                detail="Processes in the selected device after the current search filter."
              />
              <InspectorStat
                label="Unique users"
                value={String(activeUsers.length)}
                detail="Distinct process owners seen on the current snapshot."
              />
              <InspectorStat
                label="Listening ports"
                value={String(snapshot.listening_ports.length)}
                detail="Current open ports reported by the selected host."
              />
              <InspectorStat
                label="Top process"
                value={topCpu[0]?.name || "n/a"}
                detail={topCpu[0] ? `${percent(topCpu[0].cpu_percent)} CPU · ${memory(topCpu[0].memory_mb)} RAM` : "No process data"}
              />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Process states"
            description="Breakdown of runtime state for the latest process table."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {processStatuses.length ? processStatuses.map(([name, count]) => (
                <InspectorStat key={name} label={name} value={String(count)} />
              )) : <InspectorStat label="State" value="No state data" />}
            </div>
          </InspectorSection>

          <InspectorSection
            title="Heaviest processes"
            description="Largest processes by memory footprint from the current snapshot."
          >
            <div className="space-y-3">
              {topMemory.map((process) => (
                <div key={`${process.pid}-${process.name}`} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">{process.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        PID {process.pid} · {process.username || "system"} · {process.status || "active"}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-300">
                      <div>{memory(process.memory_mb)}</div>
                      <div className="mt-1 text-xs text-slate-500">{percent(process.cpu_percent)} CPU</div>
                    </div>
                  </div>
                  <div className="process-command mt-3 rounded-2xl border border-white/6 bg-[#060b12] px-3 py-3 font-mono text-[0.72rem] leading-6 text-slate-400">
                    {process.cmdline || "No command line reported"}
                  </div>
                </div>
              ))}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "software") {
      return (
        <>
          <InspectorSection
            title="Inventory posture"
            description="Installed software count, trust distribution, and the session surface attached to the selected host."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat
                label="Inventoried software"
                value={String(softwareInventory.length)}
                detail="Apps or packages currently visible in the latest software inventory."
              />
              <InspectorStat
                label="Trusted or managed"
                value={String(trustedSoftware.length)}
                detail="Platform-signed, signed, or package-managed software items."
              />
              <InspectorStat
                label="Unsigned"
                value={String(unsignedSoftware.length)}
                detail="Software items that should be reviewed because no signature trust was found."
              />
              <InspectorStat
                label="Remote sessions"
                value={String(remoteSessions.length)}
                detail="Current sessions that originated from a remote host."
              />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Trust and drift alerts"
            description="Software, persistence, and session signals generated for the selected device."
          >
            <div className="space-y-3">
              {softwareAlerts.length ? softwareAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              )) : (
                <div className="rounded-[1.4rem] border border-emerald-300/18 bg-emerald-300/10 p-4 text-sm leading-7 text-emerald-100">
                  No software, persistence, or session alerts are active on this snapshot.
                </div>
              )}
            </div>
          </InspectorSection>

          <InspectorSection
            title="Representative software inventory"
            description="A focused sample of installed software with trust metadata kept visible."
          >
            <div className="space-y-3">
              {softwareInventory.length ? softwareInventory.slice(0, 10).map((item) => (
                <div key={softwareIdentity(item)} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {item.version || "No version"} · {item.identifier || "No identifier"}
                      </div>
                    </div>
                    <div className={`rounded-full border px-3 py-1.5 text-xs ${
                      (item.signature_state || "unknown") === "unsigned"
                        ? "border-red-400/20 bg-red-400/10 text-red-100"
                        : ["platform", "trusted", "managed"].includes(item.signature_state || "unknown")
                          ? "border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] text-[var(--color-accent)]"
                          : "border-white/10 bg-white/4 text-slate-300"
                    }`}>
                      {item.signature_state || "unknown"}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <InspectorStat label="Publisher" value={item.publisher || item.signer || "Unknown"} />
                    <InspectorStat label="SHA" value={item.sha256 ? `${item.sha256.slice(0, 12)}…${item.sha256.slice(-8)}` : "n/a"} />
                  </div>
                </div>
              )) : (
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                  No software inventory was reported on this snapshot.
                </div>
              )}
            </div>
          </InspectorSection>

          <InspectorSection
            title="User sessions"
            description="Current session objects returned by the agent."
          >
            <div className="space-y-3">
              {userSessions.length ? userSessions.map((session: UserSessionItem, index) => (
                <div key={`${session.username}-${session.host}-${index}`} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{session.username}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {session.terminal || "No terminal"} · {session.host || "Local device"}
                      </div>
                    </div>
                    <div className={`rounded-full border px-3 py-1.5 text-xs ${
                      session.remote
                        ? "border-red-400/20 bg-red-400/10 text-red-100"
                        : "border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] text-[var(--color-accent)]"
                    }`}>
                      {session.remote ? "Remote" : "Local"}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                  No user session detail was reported on this snapshot.
                </div>
              )}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "process") {
      if (!selectedProcess) {
        return (
          <InspectorSection
            title="No process selected"
            description="Pick a process from the explorer or the top CPU list to inspect it here."
          >
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
              The process inspector is ready, but there is no specific process selected yet.
            </div>
          </InspectorSection>
        );
      }

      return (
        <>
          <InspectorSection
            title="Runtime identity"
            description="Core metadata for the currently selected process."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Name" value={selectedProcess.name} />
              <InspectorStat label="PID / PPID" value={`${selectedProcess.pid} / ${selectedProcess.ppid ?? "n/a"}`} />
              <InspectorStat label="Owner" value={selectedProcess.username || "system"} />
              <InspectorStat label="Status" value={selectedProcess.status || "active"} />
              <InspectorStat label="CPU" value={percent(selectedProcess.cpu_percent)} />
              <InspectorStat label="Memory" value={memory(selectedProcess.memory_mb)} />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Command line"
            description="Full execution string as reported by the agent."
          >
            <div className="rounded-[1.4rem] border border-white/8 bg-[#060b12] p-4 font-mono text-[0.78rem] leading-7 text-slate-300">
              {selectedProcess.cmdline || "No command line reported for this process."}
            </div>
          </InspectorSection>

          <InspectorSection
            title="Context around this process"
            description="How this process sits in the rest of the current runtime snapshot."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat
                label="Same-name peers"
                value={String(selectedProcessPeerCount)}
                detail="How many processes with the same name are currently visible."
              />
              <InspectorStat
                label="Same-owner processes"
                value={String(selectedProcessUserCount)}
                detail="How many current processes are running under the same user."
              />
              <InspectorStat
                label="Selected host"
                value={snapshot.hostname}
                detail={`${snapshot.os_name} ${snapshot.os_version} · ${snapshot.architecture}`}
              />
              <InspectorStat
                label="Snapshot time"
                value={lastSeen(snapshot.created_at)}
                detail="When this process data was observed by HostLens."
              />
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "cpu") {
      return (
        <>
          <InspectorSection
            title="CPU pressure"
            description="Processor saturation and load behavior across the current device."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Current CPU" value={percent(snapshot.cpu_percent)} />
              <InspectorStat label="Peak recent CPU" value={percent(maxCpu)} detail={averageCpu !== null ? `Average across history ${percent(averageCpu)}` : undefined} />
              <InspectorStat label="Load 1m" value={snapshot.load_one !== null ? snapshot.load_one.toFixed(2) : "n/a"} />
              <InspectorStat label="Load 5m / 15m" value={`${snapshot.load_five !== null ? snapshot.load_five.toFixed(2) : "n/a"} / ${snapshot.load_fifteen !== null ? snapshot.load_fifteen.toFixed(2) : "n/a"}`} />
            </div>
          </InspectorSection>

          <InspectorSection
            title="CPU contributors"
            description="Processes driving CPU pressure right now."
          >
            <div className="space-y-3">
              {topCpu.map((process) => (
                <div key={`${process.pid}-${process.name}`} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">{process.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        PID {process.pid} · {process.username || "system"}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">{percent(process.cpu_percent)}</div>
                  </div>
                  <div className="mt-3 progress-rail h-2">
                    <span style={{ width: `${Math.min(process.cpu_percent ?? 0, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "memory") {
      return (
        <>
          <InspectorSection
            title="Memory posture"
            description="How hard the selected device is leaning on physical memory."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Current memory" value={percent(snapshot.memory_percent)} />
              <InspectorStat label="Peak recent memory" value={percent(maxMemory)} detail={averageMemory !== null ? `Average across history ${percent(averageMemory)}` : undefined} />
              <InspectorStat label="Installed RAM" value={memory(snapshot.total_memory_mb)} />
              <InspectorStat label="Active users" value={String(snapshot.active_user_count)} detail={`${activeUsers.length} unique process owners`} />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Memory-heavy processes"
            description="Processes with the largest resident footprint right now."
          >
            <div className="space-y-3">
              {topMemory.map((process) => (
                <div key={`${process.pid}-${process.name}`} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">{process.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        PID {process.pid} · {process.status || "active"}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">{memory(process.memory_mb)}</div>
                  </div>
                </div>
              ))}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "disk") {
      return (
        <>
          <InspectorSection
            title="Storage posture"
            description="Disk saturation, remaining headroom, and whether the device is nearing storage risk."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Current disk" value={percent(snapshot.disk_percent)} />
              <InspectorStat label="Peak recent disk" value={percent(maxDisk)} detail={averageDisk !== null ? `Average across history ${percent(averageDisk)}` : undefined} />
              <InspectorStat label="Total disk" value={storage(snapshot.total_disk_gb)} />
              <InspectorStat label="Estimated free" value={storage(diskAvailableGb)} detail="Approximate remaining capacity using the current disk percent." />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Related risk signals"
            description="Signals that usually accompany storage pressure."
          >
            <div className="space-y-3">
              {snapshot.alerts
                .filter((alert) => alert.message.toLowerCase().includes("disk"))
                .map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              {!snapshot.alerts.some((alert) => alert.message.toLowerCase().includes("disk")) ? (
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                  No disk-specific alert object is currently attached to this snapshot. The disk card is still showing a high-saturation condition when the percentage itself crosses warning thresholds.
                </div>
              ) : null}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "uptime") {
      return (
        <>
          <InspectorSection
            title="Availability window"
            description="Device uptime plus the recency and cadence of snapshot collection."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Uptime" value={uptime(snapshot.uptime_seconds)} />
              <InspectorStat label="Last seen" value={lastSeen(snapshot.last_seen)} />
              <InspectorStat label="Snapshots loaded" value={String(history.length)} detail="History samples currently loaded into the workspace." />
              <InspectorStat label="Agent build" value={snapshot.agent_version || "pending"} />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Recent checkpoint timeline"
            description="Most recent snapshots and the pressure profile attached to each one."
          >
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="text-sm font-semibold text-white">{lastSeen(entry.created_at)}</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <InspectorStat label="CPU" value={percent(entry.cpu_percent)} />
                    <InspectorStat label="Memory" value={percent(entry.memory_percent)} />
                    <InspectorStat label="Processes" value={String(entry.total_processes)} />
                  </div>
                </div>
              ))}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "network") {
      return (
        <>
          <InspectorSection
            title="Network and exposure"
            description="Traffic volume, open listening services, and active connection exposure seen on this snapshot."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat label="Sent" value={traffic(snapshot.network_sent_mb)} />
              <InspectorStat label="Received" value={traffic(snapshot.network_recv_mb)} />
              <InspectorStat label="Listening ports" value={String(snapshot.listening_ports.length)} />
              <InspectorStat label="Active users" value={String(snapshot.active_user_count)} />
              <InspectorStat label="Listening sockets" value={String(listeningConnections.length)} />
              <InspectorStat label="Established sockets" value={String(establishedConnections.length)} />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Port inventory"
            description="Open listening ports reported by the agent on the latest snapshot."
          >
            <div className="flex flex-wrap gap-2">
              {snapshot.listening_ports.length ? snapshot.listening_ports.map((port) => (
                <span key={port} className="rounded-full border border-white/8 bg-[#060b12] px-3 py-2 text-xs font-semibold text-slate-300">
                  Port {port}
                </span>
              )) : (
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                  No listening ports were reported on this snapshot.
                </div>
              )}
            </div>
          </InspectorSection>

          <InspectorSection
            title="Observed connections"
            description="High-value socket inventory from the latest snapshot."
          >
            <div className="space-y-3">
              {snapshot.network_connections.length ? snapshot.network_connections.slice(0, 12).map((connection, index) => (
                <div key={`${connection.pid ?? "none"}-${connection.local_port ?? "0"}-${index}`} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {connection.process_name || "unknown-process"} · {connection.protocol || "tcp"}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {connection.status || "unknown"} · PID {connection.pid ?? "n/a"} · {connection.family || "network"}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5 text-xs text-slate-300">
                      {connection.status || "unknown"}
                    </div>
                  </div>
                  <div className="mt-3 rounded-[1rem] border border-white/8 bg-[#060b12] px-3 py-3 font-mono text-[0.72rem] leading-6 text-slate-300">
                    {connectionLabel(connection)}
                  </div>
                </div>
              )) : (
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                  No socket inventory was reported on this snapshot.
                </div>
              )}
            </div>
          </InspectorSection>
        </>
      );
    }

    if (inspector === "hardware") {
      return (
        <>
          <InspectorSection
            title="Host profile"
            description="Hardware, operating system shape, and reboot persistence surface for the selected device."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InspectorStat label="CPU cores" value={snapshot.cpu_count !== null ? String(snapshot.cpu_count) : "n/a"} />
              <InspectorStat label="RAM" value={memory(snapshot.total_memory_mb)} />
              <InspectorStat label="Disk" value={storage(snapshot.total_disk_gb)} />
              <InspectorStat label="Architecture" value={snapshot.architecture} />
              <InspectorStat label="OS" value={`${snapshot.os_name} ${snapshot.os_version}`} />
              <InspectorStat label="Device type" value={snapshot.device_type || "device"} />
              <InspectorStat label="Startup items" value={String(startupItems.length)} detail="Items that can survive reboot or login." />
            </div>
          </InspectorSection>

          <InspectorSection
            title="Startup persistence inventory"
            description="Launch items, services, or boot-time entries that survive reboot or login."
          >
            <div className="space-y-3">
              {startupItems.length ? startupItems.map((item: StartupItem, index) => (
                <div key={`${item.location}-${index}`} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {item.type || "startup"} · {item.scope || "unknown scope"}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5 text-xs text-slate-300">
                      {item.scope || "unknown"}
                    </div>
                  </div>
                  <div className="mt-3 rounded-[1rem] border border-white/8 bg-[#060b12] px-3 py-3 font-mono text-[0.72rem] leading-6 text-slate-300">
                    {item.location || item.command || "No path reported"}
                  </div>
                </div>
              )) : (
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                  No startup persistence inventory was reported on this snapshot.
                </div>
              )}
            </div>
          </InspectorSection>
        </>
      );
    }

    return (
      <>
        <InspectorSection
          title="Identity and posture"
          description="Everything an operator needs before triaging or contacting the device owner."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InspectorStat label="Hostname" value={snapshot.hostname} />
            <InspectorStat label="Agent ID" value={snapshot.agent_id || "pending"} detail="Stable agent identity used by HostLens." />
            <InspectorStat label="Primary IP" value={snapshot.primary_ip || "No IP recorded"} />
            <InspectorStat label="Status" value={snapshot.host_status} detail={`${snapshot.risk_score}/100 risk · ${snapshot.risk_level}`} />
            <InspectorStat label="Agent version" value={snapshot.agent_version || "pending"} />
            <InspectorStat label="Monitoring" value={selectedSummary?.monitoring_enabled ? "enabled" : "enabled"} detail={selectedSummary?.is_online ? "Currently online" : "Currently offline"} />
          </div>
        </InspectorSection>

        <InspectorSection
          title="Hardware and runtime"
          description="Hardware footprint and current runtime values for the selected device."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InspectorStat label="CPU" value={percent(snapshot.cpu_percent)} />
            <InspectorStat label="Memory" value={percent(snapshot.memory_percent)} />
            <InspectorStat label="Disk" value={percent(snapshot.disk_percent)} />
            <InspectorStat label="Uptime" value={uptime(snapshot.uptime_seconds)} />
          </div>
        </InspectorSection>
      </>
    );
  })();

  return (
    <AuthGuard requireClaimedDevice>
      <LayoutWrapper
        title="Control panel"
        description="Live device posture, process inventory, and alert triage shaped into a premium operator surface."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.4rem] px-5 py-6 sm:px-7 sm:py-8">
            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="eyebrow">Command surface</div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${activeStatus.chip}`}>
                    <ActiveStatusIcon className="h-3.5 w-3.5" />
                    {status}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    <Activity className="h-3.5 w-3.5" />
                    {mode}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="kicker">Selected device</div>
                  <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    {snapshot?.display_name || snapshot?.hostname || selectedHost || "Waiting for device"}
                  </h1>
                  <p className="section-copy mt-5 max-w-3xl text-base">
                    A focused control panel for real device telemetry, software trust, fleet capacity,
                    and alert review. The goal is fast operator confidence, not dashboard noise.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    Click cards to inspect the full signal
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button type="button" onClick={refresh} className="btn-secondary">
                    <RefreshCw className="h-4 w-4" />
                    Refresh data
                  </button>
                  <a
                    href={`mailto:${salesEmail}?subject=HostLens%20customer%20onboarding`}
                    className="btn-primary"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Talk about onboarding
                  </a>
                </div>

                <div className="mt-7 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4">
                    <div className="kicker">Last seen</div>
                    <div className="mt-2 text-sm font-semibold text-white">{lastSeen(snapshot?.last_seen ?? null)}</div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4">
                    <div className="kicker">Primary IP</div>
                    <div className="mt-2 text-sm font-semibold text-white">{snapshot?.primary_ip || "No IP recorded"}</div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4">
                    <div className="kicker">Agent build</div>
                    <div className="mt-2 text-sm font-semibold text-white">{snapshot?.agent_version || "pending"}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  icon={Sparkles}
                  label="Plan capacity"
                  value={fleetSummary ? `${fleetSummary.devices_used}/${fleetSummary.device_limit}` : "n/a"}
                  detail={`${user?.profile.plan_label || "Plan"} · ${fleetSummary?.devices_remaining ?? 0} slots left`}
                  onClick={() => setInspector("plan")}
                />
                <StatCard
                  icon={Radar}
                  label="Online devices"
                  value={String(fleetSummary?.online_devices ?? 0)}
                  detail="Devices reporting into the web workspace right now"
                  tone="signal"
                  onClick={() => setInspector("online")}
                />
                <StatCard
                  icon={ShieldAlert}
                  label="Attention required"
                  value={String(fleetSummary?.attention_devices ?? 0)}
                  detail="Devices with warning or critical posture"
                  tone="warning"
                  onClick={() => setInspector("attention")}
                />
                <StatCard
                  icon={TerminalSquare}
                  label="Tracked processes"
                  value={String(fleetSummary?.tracked_processes ?? 0)}
                  detail="Current fleet-wide process inventory across latest snapshots"
                  onClick={() => setInspector("processes")}
                />
                <StatCard
                  icon={AppWindowMac}
                  label="Software inventory"
                  value={String(softwareInventory.length)}
                  detail={`${unsignedSoftware.length} unsigned · ${remoteSessions.length} remote sessions on the selected device`}
                  onClick={() => setInspector("software")}
                />
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {hosts.length ? (
            <section className="grid gap-4 xl:grid-cols-3">
              {hosts.map((host) => (
                <DeviceTile
                  key={host.agent_id || host.hostname}
                  host={host}
                  active={(host.agent_id || host.hostname) === selectedHost}
                  onSelect={() => setSelectedHost(host.agent_id || host.hostname)}
                  onInspect={() => setInspector("device")}
                />
              ))}
            </section>
          ) : null}

          {!loading && !snapshot ? (
            <section className="shell-frame rounded-[2rem] px-6 py-8">
              <div className="font-display text-2xl font-semibold text-white">
                Waiting for the first device snapshot
              </div>
              <div className="copy mt-3 max-w-2xl text-sm leading-7">
                Start the backend, run the Go agent on one machine, and this workspace will populate with
                stable device identity, live telemetry, and multi-device visibility.
              </div>
            </section>
          ) : null}

          {snapshot ? (
            <>
              <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
                <div className="shell-frame rounded-[2.2rem] p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="kicker">Live device watch</div>
                      <div className="mt-2 font-display text-3xl font-semibold text-white">
                        {snapshot.hostname}
                      </div>
                      <div className="mt-3 text-sm leading-7 text-slate-400">
                        Real posture, real risk, and the system pressure that matters right now.
                      </div>
                    </div>
                    <SignalChip level={snapshot.risk_level}>
                      {snapshot.risk_score}/100 risk
                    </SignalChip>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricPanel
                      icon={Cpu}
                      label="CPU"
                      value={percent(snapshot.cpu_percent)}
                      subtitle="Current processor pressure"
                      progress={snapshot.cpu_percent}
                      onClick={() => setInspector("cpu")}
                    />
                    <MetricPanel
                      icon={MemoryStick}
                      label="Memory"
                      value={percent(snapshot.memory_percent)}
                      subtitle="Resident memory pressure"
                      progress={snapshot.memory_percent}
                      onClick={() => setInspector("memory")}
                    />
                    <MetricPanel
                      icon={HardDrive}
                      label="Disk"
                      value={percent(snapshot.disk_percent)}
                      subtitle="Primary volume saturation"
                      progress={snapshot.disk_percent}
                      onClick={() => setInspector("disk")}
                    />
                    <MetricPanel
                      icon={Clock3}
                      label="Uptime"
                      value={uptime(snapshot.uptime_seconds)}
                      subtitle={`Last seen ${lastSeen(snapshot.last_seen)}`}
                      onClick={() => setInspector("uptime")}
                    />
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setInspector("network")}
                      className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5 text-left transition hover:border-[rgba(119,224,195,0.2)] hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
                          <Network className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="kicker">Network and listening surface</div>
                          <div className="mt-1 text-sm font-semibold text-white">
                            {traffic(snapshot.network_sent_mb)} sent · {traffic(snapshot.network_recv_mb)} recv
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {snapshot.listening_ports.length} listening ports
                        </span>
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {listeningConnections.length} listening sockets
                        </span>
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {establishedConnections.length} established flows
                        </span>
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {snapshot.device_type || "device"}
                        </span>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        Open network detail
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspector("hardware")}
                      className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5 text-left transition hover:border-[rgba(119,224,195,0.2)] hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
                          <Gauge className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="kicker">Hardware profile</div>
                          <div className="mt-1 text-sm font-semibold text-white">
                            {snapshot.cpu_count ?? "n/a"} cores · {memory(snapshot.total_memory_mb)} RAM
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {storage(snapshot.total_disk_gb)} total disk
                        </span>
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {startupItems.length} startup items
                        </span>
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {snapshot.os_name} · {snapshot.architecture}
                        </span>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        Open hardware detail
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspector("software")}
                      className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5 text-left transition hover:border-[rgba(119,224,195,0.2)] hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
                          <AppWindowMac className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="kicker">Software trust</div>
                          <div className="mt-1 text-sm font-semibold text-white">
                            {softwareInventory.length} items · {trustedSoftware.length} trusted
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {unsignedSoftware.length} unsigned
                        </span>
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {softwareAlerts.length} change alerts
                        </span>
                        <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5">
                          {remoteSessions.length} remote sessions
                        </span>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        Open software detail
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="panel rounded-[2rem] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="kicker">Device selector</div>
                        <div className="mt-2 font-display text-2xl font-semibold text-white">
                          {hosts.length} visible devices
                        </div>
                        <div className="mt-2 text-sm text-slate-400">
                          {user?.profile.plan_label || "Plan"} includes {user?.profile.host_limit ?? 0} devices and{" "}
                          {user?.profile.retention_days ?? 0} days of history.
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] border border-white/8 bg-white/6 text-[var(--color-accent)]">
                        <MonitorCog className="h-5 w-5" />
                      </div>
                    </div>

                    <label className="mt-5 block">
                      <span className="kicker">Current device</span>
                      <select
                        value={selectedHost}
                        onChange={(event) => setSelectedHost(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      >
                        {hosts.length === 0 ? (
                          <option value="">Waiting for agent</option>
                        ) : (
                          hosts.map((host) => (
                            <option key={host.agent_id || host.hostname} value={host.agent_id || host.hostname}>
                              {host.display_name || host.hostname}
                            </option>
                          ))
                        )}
                      </select>
                    </label>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-[1.4rem] border border-white/8 bg-[#060b12] p-4">
                        <div className="kicker">Processes</div>
                        <div className="mt-2 font-display text-3xl font-semibold text-white">
                          {snapshot.total_processes}
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-[#060b12] p-4">
                        <div className="kicker">Alerts</div>
                        <div className="mt-2 font-display text-3xl font-semibold text-white">
                          {snapshot.alerts.length}
                        </div>
                      </div>
                    </div>

                    {selectedSummary ? (
                      <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-white">
                              {selectedSummary.display_name || selectedSummary.hostname}
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                              {selectedSummary.device_type || "device"} · {selectedSummary.os_name}
                            </div>
                          </div>
                          <SignalChip level={selectedSummary.latest_alert_level || "info"}>
                            {selectedSummary.latest_alert_level || "healthy"}
                          </SignalChip>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5 text-xs">
                            {selectedSummary.primary_ip || "No IP"}
                          </span>
                          <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5 text-xs">
                            Agent {selectedSummary.agent_version || "pending"}
                          </span>
                          <span className="rounded-full border border-white/8 bg-[#060b12] px-3 py-1.5 text-xs">
                            Risk {selectedSummary.risk_score}/100
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="panel rounded-[2rem] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-white/6 text-[var(--color-signal)]">
                        <ShieldAlert className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-semibold text-white">Alert posture</div>
                        <div className="mt-1 text-sm text-slate-400">
                          Threshold breaches and new-process detection from the latest snapshot.
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {(latestAlerts.length ? latestAlerts : [null]).map((alert, index) =>
                        alert ? (
                          <AlertCard key={alert.id} alert={alert} />
                        ) : (
                          <div
                            key={`alert-${index}`}
                            className="rounded-[1.4rem] border border-emerald-300/18 bg-emerald-300/10 px-4 py-4 text-sm text-emerald-100"
                          >
                            No active alerts on the latest snapshot.
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
                <div className="panel rounded-[2rem] p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                        <TerminalSquare className="h-3.5 w-3.5" />
                        Process explorer
                      </div>
                      <div className="mt-3 font-display text-2xl font-semibold text-white">
                        Live inventory of what the device is running
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        Search by process, PID, or command. Long commands are clamped until you hover.
                      </div>
                    </div>
                    <label className="relative block min-w-[280px]">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by process, PID, or command"
                        className="w-full rounded-full border border-white/10 bg-white/4 py-3 pl-11 pr-4 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                      />
                    </label>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/8">
                    <div className="surface-strip flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-3">
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {filteredProcesses.length} visible processes
                      </div>
                      <div className="text-xs text-slate-500">
                        Click a process row to open a full runtime inspection panel.
                      </div>
                    </div>
                    <div className="process-head process-grid bg-white/4 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      <div>Process</div>
                      <div>PID</div>
                      <div>CPU</div>
                      <div>Memory</div>
                    </div>
                    <div className="max-h-[540px] overflow-auto">
                      {filteredProcesses.slice(0, 18).map((process) => {
                        const ProcessIcon = processIcon(process.name);
                        return (
                          <button
                            key={`${process.pid}-${process.name}`}
                            type="button"
                            onClick={() => openProcessInspector(process)}
                            className="process-grid-row table-row w-full bg-transparent px-5 py-4 text-left transition"
                          >
                            <div className="min-w-0">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
                                  <ProcessIcon className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-white">{process.name}</div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                    <span className="rounded-full border border-white/8 bg-white/4 px-2 py-1">
                                      {process.status || "active"}
                                    </span>
                                    <span className="rounded-full border border-white/8 bg-white/4 px-2 py-1">
                                      {process.username || "system"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="process-command mt-3 rounded-2xl border border-white/6 bg-[#060b12] px-3 py-3 font-mono text-[0.72rem] leading-6 text-slate-400"
                                title={process.cmdline}
                              >
                                {process.cmdline || "No command line reported"}
                              </div>
                            </div>
                            <div className="process-metric">{process.pid}</div>
                            <div className="process-metric">{percent(process.cpu_percent ?? null)}</div>
                            <div className="process-metric">{memory(process.memory_mb ?? null)}</div>
                          </button>
                        );
                      })}
                      {filteredProcesses.length === 0 ? (
                        <div className="px-5 py-8 text-sm text-slate-400">No processes matched that search.</div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="panel rounded-[2rem] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-white/6 text-[var(--color-accent)]">
                        <Cpu className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-semibold text-white">Top CPU consumers</div>
                        <div className="mt-1 text-sm text-slate-400">
                          Processes currently putting the most pressure on the device.
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-4">
                      {topCpu.map((process) => (
                        <button
                          key={`${process.pid}-${process.name}`}
                          type="button"
                          onClick={() => openProcessInspector(process)}
                          className="w-full rounded-[1.3rem] border border-transparent bg-transparent px-3 py-2 text-left transition hover:border-white/8 hover:bg-white/4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="truncate text-sm font-semibold text-white">{process.name}</div>
                            <div className="text-sm text-slate-300">
                              {(process.cpu_percent ?? 0).toFixed(1)}%
                            </div>
                          </div>
                          <div className="mt-2 progress-rail h-2">
                            <span style={{ width: `${Math.min(process.cpu_percent ?? 0, 100)}%` }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="panel rounded-[2rem] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-white/6 text-[var(--color-accent)]">
                        <Clock3 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-semibold text-white">Recent device history</div>
                        <div className="mt-1 text-sm text-slate-400">
                          CPU and memory pressure across the last few snapshots.
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {history.slice(0, 6).map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-white">
                              {new Date(entry.created_at).toLocaleString()}
                            </div>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              {entry.total_processes} processes
                            </div>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                    <Link href="/app/history" className="btn-secondary mt-5">
                      Open full history
                    </Link>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
                <div className="panel rounded-[2rem] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-white/6 text-[var(--color-accent)]">
                      <MonitorCog className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="font-display text-xl font-semibold text-white">Snapshot details</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Device identity, ingestion metadata, and hardware profile.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <DetailCell icon={Package2} label="Agent ID" value={snapshot.agent_id || "pending"} />
                    <DetailCell icon={Radar} label="Hostname" value={snapshot.hostname} />
                    <DetailCell icon={MonitorCog} label="Device type" value={snapshot.device_type || "device"} />
                    <DetailCell icon={Server} label="OS" value={`${snapshot.os_name} ${snapshot.os_version}`} />
                    <DetailCell icon={Gauge} label="Architecture" value={snapshot.architecture} />
                    <DetailCell icon={ShieldAlert} label="Host status" value={snapshot.host_status} />
                    <DetailCell icon={Wifi} label="Primary IP" value={snapshot.primary_ip || "No IP recorded"} />
                    <DetailCell icon={Sparkles} label="Agent version" value={snapshot.agent_version || "pending"} />
                    <DetailCell
                      icon={Cpu}
                      label="Hardware profile"
                      value={`${snapshot.cpu_count ?? "n/a"} cores · ${memory(snapshot.total_memory_mb)} RAM`}
                      detail={`${storage(snapshot.total_disk_gb)} total disk`}
                    />
                    <DetailCell
                      icon={Network}
                      label="Network"
                      value={`${traffic(snapshot.network_sent_mb)} sent · ${traffic(snapshot.network_recv_mb)} recv`}
                      detail={`${listeningConnections.length} listening sockets · ${establishedConnections.length} established flows`}
                    />
                    <DetailCell
                      icon={ShieldCheck}
                      label="Persistence"
                      value={`${startupItems.length} startup items`}
                      detail={startupItems[0]?.name || "No persistence entries observed yet"}
                    />
                    <DetailCell
                      icon={Fingerprint}
                      label="Software trust"
                      value={`${softwareInventory.length} inventoried · ${unsignedSoftware.length} unsigned`}
                      detail={softwareInventory[0]?.name || "No software inventory reported yet"}
                    />
                    <DetailCell
                      icon={UserRound}
                      label="Sessions"
                      value={`${userSessions.length} current · ${remoteSessions.length} remote`}
                      detail={userSessions[0]?.username || "No session detail reported yet"}
                    />
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-white/6 text-[var(--color-accent)]">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="font-display text-xl font-semibold text-white">Platform confidence</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Why this workspace now reads like a product instead of a prototype.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        icon: ShieldCheck,
                        title: "Account-backed onboarding",
                        body: "The setup path now uses account-bound config, secure device claim, and live detection instead of manual operator-only steps.",
                      },
                      {
                        icon: Sparkles,
                        title: "Versioned release channel",
                        body: "Release manifests, signed artifact checks, and stable agent versioning are now part of the install surface.",
                      },
                      {
                        icon: MonitorCog,
                        title: "Focused operating surface",
                        body: "The dashboard emphasizes what an operator needs to decide next: posture, saturation, process risk, and device history.",
                      },
                    ].map((item) => (
                      <div key={item.title} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border border-white/8 bg-[#060b12] text-[var(--color-accent)]">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.title}</div>
                            <div className="mt-2 text-sm leading-7 text-slate-400">{item.body}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`mailto:${salesEmail}?subject=HostLens%20customer%20setup`}
                    className="btn-primary mt-6"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Onboard a customer
                  </a>
                </div>
              </section>
            </>
          ) : null}
        </div>
        {inspector && inspectorMeta ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/62 backdrop-blur-sm"
              onClick={() => setInspector(null)}
              aria-label="Close detail inspector"
            />
            <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] overflow-y-auto border-l border-white/8 bg-[#071018]/96 shadow-[-30px_0_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="sticky top-0 z-10 border-b border-white/8 bg-[#071018]/94 px-5 py-5 backdrop-blur-2xl sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(119,224,195,0.18)] bg-[rgba(119,224,195,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      <inspectorMeta.icon className="h-3.5 w-3.5" />
                      {inspectorMeta.label}
                    </div>
                    <div className="mt-4 font-display text-3xl font-semibold text-white">
                      {inspectorMeta.title}
                    </div>
                    <div className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                      {inspectorMeta.summary}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspector(null)}
                    className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-white/16 hover:bg-white/4 hover:text-white"
                    aria-label="Close detail inspector"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-8 px-5 py-6 sm:px-6">
                {inspectorContent}
              </div>
            </aside>
          </>
        ) : null}
      </LayoutWrapper>
    </AuthGuard>
  );
}
