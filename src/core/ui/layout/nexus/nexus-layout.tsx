"use client";

/**
 * NexusLayout
 *
 * Dual-rail layout matching the Nexus ERP reference design exactly:
 *
 * ┌──────┬─────────┬──────────────────────────────────────────┐
 * │  56  │  210px  │  Topbar (46px)                           │
 * │  PRI │  SECOND │  ────────────────────────────────────── │
 * │  MA  │  ARY    │  Content (#080B15, padding 16px)         │
 * │  RY  │  RAIL   │                                          │
 * │  RAI │         │                                          │
 * │  L   │         │                                          │
 * └──────┴─────────┴──────────────────────────────────────────┘
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
        background: "#080B15",
        position: "relative",
      }}
    >
      {/* Workspace transition overlay */}
      <NexusTransitionOverlay />

      {/* Primary rail — 56px */}
      <NexusPrimaryRail />

      {/* Secondary rail + main area */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
        {/* Tenant context banner */}
        <TenantContextBanner />

        {/* Secondary rail + page */}
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
                background: "#080B15",
                scrollbarWidth: "thin",
                scrollbarColor: "#263050 transparent",
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
