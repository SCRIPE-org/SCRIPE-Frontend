import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const APP_LISTINGS_ENDPOINTS = {
  CATALOG: `${V1}/marketplace/catalog`,
  CATALOG_FEATURED: `${V1}/marketplace/catalog/featured`,
  CATALOG_BY_ID: (id: string) => `${V1}/marketplace/catalog/${id}`,
  CATALOG_PUBLISH: (id: string) => `${V1}/marketplace/catalog/${id}/publish`,
  CATALOG_UNPUBLISH: (id: string) => `${V1}/marketplace/catalog/${id}/unpublish`,
  CATALOG_FEATURE: (id: string) => `${V1}/marketplace/catalog/${id}/feature`,
  CATALOG_PRICING: (id: string) => `${V1}/marketplace/catalog/${id}/pricing`,
} as const;
