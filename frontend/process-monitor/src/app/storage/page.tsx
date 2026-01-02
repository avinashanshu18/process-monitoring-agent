"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { StorageOverview } from "@/components/storage/storage-overview";
import { DiskUsage } from "@/components/storage/disk-usage";
import { FileSystemAnalyzer } from "@/components/storage/file-system-analyzer";
import { StorageHealth } from "@/components/storage/storage-health";
import { LargeFiles } from "@/components/storage/large-files";

export default function StoragePage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Disk & Storage</h1>
          <p className="text-gray-400">Monitor disk usage, file systems, and storage health</p>
        </div>

        {/* Storage Overview */}
        <StorageOverview />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DiskUsage />
          <StorageHealth />
        </div>

        <FileSystemAnalyzer />
        <LargeFiles />
      </div>
    </LayoutWrapper>
  );
}
