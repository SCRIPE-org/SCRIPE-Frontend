"use client";

/**
 * NexusPrimaryRail
 *
 * Renders the ROOT MENU ITEMS of the active workspace as icon buttons.
 * Clicking a root item sets it as active → the secondary rail shows its children.
 *
 * Theme-aware, highly polished micro-interactions.
 * Includes a "Magic Indicator" for the active state and a panel toggle button.
 */

import React, { useCallback } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import type { MenuItem } from "@core/navigation";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { useTheme } from "next-themes";
import { cn } from "@core/common/utils";
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
  ActiveIndicator
} from "./_parts/primary-rail-parts";

interface NexusPrimaryRailProps {
  onTogglePanel?: () => void;
  isPanelCollapsed?: boolean;
}

// ── Primary Rail ──────────────────────────────────────────────────────────────
export function NexusPrimaryRail({ onTogglePanel, isPanelCollapsed = false }: NexusPrimaryRailProps) {
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
  } = useWorkspace();
  const { language, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const { goBackWorkspace } = useWorkspaceTransitionContext();

  const isRTL = direction === "rtl";
  const { isDark, accent } = useNexusPalette(resolvedTheme === "dark", accentColor || "#6258c4");

  // ── Handle root item click ────────────────────────────────────────────────
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

  // ── Handle modules-group click: show its children in secondary rail ─────────
  // The actual workspace switch happens when the user clicks a child
  // (e.g. CRM) in the secondary rail via the #workspace:<key> mechanism.
  const handleModulesGroupClick = useCallback(
    (item: MenuItem) => {
      setActiveRootItemId(item.id);
      // Auto-open panel if it was collapsed
      if (isPanelCollapsed && onTogglePanel) {
        onTogglePanel();
      }
    },
    [setActiveRootItemId, isPanelCollapsed, onTogglePanel]
  );

  // ── Separate "modules-group" from regular root items ──────────────────────
  const regularRootItems = rootMenuItems.filter(
    (item) => item.slug !== "modules-group"
  );
  const modulesGroupItem = rootMenuItems.find(
    (item) => item.slug === "modules-group"
  );

  const hasModules = !!modulesGroupItem;
  
  // Calculate index for the magic indicator
  const activeIndex = regularRootItems.findIndex(i => i.id === activeRootItem?.id);
  const isModulesActive = activeRootItem?.id === modulesGroupItem?.id;
  
  // Position the indicator based on which item is active
  // 52px = 44px height + 8px margin (4px top + 4px bottom)
  let indicatorTop = -100; // Hidden offscreen by default
  let indicatorColor = accent;
  let indicatorVisible = false;

  if (activeIndex >= 0) {
    indicatorTop = activeIndex * 52;
    indicatorVisible = true;
  } else if (isModulesActive && hasModules) {
    // Regular items height + divider height (25px) + 52px per item
    indicatorTop = (regularRootItems.length * 52) + 25; 
    indicatorColor = isDark ? "#9B8FE0" : "#6258c4";
    indicatorVisible = true;
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="relative flex flex-col items-center flex-shrink-0 z-20"
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
      {isModuleMode && previousWorkspaceKey && (
        <>
          <BackButton
            isRTL={isRTL}
            isDark={isDark}
            label={language === "ar" ? "العودة" : "Back to Admin"}
            onClick={goBackWorkspace}
          />
          <Divider />
        </>
      )}

      {/* ── Root items (never scrolls — icon rail is always compact) ── */}
      <div
        className="flex flex-col items-center flex-1 w-full overflow-hidden relative"
        style={{
          padding: "4px 0 16px",
        }}
      >
        {/* Magic Sliding Indicator */}
        <ActiveIndicator
          indicatorTop={indicatorTop}
          indicatorColor={indicatorColor}
          indicatorVisible={indicatorVisible}
          isRTL={isRTL}
        />

        {/* Regular root items as icon buttons */}
        {regularRootItems.map((item) => (
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

        {/* Modules divider + modules group (if it exists) */}
        {hasModules && (
          <>
            <Divider />
            <RootItemButton
              key={modulesGroupItem!.id}
              item={modulesGroupItem!}
              isActive={isModulesActive || isModuleMode}
              isRTL={isRTL}
              accentColor={isDark ? "#9B8FE0" : "#6258c4"}
              isDark={isDark}
              language={language}
              onClick={handleModulesGroupClick}
            />
          </>
        )}
      </div>

      {/* ── Bottom actions ─────────────────────────────────────── */}
      <div className="flex flex-col items-center shrink-0 gap-2 pb-2 pt-4 relative">
        {onTogglePanel && (
          <TogglePanelButton
            isRTL={isRTL}
            isDark={isDark}
            isCollapsed={isPanelCollapsed}
            label={language === "ar" ? "تبديل اللوحة" : "Toggle Panel"}
            onClick={onTogglePanel}
          />
        )}
        
        <Divider />

        <div className="group relative flex items-center justify-center w-full">
          <NotificationBell
            iconClassName="h-[20px] w-[20px]"
            className={cn(
              "h-[44px] w-[44px] rounded-[12px] transition-all duration-200 border border-transparent",
              isDark
                ? "text-[rgba(255,255,255,0.7)] hover:bg-white/5 hover:text-white hover:border-white/10"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200"
            )}
          />
        </div>

        <div className="group relative flex items-center justify-center w-full mt-1">
          <UserProfileDropdown
            variant="compact"
            showName={false}
            side={isRTL ? "left" : "right"}
            align="end"
            className="h-[40px] w-[40px] rounded-full !p-0 shadow-sm border-[1.5px] border-border/50 hover:border-border transition-all hover:scale-105 active:scale-95 cursor-pointer"
          />
        </div>
      </div>
    </nav>
  );
}

