"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";
import type { AlertItem } from "@/hooks/use-process-monitor";

const API_BASE_URL = getApiBaseUrl();

export interface AlertAuditLogItem {
  id: number;
  action: string;
  actor_name: string;
  previous_status: string;
  next_status: string;
  note: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationDeliveryItem {
  id: number;
  hostname: string;
  display_name: string;
  alert_id: string | null;
  channel: "email" | "slack" | "webhook";
  event_type: string;
  destination: string;
  status: "success" | "failed" | "skipped";
  response_code: number | null;
  response_excerpt: string;
  error_message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AlertDetail extends AlertItem {
  audit_logs: AlertAuditLogItem[];
  notification_deliveries: NotificationDeliveryItem[];
}

export interface AlertCounts {
  open: number;
  acknowledged: number;
  muted: number;
  resolved: number;
  critical: number;
  warning: number;
  info: number;
}

export interface AlertRuleSettings {
  cpu_warning_threshold: number;
  cpu_critical_threshold: number;
  memory_warning_threshold: number;
  memory_critical_threshold: number;
  disk_warning_threshold: number;
  disk_critical_threshold: number;
  process_cpu_warning_threshold: number;
  process_memory_warning_mb: number;
  listening_ports_info_threshold: number;
  multiple_users_threshold: number;
  process_spike_min_delta: number;
  process_spike_percent_threshold: number;
  watchlist_enabled: boolean;
  new_process_tracking_enabled: boolean;
  new_software_tracking_enabled: boolean;
  unsigned_software_alert_enabled: boolean;
  startup_drift_tracking_enabled: boolean;
  remote_session_tracking_enabled: boolean;
  file_integrity_tracking_enabled: boolean;
  auth_event_tracking_enabled: boolean;
  policy_engine_enabled: boolean;
  mobile_compliance_tracking_enabled: boolean;
  vulnerability_tracking_enabled: boolean;
  minimum_mobile_battery_percent: number;
  minimum_mobile_os_version: string;
  muted_alert_auto_resolve: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertFilters {
  status: string;
  level: string;
  device: string;
  query: string;
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = payload.detail;
      }
    } catch {
      // Keep generic fallback if response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export function useAlertWorkflow(initialFilters?: Partial<AlertFilters>) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [counts, setCounts] = useState<AlertCounts | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);
  const [settings, setSettings] = useState<AlertRuleSettings | null>(null);
  const [filters, setFilters] = useState<AlertFilters>({
    status: initialFilters?.status ?? "open,acknowledged,muted",
    level: initialFilters?.level ?? "all",
    device: initialFilters?.device ?? "all",
    query: initialFilters?.query ?? "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") {
      params.set("status", filters.status);
    } else {
      params.set("status", "all");
    }
    if (filters.level && filters.level !== "all") {
      params.set("level", filters.level);
    }
    if (filters.device && filters.device !== "all") {
      params.set("agent_id", filters.device);
    }
    if (filters.query.trim()) {
      params.set("q", filters.query.trim());
    }
    params.set("limit", "150");
    return params.toString();
  }, [filters]);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const loadAlertDetail = useCallback(async (alertId: string) => {
    const detail = await requestJson<AlertDetail>(`/alerts/${alertId}/`);
    setSelectedAlert(detail);
    return detail;
  }, []);

  useEffect(() => {
    let active = true;

    async function syncAlerts() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        if (active) {
          setAlerts([]);
          setCounts(null);
          setSelectedAlert(null);
          setSettings(null);
          setLoading(false);
        }
        return;
      }

      try {
        setError(null);
        const [alertsResponse, settingsResponse] = await Promise.all([
          requestJson<{ alerts: AlertItem[]; counts: AlertCounts }>(`/alerts/?${queryString}`),
          requestJson<AlertRuleSettings>("/alerts/rules/"),
        ]);
        if (!active) {
          return;
        }
        setAlerts(alertsResponse.alerts);
        setCounts(alertsResponse.counts);
        setSettings(settingsResponse);

        const nextSelectedId =
          alertsResponse.alerts.find((alert) => alert.id === selectedAlert?.id)?.id ??
          alertsResponse.alerts[0]?.id ??
          null;
        if (nextSelectedId) {
          const detail = await requestJson<AlertDetail>(`/alerts/${nextSelectedId}/`);
          if (!active) {
            return;
          }
          setSelectedAlert(detail);
        } else {
          setSelectedAlert(null);
        }
      } catch (syncError) {
        if (!active) {
          return;
        }
        setError(syncError instanceof Error ? syncError.message : "Unable to load alerts");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void syncAlerts();

    return () => {
      active = false;
    };
  }, [queryString, refreshToken, selectedAlert?.id]);

  const performAction = useCallback(
    async (alertId: string, payload: { action: string; note?: string; mute_hours?: number }) => {
      setBusy(true);
      try {
        const detail = await requestJson<AlertDetail>(`/alerts/${alertId}/actions/`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSelectedAlert(detail);
        refresh();
        return detail;
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const saveSettings = useCallback(async (payload: Partial<AlertRuleSettings>) => {
    setBusy(true);
    try {
      const updated = await requestJson<AlertRuleSettings>("/alerts/rules/", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSettings(updated);
      return updated;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    alerts,
    counts,
    selectedAlert,
    settings,
    filters,
    setFilters,
    setSelectedAlert,
    loadAlertDetail,
    performAction,
    saveSettings,
    refresh,
    loading,
    busy,
    error,
  };
}
