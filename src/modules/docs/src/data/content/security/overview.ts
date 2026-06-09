import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "security/overview",
  titleKey: "security.overview.title",
  category: "security",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.overview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    l1[\"Layer 1: Network (CORS + HSTS + Rate Limiting)\"]\n    l2{{\"Layer 2: Authentication (JWT + 2FA + Lockout)\"}}\n    l3([\"Layer 3: Authorization (RBAC + Permissions)\"])\n    l4([\"Layer 4: Data (Tenant Isolation + Encryption)\"])\n    l5([\"Layer 5: Audit (Full Event Logging + Real-time)\"])\n    l1 --> l2\n    l2 --> l3\n    l3 --> l4\n    l4 --> l5",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.overview.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.overview.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.overview.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.overview.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.overview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.overview.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.overview.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.overview.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "security.overview.section_18_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "security.overview.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Development: Open CORS for local testing\npolicy.WithOrigins(\"http://localhost:3000\", \"https://localhost:3000\")\n      .AllowAnyMethod()\n      .AllowAnyHeader()\n      .AllowCredentials();",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "security.overview.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Production: Strict CORS with specific origins\nvar allowedOrigins = configuration\n    .GetSection(\"CorsSettings:AllowedOrigins\")\n    .Get<string[]>();\n\npolicy.WithOrigins(allowedOrigins)\n      .WithMethods(\"GET\", \"POST\", \"PUT\", \"DELETE\")\n      .WithHeaders(\"Content-Type\", \"Authorization\")\n      .AllowCredentials();",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.overview.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "table",
    "headers": [
      "security.overview.section_24_hdr_0",
      "security.overview.section_24_hdr_1",
      "security.overview.section_24_hdr_2",
      "security.overview.section_24_hdr_3",
      "security.overview.section_24_hdr_4"
    ],
    "rows": [
      [
        "security.overview.section_24_cell_0_0",
        "security.overview.section_24_cell_0_1",
        "security.overview.section_24_cell_0_2",
        "security.overview.section_24_cell_0_3",
        "security.overview.section_24_cell_0_4"
      ],
      [
        "security.overview.section_24_cell_1_0",
        "security.overview.section_24_cell_1_1",
        "security.overview.section_24_cell_1_2",
        "security.overview.section_24_cell_1_3",
        "security.overview.section_24_cell_1_4"
      ],
      [
        "security.overview.section_24_cell_2_0",
        "security.overview.section_24_cell_2_1",
        "security.overview.section_24_cell_2_2",
        "security.overview.section_24_cell_2_3",
        "security.overview.section_24_cell_2_4"
      ],
      [
        "security.overview.section_24_cell_3_0",
        "security.overview.section_24_cell_3_1",
        "security.overview.section_24_cell_3_2",
        "security.overview.section_24_cell_3_3",
        "security.overview.section_24_cell_3_4"
      ],
      [
        "security.overview.section_24_cell_4_0",
        "security.overview.section_24_cell_4_1",
        "security.overview.section_24_cell_4_2",
        "security.overview.section_24_cell_4_3",
        "security.overview.section_24_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.overview.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "table",
    "headers": [
      "security.overview.section_26_hdr_0",
      "security.overview.section_26_hdr_1",
      "security.overview.section_26_hdr_2"
    ],
    "rows": [
      [
        "security.overview.section_26_cell_0_0",
        "security.overview.section_26_cell_0_1",
        "security.overview.section_26_cell_0_2"
      ],
      [
        "security.overview.section_26_cell_1_0",
        "security.overview.section_26_cell_1_1",
        "security.overview.section_26_cell_1_2"
      ],
      [
        "security.overview.section_26_cell_2_0",
        "security.overview.section_26_cell_2_1",
        "security.overview.section_26_cell_2_2"
      ],
      [
        "security.overview.section_26_cell_3_0",
        "security.overview.section_26_cell_3_1",
        "security.overview.section_26_cell_3_2"
      ],
      [
        "security.overview.section_26_cell_4_0",
        "security.overview.section_26_cell_4_1",
        "security.overview.section_26_cell_4_2"
      ],
      [
        "security.overview.section_26_cell_5_0",
        "security.overview.section_26_cell_5_1",
        "security.overview.section_26_cell_5_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "security.overview.section_27_title",
    "contentKey": "security.overview.section_27_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.overview.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "security.overview.section_29_item_0",
      "security.overview.section_29_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/authentication",
  "features/role-permissions"
],
  lastUpdated: "2026-06-09",
});
