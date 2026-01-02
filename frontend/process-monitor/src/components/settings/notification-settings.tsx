"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Volume2, VolumeX } from "lucide-react";

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    soundEnabled: true,
    
    // Email preferences
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: false,
    lowAlerts: false,
    
    // Notification types
    systemAlerts: true,
    securityAlerts: true,
    performanceAlerts: true,
    updateAlerts: false,
    
    // Digest
    dailyDigest: true,
    weeklyReport: true,
    digestTime: "09:00",
    
    // Do Not Disturb
    dndEnabled: false,
    dndStart: "22:00",
    dndEnd: "08:00",
  });

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Notification Channels</h3>
            <p className="text-sm text-gray-400">Choose how you want to be notified</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive alerts via email</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.emailNotifications ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.emailNotifications ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Slack */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Slack Notifications</p>
                <p className="text-xs text-gray-400">Send alerts to Slack channel</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, slackNotifications: !settings.slackNotifications })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.slackNotifications ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.slackNotifications ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">SMS Notifications</p>
                <p className="text-xs text-gray-400">Critical alerts via SMS</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.smsNotifications ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.smsNotifications ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Browser */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Browser Notifications</p>
                <p className="text-xs text-gray-400">Desktop push notifications</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, browserNotifications: !settings.browserNotifications })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.browserNotifications ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.browserNotifications ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sound Alerts</p>
                <p className="text-xs text-gray-400">Play sound for notifications</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.soundEnabled ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Severity */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Alert Severity Filters</h4>
        <p className="text-xs text-gray-400 mb-4">Choose which severity levels trigger notifications</p>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={settings.criticalAlerts}
              onChange={(e) => setSettings({ ...settings, criticalAlerts: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-red-500 focus:ring-2 focus:ring-red-500/50"
            />
            <span className="text-sm text-white">Critical</span>
            <span className="ml-auto px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-400/30 rounded text-xs">HIGH</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={settings.highAlerts}
              onChange={(e) => setSettings({ ...settings, highAlerts: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-500/50"
            />
            <span className="text-sm text-white">High</span>
            <span className="ml-auto px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-400/30 rounded text-xs">MED</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={settings.mediumAlerts}
              onChange={(e) => setSettings({ ...settings, mediumAlerts: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
            />
            <span className="text-sm text-white">Medium</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={settings.lowAlerts}
              onChange={(e) => setSettings({ ...settings, lowAlerts: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
            />
            <span className="text-sm text-white">Low</span>
          </label>
        </div>
      </div>

      {/* Notification Types */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Notification Types</h4>
        
        <div className="space-y-3">
          {[
            { key: "systemAlerts", label: "System Alerts", desc: "CPU, Memory, Disk alerts" },
            { key: "securityAlerts", label: "Security Alerts", desc: "Threats and vulnerabilities" },
            { key: "performanceAlerts", label: "Performance Alerts", desc: "Degradation warnings" },
            { key: "updateAlerts", label: "Update Alerts", desc: "Software updates available" },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={settings[item.key as keyof typeof settings] as boolean}
                onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Email Digest */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Email Digest</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Daily Digest</p>
              <p className="text-xs text-gray-400">Summary of daily activity</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, dailyDigest: !settings.dailyDigest })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.dailyDigest ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.dailyDigest ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Weekly Report</p>
              <p className="text-xs text-gray-400">Comprehensive weekly summary</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, weeklyReport: !settings.weeklyReport })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.weeklyReport ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.weeklyReport ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {settings.dailyDigest && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Digest Time</label>
              <input
                type="time"
                value={settings.digestTime}
                onChange={(e) => setSettings({ ...settings, digestTime: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Do Not Disturb */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Do Not Disturb</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Enable Do Not Disturb</p>
              <p className="text-xs text-gray-400">Silence non-critical notifications</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, dndEnabled: !settings.dndEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.dndEnabled ? "bg-purple-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.dndEnabled ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {settings.dndEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Start Time</label>
                <input
                  type="time"
                  value={settings.dndStart}
                  onChange={(e) => setSettings({ ...settings, dndStart: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">End Time</label>
                <input
                  type="time"
                  value={settings.dndEnd}
                  onChange={(e) => setSettings({ ...settings, dndEnd: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="glass rounded-xl p-6">
        <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20">
          Save Notification Preferences
        </button>
      </div>
    </div>
  );
}
