import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/dashboard-builder",
  titleKey: "features.dashboardBuilder.title",
  category: "features",
  order: 19,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardBuilder.section_4_hdr_0",
      "features.dashboardBuilder.section_4_hdr_1",
      "features.dashboardBuilder.section_4_hdr_2"
    ],
    "rows": [
      [
        "features.dashboardBuilder.section_4_cell_0_0",
        "features.dashboardBuilder.section_4_cell_0_1",
        "features.dashboardBuilder.section_4_cell_0_2"
      ],
      [
        "features.dashboardBuilder.section_4_cell_1_0",
        "features.dashboardBuilder.section_4_cell_1_1",
        "features.dashboardBuilder.section_4_cell_1_2"
      ],
      [
        "features.dashboardBuilder.section_4_cell_2_0",
        "features.dashboardBuilder.section_4_cell_2_1",
        "features.dashboardBuilder.section_4_cell_2_2"
      ],
      [
        "features.dashboardBuilder.section_4_cell_3_0",
        "features.dashboardBuilder.section_4_cell_3_1",
        "features.dashboardBuilder.section_4_cell_3_2"
      ],
      [
        "features.dashboardBuilder.section_4_cell_4_0",
        "features.dashboardBuilder.section_4_cell_4_1",
        "features.dashboardBuilder.section_4_cell_4_2"
      ],
      [
        "features.dashboardBuilder.section_4_cell_5_0",
        "features.dashboardBuilder.section_4_cell_5_1",
        "features.dashboardBuilder.section_4_cell_5_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.dashboardBuilder.section_5_title",
    "contentKey": "features.dashboardBuilder.section_5_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_7_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    l1[\"Layer 1: Platform Defaults\"]\n    l3([\"Layer 3: Tenant Defaults\"])\n    l4{{\"Layer 4: Admin Overrides\"}}\n    final([\"Final Applied Settings\"])\n    l1 -->|\"Spread merge\"| l3\n    l3 -->|\"Path-filtered\"| l4\n    l4 -->|\"Applied to DOM\"| final",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardBuilder.section_9_hdr_0",
      "features.dashboardBuilder.section_9_hdr_1",
      "features.dashboardBuilder.section_9_hdr_2",
      "features.dashboardBuilder.section_9_hdr_3"
    ],
    "rows": [
      [
        "features.dashboardBuilder.section_9_cell_0_0",
        "features.dashboardBuilder.section_9_cell_0_1",
        "features.dashboardBuilder.section_9_cell_0_2",
        "features.dashboardBuilder.section_9_cell_0_3"
      ],
      [
        "features.dashboardBuilder.section_9_cell_1_0",
        "features.dashboardBuilder.section_9_cell_1_1",
        "features.dashboardBuilder.section_9_cell_1_2",
        "features.dashboardBuilder.section_9_cell_1_3"
      ],
      [
        "features.dashboardBuilder.section_9_cell_2_0",
        "features.dashboardBuilder.section_9_cell_2_1",
        "features.dashboardBuilder.section_9_cell_2_2",
        "features.dashboardBuilder.section_9_cell_2_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.dashboardBuilder.section_10_title",
    "contentKey": "features.dashboardBuilder.section_10_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_12_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    login[\"Admin Logs In\"]\n    cache([\"Check localStorage Cache\"])\n    flush{{\"Check PENDING_SETTINGS_FLUSH\"}}\n    fetch([\"GET AdminSettingsJson\"])\n    reconcile([\"Silent Reconcile\"])\n    change[\"User Changes Setting\"]\n    debounce{{\"2s Debounce\"}}\n    save([\"PUT to Server\"])\n    login --> cache\n    cache --> flush\n    flush --> fetch\n    fetch --> reconcile\n    change --> debounce\n    debounce --> save",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_14_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// In DashboardLayout (authenticated layout root):\nconst { isSettingsReady } = useAdminSettingsSync();\n\n// Shimmer only on first-ever device login (no cache)\nif (!isSettingsReady) {\n  return <LoadingShimmer />;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_17_content"
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardBuilder.section_18_hdr_0",
      "features.dashboardBuilder.section_18_hdr_1",
      "features.dashboardBuilder.section_18_hdr_2"
    ],
    "rows": [
      [
        "features.dashboardBuilder.section_18_cell_0_0",
        "features.dashboardBuilder.section_18_cell_0_1",
        "features.dashboardBuilder.section_18_cell_0_2"
      ],
      [
        "features.dashboardBuilder.section_18_cell_1_0",
        "features.dashboardBuilder.section_18_cell_1_1",
        "features.dashboardBuilder.section_18_cell_1_2"
      ],
      [
        "features.dashboardBuilder.section_18_cell_2_0",
        "features.dashboardBuilder.section_18_cell_2_1",
        "features.dashboardBuilder.section_18_cell_2_2"
      ],
      [
        "features.dashboardBuilder.section_18_cell_3_0",
        "features.dashboardBuilder.section_18_cell_3_1",
        "features.dashboardBuilder.section_18_cell_3_2"
      ],
      [
        "features.dashboardBuilder.section_18_cell_4_0",
        "features.dashboardBuilder.section_18_cell_4_1",
        "features.dashboardBuilder.section_18_cell_4_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.dashboardBuilder.section_19_title",
    "contentKey": "features.dashboardBuilder.section_19_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardBuilder.section_22_hdr_0",
      "features.dashboardBuilder.section_22_hdr_1",
      "features.dashboardBuilder.section_22_hdr_2",
      "features.dashboardBuilder.section_22_hdr_3"
    ],
    "rows": [
      [
        "features.dashboardBuilder.section_22_cell_0_0",
        "features.dashboardBuilder.section_22_cell_0_1",
        "features.dashboardBuilder.section_22_cell_0_2",
        "features.dashboardBuilder.section_22_cell_0_3"
      ],
      [
        "features.dashboardBuilder.section_22_cell_1_0",
        "features.dashboardBuilder.section_22_cell_1_1",
        "features.dashboardBuilder.section_22_cell_1_2",
        "features.dashboardBuilder.section_22_cell_1_3"
      ],
      [
        "features.dashboardBuilder.section_22_cell_2_0",
        "features.dashboardBuilder.section_22_cell_2_1",
        "features.dashboardBuilder.section_22_cell_2_2",
        "features.dashboardBuilder.section_22_cell_2_3"
      ],
      [
        "features.dashboardBuilder.section_22_cell_3_0",
        "features.dashboardBuilder.section_22_cell_3_1",
        "features.dashboardBuilder.section_22_cell_3_2",
        "features.dashboardBuilder.section_22_cell_3_3"
      ],
      [
        "features.dashboardBuilder.section_22_cell_4_0",
        "features.dashboardBuilder.section_22_cell_4_1",
        "features.dashboardBuilder.section_22_cell_4_2",
        "features.dashboardBuilder.section_22_cell_4_3"
      ],
      [
        "features.dashboardBuilder.section_22_cell_5_0",
        "features.dashboardBuilder.section_22_cell_5_1",
        "features.dashboardBuilder.section_22_cell_5_2",
        "features.dashboardBuilder.section_22_cell_5_3"
      ],
      [
        "features.dashboardBuilder.section_22_cell_6_0",
        "features.dashboardBuilder.section_22_cell_6_1",
        "features.dashboardBuilder.section_22_cell_6_2",
        "features.dashboardBuilder.section_22_cell_6_3"
      ],
      [
        "features.dashboardBuilder.section_22_cell_7_0",
        "features.dashboardBuilder.section_22_cell_7_1",
        "features.dashboardBuilder.section_22_cell_7_2",
        "features.dashboardBuilder.section_22_cell_7_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardBuilder.section_25_hdr_0",
      "features.dashboardBuilder.section_25_hdr_1"
    ],
    "rows": [
      [
        "features.dashboardBuilder.section_25_cell_0_0",
        "features.dashboardBuilder.section_25_cell_0_1"
      ],
      [
        "features.dashboardBuilder.section_25_cell_1_0",
        "features.dashboardBuilder.section_25_cell_1_1"
      ],
      [
        "features.dashboardBuilder.section_25_cell_2_0",
        "features.dashboardBuilder.section_25_cell_2_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_27_content"
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardBuilder.section_28_hdr_0",
      "features.dashboardBuilder.section_28_hdr_1"
    ],
    "rows": [
      [
        "features.dashboardBuilder.section_28_cell_0_0",
        "features.dashboardBuilder.section_28_cell_0_1"
      ],
      [
        "features.dashboardBuilder.section_28_cell_1_0",
        "features.dashboardBuilder.section_28_cell_1_1"
      ],
      [
        "features.dashboardBuilder.section_28_cell_2_0",
        "features.dashboardBuilder.section_28_cell_2_1"
      ],
      [
        "features.dashboardBuilder.section_28_cell_3_0",
        "features.dashboardBuilder.section_28_cell_3_1"
      ],
      [
        "features.dashboardBuilder.section_28_cell_4_0",
        "features.dashboardBuilder.section_28_cell_4_1"
      ],
      [
        "features.dashboardBuilder.section_28_cell_5_0",
        "features.dashboardBuilder.section_28_cell_5_1"
      ],
      [
        "features.dashboardBuilder.section_28_cell_6_0",
        "features.dashboardBuilder.section_28_cell_6_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_30_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardBuilder.section_31_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/core/providers/\n├── useAdminSettingsSync.ts    # Server sync hook (5 edge case protections)\n├── settings-provider.tsx      # 4-layer merge engine + field tracking\n├── tenant-branding-provider.tsx # Layer 3 sync + override metadata\n\nsrc/core/config/\n├── storage-keys.ts            # Centralized localStorage key definitions\n├── api-endpoints.ts           # Dashboard builder API endpoint constants\n\nsrc/core/ui/layout/\n├── dashboard-layout.tsx       # FOUC shimmer gate (layout entry point)\n\nsrc/modules/auth/core/data/\n├── repositories/AuthRepository.ts  # Logout cleanup (raw key removal)",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.dashboardBuilder.section_33_title",
    "contentKey": "features.dashboardBuilder.section_33_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardBuilder.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.dashboardBuilder.section_35_item_0",
      "features.dashboardBuilder.section_35_item_1",
      "features.dashboardBuilder.section_35_item_2"
    ]
  }
],
  relatedSlugs: [
  "features/login-customizer",
  "features/theme-marketplace",
  "features/login-page-builder"
],
  lastUpdated: "2026-06-09",
});
