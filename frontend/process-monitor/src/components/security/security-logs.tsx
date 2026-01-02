"use client";

import { useState } from "react";
import { FileText, Filter, Download, Search, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface SecurityLog {
  id: number;
  timestamp: string;
  type: "info" | "warning" | "error" | "success";
  category: "firewall" | "authentication" | "malware" | "system";
  event: string;
  details: string;
  source: string;
}

export function SecurityLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const logs: SecurityLog[] = [
    {
      id: 1,
      timestamp: "2025-12-09 11:28:42",
      type: "error",
      category: "firewall",
      event: "Blocked Connection Attempt",
      details: "Incoming connection from 192.168.1.50 blocked on port 22",
      source: "Windows Firewall",
    },
    {
      id: 2,
      timestamp: "2025-12-09 11:25:15",
      type: "warning",
      category: "authentication",
      event: "Failed Login Attempt",
      details: "3 failed login attempts from user 'admin'",
      source: "Windows Security",
    },
    {
      id: 3,
      timestamp: "2025-12-09 11:20:33",
      type: "success",
      category: "malware",
      event: "Malware Quarantined",
      details: "Trojan.Win32.Generic successfully isolated",
      source: "Windows Defender",
    },
    {
      id: 4,
      timestamp: "2025-12-09 11:15:07",
      type: "info",
      category: "system",
      event: "Security Scan Completed",
      details: "Full system scan finished. No threats found.",
      source: "Security Center",
    },
    {
      id: 5,
      timestamp: "2025-12-09 11:10:28",
      type: "error",
      category: "firewall",
      event: "Port Scan Detected",
      details: "Port scanning activity detected from 203.0.113.45",
      source: "IDS/IPS",
    },
    {
      id: 6,
      timestamp: "2025-12-09 11:05:19",
      type: "success",
      category: "authentication",
      event: "Successful Login",
      details: "User 'avinash' logged in successfully",
      source: "Windows Security",
    },
    {
      id: 7,
      timestamp: "2025-12-09 11:00:42",
      type: "warning",
      category: "system",
      event: "Outdated Software Detected",
      details: "Adobe Reader requires security update",
      source: "Update Manager",
    },
    {
      id: 8,
      timestamp: "2025-12-09 10:55:31",
      type: "info",
      category: "firewall",
      event: "Rule Updated",
      details: "Firewall rule 'HTTP' configuration changed",
      source: "Windows Firewall",
    },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesCategory = filterCategory === "all" || log.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return XCircle;
      case "warning":
        return AlertTriangle;
      case "success":
        return CheckCircle;
      case "info":
      default:
        return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-400 bg-red-500/10";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10";
      case "success":
        return "text-green-400 bg-green-500/10";
      case "info":
      default:
        return "text-blue-400 bg-blue-500/10";
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      firewall: "bg-orange-500/10 text-orange-400 border-orange-400/30",
      authentication: "bg-purple-500/10 text-purple-400 border-purple-400/30",
      malware: "bg-red-500/10 text-red-400 border-red-400/30",
      system: "bg-blue-500/10 text-blue-400 border-blue-400/30",
    };
    return colors[category as keyof typeof colors] || colors.system;
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Type,Category,Event,Details,Source\n" +
      filteredLogs.map(log => 
        `${log.timestamp},${log.type},${log.category},"${log.event}","${log.details}",${log.source}`
      ).join("\n");
    
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `security-logs-${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Security Logs</h3>
            <p className="text-sm text-gray-400">{filteredLogs.length} events</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="all">All Types</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
          <option value="info">Info</option>
        </select>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="all">All Categories</option>
          <option value="firewall">Firewall</option>
          <option value="authentication">Authentication</option>
          <option value="malware">Malware</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const TypeIcon = getTypeIcon(log.type);
            return (
              <div
                key={log.id}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(log.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">{log.event}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryBadge(log.category)}`}>
                            {log.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{log.details}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="font-mono">{log.timestamp}</span>
                        <span>•</span>
                        <span>{log.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">
            {logs.filter(l => l.type === "error").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Errors</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {logs.filter(l => l.type === "warning").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Warnings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {logs.filter(l => l.type === "success").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Success</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            {logs.filter(l => l.type === "info").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Info</p>
        </div>
      </div>
    </div>
  );
}
