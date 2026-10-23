import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.polymorphic.modelTitle",
    id: "party-identity-contract",
  },
  {
    type: "code",
    language: "csharp",
    filename: "PartyKernel.Domain/Entities",
    code: `// Party.Type is assigned at creation and is immutable through ordinary updates.
public class Party : AuditableEntity<Guid>, ITenantAwareEntity
{
    public Guid? TenantId { get; init; }
    public PartyType Type { get; init; }
    public string DisplayName { get; set; }
}

// Person names preserve the entered full name. Structured parts are optional;
// legacy FirstName/LastName fields are retained without manufacturing a split.
public class PartyPerson : AggregateRoot<Guid>, ITenantAwareEntity
{
    public Guid PartyId { get; init; }
    public string? FullName { get; set; }
    public string? GivenName { get; set; }
    public string? MiddleNames { get; set; }
    public string? FamilyName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class PartyOrganization : AuditableEntity<Guid>, ITenantAwareEntity
{
    public Guid PartyId { get; init; }
    public string LegalName { get; set; }
    public string? TaxId { get; set; }
}`,
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.polymorphic.apiTitle",
    id: "safe-party-reads",
  },
  {
    type: "code",
    language: "http",
    filename: "Tenant-scoped profile and lookup routes",
    code: `# Profile uses the encrypted Party ID and a safe typed projection.
GET /api/v1/Parties/{encryptedPartyId}/profile
# Requires parties.view and party-people.view or party-organizations.view.

# Selector results expose encrypted Party IDs and safe summary fields only.
GET /api/v1/Parties/people/lookup?page=1&pageSize=20&search=...
GET /api/v1/Parties/organizations/lookup?page=1&pageSize=20&search=...
# Requires parties.view and the matching party-people.view / party-organizations.view.
# The server derives tenant scope from the authenticated caller; request tenant IDs are ignored.`,
  },
];

registerPage({
  slug: "modules/party-kernel/polymorphic-model",
  titleKey: "modules.partyKernel.polymorphic.title",
  descriptionKey: "modules.partyKernel.polymorphic.description",
  category: "module-party-kernel",
  order: 2,
  sections,
  relatedSlugs: ["modules/party-kernel-overview", "modules/party-kernel/relationship-graph"],
  lastUpdated: "2026-10-14",
});
