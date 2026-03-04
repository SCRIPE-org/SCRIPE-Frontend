/**
 * EditionPromotion domain entity — Stripe-style Coupon + Promo Code pattern.
 */

export interface EditionPromotionData {
      id: string;
      editionId: string;
      name: string;
      description?: string;
      type: 'Percentage' | 'FixedAmount';
      discountValue: number;
      discountCurrency?: string;
      durationDays: number;
      applicableCycle?: string;
      promoCode?: string;
      requiresCode: boolean;
      validFrom?: string;
      validUntil?: string;
      maxRedemptions?: number;
      currentRedemptions: number;
      firstTimeOnly: boolean;
      isActive: boolean;
      createdAt: string;
}

export class EditionPromotion {
      constructor(public readonly data: EditionPromotionData) { }

      get id(): string { return this.data.id; }
      get editionId(): string { return this.data.editionId; }
      get name(): string { return this.data.name; }
      get description(): string | undefined { return this.data.description; }
      get type(): 'Percentage' | 'FixedAmount' { return this.data.type; }
      get discountValue(): number { return this.data.discountValue; }
      get discountCurrency(): string | undefined { return this.data.discountCurrency; }
      get durationDays(): number { return this.data.durationDays; }
      get applicableCycle(): string | undefined { return this.data.applicableCycle; }
      get promoCode(): string | undefined { return this.data.promoCode; }
      get requiresCode(): boolean { return this.data.requiresCode; }
      get validFrom(): string | undefined { return this.data.validFrom; }
      get validUntil(): string | undefined { return this.data.validUntil; }
      get maxRedemptions(): number | undefined { return this.data.maxRedemptions; }
      get currentRedemptions(): number { return this.data.currentRedemptions; }
      get firstTimeOnly(): boolean { return this.data.firstTimeOnly; }
      get isActive(): boolean { return this.data.isActive; }
      get createdAt(): string { return this.data.createdAt; }

      get isExpired(): boolean {
            if (!this.data.validUntil) return false;
            return new Date(this.data.validUntil) < new Date();
      }

      get hasReachedLimit(): boolean {
            if (this.data.maxRedemptions == null) return false;
            return this.data.currentRedemptions >= this.data.maxRedemptions;
      }

      get discountLabel(): string {
            if (this.data.type === 'Percentage') return `${this.data.discountValue}% off`;
            return `${this.data.discountCurrency ?? '$'}${this.data.discountValue} off`;
      }
}

export interface CreatePromotionRequest {
      name: string;
      description?: string;
      type: 'Percentage' | 'FixedAmount';
      discountValue: number;
      discountCurrency?: string;
      durationDays: number;
      applicableCycle?: string;
      promoCode?: string;
      requiresCode: boolean;
      validFrom?: string;
      validUntil?: string;
      maxRedemptions?: number;
      firstTimeOnly: boolean;
}

export interface UpdatePromotionRequest {
      name?: string;
      description?: string;
      isActive?: boolean;
      validUntil?: string;
      maxRedemptions?: number;
}

export interface PromoCodeValidationResult {
      isValid: boolean;
      errorMessage?: string;
      promotionName?: string;
      discountType?: string;
      discountValue: number;
      discountCurrency?: string;
      durationDays: number;
}
