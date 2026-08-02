import { V1 } from "@/core/config/api-endpoints/_shared";

export const EMPLOYMENT_RECORD_ENDPOINTS = {
  LIST: `${V1}/employment-records`,
  BY_ID: (id: string) => `${V1}/employment-records/${id}`,
  CREATE: `${V1}/employment-records`,
  UPDATE: (id: string) => `${V1}/employment-records/${id}`,
  DELETE: (id: string) => `${V1}/employment-records/${id}`,
} as const;
