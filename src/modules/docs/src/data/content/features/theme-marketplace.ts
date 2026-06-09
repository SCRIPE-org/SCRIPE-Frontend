import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/theme-marketplace",
  titleKey: "features.themeMarketplace.title",
  category: "features",
  order: 16,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_3_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "list",
    "variant": "ordered",
    "items": [
      "features.themeMarketplace.section_5_item_0"
    ]
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    seeder[\"LoginThemeSeeder (40 themes)\"]\n    db([\"LoginTheme Table (ThemeDataJson)\"])\n    api{{\"Themes API (list/detail/apply)\"}}\n    gallery([\"ThemeGalleryView (browse + filter)\"])\n    draft[\"DraftBrandingJson (copy-on-apply)\"]\n    seeder --> db\n    db --> api\n    api --> gallery\n    gallery -->|\"Apply\"| draft",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_9_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/modules/system/customization/\n├── src/\n│   ├── domain/\n│   │   ├── entities/ThemeDetail.ts         # Rich domain entity\n│   │   └── interfaces/\n│   │       ├── IThemeMarketplaceService.ts  # HTTP service contract\n│   │       └── IThemeMarketplaceRepository.ts\n│   ├── data/\n│   │   ├── models/ThemeMarketplaceTypes.ts  # Raw DTOs\n│   │   ├── services/ThemeMarketplaceService.ts\n│   │   ├── repositories/ThemeMarketplaceRepository.ts\n│   │   └── mappers/ThemeMarketplaceMapper.ts\n│   └── presentation/\n│       ├── views/\n│       │   ├── ThemeGalleryView.tsx       # 26KB — Full-page marketplace\n│       │   └── ThemeManagementView.tsx    # 12KB — Admin CRUD\n│       ├── components/\n│       │   ├── ThemeDetailModal.tsx       # 28KB — Detail + preview\n│       │   └── ThemeCard.tsx             # Gallery card\n│       └── hooks/\n│           └── useThemeMarketplace.ts    # ViewModel hook",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_14_hdr_0",
      "features.themeMarketplace.section_14_hdr_1",
      "features.themeMarketplace.section_14_hdr_2"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_14_cell_0_0",
        "features.themeMarketplace.section_14_cell_0_1",
        "features.themeMarketplace.section_14_cell_0_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_1_0",
        "features.themeMarketplace.section_14_cell_1_1",
        "features.themeMarketplace.section_14_cell_1_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_2_0",
        "features.themeMarketplace.section_14_cell_2_1",
        "features.themeMarketplace.section_14_cell_2_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_3_0",
        "features.themeMarketplace.section_14_cell_3_1",
        "features.themeMarketplace.section_14_cell_3_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_4_0",
        "features.themeMarketplace.section_14_cell_4_1",
        "features.themeMarketplace.section_14_cell_4_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_5_0",
        "features.themeMarketplace.section_14_cell_5_1",
        "features.themeMarketplace.section_14_cell_5_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_6_0",
        "features.themeMarketplace.section_14_cell_6_1",
        "features.themeMarketplace.section_14_cell_6_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_7_0",
        "features.themeMarketplace.section_14_cell_7_1",
        "features.themeMarketplace.section_14_cell_7_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_8_0",
        "features.themeMarketplace.section_14_cell_8_1",
        "features.themeMarketplace.section_14_cell_8_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_9_0",
        "features.themeMarketplace.section_14_cell_9_1",
        "features.themeMarketplace.section_14_cell_9_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_10_0",
        "features.themeMarketplace.section_14_cell_10_1",
        "features.themeMarketplace.section_14_cell_10_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_11_0",
        "features.themeMarketplace.section_14_cell_11_1",
        "features.themeMarketplace.section_14_cell_11_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_12_0",
        "features.themeMarketplace.section_14_cell_12_1",
        "features.themeMarketplace.section_14_cell_12_2"
      ],
      [
        "features.themeMarketplace.section_14_cell_13_0",
        "features.themeMarketplace.section_14_cell_13_1",
        "features.themeMarketplace.section_14_cell_13_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_16_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_18_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_20_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_22_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_24_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_26_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_28_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_30_content"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_31_hdr_0",
      "features.themeMarketplace.section_31_hdr_1",
      "features.themeMarketplace.section_31_hdr_2",
      "features.themeMarketplace.section_31_hdr_3"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_31_cell_0_0",
        "features.themeMarketplace.section_31_cell_0_1",
        "features.themeMarketplace.section_31_cell_0_2",
        "features.themeMarketplace.section_31_cell_0_3"
      ],
      [
        "features.themeMarketplace.section_31_cell_1_0",
        "features.themeMarketplace.section_31_cell_1_1",
        "features.themeMarketplace.section_31_cell_1_2",
        "features.themeMarketplace.section_31_cell_1_3"
      ],
      [
        "features.themeMarketplace.section_31_cell_2_0",
        "features.themeMarketplace.section_31_cell_2_1",
        "features.themeMarketplace.section_31_cell_2_2",
        "features.themeMarketplace.section_31_cell_2_3"
      ],
      [
        "features.themeMarketplace.section_31_cell_3_0",
        "features.themeMarketplace.section_31_cell_3_1",
        "features.themeMarketplace.section_31_cell_3_2",
        "features.themeMarketplace.section_31_cell_3_3"
      ],
      [
        "features.themeMarketplace.section_31_cell_4_0",
        "features.themeMarketplace.section_31_cell_4_1",
        "features.themeMarketplace.section_31_cell_4_2",
        "features.themeMarketplace.section_31_cell_4_3"
      ],
      [
        "features.themeMarketplace.section_31_cell_5_0",
        "features.themeMarketplace.section_31_cell_5_1",
        "features.themeMarketplace.section_31_cell_5_2",
        "features.themeMarketplace.section_31_cell_5_3"
      ],
      [
        "features.themeMarketplace.section_31_cell_6_0",
        "features.themeMarketplace.section_31_cell_6_1",
        "features.themeMarketplace.section_31_cell_6_2",
        "features.themeMarketplace.section_31_cell_6_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_33_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_35_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_36_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"version\": \"2.0\",\n  \"selectedLayout\": \"split-right\",\n  \"primaryColor\": \"#1e40af\",\n  \"fontFamily\": \"Inter\",\n  // ... 50+ global tokens ...\n  \"pages\": {\n    \"login\": {\n      \"panelHeadline\": \"Welcome Back\",\n      \"panelSubtitle\": \"Sign in to continue\"\n    },\n    \"forgotPassword\": {\n      \"selectedLayout\": \"centered\",\n      \"panelHeadline\": \"Password Recovery\",\n      \"panelSubtitle\": \"We'll help you get back in\",\n      \"overlayColor\": \"rgba(30, 64, 175, 0.3)\"\n    },\n    \"resetPassword\": {\n      \"panelHeadline\": \"Create New Password\",\n      \"panelSubtitle\": \"Choose a strong password\"\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_39_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.themeMarketplace.section_40_title",
    "contentKey": "features.themeMarketplace.section_40_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_42_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_43_title",
    "id": "sec_43"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_44_content"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_45_hdr_0",
      "features.themeMarketplace.section_45_hdr_1",
      "features.themeMarketplace.section_45_hdr_2"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_45_cell_0_0",
        "features.themeMarketplace.section_45_cell_0_1",
        "features.themeMarketplace.section_45_cell_0_2"
      ],
      [
        "features.themeMarketplace.section_45_cell_1_0",
        "features.themeMarketplace.section_45_cell_1_1",
        "features.themeMarketplace.section_45_cell_1_2"
      ],
      [
        "features.themeMarketplace.section_45_cell_2_0",
        "features.themeMarketplace.section_45_cell_2_1",
        "features.themeMarketplace.section_45_cell_2_2"
      ],
      [
        "features.themeMarketplace.section_45_cell_3_0",
        "features.themeMarketplace.section_45_cell_3_1",
        "features.themeMarketplace.section_45_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_46_title",
    "id": "sec_46"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_47_content"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_48_hdr_0",
      "features.themeMarketplace.section_48_hdr_1",
      "features.themeMarketplace.section_48_hdr_2",
      "features.themeMarketplace.section_48_hdr_3"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_48_cell_0_0",
        "features.themeMarketplace.section_48_cell_0_1",
        "features.themeMarketplace.section_48_cell_0_2",
        "features.themeMarketplace.section_48_cell_0_3"
      ],
      [
        "features.themeMarketplace.section_48_cell_1_0",
        "features.themeMarketplace.section_48_cell_1_1",
        "features.themeMarketplace.section_48_cell_1_2",
        "features.themeMarketplace.section_48_cell_1_3"
      ],
      [
        "features.themeMarketplace.section_48_cell_2_0",
        "features.themeMarketplace.section_48_cell_2_1",
        "features.themeMarketplace.section_48_cell_2_2",
        "features.themeMarketplace.section_48_cell_2_3"
      ],
      [
        "features.themeMarketplace.section_48_cell_3_0",
        "features.themeMarketplace.section_48_cell_3_1",
        "features.themeMarketplace.section_48_cell_3_2",
        "features.themeMarketplace.section_48_cell_3_3"
      ],
      [
        "features.themeMarketplace.section_48_cell_4_0",
        "features.themeMarketplace.section_48_cell_4_1",
        "features.themeMarketplace.section_48_cell_4_2",
        "features.themeMarketplace.section_48_cell_4_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_49_title",
    "id": "sec_49"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_50_content"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_51_hdr_0",
      "features.themeMarketplace.section_51_hdr_1",
      "features.themeMarketplace.section_51_hdr_2",
      "features.themeMarketplace.section_51_hdr_3"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_51_cell_0_0",
        "features.themeMarketplace.section_51_cell_0_1",
        "features.themeMarketplace.section_51_cell_0_2",
        "features.themeMarketplace.section_51_cell_0_3"
      ],
      [
        "features.themeMarketplace.section_51_cell_1_0",
        "features.themeMarketplace.section_51_cell_1_1",
        "features.themeMarketplace.section_51_cell_1_2",
        "features.themeMarketplace.section_51_cell_1_3"
      ],
      [
        "features.themeMarketplace.section_51_cell_2_0",
        "features.themeMarketplace.section_51_cell_2_1",
        "features.themeMarketplace.section_51_cell_2_2",
        "features.themeMarketplace.section_51_cell_2_3"
      ],
      [
        "features.themeMarketplace.section_51_cell_3_0",
        "features.themeMarketplace.section_51_cell_3_1",
        "features.themeMarketplace.section_51_cell_3_2",
        "features.themeMarketplace.section_51_cell_3_3"
      ],
      [
        "features.themeMarketplace.section_51_cell_4_0",
        "features.themeMarketplace.section_51_cell_4_1",
        "features.themeMarketplace.section_51_cell_4_2",
        "features.themeMarketplace.section_51_cell_4_3"
      ],
      [
        "features.themeMarketplace.section_51_cell_5_0",
        "features.themeMarketplace.section_51_cell_5_1",
        "features.themeMarketplace.section_51_cell_5_2",
        "features.themeMarketplace.section_51_cell_5_3"
      ],
      [
        "features.themeMarketplace.section_51_cell_6_0",
        "features.themeMarketplace.section_51_cell_6_1",
        "features.themeMarketplace.section_51_cell_6_2",
        "features.themeMarketplace.section_51_cell_6_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_52_title",
    "id": "sec_52"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_53_content"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_54_hdr_0",
      "features.themeMarketplace.section_54_hdr_1",
      "features.themeMarketplace.section_54_hdr_2"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_54_cell_0_0",
        "features.themeMarketplace.section_54_cell_0_1",
        "features.themeMarketplace.section_54_cell_0_2"
      ],
      [
        "features.themeMarketplace.section_54_cell_1_0",
        "features.themeMarketplace.section_54_cell_1_1",
        "features.themeMarketplace.section_54_cell_1_2"
      ],
      [
        "features.themeMarketplace.section_54_cell_2_0",
        "features.themeMarketplace.section_54_cell_2_1",
        "features.themeMarketplace.section_54_cell_2_2"
      ],
      [
        "features.themeMarketplace.section_54_cell_3_0",
        "features.themeMarketplace.section_54_cell_3_1",
        "features.themeMarketplace.section_54_cell_3_2"
      ],
      [
        "features.themeMarketplace.section_54_cell_4_0",
        "features.themeMarketplace.section_54_cell_4_1",
        "features.themeMarketplace.section_54_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_55_title",
    "id": "sec_55"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_56_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_57_title",
    "id": "sec_57"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_58_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.themeMarketplace.section_59_title",
    "contentKey": "features.themeMarketplace.section_59_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_60_title",
    "id": "sec_60"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_61_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    browse[\"Browse Gallery\"]\n    preview([\"previewTheme() (non-destructive)\"])\n    confirm{{\"Confirm Apply\"}}\n    snapshot([\"Copy ThemeDataJson to DraftBrandingJson\"])\n    publish[\"Publish Draft (version++)\"]\n    browse --> preview\n    preview --> confirm\n    confirm --> snapshot\n    snapshot --> publish",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_63_title",
    "id": "sec_63"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_64_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_65_title",
    "id": "sec_65"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_66_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_67_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// ThemeMeta: name, category, tier, description, author, version, tags\n// ThemeDesign: 50+ tokens + PageOverrideDesign records\n\nprivate static LoginTheme Build(ThemeMeta meta, ThemeDesign design)\n{\n    return new LoginTheme\n    {\n        Name = meta.Name,\n        Category = meta.Category,\n        Tier = meta.Tier,\n        Description = meta.Description,\n        Author = meta.Author,\n        Version = meta.Version,\n        Tags = meta.Tags,\n        IsSystemTheme = true,\n        IsActive = true,\n        ThemeDataJson = BuildFullThemeJson(design),\n    };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.themeMarketplace.section_69_title",
    "id": "sec_69"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_70_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_71_title",
    "id": "sec_71"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_72_content"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_73_hdr_0",
      "features.themeMarketplace.section_73_hdr_1",
      "features.themeMarketplace.section_73_hdr_2"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_73_cell_0_0",
        "features.themeMarketplace.section_73_cell_0_1",
        "features.themeMarketplace.section_73_cell_0_2"
      ],
      [
        "features.themeMarketplace.section_73_cell_1_0",
        "features.themeMarketplace.section_73_cell_1_1",
        "features.themeMarketplace.section_73_cell_1_2"
      ],
      [
        "features.themeMarketplace.section_73_cell_2_0",
        "features.themeMarketplace.section_73_cell_2_1",
        "features.themeMarketplace.section_73_cell_2_2"
      ],
      [
        "features.themeMarketplace.section_73_cell_3_0",
        "features.themeMarketplace.section_73_cell_3_1",
        "features.themeMarketplace.section_73_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_74_title",
    "id": "sec_74"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_75_content"
  },
  {
    "type": "table",
    "headers": [
      "features.themeMarketplace.section_76_hdr_0",
      "features.themeMarketplace.section_76_hdr_1",
      "features.themeMarketplace.section_76_hdr_2"
    ],
    "rows": [
      [
        "features.themeMarketplace.section_76_cell_0_0",
        "features.themeMarketplace.section_76_cell_0_1",
        "features.themeMarketplace.section_76_cell_0_2"
      ],
      [
        "features.themeMarketplace.section_76_cell_1_0",
        "features.themeMarketplace.section_76_cell_1_1",
        "features.themeMarketplace.section_76_cell_1_2"
      ],
      [
        "features.themeMarketplace.section_76_cell_2_0",
        "features.themeMarketplace.section_76_cell_2_1",
        "features.themeMarketplace.section_76_cell_2_2"
      ],
      [
        "features.themeMarketplace.section_76_cell_3_0",
        "features.themeMarketplace.section_76_cell_3_1",
        "features.themeMarketplace.section_76_cell_3_2"
      ],
      [
        "features.themeMarketplace.section_76_cell_4_0",
        "features.themeMarketplace.section_76_cell_4_1",
        "features.themeMarketplace.section_76_cell_4_2"
      ],
      [
        "features.themeMarketplace.section_76_cell_5_0",
        "features.themeMarketplace.section_76_cell_5_1",
        "features.themeMarketplace.section_76_cell_5_2"
      ],
      [
        "features.themeMarketplace.section_76_cell_6_0",
        "features.themeMarketplace.section_76_cell_6_1",
        "features.themeMarketplace.section_76_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_77_title",
    "id": "sec_77"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_78_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_79_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_80_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_81_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.themeMarketplace.section_82_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.themeMarketplace.section_83_title",
    "id": "sec_83"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.themeMarketplace.section_84_item_0",
      "features.themeMarketplace.section_84_item_1",
      "features.themeMarketplace.section_84_item_2"
    ]
  }
],
  relatedSlugs: [
  "features/login-customizer",
  "features/multi-page-branding",
  "features/login-page-builder"
],
  lastUpdated: "2026-06-09",
});
