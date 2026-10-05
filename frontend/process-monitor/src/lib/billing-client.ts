import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = getApiBaseUrl();

export type PlanKey = "free" | "pro" | "team";

export interface OnboardingKit {
  plan_key: PlanKey;
  plan_label: string;
  billing_status: string;
  billing_attention_required: boolean;
  billing_ready: boolean;
  onboarding_api_key: string;
  config: {
    endpoint: string;
    api_key: string;
    agent_id: string;
    device_type: string;
    hostname_override: string;
    interval_seconds: number;
    release_manifest_url: string;
    release_channel: string;
    auto_update: boolean;
  };
  downloads: Record<
    string,
    {
      label: string;
      url: string;
      filename: string;
    }
  >;
  installers: Record<
    string,
    {
      label: string;
      url: string;
      filename: string;
    }
  >;
  checksums_url: string;
  release_manifest_url: string;
}

async function authedJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("You need to sign in first.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = payload.detail;
      }
    } catch {
      // Keep the generic fallback.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function createCheckoutSession(plan: Extract<PlanKey, "pro" | "team">) {
  return authedJson<{ url: string; session_id: string }>("/auth/billing/checkout/", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

export async function createBillingPortalSession() {
  return authedJson<{ url: string }>("/auth/billing/portal/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchOnboardingKit() {
  return authedJson<OnboardingKit>("/auth/onboarding-kit/");
}

export async function rotateOnboardingKey() {
  return authedJson<OnboardingKit>("/auth/onboarding-kit/rotate/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function downloadJsonFile(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
