"use client";

import { useState } from "react";
import { FileText, Download, Eye, Calendar, Filter } from "lucide-react";

interface Report {
  id: number;
  name: string;
  framework: string;
  type: "audit" | "assessment" | "certification" | "summary";
  date: string;
  period: string;
  status: "final" | "draft" | "pending";
  size: string;
  pages: number;
}

export function ComplianceReports() {
  const [filterType, setFilterType] = useState("all");

  const reports: Report[] = [
    {
      id: 1,
      name: "SOC 2 Type II Annual Report",
      framework: "SOC 2",
      type: "audit",
      date: "2024-11-15",
      period: "2024 Q4",
      status: "final",
      size: "3.2 MB",
      pages: 45,
    },
    {
      id: 2,
      name: "ISO 27001 Certification Report",
      framework: "ISO 27001",
      type: "certification",
      date: "2024-10-20",
      period: "2024 Annual",
      status: "final",
      size: "2.8 MB",
      pages: 38,
    },
    {
      id: 3,
      name: "GDPR Compliance Assessment",
      framework: "GDPR",
      type: "assessment",
      date: "2024-11-01",
      period: "2024 Q3",
      status: "draft",
      size: "1.5 MB",
      pages: 22,
    },
    {
      id: 4,
      name: "HIPAA Security Summary",
      framework: "HIPAA",
      type: "summary",
      date: "2024-11-10",
      period: "2024 Q4",
      status: "final",
      size: "890 KB",
      pages: 12,
    },
    {
      id: 5,
      name: "Quarterly Compliance Overview",
      framework: "All",
      type: "summary",
      date: "2024-12-01",
      period: "2024 Q4",
      status: "pending",
      size: "1.2 MB",
      pages: 18,
    },
  ];

  const filteredReports = filterType === "all" 
    ? reports 
    : reports.filter(r => r.type === filterType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "final":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      case "draft":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "pending":
        return "text-blue-400 bg-blue-500/10 border-blue-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "audit":
        return "text-red-400 bg-red-500/10";
      case "certification":
        return "text-purple-400 bg-purple-500/10";
      case "assessment":
        return "text-blue-400 bg-blue-500/10";
      case "summary":
        return "text-cyan-400 bg-cyan-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Compliance Reports</h3>
            <p className="text-sm text-gray-400">{filteredReports.length} reports available</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {["all", "audit", "certification", "assessment", "summary"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize ${
              filterType === type
                ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{report.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{report.period}</span>
                  <span>•</span>
                  <span>{report.pages} pages</span>
                  <span>•</span>
                  <span>{report.size}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Framework: {report.framework}</span>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Preview">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 transition-all" title="Download">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
