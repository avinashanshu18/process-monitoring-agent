"use client";

import { useState } from "react";

import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

export function LayoutWrapper({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  function handleSidebarToggle() {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setDesktopSidebarOpen((value) => !value);
      return;
    }

    setMobileSidebarOpen((value) => !value);
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(119,224,195,0.14),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(103,125,255,0.1),_transparent_24%)]" />
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        desktopOpen={desktopSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleDesktop={() => setDesktopSidebarOpen((value) => !value)}
      />
      <div className={desktopSidebarOpen ? "lg:pl-[320px]" : "lg:pl-0"}>
        <TopBar
          onMenuClick={handleSidebarToggle}
          title={title}
          description={description}
          desktopSidebarOpen={desktopSidebarOpen}
        />
        <main className="relative z-10 px-4 pb-12 pt-24 sm:px-5 sm:pb-14 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
