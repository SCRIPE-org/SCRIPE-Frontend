import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const STRIPE_CONNECT_ENDPOINTS = {
  ACCOUNTS: {
    LIST: `${V1}/stripe-connect/accounts`,
    ELIGIBLE_TENANTS: `${V1}/stripe-connect/accounts/eligible-tenants`,
    BY_ID: (tenantId: string) => `${V1}/stripe-connect/accounts/${tenantId}`,
    CREATE: `${V1}/stripe-connect/accounts`,
    REFRESH_LINK: (tenantId: string) => `${V1}/stripe-connect/accounts/${tenantId}/refresh-link`,
    DASHBOARD_LINK: (tenantId: string) =>
      `${V1}/stripe-connect/accounts/${tenantId}/dashboard-link`,
    COMMISSION_RATE: (tenantId: string) =>
      `${V1}/stripe-connect/accounts/${tenantId}/commission-rate`,
  },
  COMMISSIONS: {
    LIST: `${V1}/commissions`,
    BY_TENANT: (tenantId: string) => `${V1}/commissions/tenants/${tenantId}`,
    DASHBOARD: `${V1}/commissions/dashboard`,
    TRENDS: `${V1}/commissions/trends`,
    TOP_TENANTS: `${V1}/commissions/top-tenants`,
  },
  TENANT_STRIPE_CONNECT: {
    STATUS: `${V1}/tenant-stripe-connect/status`,
    ONBOARD: `${V1}/tenant-stripe-connect/onboard`,
    REFRESH_LINK: `${V1}/tenant-stripe-connect/refresh-link`,
    DASHBOARD_LINK: `${V1}/tenant-stripe-connect/dashboard`,
    TRANSACTIONS: `${V1}/tenant-stripe-connect/transactions`,
    SYNC: `${V1}/tenant-stripe-connect/sync`,
  },
  COMMISSION_LEDGER: {
    LIST: `${V1}/commission-ledger`,
  },
  COMMISSION_INVOICES: {
    LIST: `${V1}/commission-invoices`,
    RETRY_CHARGE: (id: string) => `${V1}/commission-invoices/${id}/retry-charge`,
    WAIVE: (id: string) => `${V1}/commission-invoices/${id}/waive`,
  },
} as const;
