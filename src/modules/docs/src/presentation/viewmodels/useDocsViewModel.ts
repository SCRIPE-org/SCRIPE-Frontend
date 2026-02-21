"use client";

import { useMemo, useCallback } from "react";
import { docsContainer } from "../../../di";
import { useDocsI18n } from "../providers/DocsI18nProvider";
import type { DocCategory } from "../../domain/entities/DocCategory";
import type { HeadingSection } from "../../domain/entities/DocSection";
import type { SearchResult } from "../../domain/interfaces/IDocsRepository";
import type { DocPage } from "../../domain/entities/DocPage";

/**
 * Orchestrator ViewModel for a single docs page.
 * Composes all data needed by the active view.
 * Filters navigation by mode (technical vs commercial).
 */
export function useDocsViewModel(slug: string, mode: "technical" | "commercial" = "technical") {
  const repo = docsContainer.docsRepository;

  // ─── Page Data ──────────────────────────────────────────────
  const page: DocPage | undefined = useMemo(() => repo.getPage(slug), [slug, repo]);

  // ─── Navigation ─────────────────────────────────────────────
  const allCategories: DocCategory[] = useMemo(() => repo.getNavigation(), [repo]);

  // Filter categories by mode: commercial categories use 'commercial-' prefix
  const categories: DocCategory[] = useMemo(() => {
    return allCategories.filter((cat) => {
      const isCommercial = cat.id.startsWith("commercial-");
      return mode === "commercial" ? isCommercial : !isCommercial;
    });
  }, [allCategories, mode]);

  // ─── Category info for breadcrumb ───────────────────────────
  const categoryInfo = useMemo(() => {
    for (const cat of categories) {
      if (cat.findBySlug(slug)) {
        return { id: cat.id, titleKey: cat.titleKey };
      }
    }
    // Fallback: check all categories (cross-mode)
    for (const cat of allCategories) {
      if (cat.findBySlug(slug)) {
        return { id: cat.id, titleKey: cat.titleKey };
      }
    }
    return { id: "", titleKey: "" };
  }, [categories, allCategories, slug]);

  // ─── Headings for TOC ──────────────────────────────────────
  const headings: HeadingSection[] = useMemo(() => {
    return page?.getHeadings() ?? [];
  }, [page]);

  const headingIds: string[] = useMemo(() => {
    return headings.map((h) => h.id || h.titleKey.split(".").pop() || "");
  }, [headings]);

  // ─── Prev / Next ───────────────────────────────────────────
  const prevSlug = useMemo(() => repo.getPrevSlug(slug), [slug, repo]);
  const nextSlug = useMemo(() => repo.getNextSlug(slug), [slug, repo]);

  const prevPage = useMemo(() => (prevSlug ? repo.getPage(prevSlug) : undefined), [prevSlug, repo]);
  const nextPage = useMemo(() => (nextSlug ? repo.getPage(nextSlug) : undefined), [nextSlug, repo]);

  // ─── Search ────────────────────────────────────────────────
  const { t } = useDocsI18n();
  const search = useCallback(
    (query: string): SearchResult[] => {
      return repo.search(query, mode, t);
    },
    [repo, mode, t]
  );

  return {
    page,
    categories,
    categoryInfo,
    headings,
    headingIds,
    prevSlug,
    nextSlug,
    prevTitleKey: prevPage?.titleKey,
    nextTitleKey: nextPage?.titleKey,
    search,
    isNotFound: !page,
  };
}
