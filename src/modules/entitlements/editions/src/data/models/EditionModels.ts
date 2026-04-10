/**
 * Edition Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

export interface EditionModel {
      id: string;
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
      isSystem: boolean;
      isRetired: boolean;
      tierLevel: number;
      createdByTenantId?: string;
      featureCount?: number;
      features?: { featureId: string; featureName: string; value: string; valueType: string }[];
      fallbackEditionId?: string;
      fallbackEditionName?: string;
      overflowPolicy?: string;
      baseMonthlyPriceUsd?: number;
      // ── Billing Controls ──
      allowMonthly: boolean;
      allowYearly: boolean;
      allowLifetime: boolean;
      allowTrial: boolean;
      trialDurationDays: number;
      trialIsFree: boolean;
      trialDiscountPercent: number;
      gracePeriodDays: number;
      createdAt: string;
      modifiedAt?: string;
}

export interface EditionVersionModel {
      id: string;
      versionNumber: number;
      changeNotes?: string;
      rolloutStrategy: string;
      status: string;
      scheduledAt?: string;
      completedAt?: string;
      canaryPercentage?: number;
      pricingSnapshotJson?: string;
      createdAt: string;
}
