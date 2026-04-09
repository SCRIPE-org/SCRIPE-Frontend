/**
 * Theme Bundle Mapper
 *
 * Converts ThemeBundleDto → ThemeBundle entity.
 * Null-coalesces all nullable fields.
 *
 * @module customization/data
 */
import { ThemeBundle, type BundleType, type ThemeBundleContents } from "../../domain/entities/ThemeBundle";
import type { ThemeBundleDto } from "../models/ThemeBundleTypes";

const VALID_BUNDLE_TYPES: BundleType[] = ["login-only", "auth-suite", "dashboard-only", "full-bundle"];

export class ThemeBundleMapper {
  static toEntity(dto: ThemeBundleDto): ThemeBundle {
    const bundleType: BundleType = VALID_BUNDLE_TYPES.includes(dto.bundleType as BundleType)
      ? (dto.bundleType as BundleType)
      : "full-bundle";

    const contents: ThemeBundleContents = {
      loginThemeJson: dto.contents?.loginThemeJson ?? undefined,
      authPageOverrides: dto.contents?.authPageOverrides ?? undefined,
      dashboardThemeJson: dto.contents?.dashboardThemeJson ?? undefined,
      loginCanvasJson: dto.contents?.loginCanvasJson ?? undefined,
      dashboardCanvasJson: dto.contents?.dashboardCanvasJson ?? undefined,
    };

    return new ThemeBundle({
      id: dto.id ?? "",
      slug: dto.slug ?? "",
      name: dto.name ?? "",
      description: dto.description ?? "",
      bundleType,
      contents,
      accentColor: dto.accentColor ?? "#6366f1",
      thumbnailUrl: dto.thumbnailUrl ?? "",
      screenshots: dto.screenshots ?? [],
      tags: dto.tags ?? [],
      authorName: dto.authorName ?? "NEXORA",
      version: dto.version ?? "1.0.0",
      publishedAt: dto.publishedAt ?? "",
      isFree: dto.isFree ?? true,
      isSystem: dto.isSystem ?? false,
      isFeatured: dto.isFeatured ?? false,
      minTierLevel: dto.minTierLevel ?? 0,
      isFavorited: dto.isFavorited ?? false,
      isApplied: dto.isApplied ?? false,
      isAvailable: dto.isAvailable ?? true,
    });
  }
}
