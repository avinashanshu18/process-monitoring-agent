"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

export function AuthGuard({
  children,
  requireClaimedDevice = false,
}: {
  children: React.ReactNode;
  requireClaimedDevice?: boolean;
}) {
  const { ready, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/app");
      router.replace(`/login?next=${next}`);
      return;
    }

    if (requireClaimedDevice && user && user.host_count === 0) {
      router.replace("/setup");
    }
  }, [isAuthenticated, pathname, ready, requireClaimedDevice, router, user]);

  if (!ready || !isAuthenticated || (requireClaimedDevice && user?.host_count === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-ink)]">
        <div className="panel rounded-[1.8rem] px-6 py-5 text-sm text-slate-300">
          Loading account workspace...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
