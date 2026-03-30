/**
 * ThemeCard — Domain entity for theme gallery card
 *
 * Rich domain model with computed properties.
 * Uses hybrid pricing model: Free / EditionGated / StandaloneOnly.
 * Created by ThemeMarketplaceMapper from DTO.
 *
 * @module customization/domain
 */

/** Pricing strategy for marketplace themes */
export type ThemePricingType = "Free" | "EditionGated" | "StandaloneOnly";

export interface ThemeCardData {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  targetIndustry: string;
  thumbnailImageUrl: string;
  accentColor: string;
  tags: string[];
  isFree: boolean;
  isSystem: boolean;
  isFeatured: boolean;
  isNew: boolean;
  hasDarkMode: boolean;
  hasAccessibilityPreset: boolean;
  hasContentBlocks: boolean;
  usageCount: number;
  likeCount: number;
  authorName: string;
  version: string;
  publishedAt: string;
  deprecationNotice: string;
  // Pricing
  pricingType: ThemePricingType;
  minTierLevel: number;
  isAlsoBuyable: boolean;
  price: number;
  priceCurrency: string;
  // Access status
  isFavorited: boolean;
  isApplied: boolean;
  isAvailable: boolean;
  isPurchased: boolean;
  isIncluded: boolean;
  isBuyable: boolean;
}

export class ThemeCard {
  constructor(private readonly data: ThemeCardData) {}

  get id() { return this.data.id; }
  get slug() { return this.data.slug; }
  get name() { return this.data.name; }
  get description() { return this.data.description; }
  get category() { return this.data.category; }
  get targetIndustry() { return this.data.targetIndustry; }
  get thumbnailImageUrl() { return this.data.thumbnailImageUrl; }
  get accentColor() { return this.data.accentColor; }
  get tags() { return this.data.tags; }
  get isFree() { return this.data.isFree; }
  get isSystem() { return this.data.isSystem; }
  get isFeatured() { return this.data.isFeatured; }
  get isNew() { return this.data.isNew; }
  get hasDarkMode() { return this.data.hasDarkMode; }
  get hasAccessibilityPreset() { return this.data.hasAccessibilityPreset; }
  get hasContentBlocks() { return this.data.hasContentBlocks; }
  get usageCount() { return this.data.usageCount; }
  get likeCount() { return this.data.likeCount; }
  get authorName() { return this.data.authorName; }
  get version() { return this.data.version; }
  get publishedAt() { return this.data.publishedAt; }
  get deprecationNotice() { return this.data.deprecationNotice; }
  // Pricing
  get pricingType() { return this.data.pricingType; }
  get minTierLevel() { return this.data.minTierLevel; }
  get isAlsoBuyable() { return this.data.isAlsoBuyable; }
  get price() { return this.data.price; }
  get priceCurrency() { return this.data.priceCurrency; }
  // Access status
  get isFavorited() { return this.data.isFavorited; }
  get isApplied() { return this.data.isApplied; }
  get isAvailable() { return this.data.isAvailable; }
  get isPurchased() { return this.data.isPurchased; }
  get isIncluded() { return this.data.isIncluded; }
  get isBuyable() { return this.data.isBuyable; }

  /** Is this theme deprecated? */
  get isDeprecated() { return !!this.data.deprecationNotice; }

  /** Clone with updated data (for optimistic updates) */
  copyWith(updates: Partial<ThemeCardData>): ThemeCard {
    return new ThemeCard({ ...this.data, ...updates });
  }
}
