/**
 * Zod Utilities — Shared helpers for safe API response validation
 *
 * Use `safeParseApiResponse` in every mapper's `toEntity()` to catch
 * backend contract drift before it silently corrupts frontend state.
 */

import { z } from "zod";
import { appLogger } from "@core/common/logger";

// ─── Safe Parse ──────────────────────────────────────────────────────────────

/**
 * Safely parse an API response against a Zod schema.
 *
 * - On success: returns the parsed (coerced/transformed) data.
 * - On failure: logs a warning with field-level errors and returns the
 *   raw data unchanged so the app degrades gracefully rather than crashing.
 *
 * @example
 * const validated = safeParseApiResponse(AdminResponseSchema, raw, "Admin");
 */
export function safeParseApiResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  entityName: string
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  [${i.path.join(".")}] ${i.message}`);
    appLogger.warn(
      `[Zod] API response validation failed for "${entityName}":\n${issues.join("\n")}`,
      { entityName, issues: result.error.issues }
    );
    // Return raw data — allows graceful degradation over hard crash
    return data as T;
  }

  return result.data;
}

// ─── Common Field Builders ────────────────────────────────────────────────────

/** Required non-empty string */
export const requiredString = (max?: number) => {
  let s = z.string().min(1);
  if (max) s = s.max(max);
  return s;
};

/** Optional string — coerces null/undefined to empty string */
export const optionalString = (max?: number) => {
  let s = z.string().optional().nullable().default("");
  if (max) s = z.string().max(max).optional().nullable().default("");
  return s;
};

/** ISO date string → coerce to string, validate format */
export const isoDateString = () =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Expected ISO date string");

/** Optional ISO date string */
export const optionalIsoDate = () =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, "Expected ISO date string")
    .optional()
    .nullable();

/** Entity ID field (supports raw UUIDs and encrypted IDs) */
export const uuidField = () => z.string().min(1, "Expected valid entity ID");

/** Optional Entity ID */
export const optionalUuid = () => z.string().optional().nullable();

/** URL field */
export const urlField = () => z.string().url("Expected valid URL").optional().nullable();

/** Paginated list wrapper */
export const pagedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    totalCount: z.number().int().min(0),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).optional(),
  });

// ─── Base Entity Schemas ──────────────────────────────────────────────────────

/** Common auditable entity fields (mirrors AuditableEntity backend) */
export const AuditableEntitySchema = z.object({
  id: uuidField(),
  createdAt: isoDateString().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: isoDateString().optional().nullable(),
  updatedBy: z.string().optional().nullable(),
  isDeleted: z.boolean().optional().default(false),
});
