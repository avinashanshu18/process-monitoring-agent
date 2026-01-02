"use client";

import { BarChart3, TrendingUp, Award, Zap } from "lucide-react";

export function HistoricalStats() {
  const stats = [
    {
      name: "Uptime (30 days)",
      value: "99.8%",
      subtitle: "29 days 18 hours",
      icon: Award,
      color: "from-green-500 to-teal-500",
      details: [
        { label: "Total downtime", value: "4.8 hours" },
        { label: "Incidents", value: "2" },
        { label: "MTTR", value: "2.4 hours" },
      ],
    },
    {
      name: "Peak Performance",
      value: "94%",
      subtitle: "Best efficiency score",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      details: [
        { label: "Date achieved", value: "Dec 5, 2024" },
        { label: "Duration", value: "6 hours" },
        { label: "Avg this month", value: "87%" },
      ],
    },
    {
      name: "Resource Savings",
      value: "18 GB",
      subtitle: "Memory optimized",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      details: [
        { label: "CPU optimized", value: "12%" },
        { label: "Disk cleaned", value: "45 GB" },
        { label: "Network optimized", value: "8%" },
      ],
    },
  ];

  const recentEvents = [
    {
      date: "Dec 8",
      event: "System Update Completed",
      impact: "positive",
      metric: "Security improved",
    },
    {
      date: "Dec 6",
      event: "Memory Cleanup",
      impact: "positive",
      metric: "18 GB freed",
    },
    {
      date: "Dec 3",
      event: "CPU Spike Detected",
      impact: "negative",
      metric: "Lasted 2.3 hours",
    },
    {
      date: "Nov 29",
      event: "Disk Optimization",
      impact: "positive",
      metric: "Performance +12%",
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Historical Statistics</h3>
          <p className="text-sm text-gray-400">Key metrics and achievements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white mb-1">{stat.name}</h4>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.subtitle}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                {stat.details.map((detail, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xs text-gray-400 mb-1">{detail.label}</p>
                    <p className="text-sm font-bold text-white">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Events Timeline */}
      <div className="pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-4">Recent Events</h4>
        <div className="space-y-3">
          {recentEvents.map((event, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                event.impact === "positive" ? "bg-green-400" : "bg-red-400"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-white">{event.event}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{event.date}</span>
                </div>
                <p className="text-xs text-gray-400">{event.metric}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
