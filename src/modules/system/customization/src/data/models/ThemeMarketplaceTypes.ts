/**
 * Theme Marketplace Types
 *
 * TypeScript types matching the backend DTOs exactly.
 * Uses hybrid pricing model: Free / EditionGated / StandaloneOnly.
 * All enrichment (IsAvailable, IsPurchased, IsIncluded) is computed server-side.
 *
 * @module customization/data
 */

/** Pricing model for themes */
export type ThemePricingType = "Free" | "EditionGated" | "StandaloneOnly";

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
  // ── Pricing fields ──
  pricingType: ThemePricingType;
  minTierLevel: number;
  isAlsoBuyable: boolean;
  price?: number;
  priceCurrency?: string;
  // ── Server-side enrichment ──
  isFavorited: boolean;
  isApplied: boolean;
  isAvailable: boolean;
  isPurchased: boolean;
  isIncluded: boolean;
  isBuyable: boolean;
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

/** Pricing badge configuration */
export const PRICING_BADGES: Record<
  ThemePricingType,
  { label: string; color: string; icon: string }
> = {
  Free: {
    label: "Free",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: "sparkles",
  },
  EditionGated: {
    label: "Included",
    color: "bg-blue-500/10 text-blue-600",
    icon: "crown",
  },
  StandaloneOnly: {
    label: "Premium",
    color: "bg-violet-500/10 text-violet-600",
    icon: "shopping-cart",
  },
};

/** Get the display badge for a theme based on its access status */
export function getThemeBadge(theme: ThemeCardDto): {
  label: string;
  color: string;
  variant: "free" | "included" | "locked" | "purchased" | "buyable";
} {
  if (theme.pricingType === "Free") {
    return { label: "✨ Free", color: "bg-emerald-500/10 text-emerald-600", variant: "free" };
  }

  if (theme.isPurchased) {
    return { label: "✅ Purchased", color: "bg-green-500/10 text-green-600", variant: "purchased" };
  }

  if (theme.isIncluded) {
    return { label: "✅ Included", color: "bg-blue-500/10 text-blue-600", variant: "included" };
  }

  if (theme.pricingType === "StandaloneOnly") {
    const priceLabel = theme.price ? `$${theme.price.toFixed(2)}` : "Premium";
    return { label: `💰 ${priceLabel}`, color: "bg-violet-500/10 text-violet-600", variant: "buyable" };
  }

  // EditionGated but not included — locked
  if (theme.isBuyable && theme.price) {
    return { label: `🔒 Upgrade or $${theme.price.toFixed(2)}`, color: "bg-amber-500/10 text-amber-600", variant: "locked" };
  }

  return { label: "🔒 Upgrade to unlock", color: "bg-amber-500/10 text-amber-600", variant: "locked" };
}
