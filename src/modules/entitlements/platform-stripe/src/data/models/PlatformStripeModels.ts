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
 * Interface defining property specifications, keys types, and structural contract rules for platform account model.
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
 * Interface defining property specifications, keys types, and structural contract rules for platform balance model.
 */
export interface PlatformBalanceModel {
  available: BalanceAmountModel[];
  pending: BalanceAmountModel[];
  connectReserved: BalanceAmountModel[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for balance amount model.
 */
export interface BalanceAmountModel {
  currency: string;
  amount: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for platform transaction model.
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
 * Interface defining property specifications, keys types, and structural contract rules for platform payout model.
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
 * Interface defining property specifications, keys types, and structural contract rules for platform connect summary model.
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
 * Interface defining property specifications, keys types, and structural contract rules for platform stripe links model.
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
