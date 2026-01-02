"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Cpu, TrendingUp, Thermometer } from "lucide-react";

Chart.register(...registerables);

export function CpuMetrics() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [cpuData, setCpuData] = useState({
    overall: 42,
    cores: [45, 38, 52, 41, 48, 39, 44, 42],
    temperature: 62,
    frequency: 3.4,
    maxFrequency: 4.2,
  });

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: cpuData.cores.map((_, i) => `Core ${i + 1}`),
        datasets: [
          {
            label: "CPU Usage %",
            data: cpuData.cores,
            backgroundColor: cpuData.cores.map(val => 
              val > 70 ? "rgba(239, 68, 68, 0.5)" :
              val > 50 ? "rgba(251, 191, 36, 0.5)" :
              "rgba(56, 189, 248, 0.5)"
            ),
            borderColor: cpuData.cores.map(val => 
              val > 70 ? "rgba(239, 68, 68, 1)" :
              val > 50 ? "rgba(251, 191, 36, 1)" :
              "rgba(56, 189, 248, 1)"
            ),
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(56, 189, 248, 0.3)",
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                return `Usage: ${context.parsed.y}%`;
              }
            }
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#9ca3af", font: { size: 10 } },
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { 
              color: "#9ca3af",
              callback: function(value) {
                return value + '%';
              }
            },
            max: 100,
          },
        },
      },
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCpuData(prev => ({
        ...prev,
        overall: Math.floor(Math.random() * 40 + 30),
        cores: prev.cores.map(() => Math.floor(Math.random() * 60 + 20)),
        temperature: Math.floor(Math.random() * 20 + 55),
      }));
    }, 3000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [cpuData.cores.length]);

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">CPU Performance</h3>
            <p className="text-sm text-gray-400">Per-core utilization</p>
          </div>
        </div>

        {/* Overall Usage Badge */}
        <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Overall</p>
          <p className="text-2xl font-bold text-cyan-400">{cpuData.overall}%</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <p className="text-xs text-gray-400">Temperature</p>
          </div>
          <p className="text-lg font-bold text-white">{cpuData.temperature}°C</p>
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Frequency</p>
          </div>
          <p className="text-lg font-bold text-white">{cpuData.frequency} GHz</p>
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Cores</p>
          </div>
          <p className="text-lg font-bold text-white">{cpuData.cores.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>

      {/* Core Details */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 mb-3">Per-Core Usage</p>
        <div className="grid grid-cols-4 gap-2">
          {cpuData.cores.map((usage, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-gray-500 mb-1">C{index + 1}</p>
              <div className="relative h-12 bg-white/5 rounded overflow-hidden">
                <div 
                  className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                    usage > 70 ? 'bg-gradient-to-t from-red-500 to-orange-500' :
                    usage > 50 ? 'bg-gradient-to-t from-yellow-500 to-orange-500' :
                    'bg-gradient-to-t from-cyan-500 to-blue-500'
                  }`}
                  style={{ height: `${usage}%` }}
                />
              </div>
              <p className="text-xs font-mono text-gray-400 mt-1">{usage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
