"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { DashboardsOverview } from "@/components/dashboards/dashboards-overview";
import { DashboardBuilder } from "@/components/dashboards/dashboard-builder";
import { SavedDashboards } from "@/components/dashboards/saved-dashboards";
import { WidgetLibrary } from "@/components/dashboards/widget-library";

export default function DashboardsPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Custom Dashboards</h1>
          <p className="text-gray-400">Build personalized monitoring dashboards</p>
        </div>

        {/* Overview */}
        <DashboardsOverview />

        {/* Dashboard Builder */}
        <DashboardBuilder />

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SavedDashboards />
          <WidgetLibrary />
        </div>
      </div>
    </LayoutWrapper>
  );
}
