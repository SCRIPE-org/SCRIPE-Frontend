/**
 * Theme Marketplace Repository
 *
 * Implements IThemeMarketplaceRepository using the ThemeMarketplaceService.
 * Uses ThemeMarketplaceMapper to convert DTOs → domain entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns DTOs
 * - Repository uses Mapper to convert to Entities
 * - ViewModel/Hook uses Repository, works with Entities
 *
 * @module customization/data
 */
import type {
  IThemeMarketplaceRepository,
  ThemeListResult,
} from "../../domain/interfaces/IThemeMarketplaceRepository";
import type {
  IThemeMarketplaceService,
  UpsertThemePayload,
} from "../../domain/interfaces/IThemeMarketplaceService";
import type { ThemeCard } from "../../domain/entities/ThemeCard";
import type { ThemeDetail } from "../../domain/entities/ThemeDetail";
import type { ThemeFilterState } from "../models/ThemeMarketplaceTypes";
import { ThemeMarketplaceMapper } from "../mappers/ThemeMarketplaceMapper";

export class ThemeMarketplaceRepository implements IThemeMarketplaceRepository {
  constructor(private readonly service: IThemeMarketplaceService) {}

  async getThemes(params: {
    page: number;
    pageSize: number;
    filters: ThemeFilterState;
  }): Promise<ThemeListResult> {
    const result = await this.service.getThemes({
      page: params.page,
      pageSize: params.pageSize,
      search: params.filters.search || undefined,
      category: params.filters.category || undefined,
      sortBy: params.filters.sortBy,
      isFree: params.filters.isFree,
      hasDarkMode: params.filters.hasDarkMode,
      hasAccessibility: params.filters.hasAccessibility,
      isFeatured: params.filters.isFeatured,
      tags: params.filters.tags?.join(",") || undefined,
    });

    return {
      items: result.items.map(ThemeMarketplaceMapper.toCardEntity),
      totalCount: result.totalCount,
    };
  }

  async getFeatured(): Promise<ThemeCard[]> {
    const dtos = await this.service.getFeatured();
    return dtos.map(ThemeMarketplaceMapper.toCardEntity);
  }

  async getFavorites(params: { page: number; pageSize: number }): Promise<ThemeListResult> {
    const result = await this.service.getFavorites(params);
    return {
      items: result.items.map(ThemeMarketplaceMapper.toCardEntity),
      totalCount: result.totalCount,
    };
  }

  async getBySlug(slug: string): Promise<ThemeDetail> {
    const dto = await this.service.getBySlug(slug);
    return ThemeMarketplaceMapper.toDetailEntity(dto);
  }

  async apply(slug: string, mergeWithCurrent: boolean): Promise<void> {
    await this.service.apply(slug, mergeWithCurrent);
  }

  async toggleFavorite(slug: string): Promise<void> {
    await this.service.toggleFavorite(slug);
  }

  // ─── CRUD (system admin) ──────────────────────────────

  async create(data: UpsertThemePayload): Promise<ThemeDetail> {
    const dto = await this.service.create(data);
    return ThemeMarketplaceMapper.toDetailEntity(dto);
  }

  async update(slug: string, data: UpsertThemePayload): Promise<void> {
    await this.service.update(slug, data);
  }

  async delete(slug: string): Promise<void> {
    await this.service.delete(slug);
  }

  async duplicate(slug: string, newSlug: string, newName: string): Promise<ThemeDetail> {
    const dto = await this.service.duplicate(slug, newSlug, newName);
    return ThemeMarketplaceMapper.toDetailEntity(dto);
  }

  async deprecate(slug: string, notice?: string, replacedBySlug?: string): Promise<void> {
    await this.service.deprecate(slug, notice, replacedBySlug);
  }

  async reorder(slugToDisplayOrder: Record<string, number>): Promise<void> {
    await this.service.reorder(slugToDisplayOrder);
  }
}
