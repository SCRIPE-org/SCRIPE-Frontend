import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/user-subscriptions",
  titleKey: "modules.userSubscriptions.title",
  category: "modules",
  order: 10,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.userSubscriptions.section_4_hdr_0",
      "modules.userSubscriptions.section_4_hdr_1",
      "modules.userSubscriptions.section_4_hdr_2"
    ],
    "rows": [
      [
        "modules.userSubscriptions.section_4_cell_0_0",
        "modules.userSubscriptions.section_4_cell_0_1",
        "modules.userSubscriptions.section_4_cell_0_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_1_0",
        "modules.userSubscriptions.section_4_cell_1_1",
        "modules.userSubscriptions.section_4_cell_1_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_2_0",
        "modules.userSubscriptions.section_4_cell_2_1",
        "modules.userSubscriptions.section_4_cell_2_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_3_0",
        "modules.userSubscriptions.section_4_cell_3_1",
        "modules.userSubscriptions.section_4_cell_3_2",
        "modules.userSubscriptions.section_4_cell_3_3",
        "modules.userSubscriptions.section_4_cell_3_4",
        "modules.userSubscriptions.section_4_cell_3_5",
        "modules.userSubscriptions.section_4_cell_3_6",
        "modules.userSubscriptions.section_4_cell_3_7"
      ],
      [
        "modules.userSubscriptions.section_4_cell_4_0",
        "modules.userSubscriptions.section_4_cell_4_1",
        "modules.userSubscriptions.section_4_cell_4_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_5_0",
        "modules.userSubscriptions.section_4_cell_5_1",
        "modules.userSubscriptions.section_4_cell_5_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_6_0",
        "modules.userSubscriptions.section_4_cell_6_1",
        "modules.userSubscriptions.section_4_cell_6_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_7_0",
        "modules.userSubscriptions.section_4_cell_7_1",
        "modules.userSubscriptions.section_4_cell_7_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_8_0",
        "modules.userSubscriptions.section_4_cell_8_1",
        "modules.userSubscriptions.section_4_cell_8_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_9_0",
        "modules.userSubscriptions.section_4_cell_9_1",
        "modules.userSubscriptions.section_4_cell_9_2"
      ],
      [
        "modules.userSubscriptions.section_4_cell_10_0",
        "modules.userSubscriptions.section_4_cell_10_1",
        "modules.userSubscriptions.section_4_cell_10_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_6_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    free[\"Free\"]\n    trial([\"Trial\"])\n    active([\"Active\"])\n    pastdue{{\"PastDue\"}}\n    cancelled[\"Cancelled\"]\n    expired[\"Expired\"]\n    free -->|\"assign trial plan\"| trial\n    free -->|\"assign paid plan\"| active\n    trial -->|\"trial ends + auto-renew\"| active\n    trial -->|\"trial ends, no renew\"| expired\n    active -->|\"payment fails\"| pastdue\n    active -->|\"manual cancel\"| cancelled\n    active -->|\"period ends, no renew\"| expired\n    pastdue -.->|\"payment recovered\"| active\n    pastdue -->|\"grace expires\"| expired",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "modules.userSubscriptions.section_8_hdr_0",
      "modules.userSubscriptions.section_8_hdr_1",
      "modules.userSubscriptions.section_8_hdr_2"
    ],
    "rows": [
      [
        "modules.userSubscriptions.section_8_cell_0_0",
        "modules.userSubscriptions.section_8_cell_0_1",
        "modules.userSubscriptions.section_8_cell_0_2"
      ],
      [
        "modules.userSubscriptions.section_8_cell_1_0",
        "modules.userSubscriptions.section_8_cell_1_1",
        "modules.userSubscriptions.section_8_cell_1_2"
      ],
      [
        "modules.userSubscriptions.section_8_cell_2_0",
        "modules.userSubscriptions.section_8_cell_2_1",
        "modules.userSubscriptions.section_8_cell_2_2"
      ],
      [
        "modules.userSubscriptions.section_8_cell_3_0",
        "modules.userSubscriptions.section_8_cell_3_1",
        "modules.userSubscriptions.section_8_cell_3_2"
      ],
      [
        "modules.userSubscriptions.section_8_cell_4_0",
        "modules.userSubscriptions.section_8_cell_4_1",
        "modules.userSubscriptions.section_8_cell_4_2"
      ],
      [
        "modules.userSubscriptions.section_8_cell_5_0",
        "modules.userSubscriptions.section_8_cell_5_1",
        "modules.userSubscriptions.section_8_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_10_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_11_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Resolve features for a user\nvar features = await _userFeatureChecker.GetFeaturesAsync(userId);\n// Returns key/value dict from the user's active TenantPlanFeature records\n\n// Check a specific feature\nbool hasApiAccess = features.ContainsKey(\"apiAccess\") && features[\"apiAccess\"] == \"true\";\nint maxProjects = int.Parse(features.GetValueOrDefault(\"maxProjects\", \"-1\"));",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_14_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.userSubscriptions.section_15_hdr_0",
      "modules.userSubscriptions.section_15_hdr_1",
      "modules.userSubscriptions.section_15_hdr_2"
    ],
    "rows": [
      [
        "modules.userSubscriptions.section_15_cell_0_0",
        "modules.userSubscriptions.section_15_cell_0_1",
        "modules.userSubscriptions.section_15_cell_0_2"
      ],
      [
        "modules.userSubscriptions.section_15_cell_1_0",
        "modules.userSubscriptions.section_15_cell_1_1",
        "modules.userSubscriptions.section_15_cell_1_2"
      ],
      [
        "modules.userSubscriptions.section_15_cell_2_0",
        "modules.userSubscriptions.section_15_cell_2_1",
        "modules.userSubscriptions.section_15_cell_2_2"
      ],
      [
        "modules.userSubscriptions.section_15_cell_3_0",
        "modules.userSubscriptions.section_15_cell_3_1",
        "modules.userSubscriptions.section_15_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_17_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.userSubscriptions.section_18_title",
    "contentKey": "modules.userSubscriptions.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_20_content"
  },
  {
    "type": "code",
    "language": "http",
    "code": "GET /api/v1/user-subscriptions/me\nAuthorization: Bearer <user-jwt>\n\n// Response\n{\n  \"id\": \"encrypted-id\",\n  \"planId\": \"encrypted-id\",\n  \"planName\": \"Pro\",\n  \"status\": \"Active\",\n  \"startDate\": \"2026-04-01T00:00:00Z\",\n  \"endDate\": \"2026-05-01T00:00:00Z\",\n  \"autoRenew\": true\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_23_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.userSubscriptions.section_24_item_0",
      "modules.userSubscriptions.section_24_item_1",
      "modules.userSubscriptions.section_24_item_2"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.userSubscriptions.section_28_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.userSubscriptions.section_29_hdr_0",
      "modules.userSubscriptions.section_29_hdr_1",
      "modules.userSubscriptions.section_29_hdr_2",
      "modules.userSubscriptions.section_29_hdr_3",
      "modules.userSubscriptions.section_29_hdr_4"
    ],
    "rows": [
      [
        "modules.userSubscriptions.section_29_cell_0_0",
        "modules.userSubscriptions.section_29_cell_0_1",
        "modules.userSubscriptions.section_29_cell_0_2",
        "modules.userSubscriptions.section_29_cell_0_3",
        "modules.userSubscriptions.section_29_cell_0_4"
      ],
      [
        "modules.userSubscriptions.section_29_cell_1_0",
        "modules.userSubscriptions.section_29_cell_1_1",
        "modules.userSubscriptions.section_29_cell_1_2",
        "modules.userSubscriptions.section_29_cell_1_3",
        "modules.userSubscriptions.section_29_cell_1_4"
      ],
      [
        "modules.userSubscriptions.section_29_cell_2_0",
        "modules.userSubscriptions.section_29_cell_2_1",
        "modules.userSubscriptions.section_29_cell_2_2",
        "modules.userSubscriptions.section_29_cell_2_3",
        "modules.userSubscriptions.section_29_cell_2_4"
      ],
      [
        "modules.userSubscriptions.section_29_cell_3_0",
        "modules.userSubscriptions.section_29_cell_3_1",
        "modules.userSubscriptions.section_29_cell_3_2",
        "modules.userSubscriptions.section_29_cell_3_3",
        "modules.userSubscriptions.section_29_cell_3_4"
      ],
      [
        "modules.userSubscriptions.section_29_cell_4_0",
        "modules.userSubscriptions.section_29_cell_4_1",
        "modules.userSubscriptions.section_29_cell_4_2",
        "modules.userSubscriptions.section_29_cell_4_3",
        "modules.userSubscriptions.section_29_cell_4_4"
      ],
      [
        "modules.userSubscriptions.section_29_cell_5_0",
        "modules.userSubscriptions.section_29_cell_5_1",
        "modules.userSubscriptions.section_29_cell_5_2",
        "modules.userSubscriptions.section_29_cell_5_3",
        "modules.userSubscriptions.section_29_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.userSubscriptions.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.userSubscriptions.section_31_item_0",
      "modules.userSubscriptions.section_31_item_1",
      "modules.userSubscriptions.section_31_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/tenant-plans",
  "modules/subscriptions",
  "features/tenant-context-gate"
],
  lastUpdated: "2026-06-09",
});
