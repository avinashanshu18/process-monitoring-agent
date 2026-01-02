"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { AlertsOverview } from "@/components/alerts/alerts-overview";
import { ActiveAlerts } from "@/components/alerts/active-alerts";
import { AlertRules } from "@/components/alerts/alert-rules";
import { NotificationChannels } from "@/components/alerts/notification-channels";
import { AlertHistory } from "@/components/alerts/alert-history";

export default function AlertsPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Alerts & Notifications</h1>
          <p className="text-gray-400">Manage alerts, rules, and notification channels</p>
        </div>

        {/* Overview */}
        <AlertsOverview />

        {/* Active Alerts */}
        <ActiveAlerts />

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AlertRules />
          <NotificationChannels />
        </div>

        {/* History */}
        <AlertHistory />
      </div>
    </LayoutWrapper>
  );
}
