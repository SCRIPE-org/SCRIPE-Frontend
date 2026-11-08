export interface PaymentAllocationSummaryModel {
  paymentId: string;
  paymentNumber: string;
  amount: number;
  currencyCode: string;
  allocatedAtUtc: string;
  receiptNumber?: string | null;
}

export interface AcademyFeeReceivableItemModel {
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
  billingStatus: string;
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
  allocations?: PaymentAllocationSummaryModel[];
}

export interface AcademyFeesSummaryByCurrencyModel {
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

export interface AcademyFeesReceivablesResponseModel {
  items: AcademyFeeReceivableItemModel[];
  summaries: AcademyFeesSummaryByCurrencyModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  asOfUtc: string;
  blockedCapabilities?: string[];
}
