import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/getting-started-guide",
  titleKey: "commercial.gettingStartedGuide.title",
  category: "commercial-support",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.gettingStartedGuide.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.gettingStartedGuide.section_3_hdr_0",
      "commercial.gettingStartedGuide.section_3_hdr_1",
      "commercial.gettingStartedGuide.section_3_hdr_2"
    ],
    "rows": [
      [
        "commercial.gettingStartedGuide.section_3_cell_0_0",
        "commercial.gettingStartedGuide.section_3_cell_0_1",
        "commercial.gettingStartedGuide.section_3_cell_0_2"
      ],
      [
        "commercial.gettingStartedGuide.section_3_cell_1_0",
        "commercial.gettingStartedGuide.section_3_cell_1_1",
        "commercial.gettingStartedGuide.section_3_cell_1_2"
      ],
      [
        "commercial.gettingStartedGuide.section_3_cell_2_0",
        "commercial.gettingStartedGuide.section_3_cell_2_1",
        "commercial.gettingStartedGuide.section_3_cell_2_2"
      ],
      [
        "commercial.gettingStartedGuide.section_3_cell_3_0",
        "commercial.gettingStartedGuide.section_3_cell_3_1",
        "commercial.gettingStartedGuide.section_3_cell_3_2"
      ],
      [
        "commercial.gettingStartedGuide.section_3_cell_4_0",
        "commercial.gettingStartedGuide.section_3_cell_4_1",
        "commercial.gettingStartedGuide.section_3_cell_4_2"
      ],
      [
        "commercial.gettingStartedGuide.section_3_cell_5_0",
        "commercial.gettingStartedGuide.section_3_cell_5_1",
        "commercial.gettingStartedGuide.section_3_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.gettingStartedGuide.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.gettingStartedGuide.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.gettingStartedGuide.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.gettingStartedGuide.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.gettingStartedGuide.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.gettingStartedGuide.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_14_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.gettingStartedGuide.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_16_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# 1. Use SCRIPE CLI to scaffold\nscripe new-module --name \"MyFirstModule\"\n\n# 2. Run both backend and frontend\nscripe dev\n\n# 3. Navigate to http://localhost:3000/my-first-module\n# Your new module is ready with full CRUD!",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.gettingStartedGuide.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.gettingStartedGuide.section_19_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "SCRIPE/\n├── SCRIPE-Backend/          # .NET 10 backend\n│   ├── src/\n│   │   ├── Core/            # Domain + Application layers\n│   │   ├── Infrastructure/  # EF Core, external services\n│   │   └── Presentation/    # Controllers, middleware\n│   └── appsettings.json     # Configuration\n│\n├── SCRIPE-Frontend/         # Next.js 16 frontend\n│   ├── src/\n│   │   ├── core/            # Shared UI, providers, stores\n│   │   ├── modules/         # Feature modules\n│   │   └── app/             # Next.js routing\n│   └── package.json\n│\n└── tools/scripe-cli/        # CLI scaffolding tool",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.gettingStartedGuide.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "table",
    "headers": [
      "commercial.gettingStartedGuide.section_22_hdr_0",
      "commercial.gettingStartedGuide.section_22_hdr_1"
    ],
    "rows": [
      [
        "commercial.gettingStartedGuide.section_22_cell_0_0",
        "commercial.gettingStartedGuide.section_22_cell_0_1"
      ],
      [
        "commercial.gettingStartedGuide.section_22_cell_1_0",
        "commercial.gettingStartedGuide.section_22_cell_1_1"
      ],
      [
        "commercial.gettingStartedGuide.section_22_cell_2_0",
        "commercial.gettingStartedGuide.section_22_cell_2_1"
      ],
      [
        "commercial.gettingStartedGuide.section_22_cell_3_0",
        "commercial.gettingStartedGuide.section_22_cell_3_1"
      ],
      [
        "commercial.gettingStartedGuide.section_22_cell_4_0",
        "commercial.gettingStartedGuide.section_22_cell_4_1"
      ],
      [
        "commercial.gettingStartedGuide.section_22_cell_5_0",
        "commercial.gettingStartedGuide.section_22_cell_5_1"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "commercial.gettingStartedGuide.section_23_title",
    "contentKey": "commercial.gettingStartedGuide.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.gettingStartedGuide.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "ordered",
    "items": [
      "commercial.gettingStartedGuide.section_25_item_0",
      "commercial.gettingStartedGuide.section_25_item_1",
      "commercial.gettingStartedGuide.section_25_item_2",
      "commercial.gettingStartedGuide.section_25_item_3",
      "commercial.gettingStartedGuide.section_25_item_4",
      "commercial.gettingStartedGuide.section_25_item_5"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.gettingStartedGuide.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.gettingStartedGuide.section_27_item_0",
      "commercial.gettingStartedGuide.section_27_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/documentation-training",
  "commercial/faq"
],
  lastUpdated: "2026-06-09",
});
