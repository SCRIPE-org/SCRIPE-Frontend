import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/system-api",
  titleKey: "apiReference.systemApi.title",
  category: "api-reference",
  order: 8,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_4_hdr_0",
      "apiReference.systemApi.section_4_hdr_1",
      "apiReference.systemApi.section_4_hdr_2",
      "apiReference.systemApi.section_4_hdr_3",
      "apiReference.systemApi.section_4_hdr_4"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_4_cell_0_0",
        "apiReference.systemApi.section_4_cell_0_1",
        "apiReference.systemApi.section_4_cell_0_2",
        "apiReference.systemApi.section_4_cell_0_3",
        "apiReference.systemApi.section_4_cell_0_4"
      ],
      [
        "apiReference.systemApi.section_4_cell_1_0",
        "apiReference.systemApi.section_4_cell_1_1",
        "apiReference.systemApi.section_4_cell_1_2",
        "apiReference.systemApi.section_4_cell_1_3",
        "apiReference.systemApi.section_4_cell_1_4"
      ],
      [
        "apiReference.systemApi.section_4_cell_2_0",
        "apiReference.systemApi.section_4_cell_2_1",
        "apiReference.systemApi.section_4_cell_2_2",
        "apiReference.systemApi.section_4_cell_2_3",
        "apiReference.systemApi.section_4_cell_2_4"
      ],
      [
        "apiReference.systemApi.section_4_cell_3_0",
        "apiReference.systemApi.section_4_cell_3_1",
        "apiReference.systemApi.section_4_cell_3_2",
        "apiReference.systemApi.section_4_cell_3_3",
        "apiReference.systemApi.section_4_cell_3_4"
      ],
      [
        "apiReference.systemApi.section_4_cell_4_0",
        "apiReference.systemApi.section_4_cell_4_1",
        "apiReference.systemApi.section_4_cell_4_2",
        "apiReference.systemApi.section_4_cell_4_3",
        "apiReference.systemApi.section_4_cell_4_4"
      ],
      [
        "apiReference.systemApi.section_4_cell_5_0",
        "apiReference.systemApi.section_4_cell_5_1",
        "apiReference.systemApi.section_4_cell_5_2",
        "apiReference.systemApi.section_4_cell_5_3",
        "apiReference.systemApi.section_4_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.systemApi.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_6_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"totalAdmins\": 25,\n  \"activeAdmins\": 22,\n  \"totalUsers\": 1500,\n  \"activeUsers\": 1340,\n  \"totalTenants\": 8,\n  \"activeTenants\": 7,\n  \"totalRoles\": 12,\n  \"todayLogins\": 45,\n  \"failedLoginsToday\": 3,\n  \"storageUsedMB\": 2400,\n  \"pendingNotifications\": 12\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.systemApi.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"period\": \"7d\",\n  \"data\": [\n    { \"date\": \"2026-02-14\", \"successful\": 42, \"failed\": 2 },\n    { \"date\": \"2026-02-15\", \"successful\": 38, \"failed\": 0 },\n    { \"date\": \"2026-02-16\", \"successful\": 55, \"failed\": 5 },\n    { \"date\": \"2026-02-17\", \"successful\": 61, \"failed\": 1 },\n    { \"date\": \"2026-02-18\", \"successful\": 44, \"failed\": 3 },\n    { \"date\": \"2026-02-19\", \"successful\": 50, \"failed\": 2 },\n    { \"date\": \"2026-02-20\", \"successful\": 33, \"failed\": 0 }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.systemApi.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_12_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"threats\": 12,\n  \"failedLogins\": 15,\n  \"blockedIPs\": 3,\n  \"suspiciousActivities\": 2,\n  \"events\": [\n    {\n      \"type\": \"brute_force_detected\",\n      \"ip\": \"192.168.1.100\",\n      \"attempts\": 25,\n      \"timestamp\": \"2026-02-20T10:15:00Z\"\n    },\n    {\n      \"type\": \"account_locked\",\n      \"userId\": \"user-uuid\",\n      \"email\": \"user@example.com\",\n      \"timestamp\": \"2026-02-20T11:30:00Z\"\n    }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_15_hdr_0",
      "apiReference.systemApi.section_15_hdr_1",
      "apiReference.systemApi.section_15_hdr_2",
      "apiReference.systemApi.section_15_hdr_3",
      "apiReference.systemApi.section_15_hdr_4"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_15_cell_0_0",
        "apiReference.systemApi.section_15_cell_0_1",
        "apiReference.systemApi.section_15_cell_0_2",
        "apiReference.systemApi.section_15_cell_0_3",
        "apiReference.systemApi.section_15_cell_0_4"
      ],
      [
        "apiReference.systemApi.section_15_cell_1_0",
        "apiReference.systemApi.section_15_cell_1_1",
        "apiReference.systemApi.section_15_cell_1_2",
        "apiReference.systemApi.section_15_cell_1_3",
        "apiReference.systemApi.section_15_cell_1_4"
      ],
      [
        "apiReference.systemApi.section_15_cell_2_0",
        "apiReference.systemApi.section_15_cell_2_1",
        "apiReference.systemApi.section_15_cell_2_2",
        "apiReference.systemApi.section_15_cell_2_3",
        "apiReference.systemApi.section_15_cell_2_4"
      ]
    ]
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_16_hdr_0",
      "apiReference.systemApi.section_16_hdr_1",
      "apiReference.systemApi.section_16_hdr_2"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_16_cell_0_0",
        "apiReference.systemApi.section_16_cell_0_1",
        "apiReference.systemApi.section_16_cell_0_2"
      ],
      [
        "apiReference.systemApi.section_16_cell_1_0",
        "apiReference.systemApi.section_16_cell_1_1",
        "apiReference.systemApi.section_16_cell_1_2"
      ],
      [
        "apiReference.systemApi.section_16_cell_2_0",
        "apiReference.systemApi.section_16_cell_2_1",
        "apiReference.systemApi.section_16_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_18_hdr_0",
      "apiReference.systemApi.section_18_hdr_1",
      "apiReference.systemApi.section_18_hdr_2",
      "apiReference.systemApi.section_18_hdr_3",
      "apiReference.systemApi.section_18_hdr_4"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_18_cell_0_0",
        "apiReference.systemApi.section_18_cell_0_1",
        "apiReference.systemApi.section_18_cell_0_2",
        "apiReference.systemApi.section_18_cell_0_3",
        "apiReference.systemApi.section_18_cell_0_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_1_0",
        "apiReference.systemApi.section_18_cell_1_1",
        "apiReference.systemApi.section_18_cell_1_2",
        "apiReference.systemApi.section_18_cell_1_3",
        "apiReference.systemApi.section_18_cell_1_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_2_0",
        "apiReference.systemApi.section_18_cell_2_1",
        "apiReference.systemApi.section_18_cell_2_2",
        "apiReference.systemApi.section_18_cell_2_3",
        "apiReference.systemApi.section_18_cell_2_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_3_0",
        "apiReference.systemApi.section_18_cell_3_1",
        "apiReference.systemApi.section_18_cell_3_2",
        "apiReference.systemApi.section_18_cell_3_3",
        "apiReference.systemApi.section_18_cell_3_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_4_0",
        "apiReference.systemApi.section_18_cell_4_1",
        "apiReference.systemApi.section_18_cell_4_2",
        "apiReference.systemApi.section_18_cell_4_3",
        "apiReference.systemApi.section_18_cell_4_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_5_0",
        "apiReference.systemApi.section_18_cell_5_1",
        "apiReference.systemApi.section_18_cell_5_2",
        "apiReference.systemApi.section_18_cell_5_3",
        "apiReference.systemApi.section_18_cell_5_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_6_0",
        "apiReference.systemApi.section_18_cell_6_1",
        "apiReference.systemApi.section_18_cell_6_2",
        "apiReference.systemApi.section_18_cell_6_3",
        "apiReference.systemApi.section_18_cell_6_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_7_0",
        "apiReference.systemApi.section_18_cell_7_1",
        "apiReference.systemApi.section_18_cell_7_2",
        "apiReference.systemApi.section_18_cell_7_3",
        "apiReference.systemApi.section_18_cell_7_4"
      ],
      [
        "apiReference.systemApi.section_18_cell_8_0",
        "apiReference.systemApi.section_18_cell_8_1",
        "apiReference.systemApi.section_18_cell_8_2",
        "apiReference.systemApi.section_18_cell_8_3",
        "apiReference.systemApi.section_18_cell_8_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_19_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "[\n  {\n    \"id\": \"menu-1\",\n    \"title\": \"Dashboard\",\n    \"icon\": \"LayoutDashboard\",\n    \"path\": \"/dashboard\",\n    \"order\": 1,\n    \"children\": []\n  },\n  {\n    \"id\": \"menu-2\",\n    \"title\": \"User Management\",\n    \"icon\": \"Users\",\n    \"path\": null,\n    \"order\": 2,\n    \"children\": [\n      { \"id\": \"menu-3\", \"title\": \"Users\", \"path\": \"/users\", \"order\": 1 },\n      { \"id\": \"menu-4\", \"title\": \"Roles\", \"path\": \"/roles\", \"order\": 2 }\n    ]\n  }\n]",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_22_hdr_0",
      "apiReference.systemApi.section_22_hdr_1",
      "apiReference.systemApi.section_22_hdr_2",
      "apiReference.systemApi.section_22_hdr_3",
      "apiReference.systemApi.section_22_hdr_4"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_22_cell_0_0",
        "apiReference.systemApi.section_22_cell_0_1",
        "apiReference.systemApi.section_22_cell_0_2",
        "apiReference.systemApi.section_22_cell_0_3",
        "apiReference.systemApi.section_22_cell_0_4"
      ],
      [
        "apiReference.systemApi.section_22_cell_1_0",
        "apiReference.systemApi.section_22_cell_1_1",
        "apiReference.systemApi.section_22_cell_1_2",
        "apiReference.systemApi.section_22_cell_1_3",
        "apiReference.systemApi.section_22_cell_1_4"
      ],
      [
        "apiReference.systemApi.section_22_cell_2_0",
        "apiReference.systemApi.section_22_cell_2_1",
        "apiReference.systemApi.section_22_cell_2_2",
        "apiReference.systemApi.section_22_cell_2_3",
        "apiReference.systemApi.section_22_cell_2_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_23_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"items\": [\n    {\n      \"id\": \"entity-uuid\",\n      \"entityType\": \"Admin\",\n      \"displayName\": \"John Doe (john@acme.com)\",\n      \"deletedBy\": \"SuperAdmin\",\n      \"deletedAt\": \"2026-02-19T14:30:00Z\",\n      \"canRestore\": true\n    }\n  ],\n  \"totalCount\": 5\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_26_hdr_0",
      "apiReference.systemApi.section_26_hdr_1",
      "apiReference.systemApi.section_26_hdr_2",
      "apiReference.systemApi.section_26_hdr_3",
      "apiReference.systemApi.section_26_hdr_4"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_26_cell_0_0",
        "apiReference.systemApi.section_26_cell_0_1",
        "apiReference.systemApi.section_26_cell_0_2",
        "apiReference.systemApi.section_26_cell_0_3",
        "apiReference.systemApi.section_26_cell_0_4"
      ],
      [
        "apiReference.systemApi.section_26_cell_1_0",
        "apiReference.systemApi.section_26_cell_1_1",
        "apiReference.systemApi.section_26_cell_1_2",
        "apiReference.systemApi.section_26_cell_1_3",
        "apiReference.systemApi.section_26_cell_1_4"
      ],
      [
        "apiReference.systemApi.section_26_cell_2_0",
        "apiReference.systemApi.section_26_cell_2_1",
        "apiReference.systemApi.section_26_cell_2_2",
        "apiReference.systemApi.section_26_cell_2_3",
        "apiReference.systemApi.section_26_cell_2_4"
      ]
    ]
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_27_hdr_0",
      "apiReference.systemApi.section_27_hdr_1"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_27_cell_0_0",
        "apiReference.systemApi.section_27_cell_0_1"
      ],
      [
        "apiReference.systemApi.section_27_cell_1_0",
        "apiReference.systemApi.section_27_cell_1_1"
      ],
      [
        "apiReference.systemApi.section_27_cell_2_0",
        "apiReference.systemApi.section_27_cell_2_1"
      ],
      [
        "apiReference.systemApi.section_27_cell_3_0",
        "apiReference.systemApi.section_27_cell_3_1"
      ],
      [
        "apiReference.systemApi.section_27_cell_4_0",
        "apiReference.systemApi.section_27_cell_4_1"
      ],
      [
        "apiReference.systemApi.section_27_cell_5_0",
        "apiReference.systemApi.section_27_cell_5_1"
      ],
      [
        "apiReference.systemApi.section_27_cell_6_0",
        "apiReference.systemApi.section_27_cell_6_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_29_hdr_0",
      "apiReference.systemApi.section_29_hdr_1",
      "apiReference.systemApi.section_29_hdr_2",
      "apiReference.systemApi.section_29_hdr_3",
      "apiReference.systemApi.section_29_hdr_4"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_29_cell_0_0",
        "apiReference.systemApi.section_29_cell_0_1",
        "apiReference.systemApi.section_29_cell_0_2",
        "apiReference.systemApi.section_29_cell_0_3",
        "apiReference.systemApi.section_29_cell_0_4"
      ],
      [
        "apiReference.systemApi.section_29_cell_1_0",
        "apiReference.systemApi.section_29_cell_1_1",
        "apiReference.systemApi.section_29_cell_1_2",
        "apiReference.systemApi.section_29_cell_1_3",
        "apiReference.systemApi.section_29_cell_1_4"
      ],
      [
        "apiReference.systemApi.section_29_cell_2_0",
        "apiReference.systemApi.section_29_cell_2_1",
        "apiReference.systemApi.section_29_cell_2_2",
        "apiReference.systemApi.section_29_cell_2_3",
        "apiReference.systemApi.section_29_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.systemApi.section_31_hdr_0",
      "apiReference.systemApi.section_31_hdr_1",
      "apiReference.systemApi.section_31_hdr_2",
      "apiReference.systemApi.section_31_hdr_3",
      "apiReference.systemApi.section_31_hdr_4"
    ],
    "rows": [
      [
        "apiReference.systemApi.section_31_cell_0_0",
        "apiReference.systemApi.section_31_cell_0_1",
        "apiReference.systemApi.section_31_cell_0_2",
        "apiReference.systemApi.section_31_cell_0_3",
        "apiReference.systemApi.section_31_cell_0_4"
      ],
      [
        "apiReference.systemApi.section_31_cell_1_0",
        "apiReference.systemApi.section_31_cell_1_1",
        "apiReference.systemApi.section_31_cell_1_2",
        "apiReference.systemApi.section_31_cell_1_3",
        "apiReference.systemApi.section_31_cell_1_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.systemApi.section_32_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"status\": \"Healthy\",\n  \"totalDuration\": \"00:00:00.1234567\",\n  \"entries\": {\n    \"database\": { \"status\": \"Healthy\", \"duration\": \"00:00:00.0521\" },\n    \"cache\": { \"status\": \"Healthy\", \"duration\": \"00:00:00.0012\" },\n    \"blob-storage\": { \"status\": \"Healthy\", \"duration\": \"00:00:00.0345\" },\n    \"hangfire\": { \"status\": \"Healthy\", \"duration\": \"00:00:00.0089\" }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.systemApi.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.systemApi.section_35_item_0",
      "apiReference.systemApi.section_35_item_1",
      "apiReference.systemApi.section_35_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/admin-api",
  "security/audit-compliance",
  "api-reference/webhook-email-api"
],
  lastUpdated: "2026-06-09",
});
