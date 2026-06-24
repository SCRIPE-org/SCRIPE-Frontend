"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface DocsPrevNextProps {
  prevSlug?: string;
  prevTitleKey?: string;
  nextSlug?: string;
  nextTitleKey?: string;
  basePath?: string;
}

/**
 * React presentation component representing the docs prev next UI element.
 */
export function DocsPrevNext({
  prevSlug,
  prevTitleKey,
  nextSlug,
  nextTitleKey,
  basePath = "/docs",
}: DocsPrevNextProps) {
  const { t } = useDocsI18n();

  if (!prevSlug && !nextSlug) return null;

  // Strip "commercial/" prefix from slug if basePath is /commercial
  // because commercial slugs are stored as "commercial/xxx" but route is /commercial/xxx
  const resolveHref = (slug: string) => {
    const cleanSlug = slug.replace(/^commercial\//, "");
    return `${basePath}/${cleanSlug}`;
  };

  return (
    <div className="docs-prev-next">
      {prevSlug && prevTitleKey && (
        <Link href={resolveHref(prevSlug)} className="docs-prev-next-link" data-type="prev">
          <span className="docs-prev-next-label">← {t("common.previous")}</span>
          <span className="docs-prev-next-title">{t(prevTitleKey)}</span>
        </Link>
      )}
      {nextSlug && nextTitleKey && (
        <Link href={resolveHref(nextSlug)} className="docs-prev-next-link" data-type="next">
          <span className="docs-prev-next-label">{t("common.next")} →</span>
          <span className="docs-prev-next-title">{t(nextTitleKey)}</span>
        </Link>
      )}
    </div>
  );
}
