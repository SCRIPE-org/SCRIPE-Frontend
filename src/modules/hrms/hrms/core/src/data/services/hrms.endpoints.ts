import { V1 } from "@/core/config/api-endpoints/_shared";

export const HRMS_ENDPOINTS = {
  LIST: `${V1}/Hrms`,
  BY_ID: (id: string) => `${V1}/Hrms/${id}`,
  CREATE: `${V1}/Hrms`,
  UPDATE: (id: string) => `${V1}/Hrms/${id}`,
  DELETE: (id: string) => `${V1}/Hrms/${id}`,
} as const;
