import { V1 } from "@/core/config/api-endpoints/_shared";

export const STAFF_ASSIGNMENT_ENDPOINTS = {
  LIST: `${V1}/staff-assignments`,
  BY_ID: (id: string) => `${V1}/staff-assignments/${id}`,
  CREATE: `${V1}/staff-assignments`,
  UPDATE: (id: string) => `${V1}/staff-assignments/${id}`,
  DELETE: (id: string) => `${V1}/staff-assignments/${id}`,
} as const;
