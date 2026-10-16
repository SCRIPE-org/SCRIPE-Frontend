import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const RECOMMENDATION_RULES_ENDPOINTS = {
  LIST: `${V1}/onboarding/rules`,
  BY_ID: (id: string) => `${V1}/onboarding/rules/${id}`,
  CREATE: `${V1}/onboarding/rules`,
  UPDATE: (id: string) => `${V1}/onboarding/rules/${id}`,
  DELETE: (id: string) => `${V1}/onboarding/rules/${id}`,
} as const;
