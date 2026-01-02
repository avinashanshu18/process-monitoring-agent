"use client";

import { Monitor, Cpu, HardDrive, Wifi, Calendar, Zap } from "lucide-react";

export function SystemInfo() {
  const systemData = {
    hostname: "DESKTOP-PC-2024",
    os: "Windows 11 Pro",
    version: "23H2 (Build 22631.2861)",
    architecture: "x64 (64-bit)",
    uptime: "14 days, 6 hours, 23 minutes",
    bootTime: "2025-11-25 08:45:12",
    timezone: "Asia/Kolkata (IST)",
    language: "English (United States)",
  };

  const cards = [
    {
      icon: Monitor,
      label: "Hostname",
      value: systemData.hostname,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Cpu,
      label: "Operating System",
      value: systemData.os,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: HardDrive,
      label: "Architecture",
      value: systemData.architecture,
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Calendar,
      label: "Uptime",
      value: systemData.uptime,
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      label: "Boot Time",
      value: systemData.bootTime,
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Wifi,
      label: "Timezone",
      value: systemData.timezone,
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-sm font-medium text-white truncate" title={card.value}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
