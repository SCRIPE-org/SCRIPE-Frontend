// UI-EXCEPTION: compact studio layout
"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocCategory, DocNavItem } from "../../../domain/entities/DocCategory";
import { useState, useCallback, useMemo } from "react";
import { docsIcons } from "./DocsSidebar";

// ─── Category color palette ──────────────────────────────────────
const categoryColors: Record<string, string> = {
  "commercial-why-scripe": "var(--commercial-accent-blue)",
  "commercial-platform": "var(--commercial-accent-purple)",
  "commercial-enterprise": "var(--commercial-accent-teal)",
  "commercial-security": "var(--commercial-accent-red)",
  "commercial-technical": "var(--commercial-accent-orange)",
  "commercial-developer": "var(--commercial-accent-cyan)",
  "commercial-integrations": "var(--commercial-accent-green)",
  "commercial-pricing": "var(--commercial-accent-amber)",
  "commercial-support": "var(--commercial-accent-indigo)",
  "commercial-resources": "var(--commercial-accent-pink)",
};

interface CommercialSidebarProps {
  categories: DocCategory[];
  activeSlug: string;
}

/**
 * Presentation UI component rendering the commercial sidebar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CommercialSidebar({ categories, activeSlug }: CommercialSidebarProps) {
  const { t } = useDocsI18n();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      const hasActive = cat.getAllSlugs().includes(activeSlug);
      initial[cat.id] = hasActive;
    }
    return initial;
  });

  // Track which sub-groups are expanded
  const [subExpanded, setSubExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      for (const item of cat.items) {
        if (item.children) {
          const childSlugs = item.children.map((c) => c.slug).filter(Boolean);
          const hasActive = childSlugs.includes(activeSlug);
          initial[item.id] = hasActive;
        }
      }
    }
    return initial;
  });

  // Auto-expand category and sub-groups on navigation
  const [prevActiveSlug, setPrevActiveSlug] = useState(activeSlug);
  if (activeSlug !== prevActiveSlug) {
    setPrevActiveSlug(activeSlug);
    setExpanded((prev) => {
      const next = { ...prev };
      for (const cat of categories) {
        if (cat.getAllSlugs().includes(activeSlug)) {
          next[cat.id] = true;
        }
      }
      return next;
    });
    setSubExpanded((prev) => {
      const next = { ...prev };
      for (const cat of categories) {
        for (const item of cat.items) {
          if (item.children) {
            const childSlugs = item.children.map((c) => c.slug).filter(Boolean);
            if (childSlugs.includes(activeSlug)) {
              next[item.id] = true;
            }
          }
        }
      }
      return next;
    });
  }

  const toggleCategory = useCallback((catId: string) => {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }, []);

  const toggleSubGroup = useCallback((subId: string) => {
    setSubExpanded((prev) => ({ ...prev, [subId]: !prev[subId] }));
  }, []);

  // Total pages count
  const totalPages = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories]
  );

  const renderItem = (item: DocNavItem, color: string) => {
    // ─── Sub-group with children ─────────────────────────────
    if (item.children && item.children.length > 0) {
      const isSubOpen = subExpanded[item.id] ?? false;
      return (
        <div key={item.id} className="commercial-sidebar-subgroup">
          <button
            className="commercial-sidebar-subgroup-btn"
            onClick={() => toggleSubGroup(item.id)}
            data-expanded={isSubOpen}
            style={{ "--cat-accent": color } as React.CSSProperties}
          >
            <span className="commercial-sidebar-subgroup-icon">
              {item.icon ? docsIcons[item.icon]?.({ size: 18 }) || null : null}
            </span>
            <span className="commercial-sidebar-subgroup-title">{t(item.titleKey)}</span>
            <svg
              className="commercial-sidebar-chevron"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isSubOpen && (
            <div className="commercial-sidebar-subgroup-items">
              {item.children.map((child) => {
                if (!child.slug) return null;
                const isActive = child.slug === activeSlug;
                const cleanSlug = child.slug.replace(/^commercial\//, "");
                return (
                  <Link
                    key={child.id}
                    href={`/commercial/${cleanSlug}`}
                    className={"commercial-sidebar-item " + "commercial-sidebar-item--nested"}
                    data-active={isActive}
                    style={
                      isActive
                        ? ({
                            "--item-accent": color,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <span className="commercial-sidebar-item-dot" />
                    <span className="commercial-sidebar-item-text">{t(child.titleKey)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // ─── Regular leaf item ────────────────────────────────────
    if (!item.slug) return null;
    const isActive = item.slug === activeSlug;
    // Strip "commercial/" prefix since route is /commercial/{slug}
    const cleanSlug = item.slug.replace(/^commercial\//, "");

    return (
      <Link
        key={item.id}
        href={`/commercial/${cleanSlug}`}
        className="commercial-sidebar-item"
        data-active={isActive}
        style={isActive ? ({ "--item-accent": color } as React.CSSProperties) : undefined}
      >
        <span className="commercial-sidebar-item-dot" />
        <span className="commercial-sidebar-item-text">{t(item.titleKey)}</span>
      </Link>
    );
  };

  return (
    <aside className="commercial-sidebar">
      {/* Sidebar header */}
      <div className="commercial-sidebar-header">
        <span className="commercial-sidebar-header-label">{t("common.documentation")}</span>
        <span className="commercial-sidebar-header-count">
          {t("common.pagesCount", { count: totalPages })}
        </span>
      </div>

      {/* Categories */}
      <nav className="commercial-sidebar-nav">
        {categories.map((cat) => {
          const color = categoryColors[cat.id] || "var(--commercial-accent-blue)";
          const isExpanded = expanded[cat.id] ?? false;
          const hasActiveItem = cat.getAllSlugs().includes(activeSlug);

          return (
            <div
              key={cat.id}
              className="commercial-sidebar-category"
              data-expanded={isExpanded}
              data-has-active={hasActiveItem}
            >
              <button
                className="commercial-sidebar-category-btn"
                onClick={() => toggleCategory(cat.id)}
                style={{ "--cat-accent": color } as React.CSSProperties}
              >
                <span className="commercial-sidebar-category-icon">
                  {cat.icon
                    ? docsIcons[cat.icon]?.({ size: 18 }) || null
                    : docsIcons.book({ size: 18 })}
                </span>
                <span className="commercial-sidebar-category-title">{t(cat.titleKey)}</span>
                <span className="commercial-sidebar-category-count">
                  {cat.items.reduce(
                    (sum, item) => sum + (item.children ? item.children.length : 1),
                    0
                  )}
                </span>
                <svg
                  className="commercial-sidebar-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="commercial-sidebar-items">
                  {cat.items.map((item) => renderItem(item, color))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* CTA */}
      <div className="commercial-sidebar-cta">
        <a href="mailto:sales@scripe.org" className="commercial-sidebar-cta-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 " + "1 2-2h14a2 2 0 0 1 2 2z"} />
          </svg>
          {t("common.bookDemo")}
        </a>
      </div>
    </aside>
  );
}
