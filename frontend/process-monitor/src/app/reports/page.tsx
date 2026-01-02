"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { ReportsOverview } from "@/components/reports/reports-overview";
import { ReportBuilder } from "@/components/reports/report-builder";
import { SavedReports } from "@/components/reports/saved-reports";
import { ScheduledReports } from "@/components/reports/scheduled-reports";
import { ReportTemplates } from "@/components/reports/report-templates";

export default function ReportsPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Performance Reports</h1>
          <p className="text-gray-400">Generate insights and export analytics</p>
        </div>

        {/* Overview */}
        <ReportsOverview />

        {/* Report Builder */}
        <ReportBuilder />

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SavedReports />
          <ScheduledReports />
        </div>

        {/* Templates */}
        <ReportTemplates />
      </div>
    </LayoutWrapper>
  );
}
