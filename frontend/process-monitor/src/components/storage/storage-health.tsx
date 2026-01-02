"use client";

import { useState } from "react";
import { Activity, AlertCircle, CheckCircle, XCircle, TrendingUp, Zap } from "lucide-react";

interface HealthMetric {
  id: number;
  name: string;
  value: string;
  status: "excellent" | "good" | "warning" | "critical";
  description: string;
  recommendation?: string;
}

export function StorageHealth() {
  const [metrics] = useState<HealthMetric[]>([
    {
      id: 1,
      name: "S.M.A.R.T Status",
      value: "Passed",
      status: "excellent",
      description: "All health indicators normal",
    },
    {
      id: 2,
      name: "Read/Write Speed",
      value: "540 MB/s",
      status: "good",
      description: "Operating at expected performance",
    },
    {
      id: 3,
      name: "Bad Sectors",
      value: "0",
      status: "excellent",
      description: "No bad sectors detected",
    },
    {
      id: 4,
      name: "Temperature",
      value: "42°C",
      status: "good",
      description: "Within safe operating range",
    },
    {
      id: 5,
      name: "Power-On Hours",
      value: "8,234 hrs",
      status: "good",
      description: "Normal wear and tear",
    },
    {
      id: 6,
      name: "Fragmentation",
      value: "18%",
      status: "warning",
      description: "Consider defragmentation",
      recommendation: "Run disk defragmentation tool",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      case "good":
        return "text-blue-400 bg-blue-500/10 border-blue-400/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return CheckCircle;
      case "warning":
        return AlertCircle;
      case "critical":
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const healthScore = 92;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Storage Health</h3>
          <p className="text-sm text-gray-400">Overall health score: {healthScore}%</p>
        </div>
      </div>

      {/* Health Score Circle */}
      <div className="mb-6 p-6 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-2">Overall Health</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-400">{healthScore}</span>
              <span className="text-lg text-gray-400">/100</span>
            </div>
            <p className="text-xs text-green-400 mt-2">Excellent condition</p>
          </div>
          
          {/* Visual Health Indicator */}
          <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                className="text-green-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {metrics.map((metric) => {
          const StatusIcon = getStatusIcon(metric.status);
          return (
            <div
              key={metric.id}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  metric.status === "excellent" || metric.status === "good" 
                    ? "bg-green-500/20" 
                    : metric.status === "warning"
                    ? "bg-yellow-500/20"
                    : "bg-red-500/20"
                }`}>
                  <StatusIcon className={`w-4 h-4 ${
                    metric.status === "excellent" || metric.status === "good" 
                      ? "text-green-400" 
                      : metric.status === "warning"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="text-sm font-medium text-white">{metric.name}</h4>
                      <p className="text-xs text-gray-400">{metric.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </span>
                  </div>

                  {metric.recommendation && (
                    <div className="mt-2 p-2 bg-yellow-500/5 border border-yellow-400/20 rounded text-xs text-yellow-400">
                      💡 {metric.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-3">
        <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Optimize
        </button>
        <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Full Scan
        </button>
      </div>
    </div>
  );
}
