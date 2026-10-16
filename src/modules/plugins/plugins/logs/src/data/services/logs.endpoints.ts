import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const LOGS_ENDPOINTS = {
  LOGS: (installationId: string) => `${V1}/plugins/installed/${installationId}/logs`,
} as const;
