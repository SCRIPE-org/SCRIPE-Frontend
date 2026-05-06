"use client";

/**
 * NexusSecondaryRail
 *
 * Matches the Nexus ERP reference design exactly:
 *  - 210px dark (#0C0F1C) sidebar
 *  - Header: tiny context label + bold section title
 *  - Nav items: dot + label, active = subtle white bg
 *  - Group labels (uppercase, very faint)
 *  - Scrollable nav area
 */

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { MenuItem } from "@core/domain/entities/Navigation";

interface NexusSecondaryRailProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function isPathActive(href: string | null, pathname: string): boolean {
  if (!href) return false;
  if (href === "/" || href === "") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasActiveDescendant(item: MenuItem, pathname: string): boolean {
  if (isPathActive(item.href, pathname)) return true;
  return item.children.some((child) => hasActiveDescendant(child, pathname));
}

// ── Nav Item ─────────────────────────────────────────────────────────────────
interface NavItemProps {
  item: MenuItem;
  depth?: number;
  pathname: string;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onNavigate: () => void;
  accentColor: string;
  language: string;
}

function NavItem({
  item,
  depth = 0,
  pathname,
  expandedIds,
  onToggle,
  onNavigate,
  accentColor,
  language,
}: NavItemProps) {
  const hasChildren = item.children.length > 0;
  const isActive = isPathActive(item.href, pathname);
  const hasActiveChild = hasChildren && hasActiveDescendant(item, pathname);
  const isExpanded = expandedIds.includes(item.id);
  const label = item.getLocalizedName(language);

  const [hovered, setHovered] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: depth > 0 ? "6px 8px 6px 20px" : "6px 8px",
    borderRadius: 7,
    cursor: "pointer",
    transition: "background 130ms ease",
    marginBottom: 1,
    whiteSpace: "nowrap",
    textDecoration: "none",
    background:
      isActive
        ? "rgba(255,255,255,0.07)"
        : hovered
        ? "rgba(255,255,255,0.04)"
        : "transparent",
  };

  const dotStyle: React.CSSProperties = {
    width: 4,
    height: 4,
    borderRadius: "50%",
    flexShrink: 0,
    background: isActive ? accentColor : "#2F3C55",
    transition: "background 130ms",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color:
      isActive || hovered ? "#D0DCEF" : "#8A9BBF",
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
              color: "#2F3C55",
              transition: "transform 150ms",
              transform: isExpanded || hasActiveChild ? "rotate(90deg)" : "none",
            }}
          >
            ›
          </span>
        </div>
        {(isExpanded || hasActiveChild) && (
          <div style={{ paddingLeft: 12 }}>
            {item.children.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                depth={depth + 1}
                pathname={pathname}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onNavigate={onNavigate}
                accentColor={accentColor}
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
function GroupLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 600,
        color: "#2F3C55",
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

// ── Secondary Rail Content ────────────────────────────────────────────────────
function RailContent({
  menuItems,
  pathname,
  accentColor,
  language,
  onNavigate,
}: {
  menuItems: MenuItem[];
  pathname: string;
  accentColor: string;
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
        scrollbarColor: "#263050 transparent",
      }}
    >
      {menuItems.map((item, idx) => {
        // If item has no href and children, treat it as a group header
        const isGroup = item.children.length > 0 && !item.href;
        if (isGroup) {
          return (
            <div key={item.id}>
              <GroupLabel label={item.getLocalizedName(language)} />
              {item.children.map((child) => (
                <NavItem
                  key={child.id}
                  item={child}
                  depth={0}
                  pathname={pathname}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  onNavigate={onNavigate}
                  accentColor={accentColor}
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
            accentColor={accentColor}
            language={language}
          />
        );
      })}
    </div>
  );
}

// ── Secondary Rail ────────────────────────────────────────────────────────────
export function NexusSecondaryRail({ mobileOpen, onMobileClose }: NexusSecondaryRailProps) {
  const { activeWorkspace, accentColor } = useWorkspace();
  const { language } = useI18n();
  const pathname = usePathname();

  const workspaceName = activeWorkspace?.getLocalizedName(language) ?? "Workspace";
  const contextLabel = "CONTROL PLANE"; // workspace context label
  const menuItems: MenuItem[] = activeWorkspace?.menuItems ?? [];
  const resolvedAccent = accentColor ?? "#534AB7";

  const handleNavigate = useCallback(() => onMobileClose?.(), [onMobileClose]);

  const railStyle: React.CSSProperties = {
    width: 210,
    height: "100vh",
    background: "#0C0F1C",
    borderRight: "1px solid #111626",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    transition: "width 280ms cubic-bezier(0.4,0,0.2,1)",
    zIndex: 9,
  };

  return (
    <>
      {/* Desktop */}
      <aside style={railStyle} className="hidden lg:flex">
        {/* Header */}
        <div
          style={{
            padding: "16px 14px 12px",
            borderBottom: "1px solid #111626",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: accentColor ?? "#AFA9EC",
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
              color: "#D0DCEF",
              whiteSpace: "nowrap",
              letterSpacing: "-0.2px",
            }}
          >
            {workspaceName}
          </div>
        </div>

        {/* Nav */}
        <RailContent
          menuItems={menuItems}
          pathname={pathname}
          accentColor={resolvedAccent}
          language={language}
          onNavigate={handleNavigate}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(8,11,21,0.6)", backdropFilter: "blur(8px)" }}
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 z-50 flex flex-col lg:hidden"
            style={{
              left: 56,
              width: 210,
              background: "#0C0F1C",
              borderRight: "1px solid #111626",
            }}
          >
            <div
              style={{
                padding: "16px 14px 12px",
                borderBottom: "1px solid #111626",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: resolvedAccent,
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {contextLabel}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#D0DCEF",
                  letterSpacing: "-0.2px",
                }}
              >
                {workspaceName}
              </div>
            </div>
            <RailContent
              menuItems={menuItems}
              pathname={pathname}
              accentColor={resolvedAccent}
              language={language}
              onNavigate={handleNavigate}
            />
          </aside>
        </>
      )}
    </>
  );
}
