import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/overview",
  titleKey: "architecture.overview.title",
  category: "architecture",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.overview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.overview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.overview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    presentation([\"Presentation Layer — Next.js Views + ViewModels\"])\n    application([\"Application Layer — CQRS Commands/Queries + Behaviors\"])\n    domain{{\"Domain Layer — Entities + Interfaces + Specifications\"}}\n    infrastructure[\"Infrastructure Layer — EF Core + Repos + External Services\"]\n    presentation -->|\"Depends on\"| application\n    application -->|\"Depends on\"| domain\n    infrastructure -->|\"Implements\"| domain",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "architecture.overview.section_4_hdr_0",
      "architecture.overview.section_4_hdr_1",
      "architecture.overview.section_4_hdr_2",
      "architecture.overview.section_4_hdr_3"
    ],
    "rows": [
      [
        "architecture.overview.section_4_cell_0_0",
        "architecture.overview.section_4_cell_0_1",
        "architecture.overview.section_4_cell_0_2",
        "architecture.overview.section_4_cell_0_3"
      ],
      [
        "architecture.overview.section_4_cell_1_0",
        "architecture.overview.section_4_cell_1_1",
        "architecture.overview.section_4_cell_1_2",
        "architecture.overview.section_4_cell_1_3"
      ],
      [
        "architecture.overview.section_4_cell_2_0",
        "architecture.overview.section_4_cell_2_1",
        "architecture.overview.section_4_cell_2_2",
        "architecture.overview.section_4_cell_2_3"
      ],
      [
        "architecture.overview.section_4_cell_3_0",
        "architecture.overview.section_4_cell_3_1",
        "architecture.overview.section_4_cell_3_2",
        "architecture.overview.section_4_cell_3_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.overview.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.overview.section_6_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    request[\"HTTP Request\"]\n    middleware([\"Middleware Stack\"])\n    controller([\"Controller\"])\n    astraflow([\"AstraFlow mediator Send\"])\n    validation{{\"Validation\"}}\n    audit([\"Audit Behavior\"])\n    handler([\"CQRS Handler\"])\n    response([\"Result<T>\"])\n    request --> middleware\n    middleware --> controller\n    controller --> astraflow\n    astraflow --> validation\n    validation --> audit\n    audit --> handler\n    handler --> response",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.overview.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.overview.section_9_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    page[\"page.tsx (Connector)\"]\n    view([\"View (Pure UI)\"])\n    vm([\"ViewModel (Logic)\"])\n    repo{{\"Repository\"}}\n    api[\"API Service\"]\n    page -->|\"renders\"| view\n    view -->|\"uses hook\"| vm\n    vm -->|\"calls\"| repo\n    repo -->|\"fetches\"| api",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.overview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.overview.section_12_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.overview.section_13_hdr_0",
      "architecture.overview.section_13_hdr_1"
    ],
    "rows": [
      [
        "architecture.overview.section_13_cell_0_0",
        "architecture.overview.section_13_cell_0_1"
      ],
      [
        "architecture.overview.section_13_cell_1_0",
        "architecture.overview.section_13_cell_1_1"
      ],
      [
        "architecture.overview.section_13_cell_2_0",
        "architecture.overview.section_13_cell_2_1"
      ],
      [
        "architecture.overview.section_13_cell_3_0",
        "architecture.overview.section_13_cell_3_1"
      ],
      [
        "architecture.overview.section_13_cell_4_0",
        "architecture.overview.section_13_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.overview.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "table",
    "headers": [
      "architecture.overview.section_15_hdr_0",
      "architecture.overview.section_15_hdr_1",
      "architecture.overview.section_15_hdr_2"
    ],
    "rows": [
      [
        "architecture.overview.section_15_cell_0_0",
        "architecture.overview.section_15_cell_0_1",
        "architecture.overview.section_15_cell_0_2"
      ],
      [
        "architecture.overview.section_15_cell_1_0",
        "architecture.overview.section_15_cell_1_1",
        "architecture.overview.section_15_cell_1_2"
      ],
      [
        "architecture.overview.section_15_cell_2_0",
        "architecture.overview.section_15_cell_2_1",
        "architecture.overview.section_15_cell_2_2"
      ],
      [
        "architecture.overview.section_15_cell_3_0",
        "architecture.overview.section_15_cell_3_1",
        "architecture.overview.section_15_cell_3_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "architecture.overview.section_16_title",
    "contentKey": "architecture.overview.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.overview.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.overview.section_18_item_0",
      "architecture.overview.section_18_item_1",
      "architecture.overview.section_18_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/backend",
  "architecture/frontend",
  "architecture/modules"
],
  lastUpdated: "2026-06-09",
});
