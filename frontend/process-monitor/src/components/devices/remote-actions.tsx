"use client";

import { useState } from "react";
import { Zap, Power, RotateCw, Terminal, Download, Upload, AlertCircle, CheckCircle } from "lucide-react";

export function RemoteActions() {
  const [selectedDevice, setSelectedDevice] = useState("main-workstation");
  const [actionResult, setActionResult] = useState<{ type: string; message: string } | null>(null);

  const devices = [
    { id: "main-workstation", name: "Main Workstation", status: "online" },
    { id: "dev-laptop", name: "Development Laptop", status: "online" },
    { id: "prod-server", name: "Production Server", status: "online" },
    { id: "test-machine", name: "Testing Machine", status: "warning" },
  ];

  const actions = [
    {
      id: "restart",
      name: "Restart Device",
      description: "Safely restart the device",
      icon: RotateCw,
      color: "from-blue-500 to-cyan-500",
      danger: false,
    },
    {
      id: "shutdown",
      name: "Shutdown",
      description: "Power off the device",
      icon: Power,
      color: "from-orange-500 to-red-500",
      danger: true,
    },
    {
      id: "terminal",
      name: "Remote Terminal",
      description: "Open remote shell access",
      icon: Terminal,
      color: "from-purple-500 to-pink-500",
      danger: false,
    },
    {
      id: "update",
      name: "Update Software",
      description: "Install pending updates",
      icon: Download,
      color: "from-green-500 to-teal-500",
      danger: false,
    },
  ];

  const handleAction = (actionId: string, actionName: string) => {
    const device = devices.find(d => d.id === selectedDevice);
    
    if (actionId === "shutdown" || actionId === "restart") {
      if (!confirm(`Are you sure you want to ${actionName.toLowerCase()} ${device?.name}?`)) {
        return;
      }
    }

    // Simulate action
    setActionResult({ type: "success", message: `${actionName} initiated on ${device?.name}` });
    setTimeout(() => setActionResult(null), 5000);
  };

  const recentActions = [
    {
      id: 1,
      action: "Restart Device",
      device: "Main Workstation",
      time: "5 minutes ago",
      status: "success",
    },
    {
      id: 2,
      action: "Update Software",
      device: "Development Laptop",
      time: "1 hour ago",
      status: "success",
    },
    {
      id: 3,
      action: "Remote Terminal",
      device: "Production Server",
      time: "3 hours ago",
      status: "success",
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Remote Actions</h3>
          <p className="text-sm text-gray-400">Execute commands remotely</p>
        </div>
      </div>

      {/* Device Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">Target Device</label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.status})
            </option>
          ))}
        </select>
      </div>

      {/* Action Result */}
      {actionResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          actionResult.type === "success"
            ? "bg-green-500/5 border-green-400/20"
            : "bg-red-500/5 border-red-400/20"
        }`}>
          <div className="flex items-start gap-3">
            {actionResult.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              actionResult.type === "success" ? "text-green-400" : "text-red-400"
            }`}>
              {actionResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id, action.name)}
              className={`p-4 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                action.danger
                  ? "border-red-400/30 bg-red-500/5 hover:bg-red-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{action.name}</h4>
              <p className="text-xs text-gray-400">{action.description}</p>
            </button>
          );
        })}
      </div>

      {/* Recent Actions */}
      <div className="pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-4">Recent Actions</h4>
        <div className="space-y-2">
          {recentActions.map((action) => (
            <div
              key={action.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-white">{action.action}</p>
                <p className="text-xs text-gray-400">{action.device}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400 mb-1">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">Success</span>
                </div>
                <p className="text-xs text-gray-400">{action.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
