"use client";

import { useState } from "react";
import { Palette, Wand2, RotateCcw } from "lucide-react";

export function ColorTheme() {
  const [theme, setTheme] = useState({
    primary: "#06b6d4",
    secondary: "#8b5cf6",
    accent: "#f59e0b",
    background: "#0a0a0a",
    surface: "#1a1a1a",
    text: "#ffffff",
  });

  const presetThemes = [
    {
      name: "Ocean Blue",
      colors: { primary: "#06b6d4", secondary: "#3b82f6", accent: "#0ea5e9", background: "#0a0a0a", surface: "#1a1a1a", text: "#ffffff" },
    },
    {
      name: "Purple Haze",
      colors: { primary: "#8b5cf6", secondary: "#a855f7", accent: "#ec4899", background: "#0a0a0a", surface: "#1a1a1a", text: "#ffffff" },
    },
    {
      name: "Forest Green",
      colors: { primary: "#10b981", secondary: "#14b8a6", accent: "#22c55e", background: "#0a0a0a", surface: "#1a1a1a", text: "#ffffff" },
    },
    {
      name: "Sunset Orange",
      colors: { primary: "#f59e0b", secondary: "#f97316", accent: "#ef4444", background: "#0a0a0a", surface: "#1a1a1a", text: "#ffffff" },
    },
  ];

  const colorInputs = [
    { key: "primary", label: "Primary Color", description: "Main brand color" },
    { key: "secondary", label: "Secondary Color", description: "Supporting color" },
    { key: "accent", label: "Accent Color", description: "Highlights and CTAs" },
    { key: "background", label: "Background", description: "Main background" },
    { key: "surface", label: "Surface", description: "Cards and panels" },
    { key: "text", label: "Text Color", description: "Primary text" },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Color Theme</h3>
            <p className="text-sm text-gray-400">Customize your brand colors</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Preset Themes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-3">Quick Presets</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setTheme(preset.colors)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
            >
              <div className="flex gap-1 mb-2">
                {Object.values(preset.colors).slice(0, 3).map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-8 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-white">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Custom Colors
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          {colorInputs.map((input) => (
            <div key={input.key} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white mb-1">{input.label}</p>
                  <p className="text-xs text-gray-400">{input.description}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: theme[input.key as keyof typeof theme] }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme[input.key as keyof typeof theme]}
                  onChange={(e) => setTheme({ ...theme, [input.key]: e.target.value })}
                  className="w-full h-10 bg-white/10 border border-white/20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme[input.key as keyof typeof theme]}
                  onChange={(e) => setTheme({ ...theme, [input.key]: e.target.value })}
                  className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Preview */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: theme.background }}>
        <div className="p-4 rounded-lg" style={{ backgroundColor: theme.surface }}>
          <h4 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Preview</h4>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: theme.primary }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: theme.secondary }}
            >
              Secondary
            </button>
            <button
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: theme.accent }}
            >
              Accent
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20">
        Save Color Theme
      </button>
    </div>
  );
}
