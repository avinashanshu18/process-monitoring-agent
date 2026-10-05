"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { TrendingUp, TrendingDown } from "lucide-react";

Chart.register(...registerables);

export function NetworkTraffic() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeRange, setTimeRange] = useState("1h");

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = Array.from({ length: 60 }, (_, i) => `${i}m`);
    const uploadData = labels.map(() => Math.random() * 5);
    const downloadData = labels.map(() => Math.random() * 15);

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Download",
            data: downloadData,
            borderColor: "rgba(34, 197, 94, 1)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: "Upload",
            data: uploadData,
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { color: "#9ca3af", padding: 15, usePointStyle: true },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(56, 189, 248, 0.3)",
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const value = Number(context.parsed.y ?? 0);
                return `${context.dataset.label}: ${value.toFixed(2)} MB/s`;
              }
            }
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#9ca3af", maxTicksLimit: 12 },
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { 
              color: "#9ca3af",
              callback: function(value) {
                return value + ' MB/s';
              }
            },
          },
        },
      },
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (!chartInstance.current) return;

      const newUpload = Math.random() * 5;
      const newDownload = Math.random() * 15;

      chartInstance.current.data.datasets[0].data.shift();
      chartInstance.current.data.datasets[0].data.push(newDownload);
      chartInstance.current.data.datasets[1].data.shift();
      chartInstance.current.data.datasets[1].data.push(newUpload);
      
      chartInstance.current.update("none");
    }, 2000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [timeRange]);

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Network Traffic</h3>
          <p className="text-sm text-gray-400">Upload and download speeds</p>
        </div>

        {/* Time Range */}
        <div className="flex gap-2">
          {["1h", "6h", "24h", "7d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <canvas ref={chartRef} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Downloaded</p>
            <p className="text-lg font-bold text-white">142.8 GB</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Uploaded</p>
            <p className="text-lg font-bold text-white">15.3 GB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
