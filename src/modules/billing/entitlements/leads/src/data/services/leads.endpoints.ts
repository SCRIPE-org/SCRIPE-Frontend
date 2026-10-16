import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const LEADS_ENDPOINTS = {
  LIST: `${V1}/leads`,
  CREATE: `${V1}/leads`,
  BY_ID: (id: string) => `${V1}/leads/${id}`,
  UPDATE_STATUS: (id: string) => `${V1}/leads/${id}/status`,
  ASSIGN: (id: string) => `${V1}/leads/${id}/assign`,
  CONVERT_TO_TENANT: (id: string) => `${V1}/leads/${id}/convert-to-tenant`,
  ACTIVITY: (id: string) => `${V1}/leads/${id}/activity`,
  DELETE: (id: string) => `${V1}/leads/${id}`,
  CLOSE: (id: string) => `${V1}/leads/${id}/close`,
  BULK_STATUS: `${V1}/leads/bulk-status`,
  ADD_NOTE: (id: string) => `${V1}/leads/${id}/notes`,
  STATUS_EMAIL_PREVIEW: (id: string) => `${V1}/leads/${id}/status-email-preview`,
  COMMUNICATIONS: (id: string) => `${V1}/leads/${id}/communications`,
  // Conversion wizard helpers
  EDITIONS_FOR_CONVERSION: `${V1}/leads/conversion/editions`,
  EDITION_FEATURES: (editionId: string) => `${V1}/leads/conversion/editions/${editionId}/features`,
  ADMINS_LIST: `${V1}/Admins`,
} as const;
