"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";

// Active layout components
import { NavigationLayout } from "@core/ui/layout/navigation/navigation-layout";
import { TabbedLayout } from "@core/ui/layout/tabbed/tabbed-layout";
import { DualLayout } from "@core/ui/layout/dual/dual-layout";
import { CommandLayout } from "@core/ui/layout/command/command-layout";
import { StackedLayout } from "@core/ui/layout/stacked/stacked-layout";
import { HUDLayout } from "@core/ui/layout/hud/hud-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const settings = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(
    settings.collapsibleSidebar ? false : true
  );
  const { direction } = useI18n();
  const { layoutTemplate, collapsibleSidebar } = settings;

  useEffect(() => {
    if (!collapsibleSidebar) {
      setSidebarOpen(true);
    }
  }, [collapsibleSidebar]);

  // Close sidebar when clicking outside on mobile if collapsible
  useEffect(() => {
    if (!collapsibleSidebar) return;
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector(".sidebar");
      const sidebarTrigger = document.querySelector(".sidebar-trigger");

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        sidebarTrigger &&
        !sidebarTrigger.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collapsibleSidebar]);

  // Tabbed Layout
  if (layoutTemplate === "tabbed") {
    return (
      <TabbedLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      >
        {children}
      </TabbedLayout>
    );
  }

  // Dual Layout
  if (layoutTemplate === "dual") {
    return (
      <DualLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      >
        {children}
      </DualLayout>
    );
  }

  // Command Layout
  if (layoutTemplate === "command") {
    return <CommandLayout>{children}</CommandLayout>;
  }

  // Stacked Layout
  if (layoutTemplate === "stacked") {
    return <StackedLayout>{children}</StackedLayout>;
  }

  // HUD Layout
  if (layoutTemplate === "hud") {
    return <HUDLayout>{children}</HUDLayout>;
  }

  // Navigation Layout (default — also handles classic/compact/elegant/floating/minimal/modern until rebuilt)
  return (
    <NavigationLayout
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
    >
      {children}
    </NavigationLayout>
  );
}
