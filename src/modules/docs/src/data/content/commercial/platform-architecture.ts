import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/platform-architecture",
  titleKey: "commercial.platformArchitecture.title",
  category: "commercial-platform",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.platformArchitecture.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.platformArchitecture.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.platformArchitecture.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.platformArchitecture.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.platformArchitecture.section_4_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "┌─────────────────────────────────────────────────────────────┐\n│                     Presentation Layer                       │\n│  Next.js 16 App Router · React · TanStack Query · Zustand  │\n├─────────────────────────────────────────────────────────────┤\n│                     API Gateway Layer                        │\n│  18 REST Controllers · 400+ Endpoints · Swagger/OpenAPI    │\n├─────────────────────────────────────────────────────────────┤\n│                     Application Layer                        │\n│  AstraFlow mediator commands/queries · FluentValidation · explicit DTO mapping  │\n├─────────────────────────────────────────────────────────────┤\n│                       Domain Layer                          │\n│  Entities · Value Objects · Domain Events · Specifications  │\n├─────────────────────────────────────────────────────────────┤\n│                    Infrastructure Layer                      │\n│  EF Core · Redis · SignalR · Hangfire · Blob Storage       │\n├─────────────────────────────────────────────────────────────┤\n│                      Database Layer                         │\n│  SQL Server │ PostgreSQL │ Oracle │ SQLite                  │\n└─────────────────────────────────────────────────────────────┘",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.platformArchitecture.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.platformArchitecture.section_7_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    pres([\"Presentation\"])\n    app([\"Application\"])\n    domain([\"Domain\"])\n    infra{{\"Infrastructure\"}}\n    pres -->|\"depends on\"| app\n    app -->|\"depends on\"| domain\n    infra -->|\"implements\"| domain",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.platformArchitecture.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.platformArchitecture.section_10_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.platformArchitecture.section_11_hdr_0",
      "commercial.platformArchitecture.section_11_hdr_1",
      "commercial.platformArchitecture.section_11_hdr_2"
    ],
    "rows": [
      [
        "commercial.platformArchitecture.section_11_cell_0_0",
        "commercial.platformArchitecture.section_11_cell_0_1",
        "commercial.platformArchitecture.section_11_cell_0_2"
      ],
      [
        "commercial.platformArchitecture.section_11_cell_1_0",
        "commercial.platformArchitecture.section_11_cell_1_1",
        "commercial.platformArchitecture.section_11_cell_1_2"
      ],
      [
        "commercial.platformArchitecture.section_11_cell_2_0",
        "commercial.platformArchitecture.section_11_cell_2_1",
        "commercial.platformArchitecture.section_11_cell_2_2"
      ],
      [
        "commercial.platformArchitecture.section_11_cell_3_0",
        "commercial.platformArchitecture.section_11_cell_3_1",
        "commercial.platformArchitecture.section_11_cell_3_2"
      ],
      [
        "commercial.platformArchitecture.section_11_cell_4_0",
        "commercial.platformArchitecture.section_11_cell_4_1",
        "commercial.platformArchitecture.section_11_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.platformArchitecture.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.platformArchitecture.section_13_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    req[\"HTTP Request\"]\n    val([\"Validation\"])\n    cache([\"Cache Check\"])\n    audit{{\"Audit Logging\"}}\n    auth[\"Authorization\"]\n    handler([\"Handler Logic\"])\n    resp[\"Response\"]\n    req --> val\n    val --> cache\n    cache --> audit\n    audit --> auth\n    auth --> handler\n    handler --> resp",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.platformArchitecture.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "table",
    "headers": [
      "commercial.platformArchitecture.section_16_hdr_0",
      "commercial.platformArchitecture.section_16_hdr_1",
      "commercial.platformArchitecture.section_16_hdr_2"
    ],
    "rows": [
      [
        "commercial.platformArchitecture.section_16_cell_0_0",
        "commercial.platformArchitecture.section_16_cell_0_1",
        "commercial.platformArchitecture.section_16_cell_0_2"
      ],
      [
        "commercial.platformArchitecture.section_16_cell_1_0",
        "commercial.platformArchitecture.section_16_cell_1_1",
        "commercial.platformArchitecture.section_16_cell_1_2"
      ],
      [
        "commercial.platformArchitecture.section_16_cell_2_0",
        "commercial.platformArchitecture.section_16_cell_2_1",
        "commercial.platformArchitecture.section_16_cell_2_2"
      ],
      [
        "commercial.platformArchitecture.section_16_cell_3_0",
        "commercial.platformArchitecture.section_16_cell_3_1",
        "commercial.platformArchitecture.section_16_cell_3_2"
      ],
      [
        "commercial.platformArchitecture.section_16_cell_4_0",
        "commercial.platformArchitecture.section_16_cell_4_1",
        "commercial.platformArchitecture.section_16_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.platformArchitecture.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.platformArchitecture.section_18_item_0",
      "commercial.platformArchitecture.section_18_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/technology-stack",
  "commercial/deployment-modes"
],
  lastUpdated: "2026-06-09",
});
