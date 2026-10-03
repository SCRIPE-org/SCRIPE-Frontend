import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.customFields.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "22 Types", labelKey: "commercial.customFields.statTypes" },
      { value: "Zero Code", labelKey: "commercial.customFields.statZeroCode" },
      { value: "Encrypted", labelKey: "commercial.customFields.statSecurity" },
      { value: "Polymorphic", labelKey: "commercial.customFields.statAttachment" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.customFields.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "LayoutGrid",
        titleKey: "commercial.customFields.feat22Types",
        descriptionKey: "commercial.customFields.feat22TypesDesc",
      },
      {
        icon: "Lock",
        titleKey: "commercial.customFields.featEncryption",
        descriptionKey: "commercial.customFields.featEncryptionDesc",
      },
      {
        icon: "Layers",
        titleKey: "commercial.customFields.featFieldGroups",
        descriptionKey: "commercial.customFields.featFieldGroupsDesc",
      },
      {
        icon: "CheckSquare",
        titleKey: "commercial.customFields.featValidationRules",
        descriptionKey: "commercial.customFields.featValidationRulesDesc",
      },
      {
        icon: "Link",
        titleKey: "commercial.customFields.featReferences",
        descriptionKey: "commercial.customFields.featReferencesDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "commercial.customFields.featTenantScoping",
        descriptionKey: "commercial.customFields.featTenantScopingDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.customFields.ctaTitle",
    subtitleKey: "commercial.customFields.ctaSubtitle",
    primaryCtaKey: "commercial.customFields.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.customFields.ctaSecondary",
    secondaryCtaHref: "/docs/modules/custom-fields",
  },
];

registerPage({
  slug: "commercial/custom-fields",
  titleKey: "commercial.customFields.title",
  descriptionKey: "commercial.customFields.description",
  category: "commercial-modules",
  order: 19,
  sections,
  relatedSlugs: [
    "commercial/multi-tenancy",
    "commercial/customer-360-party-kernel",
    "commercial/work-management",
  ],
  lastUpdated: "2026-10-03",
});
