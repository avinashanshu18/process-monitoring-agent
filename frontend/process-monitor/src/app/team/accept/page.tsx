"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useTeamWorkspace } from "@/hooks/use-team-workspace";

function TeamInviteAcceptContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { acceptInvite, saving, error } = useTeamWorkspace();
  const [message, setMessage] = useState("Checking invite...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMessage("Invite token missing.");
      return;
    }

    let active = true;
    void acceptInvite(token)
      .then(() => {
        if (!active) {
          return;
        }
        setMessage("Invite accepted. Opening team workspace...");
        window.setTimeout(() => {
          router.replace("/app/team");
        }, 900);
      })
      .catch((inviteError) => {
        if (!active) {
          return;
        }
        setMessage(
          inviteError instanceof Error ? inviteError.message : "Unable to accept invite.",
        );
      });

    return () => {
      active = false;
    };
  }, [acceptInvite, params, router]);

  return (
    <LayoutWrapper
      title="Accept team invite"
      description="Join the shared HostLens workspace for device review and alert response."
    >
      <div className="grid gap-6">
        <section className="hero-stage rounded-[2rem] px-6 py-8">
          <div className="font-display text-4xl font-semibold text-white">Joining workspace…</div>
          <div className="section-copy mt-4 text-base">{message}</div>
          {saving ? (
            <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-4 text-sm text-slate-300">
              Applying invite and syncing workspace access.
            </div>
          ) : null}
          {error ? (
            <div className="mt-6 rounded-[1.4rem] border border-red-400/18 bg-red-400/10 px-4 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </LayoutWrapper>
  );
}

export default function TeamInviteAcceptPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <LayoutWrapper
            title="Accept team invite"
            description="Join the shared HostLens workspace for device review and alert response."
          >
            <div className="panel rounded-[1.8rem] px-6 py-5 text-sm text-slate-300">
              Loading invite…
            </div>
          </LayoutWrapper>
        }
      >
        <TeamInviteAcceptContent />
      </Suspense>
    </AuthGuard>
  );
}
