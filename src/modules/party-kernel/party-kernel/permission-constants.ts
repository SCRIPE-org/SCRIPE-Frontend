/**
 * PartyKernel Module Permissions
 *
 * Covers: Party, PartyPerson, PartyOrganization, PartyRole,
 * PartyRelationship, ContactPoint, MergeCandidate.
 *
 * Keys MUST match the backend PartyKernelPermissionProvider resource keys
 * ({resource}.{action}, kebab-case plural) exactly for permission parity.
 * The backend emits only these 7 resources x CRUD — there is no module-level
 * "partyKernel.view", so the module landing route reuses parties.view.
 */
export const PARTY_KERNEL_PERMISSIONS = {
  // ── Parties ─────────────────────────────────────────────
  PARTY_VIEW: "parties.view",
  PARTY_CREATE: "parties.create",
  PARTY_UPDATE: "parties.update",
  PARTY_DELETE: "parties.delete",
  PARTY_AUDIT: "parties.audit",
  PARTY_IMPORT: "parties.import",
  PARTY_EXPORT: "parties.export",

  // ── Party People ────────────────────────────────────────
  PARTY_PERSON_VIEW: "party-people.view",
  PARTY_PERSON_CREATE: "party-people.create",
  PARTY_PERSON_UPDATE: "party-people.update",
  PARTY_PERSON_DELETE: "party-people.delete",
  PARTY_PERSON_IMPORT: "party-people.import",
  PARTY_PERSON_EXPORT: "party-people.export",

  // ── Party Organizations ─────────────────────────────────
  PARTY_ORGANIZATION_VIEW: "party-organizations.view",
  PARTY_ORGANIZATION_CREATE: "party-organizations.create",
  PARTY_ORGANIZATION_UPDATE: "party-organizations.update",
  PARTY_ORGANIZATION_DELETE: "party-organizations.delete",
  PARTY_ORGANIZATION_IMPORT: "party-organizations.import",
  PARTY_ORGANIZATION_EXPORT: "party-organizations.export",

  // ── Party Roles ─────────────────────────────────────────
  PARTY_ROLE_VIEW: "party-roles.view",
  PARTY_ROLE_CREATE: "party-roles.create",
  PARTY_ROLE_UPDATE: "party-roles.update",
  PARTY_ROLE_DELETE: "party-roles.delete",

  // ── Party Relationships ─────────────────────────────────
  PARTY_RELATIONSHIP_VIEW: "party-relationships.view",
  PARTY_RELATIONSHIP_CREATE: "party-relationships.create",
  PARTY_RELATIONSHIP_UPDATE: "party-relationships.update",
  PARTY_RELATIONSHIP_DELETE: "party-relationships.delete",

  // ── Contact Points ──────────────────────────────────────
  CONTACT_POINT_VIEW: "contact-points.view",
  CONTACT_POINT_CREATE: "contact-points.create",
  CONTACT_POINT_UPDATE: "contact-points.update",
  CONTACT_POINT_DELETE: "contact-points.delete",
  CONTACT_POINT_IMPORT: "contact-points.import",
  CONTACT_POINT_EXPORT: "contact-points.export",

  // ── Merge Candidates ────────────────────────────────────
  MERGE_CANDIDATE_VIEW: "merge-candidates.view",
  MERGE_CANDIDATE_CREATE: "merge-candidates.create",
  MERGE_CANDIDATE_UPDATE: "merge-candidates.update",
  MERGE_CANDIDATE_DELETE: "merge-candidates.delete",
} as const;
