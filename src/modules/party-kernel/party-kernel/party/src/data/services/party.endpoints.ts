import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Party Submodule API Endpoints
 * Co-located with PartyService according to SCRIPE frontend architecture rules.
 */
export const PARTY_ENDPOINTS = {
  LIST: `${V1}/Parties`,
  BY_ID: (id: string) => `${V1}/Parties/${id}`,
  PROFILE: (id: string) => `${V1}/Parties/${id}/profile`,
  ORGANIZATIONS: `${V1}/Parties/organizations`,
  PEOPLE: `${V1}/Parties/people`,
  PEOPLE_LOOKUP: `${V1}/Parties/people/lookup`,
  ORGANIZATIONS_LOOKUP: `${V1}/Parties/organizations/lookup`,
  INTEGRITY_AUDIT: `${V1}/Parties/integrity-audit`,
  CREATE: `${V1}/Parties`,
  UPDATE: (id: string) => `${V1}/Parties/${id}`,
  PERSON_UPDATE: (id: string) => `${V1}/Parties/people/${id}`,
  ORGANIZATION_UPDATE: (id: string) => `${V1}/Parties/organizations/${id}`,
  DELETE: (id: string) => `${V1}/Parties/${id}`,
} as const;
