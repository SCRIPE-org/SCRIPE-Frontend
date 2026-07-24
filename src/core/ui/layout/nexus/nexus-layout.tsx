"use client";

/**
 * NexusLayout
 *
 * Dual-rail layout on the --nx- token layer: violet-cast near-black ground,
 * hairline edges, light collected on the active thing.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  TenantContextBanner (full-width, owned by dashboard-layout) │
 * ├──────┬─────────┬──────────────────────────────────────────  │
 * │ 64px │  240px  │  Topbar (56px)                             │
 * │  PRI │  PANEL  │  ──────────────────────────────────────── │
 * │  MA  │  (sec-  │  Content (scrollable)                      │
 * │  RY  │  ondary │                                            │
 * │  RAI │  rail)  │                                            │
 * │  L   │         │                                            │
 * └──────┴─────────┴────────────────────────────────────────────┘
 */

import React, { useState, useCallback, createContext, useContext, useEffect } from "react";
import { NexusPrimaryRail } from "./nexus-primary-rail";
import { NexusSecondaryRail } from "./nexus-secondary-rail";
import { NexusTopbar } from "./nexus-topbar";
import { NexusTransitionOverlay } from "./nexus-transition";
import { NexusWorkspaceLoader } from "./nexus-workspace-loader";
import { NexusSearchPalette } from "./nexus-search-palette";
import { NexusAppLauncher } from "./nexus-app-launcher";
import { useWorkspaceTransition } from "./use-workspace-transition";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { usePathname } from "next/navigation";
import {
  NEXUS_PANEL_W,
  NEXUS_PRIMARY_RAIL_W,
  NEXUS_TOPBAR_H,
} from "./_parts/nexus-layout-constants";
import { NexusFooter } from "./_parts/nexus-footer";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { HubTopBar } from "@modules/home";

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
  const { showFooter, collapsibleSidebar } = useSettings();
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
  // collapsibleSidebar=false pins the panel open: the toggle goes inert and any
  // previously collapsed state is ignored (the raw flag is kept so re-enabling
  // the setting restores the user's last choice).
  const togglePanel = useCallback(() => {
    if (!collapsibleSidebar) return;
    setIsPanelCollapsed((prev) => !prev);
  }, [collapsibleSidebar]);
  const effectivePanelCollapsed = collapsibleSidebar && isPanelCollapsed;

  // Workspace transition (loader + navigation)
  const { loaderState, switchWorkspace, goBackWorkspace } = useWorkspaceTransition();

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleStop = () => setIsNavigating(false);

    window.addEventListener("routing-progress-start", handleStart);
    window.addEventListener("routing-progress-stop", handleStop);

    return () => {
      window.removeEventListener("routing-progress-start", handleStart);
      window.removeEventListener("routing-progress-stop", handleStop);
    };
  }, []);

  return (
    <WorkspaceTransitionContext.Provider value={{ switchWorkspace, goBackWorkspace }}>
      {/* ── Hub Mode: Full-screen app launcher on the nexus ground ────────── */}
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
            background: "var(--nx-ground, hsl(var(--background)))",
            color: "var(--nx-ink, hsl(var(--foreground)))",
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

          {/* Ambient page-level washes — accent + the logo's cyan, sub-glow
              strength so the launcher's active card keeps the one real glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -200,
              insetInlineStart: "20%",
              width: 700,
              height: 600,
              background:
                "radial-gradient(closest-side, color-mix(in oklch, var(--nx-accent, hsl(var(--primary))) 10%, transparent), transparent 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -100,
              insetInlineEnd: -100,
              width: 480,
              height: 480,
              background:
                "radial-gradient(closest-side, color-mix(in oklch, var(--nx-secondary, hsl(var(--info))) 8%, transparent), transparent 70%)",
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
              scrollbarColor: "var(--nx-line, hsl(var(--border))) transparent",
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
          className={cn("bg-nx-ground text-nx-ink", direction === "rtl" ? "rtl" : "ltr")}
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
              "--nexus-panel-w": effectivePanelCollapsed ? "0px" : `${NEXUS_PANEL_W}px`,
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
              isPanelCollapsed={effectivePanelCollapsed}
              onOpenAppLauncher={() => setAppLauncherOpen(true)}
            />
            <NexusSecondaryRail
              mobileOpen={mobileMenuOpen}
              onMobileClose={closeMobile}
              isCollapsed={effectivePanelCollapsed}
            />
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                overflow: "hidden",
                background: "var(--nx-ground, hsl(var(--background)))",
              }}
            >
              {/* Scroll region — the topbar rides INSIDE it so the stickyHeader
                  setting is real behaviour: sticky pins it to the top edge,
                  non-sticky lets it scroll away with the page. */}
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  minHeight: 0,
                  flexDirection: "column",
                  overflowY: "auto",
                  overflowX: "hidden",
                  scrollbarWidth: "thin",
                  scrollbarColor: "var(--nx-line, hsl(var(--border))) transparent",
                }}
              >
                <NexusTopbar
                  onMobileMenuOpen={openMobile}
                  onTogglePanel={togglePanel}
                  onOpenSearch={() => setSearchOpen(true)}
                  isPanelCollapsed={effectivePanelCollapsed}
                />
                <main
                  id="nexus-content"
                  style={{
                    // Grow to fill short pages so the footer sits on the bottom
                    // edge; never shrink, so long pages scroll past it.
                    flex: "1 0 auto",
                    padding: "16px 20px",
                    background: "var(--nx-ground, hsl(var(--background)))",
                    // Routing dim — opacity only. A blur() here repaints the whole
                    // scroll field on every navigation; the crossfade is the effect.
                    opacity: isNavigating ? 0.35 : 1,
                    transition: "opacity var(--nx-t-micro, 140ms) ease-out",
                  }}
                >
                  <div className="animate-in fade-in duration-nx-standard">{children}</div>
                </main>
                {showFooter && <NexusFooter />}
              </div>
            </div>
          </div>

          <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
          <NexusAppLauncher open={appLauncherOpen} onOpenChange={setAppLauncherOpen} />
        </div>
      )}
    </WorkspaceTransitionContext.Provider>
  );
}
