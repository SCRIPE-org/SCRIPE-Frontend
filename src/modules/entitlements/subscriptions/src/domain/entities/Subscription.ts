// FILE-EXCEPTION: file length
/**
 * Subscription Entities
 *
 * Rich domain entities with getters, computed properties, and copyWith() support.
 */

// ── Downgrade Impact ──

export interface ResourceOverflow {
  resourceType: string;
  featureName: string;
  currentCount: number;
  newLimit: number;
  overflowCount: number;
}

export interface DowngradeImpactReport {
  hasOverflow: boolean;
  overflows: ResourceOverflow[];
}

// ── Subscription (Full Detail) ──

export interface SubscriptionData {
  id: string;
  tenantId: string;
  editionId: string;
  editionName: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  expiryBehavior: string;
  fallbackEditionName?: string;
  isDowngraded: boolean;
  downgradedFromEditionName?: string;
  downgradedFromType?: string;
  downgradedAt?: string;
  createdAt: string;
  modifiedAt?: string;
  // ── Pricing ──
  currency?: string;
  baseAmount?: number;
  adjustmentAmount?: number;
  totalAmount?: number;
  totalAmountUsd?: number;
  exchangeRateToUsd?: number;
  // ── Promotion ──
  appliedPromoCode?: string;
  promotionDiscount?: number;
  // ── Refund ──
  refundType?: string;
  refundAmount?: number;
  refundedAt?: string;
  refundReason?: string;
  // ── Payment Gateway ──
  paymentGateway?: string;
  gatewayCustomerId?: string;
  gatewaySubscriptionId?: string;
}

export class Subscription {
  constructor(public readonly data: SubscriptionData) {}

  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get editionId(): string {
    return this.data.editionId;
  }
  get editionName(): string {
    return this.data.editionName;
  }
  get type(): string {
    return this.data.type;
  }
  get status(): string {
    return this.data.status;
  }
  get startDate(): string {
    return this.data.startDate;
  }
  get endDate(): string | undefined {
    return this.data.endDate;
  }
  get trialEndsAt(): string | undefined {
    return this.data.trialEndsAt;
  }
  get gracePeriodEndsAt(): string | undefined {
    return this.data.gracePeriodEndsAt;
  }
  get expiryBehavior(): string {
    return this.data.expiryBehavior;
  }
  get fallbackEditionName(): string | undefined {
    return this.data.fallbackEditionName;
  }
  get isDowngraded(): boolean {
    return this.data.isDowngraded;
  }
  get downgradedFromEditionName(): string | undefined {
    return this.data.downgradedFromEditionName;
  }
  get downgradedFromType(): string | undefined {
    return this.data.downgradedFromType;
  }
  get downgradedAt(): string | undefined {
    return this.data.downgradedAt;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }
  // ── Pricing ──
  get currency(): string | undefined {
    return this.data.currency;
  }
  get baseAmount(): number | undefined {
    return this.data.baseAmount;
  }
  get adjustmentAmount(): number | undefined {
    return this.data.adjustmentAmount;
  }
  get totalAmount(): number | undefined {
    return this.data.totalAmount;
  }
  get totalAmountUsd(): number | undefined {
    return this.data.totalAmountUsd;
  }
  get exchangeRateToUsd(): number | undefined {
    return this.data.exchangeRateToUsd;
  }
  // ── Promotion ──
  get appliedPromoCode(): string | undefined {
    return this.data.appliedPromoCode;
  }
  get promotionDiscount(): number | undefined {
    return this.data.promotionDiscount;
  }
  // ── Refund ──
  get refundType(): string | undefined {
    return this.data.refundType;
  }
  get refundAmount(): number | undefined {
    return this.data.refundAmount;
  }
  get refundedAt(): string | undefined {
    return this.data.refundedAt;
  }
  get refundReason(): string | undefined {
    return this.data.refundReason;
  }

  // ── Computed Properties ──
  get isActive(): boolean {
    return this.data.status === "Active";
  }
  get isTrial(): boolean {
    return this.data.type === "Trial";
  }
  get isSuspended(): boolean {
    return this.data.status === "Suspended";
  }
  get isExpired(): boolean {
    return this.data.status === "Expired";
  }
  get hasPromotion(): boolean {
    return !!this.data.appliedPromoCode;
  }
  get hasRefund(): boolean {
    return !!this.data.refundType && this.data.refundType !== "None";
  }
  // ── Payment Gateway ──
  get paymentGateway(): string | undefined {
    return this.data.paymentGateway;
  }
  get gatewayCustomerId(): string | undefined {
    return this.data.gatewayCustomerId;
  }
  get gatewaySubscriptionId(): string | undefined {
    return this.data.gatewaySubscriptionId;
  }
  get hasGatewayCustomer(): boolean {
    return !!this.data.gatewayCustomerId;
  }
  get hasGatewaySubscription(): boolean {
    return !!this.data.gatewaySubscriptionId;
  }

  copyWith(updates: Partial<SubscriptionData>): Subscription {
    return new Subscription({ ...this.data, ...updates });
  }
}

// ── Subscription List Item ──

export interface SubscriptionListItemData {
  id: string;
  tenantId: string;
  editionId: string;
  editionName: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  expiryBehavior: string;
  fallbackEditionName?: string;
  isDowngraded: boolean;
  downgradedFromEditionName?: string;
  downgradedFromType?: string;
  downgradedAt?: string;
  createdAt: string;
  // ── Pricing ──
  currency?: string;
  baseAmount?: number;
  adjustmentAmount?: number;
  totalAmount?: number;
  totalAmountUsd?: number;
  // ── Promotion ──
  appliedPromoCode?: string;
  promotionDiscount?: number;
  // ── Refund ──
  refundType?: string;
  refundAmount?: number;
  refundedAt?: string;
  refundReason?: string;
  // ── Payment Gateway ──
  paymentGateway?: string;
  gatewayCustomerId?: string;
  gatewaySubscriptionId?: string;
}

export class SubscriptionListItem {
  constructor(public readonly data: SubscriptionListItemData) {}

  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get editionId(): string {
    return this.data.editionId;
  }
  get editionName(): string {
    return this.data.editionName;
  }
  get type(): string {
    return this.data.type;
  }
  get status(): string {
    return this.data.status;
  }
  get startDate(): string {
    return this.data.startDate;
  }
  get endDate(): string | undefined {
    return this.data.endDate;
  }
  get expiryBehavior(): string {
    return this.data.expiryBehavior;
  }
  get fallbackEditionName(): string | undefined {
    return this.data.fallbackEditionName;
  }
  get isDowngraded(): boolean {
    return this.data.isDowngraded;
  }
  get downgradedFromEditionName(): string | undefined {
    return this.data.downgradedFromEditionName;
  }
  get downgradedFromType(): string | undefined {
    return this.data.downgradedFromType;
  }
  get downgradedAt(): string | undefined {
    return this.data.downgradedAt;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get currency(): string | undefined {
    return this.data.currency;
  }
  get baseAmount(): number | undefined {
    return this.data.baseAmount;
  }
  get adjustmentAmount(): number | undefined {
    return this.data.adjustmentAmount;
  }
  get totalAmount(): number | undefined {
    return this.data.totalAmount;
  }
  get totalAmountUsd(): number | undefined {
    return this.data.totalAmountUsd;
  }
  get appliedPromoCode(): string | undefined {
    return this.data.appliedPromoCode;
  }
  get promotionDiscount(): number | undefined {
    return this.data.promotionDiscount;
  }
  get refundType(): string | undefined {
    return this.data.refundType;
  }
  get refundAmount(): number | undefined {
    return this.data.refundAmount;
  }
  get refundedAt(): string | undefined {
    return this.data.refundedAt;
  }
  get refundReason(): string | undefined {
    return this.data.refundReason;
  }
  // ── Payment Gateway ──
  get paymentGateway(): string | undefined {
    return this.data.paymentGateway;
  }
  get gatewayCustomerId(): string | undefined {
    return this.data.gatewayCustomerId;
  }
  get gatewaySubscriptionId(): string | undefined {
    return this.data.gatewaySubscriptionId;
  }
  get hasGatewayCustomer(): boolean {
    return !!this.data.gatewayCustomerId;
  }
  get hasGatewaySubscription(): boolean {
    return !!this.data.gatewaySubscriptionId;
  }

  get isActive(): boolean {
    return this.data.status === "Active";
  }

  copyWith(updates: Partial<SubscriptionListItemData>): SubscriptionListItem {
    return new SubscriptionListItem({ ...this.data, ...updates });
  }
}

// ── Global Subscription Item ──

export interface GlobalSubscriptionItemData {
  id: string;
  tenantId: string;
  tenantName: string;
  editionId: string;
  editionName: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  expiryBehavior: string;
  isDowngraded: boolean;
  createdAt: string;
  currency: string;
  totalAmount: number;
  totalAmountUsd: number;
  baseAmount: number;
  adjustmentAmount: number;
  exchangeRateToUsd: number;
  // ── Promotion ──
  appliedPromoCode?: string;
  promotionDiscount?: number;
  // ── Refund ──
  refundType?: string;
  refundAmount?: number;
  refundedAt?: string;
  refundReason?: string;
}

export class GlobalSubscriptionItem {
  constructor(public readonly data: GlobalSubscriptionItemData) {}

  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get tenantName(): string {
    return this.data.tenantName;
  }
  get editionId(): string {
    return this.data.editionId;
  }
  get editionName(): string {
    return this.data.editionName;
  }
  get type(): string {
    return this.data.type;
  }
  get status(): string {
    return this.data.status;
  }
  get startDate(): string {
    return this.data.startDate;
  }
  get endDate(): string | undefined {
    return this.data.endDate;
  }
  get expiryBehavior(): string {
    return this.data.expiryBehavior;
  }
  get isDowngraded(): boolean {
    return this.data.isDowngraded;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get currency(): string {
    return this.data.currency;
  }
  get totalAmount(): number {
    return this.data.totalAmount;
  }
  get totalAmountUsd(): number {
    return this.data.totalAmountUsd;
  }
  get baseAmount(): number {
    return this.data.baseAmount;
  }
  get adjustmentAmount(): number {
    return this.data.adjustmentAmount;
  }
  get exchangeRateToUsd(): number {
    return this.data.exchangeRateToUsd;
  }
  get appliedPromoCode(): string | undefined {
    return this.data.appliedPromoCode;
  }
  get promotionDiscount(): number | undefined {
    return this.data.promotionDiscount;
  }
  get refundType(): string | undefined {
    return this.data.refundType;
  }
  get refundAmount(): number | undefined {
    return this.data.refundAmount;
  }
  get refundedAt(): string | undefined {
    return this.data.refundedAt;
  }
  get refundReason(): string | undefined {
    return this.data.refundReason;
  }

  get isActive(): boolean {
    return this.data.status === "Active";
  }

  copyWith(updates: Partial<GlobalSubscriptionItemData>): GlobalSubscriptionItem {
    return new GlobalSubscriptionItem({ ...this.data, ...updates });
  }
}
