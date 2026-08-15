import { V1 } from "@/core/config/api-endpoints/_shared";

export const FEATURES_ENDPOINTS = {
  LIST: `${V1}/features`,
  EFFECTIVE: `${V1}/features/effective`,
  BY_ID: (id: string) => `${V1}/features/${id}`,
  CREATE: `${V1}/features`,
  UPDATE: (id: string) => `${V1}/features/${id}`,
  DELETE: (id: string) => `${V1}/features/${id}`,
  GROUPED: `${V1}/features/grouped`,
  TENANT_RESOLVED: (tenantId: string) => `${V1}/tenants/${tenantId}/features/resolved`,
} as const;
