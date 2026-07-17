import { V1 } from "@/core/config/api-endpoints/_shared";

export const WORK_ITEM_ENDPOINTS = {
  LIST: `${V1}/WorkItems`,
  BY_ID: (id: string) => `${V1}/WorkItems/${id}`,
  CREATE: `${V1}/WorkItems`,
  UPDATE: (id: string) => `${V1}/WorkItems/${id}`,
  DELETE: (id: string) => `${V1}/WorkItems/${id}`,
} as const;
