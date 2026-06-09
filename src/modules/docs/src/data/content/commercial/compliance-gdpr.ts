import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/compliance-gdpr",
  titleKey: "commercial.complianceGdpr.title",
  category: "commercial-modules",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceGdpr.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceGdpr.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.complianceGdpr.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "commercial.complianceGdpr.section_3_cell_0_0",
        "commercial.complianceGdpr.section_3_cell_0_1"
      ],
      [
        "commercial.complianceGdpr.section_3_cell_1_0",
        "commercial.complianceGdpr.section_3_cell_1_1"
      ],
      [
        "commercial.complianceGdpr.section_3_cell_2_0",
        "commercial.complianceGdpr.section_3_cell_2_1"
      ]
    ]
  }
],
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
