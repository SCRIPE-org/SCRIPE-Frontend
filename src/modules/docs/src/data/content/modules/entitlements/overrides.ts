import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/overrides",
  titleKey: "modules.overrides.title",
  category: "modules",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.overrides.section_4_hdr_0",
      "modules.overrides.section_4_hdr_1",
      "modules.overrides.section_4_hdr_2"
    ],
    "rows": [
      [
        "modules.overrides.section_4_cell_0_0",
        "modules.overrides.section_4_cell_0_1",
        "modules.overrides.section_4_cell_0_2"
      ],
      [
        "modules.overrides.section_4_cell_1_0",
        "modules.overrides.section_4_cell_1_1",
        "modules.overrides.section_4_cell_1_2"
      ],
      [
        "modules.overrides.section_4_cell_2_0",
        "modules.overrides.section_4_cell_2_1",
        "modules.overrides.section_4_cell_2_2"
      ],
      [
        "modules.overrides.section_4_cell_3_0",
        "modules.overrides.section_4_cell_3_1",
        "modules.overrides.section_4_cell_3_2"
      ],
      [
        "modules.overrides.section_4_cell_4_0",
        "modules.overrides.section_4_cell_4_1",
        "modules.overrides.section_4_cell_4_2"
      ],
      [
        "modules.overrides.section_4_cell_5_0",
        "modules.overrides.section_4_cell_5_1",
        "modules.overrides.section_4_cell_5_2"
      ],
      [
        "modules.overrides.section_4_cell_6_0",
        "modules.overrides.section_4_cell_6_1",
        "modules.overrides.section_4_cell_6_2"
      ],
      [
        "modules.overrides.section_4_cell_7_0",
        "modules.overrides.section_4_cell_7_1",
        "modules.overrides.section_4_cell_7_2"
      ],
      [
        "modules.overrides.section_4_cell_8_0",
        "modules.overrides.section_4_cell_8_1",
        "modules.overrides.section_4_cell_8_2"
      ],
      [
        "modules.overrides.section_4_cell_9_0",
        "modules.overrides.section_4_cell_9_1",
        "modules.overrides.section_4_cell_9_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class TenantFeatureOverride : AuditableEntity\n{\n    public Guid TenantId { get; set; }\n    \n    public Guid FeatureId { get; set; }\n    public Feature Feature { get; set; } = null!;\n    \n    public string Value { get; set; } = string.Empty;\n    // Must match Feature.ValueType:\n    //   Boolean → \"true\" / \"false\"\n    //   Numeric → integer string (e.g. \"500\")\n    //   String  → arbitrary string\n    \n    public string? Reason { get; set; }                // Audit trail\n    public DateTime? ExpiresAt { get; set; }           // null = permanent\n    public bool IsActive { get; set; } = true;\n    public Guid AppliedBy { get; set; }                // Who set it\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_8_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    check[\"Feature Check\"]\n    %% check: FeatureCheckBehavior triggered\n    ovr[\"1. Check Override\"]\n    %% ovr: TenantFeatureOverride exists + active + not expired?\n    ed[\"2. Check Edition\"]\n    %% ed: EditionFeature value for tenant's subscribed edition?\n    def[\"3. Use Default\"]\n    %% def: Feature.DefaultValue (global fallback)\n    result[\"Resolved Value\"]\n    %% result: Applied to the request\n    check -->|\"highest priority\"| ovr\n    ovr -->|\"not found\"| ed\n    ed -->|\"not found\"| def\n    ovr -->|\"found ✓\"| result\n    ed -->|\"found ✓\"| result\n    def -->|\"always exists\"| result",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_11_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.overrides.section_12_hdr_0",
      "modules.overrides.section_12_hdr_1",
      "modules.overrides.section_12_hdr_2",
      "modules.overrides.section_12_hdr_3",
      "modules.overrides.section_12_hdr_4"
    ],
    "rows": [
      [
        "modules.overrides.section_12_cell_0_0",
        "modules.overrides.section_12_cell_0_1",
        "modules.overrides.section_12_cell_0_2",
        "modules.overrides.section_12_cell_0_3",
        "modules.overrides.section_12_cell_0_4"
      ],
      [
        "modules.overrides.section_12_cell_1_0",
        "modules.overrides.section_12_cell_1_1",
        "modules.overrides.section_12_cell_1_2",
        "modules.overrides.section_12_cell_1_3",
        "modules.overrides.section_12_cell_1_4"
      ],
      [
        "modules.overrides.section_12_cell_2_0",
        "modules.overrides.section_12_cell_2_1",
        "modules.overrides.section_12_cell_2_2",
        "modules.overrides.section_12_cell_2_3",
        "modules.overrides.section_12_cell_2_4"
      ],
      [
        "modules.overrides.section_12_cell_3_0",
        "modules.overrides.section_12_cell_3_1",
        "modules.overrides.section_12_cell_3_2",
        "modules.overrides.section_12_cell_3_3",
        "modules.overrides.section_12_cell_3_4"
      ],
      [
        "modules.overrides.section_12_cell_4_0",
        "modules.overrides.section_12_cell_4_1",
        "modules.overrides.section_12_cell_4_2",
        "modules.overrides.section_12_cell_4_3",
        "modules.overrides.section_12_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_14_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_15_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"featureId\": \"550e8400-e29b-41d4-a716-446655440000\",\n  \"value\": \"500\",\n  \"reason\": \"Enterprise deal — 500 admins for annual contract\",\n  \"expiresAt\": null\n}\n\n// Response 200:\n{\n  \"id\": \"770e8400-e29b-41d4-a716-446655440099\",\n  \"tenantId\": \"660e8400-e29b-41d4-a716-446655440001\",\n  \"featureId\": \"550e8400-e29b-41d4-a716-446655440000\",\n  \"featureName\": \"MaxAdmins\",\n  \"value\": \"500\",\n  \"previousValue\": \"50\",\n  \"source\": \"Override\",\n  \"reason\": \"Enterprise deal — 500 admins for annual contract\",\n  \"expiresAt\": null,\n  \"isActive\": true,\n  \"appliedBy\": \"admin-user-id\",\n  \"createdAt\": \"2026-03-02T10:00:00Z\"\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.overrides.section_17_title",
    "contentKey": "modules.overrides.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_20_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"tenantId\": \"660e8400-e29b-41d4-a716-446655440001\",\n  \"editionName\": \"Pro\",\n  \"resolvedFeatures\": [\n    {\n      \"featureId\": \"...\",\n      \"name\": \"Chat.Enabled\",\n      \"displayName\": \"Chat\",\n      \"valueType\": \"Boolean\",\n      \"value\": \"true\",\n      \"source\": \"Edition\",\n      \"editionDefault\": \"true\",\n      \"overrideValue\": null,\n      \"featureDefault\": \"false\"\n    },\n    {\n      \"featureId\": \"...\",\n      \"name\": \"MaxAdmins\",\n      \"displayName\": \"Maximum Administrators\",\n      \"valueType\": \"Numeric\",\n      \"value\": \"500\",\n      \"source\": \"Override\",\n      \"editionDefault\": \"50\",\n      \"overrideValue\": \"500\",\n      \"featureDefault\": \"5\",\n      \"currentUsage\": 12,\n      \"overrideReason\": \"Enterprise deal\",\n      \"overrideExpiresAt\": null\n    },\n    {\n      \"featureId\": \"...\",\n      \"name\": \"SSO.Enabled\",\n      \"displayName\": \"Single Sign-On\",\n      \"valueType\": \"Boolean\",\n      \"value\": \"false\",\n      \"source\": \"Default\",\n      \"editionDefault\": null,\n      \"overrideValue\": null,\n      \"featureDefault\": \"false\"\n    }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_23_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_24_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"featureId\": \"...\")\n  \"value\": \"true\",\n  \"reason\": \"30-day trial of Advanced Reporting feature\",\n  \"expiresAt\": \"2026-04-02T00:00:00Z\"\n}\n\n// After expiry:\n// - Override is automatically marked isActive = false\n// - Feature falls back to edition value (or default)\n// - No manual intervention needed",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.overrides.section_26_title",
    "contentKey": "modules.overrides.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_28_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.overrides.section_29_hdr_0",
      "modules.overrides.section_29_hdr_1",
      "modules.overrides.section_29_hdr_2"
    ],
    "rows": [
      [
        "modules.overrides.section_29_cell_0_0",
        "modules.overrides.section_29_cell_0_1",
        "modules.overrides.section_29_cell_0_2"
      ],
      [
        "modules.overrides.section_29_cell_1_0",
        "modules.overrides.section_29_cell_1_1",
        "modules.overrides.section_29_cell_1_2"
      ],
      [
        "modules.overrides.section_29_cell_2_0",
        "modules.overrides.section_29_cell_2_1",
        "modules.overrides.section_29_cell_2_2"
      ],
      [
        "modules.overrides.section_29_cell_3_0",
        "modules.overrides.section_29_cell_3_1",
        "modules.overrides.section_29_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_31_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.overrides.section_32_hdr_0",
      "modules.overrides.section_32_hdr_1",
      "modules.overrides.section_32_hdr_2",
      "modules.overrides.section_32_hdr_3",
      "modules.overrides.section_32_hdr_4"
    ],
    "rows": [
      [
        "modules.overrides.section_32_cell_0_0",
        "modules.overrides.section_32_cell_0_1",
        "modules.overrides.section_32_cell_0_2",
        "modules.overrides.section_32_cell_0_3",
        "modules.overrides.section_32_cell_0_4"
      ],
      [
        "modules.overrides.section_32_cell_1_0",
        "modules.overrides.section_32_cell_1_1",
        "modules.overrides.section_32_cell_1_2",
        "modules.overrides.section_32_cell_1_3",
        "modules.overrides.section_32_cell_1_4"
      ],
      [
        "modules.overrides.section_32_cell_2_0",
        "modules.overrides.section_32_cell_2_1",
        "modules.overrides.section_32_cell_2_2",
        "modules.overrides.section_32_cell_2_3",
        "modules.overrides.section_32_cell_2_4"
      ],
      [
        "modules.overrides.section_32_cell_3_0",
        "modules.overrides.section_32_cell_3_1",
        "modules.overrides.section_32_cell_3_2",
        "modules.overrides.section_32_cell_3_3",
        "modules.overrides.section_32_cell_3_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.overrides.section_34_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.overrides.section_35_title",
    "contentKey": "modules.overrides.section_35_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.overrides.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.overrides.section_37_item_0",
      "modules.overrides.section_37_item_1",
      "modules.overrides.section_37_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/entitlements-overview",
  "modules/features",
  "modules/subscriptions"
],
  lastUpdated: "2026-06-09",
});
