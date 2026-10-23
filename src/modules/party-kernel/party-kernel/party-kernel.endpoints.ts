/**
 * PartyKernel Module API Endpoints Barrel & Aggregator
 *
 * Each submodule defines its own co-located *.endpoints.ts file in src/data/services/.
 * This file aggregates them for module-level reference and backward compatibility.
 */
import { PARTY_ENDPOINTS } from "./party/src/data/services/party.endpoints";
import { PARTY_PERSON_ENDPOINTS } from "./party-person/src/data/services/party-person.endpoints";
import { PARTY_ORGANIZATION_ENDPOINTS } from "./party-organization/src/data/services/party-organization.endpoints";
import { PARTY_ROLE_ENDPOINTS } from "./party-role/src/data/services/party-role.endpoints";
import { PARTY_RELATIONSHIP_ENDPOINTS } from "./party-relationship/src/data/services/party-relationship.endpoints";
import { CONTACT_POINT_ENDPOINTS } from "./contact-point/src/data/services/contact-point.endpoints";
import { MERGE_CANDIDATE_ENDPOINTS } from "./merge-candidate/src/data/services/merge-candidate.endpoints";

export const PARTYKERNEL_ENDPOINTS = {
  PARTIES: PARTY_ENDPOINTS,
  PARTY_PEOPLE: PARTY_PERSON_ENDPOINTS,
  PARTY_ORGANIZATIONS: PARTY_ORGANIZATION_ENDPOINTS,
  PARTY_ROLES: PARTY_ROLE_ENDPOINTS,
  PARTY_RELATIONSHIPS: PARTY_RELATIONSHIP_ENDPOINTS,
  CONTACT_POINTS: CONTACT_POINT_ENDPOINTS,
  MERGE_CANDIDATES: MERGE_CANDIDATE_ENDPOINTS,
} as const;

export {
  PARTY_ENDPOINTS,
  PARTY_PERSON_ENDPOINTS,
  PARTY_ORGANIZATION_ENDPOINTS,
  PARTY_ROLE_ENDPOINTS,
  PARTY_RELATIONSHIP_ENDPOINTS,
  CONTACT_POINT_ENDPOINTS,
  MERGE_CANDIDATE_ENDPOINTS,
};
