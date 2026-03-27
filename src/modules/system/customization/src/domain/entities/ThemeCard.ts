/**
 * ThemeCard — Domain entity for theme gallery card
 *
 * Rich domain model with computed properties.
 * Created by ThemeMarketplaceMapper from DTO.
 *
 * @module customization/domain
 */

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
  requiredEdition: string;
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
  isFavorited: boolean;
  isApplied: boolean;
  isAvailable: boolean;
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
  get requiredEdition() { return this.data.requiredEdition; }
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
  get isFavorited() { return this.data.isFavorited; }
  get isApplied() { return this.data.isApplied; }
  get isAvailable() { return this.data.isAvailable; }

  /** Is this theme deprecated? */
  get isDeprecated() { return !!this.data.deprecationNotice; }

  /** Clone with updated data (for optimistic updates) */
  copyWith(updates: Partial<ThemeCardData>): ThemeCard {
    return new ThemeCard({ ...this.data, ...updates });
  }
}
