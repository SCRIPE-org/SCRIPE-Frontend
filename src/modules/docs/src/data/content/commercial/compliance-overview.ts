import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.complianceOverview.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceOverview.benefitsTitle",
    id: "benefits",
  },
  {
    type: "feature-grid",
    items: [
      {
        titleKey: "commercial.complianceOverview.featureAutomatedDsrTitle",
        descriptionKey: "commercial.complianceOverview.featureAutomatedDsrDesc",
        icon: "zap",
      },
      {
        titleKey: "commercial.complianceOverview.featureConsentTitle",
        descriptionKey: "commercial.complianceOverview.featureConsentDesc",
        icon: "shield-check",
      },
      {
        titleKey: "commercial.complianceOverview.featureRetentionTitle",
        descriptionKey: "commercial.complianceOverview.featureRetentionDesc",
        icon: "trash-2",
      },
    ],
  },
];

registerPage({
  slug: "commercial/compliance-overview",
  titleKey: "commercial.complianceOverview.title",
  descriptionKey: "commercial.complianceOverview.description",
  category: "commercial-modules",
  order: 1,
  sections,
  lastUpdated: "2026-05-03",
});
