"use client";

import { Wifi, Cable, Radio, CheckCircle, XCircle } from "lucide-react";

export function NetworkInterfaces() {
  const interfaces = [
    {
      name: "Wi-Fi",
      adapter: "Intel(R) Wi-Fi 6E AX211 160MHz",
      status: "Connected",
      icon: Wifi,
      color: "from-green-500 to-teal-500",
      ipv4: "192.168.1.105",
      ipv6: "fe80::a1b2:c3d4:e5f6:7890",
      mac: "A4:B1:C2:D3:E4:F5",
      speed: "1200 Mbps",
      received: "142.8 GB",
      sent: "15.3 GB",
      isActive: true,
    },
    {
      name: "Ethernet",
      adapter: "Realtek PCIe GbE Family Controller",
      status: "Disconnected",
      icon: Cable,
      color: "from-gray-500 to-gray-600",
      ipv4: "N/A",
      ipv6: "N/A",
      mac: "B5:C2:D3:E4:F5:A6",
      speed: "N/A",
      received: "0 GB",
      sent: "0 GB",
      isActive: false,
    },
    {
      name: "Bluetooth",
      adapter: "Intel(R) Wireless Bluetooth(R)",
      status: "Connected",
      icon: Radio,
      color: "from-blue-500 to-cyan-500",
      ipv4: "N/A",
      ipv6: "N/A",
      mac: "C6:D3:E4:F5:A6:B7",
      speed: "3 Mbps",
      received: "0.2 GB",
      sent: "0.1 GB",
      isActive: true,
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Network Interfaces</h3>
          <p className="text-sm text-gray-400">{interfaces.length} adapters detected</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-400/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-400">
              {interfaces.filter(i => i.isActive).length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Interfaces Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interfaces.map((iface, index) => {
          const Icon = iface.icon;
          return (
            <div
              key={index}
              className={`p-5 rounded-xl border transition-all duration-200 ${
                iface.isActive
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iface.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{iface.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{iface.adapter}</p>
                  </div>
                </div>

                {iface.isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                  iface.isActive
                    ? "bg-green-500/10 text-green-400 border border-green-400/30"
                    : "bg-gray-500/10 text-gray-400 border border-gray-400/30"
                }`}>
                  {iface.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">IPv4</span>
                  <span className="text-white font-mono">{iface.ipv4}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">MAC</span>
                  <span className="text-white font-mono">{iface.mac}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Speed</span>
                  <span className="text-white font-mono">{iface.speed}</span>
                </div>

                {/* Data Transfer */}
                <div className="pt-3 mt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Received</p>
                    <p className="text-sm font-bold text-green-400">{iface.received}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Sent</p>
                    <p className="text-sm font-bold text-blue-400">{iface.sent}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
