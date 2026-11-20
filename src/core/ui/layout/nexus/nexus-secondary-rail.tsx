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

import React, { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { MenuItem } from "@core/navigation";
import { RailHeader, RailContent } from "./_parts/secondary-rail-parts";
import { useNexusReducedMotion } from "./nexus-transition";
import { NEXUS_PANEL_W, getSecondaryMenuItems } from "./_parts/nexus-layout-constants";

interface NexusSecondaryRailProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ── Secondary Rail ────────────────────────────────────────────────────────────
export function NexusSecondaryRail({
  mobileOpen,
  onMobileClose,
  isCollapsed,
  returnFocusRef,
}: NexusSecondaryRailProps) {
  const { activeWorkspace, activeRootItem, rootMenuItems, isModuleMode } = useWorkspace();
  const { language, t } = useI18n();
  const pathname = usePathname();
  const reducedMotion = useNexusReducedMotion();
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasMobileOpenRef = useRef(false);

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

  // ── Menu items to display: children of selected root item (or workspace/root fallback) ─
  const menuItems: MenuItem[] = getSecondaryMenuItems(
    activeWorkspace?.workspaceKey,
    activeRootItem,
    rootMenuItems
  );
  const hasSubmenu = menuItems.length > 0;

  const handleNavigate = useCallback(() => onMobileClose?.(), [onMobileClose]);

  // Desktop collapse state ONLY — never gates the mobile drawer overlay.
  const effectiveCollapsed = !hasSubmenu || !!isCollapsed;
  const isMobileDrawerOpen = Boolean(mobileOpen && hasSubmenu);

  // Move focus into the mobile drawer when opened, and restore focus to the
  // toggle trigger (or previously focused element) when closed.
  useEffect(() => {
    if (isMobileDrawerOpen && !wasMobileOpenRef.current) {
      wasMobileOpenRef.current = true;
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const container = mobileDrawerRef.current;
      if (container) {
        const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (firstFocusable ?? container).focus();
      }
    } else if (!isMobileDrawerOpen && wasMobileOpenRef.current) {
      wasMobileOpenRef.current = false;
      const target = returnFocusRef?.current ?? previousFocusRef.current;
      previousFocusRef.current = null;
      target?.focus();
    }
  }, [isMobileDrawerOpen, returnFocusRef]);

  // Keyboard handling for the mobile drawer: Escape closes & Tab/Shift+Tab traps focus.
  useEffect(() => {
    if (!isMobileDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (e.defaultPrevented) return;
        e.preventDefault();
        e.stopPropagation();
        onMobileClose?.();
        return;
      }

      if (e.key !== "Tab") return;
      const container = mobileDrawerRef.current;
      if (!container) return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (el) =>
          el.getAttribute("aria-hidden") !== "true" &&
          !el.closest('[aria-hidden="true"], [inert]')
      );

      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (
          document.activeElement === first ||
          document.activeElement === container ||
          !container.contains(document.activeElement)
        ) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isMobileDrawerOpen, onMobileClose]);

  const railStyle: React.CSSProperties = {
    width: effectiveCollapsed ? 0 : NEXUS_PANEL_W,
    opacity: effectiveCollapsed ? 0 : 1,
    visibility: effectiveCollapsed ? "hidden" : "visible",
    height: "100%",
    minHeight: 0, // critical: allows flex child to scroll
    background: "var(--nx-surface, hsl(var(--card)))",
    borderInlineEnd: effectiveCollapsed ? "none" : "1px solid var(--nx-line, hsl(var(--border)))",
    flexShrink: 0,
    overflow: "hidden",
    pointerEvents: effectiveCollapsed ? "none" : "auto",
    // Opacity-only transition respects DESIGN.md width-animation ban & reduced-motion preference.
    transition: reducedMotion
      ? "none"
      : "opacity var(--nx-t-micro, 140ms) var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1)), background var(--nx-t-standard, 200ms) ease",
  };

  const innerContainerStyle: React.CSSProperties = {
    width: NEXUS_PANEL_W, // Fixed width to prevent wrapping during collapse
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
      {/* Desktop — inline `display` intentionally omitted so Tailwind `hidden lg:flex` governs <1024px */}
      <aside
        style={railStyle}
        aria-hidden={effectiveCollapsed || undefined}
        className="relative z-raised hidden lg:flex lg:flex-col"
      >
        {railContent}
      </aside>

      {/* Mobile overlay (<1024px) — independent of desktop collapse state */}
      {isMobileDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-overlay bg-scrim transition-opacity duration-nx-micro motion-reduce:transition-none lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || t("nav.secondary")}
            tabIndex={-1}
            className="fixed inset-y-0 start-0 z-modal flex flex-col border-e border-nx-line bg-nx-popover shadow-nx-modal outline-none lg:hidden"
            style={{ width: NEXUS_PANEL_W }}
          >
            <div style={innerContainerStyle}>
              <RailHeader
                contextLabel={contextLabel}
                title={title}
                onClose={onMobileClose}
                closeLabel={t("common.close")}
              />
              <RailContent
                menuItems={menuItems}
                pathname={pathname}
                language={language}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
