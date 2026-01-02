"use client";

import { useState } from "react";
import { User, Mail, Phone, Camera, Save, Lock, Trash2 } from "lucide-react";

export function AccountSettings() {
  const [profile, setProfile] = useState({
    name: "Avinash Kumar",
    email: "avinash@example.com",
    phone: "+91 98765 43210",
    company: "ProcessMon Inc.",
    role: "Administrator",
    bio: "Full-stack developer and system monitoring enthusiast",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Profile Information</h3>
            <p className="text-sm text-gray-400">Update your personal details</p>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
              AK
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center transition-colors shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Profile Photo</h4>
            <p className="text-xs text-gray-400 mb-3">JPG, GIF or PNG. Max size 2MB</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-xs font-medium transition-all">
                Upload New
              </button>
              <button className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-all">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Company</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Role</label>
            <select
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Password & Security</h3>
            <p className="text-sm text-gray-400">Update your password and security settings</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <button className="w-full px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-lg font-medium transition-all">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Two-Factor Authentication</h4>
            <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <button className="relative w-12 h-6 rounded-full bg-gray-600">
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full" />
          </button>
        </div>
        <button className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg text-sm font-medium transition-all">
          Enable 2FA
        </button>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-xl p-6 border-2 border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Danger Zone</h3>
            <p className="text-sm text-gray-400">Irreversible actions</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 rounded-lg border border-red-400/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white mb-1">Delete Account</p>
                <p className="text-xs text-gray-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
                Delete Account
              </button>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-400/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white mb-1">Export Data</p>
                <p className="text-xs text-gray-400">
                  Download a copy of all your data before deletion
                </p>
              </div>
              <button className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between glass rounded-xl p-6">
        {saved && (
          <p className="text-sm text-green-400 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Profile updated successfully!
          </p>
        )}
        <div className={saved ? "" : "ml-auto"}>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
