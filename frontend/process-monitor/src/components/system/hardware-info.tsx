"use client";

import { Cpu, Monitor, HardDrive, Zap, Thermometer, Fan } from "lucide-react";

export function HardwareInfo() {
  const hardware = [
    {
      category: "Processor",
      icon: Cpu,
      color: "from-blue-500 to-cyan-500",
      items: [
        { label: "Model", value: "Intel Core i7-12700K" },
        { label: "Cores", value: "12 (8P + 4E)" },
        { label: "Threads", value: "20" },
        { label: "Base Clock", value: "3.6 GHz" },
        { label: "Max Turbo", value: "5.0 GHz" },
        { label: "Cache", value: "25 MB L3" },
      ],
    },
    {
      category: "Graphics",
      icon: Monitor,
      color: "from-purple-500 to-pink-500",
      items: [
        { label: "GPU", value: "NVIDIA GeForce RTX 4070" },
        { label: "VRAM", value: "12 GB GDDR6X" },
        { label: "Driver", value: "546.33 (Latest)" },
        { label: "Resolution", value: "2560 x 1440 @ 144Hz" },
        { label: "DirectX", value: "12 Ultimate" },
        { label: "CUDA Cores", value: "5888" },
      ],
    },
    {
      category: "Motherboard",
      icon: HardDrive,
      color: "from-green-500 to-teal-500",
      items: [
        { label: "Manufacturer", value: "ASUS" },
        { label: "Model", value: "ROG STRIX Z790-E" },
        { label: "Chipset", value: "Intel Z790" },
        { label: "BIOS", value: "v2103 (2024-10-15)" },
        { label: "PCIe", value: "Gen 5.0" },
        { label: "Memory Slots", value: "4 x DDR5 DIMM" },
      ],
    },
    {
      category: "Power & Cooling",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      items: [
        { label: "PSU", value: "850W 80+ Gold" },
        { label: "CPU Cooler", value: "AIO 280mm" },
        { label: "Case Fans", value: "6 x 120mm RGB" },
        { label: "CPU Temp", value: "62°C" },
        { label: "GPU Temp", value: "68°C" },
        { label: "Power Draw", value: "245W" },
      ],
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Hardware Information</h3>
          <p className="text-sm text-gray-400">Detailed component specifications</p>
        </div>
      </div>

      {/* Hardware Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {hardware.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="p-5 bg-white/5 rounded-xl border border-white/10">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-base font-bold text-white">{section.category}</h4>
              </div>

              {/* Section Items */}
              <div className="space-y-3">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="text-sm font-medium text-white text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensors Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-orange-400" />
          Live Sensors
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <p className="text-xs text-gray-400">CPU Temp</p>
            </div>
            <p className="text-lg font-bold text-orange-400">62°C</p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-3 h-3 text-red-400" />
              <p className="text-xs text-gray-400">GPU Temp</p>
            </div>
            <p className="text-lg font-bold text-red-400">68°C</p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Fan className="w-3 h-3 text-cyan-400" />
              <p className="text-xs text-gray-400">CPU Fan</p>
            </div>
            <p className="text-lg font-bold text-cyan-400">1450 RPM</p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <p className="text-xs text-gray-400">Power</p>
            </div>
            <p className="text-lg font-bold text-yellow-400">245W</p>
          </div>
        </div>
      </div>
    </div>
  );
}
