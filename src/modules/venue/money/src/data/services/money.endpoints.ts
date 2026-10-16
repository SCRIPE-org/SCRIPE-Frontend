import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const MONEY_ENDPOINTS = {
  INVOICES: `${V1}/finance/customer-invoices`,
  PAYMENTS: `${V1}/finance/recorded-payments`,
  ALLOCATIONS: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/allocations`,
  RECEIPTS: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/receipts`,
  REFUNDS: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/refunds`,
  TIMELINE: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/timeline`,
};
