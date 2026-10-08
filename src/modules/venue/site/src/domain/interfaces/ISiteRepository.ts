import type { Site } from "../entities/Site";
import type { ListSitesParams, CreateSitePayload, UpdateSitePayload } from "./ISiteService";

/**
 * Documentation for module export
 */
export interface PagedSiteResult {
  items: Site[];
  totalCount: number;
  totalPages: number;
}

/**
 * Documentation for module export
 */
export interface ISiteRepository {
  getAll(params: ListSitesParams): Promise<PagedSiteResult>;
  getById(id: string): Promise<Site>;
  create(payload: CreateSitePayload): Promise<string>;
  update(id: string, payload: UpdateSitePayload): Promise<void>;
  delete(id: string): Promise<void>;
}
