"use client";

import { useState } from "react";
import { Activity, User, Shield, Settings, LogOut, LogIn, UserPlus, Edit, Filter } from "lucide-react";

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  type: "login" | "logout" | "create" | "update" | "delete" | "settings";
  ip?: string;
}

export function ActivityLog() {
  const [filterType, setFilterType] = useState("all");

  const activities: ActivityItem[] = [
    {
      id: 1,
      user: "Avinash Kumar",
      action: "Logged in",
      details: "Successful login from new device",
      timestamp: "2 minutes ago",
      type: "login",
      ip: "192.168.1.105",
    },
    {
      id: 2,
      user: "Sarah Johnson",
      action: "Updated user role",
      details: "Changed Mike Chen role from Viewer to User",
      timestamp: "15 minutes ago",
      type: "update",
    },
    {
      id: 3,
      user: "System",
      action: "User created",
      details: "New user John Smith invited as Viewer",
      timestamp: "1 hour ago",
      type: "create",
    },
    {
      id: 4,
      user: "Mike Chen",
      action: "Logged out",
      details: "Session ended",
      timestamp: "2 hours ago",
      type: "logout",
    },
    {
      id: 5,
      user: "Emily Davis",
      action: "Settings changed",
      details: "Updated notification preferences",
      timestamp: "3 hours ago",
      type: "settings",
    },
    {
      id: 6,
      user: "Avinash Kumar",
      action: "User deleted",
      details: "Removed inactive user account",
      timestamp: "5 hours ago",
      type: "delete",
    },
    {
      id: 7,
      user: "Lisa Anderson",
      action: "Logged in",
      details: "Successful login",
      timestamp: "6 hours ago",
      type: "login",
      ip: "192.168.1.127",
    },
    {
      id: 8,
      user: "System",
      action: "User created",
      details: "New user invitation sent to jane.doe@example.com",
      timestamp: "1 day ago",
      type: "create",
    },
  ];

  const filteredActivities = filterType === "all" 
    ? activities 
    : activities.filter(a => a.type === filterType);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return LogIn;
      case "logout":
        return LogOut;
      case "create":
        return UserPlus;
      case "update":
        return Edit;
      case "delete":
        return User;
      case "settings":
        return Settings;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "login":
        return "text-green-400 bg-green-500/10";
      case "logout":
        return "text-gray-400 bg-gray-500/10";
      case "create":
        return "text-blue-400 bg-blue-500/10";
      case "update":
        return "text-yellow-400 bg-yellow-500/10";
      case "delete":
        return "text-red-400 bg-red-500/10";
      case "settings":
        return "text-purple-400 bg-purple-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Activity Log</h3>
            <p className="text-sm text-gray-400">{filteredActivities.length} recent activities</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">All Activities</option>
            <option value="login">Logins</option>
            <option value="logout">Logouts</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {filteredActivities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-medium text-white mb-1">
                      <span className="text-cyan-400">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-400">{activity.details}</p>
                    {activity.ip && (
                      <p className="text-xs text-gray-500 mt-1">IP: {activity.ip}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Logins</p>
          <p className="text-lg font-bold text-green-400">
            {activities.filter(a => a.type === "login").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Created</p>
          <p className="text-lg font-bold text-blue-400">
            {activities.filter(a => a.type === "create").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Updated</p>
          <p className="text-lg font-bold text-yellow-400">
            {activities.filter(a => a.type === "update").length}
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Deleted</p>
          <p className="text-lg font-bold text-red-400">
            {activities.filter(a => a.type === "delete").length}
          </p>
        </div>
      </div>
    </div>
  );
}
