import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/compliance-overview",
  titleKey: "commercial.complianceOverview.title",
  category: "commercial-modules",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceOverview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceOverview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.complianceOverview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.complianceOverview.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.complianceOverview.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.complianceOverview.section_5_title",
    "id": "sec_5"
  }
],
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
