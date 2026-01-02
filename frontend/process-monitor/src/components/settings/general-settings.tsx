"use client";

import { useState } from "react";
import { Save, Moon, Sun, Globe, Clock, Palette } from "lucide-react";

export function GeneralSettings() {
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
    autoRefresh: true,
    refreshInterval: 5,
    compactMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings logic here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Appearance</h3>
            <p className="text-sm text-gray-400">Customize the look and feel</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSettings({ ...settings, theme: "dark" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === "dark"
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <Moon className={`w-6 h-6 mx-auto mb-2 ${
                  settings.theme === "dark" ? "text-cyan-400" : "text-gray-400"
                }`} />
                <p className={`text-sm font-medium ${
                  settings.theme === "dark" ? "text-cyan-400" : "text-gray-400"
                }`}>
                  Dark
                </p>
              </button>

              <button
                onClick={() => setSettings({ ...settings, theme: "light" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === "light"
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <Sun className={`w-6 h-6 mx-auto mb-2 ${
                  settings.theme === "light" ? "text-cyan-400" : "text-gray-400"
                }`} />
                <p className={`text-sm font-medium ${
                  settings.theme === "light" ? "text-cyan-400" : "text-gray-400"
                }`}>
                  Light
                </p>
              </button>
            </div>
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Compact Mode</p>
              <p className="text-xs text-gray-400">Reduce spacing and padding</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.compactMode ? "bg-cyan-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.compactMode ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Localization</h3>
            <p className="text-sm text-gray-400">Language and regional settings</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Time Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSettings({ ...settings, timeFormat: "12h" })}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  settings.timeFormat === "12h"
                    ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                12 Hour
              </button>
              <button
                onClick={() => setSettings({ ...settings, timeFormat: "24h" })}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  settings.timeFormat === "24h"
                    ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                24 Hour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Refresh */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Auto Refresh</h3>
            <p className="text-sm text-gray-400">Automatic data updates</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Enable Auto Refresh */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Enable Auto Refresh</p>
              <p className="text-xs text-gray-400">Automatically update dashboard data</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoRefresh: !settings.autoRefresh })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoRefresh ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.autoRefresh ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Refresh Interval */}
          {settings.autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.refreshInterval}
                onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between glass rounded-xl p-6">
        {saved && (
          <p className="text-sm text-green-400 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Settings saved successfully!
          </p>
        )}
        <div className={saved ? "" : "ml-auto"}>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
