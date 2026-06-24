"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface DocsBreadcrumbProps {
  slug: string;
  categoryTitleKey: string;
  pageTitleKey: string;
}

/**
 * Presentation UI component rendering the docs breadcrumb.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DocsBreadcrumb({ slug, categoryTitleKey, pageTitleKey }: DocsBreadcrumbProps) {
  const { t } = useDocsI18n();

  const category = slug.split("/")[0];

  return (
    <nav className="docs-breadcrumb" aria-label="Breadcrumb">
      <Link href="/docs">{t("common.home")}</Link>
      <span className="docs-breadcrumb-separator" aria-hidden>
        ›
      </span>
      <Link href={`/docs/${category}`}>{t(categoryTitleKey)}</Link>
      <span className="docs-breadcrumb-separator" aria-hidden>
        ›
      </span>
      <span className="docs-breadcrumb-current">{t(pageTitleKey)}</span>
    </nav>
  );
}
