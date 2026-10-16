import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const IDENTITY_PROVIDERS_ENDPOINTS = {
  LIST: `${V1}/identity-providers`,
  BY_ID: (id: string) => `${V1}/identity-providers/${id}`,
  CREATE: `${V1}/identity-providers`,
  UPDATE: (id: string) => `${V1}/identity-providers/${id}`,
  DELETE: (id: string) => `${V1}/identity-providers/${id}`,
  TEST: (id: string) => `${V1}/identity-providers/${id}/test-connection`,
} as const;
