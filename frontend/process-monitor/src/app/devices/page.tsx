"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { DevicesOverview } from "@/components/devices/devices-overview";
import { DevicesGrid } from "@/components/devices/devices-grid";
import { DeviceGroups } from "@/components/devices/device-groups";
import { RemoteActions } from "@/components/devices/remote-actions";
import { DeviceComparison } from "@/components/devices/device-comparison";

export default function DevicesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Device Management</h1>
          <p className="text-gray-400">Monitor and manage all connected devices</p>
        </div>

        {/* Overview */}
        <DevicesOverview />

        {/* Devices Grid */}
        <DevicesGrid />

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DeviceGroups />
          <RemoteActions />
        </div>

        {/* Device Comparison */}
        <DeviceComparison />
      </div>
    </LayoutWrapper>
  );
}
