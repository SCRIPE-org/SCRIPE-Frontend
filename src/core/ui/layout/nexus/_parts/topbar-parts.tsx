"use client";

import React from "react";
import { Search, Home, ChevronDown } from "lucide-react";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { useAppStore } from "@core/store/useAppStore";
import {
  PanelMenuIcon,
  PanelMenuIconRTL,
  PanelCollapseIcon,
  PanelCollapseIconRTL,
} from "@core/ui/layout/navigation/nav-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useWorkspaceTransitionContext } from "../nexus-layout";
import { cn } from "@core/common/utils";
import type { MenuItem } from "@core/navigation";
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
// Shared focus treatment — keyboard focus gets the accent ring, mouse focus stays quiet.
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nx-accent";

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
export function BreadcrumbSep({ isRTL }: { isRTL: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        flexShrink: 0,
        transform: isRTL ? "scaleX(-1)" : undefined,
        // Decorative separator — dimmer than ink-3 on purpose
        color: "color-mix(in oklch, var(--nx-ink-3, hsl(var(--muted-foreground))) 55%, transparent)",
      }}
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
  activeRootName?: string | null;
  displayPageName: string;
}

function findFirstLeafRoute(
  item: MenuItem,
  canAccessPage: (path: string) => boolean
): string | null {
  // First try to find a route the user has permission to access
  const findAccessible = (curr: MenuItem): string | null => {
    if (curr.href && canAccessPage(curr.href)) return curr.href;
    if (curr.children && curr.children.length > 0) {
      const sorted = [...curr.children].sort((a, b) => a.order - b.order);
      for (const child of sorted) {
        const route = findAccessible(child);
        if (route) return route;
      }
    }
    return null;
  };

  const accessibleRoute = findAccessible(item);
  if (accessibleRoute) return accessibleRoute;

  // Fallback to absolute first leaf route if none are accessible
  const findAny = (curr: MenuItem): string | null => {
    if (curr.href) return curr.href;
    if (curr.children && curr.children.length > 0) {
      const sorted = [...curr.children].sort((a, b) => a.order - b.order);
      for (const child of sorted) {
        const route = findAny(child);
        if (route) return route;
      }
    }
    return null;
  };

  return findAny(item);
}

export function TopbarBreadcrumbs({
  isRTL,
  workspaceName,
  activeRootName,
  displayPageName,
}: TopbarBreadcrumbsProps) {
  const { workspaceGroups, rootMenuItems, setActiveRootItemId, activeWorkspace, activeRootItem } =
    useWorkspace();
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const { language } = useI18n();
  const { canAccessPage } = usePermissions();
  const router = useRouter();
  const tenantCode = useAppStore((s) => s.tenantCode);

  const sortedWorkspaces = React.useMemo(() => {
    return [...workspaceGroups].sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder);
  }, [workspaceGroups]);

  const activeGroupSiblings = React.useMemo(() => {
    return rootMenuItems.filter((item) => item.slug !== "modules-group");
  }, [rootMenuItems]);

  return (
    <div
      style={{
        fontSize: 13,
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* ── Level 1: Workspace ── */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => {
            const isPlatformContext = tenantCode === null;
            const homeRoute = activeWorkspace
              ? isPlatformContext
                ? (activeWorkspace.platformHomeRoute ?? activeWorkspace.homeRoute ?? "/")
                : (activeWorkspace.homeRoute ?? "/")
              : "/";
            startRoutingProgress();
            router.push(homeRoute);
          }}
          className={cn(
            "cursor-pointer whitespace-nowrap rounded-md px-1.5 py-0.5 font-medium text-nx-ink-3 transition-all duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
            FOCUS_RING
          )}
        >
          {workspaceName}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-nx-ink-3 transition-all duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                FOCUS_RING
              )}
            >
              <ChevronDown size={12} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 border-nx-line bg-nx-surface backdrop-blur-md"
          >
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
              {language === "ar" ? "مساحات العمل" : "Workspaces"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortedWorkspaces.map((ws) => {
              const isActive = activeWorkspace?.workspaceKey === ws.workspaceKey;
              const wsLabel =
                language === "ar"
                  ? ws.workspaceNameAr || ws.workspaceNameEn
                  : ws.workspaceNameEn || ws.workspaceNameAr;
              // Each row carries its OWN workspace colour — the active-workspace
              // token would paint every chip the same. Alpha via color-mix only.
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
                    "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-nx-micro",
                    isActive && "bg-nx-accent-wash font-semibold text-nx-accent"
                  )}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
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
                  {ws.isLocked && <span className="text-[10px] text-warning">🔒</span>}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Level 2: Root Active Group ── */}
      {activeRootName && activeRootItem && (
        <>
          <BreadcrumbSep isRTL={isRTL} />
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                const route = findFirstLeafRoute(activeRootItem, canAccessPage);
                if (route) {
                  startRoutingProgress();
                  router.push(route);
                }
              }}
              className={cn(
                "cursor-pointer whitespace-nowrap rounded-md px-1.5 py-0.5 font-medium text-nx-ink-2 transition-all duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                FOCUS_RING
              )}
            >
              {activeRootName}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-nx-ink-2 transition-all duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                    FOCUS_RING
                  )}
                >
                  <ChevronDown size={12} className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 border-nx-line bg-nx-surface backdrop-blur-md"
              >
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                  {language === "ar" ? "الأقسام" : "Sections"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activeGroupSiblings.map((item) => {
                  const isActive = activeRootItem?.id === item.id;
                  const label =
                    language === "ar" ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;

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
                        "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-nx-micro",
                        isActive && "bg-nx-accent-wash font-semibold text-nx-accent"
                      )}
                    >
                      <span className="flex-1 truncate">{label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      {/* ── Level 3: Active Page / Entity Name ── */}
      {displayPageName && (
        <>
          <BreadcrumbSep isRTL={isRTL} />
          <span
            className="px-1.5 py-0.5 font-semibold text-nx-ink animate-in fade-in duration-nx-standard"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "-0.2px",
            }}
          >
            {displayPageName}
          </span>
        </>
      )}
    </div>
  );
}

// ── Panel Toggle Button ───────────────────────────────────────────────────────
export interface TopbarPanelToggleProps {
  isRTL: boolean;
  isPanelCollapsed?: boolean;
  /** collapsibleSidebar setting — false hides the desktop toggle (the panel is
   *  pinned open) while the same button keeps working as the mobile hamburger. */
  collapsible?: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

export function TopbarPanelToggle({
  isRTL,
  isPanelCollapsed,
  collapsible = true,
  onToggle,
  ariaLabel,
}: TopbarPanelToggleProps) {
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
          <button
            type="button"
            onClick={onToggle}
            aria-label={ariaLabel}
            className={cn(
              "flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[9px]",
              "border border-nx-line bg-transparent text-nx-accent",
              "transition-all duration-nx-micro ease-nx-enter",
              "hover:scale-105 hover:bg-nx-raised active:scale-95 motion-reduce:transform-none",
              // Non-collapsible panel: desktop toggle would be a dead button, so
              // it hides at lg while the mobile hamburger (<1024px) stays live.
              !collapsible && "lg:hidden",
              FOCUS_RING
            )}
          >
            {renderPanelIcon()}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {ariaLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Context Pill ──────────────────────────────────────────────────────────────
export interface TopbarContextPillProps {
  isModuleMode: boolean;
  tenantName: string;
}

export function TopbarContextPill({ isModuleMode, tenantName }: TopbarContextPillProps) {
  return (
    <div
      className="hidden items-center sm:flex"
      style={{
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        background: isModuleMode ? "var(--nx-accent-wash, hsl(var(--primary) / 0.1))" : "transparent",
        border: `1px solid ${
          isModuleMode
            ? "color-mix(in oklch, var(--nx-accent, hsl(var(--primary))) 30%, transparent)"
            : "var(--nx-line, hsl(var(--border)))"
        }`,
        fontSize: 11,
        fontWeight: 600,
        color: isModuleMode
          ? "var(--nx-accent, hsl(var(--primary)))"
          : "var(--nx-ink-2, hsl(var(--muted-foreground)))",
        cursor: "default",
        flexShrink: 0,
        transition:
          "background var(--nx-t-standard, 200ms) ease, border-color var(--nx-t-standard, 200ms) ease, color var(--nx-t-standard, 200ms) ease",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap",
      }}
    >
      {/* Live-context dot — the logo's cyan ("now"), no glow: the primary
          rail's active root item owns the one glow on this screen */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--nx-secondary, hsl(var(--info)))",
          flexShrink: 0,
        }}
      />
      <span>{tenantName}</span>
    </div>
  );
}

// ── Search Button ─────────────────────────────────────────────────────────────
export interface TopbarSearchButtonProps {
  onOpenSearch?: () => void;
  placeholder: string;
}

export function TopbarSearchButton({ onOpenSearch, placeholder }: TopbarSearchButtonProps) {
  return (
    <button
      onClick={onOpenSearch}
      className={cn(
        "group hidden items-center transition-all duration-nx-micro ease-nx-enter md:flex",
        "hover:scale-[1.02] active:scale-95 motion-reduce:transform-none",
        "text-nx-ink-3",
        FOCUS_RING
      )}
      style={{
        gap: 8,
        background: "color-mix(in oklch, var(--nx-surface, hsl(var(--card))) 70%, transparent)",
        border: "1px solid var(--nx-line, hsl(var(--border)))",
        borderRadius: 9,
        padding: "0 12px",
        height: 33,
        fontSize: "12px",
        fontWeight: 500,
        minWidth: 160,
        cursor: "pointer",
      }}
    >
      <Search
        size={13}
        className="transition-colors duration-nx-micro group-hover:text-nx-ink"
        style={{ flexShrink: 0 }}
      />
      <span
        style={{ flex: 1, userSelect: "none", textAlign: "start" }}
        className="transition-colors duration-nx-micro group-hover:text-nx-ink"
      >
        {placeholder}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          background: "var(--nx-raised, hsl(var(--muted)))",
          border: "1px solid var(--nx-line, hsl(var(--border)))",
          borderRadius: 4,
          padding: "2px 6px",
          color: "var(--nx-ink-2, hsl(var(--muted-foreground)))",
          letterSpacing: "0.3px",
        }}
      >
        ⌘K
      </span>
    </button>
  );
}

// ── Home Button ───────────────────────────────────────────────────────────────
export interface TopbarHomeButtonProps {
  ariaLabel: string;
  onClick: () => void;
}

export function TopbarHomeButton({ ariaLabel, onClick }: TopbarHomeButtonProps) {
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className={cn(
              "flex h-[33px] w-[33px] shrink-0 cursor-pointer items-center justify-center rounded-[9px]",
              "border border-nx-line bg-transparent text-nx-ink-2",
              "transition-all duration-nx-micro ease-nx-enter",
              "hover:scale-105 hover:bg-nx-raised hover:text-nx-ink active:scale-95 motion-reduce:transform-none",
              FOCUS_RING
            )}
          >
            <Home size={15} strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {ariaLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Mobile Controls ───────────────────────────────────────────────────────────
export interface TopbarMobileControlsProps {
  /** showNotifications setting — gates the bell, the profile stays put. */
  showNotifications?: boolean;
}

export function TopbarMobileControls({ showNotifications = true }: TopbarMobileControlsProps) {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      {showNotifications && (
        <NotificationBell
          iconClassName="h-[16px] w-[16px]"
          className="h-[33px] w-[33px] rounded-[9px] text-nx-ink-3 transition-all duration-nx-micro hover:bg-nx-raised hover:text-nx-ink"
        />
      )}
      <UserProfileDropdown variant="compact" showName={false} />
    </div>
  );
}
