import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * PartyPerson Submodule API Endpoints
 * Co-located with PartyPersonService according to SCRIPE frontend architecture rules.
 */
export const PARTY_PERSON_ENDPOINTS = {
  LIST: `${V1}/party-people`,
  BY_ID: (id: string) => `${V1}/party-people/${id}`,
  CREATE: `${V1}/party-people`,
  UPDATE: (id: string) => `${V1}/party-people/${id}`,
  DELETE: (id: string) => `${V1}/party-people/${id}`,
} as const;
