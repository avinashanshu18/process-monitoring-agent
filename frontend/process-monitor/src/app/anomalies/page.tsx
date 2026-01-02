"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { AnomaliesOverview } from "@/components/anomalies/anomalies-overview";
import { AnomalyDetector } from "@/components/anomalies/anomaly-detector";
import { DetectedAnomalies } from "@/components/anomalies/detected-anomalies";
import { AnomalyInsights } from "@/components/anomalies/anomaly-insights";
import { ModelPerformance } from "@/components/anomalies/model-performance";

export default function AnomaliesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">ML Anomaly Detection</h1>
          <p className="text-gray-400">AI-powered system behavior analysis</p>
        </div>

        {/* Overview */}
        <AnomaliesOverview />

        {/* Anomaly Detector */}
        <AnomalyDetector />

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DetectedAnomalies />
          </div>
          <div className="space-y-6">
            <AnomalyInsights />
            <ModelPerformance />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
