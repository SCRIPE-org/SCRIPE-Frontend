"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface DocsBreadcrumbProps {
  slug?: string;
  categoryTitleKey: string;
  pageTitleKey: string;
}

/**
 * Presentation UI component rendering the docs breadcrumb.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DocsBreadcrumb({ categoryTitleKey, pageTitleKey }: DocsBreadcrumbProps) {
  const { t } = useDocsI18n();

  return (
    <nav className="docs-breadcrumb" aria-label={t("common.breadcrumbNav")}>
      <Link href="/docs" prefetch={false}>
        {t("common.home")}
      </Link>
      <span className="docs-breadcrumb-separator" aria-hidden="true">
        ›
      </span>
      <span>{t(categoryTitleKey)}</span>
      <span className="docs-breadcrumb-separator" aria-hidden="true">
        ›
      </span>
      <span className="docs-breadcrumb-current" aria-current="page">
        {t(pageTitleKey)}
      </span>
    </nav>
  );
}
