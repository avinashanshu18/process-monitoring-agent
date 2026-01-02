"use client";

import { useState } from "react";
import { Calendar, Clock, Mail, Edit, Trash2, ToggleLeft, ToggleRight, Plus } from "lucide-react";

interface ScheduledReport {
  id: number;
  name: string;
  frequency: string;
  nextRun: string;
  format: string;
  recipients: number;
  active: boolean;
  lastRun?: string;
}

export function ScheduledReports() {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([
    {
      id: 1,
      name: "Daily System Summary",
      frequency: "Daily at 9:00 AM",
      nextRun: "Dec 10, 9:00 AM",
      format: "PDF",
      recipients: 3,
      active: true,
      lastRun: "Dec 9, 9:00 AM",
    },
    {
      id: 2,
      name: "Weekly Performance Report",
      frequency: "Every Monday at 8:00 AM",
      nextRun: "Dec 16, 8:00 AM",
      format: "XLSX",
      recipients: 5,
      active: true,
      lastRun: "Dec 9, 8:00 AM",
    },
    {
      id: 3,
      name: "Monthly Analytics",
      frequency: "1st of every month",
      nextRun: "Jan 1, 2025",
      format: "PDF",
      recipients: 8,
      active: true,
      lastRun: "Dec 1, 2024",
    },
    {
      id: 4,
      name: "Security Audit",
      frequency: "Every Friday at 6:00 PM",
      nextRun: "Dec 13, 6:00 PM",
      format: "PDF",
      recipients: 2,
      active: false,
      lastRun: "Dec 6, 6:00 PM",
    },
  ]);

  const toggleSchedule = (id: number) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const deleteSchedule = (id: number) => {
    if (confirm("Are you sure you want to delete this scheduled report?")) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Scheduled Reports</h3>
            <p className="text-sm text-gray-400">{schedules.filter(s => s.active).length} active schedules</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Schedules List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className={`p-4 rounded-lg border transition-all ${
              schedule.active
                ? "bg-white/5 hover:bg-white/10 border-white/10"
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Toggle */}
              <button
                onClick={() => toggleSchedule(schedule.id)}
                className="mt-1"
              >
                {schedule.active ? (
                  <ToggleRight className="w-6 h-6 text-green-400" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{schedule.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{schedule.frequency}</span>
                      </div>
                      <span>•</span>
                      <span>{schedule.format}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-2 bg-white/5 rounded">
                    <p className="text-xs text-gray-400 mb-1">Next Run</p>
                    <p className="text-xs font-bold text-white">{schedule.nextRun}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded">
                    <p className="text-xs text-gray-400 mb-1">Last Run</p>
                    <p className="text-xs font-bold text-white">{schedule.lastRun || "Never"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Mail className="w-3 h-3" />
                    <span>{schedule.recipients} recipients</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Edit">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-lg font-bold text-white">{schedules.length}</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Active</p>
            <p className="text-lg font-bold text-green-400">
              {schedules.filter(s => s.active).length}
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Paused</p>
            <p className="text-lg font-bold text-gray-400">
              {schedules.filter(s => !s.active).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
