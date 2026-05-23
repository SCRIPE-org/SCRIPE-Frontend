
import { AppListing, type AppListingData } from "../../domain/entities/AppListing";
import type { AppListingDto } from "../models/AppListingModel";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString, optionalIsoDate } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const AppListingDtoSchema = z.object({
  id: uuidField(),
  developerProfileId: z.string().optional().nullable(),
  developerName: optionalString(),
  name: optionalString(),
  nameAr: optionalString(),
  description: optionalString(),
  descriptionAr: optionalString(),
  categoryId: optionalString(),
  categoryName: optionalString(),
  iconUrl: z.string().optional().nullable(),
  screenshotUrls: z.array(z.string()).optional().default([]),
  version: z.string().optional().default("1.0.0"),
  pricingModel: z.string().optional().default("Free"),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  billingInterval: z.string().optional().nullable(),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  averageRating: z.number().optional().default(0),
  reviewCount: z.number().int().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  publishedAt: z.string().optional().nullable(),
  createdAt: optionalString(),
  updatedAt: z.string().optional().nullable(),
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
      nameAr: validated.nameAr ?? "",
      description: validated.description ?? "",
      descriptionAr: validated.descriptionAr ?? "",
      categoryId: validated.categoryId ?? "",
      categoryName: validated.categoryName ?? "",
      iconUrl: validated.iconUrl ?? null,
      screenshotUrls: validated.screenshotUrls ?? [],
      version: validated.version ?? "1.0.0",
      pricingModel: (validated.pricingModel ?? "Free") as AppListingData["pricingModel"],
      price: validated.price ?? null,
      currency: validated.currency ?? null,
      billingInterval: (validated.billingInterval ?? null) as AppListingData["billingInterval"],
      isPublished: validated.isPublished ?? false,
      isFeatured: validated.isFeatured ?? false,
      averageRating: validated.averageRating ?? 0,
      reviewCount: validated.reviewCount ?? 0,
      tags: validated.tags ?? [],
      publishedAt: validated.publishedAt ?? null,
      createdAt: validated.createdAt ?? new Date().toISOString(),
      updatedAt: validated.updatedAt ?? null,
    };
    return new AppListing(data);
  }
}
