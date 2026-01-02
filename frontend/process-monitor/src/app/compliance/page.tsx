"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { ComplianceOverview } from "@/components/compliance/compliance-overview";
import { ComplianceFrameworks } from "@/components/compliance/compliance-frameworks";
import { ComplianceReports } from "@/components/compliance/compliance-reports";
import { ComplianceChecks } from "@/components/compliance/compliance-checks";
import { ComplianceTimeline } from "@/components/compliance/compliance-timeline";

export default function CompliancePage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Compliance Reports</h1>
          <p className="text-gray-400">Regulatory compliance and audit documentation</p>
        </div>

        {/* Overview */}
        <ComplianceOverview />

        {/* Frameworks */}
        <ComplianceFrameworks />

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ComplianceReports />
          </div>
          <div className="space-y-6">
            <ComplianceChecks />
            <ComplianceTimeline />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
