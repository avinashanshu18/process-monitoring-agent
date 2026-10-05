"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthShell } from "./auth-shell";
import { useAuth } from "./auth-provider";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const { login, isAuthenticated, ready, loading, user } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const next = nextPath || (user?.host_count ? "/app" : "/setup");

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, next, ready, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await login({ identifier, password });
      router.replace(next);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
    }
  }

  return (
    <AuthShell
      title="Sign in and open the workspace."
      description="Use your HostLens account to access the device workspace and manage onboarding."
      footer={
        <p className="text-sm text-slate-400">
          New here?{" "}
          <Link href="/signup" className="text-white underline decoration-white/30 underline-offset-4">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="kicker">Email or username</span>
          <input
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>

        <label className="block">
          <span className="kicker">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
