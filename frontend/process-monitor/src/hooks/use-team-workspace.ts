"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface TeamMember {
  id: number;
  role: "owner" | "admin" | "responder" | "viewer";
  joined_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
}

export interface TeamInvite {
  id: number;
  email: string;
  role: "owner" | "admin" | "responder" | "viewer";
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  invite_url: string;
  invited_by_name: string;
}

export interface TeamWorkspace {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  members: TeamMember[];
  invites: TeamInvite[];
  seat_limit: number;
  devices_used: number;
}

interface TeamWorkspaceResponse {
  workspace: TeamWorkspace | null;
  role: TeamMember["role"] | null;
  can_manage: boolean;
  can_change_roles: boolean;
  seat_limit?: number;
}

async function fetchJson<T>(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.detail || payload?.error || message;
    } catch {
      // Keep fallback.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export function useTeamWorkspace() {
  const [data, setData] = useState<TeamWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const next = await fetchJson<TeamWorkspaceResponse>("/auth/team-workspace/");
      setData(next);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Unable to load team workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function renameWorkspace(name: string) {
    setSaving(true);
    setError("");
    try {
      const next = await fetchJson<TeamWorkspaceResponse>("/auth/team-workspace/", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      setData(next);
      return next;
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to rename workspace.";
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function createInvite(payload: { email: string; role: "admin" | "responder" | "viewer" }) {
    setSaving(true);
    setError("");
    try {
      await fetchJson<TeamInvite>("/auth/team-invites/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to create invite.";
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function updateMemberRole(membershipId: number, role: "admin" | "responder" | "viewer") {
    setSaving(true);
    setError("");
    try {
      await fetchJson(`/auth/team-members/${membershipId}/`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to update teammate role.";
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(membershipId: number) {
    setSaving(true);
    setError("");
    try {
      await fetchJson(`/auth/team-members/${membershipId}/`, {
        method: "DELETE",
      });
      await refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to remove teammate.";
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function acceptInvite(token: string) {
    setSaving(true);
    setError("");
    try {
      const next = await fetchJson<TeamWorkspaceResponse>("/auth/team-invites/accept/", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setData(next);
      return next;
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to accept invite.";
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  return {
    data,
    workspace: data?.workspace ?? null,
    loading,
    saving,
    error,
    refresh,
    renameWorkspace,
    createInvite,
    updateMemberRole,
    removeMember,
    acceptInvite,
  };
}
