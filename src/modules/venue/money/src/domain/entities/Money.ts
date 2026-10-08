/**
 * Documentation for module export
 */
export interface MoneyInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  payerPartyId: string;
  reservationId: string | null;
  schedulableResourceId: string | null;
  currencyCode: string;
  totalAmount: number;
  adjustmentAmount: number;
  effectiveTotalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  creditAmount: number;
  issuedAtUtc: string;
  dueAtUtc: string | null;
}

/**
 * Documentation for module export
 */
export interface MoneyPayment {
  id: string;
  paymentNumber: string;
  status: string;
  method: "Cash" | "Card" | "POS" | "BankTransfer" | "Other";
  currencyCode: string;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  payerPartyId: string;
  reservationId: string | null;
  schedulableResourceId: string | null;
  facilityResourceProfileId: string | null;
  recordedAtUtc: string;
  externalReference: string | null;
  reason: string | null;
}

/**
 * Documentation for module export
 */
export interface MoneyPage<T> { items: T[]; totalCount: number; page?: number; pageSize?: number; }

/**
 * Documentation for module export
 */
export interface MoneyListFilter {
  reservationId?: string;
  payerPartyId?: string;
}

/**
 * Documentation for module export
 */
export interface RecordManualPaymentInput {
  payerPartyId: string;
  reservationId: string | null;
  schedulableResourceId: string | null;
  facilityResourceProfileId: string | null;
  method: MoneyPayment["method"];
  currencyCode: string;
  amount: number;
  idempotencyKey: string;
  externalReference: string | null;
  reason: string | null;
}

/**
 * Documentation for module export
 */
export interface RefundPaymentInput {
  invoiceId: string;
  amount: number;
  idempotencyKey: string;
  reason: string;
  externalReference: string | null;
}

/**
 * Documentation for module export
 */
export interface MoneyPaymentAllocation { id: string; paymentId: string; invoiceId: string; amount: number; allocatedAtUtc: string; }
/**
 * Documentation for module export
 */
export interface MoneyPaymentReceipt { id: string; paymentId: string; receiptNumber: string; issuedAtUtc: string; }
/**
 * Documentation for module export
 */
export interface MoneyPaymentRefund { id: string; paymentId: string; invoiceId: string; currencyCode: string; amount: number; reason: string; refundedAtUtc: string; }
/**
 * Documentation for module export
 */
export interface MoneyPaymentTimeline {
  payment: MoneyPayment;
  allocations: MoneyPaymentAllocation[];
  receipts: MoneyPaymentReceipt[];
  refunds: MoneyPaymentRefund[];
}
