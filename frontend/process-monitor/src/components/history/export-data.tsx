"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Database, Calendar } from "lucide-react";

export function ExportData() {
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("7d");
  const [metrics, setMetrics] = useState({
    cpu: true,
    memory: true,
    network: true,
    disk: true,
    processes: false,
    security: false,
  });

  const formats = [
    { id: "csv", name: "CSV", icon: FileSpreadsheet, description: "Comma-separated values" },
    { id: "json", name: "JSON", icon: FileText, description: "JavaScript Object Notation" },
    { id: "xlsx", name: "Excel", icon: FileSpreadsheet, description: "Microsoft Excel format" },
    { id: "sql", name: "SQL", icon: Database, description: "Database dump" },
  ];

  const handleExport = () => {
    const selectedMetrics = Object.entries(metrics)
      .filter(([_, enabled]) => enabled)
      .map(([metric]) => metric);

    alert(`Exporting ${selectedMetrics.join(", ")} data as ${exportFormat.toUpperCase()} for ${dateRange}`);
  };

  const handleToggleMetric = (metric: string) => {
    setMetrics({ ...metrics, [metric]: !metrics[metric as keyof typeof metrics] });
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Export Historical Data</h3>
          <p className="text-sm text-gray-400">Download data for external analysis</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Format & Settings */}
        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              {formats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      exportFormat === format.id
                        ? "border-cyan-400 bg-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${
                      exportFormat === format.id ? "text-cyan-400" : "text-gray-400"
                    }`} />
                    <p className={`text-sm font-medium mb-1 ${
                      exportFormat === format.id ? "text-cyan-400" : "text-white"
                    }`}>
                      {format.name}
                    </p>
                    <p className="text-xs text-gray-400">{format.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Metrics Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">Include Metrics</label>
          <div className="space-y-2">
            {Object.entries(metrics).map(([metric, enabled]) => (
              <label
                key={metric}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
              >
                <span className="text-sm text-white capitalize">{metric.replace("_", " ")}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleToggleMetric(metric)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                />
              </label>
            ))}
          </div>

          {/* Additional Options */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-white mb-3">Additional Options</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500"
                  defaultChecked
                />
                <span className="text-xs text-gray-400">Include timestamps</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500"
                />
                <span className="text-xs text-gray-400">Compress file (ZIP)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500"
                />
                <span className="text-xs text-gray-400">Email when ready</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <Calendar className="w-4 h-4 inline mr-2" />
          Estimated file size: ~2.4 MB
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>
    </div>
  );
}
