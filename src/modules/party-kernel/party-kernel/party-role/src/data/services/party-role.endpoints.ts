import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * PartyRole Submodule API Endpoints
 * Co-located with PartyRoleService according to SCRIPE frontend architecture rules.
 */
export const PARTY_ROLE_ENDPOINTS = {
  LIST: `${V1}/party-roles`,
  BY_ID: (id: string) => `${V1}/party-roles/${id}`,
  CREATE: `${V1}/party-roles`,
  UPDATE: (id: string) => `${V1}/party-roles/${id}`,
  DELETE: (id: string) => `${V1}/party-roles/${id}`,
} as const;
