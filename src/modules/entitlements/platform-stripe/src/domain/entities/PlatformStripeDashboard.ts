/**
 * Platform Stripe Dashboard — Rich Domain Entities
 *
 * These are the domain-level representations used in the presentation layer.
 * They are created from DTOs via PlatformStripeMapper and expose computed props.
 */

// ── Balance Amount ──
export interface BalanceAmountData {
  currency: string;
  amount: number;
}

export class BalanceAmount {
  constructor(private readonly data: BalanceAmountData) {}
  get currency() {
    return this.data.currency;
  }
  get amount() {
    return this.data.amount;
  }

  /** Amount in major units (cents → dollars) */
  get displayAmount() {
    return this.data.amount / 100;
  }

  copyWith(updates: Partial<BalanceAmountData>): BalanceAmount {
    return new BalanceAmount({ ...this.data, ...updates });
  }
}

// ── Platform Account ──
export interface PlatformAccountData {
  accountId: string;
  businessName: string;
  email: string;
  country: string;
  defaultCurrency: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  businessType: string;
  supportPhone: string;
  supportEmail: string;
  supportUrl: string;
  statementDescriptor: string;
}

export class PlatformAccount {
  constructor(private readonly data: PlatformAccountData) {}

  get accountId() {
    return this.data.accountId;
  }
  get businessName() {
    return this.data.businessName;
  }
  get email() {
    return this.data.email;
  }
  get country() {
    return this.data.country;
  }
  get defaultCurrency() {
    return this.data.defaultCurrency;
  }
  get chargesEnabled() {
    return this.data.chargesEnabled;
  }
  get payoutsEnabled() {
    return this.data.payoutsEnabled;
  }
  get detailsSubmitted() {
    return this.data.detailsSubmitted;
  }
  get businessType() {
    return this.data.businessType;
  }
  get supportPhone() {
    return this.data.supportPhone;
  }
  get supportEmail() {
    return this.data.supportEmail;
  }
  get supportUrl() {
    return this.data.supportUrl;
  }
  get statementDescriptor() {
    return this.data.statementDescriptor;
  }

  /** Display name: business name or fallback to "Stripe Account" */
  get displayName() {
    return this.data.businessName || "Stripe Account";
  }

  /** Whether the account has any support contact info */
  get hasSupportInfo() {
    return !!(this.data.supportEmail || this.data.supportPhone || this.data.supportUrl);
  }

  /** Whether all capabilities are active */
  get isFullyEnabled() {
    return this.data.chargesEnabled && this.data.payoutsEnabled && this.data.detailsSubmitted;
  }

  copyWith(updates: Partial<PlatformAccountData>): PlatformAccount {
    return new PlatformAccount({ ...this.data, ...updates });
  }
}

// ── Platform Balance ──
export interface PlatformBalanceData {
  available: BalanceAmount[];
  pending: BalanceAmount[];
  connectReserved: BalanceAmount[];
}

export class PlatformBalance {
  constructor(private readonly data: PlatformBalanceData) {}

  get available() {
    return this.data.available;
  }
  get pending() {
    return this.data.pending;
  }
  get connectReserved() {
    return this.data.connectReserved;
  }

  copyWith(updates: Partial<PlatformBalanceData>): PlatformBalance {
    return new PlatformBalance({ ...this.data, ...updates });
  }
}

// ── Platform Transaction ──
export interface PlatformTransactionData {
  id: string;
  type: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  description: string;
  source: string;
  created: string;
  status: string;
}

export class PlatformTransaction {
  constructor(private readonly data: PlatformTransactionData) {}

  get id() {
    return this.data.id;
  }
  get type() {
    return this.data.type;
  }
  get amount() {
    return this.data.amount;
  }
  get fee() {
    return this.data.fee;
  }
  get net() {
    return this.data.net;
  }
  get currency() {
    return this.data.currency;
  }
  get description() {
    return this.data.description;
  }
  get source() {
    return this.data.source;
  }
  get created() {
    return this.data.created;
  }
  get status() {
    return this.data.status;
  }

  /** Whether the transaction is a credit (positive amount) */
  get isPositive() {
    return this.data.amount >= 0;
  }

  /** Display label: description or fallback to ID */
  get displayLabel() {
    return this.data.description || this.data.id;
  }

  copyWith(updates: Partial<PlatformTransactionData>): PlatformTransaction {
    return new PlatformTransaction({ ...this.data, ...updates });
  }
}

// ── Platform Payout ──
export interface PlatformPayoutData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string;
  method: string;
  description: string;
  type: string;
  created: string;
}

export class PlatformPayout {
  constructor(private readonly data: PlatformPayoutData) {}

  get id() {
    return this.data.id;
  }
  get amount() {
    return this.data.amount;
  }
  get currency() {
    return this.data.currency;
  }
  get status() {
    return this.data.status;
  }
  get arrivalDate() {
    return this.data.arrivalDate;
  }
  get method() {
    return this.data.method;
  }
  get description() {
    return this.data.description;
  }
  get type() {
    return this.data.type;
  }
  get created() {
    return this.data.created;
  }

  /** Whether this payout has an arrival date */
  get hasArrivalDate() {
    return !!this.data.arrivalDate;
  }

  copyWith(updates: Partial<PlatformPayoutData>): PlatformPayout {
    return new PlatformPayout({ ...this.data, ...updates });
  }
}

// ── Connect Summary ──
export interface PlatformConnectSummaryData {
  totalAccounts: number;
  activeAccounts: number;
  pendingOnboarding: number;
  disabledAccounts: number;
  totalCommissionsEarned: number;
  totalCommissionsPending: number;
}

export class PlatformConnectSummary {
  constructor(private readonly data: PlatformConnectSummaryData) {}

  get totalAccounts() {
    return this.data.totalAccounts;
  }
  get activeAccounts() {
    return this.data.activeAccounts;
  }
  get pendingOnboarding() {
    return this.data.pendingOnboarding;
  }
  get disabledAccounts() {
    return this.data.disabledAccounts;
  }
  get totalCommissionsEarned() {
    return this.data.totalCommissionsEarned;
  }
  get totalCommissionsPending() {
    return this.data.totalCommissionsPending;
  }

  /** Net commissions (earned - pending) */
  get netCommissions() {
    return this.data.totalCommissionsEarned - this.data.totalCommissionsPending;
  }

  copyWith(updates: Partial<PlatformConnectSummaryData>): PlatformConnectSummary {
    return new PlatformConnectSummary({ ...this.data, ...updates });
  }
}

// ── Stripe Links ──
export interface PlatformStripeLinksData {
  dashboard: string;
  payments: string;
  payouts: string;
  connect: string;
  developers: string;
  webhooks: string;
  events: string;
  customers: string;
}

export class PlatformStripeLinks {
  constructor(private readonly data: PlatformStripeLinksData) {}

  get dashboard() {
    return this.data.dashboard;
  }
  get payments() {
    return this.data.payments;
  }
  get payouts() {
    return this.data.payouts;
  }
  get connect() {
    return this.data.connect;
  }
  get developers() {
    return this.data.developers;
  }
  get webhooks() {
    return this.data.webhooks;
  }
  get events() {
    return this.data.events;
  }
  get customers() {
    return this.data.customers;
  }

  copyWith(updates: Partial<PlatformStripeLinksData>): PlatformStripeLinks {
    return new PlatformStripeLinks({ ...this.data, ...updates });
  }
}

// ── Root Dashboard Entity ──
export interface PlatformStripeDashboardData {
  account: PlatformAccount;
  balance: PlatformBalance;
  recentTransactions: PlatformTransaction[];
  recentPayouts: PlatformPayout[];
  connectSummary: PlatformConnectSummary;
  links: PlatformStripeLinks;
}

export class PlatformStripeDashboard {
  constructor(private readonly data: PlatformStripeDashboardData) {}

  get account() {
    return this.data.account;
  }
  get balance() {
    return this.data.balance;
  }
  get recentTransactions() {
    return this.data.recentTransactions;
  }
  get recentPayouts() {
    return this.data.recentPayouts;
  }
  get connectSummary() {
    return this.data.connectSummary;
  }
  get links() {
    return this.data.links;
  }

  /** Whether there are any recent transactions */
  get hasTransactions() {
    return this.data.recentTransactions.length > 0;
  }

  /** Whether there are any recent payouts */
  get hasPayouts() {
    return this.data.recentPayouts.length > 0;
  }

  copyWith(updates: Partial<PlatformStripeDashboardData>): PlatformStripeDashboard {
    return new PlatformStripeDashboard({ ...this.data, ...updates });
  }
}
