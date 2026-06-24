// ═══════════════════════════════════════════════════════════════════════════
// Signup API Models (DTOs)
//
// Raw JSON shapes returned by the backend API.
// These are NEVER used in the presentation layer — they are mapped to
// domain entities by SignupMapper before leaving the data layer.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Public feature DTO ───────────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Public Feature Dto.
 */
export interface PublicFeatureDto {
  name: string;
  nameAr: string | null;
  description: string | null;
  category: string;
  valueType: "Boolean" | "Numeric" | "Text";
  value: string;
  sortOrder: number;
  displayLabelEn?: string | null;
  displayLabelAr?: string | null;
  isMarketingOnly?: boolean;
}

// ─── Edition DTO ──────────────────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Public Edition Dto.
 */
export interface PublicEditionDto {
  id: string;
  name: string;
  tagline: string | null;
  tier: number;
  categoryKey: string | null;
  categoryDisplayName: string | null;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  priceDisplay: "amount" | "free" | "custom";
  trialDays: number;
  badge: string | null;
  topFeatures: PublicFeatureDto[];
  allFeatures: PublicFeatureDto[];
  checkoutMode: "free" | "trial" | "checkout" | "contact-sales";
  isRecommended: boolean;
}

// ─── Category DTO ─────────────────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Public Category Dto.
 */
export interface PublicCategoryDto {
  id: string;
  key: string;
  displayName: string;
  description: string | null;
  descriptionAr: string | null;
  iconKey: string | null;
  fromPriceMonthly: number | null;
  currency: string;
  sortOrder: number;
}

// ─── OTP DTOs ────────────────────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Send Otp Dto.
 */
export interface SendOtpDto {
  sent: boolean;
  retryAfterSeconds: number;
}

/**
 * Interface structure detailing the properties and attributes of Verify Otp Dto.
 */
export interface VerifyOtpDto {
  isValid: boolean;
  verificationToken: string | null;
  error: string | null;
}

// ─── Subdomain check DTO ──────────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Subdomain Check Dto.
 */
export interface SubdomainCheckDto {
  available: boolean;
  suggestion: string | null;
  reason: "taken" | "reserved" | "invalid_format" | null;
}

// ─── Register DTOs ────────────────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Register Dto.
 */
export interface RegisterDto {
  mode: "active" | "checkout";
  accessToken: string | null;
  expiresAt: string | null;
  tenantId: string | null;
  tenantCode: string | null;
  tenantName: string | null;
  redirectUrl: string | null;
  userProfile: Record<string, unknown> | null;
  checkoutUrl: string | null;
  signupRef: string | null;
}

// ─── Status / finalize DTOs ───────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Signup Status Dto.
 */
export interface SignupStatusDto {
  status:
    | "pending"
    | "awaiting_payment"
    | "active"
    | "consumed"
    | "failed"
    | "abandoned"
    | "unknown";
  statusMessage: string | null;
  expiresAt: string | null;
}
/**
 * Interface structure detailing the properties and attributes of Signup Checkout Status Dto.
 */
export interface SignupCheckoutStatusDto {
  status: "pending" | "processing" | "completed" | "failed" | "expired" | "unknown";
  supportReference: string;
  message: string;
}
/**
 * Interface structure detailing the properties and attributes of Complete Session Dto.
 */
export interface CompleteSessionDto {
  accessToken: string;
  expiresAt: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  redirectUrl: string;
  userProfile: Record<string, unknown> | null;
}
// ─── Pricing context DTOs ─────────────────────────────────────────────────────
/**
 * Interface structure detailing the properties and attributes of Supported Currency Dto.
 */
export interface SupportedCurrencyDto {
  code: string;
  symbol: string;
  nameEn: string;
  nameAr: string;
  rateFromUsd: number;
}
/**
 * Interface structure detailing the properties and attributes of Pricing Context Dto.
 */
export interface PricingContextDto {
  detectedCountry: string | null;
  recommendedCurrency: string;
  supportedCurrencies: SupportedCurrencyDto[];
}
// ─── Resume / Change-plan DTOs ───────────────────────────────────────────────
/**
 * Interface structure detailing the properties and attributes of Resume Session Dto.
 */
export interface ResumeSessionDto {
  status:
    | "pending"
    | "awaiting_payment"
    | "active"
    | "failed"
    | "consumed"
    | "abandoned"
    | "unknown";
  editionId: string | null;
  billingCycle: "monthly" | "yearly" | null;
  currency: string | null;
  expiresAt: string | null;
}
/**
 * Interface structure detailing the properties and attributes of Change Plan Result Dto.
 */
export interface ChangePlanResultDto {
  checkoutUrl: string;
}
// ─── Contact sales DTO ────────────────────────────────────────────────────────
/**
 * Interface structure detailing the properties and attributes of Contact Sales Request Dto.
 */
export interface ContactSalesRequestDto {
  contactName: string;
  email: string;
  companyName: string;
  phone: string | null;
  editionKey: string | null | undefined;
  message: string | null | undefined;
  businessType: string | null | undefined;
  teamSize: string | null | undefined;
  primaryPriority: string | null | undefined;
}
// ─── Recommendation DTO ───────────────────────────────────────────────────────
/** Shape returned by GET /auth/signup/recommendation */
export interface RecommendationDto {
  /** "free" | "standard" | "enterprise" | "ultimate" */
  recommendedTier: string;
  /** Human-readable edition name, e.g. "Pro", "Ultra" */
  recommendedEditionName: string;
  /** Raw score — higher = stronger match (diagnostic only) */
  score: number;
  /** "scored" | "catalog_empty" */
  reason: string;
  /** Translatable locale keys explaining the recommendation (e.g. "recommendation.reason.team.small"). */
  reasons: string[];
}
// ─── Onboarding Intelligence Engine DTOs ─────────────────────────────────────
/**
 * Interface structure detailing the properties and attributes of Onboarding Answer Option Dto.
 */
export interface OnboardingAnswerOptionDto {
  value: string;
  label: string;
  sublabel: string | null;
  iconKey: string | null;
  sortOrder: number;
  signalWeight: number;
}
/**
 * Interface structure detailing the properties and attributes of Onboarding Question Dto.
 */
export interface OnboardingQuestionDto {
  key: string;
  questionType: "single_select" | "multi_select";
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  sortOrder: number;
  dependsOnQuestionKey: string | null;
  dependsOnAnswerValue: string | null;
  label: string;
  hint: string | null;
  iconKey: string | null;
  options: OnboardingAnswerOptionDto[];
}
/**
 * Interface structure detailing the properties and attributes of Onboarding Flow Dto.
 */
export interface OnboardingFlowDto {
  questions: OnboardingQuestionDto[];
}
/**
 * Interface structure detailing the properties and attributes of Onboarding Recommendation Dto.
 */
export interface OnboardingRecommendationDto {
  recommendedEditionId: string;
  recommendedEditionName: string;
  score: number;
  reasons: string[];
  /** Tier label of the recommended edition: "free" | "pro" | "ultra" | "enterprise". Additive/optional. */
  tierKey?: string;
  /** False when the best-fit edition is contact-sales / Enterprise. Additive/optional. */
  isSelfService?: boolean;
}
// ─── Welcome + Trust Content DTOs ────────────────────────────────────────────
// Mirror SignupWelcomeContentDto + SignupTrustMarkDto + SignupCustomerLogoDto.
// Wire shape from GET /onboarding/welcome-content?lang=
/** A single localized compliance/trust badge. */
export interface SignupTrustMarkDto {
  key: string;
  kind: string;
  label: string;
  iconKey: string | null;
  assetUrl: string | null;
}
/** A single customer logo entry. */
export interface SignupCustomerLogoDto {
  key: string;
  name: string;
  assetUrl: string;
}
/** Shape returned by GET /onboarding/welcome-content. */
export interface SignupWelcomeContentDto {
  headline: string;
  subcopy: string;
  ctaLabel: string;
  trustedByCount: number;
  trustedByLabel: string;
  trustMarks: SignupTrustMarkDto[];
  customerLogos: SignupCustomerLogoDto[];
}