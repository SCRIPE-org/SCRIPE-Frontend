"use client";

/**
 * NexusSecondaryRail — 210px panel sidebar
 *
 * Shows the CHILDREN of the selected root menu item from the primary rail.
 *
 * - Header: icon + name of the selected root item (context label + workspace name)
 * - Body: nav rows for the root item's children
 *   - Groups: items with no href but with children → group label + indented children
 *   - Leaf items: items with href → clickable nav link
 *
 * Theme-aware: adapts to light/dark using useTheme.
 */

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";
import type { MenuItem } from "@core/domain/entities/Navigation";

interface NexusSecondaryRailProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ── Theme palette helper ───────────────────────────────────────────────────────
function usePalette(isDark: boolean, accentColor: string) {
  return {
    railBg: isDark ? "#0C0F1C" : "#f4f6fb",
    railBorder: isDark ? "1px solid #111626" : "1px solid #e4e8f0",
    labelColor: isDark ? "#2F3C55" : "#a0aec0",
    headerLabel: isDark ? "#AFA9EC" : "#6258c4",
    headerTitle: isDark ? "#D0DCEF" : "#1e2030",
    dotDefault: isDark ? "#2F3C55" : "#cdd5e0",
    dotActive: accentColor,
    itemBgActive: isDark ? "rgba(255,255,255,0.05)" : "rgba(99,89,196,0.08)",
    itemBgHover: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    textActive: isDark ? "#D0DCEF" : "#2d3361",
    textMuted: isDark ? "#8A9BBF" : "#8a9cc0",
    scrollbarTrack: isDark ? "#263050" : "#d1d8e8",
    chevronColor: isDark ? "#2F3C55" : "#cdd5e0",
    groupLabelColor: isDark ? "#2F3C55" : "#a0aec0",
  };
}

// ── NavItem ───────────────────────────────────────────────────────────────────
interface NavItemProps {
  item: MenuItem;
  depth?: number;
  pathname: string;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onNavigate: () => void;
  palette: ReturnType<typeof usePalette>;
  language: string;
}

function NavItem({
  item,
  depth = 0,
  pathname,
  expandedIds,
  onToggle,
  onNavigate,
  palette,
  language,
}: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  const label =
    language === "ar"
      ? item.nameAr || item.nameEn
      : item.nameEn || item.nameAr;

  const isActive =
    !!item.href &&
    (pathname === item.href || pathname.startsWith(item.href + "/"));

  const hasChildren = item.children.length > 0;
  const isExpanded = expandedIds.includes(item.id);
  const hasActiveChild = item.children.some(
    (c) => !!c.href && (pathname === c.href || pathname.startsWith(c.href + "/"))
  );

  const indent = depth * 10;

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: `5px 8px 5px ${10 + indent}px`,
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 120ms",
    background: isActive
      ? palette.itemBgActive
      : hovered
      ? palette.itemBgHover
      : "transparent",
    userSelect: "none",
  };

  const dotStyle: React.CSSProperties = {
    width: 4,
    height: 4,
    borderRadius: "50%",
    flexShrink: 0,
    background: isActive ? palette.dotActive : palette.dotDefault,
    transition: "background 130ms",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: isActive || hovered ? palette.textActive : palette.textMuted,
    flex: 1,
    transition: "color 130ms",
    fontWeight: isActive ? 500 : 400,
  };

  if (hasChildren) {
    return (
      <div>
        <div
          style={itemStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onToggle(item.id)}
        >
          <div style={dotStyle} />
          <span style={labelStyle}>{label}</span>
          <span
            style={{
              fontSize: 10,
              color: palette.chevronColor,
              transition: "transform 150ms",
              transform: isExpanded || hasActiveChild ? "rotate(90deg)" : "none",
            }}
          >
            ›
          </span>
        </div>
        {(isExpanded || hasActiveChild) && (
          <div>
            {item.children.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                depth={depth + 1}
                pathname={pathname}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onNavigate={onNavigate}
                palette={palette}
                language={language}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href ?? "#"}
      onClick={onNavigate}
      style={itemStyle}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={dotStyle} />
      <span style={labelStyle}>{label}</span>
    </Link>
  );
}

// ── Group Label ───────────────────────────────────────────────────────────────
function GroupLabel({ label, palette }: { label: string; palette: ReturnType<typeof usePalette> }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 600,
        color: palette.groupLabelColor,
        textTransform: "uppercase",
        letterSpacing: "0.7px",
        padding: "10px 8px 4px",
        marginTop: 4,
      }}
    >
      {label}
    </div>
  );
}

// ── Rail Content ──────────────────────────────────────────────────────────────
function RailContent({
  menuItems,
  pathname,
  palette,
  language,
  onNavigate,
}: {
  menuItems: MenuItem[];
  pathname: string;
  palette: ReturnType<typeof usePalette>;
  language: string;
  onNavigate: () => void;
}) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const handleToggle = useCallback(
    (id: string) =>
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      ),
    []
  );

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 8,
        scrollbarWidth: "thin",
        scrollbarColor: `${palette.scrollbarTrack} transparent`,
      }}
    >
      {menuItems.map((item) => {
        // Item has no href but has children → treat as group header
        const isGroup = item.children.length > 0 && !item.href;
        if (isGroup) {
          return (
            <div key={item.id}>
              <GroupLabel
                label={language === "ar" ? item.nameAr || item.nameEn : item.nameEn || item.nameAr}
                palette={palette}
              />
              {item.children.map((child) => (
                <NavItem
                  key={child.id}
                  item={child}
                  depth={0}
                  pathname={pathname}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  onNavigate={onNavigate}
                  palette={palette}
                  language={language}
                />
              ))}
            </div>
          );
        }
        return (
          <NavItem
            key={item.id}
            item={item}
            depth={0}
            pathname={pathname}
            expandedIds={expandedIds}
            onToggle={handleToggle}
            onNavigate={onNavigate}
            palette={palette}
            language={language}
          />
        );
      })}
    </div>
  );
}

// ── Rail Header ───────────────────────────────────────────────────────────────
function RailHeader({
  contextLabel,
  title,
  palette,
}: {
  contextLabel: string;
  title: string;
  palette: ReturnType<typeof usePalette>;
}) {
  return (
    <div
      style={{
        padding: "16px 14px 12px",
        borderBottom: palette.railBorder,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: palette.headerLabel,
          textTransform: "uppercase",
          letterSpacing: "0.7px",
          fontWeight: 600,
          marginBottom: 4,
          transition: "color 300ms",
        }}
      >
        {contextLabel}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: palette.headerTitle,
          whiteSpace: "nowrap",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </div>
    </div>
  );
}

// ── Secondary Rail ────────────────────────────────────────────────────────────
export function NexusSecondaryRail({ mobileOpen, onMobileClose }: NexusSecondaryRailProps) {
  const { activeWorkspace, activeRootItem, isModuleMode, accentColor } = useWorkspace();
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  const isDark = resolvedTheme === "dark";
  const palette = usePalette(isDark, accentColor ?? (isDark ? "#7C6FD4" : "#6258c4"));

  // ── Context label ─────────────────────────────────────────────────────────
  const contextLabel = isModuleMode
    ? (activeWorkspace?.workspaceKey?.toUpperCase() ?? "MODULE")
    : "CONTROL PLANE";

  // ── Title: selected root item name ────────────────────────────────────────
  const title = activeRootItem
    ? language === "ar"
      ? activeRootItem.nameAr || activeRootItem.nameEn
      : activeRootItem.nameEn || activeRootItem.nameAr
    : activeWorkspace?.getLocalizedName(language) ?? "Workspace";

  // ── Menu items to display: children of the selected root item ─────────────
  const menuItems: MenuItem[] = activeRootItem?.children ?? [];

  const handleNavigate = useCallback(() => onMobileClose?.(), [onMobileClose]);

  const railStyle: React.CSSProperties = {
    width: 210,
    height: "100vh",
    background: palette.railBg,
    borderRight: palette.railBorder,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    transition: "background 200ms ease, border-color 200ms ease",
    zIndex: 9,
  };

  const railContent = (
    <>
      <RailHeader
        contextLabel={contextLabel}
        title={title}
        palette={palette}
      />
      <RailContent
        menuItems={menuItems}
        pathname={pathname}
        palette={palette}
        language={language}
        onNavigate={handleNavigate}
      />
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside style={railStyle} className="hidden lg:flex lg:flex-col">
        {railContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background: isDark ? "rgba(8,11,21,0.6)" : "rgba(30,40,60,0.4)",
              backdropFilter: "blur(8px)",
            }}
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 z-50 flex flex-col lg:hidden"
            style={{
              left: 56,
              width: 210,
              background: palette.railBg,
              borderRight: palette.railBorder,
            }}
          >
            {railContent}
          </aside>
        </>
      )}
    </>
  );
}
