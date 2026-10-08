import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const CERTIFICATION_ENDPOINTS = {
  LIST: `${V1}/Certifications`,
  BY_ID: (id: string) => `${V1}/Certifications/${id}`,
  CREATE: `${V1}/Certifications`,
  UPDATE: (id: string) => `${V1}/Certifications/${id}`,
  DELETE: (id: string) => `${V1}/Certifications/${id}`,
} as const;
