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

import React, { useCallback, useState } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import type { MenuItem } from "@core/domain/entities/Navigation";
import * as LucideIcons from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeft,
  ArrowRight,
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { useTheme } from "next-themes";
import { cn } from "@core/common/utils";
import { useTenantBranding } from "@core/providers/tenant-branding-provider";
import { useRouter } from "next/navigation";

// ── Icon resolver ─────────────────────────────────────────────────────────────
function DynamicIcon({ name, size = 18 }: { name: string; size?: number }) {
  const PascalName = name?.replace(/(^|[-_])(\w)/g, (_, __, c: string) =>
    c.toUpperCase()
  );
  const Icon = (LucideIcons as Record<string, any>)[PascalName ?? ""];
  if (Icon) return <Icon width={size} height={size} strokeWidth={1.8} />;
  return <LayoutDashboard width={size} height={size} strokeWidth={1.8} />;
}

// ── Shared Tooltip (fixed-position, escapes any overflow clip) ────────────────
interface TooltipWrapperProps {
  label: string;
  isDark: boolean;
  hovered: boolean;
  children: React.ReactNode;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isRTL?: boolean;
}

function TooltipWrapper({ label, isDark, hovered, children, buttonRef, isRTL }: TooltipWrapperProps) {
  const tooltipBg = isDark ? "#0d1117" : "#ffffff";
  const tooltipBorder = isDark ? "#1f2937" : "#e2e8f0";
  const tooltipColor = isDark ? "#D0DCEF" : "#1e2030";

  // Calculate fixed position from the button's bounding rect
  const [pos, setPos] = React.useState({ top: 0, left: 0, right: 0, useRight: false });

  React.useEffect(() => {
    if (hovered && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (isRTL) {
        // Rail is on the right side in RTL → tooltip appears to the left
        setPos({ top: midY, left: 0, right: window.innerWidth - rect.left + 8, useRight: true });
      } else {
        // Rail is on the left side in LTR → tooltip appears to the right
        setPos({ top: midY, left: rect.right + 8, right: 0, useRight: false });
      }
    }
  }, [hovered, buttonRef, isRTL]);

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
      {children}
      {hovered && (
        <span
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.useRight ? undefined : pos.left,
            right: pos.useRight ? pos.right : undefined,
            transform: "translateY(-50%)",
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 500,
            color: tooltipColor,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 99999,
            opacity: 1,
            transition: "opacity 150ms ease",
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset"
              : "0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// ── Root item button ──────────────────────────────────────────────────────────
interface RootItemButtonProps {
  item: MenuItem;
  isActive: boolean;
  isRTL: boolean;
  accentColor: string;
  isDark: boolean;
  language: string;
  onClick: (item: MenuItem) => void;
}

function RootItemButton({
  item,
  isActive,
  isRTL,
  accentColor,
  isDark,
  language,
  onClick,
}: RootItemButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const label =
    language === "ar"
      ? item.nameAr || item.nameEn || item.name
      : item.nameEn || item.nameAr || item.name;

  // ── Light/dark aware colours ─────────────────────────────────────────────
  const bgColor = (() => {
    if (isActive)
      return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    if (hovered)
      return isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
    return "transparent";
  })();

  const iconColor = (() => {
    if (isActive) return accentColor;
    if (hovered) return isDark ? "rgba(255,255,255,0.95)" : "rgba(30,40,60,0.9)";
    return isDark ? "rgba(255,255,255,0.6)" : "rgba(100,115,145,0.8)";
  })();

  return (
    <TooltipWrapper label={label} isDark={isDark} hovered={hovered} buttonRef={btnRef} isRTL={isRTL}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-pressed={isActive}
        onClick={() => onClick(item)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex items-center justify-center outline-none transition-all duration-200 ease-out"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          cursor: "pointer",
          border: isActive ? `1px solid ${accentColor}33` : "1px solid transparent",
          background: bgColor,
          color: iconColor,
          margin: "4px 0",
          boxShadow: isActive ? `0 4px 12px ${accentColor}15` : "none",
        }}
      >
        <span className={cn(
          "transition-transform duration-200",
          hovered && !isActive ? "scale-110" : "scale-100"
        )}>
          <DynamicIcon name={item.icon} size={20} />
        </span>
      </button>
    </TooltipWrapper>
  );
}

// ── Back button (module mode) ─────────────────────────────────────────────────
interface BackButtonProps {
  isRTL: boolean;
  isDark: boolean;
  label: string;
  onClick: () => void;
}

function BackButton({ isRTL, isDark, label, onClick }: BackButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const iconColor = hovered
    ? isDark ? "#ffffff" : "#000000"
    : isDark ? "#8A9CC0" : "#64748B";

  return (
    <TooltipWrapper label={label} isDark={isDark} hovered={hovered} buttonRef={btnRef} isRTL={isRTL}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex items-center justify-center outline-none transition-all duration-200"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          cursor: "pointer",
          border: "1px solid transparent",
          background: hovered
            ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
            : "transparent",
          color: iconColor,
          marginBottom: 8,
        }}
      >
        <span className={cn(
          "transition-transform duration-200",
          hovered ? (isRTL ? "translate-x-1" : "-translate-x-1") : "translate-x-0"
        )}>
          {isRTL ? (
            <ArrowRight width={20} height={20} strokeWidth={2} />
          ) : (
            <ArrowLeft width={20} height={20} strokeWidth={2} />
          )}
        </span>
      </button>
    </TooltipWrapper>
  );
}

// ── Panel Toggle Button ───────────────────────────────────────────────────────
interface TogglePanelButtonProps {
  isRTL: boolean;
  isDark: boolean;
  label: string;
  isCollapsed: boolean;
  onClick: () => void;
}

function TogglePanelButton({ isRTL, isDark, label, isCollapsed, onClick }: TogglePanelButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const iconColor = hovered
    ? isDark ? "#ffffff" : "#000000"
    : isDark ? "#8A9CC0" : "#64748B";

  // Determine icon based on RTL and collapsed state
  let Icon = PanelLeftClose;
  if (isRTL) {
    Icon = isCollapsed ? PanelRightOpen : PanelRightClose;
  } else {
    Icon = isCollapsed ? PanelLeftOpen : PanelLeftClose;
  }

  return (
    <TooltipWrapper label={label} isDark={isDark} hovered={hovered} buttonRef={btnRef} isRTL={isRTL}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex items-center justify-center outline-none transition-all duration-200"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          cursor: "pointer",
          border: "1px solid transparent",
          background: hovered
            ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
            : "transparent",
          color: iconColor,
          marginBottom: 8,
        }}
      >
        <span className={cn(
          "transition-transform duration-200",
          hovered ? "scale-110" : "scale-100"
        )}>
          <Icon width={20} height={20} strokeWidth={2} />
        </span>
      </button>
    </TooltipWrapper>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div
      style={{
        width: 32,
        height: 1,
        background: "hsl(var(--border))",
        opacity: 0.6,
        borderRadius: 1,
        margin: "12px 0",
        flexShrink: 0,
      }}
    />
  );
}

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
    workspaceGroups,
    setActiveWorkspace,
    accentColor,
  } = useWorkspace();
  const { language, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const isRTL = direction === "rtl";
  const accent = accentColor ?? (isDark ? "#7C6FD4" : "#6258c4");

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
      <div
        className="flex items-center justify-center shrink-0 cursor-pointer transition-all hover:scale-105 duration-300"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: tenantLogoUrl
            ? "transparent"
            : `linear-gradient(135deg, ${accent} 0%, ${isDark ? "#3B2FA3" : "#2D2580"} 100%)`,
          marginBottom: isModuleMode ? 12 : 20,
          boxShadow: tenantLogoUrl
            ? "none"
            : `0 6px 20px ${accent}50, 0 2px 8px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
          overflow: "hidden",
          flexShrink: 0,
        }}
        onClick={() => router.push("/")}
        role="link"
        aria-label={language === "ar" ? "الصفحة الرئيسية" : "Go to Home"}
      >
        {tenantLogoUrl ? (
          <img
            src={tenantLogoUrl}
            alt="Logo"
            style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 14 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
              userSelect: "none",
              letterSpacing: "-0.5px",
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            N
          </span>
        )}
      </div>

      {/* ── Back button (module mode) ──────────────────────────── */}
      {isModuleMode && previousWorkspaceKey && (
        <>
          <BackButton
            isRTL={isRTL}
            isDark={isDark}
            label={language === "ar" ? "العودة" : "Back to Admin"}
            onClick={goBack}
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
        <div 
          style={{
            position: "absolute",
            [isRTL ? "right" : "left"]: 0,
            top: indicatorTop + 4, // +4px to account for the margin-top of the first item
            width: 4,
            height: 44,
            background: indicatorColor,
            borderRadius: isRTL ? "4px 0 0 4px" : "0 4px 4px 0",
            transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: indicatorVisible ? 1 : 0,
            transform: indicatorVisible ? "scaleY(1)" : "scaleY(0.3)",
            boxShadow: `0 0 12px ${indicatorColor}80`,
            zIndex: 10,
          }}
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
              isActive={activeRootItem?.id === modulesGroupItem!.id}
              isRTL={isRTL}
              accentColor={isDark ? "#9B8FE0" : "#6258c4"}
              isDark={isDark}
              language={language}
              onClick={handleRootItemClick}
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

