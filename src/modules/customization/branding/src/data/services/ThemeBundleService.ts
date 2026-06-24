/**
 * Theme Bundle Service
 *
 * Handles all API calls for Theme Bundles.
 * Returns DTOs — Repository uses Mapper to convert to Entities.
 *
 * @module customization/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ThemeBundleDto, ThemeBundlePagedResult } from "../models/ThemeBundleTypes";
import type {
  IThemeBundleService,
  BundleListParams,
  SaveBundlePayload,
} from "../../domain/interfaces/IThemeBundleService";

/**
 * API service for executing HTTP calls related to ThemeBundle endpoints.
 */
export class ThemeBundleService implements IThemeBundleService {
  constructor(private readonly api: IApiService) {}

  async getBundles(params: BundleListParams): Promise<ThemeBundlePagedResult> {
    const url = buildUrl(API_ENDPOINTS.BUNDLES.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      bundleType: params.bundleType || undefined,
      sortBy: params.sortBy || undefined,
      isFeatured: params.isFeatured,
    });
    return this.api.get<ThemeBundlePagedResult>(url);
  }

  async getFeatured(): Promise<ThemeBundleDto[]> {
    return this.api.get<ThemeBundleDto[]>(API_ENDPOINTS.BUNDLES.FEATURED);
  }

  async getBySlug(slug: string): Promise<ThemeBundleDto> {
    return this.api.get<ThemeBundleDto>(API_ENDPOINTS.BUNDLES.BY_SLUG(slug));
  }

  async apply(slug: string, mergeWithCurrent: boolean): Promise<void> {
    await this.api.post(API_ENDPOINTS.BUNDLES.APPLY(slug), { mergeWithCurrent });
  }

  async toggleFavorite(slug: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.BUNDLES.FAVORITE(slug), {});
  }

  async saveCurrentAsBundle(data: SaveBundlePayload): Promise<ThemeBundleDto> {
    return this.api.post<ThemeBundleDto>(API_ENDPOINTS.BUNDLES.SAVE, data);
  }
}
