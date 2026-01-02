"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { CpuMetrics } from "@/components/system/cpu-metrics";
import { MemoryMetrics } from "@/components/system/memory-metrics";
import { DiskMetrics } from "@/components/system/disk-metrics";
import { SystemInfo } from "@/components/system/system-info";
import { HardwareInfo } from "@/components/system/hardware-info";

export default function SystemPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Metrics</h1>
          <p className="text-gray-400">Detailed hardware and system information</p>
        </div>

        {/* System Info Cards */}
        <SystemInfo />

        {/* Metrics Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CpuMetrics />
          <MemoryMetrics />
        </div>

        <DiskMetrics />
        <HardwareInfo />
      </div>
    </LayoutWrapper>
  );
}
