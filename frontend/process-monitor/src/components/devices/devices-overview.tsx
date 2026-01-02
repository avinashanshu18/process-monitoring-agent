"use client";

import { Monitor, CheckCircle, AlertTriangle, WifiOff, TrendingUp } from "lucide-react";

export function DevicesOverview() {
  const stats = [
    {
      name: "Total Devices",
      value: "12",
      change: "+2 this month",
      icon: Monitor,
      color: "from-blue-500 to-cyan-500",
      percentage: 100,
    },
    {
      name: "Online",
      value: "9",
      change: "75% uptime",
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
      percentage: 75,
    },
    {
      name: "Warnings",
      value: "3",
      change: "Needs attention",
      icon: AlertTriangle,
      color: "from-yellow-500 to-orange-500",
      percentage: 25,
    },
    {
      name: "Offline",
      value: "1",
      change: "Down 2 hours",
      icon: WifiOff,
      color: "from-red-500 to-orange-500",
      percentage: 8,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Mini chart */}
            <div className="flex items-center gap-1 h-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full bg-gradient-to-t ${stat.color} opacity-40`}
                  style={{ 
                    height: `${Math.random() * 60 + 40}%`,
                    opacity: i === 11 ? 1 : 0.3 + (i / 12) * 0.7 
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
