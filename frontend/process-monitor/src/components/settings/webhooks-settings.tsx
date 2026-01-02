"use client";

import { useState } from "react";
import { Webhook, Plus, Play, Pause, Trash2, Edit, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface WebhookConfig {
  id: number;
  name: string;
  url: string;
  events: string[];
  status: "active" | "paused" | "failed";
  created: string;
  lastTriggered: string;
  successRate: number;
  totalCalls: number;
}

export function WebhooksSettings() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: 1,
      name: "Alert Notifications",
      url: "https://api.slack.com/webhooks/T123/B456/xyz789",
      events: ["alert.created", "alert.resolved"],
      status: "active",
      created: "2024-11-15",
      lastTriggered: "5 minutes ago",
      successRate: 99.5,
      totalCalls: 1247,
    },
    {
      id: 2,
      name: "Process Monitor",
      url: "https://hooks.example.com/process-events",
      events: ["process.started", "process.stopped", "process.crashed"],
      status: "active",
      created: "2024-10-20",
      lastTriggered: "2 hours ago",
      successRate: 98.2,
      totalCalls: 856,
    },
    {
      id: 3,
      name: "Security Events",
      url: "https://api.example.com/security/webhook",
      events: ["security.threat", "security.scan"],
      status: "failed",
      created: "2024-09-10",
      lastTriggered: "3 days ago",
      successRate: 45.3,
      totalCalls: 234,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const availableEvents = [
    { id: "alert.created", name: "Alert Created", category: "Alerts" },
    { id: "alert.resolved", name: "Alert Resolved", category: "Alerts" },
    { id: "alert.acknowledged", name: "Alert Acknowledged", category: "Alerts" },
    { id: "process.started", name: "Process Started", category: "Processes" },
    { id: "process.stopped", name: "Process Stopped", category: "Processes" },
    { id: "process.crashed", name: "Process Crashed", category: "Processes" },
    { id: "security.threat", name: "Security Threat Detected", category: "Security" },
    { id: "security.scan", name: "Security Scan Completed", category: "Security" },
    { id: "system.cpu", name: "High CPU Usage", category: "System" },
    { id: "system.memory", name: "Low Memory", category: "System" },
    { id: "network.spike", name: "Network Spike", category: "Network" },
  ];

  const toggleWebhook = (id: number) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === "active" ? "paused" as const : "active" as const }
        : webhook
    ));
  };

  const deleteWebhook = (id: number) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    }
  };

  const testWebhook = (id: number) => {
    alert(`Testing webhook ${id}... Check your endpoint for the test payload.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-400/30";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-400/30";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-400/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle;
      case "paused":
        return AlertCircle;
      case "failed":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Webhooks</h3>
              <p className="text-sm text-gray-400">
                Configure webhooks to receive real-time event notifications
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Webhook
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass rounded-xl p-4 border border-cyan-400/30 bg-cyan-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-cyan-400 mb-1">Webhook Security</p>
            <p className="text-xs text-gray-400">
              All webhook payloads are signed with a secret key. Verify the signature to ensure authenticity.
              Failed webhooks will be retried up to 3 times with exponential backoff.
            </p>
          </div>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => {
          const StatusIcon = getStatusIcon(webhook.status);
          return (
            <div
              key={webhook.id}
              className="glass rounded-xl p-6 border border-white/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base font-bold text-white">{webhook.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(webhook.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {webhook.status}
                    </span>
                  </div>

                  {/* URL */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Endpoint URL</p>
                    <code className="block px-3 py-2 bg-black/30 rounded font-mono text-sm text-cyan-400 border border-white/10 truncate">
                      {webhook.url}
                    </code>
                  </div>

                  {/* Events */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Subscribed Events</p>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-400/30 rounded text-xs font-mono"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Total Calls</p>
                      <p className="text-lg font-bold text-white">{webhook.totalCalls.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Success Rate</p>
                      <p className={`text-lg font-bold ${
                        webhook.successRate >= 95 ? "text-green-400" :
                        webhook.successRate >= 80 ? "text-yellow-400" :
                        "text-red-400"
                      }`}>
                        {webhook.successRate}%
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Created</p>
                      <p className="text-sm font-medium text-white">{webhook.created}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Last Triggered</p>
                      <p className="text-sm font-medium text-white">{webhook.lastTriggered}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => testWebhook(webhook.id)}
                  className="flex-1 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  Test
                </button>

                <button
                  onClick={() => toggleWebhook(webhook.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    webhook.status === "active"
                      ? "bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-400/30 text-yellow-400"
                      : "bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400"
                  }`}
                >
                  {webhook.status === "active" ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>

                <button className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Events */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Available Events</h4>
        <div className="space-y-4">
          {["Alerts", "Processes", "Security", "System", "Network"].map((category) => (
            <div key={category}>
              <p className="text-xs font-medium text-gray-400 mb-2">{category}</p>
              <div className="flex flex-wrap gap-2">
                {availableEvents
                  .filter((event) => event.category === category)
                  .map((event) => (
                    <span
                      key={event.id}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {event.name}
                      <code className="ml-2 text-cyan-400 font-mono">{event.id}</code>
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payload Example */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Example Webhook Payload</h4>
        <pre className="p-4 bg-black/30 rounded-lg border border-white/10 overflow-x-auto text-xs text-cyan-400 font-mono">
{`{
  "event": "alert.created",
  "timestamp": "2025-12-09T11:40:00Z",
  "data": {
    "alert_id": "alert_123456",
    "severity": "critical",
    "title": "High CPU Usage",
    "description": "CPU usage exceeded 85% threshold",
    "value": "92%",
    "threshold": "85%",
    "device": "My Desktop",
    "triggered_at": "2025-12-09T11:39:45Z"
  },
  "signature": "sha256=abc123def456..."
}`}
        </pre>

        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Verify Signature</p>
          <code className="text-xs text-cyan-400 font-mono">
            HMAC-SHA256(payload, webhook_secret)
          </code>
        </div>
      </div>

      {/* Webhook Logs */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Recent Webhook Deliveries</h4>
        <div className="space-y-2">
          {[
            { time: "2 min ago", event: "alert.created", status: "success", code: 200 },
            { time: "15 min ago", event: "process.stopped", status: "success", code: 200 },
            { time: "1 hour ago", event: "security.scan", status: "failed", code: 500 },
            { time: "2 hours ago", event: "alert.resolved", status: "success", code: 200 },
          ].map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                {log.status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <code className="text-sm font-mono text-purple-400">{log.event}</code>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{log.time}</span>
                <span className={`font-mono ${
                  log.status === "success" ? "text-green-400" : "text-red-400"
                }`}>
                  {log.code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
