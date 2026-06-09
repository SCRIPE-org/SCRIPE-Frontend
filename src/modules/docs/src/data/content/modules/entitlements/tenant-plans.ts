import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/tenant-plans",
  titleKey: "modules.tenantPlans.title",
  category: "modules",
  order: 9,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    A([\"SCRIPE Platform (Operator)\"])\n    B([\"Tier 1: Editions → Tenants\"])\n    C[\"Tenant Admin\"]\n    D([\"Tier 2: TenantPlans → Users\"])\n    E([\"End Users (UserSubscription)\"])\n    A --> B\n    B --> C\n    C --> D\n    D --> E",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_6_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.tenantPlans.section_7_hdr_0",
      "modules.tenantPlans.section_7_hdr_1",
      "modules.tenantPlans.section_7_hdr_2"
    ],
    "rows": [
      [
        "modules.tenantPlans.section_7_cell_0_0",
        "modules.tenantPlans.section_7_cell_0_1",
        "modules.tenantPlans.section_7_cell_0_2"
      ],
      [
        "modules.tenantPlans.section_7_cell_1_0",
        "modules.tenantPlans.section_7_cell_1_1",
        "modules.tenantPlans.section_7_cell_1_2"
      ],
      [
        "modules.tenantPlans.section_7_cell_2_0",
        "modules.tenantPlans.section_7_cell_2_1",
        "modules.tenantPlans.section_7_cell_2_2"
      ],
      [
        "modules.tenantPlans.section_7_cell_3_0",
        "modules.tenantPlans.section_7_cell_3_1",
        "modules.tenantPlans.section_7_cell_3_2"
      ],
      [
        "modules.tenantPlans.section_7_cell_4_0",
        "modules.tenantPlans.section_7_cell_4_1",
        "modules.tenantPlans.section_7_cell_4_2",
        "modules.tenantPlans.section_7_cell_4_3",
        "modules.tenantPlans.section_7_cell_4_4",
        "modules.tenantPlans.section_7_cell_4_5"
      ],
      [
        "modules.tenantPlans.section_7_cell_5_0",
        "modules.tenantPlans.section_7_cell_5_1",
        "modules.tenantPlans.section_7_cell_5_2"
      ],
      [
        "modules.tenantPlans.section_7_cell_6_0",
        "modules.tenantPlans.section_7_cell_6_1",
        "modules.tenantPlans.section_7_cell_6_2"
      ],
      [
        "modules.tenantPlans.section_7_cell_7_0",
        "modules.tenantPlans.section_7_cell_7_1",
        "modules.tenantPlans.section_7_cell_7_2"
      ],
      [
        "modules.tenantPlans.section_7_cell_8_0",
        "modules.tenantPlans.section_7_cell_8_1",
        "modules.tenantPlans.section_7_cell_8_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Example TenantPlanFeature records for a \"Pro\" plan\n[\n  { \"Key\": \"maxProjects\", \"Value\": \"50\" },\n  { \"Key\": \"apiAccess\", \"Value\": \"true\" },\n  { \"Key\": \"supportLevel\", \"Value\": \"priority\" },\n  { \"Key\": \"storageGb\", \"Value\": \"100\" }\n]",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_12_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_14_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.tenantPlans.section_15_title",
    "contentKey": "modules.tenantPlans.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_17_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.tenantPlans.section_18_hdr_0",
      "modules.tenantPlans.section_18_hdr_1",
      "modules.tenantPlans.section_18_hdr_2",
      "modules.tenantPlans.section_18_hdr_3",
      "modules.tenantPlans.section_18_hdr_4"
    ],
    "rows": [
      [
        "modules.tenantPlans.section_18_cell_0_0",
        "modules.tenantPlans.section_18_cell_0_1",
        "modules.tenantPlans.section_18_cell_0_2",
        "modules.tenantPlans.section_18_cell_0_3",
        "modules.tenantPlans.section_18_cell_0_4"
      ],
      [
        "modules.tenantPlans.section_18_cell_1_0",
        "modules.tenantPlans.section_18_cell_1_1",
        "modules.tenantPlans.section_18_cell_1_2",
        "modules.tenantPlans.section_18_cell_1_3",
        "modules.tenantPlans.section_18_cell_1_4"
      ],
      [
        "modules.tenantPlans.section_18_cell_2_0",
        "modules.tenantPlans.section_18_cell_2_1",
        "modules.tenantPlans.section_18_cell_2_2",
        "modules.tenantPlans.section_18_cell_2_3",
        "modules.tenantPlans.section_18_cell_2_4"
      ],
      [
        "modules.tenantPlans.section_18_cell_3_0",
        "modules.tenantPlans.section_18_cell_3_1",
        "modules.tenantPlans.section_18_cell_3_2",
        "modules.tenantPlans.section_18_cell_3_3",
        "modules.tenantPlans.section_18_cell_3_4"
      ],
      [
        "modules.tenantPlans.section_18_cell_4_0",
        "modules.tenantPlans.section_18_cell_4_1",
        "modules.tenantPlans.section_18_cell_4_2",
        "modules.tenantPlans.section_18_cell_4_3",
        "modules.tenantPlans.section_18_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.tenantPlans.section_20_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.tenantPlans.section_21_hdr_0",
      "modules.tenantPlans.section_21_hdr_1"
    ],
    "rows": [
      [
        "modules.tenantPlans.section_21_cell_0_0",
        "modules.tenantPlans.section_21_cell_0_1"
      ],
      [
        "modules.tenantPlans.section_21_cell_1_0",
        "modules.tenantPlans.section_21_cell_1_1"
      ],
      [
        "modules.tenantPlans.section_21_cell_2_0",
        "modules.tenantPlans.section_21_cell_2_1"
      ],
      [
        "modules.tenantPlans.section_21_cell_3_0",
        "modules.tenantPlans.section_21_cell_3_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.tenantPlans.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.tenantPlans.section_23_item_0",
      "modules.tenantPlans.section_23_item_1",
      "modules.tenantPlans.section_23_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/user-subscriptions",
  "modules/entitlements-overview",
  "features/tenant-context-gate"
],
  lastUpdated: "2026-06-09",
});
