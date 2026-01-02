"use client";

import { useState } from "react";
import { Globe, Lock, Shield, X, Eye, Search } from "lucide-react";

interface Connection {
  id: number;
  protocol: string;
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: string;
  process: string;
  pid: number;
}

export function ActiveConnections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<string>("all");

  const connections: Connection[] = [
    {
      id: 1,
      protocol: "TCP",
      localAddress: "192.168.1.105",
      localPort: 54321,
      remoteAddress: "142.250.185.142",
      remotePort: 443,
      state: "ESTABLISHED",
      process: "chrome.exe",
      pid: 1024,
    },
    {
      id: 2,
      protocol: "TCP",
      localAddress: "192.168.1.105",
      localPort: 54322,
      remoteAddress: "20.189.173.12",
      remotePort: 443,
      state: "ESTABLISHED",
      process: "code.exe",
      pid: 2048,
    },
    {
      id: 3,
      protocol: "TCP",
      localAddress: "192.168.1.105",
      localPort: 54323,
      remoteAddress: "162.159.134.233",
      remotePort: 443,
      state: "ESTABLISHED",
      process: "discord.exe",
      pid: 3072,
    },
    {
      id: 4,
      protocol: "TCP",
      localAddress: "0.0.0.0",
      localPort: 3000,
      remoteAddress: "0.0.0.0",
      remotePort: 0,
      state: "LISTENING",
      process: "node.exe",
      pid: 4096,
    },
    {
      id: 5,
      protocol: "UDP",
      localAddress: "0.0.0.0",
      localPort: 5353,
      remoteAddress: "*",
      remotePort: 0,
      state: "LISTENING",
      process: "dns.exe",
      pid: 5120,
    },
    {
      id: 6,
      protocol: "TCP",
      localAddress: "192.168.1.105",
      localPort: 54324,
      remoteAddress: "151.101.1.140",
      remotePort: 443,
      state: "TIME_WAIT",
      process: "chrome.exe",
      pid: 1024,
    },
    {
      id: 7,
      protocol: "TCP",
      localAddress: "192.168.1.105",
      localPort: 54325,
      remoteAddress: "140.82.121.4",
      remotePort: 443,
      state: "ESTABLISHED",
      process: "git.exe",
      pid: 6144,
    },
    {
      id: 8,
      protocol: "TCP",
      localAddress: "192.168.1.105",
      localPort: 54326,
      remoteAddress: "185.125.190.58",
      remotePort: 443,
      state: "ESTABLISHED",
      process: "spotify.exe",
      pid: 7168,
    },
  ];

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = 
      conn.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.remoteAddress.includes(searchTerm) ||
      conn.localAddress.includes(searchTerm);
    
    const matchesFilter = filterState === "all" || conn.state === filterState;
    
    return matchesSearch && matchesFilter;
  });

  const states = ["all", "ESTABLISHED", "LISTENING", "TIME_WAIT"];

  const getStateColor = (state: string) => {
    switch (state) {
      case "ESTABLISHED":
        return "bg-green-500/10 text-green-400 border-green-400/30";
      case "LISTENING":
        return "bg-blue-500/10 text-blue-400 border-blue-400/30";
      case "TIME_WAIT":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-400/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-400/30";
    }
  };

  const getProtocolColor = (protocol: string) => {
    return protocol === "TCP" 
      ? "bg-cyan-500/10 text-cyan-400 border-cyan-400/30"
      : "bg-purple-500/10 text-purple-400 border-purple-400/30";
  };

  const handleKillConnection = (id: number, process: string) => {
    if (confirm(`Close connection for ${process}?`)) {
      console.log(`Closing connection ${id}`);
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Active Connections</h3>
            <p className="text-sm text-gray-400">{filteredConnections.length} connections</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* State Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {states.map((state) => (
          <button
            key={state}
            onClick={() => setFilterState(state)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterState === state
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {state === "all" ? "All" : state}
            {state !== "all" && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
                {connections.filter(c => c.state === state).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Connections Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-t-lg text-xs text-gray-400 font-medium">
            <div className="col-span-1">Protocol</div>
            <div className="col-span-2">Local Address</div>
            <div className="col-span-2">Remote Address</div>
            <div className="col-span-1">State</div>
            <div className="col-span-2">Process</div>
            <div className="col-span-1">PID</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {filteredConnections.length === 0 ? (
              <div className="py-12 text-center">
                <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No connections found</p>
              </div>
            ) : (
              filteredConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-white/5 transition-colors items-center group"
                >
                  {/* Protocol */}
                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getProtocolColor(conn.protocol)}`}>
                      {conn.protocol}
                    </span>
                  </div>

                  {/* Local Address */}
                  <div className="col-span-2">
                    <p className="text-sm text-white font-mono">{conn.localAddress}</p>
                    <p className="text-xs text-gray-400">:{conn.localPort}</p>
                  </div>

                  {/* Remote Address */}
                  <div className="col-span-2">
                    <p className="text-sm text-white font-mono truncate" title={conn.remoteAddress}>
                      {conn.remoteAddress}
                    </p>
                    <p className="text-xs text-gray-400">
                      {conn.remotePort > 0 ? `:${conn.remotePort}` : "-"}
                    </p>
                  </div>

                  {/* State */}
                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStateColor(conn.state)}`}>
                      {conn.state}
                    </span>
                  </div>

                  {/* Process */}
                  <div className="col-span-2">
                    <p className="text-sm text-white font-medium truncate">{conn.process}</p>
                  </div>

                  {/* PID */}
                  <div className="col-span-1">
                    <span className="text-sm text-gray-400 font-mono">{conn.pid}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <button
                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all opacity-0 group-hover:opacity-100"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 transition-all opacity-0 group-hover:opacity-100"
                      title="Security Check"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleKillConnection(conn.id, conn.process)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      title="Close Connection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Connection Summary */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Established</p>
          <p className="text-xl font-bold text-green-400">
            {connections.filter(c => c.state === "ESTABLISHED").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Listening</p>
          <p className="text-xl font-bold text-blue-400">
            {connections.filter(c => c.state === "LISTENING").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">TCP</p>
          <p className="text-xl font-bold text-cyan-400">
            {connections.filter(c => c.protocol === "TCP").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">UDP</p>
          <p className="text-xl font-bold text-purple-400">
            {connections.filter(c => c.protocol === "UDP").length}
          </p>
        </div>
      </div>
    </div>
  );
}
