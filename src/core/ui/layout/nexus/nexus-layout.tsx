"use client";

/**
 * NexusLayout
 *
 * Dual-rail layout with premium glassmorphism and animations.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  TenantContextBanner (fixed, full-width, z-[70])            │
 * ├──────┬─────────┬──────────────────────────────────────────  │
 * │ 64px │  240px  │  Topbar (56px)                             │
 * │  PRI │  PANEL  │  ──────────────────────────────────────── │
 * │  MA  │  (sec-  │  Content (scrollable)                      │
 * │  RY  │  ondary │                                            │
 * │  RAI │  rail)  │                                            │
 * │  L   │         │                                            │
 * └──────┴─────────┴────────────────────────────────────────────┘
 */

import React, { useState, useCallback, createContext, useContext } from "react";
import { NexusPrimaryRail } from "./nexus-primary-rail";
import { NexusSecondaryRail } from "./nexus-secondary-rail";
import { NexusTopbar } from "./nexus-topbar";
import { NexusTransitionOverlay } from "./nexus-transition";
import { NexusWorkspaceLoader } from "./nexus-workspace-loader";
import { NexusSearchPalette } from "./nexus-search-palette";
import { useWorkspaceTransition } from "./use-workspace-transition";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

// ── Workspace transition context ─────────────────────────────────────────────
interface WorkspaceTransitionContextType {
  switchWorkspace: (key: string) => void;
  goBackWorkspace: () => void;
}
const WorkspaceTransitionContext = createContext<WorkspaceTransitionContextType>({
  switchWorkspace: () => {},
  goBackWorkspace: () => {},
});
export function useWorkspaceTransitionContext() {
  return useContext(WorkspaceTransitionContext);
}

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

  // Workspace transition (loader + navigation)
  const { loaderState, switchWorkspace, goBackWorkspace } = useWorkspaceTransition();

  return (
    <WorkspaceTransitionContext.Provider value={{ switchWorkspace, goBackWorkspace }}>
    <div
      className={cn(
        "bg-background text-foreground",
        direction === "rtl" ? "rtl" : "ltr"
      )}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        width: "100%",
        overflow: "hidden",
        position: "relative",
        "--nexus-primary-w": "64px",
        "--nexus-panel-w": isPanelCollapsed ? "0px" : "240px",
        "--nexus-topbar-h": "56px",
      } as React.CSSProperties}
    >
      {/* Workspace transition overlay (color-sweep on workspace change) */}
      <NexusTransitionOverlay />

      {/* Module loading overlay (shown while switching + navigating) */}
      <NexusWorkspaceLoader
        show={loaderState.show}
        workspaceName={loaderState.workspaceName}
        workspaceAbbr={loaderState.workspaceAbbr}
        accentColor={loaderState.accentColor}
      />

      {/*
       * ── Global Banner (impersonation / tenant drilldown) ──────────────────
       * Banner is now managed by DashboardLayout above us.
       */}

      {/* ── Rail + Content row (fills remaining height) ──────────────────── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          minHeight: 0, // critical: allows flex child to shrink below content size
        }}
      >
        {/* Primary rail — full height of this row */}
        <NexusPrimaryRail
          onTogglePanel={togglePanel}
          isPanelCollapsed={isPanelCollapsed}
        />

        {/* Secondary rail (panel) */}
        <NexusSecondaryRail
          mobileOpen={mobileMenuOpen}
          onMobileClose={closeMobile}
          isCollapsed={isPanelCollapsed}
        />

        {/* Page area: topbar + scrollable main */}
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
            <div className="animate-in fade-in duration-500">{children}</div>
          </main>
        </div>
      </div>

      <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
    </WorkspaceTransitionContext.Provider>
  );
}
