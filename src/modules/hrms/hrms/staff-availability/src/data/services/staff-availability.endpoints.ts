import { V1 } from "@/core/config/api-endpoints/_shared";

export const STAFF_AVAILABILITY_ENDPOINTS = {
  LIST: `${V1}/hrms/staff-availabilities`,
  BY_ID: (id: string) => `${V1}/hrms/staff-availabilities/${id}`,
  CREATE: `${V1}/hrms/staff-availabilities`,
  UPDATE: (id: string) => `${V1}/hrms/staff-availabilities/${id}`,
  DELETE: (id: string) => `${V1}/hrms/staff-availabilities/${id}`,
} as const;
