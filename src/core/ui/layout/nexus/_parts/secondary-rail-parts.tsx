"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRightLeft } from "lucide-react";
import type { MenuItem } from "@core/navigation";
import { cn } from "@core/common/utils";
import { useWorkspaceTransitionContext } from "../nexus-layout";

// All colour reads the --nx- token layer — theme resolves in CSS, so these
// parts never see isDark or a JS palette object.
// Active leaf = accent text + inline-start edge light. NO glow here: the
// primary rail's active root item owns the one glow per screen.
// One ring token for the whole product — --nx-focus already carries the inset
// accent edge these rows want, so the rail no longer draws its own.
const FOCUS_RING = "focus-visible:outline-none focus-visible:shadow-nx-focus";

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
    paddingBlock: 8,
    paddingInlineStart: 12 + indent,
    paddingInlineEnd: 10,
    borderRadius: "var(--nx-radius-control)",
    cursor: "pointer",
    textDecoration: "none",
    background: isActive
      ? "var(--nx-accent-wash, hsl(var(--primary) / 0.1))"
      : hovered
        ? "var(--nx-raised, hsl(var(--muted)))"
        : "transparent",
    userSelect: "none",
    position: "relative",
    overflow: "hidden",
  };

  // Row colour transitions live in classes so motion-reduce can strip them.
  const rowClassName = cn("transition-colors duration-nx-micro motion-reduce:transition-none");

  const dotStyle: React.CSSProperties = {
    width: 5,
    height: 5,
    borderRadius: "50%",
    flexShrink: 0,
    background: isActive
      ? "var(--nx-accent, hsl(var(--primary)))"
      : "var(--nx-line-hi, hsl(var(--border)))",
    transform: isActive ? "scale(1.4)" : "scale(1)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: isActive
      ? "var(--nx-accent, hsl(var(--primary)))"
      : hovered
        ? "var(--nx-ink, hsl(var(--foreground)))"
        : "var(--nx-ink-2, hsl(var(--muted-foreground)))",
    flex: 1,
    fontWeight: isActive ? 600 : 500,
  };

  if (hasChildren) {
    return (
      <div className="mb-1">
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded || hasActiveChild}
          style={itemStyle}
          className={cn(rowClassName, FOCUS_RING)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onToggle(item.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle(item.id);
            }
          }}
        >
          <div
            style={dotStyle}
            className="transition-[background-color,transform] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
          />
          <span
            style={labelStyle}
            className="transition-colors duration-nx-micro motion-reduce:transition-none"
          >
            {label}
          </span>
          <ChevronRight
            size={14}
            aria-hidden="true"
            className="transition-transform duration-nx-standard ease-nx-enter motion-reduce:transition-none"
            style={{
              color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
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
          className="grid transition-[grid-template-rows] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
          style={{
            gridTemplateRows: isExpanded || hasActiveChild ? "1fr" : "0fr",
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
          className={cn(rowClassName, FOCUS_RING)}
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
          <div
            style={dotStyle}
            className="transition-[background-color,transform] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
          />
          <span
            style={labelStyle}
            className="transition-colors duration-nx-micro motion-reduce:transition-none"
          >
            {label}
          </span>
          <ArrowRightLeft
            size={12}
            aria-hidden="true"
            style={{ color: "var(--nx-ink-3, hsl(var(--muted-foreground)))", flexShrink: 0 }}
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
        className={cn(rowClassName, FOCUS_RING)}
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          style={dotStyle}
          className="transition-[background-color,transform] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
        />
        <span
          style={labelStyle}
          className="transition-colors duration-nx-micro motion-reduce:transition-none"
        >
          {label}
        </span>

        {/* Active leaf edge light — accent bar at the inline start, no glow */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              insetInlineStart: 0,
              top: "20%",
              bottom: "20%",
              width: 3,
              borderStartStartRadius: 0,
              borderEndStartRadius: 0,
              borderStartEndRadius: "var(--nx-radius-sm)",
              borderEndEndRadius: "var(--nx-radius-sm)",
              background: "var(--nx-accent, hsl(var(--primary)))",
            }}
          />
        )}
      </Link>
    </div>
  );
}

export function GroupLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
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
  language,
  onNavigate,
}: {
  menuItems: MenuItem[];
  pathname: string;
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
        scrollbarColor: "var(--nx-line, hsl(var(--border))) transparent",
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
            language={language}
            activeHref={activeHref}
            switchWorkspace={switchWorkspace}
          />
        );
      })}
    </div>
  );
}

export function RailHeader({ contextLabel, title }: { contextLabel: string; title: string }) {
  return (
    <div
      style={{
        padding: "24px 20px 20px",
        borderBottom: "1px solid var(--nx-line, hsl(var(--border)))",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Subtle accent wash bleeding from the top edge — a wash, not a glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          insetInlineEnd: 0,
          height: "60px",
          background:
            "linear-gradient(180deg, var(--nx-accent-wash, hsl(var(--primary) / 0.1)) 0%, transparent 100%)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontSize: 10,
          color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: 700,
          marginBottom: 8,
          transition: "color var(--nx-t-standard, 200ms)",
          position: "relative",
        }}
      >
        {contextLabel}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--nx-ink, hsl(var(--foreground)))",
          whiteSpace: "nowrap",
          letterSpacing: "-0.3px",
          position: "relative",
        }}
      >
        {title}
      </div>
    </div>
  );
}
