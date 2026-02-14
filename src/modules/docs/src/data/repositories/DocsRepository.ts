/**
 * DocsRepository — Reads documentation data from static imports.
 * Implements IDocsRepository for clean architecture.
 * 
 * Future: Can be swapped for API-backed implementation.
 */

import { DocPage, type DocPageData } from '../../domain/entities/DocPage';
import { DocCategory } from '../../domain/entities/DocCategory';
import type { IDocsRepository, SearchResult } from '../../domain/interfaces/IDocsRepository';
import { navigationData } from '../navigation';

// ─── Content Registry ──────────────────────────────────────────
// All content files register themselves here via registerPage()
const pageRegistry = new Map<string, DocPageData>();

/**
 * Register a doc page. Called by each content file.
 * This allows lazy registration without circular imports.
 */
export function registerPage(page: DocPageData): void {
      pageRegistry.set(page.slug, page);
}

/**
 * Bulk register multiple pages at once.
 */
export function registerPages(pages: DocPageData[]): void {
      pages.forEach((page) => pageRegistry.set(page.slug, page));
}

// ─── Navigation Cache ──────────────────────────────────────────
let cachedCategories: DocCategory[] | null = null;
let cachedSlugs: string[] | null = null;

function getCategories(): DocCategory[] {
      if (!cachedCategories) {
            cachedCategories = navigationData
                  .map((data) => new DocCategory(data))
                  .sort((a, b) => a.order - b.order);
      }
      return cachedCategories;
}

function getAllOrderedSlugs(): string[] {
      if (!cachedSlugs) {
            cachedSlugs = getCategories().flatMap((cat) => cat.getAllSlugs());
      }
      return cachedSlugs;
}

// ─── Repository Implementation ─────────────────────────────────
export class DocsRepository implements IDocsRepository {
      getPage(slug: string): DocPage | undefined {
            const data = pageRegistry.get(slug);
            if (!data) return undefined;
            return new DocPage(data);
      }

      getNavigation(): DocCategory[] {
            return getCategories();
      }

      search(query: string): SearchResult[] {
            if (!query.trim()) return [];

            const lowerQuery = query.toLowerCase();
            const results: SearchResult[] = [];

            for (const [slug, page] of pageRegistry.entries()) {
                  // Search in slug
                  const slugMatch = slug.toLowerCase().includes(lowerQuery);

                  // Search in title key (we just match on the key parts as a heuristic)
                  const titleMatch = page.titleKey.toLowerCase().includes(lowerQuery);

                  // Search in section heading keys
                  const headingMatch = page.sections
                        .filter((s): s is Extract<typeof s, { type: 'heading' }> => s.type === 'heading')
                        .find((s) => s.titleKey.toLowerCase().includes(lowerQuery));

                  if (slugMatch || titleMatch || headingMatch) {
                        results.push({
                              slug,
                              titleKey: page.titleKey,
                              category: page.category,
                              matchedHeadingKey: headingMatch?.titleKey,
                        });
                  }
            }

            return results.slice(0, 20); // Limit results
      }

      getAllSlugs(): string[] {
            return getAllOrderedSlugs();
      }

      getNextSlug(currentSlug: string): string | undefined {
            const slugs = getAllOrderedSlugs();
            const idx = slugs.indexOf(currentSlug);
            if (idx === -1 || idx >= slugs.length - 1) return undefined;
            return slugs[idx + 1];
      }

      getPrevSlug(currentSlug: string): string | undefined {
            const slugs = getAllOrderedSlugs();
            const idx = slugs.indexOf(currentSlug);
            if (idx <= 0) return undefined;
            return slugs[idx - 1];
      }
}
