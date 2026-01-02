"use client";

import { FileText, Activity, AlertCircle, CheckCircle } from "lucide-react";

export function AuditOverview() {
  const stats = [
    {
      name: "Total Events",
      value: "12,847",
      change: "+342 today",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "User Actions",
      value: "8,234",
      change: "64% of total",
      icon: Activity,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Security Events",
      value: "124",
      change: "12 critical",
      icon: AlertCircle,
      color: "from-red-500 to-orange-500",
    },
    {
      name: "System Events",
      value: "4,489",
      change: "All successful",
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
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
          </div>
        );
      })}
    </div>
  );
}
