"use client";

import { useState } from "react";
import { Folder, Plus, Edit, Trash2, ChevronRight, Monitor } from "lucide-react";

interface DeviceGroup {
  id: number;
  name: string;
  description: string;
  deviceCount: number;
  color: string;
  devices: string[];
}

export function DeviceGroups() {
  const [groups, setGroups] = useState<DeviceGroup[]>([
    {
      id: 1,
      name: "Production Servers",
      description: "Critical production infrastructure",
      deviceCount: 2,
      color: "from-red-500 to-orange-500",
      devices: ["Production Server", "Backup Server"],
    },
    {
      id: 2,
      name: "Development",
      description: "Developer workstations and test machines",
      deviceCount: 3,
      color: "from-blue-500 to-cyan-500",
      devices: ["Development Laptop", "Testing Machine", "Main Workstation"],
    },
    {
      id: 3,
      name: "Office Desktops",
      description: "Standard office computers",
      deviceCount: 2,
      color: "from-green-500 to-teal-500",
      devices: ["Main Workstation", "Testing Machine"],
    },
    {
      id: 4,
      name: "Mobile Devices",
      description: "Smartphones and tablets",
      deviceCount: 1,
      color: "from-purple-500 to-pink-500",
      devices: ["Mobile Device"],
    },
  ]);

  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const deleteGroup = (id: number) => {
    if (confirm("Are you sure you want to delete this group?")) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Device Groups</h3>
            <p className="text-sm text-gray-400">{groups.length} groups</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {/* Groups List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {groups.map((group) => (
          <div key={group.id} className="border border-white/10 rounded-lg overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
              className="w-full p-4 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center flex-shrink-0`}>
                <Folder className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white">{group.name}</h4>
                  <span className="text-xs text-gray-400">{group.deviceCount} devices</span>
                </div>
                <p className="text-xs text-gray-400">{group.description}</p>
              </div>

              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                selectedGroup === group.id ? "rotate-90" : ""
              }`} />
            </button>

            {/* Expanded Group Details */}
            {selectedGroup === group.id && (
              <div className="bg-white/[0.02] border-t border-white/10 p-4">
                <div className="space-y-2 mb-4">
                  {group.devices.map((device, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                    >
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white">{device}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <button className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1">
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Groups</p>
            <p className="text-xl font-bold text-white">{groups.length}</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Devices</p>
            <p className="text-xl font-bold text-cyan-400">
              {groups.reduce((acc, g) => acc + g.deviceCount, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
