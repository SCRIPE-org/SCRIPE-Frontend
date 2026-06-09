import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/deployment-modes",
  titleKey: "commercial.deploymentModes.title",
  category: "commercial-platform",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.deploymentModes.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.deploymentModes.section_3_hdr_0",
      "commercial.deploymentModes.section_3_hdr_1",
      "commercial.deploymentModes.section_3_hdr_2",
      "commercial.deploymentModes.section_3_hdr_3"
    ],
    "rows": [
      [
        "commercial.deploymentModes.section_3_cell_0_0",
        "commercial.deploymentModes.section_3_cell_0_1",
        "commercial.deploymentModes.section_3_cell_0_2",
        "commercial.deploymentModes.section_3_cell_0_3"
      ],
      [
        "commercial.deploymentModes.section_3_cell_1_0",
        "commercial.deploymentModes.section_3_cell_1_1",
        "commercial.deploymentModes.section_3_cell_1_2",
        "commercial.deploymentModes.section_3_cell_1_3"
      ],
      [
        "commercial.deploymentModes.section_3_cell_2_0",
        "commercial.deploymentModes.section_3_cell_2_1",
        "commercial.deploymentModes.section_3_cell_2_2",
        "commercial.deploymentModes.section_3_cell_2_3"
      ],
      [
        "commercial.deploymentModes.section_3_cell_3_0",
        "commercial.deploymentModes.section_3_cell_3_1",
        "commercial.deploymentModes.section_3_cell_3_2",
        "commercial.deploymentModes.section_3_cell_3_3"
      ],
      [
        "commercial.deploymentModes.section_3_cell_4_0",
        "commercial.deploymentModes.section_3_cell_4_1",
        "commercial.deploymentModes.section_3_cell_4_2",
        "commercial.deploymentModes.section_3_cell_4_3"
      ],
      [
        "commercial.deploymentModes.section_3_cell_5_0",
        "commercial.deploymentModes.section_3_cell_5_1",
        "commercial.deploymentModes.section_3_cell_5_2",
        "commercial.deploymentModes.section_3_cell_5_3"
      ],
      [
        "commercial.deploymentModes.section_3_cell_6_0",
        "commercial.deploymentModes.section_3_cell_6_1",
        "commercial.deploymentModes.section_3_cell_6_2",
        "commercial.deploymentModes.section_3_cell_6_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.deploymentModes.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_6_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "┌──────────────────────────────────────┐\n│          Single Process              │\n│                                      │\n│  ┌──────────┐  ┌──────────┐         │\n│  │ Identity │  │    HR    │  ...    │\n│  └──────────┘  └──────────┘         │\n│                                      │\n│  ┌──────────────────────────────┐   │\n│  │        Shared Core           │   │\n│  │  Auth · Cache · Events      │   │\n│  └──────────────────────────────┘   │\n│                                      │\n│  ┌──────────────────────────────┐   │\n│  │    Single Database Server    │   │\n│  └──────────────────────────────┘   │\n└──────────────────────────────────────┘",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.deploymentModes.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_10_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "┌──────────────────────────────────────────────┐\n│              API Gateway (YARP)               │\n│          Route /api/identity → svc1           │\n│          Route /api/hr       → svc2           │\n└────────┬──────────┬──────────┬───────────────┘\n         │          │          │\n    ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐\n    │Identity │ │   HR   │ │Inventory│\n    │ Service │ │Service │ │ Service │\n    └────┬────┘ └───┬────┘ └──┬──────┘\n         │          │          │\n    ┌────▼──────────▼──────────▼──────┐\n    │      Shared Database Server     │\n    └─────────────────────────────────┘",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.deploymentModes.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_13_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_14_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "┌──────────────────────────────────────────────────────┐\n│              Load Balancer / API Gateway              │\n└────────┬──────────┬──────────┬──────────┬───────────┘\n         │          │          │          │\n    ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐ ┌▼────────┐\n    │Identity │ │   HR   │ │Inventory│ │ Finance │\n    │ Service │ │Service │ │ Service │ │ Service │\n    └────┬────┘ └───┬────┘ └──┬──────┘ └┬────────┘\n         │          │          │          │\n    ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐ ┌▼────────┐\n    │  Own DB │ │ Own DB │ │ Own DB  │ │ Own DB  │\n    └─────────┘ └────────┘ └─────────┘ └─────────┘",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.deploymentModes.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_17_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.deploymentModes.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_19_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.deploymentModes.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_21_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.deploymentModes.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_23_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.deploymentModes.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.deploymentModes.section_25_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "commercial.deploymentModes.section_26_title",
    "contentKey": "commercial.deploymentModes.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.deploymentModes.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.deploymentModes.section_28_item_0",
      "commercial.deploymentModes.section_28_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/platform-architecture",
  "commercial/system-requirements"
],
  lastUpdated: "2026-06-09",
});
