import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "get-started/quick-start",
  titleKey: "getStarted.quickStart.title",
  category: "get-started",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.quickStart.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.quickStart.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_4_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "cd SCRIPE-Backend\ndotnet restore",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.quickStart.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_7_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_8_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "dotnet ef database update \\\n  -p src/Modules/Identity/Identity.Infrastructure \\\n  -s src/Host/API",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.quickStart.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_11_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "dotnet run --project src/Host/API",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "getStarted.quickStart.section_13_title",
    "contentKey": "getStarted.quickStart.section_13_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.quickStart.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.quickStart.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_16_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "cd SCRIPE-Frontend\npnpm install",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.quickStart.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_20_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# .env.local\nNEXT_PUBLIC_API_URL=https://localhost:5001\nNEXT_PUBLIC_APP_NAME=SCRIPE",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.quickStart.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_23_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "pnpm dev",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.quickStart.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.quickStart.section_26_hdr_0",
      "getStarted.quickStart.section_26_hdr_1",
      "getStarted.quickStart.section_26_hdr_2",
      "getStarted.quickStart.section_26_hdr_3"
    ],
    "rows": [
      [
        "getStarted.quickStart.section_26_cell_0_0",
        "getStarted.quickStart.section_26_cell_0_1",
        "getStarted.quickStart.section_26_cell_0_2",
        "getStarted.quickStart.section_26_cell_0_3"
      ],
      [
        "getStarted.quickStart.section_26_cell_1_0",
        "getStarted.quickStart.section_26_cell_1_1",
        "getStarted.quickStart.section_26_cell_1_2",
        "getStarted.quickStart.section_26_cell_1_3"
      ],
      [
        "getStarted.quickStart.section_26_cell_2_0",
        "getStarted.quickStart.section_26_cell_2_1",
        "getStarted.quickStart.section_26_cell_2_2",
        "getStarted.quickStart.section_26_cell_2_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "danger",
    "titleKey": "getStarted.quickStart.section_27_title",
    "contentKey": "getStarted.quickStart.section_27_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.quickStart.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_29_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "getStarted.quickStart.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "curl https://localhost:5001/health\n# Expected: {\"status\":\"Healthy\",\"results\":{...}}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "getStarted.quickStart.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Open in browser:\n# https://localhost:5001/swagger\n\n# All 18 controllers should appear with documented endpoints",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "getStarted.quickStart.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "curl -X POST https://localhost:5001/api/v1/auth/login \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"email\":\"admin@scripe.com\",\"password\":\"P@ssw0rd\"}'\n\n# Expected: { \"accessToken\": \"...\", \"refreshToken\": \"...\" }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.quickStart.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_37_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.quickStart.section_38_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Automatically create a 3-project backend module and frontend route\nscripe new-module Inventory\n\n# Scaffold 26 full-stack files (Controllers, Handlers, ViewModels, Zod schemas, Views)\nscripe new-feature Inventory Product -p \"Name:string:required:max(100),Price:decimal:required,CategoryId:FK:Category:required\"\n\n# Generate EF migrations across 3 Databases (SqlServer, Oracle, PostgreSql) simultaneously\nscripe db add-migration Initial -m Inventory\n\n# Auto-detect your configured Database provider and update it\nscripe db update -m Inventory\n\n# Auto-generate TypeScript models and API clients from Swagger\nscripe sync-api https://localhost:5001/swagger/v1/swagger.json -m inventory\n\n# Build the entire platform\nscripe build all",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.quickStart.section_40_title",
    "id": "sec_40"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "getStarted.quickStart.section_41_item_0",
      "getStarted.quickStart.section_41_item_1"
    ]
  }
],
  relatedSlugs: [
  "get-started/prerequisites",
  "get-started/project-structure"
],
  lastUpdated: "2026-06-09",
});
