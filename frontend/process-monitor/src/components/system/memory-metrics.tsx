"use client";

import { useEffect, useState } from "react";
import { HardDrive, Database, Layers, Activity } from "lucide-react";

interface MemoryData {
  total: number;
  used: number;
  free: number;
  cached: number;
  buffers: number;
  swapTotal: number;
  swapUsed: number;
  swapFree: number;
}

export function MemoryMetrics() {
  const [memory, setMemory] = useState<MemoryData>({
    total: 16384, // 16 GB
    used: 8192,   // 8 GB
    free: 4096,   // 4 GB
    cached: 3072, // 3 GB
    buffers: 1024, // 1 GB
    swapTotal: 8192,
    swapUsed: 1024,
    swapFree: 7168,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMemory(prev => {
        const usedChange = (Math.random() - 0.5) * 512;
        const newUsed = Math.max(4096, Math.min(14336, prev.used + usedChange));
        const newCached = Math.max(1024, Math.min(4096, prev.cached + (Math.random() - 0.5) * 256));
        const newFree = prev.total - newUsed - newCached - prev.buffers;

        return {
          ...prev,
          used: newUsed,
          cached: newCached,
          free: Math.max(0, newFree),
          swapUsed: Math.max(0, Math.min(prev.swapTotal, prev.swapUsed + (Math.random() - 0.5) * 256)),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const usagePercentage = (memory.used / memory.total) * 100;
  const swapPercentage = (memory.swapUsed / memory.swapTotal) * 100;

  const formatGB = (mb: number) => (mb / 1024).toFixed(2);

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Memory Usage</h3>
            <p className="text-sm text-gray-400">RAM and Swap details</p>
          </div>
        </div>

        {/* Usage Badge */}
        <div className="px-4 py-2 bg-purple-500/10 border border-purple-400/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Used</p>
          <p className="text-2xl font-bold text-purple-400">{usagePercentage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Main Memory Circle Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#memoryGradient)"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(usagePercentage / 100) * 553} 553`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-white">{formatGB(memory.used)}</p>
            <p className="text-sm text-gray-400">of {formatGB(memory.total)} GB</p>
            <p className="text-xs text-purple-400 mt-1">{usagePercentage.toFixed(1)}% Used</p>
          </div>
        </div>
      </div>

      {/* Memory Breakdown */}
      <div className="space-y-3 mb-6">
        {/* Used */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            <span className="text-sm text-gray-400">Used</span>
          </div>
          <span className="text-sm font-medium text-white">{formatGB(memory.used)} GB</span>
        </div>

        {/* Cached */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            <span className="text-sm text-gray-400">Cached</span>
          </div>
          <span className="text-sm font-medium text-white">{formatGB(memory.cached)} GB</span>
        </div>

        {/* Buffers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500" />
            <span className="text-sm text-gray-400">Buffers</span>
          </div>
          <span className="text-sm font-medium text-white">{formatGB(memory.buffers)} GB</span>
        </div>

        {/* Free */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
            <span className="text-sm text-gray-400">Free</span>
          </div>
          <span className="text-sm font-medium text-white">{formatGB(memory.free)} GB</span>
        </div>
      </div>

      {/* Swap Memory */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">Swap Memory</span>
          </div>
          <span className="text-sm font-medium text-white">
            {formatGB(memory.swapUsed)} / {formatGB(memory.swapTotal)} GB
          </span>
        </div>

        {/* Swap Progress Bar */}
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              swapPercentage > 70 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              swapPercentage > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-green-500 to-teal-500'
            }`}
            style={{ width: `${swapPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{swapPercentage.toFixed(1)}% Swap Used</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <Activity className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Available</p>
          <p className="text-sm font-bold text-white">{formatGB(memory.free + memory.cached)} GB</p>
        </div>

        <div className="p-3 bg-white/5 rounded-lg text-center">
          <Layers className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Cache Hit</p>
          <p className="text-sm font-bold text-white">94.2%</p>
        </div>

        <div className="p-3 bg-white/5 rounded-lg text-center">
          <Database className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Page Faults</p>
          <p className="text-sm font-bold text-white">142/s</p>
        </div>
      </div>
    </div>
  );
}
