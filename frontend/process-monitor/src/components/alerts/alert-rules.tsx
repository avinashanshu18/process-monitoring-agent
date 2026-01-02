"use client";

import { useState } from "react";
import { Sliders, Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";

interface AlertRule {
  id: number;
  name: string;
  metric: string;
  condition: string;
  threshold: string;
  duration: string;
  severity: "critical" | "high" | "medium" | "low";
  enabled: boolean;
  actions: string[];
}

export function AlertRules() {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: 1,
      name: "High CPU Usage",
      metric: "CPU",
      condition: "greater than",
      threshold: "85%",
      duration: "5 minutes",
      severity: "critical",
      enabled: true,
      actions: ["Email", "Slack"],
    },
    {
      id: 2,
      name: "Low Memory",
      metric: "Memory",
      condition: "less than",
      threshold: "2 GB",
      duration: "2 minutes",
      severity: "high",
      enabled: true,
      actions: ["Email"],
    },
    {
      id: 3,
      name: "Disk Space Warning",
      metric: "Disk",
      condition: "less than",
      threshold: "10%",
      duration: "1 hour",
      severity: "medium",
      enabled: true,
      actions: ["Email", "Webhook"],
    },
    {
      id: 4,
      name: "Network Spike",
      metric: "Network",
      condition: "greater than",
      threshold: "100 MB/s",
      duration: "30 seconds",
      severity: "high",
      enabled: false,
      actions: ["Slack"],
    },
    {
      id: 5,
      name: "Process Crash",
      metric: "Process",
      condition: "equals",
      threshold: "0 (stopped)",
      duration: "instant",
      severity: "critical",
      enabled: true,
      actions: ["Email", "SMS", "Slack"],
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

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

  const toggleRule = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (id: number) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      setRules(rules.filter(rule => rule.id !== id));
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Alert Rules</h3>
            <p className="text-sm text-gray-400">{rules.filter(r => r.enabled).length} active rules</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-lg border transition-all ${
              rule.enabled 
                ? "bg-white/5 border-white/10" 
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Toggle Switch */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 mt-1 ${
                  rule.enabled ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  rule.enabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(rule.severity)}`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {rule.metric} {rule.condition} {rule.threshold} for {rule.duration}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Notify via:</span>
                  {rule.actions.map((action, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 rounded text-xs"
                    >
                      {action}
                    </span>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <button className="flex-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded text-xs font-medium transition-all flex items-center justify-center gap-1">
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="flex-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded text-xs font-medium transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Power className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Enabled</p>
          </div>
          <p className="text-xl font-bold text-green-400">
            {rules.filter(r => r.enabled).length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <PowerOff className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-400">Disabled</p>
          </div>
          <p className="text-xl font-bold text-gray-400">
            {rules.filter(r => !r.enabled).length}
          </p>
        </div>
      </div>
    </div>
  );
}
