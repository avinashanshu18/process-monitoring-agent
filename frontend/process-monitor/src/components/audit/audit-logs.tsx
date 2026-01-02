"use client";

import { useState } from "react";
import { FileText, User, Settings, Shield, Database, Server, Download, Eye, ChevronDown } from "lucide-react";

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  category: "user" | "system" | "security" | "data" | "settings";
  status: "success" | "failed" | "warning";
  ip: string;
  details: string;
  metadata?: Record<string, any>;
}

export function AuditLogs() {
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const logs: AuditLog[] = [
    {
      id: 1,
      timestamp: "2024-12-09 16:45:23",
      user: "Avinash Kumar",
      action: "Dashboard Created",
      resource: "Custom Dashboard: Production Overview",
      category: "user",
      status: "success",
      ip: "192.168.1.105",
      details: "Created new custom dashboard with 8 widgets",
      metadata: {
        dashboardId: "dash_123",
        widgetCount: 8,
        isPublic: false,
      },
    },
    {
      id: 2,
      timestamp: "2024-12-09 16:42:15",
      user: "Sarah Johnson",
      action: "User Role Updated",
      resource: "User: Mike Chen",
      category: "security",
      status: "success",
      ip: "192.168.1.127",
      details: "Changed role from Viewer to User",
      metadata: {
        previousRole: "Viewer",
        newRole: "User",
        userId: "user_456",
      },
    },
    {
      id: 3,
      timestamp: "2024-12-09 16:38:42",
      user: "System",
      action: "Automatic Backup",
      resource: "Database: production_db",
      category: "system",
      status: "success",
      ip: "127.0.0.1",
      details: "Scheduled database backup completed successfully",
      metadata: {
        backupSize: "2.4 GB",
        duration: "3m 24s",
      },
    },
    {
      id: 4,
      timestamp: "2024-12-09 16:35:10",
      user: "Mike Chen",
      action: "Login Failed",
      resource: "Authentication",
      category: "security",
      status: "failed",
      ip: "192.168.1.142",
      details: "Invalid password attempt",
      metadata: {
        attempts: 3,
        lockout: false,
      },
    },
    {
      id: 5,
      timestamp: "2024-12-09 16:30:05",
      user: "Avinash Kumar",
      action: "Settings Modified",
      resource: "System Settings",
      category: "settings",
      status: "success",
      ip: "192.168.1.105",
      details: "Updated alert threshold values",
      metadata: {
        setting: "cpu_alert_threshold",
        oldValue: "80",
        newValue: "85",
      },
    },
    {
      id: 6,
      timestamp: "2024-12-09 16:25:33",
      user: "System",
      action: "Security Scan",
      resource: "All Systems",
      category: "security",
      status: "warning",
      ip: "127.0.0.1",
      details: "Vulnerability scan found 3 medium-risk issues",
      metadata: {
        issuesFound: 3,
        severity: "medium",
      },
    },
    {
      id: 7,
      timestamp: "2024-12-09 16:20:18",
      user: "Emily Davis",
      action: "Data Export",
      resource: "Performance Report",
      category: "data",
      status: "success",
      ip: "192.168.1.156",
      details: "Exported 30-day performance data as CSV",
      metadata: {
        format: "CSV",
        recordCount: 43200,
        fileSize: "856 KB",
      },
    },
    {
      id: 8,
      timestamp: "2024-12-09 16:15:47",
      user: "System",
      action: "Server Restart",
      resource: "Web Server",
      category: "system",
      status: "success",
      ip: "127.0.0.1",
      details: "Scheduled maintenance restart completed",
      metadata: {
        downtime: "12s",
        version: "2.4.1",
      },
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "user":
        return User;
      case "system":
        return Server;
      case "security":
        return Shield;
      case "data":
        return Database;
      case "settings":
        return Settings;
      default:
        return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "user":
        return "text-blue-400 bg-blue-500/10";
      case "system":
        return "text-purple-400 bg-purple-500/10";
      case "security":
        return "text-red-400 bg-red-500/10";
      case "data":
        return "text-green-400 bg-green-500/10";
      case "settings":
        return "text-orange-400 bg-orange-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      case "failed":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Activity Log</h3>
            <p className="text-sm text-gray-400">Recent system events</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Logs List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {logs.map((log) => {
          const CategoryIcon = getCategoryIcon(log.category);
          const isExpanded = expandedLog === log.id;

          return (
            <div
              key={log.id}
              className="bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all overflow-hidden"
            >
              {/* Log Header */}
              <button
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor(log.category)}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{log.action}</h4>
                        <p className="text-xs text-gray-400">{log.resource}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user}
                      </span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-white/[0.02]">
                  <div className="space-y-3">
                    {/* Details */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Details</p>
                      <p className="text-sm text-white">{log.details}</p>
                    </div>

                    {/* Metadata */}
                    {log.metadata && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Metadata</p>
                        <div className="p-3 bg-black/30 rounded-lg font-mono text-xs">
                          <pre className="text-cyan-400 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded text-xs font-medium transition-all flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View Full Log
                      </button>
                      <button className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded text-xs font-medium transition-all flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Export Entry
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">1-8</span> of{" "}
          <span className="text-white font-medium">12,847</span> events
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded text-sm transition-all">
            Previous
          </button>
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded text-sm transition-all">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
