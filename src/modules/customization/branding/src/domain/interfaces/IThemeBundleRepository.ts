/**
 * IThemeBundleRepository — Domain interface for theme bundle repository
 * @module customization/domain
 */
import type { ThemeBundle } from "../entities/ThemeBundle";
import type { BundleListParams, SaveBundlePayload } from "./IThemeBundleService";

/**
 * Interface defining property specifications, keys types, and structural contract rules for bundle paged result.
 */
export interface BundlePagedResult {
  items: ThemeBundle[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Repository layer implementing client request queries for i theme bundle.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IThemeBundleRepository {
  getBundles(params: BundleListParams): Promise<BundlePagedResult>;
  getFeatured(): Promise<ThemeBundle[]>;
  getBySlug(slug: string): Promise<ThemeBundle>;
  apply(slug: string, mergeWithCurrent: boolean): Promise<void>;
  toggleFavorite(slug: string): Promise<void>;
  saveCurrentAsBundle(data: SaveBundlePayload): Promise<ThemeBundle>;
}
