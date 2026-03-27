/**
 * Theme Marketplace Service Interface
 *
 * Defines the contract for theme API operations.
 * Service returns DTOs (raw JSON shapes), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module customization/domain
 */
import type {
  ThemeCardDto,
  ThemeDetailDto,
  ThemePagedResult,
} from "../../data/models/ThemeMarketplaceTypes";

export interface ThemeListParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sortBy?: string;
  isFree?: boolean;
  hasDarkMode?: boolean;
  hasAccessibility?: boolean;
  isFeatured?: boolean;
  tags?: string;
}

export interface IThemeMarketplaceService {
  /** Get paginated themes with filters */
  getThemes(params: ThemeListParams): Promise<ThemePagedResult>;

  /** Get featured themes */
  getFeatured(): Promise<ThemeCardDto[]>;

  /** Get favorite themes (paginated) */
  getFavorites(params: { page: number; pageSize: number }): Promise<ThemePagedResult>;

  /** Get theme detail by slug */
  getBySlug(slug: string): Promise<ThemeDetailDto>;

  /** Apply a theme to draft */
  apply(slug: string, mergeWithCurrent: boolean): Promise<void>;

  /** Toggle favorite for a theme */
  toggleFavorite(slug: string): Promise<void>;
}
