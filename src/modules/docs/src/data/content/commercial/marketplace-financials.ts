import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/marketplace-financials",
  titleKey: "commercial.marketplace.financials.title",
  category: "commercial-modules",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.marketplace.financials.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.marketplace.financials.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.marketplace.financials.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.marketplace.financials.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.marketplace.financials.section_4_hdr_0",
      "commercial.marketplace.financials.section_4_hdr_1"
    ],
    "rows": [
      [
        "commercial.marketplace.financials.section_4_cell_0_0",
        "commercial.marketplace.financials.section_4_cell_0_1"
      ],
      [
        "commercial.marketplace.financials.section_4_cell_1_0",
        "commercial.marketplace.financials.section_4_cell_1_1"
      ],
      [
        "commercial.marketplace.financials.section_4_cell_2_0",
        "commercial.marketplace.financials.section_4_cell_2_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.marketplace.financials.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.marketplace.financials.section_6_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.marketplace.financials.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.marketplace.financials.section_8_item_0",
      "commercial.marketplace.financials.section_8_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/marketplace-overview",
  "commercial/stripe-connect"
],
  lastUpdated: "2026-06-09",
});
