import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/scripe-cli",
  titleKey: "infrastructure.scripeCli.title",
  category: "infrastructure",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_3_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.scripeCli.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_6_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "$ scripe new-module <name> [options]\n\n# Options:\n# --backend-only          Generate only the backend module\n# --frontend-only         Generate only the frontend module\n# --entity <name>         Custom name for the first entity\n# --with-no-entity        Create bare skeleton without initial CRUD entity\n# --no-cache              Skip Redis cache integration on queries/commands\n# --no-cleaner-bg-service Skip soft-delete cleanup background job generation",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_8_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "src/modules/{kebab-name}/\n├── di.ts                           # DI container (wires all sub-modules)\n├── index.ts                        # Public barrel exports\n└── {sub-module-name}/\n    ├── index.ts                    # Sub-module barrel\n    ├── locales/                    # Sub-module-owned translations\n    │   ├── {sub-module-name}.en.ts\n    │   ├── {sub-module-name}.ar.ts\n    │   └── index.ts\n    └── src/\n        ├── domain/\n        │   ├── entities/{Entity}.ts\n        │   └── interfaces/\n        │       └── I{Entity}Repository.ts\n        ├── data/\n        │   ├── models/{Entity}Model.ts\n        │   ├── mappers/{Entity}Mapper.ts\n        │   └── repositories/{Entity}Repository.ts\n        └── presentation/\n            ├── viewmodels/use{Entity}ViewModel.ts\n            └── views/{Entity}ListView.tsx",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.scripeCli.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_12_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "$ scripe new-feature <module> <entity> -p <properties> [options]\n\n# Options:\n# -p, --properties <props>  (Required) Property definitions string\n# --backend-only            Generate only backend files\n# --frontend-only           Generate only frontend files\n# --no-controller           Skip REST controller generation\n# --no-cache                Skip cache integration\n# --no-cleaner-bg-service   Skip adding entity to soft-delete cleanup job\n\n# Example: E-commerce Invoice\n$ scripe new-feature Products Invoice \\\n  -p \"Title:string:required:max(200),Amount:decimal:required:min(0),Status:enum(Draft|Sent|Paid):required\"",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.scripeCli.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_16_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Remove a full module and aggressively rollback ALL auto-wiring safely\n$ scripe remove-module Products --confirm\n\n# Remove a specific feature/entity and rollback its DI and permissions\n$ scripe remove-feature Products Invoice --confirm\n\n# Auto-detect the most recent scaffolding and obliterate it\n$ scripe remove-module --last --confirm",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.scripeCli.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_20_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Automatically generate and wire a Soft-Delete Cleanup Job (provider-agnostic)\n$ scripe add-bg-service Products\n\n$ scripe remove-bg-service Products",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_23_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "infrastructure.scripeCli.section_24_title",
    "contentKey": "infrastructure.scripeCli.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.scripeCli.section_25_hdr_0",
      "infrastructure.scripeCli.section_25_hdr_1",
      "infrastructure.scripeCli.section_25_hdr_2",
      "infrastructure.scripeCli.section_25_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.scripeCli.section_25_cell_0_0",
        "infrastructure.scripeCli.section_25_cell_0_1",
        "infrastructure.scripeCli.section_25_cell_0_2",
        "infrastructure.scripeCli.section_25_cell_0_3"
      ],
      [
        "infrastructure.scripeCli.section_25_cell_1_0",
        "infrastructure.scripeCli.section_25_cell_1_1",
        "infrastructure.scripeCli.section_25_cell_1_2",
        "infrastructure.scripeCli.section_25_cell_1_3"
      ],
      [
        "infrastructure.scripeCli.section_25_cell_2_0",
        "infrastructure.scripeCli.section_25_cell_2_1",
        "infrastructure.scripeCli.section_25_cell_2_2",
        "infrastructure.scripeCli.section_25_cell_2_3"
      ],
      [
        "infrastructure.scripeCli.section_25_cell_3_0",
        "infrastructure.scripeCli.section_25_cell_3_1",
        "infrastructure.scripeCli.section_25_cell_3_2",
        "infrastructure.scripeCli.section_25_cell_3_3"
      ],
      [
        "infrastructure.scripeCli.section_25_cell_4_0",
        "infrastructure.scripeCli.section_25_cell_4_1",
        "infrastructure.scripeCli.section_25_cell_4_2",
        "infrastructure.scripeCli.section_25_cell_4_3"
      ],
      [
        "infrastructure.scripeCli.section_25_cell_5_0",
        "infrastructure.scripeCli.section_25_cell_5_1",
        "infrastructure.scripeCli.section_25_cell_5_2",
        "infrastructure.scripeCli.section_25_cell_5_3"
      ]
    ]
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.scripeCli.section_26_hdr_0",
      "infrastructure.scripeCli.section_26_hdr_1",
      "infrastructure.scripeCli.section_26_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.scripeCli.section_26_cell_0_0",
        "infrastructure.scripeCli.section_26_cell_0_1",
        "infrastructure.scripeCli.section_26_cell_0_2"
      ],
      [
        "infrastructure.scripeCli.section_26_cell_1_0",
        "infrastructure.scripeCli.section_26_cell_1_1",
        "infrastructure.scripeCli.section_26_cell_1_2",
        "infrastructure.scripeCli.section_26_cell_1_3"
      ],
      [
        "infrastructure.scripeCli.section_26_cell_2_0",
        "infrastructure.scripeCli.section_26_cell_2_1",
        "infrastructure.scripeCli.section_26_cell_2_2"
      ],
      [
        "infrastructure.scripeCli.section_26_cell_3_0",
        "infrastructure.scripeCli.section_26_cell_3_1",
        "infrastructure.scripeCli.section_26_cell_3_2"
      ],
      [
        "infrastructure.scripeCli.section_26_cell_4_0",
        "infrastructure.scripeCli.section_26_cell_4_1",
        "infrastructure.scripeCli.section_26_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_28_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.scripeCli.section_29_hdr_0",
      "infrastructure.scripeCli.section_29_hdr_1"
    ],
    "rows": [
      [
        "infrastructure.scripeCli.section_29_cell_0_0",
        "infrastructure.scripeCli.section_29_cell_0_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_1_0",
        "infrastructure.scripeCli.section_29_cell_1_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_2_0",
        "infrastructure.scripeCli.section_29_cell_2_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_3_0",
        "infrastructure.scripeCli.section_29_cell_3_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_4_0",
        "infrastructure.scripeCli.section_29_cell_4_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_5_0",
        "infrastructure.scripeCli.section_29_cell_5_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_6_0",
        "infrastructure.scripeCli.section_29_cell_6_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_7_0",
        "infrastructure.scripeCli.section_29_cell_7_1"
      ],
      [
        "infrastructure.scripeCli.section_29_cell_8_0",
        "infrastructure.scripeCli.section_29_cell_8_1"
      ]
    ]
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.scripeCli.section_30_hdr_0",
      "infrastructure.scripeCli.section_30_hdr_1"
    ],
    "rows": [
      [
        "infrastructure.scripeCli.section_30_cell_0_0",
        "infrastructure.scripeCli.section_30_cell_0_1"
      ],
      [
        "infrastructure.scripeCli.section_30_cell_1_0",
        "infrastructure.scripeCli.section_30_cell_1_1"
      ],
      [
        "infrastructure.scripeCli.section_30_cell_2_0",
        "infrastructure.scripeCli.section_30_cell_2_1"
      ],
      [
        "infrastructure.scripeCli.section_30_cell_3_0",
        "infrastructure.scripeCli.section_30_cell_3_1"
      ],
      [
        "infrastructure.scripeCli.section_30_cell_4_0",
        "infrastructure.scripeCli.section_30_cell_4_1"
      ],
      [
        "infrastructure.scripeCli.section_30_cell_5_0",
        "infrastructure.scripeCli.section_30_cell_5_1"
      ],
      [
        "infrastructure.scripeCli.section_30_cell_6_0",
        "infrastructure.scripeCli.section_30_cell_6_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_32_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.scripeCli.section_33_hdr_0",
      "infrastructure.scripeCli.section_33_hdr_1",
      "infrastructure.scripeCli.section_33_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.scripeCli.section_33_cell_0_0",
        "infrastructure.scripeCli.section_33_cell_0_1",
        "infrastructure.scripeCli.section_33_cell_0_2"
      ],
      [
        "infrastructure.scripeCli.section_33_cell_1_0",
        "infrastructure.scripeCli.section_33_cell_1_1",
        "infrastructure.scripeCli.section_33_cell_1_2"
      ],
      [
        "infrastructure.scripeCli.section_33_cell_2_0",
        "infrastructure.scripeCli.section_33_cell_2_1",
        "infrastructure.scripeCli.section_33_cell_2_2"
      ],
      [
        "infrastructure.scripeCli.section_33_cell_3_0",
        "infrastructure.scripeCli.section_33_cell_3_1",
        "infrastructure.scripeCli.section_33_cell_3_2"
      ],
      [
        "infrastructure.scripeCli.section_33_cell_4_0",
        "infrastructure.scripeCli.section_33_cell_4_1",
        "infrastructure.scripeCli.section_33_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_35_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.scripeCli.section_36_item_0",
      "infrastructure.scripeCli.section_36_item_1",
      "infrastructure.scripeCli.section_36_item_2",
      "infrastructure.scripeCli.section_36_item_3",
      "infrastructure.scripeCli.section_36_item_4",
      "infrastructure.scripeCli.section_36_item_5",
      "infrastructure.scripeCli.section_36_item_6"
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "infrastructure.scripeCli.section_37_title",
    "contentKey": "infrastructure.scripeCli.section_37_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_39_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.scripeCli.section_40_item_0",
      "infrastructure.scripeCli.section_40_item_1"
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_41_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Generate migration for all 3 providers (SqlServer, Oracle, PostgreSql)\n$ scripe db add-migration Initial -m CRM\n\n# Generate migration for a specific provider only\n$ scripe db add-migration Initial -m CRM -p SqlServer\n\n# Apply migrations (auto-detects provider from appsettings.json)\n$ scripe db update -m CRM\n\n# Override provider for update\n$ scripe db update -m CRM -p Oracle\n\n# Remove last migration from all 3 providers\n$ scripe db remove-migration -m CRM\n\n# Remove last migration from a specific provider only\n$ scripe db remove-migration -m CRM -p SqlServer\n\n# Rebuild frontend schemas to mirror live Backend structure\n$ scripe sync-api https://localhost:5001/swagger/v1/swagger.json -m crm",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_43_title",
    "id": "sec_43"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_44_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_45_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"backend\": {\n    \"root\": \"./SCRIPE-Backend\",\n    \"solutionFile\": \"SCRIPE-Backend.sln\",\n    \"modulesDir\": \"src/Modules\",\n    \"hostDir\": \"src/Host/API\",\n    \"coreDir\": \"src/Core\"\n  },\n  \"frontend\": {\n    \"root\": \"./SCRIPE-Frontend\",\n    \"modulesDir\": \"src/modules\",\n    \"appDir\": \"src/app\",\n    \"coreDir\": \"src/core\",\n    \"localesDir\": \"src/core/locales\"\n  },\n  \"defaults\": {\n    \"targetFramework\": \"net10.0\",\n    \"languages\": [\"en\", \"ar\"]\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_47_title",
    "id": "sec_47"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_48_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.scripeCli.section_49_hdr_0",
      "infrastructure.scripeCli.section_49_hdr_1",
      "infrastructure.scripeCli.section_49_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.scripeCli.section_49_cell_0_0",
        "infrastructure.scripeCli.section_49_cell_0_1",
        "infrastructure.scripeCli.section_49_cell_0_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_1_0",
        "infrastructure.scripeCli.section_49_cell_1_1",
        "infrastructure.scripeCli.section_49_cell_1_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_2_0",
        "infrastructure.scripeCli.section_49_cell_2_1",
        "infrastructure.scripeCli.section_49_cell_2_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_3_0",
        "infrastructure.scripeCli.section_49_cell_3_1",
        "infrastructure.scripeCli.section_49_cell_3_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_4_0",
        "infrastructure.scripeCli.section_49_cell_4_1",
        "infrastructure.scripeCli.section_49_cell_4_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_5_0",
        "infrastructure.scripeCli.section_49_cell_5_1",
        "infrastructure.scripeCli.section_49_cell_5_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_6_0",
        "infrastructure.scripeCli.section_49_cell_6_1",
        "infrastructure.scripeCli.section_49_cell_6_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_7_0",
        "infrastructure.scripeCli.section_49_cell_7_1",
        "infrastructure.scripeCli.section_49_cell_7_2"
      ],
      [
        "infrastructure.scripeCli.section_49_cell_8_0",
        "infrastructure.scripeCli.section_49_cell_8_1",
        "infrastructure.scripeCli.section_49_cell_8_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.scripeCli.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_51_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_52_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Fast installation trees targeting specific ecosystems\n$ scripe install all        # Both CLI and Frontend via npm/pnpm\n$ scripe install frontend   # Only Frontend\n\n# Fast compilation targets\n$ scripe build all          # Typescript CLI -> dotnet build -> pnpm build\n$ scripe build backend      # dotnet build \n\n# Local Server Proxies\n$ scripe dev frontend       # Next.js Server\n$ scripe dev backend        # Kestrel .NET Engine",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_54_title",
    "id": "sec_54"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeCli.section_55_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.scripeCli.section_56_hdr_0",
      "infrastructure.scripeCli.section_56_hdr_1",
      "infrastructure.scripeCli.section_56_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.scripeCli.section_56_cell_0_0",
        "infrastructure.scripeCli.section_56_cell_0_1",
        "infrastructure.scripeCli.section_56_cell_0_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_1_0",
        "infrastructure.scripeCli.section_56_cell_1_1",
        "infrastructure.scripeCli.section_56_cell_1_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_2_0",
        "infrastructure.scripeCli.section_56_cell_2_1",
        "infrastructure.scripeCli.section_56_cell_2_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_3_0",
        "infrastructure.scripeCli.section_56_cell_3_1",
        "infrastructure.scripeCli.section_56_cell_3_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_4_0",
        "infrastructure.scripeCli.section_56_cell_4_1",
        "infrastructure.scripeCli.section_56_cell_4_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_5_0",
        "infrastructure.scripeCli.section_56_cell_5_1",
        "infrastructure.scripeCli.section_56_cell_5_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_6_0",
        "infrastructure.scripeCli.section_56_cell_6_1",
        "infrastructure.scripeCli.section_56_cell_6_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_7_0",
        "infrastructure.scripeCli.section_56_cell_7_1",
        "infrastructure.scripeCli.section_56_cell_7_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_8_0",
        "infrastructure.scripeCli.section_56_cell_8_1",
        "infrastructure.scripeCli.section_56_cell_8_2"
      ],
      [
        "infrastructure.scripeCli.section_56_cell_9_0",
        "infrastructure.scripeCli.section_56_cell_9_1",
        "infrastructure.scripeCli.section_56_cell_9_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeCli.section_57_title",
    "id": "sec_57"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.scripeCli.section_58_item_0",
      "infrastructure.scripeCli.section_58_item_1"
    ]
  }
],
  relatedSlugs: [
  "infrastructure/database-migrations",
  "commercial/cli-tooling"
],
  lastUpdated: "2026-06-09",
});
