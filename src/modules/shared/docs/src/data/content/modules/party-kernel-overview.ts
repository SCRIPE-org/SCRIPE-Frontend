import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.apiTitle",
    id: "typed-party-api",
  },
  {
    type: "code",
    language: "http",
    filename: "PartyKernel C1 API contract",
    code: `# Create a Person and its Party identity in one request.
# Requires parties.create and party-people.create.
POST /api/v1/Parties/people
Authorization: Bearer <access-token>
Idempotency-Key: <stable-request-key>
Content-Type: application/json

{
  "fullName": "ندى",
  "displayName": "ندى",
  "givenName": null,
  "middleNames": null,
  "familyName": null
}

# Create an Organization and its Party identity in one request.
# Requires parties.create and party-organizations.create.
POST /api/v1/Parties/organizations
Authorization: Bearer <access-token>
Idempotency-Key: <stable-request-key>
Content-Type: application/json

{
  "legalName": "Northwind Sporting Ltd.",
  "displayName": "Northwind"
}

# Read a safe typed profile or tenant-scoped selector results.
# Profile requires parties.view plus the matching subtype .view permission.
GET /api/v1/Parties/{encryptedPartyId}/profile
GET /api/v1/Parties/people/lookup?page=1&pageSize=20&search=...
GET /api/v1/Parties/organizations/lookup?page=1&pageSize=20&search=...`,
  },
];

registerPage({
  slug: "modules/party-kernel-overview",
  titleKey: "modules.partyKernel.overview.title",
  descriptionKey: "modules.partyKernel.overview.description",
  category: "modules",
  order: 2.9,
  sections,
  relatedSlugs: ["modules/hrms-overview", "modules/organization-core-overview", "modules/custom-fields"],
  lastUpdated: "2026-10-14",
});
