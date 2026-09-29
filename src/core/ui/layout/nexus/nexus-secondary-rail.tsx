"use client";

/**
 * NexusSecondaryRail — 240px panel sidebar
 *
 * Shows the CHILDREN of the selected root menu item from the primary rail.
 *
 * - Header: icon + name of the selected root item (context label + workspace name)
 * - Body: nav rows for the root item's children
 *   - Groups: items with no href but with children → group label + indented children
 *   - Leaf items: items with href → clickable nav link
 *
 * Colour comes from the --nx- token layer (theme resolves in CSS — no
 * resolvedTheme reads). Surface glass over the nexus ground, hairline edge,
 * accent only on the active leaf.
 */

import React, { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import type { MenuItem } from "@core/navigation";
import { RailHeader, RailContent } from "./_parts/secondary-rail-parts";
import { useNexusReducedMotion } from "./nexus-transition";
import { NEXUS_PANEL_W } from "./_parts/nexus-layout-constants";

interface NexusSecondaryRailProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
}

// ── Secondary Rail ────────────────────────────────────────────────────────────
export function NexusSecondaryRail({
  mobileOpen,
  onMobileClose,
  isCollapsed,
}: NexusSecondaryRailProps) {
  const { activeWorkspace, activeRootItem, isModuleMode } = useWorkspace();
  const { language, t } = useI18n();
  const pathname = usePathname();
  const reducedMotion = useNexusReducedMotion();

  // ── Context label ─────────────────────────────────────────────────────────
  const contextLabel = activeWorkspace
    ? (activeWorkspace.getLocalizedName(language) ?? activeWorkspace.workspaceKey.toUpperCase())
    : isModuleMode
      ? t("chrome.section.module")
      : t("chrome.section.platform");

  // ── Title: selected root item name ────────────────────────────────────────
  const title = activeRootItem
    ? language === "ar"
      ? activeRootItem.nameAr || activeRootItem.nameEn
      : activeRootItem.nameEn || activeRootItem.nameAr
    : (activeWorkspace?.getLocalizedName(language) ?? t("chrome.section.workspace"));

  // ── Menu items to display: children of the selected root item ─────────────
  const menuItems: MenuItem[] = activeRootItem?.children ?? [];
  const hasSubmenu = menuItems.length > 0;

  const handleNavigate = useCallback(() => onMobileClose?.(), [onMobileClose]);

  // Auto-collapse when panel is explicitly collapsed by user action OR when active root item has no children.
  // Do NOT collapse when activeWorkspace is null — that is a transient state
  // during JIT workspace activation (one React tick before useActiveRootSync fires).
  // Collapsing on null would cause the secondary rail to flash empty on every
  // page navigation where the workspace key momentarily resets.
  const effectiveCollapsed = !hasSubmenu || !!isCollapsed;

  const railStyle: React.CSSProperties = {
    width: effectiveCollapsed ? 0 : NEXUS_PANEL_W,
    opacity: effectiveCollapsed ? 0 : 1,
    height: "100%",
    minHeight: 0, // critical: allows flex child to scroll
    // An opaque surface step behind a hairline. The 65%-transparent slab needed
    // a 20px backdrop blur to stay legible, and that blur repainted the whole
    // rail on every content scroll behind it.
    background: "var(--nx-surface, hsl(var(--card)))",
    borderInlineEnd: effectiveCollapsed ? "none" : "1px solid var(--nx-line, hsl(var(--border)))",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    pointerEvents: effectiveCollapsed ? "none" : "auto",
    // Collapse still animates width because the content column must reflow with
    // it (a transform cannot do that). Reduced motion keeps only the crossfade.
    transition: reducedMotion
      ? "opacity var(--nx-t-micro, 140ms) ease"
      : "width var(--nx-t-panel, 300ms) var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1)), opacity var(--nx-t-standard, 200ms) var(--nx-ease-exit, cubic-bezier(0.3, 0, 0.8, 0.15)), background var(--nx-t-standard, 200ms) ease, border-inline-end-color var(--nx-t-standard, 200ms) ease",
  };

  const innerContainerStyle: React.CSSProperties = {
    width: NEXUS_PANEL_W, // Fixed width to prevent wrapping during collapse animation
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0, // critical: allows flex child to scroll
    overflow: "hidden",
  };

  const railContent = (
    <div style={innerContainerStyle}>
      <RailHeader contextLabel={contextLabel} title={title} />
      <RailContent
        menuItems={menuItems}
        pathname={pathname}
        language={language}
        onNavigate={handleNavigate}
      />
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        style={railStyle}
        aria-hidden={effectiveCollapsed}
        className="relative z-raised hidden lg:flex lg:flex-col"
      >
        {railContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && hasSubmenu && !effectiveCollapsed && (
        <>
          {/* The scrim pushes the page back by taking light away — that is the
              whole mechanism, so it carries no blur. */}
          <div
            className="fixed inset-0 z-overlay bg-scrim lg:hidden"
            style={{ transition: "opacity var(--nx-t-panel, 300ms) ease" }}
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 z-modal flex flex-col lg:hidden"
            style={{
              insetInlineStart: 64, // Logical property matching primary rail mobile width
              width: 260,
              // Floating panel → the popover surface, opaque. It read as glass
              // only because it was 92% of a surface behind a 24px blur.
              background: "var(--nx-popover, hsl(var(--card)))",
              borderInlineEnd: "1px solid var(--nx-line, hsl(var(--border)))", // Logical property
            }}
          >
            <div style={{ width: 260, height: "100%", display: "flex", flexDirection: "column" }}>
              <RailHeader contextLabel={contextLabel} title={title} />
              <RailContent
                menuItems={menuItems}
                pathname={pathname}
                language={language}
                onNavigate={handleNavigate}
              />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
