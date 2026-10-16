import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * PartyRelationship Submodule API Endpoints
 * Co-located with PartyRelationshipService according to SCRIPE frontend architecture rules.
 */
export const PARTY_RELATIONSHIP_ENDPOINTS = {
  LIST: `${V1}/party-relationships`,
  BY_ID: (id: string) => `${V1}/party-relationships/${id}`,
  CREATE: `${V1}/party-relationships`,
  UPDATE: (id: string) => `${V1}/party-relationships/${id}`,
  DELETE: (id: string) => `${V1}/party-relationships/${id}`,
} as const;
