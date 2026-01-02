"use client";

import { useState } from "react";
import { Image, Upload, Trash2, Eye } from "lucide-react";

export function LogoCustomization() {
  const [logos, setLogos] = useState([
    { id: 1, name: "Primary Logo", type: "Light", size: "256x256", url: null },
    { id: 2, name: "Dark Logo", type: "Dark", size: "256x256", url: null },
    { id: 3, name: "Favicon", type: "Icon", size: "32x32", url: null },
    { id: 4, name: "Email Logo", type: "Email", size: "600x200", url: null },
  ]);

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Image className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Logo Customization</h3>
          <p className="text-sm text-gray-400">Upload and manage brand logos</p>
        </div>
      </div>

      {/* Logo Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
          >
            {/* Upload Area */}
            <div className="mb-4">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg border-2 border-dashed border-white/20 hover:border-cyan-400/50 transition-all flex items-center justify-center cursor-pointer group-hover:border-cyan-400">
                {logo.url ? (
                  <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to upload</p>
                    <p className="text-xs text-gray-600 mt-1">{logo.size}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-white mb-1">{logo.name}</h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded">{logo.type}</span>
                <span className="text-gray-400">{logo.size}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded text-xs font-medium transition-all flex items-center justify-center gap-1">
                <Upload className="w-3 h-3" />
                Upload
              </button>
              {logo.url && (
                <>
                  <button className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded text-xs transition-all">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded text-xs transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
        <p className="text-sm font-medium text-blue-400 mb-2">📋 Logo Guidelines</p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Use PNG or SVG format for best quality</li>
          <li>• Transparent background recommended</li>
          <li>• Maximum file size: 2MB per image</li>
          <li>• High resolution logos work best (2x size recommended)</li>
        </ul>
      </div>
    </div>
  );
}
