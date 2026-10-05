"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";
import type { NotificationDeliveryItem } from "@/hooks/use-alert-workflow";

const API_BASE_URL = getApiBaseUrl();

export interface NotificationPreference {
  email_enabled: boolean;
  email_address: string;
  slack_enabled: boolean;
  slack_webhook_url: string;
  webhook_enabled: boolean;
  webhook_url: string;
  notify_info: boolean;
  notify_warning: boolean;
  notify_critical: boolean;
  notify_offline: boolean;
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
      // Keep generic fallback.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function useNotificationSettings() {
  const [preference, setPreference] = useState<NotificationPreference | null>(null);
  const [deliveries, setDeliveries] = useState<NotificationDeliveryItem[]>([]);
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
        const [preferencePayload, deliveriesPayload] = await Promise.all([
          requestJson<NotificationPreference>("/alerts/notifications/preferences/"),
          requestJson<{ deliveries: NotificationDeliveryItem[] }>(
            "/alerts/notifications/deliveries/?limit=20",
          ),
        ]);
        if (!active) {
          return;
        }
        setPreference(preferencePayload);
        setDeliveries(deliveriesPayload.deliveries);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load notification settings",
        );
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

  async function save(nextPreference: NotificationPreference) {
    setSaving(true);
    try {
      const payload = await requestJson<NotificationPreference>(
        "/alerts/notifications/preferences/",
        {
          method: "PUT",
          body: JSON.stringify(nextPreference),
        },
      );
      setPreference(payload);
      return payload;
    } finally {
      setSaving(false);
    }
  }

  return {
    preference,
    setPreference,
    deliveries,
    loading,
    saving,
    error,
    save,
  };
}
