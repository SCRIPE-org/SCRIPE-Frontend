import { V1 } from "@/core/config/api-endpoints/_shared";

export const STAFF_COMPETENCY_ENDPOINTS = {
  LIST: `${V1}/staff-competencies`,
  BY_ID: (id: string) => `${V1}/staff-competencies/${id}`,
  CREATE: `${V1}/staff-competencies`,
  UPDATE: (id: string) => `${V1}/staff-competencies/${id}`,
  DELETE: (id: string) => `${V1}/staff-competencies/${id}`,
} as const;
