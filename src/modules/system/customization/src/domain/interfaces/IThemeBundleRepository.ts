/**
 * IThemeBundleRepository — Domain interface for theme bundle repository
 * @module customization/domain
 */
import type { ThemeBundle } from "../entities/ThemeBundle";
import type { BundleListParams, SaveBundlePayload } from "./IThemeBundleService";

export interface BundlePagedResult {
  items: ThemeBundle[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface IThemeBundleRepository {
  getBundles(params: BundleListParams): Promise<BundlePagedResult>;
  getFeatured(): Promise<ThemeBundle[]>;
  getBySlug(slug: string): Promise<ThemeBundle>;
  apply(slug: string, mergeWithCurrent: boolean): Promise<void>;
  toggleFavorite(slug: string): Promise<void>;
  saveCurrentAsBundle(data: SaveBundlePayload): Promise<ThemeBundle>;
}
