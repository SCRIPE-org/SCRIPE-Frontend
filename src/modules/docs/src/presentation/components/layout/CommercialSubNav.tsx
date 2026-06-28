"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocCategory } from "../../../domain/entities/DocCategory";

interface CommercialSubNavProps {
  categories: DocCategory[];
  activeSlug: string;
  pageTitleKey: string;
  categoryInfo: { id: string; titleKey: string };
}

/**
 * Premium breadcrumb and horizontal sub-navigation tabs component.
 * Displays which commercial category/page the user is currently on,
 * and allows clicking directly to sibling pages inside the active category.
 */
export function CommercialSubNav({
  categories,
  activeSlug,
  pageTitleKey,
  categoryInfo,
}: CommercialSubNavProps) {
  const { t } = useDocsI18n();

  // Find active category
  const activeCategory = categories.find((cat) => cat.id === categoryInfo.id);
  if (!activeCategory) return null;

  const siblingPages = activeCategory.items;
  if (siblingPages.length <= 1) return null; // No need for sub-nav if it's a standalone page

  return (
    <div className="com-subnav-sticky">
      <div className="com-subnav-inner">
        {/* Breadcrumb Trail */}
        <div className="com-subnav-breadcrumb">
          <span className="com-subnav-cat-title">{t(activeCategory.titleKey)}</span>
          <span className="com-subnav-separator">/</span>
          <span className="com-subnav-page-title">{t(pageTitleKey)}</span>
        </div>

        {/* Sibling Pages Scrollable Pills */}
        <div className="com-subnav-links-scroll">
          {siblingPages.map((item) => {
            if (!item.slug) return null;
            const isActive = item.slug === activeSlug;
            const href = `/commercial/${item.slug.replace(/^commercial\//, "")}`;

            return (
              <Link
                key={item.id}
                href={href}
                className={`com-subnav-link ${isActive ? "active" : ""}`}
              >
                {t(item.titleKey)}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
