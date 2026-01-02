"use client";

import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Activity, Minus } from "lucide-react";

export function HistoricalOverview() {
  const [timeRange, setTimeRange] = useState("7d");

  const stats = [
    {
      name: "Avg CPU Usage",
      current: "45%",
      previous: "52%",
      trend: "down",
      change: "-13.5%",
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Avg Memory Usage",
      current: "62%",
      previous: "58%",
      trend: "up",
      change: "+6.9%",
      icon: Activity,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Peak Load Time",
      current: "14:30",
      previous: "14:45",
      trend: "neutral",
      change: "Consistent",
      icon: Activity,
      color: "from-green-500 to-teal-500",
    },
    {
      name: "Avg Response Time",
      current: "124ms",
      previous: "145ms",
      trend: "down",
      change: "-14.5%",
      icon: Activity,
      color: "from-orange-500 to-red-500",
    },
  ];

  const timeRanges = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string, isGood: boolean) => {
    if (trend === "neutral") return "text-gray-400";
    if (trend === "down" && isGood) return "text-green-400";
    if (trend === "down" && !isGood) return "text-red-400";
    if (trend === "up" && isGood) return "text-green-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Time Range</h3>
              <p className="text-sm text-gray-400">Select period to analyze</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  timeRange === range.value
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {timeRange === "custom" && (
          <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Start Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">End Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = getTrendIcon(stat.trend);
          const isGoodTrend = index === 0 || index === 3; // CPU and Response time - lower is better

          return (
            <div
              key={index}
              className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mb-1">{stat.current}</p>
                  <p className="text-xs text-gray-400">vs {stat.previous} previously</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Trend Indicator */}
              <div className={`flex items-center gap-1 ${getTrendColor(stat.trend, isGoodTrend)}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
