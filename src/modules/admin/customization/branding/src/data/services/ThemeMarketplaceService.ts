/**
 * Theme Marketplace Service
 *
 * Handles all API calls for the Theme Marketplace.
 * Returns DTOs — Repository uses Mapper to convert to Entities.
 *
 * @module customization/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  ThemeCardDto,
  ThemeDetailDto,
  ThemePagedResult,
} from "../models/ThemeMarketplaceTypes";
import type {
  IThemeMarketplaceService,
  ThemeListParams,
  UpsertThemePayload,
} from "../../domain/interfaces/IThemeMarketplaceService";
import { BRANDING_ENDPOINTS } from "./branding.endpoints";

/**
 * Http API network service for theme marketplace.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class ThemeMarketplaceService implements IThemeMarketplaceService {
  constructor(private readonly api: IApiService) {}

  async getThemes(params: ThemeListParams): Promise<ThemePagedResult> {
    const url = buildUrl(BRANDING_ENDPOINTS.THEMES.LIST, {
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
    return this.api.get<ThemeCardDto[]>(BRANDING_ENDPOINTS.THEMES.FEATURED);
  }

  async getFavorites(params: { page: number; pageSize: number }): Promise<ThemePagedResult> {
    const url = buildUrl(BRANDING_ENDPOINTS.THEMES.FAVORITES, {
      page: params.page,
      pageSize: params.pageSize,
    });
    return this.api.get<ThemePagedResult>(url);
  }

  async getBySlug(slug: string): Promise<ThemeDetailDto> {
    return this.api.get<ThemeDetailDto>(BRANDING_ENDPOINTS.THEMES.BY_SLUG(slug));
  }

  async apply(slug: string, mergeWithCurrent: boolean): Promise<void> {
    await this.api.post(BRANDING_ENDPOINTS.THEMES.APPLY(slug), { mergeWithCurrent });
  }

  async toggleFavorite(slug: string): Promise<void> {
    await this.api.post(BRANDING_ENDPOINTS.THEMES.FAVORITE(slug), {});
  }

  // ─── CRUD (system admin) ──────────────────────────────

  async create(data: UpsertThemePayload): Promise<ThemeDetailDto> {
    return this.api.post<ThemeDetailDto>(BRANDING_ENDPOINTS.THEMES.CREATE, data);
  }

  async update(slug: string, data: UpsertThemePayload): Promise<void> {
    await this.api.put(BRANDING_ENDPOINTS.THEMES.UPDATE(slug), data);
  }

  async delete(slug: string): Promise<void> {
    await this.api.delete(BRANDING_ENDPOINTS.THEMES.DELETE(slug));
  }

  async duplicate(slug: string, newSlug: string, newName: string): Promise<ThemeDetailDto> {
    return this.api.post<ThemeDetailDto>(BRANDING_ENDPOINTS.THEMES.DUPLICATE(slug), {
      newSlug,
      newName,
    });
  }

  async deprecate(slug: string, notice?: string, replacedBySlug?: string): Promise<void> {
    await this.api.post(BRANDING_ENDPOINTS.THEMES.DEPRECATE(slug), {
      deprecationNotice: notice,
      replacedBySlug,
    });
  }

  async reorder(slugToDisplayOrder: Record<string, number>): Promise<void> {
    await this.api.put(BRANDING_ENDPOINTS.THEMES.REORDER, { slugToDisplayOrder });
  }
}
