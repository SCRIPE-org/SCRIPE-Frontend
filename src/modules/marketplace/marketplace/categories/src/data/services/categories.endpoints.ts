import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const CATEGORIES_ENDPOINTS = {
  CATEGORIES: `${V1}/marketplace/categories`,
  CATEGORY_BY_ID: (id: string) => `${V1}/marketplace/categories/${id}`,
} as const;
