import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.complianceDsr.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceDsr.automationTitle",
    id: "dsr-automation",
  },
  { type: "paragraph", contentKey: "commercial.complianceDsr.automationIntro" },
];

registerPage({
  slug: "commercial/compliance-dsr",
  titleKey: "commercial.complianceDsr.title",
  descriptionKey: "commercial.complianceDsr.description",
  category: "commercial-modules",
  order: 3,
  sections,
  lastUpdated: "2026-05-03",
});
