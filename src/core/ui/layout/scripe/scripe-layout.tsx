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
import { NexusTransitionOverlay } from "@core/ui/layout/nexus/nexus-transition";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NotificationBell } from "@core/ui/notification/NotificationBell";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
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

const NARROW_QUERY = `(max-width: ${SCRIPE_PANEL_BREAKPOINT}px)`;

/** Read the breakpoint during the first client render so mobile never paints a
 *  three-column grid and then snaps to two. Returns false on the server. */
function readNarrow(): boolean {
  return typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches;
}

/** Root shell component composing rail, panel, topbar and the content field. */
export function ScripeLayout({ children }: ScripeLayoutProps) {
  const { direction, t } = useI18n();
  const [isNarrow, setIsNarrow] = useState(readNarrow);
  const [panelOpen, setPanelOpen] = useState(() => !readNarrow());
  const [searchOpen, setSearchOpen] = useState(false);

  // Below the breakpoint there is no room for a panel column, so the panel
  // becomes an overlay. Crossing the breakpoint resets the panel to the
  // default for the new size; within a size the user's choice stands.
  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY);
    const apply = () => {
      setIsNarrow(query.matches);
      setPanelOpen(!query.matches);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  // The overlay panel is a dismissible surface: Escape closes it, matching the
  // search palette and every dialog in the app.
  useEffect(() => {
    if (!isNarrow || !panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isNarrow, panelOpen]);

  const showPanelColumn = panelOpen && !isNarrow;
  const showPanelOverlay = panelOpen && isNarrow;

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
          "--edge-rail-w": `${SCRIPE_RAIL_W}px`,
          "--edge-panel-w": `${SCRIPE_PANEL_W}px`,
          "--edge-topbar-h": `${SCRIPE_TOPBAR_H}px`,
          display: "grid",
          // The panel only takes a column when there is room for one. Below the
          // breakpoint it overlays instead, so the content field never gets
          // squeezed to a few dozen pixels on a phone.
          gridTemplateColumns: showPanelColumn
            ? `${SCRIPE_RAIL_W}px ${SCRIPE_PANEL_W}px 1fr`
            : `${SCRIPE_RAIL_W}px 1fr`,
          gridTemplateRows: "minmax(0, 1fr)",
          position: "relative",
          flex: "1 1 auto",
          minHeight: 0,
          background: "var(--edge-void)",
          color: "var(--edge-ink)",
        } as React.CSSProperties
      }
    >
      <a href="#scripe-content" className="sx-skip">
        {t("nav.skipToContent") || "Skip to content"}
      </a>

      <ScripeRail
        onLauncherOpen={openLauncher}
        identitySlot={
          <>
            {/* Theme and language are user preferences, not page context, so
                they live with the user — not in the topbar. The topbar staying
                context-only is what keeps identity in exactly one place. */}
            <ThemeSwitcher buttonClassName="sx-rail-btn h-9 w-9 rounded-[9px]" />
            <LanguageSwitcher buttonClassName="sx-rail-btn h-9 w-9 rounded-[9px]" />
            <NotificationBell />
            <UserProfileDropdown showName={false} />
          </>
        }
      />

      {showPanelColumn && <ScripePanel />}

      {showPanelOverlay && (
        <>
          <button
            type="button"
            className="sx-scrim"
            aria-label={t("common.close") || "Close"}
            onClick={() => setPanelOpen(false)}
          />
          <div className="sx-panel-overlay">
            <ScripePanel />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-col">
        <ScripeTopbar
          onSearchOpen={openSearch}
          onPanelToggle={togglePanel}
          panelOpen={panelOpen}
        />
        <main id="scripe-content" className="sx-content flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <NexusSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Workspace-change sweep. Shared with nexus rather than reimplemented:
          it reads the workspace accent from the provider and knows nothing
          about either shell. */}
      <NexusTransitionOverlay />
    </div>
  );
}
