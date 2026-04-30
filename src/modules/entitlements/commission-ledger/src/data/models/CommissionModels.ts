export interface PagedResultModel<T> {
  items: T[];
  totalCount: number;
}

export interface CommissionLedgerEntryModel {
  id: string;
  tenantId: string;
  userSubscriptionId: string;
  paymentTransactionId: string | null;
  commissionInvoiceId: string | null;
  gateway: string;
  gatewayTransactionId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: string;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

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
