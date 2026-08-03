/**
 * Theme Bundle Repository
 *
 * Wraps ThemeBundleService + uses ThemeBundleMapper → returns domain entities.
 *
 * @module customization/data
 */
import type { ThemeBundle } from "../../domain/entities/ThemeBundle";
import type {
  BundlePagedResult,
  IThemeBundleRepository,
} from "../../domain/interfaces/IThemeBundleRepository";
import type {
  BundleListParams,
  SaveBundlePayload,
} from "../../domain/interfaces/IThemeBundleService";
import type { IThemeBundleService } from "../../domain/interfaces/IThemeBundleService";
import { ThemeBundleMapper } from "../mappers/ThemeBundleMapper";

/**
 * Repository layer implementing client request queries for theme bundle.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class ThemeBundleRepository implements IThemeBundleRepository {
  constructor(private readonly service: IThemeBundleService) {}

  async getBundles(params: BundleListParams): Promise<BundlePagedResult> {
    const result = await this.service.getBundles(params);
    return {
      items: result.items.map(ThemeBundleMapper.toEntity),
      totalCount: result.totalCount,
      page: result.pageNumber,
      pageSize: result.pageSize,
    };
  }

  async getFeatured(): Promise<ThemeBundle[]> {
    const dtos = await this.service.getFeatured();
    return dtos.map(ThemeBundleMapper.toEntity);
  }

  async getBySlug(slug: string): Promise<ThemeBundle> {
    const dto = await this.service.getBySlug(slug);
    return ThemeBundleMapper.toEntity(dto);
  }

  async apply(slug: string, mergeWithCurrent: boolean): Promise<void> {
    await this.service.apply(slug, mergeWithCurrent);
  }

  async toggleFavorite(slug: string): Promise<void> {
    await this.service.toggleFavorite(slug);
  }

  async saveCurrentAsBundle(data: SaveBundlePayload): Promise<ThemeBundle> {
    const dto = await this.service.saveCurrentAsBundle(data);
    return ThemeBundleMapper.toEntity(dto);
  }
}
