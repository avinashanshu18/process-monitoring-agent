"use client";

import { useState } from "react";
import { Briefcase, Plus, Users, Settings, Star, MoreVertical, Edit, Trash2, LogIn, Shield } from "lucide-react";

interface Workspace {
  id: number;
  name: string;
  description: string;
  color: string;
  members: number;
  role: "owner" | "admin" | "member";
  favorite: boolean;
  dashboards: number;
  devices: number;
  createdAt: string;
}

export function WorkspacesList() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 1,
      name: "Production",
      description: "Main production environment monitoring",
      color: "from-blue-500 to-cyan-500",
      members: 8,
      role: "owner",
      favorite: true,
      dashboards: 5,
      devices: 12,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Development",
      description: "Development and testing environment",
      color: "from-purple-500 to-pink-500",
      members: 6,
      role: "admin",
      favorite: true,
      dashboards: 8,
      devices: 6,
      createdAt: "2024-02-20",
    },
    {
      id: 3,
      name: "Security Team",
      description: "Security monitoring and incident response",
      color: "from-red-500 to-orange-500",
      members: 4,
      role: "member",
      favorite: false,
      dashboards: 3,
      devices: 8,
      createdAt: "2024-03-10",
    },
    {
      id: 4,
      name: "DevOps",
      description: "Infrastructure and deployment monitoring",
      color: "from-green-500 to-teal-500",
      members: 5,
      role: "admin",
      favorite: false,
      dashboards: 6,
      devices: 15,
      createdAt: "2024-04-05",
    },
    {
      id: 5,
      name: "QA Testing",
      description: "Quality assurance and testing workspace",
      color: "from-yellow-500 to-orange-500",
      members: 3,
      role: "member",
      favorite: false,
      dashboards: 4,
      devices: 4,
      createdAt: "2024-05-12",
    },
    {
      id: 6,
      name: "Executive",
      description: "High-level metrics and KPIs",
      color: "from-cyan-500 to-blue-500",
      members: 2,
      role: "admin",
      favorite: true,
      dashboards: 2,
      devices: 3,
      createdAt: "2024-06-01",
    },
  ]);

  const toggleFavorite = (id: number) => {
    setWorkspaces(workspaces.map(w =>
      w.id === id ? { ...w, favorite: !w.favorite } : w
    ));
  };

  const deleteWorkspace = (id: number) => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      setWorkspaces(workspaces.filter(w => w.id !== id));
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: "bg-red-500/10 text-red-400 border-red-400/30",
      admin: "bg-purple-500/10 text-purple-400 border-purple-400/30",
      member: "bg-blue-500/10 text-blue-400 border-blue-400/30",
    };
    return styles[role as keyof typeof styles];
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your Workspaces</h3>
            <p className="text-sm text-gray-400">{workspaces.length} workspaces</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${workspace.color} flex items-center justify-center`}>
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFavorite(workspace.id)}
                  className={`p-1.5 rounded transition-all ${
                    workspace.favorite
                      ? "text-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  }`}
                >
                  <Star className={`w-4 h-4 ${workspace.favorite ? "fill-yellow-400" : ""}`} />
                </button>
                <button className="p-1.5 rounded text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-bold text-white">{workspace.name}</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadge(workspace.role)}`}>
                  {workspace.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{workspace.description}</p>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-white/5 rounded">
                  <Users className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                  <p className="text-white font-bold">{workspace.members}</p>
                  <p className="text-gray-500">Members</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded">
                  <Settings className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <p className="text-white font-bold">{workspace.dashboards}</p>
                  <p className="text-gray-500">Boards</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded">
                  <Shield className="w-4 h-4 mx-auto mb-1 text-green-400" />
                  <p className="text-white font-bold">{workspace.devices}</p>
                  <p className="text-gray-500">Devices</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Created {new Date(workspace.createdAt).toLocaleDateString()}
              </span>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Open">
                  <LogIn className="w-3 h-3" />
                </button>
                <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 transition-all" title="Edit">
                  <Edit className="w-3 h-3" />
                </button>
                {workspace.role === "owner" && (
                  <button
                    onClick={() => deleteWorkspace(workspace.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Members</p>
            <p className="text-xl font-bold text-white">
              {workspaces.reduce((acc, w) => acc + w.members, 0)}
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Your Role</p>
            <p className="text-xl font-bold text-purple-400">
              {workspaces.filter(w => w.role === "owner").length} Owner
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Favorites</p>
            <p className="text-xl font-bold text-yellow-400">
              {workspaces.filter(w => w.favorite).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
