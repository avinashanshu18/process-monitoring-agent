"use client";

import { Activity, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export function ModelPerformance() {
  const metrics = [
    { name: "Accuracy", value: 94.3, color: "bg-green-500" },
    { name: "Precision", value: 89.7, color: "bg-blue-500" },
    { name: "Recall", value: 91.2, color: "bg-purple-500" },
    { name: "F1 Score", value: 90.4, color: "bg-cyan-500" },
  ];

  const stats = [
    {
      name: "True Positives",
      value: "18",
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      name: "False Positives",
      value: "5",
      icon: XCircle,
      color: "text-red-400",
    },
    {
      name: "Improvement",
      value: "+2.1%",
      icon: TrendingUp,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Model Performance</h3>
          <p className="text-sm text-gray-400">Neural network metrics</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3 mb-6">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">{metric.name}</span>
              <span className="text-white font-bold">{metric.value}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-400">{stat.name}</span>
              </div>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 p-3 bg-blue-500/5 border border-blue-400/20 rounded-lg">
        <p className="text-xs text-gray-400">
          Model trained on <span className="text-white font-medium">2.4M data points</span> with 
          continuous learning enabled.
        </p>
      </div>
    </div>
  );
}
