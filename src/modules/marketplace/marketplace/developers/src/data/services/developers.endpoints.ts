import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const DEVELOPERS_ENDPOINTS = {
  DEVELOPERS: `${V1}/marketplace/developers`,
  DEVELOPER_BY_ID: (id: string) => `${V1}/marketplace/developers/${id}`,
  DEVELOPER_BY_TENANT: (tenantId: string) => `${V1}/marketplace/developers/by-tenant/${tenantId}`,
  DEVELOPER_VERIFY: (id: string) => `${V1}/marketplace/developers/${id}/verify`,
} as const;
