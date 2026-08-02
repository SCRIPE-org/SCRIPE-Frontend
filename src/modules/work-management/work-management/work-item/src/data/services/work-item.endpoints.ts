import { V1 } from "@/core/config/api-endpoints/_shared";

export const WORK_ITEM_ENDPOINTS = {
  LIST: `${V1}/work-items`,
  BY_ID: (id: string) => `${V1}/work-items/${id}`,
  CREATE: `${V1}/work-items`,
  UPDATE: (id: string) => `${V1}/work-items/${id}`,
  DELETE: (id: string) => `${V1}/work-items/${id}`,
} as const;
