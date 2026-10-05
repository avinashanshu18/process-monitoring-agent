"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";
import type { AlertRuleSettings } from "@/hooks/use-alert-workflow";

const API_BASE_URL = getApiBaseUrl();

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
      // Keep generic fallback.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function useAlertRuleSettings() {
  const [settings, setSettings] = useState<AlertRuleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        if (active) {
          setLoading(false);
        }
        return;
      }
      try {
        setError(null);
        const payload = await requestJson<AlertRuleSettings>("/alerts/rules/");
        if (!active) {
          return;
        }
        setSettings(payload);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load alert settings");
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
  }, []);

  async function save(nextSettings: AlertRuleSettings) {
    setSaving(true);
    try {
      const payload = await requestJson<AlertRuleSettings>("/alerts/rules/", {
        method: "PUT",
        body: JSON.stringify(nextSettings),
      });
      setSettings(payload);
      return payload;
    } finally {
      setSaving(false);
    }
  }

  return { settings, setSettings, save, loading, saving, error };
}
