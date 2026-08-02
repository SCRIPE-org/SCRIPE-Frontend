import { V1 } from "@/core/config/api-endpoints/_shared";

export const OVERRIDES_ENDPOINTS = {
  OVERRIDES: (tenantId: string) => `${V1}/tenants/${tenantId}/features/overrides`,
  RESOLVED: (tenantId: string) => `${V1}/tenants/${tenantId}/features/resolved`,
  SET_OVERRIDE: (tenantId: string, featureId: string) =>
    `${V1}/tenants/${tenantId}/features/${featureId}`,
  REMOVE_OVERRIDE: (tenantId: string, featureId: string) =>
    `${V1}/tenants/${tenantId}/features/${featureId}`,
  OVERRIDE_COST_SET: (overrideId: string) => `${V1}/overrides/${overrideId}/cost`,
  OVERRIDE_COST_REMOVE: (overrideId: string) => `${V1}/overrides/${overrideId}/cost`,
} as const;
