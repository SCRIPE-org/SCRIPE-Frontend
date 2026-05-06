"use client";

/**
 * NexusLayout
 *
 * Dual-rail layout:
 *
 * ┌──────┬─────────┬──────────────────────────────────────────┐
 * │  56  │  210px  │  Topbar (46px)                           │
 * │  PRI │  PANEL  │  ────────────────────────────────────── │
 * │  MA  │  (sec-  │  Content (theme bg, padding 16px)        │
 * │  RY  │  ondary │                                          │
 * │  RAI │  rail)  │                                          │
 * │  L   │         │                                          │
 * └──────┴─────────┴──────────────────────────────────────────┘
 *
 * All background colours are driven by CSS variables (--background, --sidebar)
 * so the layout responds correctly to the next-themes light/dark toggle.
 */

import React, { useState, useCallback } from "react";
import { NexusPrimaryRail } from "./nexus-primary-rail";
import { NexusSecondaryRail } from "./nexus-secondary-rail";
import { NexusTopbar } from "./nexus-topbar";
import { NexusTransitionOverlay } from "./nexus-transition";
import { TenantContextBanner } from "@core/ui/layout/shared/tenant-context-banner";

interface NexusLayoutProps {
  children: React.ReactNode;
}

export function NexusLayout({ children }: NexusLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openMobile = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "hsl(var(--background))",
        position: "relative",
      }}
    >
      {/* Workspace transition overlay */}
      <NexusTransitionOverlay />

      {/* Primary rail — 56px icon buttons for root menu groups */}
      <NexusPrimaryRail />

      {/* Secondary rail + main area */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
        {/* Tenant context banner */}
        <TenantContextBanner />

        {/* Secondary rail (panel) + page */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <NexusSecondaryRail
            mobileOpen={mobileMenuOpen}
            onMobileClose={closeMobile}
          />

          {/* Page area */}
          <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
            <NexusTopbar onMobileMenuOpen={openMobile} />
            <main
              id="nexus-content"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                background: "hsl(var(--background))",
                scrollbarWidth: "thin",
                scrollbarColor: "hsl(var(--border)) transparent",
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
