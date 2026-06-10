import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.complianceRoi.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceRoi.savingsTitle",
    id: "roi-savings",
  },
  {
    type: "table",
    headers: ["commercial.complianceRoi.metricCol", "commercial.complianceRoi.impactCol"],
    rows: [
      ["commercial.complianceRoi.metricManualDsr", "commercial.complianceRoi.impactManualDsr"],
      ["commercial.complianceRoi.metricFines", "commercial.complianceRoi.impactFines"],
    ],
  },
];

registerPage({
  slug: "commercial/compliance-roi",
  titleKey: "commercial.complianceRoi.title",
  descriptionKey: "commercial.complianceRoi.description",
  category: "commercial-modules",
  order: 4,
  sections,
  lastUpdated: "2026-05-03",
});
