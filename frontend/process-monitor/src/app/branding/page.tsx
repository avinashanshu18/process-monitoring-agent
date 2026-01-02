"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { BrandingOverview } from "@/components/branding/branding-overview";
import { LogoCustomization } from "@/components/branding/logo-customization";
import { ColorTheme } from "@/components/branding/color-theme";
import { BrandingPreview } from "@/components/branding/branding-preview";
import { CustomDomain } from "@/components/branding/custom-domain";

export default function BrandingPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">White-label Branding</h1>
          <p className="text-gray-400">Customize your brand identity and appearance</p>
        </div>

        {/* Overview */}
        <BrandingOverview />

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LogoCustomization />
            <ColorTheme />
            <CustomDomain />
          </div>
          <div>
            <BrandingPreview />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
