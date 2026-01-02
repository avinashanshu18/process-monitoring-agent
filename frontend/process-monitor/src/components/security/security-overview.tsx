"use client";

import { Shield, AlertTriangle, Lock, Eye, CheckCircle, XCircle } from "lucide-react";

export function SecurityOverview() {
  const securityScore = 85;

  const stats = [
    {
      name: "Security Score",
      value: `${securityScore}/100`,
      icon: Shield,
      color: "from-green-500 to-teal-500",
      status: "good",
      description: "Strong protection",
    },
    {
      name: "Active Threats",
      value: "2",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      status: "warning",
      description: "Requires attention",
    },
    {
      name: "Firewall",
      value: "Enabled",
      icon: Lock,
      color: "from-blue-500 to-cyan-500",
      status: "good",
      description: "All ports protected",
    },
    {
      name: "Last Scan",
      value: "2h ago",
      icon: Eye,
      color: "from-purple-500 to-pink-500",
      status: "good",
      description: "No issues found",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const StatusIcon = stat.status === "good" ? CheckCircle : XCircle;
        
        return (
          <div
            key={index}
            className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <StatusIcon className={`w-4 h-4 ${
                stat.status === "good" ? "text-green-400" : "text-red-400"
              }`} />
              <span className={`text-xs font-medium ${
                stat.status === "good" ? "text-green-400" : "text-red-400"
              }`}>
                {stat.status === "good" ? "Protected" : "Action Required"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
