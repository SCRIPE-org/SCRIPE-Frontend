/**
 * Edition Mapper — Model ↔ Entity conversion
 */
import { Edition } from "../../domain/entities/Edition";
import { EditionVersion } from "../../domain/entities/EditionVersion";
import type { EditionData } from "../../domain/entities/Edition";
import type { EditionModel } from "../models/EditionModels";
import type { EditionVersionModel } from "../models/EditionModels";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../domain/entities/EditionRequests";

export class EditionMapper {
  static toEntity(model: EditionModel): Edition {
    const data: EditionData = {
      id: model.id,
      name: model.name,
      displayNameEn: model.displayNameEn,
      displayNameAr: model.displayNameAr,
      description: model.description,
      tagline: model.tagline,
      recommendationLabels: model.recommendationLabels,
      isSystem: model.isSystem,
      isRetired: model.isRetired,
      tierLevel: model.tierLevel ?? 0,
      createdByTenantId: model.createdByTenantId,
      featureCount: model.featureCount,
      features: model.features,
      fallbackEditionId: model.fallbackEditionId,
      fallbackEditionName: model.fallbackEditionName,
      overflowPolicy: model.overflowPolicy,
      baseMonthlyPriceUsd: model.baseMonthlyPriceUsd,
      // ── Billing Controls ──
      allowMonthly: model.allowMonthly,
      allowYearly: model.allowYearly,
      allowLifetime: model.allowLifetime,
      allowTrial: model.allowTrial,
      trialDurationDays: model.trialDurationDays,
      trialIsFree: model.trialIsFree,
      trialDiscountPercent: model.trialDiscountPercent,
      gracePeriodDays: model.gracePeriodDays,
      maxActiveSubscriptions: model.maxActiveSubscriptions ?? -1,
      // ── Self-Service Controls ──
      isSelfServiceEnabled: model.isSelfServiceEnabled ?? true,
      isContactSalesOnly: model.isContactSalesOnly ?? false,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new Edition(data);
  }

  static toVersionEntity(model: EditionVersionModel): EditionVersion {
    return new EditionVersion(model);
  }

  static toCreateJson(request: CreateEditionRequest): CreateEditionRequest {
    return {
      name: request.name,
      displayNameEn: request.displayNameEn,
      displayNameAr: request.displayNameAr,
      description: request.description,
      tagline: request.tagline,
      recommendationLabels: request.recommendationLabels,
      fallbackEditionId: request.fallbackEditionId || undefined,
      tierLevel: request.tierLevel ?? 0,
      // ── Billing Controls ──
      allowMonthly: request.allowMonthly ?? true,
      allowYearly: request.allowYearly ?? true,
      allowLifetime: request.allowLifetime ?? true,
      allowTrial: request.allowTrial ?? true,
      trialDurationDays: request.trialDurationDays ?? 14,
      trialIsFree: request.trialIsFree ?? true,
      trialDiscountPercent: request.trialDiscountPercent ?? 100,
      gracePeriodDays: request.gracePeriodDays ?? 0,
      maxActiveSubscriptions: request.maxActiveSubscriptions ?? -1,
      isSelfServiceEnabled: request.isSelfServiceEnabled ?? true,
      isContactSalesOnly: request.isContactSalesOnly ?? false,
    };
  }

  static toUpdateJson(request: UpdateEditionRequest): UpdateEditionRequest {
    const json: UpdateEditionRequest = {
      name: request.name,
      displayNameEn: request.displayNameEn,
      displayNameAr: request.displayNameAr,
      description: request.description,
      tagline: request.tagline,
      recommendationLabels: request.recommendationLabels,
      fallbackEditionId: request.fallbackEditionId || undefined,
      overflowPolicy: request.overflowPolicy || "Block",
      tierLevel: request.tierLevel,
    };
    // ── Billing Controls (only send if defined) ──
    if (request.allowMonthly !== undefined) json.allowMonthly = request.allowMonthly;
    if (request.allowYearly !== undefined) json.allowYearly = request.allowYearly;
    if (request.allowLifetime !== undefined) json.allowLifetime = request.allowLifetime;
    if (request.allowTrial !== undefined) json.allowTrial = request.allowTrial;
    if (request.trialDurationDays !== undefined) json.trialDurationDays = request.trialDurationDays;
    if (request.trialIsFree !== undefined) json.trialIsFree = request.trialIsFree;
    if (request.trialDiscountPercent !== undefined) json.trialDiscountPercent = request.trialDiscountPercent;
    if (request.gracePeriodDays !== undefined) json.gracePeriodDays = request.gracePeriodDays;
    if (request.maxActiveSubscriptions !== undefined) json.maxActiveSubscriptions = request.maxActiveSubscriptions;
    if (request.isSelfServiceEnabled !== undefined) json.isSelfServiceEnabled = request.isSelfServiceEnabled;
    if (request.isContactSalesOnly !== undefined) json.isContactSalesOnly = request.isContactSalesOnly;
    return json;
  }
}
