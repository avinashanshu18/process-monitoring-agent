"use client";

import { useState } from "react";
import { Settings, Save, Trash2, AlertCircle, Lock, Eye, Globe } from "lucide-react";

export function WorkspaceSettings() {
  const [workspaceName, setWorkspaceName] = useState("Production");
  const [description, setDescription] = useState("Main production environment monitoring");
  const [visibility, setVisibility] = useState<"private" | "team" | "public">("team");
  const [allowInvites, setAllowInvites] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);

  const visibilityOptions = [
    {
      id: "private" as const,
      name: "Private",
      description: "Only invited members can access",
      icon: Lock,
    },
    {
      id: "team" as const,
      name: "Team",
      description: "All team members can view",
      icon: Eye,
    },
    {
      id: "public" as const,
      name: "Public",
      description: "Anyone with the link can view",
      icon: Globe,
    },
  ];

  const handleSave = () => {
    alert("Workspace settings saved!");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      alert("Workspace deleted!");
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Workspace Settings</h3>
          <p className="text-sm text-gray-400">Configure workspace preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">Visibility</label>
          <div className="space-y-2">
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    visibility === option.id
                      ? "border-orange-400 bg-orange-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.id}
                    checked={visibility === option.id}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-white">{option.name}</span>
                    </div>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">Permissions</label>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
              <div>
                <p className="text-sm font-medium text-white">Allow member invitations</p>
                <p className="text-xs text-gray-400">Members can invite new users</p>
              </div>
              <input
                type="checkbox"
                checked={allowInvites}
                onChange={(e) => setAllowInvites(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-500/50"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
              <div>
                <p className="text-sm font-medium text-white">Require approval</p>
                <p className="text-xs text-gray-400">Admin approval needed for new members</p>
              </div>
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-500/50"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
              <div>
                <p className="text-sm font-medium text-white">Enable notifications</p>
                <p className="text-xs text-gray-400">Send alerts for workspace activity</p>
              </div>
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-500/50"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>

          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Workspace
          </button>
        </div>

        {/* Warning */}
        <div className="p-4 bg-yellow-500/5 border border-yellow-400/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400 mb-1">Important</p>
              <p className="text-xs text-gray-400">
                Deleting a workspace will remove all associated dashboards, devices, and settings. 
                Members will lose access immediately. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
