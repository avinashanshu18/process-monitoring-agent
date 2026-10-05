"use client";

import { FormEvent, useEffect, useState } from "react";
import { MailPlus, ShieldCheck, UserMinus, Users2 } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/auth/auth-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useTeamWorkspace } from "@/hooks/use-team-workspace";

export default function TeamPage() {
  const { user } = useAuth();
  const {
    workspace,
    data,
    loading,
    saving,
    error,
    renameWorkspace,
    createInvite,
    updateMemberRole,
    removeMember,
  } = useTeamWorkspace();
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "responder" | "viewer">("responder");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (workspace?.name) {
      setWorkspaceName(workspace.name);
    }
  }, [workspace?.name]);

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    await renameWorkspace(workspaceName);
    setMessage("Workspace name updated.");
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    await createInvite({ email: inviteEmail, role: inviteRole });
    setInviteEmail("");
    setInviteRole("responder");
    setMessage("Invite created.");
  }

  const seatLimit = workspace?.seat_limit ?? data?.seat_limit ?? user?.profile.seat_limit ?? 1;
  const seatUsage = workspace?.members.length ?? 1;
  const canManage = Boolean(data?.can_manage);
  const canChangeRoles = Boolean(data?.can_change_roles);
  const isTeamPlan = user?.profile.active_plan === "team";

  return (
    <AuthGuard>
      <LayoutWrapper
        title="Team workspace"
        description="Shared access for alert review, device visibility, and role-based responders."
      >
        <div className="grid gap-6">
          <section className="hero-stage rounded-[2.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
              <div>
                <div className="eyebrow">Team operations</div>
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Shared device visibility for your responders, not just one operator.
                </div>
                <div className="section-copy mt-4 text-base">
                  Team now means something real: invite members, assign roles, and keep the same
                  HostLens workspace in front of the people who need to review alerts.
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Seats used</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {seatUsage}/{seatLimit}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">
                    Team seats currently occupied by live members.
                  </div>
                </div>
                <div className="panel rounded-[1.7rem] p-5">
                  <div className="kicker">Devices in workspace</div>
                  <div className="mt-4 font-display text-4xl font-semibold text-white">
                    {workspace?.devices_used ?? user?.host_count ?? 0}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">
                    Devices shared into the current team workspace.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.6rem] border border-red-400/18 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-[1.6rem] border border-emerald-300/18 bg-emerald-300/10 px-5 py-4 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}

          {!loading && !workspace && !isTeamPlan ? (
            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Users2 className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold text-white">Upgrade to Team to unlock shared access.</div>
                  <div className="mt-3 text-sm leading-7 text-slate-400">
                    The current plan supports a single operator. The Team plan adds shared alert review,
                    invite links, and a 5-seat workspace around the same device fleet.
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {workspace ? (
            <>
              <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Workspace identity</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Name the team workspace your responders will operate inside.
                  </div>
                  <form className="mt-5 grid gap-4" onSubmit={(event) => void handleRename(event)}>
                    <label className="block">
                      <div className="kicker">Workspace name</div>
                      <input
                        value={workspaceName}
                        onChange={(event) => setWorkspaceName(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                        placeholder="Founder ops workspace"
                      />
                    </label>
                    <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Owner</div>
                        <div className="mt-2 text-sm font-semibold text-white">{workspace.owner.full_name}</div>
                        <div className="mt-2 text-xs text-slate-500">{workspace.owner.email}</div>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                        <div className="kicker">Current role</div>
                        <div className="mt-2 text-sm font-semibold text-white">{data?.role || "member"}</div>
                        <div className="mt-2 text-xs text-slate-500">
                          {canManage ? "Can invite and remove members" : "Can review shared alerts and devices"}
                        </div>
                      </div>
                    </div>
                    {canManage ? (
                      <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save workspace"}
                      </button>
                    ) : null}
                  </form>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="flex items-center gap-3">
                    <MailPlus className="h-5 w-5 text-[var(--color-accent)]" />
                    <div>
                      <div className="font-display text-2xl font-semibold text-white">Invite teammates</div>
                      <div className="mt-1 text-sm text-slate-400">
                        Add responders, admins, and viewers without giving them billing access.
                      </div>
                    </div>
                  </div>

                  {canManage ? (
                    <form className="mt-5 grid gap-4" onSubmit={(event) => void handleInvite(event)}>
                      <label className="block">
                        <div className="kicker">Email address</div>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(event) => setInviteEmail(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                          placeholder="responder@company.com"
                        />
                      </label>
                      <label className="block">
                        <div className="kicker">Role</div>
                        <select
                          value={inviteRole}
                          onChange={(event) =>
                            setInviteRole(event.target.value as "admin" | "responder" | "viewer")
                          }
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
                        >
                          <option value="admin">Admin</option>
                          <option value="responder">Responder</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </label>
                      <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? "Sending..." : "Create invite"}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-400">
                      Only workspace admins and owners can send invites.
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="panel rounded-[2rem] p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
                    <div>
                      <div className="font-display text-2xl font-semibold text-white">Members</div>
                      <div className="mt-1 text-sm text-slate-400">
                        People currently sharing this device and alert workspace.
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {workspace.members.map((member) => (
                      <div key={member.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-white">{member.user.full_name}</div>
                            <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                              {member.user.email}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {canChangeRoles && member.role !== "owner" ? (
                              <select
                                value={member.role}
                                onChange={(event) =>
                                  void updateMemberRole(
                                    member.id,
                                    event.target.value as "admin" | "responder" | "viewer",
                                  )
                                }
                                className="rounded-full border border-white/10 bg-[#060b12] px-3 py-2 text-xs uppercase tracking-[0.16em] text-white outline-none"
                              >
                                <option value="admin">Admin</option>
                                <option value="responder">Responder</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            ) : (
                              <div className="rounded-full border border-white/10 bg-[#060b12] px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-300">
                                {member.role}
                              </div>
                            )}
                            {canManage && member.role !== "owner" ? (
                              <button
                                type="button"
                                onClick={() => void removeMember(member.id)}
                                className="btn-secondary"
                              >
                                <UserMinus className="h-4 w-4" />
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-5">
                  <div className="font-display text-2xl font-semibold text-white">Pending invites</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">
                    Share the invite link directly or wait for the recipient to accept with the matching email.
                  </div>
                  <div className="mt-5 space-y-3">
                    {workspace.invites.length === 0 ? (
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                        No pending invites yet.
                      </div>
                    ) : null}
                    {workspace.invites.map((invite) => (
                      <div key={invite.id} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-white">{invite.email}</div>
                            <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                              {invite.role} · {invite.status}
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <div>Expires</div>
                            <div className="mt-1 text-slate-300">{new Date(invite.expires_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="mt-3 break-all rounded-[1rem] border border-white/8 bg-[#060b12] px-3 py-3 text-xs text-slate-300">
                          {invite.invite_url}
                        </div>
                      </div>
                    ))}
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
