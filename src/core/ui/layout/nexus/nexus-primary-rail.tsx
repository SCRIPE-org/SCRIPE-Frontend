"use client";

/**
 * NexusPrimaryRail
 *
 * Architecture (per wireframes):
 *
 *  ┌──────────┐
 *  │   LOGO   │  ← Click = navigate home
 *  ├──────────┤
 *  │ 🛡️ Admin │  ← Always present. ONE icon for ALL admin features.
 *  ├──────────┤
 *  │ ════════ │  ← Divider (only if module workspaces exist)
 *  ├──────────┤
 *  │  [CRM]   │  ← Module workspaces (scrollable)
 *  │  [HRMS]  │     Each is a SEPARATE icon in the rail.
 *  │  [INV]   │     Accent-colored pill icons.
 *  │  [...]   │     ↕ SCROLLABLE if many modules
 *  ├──────────┤
 *  │ ════════ │
 *  ├──────────┤
 *  │  [⊞]    │  ← App Launcher — opens grid overlay
 *  │  [🔔]   │  ← Notifications
 *  │  [👤]   │  ← User Profile
 *  └──────────┘
 *
 * Clicking an Admin root item → secondary rail shows its children.
 * Clicking a Module workspace icon → full workspace transition.
 */

import React, { useCallback, useMemo } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import type { MenuItem } from "@core/navigation";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { useTheme } from "next-themes";
import { cn } from "@core/common/utils";
import { LayoutGrid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { DynamicIcon } from "./_parts/primary-rail-parts";
import { useTenantBranding } from "@core/providers/tenant-branding-provider";
import { useRouter } from "next/navigation";
import { useWorkspaceTransitionContext } from "./nexus-layout";
import { useNexusPalette } from "./_parts/nexus-theme-utils";
import {
  BackButton,
  Divider,
  RootItemButton,
  TogglePanelButton,
  PrimaryRailLogo,
  ActiveIndicator,
} from "./_parts/primary-rail-parts";

interface NexusPrimaryRailProps {
  onTogglePanel?: () => void;
  isPanelCollapsed?: boolean;
  onOpenAppLauncher?: () => void;
}

// ── Primary Rail ──────────────────────────────────────────────────────────────
export function NexusPrimaryRail({
  onTogglePanel,
  isPanelCollapsed = false,
  onOpenAppLauncher,
}: NexusPrimaryRailProps) {
  const router = useRouter();
  const { logoUrl: tenantLogoUrl } = useTenantBranding();
  const {
    activeWorkspace,
    rootMenuItems,
    activeRootItem,
    setActiveRootItemId,
    isModuleMode,
    previousWorkspaceKey,
    goBack,
    accentColor,
    moduleWorkspaces,
  } = useWorkspace();
  const { language, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const { switchWorkspace, goBackWorkspace } = useWorkspaceTransitionContext();

  const isRTL = direction === "rtl";
  const { isDark, accent } = useNexusPalette(resolvedTheme === "dark", accentColor || "#6258c4");

  // ── Handle admin root item click ─────────────────────────────────────────
  const handleRootItemClick = useCallback(
    (item: MenuItem) => {
      setActiveRootItemId(item.id);
      // Auto-open panel if it was collapsed when clicking an item
      if (isPanelCollapsed && onTogglePanel) {
        onTogglePanel();
      }
    },
    [setActiveRootItemId, isPanelCollapsed, onTogglePanel]
  );

  // ── Handle module workspace click → full workspace transition ────────────
  const handleModuleClick = useCallback(
    (wsKey: string) => {
      switchWorkspace(wsKey);
    },
    [switchWorkspace]
  );

  // ── Filter out "modules-group" from root items (it's legacy; modules are in the rail now) ──
  const adminRootItems = useMemo(
    () => rootMenuItems.filter((item) => item.slug !== "modules-group"),
    [rootMenuItems]
  );

  // Module workspaces to show as separate icons in the rail
  const hasModules = moduleWorkspaces.length > 0;

  // Calculate index for the magic indicator (admin items only)
  const activeIndex = adminRootItems.findIndex((i) => i.id === activeRootItem?.id);

  let indicatorTop = -100; // Hidden offscreen by default
  let indicatorColor = accent;
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
      className="relative z-20 flex flex-shrink-0 flex-col items-center"
      style={{
        width: "var(--nexus-primary-w)",
        minWidth: "var(--nexus-primary-w)",
        maxWidth: "var(--nexus-primary-w)",
        height: "100%",
        /* Critical: block horizontal scroll caused by absolute-positioned tooltips */
        overflowX: "hidden",
        overflowY: "hidden",
        background: "hsl(var(--background))",
        borderInlineEnd: "1px solid hsl(var(--border))",
        padding: "16px 0",
        transition: "background 200ms ease, border-color 200ms ease",
        boxSizing: "border-box",
      }}
    >
      {/* ── Logo mark — click navigates home ───────────────────── */}
      <PrimaryRailLogo
        tenantLogoUrl={tenantLogoUrl}
        accent={accent}
        isDark={isDark}
        isModuleMode={isModuleMode}
        language={language}
        onClick={() => router.push("/")}
      />

      {/* ── Back button (module mode) ──────────────────────────── */}
      {/* Gap A fix: always show when in module mode — goBackWorkspace falls back
          to adminWorkspaces[0] when previousWorkspaceKey is null, so this is
          safe for both click-navigation AND direct URL navigation to a module. */}
      {isModuleMode && (
        <>
          <BackButton
            isRTL={isRTL}
            isDark={isDark}
            label={language === "ar" ? "العودة للإدارة" : "Back to Admin"}
            onClick={goBackWorkspace}
          />
          <Divider />
        </>
      )}

      {/* ── Scrollable area: Admin items + Module workspace icons ── */}
      <div
        className="nexus-rail-scroll relative flex w-full flex-1 flex-col items-center"
        style={{
          padding: "4px 0 16px",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",  /* Firefox: completely hidden by default */
        }}
        onMouseEnter={(e) => e.currentTarget.classList.add("is-hovered")}
        onMouseLeave={(e) => e.currentTarget.classList.remove("is-hovered")}
      >
        {/* Magic Sliding Indicator (admin root items only) */}
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
            accentColor={accent}
            isDark={isDark}
            language={language}
            onClick={handleRootItemClick}
          />
        ))}

        {/* ── Module workspaces (individual icons below divider) ──────── */}
        {hasModules && (
          <>
            <Divider />
            {moduleWorkspaces.map((ws) => {
              const isActive = activeWorkspace?.workspaceKey === ws.workspaceKey;
              const wsAccent = ws.accentColor || (isDark ? "#9B8FE0" : "#6258c4");
              const wsLabel = language === "ar"
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
                  isDark={isDark}
                  isRTL={isRTL}
                  isLocked={ws.isLocked}
                  onClick={() => handleModuleClick(ws.workspaceKey)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* ── Bottom actions ─────────────────────────────────────── */}
      <div className="relative flex shrink-0 flex-col items-center gap-2 pb-2 pt-4">
        {onTogglePanel && (
          <TogglePanelButton
            isRTL={isRTL}
            isDark={isDark}
            isCollapsed={isPanelCollapsed}
            label={language === "ar" ? "تبديل اللوحة" : "Toggle Panel"}
            onClick={onTogglePanel}
          />
        )}

        {/* App Launcher (⊞) — opens searchable workspace grid overlay */}
        {onOpenAppLauncher && (
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={language === "ar" ? "مشغّل التطبيقات" : "App Launcher"}
                  onClick={onOpenAppLauncher}
                  className={cn(
                    "flex items-center justify-center rounded-[12px] border border-transparent transition-all duration-200",
                    isDark
                      ? "text-[rgba(255,255,255,0.6)] hover:border-white/10 hover:bg-white/5 hover:text-white"
                      : "text-slate-500 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
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
          </TooltipProvider>
        )}

        <Divider />

        <div className="group relative flex w-full items-center justify-center">
          <NotificationBell
            iconClassName="h-[20px] w-[20px]"
            className={cn(
              "h-[44px] w-[44px] rounded-[12px] border border-transparent transition-all duration-200",
              isDark
                ? "text-[rgba(255,255,255,0.7)] hover:border-white/10 hover:bg-white/5 hover:text-white"
                : "text-slate-500 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            )}
          />
        </div>

        <div className="group relative mt-1 flex w-full items-center justify-center">
          <UserProfileDropdown
            variant="compact"
            showName={false}
            side={isRTL ? "left" : "right"}
            align="end"
            className="h-[40px] w-[40px] cursor-pointer rounded-full border-[1.5px] border-border/50 !p-0 shadow-sm transition-all hover:scale-105 hover:border-border active:scale-95"
          />
        </div>
      </div>
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
  isDark: boolean;
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
  isDark,
  isRTL,
  isLocked = false,
  onClick,
}: ModuleWorkspaceButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const { language } = useI18n();
  const lockedLabel = language === "ar" ? `${label} (مقفل)` : `${label} (Locked)`;

  const bgColor = (() => {
    if (isActive) return `${accentColor}22`;
    if (hovered) return isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
    return "transparent";
  })();

  const iconColor = (() => {
    if (isActive) return accentColor;
    if (hovered) return isDark ? "rgba(255,255,255,0.9)" : "rgba(30,40,60,0.85)";
    return isDark ? "rgba(255,255,255,0.5)" : "rgba(100,115,145,0.7)";
  })();

  const borderColor = (() => {
    if (isActive) return `${accentColor}55`;
    if (hovered) return isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    return "transparent";
  })();

  return (
    <TooltipProvider delayDuration={50}>
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
            className="group relative flex items-center justify-center outline-none transition-all duration-200 ease-out"
            style={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 12,
              cursor: isLocked ? "not-allowed" : "pointer",
              border: `1.5px solid ${isLocked ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)") : borderColor}`,
              background: isLocked
                ? (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")
                : bgColor,
              color: isLocked
                ? (isDark ? "rgba(255,255,255,0.25)" : "rgba(100,115,145,0.35)")
                : iconColor,
              margin: "4px 0",
              boxShadow: isActive ? `0 4px 16px ${accentColor}25` : "none",
              opacity: isLocked ? 0.55 : 1,
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Active glow ring */}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  inset: -2,
                  borderRadius: 14,
                  border: `2px solid ${accentColor}40`,
                  pointerEvents: "none",
                  animation: "pulse 2s ease-in-out infinite",
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
                  background: isDark ? "rgba(30,30,50,0.9)" : "rgba(255,255,255,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "hsl(38 92% 45%)",
                  border: "1px solid hsl(38 92% 50% / 0.3)",
                  pointerEvents: "none",
                }}
              >
                🔒
              </div>
            )}
            <span
              className={cn(
                "transition-transform duration-200",
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
    </TooltipProvider>
  );
}
