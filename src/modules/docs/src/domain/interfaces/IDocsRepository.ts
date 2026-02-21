/**
 * IDocsRepository — Interface for accessing documentation data.
 * Currently backed by static imports; can be swapped for API calls.
 */

import type { DocPage } from "../entities/DocPage";
import type { DocCategory } from "../entities/DocCategory";

export interface SearchResult {
  slug: string;
  titleKey: string;
  category: string;
  /** Matched section heading key (if any) */
  matchedHeadingKey?: string;
  /** Section ID to scroll to */
  sectionId?: string;
  /** Matched text snippet with context */
  snippet?: string;
}

export interface IDocsRepository {
  /** Get a single page by its slug */
  getPage(slug: string): DocPage | undefined;

  /** Get all navigation categories (for sidebar) */
  getNavigation(): DocCategory[];

  /** Search across pages filtered by mode */
  search(
    query: string,
    mode?: "technical" | "commercial",
    t?: (key: string) => string
  ): SearchResult[];

  /** Get all page slugs (for static generation) */
  getAllSlugs(): string[];

  /** Get the next page slug in navigation order */
  getNextSlug(currentSlug: string): string | undefined;

  /** Get the previous page slug in navigation order */
  getPrevSlug(currentSlug: string): string | undefined;
}
