/**
 * Theme Bundle Mapper
 *
 * Converts ThemeBundleDto → ThemeBundle entity.
 * Null-coalesces all nullable fields.
 *
 * @module customization/data
 */
import {
  ThemeBundle,
  type BundleType,
  type ThemeBundleContents,
} from "../../domain/entities/ThemeBundle";
import type { ThemeBundleDto } from "../models/ThemeBundleTypes";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const VALID_BUNDLE_TYPES: BundleType[] = [
  "login-only",
  "auth-suite",
  "dashboard-only",
  "full-bundle",
];

const ThemeBundleContentsSchema = z.object({
  loginThemeJson: z.string().optional().nullable(),
  authPageOverrides: z.string().optional().nullable(),
  dashboardThemeJson: z.string().optional().nullable(),
  loginCanvasJson: z.string().optional().nullable(),
  dashboardCanvasJson: z.string().optional().nullable(),
}).optional().nullable();

const ThemeBundleDtoSchema = z.object({
  id: uuidField(),
  slug: optionalString(),
  name: optionalString(),
  description: optionalString(),
  bundleType: z.string().optional().default("full-bundle"),
  contents: ThemeBundleContentsSchema,
  accentColor: z.string().optional().default("#6366f1"),
  thumbnailUrl: optionalString(),
  screenshots: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  authorName: z.string().optional().default("SCRIPE"),
  version: z.string().optional().default("1.0.0"),
  publishedAt: optionalString(),
  isFree: z.boolean().optional().default(true),
  isSystem: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  minTierLevel: z.number().int().optional().default(0),
  isFavorited: z.boolean().optional().default(false),
  isApplied: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
});

export class ThemeBundleMapper {
  static toEntity(dto: ThemeBundleDto): ThemeBundle {
    const validated = safeParseApiResponse(ThemeBundleDtoSchema, dto, "ThemeBundle");

    const bundleType: BundleType = VALID_BUNDLE_TYPES.includes(validated.bundleType as BundleType)
      ? (validated.bundleType as BundleType)
      : "full-bundle";

    const contents: ThemeBundleContents = {
      loginThemeJson: validated.contents?.loginThemeJson ?? undefined,
      authPageOverrides: validated.contents?.authPageOverrides ?? undefined,
      dashboardThemeJson: validated.contents?.dashboardThemeJson ?? undefined,
      loginCanvasJson: validated.contents?.loginCanvasJson ?? undefined,
      dashboardCanvasJson: validated.contents?.dashboardCanvasJson ?? undefined,
    };

    return new ThemeBundle({
      id: validated.id ?? "",
      slug: validated.slug ?? "",
      name: validated.name ?? "",
      description: validated.description ?? "",
      bundleType,
      contents,
      accentColor: validated.accentColor ?? "#6366f1",
      thumbnailUrl: validated.thumbnailUrl ?? "",
      screenshots: validated.screenshots ?? [],
      tags: validated.tags ?? [],
      authorName: validated.authorName ?? "SCRIPE",
      version: validated.version ?? "1.0.0",
      publishedAt: validated.publishedAt ?? "",
      isFree: validated.isFree ?? true,
      isSystem: validated.isSystem ?? false,
      isFeatured: validated.isFeatured ?? false,
      minTierLevel: validated.minTierLevel ?? 0,
      isFavorited: validated.isFavorited ?? false,
      isApplied: validated.isApplied ?? false,
      isAvailable: validated.isAvailable ?? true,
    });
  }
}
