import { DeveloperProfile } from "../../domain/entities/DeveloperProfile";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

/** API response shape matching DeveloperProfileListResponse from backend. */
export interface DeveloperDto {
  id: string;
  tenantId: string;
  developerName?: string;
  supportEmail?: string;
  website?: string | null;
  bio?: string | null;
  logoUrl?: string | null;
  isVerified?: boolean;
  appCount?: number;
  totalRevenue?: number;
  currency?: string;
  createdAt?: string;
}

const DeveloperDtoSchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  developerName: optionalString(),
  supportEmail: z.string().email().optional().nullable(),
  website: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  isVerified: z.boolean().optional().default(false),
  appCount: z.number().int().optional().default(0),
  totalRevenue: z.number().optional().default(0),
  currency: z.string().optional().default("USD"),
  createdAt: z.string().optional().nullable(),
});

/**
 * Standalone mapper for DeveloperProfile DTO ↔ Entity conversions.
 * Maps backend field names (developerName, supportEmail) to frontend entity fields
 * (displayName, contactEmail).
 */
export class DeveloperMapper {
  /** Maps a backend DeveloperDto to a domain DeveloperProfile entity. */
  static toEntity(d: DeveloperDto): DeveloperProfile {
    const validated = safeParseApiResponse(DeveloperDtoSchema, d, "DeveloperProfile");

    return new DeveloperProfile({
      id: validated.id,
      tenantId: validated.tenantId,
      displayName: validated.developerName ?? "",
      contactEmail: validated.supportEmail ?? "",
      website: validated.website ?? null,
      bio: validated.bio ?? null,
      logoUrl: validated.logoUrl ?? null,
      isVerified: validated.isVerified ?? false,
      appCount: validated.appCount ?? 0,
      totalRevenue: validated.totalRevenue ?? 0,
      currency: validated.currency ?? "USD",
      createdAt: validated.createdAt ?? new Date().toISOString(),
    });
  }
}
