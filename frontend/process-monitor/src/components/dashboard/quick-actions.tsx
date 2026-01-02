"use client";

import { RefreshCw, Trash2, Shield, Gauge, Download, AlertTriangle } from "lucide-react";

const actions = [
  {
    name: "Clear Cache",
    description: "Free up memory",
    icon: Trash2,
    color: "from-blue-500 to-cyan-500",
    action: () => console.log("Clear cache"),
  },
  {
    name: "Scan System",
    description: "Security check",
    icon: Shield,
    color: "from-purple-500 to-pink-500",
    action: () => console.log("Scan system"),
  },
  {
    name: "Optimize",
    description: "Boost performance",
    icon: Gauge,
    color: "from-green-500 to-teal-500",
    action: () => console.log("Optimize"),
  },
  {
    name: "Export Data",
    description: "Download report",
    icon: Download,
    color: "from-orange-500 to-red-500",
    action: () => console.log("Export data"),
  },
];

export function QuickActions() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Quick Actions</h3>
        <p className="text-sm text-gray-400">Common system tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="group relative p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 text-left overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
              
              <div className="relative">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-white mb-1">{action.name}</p>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* System Alert */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400 mb-1">Optimization Available</p>
            <p className="text-xs text-gray-400">Your system can be optimized. Click "Optimize" to improve performance.</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
        <RefreshCw className="w-4 h-4" />
        Refresh All Data
      </button>
    </div>
  );
}
