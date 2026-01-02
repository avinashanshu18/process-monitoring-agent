"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { UsersOverview } from "@/components/users/users-overview";
import { UsersTable } from "@/components/users/users-table";
import { RolesPermissions } from "@/components/users/roles-permissions";
import { InviteUsers } from "@/components/users/invite-users";
import { ActivityLog } from "@/components/users/activity-log";

export default function UsersPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage team members, roles, and permissions</p>
        </div>

        {/* Overview */}
        <UsersOverview />

        {/* Users Table */}
        <UsersTable />

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RolesPermissions />
          <InviteUsers />
        </div>

        {/* Activity Log */}
        <ActivityLog />
      </div>
    </LayoutWrapper>
  );
}
