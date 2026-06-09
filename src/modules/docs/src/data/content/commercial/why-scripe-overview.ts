import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/why-scripe-overview",
  titleKey: "commercial.whyScripeOverview.title",
  category: "commercial-why-scripe",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.whyScripeOverview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_3_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.whyScripeOverview.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_5_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.whyScripeOverview.section_6_hdr_0",
      "commercial.whyScripeOverview.section_6_hdr_1",
      "commercial.whyScripeOverview.section_6_hdr_2"
    ],
    "rows": [
      [
        "commercial.whyScripeOverview.section_6_cell_0_0",
        "commercial.whyScripeOverview.section_6_cell_0_1",
        "commercial.whyScripeOverview.section_6_cell_0_2"
      ],
      [
        "commercial.whyScripeOverview.section_6_cell_1_0",
        "commercial.whyScripeOverview.section_6_cell_1_1",
        "commercial.whyScripeOverview.section_6_cell_1_2"
      ],
      [
        "commercial.whyScripeOverview.section_6_cell_2_0",
        "commercial.whyScripeOverview.section_6_cell_2_1",
        "commercial.whyScripeOverview.section_6_cell_2_2"
      ],
      [
        "commercial.whyScripeOverview.section_6_cell_3_0",
        "commercial.whyScripeOverview.section_6_cell_3_1",
        "commercial.whyScripeOverview.section_6_cell_3_2"
      ],
      [
        "commercial.whyScripeOverview.section_6_cell_4_0",
        "commercial.whyScripeOverview.section_6_cell_4_1",
        "commercial.whyScripeOverview.section_6_cell_4_2"
      ],
      [
        "commercial.whyScripeOverview.section_6_cell_5_0",
        "commercial.whyScripeOverview.section_6_cell_5_1",
        "commercial.whyScripeOverview.section_6_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.whyScripeOverview.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_9_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "┌──────────────────────────────────────────────────────────────┐\n│                    SCRIPE Platform                            │\n│                                                              │\n│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │\n│  │ Identity │  │    HR    │  │ Inventory│  │  Finance │    │\n│  │  Module  │  │  Module  │  │  Module  │  │  Module  │    │\n│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │\n│       └──────────────┴──────────────┴──────────────┘         │\n│                           │                                   │\n│            ┌──────────────┴──────────────┐                   │\n│            │      Shared Core Layer      │                   │\n│            │  Security · Audit · Events  │                   │\n│            │  Caching · Saga · Storage   │                   │\n│            └──────────────┬──────────────┘                   │\n│                           │                                   │\n│        ┌──────────────────┼──────────────────┐               │\n│        ▼                  ▼                  ▼               │\n│    Monolith           Gateway          Microservice          │\n│   (mvp/startup)    (growing team)    (enterprise scale)      │\n└──────────────────────────────────────────────────────────────┘",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.whyScripeOverview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "table",
    "headers": [
      "commercial.whyScripeOverview.section_12_hdr_0",
      "commercial.whyScripeOverview.section_12_hdr_1"
    ],
    "rows": [
      [
        "commercial.whyScripeOverview.section_12_cell_0_0",
        "commercial.whyScripeOverview.section_12_cell_0_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_1_0",
        "commercial.whyScripeOverview.section_12_cell_1_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_2_0",
        "commercial.whyScripeOverview.section_12_cell_2_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_3_0",
        "commercial.whyScripeOverview.section_12_cell_3_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_4_0",
        "commercial.whyScripeOverview.section_12_cell_4_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_5_0",
        "commercial.whyScripeOverview.section_12_cell_5_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_6_0",
        "commercial.whyScripeOverview.section_12_cell_6_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_7_0",
        "commercial.whyScripeOverview.section_12_cell_7_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_8_0",
        "commercial.whyScripeOverview.section_12_cell_8_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_9_0",
        "commercial.whyScripeOverview.section_12_cell_9_1"
      ],
      [
        "commercial.whyScripeOverview.section_12_cell_10_0",
        "commercial.whyScripeOverview.section_12_cell_10_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.whyScripeOverview.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.whyScripeOverview.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.whyScripeOverview.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_17_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.whyScripeOverview.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_19_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.whyScripeOverview.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.whyScripeOverview.section_21_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.whyScripeOverview.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "table",
    "headers": [
      "commercial.whyScripeOverview.section_23_hdr_0",
      "commercial.whyScripeOverview.section_23_hdr_1",
      "commercial.whyScripeOverview.section_23_hdr_2"
    ],
    "rows": [
      [
        "commercial.whyScripeOverview.section_23_cell_0_0",
        "commercial.whyScripeOverview.section_23_cell_0_1",
        "commercial.whyScripeOverview.section_23_cell_0_2"
      ],
      [
        "commercial.whyScripeOverview.section_23_cell_1_0",
        "commercial.whyScripeOverview.section_23_cell_1_1",
        "commercial.whyScripeOverview.section_23_cell_1_2"
      ],
      [
        "commercial.whyScripeOverview.section_23_cell_2_0",
        "commercial.whyScripeOverview.section_23_cell_2_1",
        "commercial.whyScripeOverview.section_23_cell_2_2"
      ],
      [
        "commercial.whyScripeOverview.section_23_cell_3_0",
        "commercial.whyScripeOverview.section_23_cell_3_1",
        "commercial.whyScripeOverview.section_23_cell_3_2"
      ],
      [
        "commercial.whyScripeOverview.section_23_cell_4_0",
        "commercial.whyScripeOverview.section_23_cell_4_1",
        "commercial.whyScripeOverview.section_23_cell_4_2"
      ],
      [
        "commercial.whyScripeOverview.section_23_cell_5_0",
        "commercial.whyScripeOverview.section_23_cell_5_1",
        "commercial.whyScripeOverview.section_23_cell_5_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.whyScripeOverview.section_24_title",
    "contentKey": "commercial.whyScripeOverview.section_24_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.whyScripeOverview.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.whyScripeOverview.section_26_item_0",
      "commercial.whyScripeOverview.section_26_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/competitive-advantages",
  "commercial/success-metrics"
],
  lastUpdated: "2026-06-09",
});
