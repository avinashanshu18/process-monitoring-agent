"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { useState } from "react";
import { GeneralSettings } from "@/components/settings/general-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import { ApiKeysSettings } from "@/components/settings/api-keys-settings";
import { WebhooksSettings } from "@/components/settings/webhooks-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  Webhook, 
  Bell, 
  Shield 
} from "lucide-react";

const settingsTabs = [
  { id: "general", name: "General", icon: SettingsIcon },
  { id: "account", name: "Account", icon: User },
  { id: "api-keys", name: "API Keys", icon: Key },
  { id: "webhooks", name: "Webhooks", icon: Webhook },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and application preferences</p>
        </div>

        {/* Settings Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-4 sticky top-24">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "account" && <AccountSettings />}
            {activeTab === "api-keys" && <ApiKeysSettings />}
            {activeTab === "webhooks" && <WebhooksSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "security" && <SecuritySettings />}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
