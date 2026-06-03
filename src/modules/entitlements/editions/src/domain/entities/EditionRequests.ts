/**
 * Edition Request DTOs
 */
export interface CreateEditionRequest {
  name: string;
  displayNameEn: string;
  displayNameAr: string;
  description?: string;
  tagline?: string;
  recommendationLabels?: string;
  fallbackEditionId?: string;
  tierLevel?: number;
  category?: string;
  // ── Billing Controls ──
  allowMonthly?: boolean;
  allowYearly?: boolean;
  allowLifetime?: boolean;
  allowTrial?: boolean;
  trialDurationDays?: number;
  trialIsFree?: boolean;
  trialDiscountPercent?: number;
  gracePeriodDays?: number;
  maxActiveSubscriptions?: number;
  // ── Self-Service Controls ──
  isSelfServiceEnabled?: boolean;
  isContactSalesOnly?: boolean;
}

export interface UpdateEditionRequest {
  name?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  tagline?: string;
  recommendationLabels?: string;
  fallbackEditionId?: string;
  overflowPolicy?: string;
  tierLevel?: number;
  category?: string;
  // ── Billing Controls ──
  allowMonthly?: boolean;
  allowYearly?: boolean;
  allowLifetime?: boolean;
  allowTrial?: boolean;
  trialDurationDays?: number;
  trialIsFree?: boolean;
  trialDiscountPercent?: number;
  gracePeriodDays?: number;
  maxActiveSubscriptions?: number;
  // ── Self-Service Controls ──
  isSelfServiceEnabled?: boolean;
  isContactSalesOnly?: boolean;
}

export interface SetEditionFeatureRequest {
  value: string;
}
