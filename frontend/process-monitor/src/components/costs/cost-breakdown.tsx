"use client";

import { useState } from "react";
import { PieChart, Server, Database, Network, HardDrive, Shield } from "lucide-react";

export function CostBreakdown() {
  const [view, setView] = useState<"service" | "environment" | "team">("service");

  const serviceBreakdown = [
    { name: "Compute (EC2)", cost: 1856, percentage: 43.8, icon: Server, color: "from-blue-500 to-cyan-500" },
    { name: "Database (RDS)", cost: 892, percentage: 21.1, icon: Database, color: "from-purple-500 to-pink-500" },
    { name: "Storage (S3)", cost: 645, percentage: 15.2, icon: HardDrive, color: "from-green-500 to-teal-500" },
    { name: "Networking", cost: 523, percentage: 12.4, icon: Network, color: "from-orange-500 to-red-500" },
    { name: "Security", cost: 318, percentage: 7.5, icon: Shield, color: "from-red-500 to-pink-500" },
  ];

  const environmentBreakdown = [
    { name: "Production", cost: 2856, percentage: 67.5, color: "bg-blue-500" },
    { name: "Staging", cost: 892, percentage: 21.1, color: "bg-purple-500" },
    { name: "Development", cost: 486, percentage: 11.4, color: "bg-green-500" },
  ];

  const teamBreakdown = [
    { name: "Engineering", cost: 1956, percentage: 46.2, color: "bg-cyan-500" },
    { name: "Data Science", cost: 1234, percentage: 29.1, color: "bg-purple-500" },
    { name: "DevOps", cost: 724, percentage: 17.1, color: "bg-orange-500" },
    { name: "QA", cost: 320, percentage: 7.6, color: "bg-green-500" },
  ];

  const currentData = view === "service" ? serviceBreakdown :
                      view === "environment" ? environmentBreakdown :
                      teamBreakdown;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cost Breakdown</h3>
            <p className="text-sm text-gray-400">$4,234 total this month</p>
          </div>
        </div>

        <div className="flex gap-2">
          {["service", "environment", "team"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                view === v
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Pie Chart Visualization */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Visual Pie Chart */}
        <div className="flex items-center justify-center p-6">
          <div className="relative w-48 h-48">
            {/* Donut segments */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {currentData.map((item, index) => {
                const total = currentData.reduce((sum, i) => sum + i.percentage, 0);
                let startAngle = 0;
                for (let i = 0; i < index; i++) {
                  startAngle += (currentData[i].percentage / total) * 360;
                }
                const angle = (item.percentage / total) * 360;
                const endAngle = startAngle + angle;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = 50 + 40 * Math.cos(startRad);
                const y1 = 50 + 40 * Math.sin(startRad);
                const x2 = 50 + 40 * Math.cos(endRad);
                const y2 = 50 + 40 * Math.sin(endRad);
                
                const largeArc = angle > 180 ? 1 : 0;
                
                const colors = [
                  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"
                ];
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={colors[index % colors.length]}
                    opacity="0.8"
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                  />
                );
              })}
              {/* Center hole */}
              <circle cx="50" cy="50" r="25" fill="#0a0a0a" />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <p className="text-2xl font-bold text-white">$4.2K</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {currentData.map((item, index) => {
            const Icon = 'icon' in item ? item.icon : null;
            return (
              <div
                key={index}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {Icon ? (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${'color' in item ? item.color : 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${'color' in item ? item.color : 'bg-gray-500'}`} />
                    )}
                    <span className="text-sm font-medium text-white">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">${item.cost.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${Icon ? `bg-gradient-to-r ${'color' in item ? item.color : 'from-gray-500 to-gray-600'}` : ('color' in item ? item.color : 'bg-gray-500')} rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{item.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Spenders */}
      <div className="pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-4">Top 3 Cost Drivers</h4>
        <div className="grid grid-cols-3 gap-4">
          {currentData.slice(0, 3).map((item, index) => (
            <div key={index} className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">#{index + 1}</p>
              <p className="text-sm font-bold text-white mb-1">{item.name}</p>
              <p className="text-lg font-bold text-cyan-400">${item.cost}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
