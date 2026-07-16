import { V1 } from "./_shared";

export const CUSTOMFIELDS_ENDPOINTS = {
  CUSTOM_FIELDS: {
    LIST: `${V1}/CustomFields`,
    BY_ID: (id: string) => `${V1}/CustomFields/${id}`,
    CREATE: `${V1}/CustomFields`,
    UPDATE: (id: string) => `${V1}/CustomFields/${id}`,
    DELETE: (id: string) => `${V1}/CustomFields/${id}`,
  },
};
