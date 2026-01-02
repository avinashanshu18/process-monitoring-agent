"use client";

import { Bell, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function AlertsOverview() {
  const stats = [
    {
      name: "Active Alerts",
      value: "7",
      icon: Bell,
      color: "from-red-500 to-orange-500",
      change: "+2 from yesterday",
      trend: "up",
    },
    {
      name: "Critical",
      value: "2",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500",
      change: "Requires attention",
      trend: "critical",
    },
    {
      name: "Resolved Today",
      value: "14",
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
      change: "92% resolution rate",
      trend: "good",
    },
    {
      name: "Avg Response Time",
      value: "3.2m",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      change: "-1.5m improvement",
      trend: "good",
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
                <p className={`text-xs ${
                  stat.trend === 'critical' ? 'text-red-400' :
                  stat.trend === 'good' ? 'text-green-400' :
                  stat.trend === 'up' ? 'text-orange-400' :
                  'text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                style={{ 
                  width: stat.name === "Active Alerts" ? "70%" :
                         stat.name === "Critical" ? "40%" :
                         stat.name === "Resolved Today" ? "92%" : "65%"
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
