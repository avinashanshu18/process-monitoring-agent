"use client";

import { useEffect, useState } from "react";
import { HardDrive, Folder, File, TrendingUp, TrendingDown } from "lucide-react";

interface DiskData {
  name: string;
  mount: string;
  total: number;
  used: number;
  free: number;
  type: string;
  readSpeed: number;
  writeSpeed: number;
}

export function DiskMetrics() {
  const [disks, setDisks] = useState<DiskData[]>([
    {
      name: "C:",
      mount: "/",
      total: 512000, // 500 GB
      used: 307200,  // 300 GB
      free: 204800,  // 200 GB
      type: "SSD",
      readSpeed: 450,
      writeSpeed: 380,
    },
    {
      name: "D:",
      mount: "/data",
      total: 1024000, // 1 TB
      used: 512000,
      free: 512000,
      type: "HDD",
      readSpeed: 120,
      writeSpeed: 95,
    },
    {
      name: "E:",
      mount: "/backup",
      total: 256000, // 250 GB
      used: 153600,
      free: 102400,
      type: "SSD",
      readSpeed: 520,
      writeSpeed: 480,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisks(prev => prev.map(disk => ({
        ...disk,
        readSpeed: Math.max(0, disk.readSpeed + (Math.random() - 0.5) * 50),
        writeSpeed: Math.max(0, disk.writeSpeed + (Math.random() - 0.5) * 40),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatGB = (mb: number) => (mb / 1024).toFixed(1);

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Disk & Storage</h3>
            <p className="text-sm text-gray-400">{disks.length} drives detected</p>
          </div>
        </div>

        {/* Total Storage Badge */}
        <div className="px-4 py-2 bg-green-500/10 border border-green-400/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-lg font-bold text-green-400">
            {formatGB(disks.reduce((acc, d) => acc + d.total, 0))} GB
          </p>
        </div>
      </div>

      {/* Disks Grid */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {disks.map((disk, index) => {
          const usagePercentage = (disk.used / disk.total) * 100;
          const circumference = 2 * Math.PI * 45;
          const strokeDashoffset = circumference - (usagePercentage / 100) * circumference;

          return (
            <div key={index} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 border border-white/10">
              {/* Disk Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    disk.type === 'SSD' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    <HardDrive className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{disk.name}</p>
                    <p className="text-xs text-gray-400">{disk.type}</p>
                  </div>
                </div>

                {/* Type Badge */}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  disk.type === 'SSD' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-400/30' 
                    : 'bg-gray-500/10 text-gray-400 border border-gray-400/30'
                }`}>
                  {disk.type}
                </span>
              </div>

              {/* Circular Progress */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="45"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="45"
                      stroke={usagePercentage > 80 ? '#ef4444' : usagePercentage > 60 ? '#f59e0b' : '#10b981'}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-lg font-bold text-white">{usagePercentage.toFixed(0)}%</p>
                    <p className="text-xs text-gray-400">Used</p>
                  </div>
                </div>
              </div>

              {/* Storage Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Used</span>
                  <span className="text-white font-medium">{formatGB(disk.used)} GB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Free</span>
                  <span className="text-white font-medium">{formatGB(disk.free)} GB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-medium">{formatGB(disk.total)} GB</span>
                </div>
              </div>

              {/* I/O Speed */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-gray-400">Read</span>
                  </div>
                  <span className="text-xs font-mono text-green-400">{disk.readSpeed.toFixed(0)} MB/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-gray-400">Write</span>
                  </div>
                  <span className="text-xs font-mono text-orange-400">{disk.writeSpeed.toFixed(0)} MB/s</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Total Files</p>
          </div>
          <p className="text-xl font-bold text-white">142,853</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <File className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Avg Read Speed</p>
          </div>
          <p className="text-xl font-bold text-white">
            {(disks.reduce((acc, d) => acc + d.readSpeed, 0) / disks.length).toFixed(0)} MB/s
          </p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            <p className="text-xs text-gray-400">Avg Write Speed</p>
          </div>
          <p className="text-xl font-bold text-white">
            {(disks.reduce((acc, d) => acc + d.writeSpeed, 0) / disks.length).toFixed(0)} MB/s
          </p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Free Space</p>
          </div>
          <p className="text-xl font-bold text-white">
            {formatGB(disks.reduce((acc, d) => acc + d.free, 0))} GB
          </p>
        </div>
      </div>
    </div>
  );
}
