/**
 * Edition Mapper — Model ↔ Entity conversion
 */
import { Edition } from "../../domain/entities/Edition";
import { EditionVersion } from "../../domain/entities/EditionVersion";
import type { EditionData } from "../../domain/entities/Edition";
import type { EditionModel } from "../models/EditionModels";
import type { EditionVersionModel } from "../models/EditionModels";
import type {
  CreateEditionRequest,
  UpdateEditionRequest,
} from "../../domain/entities/EditionRequests";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  isoDateString,
} from "@core/common/zod-utils";

// ─── Edition Response Schema ────────────────────────────────────────────────────

const EditionModelSchema = z.object({
  id: uuidField(),
  name: z.string().min(1),
  displayNameEn: z.string().optional().default(""),
  displayNameAr: z.string().optional().default(""),
  description: optionalString(),
  tagline: optionalString(),
  recommendationLabels: z.array(z.string()).optional().nullable(),
  isSystem: z.boolean().optional().default(false),
  isRetired: z.boolean().optional().default(false),
  tierLevel: z.number().int().optional().default(0),
  createdByTenantId: optionalString(),
  category: optionalString(),
  featureCount: z.number().int().optional().default(0),
  features: z.array(z.unknown()).optional().default([]),
  prices: z.array(z.unknown()).optional().default([]),
  fallbackEditionId: optionalString(),
  fallbackEditionName: optionalString(),
  overflowPolicy: optionalString(),
  baseMonthlyPriceUsd: z.number().optional().nullable(),
  allowMonthly: z.boolean().optional().nullable(),
  allowYearly: z.boolean().optional().nullable(),
  allowLifetime: z.boolean().optional().nullable(),
  allowTrial: z.boolean().optional().nullable(),
  trialDurationDays: z.number().int().optional().nullable(),
  trialIsFree: z.boolean().optional().nullable(),
  trialDiscountPercent: z.number().optional().nullable(),
  gracePeriodDays: z.number().int().optional().nullable(),
  maxActiveSubscriptions: z.number().int().optional().nullable(),
  isSelfServiceEnabled: z.boolean().optional().nullable(),
  isContactSalesOnly: z.boolean().optional().nullable(),
  /** Sourced from backend — true when no billing cycles are enabled. */
  isFree: z.boolean().optional().nullable(),
  createdAt: isoDateString().optional(),
  modifiedAt: isoDateString().optional().nullable(),
});

export class EditionMapper {
  static toEntity(model: EditionModel): Edition {
    // Validate API response shape — logs warnings on contract drift
    const validated = safeParseApiResponse(EditionModelSchema, model, "Edition");
    const data: EditionData = {
      id: validated.id,
      name: validated.name,
      displayNameEn: validated.displayNameEn ?? "",
      displayNameAr: validated.displayNameAr ?? "",
      description: validated.description ?? undefined,
      tagline: validated.tagline ?? undefined,
      // recommendationLabels is stored as JSON string in entity, API may send array or string
      recommendationLabels: Array.isArray(validated.recommendationLabels)
        ? JSON.stringify(validated.recommendationLabels)
        : ((validated.recommendationLabels as string | null | undefined) ?? undefined),
      isSystem: validated.isSystem,
      isRetired: validated.isRetired,
      tierLevel: validated.tierLevel,
      createdByTenantId: validated.createdByTenantId ?? undefined,
      category: validated.category ?? undefined,
      featureCount: validated.featureCount,
      features: (validated.features as EditionData["features"]) ?? [],
      prices: (validated.prices as EditionData["prices"]) ?? [],
      fallbackEditionId: validated.fallbackEditionId ?? undefined,
      fallbackEditionName: validated.fallbackEditionName ?? undefined,
      overflowPolicy: validated.overflowPolicy ?? undefined,
      baseMonthlyPriceUsd: validated.baseMonthlyPriceUsd ?? undefined,
      // ── Billing Controls (required booleans/numbers — default to safe values) ──
      allowMonthly: validated.allowMonthly ?? true,
      allowYearly: validated.allowYearly ?? true,
      allowLifetime: validated.allowLifetime ?? true,
      allowTrial: validated.allowTrial ?? true,
      trialDurationDays: validated.trialDurationDays ?? 14,
      trialIsFree: validated.trialIsFree ?? true,
      trialDiscountPercent: validated.trialDiscountPercent ?? 100,
      gracePeriodDays: validated.gracePeriodDays ?? 0,
      maxActiveSubscriptions: validated.maxActiveSubscriptions ?? -1,
      // ── Self-Service Controls ──
      isSelfServiceEnabled: validated.isSelfServiceEnabled ?? true,
      isContactSalesOnly: validated.isContactSalesOnly ?? false,
      // ── Free flag (authoritative from backend) ──
      isFree: validated.isFree ?? false,
      createdAt: validated.createdAt ?? "",
      modifiedAt: validated.modifiedAt ?? undefined,
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
      category: request.category,
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
      category: request.category,
    };
    // ── Billing Controls (only send if defined) ──
    if (request.allowMonthly !== undefined) json.allowMonthly = request.allowMonthly;
    if (request.allowYearly !== undefined) json.allowYearly = request.allowYearly;
    if (request.allowLifetime !== undefined) json.allowLifetime = request.allowLifetime;
    if (request.allowTrial !== undefined) json.allowTrial = request.allowTrial;
    if (request.trialDurationDays !== undefined) json.trialDurationDays = request.trialDurationDays;
    if (request.trialIsFree !== undefined) json.trialIsFree = request.trialIsFree;
    if (request.trialDiscountPercent !== undefined)
      json.trialDiscountPercent = request.trialDiscountPercent;
    if (request.gracePeriodDays !== undefined) json.gracePeriodDays = request.gracePeriodDays;
    if (request.maxActiveSubscriptions !== undefined)
      json.maxActiveSubscriptions = request.maxActiveSubscriptions;
    if (request.isSelfServiceEnabled !== undefined)
      json.isSelfServiceEnabled = request.isSelfServiceEnabled;
    if (request.isContactSalesOnly !== undefined)
      json.isContactSalesOnly = request.isContactSalesOnly;
    return json;
  }
}
