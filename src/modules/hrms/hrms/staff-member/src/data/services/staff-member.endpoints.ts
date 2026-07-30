import { V1 } from "@/core/config/api-endpoints/_shared";

export const STAFF_MEMBER_ENDPOINTS = {
  LIST: `${V1}/staff-members`,
  BY_ID: (id: string) => `${V1}/staff-members/${id}`,
  CREATE: `${V1}/staff-members`,
  UPDATE: (id: string) => `${V1}/staff-members/${id}`,
  DELETE: (id: string) => `${V1}/staff-members/${id}`,
} as const;
