"use client";

import { Server, Clock, Hash, Radio } from "lucide-react";

interface ProcessMetadataProps {
  snapshot: any;
  mode: string;
}

export function ProcessMetadata({ snapshot, mode }: ProcessMetadataProps) {
  const stats = [
    {
      icon: Server,
      label: "Hostname",
      value: snapshot?.hostname || "—",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      label: "Timestamp",
      value: snapshot?.created_at ? new Date(snapshot.created_at).toLocaleString() : "—",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Hash,
      label: "Processes",
      value: snapshot?.processes?.length || "—",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Radio,
      label: "Mode",
      value: mode,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            className="group p-4 glass hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-sm font-semibold text-white truncate">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
