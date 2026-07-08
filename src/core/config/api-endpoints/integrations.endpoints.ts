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
  },
};
