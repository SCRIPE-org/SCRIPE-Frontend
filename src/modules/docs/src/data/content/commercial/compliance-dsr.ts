import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/compliance-dsr",
  titleKey: "commercial.complianceDsr.title",
  category: "commercial-modules",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceDsr.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceDsr.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.complianceDsr.section_2_title",
    "id": "sec_2"
  }
],
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
