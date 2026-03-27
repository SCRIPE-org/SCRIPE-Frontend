/**
 * Theme Marketplace Service
 *
 * Handles all API calls for the Theme Marketplace.
 * Returns DTOs — Repository uses Mapper to convert to Entities.
 *
 * @module customization/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
  ThemeCardDto,
  ThemeDetailDto,
  ThemePagedResult,
} from "../models/ThemeMarketplaceTypes";
import type {
  IThemeMarketplaceService,
  ThemeListParams,
} from "../../domain/interfaces/IThemeMarketplaceService";

export class ThemeMarketplaceService implements IThemeMarketplaceService {
  constructor(private readonly api: IApiService) {}

  async getThemes(params: ThemeListParams): Promise<ThemePagedResult> {
    const url = buildUrl(API_ENDPOINTS.THEMES.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      category: params.category || undefined,
      sortBy: params.sortBy,
      isFree: params.isFree,
      hasDarkMode: params.hasDarkMode,
      hasAccessibility: params.hasAccessibility,
      isFeatured: params.isFeatured,
      tags: params.tags || undefined,
    });
    return this.api.get<ThemePagedResult>(url);
  }

  async getFeatured(): Promise<ThemeCardDto[]> {
    return this.api.get<ThemeCardDto[]>(API_ENDPOINTS.THEMES.FEATURED);
  }

  async getFavorites(params: { page: number; pageSize: number }): Promise<ThemePagedResult> {
    const url = buildUrl(API_ENDPOINTS.THEMES.FAVORITES, {
      page: params.page,
      pageSize: params.pageSize,
    });
    return this.api.get<ThemePagedResult>(url);
  }

  async getBySlug(slug: string): Promise<ThemeDetailDto> {
    return this.api.get<ThemeDetailDto>(API_ENDPOINTS.THEMES.BY_SLUG(slug));
  }

  async apply(slug: string, mergeWithCurrent: boolean): Promise<void> {
    await this.api.post(API_ENDPOINTS.THEMES.APPLY(slug), { mergeWithCurrent });
  }

  async toggleFavorite(slug: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.THEMES.FAVORITE(slug), {});
  }
}
