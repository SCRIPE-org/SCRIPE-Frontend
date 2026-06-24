/**
 * Override Mapper — Model ↔ Entity conversion
 *
 * Maps OverrideService DTOs to domain entities.
 */
import { FeatureOverride, ResolvedFeature } from "../../domain/entities/Override";
import type { FeatureOverrideData, ResolvedFeatureData } from "../../domain/entities/Override";
import type { FeatureOverrideModel, ResolvedFeatureModel } from "../models/OverrideModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const FeatureOverrideModelSchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  featureId: uuidField(),
  featureName: z.string(),
  value: z.string().optional().nullable(),
  valueType: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  createdAt: optionalIsoDate(),
  modifiedAt: optionalIsoDate(),
  costAmountUsd: z.number().optional().nullable(),
  costReason: z.string().optional().nullable(),
});

const ResolvedFeatureModelSchema = z.object({
  featureId: uuidField(),
  key: z.string().min(1),
  nameEn: optionalString(),
  nameAr: optionalString(),
  valueType: z.string().optional().nullable(),
  effectiveValue: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class OverrideMapper {
  static toOverrideEntity(model: FeatureOverrideModel): FeatureOverride {
    const v = safeParseApiResponse(FeatureOverrideModelSchema, model, "FeatureOverride");

    const data: FeatureOverrideData = {
      id: v.id,
      tenantId: v.tenantId,
      featureId: v.featureId,
      featureName: v.featureName,
      value: v.value ?? "",
      valueType: v.valueType ?? "Boolean",
      reason: v.reason ?? undefined,
      createdAt: v.createdAt ?? "",
      modifiedAt: v.modifiedAt ?? undefined,
      costAmountUsd: v.costAmountUsd ?? undefined,
      costReason: v.costReason ?? undefined,
    };
    return new FeatureOverride(data);
  }

  static toResolvedEntity(model: ResolvedFeatureModel): ResolvedFeature {
    const v = safeParseApiResponse(ResolvedFeatureModelSchema, model, "ResolvedFeature");

    const data: ResolvedFeatureData = {
      featureId: v.featureId,
      key: v.key,
      nameEn: v.nameEn ?? "",
      nameAr: v.nameAr ?? "",
      valueType: v.valueType ?? "Boolean",
      effectiveValue: v.effectiveValue ?? "",
      source: (v.source as "Default" | "Edition" | "Override") ?? "Default",
    };
    return new ResolvedFeature(data);
  }
}
