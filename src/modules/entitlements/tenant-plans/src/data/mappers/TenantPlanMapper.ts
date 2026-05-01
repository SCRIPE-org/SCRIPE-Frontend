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
  TenantPlanPromotionModel,
  TenantPlanPromotionListModel,
} from "../models/TenantPlanModels";

export class TenantPlanMapper {
  static toEntity(model: TenantPlanModel): TenantPlan {
    const data: TenantPlanData = {
      id: model.id,
      tenantId: model.tenantId,
      name: model.name ?? "",
      displayNameEn: model.displayNameEn,
      displayNameAr: model.displayNameAr,
      description: model.description,
      tagline: model.tagline,
      status: model.status ?? "Draft",
      isActive: model.isActive ?? true,
      isPublic: model.isPublic ?? true,
      badgeText: model.badgeText,
      color: model.color,
      iconName: model.iconName,
      maxSubscribers: model.maxSubscribers,
      maxUsers: model.maxUsers ?? -1,
      allowMonthly: model.allowMonthly ?? true,
      allowYearly: model.allowYearly ?? false,
      allowLifetime: model.allowLifetime ?? false,
      allowTrial: model.allowTrial ?? false,
      isSelfServiceEnabled: model.isSelfServiceEnabled ?? false,
      isContactSalesOnly: model.isContactSalesOnly ?? false,
      trialDays: model.trialDays ?? 0,
      gracePeriodDays: model.gracePeriodDays ?? 0,
      fallbackPlanId: model.fallbackPlanId,
      tierLevel: model.tierLevel ?? 0,
      sortOrder: model.sortOrder ?? 0,
      currentVersion: model.currentVersion ?? 0,
      activeSubscriberCount: model.activeSubscriberCount ?? 0,
      features: (model.features ?? []).map(
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
      prices: model.prices ?? [],
      versions: model.versions ?? [],
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
    return new TenantPlan(data);
  }

  static toEntityFromList(model: TenantPlanListModel, tenantId: string = ""): TenantPlan {
    const data: TenantPlanData = {
      id: model.id,
      tenantId,
      name: model.name ?? "",
      displayNameEn: model.displayNameEn,
      displayNameAr: model.displayNameAr,
      description: model.description,
      status: model.status ?? "Draft",
      isActive: model.isActive ?? true,
      isPublic: model.isPublic ?? true,
      badgeText: model.badgeText,
      color: model.color,
      maxUsers: model.maxUsers ?? -1,
      allowMonthly: model.allowMonthly ?? true,
      allowYearly: model.allowYearly ?? false,
      allowLifetime: model.allowLifetime ?? false,
      allowTrial: model.allowTrial ?? false,
      isSelfServiceEnabled: false,
      isContactSalesOnly: false,
      trialDays: model.trialDays ?? 0,
      gracePeriodDays: 0,
      tierLevel: model.tierLevel ?? 0,
      sortOrder: model.sortOrder ?? 0,
      currentVersion: model.currentVersion ?? 0,
      activeSubscriberCount: model.activeSubscriberCount ?? 0,
      createdAt: model.createdAt,
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
