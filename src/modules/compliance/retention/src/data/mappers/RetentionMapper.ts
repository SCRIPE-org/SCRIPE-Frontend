/**
 * Retention Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import type { RetentionPolicyData } from "../../domain/entities/RetentionPolicy";
import type { RetentionPolicyModel } from "../models/RetentionModels";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString, optionalIsoDate } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const RetentionPolicyModelSchema = z.object({
  id: uuidField(),
  policyId: z.string().optional().nullable(),
  category: optionalString(),
  legalBasis: z.string().optional().nullable(),
  retentionDays: z.number().int().optional().default(0),
  minRetentionDays: z.number().int().optional().default(0),
  maxRetentionDays: z.number().int().optional().default(0),
  expiryAction: z.string().optional().default("Delete"),
  nextEvaluationAt: optionalIsoDate(),
  lastExecutionAt: optionalIsoDate(),
  recordsProcessedLast: z.number().int().optional().nullable(),
  isActive: z.boolean().optional().default(false),
});

export class RetentionMapper {
  static toEntity(model: RetentionPolicyModel): RetentionPolicy {
    const validated = safeParseApiResponse(RetentionPolicyModelSchema, model, "RetentionPolicy");

    const data: RetentionPolicyData = {
      id: validated.id,
      policyId: validated.policyId ?? undefined,
      category: validated.category ?? "",
      legalBasis: validated.legalBasis ?? undefined,
      retentionDays: validated.retentionDays ?? 0,
      minRetentionDays: validated.minRetentionDays ?? 0,
      maxRetentionDays: validated.maxRetentionDays ?? 0,
      expiryAction: (validated.expiryAction ?? "Delete") as RetentionPolicyData["expiryAction"],
      nextEvaluationAt: validated.nextEvaluationAt ?? "",
      lastExecutionAt: validated.lastExecutionAt ?? undefined,
      recordsProcessedLast: validated.recordsProcessedLast ?? undefined,
      isActive: validated.isActive ?? false,
    };
    return new RetentionPolicy(data);
  }
}
