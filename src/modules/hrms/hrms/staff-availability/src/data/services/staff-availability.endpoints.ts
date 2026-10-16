import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const STAFF_AVAILABILITY_ENDPOINTS = {
  LIST: `${V1}/staff-availabilities`,
  BY_ID: (id: string) => `${V1}/staff-availabilities/${id}`,
  CREATE: `${V1}/staff-availabilities`,
  UPDATE: (id: string) => `${V1}/staff-availabilities/${id}`,
  DELETE: (id: string) => `${V1}/staff-availabilities/${id}`,
} as const;
