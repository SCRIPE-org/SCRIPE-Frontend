"use client";

/**
 * NexusSecondaryRail — 210px panel sidebar
 *
 * Shows the CHILDREN of the selected root menu item from the primary rail.
 *
 * - Header: icon + name of the selected root item (context label + workspace name)
 * - Body: nav rows for the root item's children
 *   - Groups: items with no href but with children → group label + indented children
 *   - Leaf items: items with href → clickable nav link
 *
 * Theme-aware: adapts to light/dark using useTheme.
 * Features premium glassmorphism aesthetics and micro-animations.
 */

import React, { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";
import type { MenuItem } from "@core/navigation";
import { useNexusPalette } from "./_parts/nexus-theme-utils";
import { RailHeader, RailContent } from "./_parts/secondary-rail-parts";
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
  const { activeWorkspace, activeRootItem, isModuleMode, accentColor } = useWorkspace();
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  const isDark = resolvedTheme === "dark";
  const palette = useNexusPalette(isDark, accentColor ?? (isDark ? "#7C6FD4" : "#6258c4"));

  // ── Context label ─────────────────────────────────────────────────────────
  const contextLabel = activeWorkspace
    ? (activeWorkspace.getLocalizedName(language) ?? activeWorkspace.workspaceKey.toUpperCase())
    : isModuleMode
      ? "MODULE"
      : "PLATFORM";

  // ── Title: selected root item name ────────────────────────────────────────
  const title = activeRootItem
    ? language === "ar"
      ? activeRootItem.nameAr || activeRootItem.nameEn
      : activeRootItem.nameEn || activeRootItem.nameAr
    : (activeWorkspace?.getLocalizedName(language) ?? "Workspace");

  // ── Menu items to display: children of the selected root item ─────────────
  const menuItems: MenuItem[] = activeRootItem?.children ?? [];

  const handleNavigate = useCallback(() => onMobileClose?.(), [onMobileClose]);

  // Auto-collapse when no workspace is selected (Hub page)
  const effectiveCollapsed = isCollapsed || !activeWorkspace;

  const railStyle: React.CSSProperties = {
    width: effectiveCollapsed ? 0 : NEXUS_PANEL_W,
    opacity: effectiveCollapsed ? 0 : 1,
    height: "100%",
    minHeight: 0, // critical: allows flex child to scroll
    background: palette.railBg,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderInlineEnd: effectiveCollapsed ? "none" : palette.railBorder,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    transition:
      "width 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1), background 200ms ease, border-inline-end-color 200ms ease",
    zIndex: 9,
    boxShadow: isDark ? "inset -1px 0 0 rgba(255,255,255,0.02)" : "inset -1px 0 0 rgba(0,0,0,0.01)",
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
      <RailHeader contextLabel={contextLabel} title={title} palette={palette} />
      <RailContent
        menuItems={menuItems}
        pathname={pathname}
        palette={palette}
        language={language}
        onNavigate={handleNavigate}
      />
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside style={railStyle} className="relative hidden lg:flex lg:flex-col">
        {railContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && !effectiveCollapsed && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background: isDark ? "rgba(8,11,21,0.6)" : "rgba(30,40,60,0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "opacity 300ms ease",
            }}
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 z-50 flex flex-col lg:hidden"
            style={{
              insetInlineStart: 64, // Logical property matching primary rail mobile width
              width: 260,
              background: palette.railBg,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderInlineEnd: palette.railBorder, // Logical property
              boxShadow: isDark ? "5px 0 30px rgba(0,0,0,0.5)" : "5px 0 30px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ width: 260, height: "100%", display: "flex", flexDirection: "column" }}>
              <RailHeader contextLabel={contextLabel} title={title} palette={palette} />
              <RailContent
                menuItems={menuItems}
                pathname={pathname}
                palette={palette}
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
