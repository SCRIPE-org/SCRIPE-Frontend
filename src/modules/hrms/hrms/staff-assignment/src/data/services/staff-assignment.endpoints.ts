import { V1 } from "@/core/config/api-endpoints/_shared";

export const STAFF_ASSIGNMENT_ENDPOINTS = {
  LIST: `${V1}/hrms/staff-assignments`,
  BY_ID: (id: string) => `${V1}/hrms/staff-assignments/${id}`,
  CREATE: `${V1}/hrms/staff-assignments`,
  UPDATE: (id: string) => `${V1}/hrms/staff-assignments/${id}`,
  DELETE: (id: string) => `${V1}/hrms/staff-assignments/${id}`,
} as const;
