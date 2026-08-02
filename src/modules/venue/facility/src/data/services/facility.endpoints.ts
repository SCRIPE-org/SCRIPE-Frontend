import { V1 } from "@/core/config/api-endpoints/_shared";

export const FACILITY_ENDPOINTS = {
  LIST: `${V1}/facilities`,
  BY_ID: (id: string) => `${V1}/facilities/${id}`,
  CREATE: `${V1}/facilities`,
  UPDATE: (id: string) => `${V1}/facilities/${id}`,
  DELETE: (id: string) => `${V1}/facilities/${id}`,
} as const;
