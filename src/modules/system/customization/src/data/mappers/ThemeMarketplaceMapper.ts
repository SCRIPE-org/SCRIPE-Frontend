/**
 * Theme Marketplace Mapper
 *
 * Converts between data models (DTOs) and domain entities.
 *
 * @module customization/data
 */
import { ThemeCard, type ThemeCardData } from "../../domain/entities/ThemeCard";
import { ThemeDetail, type ThemeDetailData } from "../../domain/entities/ThemeDetail";
import type { ThemeCardDto, ThemeDetailDto } from "../models/ThemeMarketplaceTypes";

export class ThemeMarketplaceMapper {
  /** Convert ThemeCardDto → ThemeCard entity */
  static toCardEntity(dto: ThemeCardDto): ThemeCard {
    const data: ThemeCardData = {
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      description: dto.description ?? "",
      category: dto.category ?? "",
      targetIndustry: dto.targetIndustry ?? "",
      thumbnailImageUrl: dto.thumbnailImageUrl ?? "",
      accentColor: dto.accentColor ?? "",
      tags: dto.tags ?? [],
      isFree: dto.isFree,
      requiredEdition: dto.requiredEdition ?? "",
      isSystem: dto.isSystem,
      isFeatured: dto.isFeatured,
      isNew: dto.isNew,
      hasDarkMode: dto.hasDarkMode,
      hasAccessibilityPreset: dto.hasAccessibilityPreset,
      hasContentBlocks: dto.hasContentBlocks,
      usageCount: dto.usageCount,
      likeCount: dto.likeCount,
      authorName: dto.authorName ?? "",
      version: dto.version ?? "",
      publishedAt: dto.publishedAt ?? "",
      deprecationNotice: dto.deprecationNotice ?? "",
      isFavorited: dto.isFavorited,
      isApplied: dto.isApplied,
      isAvailable: dto.isAvailable,
    };
    return new ThemeCard(data);
  }

  /** Convert ThemeDetailDto → ThemeDetail entity */
  static toDetailEntity(dto: ThemeDetailDto): ThemeDetail {
    const data: ThemeDetailData = {
      // Base card fields
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      description: dto.description ?? "",
      category: dto.category ?? "",
      targetIndustry: dto.targetIndustry ?? "",
      thumbnailImageUrl: dto.thumbnailImageUrl ?? "",
      accentColor: dto.accentColor ?? "",
      tags: dto.tags ?? [],
      isFree: dto.isFree,
      requiredEdition: dto.requiredEdition ?? "",
      isSystem: dto.isSystem,
      isFeatured: dto.isFeatured,
      isNew: dto.isNew,
      hasDarkMode: dto.hasDarkMode,
      hasAccessibilityPreset: dto.hasAccessibilityPreset,
      hasContentBlocks: dto.hasContentBlocks,
      usageCount: dto.usageCount,
      likeCount: dto.likeCount,
      authorName: dto.authorName ?? "",
      version: dto.version ?? "",
      publishedAt: dto.publishedAt ?? "",
      deprecationNotice: dto.deprecationNotice ?? "",
      isFavorited: dto.isFavorited,
      isApplied: dto.isApplied,
      isAvailable: dto.isAvailable,
      // Detail-specific fields
      longDescription: dto.longDescription ?? "",
      previewImageUrl: dto.previewImageUrl ?? "",
      previewDarkImageUrl: dto.previewDarkImageUrl ?? "",
      screenshots: dto.screenshots ?? [],
      compatibleLayouts: dto.compatibleLayouts ?? "",
      themeDataJson: dto.themeDataJson ?? "",
      themeSchemaVersion: dto.themeSchemaVersion,
      replacedBySlug: dto.replacedBySlug ?? "",
      displayOrder: dto.displayOrder,
    };
    return new ThemeDetail(data);
  }
}
