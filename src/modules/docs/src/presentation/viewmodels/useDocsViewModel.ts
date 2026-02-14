"use client";

import { useMemo, useCallback } from "react";
import { docsContainer } from "../../../di";
import type { DocCategory } from "../../domain/entities/DocCategory";
import type { HeadingSection } from "../../domain/entities/DocSection";
import type { SearchResult } from "../../domain/interfaces/IDocsRepository";
import type { DocPage } from "../../domain/entities/DocPage";

/**
 * Orchestrator ViewModel for a single docs page.
 * Composes all data needed by DocsPageView.
 */
export function useDocsViewModel(slug: string) {
  const repo = docsContainer.docsRepository;

  // ─── Page Data ──────────────────────────────────────────────
  const page: DocPage | undefined = useMemo(() => repo.getPage(slug), [slug, repo]);

  // ─── Navigation ─────────────────────────────────────────────
  const categories: DocCategory[] = useMemo(() => repo.getNavigation(), [repo]);

  // ─── Category info for breadcrumb ───────────────────────────
  const categoryInfo = useMemo(() => {
    for (const cat of categories) {
      if (cat.findBySlug(slug)) {
        return { id: cat.id, titleKey: cat.titleKey };
      }
    }
    return { id: "", titleKey: "" };
  }, [categories, slug]);

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
  const search = useCallback(
    (query: string): SearchResult[] => {
      return repo.search(query);
    },
    [repo]
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
