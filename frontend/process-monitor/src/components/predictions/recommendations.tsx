"use client";

import { Lightbulb, AlertTriangle, Zap, DollarSign, CheckCircle } from "lucide-react";

export function Recommendations() {
  const recommendations = [
    {
      title: "Scale CPU Resources",
      description: "Add 2 more CPU cores within 14 days",
      priority: "high",
      impact: "Prevent performance degradation",
      cost: "$120/month",
      icon: Zap,
    },
    {
      title: "Optimize Memory",
      description: "Review memory-intensive processes",
      priority: "medium",
      impact: "Reduce memory footprint by 15%",
      cost: "No cost",
      icon: CheckCircle,
    },
    {
      title: "Storage Expansion",
      description: "Add 500GB storage in 3 weeks",
      priority: "medium",
      impact: "Avoid storage constraints",
      cost: "$80/month",
      icon: AlertTriangle,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Recommendations</h3>
          <p className="text-sm text-gray-400">Action items</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={index}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  rec.priority === "high" ? "bg-red-500/20" :
                  rec.priority === "medium" ? "bg-yellow-500/20" :
                  "bg-blue-500/20"
                }`}>
                  <Icon className={`w-4 h-4 ${
                    rec.priority === "high" ? "text-red-400" :
                    rec.priority === "medium" ? "text-yellow-400" :
                    "text-blue-400"
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{rec.description}</p>
                </div>
              </div>

              <div className="pl-11 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Impact</span>
                  <span className="text-white">{rec.impact}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Cost
                  </span>
                  <span className="text-green-400 font-medium">{rec.cost}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-yellow-500/20">
        View All Recommendations
      </button>
    </div>
  );
}
