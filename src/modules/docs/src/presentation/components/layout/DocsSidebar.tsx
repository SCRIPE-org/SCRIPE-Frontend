"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocCategory, DocNavItem } from "../../../domain/entities/DocCategory";
import { useState, useCallback } from "react";

// ─── Icons ──────────────────────────────────────────────────────
const icons: Record<string, React.ReactNode> = {
  rocket: (
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
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  "book-open": (
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  layout: (
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
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="9" x2="9" y1="21" y2="9" />
    </svg>
  ),
  star: (
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  monitor: (
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
  shield: (
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  code: (
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  server: (
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
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  ),
};

const ChevronRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

interface DocsSidebarProps {
  categories: DocCategory[];
  activeSlug: string;
}

export function DocsSidebar({ categories, activeSlug }: DocsSidebarProps) {
  const { t } = useDocsI18n();

  // Track which categories are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      // Auto-expand category containing active slug
      const hasActive = cat.getAllSlugs().includes(activeSlug);
      initial[cat.id] = hasActive;
    }
    return initial;
  });

  const toggleCategory = useCallback((catId: string) => {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }, []);

  const renderItem = (item: DocNavItem) => {
    if (!item.slug) return null;
    const isActive = item.slug === activeSlug;

    return (
      <Link
        key={item.id}
        href={`/docs/${item.slug}`}
        className="docs-sidebar-item"
        data-active={isActive}
      >
        {t(item.titleKey)}
      </Link>
    );
  };

  return (
    <aside className="docs-sidebar">
      {categories.map((cat) => (
        <div key={cat.id} className="docs-sidebar-category">
          <button
            className="docs-sidebar-category-btn"
            onClick={() => toggleCategory(cat.id)}
            data-expanded={expanded[cat.id]}
          >
            {icons[cat.icon] || null}
            <span style={{ flex: 1 }}>{t(cat.titleKey)}</span>
            <ChevronRight />
          </button>

          <div
            className="docs-sidebar-items"
            style={{
              maxHeight: expanded[cat.id] ? `${cat.items.length * 36}px` : "0px",
            }}
          >
            {cat.items.map(renderItem)}
          </div>
        </div>
      ))}
    </aside>
  );
}
