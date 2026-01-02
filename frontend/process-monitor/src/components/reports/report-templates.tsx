"use client";

import { FileText, BarChart3, Shield, Network, HardDrive, Activity, TrendingUp, CheckCircle } from "lucide-react";

export function ReportTemplates() {
  const templates = [
    {
      id: 1,
      name: "System Overview",
      description: "Comprehensive system performance and health report",
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
      metrics: ["CPU", "Memory", "Disk", "Network"],
      popular: true,
    },
    {
      id: 2,
      name: "Performance Analysis",
      description: "Detailed performance metrics and trends",
      icon: TrendingUp,
      color: "from-green-500 to-teal-500",
      metrics: ["CPU Trends", "Memory Usage", "Response Time"],
      popular: true,
    },
    {
      id: 3,
      name: "Security Audit",
      description: "Security events, threats, and compliance status",
      icon: Shield,
      color: "from-red-500 to-orange-500",
      metrics: ["Threats", "Firewall", "Updates", "Vulnerabilities"],
      popular: false,
    },
    {
      id: 4,
      name: "Network Traffic",
      description: "Network usage, bandwidth, and connections",
      icon: Network,
      color: "from-purple-500 to-pink-500",
      metrics: ["Bandwidth", "Connections", "Packets", "Errors"],
      popular: true,
    },
    {
      id: 5,
      name: "Storage Analysis",
      description: "Disk usage, file systems, and capacity planning",
      icon: HardDrive,
      color: "from-orange-500 to-red-500",
      metrics: ["Disk Usage", "I/O Performance", "File Systems"],
      popular: false,
    },
    {
      id: 6,
      name: "Executive Summary",
      description: "High-level overview for stakeholders",
      icon: BarChart3,
      color: "from-cyan-500 to-blue-500",
      metrics: ["KPIs", "Trends", "Alerts", "Uptime"],
      popular: true,
    },
  ];

  const handleUseTemplate = (templateName: string) => {
    alert(`Loading template: ${templateName}`);
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Report Templates</h3>
          <p className="text-sm text-gray-400">Pre-configured report layouts</p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          
          return (
            <div
              key={template.id}
              className="p-5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group cursor-pointer"
              onClick={() => handleUseTemplate(template.name)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {template.popular && (
                  <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-400/30 text-yellow-400 rounded text-xs font-medium">
                    Popular
                  </span>
                )}
              </div>

              {/* Content */}
              <h4 className="text-sm font-bold text-white mb-2">{template.name}</h4>
              <p className="text-xs text-gray-400 mb-4">{template.description}</p>

              {/* Metrics */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {template.metrics.map((metric, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              {/* Button */}
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-all group-hover:border-cyan-400/30 group-hover:text-cyan-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Use Template
              </button>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400 mb-1">Custom Templates</p>
            <p className="text-xs text-gray-400">
              Create and save your own report templates with custom metrics, layouts, and branding. 
              Click "Save Template" in the Report Builder to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
