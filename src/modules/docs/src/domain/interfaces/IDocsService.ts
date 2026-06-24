/**
 * IDocsService — Domain interface for the documentation service.
 */

import type { DocPage } from "../entities/DocPage";
import type { DocCategory } from "../entities/DocCategory";
import type { SearchResult } from "./IDocsRepository";

/**
 * Interface defining operations for the Docs network service.
 */
export interface IDocsService {
  getPage(slug: string): DocPage | undefined;
  getNavigation(): DocCategory[];
  search(
    query: string,
    mode?: "technical" | "commercial",
    t?: (key: string) => string
  ): SearchResult[];
  getAllSlugs(): string[];
  getNextSlug(currentSlug: string): string | undefined;
  getPrevSlug(currentSlug: string): string | undefined;
}
