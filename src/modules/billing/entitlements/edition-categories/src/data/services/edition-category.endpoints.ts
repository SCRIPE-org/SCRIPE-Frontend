import { V1 } from "@/core/config/api-endpoints/_shared";

export const EDITION_CATEGORY_ENDPOINTS = {
  LIST: `${V1}/editioncategories`,
  BY_ID: (id: string) => `${V1}/editioncategories/${id}`,
  CREATE: `${V1}/editioncategories`,
  UPDATE: (id: string) => `${V1}/editioncategories/${id}`,
  DELETE: (id: string) => `${V1}/editioncategories/${id}`,
} as const;
