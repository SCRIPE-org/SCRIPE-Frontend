import { V1 } from "@/core/config/api-endpoints/_shared";

export const STAFF_MEMBER_ENDPOINTS = {
  LIST: `${V1}/hrms/staff-members`,
  BY_ID: (id: string) => `${V1}/hrms/staff-members/${id}`,
  CREATE: `${V1}/hrms/staff-members`,
  UPDATE: (id: string) => `${V1}/hrms/staff-members/${id}`,
  DELETE: (id: string) => `${V1}/hrms/staff-members/${id}`,
} as const;
