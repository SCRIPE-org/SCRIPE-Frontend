import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "code",
    language: "text",
    filename: "Current integration boundary",
    code: `PartyKernel currently provides:
- Atomic typed Person and Organization creation.
- Tenant-scoped, permission-checked profile and selector reads.
- Separate ContactPoint, PartyRole, and PartyRelationship APIs.

CRM is not implemented by this contract. There is no published duplicate-resolution,
merge, customer lifecycle, or cross-module foreign-key API in this handoff.

Use the technical PartyKernel contract:
POST /api/v1/Parties/people
POST /api/v1/Parties/organizations
GET  /api/v1/Parties/{encryptedPartyId}/profile
GET  /api/v1/Parties/people/lookup
GET  /api/v1/Parties/organizations/lookup`,
  },
];

registerPage({
  slug: "commercial/customer-360-party-kernel",
  titleKey: "commercial.customer360.title",
  descriptionKey: "commercial.customer360.description",
  category: "commercial-modules",
  order: 14,
  sections,
  relatedSlugs: ["commercial/workforce-hrms", "commercial/multi-branch-organization", "commercial/custom-fields"],
  lastUpdated: "2026-10-14",
});
