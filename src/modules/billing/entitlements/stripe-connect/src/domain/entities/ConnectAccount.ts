// FILE-EXCEPTION: file length
/**
 * Stripe Connect Domain Entities — Rich domain models with computed properties.
 */

// ── Connect Account (Full Detail) ──

/**
 * Domain model representing a Connect Account Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ConnectAccountData {
  id: string;
  tenantId: string;
  tenantName: string;
  stripeAccountId: string;
  accountType: string;
  onboardingStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingCompletedAt?: string;
  disabledReason?: string;
  defaultCurrency?: string;
  country?: string;
  commissionRate?: number;
  payoutDelayDays: number;
  lastPayoutAt?: string;
  totalPayoutsAmount: number;
  totalPayoutsCount: number;
  isFullyOnboarded: boolean;
  effectiveCommissionRate: number;
}

/**
 * Domain model representing a Connect Account structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ConnectAccount {
  constructor(public readonly data: ConnectAccountData) {}

  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get tenantName(): string {
    return this.data.tenantName;
  }
  get stripeAccountId(): string {
    return this.data.stripeAccountId;
  }
  get accountType(): string {
    return this.data.accountType;
  }
  get onboardingStatus(): string {
    return this.data.onboardingStatus;
  }
  get chargesEnabled(): boolean {
    return this.data.chargesEnabled;
  }
  get payoutsEnabled(): boolean {
    return this.data.payoutsEnabled;
  }
  get onboardingCompletedAt(): string | undefined {
    return this.data.onboardingCompletedAt;
  }
  get disabledReason(): string | undefined {
    return this.data.disabledReason;
  }
  get defaultCurrency(): string | undefined {
    return this.data.defaultCurrency;
  }
  get country(): string | undefined {
    return this.data.country;
  }
  get commissionRate(): number | undefined {
    return this.data.commissionRate;
  }
  get payoutDelayDays(): number {
    return this.data.payoutDelayDays;
  }
  get lastPayoutAt(): string | undefined {
    return this.data.lastPayoutAt;
  }
  get totalPayoutsAmount(): number {
    return this.data.totalPayoutsAmount;
  }
  get totalPayoutsCount(): number {
    return this.data.totalPayoutsCount;
  }
  get isFullyOnboarded(): boolean {
    return this.data.isFullyOnboarded;
  }
  get effectiveCommissionRate(): number {
    return this.data.effectiveCommissionRate;
  }

  // ── Computed Properties ──
  get isPending(): boolean {
    return this.data.onboardingStatus === "Pending";
  }
  get isComplete(): boolean {
    return this.data.onboardingStatus === "Complete";
  }
  get isRestricted(): boolean {
    return this.data.onboardingStatus === "Restricted";
  }
  get hasOverrideRate(): boolean {
    return this.data.commissionRate != null;
  }
  get effectiveRatePercent(): string {
    return `${(this.data.effectiveCommissionRate * 100).toFixed(1)}%`;
  }
  get maskedAccountId(): string {
    const id = this.data.stripeAccountId;
    return id.length > 10 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
  }
  get statusColor(): string {
    switch (this.data.onboardingStatus) {
      case "Complete":
        return "success";
      case "Pending":
        return "warning";
      case "Restricted":
        return "destructive";
      default:
        return "secondary";
    }
  }

  copyWith(updates: Partial<ConnectAccountData>): ConnectAccount {
    return new ConnectAccount({ ...this.data, ...updates });
  }
}

// ── Connect Account List Item ──

/**
 * Domain model representing a Connect Account List Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ConnectAccountListData {
  id: string;
  tenantId: string;
  tenantName: string;
  stripeAccountId: string;
  onboardingStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  country?: string;
  effectiveCommissionRate: number;
  totalPayoutsAmount: number;
  createdAt: string;
}

/**
 * Domain model representing a Connect Account List Item structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ConnectAccountListItem {
  constructor(public readonly data: ConnectAccountListData) {}

  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get tenantName(): string {
    return this.data.tenantName;
  }
  get stripeAccountId(): string {
    return this.data.stripeAccountId;
  }
  get onboardingStatus(): string {
    return this.data.onboardingStatus;
  }
  get chargesEnabled(): boolean {
    return this.data.chargesEnabled;
  }
  get payoutsEnabled(): boolean {
    return this.data.payoutsEnabled;
  }
  get country(): string | undefined {
    return this.data.country;
  }
  get effectiveCommissionRate(): number {
    return this.data.effectiveCommissionRate;
  }
  get totalPayoutsAmount(): number {
    return this.data.totalPayoutsAmount;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }

  get maskedAccountId(): string {
    const id = this.data.stripeAccountId;
    return id.length > 10 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
  }

  copyWith(updates: Partial<ConnectAccountListData>): ConnectAccountListItem {
    return new ConnectAccountListItem({ ...this.data, ...updates });
  }
}

// ── Commission ──

/**
 * Domain model representing a Commission Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CommissionData {
  id: string;
  tenantId: string;
  userSubscriptionId: string;
  stripePaymentIntentId: string;
  grossAmount: number;
  commissionAmount: number;
  commissionRate: number;
  netAmount: number;
  currency: string;
  status: string;
  collectedAt?: string;
  refundedAt?: string;
  refundedAmount?: number;
  createdAt: string;
}

/**
 * Domain model representing a Commission structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class Commission {
  constructor(public readonly data: CommissionData) {}

  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get userSubscriptionId(): string {
    return this.data.userSubscriptionId;
  }
  get stripePaymentIntentId(): string {
    return this.data.stripePaymentIntentId;
  }
  get grossAmount(): number {
    return this.data.grossAmount;
  }
  get commissionAmount(): number {
    return this.data.commissionAmount;
  }
  get commissionRate(): number {
    return this.data.commissionRate;
  }
  get netAmount(): number {
    return this.data.netAmount;
  }
  get currency(): string {
    return this.data.currency;
  }
  get status(): string {
    return this.data.status;
  }
  get collectedAt(): string | undefined {
    return this.data.collectedAt;
  }
  get refundedAt(): string | undefined {
    return this.data.refundedAt;
  }
  get refundedAmount(): number | undefined {
    return this.data.refundedAmount;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }

  get isCollected(): boolean {
    return this.data.status === "Collected";
  }
  get isRefunded(): boolean {
    return this.data.status === "Refunded";
  }
  get ratePercent(): string {
    return `${(this.data.commissionRate * 100).toFixed(1)}%`;
  }
}

// ── Dashboard ──

/**
 * Domain model representing a Commission Dashboard Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CommissionDashboardData {
  totalCommission: number;
  totalRefunded: number;
  netCommission: number;
  totalTransactions: number;
  activeTenants: number;
  globalCommissionRate: number;
  recentTrends: CommissionTrendPoint[];
}

/**
 * Domain model representing a Commission Dashboard structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class CommissionDashboard {
  constructor(public readonly data: CommissionDashboardData) {}

  get totalCommission(): number {
    return this.data.totalCommission;
  }
  get totalRefunded(): number {
    return this.data.totalRefunded;
  }
  get netCommission(): number {
    return this.data.netCommission;
  }
  get totalTransactions(): number {
    return this.data.totalTransactions;
  }
  get activeTenants(): number {
    return this.data.activeTenants;
  }
  get globalCommissionRate(): number {
    return this.data.globalCommissionRate;
  }
  get recentTrends(): CommissionTrendPoint[] {
    return this.data.recentTrends;
  }

  get globalRatePercent(): string {
    return `${(this.data.globalCommissionRate * 100).toFixed(1)}%`;
  }
  get hasRevenue(): boolean {
    return this.data.totalCommission > 0;
  }
}

// ── Simple Value Types ──

/**
 * Domain model representing a Commission Trend Point structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CommissionTrendPoint {
  date: string;
  amount: number;
  count: number;
}

/**
 * Domain model representing a Top Tenant Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TopTenantData {
  tenantId: string;
  totalCommission: number;
  transactionCount: number;
}

// ── Tenant Self-Service Transactions ──

/**
 * Domain model representing a Tenant Financial Summary Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TenantFinancialSummaryData {
  totalGrossRevenue: number;
  totalPlatformFees: number;
  totalNetRevenue: number;
  totalRefunded: number;
  totalTransactions: number;
  refundCount: number;
  currency: string;
}

/**
 * Domain model representing a Tenant Financial Summary structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class TenantFinancialSummary {
  constructor(public readonly data: TenantFinancialSummaryData) {}

  get totalGrossRevenue() {
    return this.data.totalGrossRevenue;
  }
  get totalPlatformFees() {
    return this.data.totalPlatformFees;
  }
  get totalNetRevenue() {
    return this.data.totalNetRevenue;
  }
  get totalRefunded() {
    return this.data.totalRefunded;
  }
  get totalTransactions() {
    return this.data.totalTransactions;
  }
  get refundCount() {
    return this.data.refundCount;
  }
  get currency() {
    return this.data.currency;
  }
}

/**
 * Domain model representing a Tenant Transaction Item Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TenantTransactionItemData {
  id: string;
  type: string;
  status: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  commissionRate: number;
  stripePaymentIntentId?: string;
  refundedAmount?: number;
  refundedAt?: string;
  transactionDate: string;
}

/**
 * Domain model representing a Tenant Transaction Item structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class TenantTransactionItem {
  constructor(public readonly data: TenantTransactionItemData) {}

  get id() {
    return this.data.id;
  }
  get type() {
    return this.data.type;
  }
  get status() {
    return this.data.status;
  }
  get grossAmount() {
    return this.data.grossAmount;
  }
  get platformFee() {
    return this.data.platformFee;
  }
  get netAmount() {
    return this.data.netAmount;
  }
  get currency() {
    return this.data.currency;
  }
  get commissionRate() {
    return this.data.commissionRate;
  }
  get stripePaymentIntentId() {
    return this.data.stripePaymentIntentId;
  }
  get refundedAmount() {
    return this.data.refundedAmount;
  }
  get refundedAt() {
    return this.data.refundedAt;
  }
  get transactionDate() {
    return this.data.transactionDate;
  }

  get isPayment() {
    return this.data.type === "Payment";
  }
  get isRefund() {
    return this.data.type === "Refund";
  }
  get isPartialRefund() {
    return this.data.type === "PartialRefund";
  }

  get ratePercent(): string {
    return `${(this.data.commissionRate * 100).toFixed(1)}%`;
  }
}

/**
 * Domain model representing a Tenant Transactions Result structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TenantTransactionsResult {
  summary: TenantFinancialSummary;
  transactions: {
    items: TenantTransactionItem[];
    totalCount: number;
  };
}
