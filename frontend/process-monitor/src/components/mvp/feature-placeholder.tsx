"use client";

import Link from "next/link";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
}

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <LayoutWrapper title={title} description={description}>
      <div className="space-y-6">
        <div className="panel rounded-[2rem] p-8">
          <p className="text-sm text-slate-300">
            This surface is intentionally parked while the MVP stays focused on live
            device visibility, process history, and alerting.
          </p>
          <Link
            href="/app"
            className="btn-primary mt-4"
          >
            Open the live dashboard
          </Link>
        </div>
      </div>
    </LayoutWrapper>
  );
}
