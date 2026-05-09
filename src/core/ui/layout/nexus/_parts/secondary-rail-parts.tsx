"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRightLeft } from "lucide-react";
import type { MenuItem } from "@core/navigation";
import { useWorkspaceTransitionContext } from "../nexus-layout";
import { useNexusPalette } from "./nexus-theme-utils";

export function cleanPath(p: string | undefined | null): string {
  if (!p) return "";
  const cleaned = p.split("?")[0].split("#")[0];
  // Preserve the root "/" — only strip trailing slash from longer paths
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    return cleaned.slice(0, -1);
  }
  return cleaned;
}

export interface NavItemProps {
  item: MenuItem;
  depth?: number;
  pathname: string;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onNavigate: () => void;
  palette: ReturnType<typeof useNexusPalette>;
  language: string;
  activeHref: string;
  switchWorkspace: (key: string) => void;
}

export function NavItem({
  item,
  depth = 0,
  pathname,
  expandedIds,
  onToggle,
  onNavigate,
  palette,
  language,
  activeHref,
  switchWorkspace,
}: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  const label = language === "ar" ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;

  // Detect workspace-switch hrefs (#workspace:<key>)
  const workspaceKey = item.href?.startsWith("#workspace:")
    ? item.href.slice("#workspace:".length)
    : null;
  const isWorkspaceSwitcher = !!workspaceKey;

  const isActive = !!item.href && cleanPath(item.href) === cleanPath(activeHref);

  const hasChildren = item.children.length > 0;
  const isExpanded = expandedIds.includes(item.id);

  const hasActiveChild = React.useMemo(() => {
    if (!activeHref) return false;
    const cleanedActive = cleanPath(activeHref);
    const check = (node: MenuItem): boolean => {
      if (cleanPath(node.href) === cleanedActive) return true;
      if (node.children) return node.children.some(check);
      return false;
    };
    return item.children.some(check);
  }, [item.children, activeHref]);

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
    background: isActive ? palette.itemBgActive : hovered ? palette.itemBgHover : "transparent",
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
              transform:
                isExpanded || hasActiveChild
                  ? language === "ar"
                    ? "rotate(-90deg)"
                    : "rotate(90deg)"
                  : language === "ar"
                    ? "rotate(180deg)"
                    : "none",
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
                  activeHref={activeHref}
                  switchWorkspace={switchWorkspace}
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
          <ArrowRightLeft size={12} style={{ color: palette.chevronColor, flexShrink: 0 }} />
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

export function GroupLabel({
  label,
  palette,
}: {
  label: string;
  palette: ReturnType<typeof useNexusPalette>;
}) {
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

export function RailContent({
  menuItems,
  pathname,
  palette,
  language,
  onNavigate,
}: {
  menuItems: MenuItem[];
  pathname: string;
  palette: ReturnType<typeof useNexusPalette>;
  language: string;
  onNavigate: () => void;
}) {
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const handleToggle = useCallback(
    (id: string) =>
      setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])),
    []
  );

  // Find the most specific active href
  const activeHref = React.useMemo(() => {
    let bestMatch = "";
    const cleanedPathname = cleanPath(pathname);
    const traverse = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.href) {
          const itemHref = cleanPath(item.href);
          if (cleanedPathname === itemHref) {
            bestMatch = item.href;
            return; // exact match — stop immediately
          }
          // Prefix match only for non-root paths (avoid "/" matching everything)
          if (
            itemHref !== "/" &&
            cleanedPathname.startsWith(itemHref + "/") &&
            itemHref.length > cleanPath(bestMatch).length
          ) {
            bestMatch = item.href;
          }
        }
        if (item.children?.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(menuItems);
    return bestMatch;
  }, [menuItems, pathname]);

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
                  activeHref={activeHref}
                  switchWorkspace={switchWorkspace}
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
            activeHref={activeHref}
            switchWorkspace={switchWorkspace}
          />
        );
      })}
    </div>
  );
}

export function RailHeader({
  contextLabel,
  title,
  palette,
}: {
  contextLabel: string;
  title: string;
  palette: ReturnType<typeof useNexusPalette>;
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
