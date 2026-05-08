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
 * Features premium glassmorphism aesthetics and micro-animations.
 */

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";
import type { MenuItem } from "@core/navigation";
import { ChevronRight, ArrowRightLeft } from "lucide-react";
import { useWorkspaceTransitionContext } from "./nexus-layout";

interface NexusSecondaryRailProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
}

// ── Theme palette helper ───────────────────────────────────────────────────────
function usePalette(isDark: boolean, accentColor: string) {
  // Use slightly lighter/different shades for the secondary rail to create depth
  // between primary (darkest) and secondary (slightly less dark/blurrier)
  return {
    railBg: isDark ? "rgba(14, 20, 36, 0.65)" : "rgba(248, 250, 252, 0.75)",
    railBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    headerLabel: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(15, 23, 42, 0.45)",
    headerTitle: isDark ? "#F8FAFC" : "#0F172A",
    dotDefault: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.2)",
    dotActive: accentColor,
    itemBgActive: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
    itemBgHover: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.03)",
    textActive: isDark ? "#F8FAFC" : "#0F172A",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    scrollbarTrack: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.05)",
    chevronColor: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(15, 23, 42, 0.3)",
    groupLabelColor: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(15, 23, 42, 0.4)",
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
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const label =
    language === "ar"
      ? item.nameAr || item.nameEn
      : item.nameEn || item.nameAr;

  // Detect workspace-switch hrefs (#workspace:<key>)
  const workspaceKey =
    item.href?.startsWith("#workspace:") ? item.href.slice("#workspace:".length) : null;
  const isWorkspaceSwitcher = !!workspaceKey;

  const isActive =
    !!item.href &&
    (pathname === item.href || pathname.startsWith(item.href + "/"));

  const hasChildren = item.children.length > 0;
  const isExpanded = expandedIds.includes(item.id);
  const hasActiveChild = item.children.some(
    (c) => !!c.href && (pathname === c.href || pathname.startsWith(c.href + "/"))
  );

  // Auto-expand if a child is active
  useEffect(() => {
    if (hasActiveChild && !isExpanded) {
      onToggle(item.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveChild]);

  const indent = depth * 14; // Increased indent for better hierarchy

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: `8px 10px 8px ${12 + indent}px`,
    borderRadius: 8,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    background: isActive
      ? palette.itemBgActive
      : hovered
      ? palette.itemBgHover
      : "transparent",
    userSelect: "none",
    position: "relative",
    overflow: "hidden",
  };

  const textOffset = hovered && !isActive ? "translateX(4px)" : "none";
  const rtlTextOffset = hovered && !isActive ? "translateX(-4px)" : "none";

  const dotStyle: React.CSSProperties = {
    width: 5,
    height: 5,
    borderRadius: "50%",
    flexShrink: 0,
    background: isActive ? palette.dotActive : palette.dotDefault,
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isActive ? "scale(1.4)" : "scale(1)",
    boxShadow: isActive ? `0 0 8px ${palette.dotActive}` : "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: isActive || hovered ? palette.textActive : palette.textMuted,
    flex: 1,
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    fontWeight: isActive ? 600 : 500,
    transform: language === "ar" ? rtlTextOffset : textOffset,
  };

  if (hasChildren) {
    return (
      <div className="mb-1">
        <div
          style={itemStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onToggle(item.id)}
        >
          <div style={dotStyle} />
          <span style={labelStyle}>{label}</span>
          <ChevronRight
            size={14}
            style={{
              color: palette.chevronColor,
              transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isExpanded || hasActiveChild ? (language === "ar" ? "rotate(-90deg)" : "rotate(90deg)") : (language === "ar" ? "rotate(180deg)" : "none"),
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateRows: isExpanded || hasActiveChild ? "1fr" : "0fr",
            transition: "grid-template-rows 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div style={{ paddingTop: 4, paddingBottom: 4 }}>
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
          </div>
        </div>
      </div>
    );
  }

  // Workspace-switcher items render as interactive divs (not links)
  if (isWorkspaceSwitcher) {
    return (
      <div className="mb-0.5">
        <div
          role="button"
          tabIndex={0}
          style={{
            ...itemStyle,
            cursor: "pointer",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => {
            switchWorkspace(workspaceKey!);
            onNavigate();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              switchWorkspace(workspaceKey!);
              onNavigate();
            }
          }}
        >
          <div style={dotStyle} />
          <span style={labelStyle}>{label}</span>
          <ArrowRightLeft
            size={12}
            style={{ color: palette.chevronColor, flexShrink: 0 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-0.5">
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
        
        {/* Active Item Accent Line */}
        {isActive && (
          <div 
            style={{
              position: "absolute",
              insetInlineStart: 0,
              top: "20%",
              bottom: "20%",
              width: 3,
              borderRadius: "0 4px 4px 0",
              background: palette.dotActive,
              boxShadow: `0 0 10px ${palette.dotActive}`,
            }}
          />
        )}
      </Link>
    </div>
  );
}

// ── Group Label ───────────────────────────────────────────────────────────────
function GroupLabel({ label, palette }: { label: string; palette: ReturnType<typeof usePalette> }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: palette.groupLabelColor,
        textTransform: "uppercase",
        letterSpacing: "1px",
        padding: "16px 12px 8px",
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
        padding: "12px",
        scrollbarWidth: "thin",
        scrollbarColor: `${palette.scrollbarTrack} transparent`,
      }}
      className="nexus-custom-scrollbar"
    >
      {menuItems.map((item) => {
        // Item has no href but has children → treat as group header
        const isGroup = item.children.length > 0 && !item.href;
        if (isGroup) {
          return (
            <div key={item.id} className="mb-2">
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
        padding: "24px 20px 20px",
        borderBottom: palette.railBorder,
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Subtle top gradient glow effect */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          insetInlineEnd: 0,
          height: "60px",
          background: `linear-gradient(180deg, ${palette.itemBgActive} 0%, transparent 100%)`,
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
      
      <div
        style={{
          fontSize: 10,
          color: palette.headerLabel,
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: 700,
          marginBottom: 8,
          transition: "color 300ms",
          position: "relative",
        }}
      >
        {contextLabel}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: palette.headerTitle,
          whiteSpace: "nowrap",
          letterSpacing: "-0.3px",
          position: "relative",
          textShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {title}
      </div>
    </div>
  );
}

// ── Secondary Rail ────────────────────────────────────────────────────────────
export function NexusSecondaryRail({ mobileOpen, onMobileClose, isCollapsed }: NexusSecondaryRailProps) {
  const { activeWorkspace, activeRootItem, isModuleMode, accentColor } = useWorkspace();
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  const isDark = resolvedTheme === "dark";
  const palette = usePalette(isDark, accentColor ?? (isDark ? "#7C6FD4" : "#6258c4"));

  // ── Context label ─────────────────────────────────────────────────────────
  const contextLabel = activeWorkspace
    ? (activeWorkspace.getLocalizedName(language) ?? activeWorkspace.workspaceKey.toUpperCase())
    : (isModuleMode ? "MODULE" : "PLATFORM");

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
    width: isCollapsed ? 0 : 240, // Slightly wider for a more premium feel
    opacity: isCollapsed ? 0 : 1,
    height: "100%",
    background: palette.railBg,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderInlineEnd: isCollapsed ? "none" : palette.railBorder,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    transition: "width 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1), background 200ms ease, border-inline-end-color 200ms ease",
    zIndex: 9,
    boxShadow: isDark ? "inset -1px 0 0 rgba(255,255,255,0.02)" : "inset -1px 0 0 rgba(0,0,0,0.01)",
  };

  const innerContainerStyle: React.CSSProperties = {
    width: 240, // Fixed width to prevent wrapping during collapse animation
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  const railContent = (
    <div style={innerContainerStyle}>
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
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside style={railStyle} className="hidden lg:flex lg:flex-col relative">
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
              WebkitBackdropFilter: "blur(8px)",
              transition: "opacity 300ms ease",
            }}
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 z-50 flex flex-col lg:hidden"
            style={{
              insetInlineStart: 64, // Logical property matching primary rail mobile width
              width: 260,
              background: palette.railBg,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderInlineEnd: palette.railBorder, // Logical property
              boxShadow: isDark ? "5px 0 30px rgba(0,0,0,0.5)" : "5px 0 30px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ width: 260, height: "100%", display: "flex", flexDirection: "column" }}>
              <RailHeader contextLabel={contextLabel} title={title} palette={palette} />
              <RailContent menuItems={menuItems} pathname={pathname} palette={palette} language={language} onNavigate={handleNavigate} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}

