import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const RECYCLE_BIN_ENDPOINTS = {
  LIST: `${V1}/recycle-bin`,
  RESTORE: (entityType: string, id: string) => `${V1}/recycle-bin/${entityType}/${id}/restore`,
  BULK_RESTORE: `${V1}/recycle-bin/bulk-restore`,
} as const;
