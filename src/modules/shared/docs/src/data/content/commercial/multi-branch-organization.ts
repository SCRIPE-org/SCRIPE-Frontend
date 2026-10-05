import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.organizationCore.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "6 Tiers", labelKey: "commercial.organizationCore.statTiers" },
      { value: "Multi-Entity", labelKey: "commercial.organizationCore.statMultiEntity" },
      { value: "Consolidated", labelKey: "commercial.organizationCore.statConsolidated" },
      { value: "Strict Scoping", labelKey: "commercial.organizationCore.statScoping" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.organizationCore.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Building2",
        titleKey: "commercial.organizationCore.featLegalEntities",
        descriptionKey: "commercial.organizationCore.featLegalEntitiesDesc",
      },
      {
        icon: "Briefcase",
        titleKey: "commercial.organizationCore.featBusinessUnits",
        descriptionKey: "commercial.organizationCore.featBusinessUnitsDesc",
      },
      {
        icon: "GitBranch",
        titleKey: "commercial.organizationCore.featRegionalBranches",
        descriptionKey: "commercial.organizationCore.featRegionalBranchesDesc",
      },
      {
        icon: "MapPin",
        titleKey: "commercial.organizationCore.featCampusesSites",
        descriptionKey: "commercial.organizationCore.featCampusesSitesDesc",
      },
      {
        icon: "Users",
        titleKey: "commercial.organizationCore.featOperationalTeams",
        descriptionKey: "commercial.organizationCore.featOperationalTeamsDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "commercial.organizationCore.featCrossBranchGovernance",
        descriptionKey: "commercial.organizationCore.featCrossBranchGovernanceDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.organizationCore.ctaTitle",
    subtitleKey: "commercial.organizationCore.ctaSubtitle",
    primaryCtaKey: "commercial.organizationCore.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.organizationCore.ctaSecondary",
    secondaryCtaHref: "/docs/modules/organization-core-overview",
  },
];

registerPage({
  slug: "commercial/multi-branch-organization",
  titleKey: "commercial.organizationCore.title",
  descriptionKey: "commercial.organizationCore.description",
  category: "commercial-modules",
  order: 15,
  sections,
  relatedSlugs: [
    "commercial/workforce-hrms",
    "commercial/venue-operations",
    "commercial/customer-360-party-kernel",
  ],
  lastUpdated: "2026-10-03",
});
