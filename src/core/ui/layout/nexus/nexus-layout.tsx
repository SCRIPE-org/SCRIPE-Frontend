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

import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { NexusPrimaryRail } from "./nexus-primary-rail";
import { NexusSecondaryRail } from "./nexus-secondary-rail";
import { NexusTopbar } from "./nexus-topbar";
import { NexusTransitionOverlay } from "./nexus-transition";
import { NexusWorkspaceLoader } from "./nexus-workspace-loader";
import { NexusSearchPalette } from "./nexus-search-palette";
import { NexusAppLauncher } from "./nexus-app-launcher";
import { useWorkspaceTransition } from "./use-workspace-transition";
import type { SetActiveWorkspaceOptions } from "@core/providers/hooks/useWorkspaceActions";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import {
  NEXUS_PANEL_W,
  NEXUS_PRIMARY_RAIL_W,
  NEXUS_TOPBAR_H,
  hasSecondarySubmenu,
} from "./_parts/nexus-layout-constants";
import { NexusFooter } from "./_parts/nexus-footer";
import { useWorkspace } from "@core/providers/workspace-provider";

const AI_COPILOT_DEMO_ENABLED = process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO === "true";
const AiCopilotDemoHost = AI_COPILOT_DEMO_ENABLED
  ? dynamic(
      () => import("@/features/ai-copilot-demo").then((m) => ({ default: m.AiCopilotDemoHost })),
      { ssr: false }
    )
  : null;

// ── Workspace transition context ─────────────────────────────────────────────
interface WorkspaceTransitionContextType {
  switchWorkspace: (key: string, options?: SetActiveWorkspaceOptions) => void;
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
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const { direction, t } = useI18n();
  const { showFooter, collapsibleSidebar } = useSettings();

  const openMobile = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);
  // collapsibleSidebar=false pins the panel open: the toggle goes inert and any
  // previously collapsed state is ignored (the raw flag is kept so re-enabling
  // the setting restores the user's last choice).
  const togglePanel = useCallback(() => {
    if (!collapsibleSidebar) return;
    setIsPanelCollapsed((prev) => !prev);
  }, [collapsibleSidebar]);
  const { activeRootItem, activeWorkspace, rootMenuItems } = useWorkspace();
  const hasSubmenu = hasSecondarySubmenu(
    activeWorkspace?.workspaceKey,
    activeRootItem,
    rootMenuItems
  );
  const effectivePanelCollapsed = (collapsibleSidebar && isPanelCollapsed) || !hasSubmenu;

  useEffect(() => {
    if (typeof window === "undefined" || !mobileMenuOpen) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [mobileMenuOpen]);

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

  const renderShell = (copilotTrigger: React.ReactNode, copilotPanel: React.ReactNode) => (
    <WorkspaceTransitionContext.Provider value={{ switchWorkspace, goBackWorkspace }}>
      {/* ── Unified Nexus Layout: Dual-rail with collapsible secondary panel ── */}
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
        <a
          href="#nexus-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-tooltip focus:rounded-nx-control focus:bg-nx-accent-fill focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-nx-on-fill focus:shadow-nx-focus focus:outline-none"
        >
          {t("nav.skipToContent")}
        </a>
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
            returnFocusRef={mobileToggleRef}
          />
          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
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
                isMobileMenuOpen={mobileMenuOpen}
                toggleButtonRef={mobileToggleRef}
                extraActions={copilotTrigger}
              />
              <main
                id="nexus-content"
                tabIndex={-1}
                className="focus:outline-none"
                style={{
                  // Grow to fill short pages so the footer sits on the bottom
                  // edge; never shrink, so long pages scroll past it.
                  flex: "1 0 auto",
                  padding: "16px 20px",
                  background: "var(--nx-ground, hsl(var(--background)))",
                  // Routing dim — opacity only. A blur() here repaints the whole
                  // scroll field on every navigation; the crossfade is the effect.
                  opacity: isNavigating ? 0.35 : 1,
                  transition:
                    "opacity var(--nx-t-micro, 140ms) var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1))",
                }}
              >
                <div className="duration-nx-standard animate-in fade-in">{children}</div>
              </main>
              {showFooter && <NexusFooter />}
            </div>
          </div>
          {copilotPanel}
        </div>

        <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
        <NexusAppLauncher open={appLauncherOpen} onOpenChange={setAppLauncherOpen} />
      </div>
    </WorkspaceTransitionContext.Provider>
  );

  if (AiCopilotDemoHost) {
    return (
      <AiCopilotDemoHost>
        {({ triggerNode, panelNode }) => renderShell(triggerNode, panelNode)}
      </AiCopilotDemoHost>
    );
  }

  return renderShell(null, null);
}
