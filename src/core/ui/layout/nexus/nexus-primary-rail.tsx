"use client";

/**
 * NexusPrimaryRail — 56px icon navigation rail
 *
 * Renders the ROOT MENU ITEMS of the active workspace as icon buttons.
 * Clicking a root item sets it as active → the secondary rail shows its children.
 *
 * If a root item has slug "modules-group" it acts as a module-switcher:
 *   clicking it does NOT expand children in the panel, instead it transitions
 *   to the module workspace layout. A "Back" button appears at the top.
 *
 * Theme-aware: uses CSS custom properties (--rail-*) defined in globals.css
 * so both light and dark modes are handled without JavaScript.
 *
 * Layout:
 * ┌──────┐
 * │  N   │  32px logo mark
 * ├──────┤
 * │  ⬅  │  Back button (module mode only)
 * ├──────┤
 * │  🗂  │  Root menu item icon buttons
 * │  👥  │
 * │  💬  │
 * │  ⚙  │
 * │  📦  │  ← "modules-group" if present
 * │      │
 * │ flex │  spacer
 * ├──────┤
 * │  🔔  │  Notification
 * │  👤  │  Avatar
 * └──────┘
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
  Package2,
} from "lucide-react";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { useTheme } from "next-themes";

// ── Icon resolver ─────────────────────────────────────────────────────────────
function DynamicIcon({ name, size = 15 }: { name: string; size?: number }) {
  const PascalName = name?.replace(/(^|[-_])(\w)/g, (_, __, c: string) =>
    c.toUpperCase()
  );
  const Icon = (LucideIcons as Record<string, any>)[PascalName ?? ""];
  if (Icon) return <Icon width={size} height={size} strokeWidth={1.8} />;
  return <LayoutDashboard width={size} height={size} strokeWidth={1.8} />;
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
  const label =
    language === "ar"
      ? item.nameAr || item.nameEn || item.name
      : item.nameEn || item.nameAr || item.name;

  // ── Light/dark aware colours ─────────────────────────────────────────────
  const bgColor = (() => {
    if (isActive)
      return isDark
        ? "rgba(255,255,255,0.07)"
        : "rgba(0,0,0,0.06)";
    if (hovered)
      return isDark
        ? "rgba(255,255,255,0.04)"
        : "rgba(0,0,0,0.04)";
    return "transparent";
  })();

  const iconColor = (() => {
    if (isActive) return accentColor;
    if (hovered)
      return isDark ? "rgba(208,220,239,0.85)" : "rgba(30,40,60,0.7)";
    return isDark ? "rgba(95,115,150,0.85)" : "rgba(100,115,145,0.7)";
  })();

  const tooltipBg = isDark ? "#1A2035" : "#ffffff";
  const tooltipBorder = isDark ? "#181E33" : "#e2e8f0";
  const tooltipColor = isDark ? "#D0DCEF" : "#1e2030";
  const indicatorBg = accentColor;

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={isActive}
        onClick={() => onClick(item)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 150ms ease, color 150ms ease",
          border: "none",
          flexShrink: 0,
          position: "relative",
          background: bgColor,
          color: iconColor,
          margin: "2px 0",
          outline: "none",
        }}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span
            style={{
              position: "absolute",
              ...(isRTL ? { right: -11 } : { left: -11 }),
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 16,
              borderRadius: isRTL ? "2px 0 0 2px" : "0 2px 2px 0",
              background: indicatorBg,
              flexShrink: 0,
            }}
          />
        )}
        <DynamicIcon name={item.icon} size={15} />
      </button>

      {/* Tooltip */}
      <span
        style={{
          position: "absolute",
          ...(isRTL ? { right: 46 } : { left: 46 }),
          top: "50%",
          transform: "translateY(-50%)",
          background: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          borderRadius: 6,
          padding: "4px 9px",
          fontSize: 11,
          color: tooltipColor,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 100,
          opacity: hovered ? 1 : 0,
          transition: "opacity 150ms ease",
          boxShadow: isDark
            ? "0 4px 12px rgba(0,0,0,0.4)"
            : "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        {label}
      </span>
    </div>
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
  const tooltipBg = isDark ? "#1A2035" : "#ffffff";
  const tooltipBorder = isDark ? "#181E33" : "#e2e8f0";
  const tooltipColor = isDark ? "#D0DCEF" : "#1e2030";
  const iconColor = hovered
    ? isDark ? "#D0DCEF" : "#1e2030"
    : isDark ? "#5F7396" : "#8a9cc0";

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 150ms, color 150ms",
          border: "none",
          background: hovered
            ? isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
            : "transparent",
          color: iconColor,
          outline: "none",
          marginBottom: 4,
        }}
      >
        {isRTL ? (
          <ArrowRight width={15} height={15} strokeWidth={2} />
        ) : (
          <ArrowLeft width={15} height={15} strokeWidth={2} />
        )}
      </button>
      <span
        style={{
          position: "absolute",
          ...(isRTL ? { right: 46 } : { left: 46 }),
          top: "50%",
          transform: "translateY(-50%)",
          background: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          borderRadius: 6,
          padding: "4px 9px",
          fontSize: 11,
          color: tooltipColor,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 100,
          opacity: hovered ? 1 : 0,
          transition: "opacity 150ms ease",
          boxShadow: isDark
            ? "0 4px 12px rgba(0,0,0,0.4)"
            : "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ isDark }: { isDark: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 1,
        background: isDark ? "#111626" : "#e2e8f0",
        borderRadius: 1,
        margin: "6px 0",
        flexShrink: 0,
      }}
    />
  );
}

// ── Primary Rail ──────────────────────────────────────────────────────────────
export function NexusPrimaryRail() {
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

  // ── Rail theme colours ────────────────────────────────────────────────────
  const railBg = isDark ? "#060810" : "#f8f9fc";
  const railBorder = isDark ? "1px solid #111626" : "1px solid #e4e8f0";
  const logoBg = accent;

  // ── Handle root item click ────────────────────────────────────────────────
  const handleRootItemClick = useCallback(
    (item: MenuItem) => {
      setActiveRootItemId(item.id);
    },
    [setActiveRootItemId]
  );

  // ── Separate "modules-group" from regular root items ──────────────────────
  const regularRootItems = rootMenuItems.filter(
    (item) => item.slug !== "modules-group"
  );
  const modulesGroupItem = rootMenuItems.find(
    (item) => item.slug === "modules-group"
  );

  const hasModules = !!modulesGroupItem;

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        width: 56,
        height: "100vh",
        background: railBg,
        borderRight: railBorder,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 0",
        gap: 0,
        flexShrink: 0,
        zIndex: 10,
        position: "relative",
        boxSizing: "border-box",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
    >
      {/* ── Logo mark ──────────────────────────────────────────── */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: logoBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.5px",
          marginBottom: isModuleMode ? 10 : 14,
          cursor: "default",
          transition: "background 300ms cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        N
      </div>

      {/* ── Back button (module mode) ──────────────────────────── */}
      {isModuleMode && previousWorkspaceKey && (
        <>
          <BackButton
            isRTL={isRTL}
            isDark={isDark}
            label={language === "ar" ? "العودة" : "Back"}
            onClick={goBack}
          />
          <Divider isDark={isDark} />
        </>
      )}

      {/* ── Scrollable root items ──────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          width: "100%",
          padding: "2px 0 8px",
          gap: 0,
        }}
      >
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
            <Divider isDark={isDark} />
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          paddingBottom: 6,
          flexShrink: 0,
        }}
      >
        <NotificationBell
          iconClassName="h-[14px] w-[14px]"
          className={[
            "h-[34px] w-[34px] rounded-[8px]",
            isDark
              ? "!text-[#2F3C55] hover:!bg-white/5 hover:!text-[#8A9BBF]"
              : "!text-[#8a9cc0] hover:!bg-black/5 hover:!text-[#4a5880]",
          ].join(" ")}
        />

        <UserProfileDropdown
          variant="compact"
          showName={false}
          className="h-[26px] w-[26px] rounded-full !p-0"
        />
      </div>
    </nav>
  );
}
