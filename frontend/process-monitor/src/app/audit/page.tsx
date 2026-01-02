"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { AuditOverview } from "@/components/audit/audit-overview";
import { AuditLogs } from "@/components/audit/audit-logs";
import { AuditFilters } from "@/components/audit/audit-filters";
import { AuditAnalytics } from "@/components/audit/audit-analytics";

export default function AuditPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
          <p className="text-gray-400">System-wide activity tracking and compliance</p>
        </div>

        {/* Overview */}
        <AuditOverview />

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AuditLogs />
          </div>
          <div className="space-y-6">
            <AuditFilters />
            <AuditAnalytics />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
