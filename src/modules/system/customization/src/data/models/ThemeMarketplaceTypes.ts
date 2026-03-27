/**
 * Theme Marketplace Types
 *
 * TypeScript types matching the backend DTOs exactly.
 * All enrichment (IsFavorited, IsApplied, IsAvailable) is computed server-side.
 *
 * @module customization/data
 */

/** Gallery card — lightweight for grid rendering */
export interface ThemeCardDto {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  targetIndustry?: string;
  thumbnailImageUrl?: string;
  accentColor?: string;
  tags?: string[];
  isFree: boolean;
  requiredEdition?: string;
  isSystem: boolean;
  isFeatured: boolean;
  isNew: boolean;
  hasDarkMode: boolean;
  hasAccessibilityPreset: boolean;
  hasContentBlocks: boolean;
  usageCount: number;
  likeCount: number;
  authorName?: string;
  version?: string;
  publishedAt?: string;
  deprecationNotice?: string;
  // Server-side enrichment
  isFavorited: boolean;
  isApplied: boolean;
  isAvailable: boolean;
}

/** Full detail — includes ThemeDataJson for live preview */
export interface ThemeDetailDto extends ThemeCardDto {
  longDescription?: string;
  previewImageUrl?: string;
  previewDarkImageUrl?: string;
  screenshots?: string[];
  compatibleLayouts?: string;
  themeDataJson?: string;
  themeSchemaVersion: number;
  replacedBySlug?: string;
  displayOrder: number;
}

/** Paged result (matches backend PagedResult<T>) */
export interface ThemePagedResult {
  items: ThemeCardDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Marketplace filter state */
export interface ThemeFilterState {
  search: string;
  category: string;
  sortBy: string;
  isFree?: boolean;
  hasDarkMode?: boolean;
  hasAccessibility?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

/** Categories and sort options for the UI */
export const THEME_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "corporate", label: "Corporate" },
  { value: "creative", label: "Creative" },
  { value: "minimal", label: "Minimal" },
] as const;

export const THEME_SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "name", label: "A → Z" },
  { value: "usage", label: "Most Used" },
  { value: "likes", label: "Most Liked" },
] as const;

export const EDITION_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Pro",
  enterprise: "Enterprise",
};

export const EDITION_COLORS: Record<string, string> = {
  free: "bg-emerald-500/10 text-emerald-600",
  starter: "bg-blue-500/10 text-blue-600",
  professional: "bg-violet-500/10 text-violet-600",
  enterprise: "bg-amber-500/10 text-amber-600",
};
