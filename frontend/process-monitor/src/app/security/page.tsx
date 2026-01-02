"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { SecurityOverview } from "@/components/security/security-overview";
import { ThreatDetection } from "@/components/security/threat-detection";
import { FirewallStatus } from "@/components/security/firewall-status";
import { SecurityLogs } from "@/components/security/security-logs";
import { VulnerabilityScanner } from "@/components/security/vulnerability-scanner";

export default function SecurityPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-400">Monitor system security and threats</p>
        </div>

        {/* Security Overview */}
        <SecurityOverview />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ThreatDetection />
          <FirewallStatus />
        </div>

        <VulnerabilityScanner />
        <SecurityLogs />
      </div>
    </LayoutWrapper>
  );
}
