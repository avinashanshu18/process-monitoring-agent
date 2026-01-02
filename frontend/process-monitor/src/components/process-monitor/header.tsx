"use client";

import { useState } from "react";
import { Search, Filter, RefreshCw, ChevronDown } from "lucide-react";

interface ProcessHeaderProps {
  hosts: string[];
  selectedHost: string;
  onHostChange: (host: string) => void;
  status: string;
  onRefresh?: () => void;
  onFilterApply?: (filters: any) => void;
}

export function ProcessHeader({ 
  hosts, 
  selectedHost, 
  onHostChange, 
  status,
  onRefresh,
  onFilterApply 
}: ProcessHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cpuMin, setCpuMin] = useState("0");
  const [cpuMax, setCpuMax] = useState("100");
  const [memMin, setMemMin] = useState("0");
  const [memMax, setMemMax] = useState("999999");
  const [showFilters, setShowFilters] = useState(false);

  const handleApply = () => {
    onFilterApply?.({
      query: searchQuery,
      cpuMin: parseFloat(cpuMin),
      cpuMax: parseFloat(cpuMax),
      memMin: parseFloat(memMin),
      memMax: parseFloat(memMax),
    });
  };

  return (
    <header className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/5 z-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">Process Monitor</h1>
              <p className="text-xs text-gray-400">Real-time System Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Host Selector */}
            <div className="relative">
              <select
                value={selectedHost}
                onChange={(e) => onHostChange(e.target.value)}
                className="appearance-none glass px-4 py-2 pr-10 rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
              >
                {hosts.map((host) => (
                  <option key={host} value={host} className="bg-gray-900">
                    {host}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Badge */}
            <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 text-xs font-medium hidden sm:inline">{status}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 glass rounded-lg hover:bg-white/10 transition-colors ${showFilters ? 'bg-cyan-500/20 border-cyan-400/50' : ''}`}
              aria-label="Toggle Filters"
            >
              <Filter className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="glass rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or PID..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>

                {/* CPU Range */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 whitespace-nowrap">CPU %</label>
                  <input
                    type="number"
                    value={cpuMin}
                    onChange={(e) => setCpuMin(e.target.value)}
                    className="w-16 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-600">-</span>
                  <input
                    type="number"
                    value={cpuMax}
                    onChange={(e) => setCpuMax(e.target.value)}
                    className="w-16 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="0"
                    max="100"
                  />
                </div>

                {/* Memory Range */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 whitespace-nowrap">Mem MB</label>
                  <input
                    type="number"
                    value={memMin}
                    onChange={(e) => setMemMin(e.target.value)}
                    className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="0"
                  />
                  <span className="text-gray-600">-</span>
                  <input
                    type="number"
                    value={memMax}
                    onChange={(e) => setMemMax(e.target.value)}
                    className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="0"
                  />
                </div>

                {/* Apply Button */}
                <button
                  onClick={handleApply}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold rounded-lg transition-all duration-300 text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
