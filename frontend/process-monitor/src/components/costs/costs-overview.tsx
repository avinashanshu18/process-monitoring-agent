"use client";

import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export function CostsOverview() {
  const stats = [
    {
      name: "Total Spend (MTD)",
      value: "$4,234",
      change: "+12.3% vs last month",
      trend: "up",
      icon: DollarSign,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Daily Average",
      value: "$141",
      change: "Based on 30 days",
      trend: "neutral",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Projected (EOM)",
      value: "$4,890",
      change: "+8% over budget",
      trend: "warning",
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Potential Savings",
      value: "$612",
      change: "15% optimization",
      trend: "down",
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
                  stat.trend === "up" ? "text-orange-400" :
                  stat.trend === "down" ? "text-green-400" :
                  stat.trend === "warning" ? "text-red-400" :
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
