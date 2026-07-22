/**
 * Theme Marketplace Types
 *
 * TypeScript types matching the backend DTOs exactly.
 * Uses hybrid pricing model: Free / EditionGated / StandaloneOnly.
 * All enrichment (IsAvailable, IsPurchased, IsIncluded) is computed server-side.
 *
 * @module customization/data
 */

/** Import from domain entity — single source of truth */
import type { ThemePricingType } from "../../domain/entities/ThemeCard";
export type { ThemePricingType };

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

/** Re-export from domain types — single source of truth */
import { THEME_CATEGORIES, THEME_SORT_OPTIONS } from "../../domain/types/ThemeTypes";
export type { ThemeFilterState } from "../../domain/types/ThemeTypes";
export { THEME_CATEGORIES, THEME_SORT_OPTIONS };

/** Pricing badge configuration */
export const PRICING_BADGES: Record<
  ThemePricingType,
  { label: string; color: string; icon: string }
> = {
  Free: {
    label: "Free",
    color: "bg-success/10 text-success",
    icon: "sparkles",
  },
  EditionGated: {
    label: "Included",
    color: "bg-info/10 text-info",
    icon: "crown",
  },
  StandaloneOnly: {
    label: "Premium",
    color: "bg-primary/10 text-primary",
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
    return { label: "✨ Free", color: "bg-success/10 text-success", variant: "free" };
  }

  if (theme.isPurchased) {
    return { label: "✅ Purchased", color: "bg-success/10 text-success", variant: "purchased" };
  }

  if (theme.isIncluded) {
    return { label: "✅ Included", color: "bg-info/10 text-info", variant: "included" };
  }

  if (theme.pricingType === "StandaloneOnly") {
    const priceLabel = theme.price ? `$${theme.price.toFixed(2)}` : "Premium";
    return {
      label: `💰 ${priceLabel}`,
      color: "bg-primary/10 text-primary",
      variant: "buyable",
    };
  }

  // EditionGated but not included — locked
  if (theme.isBuyable && theme.price) {
    return {
      label: `🔒 Upgrade or $${theme.price.toFixed(2)}`,
      color: "bg-warning/10 text-warning",
      variant: "locked",
    };
  }

  return {
    label: "🔒 Upgrade to unlock",
    color: "bg-warning/10 text-warning",
    variant: "locked",
  };
}
