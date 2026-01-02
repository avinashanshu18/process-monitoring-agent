"use client";

import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

export function ComplianceChecks() {
  const checks = [
    {
      id: 1,
      name: "Data Encryption",
      category: "Security",
      status: "passed",
      lastChecked: "2 hours ago",
      framework: "SOC 2, ISO 27001",
    },
    {
      id: 2,
      name: "Access Controls",
      category: "Security",
      status: "passed",
      lastChecked: "5 hours ago",
      framework: "SOC 2, HIPAA",
    },
    {
      id: 3,
      name: "Data Retention Policy",
      category: "Privacy",
      status: "failed",
      lastChecked: "1 day ago",
      framework: "GDPR",
    },
    {
      id: 4,
      name: "Audit Logging",
      category: "Security",
      status: "warning",
      lastChecked: "3 hours ago",
      framework: "SOC 2, ISO 27001",
    },
    {
      id: 5,
      name: "Backup Procedures",
      category: "Operations",
      status: "passed",
      lastChecked: "6 hours ago",
      framework: "SOC 2, HIPAA",
    },
    {
      id: 6,
      name: "Incident Response",
      category: "Security",
      status: "pending",
      lastChecked: "12 hours ago",
      framework: "ISO 27001",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return CheckCircle;
      case "failed":
        return XCircle;
      case "warning":
        return AlertCircle;
      case "pending":
        return Clock;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-400 bg-green-500/10";
      case "failed":
        return "text-red-400 bg-red-500/10";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10";
      case "pending":
        return "text-blue-400 bg-blue-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const passedCount = checks.filter(c => c.status === "passed").length;
  const failedCount = checks.filter(c => c.status === "failed").length;
  const warningCount = checks.filter(c => c.status === "warning").length;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Compliance Checks</h3>
          <p className="text-sm text-gray-400">{checks.length} total checks</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="text-center p-3 bg-green-500/5 border border-green-400/20 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Passed</p>
          <p className="text-lg font-bold text-green-400">{passedCount}</p>
        </div>
        <div className="text-center p-3 bg-yellow-500/5 border border-yellow-400/20 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Warnings</p>
          <p className="text-lg font-bold text-yellow-400">{warningCount}</p>
        </div>
        <div className="text-center p-3 bg-red-500/5 border border-red-400/20 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Failed</p>
          <p className="text-lg font-bold text-red-400">{failedCount}</p>
        </div>
      </div>

      {/* Checks List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {checks.map((check) => {
          const StatusIcon = getStatusIcon(check.status);
          
          return (
            <div
              key={check.id}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(check.status)}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-white">{check.name}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{check.category}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{check.lastChecked}</span>
                    <span className={`px-2 py-0.5 rounded font-medium capitalize ${getStatusColor(check.status)}`}>
                      {check.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Run All Button */}
      <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/20">
        Run All Checks
      </button>
    </div>
  );
}
