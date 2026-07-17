import { V1 } from "@/core/config/api-endpoints/_shared";

export const STAFF_COMPETENCY_ENDPOINTS = {
  LIST: `${V1}/hrms/staff-competencies`,
  BY_ID: (id: string) => `${V1}/hrms/staff-competencies/${id}`,
  CREATE: `${V1}/hrms/staff-competencies`,
  UPDATE: (id: string) => `${V1}/hrms/staff-competencies/${id}`,
  DELETE: (id: string) => `${V1}/hrms/staff-competencies/${id}`,
} as const;
