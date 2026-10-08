import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.organizationCore.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.organizationCore.overview.infoTitle",
    contentKey: "modules.organizationCore.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.organizationCore.overview.archTitle",
    id: "organization-architecture",
  },
  { type: "paragraph", contentKey: "modules.organizationCore.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Building2",
        titleKey: "modules.organizationCore.overview.featureLegalEntities",
        descriptionKey: "modules.organizationCore.overview.featureLegalEntitiesDesc",
      },
      {
        icon: "Briefcase",
        titleKey: "modules.organizationCore.overview.featureBusinessUnits",
        descriptionKey: "modules.organizationCore.overview.featureBusinessUnitsDesc",
      },
      {
        icon: "GitBranch",
        titleKey: "modules.organizationCore.overview.featureBranches",
        descriptionKey: "modules.organizationCore.overview.featureBranchesDesc",
      },
      {
        icon: "MapPin",
        titleKey: "modules.organizationCore.overview.featureSites",
        descriptionKey: "modules.organizationCore.overview.featureSitesDesc",
      },
      {
        icon: "FolderTree",
        titleKey: "modules.organizationCore.overview.featureDepartments",
        descriptionKey: "modules.organizationCore.overview.featureDepartmentsDesc",
      },
      {
        icon: "Users",
        titleKey: "modules.organizationCore.overview.featureTeams",
        descriptionKey: "modules.organizationCore.overview.featureTeamsDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.organizationCore.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.organizationCore.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/OrganizationCore/OrganizationCore.Domain/Entities/LegalEntity.cs",
    code: `public sealed class LegalEntity : TenantAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string LegalNameEn { get; private set; } = string.Empty;
    public string LegalNameAr { get; private set; } = string.Empty;
    public string TaxRegistrationNumber { get; private set; } = string.Empty;
    public string JurisdictionCountryCode { get; private set; } = "SA";
    public List<BusinessUnit> BusinessUnits { get; private set; } = new();
    public List<Branch> Branches { get; private set; } = new();

    public Result AddBranch(string branchCode, string nameEn, string nameAr, Guid siteId)
    {
        if (Branches.Any(b => b.Code == branchCode))
            return Result.Failure("Branch with code already exists within this legal entity.");

        var branch = new Branch(Id, TenantId, branchCode, nameEn, nameAr, siteId);
        Branches.Add(branch);
        RaiseDomainEvent(new BranchCreatedDomainEvent(branch.Id, TenantId, Id, branchCode));
        return Result.Success();
    }
}`,
  },

  // ─── 6-Tier Hierarchy Tree & Scoping Resolution Pipeline ───────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.organizationCore.overview.treeFlowTitle",
    id: "hierarchical-scoping-pipeline",
  },
  { type: "paragraph", contentKey: "modules.organizationCore.overview.treeFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Tenant Corporate Root (Top Level)", type: "default" },
      {
        id: "B",
        label: "LegalEntity (Registered Corporate Incorporation & Tax Number)",
        type: "primary",
      },
      { id: "C", label: "BusinessUnit (Strategic P&L Division)", type: "info" },
      { id: "D", label: "Branch (Regional Operational Center)", type: "info" },
      { id: "E", label: "Site (Physical Real Estate Campus or Complex)", type: "warning" },
      { id: "F", label: "Department & Squad Teams (Operational execution units)", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.organizationCore.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.organizationCore.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/organization-core/legal-entities",
        descriptionKey: "modules.organizationCore.api.listLegalEntities",
        auth: "Bearer JWT",
        permission: "organization-core.legal-entities.view",
      },
      {
        method: "POST",
        path: "/api/v1/organization-core/legal-entities",
        descriptionKey: "modules.organizationCore.api.createLegalEntity",
        auth: "Bearer JWT",
        permission: "organization-core.legal-entities.create",
      },
      {
        method: "GET",
        path: "/api/v1/organization-core/business-units",
        descriptionKey: "modules.organizationCore.api.listBusinessUnits",
        auth: "Bearer JWT",
        permission: "organization-core.business-units.view",
      },
      {
        method: "GET",
        path: "/api/v1/organization-core/branches",
        descriptionKey: "modules.organizationCore.api.listBranches",
        auth: "Bearer JWT",
        permission: "organization-core.branches.view",
      },
      {
        method: "POST",
        path: "/api/v1/organization-core/branches",
        descriptionKey: "modules.organizationCore.api.createBranch",
        auth: "Bearer JWT",
        permission: "organization-core.branches.create",
      },
      {
        method: "GET",
        path: "/api/v1/organization-core/sites",
        descriptionKey: "modules.organizationCore.api.listSites",
        auth: "Bearer JWT",
        permission: "organization-core.sites.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/organization-core-overview",
  titleKey: "modules.organizationCore.overview.title",
  descriptionKey: "modules.organizationCore.overview.description",
  category: "modules",
  order: 2.95,
  sections,
  relatedSlugs: [
    "modules/hrms-overview",
    "modules/party-kernel-overview",
    "modules/venue-overview",
  ],
  lastUpdated: "2026-10-03",
});
