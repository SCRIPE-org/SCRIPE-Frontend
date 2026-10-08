import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.partyKernel.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.partyKernel.overview.infoTitle",
    contentKey: "modules.partyKernel.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.archTitle",
    id: "party-kernel-architecture",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Users2",
        titleKey: "modules.partyKernel.overview.featureParties",
        descriptionKey: "modules.partyKernel.overview.featurePartiesDesc",
      },
      {
        icon: "Network",
        titleKey: "modules.partyKernel.overview.featureRelationships",
        descriptionKey: "modules.partyKernel.overview.featureRelationshipsDesc",
      },
      {
        icon: "Tag",
        titleKey: "modules.partyKernel.overview.featureRoles",
        descriptionKey: "modules.partyKernel.overview.featureRolesDesc",
      },
      {
        icon: "PhoneCall",
        titleKey: "modules.partyKernel.overview.featureContacts",
        descriptionKey: "modules.partyKernel.overview.featureContactsDesc",
      },
      {
        icon: "GitMerge",
        titleKey: "modules.partyKernel.overview.featureMerge",
        descriptionKey: "modules.partyKernel.overview.featureMergeDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "modules.partyKernel.overview.featureDataPrivacy",
        descriptionKey: "modules.partyKernel.overview.featureDataPrivacyDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/PartyKernel/PartyKernel.Domain/Entities/Party.cs",
    code: `public abstract class Party : TenantAggregateRoot
{
    public PartyType Type { get; protected set; } // Person or Organization
    public string DisplayName { get; protected set; } = string.Empty;
    public List<PartyRole> Roles { get; protected set; } = new();
    public List<ContactPoint> ContactPoints { get; protected set; } = new();
    public List<PartyRelationship> SourceRelationships { get; protected set; } = new();

    public Result AddRole(string roleKey, string? scope = null)
    {
        if (Roles.Any(r => r.RoleKey == roleKey && r.Scope == scope))
            return Result.Failure("Party already possesses specified role within this scope.");

        Roles.Add(new PartyRole(Id, TenantId, roleKey, scope, DateTimeOffset.UtcNow));
        RaiseDomainEvent(new PartyRoleAssignedDomainEvent(Id, TenantId, roleKey));
        return Result.Success();
    }
}`,
  },

  // ─── Entity Resolution & Deduplication Pipeline ──────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.mergeFlowTitle",
    id: "deduplication-pipeline",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.overview.mergeFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      {
        id: "A",
        label: "Party record ingested from registration, booking, or CSV import",
        type: "default",
      },
      {
        id: "B",
        label: "Normalize email, mobile MSISDN, and tax registration identifiers",
        type: "info",
      },
      { id: "C", label: "Execute Jaro-Winkler phonetic & exact match scoring", type: "primary" },
      {
        id: "D",
        label: "If confidence score >= 0.85: create MergeCandidate entry",
        type: "warning",
      },
      {
        id: "E",
        label: "Operator reviews candidate with side-by-side attribute diff",
        type: "info",
      },
      {
        id: "F",
        label: "Execute atomic MergePartiesCommand: re-point relationships & roles",
        type: "success",
      },
      {
        id: "G",
        label: "Mark secondary party Merged & record immutable MergeAuditLedger",
        type: "success",
      },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/party-kernel/parties",
        descriptionKey: "modules.partyKernel.api.listParties",
        auth: "Bearer JWT",
        permission: "party-kernel.parties.view",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/persons",
        descriptionKey: "modules.partyKernel.api.createPerson",
        auth: "Bearer JWT",
        permission: "party-kernel.parties.create",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/organizations",
        descriptionKey: "modules.partyKernel.api.createOrganization",
        auth: "Bearer JWT",
        permission: "party-kernel.parties.create",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/parties/{id}/relationships",
        descriptionKey: "modules.partyKernel.api.createRelationship",
        auth: "Bearer JWT",
        permission: "party-kernel.relationships.create",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/parties/{id}/roles",
        descriptionKey: "modules.partyKernel.api.assignRole",
        auth: "Bearer JWT",
        permission: "party-kernel.roles.create",
      },
      {
        method: "GET",
        path: "/api/v1/party-kernel/merge-candidates",
        descriptionKey: "modules.partyKernel.api.listMergeCandidates",
        auth: "Bearer JWT",
        permission: "party-kernel.merge.view",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/merge-candidates/{id}/merge",
        descriptionKey: "modules.partyKernel.api.executeMerge",
        auth: "Bearer JWT",
        permission: "party-kernel.merge.execute",
      },
    ],
  },
];

registerPage({
  slug: "modules/party-kernel-overview",
  titleKey: "modules.partyKernel.overview.title",
  descriptionKey: "modules.partyKernel.overview.description",
  category: "modules",
  order: 2.9,
  sections,
  relatedSlugs: [
    "modules/hrms-overview",
    "modules/organization-core-overview",
    "modules/custom-fields",
  ],
  lastUpdated: "2026-10-03",
});
