import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const RETENTION_ENDPOINTS = {
  RETENTION_LIST: `${V1}/compliance/retention`,
  RETENTION_UPDATE: `${V1}/compliance/retention`,
  RETENTION_BY_ID: (id: string) => `${V1}/compliance/retention/${id}`,
} as const;
