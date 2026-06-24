"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface DocsBreadcrumbProps {
  slug: string;
  categoryTitleKey: string;
  pageTitleKey: string;
}

/**
 * React presentation component representing the docs breadcrumb UI element.
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
