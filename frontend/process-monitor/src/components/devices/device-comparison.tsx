"use client";

import { useState } from "react";
import { GitCompare, TrendingUp, TrendingDown } from "lucide-react";

export function DeviceComparison() {
  const [device1, setDevice1] = useState("main-workstation");
  const [device2, setDevice2] = useState("dev-laptop");

  const devices = [
    {
      id: "main-workstation",
      name: "Main Workstation",
      cpu: 45,
      memory: 62,
      disk: 76,
      network: 38,
      uptime: "5 days 12h",
      os: "Windows 11 Pro",
    },
    {
      id: "dev-laptop",
      name: "Development Laptop",
      cpu: 38,
      memory: 55,
      disk: 65,
      network: 42,
      uptime: "2 days 8h",
      os: "Ubuntu 22.04",
    },
    {
      id: "prod-server",
      name: "Production Server",
      cpu: 72,
      memory: 85,
      disk: 58,
      network: 95,
      uptime: "45 days 3h",
      os: "CentOS 8",
    },
    {
      id: "test-machine",
      name: "Testing Machine",
      cpu: 88,
      memory: 92,
      disk: 82,
      network: 28,
      uptime: "12 days 4h",
      os: "Windows 10 Pro",
    },
  ];

  const data1 = devices.find(d => d.id === device1)!;
  const data2 = devices.find(d => d.id === device2)!;

  const metrics = [
    { name: "CPU Usage", key: "cpu" as const, unit: "%" },
    { name: "Memory Usage", key: "memory" as const, unit: "%" },
    { name: "Disk Usage", key: "disk" as const, unit: "%" },
    { name: "Network", key: "network" as const, unit: "MB/s" },
  ];

  const calculateDiff = (val1: number, val2: number) => {
    const diff = val1 - val2;
    const percentage = ((Math.abs(diff) / val2) * 100).toFixed(1);
    return { diff, percentage, isHigher: diff > 0 };
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Device Comparison</h3>
          <p className="text-sm text-gray-400">Compare performance metrics</p>
        </div>
      </div>

      {/* Device Selectors */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Device 1</label>
          <select
            value={device1}
            onChange={(e) => setDevice1(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Device 2</label>
          <select
            value={device2}
            onChange={(e) => setDevice2(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-4">
        {metrics.map((metric) => {
          const val1 = data1[metric.key];
          const val2 = data2[metric.key];
          const { diff, percentage, isHigher } = calculateDiff(val1, val2);

          return (
            <div
              key={metric.key}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">{metric.name}</h4>
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  Math.abs(diff) < 5 ? "text-gray-400" :
                  isHigher ? "text-orange-400" : "text-green-400"
                }`}>
                  {Math.abs(diff) >= 5 && (
                    <>
                      {isHigher ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{percentage}%</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Device 1 */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{data1.name}</span>
                    <span className="text-white font-bold">{val1}{metric.unit}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${val1}%` }}
                    />
                  </div>
                </div>

                {/* Device 2 */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{data2.name}</span>
                    <span className="text-white font-bold">{val2}{metric.unit}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${val2}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">{data1.name}</p>
          <p className="text-sm font-medium text-white mb-1">Uptime: {data1.uptime}</p>
          <p className="text-xs text-gray-400">{data1.os}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">{data2.name}</p>
          <p className="text-sm font-medium text-white mb-1">Uptime: {data2.uptime}</p>
          <p className="text-xs text-gray-400">{data2.os}</p>
        </div>
      </div>
    </div>
  );
}
