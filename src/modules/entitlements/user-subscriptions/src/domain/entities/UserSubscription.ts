/**
 * UserSubscription Entity — Rich domain model for user-level subscriptions.
 */
import type { BaseEntity } from "@modules/identity/core/domain/types";

/** Resolved feature from the user's active subscription plan. */
export interface UserSubscriptionFeatureData {
  featureKey: string;
  value: string;
  valueType: string;
  displayNameEn?: string;
  displayNameAr?: string;
}

export interface UserSubscriptionData extends BaseEntity {
  userId: string;
  userName?: string;
  userEmail?: string;
  tenantId: string;
  tenantPlanId: string;
  planName: string;
  /** May be absent in list responses (only available in detail). */
  currency?: string;
  /** May be absent in list responses (only available in detail). */
  price?: number;
  /** May be absent in list responses (only available in detail). */
  billingCycle?: string;
  status: string;
  startedAt: string;
  expiresAt?: string;
  cancelledAt?: string;
  trialEndsAt?: string;
  isAutoRenew: boolean;
  isActive: boolean;
  isExpiringSoon: boolean;
  daysRemaining?: number;
  externalRef?: string;
  notes?: string;
  updatedAt?: string;
  /** Plan version this subscription is pinned to (grandfathering). */
  tenantPlanVersionNumber?: number;
  /** Promotion applied at subscription time. */
  promotionId?: string;
  promotionCode?: string;
  discountAmount?: number;
  originalPrice?: number;
  paymentMethod?: string;
  isSelfService?: boolean;
  gracePeriodEndsAt?: string;
  /** Resolved features from the subscription's plan (populated in /me response). */
  features?: UserSubscriptionFeatureData[];
}

export class UserSubscription {
  constructor(private readonly data: UserSubscriptionData) {}

  get id(): string { return this.data.id; }
  get userId(): string { return this.data.userId; }
  get userName(): string { return this.data.userName ?? ""; }
  get userEmail(): string { return this.data.userEmail ?? ""; }
  get tenantId(): string { return this.data.tenantId; }
  get tenantPlanId(): string { return this.data.tenantPlanId; }
  get planName(): string { return this.data.planName; }
  get currency(): string { return this.data.currency ?? "USD"; }
  get price(): number { return this.data.price ?? 0; }
  get billingCycle(): string { return this.data.billingCycle ?? ""; }
  get status(): string { return this.data.status; }
  get startedAt(): string { return this.data.startedAt; }
  get expiresAt(): string | undefined { return this.data.expiresAt; }
  get cancelledAt(): string | undefined { return this.data.cancelledAt; }
  get trialEndsAt(): string | undefined { return this.data.trialEndsAt; }
  get isAutoRenew(): boolean { return this.data.isAutoRenew; }
  get isActive(): boolean { return this.data.isActive; }
  get isExpiringSoon(): boolean { return this.data.isExpiringSoon; }
  get daysRemaining(): number | undefined { return this.data.daysRemaining; }
  get externalRef(): string | undefined { return this.data.externalRef; }
  get notes(): string | undefined { return this.data.notes; }
  get createdAt(): string { return this.data.createdAt; }
  get updatedAt(): string | undefined { return this.data.updatedAt; }
  get tenantPlanVersionNumber(): number | undefined { return this.data.tenantPlanVersionNumber; }
  get promotionId(): string | undefined { return this.data.promotionId; }
  get promotionCode(): string | undefined { return this.data.promotionCode; }
  get discountAmount(): number { return this.data.discountAmount ?? 0; }
  get originalPrice(): number | undefined { return this.data.originalPrice; }
  get paymentMethod(): string | undefined { return this.data.paymentMethod; }
  get isSelfService(): boolean { return this.data.isSelfService ?? false; }
  get gracePeriodEndsAt(): string | undefined { return this.data.gracePeriodEndsAt; }
  /** Resolved features from this subscription's plan. */
  get features(): UserSubscriptionFeatureData[] { return this.data.features ?? []; }

  // ── Computed Properties ──

  /** Human-readable user display: "Name (email)" or fallback to userId */
  get userDisplayName(): string {
    if (this.userName && this.userEmail) return `${this.userName} (${this.userEmail})`;
    if (this.userName) return this.userName;
    if (this.userEmail) return this.userEmail;
    return this.userId;
  }

  /** Matches backend UserSubscriptionStatus.Trial (serialized as "Trial", not "Trialing"). */
  get isTrialing(): boolean { return this.data.status === "Trial"; }
  get isExpired(): boolean { return this.data.status === "Expired"; }
  get isCancelled(): boolean { return this.data.status === "Cancelled"; }
  get isFree(): boolean { return this.data.status === "Free"; }
  get isPastDue(): boolean { return this.data.status === "PastDue"; }
  get isPendingPayment(): boolean { return this.data.status === "PendingPayment"; }
  get hasTrial(): boolean { return !!this.data.trialEndsAt; }
  get hasPromotion(): boolean { return !!this.data.promotionCode; }

  get statusColor(): "success" | "warning" | "destructive" | "secondary" | "default" {
    switch (this.data.status) {
      case "Active": return "success";
      case "Free": return "success";
      case "Trial": return "default";
      case "PastDue": return "warning";
      case "PendingPayment": return "warning";
      case "Cancelled": return "destructive";
      case "Expired": return "secondary";
      default: return "warning";
    }
  }

  get formattedPrice(): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.currency,
      minimumFractionDigits: 2,
    }).format(this.price);
  }

  get formattedOriginalPrice(): string | undefined {
    if (this.originalPrice == null) return undefined;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.currency,
      minimumFractionDigits: 2,
    }).format(this.originalPrice);
  }

  get formattedDiscount(): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.currency,
      minimumFractionDigits: 2,
    }).format(this.discountAmount);
  }

  copyWith(updates: Partial<UserSubscriptionData>): UserSubscription {
    return new UserSubscription({ ...this.data, ...updates });
  }
}
