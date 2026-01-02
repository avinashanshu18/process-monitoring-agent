"use client";

import { useState } from "react";
import { Server, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export function CapacityPlanning() {
  const [selectedResource, setSelectedResource] = useState<"cpu" | "memory" | "disk" | "network">("cpu");

  const resources = [
    {
      id: "cpu" as const,
      name: "CPU",
      current: 65,
      capacity: 100,
      projected: 92,
      daysUntilFull: 14,
      status: "warning",
      recommendation: "Scale up within 2 weeks",
    },
    {
      id: "memory" as const,
      name: "Memory",
      current: 58,
      capacity: 100,
      projected: 78,
      daysUntilFull: 45,
      status: "good",
      recommendation: "Monitor monthly trends",
    },
    {
      id: "disk" as const,
      name: "Disk",
      current: 72,
      capacity: 100,
      projected: 95,
      daysUntilFull: 21,
      status: "warning",
      recommendation: "Add storage within 3 weeks",
    },
    {
      id: "network" as const,
      name: "Network",
      current: 45,
      capacity: 100,
      projected: 62,
      daysUntilFull: 90,
      status: "good",
      recommendation: "Capacity sufficient",
    },
  ];

  const selectedData = resources.find(r => r.id === selectedResource)!;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "good":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
      case "warning":
        return AlertTriangle;
      case "good":
        return CheckCircle;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <Server className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Capacity Planning</h3>
          <p className="text-sm text-gray-400">Resource utilization forecasts</p>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {resources.map((resource) => {
          const StatusIcon = getStatusIcon(resource.status);
          return (
            <button
              key={resource.id}
              onClick={() => setSelectedResource(resource.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedResource === resource.id
                  ? "border-green-400 bg-green-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">{resource.name}</h4>
                <StatusIcon className={`w-4 h-4 ${
                  resource.status === "warning" ? "text-yellow-400" : "text-green-400"
                }`} />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Current</span>
                  <span className="text-white font-bold">{resource.current}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      resource.current >= 80 ? "bg-red-500" :
                      resource.current >= 60 ? "bg-yellow-500" :
                      "bg-green-500"
                    }`}
                    style={{ width: `${resource.current}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400">
                {resource.daysUntilFull} days to capacity
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed View */}
      <div className="p-6 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">{selectedData.name} Capacity Analysis</h4>
            <p className="text-sm text-gray-400">Projected usage and recommendations</p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(selectedData.status)}`}>
            {selectedData.status.charAt(0).toUpperCase() + selectedData.status.slice(1)}
          </span>
        </div>

        {/* Progress Visualization */}
        <div className="space-y-4 mb-6">
          {/* Current Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current Usage</span>
              <span className="text-sm font-bold text-white">{selectedData.current}%</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                style={{ width: `${selectedData.current}%` }}
              />
            </div>
          </div>

          {/* Projected Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">30-Day Projection</span>
              <span className="text-sm font-bold text-orange-400">{selectedData.projected}%</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style={{ width: `${selectedData.projected}%` }}
              />
            </div>
          </div>

          {/* Capacity Limit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Capacity</span>
              <span className="text-sm font-bold text-green-400">{selectedData.capacity}%</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Capacity Timeline</span>
            <span className="text-sm text-gray-400">{selectedData.daysUntilFull} days remaining</span>
          </div>
          
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            {/* Progress bar showing time elapsed */}
            <div 
              className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: `${(selectedData.current / selectedData.capacity) * 100}%` }}
            />
            {/* Marker for projected capacity */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-orange-400"
              style={{ left: `${(selectedData.projected / selectedData.capacity) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Today</span>
            <span className="text-orange-400">30 Days</span>
            <span>Full Capacity</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-black/20 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Growth Rate</p>
            <p className="text-lg font-bold text-white flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              +{((selectedData.projected - selectedData.current) / 30).toFixed(1)}%/day
            </p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Utilization</p>
            <p className="text-lg font-bold text-cyan-400">{selectedData.current}%</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Available</p>
            <p className="text-lg font-bold text-green-400">{selectedData.capacity - selectedData.current}%</p>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`p-4 rounded-lg border ${
          selectedData.status === "warning" 
            ? "bg-yellow-500/5 border-yellow-400/20" 
            : "bg-green-500/5 border-green-400/20"
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              selectedData.status === "warning" ? "text-yellow-400" : "text-green-400"
            }`} />
            <div>
              <p className={`text-sm font-medium mb-1 ${
                selectedData.status === "warning" ? "text-yellow-400" : "text-green-400"
              }`}>
                Recommendation
              </p>
              <p className="text-sm text-white">{selectedData.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
