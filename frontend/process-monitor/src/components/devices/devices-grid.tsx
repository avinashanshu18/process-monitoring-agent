"use client";

import { useState } from "react";
import { Monitor, Laptop, Smartphone, Server, Search, MoreVertical, Power, Settings, Activity, AlertCircle, CheckCircle, WifiOff } from "lucide-react";

interface Device {
  id: number;
  name: string;
  type: "desktop" | "laptop" | "mobile" | "server";
  status: "online" | "warning" | "offline";
  os: string;
  ip: string;
  cpu: number;
  memory: number;
  uptime: string;
  lastSeen: string;
  location: string;
}

export function DevicesGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [devices] = useState<Device[]>([
    {
      id: 1,
      name: "Main Workstation",
      type: "desktop",
      status: "online",
      os: "Windows 11 Pro",
      ip: "192.168.1.105",
      cpu: 45,
      memory: 62,
      uptime: "5 days 12h",
      lastSeen: "Active now",
      location: "Office - Desk 1",
    },
    {
      id: 2,
      name: "Development Laptop",
      type: "laptop",
      status: "online",
      os: "Ubuntu 22.04",
      ip: "192.168.1.127",
      cpu: 38,
      memory: 55,
      uptime: "2 days 8h",
      lastSeen: "Active now",
      location: "Home Office",
    },
    {
      id: 3,
      name: "Production Server",
      type: "server",
      status: "online",
      os: "CentOS 8",
      ip: "192.168.1.200",
      cpu: 72,
      memory: 85,
      uptime: "45 days 3h",
      lastSeen: "Active now",
      location: "Data Center",
    },
    {
      id: 4,
      name: "Testing Machine",
      type: "desktop",
      status: "warning",
      os: "Windows 10 Pro",
      ip: "192.168.1.110",
      cpu: 88,
      memory: 92,
      uptime: "12 days 4h",
      lastSeen: "2 minutes ago",
      location: "Office - Desk 3",
    },
    {
      id: 5,
      name: "Mobile Device",
      type: "mobile",
      status: "online",
      os: "Android 14",
      ip: "192.168.1.145",
      cpu: 25,
      memory: 48,
      uptime: "8 days 1h",
      lastSeen: "5 minutes ago",
      location: "Mobile",
    },
    {
      id: 6,
      name: "Backup Server",
      type: "server",
      status: "offline",
      os: "Debian 11",
      ip: "192.168.1.201",
      cpu: 0,
      memory: 0,
      uptime: "N/A",
      lastSeen: "2 hours ago",
      location: "Data Center",
    },
  ]);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.includes(searchTerm) ||
      device.os.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || device.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop":
        return Monitor;
      case "laptop":
        return Laptop;
      case "mobile":
        return Smartphone;
      case "server":
        return Server;
      default:
        return Monitor;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "offline":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return CheckCircle;
      case "warning":
        return AlertCircle;
      case "offline":
        return WifiOff;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Connected Devices</h3>
            <p className="text-sm text-gray-400">{filteredDevices.length} devices</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "online", "warning", "offline"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === status
                ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== "all" && (
              <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-xs">
                {devices.filter(d => d.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const DeviceIcon = getDeviceIcon(device.type);
          const StatusIcon = getStatusIcon(device.status);
          
          return (
            <div
              key={device.id}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                    device.status === "online" ? "from-green-500 to-teal-500" :
                    device.status === "warning" ? "from-yellow-500 to-orange-500" :
                    "from-gray-500 to-gray-600"
                  } flex items-center justify-center`}>
                    <DeviceIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{device.name}</h4>
                    <p className="text-xs text-gray-400">{device.os}</p>
                  </div>
                </div>

                <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Status */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border mb-4 ${getStatusColor(device.status)}`}>
                <StatusIcon className="w-3 h-3" />
                {device.status}
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">CPU</span>
                    <span className="text-white font-bold">{device.cpu}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        device.cpu > 80 ? "bg-red-500" :
                        device.cpu > 60 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                      style={{ width: `${device.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Memory</span>
                    <span className="text-white font-bold">{device.memory}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        device.memory > 80 ? "bg-red-500" :
                        device.memory > 60 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                      style={{ width: `${device.memory}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div>
                  <p className="text-gray-400">IP Address</p>
                  <p className="text-white font-mono">{device.ip}</p>
                </div>
                <div>
                  <p className="text-gray-400">Uptime</p>
                  <p className="text-white">{device.uptime}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  <Activity className="w-3 h-3 inline mr-1" />
                  {device.lastSeen}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Settings">
                    <Settings className="w-3 h-3" />
                  </button>
                  <button className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 transition-all" title="Remote Access">
                    <Power className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDevices.length === 0 && (
        <div className="py-12 text-center">
          <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No devices found</p>
        </div>
      )}
    </div>
  );
}
