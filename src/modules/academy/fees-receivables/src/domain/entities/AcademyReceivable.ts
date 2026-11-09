export interface PaymentAllocationSummary {
  paymentId: string;
  paymentNumber: string;
  amount: number;
  currencyCode: string;
  allocatedAtUtc: string;
  receiptNumber?: string | null;
}

export interface AcademyFeeReceivableItem {
  enrollmentId: string;
  athleteId: string;
  athleteNameEn?: string | null;
  athleteNameAr?: string | null;
  offeringId: string;
  offeringNameEn: string;
  offeringNameAr: string;
  programId: string;
  programNameEn: string;
  branchId: string;
  enrollmentDate: string;
  enrollmentStatus: string;
  billingStatus: string; // "Unbilled" | "Invoiced" | "Paid" | "Waived" | "Overdue" | "PartiallyPaid"
  quoteAmount: number;
  priceCurrency: string;
  financeInvoiceReference?: string | null;
  financeInvoiceStatus?: string | null;
  totalInvoicedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  issuedAtUtc?: string | null;
  dueAtUtc?: string | null;
  isOverdue: boolean;
  daysOverdue: number;
  payerPartyId?: string | null;
  notes?: string | null;
  allocations: PaymentAllocationSummary[];
}

export interface AcademyFeesSummaryByCurrency {
  currencyCode: string;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  invoicedCount: number;
  paidCount: number;
  outstandingCount: number;
  overdueCount: number;
  waivedCount: number;
  unbilledCount: number;
}

export interface AcademyFeesReceivablesResponse {
  items: AcademyFeeReceivableItem[];
  summaries: AcademyFeesSummaryByCurrency[];
  totalCount: number;
  page: number;
  pageSize: number;
  asOfUtc: string;
  blockedCapabilities: string[];
}

export interface FeesReceivablesFilters {
  branchId?: string;
  programId?: string;
  offeringId?: string;
  payerPartyId?: string;
  billingStatus?: string;
  overdueOnly?: boolean;
  currencyCode?: string;
  page?: number;
  pageSize?: number;
}
