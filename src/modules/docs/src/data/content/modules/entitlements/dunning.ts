import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/dunning",
  titleKey: "modules.dunning.title",
  category: "modules",
  order: 8,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    A[\"Payment fails\"]\n    B{{\"Stage 1: PaymentFailed email (Day 0)\"}}\n    C([\"Stripe Smart Retry (Days 1-3)\"])\n    D{{\"Still failing? → Stage 2: GraceWarning email\"}}\n    E{{\"PastDue status, yellow banner shown\"}}\n    F[\"≤2 days left → Stage 3: GraceFinalWarning email\"]\n    G[\"Grace expires → Stage 4: Suspend subscription\"]\n    H[\"All tenant admins deactivated\"]\n    I[\"Extended grace expires → Cancel + Fallback edition\"]\n    J([\"Payment recovered? → Reactivate\"])\n    A --> B\n    B --> C\n    C --> D\n    D --> E\n    E --> F\n    F --> G\n    G --> H\n    H --> I\n    G -.->|\"if payment recovered\"| J",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.dunning.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.dunning.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.dunning.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.dunning.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_12_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_14_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.dunning.section_15_hdr_0",
      "modules.dunning.section_15_hdr_1",
      "modules.dunning.section_15_hdr_2"
    ],
    "rows": [
      [
        "modules.dunning.section_15_cell_0_0",
        "modules.dunning.section_15_cell_0_1",
        "modules.dunning.section_15_cell_0_2"
      ],
      [
        "modules.dunning.section_15_cell_1_0",
        "modules.dunning.section_15_cell_1_1",
        "modules.dunning.section_15_cell_1_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_16_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"BackgroundJobs\": {\n    \"Jobs\": {\n      \"entitlements-subscription-reconciliation\": {\n        \"Enabled\": true,\n        \"CronExpression\": \"0 3 * * *\"\n      },\n      \"entitlements-dunning-notification\": {\n        \"Enabled\": true,\n        \"CronExpression\": \"0 4 * * *\"\n      }\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_19_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_21_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.dunning.section_22_title",
    "contentKey": "modules.dunning.section_22_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_24_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_26_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.dunning.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_28_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.dunning.section_30_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.dunning.section_31_item_0",
      "modules.dunning.section_31_item_1",
      "modules.dunning.section_31_item_2",
      "modules.dunning.section_31_item_3"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.dunning.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.dunning.section_33_item_0",
      "modules.dunning.section_33_item_1",
      "modules.dunning.section_33_item_2",
      "modules.dunning.section_33_item_3"
    ]
  }
],
  relatedSlugs: [
  "modules/billing-engine",
  "modules/invoices",
  "modules/subscriptions",
  "features/notification-system"
],
  lastUpdated: "2026-06-09",
});
