/**
 * TenantPlan Entity — Rich domain model for tenant-created plans.
 */
import type { BaseEntity } from "@modules/identity/core/domain/types";

export interface TenantPlanFeatureData {
  id: string;
  key: string;
  value: string;
  valueType: string;
  displayName?: string;
}

export interface TenantPlanData extends BaseEntity {
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  isActive: boolean;
  isPublic: boolean;
  trialDays: number;
  maxUsers: number;
  sortOrder: number;
  activeSubscriberCount: number;
  features?: TenantPlanFeatureData[];
  updatedAt?: string;
}

export class TenantPlan {
  constructor(private readonly data: TenantPlanData) {}

  get id(): string { return this.data.id; }
  get tenantId(): string { return this.data.tenantId; }
  get name(): string { return this.data.name; }
  get description(): string | undefined { return this.data.description; }
  get price(): number { return this.data.price; }
  get currency(): string { return this.data.currency; }
  get billingCycle(): string { return this.data.billingCycle; }
  get isActive(): boolean { return this.data.isActive; }
  get isPublic(): boolean { return this.data.isPublic; }
  get trialDays(): number { return this.data.trialDays; }
  get maxUsers(): number { return this.data.maxUsers; }
  get sortOrder(): number { return this.data.sortOrder; }
  get activeSubscriberCount(): number { return this.data.activeSubscriberCount; }
  get features(): TenantPlanFeatureData[] { return this.data.features ?? []; }
  get createdAt(): string { return this.data.createdAt; }
  get updatedAt(): string | undefined { return this.data.updatedAt; }

  // ── Computed Properties ──
  get isUnlimitedUsers(): boolean { return this.data.maxUsers === -1; }
  get hasFeatures(): boolean { return this.features.length > 0; }
  get hasTrial(): boolean { return this.data.trialDays > 0; }
  get hasActiveSubscribers(): boolean { return this.data.activeSubscriberCount > 0; }

  get formattedPrice(): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.data.currency || "USD",
      minimumFractionDigits: 2,
    }).format(this.data.price);
  }

  get maxUsersDisplay(): string {
    return this.isUnlimitedUsers ? "∞" : String(this.data.maxUsers);
  }

  copyWith(updates: Partial<TenantPlanData>): TenantPlan {
    return new TenantPlan({ ...this.data, ...updates });
  }
}
