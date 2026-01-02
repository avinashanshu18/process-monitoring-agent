"use client";

import { useState } from "react";
import { LayoutDashboard, Star, Eye, Edit, Trash2, Share2, Copy, Clock } from "lucide-react";

interface Dashboard {
  id: number;
  name: string;
  description: string;
  widgets: number;
  favorite: boolean;
  shared: boolean;
  lastModified: string;
  createdBy: string;
  views: number;
}

export function SavedDashboards() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: 1,
      name: "Production Overview",
      description: "Main production system monitoring",
      widgets: 8,
      favorite: true,
      shared: true,
      lastModified: "2 hours ago",
      createdBy: "You",
      views: 245,
    },
    {
      id: 2,
      name: "Development Metrics",
      description: "Dev environment performance tracking",
      widgets: 6,
      favorite: false,
      shared: false,
      lastModified: "1 day ago",
      createdBy: "You",
      views: 89,
    },
    {
      id: 3,
      name: "Security Dashboard",
      description: "Security events and threat monitoring",
      widgets: 10,
      favorite: true,
      shared: true,
      lastModified: "3 days ago",
      createdBy: "Sarah Johnson",
      views: 156,
    },
    {
      id: 4,
      name: "Network Analytics",
      description: "Network traffic and bandwidth analysis",
      widgets: 5,
      favorite: false,
      shared: false,
      lastModified: "5 days ago",
      createdBy: "You",
      views: 67,
    },
    {
      id: 5,
      name: "Executive Summary",
      description: "High-level KPIs for stakeholders",
      widgets: 12,
      favorite: true,
      shared: true,
      lastModified: "1 week ago",
      createdBy: "Mike Chen",
      views: 312,
    },
  ]);

  const toggleFavorite = (id: number) => {
    setDashboards(dashboards.map(d =>
      d.id === id ? { ...d, favorite: !d.favorite } : d
    ));
  };

  const deleteDashboard = (id: number) => {
    if (confirm("Are you sure you want to delete this dashboard?")) {
      setDashboards(dashboards.filter(d => d.id !== id));
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Saved Dashboards</h3>
            <p className="text-sm text-gray-400">{dashboards.length} dashboards</p>
          </div>
        </div>
      </div>

      {/* Dashboards List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {dashboards.map((dashboard) => (
          <div
            key={dashboard.id}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{dashboard.name}</h4>
                    {dashboard.favorite && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                    {dashboard.shared && (
                      <Share2 className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-3">{dashboard.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <LayoutDashboard className="w-3 h-3" />
                    <span>{dashboard.widgets} widgets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{dashboard.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{dashboard.lastModified}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">By {dashboard.createdBy}</span>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite(dashboard.id)}
                      className={`p-2 rounded-lg transition-all ${
                        dashboard.favorite
                          ? "bg-yellow-500/20 border border-yellow-400/30 text-yellow-400"
                          : "bg-gray-500/10 border border-gray-400/30 text-gray-400 hover:text-yellow-400"
                      }`}
                      title="Toggle Favorite"
                    >
                      <Star className={`w-3 h-3 ${dashboard.favorite ? "fill-yellow-400" : ""}`} />
                    </button>
                    <button className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all" title="View">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 transition-all" title="Edit">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 transition-all" title="Duplicate">
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteDashboard(dashboard.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
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
            <p className="text-lg font-bold text-white">{dashboards.length}</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Favorites</p>
            <p className="text-lg font-bold text-yellow-400">
              {dashboards.filter(d => d.favorite).length}
            </p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Shared</p>
            <p className="text-lg font-bold text-blue-400">
              {dashboards.filter(d => d.shared).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
