/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DocsRepository — Reads documentation data from static imports.
 * Implements IDocsRepository for clean architecture.
 *
 * Future: Can be swapped for API-backed implementation.
 */

import { DocPage, type DocPageData } from "../../domain/entities/DocPage";
import { DocCategory } from "../../domain/entities/DocCategory";
import type { IDocsRepository, SearchResult } from "../../domain/interfaces/IDocsRepository";
import { navigationData } from "../navigation";

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
/**
 * Repository layer implementing client request queries for docs.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class DocsRepository implements IDocsRepository {
  getPage(slug: string): DocPage | undefined {
    if (!slug) return undefined;

    // 1. Direct match
    let data = pageRegistry.get(slug);
    if (data) return new DocPage(data);

    // 2. Clean leading/trailing slashes
    const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
    data = pageRegistry.get(cleanSlug);
    if (data) return new DocPage(data);

    // 3. Fallback: normalize nested submodule paths (e.g. modules/custom-fields/custom-fields-value-types -> modules/custom-fields-value-types)
    const parts = cleanSlug.split("/");
    if (parts.length > 2 && parts[0] === "modules") {
      const flatSlug = `modules/${parts.slice(2).join("/")}`;
      data = pageRegistry.get(flatSlug);
      if (data) return new DocPage(data);

      const leafSlug = `modules/${parts[parts.length - 1]}`;
      data = pageRegistry.get(leafSlug);
      if (data) return new DocPage(data);
    }

    // 4. Suffix match within same top-level section (modules, commercial, tutorials)
    const cleanSection = cleanSlug.split("/")[0];
    const cleanBase = parts[parts.length - 1];
    for (const [regSlug, page] of pageRegistry.entries()) {
      const regSection = regSlug.split("/")[0];
      const regBase = regSlug.split("/").pop();
      if (regSection === cleanSection && regBase === cleanBase) {
        return new DocPage(page);
      }
    }

    return undefined;
  }

  getNavigation(): DocCategory[] {
    return getCategories();
  }

  search(
    query: string,
    mode?: "technical" | "commercial",
    t?: (key: string) => string
  ): SearchResult[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const [slug, page] of pageRegistry.entries()) {
      // ── Mode isolation: skip pages not in the requested mode ──
      if (mode) {
        const isCommercial = page.category.startsWith("commercial");
        if (mode === "commercial" && !isCommercial) continue;
        if (mode === "technical" && isCommercial) continue;
      }

      // Search in slug
      const slugMatch = slug.toLowerCase().includes(lowerQuery);

      // Search in title (resolved via t() if available, else key match)
      const resolvedTitle = t ? t(page.titleKey) : page.titleKey;
      const titleMatch = resolvedTitle.toLowerCase().includes(lowerQuery);

      // Search in section heading keys
      const headingSections = page.sections.filter(
        (s): s is Extract<typeof s, { type: "heading" }> => s.type === "heading"
      );
      const headingMatch = headingSections.find((s) => {
        const resolved = t ? t(s.titleKey) : s.titleKey;
        return resolved.toLowerCase().includes(lowerQuery);
      });

      // ── Deep content search (when t() is available) ──
      let contentMatch: { sectionId?: string; snippet?: string } | null = null;
      if (t && !slugMatch && !titleMatch && !headingMatch) {
        contentMatch = this._searchContent(page, lowerQuery, t);
      }

      if (slugMatch || titleMatch || headingMatch || contentMatch) {
        results.push({
          slug,
          titleKey: page.titleKey,
          category: page.category,
          matchedHeadingKey: headingMatch?.titleKey,
          sectionId: contentMatch?.sectionId ?? headingMatch?.id,
          snippet: contentMatch?.snippet,
        });
      }
    }

    return results.slice(0, 20);
  }

  /**
   * Deep content search: resolves all contentKeys in a page via t()
   * and searches for the query inside paragraphs, tables, code, etc.
   */
  private _searchContent(
    page: DocPageData,
    lowerQuery: string,
    t: (key: string) => string
  ): { sectionId?: string; snippet?: string } | null {
    let lastSectionId: string | undefined;

    for (const section of page.sections) {
      // Track the current section ID for scroll targeting
      if (section.type === "heading" && "id" in section) {
        lastSectionId = (section as any).id;
      }

      // Resolve text based on section type
      let text = "";
      if (section.type === "paragraph" && "contentKey" in section) {
        text = t((section as any).contentKey);
      } else if (section.type === "info" && "contentKey" in section) {
        text = t((section as any).contentKey);
      } else if (section.type === "table" && "rows" in section) {
        const rows = (section as any).rows as string[][];
        text = rows.map((r: string[]) => r.join(" ")).join(" ");
      } else if (section.type === "api-table" && "endpoints" in section) {
        const eps = (section as any).endpoints as any[];
        text = eps.map((ep: any) => `${ep.method} ${ep.path} ${t(ep.descriptionKey)}`).join(" ");
      } else if (section.type === "code" && "code" in section) {
        text = (section as any).code;
      } else if (section.type === "feature-grid" && "features" in section) {
        const feats = (section as any).features as any[];
        text = feats.map((f: any) => `${t(f.titleKey)} ${t(f.descriptionKey)}`).join(" ");
      }

      if (text) {
        const lowerText = text.toLowerCase();
        const idx = lowerText.indexOf(lowerQuery);
        if (idx !== -1) {
          // Build snippet: ±50 chars around match
          const start = Math.max(0, idx - 50);
          const end = Math.min(text.length, idx + lowerQuery.length + 50);
          const prefix = start > 0 ? "…" : "";
          const suffix = end < text.length ? "…" : "";
          const snippet = prefix + text.slice(start, end) + suffix;
          return { sectionId: lastSectionId, snippet };
        }
      }
    }

    return null;
  }

  getAllSlugs(): string[] {
    return getAllOrderedSlugs();
  }

  getAllPages(): DocPage[] {
    return Array.from(pageRegistry.values()).map((p) => new DocPage(p));
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
