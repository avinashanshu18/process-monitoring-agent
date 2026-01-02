"use client";

import { useEffect, useState } from "react";
import { Activity, Thermometer, Zap, Database } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  unit: string;
  icon: any;
  color: string;
  progress: number;
}

export function RealtimeMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: "CPU Temperature",
      value: "62",
      unit: "°C",
      icon: Thermometer,
      color: "from-orange-500 to-red-500",
      progress: 62,
    },
    {
      label: "Power Usage",
      value: "45",
      unit: "W",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      progress: 45,
    },
    {
      label: "Disk Activity",
      value: "28",
      unit: "MB/s",
      icon: Database,
      color: "from-green-500 to-teal-500",
      progress: 28,
    },
    {
      label: "System Load",
      value: "1.24",
      unit: "",
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
      progress: 41,
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const randomChange = (Math.random() - 0.5) * 10;
        let newValue = parseFloat(metric.value) + randomChange;
        
        // Keep values in reasonable ranges
        if (metric.label === "CPU Temperature") newValue = Math.max(40, Math.min(85, newValue));
        if (metric.label === "Power Usage") newValue = Math.max(20, Math.min(100, newValue));
        if (metric.label === "Disk Activity") newValue = Math.max(0, Math.min(100, newValue));
        if (metric.label === "System Load") newValue = Math.max(0.5, Math.min(4, newValue));

        const progress = metric.label === "System Load" 
          ? (newValue / 4) * 100 
          : metric.label === "CPU Temperature"
          ? ((newValue - 40) / 45) * 100
          : newValue;

        return {
          ...metric,
          value: newValue.toFixed(metric.label === "System Load" ? 2 : 0),
          progress: Math.min(100, Math.max(0, progress)),
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Real-time Metrics</h3>
        <p className="text-sm text-gray-400">Live system indicators</p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-400">{metric.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white">{metric.value}</span>
                  <span className="text-xs text-gray-500">{metric.unit}</span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${metric.color} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${metric.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Indicator */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">System Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
