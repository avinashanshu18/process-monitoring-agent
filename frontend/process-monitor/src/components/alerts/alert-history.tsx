"use client";

import { useState } from "react";
import { History, Search, Download, Filter, Calendar, TrendingUp } from "lucide-react";

interface HistoricalAlert {
  id: number;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  triggered: string;
  resolved: string;
  duration: string;
  resolvedBy: string;
  category: string;
}

export function AlertHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("7d");

  const history: HistoricalAlert[] = [
    {
      id: 1,
      title: "High CPU Usage",
      severity: "critical",
      triggered: "2025-12-09 10:30:15",
      resolved: "2025-12-09 10:45:22",
      duration: "15m 7s",
      resolvedBy: "Auto-resolved",
      category: "Performance",
    },
    {
      id: 2,
      title: "Memory Warning",
      severity: "high",
      triggered: "2025-12-09 09:15:42",
      resolved: "2025-12-09 09:28:11",
      duration: "12m 29s",
      resolvedBy: "Admin",
      category: "Memory",
    },
    {
      id: 3,
      title: "Disk Space Low",
      severity: "medium",
      triggered: "2025-12-09 08:45:33",
      resolved: "2025-12-09 11:20:45",
      duration: "2h 35m",
      resolvedBy: "Admin",
      category: "Storage",
    },
    {
      id: 4,
      title: "Security Scan Alert",
      severity: "critical",
      triggered: "2025-12-09 07:22:18",
      resolved: "2025-12-09 07:25:42",
      duration: "3m 24s",
      resolvedBy: "System",
      category: "Security",
    },
    {
      id: 5,
      title: "Network Spike",
      severity: "high",
      triggered: "2025-12-09 06:10:55",
      resolved: "2025-12-09 06:15:33",
      duration: "4m 38s",
      resolvedBy: "Auto-resolved",
      category: "Network",
    },
    {
      id: 6,
      title: "Temperature Warning",
      severity: "medium",
      triggered: "2025-12-08 23:45:12",
      resolved: "2025-12-08 23:52:08",
      duration: "6m 56s",
      resolvedBy: "System",
      category: "Hardware",
    },
    {
      id: 7,
      title: "Failed Login Attempts",
      severity: "low",
      triggered: "2025-12-08 22:30:45",
      resolved: "2025-12-08 22:31:22",
      duration: "37s",
      resolvedBy: "Auto-resolved",
      category: "Security",
    },
    {
      id: 8,
      title: "Process Crash Detected",
      severity: "critical",
      triggered: "2025-12-08 20:15:33",
      resolved: "2025-12-08 20:18:42",
      duration: "3m 9s",
      resolvedBy: "Admin",
      category: "Application",
    },
    {
      id: 9,
      title: "High Latency",
      severity: "medium",
      triggered: "2025-12-08 18:42:11",
      resolved: "2025-12-08 18:55:28",
      duration: "13m 17s",
      resolvedBy: "Auto-resolved",
      category: "Network",
    },
    {
      id: 10,
      title: "Database Connection Error",
      severity: "high",
      triggered: "2025-12-08 16:20:05",
      resolved: "2025-12-08 16:22:48",
      duration: "2m 43s",
      resolvedBy: "Admin",
      category: "Database",
    },
  ];

  const filteredHistory = history.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.resolvedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    
    return matchesSearch && matchesSeverity;
  });

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

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Severity,Category,Triggered,Resolved,Duration,Resolved By\n" +
      filteredHistory.map(alert => 
        `"${alert.title}",${alert.severity},${alert.category},${alert.triggered},${alert.resolved},${alert.duration},${alert.resolvedBy}`
      ).join("\n");
    
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `alert-history-${new Date().toISOString()}.csv`;
    link.click();
  };

  // Calculate statistics
  const avgResolutionTime = "8m 42s";
  const totalResolved = history.length;
  const criticalCount = history.filter(a => a.severity === "critical").length;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Alert History</h3>
            <p className="text-sm text-gray-400">{filteredHistory.length} resolved alerts</p>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Total Resolved</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalResolved}</p>
          <p className="text-xs text-green-400 mt-1">Last 7 days</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Avg Resolution Time</p>
          </div>
          <p className="text-2xl font-bold text-white">{avgResolutionTime}</p>
          <p className="text-xs text-blue-400 mt-1">-2m improvement</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-red-400" />
            <p className="text-xs text-gray-400">Critical Alerts</p>
          </div>
          <p className="text-2xl font-bold text-white">{criticalCount}</p>
          <p className="text-xs text-red-400 mt-1">{((criticalCount / totalResolved) * 100).toFixed(1)}% of total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Time Range */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Alert</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Triggered</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Resolved By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredHistory.map((alert) => (
              <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-white">{alert.title}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-400">{alert.category}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-400 font-mono">{alert.triggered}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-white">{alert.duration}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-400">{alert.resolvedBy}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">{filteredHistory.length}</span> of{" "}
          <span className="text-white font-medium">{history.length}</span> alerts
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-gray-400 hover:text-white transition-all">
            Previous
          </button>
          <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded text-sm text-cyan-400">
            1
          </button>
          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-gray-400 hover:text-white transition-all">
            2
          </button>
          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-gray-400 hover:text-white transition-all">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
