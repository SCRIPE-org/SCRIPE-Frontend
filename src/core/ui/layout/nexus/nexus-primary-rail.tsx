"use client";

/**
 * NexusPrimaryRail
 *
 * Architecture (per wireframes):
 *
 *  ┌──────────┬
 *  │   LOGO   │  ← Click = navigate home
 *  ├──────────┤
 *  │ Admin    │  ← Current workspace root menu items (icon buttons)
 *  │ items... │
 *  ├──────────┤
 *  │ ════════ │  ← Divider (only if pinned workspaces exist)
 *  ├──────────┤
 *  │  [CRM]   │  ← PINNED workspaces (scrollable)
 *  │  [HRMS]  │     Pin/unpin from the App Launcher.
 *  │  [...]   │     Sorted by pinSortOrder (backend-authoritative).
 *  ├──────────┤
 *  │ ════════ │
 *  ├──────────┤
 *  │  [⊞]    │  ← App Launcher — opens grid overlay
 *  │  [🔔]   │  ← Notifications
 *  │  [👤]   │  ← User Profile
 *  └──────────┘
 *
 * Clicking an Admin root item → secondary rail shows its children.
 * Clicking a pinned workspace icon → full workspace transition.
 *
 * Colour: everything reads --nx-* tokens (globals.css) — light/dark resolves
 * in CSS, so this file carries no isDark branches. The one --nx-glow on this
 * screen belongs to the ActiveIndicator edge light.
 */

import React, { useCallback, useMemo } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import type { MenuItem } from "@core/navigation";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";
import { LayoutGrid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { DynamicIcon, NX_FOCUS_RING } from "./_parts/primary-rail-parts";
import { useTenantBranding } from "@core/providers/tenant-branding-provider";
import { useRouter } from "next/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useWorkspaceTransitionContext } from "./nexus-layout";
import { toast } from "@core/hooks/use-enhanced-toast";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { usePermissions } from "@core/providers/permission-provider";
import {
  BackButton,
  Divider,
  RootItemButton,
  PrimaryRailLogo,
  ActiveIndicator,
} from "./_parts/primary-rail-parts";

interface NexusPrimaryRailProps {
  onTogglePanel?: () => void;
  isPanelCollapsed?: boolean;
  onOpenAppLauncher?: () => void;
}

// ── Helper to find the first leaf route with a valid href and permission ──────
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

// ── Primary Rail ──────────────────────────────────────────────────────────────
export function NexusPrimaryRail({
  onTogglePanel,
  isPanelCollapsed = false,
  onOpenAppLauncher,
}: NexusPrimaryRailProps) {
  const router = useRouter();
  const { canAccessPage } = usePermissions();
  const { logoUrl: tenantLogoUrl } = useTenantBranding();
  const {
    activeWorkspace,
    rootMenuItems,
    activeRootItem,
    setActiveRootItemId,
    isModuleMode,
    workspaceGroups,
  } = useWorkspace();
  const { language, direction } = useI18n();
  const { showNotifications } = useSettings();
  const { switchWorkspace, goBackWorkspace } = useWorkspaceTransitionContext();

  const isRTL = direction === "rtl";

  // ── Handle admin root item click ─────────────────────────────────────────
  const handleRootItemClick = useCallback(
    (item: MenuItem) => {
      setActiveRootItemId(item.id);
      // Auto-open panel if it was collapsed when clicking an item
      if (isPanelCollapsed && onTogglePanel) {
        onTogglePanel();
      }
      // Auto nav to first page of that menu item
      const firstRoute = findFirstLeafRoute(item, canAccessPage);
      if (firstRoute) {
        startRoutingProgress();
        router.push(firstRoute);
      }
    },
    [setActiveRootItemId, isPanelCollapsed, onTogglePanel, router, canAccessPage]
  );

  // ── Handle module workspace click → full workspace transition ────────────
  // Bug 6 fix: locked workspaces show a toast instead of silently trying to
  // switch. Bug 1 fix: clicking the active workspace is a no-op (the store
  // already guards against self-switch, but we skip the network round-trip).
  const handleModuleClick = useCallback(
    (wsKey: string, isLocked: boolean) => {
      if (isLocked) {
        // Show contextual toast — the workspace is locked
        const ws = workspaceGroups.find((g) => g.workspaceKey === wsKey);
        const name =
          language === "ar"
            ? ws?.workspaceNameAr || ws?.workspaceNameEn || wsKey
            : ws?.workspaceNameEn || wsKey;
        toast({
          title: language === "ar" ? `${name} مقفول` : `${name} is locked`,
          description:
            language === "ar"
              ? "افتح تطبيق المشغّل لمعرفة كيفية إلغاء القفل."
              : "Open the App Launcher to learn how to unlock this workspace.",
          variant: "default",
          duration: 3000,
        });
        return;
      }
      // Self-switch guard: do nothing if already on this workspace
      if (activeWorkspace?.workspaceKey === wsKey) return;
      switchWorkspace(wsKey);
    },
    [switchWorkspace, workspaceGroups, activeWorkspace, language]
  );

  // Filter out "modules-group" from root items (it's legacy; workspaces are in the rail now)
  const adminRootItems = useMemo(
    () => rootMenuItems.filter((item) => item.slug !== "modules-group"),
    [rootMenuItems]
  );

  // Pinned workspaces — sorted by pinSortOrder, then alphabetically as tiebreaker.
  // Rules:
  //   1. The ACTIVE workspace is always excluded (you're already there — no point showing it).
  //   2. The FIRST workspace in sort order is ALWAYS included, even without a DB pin row.
  //      This ensures the admin always has a quick-jump to their primary workspace.
  //      "First-accessible is always pinned" replaces the old "Admin is always pinned" UX.
  const pinnedWorkspaces = useMemo(() => {
    const activeKey = activeWorkspace?.workspaceKey;

    // Sort all workspaces by sortOrder to reliably find the first one
    const sorted = [...workspaceGroups].sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder);
    const primaryWorkspace = sorted[0];

    const pinned = sorted.filter(
      (ws) =>
        ws.workspaceKey !== activeKey && // never show active
        !ws.isLocked && // never pin locked workspaces
        (ws.isPinned || ws.workspaceKey === primaryWorkspace?.workspaceKey) // pinned OR first-accessible
    );

    // Sort: pinSortOrder asc, then alphabetical. Primary (sort 0) always floats first.
    return pinned.sort((a, b) => {
      // Primary workspace always goes first in the pinned section
      if (a.workspaceKey === primaryWorkspace?.workspaceKey) return -1;
      if (b.workspaceKey === primaryWorkspace?.workspaceKey) return 1;
      const aOrder = a.pinSortOrder ?? Infinity;
      const bOrder = b.pinSortOrder ?? Infinity;
      return aOrder !== bOrder
        ? aOrder - bOrder
        : a.workspaceNameEn.localeCompare(b.workspaceNameEn);
    });
  }, [workspaceGroups, activeWorkspace?.workspaceKey]);

  // Primary admin workspace: the admin-type workspace with the lowest sort order.
  // The back button shows ONLY when the admin actually has an admin workspace in their
  // accessible list. CRM-only operators never see a back button.
  const primaryAdminKey = useMemo(
    () =>
      workspaceGroups
        .filter((ws) => ws.isAdminWorkspace && !ws.isLocked)
        .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder)[0]?.workspaceKey ?? null,
    [workspaceGroups]
  );
  const isOnPrimaryAdmin = activeWorkspace?.workspaceKey === primaryAdminKey;
  // Only show back button when:
  //   1. Admin has an admin workspace in their access list
  //   2. A workspace IS selected (not on the Hub page where activeWorkspace is null)
  //   3. Not already on the primary admin workspace
  const showBackButton = primaryAdminKey !== null && activeWorkspace !== null && !isOnPrimaryAdmin;

  const hasPinnedWorkspaces = pinnedWorkspaces.length > 0;

  // Calculate index for the magic indicator (admin items only)
  const activeIndex = adminRootItems.findIndex((i) => i.id === activeRootItem?.id);

  let indicatorTop = -100; // Hidden offscreen by default
  // The verified workspace accent — --nx-accent tracks --workspace-hue in CSS
  const indicatorColor = "var(--nx-accent)";
  let indicatorVisible = false;

  if (activeIndex >= 0) {
    // Each button is 44px tall with margin: "4px 0".
    // Flexbox margins DO NOT collapse, so the stride between buttons is 44 + 8 = 52px.
    // The first button is offset by its own margin-top: 4px.
    indicatorTop = activeIndex * 52 + 4;
    indicatorVisible = true;
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="relative z-raised flex flex-shrink-0 flex-col items-center"
      style={{
        width: "var(--nexus-primary-w)",
        minWidth: "var(--nexus-primary-w)",
        maxWidth: "var(--nexus-primary-w)",
        height: "100%",
        /* Critical: block horizontal scroll caused by absolute-positioned tooltips */
        overflowX: "hidden",
        overflowY: "hidden",
        background: "var(--nx-ground)",
        borderInlineEnd: "1px solid var(--nx-line)",
        padding: "16px 0",
        /* theme-switch crossfade — colour only, so it survives reduced motion */
        transition:
          "background var(--nx-t-standard) var(--nx-ease-enter), border-color var(--nx-t-standard) var(--nx-ease-enter)",
        boxSizing: "border-box",
      }}
    >
      {/* ONE tooltip provider for the whole rail — shared ~150ms delay grouping
          instead of the previous provider-per-button setup */}
      <TooltipProvider delayDuration={150}>
        {/* ── Logo mark — click navigates home ───────────────────── */}
        <PrimaryRailLogo
          tenantLogoUrl={tenantLogoUrl}
          isModuleMode={isModuleMode}
          language={language}
          onClick={() => {
            // Clear workspace key so Hub page shows clean state
            // (secondary rail collapses, back button hides, admin items clear)
            useNavigationStore.getState().setActiveWorkspace(null);
            startRoutingProgress();
            router.push("/");
          }}
        />

        {/* ── Back button — visible only when admin has an admin workspace AND is not on it ── */}
        {/* CRM-only operators never see this — they have no admin workspace in their access list. */}
        {showBackButton && (
          <>
            <BackButton
              isRTL={isRTL}
              label={language === "ar" ? "العودة للإدارة" : "Back to Admin"}
              onClick={goBackWorkspace}
            />
            <Divider />
          </>
        )}

        {/* ── Scrollable area: Admin items + Pinned workspace icons ── */}
        <div
          className="nexus-rail-scroll relative flex w-full flex-1 flex-col items-center"
          style={{
            padding: "4px 0 16px",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none" /* Firefox: completely hidden by default */,
          }}
          onMouseEnter={(e) => e.currentTarget.classList.add("is-hovered")}
          onMouseLeave={(e) => e.currentTarget.classList.remove("is-hovered")}
        >
          {/* Magic Sliding Indicator (admin root items only) — carries the ONE
              --nx-glow on this screen */}
          <ActiveIndicator
            indicatorTop={indicatorTop}
            indicatorColor={indicatorColor}
            indicatorVisible={indicatorVisible}
            isRTL={isRTL}
          />

          {/* Admin root items as icon buttons */}
          {adminRootItems.map((item) => (
            <RootItemButton
              key={item.id}
              item={item}
              isActive={activeRootItem?.id === item.id}
              isRTL={isRTL}
              language={language}
              onClick={handleRootItemClick}
            />
          ))}

          {/* ── Pinned workspaces (individual icons below divider) ────────── */}
          {/* Only pinned workspaces show here. Pin/unpin from App Launcher (⊞ button) */}
          {hasPinnedWorkspaces && (
            <>
              <Divider />
              {pinnedWorkspaces.map((ws) => {
                const isActive = activeWorkspace?.workspaceKey === ws.workspaceKey;
                // Pins keep their own workspace colour; the token is the fallback
                const wsAccent = ws.accentColor || "var(--nx-accent)";
                const wsLabel =
                  language === "ar"
                    ? ws.workspaceNameAr || ws.workspaceNameEn
                    : ws.workspaceNameEn || ws.workspaceNameAr;

                return (
                  <ModuleWorkspaceButton
                    key={ws.workspaceKey}
                    label={wsLabel}
                    abbreviation={ws.abbreviation}
                    icon={ws.workspaceIcon}
                    accentColor={wsAccent}
                    isActive={isActive}
                    isRTL={isRTL}
                    isLocked={ws.isLocked}
                    onClick={() => handleModuleClick(ws.workspaceKey, ws.isLocked)}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* ── Bottom actions ─────────────────────────────────────── */}
        <div className="relative flex shrink-0 flex-col items-center gap-2 pb-2 pt-4">
          {/* {onTogglePanel && (
            <TogglePanelButton
              isRTL={isRTL}
              isCollapsed={isPanelCollapsed}
              label={language === "ar" ? "تبديل اللوحة" : "Toggle Panel"}
              onClick={onTogglePanel}
            />
          )} */}

          {/* App Launcher (⊞) — opens searchable workspace grid overlay */}
          {onOpenAppLauncher && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={language === "ar" ? "مشغّل التطبيقات" : "App Launcher"}
                  onClick={onOpenAppLauncher}
                  className={cn(
                    "flex items-center justify-center rounded-[12px] border border-transparent text-nx-ink-2 transition-all duration-nx-standard ease-nx-enter hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink",
                    NX_FOCUS_RING
                  )}
                  style={{ width: 44, height: 44 }}
                >
                  <LayoutGrid size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
                {language === "ar" ? "مشغّل التطبيقات" : "App Launcher"}
              </TooltipContent>
            </Tooltip>
          )}

          <Divider />

          {/* Bell honours the showNotifications setting like every other layout */}
          {showNotifications && (
            <div className="group relative flex w-full items-center justify-center">
              <NotificationBell
                iconClassName="h-[20px] w-[20px]"
                className="h-[44px] w-[44px] rounded-[12px] border border-transparent text-nx-ink-2 transition-all duration-nx-standard ease-nx-enter hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink"
              />
            </div>
          )}

          <div className="group relative mt-1 flex w-full items-center justify-center">
            <UserProfileDropdown
              variant="compact"
              showName={false}
              side={isRTL ? "left" : "right"}
              align="end"
              className="h-[40px] w-[40px] cursor-pointer rounded-full border-[1.5px] border-nx-line !p-0 shadow-sm transition-all duration-nx-micro hover:scale-105 hover:border-nx-line-hi active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            />
          </div>
        </div>
      </TooltipProvider>
    </nav>
  );
}

// ── Module Workspace Button (colored pill icon) ────────────────────────────────

interface ModuleWorkspaceButtonProps {
  label: string;
  abbreviation: string;
  icon: string;
  accentColor: string;
  isActive: boolean;
  isRTL: boolean;
  /** Backend-driven: true = module not licensed for current tenant */
  isLocked?: boolean;
  onClick: () => void;
}

function ModuleWorkspaceButton({
  label,
  abbreviation,
  icon,
  accentColor,
  isActive,
  isRTL,
  isLocked = false,
  onClick,
}: ModuleWorkspaceButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const { language } = useI18n();
  const lockedLabel = language === "ar" ? `${label} (مقفل)` : `${label} (Locked)`;

  // Identity colour stays per-workspace (accentColor is data, not styling);
  // every neutral state reads an --nx-* token so no theme branch is needed.
  const bgColor = (() => {
    if (isActive) return `color-mix(in oklch, ${accentColor} 13%, transparent)`;
    if (hovered) return "var(--nx-raised)";
    return "transparent";
  })();

  const iconColor = (() => {
    if (isActive) return accentColor;
    if (hovered) return "var(--nx-ink)";
    return "var(--nx-ink-3)";
  })();

  const borderColor = (() => {
    if (isActive) return `color-mix(in oklch, ${accentColor} 33%, transparent)`;
    if (hovered) return "var(--nx-line-hi)";
    return "transparent";
  })();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={isLocked ? lockedLabel : label}
          aria-pressed={isActive}
          aria-disabled={isLocked}
          onClick={isLocked ? undefined : onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            "group relative flex items-center justify-center transition-all duration-nx-standard ease-nx-enter",
            NX_FOCUS_RING
          )}
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 12,
            cursor: isLocked ? "not-allowed" : "pointer",
            border: `1.5px solid ${isLocked ? "var(--nx-line)" : borderColor}`,
            background: isLocked
              ? "color-mix(in oklch, var(--nx-ink) 4%, transparent)"
              : bgColor,
            color: isLocked ? "var(--nx-ink-3)" : iconColor,
            margin: "4px 0",
            // An active pin is the only lit thing when it renders (the rail
            // filters the active workspace out of pins, so in practice at most
            // one glow ever exists on screen).
            boxShadow: isActive ? "var(--nx-glow)" : "none",
            opacity: isLocked ? 0.55 : 1,
          }}
        >
          {/* Active glow ring — pulse dies under prefers-reduced-motion */}
          {isActive && (
            <div
              className="animate-pulse motion-reduce:animate-none"
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: 14,
                border: `2px solid color-mix(in oklch, ${accentColor} 25%, transparent)`,
                pointerEvents: "none",
              }}
            />
          )}
          {/* Lock overlay for locked modules */}
          {isLocked && (
            <div
              style={{
                position: "absolute",
                bottom: 2,
                insetInlineEnd: 2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "var(--nx-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: "hsl(var(--warning))",
                border: "1px solid hsl(var(--warning) / 0.3)",
                pointerEvents: "none",
              }}
            >
              🔒
            </div>
          )}
          <span
            className={cn(
              "transition-transform duration-nx-micro motion-reduce:transform-none",
              hovered && !isActive && !isLocked ? "scale-110" : "scale-100"
            )}
          >
            <DynamicIcon name={icon} size={20} />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
        {isLocked ? lockedLabel : label}
      </TooltipContent>
    </Tooltip>
  );
}
