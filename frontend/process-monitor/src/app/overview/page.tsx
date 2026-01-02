"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SystemHealthChart } from "@/components/dashboard/system-health-chart";
import { TopProcesses } from "@/components/dashboard/top-processes";
import { RealtimeMetrics } from "@/components/dashboard/realtime-metrics";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function OverviewPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
          <p className="text-gray-400">Real-time monitoring of your system performance</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <SystemHealthChart />
            <TopProcesses />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <RealtimeMetrics />
            <QuickActions />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
