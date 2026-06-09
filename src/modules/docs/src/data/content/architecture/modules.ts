import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/modules",
  titleKey: "architecture.modules.title",
  category: "architecture",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.modules.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "architecture.modules.section_3_hdr_0",
      "architecture.modules.section_3_hdr_1"
    ],
    "rows": [
      [
        "architecture.modules.section_3_cell_0_0",
        "architecture.modules.section_3_cell_0_1"
      ],
      [
        "architecture.modules.section_3_cell_1_0",
        "architecture.modules.section_3_cell_1_1"
      ],
      [
        "architecture.modules.section_3_cell_2_0",
        "architecture.modules.section_3_cell_2_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.modules.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_6_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/Modules/{ModuleName}/\n├── {Module}.Domain/\n│   ├── Entities/              # Domain entities (DDD)\n│   ├── Interfaces/            # Repository contracts\n│   ├── Specifications/        # Query specifications\n│   ├── Events/                # Domain events\n│   └── Enums/                 # Module-specific enums\n│\n├── {Module}.Application/\n│   ├── Commands/              # CQRS write operations\n│   │   ├── Create{Entity}/\n│   │   │   ├── Create{Entity}Command.cs\n│   │   │   ├── Create{Entity}CommandValidator.cs\n│   │   │   └── Create{Entity}CommandHandler.cs\n│   │   └── Update{Entity}/\n│   ├── Queries/               # CQRS read operations\n│   │   ├── Get{Entity}ById/\n│   │   └── List{Entities}/\n│   ├── DTOs/                  # Data transfer objects\n│   ├── Mappings/              # Explicit DTO mapping rules\n│   └── DependencyInjection.cs # Assembly marker\n│\n└── {Module}.Infrastructure/\n    ├── Persistence/\n    │   ├── {Module}DbContext.cs\n    │   ├── Configurations/     # EF entity configs\n    │   ├── Repositories/       # Interface implementations\n    │   └── Migrations/         # EF migrations\n    ├── Services/               # External service adapters\n    └── DependencyInjection.cs  # Service registration",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.modules.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_9_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/modules/{module-name}/\n├── di.ts                     # Module DI Container\n├── index.ts                  # Public API (Views, entities)\n└── src/\n    ├── domain/\n    │   ├── entities/         # Zod schemas + domain logic\n    │   └── interfaces/       # Repository contracts\n    ├── data/\n    │   ├── models/           # API DTOs (raw shapes)\n    │   ├── mappers/          # DTO ↔ Entity transforms\n    │   └── repositories/     # API implementations\n    └── presentation/\n        ├── viewmodels/       # React hooks (all logic)\n        ├── views/            # Pure UI (<60 lines)\n        └── components/       # Section UI components",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.modules.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_12_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.modules.section_13_hdr_0",
      "architecture.modules.section_13_hdr_1",
      "architecture.modules.section_13_hdr_2",
      "architecture.modules.section_13_hdr_3",
      "architecture.modules.section_13_hdr_4"
    ],
    "rows": [
      [
        "architecture.modules.section_13_cell_0_0",
        "architecture.modules.section_13_cell_0_1",
        "architecture.modules.section_13_cell_0_2",
        "architecture.modules.section_13_cell_0_3",
        "architecture.modules.section_13_cell_0_4"
      ],
      [
        "architecture.modules.section_13_cell_1_0",
        "architecture.modules.section_13_cell_1_1",
        "architecture.modules.section_13_cell_1_2",
        "architecture.modules.section_13_cell_1_3",
        "architecture.modules.section_13_cell_1_4"
      ],
      [
        "architecture.modules.section_13_cell_2_0",
        "architecture.modules.section_13_cell_2_1",
        "architecture.modules.section_13_cell_2_2",
        "architecture.modules.section_13_cell_2_3",
        "architecture.modules.section_13_cell_2_4"
      ],
      [
        "architecture.modules.section_13_cell_3_0",
        "architecture.modules.section_13_cell_3_1",
        "architecture.modules.section_13_cell_3_2",
        "architecture.modules.section_13_cell_3_3",
        "architecture.modules.section_13_cell_3_4"
      ],
      [
        "architecture.modules.section_13_cell_4_0",
        "architecture.modules.section_13_cell_4_1",
        "architecture.modules.section_13_cell_4_2",
        "architecture.modules.section_13_cell_4_3",
        "architecture.modules.section_13_cell_4_4"
      ],
      [
        "architecture.modules.section_13_cell_5_0",
        "architecture.modules.section_13_cell_5_1",
        "architecture.modules.section_13_cell_5_2",
        "architecture.modules.section_13_cell_5_3",
        "architecture.modules.section_13_cell_5_4"
      ],
      [
        "architecture.modules.section_13_cell_6_0",
        "architecture.modules.section_13_cell_6_1",
        "architecture.modules.section_13_cell_6_2",
        "architecture.modules.section_13_cell_6_3",
        "architecture.modules.section_13_cell_6_4"
      ],
      [
        "architecture.modules.section_13_cell_7_0",
        "architecture.modules.section_13_cell_7_1",
        "architecture.modules.section_13_cell_7_2",
        "architecture.modules.section_13_cell_7_3",
        "architecture.modules.section_13_cell_7_4"
      ],
      [
        "architecture.modules.section_13_cell_8_0",
        "architecture.modules.section_13_cell_8_1",
        "architecture.modules.section_13_cell_8_2",
        "architecture.modules.section_13_cell_8_3",
        "architecture.modules.section_13_cell_8_4"
      ],
      [
        "architecture.modules.section_13_cell_9_0",
        "architecture.modules.section_13_cell_9_1",
        "architecture.modules.section_13_cell_9_2",
        "architecture.modules.section_13_cell_9_3",
        "architecture.modules.section_13_cell_9_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.modules.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.modules.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_16_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// In HR module — link to Vendor details via URL\nimport Link from 'next/link';\n\n<Link href={`/vendor/${employee.assignedVendorId}`}>\n  View Assigned Vendor\n</Link>",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.modules.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_19_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// ✅ Store ONLY the vendor ID, not the whole entity\nconst EmployeeSchema = z.object({\n  id: z.string().uuid(),\n  name: z.string(),\n  assignedVendorId: z.string().uuid().optional(), // Just the ID\n});\n\n// ❌ DON'T embed the entire Vendor entity\n// vendor: VendorSchema  ← This creates coupling!",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.modules.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.modules.section_22_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Core Event Bus (future pattern)\neventBus.emit(\"employee:created\", { id: \"123\", name: \"John\" });\n\n// Subscribing in another module\neventBus.on(\"employee:created\", (data) => {\n  // React to employee creation without importing HR module\n});",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "architecture.modules.section_24_title",
    "contentKey": "architecture.modules.section_24_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.modules.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.modules.section_26_item_0",
      "architecture.modules.section_26_item_1"
    ]
  }
],
  relatedSlugs: [
  "architecture/overview",
  "get-started/project-structure"
],
  lastUpdated: "2026-06-09",
});
