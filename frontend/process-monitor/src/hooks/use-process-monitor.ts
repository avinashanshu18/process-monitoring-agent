"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = getApiBaseUrl();
const POLL_INTERVAL_MS = 10000;

export interface ProcessItem {
  pid: number;
  ppid: number | null;
  name: string;
  cpu_percent: number | null;
  memory_mb: number | null;
  status: string;
  username: string;
  cmdline: string;
  exe_path: string;
  started_at: string | null;
}

export interface NetworkConnectionItem {
  pid: number | null;
  process_name: string;
  protocol: string;
  status: string;
  local_address: string;
  local_port: number | null;
  remote_address: string;
  remote_port: number | null;
  family: string;
  direction: string;
  remote_domain: string;
  remote_scope: string;
  service_label: string;
  tls_suspected: boolean;
  security_hint: string;
}

export interface NetworkEventItem {
  pid: number | null;
  process_name: string;
  protocol: string;
  status: string;
  local_address: string;
  local_port: number | null;
  remote_address: string;
  remote_port: number | null;
  remote_domain: string;
  remote_scope: string;
  service_label: string;
  tls_suspected: boolean;
  security_hint: string;
  direction: string;
  family: string;
  event_type: string;
  occurred_at: string;
}

export interface DNSEventItem {
  query: string;
  record_type: string;
  process: string;
  pid: number | null;
  answers: string[];
  status: string;
  source: string;
  occurred_at: string;
}

export interface StartupItem {
  name: string;
  type: string;
  scope: string;
  location: string;
  command: string;
  publisher: string;
}

export interface ServiceItem {
  name: string;
  display_name: string;
  manager: string;
  scope: string;
  state: string;
  sub_state: string;
  startup_type: string;
  status: string;
  executable: string;
  username: string;
  pid: number | null;
  exit_code: string;
  unit_file_state: string;
}

export interface SoftwareItem {
  name: string;
  identifier: string;
  version: string;
  publisher: string;
  install_path: string;
  install_scope: string;
  install_source: string;
  executable_path: string;
  signature_state: string;
  signer: string;
  team_identifier: string;
  sha256: string;
}

export interface UserSessionItem {
  username: string;
  terminal: string;
  host: string;
  started_at: string;
  remote: boolean;
  type: string;
}

export interface FileIntegrityItem {
  path: string;
  category: string;
  modified_at: string;
  size_bytes: number | null;
  sha256: string;
  mode: string;
}

export interface FileEventItem {
  path: string;
  category: string;
  action: string;
  occurred_at: string;
  sha256: string;
  mode: string;
}

export interface AuthEventItem {
  username: string;
  terminal: string;
  source: string;
  occurred_at: string;
  event_type: string;
  status: string;
  summary: string;
  source_ip: string;
  method: string;
  event_id: string;
  session: string;
}

export interface ProcessEventItem {
  pid: number | null;
  ppid: number | null;
  name: string;
  parent_name: string;
  username: string;
  cmdline: string;
  exe_path: string;
  event_type: string;
  occurred_at: string;
  started_at: string;
  session_type: string;
}

export interface ExtensionItem {
  name: string;
  identifier: string;
  version: string;
  source: string;
  state: string;
}

export interface CollectorCapability {
  name: string;
  layer: string;
  state: string;
  detail: string;
}

export interface USBDeviceItem {
  name: string;
  vendor: string;
  product_id: string;
  serial: string;
}

export interface SecurityPosture {
  mode: string;
  firewall_state: string;
  firewall_details: string;
  disk_encryption_state: string;
  disk_encryption_detail: string;
  antivirus_state: string;
  antivirus_products: string[];
  mdm_state: string;
  gatekeeper_state: string;
  sip_state: string;
  scheduled_tasks_count: number;
  system_extensions: ExtensionItem[];
  browser_extensions: ExtensionItem[];
  usb_devices: USBDeviceItem[];
  collector_capabilities: CollectorCapability[];
  collector_mode: string;
  patch_posture?: {
    state: string;
    findings_count: number;
    findings: Array<{
      name: string;
      identifier: string;
      version: string;
      minimum_version: string;
      severity: string;
      title: string;
      reason: string;
    }>;
  };
}

export interface InventoryTimelineItem {
  id: number;
  hostname: string;
  display_name: string;
  agent_id: string | null;
  category: string;
  kind: string;
  severity: "info" | "warning" | "critical";
  title: string;
  subtitle: string;
  source: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

export interface AlertItem {
  id: string;
  level: "info" | "warning" | "critical";
  type: string;
  message: string;
  status: "open" | "acknowledged" | "muted" | "resolved";
  hostname: string;
  display_name: string;
  agent_id: string | null;
  device_type: string;
  primary_ip: string;
  latest_snapshot_id: number | null;
  fingerprint: string;
  note: string;
  metadata: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  occurrence_count: number;
  acknowledged_at: string | null;
  acknowledged_by_name: string | null;
  muted_at: string | null;
  muted_by_name: string | null;
  muted_until: string | null;
  resolved_at: string | null;
  resolved_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SnapshotDetail {
  id: number;
  agent_id: string | null;
  hostname: string;
  display_name: string;
  device_type: string;
  host_status: string;
  last_seen: string | null;
  primary_ip: string;
  agent_version: string;
  cpu_count: number | null;
  total_memory_mb: number | null;
  total_disk_gb: number | null;
  os_name: string;
  os_version: string;
  architecture: string;
  created_at: string;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  network_sent_mb: number | null;
  network_recv_mb: number | null;
  load_one: number | null;
  load_five: number | null;
  load_fifteen: number | null;
  uptime_seconds: number | null;
  active_user_count: number;
  listening_ports: number[];
  network_connections: NetworkConnectionItem[];
  network_events: NetworkEventItem[];
  dns_events: DNSEventItem[];
  startup_items: StartupItem[];
  service_inventory: ServiceItem[];
  software_inventory: SoftwareItem[];
  user_sessions: UserSessionItem[];
  file_integrity_items: FileIntegrityItem[];
  file_events: FileEventItem[];
  auth_events: AuthEventItem[];
  process_events: ProcessEventItem[];
  security_posture: SecurityPosture;
  collector_sources: string[];
  total_processes: number;
  alerts: AlertItem[];
  risk_score: number;
  risk_level: string;
  processes: ProcessItem[];
}

export interface SnapshotHistoryItem {
  id: number;
  hostname: string;
  created_at: string;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  uptime_seconds: number | null;
  total_processes: number;
}

export interface HostSummary {
  agent_id: string | null;
  hostname: string;
  display_name: string;
  device_type: string;
  os_name: string;
  os_version: string;
  architecture: string;
  primary_ip: string;
  agent_version: string;
  cpu_count: number | null;
  total_memory_mb: number | null;
  total_disk_gb: number | null;
  status: string;
  last_seen: string | null;
  monitoring_enabled: boolean;
  is_online: boolean;
  risk_score: number;
  latest_alert_level: string;
  latest_total_processes: number;
  latest_cpu_percent: number | null;
  latest_memory_percent: number | null;
  latest_disk_percent: number | null;
}

export interface FleetSummary {
  devices_used: number;
  device_limit: number;
  devices_remaining: number;
  retention_days: number;
  online_devices: number;
  attention_devices: number;
  critical_devices: number;
  tracked_processes: number;
}

async function getJson<T>(path: string, allowNotFound = false): Promise<T | null> {
  const accessToken = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (allowNotFound && response.status === 404) {
    return null;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = payload.detail;
      }
    } catch {
      // Keep the generic message if the body is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function useProcessMonitor() {
  const [hosts, setHosts] = useState<HostSummary[]>([]);
  const [selectedHost, setSelectedHost] = useState("");
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotDetail | null>(null);
  const [history, setHistory] = useState<SnapshotHistoryItem[]>([]);
  const [inventoryTimeline, setInventoryTimeline] = useState<InventoryTimelineItem[]>([]);
  const [status, setStatus] = useState("Connecting");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRefreshToken((value) => value + 1);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    async function syncMonitor() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setHosts([]);
        setSnapshot(null);
        setHistory([]);
        setInventoryTimeline([]);
        setStatus("Sign in required");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const hostResponse = await getJson<{ hosts: HostSummary[] }>("/hosts/");
        const nextFleetSummary = await getJson<FleetSummary>("/fleet/summary/");
        if (!active) {
          return;
        }

        const nextHosts = hostResponse?.hosts ?? [];
        setHosts(nextHosts);
        setFleetSummary(nextFleetSummary);

        const nextHost =
          nextHosts.find((host) => (host.agent_id || host.hostname) === selectedHost)?.agent_id ??
          nextHosts.find((host) => (host.agent_id || host.hostname) === selectedHost)?.hostname ??
          nextHosts[0]?.agent_id ??
          nextHosts[0]?.hostname ??
          "";

        if (nextHost !== selectedHost) {
          setSelectedHost(nextHost);
        }

        if (!nextHost) {
          setSnapshot(null);
          setHistory([]);
          setInventoryTimeline([]);
          setStatus("No claimed devices");
          setLoading(false);
          return;
        }

        const [latest, historyResponse, timelineResponse] = await Promise.all([
          getJson<SnapshotDetail>(
            `/process-snapshots/latest/?agent_id=${encodeURIComponent(nextHost)}`,
            true,
          ),
          getJson<{ history: SnapshotHistoryItem[] }>(
            `/process-snapshots/history/?agent_id=${encodeURIComponent(nextHost)}&limit=12`,
          ),
          getJson<{ events: InventoryTimelineItem[] }>(
            `/process-snapshots/inventory-timeline/?agent_id=${encodeURIComponent(nextHost)}&limit=24`,
            true,
          ),
        ]);

        if (!active) {
          return;
        }

        setSnapshot(latest);
        setHistory(historyResponse?.history ?? []);
        setInventoryTimeline(timelineResponse?.events ?? []);
        setStatus(latest ? "Live" : "Waiting for first snapshot");
      } catch (syncError) {
        if (!active) {
          return;
        }

        const message =
          syncError instanceof Error ? syncError.message : "Unable to load monitor data";
        setError(message);
        setStatus("Disconnected");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    syncMonitor();

    return () => {
      active = false;
    };
  }, [refreshToken, selectedHost]);

  return {
    hosts,
    fleetSummary,
    selectedHost,
    setSelectedHost,
    snapshot,
    history,
    inventoryTimeline,
    status,
    error,
    loading,
    mode: "Polling (10s)",
    refresh: () => setRefreshToken((value) => value + 1),
  };
}
