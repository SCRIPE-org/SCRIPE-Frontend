import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/entitlements-overview",
  titleKey: "commercial.entOverview.title",
  category: "commercial-modules",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_3_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverview.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_5_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverview.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverview.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverview.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverview.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverview.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverview.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_17_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    req[\"API Request\"]\n    pipe([\"AstraFlow Mediator Pipeline\"])\n    check([\"IRequireFeature Check\"])\n    resolve{{\"Resolve Tenant Features\"}}\n    allow([\"Execute ✓\"])\n    deny[\"Feature Disabled ✗\"]\n    req --> pipe\n    pipe --> check\n    check --> resolve\n    resolve -->|\"Allowed\"| allow\n    resolve -->|\"Blocked\"| deny",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverview.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverview.section_20_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entOverview.section_21_hdr_0",
      "commercial.entOverview.section_21_hdr_1",
      "commercial.entOverview.section_21_hdr_2"
    ],
    "rows": [
      [
        "commercial.entOverview.section_21_cell_0_0",
        "commercial.entOverview.section_21_cell_0_1",
        "commercial.entOverview.section_21_cell_0_2"
      ],
      [
        "commercial.entOverview.section_21_cell_1_0",
        "commercial.entOverview.section_21_cell_1_1",
        "commercial.entOverview.section_21_cell_1_2"
      ],
      [
        "commercial.entOverview.section_21_cell_2_0",
        "commercial.entOverview.section_21_cell_2_1",
        "commercial.entOverview.section_21_cell_2_2"
      ],
      [
        "commercial.entOverview.section_21_cell_3_0",
        "commercial.entOverview.section_21_cell_3_1",
        "commercial.entOverview.section_21_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverview.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entOverview.section_23_hdr_0",
      "commercial.entOverview.section_23_hdr_1",
      "commercial.entOverview.section_23_hdr_2"
    ],
    "rows": [
      [
        "commercial.entOverview.section_23_cell_0_0",
        "commercial.entOverview.section_23_cell_0_1",
        "commercial.entOverview.section_23_cell_0_2"
      ],
      [
        "commercial.entOverview.section_23_cell_1_0",
        "commercial.entOverview.section_23_cell_1_1",
        "commercial.entOverview.section_23_cell_1_2"
      ],
      [
        "commercial.entOverview.section_23_cell_2_0",
        "commercial.entOverview.section_23_cell_2_1",
        "commercial.entOverview.section_23_cell_2_2"
      ],
      [
        "commercial.entOverview.section_23_cell_3_0",
        "commercial.entOverview.section_23_cell_3_1",
        "commercial.entOverview.section_23_cell_3_2"
      ],
      [
        "commercial.entOverview.section_23_cell_4_0",
        "commercial.entOverview.section_23_cell_4_1",
        "commercial.entOverview.section_23_cell_4_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.entOverview.section_24_title",
    "contentKey": "commercial.entOverview.section_24_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverview.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.entOverview.section_26_item_0",
      "commercial.entOverview.section_26_item_1",
      "commercial.entOverview.section_26_item_2"
    ]
  }
],
  relatedSlugs: [
  "commercial/entitlements-editions",
  "commercial/entitlements-features",
  "commercial/licensing-model"
],
  lastUpdated: "2026-06-09",
});
