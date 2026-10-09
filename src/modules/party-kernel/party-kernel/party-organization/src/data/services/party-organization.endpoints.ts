import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * PartyOrganization Submodule API Endpoints
 * Co-located with PartyOrganizationService according to SCRIPE frontend architecture rules.
 */
export const PARTY_ORGANIZATION_ENDPOINTS = {
  LIST: `${V1}/party-organizations`,
  BY_ID: (id: string) => `${V1}/party-organizations/${id}`,
  CREATE: `${V1}/party-organizations`,
  UPDATE: (id: string) => `${V1}/party-organizations/${id}`,
  DELETE: (id: string) => `${V1}/party-organizations/${id}`,
} as const;
