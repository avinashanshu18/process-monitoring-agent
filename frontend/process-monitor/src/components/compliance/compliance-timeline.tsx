"use client";

import { Clock, CheckCircle, FileText, Shield, AlertTriangle } from "lucide-react";

export function ComplianceTimeline() {
  const events = [
    {
      id: 1,
      title: "SOC 2 Report Generated",
      description: "Annual audit report completed",
      type: "success",
      date: "2024-11-15",
      time: "14:30",
      icon: FileText,
    },
    {
      id: 2,
      title: "GDPR Assessment Failed",
      description: "Data retention policy check failed",
      type: "error",
      date: "2024-11-12",
      time: "09:15",
      icon: AlertTriangle,
    },
    {
      id: 3,
      title: "ISO 27001 Certification Renewed",
      description: "Certificate valid until Dec 2025",
      type: "success",
      date: "2024-10-20",
      time: "11:00",
      icon: Shield,
    },
    {
      id: 4,
      title: "Quarterly Compliance Review",
      description: "Q3 2024 review completed",
      type: "info",
      date: "2024-10-01",
      time: "16:45",
      icon: CheckCircle,
    },
    {
      id: 5,
      title: "HIPAA Audit Scheduled",
      description: "Audit set for February 2025",
      type: "info",
      date: "2024-09-15",
      time: "10:30",
      icon: Clock,
    },
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-500/10",
          border: "border-green-400/30",
          text: "text-green-400",
          icon: "bg-green-500",
        };
      case "error":
        return {
          bg: "bg-red-500/10",
          border: "border-red-400/30",
          text: "text-red-400",
          icon: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-400/30",
          text: "text-yellow-400",
          icon: "bg-yellow-500",
        };
      case "info":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-400/30",
          text: "text-blue-400",
          icon: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          border: "border-gray-400/30",
          text: "text-gray-400",
          icon: "bg-gray-500",
        };
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Activity Timeline</h3>
          <p className="text-sm text-gray-400">Recent events</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {events.map((event, index) => {
          const colors = getEventColor(event.type);
          const Icon = event.icon;
          
          return (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index !== events.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-px bg-white/10" />
              )}

              <div className="flex gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center flex-shrink-0 relative z-10`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Content */}
                <div className={`flex-1 p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`text-sm font-bold ${colors.text}`}>{event.title}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{event.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <button className="w-full mt-6 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-lg text-sm font-medium transition-all">
        View Full Timeline
      </button>
    </div>
  );
}
