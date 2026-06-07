"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocCategory, DocNavItem } from "../../../domain/entities/DocCategory";
import { useState, useCallback, useMemo } from "react";

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

// ─── Icons (reuse from DocsSidebar) ──────────────────────────────
const icons: Record<string, React.ReactNode> = {
  rocket: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  layers: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  ),
  building: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  ),
  shield: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  cpu: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  ),
  terminal: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  ),
  link: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "bar-chart": (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
  book: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  ),
  package: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  key: (
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
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
};

// ─── Props ───────────────────────────────────────────────────────
interface CommercialSidebarProps {
  categories: DocCategory[];
  activeSlug: string;
}

// ─── Component ───────────────────────────────────────────────────
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
              {item.icon ? icons[item.icon] || null : null}
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
                    className="commercial-sidebar-item commercial-sidebar-item--nested"
                    data-active={isActive}
                    style={
                      isActive ? ({ "--item-accent": color } as React.CSSProperties) : undefined
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
        <span className="commercial-sidebar-header-label">Documentation</span>
        <span className="commercial-sidebar-header-count">{totalPages} pages</span>
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
                  {icons[cat.icon] || icons.book}
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Book a Demo
        </a>
      </div>
    </aside>
  );
}
