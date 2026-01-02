"use client";

import { useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";

export function CostTrends() {
  const [timeRange, setTimeRange] = useState("30d");

  const costData = [
    { month: "Jun", actual: 3245, budget: 3500 },
    { month: "Jul", actual: 3567, budget: 3500 },
    { month: "Aug", actual: 3892, budget: 4000 },
    { month: "Sep", actual: 3645, budget: 4000 },
    { month: "Oct", actual: 4123, budget: 4000 },
    { month: "Nov", actual: 4234, budget: 4500 },
    { month: "Dec", actual: 4234, budget: 4500, projected: 4890 },
  ];

  const maxValue = Math.max(...costData.flatMap(d => [d.actual, d.budget, d.projected || 0]));

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cost Trends</h3>
            <p className="text-sm text-gray-400">Historical spending analysis</p>
          </div>
        </div>

        <div className="flex gap-2">
          {["7d", "30d", "90d", "12m"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? "bg-green-500/20 text-green-400 border border-green-400/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {range === "12m" ? "12 Months" : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 bg-black/20 rounded-lg border border-white/10">
        <div className="flex gap-4">
          {/* Y-axis */}
          <div className="flex flex-col justify-between text-xs text-gray-400 py-2">
            <span>${(maxValue / 1000).toFixed(1)}K</span>
            <span>${(maxValue * 0.75 / 1000).toFixed(1)}K</span>
            <span>${(maxValue * 0.5 / 1000).toFixed(1)}K</span>
            <span>${(maxValue * 0.25 / 1000).toFixed(1)}K</span>
            <span>$0</span>
          </div>

          {/* Chart Area */}
          <div className="flex-1">
            <div className="relative h-64">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((line) => (
                <div
                  key={line}
                  className="absolute w-full border-t border-white/5"
                  style={{ top: `${100 - line}%` }}
                />
              ))}

              {/* Data */}
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {costData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                    {/* Budget bar (background) */}
                    <div className="relative w-full flex justify-center gap-1">
                      <div
                        className="w-1/3 bg-gray-500/20 rounded-t relative"
                        style={{ height: `${(data.budget / maxValue) * 256}px` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Budget: ${data.budget}
                        </div>
                      </div>
                      
                      {/* Actual bar */}
                      <div
                        className={`w-1/3 rounded-t relative ${
                          data.actual > data.budget
                            ? "bg-gradient-to-t from-red-500 to-orange-500"
                            : "bg-gradient-to-t from-green-500 to-teal-500"
                        } hover:opacity-100 transition-all`}
                        style={{ 
                          height: `${(data.actual / maxValue) * 256}px`,
                          opacity: 0.8
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Actual: ${data.actual}
                        </div>
                      </div>

                      {/* Projected bar */}
                      {data.projected && (
                        <div
                          className="w-1/3 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t opacity-40 relative"
                          style={{ height: `${(data.projected / maxValue) * 256}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Projected: ${data.projected}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              {costData.map((data, index) => (
                <span key={index} className="flex-1 text-center">{data.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500/20" />
            <span className="text-xs text-gray-400">Budget</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-teal-500" />
            <span className="text-xs text-gray-400">Actual (Under)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-orange-500" />
            <span className="text-xs text-gray-400">Actual (Over)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500 opacity-40" />
            <span className="text-xs text-gray-400">Projected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
