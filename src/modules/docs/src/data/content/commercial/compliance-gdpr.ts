import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.complianceGdpr.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceGdpr.mappingTitle",
    id: "gdpr-mapping",
  },
  {
    type: "table",
    headers: ["commercial.complianceGdpr.articleCol", "commercial.complianceGdpr.nexoraFeatureCol"],
    rows: [
      ["Article 15: Right of Access", "commercial.complianceGdpr.featureAccess"],
      ["Article 17: Right to Erasure", "commercial.complianceGdpr.featureErasure"],
      ["Article 30: Records of Processing", "commercial.complianceGdpr.featureRopa"]
    ]
  }
];

registerPage({
  slug: "commercial/compliance-gdpr",
  titleKey: "commercial.complianceGdpr.title",
  descriptionKey: "commercial.complianceGdpr.description",
  category: "commercial-modules",
  order: 2,
  sections,
  lastUpdated: "2026-05-03",
});
