// ═══════════════════════════════════════════════════════════════════════════
// SignupMapper — DTO → Domain Entity
//
// Maps raw API response shapes (DTOs) to clean domain entity types.
// All null-coalescing happens here — the presentation layer never sees raw DTOs.
//
// Rule: ALWAYS null-coalesce DTO fields here (`dto.field ?? ""`).
// ═══════════════════════════════════════════════════════════════════════════

import type {
  PublicEditionDto,
  PublicCategoryDto,
  PublicFeatureDto,
  SendOtpDto,
  VerifyOtpDto,
  SubdomainCheckDto,
  RegisterDto,
  SignupStatusDto,
  SignupCheckoutStatusDto,
  CompleteSessionDto,
  PricingContextDto,
  SupportedCurrencyDto,
  SignupWelcomeContentDto,
  OnboardingRecommendationDto,
} from "../models/SignupModels";
import type {
  PublicEdition,
  PublicFeature,
  PublicCategory,
  SignupOtpResult,
  SignupVerificationResult,
  SubdomainCheckResult,
  SignupResult,
  SignupStatusResult,
  SignupCheckoutStatusResult,
  SignupCompleteResult,
  PricingContext,
  SupportedCurrency,
  PlanEdition,
} from "../../domain/entities";
import {
  WelcomeContentSchema,
  OnboardingRecommendationSchema,
} from "../../domain/entities/OnboardingEntities";
import { AuthMapper } from "@modules/auth/core/data/mappers/AuthMapper";
import type {
  WelcomeContent,
  OnboardingRecommendation,
} from "../../domain/entities/OnboardingEntities";

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class SignupMapper {
  // ─── Feature ────────────────────────────────────────────────────────────

  static toFeature(dto: PublicFeatureDto): PublicFeature {
    return {
      name: dto.name,
      nameAr: dto.nameAr ?? null,
      description: dto.description ?? null,
      category: dto.category ?? "General",
      valueType: dto.valueType,
      value: dto.value,
      sortOrder: dto.sortOrder ?? 999,
      displayLabelEn: dto.displayLabelEn ?? null,
      displayLabelAr: dto.displayLabelAr ?? null,
      isMarketingOnly: dto.isMarketingOnly ?? false,
    };
  }

  // ─── Edition → PublicEdition ─────────────────────────────────────────────

  static toEdition(dto: PublicEditionDto): PublicEdition {
    return {
      id: dto.id,
      name: dto.name,
      tagline: dto.tagline ?? null,
      tier: dto.tier,
      categoryKey: dto.categoryKey ?? null,
      categoryDisplayName: dto.categoryDisplayName ?? null,
      monthlyPrice: dto.monthlyPrice ?? 0,
      annualPrice: dto.annualPrice ?? 0,
      currency: dto.currency,
      priceDisplay: dto.priceDisplay ?? "amount",
      trialDays: dto.trialDays ?? 0,
      badge: dto.badge ?? null,
      topFeatures: (dto.topFeatures ?? []).map(SignupMapper.toFeature),
      allFeatures: (dto.allFeatures ?? []).map(SignupMapper.toFeature),
      checkoutMode: dto.checkoutMode,
      isRecommended: dto.isRecommended ?? false,
    };
  }

  // ─── Edition → PlanEdition (plan-picker view shape) ──────────────────────

  /** Convert a domain PublicEdition to a PlanEdition (for ViewModels that already have entities). */
  static toPlanEditionFromEntity(entity: PublicEdition): PlanEdition {
    return {
      id: entity.id,
      name: entity.name,
      tagline: entity.tagline ?? "",
      tierLevel: entity.tier,
      category: entity.categoryKey,
      categoryDisplayName: entity.categoryDisplayName,
      monthlyPrice: entity.monthlyPrice ?? 0,
      annualPrice: entity.annualPrice ?? 0,
      currency: entity.currency,
      priceDisplay: entity.priceDisplay,
      trialDays: (entity.trialDays ?? 0) > 0 ? entity.trialDays : null,
      badge: entity.badge ?? (entity.isRecommended ? "Recommended" : null),
      topFeatures: entity.topFeatures,
      allFeatures: entity.allFeatures,
      checkoutMode: entity.checkoutMode,
      raw: entity,
    };
  }

  static toPlanEdition(dto: PublicEditionDto): PlanEdition {
    const entity = SignupMapper.toEdition(dto);
    return {
      id: entity.id,
      name: entity.name,
      tagline: entity.tagline ?? "",
      tierLevel: entity.tier,
      category: entity.categoryKey,
      categoryDisplayName: entity.categoryDisplayName,
      monthlyPrice: entity.monthlyPrice ?? 0,
      annualPrice: entity.annualPrice ?? 0,
      currency: entity.currency,
      priceDisplay: entity.priceDisplay,
      trialDays: entity.trialDays > 0 ? entity.trialDays : null,
      badge: entity.badge ?? (entity.isRecommended ? "Recommended" : null),
      topFeatures: entity.topFeatures,
      allFeatures: entity.allFeatures,
      checkoutMode: entity.checkoutMode,
      raw: entity,
    };
  }

  // ─── Category ────────────────────────────────────────────────────────────

  static toCategory(dto: PublicCategoryDto): PublicCategory {
    return {
      id: dto.id,
      key: dto.key,
      displayName: dto.displayName,
      description: dto.description ?? null,
      descriptionAr: dto.descriptionAr ?? null,
      iconKey: dto.iconKey ?? null,
      fromPriceMonthly: dto.fromPriceMonthly ?? null,
      currency: dto.currency,
      sortOrder: dto.sortOrder ?? 0,
    };
  }

  // ─── OTP ────────────────────────────────────────────────────────────────

  static toOtpResult(dto: SendOtpDto): SignupOtpResult {
    return {
      sent: dto.sent,
      retryAfterSeconds: dto.retryAfterSeconds ?? 60,
    };
  }

  static toVerifyOtpResult(dto: VerifyOtpDto): SignupVerificationResult {
    return {
      isValid: dto.isValid,
      verificationToken: dto.verificationToken ?? null,
      error: dto.error ?? null,
    };
  }

  // ─── Subdomain ───────────────────────────────────────────────────────────

  static toSubdomainResult(dto: SubdomainCheckDto): SubdomainCheckResult {
    return {
      available: dto.available,
      suggestion: dto.suggestion ?? null,
      reason: dto.reason ?? null,
    };
  }

  // ─── Register ────────────────────────────────────────────────────────────

  static toRegisterResult(dto: RegisterDto): SignupResult {
    return {
      mode: dto.mode,
      accessToken: dto.accessToken ?? null,
      expiresAt: dto.expiresAt ?? null,
      tenantId: dto.tenantId ?? null,
      tenantCode: dto.tenantCode ?? null,
      tenantName: dto.tenantName ?? null,
      redirectUrl: dto.redirectUrl ?? null,
      user: AuthMapper.userFromUnknown(dto.userProfile),
      checkoutUrl: dto.checkoutUrl ?? null,
      signupRef: dto.signupRef ?? null,
    };
  }

  // ─── Status ──────────────────────────────────────────────────────────────

  static toStatusResult(dto: SignupStatusDto): SignupStatusResult {
    return {
      status: dto.status,
      statusMessage: dto.statusMessage ?? null,
      expiresAt: dto.expiresAt ?? null,
    };
  }

  static toCheckoutStatusResult(dto: SignupCheckoutStatusDto): SignupCheckoutStatusResult {
    return {
      status: dto.status ?? "unknown",
      supportReference: dto.supportReference ?? "",
      message: dto.message ?? "",
    };
  }

  // ─── Complete session ────────────────────────────────────────────────────

  static toCompleteResult(dto: CompleteSessionDto): SignupCompleteResult {
    return {
      accessToken: dto.accessToken,
      expiresAt: dto.expiresAt,
      tenantId: dto.tenantId,
      tenantCode: dto.tenantCode,
      tenantName: dto.tenantName,
      redirectUrl: dto.redirectUrl,
      user: AuthMapper.userFromUnknown(dto.userProfile),
    };
  }

  // ─── Pricing context ─────────────────────────────────────────────────────

  static toSupportedCurrency(dto: SupportedCurrencyDto): SupportedCurrency {
    return {
      code: dto.code,
      symbol: dto.symbol,
      nameEn: dto.nameEn,
      nameAr: dto.nameAr,
      rateFromUsd: dto.rateFromUsd,
    };
  }

  static toPricingContext(dto: PricingContextDto): PricingContext {
    return {
      detectedCountry: dto.detectedCountry ?? null,
      recommendedCurrency: dto.recommendedCurrency ?? "USD",
      supportedCurrencies: (dto.supportedCurrencies ?? []).map(SignupMapper.toSupportedCurrency),
    };
  }

  // ─── Welcome + trust content ─────────────────────────────────────────────
  // Parse via the Zod schema (single source of truth for the wire shape).
  // Schema-parse strips unknown keys and applies the documented defaults.

  static toWelcomeContent(dto: SignupWelcomeContentDto): WelcomeContent {
    return WelcomeContentSchema.parse(dto);
  }

  // ─── Adaptive recommendation ─────────────────────────────────────────────
  // tierKey/isSelfService are additive/optional and flow through the schema.

  static toOnboardingRecommendation(dto: OnboardingRecommendationDto): OnboardingRecommendation {
    return OnboardingRecommendationSchema.parse(dto);
  }
}
