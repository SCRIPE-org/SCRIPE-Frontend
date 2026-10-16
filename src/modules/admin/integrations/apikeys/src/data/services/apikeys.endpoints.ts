import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const API_KEYS_ENDPOINTS = {
  LIST: `${V1}/integrations/apikeys`,
  CREATE: `${V1}/integrations/apikeys`,
  REVOKE: (id: string) => `${V1}/integrations/apikeys/${id}`,
  GET_BY_ID: (id: string) => `${V1}/integrations/apikeys/${id}`,
  UPDATE: (id: string) => `${V1}/integrations/apikeys/${id}`,
  ROTATE: (id: string) => `${V1}/integrations/apikeys/${id}/rotate`,
  STATS: (id: string) => `${V1}/integrations/apikeys/${id}/stats`,
  CHART_DATA: (id: string) => `${V1}/integrations/apikeys/${id}/chart-data`,
  ACTIVITY: (id: string) => `${V1}/integrations/apikeys/${id}/activity`,
  DELETE_PERMANENT: (id: string) => `${V1}/integrations/apikeys/${id}/permanent`,
} as const;
