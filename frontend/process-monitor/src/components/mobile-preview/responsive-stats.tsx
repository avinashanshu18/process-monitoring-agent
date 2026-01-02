"use client";

import { Smartphone, Zap, Eye, Download } from "lucide-react";

export function ResponsiveStats() {
  const stats = [
    {
      title: "Load Time",
      value: "1.2s",
      description: "Average page load on mobile",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Mobile Score",
      value: "94/100",
      description: "Google Lighthouse rating",
      icon: Smartphone,
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Active Sessions",
      value: "5.2K",
      description: "Current mobile users",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const breakpoints = [
    { name: "Mobile", size: "< 640px", percentage: 42, color: "bg-blue-500" },
    { name: "Tablet", size: "640-1024px", percentage: 23, color: "bg-purple-500" },
    { name: "Desktop", size: "> 1024px", percentage: 35, color: "bg-green-500" },
  ];

  const features = [
    { name: "Touch Gestures", status: "enabled", icon: "👆" },
    { name: "Offline Mode", status: "enabled", icon: "📴" },
    { name: "Push Notifications", status: "enabled", icon: "🔔" },
    { name: "Dark Mode", status: "enabled", icon: "🌙" },
    { name: "Haptic Feedback", status: "enabled", icon: "📳" },
    { name: "Biometric Auth", status: "enabled", icon: "🔐" },
  ];

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Performance</h3>
            <p className="text-sm text-gray-400">Mobile metrics</p>
          </div>
        </div>

        <div className="space-y-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Size Distribution */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Screen Sizes</h3>
            <p className="text-sm text-gray-400">Usage breakdown</p>
          </div>
        </div>

        {/* Visual Distribution */}
        <div className="h-4 bg-white/10 rounded-full overflow-hidden flex mb-4">
          {breakpoints.map((bp, index) => (
            <div
              key={index}
              className={`${bp.color} transition-all`}
              style={{ width: `${bp.percentage}%` }}
              title={`${bp.name}: ${bp.percentage}%`}
            />
          ))}
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {breakpoints.map((bp, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${bp.color}`} />
                <div>
                  <p className="text-sm font-medium text-white">{bp.name}</p>
                  <p className="text-xs text-gray-400">{bp.size}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-white">{bp.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Features */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Features</h3>
            <p className="text-sm text-gray-400">Mobile capabilities</p>
          </div>
        </div>

        <div className="space-y-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm text-white">{feature.name}</span>
              </div>
              <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-medium capitalize">
                {feature.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Download App CTA */}
      <div className="glass rounded-xl p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Get Mobile App</h4>
          <p className="text-sm text-gray-400 mb-4">
            Download our mobile app for the best monitoring experience on the go
          </p>
          <div className="flex flex-col gap-2">
            <button className="w-full px-4 py-3 bg-black rounded-lg flex items-center justify-center gap-3 hover:bg-black/80 transition-all">
              <div className="text-2xl">🍎</div>
              <div className="text-left">
                <p className="text-xs text-gray-400">Download on the</p>
                <p className="text-sm font-bold text-white">App Store</p>
              </div>
            </button>
            <button className="w-full px-4 py-3 bg-black rounded-lg flex items-center justify-center gap-3 hover:bg-black/80 transition-all">
              <div className="text-2xl">🤖</div>
              <div className="text-left">
                <p className="text-xs text-gray-400">GET IT ON</p>
                <p className="text-sm font-bold text-white">Google Play</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
