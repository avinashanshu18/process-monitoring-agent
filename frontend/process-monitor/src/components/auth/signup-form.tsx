"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createCheckoutSession } from "@/lib/billing-client";

import { AuthShell } from "./auth-shell";
import { useAuth } from "./auth-provider";

export function SignupForm({
  requestedPlan,
}: {
  requestedPlan: "free" | "pro" | "team";
}) {
  const { register, isAuthenticated, ready, loading, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
    requested_plan: requestedPlan,
  });

  useEffect(() => {
    setForm((current) => ({ ...current, requested_plan: requestedPlan }));
  }, [requestedPlan]);

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace(user?.host_count ? "/app" : "/setup");
    }
  }, [isAuthenticated, ready, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      if (form.requested_plan === "free") {
        router.replace("/install");
        return;
      }

      try {
        const checkout = await createCheckoutSession(form.requested_plan);
        window.location.href = checkout.url;
      } catch (billingError) {
        setError(billingError instanceof Error ? billingError.message : "Billing is not available yet.");
        router.replace("/install?checkout=manual");
        return;
      }
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Unable to create account.");
    }
  }

  return (
    <AuthShell
      title="Create the account and start the rollout."
      description="The onboarding path is compressed: account first, billing second, install third, first device visible right after."
      footer={
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-white underline decoration-white/30 underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="kicker">Username</span>
          <input
            required
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>
        <label className="block">
          <span className="kicker">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>
        <label className="block">
          <span className="kicker">First name</span>
          <input
            value={form.first_name}
            onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>
        <label className="block">
          <span className="kicker">Last name</span>
          <input
            value={form.last_name}
            onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>
        <label className="block">
          <span className="kicker">Password</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>
        <label className="block">
          <span className="kicker">Confirm password</span>
          <input
            required
            type="password"
            value={form.password_confirm}
            onChange={(event) =>
              setForm((current) => ({ ...current, password_confirm: event.target.value }))
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="kicker">Plan intent</span>
          <select
            value={form.requested_plan}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                requested_plan: event.target.value as "free" | "pro" | "team",
              }))
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none transition focus:border-[rgba(119,224,195,0.28)]"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </select>
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm text-red-100 md:col-span-2">
            {error}
          </div>
        ) : null}

        <button type="submit" className="btn-primary md:col-span-2" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
