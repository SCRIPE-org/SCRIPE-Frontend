/**
 * Stripe Connect API Response Models — matches backend DTOs exactly.
 * These are raw DTO shapes — never used in presentation layer directly.
 */

export interface PagedResultModel<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Interface structure detailing the properties and attributes of Connect Account Response Model.
 */
export interface ConnectAccountResponseModel {
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
 * Interface structure detailing the properties and attributes of Connect Account List Response Model.
 */
export interface ConnectAccountListResponseModel {
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
 * Interface structure detailing the properties and attributes of Connect Account Result Model.
 */
export interface ConnectAccountResultModel {
  accountId: string;
  onboardingUrl: string;
  status: string;
}

/**
 * Interface structure detailing the properties and attributes of Commission Response Model.
 */
export interface CommissionResponseModel {
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
 * Interface structure detailing the properties and attributes of Commission Dashboard Response Model.
 */
export interface CommissionDashboardResponseModel {
  totalCommission: number;
  totalRefunded: number;
  netCommission: number;
  totalTransactions: number;
  activeTenants: number;
  globalCommissionRate: number;
  recentTrends: CommissionTrendPointModel[];
}

/**
 * Interface structure detailing the properties and attributes of Commission Trend Point Model.
 */
export interface CommissionTrendPointModel {
  date: string;
  amount: number;
  count: number;
}

/**
 * Interface structure detailing the properties and attributes of Top Tenant Response Model.
 */
export interface TopTenantResponseModel {
  tenantId: string;
  totalCommission: number;
  transactionCount: number;
}

/** Lightweight DTO for the eligible-tenants picker — matches backend EligibleTenantItem. */
export interface EligibleTenantItemModel {
  id: string;
  name: string;
  code: string;
}

// ── Tenant Self-Service Transaction Models ──

/**
 * Interface structure detailing the properties and attributes of Tenant Transactions Response Model.
 */
export interface TenantTransactionsResponseModel {
  summary: TenantFinancialSummaryModel;
  transactions: PagedResultModel<TenantTransactionItemModel>;
}

/**
 * Interface structure detailing the properties and attributes of Tenant Financial Summary Model.
 */
export interface TenantFinancialSummaryModel {
  totalGrossRevenue: number;
  totalPlatformFees: number;
  totalNetRevenue: number;
  totalRefunded: number;
  totalTransactions: number;
  refundCount: number;
  currency: string;
}

/**
 * Interface structure detailing the properties and attributes of Tenant Transaction Item Model.
 */
export interface TenantTransactionItemModel {
  id: string;
  type: string; // "Payment" | "Refund" | "PartialRefund"
  status: string; // "Pending" | "Collected" | "Refunded" | "PartiallyRefunded"
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
