"use client";

import { useState } from "react";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  status: "active" | "revoked";
}

export function ApiKeysSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 1,
      name: "Production API Key",
      key: "pm_live_1234567890abcdefghijklmnopqrstuvwxyz",
      created: "2024-11-15",
      lastUsed: "2 hours ago",
      permissions: ["read", "write"],
      status: "active",
    },
    {
      id: 2,
      name: "Development API Key",
      key: "pm_test_abcdefghijklmnopqrstuvwxyz1234567890",
      created: "2024-10-20",
      lastUsed: "5 minutes ago",
      permissions: ["read"],
      status: "active",
    },
    {
      id: 3,
      name: "Legacy API Key",
      key: "pm_live_oldkey123456789abcdefghijklmnopqrstu",
      created: "2024-08-10",
      lastUsed: "30 days ago",
      permissions: ["read", "write", "delete"],
      status: "revoked",
    },
  ]);

  const [showKey, setShowKey] = useState<{ [key: number]: boolean }>({});
  const [copied, setCopied] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleKeyVisibility = (id: number) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
  };

  const copyToClipboard = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const revokeKey = (id: number) => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, status: "revoked" as const } : key
      ));
    }
  };

  const deleteKey = (id: number) => {
    if (confirm("Are you sure you want to delete this API key permanently?")) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + "•".repeat(20) + key.substring(key.length - 8);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">API Keys</h3>
              <p className="text-sm text-gray-400">
                Manage your API keys for programmatic access
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
          >
            <Plus className="w-4 h-4" />
            Create New Key
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass rounded-xl p-4 border border-blue-400/30 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400 mb-1">Keep your API keys secure</p>
            <p className="text-xs text-gray-400">
              Never share your API keys publicly or commit them to version control. 
              Use environment variables and rotate keys regularly.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={`glass rounded-xl p-6 border transition-all ${
              apiKey.status === "active" 
                ? "border-white/10" 
                : "border-red-400/20 bg-red-500/5 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-base font-bold text-white">{apiKey.name}</h4>
                  {apiKey.status === "active" ? (
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-400/30 rounded text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-400/30 rounded text-xs font-medium">
                      Revoked
                    </span>
                  )}
                </div>

                {/* API Key Display */}
                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 px-3 py-2 bg-black/30 rounded font-mono text-sm text-cyan-400 border border-white/10">
                    {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all"
                    title={showKey[apiKey.id] ? "Hide key" : "Show key"}
                  >
                    {showKey[apiKey.id] ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                    className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded transition-all"
                    title="Copy to clipboard"
                  >
                    {copied === apiKey.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Permissions */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Permissions:</span>
                  {apiKey.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-400/30 rounded text-xs capitalize"
                    >
                      {perm}
                    </span>
                  ))}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                  <div>
                    <span>Created:</span>
                    <span className="text-white ml-2">{apiKey.created}</span>
                  </div>
                  <div>
                    <span>Last Used:</span>
                    <span className="text-white ml-2">{apiKey.lastUsed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
              {apiKey.status === "active" && (
                <button
                  onClick={() => revokeKey(apiKey.id)}
                  className="flex-1 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-lg text-sm font-medium transition-all"
                >
                  Revoke Key
                </button>
              )}
              <button
                onClick={() => deleteKey(apiKey.id)}
                className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Documentation */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">API Documentation</h4>
        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Base URL</p>
            <code className="text-sm text-cyan-400 font-mono">https://api.processmon.com/v1</code>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Authentication Header</p>
            <code className="text-sm text-cyan-400 font-mono block">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Example Request</p>
            <pre className="text-xs text-cyan-400 font-mono overflow-x-auto">
{`curl -X GET "https://api.processmon.com/v1/processes" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View Full Documentation →
          </a>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">API Usage (Last 30 Days)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-2xl font-bold text-white mb-1">124,567</p>
            <p className="text-xs text-gray-400">Total Requests</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-400 mb-1">99.8%</p>
            <p className="text-xs text-gray-400">Success Rate</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-2xl font-bold text-cyan-400 mb-1">45ms</p>
            <p className="text-xs text-gray-400">Avg Response</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-400 mb-1">23</p>
            <p className="text-xs text-gray-400">Rate Limit Hits</p>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Rate Limits</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-400">Requests per minute</span>
            <span className="text-sm font-bold text-white">1,000</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-400">Requests per hour</span>
            <span className="text-sm font-bold text-white">50,000</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-400">Concurrent connections</span>
            <span className="text-sm font-bold text-white">100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
