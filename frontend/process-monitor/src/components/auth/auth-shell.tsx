"use client";

import Link from "next/link";

import { productName } from "@/lib/site-content";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="site-shell min-h-screen px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-lg font-bold text-white">
            HL
          </div>
          <div>
            <div className="font-display text-xl font-semibold text-white">{productName}</div>
            <div className="text-sm text-slate-400">Private device visibility SaaS</div>
          </div>
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-10">
          <div>
            <div className="eyebrow">Account access</div>
            <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:mt-8 lg:text-6xl">
              {title}
            </h1>
            <p className="copy mt-4 max-w-xl text-base leading-8 sm:text-lg">{description}</p>
          </div>

          <div className="shell-frame rounded-[2rem] p-5 sm:rounded-[2.2rem] sm:p-8">
            {children}
            {footer ? <div className="mt-8 border-t border-white/8 pt-6">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
