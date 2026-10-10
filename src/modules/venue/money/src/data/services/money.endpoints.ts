import { V1 } from "@/core/config/api-endpoints/_shared";

export const MONEY_ENDPOINTS = {
  INVOICES: `${V1}/finance/customer-invoices`,
  PAYMENTS: `${V1}/finance/recorded-payments`,
  ALLOCATIONS: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/allocations`,
  RECEIPTS: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/receipts`,
  REFUNDS: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/refunds`,
  TIMELINE: (paymentId: string) => `${V1}/finance/recorded-payments/${paymentId}/timeline`,
  ANALYTICS_SUMMARY: `${V1}/finance/analytics/summary`,
  ANALYTICS_TREND: `${V1}/finance/analytics/trend`,
  ANALYTICS_BY_RESOURCE: `${V1}/finance/analytics/by-resource`,
  ANALYTICS_BY_TIME: `${V1}/finance/analytics/by-time`,
  ANALYTICS_PAYMENT_METHODS: `${V1}/finance/analytics/payment-methods`,
};

