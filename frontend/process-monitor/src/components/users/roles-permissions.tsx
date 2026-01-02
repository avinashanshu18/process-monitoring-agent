"use client";

import { useState } from "react";
import { Shield, Check, X, Edit, Plus } from "lucide-react";

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  color: string;
  permissions: {
    dashboard: boolean;
    processes: boolean;
    metrics: boolean;
    network: boolean;
    security: boolean;
    alerts: boolean;
    settings: boolean;
    users: boolean;
  };
}

export function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<number>(1);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: "Admin",
      description: "Full system access",
      userCount: 4,
      color: "from-red-500 to-orange-500",
      permissions: {
        dashboard: true,
        processes: true,
        metrics: true,
        network: true,
        security: true,
        alerts: true,
        settings: true,
        users: true,
      },
    },
    {
      id: 2,
      name: "Manager",
      description: "Manage team and resources",
      userCount: 6,
      color: "from-purple-500 to-pink-500",
      permissions: {
        dashboard: true,
        processes: true,
        metrics: true,
        network: true,
        security: true,
        alerts: true,
        settings: false,
        users: false,
      },
    },
    {
      id: 3,
      name: "User",
      description: "Standard access",
      userCount: 12,
      color: "from-blue-500 to-cyan-500",
      permissions: {
        dashboard: true,
        processes: true,
        metrics: true,
        network: false,
        security: false,
        alerts: true,
        settings: false,
        users: false,
      },
    },
    {
      id: 4,
      name: "Viewer",
      description: "Read-only access",
      userCount: 2,
      color: "from-gray-500 to-gray-600",
      permissions: {
        dashboard: true,
        processes: false,
        metrics: true,
        network: false,
        security: false,
        alerts: false,
        settings: false,
        users: false,
      },
    },
  ]);

  const currentRole = roles.find(r => r.id === selectedRole)!;

  const permissionLabels = {
    dashboard: "View Dashboard",
    processes: "Manage Processes",
    metrics: "View System Metrics",
    network: "Monitor Network",
    security: "Security Management",
    alerts: "Manage Alerts",
    settings: "System Settings",
    users: "User Management",
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Roles & Permissions</h3>
            <p className="text-sm text-gray-400">Manage access control</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Role
        </button>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedRole === role.id
                ? "border-purple-400 bg-purple-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-bold ${
                selectedRole === role.id ? "text-purple-400" : "text-white"
              }`}>
                {role.name}
              </p>
              <span className="text-xs text-gray-400">{role.userCount} users</span>
            </div>
            <p className="text-xs text-gray-400">{role.description}</p>
          </button>
        ))}
      </div>

      {/* Permissions List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white">Permissions</h4>
          <button className="p-1 rounded text-blue-400 hover:bg-blue-500/10 transition-all">
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {Object.entries(currentRole.permissions).map(([key, enabled]) => (
          <div
            key={key}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              enabled
                ? "bg-green-500/5 border-green-400/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                enabled ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {enabled ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
              </div>
              <span className="text-sm text-white">
                {permissionLabels[key as keyof typeof permissionLabels]}
              </span>
            </div>
            <span className={`text-xs font-medium ${
              enabled ? "text-green-400" : "text-red-400"
            }`}>
              {enabled ? "Allowed" : "Denied"}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Allowed</p>
            <p className="text-xl font-bold text-green-400">
              {Object.values(currentRole.permissions).filter(Boolean).length}
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Denied</p>
            <p className="text-xl font-bold text-red-400">
              {Object.values(currentRole.permissions).filter(p => !p).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
