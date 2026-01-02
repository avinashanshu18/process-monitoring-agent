"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { CostsOverview } from "@/components/costs/costs-overview";
import { CostBreakdown } from "@/components/costs/cost-breakdown";
import { CostTrends } from "@/components/costs/cost-trends";
import { BudgetAlerts } from "@/components/costs/budget-alerts";
import { SavingsRecommendations } from "@/components/costs/savings-recommendations";

export default function CostsPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cost Analysis</h1>
          <p className="text-gray-400">Cloud spend monitoring and optimization</p>
        </div>

        {/* Overview */}
        <CostsOverview />

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CostBreakdown />
            <CostTrends />
          </div>
          <div className="space-y-6">
            <BudgetAlerts />
            <SavingsRecommendations />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
