import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const TENANT_PLANS_ENDPOINTS = {
  TENANT_PLANS: {
    LIST: `${V1}/tenant-plans`,
    BY_ID: (id: string) => `${V1}/tenant-plans/${id}`,
    CREATE: `${V1}/tenant-plans`,
    UPDATE: (id: string) => `${V1}/tenant-plans/${id}`,
    DELETE: (id: string) => `${V1}/tenant-plans/${id}`,
    PUBLISH: (id: string) => `${V1}/tenant-plans/${id}/publish`,
    ARCHIVE: (id: string) => `${V1}/tenant-plans/${id}/archive`,
  },
  TENANT_FEATURE_DEFINITIONS: {
    LIST: `${V1}/tenant-feature-definitions`,
    ACTIVE: `${V1}/tenant-feature-definitions/active`,
    ACTIVE_GROUPED: `${V1}/tenant-feature-definitions/active/grouped`,
    BY_ID: (id: string) => `${V1}/tenant-feature-definitions/${id}`,
    CREATE: `${V1}/tenant-feature-definitions`,
    UPDATE: (id: string) => `${V1}/tenant-feature-definitions/${id}`,
    DELETE: (id: string) => `${V1}/tenant-feature-definitions/${id}`,
  },
  TENANT_PLAN_PROMOTIONS: {
    LIST: `${V1}/tenant-plan-promotions`,
    CREATE: `${V1}/tenant-plan-promotions`,
    UPDATE: (id: string) => `${V1}/tenant-plan-promotions/${id}`,
    DELETE: (id: string) => `${V1}/tenant-plan-promotions/${id}`,
    VALIDATE: `${V1}/tenant-plan-promotions/validate`,
  },
} as const;
