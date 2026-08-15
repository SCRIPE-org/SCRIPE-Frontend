import { V1 } from "@/core/config/api-endpoints/_shared";

export const EDITION_CATEGORY_ENDPOINTS = {
  LIST: `${V1}/edition-categories`,
  BY_ID: (id: string) => `${V1}/edition-categories/${id}`,
  CREATE: `${V1}/edition-categories`,
  UPDATE: (id: string) => `${V1}/edition-categories/${id}`,
  DELETE: (id: string) => `${V1}/edition-categories/${id}`,
} as const;
