import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/entitlements-overrides",
  titleKey: "commercial.entOverrides.title",
  category: "commercial-modules",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverrides.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    override[\"1. Tenant Override (Highest)\"]\n    sub{{\"2. Active Subscription → Edition Features\"}}\n    addon([\"3. Add-on Subscriptions\"])\n    default[\"4. Feature Default Value (Lowest)\"]\n    override -->|\"Not set? →\"| sub\n    sub -->|\"Not set? →\"| addon\n    addon -->|\"Not set? →\"| default",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverrides.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverrides.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverrides.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverrides.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entOverrides.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_13_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverrides.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_16_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "POST /api/tenant-features/{tenantId}/override\n{\n  \"featureId\": \"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\n  \"value\": \"500\",\n  \"expiresAt\": \"2026-12-31T23:59:59Z\",\n  \"reason\": \"Enterprise deal: Extended storage\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverrides.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entOverrides.section_19_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entOverrides.section_20_hdr_0",
      "commercial.entOverrides.section_20_hdr_1",
      "commercial.entOverrides.section_20_hdr_2"
    ],
    "rows": [
      [
        "commercial.entOverrides.section_20_cell_0_0",
        "commercial.entOverrides.section_20_cell_0_1",
        "commercial.entOverrides.section_20_cell_0_2"
      ],
      [
        "commercial.entOverrides.section_20_cell_1_0",
        "commercial.entOverrides.section_20_cell_1_1",
        "commercial.entOverrides.section_20_cell_1_2"
      ],
      [
        "commercial.entOverrides.section_20_cell_2_0",
        "commercial.entOverrides.section_20_cell_2_1",
        "commercial.entOverrides.section_20_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverrides.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entOverrides.section_22_hdr_0",
      "commercial.entOverrides.section_22_hdr_1",
      "commercial.entOverrides.section_22_hdr_2",
      "commercial.entOverrides.section_22_hdr_3",
      "commercial.entOverrides.section_22_hdr_4"
    ],
    "rows": [
      [
        "commercial.entOverrides.section_22_cell_0_0",
        "commercial.entOverrides.section_22_cell_0_1",
        "commercial.entOverrides.section_22_cell_0_2",
        "commercial.entOverrides.section_22_cell_0_3",
        "commercial.entOverrides.section_22_cell_0_4"
      ],
      [
        "commercial.entOverrides.section_22_cell_1_0",
        "commercial.entOverrides.section_22_cell_1_1",
        "commercial.entOverrides.section_22_cell_1_2",
        "commercial.entOverrides.section_22_cell_1_3",
        "commercial.entOverrides.section_22_cell_1_4"
      ],
      [
        "commercial.entOverrides.section_22_cell_2_0",
        "commercial.entOverrides.section_22_cell_2_1",
        "commercial.entOverrides.section_22_cell_2_2",
        "commercial.entOverrides.section_22_cell_2_3",
        "commercial.entOverrides.section_22_cell_2_4"
      ],
      [
        "commercial.entOverrides.section_22_cell_3_0",
        "commercial.entOverrides.section_22_cell_3_1",
        "commercial.entOverrides.section_22_cell_3_2",
        "commercial.entOverrides.section_22_cell_3_3",
        "commercial.entOverrides.section_22_cell_3_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.entOverrides.section_23_title",
    "contentKey": "commercial.entOverrides.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entOverrides.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.entOverrides.section_25_item_0",
      "commercial.entOverrides.section_25_item_1",
      "commercial.entOverrides.section_25_item_2"
    ]
  }
],
  relatedSlugs: [
  "commercial/entitlements-features",
  "commercial/entitlements-subscriptions",
  "commercial/entitlements-overview"
],
  lastUpdated: "2026-06-09",
});
