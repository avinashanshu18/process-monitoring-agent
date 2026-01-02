"use client";

import { useState } from "react";
import { Globe, Plus, CheckCircle, AlertCircle, Trash2, ExternalLink } from "lucide-react";

export function CustomDomain() {
  const [domains, setDomains] = useState([
    {
      id: 1,
      domain: "app.yourcompany.com",
      status: "active",
      verified: true,
      ssl: true,
      addedDate: "2024-11-15",
    },
    {
      id: 2,
      domain: "monitor.example.com",
      status: "pending",
      verified: false,
      ssl: false,
      addedDate: "2024-12-01",
    },
    {
      id: 3,
      domain: "dashboard.acme.io",
      status: "active",
      verified: true,
      ssl: true,
      addedDate: "2024-10-20",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "error":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const deleteDomain = (id: number) => {
    if (confirm("Are you sure you want to remove this domain?")) {
      setDomains(domains.filter(d => d.id !== id));
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Custom Domains</h3>
            <p className="text-sm text-gray-400">{domains.length} domains configured</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      {/* Domains List */}
      <div className="space-y-3 mb-6">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-sm font-bold text-white">{domain.domain}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(domain.status)}`}>
                    {domain.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    {domain.verified ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-yellow-400" />
                    )}
                    <span>{domain.verified ? "Verified" : "Pending verification"}</span>
                  </div>
                  <span>•</span>
                  <span>{domain.ssl ? "SSL Active" : "SSL Pending"}</span>
                  <span>•</span>
                  <span>Added {new Date(domain.addedDate).toLocaleDateString()}</span>
                </div>

                {!domain.verified && (
                  <div className="p-3 bg-yellow-500/5 border border-yellow-400/20 rounded text-xs">
                    <p className="text-yellow-400 font-medium mb-1">⚠️ Action Required</p>
                    <p className="text-gray-400">Add these DNS records to verify domain ownership:</p>
                    <div className="mt-2 p-2 bg-black/30 rounded font-mono text-gray-300">
                      TXT @ verify-{domain.id}.yourapp.com
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Visit">
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteDomain(domain.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DNS Configuration Guide */}
      <div className="p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
        <p className="text-sm font-medium text-blue-400 mb-2">📚 DNS Configuration</p>
        <div className="space-y-2 text-xs text-gray-400">
          <p>To connect your custom domain:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Add a CNAME record pointing to: <span className="font-mono text-white">app.yourservice.com</span></li>
            <li>Add the TXT record for verification</li>
            <li>Wait for DNS propagation (up to 48 hours)</li>
            <li>SSL certificate will be auto-issued once verified</li>
          </ol>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Active</p>
          <p className="text-lg font-bold text-green-400">
            {domains.filter(d => d.status === "active").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Pending</p>
          <p className="text-lg font-bold text-yellow-400">
            {domains.filter(d => d.status === "pending").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">SSL Enabled</p>
          <p className="text-lg font-bold text-blue-400">
            {domains.filter(d => d.ssl).length}
          </p>
        </div>
      </div>
    </div>
  );
}
