import { V1 } from "@/core/config/api-endpoints/_shared";

export const SITE_ENDPOINTS = {
  LIST: `${V1}/sites`,
  BY_ID: (id: string) => `${V1}/sites/${id}`,
  CREATE: `${V1}/sites`,
  UPDATE: (id: string) => `${V1}/sites/${id}`,
  DELETE: (id: string) => `${V1}/sites/${id}`,
} as const;
