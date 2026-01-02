"use client";

import { useEffect, useState } from "react";
import { Wifi, Upload, Download, Globe, Activity } from "lucide-react";

export function NetworkOverview() {
  const [stats, setStats] = useState({
    uploadSpeed: 2.4,
    downloadSpeed: 8.7,
    totalSent: 15.3,
    totalReceived: 142.8,
    activeConnections: 47,
    latency: 12,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        uploadSpeed: Math.max(0.5, prev.uploadSpeed + (Math.random() - 0.5) * 2),
        downloadSpeed: Math.max(1, prev.downloadSpeed + (Math.random() - 0.5) * 3),
        activeConnections: Math.max(10, Math.min(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 5))),
        latency: Math.max(8, Math.min(50, prev.latency + (Math.random() - 0.5) * 5)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      name: "Download Speed",
      value: `${stats.downloadSpeed.toFixed(2)} MB/s`,
      icon: Download,
      color: "from-green-500 to-teal-500",
      change: "+12.3%",
      trend: "up",
    },
    {
      name: "Upload Speed",
      value: `${stats.uploadSpeed.toFixed(2)} MB/s`,
      icon: Upload,
      color: "from-blue-500 to-cyan-500",
      change: "-3.2%",
      trend: "down",
    },
    {
      name: "Active Connections",
      value: stats.activeConnections.toString(),
      icon: Globe,
      color: "from-purple-500 to-pink-500",
      change: `${stats.activeConnections} total`,
      trend: "neutral",
    },
    {
      name: "Latency",
      value: `${stats.latency.toFixed(0)} ms`,
      icon: Activity,
      color: "from-orange-500 to-red-500",
      change: stats.latency < 20 ? "Excellent" : stats.latency < 40 ? "Good" : "Fair",
      trend: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{card.name}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className={`text-xs mt-2 ${
                  card.trend === 'up' ? 'text-green-400' :
                  card.trend === 'down' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-500`}
                style={{ 
                  width: card.name.includes("Speed") ? "65%" : 
                         card.name === "Latency" ? "30%" : "80%" 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
