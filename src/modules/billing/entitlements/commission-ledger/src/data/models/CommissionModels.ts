/**
 * Interface defining property specifications, keys types, and structural contract rules for paged result model.
 */
export interface PagedResultModel<T> {
  items: T[];
  totalCount: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for commission ledger entry model.
 */
export interface CommissionLedgerEntryModel {
  id: string;
  tenantId: string;
  userSubscriptionId: string | null;
  paymentTransactionId: string | null;
  commissionInvoiceId: string | null;
  gateway: string; // e.g. "StripeConnect" | "PayPal" | "Paymob"
  gatewayTransactionId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  currency: string;
  status: string; // "Collected" | "Unbilled" | "Invoiced" | "Paid" | "Waived"
  collectionMethod: string; // "Instant" | "PostBilling"
  stripePaymentIntentId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for commission invoice model.
 */
export interface CommissionInvoiceModel {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  totalCommission: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  chargeGateway: string;
  chargeGatewayTxId: string | null;
  autoChargeAttempts: number;
  lastChargeAttemptAt: string | null;
  lastChargeFailureReason: string | null;
  nextRetryAt: string | null;
  trigger: string;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}
