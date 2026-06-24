/**
 * TenantPlan Mapper — Model ↔ Entity conversion
 *
 * Elevated Tier 2 Architecture: maps pricing matrix, feature catalog,
 * version snapshots, and lifecycle status.
 */
import {
  TenantPlan,
  TenantFeatureDefinition,
  TenantPlanPromotion,
} from "../../domain/entities/TenantPlan";
import type {
  TenantPlanData,
  TenantFeatureDefinitionData,
  TenantPlanPromotionData,
} from "../../domain/entities/TenantPlan";
import type {
  TenantPlanModel,
  TenantPlanListModel,
  TenantFeatureDefinitionModel,
  TenantFeatureDefinitionListModel,
  TenantFeatureDefinitionCategoryGroupModel,
  TenantPlanPromotionModel,
  TenantPlanPromotionListModel,
} from "../models/TenantPlanModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const TenantPlanModelSchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  name: optionalString(),
  displayNameEn: z.string().optional().nullable(),
  displayNameAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  status: z.string().optional().default("Draft"),
  isActive: z.boolean().optional().default(true),
  isPublic: z.boolean().optional().default(true),
  badgeText: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  maxSubscribers: z.number().int().optional().nullable(),
  maxUsers: z.number().int().optional().default(-1),
  allowMonthly: z.boolean().optional().default(true),
  allowYearly: z.boolean().optional().default(false),
  allowLifetime: z.boolean().optional().default(false),
  allowTrial: z.boolean().optional().default(false),
  isSelfServiceEnabled: z.boolean().optional().default(false),
  isContactSalesOnly: z.boolean().optional().default(false),
  trialDays: z.number().int().optional().default(0),
  gracePeriodDays: z.number().int().optional().default(0),
  fallbackPlanId: z.string().optional().nullable(),
  tierLevel: z.number().int().optional().default(0),
  sortOrder: z.number().int().optional().default(0),
  currentVersion: z.number().int().optional().default(0),
  activeSubscriberCount: z.number().int().optional().default(0),
  features: z.array(z.any()).optional().default([]),
  prices: z.array(z.any()).optional().default([]),
  versions: z.array(z.any()).optional().default([]),
  createdAt: optionalIsoDate(),
  updatedAt: z.string().optional().nullable(),
});

const TenantPlanListModelSchema = z.object({
  id: uuidField(),
  name: optionalString(),
  displayNameEn: z.string().optional().nullable(),
  displayNameAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.string().optional().default("Draft"),
  isActive: z.boolean().optional().default(true),
  isPublic: z.boolean().optional().default(true),
  badgeText: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  maxUsers: z.number().int().optional().default(-1),
  allowMonthly: z.boolean().optional().default(true),
  allowYearly: z.boolean().optional().default(false),
  allowLifetime: z.boolean().optional().default(false),
  allowTrial: z.boolean().optional().default(false),
  trialDays: z.number().int().optional().default(0),
  tierLevel: z.number().int().optional().default(0),
  sortOrder: z.number().int().optional().default(0),
  currentVersion: z.number().int().optional().default(0),
  activeSubscriberCount: z.number().int().optional().default(0),
  createdAt: z.string().optional().nullable(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class TenantPlanMapper {
  static toEntity(model: TenantPlanModel): TenantPlan {
    const validated = safeParseApiResponse(TenantPlanModelSchema, model, "TenantPlan");

    const data: TenantPlanData = {
      id: validated.id,
      tenantId: validated.tenantId,
      name: validated.name ?? "",
      displayNameEn: validated.displayNameEn ?? "",
      displayNameAr: validated.displayNameAr ?? "",
      description: validated.description ?? "",
      tagline: validated.tagline ?? "",
      status: validated.status ?? "Draft",
      isActive: validated.isActive ?? true,
      isPublic: validated.isPublic ?? true,
      badgeText: validated.badgeText ?? "",
      color: validated.color ?? "",
      iconName: validated.iconName ?? "",
      maxSubscribers: validated.maxSubscribers ?? 0,
      maxUsers: validated.maxUsers ?? -1,
      allowMonthly: validated.allowMonthly ?? true,
      allowYearly: validated.allowYearly ?? false,
      allowLifetime: validated.allowLifetime ?? false,
      allowTrial: validated.allowTrial ?? false,
      isSelfServiceEnabled: validated.isSelfServiceEnabled ?? false,
      isContactSalesOnly: validated.isContactSalesOnly ?? false,
      trialDays: validated.trialDays ?? 0,
      gracePeriodDays: validated.gracePeriodDays ?? 0,
      fallbackPlanId: validated.fallbackPlanId ?? "",
      tierLevel: validated.tierLevel ?? 0,
      sortOrder: validated.sortOrder ?? 0,
      currentVersion: validated.currentVersion ?? 0,
      activeSubscriberCount: validated.activeSubscriberCount ?? 0,
      features: (validated.features ?? []).map(
        (f: {
          featureDefinitionId?: string;
          id?: string;
          featureKey?: string;
          key?: string;
          featureDisplayNameEn?: string;
          displayNameEn?: string;
          featureDisplayNameAr?: string;
          displayNameAr?: string;
          featureValueType?: string;
          valueType?: string;
          value?: string;
          overrideLabel?: string;
          category?: string;
        }) => ({
          featureDefinitionId: f.featureDefinitionId ?? f.id ?? "",
          featureKey: f.featureKey ?? f.key ?? "",
          featureDisplayNameEn: f.featureDisplayNameEn ?? f.displayNameEn,
          featureDisplayNameAr: f.featureDisplayNameAr ?? f.displayNameAr,
          featureValueType: f.featureValueType ?? f.valueType ?? "Boolean",
          value: f.value ?? "",
          overrideLabel: f.overrideLabel ?? f.category,
        })
      ),
      prices: validated.prices ?? [],
      versions: validated.versions ?? [],
      createdAt: validated.createdAt ?? "",
      updatedAt: validated.updatedAt ?? undefined,
    };
    return new TenantPlan(data);
  }

  static toEntityFromList(model: TenantPlanListModel, tenantId: string = ""): TenantPlan {
    const validated = safeParseApiResponse(TenantPlanListModelSchema, model, "TenantPlanListItem");

    const data: TenantPlanData = {
      id: validated.id,
      tenantId,
      name: validated.name ?? "",
      displayNameEn: validated.displayNameEn ?? undefined,
      displayNameAr: validated.displayNameAr ?? undefined,
      description: validated.description ?? undefined,
      status: validated.status ?? "Draft",
      isActive: validated.isActive ?? true,
      isPublic: validated.isPublic ?? true,
      badgeText: validated.badgeText ?? undefined,
      color: validated.color ?? undefined,
      maxUsers: validated.maxUsers ?? -1,
      allowMonthly: validated.allowMonthly ?? true,
      allowYearly: validated.allowYearly ?? false,
      allowLifetime: validated.allowLifetime ?? false,
      allowTrial: validated.allowTrial ?? false,
      isSelfServiceEnabled: false,
      isContactSalesOnly: false,
      trialDays: validated.trialDays ?? 0,
      gracePeriodDays: 0,
      tierLevel: validated.tierLevel ?? 0,
      sortOrder: validated.sortOrder ?? 0,
      currentVersion: validated.currentVersion ?? 0,
      activeSubscriberCount: validated.activeSubscriberCount ?? 0,
      createdAt: validated.createdAt ?? "",
    };
    return new TenantPlan(data);
  }

  // ── Feature Definition Mappers ──
  static toFeatureDefinitionEntity(
    model: TenantFeatureDefinitionModel | TenantFeatureDefinitionListModel
  ): TenantFeatureDefinition {
    const data: TenantFeatureDefinitionData = {
      id: model.id,
      tenantId: "tenantId" in model ? model.tenantId : undefined,
      key: model.key ?? "",
      displayNameEn: model.displayNameEn,
      displayNameAr: model.displayNameAr,
      valueType: model.valueType ?? "Boolean",
      defaultValue: model.defaultValue,
      category: model.category,
      description: "description" in model ? model.description : undefined,
      sortOrder: model.sortOrder ?? 0,
      isActive: model.isActive ?? true,
      planUsageCount: model.planUsageCount ?? 0,
      createdAt: model.createdAt,
      updatedAt: "updatedAt" in model ? model.updatedAt : undefined,
    };
    return new TenantFeatureDefinition(data);
  }

  /**
   * Convert backend-grouped feature definitions to domain entities.
   * Preserves the category structure — zero client-side groupBy needed.
   */
  static toFeatureDefinitionCategoryGroupList(
    models: TenantFeatureDefinitionCategoryGroupModel[]
  ): import("../../domain/entities/TenantPlan").TenantFeatureDefinitionCategoryGroup[] {
    return models.map((group) => ({
      category: group.category,
      definitions: group.definitions.map((d) => TenantPlanMapper.toFeatureDefinitionEntity(d)),
    }));
  }

  // ── Promotion Mappers ──
  static toPromotionEntity(
    model: TenantPlanPromotionModel | TenantPlanPromotionListModel
  ): TenantPlanPromotion {
    const data: TenantPlanPromotionData = {
      id: model.id,
      tenantPlanId: "tenantPlanId" in model ? model.tenantPlanId : undefined,
      tenantPlanName: model.tenantPlanName,
      code: model.code ?? "",
      description: "description" in model ? model.description : undefined,
      discountType: model.discountType ?? "Percentage",
      discountValue: model.discountValue ?? 0,
      maxRedemptions: model.maxRedemptions,
      currentRedemptions: model.currentRedemptions ?? 0,
      startsAt: model.startsAt ?? "",
      expiresAt: model.expiresAt,
      isActive: model.isActive ?? true,
      minimumAmount: "minimumAmount" in model ? model.minimumAmount : undefined,
      applicableCycles: "applicableCycles" in model ? model.applicableCycles : undefined,
      isAutoApplied: model.isAutoApplied ?? false,
      isStackable: "isStackable" in model ? model.isStackable : false,
      isValid: model.isValid ?? true,
      createdAt: model.createdAt,
      updatedAt: "updatedAt" in model ? model.updatedAt : undefined,
    };
    return new TenantPlanPromotion(data);
  }
}
