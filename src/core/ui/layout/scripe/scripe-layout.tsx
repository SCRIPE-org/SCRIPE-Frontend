"use client";

/**
 * ScripeLayout — the EDGE shell
 *
 * ┌──────┬─────────┬──────────────────────────────────────────┐
 * │ 64px │  240px  │  Topbar (56px)                           │
 * │ RAIL │  PANEL  │  ─────────────────────────────────────── │
 * │      │         │  Content (the only scroll container)     │
 * └──────┴─────────┴──────────────────────────────────────────┘
 *
 * Geometry is inherited from the nexus shell on purpose. What changes is the
 * skin: every colour resolves from the EDGE token layer in globals.css, which
 * itself derives from the live workspace hue — so switching workspace re-tints
 * the whole interface with no per-component colour logic anywhere.
 *
 * Mounted only when settings.layoutTemplate === "scripe"; nexus is untouched.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { ScripeRail } from "./scripe-rail";
import { ScripePanel } from "./scripe-panel";
import { ScripeTopbar } from "./scripe-topbar";
import { NexusSearchPalette } from "@core/ui/layout/nexus/nexus-search-palette";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NotificationBell } from "@core/ui/notification/NotificationBell";
import {
  SCRIPE_RAIL_W,
  SCRIPE_PANEL_W,
  SCRIPE_TOPBAR_H,
  SCRIPE_PANEL_BREAKPOINT,
} from "./_parts/scripe-constants";

interface ScripeLayoutProps {
  children: React.ReactNode;
}

/**
 * Root shell component composing rail, panel, topbar and the content field.
 */
export function ScripeLayout({ children }: ScripeLayoutProps) {
  const { direction } = useI18n();
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Collapse the panel on narrow viewports; restore it when there is room.
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${SCRIPE_PANEL_BREAKPOINT}px)`);
    const apply = () => setPanelCollapsed(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const togglePanel = useCallback(() => setPanelCollapsed((v) => !v), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  // The launcher and the search palette are the same surface: one index of
  // every workspace and every route. Two entry points, one behaviour — so the
  // keyboard path and the rail button can never disagree.
  const openLauncher = openSearch;

  return (
    <div
      className="sx-shell"
      dir={direction}
      style={
        {
          "--sx-rail-w": `${SCRIPE_RAIL_W}px`,
          "--sx-panel-w": `${SCRIPE_PANEL_W}px`,
          "--sx-topbar-h": `${SCRIPE_TOPBAR_H}px`,
          display: "grid",
          gridTemplateColumns: panelCollapsed
            ? `${SCRIPE_RAIL_W}px 1fr`
            : `${SCRIPE_RAIL_W}px ${SCRIPE_PANEL_W}px 1fr`,
          gridTemplateRows: "minmax(0, 1fr)",
          flex: "1 1 auto",
          minHeight: 0,
          background: "var(--sx-void)",
          color: "var(--sx-ink)",
        } as React.CSSProperties
      }
    >
      <ScripeRail
        onLauncherOpen={openLauncher}
        identitySlot={
          <>
            <NotificationBell />
            <UserProfileDropdown showName={false} />
          </>
        }
      />

      {!panelCollapsed && <ScripePanel />}

      <div className="flex min-w-0 flex-col">
        <ScripeTopbar
          onSearchOpen={openSearch}
          onPanelToggle={togglePanel}
          panelCollapsed={panelCollapsed}
        />
        <main id="scripe-content" className="sx-content flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
