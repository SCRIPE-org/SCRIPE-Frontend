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
    LIST: `${V1}/PartyPeople`,
    BY_ID: (id: string) => `${V1}/PartyPeople/${id}`,
    CREATE: `${V1}/PartyPeople`,
    UPDATE: (id: string) => `${V1}/PartyPeople/${id}`,
    DELETE: (id: string) => `${V1}/PartyPeople/${id}`,
  },
  PARTY_ORGANIZATIONS: {
    LIST: `${V1}/PartyOrganizations`,
    BY_ID: (id: string) => `${V1}/PartyOrganizations/${id}`,
    CREATE: `${V1}/PartyOrganizations`,
    UPDATE: (id: string) => `${V1}/PartyOrganizations/${id}`,
    DELETE: (id: string) => `${V1}/PartyOrganizations/${id}`,
  },
  PARTY_ROLES: {
    LIST: `${V1}/PartyRoles`,
    BY_ID: (id: string) => `${V1}/PartyRoles/${id}`,
    CREATE: `${V1}/PartyRoles`,
    UPDATE: (id: string) => `${V1}/PartyRoles/${id}`,
    DELETE: (id: string) => `${V1}/PartyRoles/${id}`,
  },
  PARTY_RELATIONSHIPS: {
    LIST: `${V1}/PartyRelationships`,
    BY_ID: (id: string) => `${V1}/PartyRelationships/${id}`,
    CREATE: `${V1}/PartyRelationships`,
    UPDATE: (id: string) => `${V1}/PartyRelationships/${id}`,
    DELETE: (id: string) => `${V1}/PartyRelationships/${id}`,
  },
  CONTACT_POINTS: {
    LIST: `${V1}/ContactPoints`,
    BY_ID: (id: string) => `${V1}/ContactPoints/${id}`,
    CREATE: `${V1}/ContactPoints`,
    UPDATE: (id: string) => `${V1}/ContactPoints/${id}`,
    DELETE: (id: string) => `${V1}/ContactPoints/${id}`,
  },
  MERGE_CANDIDATES: {
    LIST: `${V1}/MergeCandidates`,
    BY_ID: (id: string) => `${V1}/MergeCandidates/${id}`,
    CREATE: `${V1}/MergeCandidates`,
    UPDATE: (id: string) => `${V1}/MergeCandidates/${id}`,
    DELETE: (id: string) => `${V1}/MergeCandidates/${id}`,
  },
} as const;
