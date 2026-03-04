/**
 * Edition Request DTOs
 */
export interface CreateEditionRequest {
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
      fallbackEditionId?: string;
      // ── Billing Controls ──
      allowMonthly?: boolean;
      allowYearly?: boolean;
      allowLifetime?: boolean;
      allowTrial?: boolean;
      trialDurationDays?: number;
      trialIsFree?: boolean;
      trialDiscountPercent?: number;
      gracePeriodDays?: number;
}

export interface UpdateEditionRequest {
      name?: string;
      displayNameEn?: string;
      displayNameAr?: string;
      description?: string;
      fallbackEditionId?: string;
      overflowPolicy?: string;
      // ── Billing Controls ──
      allowMonthly?: boolean;
      allowYearly?: boolean;
      allowLifetime?: boolean;
      allowTrial?: boolean;
      trialDurationDays?: number;
      trialIsFree?: boolean;
      trialDiscountPercent?: number;
      gracePeriodDays?: number;
}

export interface SetEditionFeatureRequest {
      value: string;
}
