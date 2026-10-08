import { AppListing, type AppListingData } from "../../domain/entities/AppListing";
import type { AppListingDto } from "../models/AppListingModel";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const AppListingPricingDtoSchema = z.object({
  id: z.string().optional(),
  model: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  trialDays: z.number().optional(),
});

const AppListingScreenshotDtoSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().optional(),
  caption: optionalString(),
  sortOrder: z.number().optional(),
});

/**
 * Validates the raw wire shape shared by AppListingListResponse (list/featured)
 * and AppListingResponse (detail) — see AppListingModel.ts for the exact
 * per-endpoint field availability verified against the backend DTOs.
 */
const AppListingDtoSchema = z.object({
  id: uuidField(),
  developerProfileId: z.string().optional().nullable(),
  developerName: optionalString(),
  name: optionalString(),
  tagline: optionalString(),
  description: optionalString(),
  iconUrl: z.string().optional().nullable(),
  version: z.string().optional(),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  averageRating: z.number().optional().default(0),
  reviewCount: z.number().int().optional().default(0),
  totalInstalls: z.number().int().optional().default(0),
  activeInstalls: z.number().int().optional().default(0),
  pricing: AppListingPricingDtoSchema.optional().nullable(),
  pricingModel: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  categoryNames: z.array(z.string()).optional().default([]),
  screenshots: z.array(AppListingScreenshotDtoSchema).optional().default([]),
  createdAt: optionalString(),
});

/**
 * AppListingMapper
 *
 * Converts backend DTO → domain entity.
 * All null-coalescing and default values live here — never in services or repositories.
 */
export class AppListingMapper {
  static toEntity(dto: AppListingDto): AppListing {
    const validated = safeParseApiResponse(AppListingDtoSchema, dto, "AppListing");

    const data: AppListingData = {
      id: validated.id,
      developerProfileId: validated.developerProfileId ?? "",
      developerName: validated.developerName ?? "",
      name: validated.name ?? "",
      // No Arabic name field exists on either backend response.
      nameAr: "",
      // Detail responses send `description`; list/featured only send `tagline`,
      // so fall back to it instead of always rendering a blank blurb.
      description: validated.description ?? validated.tagline ?? "",
      // No Arabic description field exists on the backend.
      descriptionAr: "",
      // Backend never exposes a single category id, only CategoryNames (plural).
      categoryId: "",
      categoryName: (validated.categoryNames ?? []).join(", "),
      iconUrl: validated.iconUrl ?? null,
      // Real field is `screenshots`: an array of {imageUrl, ...} objects, not
      // a `screenshotUrls` string array.
      screenshotUrls: (validated.screenshots ?? [])
        .map((s) => s.imageUrl)
        .filter((url): url is string => !!url),
      version: validated.version ?? "1.0.0",
      pricingModel: (validated.pricingModel ??
        validated.pricing?.model ??
        "Free") as AppListingData["pricingModel"],
      price: validated.price ?? validated.pricing?.price ?? null,
      // Currency is nested under `pricing.currency` on the detail response and
      // is absent entirely from the list response — never a top-level field.
      currency: validated.pricing?.currency ?? null,
      // Backend has no billing-interval concept — Subscription pricing carries
      // no monthly/annual cadence field today.
      billingInterval: null,
      isPublished: validated.isPublished ?? false,
      isFeatured: validated.isFeatured ?? false,
      averageRating: validated.averageRating ?? 0,
      reviewCount: validated.reviewCount ?? 0,
      // No tags concept exists on the backend AppListing entity or DTOs.
      tags: [],
      // No publishedAt field exists on the backend — only CreatedAt is tracked.
      publishedAt: null,
      createdAt: validated.createdAt ?? new Date().toISOString(),
      // Backend response does not include an updatedAt timestamp.
      updatedAt: null,
    };
    return new AppListing(data);
  }
}
