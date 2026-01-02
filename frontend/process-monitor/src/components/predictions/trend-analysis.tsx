"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function TrendAnalysis() {
  const trends = [
    {
      metric: "CPU Usage",
      trend: "increasing",
      change: "+12.5%",
      velocity: "+0.42%/day",
      color: "text-orange-400",
    },
    {
      metric: "Memory",
      trend: "increasing",
      change: "+8.3%",
      velocity: "+0.28%/day",
      color: "text-yellow-400",
    },
    {
      metric: "Disk I/O",
      trend: "stable",
      change: "+1.2%",
      velocity: "+0.04%/day",
      color: "text-green-400",
    },
    {
      metric: "Network",
      trend: "decreasing",
      change: "-3.5%",
      velocity: "-0.12%/day",
      color: "text-blue-400",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return TrendingUp;
      case "decreasing":
        return TrendingDown;
      case "stable":
        return Minus;
      default:
        return Minus;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Trend Analysis</h3>
          <p className="text-sm text-gray-400">Growth patterns</p>
        </div>
      </div>

      {/* Trends */}
      <div className="space-y-3">
        {trends.map((trend, index) => {
          const TrendIcon = getTrendIcon(trend.trend);
          return (
            <div
              key={index}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{trend.metric}</span>
                <TrendIcon className={`w-4 h-4 ${trend.color}`} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">30-day change</span>
                <span className={`font-bold ${trend.color}`}>{trend.change}</span>
              </div>

              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-500">Velocity</span>
                <span className="text-gray-400 font-mono">{trend.velocity}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">📈 Trend Summary</p>
        <p className="text-sm text-white">
          Overall resource consumption trending <span className="text-orange-400 font-bold">upward</span> with 
          average growth of <span className="text-white font-bold">+0.25%/day</span>
        </p>
      </div>
    </div>
  );
}
