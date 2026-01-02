"use client";

import { Eye, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

export function BrandingPreview() {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const devices = [
    { id: "desktop" as const, icon: Monitor, label: "Desktop" },
    { id: "tablet" as const, icon: Tablet, label: "Tablet" },
    { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div className="glass rounded-xl p-6 sticky top-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Live Preview</h3>
          <p className="text-sm text-gray-400">See your changes</p>
        </div>
      </div>

      {/* Device Selector */}
      <div className="flex gap-2 mb-6">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <button
              key={device.id}
              onClick={() => setPreviewDevice(device.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                previewDevice === device.id
                  ? "bg-green-500/20 text-green-400 border border-green-400/30"
                  : "text-gray-400 bg-white/5 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {device.label}
            </button>
          );
        })}
      </div>

      {/* Preview Window */}
      <div className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-lg border border-white/10">
        {/* Browser Chrome */}
        <div className="mb-3 p-2 bg-white/5 rounded-t-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="px-3 py-1 bg-white/5 rounded text-xs text-gray-400 font-mono">
            app.yourcompany.com
          </div>
        </div>

        {/* Preview Content */}
        <div 
          className={`bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden transition-all ${
            previewDevice === "mobile" ? "mx-auto" : ""
          }`}
          style={{
            width: previewDevice === "mobile" ? "200px" : previewDevice === "tablet" ? "280px" : "100%",
          }}
        >
          {/* Header */}
          <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                YC
              </div>
              <span className="text-xs font-bold text-white">Your Company</span>
            </div>
            {previewDevice === "desktop" && (
              <div className="flex gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded" />
                <div className="w-16 h-1.5 bg-white/10 rounded" />
              </div>
            )}
          </div>

          {/* Dashboard Preview */}
          <div className="p-3 space-y-2">
            {/* Stats Cards */}
            <div className={`grid ${previewDevice === "mobile" ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
              {[1, 2, 3, 4].slice(0, previewDevice === "mobile" ? 2 : 4).map((i) => (
                <div key={i} className="p-2 bg-white/5 rounded">
                  <div className="w-full h-1 bg-white/10 rounded mb-1" />
                  <div className="w-1/2 h-1 bg-white/10 rounded" />
                </div>
              ))}
            </div>

            {/* Chart */}
            {previewDevice !== "mobile" && (
              <div className="p-3 bg-white/5 rounded">
                <div className="flex items-end justify-between h-16 gap-1">
                  {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t opacity-60"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* List Items */}
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2 bg-white/5 rounded flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-blue-500 rounded" />
                  <div className="flex-1">
                    <div className="w-full h-1 bg-white/10 rounded mb-1" />
                    <div className="w-2/3 h-1 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-green-500/5 border border-green-400/20 rounded-lg">
        <p className="text-xs text-gray-400 mb-2">
          <span className="text-green-400 font-medium">✓ Live Preview</span>
        </p>
        <p className="text-xs text-gray-400">
          Changes are applied in real-time. Save your settings to make them permanent.
        </p>
      </div>

      {/* Publish Button */}
      <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/20">
        Publish Changes
      </button>
    </div>
  );
}
