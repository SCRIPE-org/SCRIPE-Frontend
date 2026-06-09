import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/subscriptions",
  titleKey: "modules.subscriptions.title",
  category: "modules",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.subscriptions.section_4_hdr_0",
      "modules.subscriptions.section_4_hdr_1",
      "modules.subscriptions.section_4_hdr_2"
    ],
    "rows": [
      [
        "modules.subscriptions.section_4_cell_0_0",
        "modules.subscriptions.section_4_cell_0_1",
        "modules.subscriptions.section_4_cell_0_2"
      ],
      [
        "modules.subscriptions.section_4_cell_1_0",
        "modules.subscriptions.section_4_cell_1_1",
        "modules.subscriptions.section_4_cell_1_2"
      ],
      [
        "modules.subscriptions.section_4_cell_2_0",
        "modules.subscriptions.section_4_cell_2_1",
        "modules.subscriptions.section_4_cell_2_2"
      ],
      [
        "modules.subscriptions.section_4_cell_3_0",
        "modules.subscriptions.section_4_cell_3_1",
        "modules.subscriptions.section_4_cell_3_2"
      ],
      [
        "modules.subscriptions.section_4_cell_4_0",
        "modules.subscriptions.section_4_cell_4_1",
        "modules.subscriptions.section_4_cell_4_2"
      ],
      [
        "modules.subscriptions.section_4_cell_5_0",
        "modules.subscriptions.section_4_cell_5_1",
        "modules.subscriptions.section_4_cell_5_2"
      ],
      [
        "modules.subscriptions.section_4_cell_6_0",
        "modules.subscriptions.section_4_cell_6_1",
        "modules.subscriptions.section_4_cell_6_2"
      ],
      [
        "modules.subscriptions.section_4_cell_7_0",
        "modules.subscriptions.section_4_cell_7_1",
        "modules.subscriptions.section_4_cell_7_2"
      ],
      [
        "modules.subscriptions.section_4_cell_8_0",
        "modules.subscriptions.section_4_cell_8_1",
        "modules.subscriptions.section_4_cell_8_2"
      ],
      [
        "modules.subscriptions.section_4_cell_9_0",
        "modules.subscriptions.section_4_cell_9_1",
        "modules.subscriptions.section_4_cell_9_2"
      ],
      [
        "modules.subscriptions.section_4_cell_10_0",
        "modules.subscriptions.section_4_cell_10_1",
        "modules.subscriptions.section_4_cell_10_2"
      ],
      [
        "modules.subscriptions.section_4_cell_11_0",
        "modules.subscriptions.section_4_cell_11_1",
        "modules.subscriptions.section_4_cell_11_2"
      ],
      [
        "modules.subscriptions.section_4_cell_12_0",
        "modules.subscriptions.section_4_cell_12_1",
        "modules.subscriptions.section_4_cell_12_2"
      ],
      [
        "modules.subscriptions.section_4_cell_13_0",
        "modules.subscriptions.section_4_cell_13_1",
        "modules.subscriptions.section_4_cell_13_2"
      ],
      [
        "modules.subscriptions.section_4_cell_14_0",
        "modules.subscriptions.section_4_cell_14_1",
        "modules.subscriptions.section_4_cell_14_2"
      ],
      [
        "modules.subscriptions.section_4_cell_15_0",
        "modules.subscriptions.section_4_cell_15_1",
        "modules.subscriptions.section_4_cell_15_2"
      ],
      [
        "modules.subscriptions.section_4_cell_16_0",
        "modules.subscriptions.section_4_cell_16_1",
        "modules.subscriptions.section_4_cell_16_2"
      ],
      [
        "modules.subscriptions.section_4_cell_17_0",
        "modules.subscriptions.section_4_cell_17_1",
        "modules.subscriptions.section_4_cell_17_2"
      ],
      [
        "modules.subscriptions.section_4_cell_18_0",
        "modules.subscriptions.section_4_cell_18_1",
        "modules.subscriptions.section_4_cell_18_2"
      ],
      [
        "modules.subscriptions.section_4_cell_19_0",
        "modules.subscriptions.section_4_cell_19_1",
        "modules.subscriptions.section_4_cell_19_2"
      ],
      [
        "modules.subscriptions.section_4_cell_20_0",
        "modules.subscriptions.section_4_cell_20_1",
        "modules.subscriptions.section_4_cell_20_2"
      ],
      [
        "modules.subscriptions.section_4_cell_21_0",
        "modules.subscriptions.section_4_cell_21_1",
        "modules.subscriptions.section_4_cell_21_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_6_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    pending[\"Pending\"]\n    %% pending: Awaiting activation\n    active[\"Active\"]\n    %% active: Full access\n    suspended[\"Suspended\"]\n    %% suspended: Access paused\n    cancelled[\"Cancelled\"]\n    %% cancelled: Terminated\n    expired[\"Expired\"]\n    %% expired: Past end date\n    pending -->|\"Activate\"| active\n    active -->|\"Suspend\"| suspended\n    suspended -->|\"Resume\"| active\n    active -->|\"Cancel\"| cancelled\n    active -->|\"End date passes\"| expired",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_9_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.subscriptions.section_10_hdr_0",
      "modules.subscriptions.section_10_hdr_1",
      "modules.subscriptions.section_10_hdr_2",
      "modules.subscriptions.section_10_hdr_3",
      "modules.subscriptions.section_10_hdr_4"
    ],
    "rows": [
      [
        "modules.subscriptions.section_10_cell_0_0",
        "modules.subscriptions.section_10_cell_0_1",
        "modules.subscriptions.section_10_cell_0_2",
        "modules.subscriptions.section_10_cell_0_3",
        "modules.subscriptions.section_10_cell_0_4"
      ],
      [
        "modules.subscriptions.section_10_cell_1_0",
        "modules.subscriptions.section_10_cell_1_1",
        "modules.subscriptions.section_10_cell_1_2",
        "modules.subscriptions.section_10_cell_1_3",
        "modules.subscriptions.section_10_cell_1_4"
      ],
      [
        "modules.subscriptions.section_10_cell_2_0",
        "modules.subscriptions.section_10_cell_2_1",
        "modules.subscriptions.section_10_cell_2_2",
        "modules.subscriptions.section_10_cell_2_3",
        "modules.subscriptions.section_10_cell_2_4"
      ],
      [
        "modules.subscriptions.section_10_cell_3_0",
        "modules.subscriptions.section_10_cell_3_1",
        "modules.subscriptions.section_10_cell_3_2",
        "modules.subscriptions.section_10_cell_3_3",
        "modules.subscriptions.section_10_cell_3_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_12_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.subscriptions.section_13_hdr_0",
      "modules.subscriptions.section_13_hdr_1",
      "modules.subscriptions.section_13_hdr_2",
      "modules.subscriptions.section_13_hdr_3"
    ],
    "rows": [
      [
        "modules.subscriptions.section_13_cell_0_0",
        "modules.subscriptions.section_13_cell_0_1",
        "modules.subscriptions.section_13_cell_0_2",
        "modules.subscriptions.section_13_cell_0_3"
      ],
      [
        "modules.subscriptions.section_13_cell_1_0",
        "modules.subscriptions.section_13_cell_1_1",
        "modules.subscriptions.section_13_cell_1_2",
        "modules.subscriptions.section_13_cell_1_3"
      ],
      [
        "modules.subscriptions.section_13_cell_2_0",
        "modules.subscriptions.section_13_cell_2_1",
        "modules.subscriptions.section_13_cell_2_2",
        "modules.subscriptions.section_13_cell_2_3"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_14_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public enum ExpiryBehavior\n{\n    /// <summary>Auto-assign tenant to the default/free edition</summary>\n    Downgrade = 0,\n    \n    /// <summary>Suspend the tenant's access entirely</summary>\n    Suspend = 1,\n    \n    /// <summary>Allow a grace period before suspending</summary>\n    Grace = 2,\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_17_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.subscriptions.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_20_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"tenantId\": \"550e8400-e29b-41d4-a716-446655440000\",\n  \"editionId\": \"660e8400-e29b-41d4-a716-446655440001\",\n  \"subscriptionType\": \"Monthly\",\n  \"autoRenew\": true,\n  \"expiryBehavior\": \"Grace\",\n  \"gracePeriodDays\": 7\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.subscriptions.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_23_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.subscriptions.section_24_title",
    "contentKey": "modules.subscriptions.section_24_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.subscriptions.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_26_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_27_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"canDowngrade\": false,\n  \"impacts\": [\n    {\n      \"featureName\": \"MaxAdmins\",\n      \"currentValue\": \"50\",\n      \"newValue\": \"5\",\n      \"currentUsage\": 12,\n      \"isOverflow\": true,\n      \"overflowAmount\": 7,\n      \"resolution\": \"Must remove 7 admins before downgrading\"\n    },\n    {\n      \"featureName\": \"Chat.Enabled\",\n      \"currentValue\": \"true\",\n      \"newValue\": \"false\",\n      \"currentUsage\": null,\n      \"isOverflow\": false,\n      \"resolution\": \"Feature will be disabled\"\n    }\n  ],\n  \"overflowPolicy\": \"Block\",\n  \"recommendation\": \"Remove 7 admin users or choose a plan with ≥12 admin slots\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.subscriptions.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_30_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    trial[\"Trial\"]\n    %% trial: Free trial period\n    convert[\"Convert\"]\n    %% convert: Choose paid plan\n    paid[\"Paid\"]\n    %% paid: Full subscription\n    exp[\"Expired\"]\n    %% exp: Trial not converted\n    trial -->|\"Upgrade\"| convert\n    convert -->|\"Auto-assign\"| paid\n    trial -->|\"TrialEndDate passes\"| exp",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_33_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.subscriptions.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_35_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_37_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_39_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_40_title",
    "id": "sec_40"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_41_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_42_title",
    "id": "sec_42"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_43_content"
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.subscriptions.section_44_title",
    "contentKey": "modules.subscriptions.section_44_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_45_title",
    "id": "sec_45"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.subscriptions.section_46_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.subscriptions.section_47_hdr_0",
      "modules.subscriptions.section_47_hdr_1",
      "modules.subscriptions.section_47_hdr_2",
      "modules.subscriptions.section_47_hdr_3",
      "modules.subscriptions.section_47_hdr_4"
    ],
    "rows": [
      [
        "modules.subscriptions.section_47_cell_0_0",
        "modules.subscriptions.section_47_cell_0_1",
        "modules.subscriptions.section_47_cell_0_2",
        "modules.subscriptions.section_47_cell_0_3",
        "modules.subscriptions.section_47_cell_0_4"
      ],
      [
        "modules.subscriptions.section_47_cell_1_0",
        "modules.subscriptions.section_47_cell_1_1",
        "modules.subscriptions.section_47_cell_1_2",
        "modules.subscriptions.section_47_cell_1_3",
        "modules.subscriptions.section_47_cell_1_4"
      ],
      [
        "modules.subscriptions.section_47_cell_2_0",
        "modules.subscriptions.section_47_cell_2_1",
        "modules.subscriptions.section_47_cell_2_2",
        "modules.subscriptions.section_47_cell_2_3",
        "modules.subscriptions.section_47_cell_2_4"
      ],
      [
        "modules.subscriptions.section_47_cell_3_0",
        "modules.subscriptions.section_47_cell_3_1",
        "modules.subscriptions.section_47_cell_3_2",
        "modules.subscriptions.section_47_cell_3_3",
        "modules.subscriptions.section_47_cell_3_4"
      ],
      [
        "modules.subscriptions.section_47_cell_4_0",
        "modules.subscriptions.section_47_cell_4_1",
        "modules.subscriptions.section_47_cell_4_2",
        "modules.subscriptions.section_47_cell_4_3",
        "modules.subscriptions.section_47_cell_4_4"
      ],
      [
        "modules.subscriptions.section_47_cell_5_0",
        "modules.subscriptions.section_47_cell_5_1",
        "modules.subscriptions.section_47_cell_5_2",
        "modules.subscriptions.section_47_cell_5_3",
        "modules.subscriptions.section_47_cell_5_4"
      ],
      [
        "modules.subscriptions.section_47_cell_6_0",
        "modules.subscriptions.section_47_cell_6_1",
        "modules.subscriptions.section_47_cell_6_2",
        "modules.subscriptions.section_47_cell_6_3",
        "modules.subscriptions.section_47_cell_6_4"
      ],
      [
        "modules.subscriptions.section_47_cell_7_0",
        "modules.subscriptions.section_47_cell_7_1",
        "modules.subscriptions.section_47_cell_7_2",
        "modules.subscriptions.section_47_cell_7_3",
        "modules.subscriptions.section_47_cell_7_4"
      ],
      [
        "modules.subscriptions.section_47_cell_8_0",
        "modules.subscriptions.section_47_cell_8_1",
        "modules.subscriptions.section_47_cell_8_2",
        "modules.subscriptions.section_47_cell_8_3",
        "modules.subscriptions.section_47_cell_8_4"
      ],
      [
        "modules.subscriptions.section_47_cell_9_0",
        "modules.subscriptions.section_47_cell_9_1",
        "modules.subscriptions.section_47_cell_9_2",
        "modules.subscriptions.section_47_cell_9_3",
        "modules.subscriptions.section_47_cell_9_4"
      ],
      [
        "modules.subscriptions.section_47_cell_10_0",
        "modules.subscriptions.section_47_cell_10_1",
        "modules.subscriptions.section_47_cell_10_2",
        "modules.subscriptions.section_47_cell_10_3",
        "modules.subscriptions.section_47_cell_10_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.subscriptions.section_48_title",
    "id": "sec_48"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.subscriptions.section_49_item_0",
      "modules.subscriptions.section_49_item_1",
      "modules.subscriptions.section_49_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/entitlements-overview",
  "modules/editions",
  "modules/overrides"
],
  lastUpdated: "2026-06-09",
});
