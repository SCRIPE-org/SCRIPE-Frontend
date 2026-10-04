import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.partyKernel.polymorphic.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.partyKernel.polymorphic.infoTitle",
    contentKey: "modules.partyKernel.polymorphic.infoContent",
  },

  // ─── Polymorphic Party Abstraction ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.polymorphic.modelTitle",
    id: "polymorphic-party",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.polymorphic.modelDesc" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/PartyKernel/PartyKernel.Domain/Entities/Party.cs",
    code: `public abstract class Party : TenantAggregateRoot
{
    public PartyType Type { get; protected set; }
    public string DisplayName { get; protected set; } = string.Empty;
    public List<ContactPoint> ContactPoints { get; } = new();
    public List<PartyRole> Roles { get; } = new();

    public void AddContactPoint(ContactPointType type, string value, bool isPrimary = false)
    {
        if (isPrimary) ContactPoints.ForEach(cp => cp.ClearPrimary());
        ContactPoints.Add(new ContactPoint(Id, type, value, isPrimary));
    }
}

public sealed class PartyPerson : Party
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public DateOnly? BirthDate { get; private set; }
}

public sealed class PartyOrganization : Party
{
    public string LegalName { get; private set; } = string.Empty;
    public string TaxRegistrationNumber { get; private set; } = string.Empty;
}`,
  },

  // ─── Contact Points & Verification ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.polymorphic.contactTitle",
    id: "contact-points",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.polymorphic.contactDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.polymorphic.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/party-kernel/parties",
        descriptionKey: "modules.partyKernel.polymorphic.apiList",
        auth: "Bearer JWT",
        permission: "parties.view",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/parties/person",
        descriptionKey: "modules.partyKernel.polymorphic.apiCreatePerson",
        auth: "Bearer JWT",
        permission: "parties.create",
      },
    ],
  },
];

registerPage({
  slug: "modules/party-kernel/polymorphic-model",
  titleKey: "modules.partyKernel.polymorphic.title",
  descriptionKey: "modules.partyKernel.polymorphic.description",
  category: "module-party-kernel",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/party-kernel-overview",
    "modules/party-kernel/relationship-graph",
    "modules/party-kernel/deduplication-merge",
  ],
  lastUpdated: "2026-10-03",
});
