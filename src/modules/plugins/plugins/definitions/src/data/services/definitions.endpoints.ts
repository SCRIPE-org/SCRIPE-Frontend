import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const DEFINITIONS_ENDPOINTS = {
  DEFINITIONS: `${V1}/plugins/definitions`,
  BY_ID: (id: string) => `${V1}/plugins/definitions/${id}`,
  CREATE: `${V1}/plugins/definitions`,
  UPDATE: (id: string) => `${V1}/plugins/definitions/${id}`,
  DELETE: (id: string) => `${V1}/plugins/definitions/${id}`,
  PUBLISH: (id: string) => `${V1}/plugins/definitions/${id}/publish`,
  DEPRECATE: (id: string) => `${V1}/plugins/definitions/${id}/deprecate`,
} as const;
