"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { TrendingUp, Database } from "lucide-react";

Chart.register(...registerables);

interface Process {
  pid: number;
  name: string;
  cpu_percent?: number | null;
  memory_mb?: number | null;
}

interface ProcessChartsProps {
  processes: Process[];
}

export function ProcessCharts({ processes }: ProcessChartsProps) {
  const cpuChartRef = useRef<HTMLCanvasElement>(null);
  const memChartRef = useRef<HTMLCanvasElement>(null);
  const cpuChartInstance = useRef<Chart | null>(null);
  const memChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!processes || processes.length === 0) return;

    const topCPU = [...processes]
      .sort((a, b) => (b.cpu_percent ?? 0) - (a.cpu_percent ?? 0))
      .slice(0, 5);

    const topMem = [...processes]
      .sort((a, b) => (b.memory_mb ?? 0) - (a.memory_mb ?? 0))
      .slice(0, 5);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "rgba(56, 189, 248, 0.3)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#9ca3af", font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af", font: { size: 11 } },
        },
      },
    };

    // CPU Chart
    if (cpuChartRef.current) {
      const ctx = cpuChartRef.current.getContext("2d");
      if (ctx) {
        if (cpuChartInstance.current) {
          cpuChartInstance.current.destroy();
        }

        cpuChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: topCPU.map((p) => `${p.name.substring(0, 15)}...`),
            datasets: [
              {
                label: "CPU %",
                data: topCPU.map((p) => p.cpu_percent ?? 0),
                backgroundColor: "rgba(56, 189, 248, 0.5)",
                borderColor: "rgba(56, 189, 248, 1)",
                borderWidth: 1,
                borderRadius: 6,
              },
            ],
          },
          options: chartOptions,
        });
      }
    }

    // Memory Chart
    if (memChartRef.current) {
      const ctx = memChartRef.current.getContext("2d");
      if (ctx) {
        if (memChartInstance.current) {
          memChartInstance.current.destroy();
        }

        memChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: topMem.map((p) => `${p.name.substring(0, 15)}...`),
            datasets: [
              {
                label: "Memory (MB)",
                data: topMem.map((p) => p.memory_mb ?? 0),
                backgroundColor: "rgba(168, 85, 247, 0.5)",
                borderColor: "rgba(168, 85, 247, 1)",
                borderWidth: 1,
                borderRadius: 6,
              },
            ],
          },
          options: chartOptions,
        });
      }
    }

    return () => {
      if (cpuChartInstance.current) cpuChartInstance.current.destroy();
      if (memChartInstance.current) memChartInstance.current.destroy();
    };
  }, [processes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CPU Chart */}
      <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top 5 CPU Usage</h3>
            <p className="text-xs text-gray-400">Processes by CPU percentage</p>
          </div>
        </div>
        <div className="h-64">
          <canvas ref={cpuChartRef}></canvas>
        </div>
      </div>

      {/* Memory Chart */}
      <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top 5 Memory Usage</h3>
            <p className="text-xs text-gray-400">Processes by memory consumption</p>
          </div>
        </div>
        <div className="h-64">
          <canvas ref={memChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
