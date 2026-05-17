"use client";

import { AppListing, type AppListingData } from "../../domain/entities/AppListing";
import type { AppListingDto } from "../models/AppListingModel";

/**
 * AppListingMapper
 *
 * Converts backend DTO → domain entity.
 * All null-coalescing and default values live here — never in services or repositories.
 */
export class AppListingMapper {
  static toEntity(dto: AppListingDto): AppListing {
    const data: AppListingData = {
      id: dto.id,
      developerProfileId: dto.developerProfileId,
      developerName: dto.developerName ?? "",
      name: dto.name ?? "",
      nameAr: dto.nameAr ?? "",
      description: dto.description ?? "",
      descriptionAr: dto.descriptionAr ?? "",
      categoryId: dto.categoryId ?? "",
      categoryName: dto.categoryName ?? "",
      iconUrl: dto.iconUrl ?? null,
      screenshotUrls: dto.screenshotUrls ?? [],
      version: dto.version ?? "1.0.0",
      pricingModel: dto.pricingModel ?? "Free",
      price: dto.price ?? null,
      currency: dto.currency ?? null,
      billingInterval: dto.billingInterval ?? null,
      isPublished: dto.isPublished ?? false,
      isFeatured: dto.isFeatured ?? false,
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount ?? 0,
      tags: dto.tags ?? [],
      publishedAt: dto.publishedAt ?? null,
      createdAt: dto.createdAt ?? new Date().toISOString(),
      updatedAt: dto.updatedAt ?? null,
    };
    return new AppListing(data);
  }
}
