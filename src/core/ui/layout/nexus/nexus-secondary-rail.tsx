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
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid } from "lucide-react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { MenuItem } from "@core/navigation";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { RailHeader, RailContent } from "./_parts/secondary-rail-parts";
import { useRailStartPageToggle } from "./use-rail-start-page-toggle";
import { useNexusReducedMotion } from "./nexus-transition";
import { NEXUS_PANEL_W, getSecondaryMenuItems } from "./_parts/nexus-layout-constants";

interface NexusSecondaryRailProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
  onOpenAppLauncher?: () => void;
  mobileFooter?: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ── Secondary Rail ────────────────────────────────────────────────────────────
export function NexusSecondaryRail({
  mobileOpen,
  onMobileClose,
  isCollapsed,
  returnFocusRef,
  onOpenAppLauncher,
  mobileFooter,
}: NexusSecondaryRailProps) {
  const { activeWorkspace, activeRootItem, rootMenuItems, isModuleMode, setActiveRootItemId } =
    useWorkspace();
  const { language, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
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
  const handleManageStartPages = useCallback(() => {
    onMobileClose?.();
    router.push("/account/preferences");
  }, [onMobileClose, router]);

  const startPageAction = useRailStartPageToggle({
    activeWorkspace,
    activeRootItem,
    rootMenuItems,
    pathname: pathname ?? "",
    language,
    t,
  });

  const customStartPageHref =
    activeWorkspace?.effectiveHomeSource === "PersonalOverride" &&
    !activeWorkspace.isEffectiveHomeEnforced
      ? activeWorkspace.effectiveHomeRoute
      : null;
  const startPageIndicatorLabel = t("chrome.startPageIndicator");

  // Desktop collapse state ONLY — never gates the mobile drawer overlay.
  const effectiveCollapsed = !hasSubmenu || !!isCollapsed;
  const isMobileDrawerOpen = Boolean(mobileOpen);

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
      <RailHeader
        contextLabel={contextLabel}
        title={title}
        startPageAction={startPageAction}
        onManageStartPages={handleManageStartPages}
        t={t}
      />
      <RailContent
        menuItems={menuItems}
        pathname={pathname}
        language={language}
        onNavigate={handleNavigate}
        customStartPageHref={customStartPageHref}
        startPageIndicatorLabel={startPageIndicatorLabel}
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
            data-nexus-mobile-drawer="true"
            tabIndex={-1}
            className="fixed inset-y-0 start-0 z-modal flex flex-col overflow-hidden border-e border-nx-line bg-nx-surface shadow-nx-modal outline-none lg:hidden"
            style={{ width: NEXUS_PANEL_W }}
          >
            <div style={innerContainerStyle}>
              <RailHeader
                contextLabel={contextLabel}
                title={title}
                onClose={onMobileClose}
                closeLabel={t("common.close")}
                startPageAction={startPageAction}
                onManageStartPages={handleManageStartPages}
                t={t}
              />
              <div className="space-y-2 border-b border-nx-line px-3 py-2.5 md:hidden">
                <div className="flex flex-col gap-1.5">
                  {onOpenAppLauncher && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onMobileClose?.();
                        onOpenAppLauncher();
                      }}
                      className="min-h-8 h-auto w-full justify-start gap-2 px-2.5 py-1.5 text-xs !whitespace-normal text-start"
                    >
                      <LayoutGrid className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="whitespace-normal text-start leading-snug">
                        {t("shell.launcher.title")}
                      </span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onMobileClose?.();
                      router.push("/hub");
                    }}
                    className="min-h-8 h-auto w-full justify-start gap-2 px-2.5 py-1.5 text-xs !whitespace-normal text-start"
                    aria-label={t("chrome.allWorkspaces")}
                  >
                    <Home className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="whitespace-normal text-start leading-snug">
                      {t("chrome.allWorkspaces")}
                    </span>
                  </Button>
                </div>
                {rootMenuItems.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rootMenuItems.map((root) => {
                      const isActiveRoot = root.id === activeRootItem?.id;
                      const rootLabel =
                        language === "ar"
                          ? root.nameAr || root.nameEn
                          : root.nameEn || root.nameAr;
                      return (
                        <Button
                          key={root.id}
                          type="button"
                          variant={isActiveRoot ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => {
                            setActiveRootItemId?.(root.id);
                            if (root.href && (!root.children || root.children.length === 0)) {
                              onMobileClose?.();
                              router.push(root.href);
                            }
                          }}
                          className={cn(
                            "h-7 max-w-full px-2 text-[11px]",
                            isActiveRoot
                              ? "border border-nx-line font-semibold text-nx-ink"
                              : "text-nx-ink-2"
                          )}
                        >
                          <span className="truncate">{rootLabel}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
              {hasSubmenu ? (
                <RailContent
                  menuItems={menuItems}
                  pathname={pathname}
                  language={language}
                  onNavigate={handleNavigate}
                  customStartPageHref={customStartPageHref}
                  startPageIndicatorLabel={startPageIndicatorLabel}
                />
              ) : (
                <div className="flex-1" />
              )}
              {mobileFooter && (
                <div className="mt-auto border-t border-nx-line p-2 md:hidden">{mobileFooter}</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
