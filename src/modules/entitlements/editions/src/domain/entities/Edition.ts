/**
 * Edition Entity
 */
import type { BaseEntity } from "@/modules/identity/core/domain/types";

export interface EditionFeatureDto {
      featureId: string;
      featureName: string;
      value: string;
      valueType: string;
}

export interface EditionData extends BaseEntity {
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
      isSystem: boolean;
      isRetired: boolean;
      tierLevel: number;
      createdByTenantId?: string;
      featureCount?: number;
      features?: EditionFeatureDto[];
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
}

export class Edition {
      constructor(public readonly data: EditionData) { }

      get id(): string { return this.data.id; }
      get name(): string { return this.data.name; }
      get displayNameEn(): string { return this.data.displayNameEn; }
      get displayNameAr(): string { return this.data.displayNameAr; }
      get description(): string | undefined { return this.data.description; }
      get isSystem(): boolean { return this.data.isSystem; }
      get isRetired(): boolean { return this.data.isRetired; }
      get tierLevel(): number { return this.data.tierLevel; }
      get createdAt(): string { return this.data.createdAt; }
      get features(): EditionFeatureDto[] { return this.data.features ?? []; }
      get featureCount(): number { return this.data.featureCount ?? this.features.length; }
      get fallbackEditionId(): string | undefined { return this.data.fallbackEditionId; }
      get fallbackEditionName(): string | undefined { return this.data.fallbackEditionName; }
      get overflowPolicy(): string { return this.data.overflowPolicy ?? 'Block'; }
      get baseMonthlyPriceUsd(): number | undefined { return this.data.baseMonthlyPriceUsd; }
      // ── Billing Controls ──
      get allowMonthly(): boolean { return this.data.allowMonthly; }
      get allowYearly(): boolean { return this.data.allowYearly; }
      get allowLifetime(): boolean { return this.data.allowLifetime; }
      get allowTrial(): boolean { return this.data.allowTrial; }
      get trialDurationDays(): number { return this.data.trialDurationDays; }
      get trialIsFree(): boolean { return this.data.trialIsFree; }
      get trialDiscountPercent(): number { return this.data.trialDiscountPercent; }
      get gracePeriodDays(): number { return this.data.gracePeriodDays; }

      getDisplayName(lang: string): string {
            return lang === "ar" ? this.displayNameAr : this.displayNameEn;
      }
}
