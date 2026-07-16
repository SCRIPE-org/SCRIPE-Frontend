/**
 * Feature Mapper — Model ↔ Entity conversion
 *
 * All model→entity transformations go through this mapper.
 * Repositories MUST use mapper methods — never construct entities directly.
 */
import { Feature } from "../../domain/entities/Feature";
import type { FeatureData, FeatureValueType } from "../../domain/entities/Feature";
import { TenantEffectiveFeature } from "../../domain/entities/TenantEffectiveFeature";
import type { TenantEffectiveFeatureData } from "../../domain/entities/TenantEffectiveFeature";
import type { FeatureModel, TenantEffectiveFeatureModel } from "../models/FeatureModels";
import type {
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from "../../domain/entities/FeatureRequests";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const FeatureModelSchema = z.object({
  id: uuidField(),
  name: z.string().min(1),
  displayNameEn: z.string(),
  displayNameAr: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isVisibleInUI: z.boolean().optional().default(true),
  valueType: z.string(),
  defaultValue: z.string().optional().nullable(),
  module: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isSystem: z.boolean().optional().default(false),
  isMarketingOnly: z.boolean().optional().default(false),
  createdAt: optionalIsoDate(),
  modifiedAt: optionalIsoDate(),
});

const TenantEffectiveFeatureModelSchema = z.object({
  featureId: uuidField(),
  name: z.string().min(1),
  displayNameEn: z.string(),
  displayNameAr: z.string().optional().nullable(),
  valueType: optionalString(),
  editionValue: optionalString(),
  overrideValue: z.string().optional().nullable(),
  effectiveValue: optionalString(),
  category: z.string().optional().nullable(),
  module: z.string().optional().nullable(),
  hasOverride: z.boolean().optional().default(false),
});

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class FeatureMapper {
  static toEntity(model: FeatureModel): Feature {
    const validated = safeParseApiResponse(FeatureModelSchema, model, "Feature");

    const data: FeatureData = {
      id: validated.id,
      name: validated.name,
      displayNameEn: validated.displayNameEn,
      displayNameAr: validated.displayNameAr ?? "",
      category: validated.category ?? "",
      sortOrder: validated.sortOrder ?? 0,
      isVisibleInUI: validated.isVisibleInUI ?? true,
      valueType: validated.valueType as FeatureValueType,
      defaultValue: validated.defaultValue ?? "",
      module: validated.module ?? "",
      description: validated.description ?? "",
      isSystem: validated.isSystem,
      isMarketingOnly: validated.isMarketingOnly ?? false,
      createdAt: validated.createdAt ?? new Date().toISOString(),
      modifiedAt: validated.modifiedAt ?? new Date().toISOString(),
    };
    return new Feature(data);
  }

  static toEffectiveEntity(model: TenantEffectiveFeatureModel): TenantEffectiveFeature {
    const validated = safeParseApiResponse(
      TenantEffectiveFeatureModelSchema,
      model,
      "TenantEffectiveFeature"
    );

    const data: TenantEffectiveFeatureData = {
      featureId: validated.featureId,
      name: validated.name,
      displayNameEn: validated.displayNameEn,
      displayNameAr: validated.displayNameAr ?? "",
      valueType: validated.valueType ?? "",
      editionValue: validated.editionValue ?? "",
      overrideValue: validated.overrideValue ?? null,
      effectiveValue: validated.effectiveValue ?? "",
      category: validated.category ?? "",
      module: validated.module ?? "",
      hasOverride: validated.hasOverride ?? false,
    };
    return new TenantEffectiveFeature(data);
  }

  static toCreateJson(request: CreateFeatureRequest): CreateFeatureRequest {
    return {
      name: request.name,
      valueType: request.valueType,
      defaultValue: request.defaultValue,
      module: request.module,
      description: request.description,
      displayNameEn: request.displayNameEn,
      displayNameAr: request.displayNameAr,
      category: request.category,
      sortOrder: request.sortOrder ?? 0,
      isVisibleInUI: request.isVisibleInUI ?? true,
      isMarketingOnly: request.isMarketingOnly ?? false,
    };
  }

  static toUpdateJson(request: UpdateFeatureRequest): UpdateFeatureRequest {
    return {
      name: request.name,
      defaultValue: request.defaultValue,
      description: request.description,
      displayNameEn: request.displayNameEn,
      displayNameAr: request.displayNameAr,
      category: request.category,
      sortOrder: request.sortOrder,
      isVisibleInUI: request.isVisibleInUI,
      isMarketingOnly: request.isMarketingOnly,
    };
  }
}
