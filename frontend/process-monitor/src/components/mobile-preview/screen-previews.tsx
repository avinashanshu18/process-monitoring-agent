"use client";

import { useState } from "react";
import { LayoutDashboard, Activity, Bell, Settings, User, BarChart3 } from "lucide-react";

export function ScreenPreviews() {
  const [selectedScreen, setSelectedScreen] = useState("dashboard");

  const screens = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "metrics", name: "Metrics", icon: Activity },
    { id: "alerts", name: "Alerts", icon: Bell },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
    { id: "profile", name: "Profile", icon: User },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Screen Previews</h3>
          <p className="text-sm text-gray-400">Mobile interface mockups</p>
        </div>
      </div>

      {/* Screen Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {screens.map((screen) => {
          const Icon = screen.icon;
          return (
            <button
              key={screen.id}
              onClick={() => setSelectedScreen(screen.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedScreen === screen.id
                  ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                  : "text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {screen.name}
            </button>
          );
        })}
      </div>

      {/* Device Frame */}
      <div className="flex justify-center p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl">
        {/* iPhone Frame */}
        <div className="relative">
          {/* Device Border */}
          <div className="w-[320px] h-[640px] bg-black rounded-[40px] p-3 shadow-2xl border-8 border-gray-800">
            {/* Screen */}
            <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-[32px] overflow-hidden">
              {/* Status Bar */}
              <div className="h-12 bg-black/50 backdrop-blur-sm px-6 flex items-center justify-between">
                <span className="text-white text-xs font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 border border-white/50 rounded-sm" />
                  <div className="w-1 h-3 bg-white/50 rounded-sm" />
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 overflow-y-auto" style={{ height: "calc(100% - 48px - 80px)" }}>
                {selectedScreen === "dashboard" && (
                  <div className="space-y-3">
                    <h2 className="text-white font-bold text-lg mb-4">Dashboard</h2>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {["CPU", "Memory", "Disk", "Network"].map((stat) => (
                        <div key={stat} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">{stat}</p>
                          <p className="text-xl font-bold text-white">{Math.floor(Math.random() * 40 + 50)}%</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart Placeholder */}
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400 mb-2">System Health</p>
                      <div className="h-24 flex items-end justify-between gap-1">
                        {[65, 72, 68, 80, 75, 82, 78].map((height, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t opacity-70" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>

                    {/* Recent Alerts */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">Recent Alerts</p>
                      <div className="space-y-2">
                        {["CPU spike detected", "Memory warning"].map((alert, i) => (
                          <div key={i} className="p-2 bg-yellow-500/10 border border-yellow-400/20 rounded text-xs text-yellow-400">
                            {alert}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedScreen === "metrics" && (
                  <div className="space-y-3">
                    <h2 className="text-white font-bold text-lg mb-4">System Metrics</h2>
                    {["CPU Usage", "Memory", "Disk I/O", "Network"].map((metric) => (
                      <div key={metric} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white">{metric}</span>
                          <span className="text-sm font-bold text-cyan-400">{Math.floor(Math.random() * 40 + 50)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.random() * 50 + 50}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedScreen === "alerts" && (
                  <div className="space-y-3">
                    <h2 className="text-white font-bold text-lg mb-4">Alerts</h2>
                    {[
                      { type: "Critical", message: "CPU at 95%", color: "red" },
                      { type: "Warning", message: "High memory usage", color: "yellow" },
                      { type: "Info", message: "Backup completed", color: "blue" },
                    ].map((alert, i) => (
                      <div key={i} className={`p-3 bg-${alert.color}-500/10 border border-${alert.color}-400/20 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold text-${alert.color}-400`}>{alert.type}</span>
                          <span className="text-xs text-gray-500">2m ago</span>
                        </div>
                        <p className="text-sm text-white">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedScreen === "analytics" && (
                  <div className="space-y-3">
                    <h2 className="text-white font-bold text-lg mb-4">Analytics</h2>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400 mb-3">Performance Trend</p>
                      <div className="h-32 flex items-end justify-between gap-1">
                        {Array.from({ length: 12 }, (_, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t opacity-60" style={{ height: `${Math.random() * 100}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedScreen === "profile" && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center py-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                        AK
                      </div>
                      <h2 className="text-white font-bold text-lg">Avinash Kumar</h2>
                      <p className="text-sm text-gray-400">admin@example.com</p>
                    </div>
                    <div className="space-y-2">
                      {["Account Settings", "Notifications", "Security", "Privacy"].map((item) => (
                        <div key={item} className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-white">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScreen === "settings" && (
                  <div className="space-y-3">
                    <h2 className="text-white font-bold text-lg mb-4">Settings</h2>
                    {["General", "Notifications", "Security", "Data & Privacy", "About"].map((setting) => (
                      <div key={setting} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                        <span className="text-sm text-white">{setting}</span>
                        <span className="text-gray-400">›</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div className="h-20 bg-black/80 backdrop-blur-sm border-t border-white/10 flex items-center justify-around px-4">
                {screens.slice(0, 5).map((screen) => {
                  const Icon = screen.icon;
                  return (
                    <button
                      key={screen.id}
                      onClick={() => setSelectedScreen(screen.id)}
                      className={`flex flex-col items-center gap-1 ${
                        selectedScreen === screen.id ? "text-cyan-400" : "text-gray-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{screen.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
