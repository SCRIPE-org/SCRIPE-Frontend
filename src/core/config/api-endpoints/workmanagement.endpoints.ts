import { V1 } from "./_shared";

export const WORKMANAGEMENT_ENDPOINTS = {
  WORK_ITEMS: {
    LIST: `${V1}/WorkItems`,
    BY_ID: (id: string) => `${V1}/WorkItems/${id}`,
    CREATE: `${V1}/WorkItems`,
    UPDATE: (id: string) => `${V1}/WorkItems/${id}`,
    DELETE: (id: string) => `${V1}/WorkItems/${id}`,
  },
};
