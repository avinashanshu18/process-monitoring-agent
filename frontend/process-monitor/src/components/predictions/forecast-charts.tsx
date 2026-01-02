"use client";

import { useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";

export function ForecastCharts() {
  const [selectedMetric, setSelectedMetric] = useState<"cpu" | "memory" | "disk" | "network">("cpu");
  const [timeHorizon, setTimeHorizon] = useState("30d");

  const metrics = [
    { id: "cpu" as const, name: "CPU Usage", color: "from-blue-500 to-cyan-500" },
    { id: "memory" as const, name: "Memory Usage", color: "from-purple-500 to-pink-500" },
    { id: "disk" as const, name: "Disk Usage", color: "from-green-500 to-teal-500" },
    { id: "network" as const, name: "Network Traffic", color: "from-orange-500 to-red-500" },
  ];

  // Generate historical + forecast data
  const generateData = () => {
    const historical = [];
    const forecast = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Historical (last 30 days)
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * dayMs);
      historical.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: 40 + Math.random() * 20 + (30 - i) * 0.3, // Gradual increase
      });
    }

    // Forecast (next 30 days)
    const lastValue = historical[historical.length - 1].value;
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now + i * dayMs);
      forecast.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: lastValue + i * 0.5 + Math.random() * 5, // Predicted growth
        confidence: 95 - i * 1.5, // Decreasing confidence
      });
    }

    return { historical, forecast };
  };

  const { historical, forecast } = generateData();
  const allData = [...historical, ...forecast];
  const maxValue = Math.max(...allData.map(d => d.value));

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Usage Forecast</h3>
            <p className="text-sm text-gray-400">Predicted vs Actual trends</p>
          </div>
        </div>

        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((horizon) => (
            <button
              key={horizon}
              onClick={() => setTimeHorizon(horizon)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeHorizon === horizon
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {horizon === "7d" ? "7 Days" : horizon === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedMetric === metric.id
                ? `bg-gradient-to-r ${metric.color} text-white shadow-lg`
                : "text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            {metric.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-6 bg-black/20 rounded-lg border border-white/10">
        <div className="flex gap-4">
          {/* Y-axis */}
          <div className="flex flex-col justify-between text-xs text-gray-400 py-2">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
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

              {/* Forecast divider */}
              <div 
                className="absolute h-full border-l-2 border-dashed border-yellow-400/30"
                style={{ left: `${(historical.length / allData.length) * 100}%` }}
              >
                <span className="absolute -top-6 left-2 text-xs text-yellow-400">Forecast →</span>
              </div>

              {/* Data visualization */}
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {allData.map((point, index) => {
                  const isHistorical = index < historical.length;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isHistorical
                            ? "bg-gradient-to-t from-blue-500 to-cyan-500 opacity-80"
                            : "bg-gradient-to-t from-purple-500 to-pink-500 opacity-40"
                        } hover:opacity-100`}
                        style={{ height: `${(point.value / 100) * 100}%` }}
                      >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <div>{point.value.toFixed(1)}%</div>
                          {!isHistorical && 'confidence' in point && (
                            <div className="text-gray-400">±{(100 - point.confidence).toFixed(1)}%</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis labels (show every 5th) */}
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              {allData.filter((_, i) => i % 10 === 0).map((point, index) => (
                <span key={index} className="flex-1 text-center">{point.date}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-cyan-500" />
            <span className="text-xs text-gray-400">Historical Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500 opacity-40" />
            <span className="text-xs text-gray-400">Predicted Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Forecast Point</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Current</p>
          <p className="text-lg font-bold text-white">{historical[historical.length - 1].value.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">7-Day Forecast</p>
          <p className="text-lg font-bold text-purple-400">{forecast[6].value.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">30-Day Forecast</p>
          <p className="text-lg font-bold text-pink-400">{forecast[29].value.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Growth Rate</p>
          <p className="text-lg font-bold text-orange-400">+1.8%/day</p>
        </div>
      </div>
    </div>
  );
}
