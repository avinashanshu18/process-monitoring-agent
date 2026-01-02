"use client";

import { HardDrive, Database, Folder, TrendingUp } from "lucide-react";

export function StorageOverview() {
  const stats = [
    {
      name: "Total Storage",
      value: "2 TB",
      used: "1.2 TB",
      icon: HardDrive,
      color: "from-blue-500 to-cyan-500",
      percentage: 60,
      change: "+120 GB this month",
    },
    {
      name: "System Drive (C:)",
      value: "500 GB",
      used: "380 GB",
      icon: Database,
      color: "from-purple-500 to-pink-500",
      percentage: 76,
      change: "Critical: Low space",
    },
    {
      name: "Data Drive (D:)",
      value: "1.5 TB",
      used: "820 GB",
      icon: Folder,
      color: "from-green-500 to-teal-500",
      percentage: 55,
      change: "Healthy",
    },
    {
      name: "Growth Rate",
      value: "45 GB/mo",
      used: "Avg usage",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      percentage: 0,
      change: "+12% vs last month",
    },
  ];

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

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
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.used}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Progress Bar */}
            {stat.percentage > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Usage</span>
                  <span className="text-white font-bold">{stat.percentage}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPercentageColor(stat.percentage)} rounded-full transition-all duration-500`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Change Indicator */}
            <p className={`text-xs ${
              stat.change.includes("Critical") ? "text-red-400" :
              stat.change.includes("Healthy") ? "text-green-400" :
              "text-gray-400"
            }`}>
              {stat.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
