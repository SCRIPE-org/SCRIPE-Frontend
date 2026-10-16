import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const CATALOG_ENDPOINTS = {
  CATALOG: `${V1}/plugins/catalog`,
  INSTALL: `${V1}/plugins/install`,
} as const;
