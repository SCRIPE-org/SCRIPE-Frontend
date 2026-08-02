import { V1 } from "@/core/config/api-endpoints/_shared";

export const PARTYKERNEL_ENDPOINTS = {
  PARTIES: {
    LIST: `${V1}/Parties`,
    BY_ID: (id: string) => `${V1}/Parties/${id}`,
    CREATE: `${V1}/Parties`,
    UPDATE: (id: string) => `${V1}/Parties/${id}`,
    DELETE: (id: string) => `${V1}/Parties/${id}`,
  },
  PARTY_PEOPLE: {
    LIST: `${V1}/party-people`,
    BY_ID: (id: string) => `${V1}/party-people/${id}`,
    CREATE: `${V1}/party-people`,
    UPDATE: (id: string) => `${V1}/party-people/${id}`,
    DELETE: (id: string) => `${V1}/party-people/${id}`,
  },
  PARTY_ORGANIZATIONS: {
    LIST: `${V1}/party-organizations`,
    BY_ID: (id: string) => `${V1}/party-organizations/${id}`,
    CREATE: `${V1}/party-organizations`,
    UPDATE: (id: string) => `${V1}/party-organizations/${id}`,
    DELETE: (id: string) => `${V1}/party-organizations/${id}`,
  },
  PARTY_ROLES: {
    LIST: `${V1}/party-roles`,
    BY_ID: (id: string) => `${V1}/party-roles/${id}`,
    CREATE: `${V1}/party-roles`,
    UPDATE: (id: string) => `${V1}/party-roles/${id}`,
    DELETE: (id: string) => `${V1}/party-roles/${id}`,
  },
  PARTY_RELATIONSHIPS: {
    LIST: `${V1}/party-relationships`,
    BY_ID: (id: string) => `${V1}/party-relationships/${id}`,
    CREATE: `${V1}/party-relationships`,
    UPDATE: (id: string) => `${V1}/party-relationships/${id}`,
    DELETE: (id: string) => `${V1}/party-relationships/${id}`,
  },
  CONTACT_POINTS: {
    LIST: `${V1}/contact-points`,
    BY_ID: (id: string) => `${V1}/contact-points/${id}`,
    CREATE: `${V1}/contact-points`,
    UPDATE: (id: string) => `${V1}/contact-points/${id}`,
    DELETE: (id: string) => `${V1}/contact-points/${id}`,
  },
  MERGE_CANDIDATES: {
    LIST: `${V1}/merge-candidates`,
    BY_ID: (id: string) => `${V1}/merge-candidates/${id}`,
    CREATE: `${V1}/merge-candidates`,
    UPDATE: (id: string) => `${V1}/merge-candidates/${id}`,
    DELETE: (id: string) => `${V1}/merge-candidates/${id}`,
  },
} as const;
