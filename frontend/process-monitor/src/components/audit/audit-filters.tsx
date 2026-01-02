"use client";

import { useState } from "react";
import { Filter, Calendar, User, Activity, X } from "lucide-react";

export function AuditFilters() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("24h");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const categories = [
    { id: "user", name: "User Actions", count: 8234 },
    { id: "system", name: "System Events", count: 4489 },
    { id: "security", name: "Security", count: 124 },
    { id: "data", name: "Data Operations", count: 856 },
    { id: "settings", name: "Settings", count: 342 },
  ];

  const users = [
    { id: "avinash", name: "Avinash Kumar" },
    { id: "sarah", name: "Sarah Johnson" },
    { id: "mike", name: "Mike Chen" },
    { id: "emily", name: "Emily Davis" },
    { id: "system", name: "System" },
  ];

  const statuses = [
    { id: "success", name: "Success", color: "text-green-400" },
    { id: "failed", name: "Failed", color: "text-red-400" },
    { id: "warning", name: "Warning", color: "text-yellow-400" },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(u => u !== userId)
        : [...prev, userId]
    );
  };

  const toggleStatus = (statusId: string) => {
    setSelectedStatus(prev =>
      prev.includes(statusId)
        ? prev.filter(s => s !== statusId)
        : [...prev, statusId]
    );
  };

  const clearAllFilters = () => {
    setDateRange("24h");
    setSelectedUsers([]);
    setSelectedCategories([]);
    setSelectedStatus([]);
  };

  const totalActiveFilters = selectedUsers.length + selectedCategories.length + selectedStatus.length;

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Filters</h3>
            {totalActiveFilters > 0 && (
              <p className="text-sm text-purple-400">{totalActiveFilters} active</p>
            )}
          </div>
        </div>

        {totalActiveFilters > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Date Range */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <Calendar className="w-4 h-4" />
          Time Period
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                dateRange === range
                  ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {range === "24h" ? "Last 24 Hours" :
               range === "7d" ? "Last 7 Days" :
               range === "30d" ? "Last 30 Days" :
               "Last 90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <Activity className="w-4 h-4" />
          Category
        </label>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500/50"
                />
                <span className="text-sm text-white">{category.name}</span>
              </div>
              <span className="text-xs text-gray-400">{category.count.toLocaleString()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* User Filter */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <User className="w-4 h-4" />
          User
        </label>
        <div className="space-y-2">
          {users.map((user) => (
            <label
              key={user.id}
              className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500/50"
              />
              <span className="text-sm text-white">{user.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          Status
        </label>
        <div className="space-y-2">
          {statuses.map((status) => (
            <label
              key={status.id}
              className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={selectedStatus.includes(status.id)}
                onChange={() => toggleStatus(status.id)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500/50"
              />
              <span className={`text-sm ${status.color}`}>{status.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20">
        Apply Filters
      </button>
    </div>
  );
}
