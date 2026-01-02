"use client";

import { useState } from "react";
import { AlertTriangle, Shield, Bug, X, CheckCircle } from "lucide-react";

interface Threat {
  id: number;
  type: "malware" | "suspicious" | "vulnerability" | "breach";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  detected: string;
  status: "active" | "quarantined" | "resolved";
}

export function ThreatDetection() {
  const [threats, setThreats] = useState<Threat[]>([
    {
      id: 1,
      type: "suspicious",
      severity: "high",
      title: "Suspicious Process Detected",
      description: "Unknown process attempting network access",
      detected: "2 minutes ago",
      status: "active",
    },
    {
      id: 2,
      type: "vulnerability",
      severity: "medium",
      title: "Outdated Software",
      description: "Adobe Reader requires security update",
      detected: "1 hour ago",
      status: "active",
    },
    {
      id: 3,
      type: "malware",
      severity: "critical",
      title: "Malware Quarantined",
      description: "Trojan.Win32.Generic detected and isolated",
      detected: "3 hours ago",
      status: "quarantined",
    },
    {
      id: 4,
      type: "breach",
      severity: "low",
      title: "Failed Login Attempt",
      description: "Multiple failed SSH login attempts from 192.168.1.50",
      detected: "5 hours ago",
      status: "resolved",
    },
  ]);

  const getSeverityColor = (severity: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "malware":
        return Bug;
      case "breach":
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  const handleResolve = (id: number) => {
    setThreats(threats.map(t => 
      t.id === id ? { ...t, status: "resolved" as const } : t
    ));
  };

  const handleDismiss = (id: number) => {
    setThreats(threats.filter(t => t.id !== id));
  };

  const activeThreats = threats.filter(t => t.status === "active");

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Threat Detection</h3>
            <p className="text-sm text-gray-400">{activeThreats.length} active threats</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white rounded-lg text-sm font-medium transition-all">
          Run Full Scan
        </button>
      </div>

      {/* Threats List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {threats.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-400 font-medium">No threats detected</p>
            <p className="text-gray-400 text-sm mt-1">Your system is secure</p>
          </div>
        ) : (
          threats.map((threat) => {
            const TypeIcon = getTypeIcon(threat.type);
            return (
              <div
                key={threat.id}
                className={`p-4 rounded-lg border transition-all ${
                  threat.status === "active"
                    ? "bg-red-500/5 border-red-400/20"
                    : threat.status === "quarantined"
                    ? "bg-yellow-500/5 border-yellow-400/20"
                    : "bg-green-500/5 border-green-400/20 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    threat.status === "active" ? "bg-red-500/20" :
                    threat.status === "quarantined" ? "bg-yellow-500/20" :
                    "bg-green-500/20"
                  }`}>
                    <TypeIcon className={`w-5 h-5 ${
                      threat.status === "active" ? "text-red-400" :
                      threat.status === "quarantined" ? "text-yellow-400" :
                      "text-green-400"
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{threat.title}</h4>
                        <p className="text-xs text-gray-400">{threat.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${getSeverityColor(threat.severity)}`}>
                        {threat.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <span className="text-xs text-gray-400">{threat.detected}</span>
                      
                      {threat.status === "active" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolve(threat.id)}
                            className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded text-xs font-medium transition-all"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleDismiss(threat.id)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded text-xs font-medium transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                      
                      {threat.status === "resolved" && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{activeThreats.length}</p>
          <p className="text-xs text-gray-400 mt-1">Active</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {threats.filter(t => t.status === "quarantined").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Quarantined</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {threats.filter(t => t.status === "resolved").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Resolved</p>
        </div>
      </div>
    </div>
  );
}
