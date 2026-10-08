import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const INVENTORY_ENDPOINTS = {
  DATA_INVENTORY: `${V1}/compliance/data-inventory`,
  DATA_INVENTORY_BY_ID: (id: string) => `${V1}/compliance/data-inventory/${id}`,
} as const;
