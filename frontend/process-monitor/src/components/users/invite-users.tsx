"use client";

import { useState } from "react";
import { UserPlus, Mail, Send, Copy, CheckCircle } from "lucide-react";

export function InviteUsers() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");
  const [message, setMessage] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSendInvite = () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    // Simulate sending invite
    const link = `https://processmon.app/invite/${Math.random().toString(36).substr(2, 9)}`;
    setInviteLink(link);
    setInviteSent(true);
    
    setTimeout(() => {
      setInviteSent(false);
      setEmail("");
      setMessage("");
      setInviteLink("");
    }, 5000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingInvites = [
    {
      id: 1,
      email: "john.smith@example.com",
      role: "Viewer",
      sentDate: "Dec 8, 2024",
      expiresIn: "6 days",
    },
    {
      id: 2,
      email: "jane.doe@example.com",
      role: "User",
      sentDate: "Dec 7, 2024",
      expiresIn: "5 days",
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Invite Users</h3>
          <p className="text-sm text-gray-400">Add new team members</p>
        </div>
      </div>

      {/* Invite Form */}
      <div className="space-y-4 mb-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            placeholder="Add a personal message to the invitation..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendInvite}
          disabled={inviteSent}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            inviteSent
              ? "bg-green-500/20 text-green-400 border border-green-400/30"
              : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white shadow-lg shadow-green-500/20"
          }`}
        >
          {inviteSent ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Invitation Sent!
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Invitation
            </>
          )}
        </button>

        {/* Invite Link */}
        {inviteLink && (
          <div className="p-4 bg-green-500/5 border border-green-400/20 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Invitation Link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-black/30 rounded text-xs text-green-400 font-mono truncate">
                {inviteLink}
              </code>
              <button
                onClick={handleCopyLink}
                className="p-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 rounded transition-all"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Invites */}
      <div className="pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-4">Pending Invitations ({pendingInvites.length})</h4>
        <div className="space-y-2">
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div>
                <p className="text-sm font-medium text-white mb-1">{invite.email}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{invite.role}</span>
                  <span>•</span>
                  <span>Sent {invite.sentDate}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-yellow-400 mb-1">Expires in {invite.expiresIn}</p>
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
