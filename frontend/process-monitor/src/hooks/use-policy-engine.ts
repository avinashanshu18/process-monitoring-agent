"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = getApiBaseUrl();

export interface SavedCheck {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: "policy" | "mobile" | "vulnerability" | "custom";
  severity: "info" | "warning" | "critical";
  enabled: boolean;
  builtin: boolean;
  evaluator: string;
  config: Record<string, unknown>;
  latest_result: SavedCheckResult | null;
  created_at: string;
  updated_at: string;
}

export interface SavedCheckResult {
  id: number;
  check: number;
  check_name: string;
  check_slug: string;
  category: string;
  severity: string;
  host: number;
  hostname: string;
  display_name: string;
  agent_id: string | null;
  snapshot: number | null;
  status: "pass" | "warn" | "fail" | "unknown";
  summary: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AgentAction {
  id: string;
  hostname: string;
  display_name: string;
  agent_id: string | null;
  kind: "refresh_snapshot" | "terminate_process" | "collect_diagnostics" | "live_query";
  status: "queued" | "in_progress" | "succeeded" | "failed" | "cancelled";
  note: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  requested_by_name: string | null;
  created_at: string;
  updated_at: string;
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
      // keep generic fallback
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export function usePolicyEngine(agentId: string | null) {
  const [checks, setChecks] = useState<SavedCheck[]>([]);
  const [results, setResults] = useState<SavedCheckResult[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (agentId) {
      params.set("agent_id", agentId);
    }
    return params.toString() ? `?${params.toString()}` : "";
  }, [agentId]);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        if (active) {
          setChecks([]);
          setResults([]);
          setActions([]);
          setLoading(false);
        }
        return;
      }

      try {
        setError(null);
        const [checksPayload, resultsPayload, actionsPayload] = await Promise.all([
          requestJson<{ checks: SavedCheck[] }>(`/checks/${query}`),
          requestJson<{ results: SavedCheckResult[] }>(`/checks/results/${query}`),
          requestJson<{ actions: AgentAction[] }>(`/actions/${query}`),
        ]);
        if (!active) {
          return;
        }
        setChecks(checksPayload.checks);
        setResults(resultsPayload.results);
        setActions(actionsPayload.actions);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load policies");
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
  }, [query, refreshToken]);

  async function createCustomCheck(payload: {
    name: string;
    description?: string;
    severity: "info" | "warning" | "critical";
    config: Record<string, unknown>;
  }) {
    setBusy(true);
    try {
      await requestJson<SavedCheck>("/checks/", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          category: "custom",
        }),
      });
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateCheck(check: SavedCheck, patch: Partial<SavedCheck>) {
    setBusy(true);
    try {
      await requestJson<SavedCheck>(`/checks/${check.id}/`, {
        method: "PUT",
        body: JSON.stringify({
          name: patch.name ?? check.name,
          description: patch.description ?? check.description,
          category: patch.category ?? check.category,
          severity: patch.severity ?? check.severity,
          enabled: patch.enabled ?? check.enabled,
          config: patch.config ?? check.config,
        }),
      });
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function runCheck(checkId: number) {
    if (!agentId) {
      throw new Error("Select a device before running a check.");
    }
    setBusy(true);
    try {
      const result = await requestJson<SavedCheckResult>(`/checks/${checkId}/run/`, {
        method: "POST",
        body: JSON.stringify({ agent_id: agentId }),
      });
      refresh();
      return result;
    } finally {
      setBusy(false);
    }
  }

  async function queueAction(payload: {
    kind: AgentAction["kind"];
    note?: string;
    parameters?: Record<string, unknown>;
  }) {
    if (!agentId) {
      throw new Error("Select a device before queueing an action.");
    }
    setBusy(true);
    try {
      const action = await requestJson<AgentAction>("/actions/", {
        method: "POST",
        body: JSON.stringify({
          agent_id: agentId,
          kind: payload.kind,
          note: payload.note ?? "",
          parameters: payload.parameters ?? {},
        }),
      });
      refresh();
      return action;
    } finally {
      setBusy(false);
    }
  }

  return {
    checks,
    results,
    actions,
    loading,
    busy,
    error,
    refresh,
    createCustomCheck,
    updateCheck,
    runCheck,
    queueAction,
  };
}
