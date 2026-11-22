"use client";

import React from "react";
import { Search, Home, ChevronDown, Lock } from "lucide-react";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { Button } from "@core/ui/button";
import {
  PanelMenuIcon,
  PanelMenuIconRTL,
  PanelCollapseIcon,
  PanelCollapseIconRTL,
} from "@core/ui/layout/shared/nav-icons";
import { TopbarContextPill, type TopbarContextPillProps } from "@core/ui/layout/shared/topbar-context-pill";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useWorkspaceTransitionContext } from "../nexus-layout";
import { cn, resolveBilingualLabel } from "@core/common/utils";
import type { MenuItem, WorkspaceGroup } from "@core/navigation";
import { normalizeRoutePath } from "@core/config/app-route-manifest";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { usePermissions } from "@core/providers/permission-provider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";

// Every colour below reads the --nx- token layer (theme resolves in CSS).
// Shared focus treatment — keyboard focus gets the accent ring, mouse focus
// stays quiet. --nx-focus is the product's single focus ring; a hand-built
// `ring-2 ring-nx-accent` pair drew a different ring from every other control.
const FOCUS_RING = "focus-visible:outline-none focus-visible:shadow-nx-focus";

// Shared motion for the bar's controls. Scoped on purpose: animating every
// property on a 56px bar interpolated height and padding too, so a settings or
// breadcrumb change reflowed the whole header over 140ms.
const CONTROL_MOTION =
  "transition-[color,background-color,border-color,box-shadow] ease-nx-enter motion-reduce:transition-none";

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
export function BreadcrumbSep({ isRTL: _isRTL }: { isRTL?: boolean }) {
  return (
    <svg
      data-testid="breadcrumb-separator"
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-nx-ink-3 rtl:rotate-180"
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface TopbarBreadcrumbsProps {
  isRTL: boolean;
  workspaceName: string;
  activeRootName: string | null;
  intermediateSegments?: string[];
  displayPageName: string;
}

function findFirstLeafRoute(
  item: MenuItem,
  canAccessPage: (path: string) => boolean
): string | null {
  const findAccessible = (curr: MenuItem): string | null => {
    if (curr.href && curr.href !== "#" && canAccessPage(curr.href)) return curr.href;
    if (curr.children && curr.children.length > 0) {
      const sorted = [...curr.children].sort((a, b) => a.order - b.order);
      for (const child of sorted) {
        const route = findAccessible(child);
        if (route) return route;
      }
    }
    return null;
  };

  return findAccessible(item);
}

function findMenuItemByRoute(items: readonly MenuItem[], targetRoute: string): MenuItem | null {
  const normalizedTarget = normalizeRoutePath(targetRoute).toLowerCase();
  for (const item of items) {
    if (item.href && item.href !== "#") {
      if (normalizeRoutePath(item.href).toLowerCase() === normalizedTarget) {
        return item;
      }
    }
    if (item.children && item.children.length > 0) {
      const match = findMenuItemByRoute(item.children, normalizedTarget);
      if (match) return match;
    }
  }
  return null;
}

export interface ResolveWorkspaceStartTargetParams {
  activeWorkspace: WorkspaceGroup | null;
  rootMenuItems: readonly MenuItem[];
  workspaceRouteMap?: Record<string, string[]>;
  isPlatformContext: boolean;
  canAccessPage: (path: string) => boolean;
  routesLoaded?: boolean;
  hasRouteAccess?: (path: string) => boolean;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export interface ResolvedWorkspaceStartTarget {
  route: string;
  normalizedRoute: string;
  pageLabel: string | null;
}

/**
 * Resolves the authoritative workspace start route (preferring `effectiveHomeRoute`
 * over raw context routes) and a localized target page label for Topbar Home & Level-1 tooltips.
 */
export function resolveWorkspaceStartTarget({
  activeWorkspace,
  rootMenuItems,
  workspaceRouteMap,
  isPlatformContext,
  canAccessPage,
  routesLoaded,
  hasRouteAccess,
  language,
  t,
}: ResolveWorkspaceStartTargetParams): ResolvedWorkspaceStartTarget {
  if (!activeWorkspace) {
    return {
      route: "/hub",
      normalizedRoute: "/hub",
      pageLabel: null,
    };
  }

  const isNavAccessible = (candidate: string): boolean => {
    const norm = normalizeRoutePath(candidate);
    if (!canAccessPage(norm)) return false;
    if (routesLoaded && typeof hasRouteAccess === "function") {
      return hasRouteAccess(norm);
    }
    return true;
  };

  let route: string | null = activeWorkspace.effectiveHomeRoute?.trim() || null;
  if (route && !canAccessPage(normalizeRoutePath(route))) {
    route = null;
  }

  if (!route) {
    const configured = isPlatformContext
      ? (activeWorkspace.platformHomeRoute?.trim() || activeWorkspace.homeRoute?.trim() || null)
      : (activeWorkspace.homeRoute?.trim() || null);
    if (configured && isNavAccessible(configured)) {
      route = configured;
    }
  }

  const menuPool =
    rootMenuItems.length > 0 ? rootMenuItems : (activeWorkspace.menuItems ?? []);

  if (!route) {
    for (const item of menuPool) {
      const leaf = findFirstLeafRoute(item, isNavAccessible);
      if (leaf) {
        route = leaf;
        break;
      }
    }
  }

  if (!route && workspaceRouteMap) {
    const lowerKey = activeWorkspace.workspaceKey.toLowerCase();
    const mapEntry = Object.entries(workspaceRouteMap).find(
      ([key]) => key.toLowerCase() === lowerKey
    );
    const mapRoute = mapEntry?.[1]?.find((r) => Boolean(r && r !== "/" && isNavAccessible(r)));
    if (mapRoute) {
      route = mapRoute;
    }
  }

  const resolvedRoute = route || "/hub";
  const normalizedRoute = normalizeRoutePath(resolvedRoute).toLowerCase() || "/";

  const normalizedEffective = activeWorkspace.effectiveHomeRoute?.trim()
    ? normalizeRoutePath(activeWorkspace.effectiveHomeRoute.trim()).toLowerCase()
    : null;
  let pageLabel: string | null = null;
  if (normalizedEffective && normalizedEffective === normalizedRoute) {
    if (typeof activeWorkspace.getEffectiveHomeLabel === "function") {
      pageLabel = activeWorkspace.getEffectiveHomeLabel(language);
    } else {
      const en = activeWorkspace.effectiveHomeLabelEn?.trim() || "";
      const ar = activeWorkspace.effectiveHomeLabelAr?.trim() || "";
      pageLabel = (language === "ar" ? ar || en : en || ar) || null;
    }
  }

  if (!pageLabel) {
    const matchedMenuItem = findMenuItemByRoute(menuPool, normalizedRoute);
    if (matchedMenuItem) {
      pageLabel =
        resolveBilingualLabel(
          matchedMenuItem.nameEn || matchedMenuItem.nameAr,
          matchedMenuItem.nameAr || matchedMenuItem.nameEn,
          language
        ) || null;
    }
  }

  if (!pageLabel && normalizedRoute !== "/" && normalizedRoute !== "/hub") {
    const segments = normalizedRoute
      .split("/")
      .filter((s) => s.length > 0 && !s.startsWith("["));
    const tail = segments[segments.length - 1];
    if (tail) {
      const segKey = `nav.routeSegments.${tail}`;
      const translated = t(segKey);
      if (translated && translated !== segKey) {
        pageLabel = translated;
      }
    }
  }

  return {
    route: resolvedRoute,
    normalizedRoute,
    pageLabel,
  };
}

const WS_TOOLTIP_TOKEN = "__SCRIPE_WS_BDI__";
const PAGE_TOOLTIP_TOKEN = "__SCRIPE_PAGE_BDI__";

/**
 * Renders the localized workspace start-page tooltip with `<bdi>` isolation around
 * workspace and page labels so mixed-direction EN/AR segments render cleanly in RTL/LTR.
 */
export function renderBidiWorkspaceStartTooltip(
  t: (key: string, params?: Record<string, string | number>) => string,
  workspace: string,
  page: string
): React.ReactNode {
  const template = t("chrome.workspaceStartPageTooltip", {
    workspace: WS_TOOLTIP_TOKEN,
    page: PAGE_TOOLTIP_TOKEN,
  });

  if (!template.includes(WS_TOOLTIP_TOKEN) && !template.includes(PAGE_TOOLTIP_TOKEN)) {
    return template;
  }

  const parts = template.split(new RegExp(`(${WS_TOOLTIP_TOKEN}|${PAGE_TOOLTIP_TOKEN})`, "g"));
  return (
    <span>
      {parts.map((part, idx) => {
        if (part === WS_TOOLTIP_TOKEN) {
          return <bdi key={`ws-${idx}`}>{workspace}</bdi>;
        }
        if (part === PAGE_TOOLTIP_TOKEN) {
          return <bdi key={`pg-${idx}`}>{page}</bdi>;
        }
        return part ? <React.Fragment key={`tx-${idx}`}>{part}</React.Fragment> : null;
      })}
    </span>
  );
}

export function TopbarBreadcrumbs({
  isRTL,
  workspaceName,
  activeRootName,
  intermediateSegments,
  displayPageName,
}: TopbarBreadcrumbsProps) {
  const { workspaceGroups, rootMenuItems, setActiveRootItemId, activeWorkspace, activeRootItem } =
    useWorkspace();
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const { language, t } = useI18n();
  const { canAccessPage } = usePermissions();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  const { isPlatform: isPlatformContext } = useAdminContext();
  const workspaceRouteMap = useNavigationStore((s) => s?.workspaceRouteMap);
  const routesLoaded = useNavigationStore((s) => s?.routesLoaded);
  const hasRouteAccess = useNavigationStore((s) => s?.hasRouteAccess);

  const startTarget = resolveWorkspaceStartTarget({
    activeWorkspace,
    rootMenuItems,
    workspaceRouteMap,
    isPlatformContext,
    canAccessPage,
    routesLoaded,
    hasRouteAccess,
    language,
    t,
  });

  const level1TooltipNode: React.ReactNode = activeWorkspace
    ? startTarget.pageLabel
      ? renderBidiWorkspaceStartTooltip(t, workspaceName, startTarget.pageLabel)
      : t("chrome.goToHome")
    : normalizedPath !== "/hub"
      ? t("chrome.allWorkspaces")
      : null;

  const sortedWorkspaces = React.useMemo(() => {
    return [...workspaceGroups].sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder);
  }, [workspaceGroups]);

  const activeGroupSiblings = React.useMemo(() => {
    return rootMenuItems.filter((item) => item.slug !== "modules-group");
  }, [rootMenuItems]);

  const normWs = (workspaceName || "").trim().toLowerCase();
  const normRoot = (activeRootName || "").trim().toLowerCase();
  const showActiveRoot = Boolean(
    activeRootName && activeRootItem && normRoot && normRoot !== normWs
  );
  const normDisplay = (displayPageName || "").trim().toLowerCase();

  // Deduplicate intermediate ancestors against workspace, root, neighbors, and leaf
  const filteredIntermediates: string[] = [];
  if (intermediateSegments && intermediateSegments.length > 0) {
    const seen = new Set<string>([normWs]);
    if (showActiveRoot && normRoot) seen.add(normRoot);
    for (const seg of intermediateSegments) {
      const normSeg = seg.trim().toLowerCase();
      if (!normSeg || seen.has(normSeg) || normSeg === normDisplay) continue;
      seen.add(normSeg);
      filteredIntermediates.push(seg);
    }
  }

  const lastPriorSegment =
    filteredIntermediates.length > 0
      ? filteredIntermediates[filteredIntermediates.length - 1]
      : showActiveRoot
        ? activeRootName
        : workspaceName;
  const normLast = (lastPriorSegment || "").trim().toLowerCase();
  const showDisplayPage = Boolean(displayPageName && normDisplay && normDisplay !== normLast);

  const isWorkspaceCurrent =
    !showActiveRoot && filteredIntermediates.length === 0 && !showDisplayPage;
  const isActiveRootCurrent = filteredIntermediates.length === 0 && !showDisplayPage;

  return (
    <nav aria-label={t("nav.breadcrumb")} className="min-w-0 flex-1 overflow-hidden">
      <ol className="flex min-w-0 items-center gap-1 text-[13px] sm:gap-1.5">
        {/* ── Level 1: Workspace ── */}
        <li className="flex min-w-0 shrink-0 items-center gap-0.5">
          {(() => {
            const level1Button = (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-current={isWorkspaceCurrent ? "page" : undefined}
                onClick={() => {
                  if (normalizedPath === startTarget.normalizedRoute) return;
                  startRoutingProgress();
                  router.push(startTarget.route);
                }}
                className={cn(
                  "h-auto min-w-0 cursor-pointer whitespace-nowrap rounded-nx-sm px-1.5 py-0.5 duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                  isWorkspaceCurrent ? "font-semibold text-nx-ink" : "font-medium text-nx-ink-3",
                  CONTROL_MOTION,
                  FOCUS_RING
                )}
              >
                <span className="truncate">{workspaceName}</span>
              </Button>
            );

            if (!level1TooltipNode) {
              return level1Button;
            }

            return (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>{level1Button}</TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    {level1TooltipNode}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("navigation.topbar.workspacesMenu")}
                className={cn(
                  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-nx-sm p-0 text-nx-ink-3 duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                  CONTROL_MOTION,
                  FOCUS_RING
                )}
              >
                <ChevronDown size={12} aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 border-nx-line bg-nx-surface">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                {t("navigation.topbar.workspacesMenu")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortedWorkspaces.map((ws) => {
                const isActive = activeWorkspace?.workspaceKey === ws.workspaceKey;
                const wsLabel =
                  resolveBilingualLabel(ws.workspaceNameEn, ws.workspaceNameAr, language) ||
                  resolveBilingualLabel(ws.workspaceNameAr, ws.workspaceNameEn, language);
                const wsAccent = ws.accentColor || "var(--nx-accent, hsl(var(--primary)))";

                return (
                  <DropdownMenuItem
                    key={ws.workspaceKey}
                    onClick={() => {
                      if (!isActive && !ws.isLocked) {
                        switchWorkspace(ws.workspaceKey);
                      }
                    }}
                    disabled={ws.isLocked}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-nx-sm px-3 py-2 text-sm transition-colors duration-nx-micro motion-reduce:transition-none",
                      isActive && "bg-nx-accent-wash font-semibold text-nx-accent"
                    )}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "var(--nx-radius-sm)",
                        background: `color-mix(in oklch, ${wsAccent} 13%, transparent)`,
                        border: `1px solid color-mix(in oklch, ${wsAccent} 30%, transparent)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: wsAccent,
                      }}
                    >
                      {ws.abbreviation ?? ws.workspaceKey.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">{wsLabel}</span>
                    {ws.isLocked && (
                      <>
                        <Lock className="h-2.5 w-2.5 text-nx-warning-strong" aria-hidden="true" />
                        <span className="sr-only">{t("navigation.topbar.workspaceLocked")}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>

        {/* ── Level 2: Root Active Group (Deduplicated against workspace name) ── */}
        {showActiveRoot && activeRootItem && (
          <>
            <li role="presentation" aria-hidden="true" className="inline-flex shrink-0 items-center">
              <BreadcrumbSep isRTL={isRTL} />
            </li>
            <li className="flex min-w-0 shrink items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-current={isActiveRootCurrent ? "page" : undefined}
                onClick={() => {
                  const route = findFirstLeafRoute(activeRootItem, canAccessPage);
                  if (route) {
                    startRoutingProgress();
                    router.push(route);
                  }
                }}
                className={cn(
                  "h-auto min-w-0 max-w-full cursor-pointer whitespace-nowrap rounded-nx-sm px-1.5 py-0.5 duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                  isActiveRootCurrent ? "font-semibold text-nx-ink" : "font-medium text-nx-ink-2",
                  CONTROL_MOTION,
                  FOCUS_RING
                )}
              >
                <span className="truncate">{activeRootName}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("navigation.topbar.sectionsMenu")}
                    className={cn(
                      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-nx-sm p-0 text-nx-ink-2 duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                      CONTROL_MOTION,
                      FOCUS_RING
                    )}
                  >
                    <ChevronDown size={12} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 border-nx-line bg-nx-surface">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                    {t("navigation.topbar.sectionsMenu")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {activeGroupSiblings.map((item) => {
                    const isActive = activeRootItem?.id === item.id;
                    const label =
                      resolveBilingualLabel(item.nameEn, item.nameAr, language) ||
                      resolveBilingualLabel(item.nameAr, item.nameEn, language);

                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          if (!isActive) {
                            setActiveRootItemId(item.id);
                          }
                          const route = findFirstLeafRoute(item, canAccessPage);
                          if (route) {
                            startRoutingProgress();
                            router.push(route);
                          }
                        }}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-nx-sm px-3 py-1.5 text-sm transition-colors duration-nx-micro motion-reduce:transition-none",
                          isActive && "bg-nx-accent-wash font-semibold text-nx-accent"
                        )}
                      >
                        <span className="flex-1 truncate">{label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </>
        )}

        {/* ── Intermediate Ancestor Groups (if deeply nested) ── */}
        {filteredIntermediates.map((seg, idx) => {
          const isLastIntermediate = idx === filteredIntermediates.length - 1 && !showDisplayPage;
          return (
            <React.Fragment key={`${seg}-${idx}`}>
              <li role="presentation" aria-hidden="true" className="inline-flex shrink-0 items-center">
                <BreadcrumbSep isRTL={isRTL} />
              </li>
              <li className={cn("min-w-0 shrink", isLastIntermediate && "max-w-[120px] sm:shrink-0 sm:max-w-[240px]")}>
                <span
                  aria-current={isLastIntermediate ? "page" : undefined}
                  className={cn(
                    "block truncate px-1.5 py-0.5",
                    isLastIntermediate ? "font-semibold text-nx-ink" : "font-medium text-nx-ink-2"
                  )}
                >
                  {seg}
                </span>
              </li>
            </React.Fragment>
          );
        })}

        {/* ── Leaf Level: Active Page / Entity Name (Deduplicated against previous segment) ── */}
        {showDisplayPage && (
          <>
            <li role="presentation" aria-hidden="true" className="inline-flex shrink-0 items-center">
              <BreadcrumbSep isRTL={isRTL} />
            </li>
            <li className="min-w-0 shrink max-w-[120px] sm:shrink-0 sm:max-w-[240px]">
              <span
                aria-current="page"
                className="block truncate px-1.5 py-0.5 font-semibold tracking-[-0.2px] text-nx-ink duration-nx-standard animate-in fade-in motion-reduce:animate-none"
              >
                {displayPageName}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

// ── Panel Toggle Button ───────────────────────────────────────────────────────
export interface TopbarPanelToggleProps {
  isRTL: boolean;
  isPanelCollapsed?: boolean;
  /** collapsibleSidebar setting — false hides the desktop toggle (the panel is
   *  pinned open) while the same button keeps working as the mobile hamburger. */
  collapsible?: boolean;
  hasSubmenu?: boolean;
  isMobileMenuOpen?: boolean;
  toggleRef?: React.Ref<HTMLButtonElement>;
  onToggle: () => void;
  ariaLabel: string;
}

export function TopbarPanelToggle({
  isRTL,
  isPanelCollapsed,
  collapsible = true,
  hasSubmenu = true,
  isMobileMenuOpen = false,
  toggleRef,
  onToggle,
  ariaLabel,
}: TopbarPanelToggleProps) {
  const subscribeMobileViewport = React.useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return () => {};
    }
    const mq = window.matchMedia("(max-width: 1023px)");
    mq.addEventListener("change", onStoreChange);
    return () => mq.removeEventListener("change", onStoreChange);
  }, []);

  const isMobileViewport = React.useSyncExternalStore(
    subscribeMobileViewport,
    () =>
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(max-width: 1023px)").matches
        : false,
    () => false
  );

  const isExpanded = isMobileViewport ? Boolean(isMobileMenuOpen) : !isPanelCollapsed;

  const renderPanelIcon = () => {
    if (isRTL) {
      return isPanelCollapsed ? (
        <PanelMenuIconRTL className="h-[18px] w-[18px]" />
      ) : (
        <PanelCollapseIconRTL className="h-[18px] w-[18px]" />
      );
    }
    return isPanelCollapsed ? (
      <PanelMenuIcon className="h-[18px] w-[18px]" />
    ) : (
      <PanelCollapseIcon className="h-[18px] w-[18px]" />
    );
  };

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={toggleRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label={ariaLabel}
            aria-expanded={isExpanded}
            className={cn(
              "h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-nx-control p-0",
              "border border-nx-line bg-transparent text-nx-ink-2",
              CONTROL_MOTION,
              "duration-nx-micro hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink",
              !hasSubmenu ? "flex md:hidden" : collapsible ? "flex" : "flex lg:hidden",
              FOCUS_RING
            )}
          >
            {renderPanelIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {ariaLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Context Pill (re-exported from shared) ────────────────────────────────────
export { TopbarContextPill, type TopbarContextPillProps };

// ── Search Button ─────────────────────────────────────────────────────────────
export interface TopbarSearchButtonProps {
  onOpenSearch?: () => void;
  placeholder: string;
}

export function TopbarSearchButton({ onOpenSearch, placeholder }: TopbarSearchButtonProps) {
  return (
    <>
      {/* Mobile compact icon trigger (<768px) */}
      <Button
        onClick={onOpenSearch}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={placeholder}
        className={cn(
          "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-nx-control border border-nx-line bg-nx-surface p-0 text-nx-ink-2 md:hidden",
          CONTROL_MOTION,
          "duration-nx-micro hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink",
          FOCUS_RING
        )}
      >
        <Search size={15} aria-hidden="true" />
      </Button>

      {/* Desktop search trigger (>=768px) */}
      <Button
        onClick={onOpenSearch}
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          // Border and surface live in classes, not inline: an inline `border`
          // shorthand silently beat the hover rule, so the field never lit up.
          "group hidden h-9 items-center rounded-nx-control border border-nx-line bg-nx-surface duration-nx-micro hover:bg-nx-surface md:flex",
          CONTROL_MOTION,
          "text-nx-ink-3 hover:border-nx-line-hi",
          FOCUS_RING
        )}
        style={{
          gap: 8,
          padding: "0 12px",
          fontSize: "12px",
          fontWeight: 500,
          minWidth: 160,
          cursor: "pointer",
        }}
      >
        <Search
          size={13}
          aria-hidden="true"
          className="transition-colors duration-nx-micro group-hover:text-nx-ink motion-reduce:transition-none"
          style={{ flexShrink: 0 }}
        />
        <span
          style={{ flex: 1, userSelect: "none" }}
          className="text-start transition-colors duration-nx-micro group-hover:text-nx-ink motion-reduce:transition-none"
        >
          {placeholder}
        </span>
        <span
          className="rounded-nx-sm border border-nx-line bg-nx-raised text-nx-ink-2"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 6px",
            letterSpacing: "0.3px",
          }}
        >
          ⌘K
        </span>
      </Button>
    </>
  );
}

// ── Home Button ───────────────────────────────────────────────────────────────
export interface TopbarHomeButtonProps {
  ariaLabel: string;
  tooltip?: React.ReactNode;
  onClick: () => void;
}

export function TopbarHomeButton({ ariaLabel, tooltip, onClick }: TopbarHomeButtonProps) {
  const tooltipText = tooltip ?? ariaLabel;
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            aria-label={ariaLabel}
            className={cn(
              "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-nx-control p-0",
              "border border-nx-line bg-transparent text-nx-ink-2",
              CONTROL_MOTION,
              "duration-nx-micro hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink",
              FOCUS_RING
            )}
          >
            <Home size={15} strokeWidth={2} aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
