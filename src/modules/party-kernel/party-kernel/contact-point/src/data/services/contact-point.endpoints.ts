import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * ContactPoint Submodule API Endpoints
 * Co-located with ContactPointService according to SCRIPE frontend architecture rules.
 */
export const CONTACT_POINT_ENDPOINTS = {
  LIST: `${V1}/contact-points`,
  BY_ID: (id: string) => `${V1}/contact-points/${id}`,
  CREATE: `${V1}/contact-points`,
  UPDATE: (id: string) => `${V1}/contact-points/${id}`,
  DELETE: (id: string) => `${V1}/contact-points/${id}`,
} as const;
