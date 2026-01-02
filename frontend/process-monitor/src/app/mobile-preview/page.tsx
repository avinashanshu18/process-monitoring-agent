"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { MobilePreviewOverview } from "@/components/mobile-preview/mobile-preview-overview";
import { DeviceSelector } from "@/components/mobile-preview/device-selector";
import { ScreenPreviews } from "@/components/mobile-preview/screen-previews";
import { ResponsiveStats } from "@/components/mobile-preview/responsive-stats";

export default function MobilePreviewPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mobile App Preview</h1>
          <p className="text-gray-400">Responsive design and device mockups</p>
        </div>

        {/* Overview */}
        <MobilePreviewOverview />

        {/* Device Selector */}
        <DeviceSelector />

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScreenPreviews />
          </div>
          <div>
            <ResponsiveStats />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
