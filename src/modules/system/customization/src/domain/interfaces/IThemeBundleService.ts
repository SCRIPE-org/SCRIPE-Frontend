/**
 * IThemeBundleService — Domain interface for theme bundle API operations
 * @module customization/domain
 */
import type { ThemeBundleDto, ThemeBundlePagedResult } from "../../data/models/ThemeBundleTypes";

/** Parameters for listing bundles */
export interface BundleListParams {
  page: number;
  pageSize: number;
  search?: string;
  bundleType?: string;
  sortBy?: string;
  isFeatured?: boolean;
}

/** Payload for saving current config as a bundle */
export interface SaveBundlePayload {
  name: string;
  description: string;
  bundleType: string;
  tags: string[];
  includeLayers: {
    login: boolean;
    authPages: boolean;
    dashboard: boolean;
    loginBuilder: boolean;
    dashboardBuilder: boolean;
  };
}

export interface IThemeBundleService {
  getBundles(params: BundleListParams): Promise<ThemeBundlePagedResult>;
  getFeatured(): Promise<ThemeBundleDto[]>;
  getBySlug(slug: string): Promise<ThemeBundleDto>;
  apply(slug: string, mergeWithCurrent: boolean): Promise<void>;
  toggleFavorite(slug: string): Promise<void>;
  saveCurrentAsBundle(data: SaveBundlePayload): Promise<ThemeBundleDto>;
}
