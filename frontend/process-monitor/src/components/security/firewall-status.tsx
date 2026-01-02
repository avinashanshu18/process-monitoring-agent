"use client";

import { useState } from "react";
import { Shield, Lock, Unlock, Globe, Server, Eye, X } from "lucide-react";

interface FirewallRule {
  id: number;
  name: string;
  port: number;
  protocol: string;
  action: "allow" | "block";
  direction: "inbound" | "outbound";
  enabled: boolean;
}

export function FirewallStatus() {
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [rules, setRules] = useState<FirewallRule[]>([
    {
      id: 1,
      name: "HTTP",
      port: 80,
      protocol: "TCP",
      action: "allow",
      direction: "inbound",
      enabled: true,
    },
    {
      id: 2,
      name: "HTTPS",
      port: 443,
      protocol: "TCP",
      action: "allow",
      direction: "inbound",
      enabled: true,
    },
    {
      id: 3,
      name: "SSH",
      port: 22,
      protocol: "TCP",
      action: "block",
      direction: "inbound",
      enabled: true,
    },
    {
      id: 4,
      name: "MySQL",
      port: 3306,
      protocol: "TCP",
      action: "block",
      direction: "inbound",
      enabled: true,
    },
    {
      id: 5,
      name: "DNS",
      port: 53,
      protocol: "UDP",
      action: "allow",
      direction: "outbound",
      enabled: true,
    },
  ]);

  const toggleFirewall = () => {
    setFirewallEnabled(!firewallEnabled);
  };

  const toggleRule = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const blockedCount = rules.filter(r => r.action === "block" && r.enabled).length;
  const allowedCount = rules.filter(r => r.action === "allow" && r.enabled).length;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center ${
            firewallEnabled ? "from-blue-500 to-cyan-500" : "from-gray-500 to-gray-600"
          }`}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Firewall Status</h3>
            <p className="text-sm text-gray-400">
              {firewallEnabled ? "Protection active" : "Protection disabled"}
            </p>
          </div>
        </div>

        {/* Toggle Firewall */}
        <button
          onClick={toggleFirewall}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            firewallEnabled ? "bg-green-500" : "bg-gray-600"
          }`}
        >
          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
            firewallEnabled ? "translate-x-7" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <Lock className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Blocked</p>
          <p className="text-lg font-bold text-red-400">{blockedCount}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <Unlock className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Allowed</p>
          <p className="text-lg font-bold text-green-400">{allowedCount}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg text-center">
          <Globe className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-bold text-blue-400">{rules.length}</p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white">Firewall Rules</h4>
          <button className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-xs font-medium transition-all">
            + Add Rule
          </button>
        </div>

        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-3 rounded-lg border transition-all ${
              rule.enabled
                ? "bg-white/5 border-white/10"
                : "bg-white/[0.02] border-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Enable/Disable Toggle */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  rule.enabled
                    ? rule.action === "allow"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {rule.action === "allow" ? (
                  <Unlock className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </button>

              {/* Rule Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">{rule.name}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    rule.action === "allow"
                      ? "bg-green-500/10 text-green-400 border border-green-400/30"
                      : "bg-red-500/10 text-red-400 border border-red-400/30"
                  }`}>
                    {rule.action.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-400/30 rounded text-xs font-medium">
                    {rule.protocol}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Port: {rule.port}</span>
                  <span>•</span>
                  <span className="capitalize">{rule.direction}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-3">Recent Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Blocked connections (24h)</span>
            <span className="text-red-400 font-mono">1,247</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Allowed connections (24h)</span>
            <span className="text-green-400 font-mono">45,892</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Last threat blocked</span>
            <span className="text-yellow-400 font-mono">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
