"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { NetworkOverview } from "@/components/network/network-overview";
import { NetworkInterfaces } from "@/components/network/network-interfaces";
import { ActiveConnections } from "@/components/network/active-connections";
import { NetworkTraffic } from "@/components/network/network-traffic";
import { BandwidthUsage } from "@/components/network/bandwidth-usage";

export default function NetworkPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Network Monitor</h1>
          <p className="text-gray-400">Real-time network activity and connections</p>
        </div>

        {/* Overview Cards */}
        <NetworkOverview />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <NetworkTraffic />
          <BandwidthUsage />
        </div>

        <NetworkInterfaces />
        <ActiveConnections />
      </div>
    </LayoutWrapper>
  );
}
