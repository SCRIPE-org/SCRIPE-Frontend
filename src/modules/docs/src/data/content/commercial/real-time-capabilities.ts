import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/real-time-capabilities",
  titleKey: "commercial.realTimeCapabilities.title",
  category: "commercial-enterprise",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.realTimeCapabilities.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_4_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "┌──────────────────────────────────────────────────────┐\n│                  SignalR Hub Layer                    │\n│                                                      │\n│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │\n│  │Notification│ │   Audit    │ │  Dashboard │      │\n│  │    Hub     │ │    Hub     │ │    Hub     │      │\n│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘      │\n│        │              │              │               │\n│        └──────────────┼──────────────┘               │\n│                       │                              │\n│  ┌────────────────────▼──────────────────────┐      │\n│  │       Tenant-Scoped Group Management      │      │\n│  │  Users auto-join tenant group on connect  │      │\n│  └───────────────────────────────────────────┘      │\n└──────────────────────────────────────────────────────┘\n           │              │              │\n     ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐\n     │  Browser  │ │  Mobile   │ │  Desktop  │\n     │  Client   │ │  Client   │ │  Client   │\n     └───────────┘ └───────────┘ └───────────┘",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.realTimeCapabilities.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_7_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.realTimeCapabilities.section_8_hdr_0",
      "commercial.realTimeCapabilities.section_8_hdr_1"
    ],
    "rows": [
      [
        "commercial.realTimeCapabilities.section_8_cell_0_0",
        "commercial.realTimeCapabilities.section_8_cell_0_1"
      ],
      [
        "commercial.realTimeCapabilities.section_8_cell_1_0",
        "commercial.realTimeCapabilities.section_8_cell_1_1"
      ],
      [
        "commercial.realTimeCapabilities.section_8_cell_2_0",
        "commercial.realTimeCapabilities.section_8_cell_2_1"
      ],
      [
        "commercial.realTimeCapabilities.section_8_cell_3_0",
        "commercial.realTimeCapabilities.section_8_cell_3_1"
      ],
      [
        "commercial.realTimeCapabilities.section_8_cell_4_0",
        "commercial.realTimeCapabilities.section_8_cell_4_1"
      ],
      [
        "commercial.realTimeCapabilities.section_8_cell_5_0",
        "commercial.realTimeCapabilities.section_8_cell_5_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.realTimeCapabilities.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.realTimeCapabilities.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.realTimeCapabilities.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.realTimeCapabilities.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_16_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.realTimeCapabilities.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.realTimeCapabilities.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.realTimeCapabilities.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "table",
    "headers": [
      "commercial.realTimeCapabilities.section_20_hdr_0",
      "commercial.realTimeCapabilities.section_20_hdr_1",
      "commercial.realTimeCapabilities.section_20_hdr_2",
      "commercial.realTimeCapabilities.section_20_hdr_3"
    ],
    "rows": [
      [
        "commercial.realTimeCapabilities.section_20_cell_0_0",
        "commercial.realTimeCapabilities.section_20_cell_0_1",
        "commercial.realTimeCapabilities.section_20_cell_0_2",
        "commercial.realTimeCapabilities.section_20_cell_0_3"
      ],
      [
        "commercial.realTimeCapabilities.section_20_cell_1_0",
        "commercial.realTimeCapabilities.section_20_cell_1_1",
        "commercial.realTimeCapabilities.section_20_cell_1_2",
        "commercial.realTimeCapabilities.section_20_cell_1_3"
      ],
      [
        "commercial.realTimeCapabilities.section_20_cell_2_0",
        "commercial.realTimeCapabilities.section_20_cell_2_1",
        "commercial.realTimeCapabilities.section_20_cell_2_2",
        "commercial.realTimeCapabilities.section_20_cell_2_3"
      ],
      [
        "commercial.realTimeCapabilities.section_20_cell_3_0",
        "commercial.realTimeCapabilities.section_20_cell_3_1",
        "commercial.realTimeCapabilities.section_20_cell_3_2",
        "commercial.realTimeCapabilities.section_20_cell_3_3"
      ],
      [
        "commercial.realTimeCapabilities.section_20_cell_4_0",
        "commercial.realTimeCapabilities.section_20_cell_4_1",
        "commercial.realTimeCapabilities.section_20_cell_4_2",
        "commercial.realTimeCapabilities.section_20_cell_4_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.realTimeCapabilities.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.realTimeCapabilities.section_22_item_0",
      "commercial.realTimeCapabilities.section_22_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/audit-compliance",
  "commercial/localization-i18n"
],
  lastUpdated: "2026-06-09",
});
