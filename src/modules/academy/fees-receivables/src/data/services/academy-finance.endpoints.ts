import type { FeesReceivablesFilters } from "../../domain/entities/AcademyReceivable";

export const ACADEMY_FINANCE_ENDPOINTS = {
  FEES_RECEIVABLES: (filters?: FeesReceivablesFilters) => {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append("branchId", filters.branchId);
    if (filters?.programId) params.append("programId", filters.programId);
    if (filters?.offeringId) params.append("offeringId", filters.offeringId);
    if (filters?.payerPartyId) params.append("payerPartyId", filters.payerPartyId);
    if (filters?.billingStatus) params.append("billingStatus", filters.billingStatus);
    if (filters?.overdueOnly !== undefined) params.append("overdueOnly", String(filters.overdueOnly));
    if (filters?.currencyCode) params.append("currencyCode", filters.currencyCode);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));

    const qs = params.toString();
    return qs ? `/api/v1/academy/finance/fees-receivables?${qs}` : "/api/v1/academy/finance/fees-receivables";
  },

  EXPORT_CSV: (filters?: FeesReceivablesFilters) => {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append("branchId", filters.branchId);
    if (filters?.programId) params.append("programId", filters.programId);
    if (filters?.offeringId) params.append("offeringId", filters.offeringId);
    if (filters?.payerPartyId) params.append("payerPartyId", filters.payerPartyId);
    if (filters?.billingStatus) params.append("billingStatus", filters.billingStatus);
    if (filters?.overdueOnly !== undefined) params.append("overdueOnly", String(filters.overdueOnly));
    if (filters?.currencyCode) params.append("currencyCode", filters.currencyCode);

    const qs = params.toString();
    return qs ? `/api/v1/academy/finance/fees-receivables/export?${qs}` : "/api/v1/academy/finance/fees-receivables/export";
  }
};
