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

/**
 * Interface structure detailing the properties and attributes of Platform Account Model.
 */
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

/**
 * Interface structure detailing the properties and attributes of Platform Balance Model.
 */
export interface PlatformBalanceModel {
  available: BalanceAmountModel[];
  pending: BalanceAmountModel[];
  connectReserved: BalanceAmountModel[];
}

/**
 * Interface structure detailing the properties and attributes of Balance Amount Model.
 */
export interface BalanceAmountModel {
  currency: string;
  amount: number;
}

/**
 * Interface structure detailing the properties and attributes of Platform Transaction Model.
 */
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

/**
 * Interface structure detailing the properties and attributes of Platform Payout Model.
 */
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

/**
 * Interface structure detailing the properties and attributes of Platform Connect Summary Model.
 */
export interface PlatformConnectSummaryModel {
  totalAccounts: number;
  activeAccounts: number;
  pendingOnboarding: number;
  disabledAccounts: number;
  totalCommissionsEarned: number;
  totalCommissionsPending: number;
}

/**
 * Interface structure detailing the properties and attributes of Platform Stripe Links Model.
 */
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
