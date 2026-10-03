import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.customer360.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "360°", labelKey: "commercial.customer360.statView" },
      { value: "0", labelKey: "commercial.customer360.statSilos" },
      { value: "Automated", labelKey: "commercial.customer360.statDeduplication" },
      { value: "Graph-Based", labelKey: "commercial.customer360.statRelationships" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.customer360.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Users2",
        titleKey: "commercial.customer360.featUnifiedParties",
        descriptionKey: "commercial.customer360.featUnifiedPartiesDesc",
      },
      {
        icon: "Network",
        titleKey: "commercial.customer360.featRelationships",
        descriptionKey: "commercial.customer360.featRelationshipsDesc",
      },
      {
        icon: "Tag",
        titleKey: "commercial.customer360.featDynamicRoles",
        descriptionKey: "commercial.customer360.featDynamicRolesDesc",
      },
      {
        icon: "GitMerge",
        titleKey: "commercial.customer360.featSmartDeduplication",
        descriptionKey: "commercial.customer360.featSmartDeduplicationDesc",
      },
      {
        icon: "PhoneCall",
        titleKey: "commercial.customer360.featOmniContacts",
        descriptionKey: "commercial.customer360.featOmniContactsDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "commercial.customer360.featGdprReadiness",
        descriptionKey: "commercial.customer360.featGdprReadinessDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.customer360.ctaTitle",
    subtitleKey: "commercial.customer360.ctaSubtitle",
    primaryCtaKey: "commercial.customer360.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.customer360.ctaSecondary",
    secondaryCtaHref: "/docs/modules/party-kernel-overview",
  },
];

registerPage({
  slug: "commercial/customer-360-party-kernel",
  titleKey: "commercial.customer360.title",
  descriptionKey: "commercial.customer360.description",
  category: "commercial-modules",
  order: 14,
  sections,
  relatedSlugs: [
    "commercial/workforce-hrms",
    "commercial/multi-branch-organization",
    "commercial/custom-fields",
  ],
  lastUpdated: "2026-10-03",
});
