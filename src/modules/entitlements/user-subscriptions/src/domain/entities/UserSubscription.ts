/**
 * UserSubscription Entity — Rich domain model for user-level subscriptions.
 */
import type { BaseEntity } from "@modules/identity/core/domain/types";

export interface UserSubscriptionData extends BaseEntity {
  userId: string;
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
}

export class UserSubscription {
  constructor(private readonly data: UserSubscriptionData) {}

  get id(): string { return this.data.id; }
  get userId(): string { return this.data.userId; }
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

  // ── Computed Properties ──
  /** Matches backend UserSubscriptionStatus.Trial (serialized as "Trial", not "Trialing"). */
  get isTrialing(): boolean { return this.data.status === "Trial"; }
  get isExpired(): boolean { return this.data.status === "Expired"; }
  get isCancelled(): boolean { return this.data.status === "Cancelled"; }
  get isFree(): boolean { return this.data.status === "Free"; }
  get isPastDue(): boolean { return this.data.status === "PastDue"; }
  get hasTrial(): boolean { return !!this.data.trialEndsAt; }

  get statusColor(): "success" | "warning" | "destructive" | "secondary" | "default" {
    switch (this.data.status) {
      case "Active": return "success";
      case "Free": return "success";
      case "Trial": return "default";
      case "PastDue": return "warning";
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

  copyWith(updates: Partial<UserSubscriptionData>): UserSubscription {
    return new UserSubscription({ ...this.data, ...updates });
  }
}
