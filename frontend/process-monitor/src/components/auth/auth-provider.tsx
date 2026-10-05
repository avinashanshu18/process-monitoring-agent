"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearStoredTokens,
  getAccessToken,
  getRefreshToken,
  storeTokens,
} from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  host_count: number;
  team_role: "owner" | "admin" | "responder" | "viewer" | null;
  team_workspace: {
    id: number;
    name: string;
    owner_id: number;
  } | null;
  profile: {
    requested_plan: "free" | "pro" | "team";
    active_plan: "free" | "pro" | "team";
    active_plan_label: string;
    billing_status: string;
    plan_label: string;
    host_limit: number;
    seat_limit: number;
    retention_days: number;
    alert_tier: string;
    priority_support: boolean;
    onboarding_completed: boolean;
    subscription_active: boolean;
    billing_attention_required: boolean;
    billing_ready: boolean;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    stripe_price_id: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    next_payment_attempt: string | null;
    last_invoice_status: string;
    last_payment_error: string;
    billing_issue_url: string;
    created_at: string;
    updated_at: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { identifier: string; password: string }) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    password: string;
    password_confirm: string;
    requested_plan: "free" | "pro" | "team";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchJson<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = payload.detail;
      } else if (payload?.error) {
        message = payload.error;
      } else {
        const firstEntry = Object.entries(payload ?? {})[0];
        if (firstEntry && Array.isArray(firstEntry[1])) {
          message = String(firstEntry[1][0]);
        }
      }
    } catch {
      // Keep generic fallback.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refreshUser() {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setUser(null);
      setReady(true);
      return;
    }

    try {
      const nextUser = await fetchJson<AuthUser>("/auth/profile/", {}, accessToken);
      setUser(nextUser);
    } catch {
      clearStoredTokens();
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    void refreshUser();
  }, []);

  async function login(payload: { identifier: string; password: string }) {
    setLoading(true);
    try {
      const response = await fetchJson<{
        access: string;
        refresh: string;
        user: AuthUser;
      }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          username: payload.identifier,
          password: payload.password,
        }),
      });
      storeTokens(response.access, response.refresh);
      setUser(response.user);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }

  async function register(payload: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    password: string;
    password_confirm: string;
    requested_plan: "free" | "pro" | "team";
  }) {
    setLoading(true);
    try {
      const response = await fetchJson<{
        user: AuthUser;
        tokens: { access: string; refresh: string };
      }>("/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      storeTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();
    if (refreshToken && accessToken) {
      try {
        await fetchJson("/auth/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        }, accessToken);
      } catch {
        // Token might already be invalid. Local cleanup still happens.
      }
    }
    clearStoredTokens();
    setUser(null);
    setReady(true);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, ready, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
