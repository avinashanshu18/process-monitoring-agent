"use client";

import { useState } from "react";
import { LineChart, BarChart3, Activity, Download } from "lucide-react";

export function TimeSeriesCharts() {
  const [selectedMetric, setSelectedMetric] = useState<"cpu" | "memory" | "network" | "disk">("cpu");
  const [chartType, setChartType] = useState<"line" | "area">("line");

  const metrics = [
    { id: "cpu" as const, name: "CPU Usage", color: "from-blue-500 to-cyan-500" },
    { id: "memory" as const, name: "Memory Usage", color: "from-purple-500 to-pink-500" },
    { id: "network" as const, name: "Network Traffic", color: "from-green-500 to-teal-500" },
    { id: "disk" as const, name: "Disk I/O", color: "from-orange-500 to-red-500" },
  ];

  // Mock data points for the chart
  const generateDataPoints = () => {
    const points = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * dayMs);
      points.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 40) + 40, // Random value between 40-80
      });
    }
    return points;
  };

  const dataPoints = generateDataPoints();
  const maxValue = Math.max(...dataPoints.map(p => p.value));

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Performance Trends</h3>
            <p className="text-sm text-gray-400">Historical metrics visualization</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType("line")}
            className={`p-2 rounded-lg transition-all ${
              chartType === "line"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            title="Line Chart"
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`p-2 rounded-lg transition-all ${
              chartType === "area"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            title="Area Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all" title="Export">
            <Download className="w-4 h-4" />
          </button>
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

      {/* Chart Area */}
      <div className="p-6 bg-black/20 rounded-lg border border-white/10">
        {/* Y-axis labels and chart */}
        <div className="flex gap-4">
          {/* Y-axis */}
          <div className="flex flex-col justify-between text-xs text-gray-400 py-2">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Chart */}
          <div className="flex-1">
            {/* Grid lines */}
            <div className="relative h-64">
              {[0, 25, 50, 75, 100].map((line) => (
                <div
                  key={line}
                  className="absolute w-full border-t border-white/5"
                  style={{ top: `${100 - line}%` }}
                />
              ))}

              {/* Data visualization */}
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {dataPoints.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    {/* Bar/Line point */}
                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                      {chartType === "area" ? (
                        <div
                          className={`w-full bg-gradient-to-t ${metrics.find(m => m.id === selectedMetric)?.color} rounded-t opacity-60 hover:opacity-100 transition-all relative`}
                          style={{ height: `${(point.value / 100) * 100}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {point.value}%
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-2 bg-cyan-500 rounded-full relative"
                          style={{ height: `${(point.value / 100) * 100}%` }}
                        >
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full border-2 border-black/50" />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {point.value}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connecting line for line chart */}
              {chartType === "line" && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polyline
                    points={dataPoints.map((point, index) => {
                      const x = ((index + 0.5) / dataPoints.length) * 100;
                      const y = 100 - (point.value / 100) * 100;
                      return `${x}%,${y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgb(34, 211, 238)"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  />
                </svg>
              )}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              {dataPoints.map((point, index) => (
                <span key={index} className="flex-1 text-center">{point.date}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Average</p>
          <p className="text-lg font-bold text-white">
            {Math.round(dataPoints.reduce((a, b) => a + b.value, 0) / dataPoints.length)}%
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Peak</p>
          <p className="text-lg font-bold text-orange-400">{maxValue}%</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Minimum</p>
          <p className="text-lg font-bold text-green-400">
            {Math.min(...dataPoints.map(p => p.value))}%
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Std Dev</p>
          <p className="text-lg font-bold text-blue-400">±8.4%</p>
        </div>
      </div>
    </div>
  );
}
