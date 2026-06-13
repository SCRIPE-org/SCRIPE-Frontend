"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocCategory, DocNavItem } from "../../../domain/entities/DocCategory";
import { useState, useCallback } from "react";
import { docsIcons, ChevronRightIcon } from "./DocsIcons";

interface DocsMobileNavProps {
  categories: DocCategory[];
  activeSlug: string;
  isOpen: boolean;
  onClose: () => void;
  basePath?: string;
}

export function DocsMobileNav({
  categories,
  activeSlug,
  isOpen,
  onClose,
  basePath = "/docs",
}: DocsMobileNavProps) {
  const { t } = useDocsI18n();

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

  // Auto-expand sub-groups on navigation
  const [prevActiveSlug, setPrevActiveSlug] = useState(activeSlug);
  if (activeSlug !== prevActiveSlug) {
    setPrevActiveSlug(activeSlug);
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

  const toggleSubGroup = useCallback((subId: string) => {
    setSubExpanded((prev) => ({ ...prev, [subId]: !prev[subId] }));
  }, []);

  if (!isOpen) return null;

  const resolveHref = (slug: string) => {
    const cleanSlug = slug.replace(/^commercial\//, "");
    return `${basePath}/${cleanSlug}`;
  };

  const renderItem = (item: DocNavItem) => {
    // ─── Sub-group with children ─────────────────────────────
    if (item.children && item.children.length > 0) {
      const isSubOpen = subExpanded[item.id] ?? false;
      const subItemsHeight = isSubOpen ? `${item.children.length * 36}px` : "0px";

      return (
        <div key={item.id} className="docs-sidebar-subgroup">
          <button
            className="docs-sidebar-subgroup-btn"
            onClick={() => toggleSubGroup(item.id)}
            data-expanded={isSubOpen}
          >
            {item.icon ? docsIcons[item.icon]?.({ size: 16 }) || null : null}
            <span style={{ flex: 1 }}>{t(item.titleKey)}</span>
            <ChevronRightIcon />
          </button>
          <div className="docs-sidebar-subgroup-items" style={{ maxHeight: subItemsHeight }}>
            {item.children.map((child) => {
              if (!child.slug) return null;
              const isActive = child.slug === activeSlug;
              return (
                <Link
                  key={child.id}
                  href={resolveHref(child.slug)}
                  className="docs-sidebar-item docs-sidebar-item--nested"
                  data-active={isActive}
                  onClick={onClose}
                >
                  {t(child.titleKey)}
                </Link>
              );
            })}
          </div>
        </div>
      );
    }

    // ─── Regular leaf item ────────────────────────────────────
    if (!item.slug) return null;
    const isActive = item.slug === activeSlug;
    return (
      <Link
        key={item.id}
        href={resolveHref(item.slug)}
        className="docs-sidebar-item"
        data-active={isActive}
        onClick={onClose}
      >
        {t(item.titleKey)}
      </Link>
    );
  };

  return (
    <>
      <div className="docs-mobile-overlay" onClick={onClose} />
      <nav className="docs-mobile-nav">
        <button className="docs-mobile-close" onClick={onClose} aria-label={t("common.closeMenu")}>
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div style={{ paddingTop: "2rem" }}>
          {categories.map((cat) => (
            <div key={cat.id} className="docs-sidebar-category">
              <div className="docs-sidebar-category-btn" style={{ cursor: "default" }}>
                <span>{t(cat.titleKey)}</span>
              </div>
              <div className="docs-sidebar-items" style={{ maxHeight: "9999px" }}>
                {cat.items.map(renderItem)}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
