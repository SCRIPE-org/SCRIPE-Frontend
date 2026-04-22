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

export interface ConnectAccountResultModel {
  accountId: string;
  onboardingUrl: string;
  status: string;
}

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

export interface CommissionDashboardResponseModel {
  totalCommission: number;
  totalRefunded: number;
  netCommission: number;
  totalTransactions: number;
  activeTenants: number;
  globalCommissionRate: number;
  recentTrends: CommissionTrendPointModel[];
}

export interface CommissionTrendPointModel {
  date: string;
  amount: number;
  count: number;
}

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
