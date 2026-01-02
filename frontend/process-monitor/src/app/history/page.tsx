"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { HistoricalOverview } from "@/components/history/historical-overview";
import { TimeSeriesCharts } from "@/components/history/time-series-charts";
import { DataComparison } from "@/components/history/data-comparison";
import { HistoricalStats } from "@/components/history/historical-stats";
import { ExportData } from "@/components/history/export-data";

export default function HistoryPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Historical Data</h1>
          <p className="text-gray-400">View performance trends and analyze historical metrics</p>
        </div>

        {/* Overview */}
        <HistoricalOverview />

        {/* Time Series Charts */}
        <TimeSeriesCharts />

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DataComparison />
          <HistoricalStats />
        </div>

        {/* Export */}
        <ExportData />
      </div>
    </LayoutWrapper>
  );
}
