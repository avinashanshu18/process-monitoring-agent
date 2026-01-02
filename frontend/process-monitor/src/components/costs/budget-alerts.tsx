"use client";

import { AlertTriangle, Bell, TrendingUp, CheckCircle } from "lucide-react";

export function BudgetAlerts() {
  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "Budget Exceeded",
      message: "Production environment is 8% over monthly budget",
      current: "$2,856",
      budget: "$2,650",
      percentage: 108,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Approaching Limit",
      message: "Compute costs at 87% of allocated budget",
      current: "$1,856",
      budget: "$2,100",
      percentage: 87,
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      type: "info",
      title: "Unusual Spike",
      message: "Database costs increased 23% this week",
      current: "$892",
      budget: "$800",
      percentage: 112,
      timestamp: "1 day ago",
    },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-400/30 bg-red-500/5";
      case "warning":
        return "border-yellow-400/30 bg-yellow-500/5";
      case "info":
        return "border-blue-400/30 bg-blue-500/5";
      default:
        return "border-white/10 bg-white/5";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return { icon: AlertTriangle, color: "text-red-400" };
      case "warning":
        return { icon: Bell, color: "text-yellow-400" };
      case "info":
        return { icon: TrendingUp, color: "text-blue-400" };
      default:
        return { icon: Bell, color: "text-gray-400" };
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Budget Alerts</h3>
          <p className="text-sm text-gray-400">{alerts.length} active</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 mb-6">
        {alerts.map((alert) => {
          const { icon: Icon, color } = getAlertIcon(alert.type);
          
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertColor(alert.type)} transition-all hover:bg-white/5`}
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white mb-1">{alert.title}</h4>
                  <p className="text-xs text-gray-400 mb-2">{alert.message}</p>
                  
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-500">Current: <span className="text-white font-bold">{alert.current}</span></span>
                    <span className="text-gray-500">Budget: <span className="text-white font-bold">{alert.budget}</span></span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          alert.percentage >= 100 ? "bg-red-500" :
                          alert.percentage >= 80 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                      alert.percentage >= 100 ? "text-red-400" :
                      alert.percentage >= 80 ? "text-yellow-400" :
                      "text-green-400"
                    }`}>
                      {alert.percentage}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Critical</p>
            <p className="text-lg font-bold text-red-400">1</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Warnings</p>
            <p className="text-lg font-bold text-yellow-400">2</p>
          </div>
        </div>
      </div>

      {/* Configure Button */}
      <button className="w-full mt-4 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-lg text-sm font-medium transition-all">
        Configure Alerts
      </button>
    </div>
  );
}
