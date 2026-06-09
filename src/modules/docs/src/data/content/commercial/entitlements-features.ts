import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/entitlements-features",
  titleKey: "commercial.entFeatures.title",
  category: "commercial-modules",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entFeatures.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entFeatures.section_4_hdr_0",
      "commercial.entFeatures.section_4_hdr_1",
      "commercial.entFeatures.section_4_hdr_2",
      "commercial.entFeatures.section_4_hdr_3"
    ],
    "rows": [
      [
        "commercial.entFeatures.section_4_cell_0_0",
        "commercial.entFeatures.section_4_cell_0_1",
        "commercial.entFeatures.section_4_cell_0_2",
        "commercial.entFeatures.section_4_cell_0_3"
      ],
      [
        "commercial.entFeatures.section_4_cell_1_0",
        "commercial.entFeatures.section_4_cell_1_1",
        "commercial.entFeatures.section_4_cell_1_2",
        "commercial.entFeatures.section_4_cell_1_3"
      ],
      [
        "commercial.entFeatures.section_4_cell_2_0",
        "commercial.entFeatures.section_4_cell_2_1",
        "commercial.entFeatures.section_4_cell_2_2",
        "commercial.entFeatures.section_4_cell_2_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entFeatures.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entFeatures.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entFeatures.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_9_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entFeatures.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_11_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    cmd[\"Create Entity Command\"]\n    pipe([\"FeatureCheckBehavior\"])\n    quota([\"Check QuotaCounter\"])\n    pass([\"Execute ✓\"])\n    fail[\"Quota Exceeded ✗\"]\n    cmd --> pipe\n    pipe --> quota\n    quota -->|\"Under limit\"| pass\n    quota -->|\"At limit\"| fail",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entFeatures.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entFeatures.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_16_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entFeatures.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entFeatures.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entFeatures.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entFeatures.section_20_hdr_0",
      "commercial.entFeatures.section_20_hdr_1",
      "commercial.entFeatures.section_20_hdr_2",
      "commercial.entFeatures.section_20_hdr_3",
      "commercial.entFeatures.section_20_hdr_4"
    ],
    "rows": [
      [
        "commercial.entFeatures.section_20_cell_0_0",
        "commercial.entFeatures.section_20_cell_0_1",
        "commercial.entFeatures.section_20_cell_0_2",
        "commercial.entFeatures.section_20_cell_0_3",
        "commercial.entFeatures.section_20_cell_0_4"
      ],
      [
        "commercial.entFeatures.section_20_cell_1_0",
        "commercial.entFeatures.section_20_cell_1_1",
        "commercial.entFeatures.section_20_cell_1_2",
        "commercial.entFeatures.section_20_cell_1_3",
        "commercial.entFeatures.section_20_cell_1_4"
      ],
      [
        "commercial.entFeatures.section_20_cell_2_0",
        "commercial.entFeatures.section_20_cell_2_1",
        "commercial.entFeatures.section_20_cell_2_2",
        "commercial.entFeatures.section_20_cell_2_3",
        "commercial.entFeatures.section_20_cell_2_4"
      ],
      [
        "commercial.entFeatures.section_20_cell_3_0",
        "commercial.entFeatures.section_20_cell_3_1",
        "commercial.entFeatures.section_20_cell_3_2",
        "commercial.entFeatures.section_20_cell_3_3",
        "commercial.entFeatures.section_20_cell_3_4"
      ],
      [
        "commercial.entFeatures.section_20_cell_4_0",
        "commercial.entFeatures.section_20_cell_4_1",
        "commercial.entFeatures.section_20_cell_4_2",
        "commercial.entFeatures.section_20_cell_4_3",
        "commercial.entFeatures.section_20_cell_4_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.entFeatures.section_21_title",
    "contentKey": "commercial.entFeatures.section_21_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entFeatures.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.entFeatures.section_23_item_0",
      "commercial.entFeatures.section_23_item_1",
      "commercial.entFeatures.section_23_item_2"
    ]
  }
],
  relatedSlugs: [
  "commercial/entitlements-editions",
  "commercial/entitlements-overrides",
  "commercial/entitlements-overview"
],
  lastUpdated: "2026-06-09",
});
