"use client";

import { Lightbulb, TrendingUp, Clock, Target } from "lucide-react";

export function AnomalyInsights() {
  const insights = [
    {
      title: "Peak Anomaly Time",
      value: "2:00 PM - 4:00 PM",
      description: "Most anomalies occur during peak hours",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Most Affected Metric",
      value: "CPU Usage",
      description: "42% of all detected anomalies",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Detection Trend",
      value: "-15%",
      description: "Fewer anomalies this week",
      icon: TrendingUp,
      color: "from-green-500 to-teal-500",
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Insights</h3>
          <p className="text-sm text-gray-400">Pattern analysis</p>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${insight.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">{insight.title}</p>
                  <p className="text-lg font-bold text-white mb-1">{insight.value}</p>
                  <p className="text-xs text-gray-500">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
