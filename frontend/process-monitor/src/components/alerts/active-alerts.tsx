"use client";

import { useState } from "react";
import { Bell, AlertTriangle, Cpu, HardDrive, Network, Shield, CheckCircle, X, Clock } from "lucide-react";

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "cpu" | "memory" | "disk" | "network" | "security";
  triggered: string;
  status: "active" | "acknowledged" | "resolved";
  value: string;
  threshold: string;
}

export function ActiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      title: "High CPU Usage",
      description: "CPU usage exceeded threshold on Core 1",
      severity: "critical",
      category: "cpu",
      triggered: "2 minutes ago",
      status: "active",
      value: "95%",
      threshold: "85%",
    },
    {
      id: 2,
      title: "Memory Warning",
      description: "Available RAM below 2GB",
      severity: "high",
      category: "memory",
      triggered: "15 minutes ago",
      status: "active",
      value: "1.2 GB",
      threshold: "2 GB",
    },
    {
      id: 3,
      title: "Disk Space Low",
      description: "C: drive has less than 10% free space",
      severity: "medium",
      category: "disk",
      triggered: "1 hour ago",
      status: "acknowledged",
      value: "8%",
      threshold: "10%",
    },
    {
      id: 4,
      title: "Unusual Network Activity",
      description: "High outbound traffic detected",
      severity: "high",
      category: "network",
      triggered: "30 minutes ago",
      status: "active",
      value: "45 MB/s",
      threshold: "30 MB/s",
    },
    {
      id: 5,
      title: "Security Threat Detected",
      description: "Suspicious process attempting network access",
      severity: "critical",
      category: "security",
      triggered: "5 minutes ago",
      status: "active",
      value: "1 threat",
      threshold: "0 threats",
    },
    {
      id: 6,
      title: "Temperature Alert",
      description: "CPU temperature above safe threshold",
      severity: "medium",
      category: "cpu",
      triggered: "45 minutes ago",
      status: "acknowledged",
      value: "82°C",
      threshold: "75°C",
    },
    {
      id: 7,
      title: "Port Scan Detected",
      description: "Port scanning activity from external IP",
      severity: "low",
      category: "security",
      triggered: "2 hours ago",
      status: "resolved",
      value: "Blocked",
      threshold: "N/A",
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-400/30 bg-red-500/10";
      case "high":
        return "border-orange-400/30 bg-orange-500/10";
      case "medium":
        return "border-yellow-400/30 bg-yellow-500/10";
      case "low":
        return "border-blue-400/30 bg-blue-500/10";
      default:
        return "border-gray-400/30 bg-gray-500/10";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-400/30";
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-400/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-400/30";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-400/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-400/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cpu":
        return Cpu;
      case "memory":
        return HardDrive;
      case "disk":
        return HardDrive;
      case "network":
        return Network;
      case "security":
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const handleAcknowledge = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: "acknowledged" as const } : alert
    ));
  };

  const handleResolve = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: "resolved" as const } : alert
    ));
  };

  const handleDismiss = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const activeCount = alerts.filter(a => a.status === "active").length;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Active Alerts</h3>
            <p className="text-sm text-gray-400">{activeCount} requiring attention</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 rounded-lg text-xs font-medium">
            All ({alerts.length})
          </button>
          <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-xs font-medium">
            Active ({activeCount})
          </button>
          <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-xs font-medium">
            Critical ({alerts.filter(a => a.severity === "critical").length})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {alerts.map((alert) => {
          const CategoryIcon = getCategoryIcon(alert.category);
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all ${getSeverityColor(alert.severity)} ${
                alert.status === "resolved" ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  alert.severity === "critical" ? "bg-red-500/20" :
                  alert.severity === "high" ? "bg-orange-500/20" :
                  alert.severity === "medium" ? "bg-yellow-500/20" :
                  "bg-blue-500/20"
                }`}>
                  <CategoryIcon className={`w-5 h-5 ${
                    alert.severity === "critical" ? "text-red-400" :
                    alert.severity === "high" ? "text-orange-400" :
                    alert.severity === "medium" ? "text-yellow-400" :
                    "text-blue-400"
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        {alert.status === "acknowledged" && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-400/30 rounded text-xs font-medium">
                            ACK
                          </span>
                        )}
                        {alert.status === "resolved" && (
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-400/30 rounded text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            RESOLVED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{alert.description}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400">Current Value</p>
                      <p className="text-sm font-bold text-white">{alert.value}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Threshold</p>
                      <p className="text-sm font-bold text-orange-400">{alert.threshold}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {alert.triggered}
                    </div>

                    {alert.status === "active" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded text-xs font-medium transition-all"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded text-xs font-medium transition-all"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
