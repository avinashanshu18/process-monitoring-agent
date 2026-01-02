"use client";

import { Lightbulb, DollarSign, Zap, Database, Server, CheckCircle } from "lucide-react";

export function SavingsRecommendations() {
  const recommendations = [
    {
      id: 1,
      title: "Resize Underutilized Instances",
      description: "3 EC2 instances running at <30% utilization",
      savings: "$245/month",
      savingsPercentage: 15,
      effort: "Low",
      impact: "High",
      icon: Server,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Enable Auto-Scaling",
      description: "Automatically scale resources based on demand",
      savings: "$180/month",
      savingsPercentage: 12,
      effort: "Medium",
      impact: "High",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      title: "Use Reserved Instances",
      description: "Lock in lower rates for predictable workloads",
      savings: "$125/month",
      savingsPercentage: 8,
      effort: "Low",
      impact: "Medium",
      icon: DollarSign,
      color: "from-green-500 to-teal-500",
    },
    {
      id: 4,
      title: "Optimize Database Storage",
      description: "Remove unused snapshots and old backups",
      savings: "$62/month",
      savingsPercentage: 4,
      effort: "Low",
      impact: "Low",
      icon: Database,
      color: "from-orange-500 to-red-500",
    },
  ];

  const totalSavings = recommendations.reduce((sum, rec) => {
    return sum + parseInt(rec.savings.replace(/[^0-9]/g, ''));
  }, 0);

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "Low":
        return "text-green-400 bg-green-500/10";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/10";
      case "High":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Low":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Savings Opportunities</h3>
          <p className="text-sm text-gray-400">Potential: ${totalSavings}/mo</p>
        </div>
      </div>

      {/* Total Savings Card */}
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-400/30 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Total Potential Savings</span>
          <DollarSign className="w-5 h-5 text-green-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-1">${totalSavings}</p>
        <p className="text-sm text-green-400">15% cost reduction per month</p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          
          return (
            <div
              key={rec.id}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rec.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
                  <p className="text-xs text-gray-400 mb-3">{rec.description}</p>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      <span className="text-sm font-bold text-green-400">{rec.savings}</span>
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">{rec.savingsPercentage}% reduction</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(rec.effort)}`}>
                      {rec.effort} Effort
                    </span>
                    <span className={`text-xs font-medium ${getImpactColor(rec.impact)}`}>
                      {rec.impact} Impact
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded text-xs font-medium transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Implement Recommendation
              </button>
            </div>
          );
        })}
      </div>

      {/* Implementation Timeline */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-3">Quick Wins</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white/5 rounded">
            <span className="text-xs text-gray-400">Low effort items</span>
            <span className="text-xs font-bold text-green-400">$432/mo</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/5 rounded">
            <span className="text-xs text-gray-400">Can implement today</span>
            <span className="text-xs font-bold text-blue-400">2 items</span>
          </div>
        </div>
      </div>

      {/* View All Button */}
      <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-yellow-500/20">
        View All Recommendations
      </button>
    </div>
  );
}
