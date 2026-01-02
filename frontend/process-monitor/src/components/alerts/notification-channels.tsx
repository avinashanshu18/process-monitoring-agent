"use client";

import { useState } from "react";
import { Mail, MessageSquare, Webhook, Smartphone, CheckCircle, XCircle, Settings } from "lucide-react";

interface Channel {
  id: number;
  name: string;
  type: "email" | "slack" | "webhook" | "sms";
  enabled: boolean;
  configured: boolean;
  details: string;
  lastUsed: string;
  successRate: number;
}

export function NotificationChannels() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 1,
      name: "Email Notifications",
      type: "email",
      enabled: true,
      configured: true,
      details: "avinash@example.com",
      lastUsed: "5 minutes ago",
      successRate: 98,
    },
    {
      id: 2,
      name: "Slack Alerts",
      type: "slack",
      enabled: true,
      configured: true,
      details: "#monitoring-alerts",
      lastUsed: "15 minutes ago",
      successRate: 100,
    },
    {
      id: 3,
      name: "Webhook Integration",
      type: "webhook",
      enabled: false,
      configured: true,
      details: "https://api.example.com/alerts",
      lastUsed: "2 hours ago",
      successRate: 95,
    },
    {
      id: 4,
      name: "SMS Alerts",
      type: "sms",
      enabled: false,
      configured: false,
      details: "Not configured",
      lastUsed: "Never",
      successRate: 0,
    },
  ]);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "slack":
        return MessageSquare;
      case "webhook":
        return Webhook;
      case "sms":
        return Smartphone;
      default:
        return Mail;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case "email":
        return "from-blue-500 to-cyan-500";
      case "slack":
        return "from-purple-500 to-pink-500";
      case "webhook":
        return "from-green-500 to-teal-500";
      case "sms":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const toggleChannel = (id: number) => {
    setChannels(channels.map(channel => 
      channel.id === id && channel.configured 
        ? { ...channel, enabled: !channel.enabled } 
        : channel
    ));
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Notification Channels</h3>
            <p className="text-sm text-gray-400">
              {channels.filter(c => c.enabled).length} active channels
            </p>
          </div>
        </div>
      </div>

      {/* Channels List */}
      <div className="space-y-3">
        {channels.map((channel) => {
          const Icon = getChannelIcon(channel.type);
          return (
            <div
              key={channel.id}
              className={`p-4 rounded-lg border transition-all ${
                channel.enabled 
                  ? "bg-white/5 border-white/10" 
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getChannelColor(channel.type)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{channel.name}</h4>
                        {channel.configured ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{channel.details}</p>
                    </div>

                    {/* Toggle */}
                    {channel.configured && (
                      <button
                        onClick={() => toggleChannel(channel.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          channel.enabled ? "bg-green-500" : "bg-gray-600"
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          channel.enabled ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  {channel.configured && (
                    <div className="grid grid-cols-2 gap-3 mb-3 p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-xs text-gray-400">Last Used</p>
                        <p className="text-xs font-medium text-white">{channel.lastUsed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Success Rate</p>
                        <p className={`text-xs font-medium ${
                          channel.successRate >= 95 ? "text-green-400" :
                          channel.successRate >= 80 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {channel.successRate}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <button className="w-full px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded text-xs font-medium transition-all flex items-center justify-center gap-1">
                    <Settings className="w-3 h-3" />
                    {channel.configured ? "Configure" : "Setup Channel"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Channel */}
      <button className="w-full mt-4 py-3 border-2 border-dashed border-white/20 hover:border-cyan-400/50 rounded-lg text-sm text-gray-400 hover:text-cyan-400 font-medium transition-all flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" />
        Add New Channel
      </button>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Total Notifications (24h)</span>
          <span className="text-white font-mono">247</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>Delivery Success Rate</span>
          <span className="text-green-400 font-mono">97.6%</span>
        </div>
      </div>
    </div>
  );
}
