"use client";

import { BarChart3, TrendingUp, AlertTriangle, Clock } from "lucide-react";

export function AuditAnalytics() {
  const analytics = [
    {
      title: "Most Active User",
      value: "Avinash Kumar",
      metric: "234 actions today",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Peak Activity Time",
      value: "2:00 PM - 4:00 PM",
      metric: "3,245 events",
      icon: Clock,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Failed Actions",
      value: "23",
      metric: "0.18% of total",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
    },
  ];

  const topActions = [
    { action: "Dashboard View", count: 2847, percentage: 22 },
    { action: "Data Export", count: 1923, percentage: 15 },
    { action: "Settings Update", count: 1654, percentage: 13 },
    { action: "User Login", count: 1432, percentage: 11 },
    { action: "Report Generate", count: 1245, percentage: 10 },
  ];

  const categoryDistribution = [
    { category: "User Actions", percentage: 64, color: "bg-blue-500" },
    { category: "System Events", percentage: 35, color: "bg-purple-500" },
    { category: "Security Events", percentage: 1, color: "bg-red-500" },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Analytics</h3>
          <p className="text-sm text-gray-400">Activity insights</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-3 mb-6">
        {analytics.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-sm font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.metric}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Actions */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-white mb-4">Top Actions (24h)</h4>
        <div className="space-y-3">
          {topActions.map((action, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">{action.action}</span>
                <span className="text-white font-bold">{action.count.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${action.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div>
        <h4 className="text-sm font-bold text-white mb-4">Category Distribution</h4>
        
        {/* Visual Bar */}
        <div className="h-4 bg-white/10 rounded-full overflow-hidden flex mb-4">
          {categoryDistribution.map((cat, index) => (
            <div
              key={index}
              className={`${cat.color} transition-all duration-500`}
              style={{ width: `${cat.percentage}%` }}
              title={`${cat.category}: ${cat.percentage}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {categoryDistribution.map((cat, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${cat.color}`} />
                <span className="text-gray-400">{cat.category}</span>
              </div>
              <span className="text-white font-bold">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Avg/Hour</p>
            <p className="text-lg font-bold text-white">535</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Success Rate</p>
            <p className="text-lg font-bold text-green-400">99.82%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
