// ═══════════════════════════════════════════════════════════════════════════
// Signup API Models (DTOs)
//
// Raw JSON shapes returned by the backend API.
// These are NEVER used in the presentation layer — they are mapped to
// domain entities by SignupMapper before leaving the data layer.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Public feature DTO ───────────────────────────────────────────────────────

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

export interface SendOtpDto {
  sent: boolean;
  retryAfterSeconds: number;
}

export interface VerifyOtpDto {
  isValid: boolean;
  verificationToken: string | null;
  error: string | null;
}

// ─── Subdomain check DTO ──────────────────────────────────────────────────────

export interface SubdomainCheckDto {
  available: boolean;
  suggestion: string | null;
  reason: "taken" | "reserved" | "invalid_format" | null;
}

// ─── Register DTOs ────────────────────────────────────────────────────────────

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

export interface SupportedCurrencyDto {
  code: string;
  symbol: string;
  nameEn: string;
  nameAr: string;
  rateFromUsd: number;
}

export interface PricingContextDto {
  detectedCountry: string | null;
  recommendedCurrency: string;
  supportedCurrencies: SupportedCurrencyDto[];
}

// ─── Resume / Change-plan DTOs ───────────────────────────────────────────────

export interface ResumeSessionDto {
  status: "pending" | "awaiting_payment" | "active" | "failed" | "consumed" | "abandoned" | "unknown";
  editionId: string | null;
  billingCycle: "monthly" | "yearly" | null;
  currency: string | null;
  expiresAt: string | null;
}

export interface ChangePlanResultDto {
  checkoutUrl: string;
}

// ─── Contact sales DTO ────────────────────────────────────────────────────────

export interface ContactSalesRequestDto {
  contactName: string;
  email: string;
  companyName: string;
  phone: null;
  editionKey: string | null | undefined;
  message: string | null | undefined;
  businessType: string | null | undefined;
  teamSize: string | null | undefined;
  primaryPriority: string | null | undefined;
}
