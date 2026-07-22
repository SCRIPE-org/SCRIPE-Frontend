"use client";

/**
 * ScripeTopbar — context bar (EDGE skin)
 *
 * Carries context only: panel toggle, breadcrumbs, search. Identity lives once,
 * at the foot of the rail — the topbar deliberately holds no avatar and no
 * notification bell, so the user is never rendered twice in one shell.
 */

import React from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { ChevronRight, Search, PanelLeft } from "lucide-react";

interface ScripeTopbarProps {
  onSearchOpen: () => void;
  onPanelToggle: () => void;
  panelOpen: boolean;
}

/**
 * Presentation UI component rendering the shell topbar.
 */
export function ScripeTopbar({
  onSearchOpen,
  onPanelToggle,
  panelOpen,
}: ScripeTopbarProps) {
  const { activeWorkspace, activeRootItem } = useWorkspace();
  const { language, direction, t } = useI18n();
  const isRTL = direction === "rtl";

  const label = (item: { nameEn: string; nameAr: string }) =>
    language === "ar" ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;

  const workspaceName = activeWorkspace
    ? language === "ar"
      ? activeWorkspace.workspaceNameAr || activeWorkspace.workspaceNameEn
      : activeWorkspace.workspaceNameEn || activeWorkspace.workspaceNameAr
    : null;

  return (
    <header
      className="sx-topbar flex shrink-0 items-center gap-2.5 px-4"
      style={{
        height: "var(--edge-topbar-h)",
        background: "var(--edge-void)",
        borderBlockEnd: "1px solid var(--edge-line)",
      }}
    >
      <button
        type="button"
        onClick={onPanelToggle}
        aria-label={t("nav.togglePanel") || "Toggle panel"}
        aria-expanded={panelOpen}
        aria-controls="scripe-panel"
        className="sx-icon-btn grid h-8 w-8 place-items-center rounded-md"
      >
        <PanelLeft size={15} style={{ transform: isRTL ? "scaleX(-1)" : undefined }} />
      </button>

      <nav
        aria-label={t("nav.breadcrumb") || "Breadcrumb"}
        className="flex min-w-0 items-center gap-1.5 text-[0.8rem]"
        style={{ color: "var(--edge-ink-3)" }}
      >
        {workspaceName && <span className="truncate">{workspaceName}</span>}
        {workspaceName && activeRootItem && (
          <ChevronRight
            size={12}
            aria-hidden="true"
            className="shrink-0 opacity-55"
            style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
          />
        )}
        {activeRootItem && (
          <span className="truncate font-semibold" style={{ color: "var(--edge-ink)" }}>
            {label(activeRootItem)}
          </span>
        )}
      </nav>

      <div className="ms-auto flex items-center gap-2">
        <button type="button" onClick={onSearchOpen} className="sx-search-btn">
          <Search size={13} aria-hidden="true" />
          <span className="hidden sm:inline">{t("nav.search") || "Search or jump…"}</span>
          <kbd className="sx-kbd">Ctrl K</kbd>
        </button>
      </div>
    </header>
  );
}
