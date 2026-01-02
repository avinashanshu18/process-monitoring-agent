"use client";

import { Brain, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";

export function AnomaliesOverview() {
  const stats = [
    {
      name: "Detected Anomalies",
      value: "23",
      change: "-8 from yesterday",
      trend: "down",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Critical Alerts",
      value: "3",
      change: "Require attention",
      trend: "neutral",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
    },
    {
      name: "False Positives",
      value: "5",
      change: "21.7% of total",
      trend: "neutral",
      icon: CheckCircle,
      color: "from-yellow-500 to-orange-500",
    },
    {
      name: "Detection Accuracy",
      value: "94.3%",
      change: "+2.1% this week",
      trend: "up",
      icon: TrendingDown,
      color: "from-green-500 to-teal-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className={`text-xs ${
                  stat.trend === "down" ? "text-green-400" :
                  stat.trend === "up" ? "text-blue-400" :
                  "text-gray-400"
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
