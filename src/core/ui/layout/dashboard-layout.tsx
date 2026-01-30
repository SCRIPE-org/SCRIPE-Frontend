"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Sidebar } from "@core/ui/layout/sidebar";
import { Header } from "@core/ui/layout/header";
import { MinimalHeader } from "@core/ui/layout/minimal-header";
import { ClassicHeader } from "@core/ui/layout/classic-header";
import { ClassicSidebar } from "@core/ui/layout/classic-sidebar";
import { ModernSidebar } from "@core/ui/layout/modern-sidebar";
import { Footer } from "@core/ui/layout/footer";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// Import the layout components
import { ElegantLayout } from "@core/ui/layout/elegant-layout";
import { CompactLayout } from "@core/ui/layout/compact-layout";
import { FloatingLayout } from "@core/ui/layout/floating-layout";
import { NavigationLayout } from "@core/ui/layout/navigation-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const settings = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(
    settings.collapsibleSidebar ? false : true
  );
  const [sidebarHovered, setSidebarHovered] = useState(false);
    const { direction } = useI18n();
    const { layoutTemplate, showFooter, collapsibleSidebar } = settings;

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

  // Navigation Layout - NEW
  if (layoutTemplate === "navigation") {
    return (
      <NavigationLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      >
        {children}
      </NavigationLayout>
    );
  }

  // Elegant Layout
  if (layoutTemplate === "elegant") {
    return (
      <ElegantLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      >
        {children}
      </ElegantLayout>
    );
  }

  // Compact Layout
  if (layoutTemplate === "compact") {
    return (
      <CompactLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      >
        {children}
      </CompactLayout>
    );
  }

  // Floating Layout
  if (layoutTemplate === "floating") {
    return (
      <FloatingLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      >
        {children}
      </FloatingLayout>
    );
  }

  // Modern Layout - Enhanced with dynamic content adjustment
  if (layoutTemplate === "modern") {
    return (
      <div
        className={cn(
          "min-h-screen bg-background",
          direction === "rtl" ? "rtl" : "ltr"
        )}
      >
        {/* Modern sidebar with hover expansion */}
        <ModernSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          onHoverChange={setSidebarHovered}
          collapsible={collapsibleSidebar}
        />

        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            direction === "rtl"
              ? sidebarHovered
                ? "lg:mr-80"
                : "lg:mr-20"
              : sidebarHovered
              ? "lg:ml-80"
              : "lg:ml-20"
          )}
        >
          {/* Modern header */}
            <Header onMenuClick={() => setSidebarOpen(true)} isModern={true} />

            <main className="p-6 pt-24">
              <div className="animate-fade-in">{children}</div>
            </main>
            {showFooter && <Footer />}
          </div>

        {/* Mobile overlay */}
        {sidebarOpen && collapsibleSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    );
  }

  // Minimal Layout
  if (layoutTemplate === "minimal") {
    return (
      <div
        className={cn(
          "min-h-screen bg-background",
          direction === "rtl" ? "rtl" : "ltr"
        )}
      >
        {/* Minimal layout has no sidebar, just a header with dropdown navigation */}
          <MinimalHeader />

          <main className="p-6 pt-20">
            <div className="animate-fade-in max-w-7xl mx-auto">{children}</div>
          </main>
          {showFooter && <Footer />}
        </div>
    );
  }

  // Classic Layout (default)
  if (layoutTemplate === "classic") {
    return (
      <div
        className={cn(
          "min-h-screen bg-background",
          direction === "rtl" ? "rtl" : "ltr"
        )}
      >
        {/* Classic sidebar - wider with larger icons and text */}
        <ClassicSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          collapsible={collapsibleSidebar}
        />

        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            direction === "rtl" ? "lg:mr-80" : "lg:ml-80"
          )}
        >
          {/* Classic header - simpler with fewer elements */}
          <ClassicHeader onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-8">
            <div className="animate-fade-in">{children}</div>
          </main>
          {showFooter && <Footer />}
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && collapsibleSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    );
  }

  // Default fallback (should not be reached now)
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        direction === "rtl" ? "rtl" : "ltr"
      )}
    >
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            direction === "rtl" ? "lg:mr-80" : "lg:ml-80"
          )}
        >
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-6">
            <div className="animate-fade-in">{children}</div>
          </main>
          {showFooter && <Footer />}
        </div>

      {/* Mobile overlay */}
      {sidebarOpen && collapsibleSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
