"use client";

/**
 * NexusLayout
 *
 * Dual-rail layout with premium glassmorphism and animations.
 *
 * ┌──────┬─────────┬──────────────────────────────────────────┐
 * │ 64px │  240px  │  Topbar (56px)                           │
 * │  PRI │  PANEL  │  ────────────────────────────────────── │
 * │  MA  │  (sec-  │  Content (theme bg, padding 24px)        │
 * │  RY  │  ondary │                                          │
 * │  RAI │  rail)  │                                          │
 * │  L   │         │                                          │
 * └──────┴─────────┴──────────────────────────────────────────┘
 */

import React, { useState, useCallback, useEffect } from "react";
import { NexusPrimaryRail } from "./nexus-primary-rail";
import { NexusSecondaryRail } from "./nexus-secondary-rail";
import { NexusTopbar } from "./nexus-topbar";
import { NexusTransitionOverlay } from "./nexus-transition";
import { TenantContextBanner } from "@core/ui/layout/shared/tenant-context-banner";
import { NexusSearchPalette } from "./nexus-search-palette";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface NexusLayoutProps {
  children: React.ReactNode;
}

export function NexusLayout({ children }: NexusLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { direction } = useI18n();

  const openMobile = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelCollapsed((prev) => !prev), []);

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        direction === "rtl" ? "rtl" : "ltr"
      )}
      style={
        {
          display: "flex",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          position: "relative",
          "--nexus-primary-w": "64px",
          "--nexus-panel-w": isPanelCollapsed ? "0px" : "240px",
          "--nexus-topbar-h": "56px",
        } as React.CSSProperties
      }
    >
      {/* Workspace transition overlay */}
      <NexusTransitionOverlay />

      {/* Primary rail — fixed on the side */}
      <NexusPrimaryRail 
        onTogglePanel={togglePanel} 
        isPanelCollapsed={isPanelCollapsed} 
      />

      {/* Main Content Area */}
      <div 
        style={{ 
          display: "flex", 
          flex: 1, 
          flexDirection: "column", 
          overflow: "hidden",
          transition: "padding 300ms cubic-bezier(0.2, 0, 0, 1)"
        }}
      >
        <TenantContextBanner />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Secondary rail (panel) */}
          <NexusSecondaryRail
            mobileOpen={mobileMenuOpen}
            onMobileClose={closeMobile}
            isCollapsed={isPanelCollapsed}
          />

          {/* Page area */}
          <div 
            style={{ 
              display: "flex", 
              flex: 1, 
              flexDirection: "column", 
              overflow: "hidden",
              background: "hsl(var(--background))",
            }}
          >
            <NexusTopbar 
              onMobileMenuOpen={openMobile} 
              onTogglePanel={togglePanel}
              onOpenSearch={() => setSearchOpen(true)}
              isPanelCollapsed={isPanelCollapsed}
            />
            <main
              id="nexus-content"
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "16px 20px",
                background: "hsl(var(--background))",
                scrollbarWidth: "thin",
                scrollbarColor: "hsl(var(--border)) transparent",
              }}
            >
              <div className="animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
