import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/dashboard-builder",
  titleKey: "commercial.dashboardBuilder.title",
  category: "commercial",
  order: 10,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dashboardBuilder.section_4_hdr_0",
      "commercial.dashboardBuilder.section_4_hdr_1",
      "commercial.dashboardBuilder.section_4_hdr_2"
    ],
    "rows": [
      [
        "commercial.dashboardBuilder.section_4_cell_0_0",
        "commercial.dashboardBuilder.section_4_cell_0_1",
        "commercial.dashboardBuilder.section_4_cell_0_2"
      ],
      [
        "commercial.dashboardBuilder.section_4_cell_1_0",
        "commercial.dashboardBuilder.section_4_cell_1_1",
        "commercial.dashboardBuilder.section_4_cell_1_2"
      ],
      [
        "commercial.dashboardBuilder.section_4_cell_2_0",
        "commercial.dashboardBuilder.section_4_cell_2_1",
        "commercial.dashboardBuilder.section_4_cell_2_2"
      ],
      [
        "commercial.dashboardBuilder.section_4_cell_3_0",
        "commercial.dashboardBuilder.section_4_cell_3_1",
        "commercial.dashboardBuilder.section_4_cell_3_2"
      ],
      [
        "commercial.dashboardBuilder.section_4_cell_4_0",
        "commercial.dashboardBuilder.section_4_cell_4_1",
        "commercial.dashboardBuilder.section_4_cell_4_2"
      ],
      [
        "commercial.dashboardBuilder.section_4_cell_5_0",
        "commercial.dashboardBuilder.section_4_cell_5_1",
        "commercial.dashboardBuilder.section_4_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_6_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    platform[\"Platform Defaults\"]\n    tenant([\"Tenant Branding\"])\n    admin{{\"Admin Preferences\"}}\n    render([\"Rendered Dashboard\"])\n    platform -->|\"Overridden by\"| tenant\n    tenant -->|\"Overridden by\"| admin\n    admin -->|\"Applied\"| render",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.dashboardBuilder.section_8_title",
    "contentKey": "commercial.dashboardBuilder.section_8_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_10_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dashboardBuilder.section_11_hdr_0",
      "commercial.dashboardBuilder.section_11_hdr_1",
      "commercial.dashboardBuilder.section_11_hdr_2"
    ],
    "rows": [
      [
        "commercial.dashboardBuilder.section_11_cell_0_0",
        "commercial.dashboardBuilder.section_11_cell_0_1",
        "commercial.dashboardBuilder.section_11_cell_0_2"
      ],
      [
        "commercial.dashboardBuilder.section_11_cell_1_0",
        "commercial.dashboardBuilder.section_11_cell_1_1",
        "commercial.dashboardBuilder.section_11_cell_1_2"
      ],
      [
        "commercial.dashboardBuilder.section_11_cell_2_0",
        "commercial.dashboardBuilder.section_11_cell_2_1",
        "commercial.dashboardBuilder.section_11_cell_2_2"
      ],
      [
        "commercial.dashboardBuilder.section_11_cell_3_0",
        "commercial.dashboardBuilder.section_11_cell_3_1",
        "commercial.dashboardBuilder.section_11_cell_3_2"
      ],
      [
        "commercial.dashboardBuilder.section_11_cell_4_0",
        "commercial.dashboardBuilder.section_11_cell_4_1",
        "commercial.dashboardBuilder.section_11_cell_4_2"
      ],
      [
        "commercial.dashboardBuilder.section_11_cell_5_0",
        "commercial.dashboardBuilder.section_11_cell_5_1",
        "commercial.dashboardBuilder.section_11_cell_5_2"
      ],
      [
        "commercial.dashboardBuilder.section_11_cell_6_0",
        "commercial.dashboardBuilder.section_11_cell_6_1",
        "commercial.dashboardBuilder.section_11_cell_6_2"
      ],
      [
        "commercial.dashboardBuilder.section_11_cell_7_0",
        "commercial.dashboardBuilder.section_11_cell_7_1",
        "commercial.dashboardBuilder.section_11_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_13_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dashboardBuilder.section_14_hdr_0",
      "commercial.dashboardBuilder.section_14_hdr_1",
      "commercial.dashboardBuilder.section_14_hdr_2",
      "commercial.dashboardBuilder.section_14_hdr_3"
    ],
    "rows": [
      [
        "commercial.dashboardBuilder.section_14_cell_0_0",
        "commercial.dashboardBuilder.section_14_cell_0_1",
        "commercial.dashboardBuilder.section_14_cell_0_2",
        "commercial.dashboardBuilder.section_14_cell_0_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_1_0",
        "commercial.dashboardBuilder.section_14_cell_1_1",
        "commercial.dashboardBuilder.section_14_cell_1_2",
        "commercial.dashboardBuilder.section_14_cell_1_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_2_0",
        "commercial.dashboardBuilder.section_14_cell_2_1",
        "commercial.dashboardBuilder.section_14_cell_2_2",
        "commercial.dashboardBuilder.section_14_cell_2_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_3_0",
        "commercial.dashboardBuilder.section_14_cell_3_1",
        "commercial.dashboardBuilder.section_14_cell_3_2",
        "commercial.dashboardBuilder.section_14_cell_3_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_4_0",
        "commercial.dashboardBuilder.section_14_cell_4_1",
        "commercial.dashboardBuilder.section_14_cell_4_2",
        "commercial.dashboardBuilder.section_14_cell_4_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_5_0",
        "commercial.dashboardBuilder.section_14_cell_5_1",
        "commercial.dashboardBuilder.section_14_cell_5_2",
        "commercial.dashboardBuilder.section_14_cell_5_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_6_0",
        "commercial.dashboardBuilder.section_14_cell_6_1",
        "commercial.dashboardBuilder.section_14_cell_6_2",
        "commercial.dashboardBuilder.section_14_cell_6_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_7_0",
        "commercial.dashboardBuilder.section_14_cell_7_1",
        "commercial.dashboardBuilder.section_14_cell_7_2",
        "commercial.dashboardBuilder.section_14_cell_7_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_8_0",
        "commercial.dashboardBuilder.section_14_cell_8_1",
        "commercial.dashboardBuilder.section_14_cell_8_2",
        "commercial.dashboardBuilder.section_14_cell_8_3"
      ],
      [
        "commercial.dashboardBuilder.section_14_cell_9_0",
        "commercial.dashboardBuilder.section_14_cell_9_1",
        "commercial.dashboardBuilder.section_14_cell_9_2",
        "commercial.dashboardBuilder.section_14_cell_9_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "commercial.dashboardBuilder.section_15_title",
    "contentKey": "commercial.dashboardBuilder.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_17_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dashboardBuilder.section_18_hdr_0",
      "commercial.dashboardBuilder.section_18_hdr_1"
    ],
    "rows": [
      [
        "commercial.dashboardBuilder.section_18_cell_0_0",
        "commercial.dashboardBuilder.section_18_cell_0_1"
      ],
      [
        "commercial.dashboardBuilder.section_18_cell_1_0",
        "commercial.dashboardBuilder.section_18_cell_1_1"
      ],
      [
        "commercial.dashboardBuilder.section_18_cell_2_0",
        "commercial.dashboardBuilder.section_18_cell_2_1"
      ],
      [
        "commercial.dashboardBuilder.section_18_cell_3_0",
        "commercial.dashboardBuilder.section_18_cell_3_1"
      ],
      [
        "commercial.dashboardBuilder.section_18_cell_4_0",
        "commercial.dashboardBuilder.section_18_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_20_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    tenant-admin[\"Tenant Admin (IT)\"]\n    toggle([\"Enable/Disable Overrides\"])\n    whitelist{{\"Select Allowed Settings\"}}\n    user([\"Regular Admin Experience\"])\n    tenant-admin --> toggle\n    toggle -->|\"If enabled\"| whitelist\n    whitelist -->|\"Path-filtered\"| user",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_23_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dashboardBuilder.section_24_hdr_0",
      "commercial.dashboardBuilder.section_24_hdr_1"
    ],
    "rows": [
      [
        "commercial.dashboardBuilder.section_24_cell_0_0",
        "commercial.dashboardBuilder.section_24_cell_0_1"
      ],
      [
        "commercial.dashboardBuilder.section_24_cell_1_0",
        "commercial.dashboardBuilder.section_24_cell_1_1"
      ],
      [
        "commercial.dashboardBuilder.section_24_cell_2_0",
        "commercial.dashboardBuilder.section_24_cell_2_1"
      ],
      [
        "commercial.dashboardBuilder.section_24_cell_3_0",
        "commercial.dashboardBuilder.section_24_cell_3_1"
      ],
      [
        "commercial.dashboardBuilder.section_24_cell_4_0",
        "commercial.dashboardBuilder.section_24_cell_4_1"
      ],
      [
        "commercial.dashboardBuilder.section_24_cell_5_0",
        "commercial.dashboardBuilder.section_24_cell_5_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dashboardBuilder.section_26_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dashboardBuilder.section_27_hdr_0",
      "commercial.dashboardBuilder.section_27_hdr_1"
    ],
    "rows": [
      [
        "commercial.dashboardBuilder.section_27_cell_0_0",
        "commercial.dashboardBuilder.section_27_cell_0_1"
      ],
      [
        "commercial.dashboardBuilder.section_27_cell_1_0",
        "commercial.dashboardBuilder.section_27_cell_1_1"
      ],
      [
        "commercial.dashboardBuilder.section_27_cell_2_0",
        "commercial.dashboardBuilder.section_27_cell_2_1"
      ],
      [
        "commercial.dashboardBuilder.section_27_cell_3_0",
        "commercial.dashboardBuilder.section_27_cell_3_1"
      ],
      [
        "commercial.dashboardBuilder.section_27_cell_4_0",
        "commercial.dashboardBuilder.section_27_cell_4_1"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.dashboardBuilder.section_28_title",
    "contentKey": "commercial.dashboardBuilder.section_28_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dashboardBuilder.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.dashboardBuilder.section_30_item_0",
      "commercial.dashboardBuilder.section_30_item_1",
      "commercial.dashboardBuilder.section_30_item_2"
    ]
  }
],
  relatedSlugs: [
  "commercial/login-customizer",
  "commercial/theme-marketplace",
  "commercial/page-builder"
],
  lastUpdated: "2026-06-09",
});
