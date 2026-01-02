"use client";

import { useState } from "react";
import { Users, Search, MoreVertical, Edit, Trash2, Shield, Mail, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "User" | "Viewer";
  status: "active" | "inactive" | "pending";
  lastActive: string;
  joinedDate: string;
  avatar?: string;
}

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Avinash Kumar",
      email: "avinash@example.com",
      role: "Admin",
      status: "active",
      lastActive: "Just now",
      joinedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "Manager",
      status: "active",
      lastActive: "2 hours ago",
      joinedDate: "2024-03-22",
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@example.com",
      role: "User",
      status: "active",
      lastActive: "5 hours ago",
      joinedDate: "2024-05-10",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@example.com",
      role: "User",
      status: "inactive",
      lastActive: "3 days ago",
      joinedDate: "2024-06-18",
    },
    {
      id: 5,
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Viewer",
      status: "pending",
      lastActive: "Never",
      joinedDate: "2024-12-08",
    },
    {
      id: 6,
      name: "Lisa Anderson",
      email: "lisa.a@example.com",
      role: "Manager",
      status: "active",
      lastActive: "1 hour ago",
      joinedDate: "2024-02-28",
    },
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const colors = {
      Admin: "bg-red-500/10 text-red-400 border-red-400/30",
      Manager: "bg-purple-500/10 text-purple-400 border-purple-400/30",
      User: "bg-blue-500/10 text-blue-400 border-blue-400/30",
      Viewer: "bg-gray-500/10 text-gray-400 border-gray-400/30",
    };
    return colors[role as keyof typeof colors] || colors.Viewer;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/10";
      case "inactive":
        return "text-gray-400 bg-gray-500/10";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle;
      case "inactive":
        return XCircle;
      default:
        return Clock;
    }
  };

  const deleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Team Members</h3>
            <p className="text-sm text-gray-400">{filteredUsers.length} users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
          <option value="Viewer">Viewer</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Last Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => {
              const StatusIcon = getStatusIcon(user.status);
              return (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRoleBadge(user.role)}`}>
                      {user.role === "Admin" && <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {user.status}
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{user.lastActive}</span>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{user.joinedDate}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="Edit User">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 transition-all" title="Send Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">{filteredUsers.length}</span> of{" "}
          <span className="text-white font-medium">{users.length}</span> users
        </p>
      </div>
    </div>
  );
}
