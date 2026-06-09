import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/multi-tenancy",
  titleKey: "commercial.multiTenancy.title",
  category: "commercial-enterprise",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.multiTenancy.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_4_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "┌──────────────────────────────────────────────────┐\n│               Root Tenant (Platform)             │\n│                                                  │\n│  ┌────────────────┐    ┌────────────────┐       │\n│  │  Enterprise A  │    │  Enterprise B  │       │\n│  │   (Parent)     │    │   (Parent)     │       │\n│  │                │    │                │       │\n│  │ ┌──────┐ ┌────┐│    │ ┌──────┐       │       │\n│  │ │Dept 1│ │D. 2││    │ │Branch│       │       │\n│  │ │(child)│ │    ││    │ │  1   │       │       │\n│  │ └──────┘ └────┘│    │ └──────┘       │       │\n│  └────────────────┘    └────────────────┘       │\n└──────────────────────────────────────────────────┘",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.multiTenancy.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "table",
    "headers": [
      "commercial.multiTenancy.section_7_hdr_0",
      "commercial.multiTenancy.section_7_hdr_1",
      "commercial.multiTenancy.section_7_hdr_2"
    ],
    "rows": [
      [
        "commercial.multiTenancy.section_7_cell_0_0",
        "commercial.multiTenancy.section_7_cell_0_1",
        "commercial.multiTenancy.section_7_cell_0_2"
      ],
      [
        "commercial.multiTenancy.section_7_cell_1_0",
        "commercial.multiTenancy.section_7_cell_1_1",
        "commercial.multiTenancy.section_7_cell_1_2"
      ],
      [
        "commercial.multiTenancy.section_7_cell_2_0",
        "commercial.multiTenancy.section_7_cell_2_1",
        "commercial.multiTenancy.section_7_cell_2_2"
      ],
      [
        "commercial.multiTenancy.section_7_cell_3_0",
        "commercial.multiTenancy.section_7_cell_3_1",
        "commercial.multiTenancy.section_7_cell_3_2"
      ],
      [
        "commercial.multiTenancy.section_7_cell_4_0",
        "commercial.multiTenancy.section_7_cell_4_1",
        "commercial.multiTenancy.section_7_cell_4_2"
      ],
      [
        "commercial.multiTenancy.section_7_cell_5_0",
        "commercial.multiTenancy.section_7_cell_5_1",
        "commercial.multiTenancy.section_7_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.multiTenancy.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.multiTenancy.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_19_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.multiTenancy.section_20_item_0",
      "commercial.multiTenancy.section_20_item_1",
      "commercial.multiTenancy.section_20_item_2",
      "commercial.multiTenancy.section_20_item_3",
      "commercial.multiTenancy.section_20_item_4",
      "commercial.multiTenancy.section_20_item_5"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.multiTenancy.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "table",
    "headers": [
      "commercial.multiTenancy.section_22_hdr_0",
      "commercial.multiTenancy.section_22_hdr_1",
      "commercial.multiTenancy.section_22_hdr_2",
      "commercial.multiTenancy.section_22_hdr_3",
      "commercial.multiTenancy.section_22_hdr_4"
    ],
    "rows": [
      [
        "commercial.multiTenancy.section_22_cell_0_0",
        "commercial.multiTenancy.section_22_cell_0_1",
        "commercial.multiTenancy.section_22_cell_0_2",
        "commercial.multiTenancy.section_22_cell_0_3",
        "commercial.multiTenancy.section_22_cell_0_4"
      ],
      [
        "commercial.multiTenancy.section_22_cell_1_0",
        "commercial.multiTenancy.section_22_cell_1_1",
        "commercial.multiTenancy.section_22_cell_1_2",
        "commercial.multiTenancy.section_22_cell_1_3",
        "commercial.multiTenancy.section_22_cell_1_4"
      ],
      [
        "commercial.multiTenancy.section_22_cell_2_0",
        "commercial.multiTenancy.section_22_cell_2_1",
        "commercial.multiTenancy.section_22_cell_2_2",
        "commercial.multiTenancy.section_22_cell_2_3",
        "commercial.multiTenancy.section_22_cell_2_4"
      ],
      [
        "commercial.multiTenancy.section_22_cell_3_0",
        "commercial.multiTenancy.section_22_cell_3_1",
        "commercial.multiTenancy.section_22_cell_3_2",
        "commercial.multiTenancy.section_22_cell_3_3",
        "commercial.multiTenancy.section_22_cell_3_4"
      ],
      [
        "commercial.multiTenancy.section_22_cell_4_0",
        "commercial.multiTenancy.section_22_cell_4_1",
        "commercial.multiTenancy.section_22_cell_4_2",
        "commercial.multiTenancy.section_22_cell_4_3",
        "commercial.multiTenancy.section_22_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.multiTenancy.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_24_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_26_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_28_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_30_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_32_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_34_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_36_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.multiTenancy.section_38_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    add[\"Tenant Admin adds custom domain\"]\n    verify([\"DNS Verification (CNAME + TXT)\"])\n    active([\"Domain Active & Verified ✓\"])\n    primary([\"Set as Primary Domain\"])\n    add --> verify\n    verify --> active\n    active --> primary",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.multiTenancy.section_40_title",
    "id": "sec_40"
  },
  {
    "type": "table",
    "headers": [
      "commercial.multiTenancy.section_41_hdr_0",
      "commercial.multiTenancy.section_41_hdr_1",
      "commercial.multiTenancy.section_41_hdr_2",
      "commercial.multiTenancy.section_41_hdr_3",
      "commercial.multiTenancy.section_41_hdr_4"
    ],
    "rows": [
      [
        "commercial.multiTenancy.section_41_cell_0_0",
        "commercial.multiTenancy.section_41_cell_0_1",
        "commercial.multiTenancy.section_41_cell_0_2",
        "commercial.multiTenancy.section_41_cell_0_3",
        "commercial.multiTenancy.section_41_cell_0_4"
      ],
      [
        "commercial.multiTenancy.section_41_cell_1_0",
        "commercial.multiTenancy.section_41_cell_1_1",
        "commercial.multiTenancy.section_41_cell_1_2",
        "commercial.multiTenancy.section_41_cell_1_3",
        "commercial.multiTenancy.section_41_cell_1_4"
      ],
      [
        "commercial.multiTenancy.section_41_cell_2_0",
        "commercial.multiTenancy.section_41_cell_2_1",
        "commercial.multiTenancy.section_41_cell_2_2",
        "commercial.multiTenancy.section_41_cell_2_3",
        "commercial.multiTenancy.section_41_cell_2_4"
      ],
      [
        "commercial.multiTenancy.section_41_cell_3_0",
        "commercial.multiTenancy.section_41_cell_3_1",
        "commercial.multiTenancy.section_41_cell_3_2",
        "commercial.multiTenancy.section_41_cell_3_3",
        "commercial.multiTenancy.section_41_cell_3_4"
      ],
      [
        "commercial.multiTenancy.section_41_cell_4_0",
        "commercial.multiTenancy.section_41_cell_4_1",
        "commercial.multiTenancy.section_41_cell_4_2",
        "commercial.multiTenancy.section_41_cell_4_3",
        "commercial.multiTenancy.section_41_cell_4_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.multiTenancy.section_42_title",
    "contentKey": "commercial.multiTenancy.section_42_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.multiTenancy.section_43_title",
    "id": "sec_43"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.multiTenancy.section_44_item_0",
      "commercial.multiTenancy.section_44_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/roles-permissions",
  "commercial/audit-compliance"
],
  lastUpdated: "2026-06-09",
});
