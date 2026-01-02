// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Chart, registerables } from "chart.js";

// Chart.register(...registerables);

// export function SystemHealthChart() {
//   const chartRef = useRef<HTMLCanvasElement>(null);
//   const chartInstance = useRef<Chart | null>(null);
//   const [timeRange, setTimeRange] = useState("1h");

//   useEffect(() => {
//     if (!chartRef.current) return;

//     const ctx = chartRef.current.getContext("2d");
//     if (!ctx) return;

//     if (chartInstance.current) {
//       chartInstance.current.destroy();
//     }

//     // Generate mock data
//     const labels = Array.from({ length: 60 }, (_, i) => `${i}m`);
//     const cpuData = labels.map(() => Math.random() * 100);
//     const memData = labels.map(() => Math.random() * 100);

//     chartInstance.current = new Chart(ctx, {
//       type: "line",
//       data: {
//         labels,
//         datasets: [
//           {
//             label: "CPU %",
//             data: cpuData,
//             borderColor: "rgba(56, 189, 248, 1)",
//             backgroundColor: "rgba(56, 189, 248, 0.1)",
//             fill: true,
//             tension: 0.4,
//           },
//           {
//             label: "Memory %",
//             data: memData,
//             borderColor: "rgba(168, 85, 247, 1)",
//             backgroundColor: "rgba(168, 85, 247, 0.1)",
//             fill: true,
//             tension: 0.4,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             display: true,
//             position: "top",
//             labels: { color: "#9ca3af" },
//           },
//           tooltip: {
//             backgroundColor: "rgba(0, 0, 0, 0.8)",
//             borderColor: "rgba(56, 189, 248, 0.3)",
//             borderWidth: 1,
//           },
//         },
//         scales: {
//           x: {
//             grid: { display: false },
//             ticks: { color: "#9ca3af" },
//           },
//           y: {
//             grid: { color: "rgba(255, 255, 255, 0.05)" },
//             ticks: { color: "#9ca3af" },
//             max: 100,
//           },
//         },
//       },
//     });

//     // Simulate real-time updates
//     const interval = setInterval(() => {
//       if (!chartInstance.current) return;

//       const newCpu = Math.random() * 100;
//       const newMem = Math.random() * 100;

//       chartInstance.current.data.datasets[0].data.shift();
//       chartInstance.current.data.datasets[0].data.push(newCpu);
//       chartInstance.current.data.datasets[1].data.shift();
//       chartInstance.current.data.datasets[1].data.push(newMem);
      
//       chartInstance.current.update("none");
//     }, 2000);

//     return () => {
//       clearInterval(interval);
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//       }
//     };
//   }, [timeRange]);

//   return (
//     <div className="glass rounded-xl p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h3 className="text-lg font-bold text-white">System Health</h3>
//           <p className="text-sm text-gray-400">Real-time performance metrics</p>
//         </div>

//         {/* Time Range Selector */}
//         <div className="flex gap-2">
//           {["1h", "6h", "24h", "7d"].map((range) => (
//             <button
//               key={range}
//               onClick={() => setTimeRange(range)}
//               className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
//                 timeRange === range
//                   ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
//                   : "text-gray-400 hover:text-white hover:bg-white/5"
//               }`}
//             >
//               {range}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="h-64">
//         <canvas ref={chartRef} />
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function SystemHealthChart() {
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

    // Generate mock data
    const labels = Array.from({ length: 60 }, (_, i) => `${i}m`);
    const cpuData = labels.map(() => Math.random() * 100);
    const memData = labels.map(() => Math.random() * 100);
    const diskData = labels.map(() => Math.random() * 100);

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "CPU %",
            data: cpuData,
            borderColor: "rgba(56, 189, 248, 1)",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: "Memory %",
            data: memData,
            borderColor: "rgba(168, 85, 247, 1)",
            backgroundColor: "rgba(168, 85, 247, 0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: "Disk I/O",
            data: diskData,
            borderColor: "rgba(34, 197, 94, 1)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
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
            labels: { 
              color: "#9ca3af",
              padding: 15,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(56, 189, 248, 0.3)",
            borderWidth: 1,
            padding: 12,
            titleColor: "#fff",
            bodyColor: "#fff",
            displayColors: true,
          },
        },
        scales: {
          x: {
            grid: { 
              display: false,
            },
            ticks: { 
              color: "#9ca3af",
              maxTicksLimit: 12,
            },
          },
          y: {
            grid: { 
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: { 
              color: "#9ca3af",
              callback: function(value) {
                return value + '%';
              }
            },
            max: 100,
            min: 0,
          },
        },
      },
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (!chartInstance.current) return;

      const newCpu = Math.random() * 100;
      const newMem = Math.random() * 100;
      const newDisk = Math.random() * 100;

      chartInstance.current.data.datasets[0].data.shift();
      chartInstance.current.data.datasets[0].data.push(newCpu);
      chartInstance.current.data.datasets[1].data.shift();
      chartInstance.current.data.datasets[1].data.push(newMem);
      chartInstance.current.data.datasets[2].data.shift();
      chartInstance.current.data.datasets[2].data.push(newDisk);
      
      chartInstance.current.update("none");
    }, 2000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [timeRange]);

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">System Health</h3>
          <p className="text-sm text-gray-400">Real-time performance metrics</p>
        </div>

        {/* Time Range Selector */}
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
    </div>
  );
}
