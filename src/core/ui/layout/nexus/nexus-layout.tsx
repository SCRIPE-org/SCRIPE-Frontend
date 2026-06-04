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
import { NexusAppLauncher } from "./nexus-app-launcher";
import { useWorkspaceTransition } from "./use-workspace-transition";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { usePathname } from "next/navigation";
import {
  NEXUS_PANEL_W,
  NEXUS_PRIMARY_RAIL_W,
  NEXUS_TOPBAR_H,
} from "./_parts/nexus-layout-constants";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { HubTopBar } from "@modules/home/presentation/components/HubTopBar";

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
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const { direction } = useI18n();
  const pathname = usePathname();
  const activeWorkspaceKey = useNavigationStore((s) => s.activeWorkspaceKey);
  const workspaceGroups = useNavigationStore((s) => s.workspaceGroups);
  //
  // Hub mode detection — ONLY the explicit /hub route.
  //
  // Do NOT use `!activeWorkspaceKey` as a hub signal on other pages:
  // activeWorkspaceKey is transiently null while useActiveRootSync fires its
  // JIT workspace activation (a single React tick). Using it as hub signal
  // caused the secondary rail to vanish and isHubPage to flip true on every
  // navigation (e.g. /overview, /settings) before the JIT completes.
  //
  // Rule: we are in hub mode if and only if:
  //   (a) the URL is /hub (explicit standalone hub page), OR
  //   (b) no workspaces have been loaded yet AND the user is not on a concrete page
  //       (workspaceGroups.length === 0 means NavigationProvider is still bootstrapping)
  const isHubPage =
    pathname === "/hub" ||
    (workspaceGroups.length === 0 && !activeWorkspaceKey && pathname === "/");

  const openMobile = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelCollapsed((prev) => !prev), []);

  // Workspace transition (loader + navigation)
  const { loaderState, switchWorkspace, goBackWorkspace } = useWorkspaceTransition();

  return (
    <WorkspaceTransitionContext.Provider value={{ switchWorkspace, goBackWorkspace }}>
      {/* ── Hub Mode: Full-screen dark app launcher ──────────────────────── */}
      {isHubPage ? (
        <div
          className={cn(direction === "rtl" ? "rtl" : "ltr")}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            width: "100%",
            overflow: "hidden",
            position: "relative",
            background: "#0A0E1A",
            color: "#e6e9f5",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {/* Workspace transition overlay still works in hub mode */}
          <NexusTransitionOverlay />
          <NexusWorkspaceLoader
            show={loaderState.show}
            workspaceName={loaderState.workspaceName}
            workspaceAbbr={loaderState.workspaceAbbr}
            accentColor={loaderState.accentColor}
          />

          {/* Ambient page-level glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -200,
              left: "20%",
              width: 700,
              height: 600,
              background:
                "radial-gradient(closest-side, rgba(94,145,255,0.10), rgba(94,145,255,0) 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 480,
              height: 480,
              background:
                "radial-gradient(closest-side, rgba(154,77,219,0.08), rgba(154,77,219,0) 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />

          <HubTopBar
            onSearchClick={() => setSearchOpen(true)}
            onAppLauncherClick={() => setAppLauncherOpen(true)}
          />

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            {children}
          </div>

          <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
          <NexusAppLauncher open={appLauncherOpen} onOpenChange={setAppLauncherOpen} />
        </div>
      ) : (
        /* ── Normal Nexus Layout: Dual-rail with sidebar ──────────────── */
        <div
          className={cn("bg-background text-foreground", direction === "rtl" ? "rtl" : "ltr")}
          style={
            {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              width: "100%",
              overflow: "hidden",
              position: "relative",
              "--nexus-primary-w": `${NEXUS_PRIMARY_RAIL_W}px`,
              "--nexus-panel-w": isPanelCollapsed ? "0px" : `${NEXUS_PANEL_W}px`,
              "--nexus-topbar-h": `${NEXUS_TOPBAR_H}px`,
            } as React.CSSProperties
          }
        >
          <NexusTransitionOverlay />
          <NexusWorkspaceLoader
            show={loaderState.show}
            workspaceName={loaderState.workspaceName}
            workspaceAbbr={loaderState.workspaceAbbr}
            accentColor={loaderState.accentColor}
          />

          {/* ── Rail + Content row ──────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <NexusPrimaryRail
              onTogglePanel={togglePanel}
              isPanelCollapsed={isPanelCollapsed}
              onOpenAppLauncher={() => setAppLauncherOpen(true)}
            />
            <NexusSecondaryRail
              mobileOpen={mobileMenuOpen}
              onMobileClose={closeMobile}
              isCollapsed={isPanelCollapsed}
            />
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
                <div className="duration-500 animate-in fade-in">{children}</div>
              </main>
            </div>
          </div>

          <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
          <NexusAppLauncher open={appLauncherOpen} onOpenChange={setAppLauncherOpen} />
        </div>
      )}
    </WorkspaceTransitionContext.Provider>
  );
}
