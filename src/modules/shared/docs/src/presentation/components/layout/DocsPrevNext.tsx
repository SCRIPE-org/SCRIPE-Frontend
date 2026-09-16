"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface DocsPrevNextProps {
  prevSlug?: string;
  prevTitleKey?: string;
  nextSlug?: string;
  nextTitleKey?: string;
  basePath?: string;
}

/**
 * Presentation UI component rendering the docs prev next.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DocsPrevNext({
  prevSlug,
  prevTitleKey,
  nextSlug,
  nextTitleKey,
  basePath = "/docs",
}: DocsPrevNextProps) {
  const { t, direction } = useDocsI18n();
  const isRtl = direction === "rtl";

  if (!prevSlug && !nextSlug) return null;

  // Strip "commercial/" prefix from slug if basePath is /commercial
  // because commercial slugs are stored as "commercial/xxx" but route is /commercial/xxx
  const resolveHref = (slug: string) => {
    const cleanSlug = slug.replace(/^commercial\//, "");
    return `${basePath}/${cleanSlug}`;
  };

  // "Previous" points back toward the start of reading order, "next" points
  // forward toward its end — which physical arrow that means flips with
  // direction, unlike a plain "←"/"→" character (used before this fix),
  // which always renders pointing the same physical way regardless of `dir`.
  const PrevArrow = isRtl ? ChevronRight : ChevronLeft;
  const NextArrow = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="docs-prev-next">
      {prevSlug && prevTitleKey && (
        <Link
          href={resolveHref(prevSlug)}
          prefetch={false}
          className="docs-prev-next-link"
          data-type="prev"
        >
          <span className="docs-prev-next-label inline-flex items-center gap-1">
            <PrevArrow size={12} aria-hidden="true" />
            {t("common.previous")}
          </span>
          <span className="docs-prev-next-title">{t(prevTitleKey)}</span>
        </Link>
      )}
      {nextSlug && nextTitleKey && (
        <Link
          href={resolveHref(nextSlug)}
          prefetch={false}
          className="docs-prev-next-link"
          data-type="next"
        >
          <span className="docs-prev-next-label inline-flex items-center justify-end gap-1">
            {t("common.next")}
            <NextArrow size={12} aria-hidden="true" />
          </span>
          <span className="docs-prev-next-title">{t(nextTitleKey)}</span>
        </Link>
      )}
    </div>
  );
}
