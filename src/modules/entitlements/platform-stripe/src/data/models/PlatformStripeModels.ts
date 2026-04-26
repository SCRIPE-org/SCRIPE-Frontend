/**
 * Platform Stripe Dashboard — Data Models
 * Raw DTO types matching the PlatformStripeDashboardResponse from backend.
 */

export interface PlatformStripeDashboardModel {
  account: PlatformAccountModel;
  balance: PlatformBalanceModel;
  recentTransactions: PlatformTransactionModel[];
  recentPayouts: PlatformPayoutModel[];
  connectSummary: PlatformConnectSummaryModel;
  links: PlatformStripeLinksModel;
}

export interface PlatformAccountModel {
  accountId: string;
  businessName?: string;
  email?: string;
  country?: string;
  defaultCurrency?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  businessType?: string;
  supportPhone?: string;
  supportEmail?: string;
  supportUrl?: string;
  statementDescriptor?: string;
}

export interface PlatformBalanceModel {
  available: BalanceAmountModel[];
  pending: BalanceAmountModel[];
  connectReserved: BalanceAmountModel[];
}

export interface BalanceAmountModel {
  currency: string;
  amount: number;
}

export interface PlatformTransactionModel {
  id: string;
  type: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  description?: string;
  source?: string;
  created: string;
  status: string;
}

export interface PlatformPayoutModel {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate?: string;
  method?: string;
  description?: string;
  type: string;
  created: string;
}

export interface PlatformConnectSummaryModel {
  totalAccounts: number;
  activeAccounts: number;
  pendingOnboarding: number;
  disabledAccounts: number;
  totalCommissionsEarned: number;
  totalCommissionsPending: number;
}

export interface PlatformStripeLinksModel {
  dashboard: string;
  payments: string;
  payouts: string;
  connect: string;
  developers: string;
  webhooks: string;
  events: string;
  customers: string;
}
