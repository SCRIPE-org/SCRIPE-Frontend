/**
 * TenantPlan Entity — Rich domain model for tenant-created plans.
 *
 * Elevated Tier 2 Architecture:
 * - Multi-currency pricing matrix (TenantPlanPrice[])
 * - Feature catalog references (not inline key/value)
 * - Lifecycle status (Draft → Published → Archived)
 * - Immutable version snapshots
 */
import type { BaseEntity } from "@modules/identity/core/domain/types";

// ── Sub-entities ──
export interface TenantPlanFeatureData {
  featureDefinitionId: string;
  featureKey: string;
  featureDisplayNameEn?: string;
  featureDisplayNameAr?: string;
  featureValueType: string;
  value: string;
  overrideLabel?: string;
}

export interface TenantPlanPriceData {
  id: string;
  currency: string;
  billingCycle: string;
  amount: number;
  originalAmount?: number;
  isPromotional: boolean;
}

export interface TenantPlanVersionData {
  id: string;
  versionNumber: number;
  snapshotJson: string;
  changeNotes?: string;
  status: string;
  publishedAt: string;
  publishedBy?: string;
}

// ── Main entity data ──
export interface TenantPlanData extends BaseEntity {
  tenantId: string;
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  tagline?: string;
  status: string;
  isActive: boolean;
  isPublic: boolean;
  badgeText?: string;
  color?: string;
  iconName?: string;
  maxSubscribers?: number;
  maxUsers: number;
  allowMonthly: boolean;
  allowYearly: boolean;
  allowLifetime: boolean;
  allowTrial: boolean;
  isSelfServiceEnabled: boolean;
  isContactSalesOnly: boolean;
  trialDays: number;
  gracePeriodDays: number;
  fallbackPlanId?: string;
  tierLevel: number;
  sortOrder: number;
  currentVersion: number;
  activeSubscriberCount: number;
  features?: TenantPlanFeatureData[];
  prices?: TenantPlanPriceData[];
  versions?: TenantPlanVersionData[];
  updatedAt?: string;
}

export class TenantPlan {
  constructor(private readonly data: TenantPlanData) {}

  // ── Basic getters ──
  get id(): string { return this.data.id; }
  get tenantId(): string { return this.data.tenantId; }
  get name(): string { return this.data.name; }
  get displayNameEn(): string | undefined { return this.data.displayNameEn; }
  get displayNameAr(): string | undefined { return this.data.displayNameAr; }
  get description(): string | undefined { return this.data.description; }
  get tagline(): string | undefined { return this.data.tagline; }
  get status(): string { return this.data.status; }
  get isActive(): boolean { return this.data.isActive; }
  get isPublic(): boolean { return this.data.isPublic; }
  get badgeText(): string | undefined { return this.data.badgeText; }
  get color(): string | undefined { return this.data.color; }
  get iconName(): string | undefined { return this.data.iconName; }
  get maxSubscribers(): number | undefined { return this.data.maxSubscribers; }
  get maxUsers(): number { return this.data.maxUsers; }
  get allowMonthly(): boolean { return this.data.allowMonthly; }
  get allowYearly(): boolean { return this.data.allowYearly; }
  get allowLifetime(): boolean { return this.data.allowLifetime; }
  get allowTrial(): boolean { return this.data.allowTrial; }
  get isSelfServiceEnabled(): boolean { return this.data.isSelfServiceEnabled; }
  get isContactSalesOnly(): boolean { return this.data.isContactSalesOnly; }
  get trialDays(): number { return this.data.trialDays; }
  get gracePeriodDays(): number { return this.data.gracePeriodDays; }
  get fallbackPlanId(): string | undefined { return this.data.fallbackPlanId; }
  get tierLevel(): number { return this.data.tierLevel; }
  get sortOrder(): number { return this.data.sortOrder; }
  get currentVersion(): number { return this.data.currentVersion; }
  get activeSubscriberCount(): number { return this.data.activeSubscriberCount; }
  get features(): TenantPlanFeatureData[] { return this.data.features ?? []; }
  get prices(): TenantPlanPriceData[] { return this.data.prices ?? []; }
  get versions(): TenantPlanVersionData[] { return this.data.versions ?? []; }
  get createdAt(): string { return this.data.createdAt; }
  get updatedAt(): string | undefined { return this.data.updatedAt; }

  // ── Computed Properties ──
  get isDraft(): boolean { return this.data.status === "Draft"; }
  get isPublished(): boolean { return this.data.status === "Published"; }
  get isArchived(): boolean { return this.data.status === "Archived"; }
  get isUnlimitedUsers(): boolean { return this.data.maxUsers === -1; }
  get hasFeatures(): boolean { return this.features.length > 0; }
  get hasTrial(): boolean { return this.data.allowTrial && this.data.trialDays > 0; }
  get hasActiveSubscribers(): boolean { return this.data.activeSubscriberCount > 0; }
  get hasPrices(): boolean { return this.prices.length > 0; }
  get hasVersions(): boolean { return this.versions.length > 0; }
  get featureCount(): number { return this.features.length; }
  get priceCount(): number { return this.prices.length; }

  /** Get the cheapest price across all currencies/cycles */
  get startingPrice(): number {
    if (this.prices.length === 0) return 0;
    return Math.min(...this.prices.map(p => p.amount));
  }

  /** Get starting price formatted */
  get formattedStartingPrice(): string {
    if (this.prices.length === 0) return "Free";
    const cheapest = this.prices.reduce((min, p) => p.amount < min.amount ? p : min, this.prices[0]);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cheapest.currency || "USD",
      minimumFractionDigits: 2,
    }).format(cheapest.amount);
  }

  /** List of supported billing cycles */
  get supportedCycles(): string[] {
    const cycles: string[] = [];
    if (this.data.allowMonthly) cycles.push("Monthly");
    if (this.data.allowYearly) cycles.push("Yearly");
    if (this.data.allowLifetime) cycles.push("Lifetime");
    return cycles;
  }

  get maxUsersDisplay(): string {
    return this.isUnlimitedUsers ? "∞" : String(this.data.maxUsers);
  }

  /** Status badge color mapping */
  get statusColor(): "default" | "success" | "secondary" | "destructive" {
    switch (this.data.status) {
      case "Published": return "success";
      case "Draft": return "secondary";
      case "Archived": return "destructive";
      default: return "default";
    }
  }

  copyWith(updates: Partial<TenantPlanData>): TenantPlan {
    return new TenantPlan({ ...this.data, ...updates });
  }
}

// ── Feature Definition Entity ──
export interface TenantFeatureDefinitionData {
  id: string;
  tenantId?: string;
  key: string;
  displayNameEn?: string;
  displayNameAr?: string;
  valueType: string;
  defaultValue?: string;
  category?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  planUsageCount: number;
  createdAt: string;
  updatedAt?: string;
}

export class TenantFeatureDefinition {
  constructor(private readonly data: TenantFeatureDefinitionData) {}

  get id(): string { return this.data.id; }
  get tenantId(): string | undefined { return this.data.tenantId; }
  get key(): string { return this.data.key; }
  get displayNameEn(): string { return this.data.displayNameEn ?? this.data.key; }
  get displayNameAr(): string { return this.data.displayNameAr ?? this.data.key; }
  get valueType(): string { return this.data.valueType; }
  get defaultValue(): string { return this.data.defaultValue ?? ""; }
  get category(): string { return this.data.category ?? "General"; }
  get description(): string | undefined { return this.data.description; }
  get sortOrder(): number { return this.data.sortOrder; }
  get isActive(): boolean { return this.data.isActive; }
  get planUsageCount(): number { return this.data.planUsageCount; }
  get createdAt(): string { return this.data.createdAt; }
  get updatedAt(): string | undefined { return this.data.updatedAt; }

  get isBoolean(): boolean { return this.data.valueType === "Boolean"; }
  get isNumeric(): boolean { return this.data.valueType === "Numeric"; }
  get isString(): boolean { return this.data.valueType === "String"; }
  get isInUse(): boolean { return this.data.planUsageCount > 0; }

  copyWith(updates: Partial<TenantFeatureDefinitionData>): TenantFeatureDefinition {
    return new TenantFeatureDefinition({ ...this.data, ...updates });
  }
}

// ── Promotion Entity ──
export interface TenantPlanPromotionData {
  id: string;
  tenantId?: string;
  tenantPlanId?: string;
  tenantPlanName?: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  maxRedemptions?: number;
  currentRedemptions: number;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  minimumAmount?: number;
  applicableCycles?: string;
  isAutoApplied: boolean;
  isStackable: boolean;
  isValid: boolean;
  createdAt: string;
  updatedAt?: string;
}

export class TenantPlanPromotion {
  constructor(private readonly data: TenantPlanPromotionData) {}

  get id(): string { return this.data.id; }
  get tenantPlanId(): string | undefined { return this.data.tenantPlanId; }
  get tenantPlanName(): string { return this.data.tenantPlanName ?? "All Plans"; }
  get code(): string { return this.data.code; }
  get description(): string | undefined { return this.data.description; }
  get discountType(): string { return this.data.discountType; }
  get discountValue(): number { return this.data.discountValue; }
  get maxRedemptions(): number | undefined { return this.data.maxRedemptions; }
  get currentRedemptions(): number { return this.data.currentRedemptions; }
  get startsAt(): string { return this.data.startsAt; }
  get expiresAt(): string | undefined { return this.data.expiresAt; }
  get isActive(): boolean { return this.data.isActive; }
  get minimumAmount(): number | undefined { return this.data.minimumAmount; }
  get applicableCycles(): string | undefined { return this.data.applicableCycles; }
  get isAutoApplied(): boolean { return this.data.isAutoApplied; }
  get isStackable(): boolean { return this.data.isStackable; }
  get isValid(): boolean { return this.data.isValid; }
  get createdAt(): string { return this.data.createdAt; }
  get updatedAt(): string | undefined { return this.data.updatedAt; }

  get isPercentage(): boolean { return this.data.discountType === "Percentage"; }
  get isFixedAmount(): boolean { return this.data.discountType === "FixedAmount"; }
  get isFreeTrial(): boolean { return this.data.discountType === "FreeTrial"; }
  get isExpired(): boolean {
    if (!this.data.expiresAt) return false;
    return new Date(this.data.expiresAt) < new Date();
  }
  get isRedemptionLimitReached(): boolean {
    if (!this.data.maxRedemptions) return false;
    return this.data.currentRedemptions >= this.data.maxRedemptions;
  }
  get formattedDiscount(): string {
    if (this.isPercentage) return `${this.data.discountValue}%`;
    if (this.isFreeTrial) return `${this.data.discountValue} days free`;
    return `$${this.data.discountValue.toFixed(2)}`;
  }

  copyWith(updates: Partial<TenantPlanPromotionData>): TenantPlanPromotion {
    return new TenantPlanPromotion({ ...this.data, ...updates });
  }
}
