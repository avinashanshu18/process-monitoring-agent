"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { Gauge } from "lucide-react";

Chart.register(...registerables);

export function BandwidthUsage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Chrome", "Node.js", "VS Code", "Steam", "Discord", "Other"],
        datasets: [
          {
            data: [35, 20, 15, 12, 8, 10],
            backgroundColor: [
              "rgba(56, 189, 248, 0.8)",
              "rgba(34, 197, 94, 0.8)",
              "rgba(168, 85, 247, 0.8)",
              "rgba(251, 191, 36, 0.8)",
              "rgba(239, 68, 68, 0.8)",
              "rgba(156, 163, 175, 0.8)",
            ],
            borderColor: [
              "rgba(56, 189, 248, 1)",
              "rgba(34, 197, 94, 1)",
              "rgba(168, 85, 247, 1)",
              "rgba(251, 191, 36, 1)",
              "rgba(239, 68, 68, 1)",
              "rgba(156, 163, 175, 1)",
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(56, 189, 248, 0.3)",
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          },
        },
        cutout: "70%",
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  const applications = [
    { name: "Chrome", percentage: 35, color: "bg-cyan-500", data: "3.2 GB" },
    { name: "Node.js", percentage: 20, color: "bg-green-500", data: "1.8 GB" },
    { name: "VS Code", percentage: 15, color: "bg-purple-500", data: "1.4 GB" },
    { name: "Steam", percentage: 12, color: "bg-yellow-500", data: "1.1 GB" },
    { name: "Discord", percentage: 8, color: "bg-red-500", data: "0.7 GB" },
    { name: "Other", percentage: 10, color: "bg-gray-500", data: "0.9 GB" },
  ];

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Bandwidth Usage</h3>
          <p className="text-sm text-gray-400">By application</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative h-64 mb-6">
        <canvas ref={chartRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-gray-400">Total Usage</p>
          <p className="text-2xl font-bold text-white">9.1 GB</p>
        </div>
      </div>

      {/* Application List */}
      <div className="space-y-3">
        {applications.map((app, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${app.color} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white font-medium truncate">{app.name}</span>
                <span className="text-xs text-gray-400">{app.data}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${app.color} rounded-full transition-all duration-500`}
                  style={{ width: `${app.percentage}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-400 font-mono w-12 text-right">{app.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
