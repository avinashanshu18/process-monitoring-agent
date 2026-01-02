"use client";

import { useState } from "react";
import { Shield, Lock, Key, Smartphone, Monitor, AlertTriangle, CheckCircle, X } from "lucide-react";

interface ActiveSession {
  id: number;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 1,
      device: "Chrome on Windows (Current)",
      location: "Mumbai, India",
      ip: "192.168.1.105",
      lastActive: "Active now",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "Mumbai, India",
      ip: "192.168.1.127",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: 3,
      device: "Firefox on Ubuntu",
      location: "Bangalore, India",
      ip: "49.207.45.123",
      lastActive: "3 days ago",
      current: false,
    },
  ]);

  const [loginNotifications, setLoginNotifications] = useState(true);
  const [suspiciousActivityAlerts, setSuspiciousActivityAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const revokeSession = (id: number) => {
    if (confirm("Are you sure you want to revoke this session?")) {
      setSessions(sessions.filter(session => session.id !== id));
    }
  };

  const revokeAllSessions = () => {
    if (confirm("This will log you out of all other devices. Continue?")) {
      setSessions(sessions.filter(session => session.current));
    }
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                twoFactorEnabled ? "bg-green-500/20" : "bg-gray-500/20"
              }`}>
                {twoFactorEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  {twoFactorEnabled ? "2FA Enabled" : "2FA Not Enabled"}
                </p>
                <p className="text-xs text-gray-400">
                  {twoFactorEnabled 
                    ? "Your account is protected with two-factor authentication" 
                    : "Protect your account with an extra layer of security"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                twoFactorEnabled
                  ? "bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400"
                  : "bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400"
              }`}
            >
              {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </div>
        </div>

        {twoFactorEnabled && (
          <div className="space-y-3">
            <div className="p-4 bg-cyan-500/5 border border-cyan-400/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">Authenticator App</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Currently using Google Authenticator
                  </p>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Reconfigure →
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm font-medium text-white mb-2">Backup Codes</p>
              <p className="text-xs text-gray-400 mb-3">
                Save backup codes in case you lose access to your authenticator app
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded text-xs font-medium transition-all">
                  View Codes
                </button>
                <button className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded text-xs font-medium transition-all">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Active Sessions</h3>
              <p className="text-sm text-gray-400">Manage devices where you're signed in</p>
            </div>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={revokeAllSessions}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg text-sm font-medium transition-all"
            >
              Revoke All Others
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border transition-all ${
                session.current
                  ? "bg-green-500/5 border-green-400/20"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    session.current ? "bg-green-500/20" : "bg-blue-500/20"
                  }`}>
                    <Monitor className={`w-5 h-5 ${
                      session.current ? "text-green-400" : "text-blue-400"
                    }`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{session.device}</p>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-400/30 rounded text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{session.location}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>IP: {session.ip}</span>
                      <span>•</span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                </div>

                {!session.current && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded transition-all"
                    title="Revoke session"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Activity */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Login Activity</h3>
            <p className="text-sm text-gray-400">Recent login attempts and notifications</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Login Notifications</p>
              <p className="text-xs text-gray-400">Get notified of new login attempts</p>
            </div>
            <button
              onClick={() => setLoginNotifications(!loginNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                loginNotifications ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                loginNotifications ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Suspicious Activity Alerts</p>
              <p className="text-xs text-gray-400">Alert on unusual login patterns</p>
            </div>
            <button
              onClick={() => setSuspiciousActivityAlerts(!suspiciousActivityAlerts)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                suspiciousActivityAlerts ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                suspiciousActivityAlerts ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm font-medium text-white mb-3">Recent Login Activity</p>
          <div className="space-y-2">
            {[
              { time: "Just now", location: "Mumbai, India", status: "success", ip: "192.168.1.105" },
              { time: "2 hours ago", location: "Mumbai, India", status: "success", ip: "192.168.1.127" },
              { time: "Yesterday", location: "Pune, India", status: "failed", ip: "103.45.78.90" },
              { time: "3 days ago", location: "Bangalore, India", status: "success", ip: "49.207.45.123" },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-xs"
              >
                <div className="flex items-center gap-3">
                  {activity.status === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-white">{activity.location}</p>
                    <p className="text-gray-400">IP: {activity.ip}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">{activity.time}</p>
                  <p className={activity.status === "success" ? "text-green-400" : "text-red-400"}>
                    {activity.status === "success" ? "Success" : "Failed"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Timeout */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Session Settings</h3>
            <p className="text-sm text-gray-400">Configure session timeout and security</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
              <option value="0">Never</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">
              Automatically log out after period of inactivity
            </p>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-400/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-400 mb-1">Security Recommendation</p>
                <p className="text-xs text-gray-400">
                  For enhanced security, we recommend setting a session timeout of 30 minutes or less, 
                  especially when accessing from public or shared devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Security Audit Log</h4>
        <div className="space-y-2">
          {[
            { action: "Password changed", time: "5 days ago", status: "success" },
            { action: "2FA enabled", time: "1 week ago", status: "success" },
            { action: "API key created", time: "2 weeks ago", status: "success" },
            { action: "Failed login attempt", time: "3 weeks ago", status: "warning" },
          ].map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {log.status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
                <p className="text-sm text-white">{log.action}</p>
              </div>
              <p className="text-xs text-gray-400">{log.time}</p>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all">
          View Full Audit Log
        </button>
      </div>

      {/* Save Button */}
      <div className="glass rounded-xl p-6">
        <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20">
          Save Security Settings
        </button>
      </div>
    </div>
  );
}
