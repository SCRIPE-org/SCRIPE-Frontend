import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/entitlements-subscriptions",
  titleKey: "commercial.entSubscriptions.title",
  category: "commercial-modules",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entSubscriptions.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    pending[\"Pending\"]\n    active([\"Active\"])\n    trial([\"Trial\"])\n    suspended{{\"Suspended\"}}\n    expired[\"Expired\"]\n    cancelled[\"Cancelled\"]\n    pending -->|\"Activate\"| active\n    pending -->|\"Start trial\"| trial\n    trial -->|\"Convert\"| active\n    trial -->|\"Trial ends\"| expired\n    active -->|\"Suspend\"| suspended\n    suspended -->|\"Reactivate\"| active\n    active -->|\"Expiry date\"| expired\n    active -->|\"Cancel\"| cancelled",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entSubscriptions.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entSubscriptions.section_6_hdr_0",
      "commercial.entSubscriptions.section_6_hdr_1",
      "commercial.entSubscriptions.section_6_hdr_2"
    ],
    "rows": [
      [
        "commercial.entSubscriptions.section_6_cell_0_0",
        "commercial.entSubscriptions.section_6_cell_0_1",
        "commercial.entSubscriptions.section_6_cell_0_2"
      ],
      [
        "commercial.entSubscriptions.section_6_cell_1_0",
        "commercial.entSubscriptions.section_6_cell_1_1",
        "commercial.entSubscriptions.section_6_cell_1_2"
      ],
      [
        "commercial.entSubscriptions.section_6_cell_2_0",
        "commercial.entSubscriptions.section_6_cell_2_1",
        "commercial.entSubscriptions.section_6_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entSubscriptions.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entSubscriptions.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entSubscriptions.section_17_hdr_0",
      "commercial.entSubscriptions.section_17_hdr_1",
      "commercial.entSubscriptions.section_17_hdr_2"
    ],
    "rows": [
      [
        "commercial.entSubscriptions.section_17_cell_0_0",
        "commercial.entSubscriptions.section_17_cell_0_1",
        "commercial.entSubscriptions.section_17_cell_0_2"
      ],
      [
        "commercial.entSubscriptions.section_17_cell_1_0",
        "commercial.entSubscriptions.section_17_cell_1_1",
        "commercial.entSubscriptions.section_17_cell_1_2"
      ],
      [
        "commercial.entSubscriptions.section_17_cell_2_0",
        "commercial.entSubscriptions.section_17_cell_2_1",
        "commercial.entSubscriptions.section_17_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entSubscriptions.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_20_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_22_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_24_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_26_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entSubscriptions.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entSubscriptions.section_28_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entSubscriptions.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entSubscriptions.section_30_hdr_0",
      "commercial.entSubscriptions.section_30_hdr_1",
      "commercial.entSubscriptions.section_30_hdr_2",
      "commercial.entSubscriptions.section_30_hdr_3",
      "commercial.entSubscriptions.section_30_hdr_4"
    ],
    "rows": [
      [
        "commercial.entSubscriptions.section_30_cell_0_0",
        "commercial.entSubscriptions.section_30_cell_0_1",
        "commercial.entSubscriptions.section_30_cell_0_2",
        "commercial.entSubscriptions.section_30_cell_0_3",
        "commercial.entSubscriptions.section_30_cell_0_4"
      ],
      [
        "commercial.entSubscriptions.section_30_cell_1_0",
        "commercial.entSubscriptions.section_30_cell_1_1",
        "commercial.entSubscriptions.section_30_cell_1_2",
        "commercial.entSubscriptions.section_30_cell_1_3",
        "commercial.entSubscriptions.section_30_cell_1_4"
      ],
      [
        "commercial.entSubscriptions.section_30_cell_2_0",
        "commercial.entSubscriptions.section_30_cell_2_1",
        "commercial.entSubscriptions.section_30_cell_2_2",
        "commercial.entSubscriptions.section_30_cell_2_3",
        "commercial.entSubscriptions.section_30_cell_2_4"
      ],
      [
        "commercial.entSubscriptions.section_30_cell_3_0",
        "commercial.entSubscriptions.section_30_cell_3_1",
        "commercial.entSubscriptions.section_30_cell_3_2",
        "commercial.entSubscriptions.section_30_cell_3_3",
        "commercial.entSubscriptions.section_30_cell_3_4"
      ],
      [
        "commercial.entSubscriptions.section_30_cell_4_0",
        "commercial.entSubscriptions.section_30_cell_4_1",
        "commercial.entSubscriptions.section_30_cell_4_2",
        "commercial.entSubscriptions.section_30_cell_4_3",
        "commercial.entSubscriptions.section_30_cell_4_4"
      ],
      [
        "commercial.entSubscriptions.section_30_cell_5_0",
        "commercial.entSubscriptions.section_30_cell_5_1",
        "commercial.entSubscriptions.section_30_cell_5_2",
        "commercial.entSubscriptions.section_30_cell_5_3",
        "commercial.entSubscriptions.section_30_cell_5_4"
      ],
      [
        "commercial.entSubscriptions.section_30_cell_6_0",
        "commercial.entSubscriptions.section_30_cell_6_1",
        "commercial.entSubscriptions.section_30_cell_6_2",
        "commercial.entSubscriptions.section_30_cell_6_3",
        "commercial.entSubscriptions.section_30_cell_6_4"
      ],
      [
        "commercial.entSubscriptions.section_30_cell_7_0",
        "commercial.entSubscriptions.section_30_cell_7_1",
        "commercial.entSubscriptions.section_30_cell_7_2",
        "commercial.entSubscriptions.section_30_cell_7_3",
        "commercial.entSubscriptions.section_30_cell_7_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.entSubscriptions.section_31_title",
    "contentKey": "commercial.entSubscriptions.section_31_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entSubscriptions.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.entSubscriptions.section_33_item_0",
      "commercial.entSubscriptions.section_33_item_1",
      "commercial.entSubscriptions.section_33_item_2"
    ]
  }
],
  relatedSlugs: [
  "commercial/entitlements-editions",
  "commercial/entitlements-overview",
  "commercial/multi-tenancy"
],
  lastUpdated: "2026-06-09",
});
