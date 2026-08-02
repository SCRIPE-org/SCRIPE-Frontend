import { V1 } from "@/core/config/api-endpoints/_shared";

export const BILLING_ENDPOINTS = {
  INVOICES: {
    LIST: `${V1}/invoices`,
    BY_ID: (id: string) => `${V1}/invoices/${id}`,
    TRANSACTIONS: `${V1}/invoices/transactions`,
    PDF: (id: string) => `${V1}/invoices/${id}/pdf`,
    SEND_EMAIL: (id: string) => `${V1}/invoices/${id}/send-email`,
  },
  CHECKOUT: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/checkout`,
  PORTAL: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/portal`,
  CANCEL_GATEWAY: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/cancel-gateway`,
  PAYMENT_LINK: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/payment-link`,
  DASHBOARD: `${V1}/billing/dashboard`,
  GATEWAYS: {
    BASE: `${V1}/payment-gateways`,
    STATUS: (gateway: string) => `${V1}/payment-gateways/${gateway}`,
    TEST_CONNECTION: (gateway: string) => `${V1}/payment-gateways/${gateway}/test-connection`,
    TOGGLE: (gateway: string) => `${V1}/payment-gateways/${gateway}/toggle`,
  },
} as const;
