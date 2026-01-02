"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { PredictionsOverview } from "@/components/predictions/predictions-overview";
import { ForecastCharts } from "@/components/predictions/forecast-charts";
import { CapacityPlanning } from "@/components/predictions/capacity-planning";
import { TrendAnalysis } from "@/components/predictions/trend-analysis";
import { Recommendations } from "@/components/predictions/recommendations";

export default function PredictionsPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Predictive Analytics</h1>
          <p className="text-gray-400">AI-powered forecasting and capacity planning</p>
        </div>

        {/* Overview */}
        <PredictionsOverview />

        {/* Forecast Charts */}
        <ForecastCharts />

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CapacityPlanning />
          </div>
          <div className="space-y-6">
            <TrendAnalysis />
            <Recommendations />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
