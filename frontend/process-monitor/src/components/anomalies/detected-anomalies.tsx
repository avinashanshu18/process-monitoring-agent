"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, ThumbsUp, ThumbsDown, Eye, ChevronDown } from "lucide-react";

interface Anomaly {
  id: number;
  timestamp: string;
  metric: string;
  severity: "critical" | "high" | "medium" | "low";
  score: number;
  deviation: string;
  expectedValue: string;
  actualValue: string;
  status: "active" | "resolved" | "false_positive";
  description: string;
  impact: string;
  recommendation: string;
}

export function DetectedAnomalies() {
  const [expandedAnomaly, setExpandedAnomaly] = useState<number | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("all");

  const anomalies: Anomaly[] = [
    {
      id: 1,
      timestamp: "2024-12-09 17:15:23",
      metric: "CPU Usage",
      severity: "critical",
      score: 0.95,
      deviation: "+245%",
      expectedValue: "35%",
      actualValue: "86%",
      status: "active",
      description: "Unusual spike in CPU utilization detected",
      impact: "High resource consumption may affect system performance",
      recommendation: "Investigate running processes and consider scaling resources",
    },
    {
      id: 2,
      timestamp: "2024-12-09 16:42:10",
      metric: "Memory Usage",
      severity: "high",
      score: 0.87,
      deviation: "+180%",
      expectedValue: "4.2 GB",
      actualValue: "11.8 GB",
      status: "active",
      description: "Memory consumption exceeds normal pattern",
      impact: "Potential memory leak or unexpected workload",
      recommendation: "Check for memory leaks in recent deployments",
    },
    {
      id: 3,
      timestamp: "2024-12-09 16:20:45",
      metric: "Network Traffic",
      severity: "medium",
      score: 0.72,
      deviation: "+120%",
      expectedValue: "45 MB/s",
      actualValue: "99 MB/s",
      status: "resolved",
      description: "Network traffic surge detected",
      impact: "Bandwidth utilization higher than baseline",
      recommendation: "Monitor for sustained high traffic patterns",
    },
    {
      id: 4,
      timestamp: "2024-12-09 15:55:30",
      metric: "Disk I/O",
      severity: "low",
      score: 0.65,
      deviation: "+85%",
      expectedValue: "120 MB/s",
      actualValue: "222 MB/s",
      status: "false_positive",
      description: "Increased disk activity detected",
      impact: "Normal backup operation detected",
      recommendation: "No action required - scheduled backup",
    },
    {
      id: 5,
      timestamp: "2024-12-09 15:30:12",
      metric: "Response Time",
      severity: "high",
      score: 0.82,
      deviation: "+310%",
      expectedValue: "150ms",
      actualValue: "615ms",
      status: "resolved",
      description: "API response time degradation",
      impact: "User experience may be affected",
      recommendation: "Optimize database queries and check cache",
    },
  ];

  const filteredAnomalies = filterSeverity === "all" 
    ? anomalies 
    : anomalies.filter(a => a.severity === filterSeverity);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-400/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return AlertTriangle;
      case "resolved":
        return CheckCircle;
      case "false_positive":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-red-400 bg-red-500/10";
      case "resolved":
        return "text-green-400 bg-green-500/10";
      case "false_positive":
        return "text-gray-400 bg-gray-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Detected Anomalies</h3>
            <p className="text-sm text-gray-400">{filteredAnomalies.length} anomalies found</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "critical", "high", "medium", "low"].map((severity) => (
          <button
            key={severity}
            onClick={() => setFilterSeverity(severity)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filterSeverity === severity
                ? "bg-red-500/20 text-red-400 border border-red-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredAnomalies.map((anomaly) => {
          const StatusIcon = getStatusIcon(anomaly.status);
          const isExpanded = expandedAnomaly === anomaly.id;

          return (
            <div
              key={anomaly.id}
              className="bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all overflow-hidden"
            >
              {/* Anomaly Header */}
              <button
                onClick={() => setExpandedAnomaly(isExpanded ? null : anomaly.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Severity Badge */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    anomaly.severity === "critical" ? "bg-red-500/20" :
                    anomaly.severity === "high" ? "bg-orange-500/20" :
                    anomaly.severity === "medium" ? "bg-yellow-500/20" :
                    "bg-blue-500/20"
                  }`}>
                    <TrendingUp className={`w-6 h-6 ${
                      anomaly.severity === "critical" ? "text-red-400" :
                      anomaly.severity === "high" ? "text-orange-400" :
                      anomaly.severity === "medium" ? "text-yellow-400" :
                      "text-blue-400"
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{anomaly.metric}</h4>
                        <p className="text-xs text-gray-400">{anomaly.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs mb-2">
                      <span className="text-gray-400">{anomaly.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${getStatusColor(anomaly.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {anomaly.status.replace("_", " ")}
                      </span>
                      <span className="text-white">Score: <span className="font-bold">{(anomaly.score * 100).toFixed(1)}%</span></span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Expected: <span className="text-white font-mono">{anomaly.expectedValue}</span></span>
                      <span>•</span>
                      <span>Actual: <span className="text-orange-400 font-mono">{anomaly.actualValue}</span></span>
                      <span>•</span>
                      <span className="text-red-400 font-bold">{anomaly.deviation}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-white/[0.02]">
                  <div className="space-y-4">
                    {/* Impact & Recommendation */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-orange-500/5 border border-orange-400/20 rounded-lg">
                        <p className="text-xs text-orange-400 font-medium mb-1">Impact</p>
                        <p className="text-sm text-white">{anomaly.impact}</p>
                      </div>
                      <div className="p-3 bg-blue-500/5 border border-blue-400/20 rounded-lg">
                        <p className="text-xs text-blue-400 font-medium mb-1">Recommendation</p>
                        <p className="text-sm text-white">{anomaly.recommendation}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded text-xs font-medium transition-all flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                      <button className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded text-xs font-medium transition-all flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        Accurate
                      </button>
                      <button className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded text-xs font-medium transition-all flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3" />
                        False Positive
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
