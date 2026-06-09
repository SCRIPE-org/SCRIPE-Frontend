import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/compliance-roi",
  titleKey: "commercial.complianceRoi.title",
  category: "commercial-modules",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceRoi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.complianceRoi.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.complianceRoi.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "commercial.complianceRoi.section_3_cell_0_0",
        "commercial.complianceRoi.section_3_cell_0_1"
      ],
      [
        "commercial.complianceRoi.section_3_cell_1_0",
        "commercial.complianceRoi.section_3_cell_1_1"
      ]
    ]
  }
],
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
