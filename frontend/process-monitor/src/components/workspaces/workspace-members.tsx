"use client";

import { useState } from "react";
import { Users, UserPlus, Crown, Shield, User, Mail, MoreVertical, Edit, Trash2 } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  status: "active" | "invited" | "inactive";
}

export function WorkspaceMembers() {
  const [selectedWorkspace, setSelectedWorkspace] = useState("production");
  const [members, setMembers] = useState<Member[]>([
    {
      id: 1,
      name: "Avinash Kumar",
      email: "avinash@example.com",
      role: "owner",
      joinedAt: "2024-01-15",
      lastActive: "Active now",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "admin",
      joinedAt: "2024-02-10",
      lastActive: "2 hours ago",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@example.com",
      role: "member",
      joinedAt: "2024-03-15",
      lastActive: "5 hours ago",
      status: "active",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@example.com",
      role: "member",
      joinedAt: "2024-04-20",
      lastActive: "1 day ago",
      status: "active",
    },
    {
      id: 5,
      name: "John Smith",
      email: "john.smith@example.com",
      role: "viewer",
      joinedAt: "2024-05-10",
      lastActive: "Never",
      status: "invited",
    },
  ]);

  const workspaces = [
    { id: "production", name: "Production" },
    { id: "development", name: "Development" },
    { id: "security", name: "Security Team" },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return Crown;
      case "admin":
        return Shield;
      default:
        return User;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: "bg-red-500/10 text-red-400 border-red-400/30",
      admin: "bg-purple-500/10 text-purple-400 border-purple-400/30",
      member: "bg-blue-500/10 text-blue-400 border-blue-400/30",
      viewer: "bg-gray-500/10 text-gray-400 border-gray-400/30",
    };
    return styles[role as keyof typeof styles];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/10";
      case "invited":
        return "text-yellow-400 bg-yellow-500/10";
      case "inactive":
        return "text-gray-400 bg-gray-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const removeMember = (id: number) => {
    if (confirm("Are you sure you want to remove this member?")) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Workspace Members</h3>
            <p className="text-sm text-gray-400">{members.length} members</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      {/* Workspace Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">Select Workspace</label>
        <select
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      {/* Members List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {members.map((member) => {
          const RoleIcon = getRoleIcon(member.role);
          
          return (
            <div
              key={member.id}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getRoleBadge(member.role)}`}>
                          <RoleIcon className="w-3 h-3" />
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </p>
                    </div>

                    <button className="p-1.5 rounded text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Last active: {member.lastActive}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Edit Role">
                        <Edit className="w-3 h-3" />
                      </button>
                      {member.role !== "owner" && (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Owner</p>
            <p className="text-sm font-bold text-red-400">
              {members.filter(m => m.role === "owner").length}
            </p>
          </div>
          <div className="text-center p-2 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Admin</p>
            <p className="text-sm font-bold text-purple-400">
              {members.filter(m => m.role === "admin").length}
            </p>
          </div>
          <div className="text-center p-2 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Members</p>
            <p className="text-sm font-bold text-blue-400">
              {members.filter(m => m.role === "member").length}
            </p>
          </div>
          <div className="text-center p-2 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Viewers</p>
            <p className="text-sm font-bold text-gray-400">
              {members.filter(m => m.role === "viewer").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
