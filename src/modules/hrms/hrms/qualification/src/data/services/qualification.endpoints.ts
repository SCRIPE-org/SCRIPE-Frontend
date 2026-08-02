import { V1 } from "@/core/config/api-endpoints/_shared";

export const QUALIFICATION_ENDPOINTS = {
  LIST: `${V1}/Qualifications`,
  BY_ID: (id: string) => `${V1}/Qualifications/${id}`,
  CREATE: `${V1}/Qualifications`,
  UPDATE: (id: string) => `${V1}/Qualifications/${id}`,
  DELETE: (id: string) => `${V1}/Qualifications/${id}`,
} as const;
