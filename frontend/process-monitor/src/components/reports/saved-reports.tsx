"use client";

import { useState } from "react";
import { FileText, Download, Eye, Trash2, Calendar, FileSpreadsheet, File } from "lucide-react";

interface Report {
  id: number;
  name: string;
  type: string;
  format: "pdf" | "xlsx" | "csv";
  dateRange: string;
  generatedDate: string;
  size: string;
  downloads: number;
}

export function SavedReports() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      name: "Weekly Performance Summary",
      type: "Performance",
      format: "pdf",
      dateRange: "Dec 1-7, 2024",
      generatedDate: "Dec 8, 2024",
      size: "2.4 MB",
      downloads: 12,
    },
    {
      id: 2,
      name: "Monthly System Report",
      type: "System",
      format: "xlsx",
      dateRange: "Nov 2024",
      generatedDate: "Dec 1, 2024",
      size: "1.8 MB",
      downloads: 24,
    },
    {
      id: 3,
      name: "Security Audit Report",
      type: "Security",
      format: "pdf",
      dateRange: "Nov 15-30, 2024",
      generatedDate: "Nov 30, 2024",
      size: "3.1 MB",
      downloads: 8,
    },
    {
      id: 4,
      name: "Resource Usage Analysis",
      type: "Analytics",
      format: "csv",
      dateRange: "Last 90 days",
      generatedDate: "Dec 5, 2024",
      size: "856 KB",
      downloads: 15,
    },
    {
      id: 5,
      name: "Network Traffic Report",
      type: "Network",
      format: "pdf",
      dateRange: "Dec 1-7, 2024",
      generatedDate: "Dec 7, 2024",
      size: "1.2 MB",
      downloads: 6,
    },
  ]);

  const deleteReport = (id: number) => {
    if (confirm("Are you sure you want to delete this report?")) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return File;
      case "xlsx":
        return FileSpreadsheet;
      case "csv":
        return FileText;
      default:
        return FileText;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case "pdf":
        return "text-red-400 bg-red-500/10";
      case "xlsx":
        return "text-green-400 bg-green-500/10";
      case "csv":
        return "text-blue-400 bg-blue-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Saved Reports</h3>
            <p className="text-sm text-gray-400">{reports.length} reports available</p>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {reports.map((report) => {
          const FormatIcon = getFormatIcon(report.format);
          
          return (
            <div
              key={report.id}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getFormatColor(report.format)}`}>
                  <FormatIcon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{report.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.format.toUpperCase()}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{report.dateRange}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{report.downloads} downloads</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">Generated on {report.generatedDate}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Preview">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 transition-all" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Size</p>
            <p className="text-lg font-bold text-white">9.3 MB</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Downloads</p>
            <p className="text-lg font-bold text-green-400">{reports.reduce((acc, r) => acc + r.downloads, 0)}</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">This Month</p>
            <p className="text-lg font-bold text-blue-400">
              {reports.filter(r => r.generatedDate.includes("Dec")).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
