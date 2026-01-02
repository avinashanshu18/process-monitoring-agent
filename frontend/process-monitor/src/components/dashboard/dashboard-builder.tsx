"use client";

import { useState } from "react";
import { LayoutDashboard, Plus, Save, Eye, Grid3x3, Settings, Trash2, Move } from "lucide-react";

interface Widget {
  id: string;
  type: string;
  title: string;
  size: "small" | "medium" | "large";
  color: string;
}

export function DashboardBuilder() {
  const [dashboardName, setDashboardName] = useState("My Custom Dashboard");
  const [layout, setLayout] = useState<"grid" | "flex">("grid");
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "1",
      type: "cpu",
      title: "CPU Usage",
      size: "medium",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "2",
      type: "memory",
      title: "Memory Usage",
      size: "medium",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "3",
      type: "network",
      title: "Network Traffic",
      size: "large",
      color: "from-green-500 to-teal-500",
    },
    {
      id: "4",
      type: "alerts",
      title: "Recent Alerts",
      size: "small",
      color: "from-red-500 to-orange-500",
    },
  ]);

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "md:col-span-1";
      case "medium":
        return "md:col-span-2";
      case "large":
        return "md:col-span-3";
      default:
        return "md:col-span-2";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Dashboard Builder</h3>
            <p className="text-sm text-gray-400">Drag and arrange widgets</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setLayout(layout === "grid" ? "flex" : "grid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              layout === "grid"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Grid3x3 className="w-4 h-4 inline mr-1" />
            Grid
          </button>
          <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg text-sm font-medium transition-all">
            <Eye className="w-4 h-4 inline mr-1" />
            Preview
          </button>
          <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg text-sm font-medium transition-all">
            <Save className="w-4 h-4 inline mr-1" />
            Save
          </button>
        </div>
      </div>

      {/* Dashboard Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">Dashboard Name</label>
        <input
          type="text"
          value={dashboardName}
          onChange={(e) => setDashboardName(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      {/* Canvas */}
      <div className="p-6 bg-black/20 rounded-lg border-2 border-dashed border-white/10 min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`p-5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group relative ${getSizeClass(widget.size)}`}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white">{widget.title}</h4>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Move">
                    <Move className="w-3 h-3" />
                  </button>
                  <button className="p-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 transition-all" title="Settings">
                    <Settings className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Widget Content Preview */}
              <div className={`h-32 rounded-lg bg-gradient-to-br ${widget.color} opacity-20 flex items-center justify-center`}>
                <span className="text-white/60 text-sm font-medium">{widget.type.toUpperCase()}</span>
              </div>

              {/* Widget Footer */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Size: {widget.size}</span>
                <span>Type: {widget.type}</span>
              </div>
            </div>
          ))}

          {/* Add Widget Button */}
          <button className="p-5 bg-white/5 hover:bg-white/10 rounded-lg border-2 border-dashed border-white/20 hover:border-cyan-400/50 transition-all min-h-[180px] flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-cyan-400 group">
            <div className="w-12 h-12 rounded-lg bg-white/5 group-hover:bg-cyan-500/20 flex items-center justify-center transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Add Widget</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
        <div className="flex items-start gap-3">
          <LayoutDashboard className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400 mb-1">Dashboard Builder Tips</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Drag widgets to rearrange them on the canvas</li>
              <li>• Click "Add Widget" to insert new monitoring widgets</li>
              <li>• Use widget settings to customize data sources and appearance</li>
              <li>• Save your dashboard to access it from the sidebar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
