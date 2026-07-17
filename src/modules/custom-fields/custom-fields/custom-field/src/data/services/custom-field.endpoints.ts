import { V1 } from "@/core/config/api-endpoints/_shared";

export const CUSTOM_FIELD_ENDPOINTS = {
  LIST: `${V1}/CustomFields`,
  BY_ID: (id: string) => `${V1}/CustomFields/${id}`,
  CREATE: `${V1}/CustomFields`,
  UPDATE: (id: string) => `${V1}/CustomFields/${id}`,
  DELETE: (id: string) => `${V1}/CustomFields/${id}`,
} as const;
