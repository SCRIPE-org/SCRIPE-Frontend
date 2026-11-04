export type EnrollmentStatus =
  | "Draft"
  | "Review"
  | "PendingFinance"
  | "Active"
  | "Paused"
  | "Transferred"
  | "Completed"
  | "Cancelled"
  | "Withdrawn";

export type BillingStatus = "Unbilled" | "Invoiced" | "Paid" | "Overdue" | "Waived";

export interface AcademyEnrollment {
  id: string;
  athleteId: string;
  athleteNameEn?: string | null;
  athleteNameAr?: string | null;
  offeringId: string;
  offeringNameEn?: string | null;
  offeringNameAr?: string | null;
  enrollmentDate: string;
  status: EnrollmentStatus;
  catalogPriceId?: string | null;
  payerPartyId?: string | null;
  trialId?: string | null;
  priceAmount: number;
  priceCurrency: string;
  billingStatus: BillingStatus;
  financeInvoiceReference?: string | null;
  notes?: string | null;
}

export interface CreateEnrollmentPayload {
  athleteId: string;
  offeringId: string;
  catalogPriceId?: string | null;
  trialId?: string | null;
  priceAmount: number;
  priceCurrency?: string;
  notes?: string | null;
}

export interface FinanceHandoffPayload {
  notes?: string | null;
}
