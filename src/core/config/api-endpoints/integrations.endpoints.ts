import { V1 } from "./_shared";

export const INTEGRATIONS_ENDPOINTS = {
  INTEGRATIONS: {
    LIST: `${V1}/integrations`,
    BY_ID: (id: string) => `${V1}/integrations/${id}`,
    CREATE: `${V1}/integrations`,
    UPDATE: (id: string) => `${V1}/integrations/${id}`,
    DELETE: (id: string) => `${V1}/integrations/${id}`,
  },
  API_KEYS: {
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
  },
};
