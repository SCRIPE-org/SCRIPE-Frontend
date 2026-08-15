import { V1 } from "@/core/config/api-endpoints/_shared";

export const SUBSCRIPTION_ENDPOINTS = {
  LIST_ALL: `${V1}/subscriptions`,
  ASSIGN: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
  CHANGE: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
  RENEW: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/renew`,
  CONVERT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/convert`,
  SUSPEND: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/suspend`,
  RESUME: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resume`,
  CANCEL: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/cancel`,
  RESYNC: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resync`,
  LIST_BY_TENANT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscriptions`,
  GET_BY_ID: (id: string) => `${V1}/subscriptions/${id}`,
  REVOKE: (id: string) => `${V1}/subscriptions/${id}`,
  CHANGE_CURRENCY: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/change-currency`,
  DOWNGRADE_IMPACT: (tenantId: string, targetEditionId: string) =>
    `${V1}/tenants/${tenantId}/subscription/downgrade-impact?targetEditionId=${targetEditionId}`,
  EXPORT: (
    format: string,
    status?: string,
    type?: string,
    currency?: string,
    dateFrom?: string,
    dateTo?: string,
    expiringInDays?: number,
    edition?: string
  ) => {
    const params = new URLSearchParams({ format });
    if (status && status !== "all") params.set("status", status);
    if (type && type !== "all") params.set("type", type);
    if (currency) params.set("currency", currency);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (expiringInDays && expiringInDays > 0)
      params.set("expiringInDays", expiringInDays.toString());
    if (edition && edition !== "all") params.set("edition", edition);
    return `${V1}/subscriptions/export?${params.toString()}`;
  },
  RECEIPT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/receipt`,
  GET_MY_SUBSCRIPTION: `${V1}/subscriptions/my-tenant`,
} as const;
