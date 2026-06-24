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
 * Interface defining property specifications, keys types, and structural contract rules for connect account response model.
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
 * Interface defining property specifications, keys types, and structural contract rules for connect account list response model.
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
 * Interface defining property specifications, keys types, and structural contract rules for connect account result model.
 */
export interface ConnectAccountResultModel {
  accountId: string;
  onboardingUrl: string;
  status: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for commission response model.
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
 * Interface defining property specifications, keys types, and structural contract rules for commission dashboard response model.
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
 * Interface defining property specifications, keys types, and structural contract rules for commission trend point model.
 */
export interface CommissionTrendPointModel {
  date: string;
  amount: number;
  count: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for top tenant response model.
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
 * Interface defining property specifications, keys types, and structural contract rules for tenant transactions response model.
 */
export interface TenantTransactionsResponseModel {
  summary: TenantFinancialSummaryModel;
  transactions: PagedResultModel<TenantTransactionItemModel>;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for tenant financial summary model.
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
 * Interface defining property specifications, keys types, and structural contract rules for tenant transaction item model.
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
