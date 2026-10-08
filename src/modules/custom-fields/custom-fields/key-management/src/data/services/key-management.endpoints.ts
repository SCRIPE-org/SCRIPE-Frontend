import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const KEY_MANAGEMENT_ENDPOINTS = {
  STATUS: `${V1}/custom-fields/encryption/status`,
  INITIALIZE: `${V1}/custom-fields/encryption/initialize`,
  ROTATE: `${V1}/custom-fields/encryption/rotate`,
  REVOKE: `${V1}/custom-fields/encryption/revoke`,
  START_REWRAP: `${V1}/custom-fields/encryption/rewrap/start`,
  CANCEL_REWRAP: (sessionId: string) => `${V1}/custom-fields/encryption/rewrap/${sessionId}/cancel`,
  SESSION_PROGRESS: (sessionId: string) =>
    `${V1}/custom-fields/encryption/rewrap/${sessionId}/progress`,
  AUDIT_LOGS: (page = 1, pageSize = 20) =>
    `${V1}/custom-fields/encryption/audit-logs?page=${page}&pageSize=${pageSize}`,
} as const;
