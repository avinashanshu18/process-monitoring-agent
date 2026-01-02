"use client";

import { Shield, CheckCircle, AlertCircle, Clock } from "lucide-react";

export function ComplianceFrameworks() {
  const frameworks = [
    {
      id: "soc2",
      name: "SOC 2 Type II",
      description: "Service Organization Control",
      status: "compliant",
      score: 96,
      lastAudit: "2024-11-15",
      nextAudit: "2025-02-15",
      controls: 45,
      passed: 43,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "iso27001",
      name: "ISO 27001",
      description: "Information Security Management",
      status: "compliant",
      score: 94,
      lastAudit: "2024-10-20",
      nextAudit: "2025-01-20",
      controls: 114,
      passed: 107,
      color: "from-green-500 to-teal-500",
    },
    {
      id: "gdpr",
      name: "GDPR",
      description: "General Data Protection Regulation",
      status: "partial",
      score: 88,
      lastAudit: "2024-11-01",
      nextAudit: "2025-01-01",
      controls: 52,
      passed: 46,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "hipaa",
      name: "HIPAA",
      description: "Health Insurance Portability",
      status: "compliant",
      score: 92,
      lastAudit: "2024-11-10",
      nextAudit: "2025-02-10",
      controls: 38,
      passed: 35,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-green-400 bg-green-500/10 border-green-400/30";
      case "partial":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-400/30";
      case "non-compliant":
        return "text-red-400 bg-red-500/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return CheckCircle;
      case "partial":
        return AlertCircle;
      case "non-compliant":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Compliance Frameworks</h3>
          <p className="text-sm text-gray-400">{frameworks.length} frameworks tracked</p>
        </div>
      </div>

      {/* Frameworks Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {frameworks.map((framework) => {
          const StatusIcon = getStatusIcon(framework.status);
          
          return (
            <div
              key={framework.id}
              className="p-5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${framework.color} flex items-center justify-center flex-shrink-0`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{framework.name}</h4>
                    <p className="text-xs text-gray-400">{framework.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(framework.status)}`}>
                  <StatusIcon className="w-3 h-3" />
                  {framework.status}
                </span>
              </div>

              {/* Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Compliance Score</span>
                  <span className="font-bold text-white">{framework.score}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${framework.color} rounded-full transition-all`}
                    style={{ width: `${framework.score}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-black/20 rounded text-center">
                  <p className="text-xs text-gray-400 mb-1">Controls</p>
                  <p className="text-lg font-bold text-white">{framework.controls}</p>
                </div>
                <div className="p-3 bg-black/20 rounded text-center">
                  <p className="text-xs text-gray-400 mb-1">Passed</p>
                  <p className="text-lg font-bold text-green-400">{framework.passed}</p>
                </div>
              </div>

              {/* Audit Info */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Audit</span>
                  <span className="text-white">{new Date(framework.lastAudit).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Next Audit</span>
                  <span className="text-cyan-400">{new Date(framework.nextAudit).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
