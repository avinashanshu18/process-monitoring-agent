"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { WorkspacesOverview } from "@/components/workspaces/workspaces-overview";
import { WorkspacesList } from "@/components/workspaces/workspaces-list";
import { WorkspaceMembers } from "@/components/workspaces/workspace-members";
import { WorkspaceSettings } from "@/components/workspaces/workspace-settings";

export default function WorkspacesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Workspaces</h1>
          <p className="text-gray-400">Organize teams and manage collaboration</p>
        </div>

        {/* Overview */}
        <WorkspacesOverview />

        {/* Workspaces List */}
        <WorkspacesList />

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WorkspaceMembers />
          <WorkspaceSettings />
        </div>
      </div>
    </LayoutWrapper>
  );
}
