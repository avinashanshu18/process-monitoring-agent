"use client";

import { useState } from "react";
import { FileText, Download, Eye, Save, Calendar } from "lucide-react";

export function ReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [dateRange, setDateRange] = useState("7d");
  const [format, setFormat] = useState("pdf");
  const [metrics, setMetrics] = useState({
    cpu: true,
    memory: true,
    disk: true,
    network: true,
    processes: false,
    alerts: true,
    security: false,
  });

  const handleGenerateReport = () => {
    const selectedMetrics = Object.entries(metrics)
      .filter(([_, enabled]) => enabled)
      .map(([metric]) => metric);

    alert(`Generating ${format.toUpperCase()} report: "${reportName || 'Untitled Report'}"\nMetrics: ${selectedMetrics.join(", ")}\nPeriod: ${dateRange}`);
  };

  const handleToggleMetric = (metric: string) => {
    setMetrics({ ...metrics, [metric]: !metrics[metric as keyof typeof metrics] });
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Report Builder</h3>
          <p className="text-sm text-gray-400">Create custom performance reports</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Report Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Report Name</label>
            <input
              type="text"
              placeholder="e.g., Weekly Performance Summary"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          )}

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {["pdf", "xlsx", "csv"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    format === fmt
                      ? "border-blue-400 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className={`text-sm font-medium ${
                    format === fmt ? "text-blue-400" : "text-white"
                  }`}>
                    {fmt.toUpperCase()}
                  </p>
                </button>
              ))}
            </div>
          </div>
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
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    enabled ? "bg-blue-500/20" : "bg-gray-500/20"
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      enabled ? "text-blue-400" : "text-gray-400"
                    }`} />
                  </div>
                  <span className="text-sm text-white capitalize">
                    {metric.replace("_", " ")} {metric === "cpu" && "Usage"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleToggleMetric(metric)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </label>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Report Summary</p>
            <div className="space-y-1 text-xs text-white">
              <p>• {Object.values(metrics).filter(Boolean).length} metrics selected</p>
              <p>• Period: {dateRange === "custom" ? "Custom range" : dateRange}</p>
              <p>• Format: {format.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-3">
        <button
          onClick={handleGenerateReport}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Download className="w-4 h-4" />
          Generate & Download
        </button>

        <button className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg font-medium transition-all flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview
        </button>

        <button className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg font-medium transition-all flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Template
        </button>

        <button className="px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-lg font-medium transition-all flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule
        </button>
      </div>
    </div>
  );
}
