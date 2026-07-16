import { V1 } from "./_shared";

export const ORGANIZATIONCORE_ENDPOINTS = {
  LEGAL_ENTITIES: {
    LIST: `${V1}/LegalEntities`,
    BY_ID: (id: string) => `${V1}/LegalEntities/${id}`,
    CREATE: `${V1}/LegalEntities`,
    UPDATE: (id: string) => `${V1}/LegalEntities/${id}`,
    DELETE: (id: string) => `${V1}/LegalEntities/${id}`,
  },
  BUSINESS_UNITS: {
    LIST: `${V1}/BusinessUnits`,
    BY_ID: (id: string) => `${V1}/BusinessUnits/${id}`,
    CREATE: `${V1}/BusinessUnits`,
    UPDATE: (id: string) => `${V1}/BusinessUnits/${id}`,
    DELETE: (id: string) => `${V1}/BusinessUnits/${id}`,
  },
  BRANCHES: {
    LIST: `${V1}/Branches`,
    BY_ID: (id: string) => `${V1}/Branches/${id}`,
    CREATE: `${V1}/Branches`,
    UPDATE: (id: string) => `${V1}/Branches/${id}`,
    DELETE: (id: string) => `${V1}/Branches/${id}`,
  },
  SITES: {
    LIST: `${V1}/Sites`,
    BY_ID: (id: string) => `${V1}/Sites/${id}`,
    CREATE: `${V1}/Sites`,
    UPDATE: (id: string) => `${V1}/Sites/${id}`,
    DELETE: (id: string) => `${V1}/Sites/${id}`,
  },
  DEPARTMENTS: {
    LIST: `${V1}/Departments`,
    BY_ID: (id: string) => `${V1}/Departments/${id}`,
    CREATE: `${V1}/Departments`,
    UPDATE: (id: string) => `${V1}/Departments/${id}`,
    DELETE: (id: string) => `${V1}/Departments/${id}`,
  },
  TEAMS: {
    LIST: `${V1}/Teams`,
    BY_ID: (id: string) => `${V1}/Teams/${id}`,
    CREATE: `${V1}/Teams`,
    UPDATE: (id: string) => `${V1}/Teams/${id}`,
    DELETE: (id: string) => `${V1}/Teams/${id}`,
  },
};
