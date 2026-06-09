import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "get-started/overview",
  titleKey: "getStarted.overview.title",
  category: "get-started",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_1_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.overview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_3_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.overview.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_5_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.overview.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.overview.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.overview.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.overview.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.overview.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.overview.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_17_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    client([\"Client (Next.js 16)\"])\n    gateway([\"API Gateway (YARP)\"])\n    host[\"Host Layer — Program.cs\"]\n    middleware{{\"29 Middleware Pipeline\"}}\n    controllers[\"18 REST Controllers\"]\n    cqrs([\"AstraFlow mediator CQRS + 6 Behaviors\"])\n    domain([\"Domain Layer — 15 Entities\"])\n    infra[\"Infrastructure — Multi-DB + Cache\"]\n    client --> gateway\n    gateway --> host\n    host --> middleware\n    middleware --> controllers\n    controllers --> cqrs\n    cqrs --> domain\n    domain --> infra",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.overview.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_20_content"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.overview.section_21_hdr_0",
      "getStarted.overview.section_21_hdr_1",
      "getStarted.overview.section_21_hdr_2",
      "getStarted.overview.section_21_hdr_3"
    ],
    "rows": [
      [
        "getStarted.overview.section_21_cell_0_0",
        "getStarted.overview.section_21_cell_0_1",
        "getStarted.overview.section_21_cell_0_2",
        "getStarted.overview.section_21_cell_0_3"
      ],
      [
        "getStarted.overview.section_21_cell_1_0",
        "getStarted.overview.section_21_cell_1_1",
        "getStarted.overview.section_21_cell_1_2",
        "getStarted.overview.section_21_cell_1_3"
      ],
      [
        "getStarted.overview.section_21_cell_2_0",
        "getStarted.overview.section_21_cell_2_1",
        "getStarted.overview.section_21_cell_2_2",
        "getStarted.overview.section_21_cell_2_3"
      ],
      [
        "getStarted.overview.section_21_cell_3_0",
        "getStarted.overview.section_21_cell_3_1",
        "getStarted.overview.section_21_cell_3_2",
        "getStarted.overview.section_21_cell_3_3"
      ],
      [
        "getStarted.overview.section_21_cell_4_0",
        "getStarted.overview.section_21_cell_4_1",
        "getStarted.overview.section_21_cell_4_2",
        "getStarted.overview.section_21_cell_4_3"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_22_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "var moduleName = Environment.GetEnvironmentVariable(\"MODULE_NAME\") ?? \"\";\nvar isMonolith = string.IsNullOrEmpty(moduleName);\nvar isGateway = moduleName.Equals(\"Gateway\", StringComparison.OrdinalIgnoreCase);\n\n// Gate each module behind a simple check:\nif (isMonolith || moduleName.Equals(\"Identity\", StringComparison.OrdinalIgnoreCase))\n{\n    handlerAssemblies.Add(typeof(Identity.Application.DependencyInjection));\n    builder.Services.AddIdentityModule(builder.Configuration);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.overview.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.overview.section_25_hdr_0",
      "getStarted.overview.section_25_hdr_1",
      "getStarted.overview.section_25_hdr_2",
      "getStarted.overview.section_25_hdr_3"
    ],
    "rows": [
      [
        "getStarted.overview.section_25_cell_0_0",
        "getStarted.overview.section_25_cell_0_1",
        "getStarted.overview.section_25_cell_0_2",
        "getStarted.overview.section_25_cell_0_3"
      ],
      [
        "getStarted.overview.section_25_cell_1_0",
        "getStarted.overview.section_25_cell_1_1",
        "getStarted.overview.section_25_cell_1_2",
        "getStarted.overview.section_25_cell_1_3"
      ],
      [
        "getStarted.overview.section_25_cell_2_0",
        "getStarted.overview.section_25_cell_2_1",
        "getStarted.overview.section_25_cell_2_2",
        "getStarted.overview.section_25_cell_2_3"
      ],
      [
        "getStarted.overview.section_25_cell_3_0",
        "getStarted.overview.section_25_cell_3_1",
        "getStarted.overview.section_25_cell_3_2",
        "getStarted.overview.section_25_cell_3_3"
      ],
      [
        "getStarted.overview.section_25_cell_4_0",
        "getStarted.overview.section_25_cell_4_1",
        "getStarted.overview.section_25_cell_4_2",
        "getStarted.overview.section_25_cell_4_3"
      ],
      [
        "getStarted.overview.section_25_cell_5_0",
        "getStarted.overview.section_25_cell_5_1",
        "getStarted.overview.section_25_cell_5_2",
        "getStarted.overview.section_25_cell_5_3"
      ],
      [
        "getStarted.overview.section_25_cell_6_0",
        "getStarted.overview.section_25_cell_6_1",
        "getStarted.overview.section_25_cell_6_2",
        "getStarted.overview.section_25_cell_6_3"
      ],
      [
        "getStarted.overview.section_25_cell_7_0",
        "getStarted.overview.section_25_cell_7_1",
        "getStarted.overview.section_25_cell_7_2",
        "getStarted.overview.section_25_cell_7_3"
      ],
      [
        "getStarted.overview.section_25_cell_8_0",
        "getStarted.overview.section_25_cell_8_1",
        "getStarted.overview.section_25_cell_8_2",
        "getStarted.overview.section_25_cell_8_3"
      ],
      [
        "getStarted.overview.section_25_cell_9_0",
        "getStarted.overview.section_25_cell_9_1",
        "getStarted.overview.section_25_cell_9_2",
        "getStarted.overview.section_25_cell_9_3"
      ],
      [
        "getStarted.overview.section_25_cell_10_0",
        "getStarted.overview.section_25_cell_10_1",
        "getStarted.overview.section_25_cell_10_2",
        "getStarted.overview.section_25_cell_10_3"
      ],
      [
        "getStarted.overview.section_25_cell_11_0",
        "getStarted.overview.section_25_cell_11_1",
        "getStarted.overview.section_25_cell_11_2",
        "getStarted.overview.section_25_cell_11_3"
      ],
      [
        "getStarted.overview.section_25_cell_12_0",
        "getStarted.overview.section_25_cell_12_1",
        "getStarted.overview.section_25_cell_12_2",
        "getStarted.overview.section_25_cell_12_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.overview.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_27_content"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.overview.section_28_hdr_0",
      "getStarted.overview.section_28_hdr_1",
      "getStarted.overview.section_28_hdr_2",
      "getStarted.overview.section_28_hdr_3"
    ],
    "rows": [
      [
        "getStarted.overview.section_28_cell_0_0",
        "getStarted.overview.section_28_cell_0_1",
        "getStarted.overview.section_28_cell_0_2",
        "getStarted.overview.section_28_cell_0_3"
      ],
      [
        "getStarted.overview.section_28_cell_1_0",
        "getStarted.overview.section_28_cell_1_1",
        "getStarted.overview.section_28_cell_1_2",
        "getStarted.overview.section_28_cell_1_3"
      ],
      [
        "getStarted.overview.section_28_cell_2_0",
        "getStarted.overview.section_28_cell_2_1",
        "getStarted.overview.section_28_cell_2_2",
        "getStarted.overview.section_28_cell_2_3"
      ],
      [
        "getStarted.overview.section_28_cell_3_0",
        "getStarted.overview.section_28_cell_3_1",
        "getStarted.overview.section_28_cell_3_2",
        "getStarted.overview.section_28_cell_3_3"
      ],
      [
        "getStarted.overview.section_28_cell_4_0",
        "getStarted.overview.section_28_cell_4_1",
        "getStarted.overview.section_28_cell_4_2",
        "getStarted.overview.section_28_cell_4_3"
      ],
      [
        "getStarted.overview.section_28_cell_5_0",
        "getStarted.overview.section_28_cell_5_1",
        "getStarted.overview.section_28_cell_5_2",
        "getStarted.overview.section_28_cell_5_3"
      ],
      [
        "getStarted.overview.section_28_cell_6_0",
        "getStarted.overview.section_28_cell_6_1",
        "getStarted.overview.section_28_cell_6_2",
        "getStarted.overview.section_28_cell_6_3"
      ],
      [
        "getStarted.overview.section_28_cell_7_0",
        "getStarted.overview.section_28_cell_7_1",
        "getStarted.overview.section_28_cell_7_2",
        "getStarted.overview.section_28_cell_7_3"
      ],
      [
        "getStarted.overview.section_28_cell_8_0",
        "getStarted.overview.section_28_cell_8_1",
        "getStarted.overview.section_28_cell_8_2",
        "getStarted.overview.section_28_cell_8_3"
      ],
      [
        "getStarted.overview.section_28_cell_9_0",
        "getStarted.overview.section_28_cell_9_1",
        "getStarted.overview.section_28_cell_9_2",
        "getStarted.overview.section_28_cell_9_3"
      ],
      [
        "getStarted.overview.section_28_cell_10_0",
        "getStarted.overview.section_28_cell_10_1",
        "getStarted.overview.section_28_cell_10_2",
        "getStarted.overview.section_28_cell_10_3"
      ],
      [
        "getStarted.overview.section_28_cell_11_0",
        "getStarted.overview.section_28_cell_11_1",
        "getStarted.overview.section_28_cell_11_2",
        "getStarted.overview.section_28_cell_11_3"
      ],
      [
        "getStarted.overview.section_28_cell_12_0",
        "getStarted.overview.section_28_cell_12_1",
        "getStarted.overview.section_28_cell_12_2",
        "getStarted.overview.section_28_cell_12_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "getStarted.overview.section_29_title",
    "contentKey": "getStarted.overview.section_29_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.overview.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.overview.section_31_hdr_0",
      "getStarted.overview.section_31_hdr_1",
      "getStarted.overview.section_31_hdr_2"
    ],
    "rows": [
      [
        "getStarted.overview.section_31_cell_0_0",
        "getStarted.overview.section_31_cell_0_1",
        "getStarted.overview.section_31_cell_0_2"
      ],
      [
        "getStarted.overview.section_31_cell_1_0",
        "getStarted.overview.section_31_cell_1_1",
        "getStarted.overview.section_31_cell_1_2"
      ],
      [
        "getStarted.overview.section_31_cell_2_0",
        "getStarted.overview.section_31_cell_2_1",
        "getStarted.overview.section_31_cell_2_2"
      ],
      [
        "getStarted.overview.section_31_cell_3_0",
        "getStarted.overview.section_31_cell_3_1",
        "getStarted.overview.section_31_cell_3_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.overview.section_32_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "Priority (highest wins):\n  1. UserSecrets          (Development only)\n  2. Environment Variables (prefix: SCRIPE_)\n  3. appsettings.Secrets.json (optional)\n  4. appsettings.json         (base)",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "getStarted.overview.section_34_title",
    "contentKey": "getStarted.overview.section_34_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.overview.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "getStarted.overview.section_36_item_0",
      "getStarted.overview.section_36_item_1",
      "getStarted.overview.section_36_item_2"
    ]
  }
],
  relatedSlugs: [
  "get-started/prerequisites",
  "get-started/quick-start",
  "architecture/overview"
],
  lastUpdated: "2026-06-09",
});
