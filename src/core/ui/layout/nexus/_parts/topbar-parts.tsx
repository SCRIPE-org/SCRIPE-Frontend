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

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
export function BreadcrumbSep({ isRTL, isDark }: { isRTL: boolean; isDark: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        flexShrink: 0,
        transform: isRTL ? "scaleX(-1)" : undefined,
        color: isDark ? "#334155" : "#CBD5E1",
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
  isDark: boolean;
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
  isDark,
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
          className="cursor-pointer rounded-md px-1.5 py-0.5 font-medium transition-all hover:bg-muted/80 hover:text-foreground focus:outline-none"
          style={{
            color: isDark ? "#A0AEC0" : "#718096",
            whiteSpace: "nowrap",
          }}
        >
          {workspaceName}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md transition-all hover:bg-muted/80 hover:text-foreground focus:outline-none"
              style={{
                color: isDark ? "#A0AEC0" : "#718096",
              }}
            >
              <ChevronDown size={12} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 border-border/40 bg-popover/95 backdrop-blur-md"
          >
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {language === "ar" ? "مساحات العمل" : "Workspaces"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortedWorkspaces.map((ws) => {
              const isActive = activeWorkspace?.workspaceKey === ws.workspaceKey;
              const wsLabel =
                language === "ar"
                  ? ws.workspaceNameAr || ws.workspaceNameEn
                  : ws.workspaceNameEn || ws.workspaceNameAr;
              const wsAccent = ws.accentColor || (isDark ? "#9B8FE0" : "#6258c4");

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
                    "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive && "bg-accent/40 font-semibold text-accent-foreground"
                  )}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: `${wsAccent}22`,
                      border: `1px solid ${wsAccent}40`,
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
                  {ws.isLocked && <span className="text-[10px] text-yellow-600">🔒</span>}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Level 2: Root Active Group ── */}
      {activeRootName && activeRootItem && (
        <>
          <BreadcrumbSep isRTL={isRTL} isDark={isDark} />
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
              className="cursor-pointer rounded-md px-1.5 py-0.5 font-medium transition-all hover:bg-muted/80 hover:text-foreground focus:outline-none"
              style={{
                color: isDark ? "#CBD5E1" : "#475569",
                whiteSpace: "nowrap",
              }}
            >
              {activeRootName}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md transition-all hover:bg-muted/80 hover:text-foreground focus:outline-none"
                  style={{
                    color: isDark ? "#CBD5E1" : "#475569",
                  }}
                >
                  <ChevronDown size={12} className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 border-border/40 bg-popover/95 backdrop-blur-md"
              >
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                        "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive && "bg-accent/40 font-semibold text-accent-foreground"
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
          <BreadcrumbSep isRTL={isRTL} isDark={isDark} />
          <span
            className="px-1.5 py-0.5 font-semibold duration-200 animate-in fade-in slide-in-from-bottom-1"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
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
  isDark: boolean;
  isPanelCollapsed?: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

export function TopbarPanelToggle({
  isRTL,
  isDark,
  isPanelCollapsed,
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
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              cursor: "pointer",
              color: isDark ? "#AFA9EC" : "#6258c4",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(98,88,196,0.04)",
              flexShrink: 0,
              transition: "all 200ms ease",
            }}
            className="hover:scale-105 hover:bg-accent/60 hover:text-accent-foreground active:scale-95"
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
  isDark: boolean;
  isModuleMode: boolean;
  resolvedAccent: string;
  tenantName: string;
}

export function TopbarContextPill({
  isDark,
  isModuleMode,
  resolvedAccent,
  tenantName,
}: TopbarContextPillProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        background: isModuleMode
          ? `${resolvedAccent}15`
          : isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.03)",
        border: `1px solid ${
          isModuleMode
            ? `${resolvedAccent}40`
            : isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)"
        }`,
        fontSize: 11,
        fontWeight: 600,
        color: isModuleMode ? resolvedAccent : isDark ? "#E2E8F0" : "#334155",
        cursor: "default",
        flexShrink: 0,
        transition: "all 300ms ease",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap",
      }}
      className="hidden sm:flex"
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: resolvedAccent,
          flexShrink: 0,
          boxShadow: `0 0 8px ${resolvedAccent}`,
        }}
      />
      <span>{tenantName}</span>
    </div>
  );
}

// ── Search Button ─────────────────────────────────────────────────────────────
export interface TopbarSearchButtonProps {
  isRTL: boolean;
  isDark: boolean;
  onOpenSearch?: () => void;
  placeholder: string;
}

export function TopbarSearchButton({
  isRTL,
  isDark,
  onOpenSearch,
  placeholder,
}: TopbarSearchButtonProps) {
  return (
    <button
      onClick={onOpenSearch}
      className="group hidden transition-all duration-200 hover:scale-[1.02] active:scale-95 md:flex"
      style={{
        alignItems: "center",
        gap: 8,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
        boxShadow: isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.04)"
          : "inset 0 1px 0 rgba(255,255,255,0.5)",
        borderRadius: 9,
        padding: "0 12px",
        height: 33,
        color: isDark ? "#94A3B8" : "#64748B",
        fontSize: "12px",
        fontWeight: 500,
        minWidth: 160,
        cursor: "pointer",
      }}
    >
      <Search
        size={13}
        className="transition-colors group-hover:text-foreground"
        style={{ flexShrink: 0 }}
      />
      <span
        style={{ flex: 1, userSelect: "none", textAlign: "start" }}
        className="transition-colors group-hover:text-foreground"
      >
        {placeholder}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
          borderRadius: 4,
          padding: "2px 6px",
          color: isDark ? "#CBD5E1" : "#475569",
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
  isDark: boolean;
  ariaLabel: string;
  onClick: () => void;
}

export function TopbarHomeButton({ isDark, ariaLabel, onClick }: TopbarHomeButtonProps) {
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            style={{
              width: 33,
              height: 33,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              cursor: "pointer",
              color: isDark ? "#94A3B8" : "#64748B",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
              background: "transparent",
              flexShrink: 0,
              transition: "all 200ms ease",
            }}
            className="hover:scale-105 hover:bg-secondary hover:text-foreground active:scale-95"
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
export function TopbarMobileControls() {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      <NotificationBell
        iconClassName="h-[16px] w-[16px]"
        className="h-[33px] w-[33px] rounded-[9px] text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
      />
      <UserProfileDropdown variant="compact" showName={false} />
    </div>
  );
}
