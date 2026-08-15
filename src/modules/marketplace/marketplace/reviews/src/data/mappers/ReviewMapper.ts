import { AppReview } from "../../domain/entities/AppReview";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

/**
 * API response shape for an app review.
 *
 * Matches Marketplace.Application.DTOs.AppReviewListResponse: Id,
 * AppListingId, AppName, Rating, Title, Content, HasReply, CreatedAt.
 * There is no tenantId, tenant/reviewer name, or `body` field on the wire —
 * the review text is sent as `content`.
 */
export interface ReviewDto {
  id: string;
  appListingId: string;
  appName?: string;
  tenantId?: string;
  rating?: number;
  title?: string;
  content?: string;
  createdAt?: string;
  isModerated?: boolean;
}

const ReviewDtoSchema = z.object({
  id: uuidField(),
  appListingId: uuidField(),
  appName: optionalString(),
  tenantId: z.string().optional(),
  rating: z.number().min(0).max(5).optional().default(0),
  title: optionalString(),
  content: optionalString(),
  createdAt: z.string().optional().nullable(),
  isModerated: z.boolean().optional().default(false),
});

/**
 * Standalone mapper for AppReview DTO ↔ Entity conversions.
 * Centralizes null-coalescing and field mapping in one reusable class.
 */
export class ReviewMapper {
  /** Maps a backend ReviewDto to a domain AppReview entity. */
  static toEntity(d: ReviewDto): AppReview {
    const validated = safeParseApiResponse(ReviewDtoSchema, d, "AppReview");

    return new AppReview({
      id: validated.id,
      appListingId: validated.appListingId,
      appName: validated.appName ?? "",
      tenantId: validated.tenantId,
      rating: validated.rating ?? 0,
      title: validated.title ?? "",
      body: validated.content ?? "",
      createdAt: validated.createdAt ?? new Date().toISOString(),
      isModerated: validated.isModerated ?? false,
    });
  }
}
