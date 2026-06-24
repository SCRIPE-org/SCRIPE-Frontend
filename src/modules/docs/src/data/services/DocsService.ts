/**
 * DocsService — Implements IDocsService.
 * Currently backed by static repository.
 */

import type { IApiService } from "@core/interfaces/api.interface";
import type { IDocsService } from "../../domain/interfaces/IDocsService";
import type { IDocsRepository, SearchResult } from "../../domain/interfaces/IDocsRepository";
import type { DocPage } from "../../domain/entities/DocPage";
import type { DocCategory } from "../../domain/entities/DocCategory";

/**
 * Http API network service for docs.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class DocsService implements IDocsService {
  constructor(
    private readonly repository: IDocsRepository,
    private readonly api?: IApiService
  ) {}

  getPage(slug: string): DocPage | undefined {
    return this.repository.getPage(slug);
  }

  getNavigation(): DocCategory[] {
    return this.repository.getNavigation();
  }

  search(
    query: string,
    mode?: "technical" | "commercial",
    t?: (key: string) => string
  ): SearchResult[] {
    return this.repository.search(query, mode, t);
  }

  getAllSlugs(): string[] {
    return this.repository.getAllSlugs();
  }

  getNextSlug(currentSlug: string): string | undefined {
    return this.repository.getNextSlug(currentSlug);
  }

  getPrevSlug(currentSlug: string): string | undefined {
    return this.repository.getPrevSlug(currentSlug);
  }
}
