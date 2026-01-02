"use client";

import { useState } from "react";
import { Smartphone, Tablet, Monitor, RotateCw } from "lucide-react";

export function DeviceSelector() {
  const [selectedDevice, setSelectedDevice] = useState<"phone" | "tablet" | "desktop">("phone");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const devices = [
    {
      id: "phone" as const,
      name: "iPhone 14 Pro",
      resolution: "393 × 852",
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "tablet" as const,
      name: "iPad Pro 11",
      resolution: "834 × 1194",
      icon: Tablet,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "desktop" as const,
      name: "Desktop HD",
      resolution: "1920 × 1080",
      icon: Monitor,
      color: "from-green-500 to-teal-500",
    },
  ];

  const currentDevice = devices.find(d => d.id === selectedDevice)!;
  const Icon = currentDevice.icon;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentDevice.color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Device Preview</h3>
            <p className="text-sm text-gray-400">{currentDevice.name} • {currentDevice.resolution}</p>
          </div>
        </div>

        <button
          onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
          className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Rotate
        </button>
      </div>

      {/* Device Selector */}
      <div className="grid grid-cols-3 gap-4">
        {devices.map((device) => {
          const DeviceIcon = device.icon;
          return (
            <button
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedDevice === device.id
                  ? `border-cyan-400 bg-gradient-to-br ${device.color} bg-opacity-10`
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${device.color} flex items-center justify-center`}>
                  <DeviceIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white mb-1">{device.name}</p>
                  <p className="text-xs text-gray-400">{device.resolution}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Orientation Display */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Current Orientation</span>
          </div>
          <span className="text-sm font-bold text-white capitalize">{orientation}</span>
        </div>
      </div>
    </div>
  );
}
