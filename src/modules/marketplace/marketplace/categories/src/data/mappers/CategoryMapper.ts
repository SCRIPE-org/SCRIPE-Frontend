import { AppCategory } from "../../domain/entities/AppCategory";
import type { AppCategoryData } from "../../domain/entities/AppCategory";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

/** API response shape matching AppCategoryResponse from backend. */
export interface CategoryDto {
  id: string;
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  icon?: string | null;
  description?: string;
  sortOrder?: number;
  appCount?: number;
  isActive?: boolean;
  createdAt?: string;
}

const CategoryDtoSchema = z.object({
  id: uuidField(),
  nameEn: optionalString(),
  nameAr: optionalString(),
  slug: optionalString(),
  icon: z.string().optional().nullable(),
  description: optionalString(),
  sortOrder: z.number().int().optional().default(0),
  appCount: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  createdAt: z.string().optional().nullable(),
});

/**
 * Standalone mapper for AppCategory DTO ↔ Entity conversions.
 * Maps backend field names (nameEn, icon) to frontend entity fields (name, iconUrl).
 */
export class CategoryMapper {
  /** Maps a backend CategoryDto to a domain AppCategory entity. */
  static toEntity(d: CategoryDto): AppCategory {
    const validated = safeParseApiResponse(CategoryDtoSchema, d, "AppCategory");

    return new AppCategory({
      id: validated.id ?? "",
      name: validated.nameEn ?? "",
      nameAr: validated.nameAr ?? "",
      slug: validated.slug ?? "",
      iconUrl: validated.icon ?? null,
      description: validated.description ?? "",
      descriptionAr: "",
      appCount: validated.appCount ?? 0,
      sortOrder: validated.sortOrder ?? 0,
      isActive: validated.isActive ?? true,
      createdAt: validated.createdAt ?? new Date().toISOString(),
    } satisfies AppCategoryData);
  }
}
