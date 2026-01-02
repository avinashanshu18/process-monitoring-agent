"use client";

import { useState } from "react";
import { Box, Cpu, MemoryStick, Network, HardDrive, Shield, Activity, BarChart3, PieChart, LineChart, AlertCircle, Users, Server, Search } from "lucide-react";

interface Widget {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  size: "small" | "medium" | "large";
}

export function WidgetLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const widgets: Widget[] = [
    {
      id: "cpu-usage",
      name: "CPU Usage",
      description: "Real-time CPU utilization",
      category: "metrics",
      icon: Cpu,
      color: "from-blue-500 to-cyan-500",
      size: "medium",
    },
    {
      id: "memory-usage",
      name: "Memory Usage",
      description: "RAM consumption monitor",
      category: "metrics",
      icon: MemoryStick,
      color: "from-purple-500 to-pink-500",
      size: "medium",
    },
    {
      id: "network-traffic",
      name: "Network Traffic",
      description: "Incoming/outgoing bandwidth",
      category: "metrics",
      icon: Network,
      color: "from-green-500 to-teal-500",
      size: "large",
    },
    {
      id: "disk-usage",
      name: "Disk Usage",
      description: "Storage capacity overview",
      category: "metrics",
      icon: HardDrive,
      color: "from-orange-500 to-red-500",
      size: "medium",
    },
    {
      id: "security-alerts",
      name: "Security Alerts",
      description: "Recent security events",
      category: "security",
      icon: Shield,
      color: "from-red-500 to-orange-500",
      size: "small",
    },
    {
      id: "active-alerts",
      name: "Active Alerts",
      description: "Current system alerts",
      category: "alerts",
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      size: "small",
    },
    {
      id: "system-health",
      name: "System Health",
      description: "Overall health score",
      category: "charts",
      icon: Activity,
      color: "from-cyan-500 to-blue-500",
      size: "medium",
    },
    {
      id: "performance-chart",
      name: "Performance Chart",
      description: "Historical performance trends",
      category: "charts",
      icon: LineChart,
      color: "from-blue-500 to-purple-500",
      size: "large",
    },
    {
      id: "resource-breakdown",
      name: "Resource Breakdown",
      description: "Resource usage distribution",
      category: "charts",
      icon: PieChart,
      color: "from-green-500 to-cyan-500",
      size: "medium",
    },
    {
      id: "statistics",
      name: "Statistics",
      description: "Key performance indicators",
      category: "charts",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500",
      size: "small",
    },
    {
      id: "active-users",
      name: "Active Users",
      description: "Currently logged in users",
      category: "users",
      icon: Users,
      color: "from-cyan-500 to-teal-500",
      size: "small",
    },
    {
      id: "device-status",
      name: "Device Status",
      description: "Connected devices overview",
      category: "devices",
      icon: Server,
      color: "from-orange-500 to-red-500",
      size: "medium",
    },
  ];

  const categories = [
    { id: "all", name: "All Widgets" },
    { id: "metrics", name: "Metrics" },
    { id: "charts", name: "Charts" },
    { id: "alerts", name: "Alerts" },
    { id: "security", name: "Security" },
    { id: "users", name: "Users" },
    { id: "devices", name: "Devices" },
  ];

  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || widget.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Widget Library</h3>
          <p className="text-sm text-gray-400">{filteredWidgets.length} available widgets</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search widgets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFilterCategory(category.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterCategory === category.id
                ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredWidgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <div
              key={widget.id}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-move group"
              draggable
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white">{widget.name}</h4>
                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400 capitalize">
                      {widget.size}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{widget.description}</p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded text-xs font-medium transition-all">
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredWidgets.length === 0 && (
        <div className="py-12 text-center">
          <Box className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No widgets found</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-purple-500/5 border border-purple-400/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Box className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-400 mb-1">How to Use</p>
            <p className="text-xs text-gray-400">
              Drag widgets from this library to the dashboard canvas to add them. 
              You can resize and rearrange widgets after adding them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
