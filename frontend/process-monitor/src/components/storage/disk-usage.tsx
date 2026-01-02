"use client";

import { useState } from "react";
import { HardDrive, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";

interface Disk {
  id: number;
  name: string;
  drive: string;
  totalSpace: string;
  usedSpace: string;
  freeSpace: string;
  percentage: number;
  fileSystem: string;
  status: "healthy" | "warning" | "critical";
  temperature: number;
}

export function DiskUsage() {
  const [disks] = useState<Disk[]>([
    {
      id: 1,
      name: "System",
      drive: "C:",
      totalSpace: "500 GB",
      usedSpace: "380 GB",
      freeSpace: "120 GB",
      percentage: 76,
      fileSystem: "NTFS",
      status: "warning",
      temperature: 42,
    },
    {
      id: 2,
      name: "Data",
      drive: "D:",
      totalSpace: "1.5 TB",
      usedSpace: "820 GB",
      freeSpace: "680 GB",
      percentage: 55,
      fileSystem: "NTFS",
      status: "healthy",
      temperature: 38,
    },
    {
      id: 3,
      name: "Backup",
      drive: "E:",
      totalSpace: "2 TB",
      usedSpace: "1.8 TB",
      freeSpace: "200 GB",
      percentage: 90,
      fileSystem: "exFAT",
      status: "critical",
      temperature: 45,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return CheckCircle;
      case "warning":
      case "critical":
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Disk Usage</h3>
          <p className="text-sm text-gray-400">{disks.length} drives detected</p>
        </div>
      </div>

      {/* Disks List */}
      <div className="space-y-4">
        {disks.map((disk) => {
          const StatusIcon = getStatusIcon(disk.status);
          return (
            <div
              key={disk.id}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{disk.drive}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">{disk.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(disk.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {disk.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{disk.fileSystem} • {disk.temperature}°C</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">
                    {disk.usedSpace} used of {disk.totalSpace}
                  </span>
                  <span className="text-white font-bold">{disk.percentage}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPercentageColor(disk.percentage)} rounded-full transition-all duration-500`}
                    style={{ width: `${disk.percentage}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-white/5 rounded">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-sm font-bold text-white">{disk.totalSpace}</p>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <p className="text-xs text-gray-400">Used</p>
                  <p className="text-sm font-bold text-orange-400">{disk.usedSpace}</p>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <p className="text-xs text-gray-400">Free</p>
                  <p className="text-sm font-bold text-green-400">{disk.freeSpace}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Total Capacity</p>
          <p className="text-xl font-bold text-white">4 TB</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Total Free</p>
          <p className="text-xl font-bold text-green-400">1 TB</p>
        </div>
      </div>
    </div>
  );
}
