import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/features",
  titleKey: "modules.features.title",
  category: "modules",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.features.section_4_hdr_0",
      "modules.features.section_4_hdr_1",
      "modules.features.section_4_hdr_2"
    ],
    "rows": [
      [
        "modules.features.section_4_cell_0_0",
        "modules.features.section_4_cell_0_1",
        "modules.features.section_4_cell_0_2"
      ],
      [
        "modules.features.section_4_cell_1_0",
        "modules.features.section_4_cell_1_1",
        "modules.features.section_4_cell_1_2"
      ],
      [
        "modules.features.section_4_cell_2_0",
        "modules.features.section_4_cell_2_1",
        "modules.features.section_4_cell_2_2"
      ],
      [
        "modules.features.section_4_cell_3_0",
        "modules.features.section_4_cell_3_1",
        "modules.features.section_4_cell_3_2"
      ],
      [
        "modules.features.section_4_cell_4_0",
        "modules.features.section_4_cell_4_1",
        "modules.features.section_4_cell_4_2"
      ],
      [
        "modules.features.section_4_cell_5_0",
        "modules.features.section_4_cell_5_1",
        "modules.features.section_4_cell_5_2"
      ],
      [
        "modules.features.section_4_cell_6_0",
        "modules.features.section_4_cell_6_1",
        "modules.features.section_4_cell_6_2"
      ],
      [
        "modules.features.section_4_cell_7_0",
        "modules.features.section_4_cell_7_1",
        "modules.features.section_4_cell_7_2"
      ],
      [
        "modules.features.section_4_cell_8_0",
        "modules.features.section_4_cell_8_1",
        "modules.features.section_4_cell_8_2"
      ],
      [
        "modules.features.section_4_cell_9_0",
        "modules.features.section_4_cell_9_1",
        "modules.features.section_4_cell_9_2"
      ],
      [
        "modules.features.section_4_cell_10_0",
        "modules.features.section_4_cell_10_1",
        "modules.features.section_4_cell_10_2"
      ],
      [
        "modules.features.section_4_cell_11_0",
        "modules.features.section_4_cell_11_1",
        "modules.features.section_4_cell_11_2"
      ],
      [
        "modules.features.section_4_cell_12_0",
        "modules.features.section_4_cell_12_1",
        "modules.features.section_4_cell_12_2"
      ],
      [
        "modules.features.section_4_cell_13_0",
        "modules.features.section_4_cell_13_1",
        "modules.features.section_4_cell_13_2"
      ],
      [
        "modules.features.section_4_cell_14_0",
        "modules.features.section_4_cell_14_1",
        "modules.features.section_4_cell_14_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class Feature : AuditableEntity, ISoftDeletable\n{\n    public string Name { get; set; } = string.Empty;        // Unique system key\n    public string DisplayName { get; set; } = string.Empty;  // UI label\n    public string? Description { get; set; }\n    public string? Category { get; set; }                    // Grouping\n    \n    public FeatureValueType ValueType { get; set; } = FeatureValueType.Boolean;\n    public string DefaultValue { get; set; } = \"false\";     // Global fallback\n    \n    public bool IsSystem { get; set; }                      // Read-only if true\n    public bool IsVisible { get; set; } = true;\n    \n    // Validation constraints (Numeric features)\n    public string? MinValue { get; set; }                   // e.g. \"0\"\n    public string? MaxValue { get; set; }                   // e.g. \"1000\", \"-1\" = unlimited\n    public string? AllowedValues { get; set; }              // e.g. \"light,dark,custom\"\n    \n    public int SortOrder { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_8_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.features.section_9_hdr_0",
      "modules.features.section_9_hdr_1",
      "modules.features.section_9_hdr_2",
      "modules.features.section_9_hdr_3",
      "modules.features.section_9_hdr_4"
    ],
    "rows": [
      [
        "modules.features.section_9_cell_0_0",
        "modules.features.section_9_cell_0_1",
        "modules.features.section_9_cell_0_2",
        "modules.features.section_9_cell_0_3",
        "modules.features.section_9_cell_0_4"
      ],
      [
        "modules.features.section_9_cell_1_0",
        "modules.features.section_9_cell_1_1",
        "modules.features.section_9_cell_1_2",
        "modules.features.section_9_cell_1_3",
        "modules.features.section_9_cell_1_4"
      ],
      [
        "modules.features.section_9_cell_2_0",
        "modules.features.section_9_cell_2_1",
        "modules.features.section_9_cell_2_2",
        "modules.features.section_9_cell_2_3",
        "modules.features.section_9_cell_2_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public enum FeatureValueType\n{\n    /// <summary>On/Off toggle, stored as \"true\" or \"false\"</summary>\n    Boolean = 0,\n    \n    /// <summary>Numeric limit, stored as integer string. -1 = unlimited</summary>\n    Numeric = 1,\n    \n    /// <summary>Arbitrary string configuration value</summary>\n    String = 2,\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.features.section_12_title",
    "contentKey": "modules.features.section_12_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_14_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.features.section_15_hdr_0",
      "modules.features.section_15_hdr_1"
    ],
    "rows": [
      [
        "modules.features.section_15_cell_0_0",
        "modules.features.section_15_cell_0_1",
        "modules.features.section_15_cell_0_2"
      ],
      [
        "modules.features.section_15_cell_1_0",
        "modules.features.section_15_cell_1_1",
        "modules.features.section_15_cell_1_2"
      ],
      [
        "modules.features.section_15_cell_2_0",
        "modules.features.section_15_cell_2_1",
        "modules.features.section_15_cell_2_2"
      ],
      [
        "modules.features.section_15_cell_3_0",
        "modules.features.section_15_cell_3_1",
        "modules.features.section_15_cell_3_2"
      ],
      [
        "modules.features.section_15_cell_4_0",
        "modules.features.section_15_cell_4_1",
        "modules.features.section_15_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_17_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_18_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class EntitlementsStartupSeeder : IStartupSeeder\n{\n    private readonly IFeatureRepository _features;\n\n    public async Task SeedAsync(CancellationToken ct)\n    {\n        var systemFeatures = new[]\n        {\n            new Feature \n            { \n                Name = \"Chat.Enabled\", \n                DisplayName = \"Chat\", \n                ValueType = FeatureValueType.Boolean,\n                DefaultValue = \"false\",\n                IsSystem = true,\n                Category = \"Communication\"\n            },\n            new Feature \n            { \n                Name = \"MaxAdmins\", \n                DisplayName = \"Maximum Administrators\",\n                ValueType = FeatureValueType.Numeric,\n                DefaultValue = \"5\",\n                MinValue = \"1\",\n                MaxValue = \"-1\",\n                IsSystem = true,\n                Category = \"Limits\"\n            },\n            new Feature \n            { \n                Name = \"SSO.Enabled\", \n                DisplayName = \"Single Sign-On\",\n                ValueType = FeatureValueType.Boolean,\n                DefaultValue = \"false\",\n                IsSystem = true,\n                Category = \"Security\"\n            },\n        };\n\n        foreach (var feature in systemFeatures)\n        {\n            if (!await _features.ExistsByNameAsync(feature.Name, ct))\n                await _features.AddAsync(feature, ct);\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.features.section_22_hdr_0",
      "modules.features.section_22_hdr_1",
      "modules.features.section_22_hdr_2"
    ],
    "rows": [
      [
        "modules.features.section_22_cell_0_0",
        "modules.features.section_22_cell_0_1",
        "modules.features.section_22_cell_0_2"
      ],
      [
        "modules.features.section_22_cell_1_0",
        "modules.features.section_22_cell_1_1",
        "modules.features.section_22_cell_1_2"
      ],
      [
        "modules.features.section_22_cell_2_0",
        "modules.features.section_22_cell_2_1",
        "modules.features.section_22_cell_2_2"
      ],
      [
        "modules.features.section_22_cell_3_0",
        "modules.features.section_22_cell_3_1",
        "modules.features.section_22_cell_3_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_23_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Inside FeatureCheckBehavior for Numeric features:\nif (resolved.ValueType == FeatureValueType.Numeric)\n{\n    var limit = int.Parse(resolved.Value);\n    \n    if (limit == -1) \n        return await next(); // -1 = unlimited, skip check\n    \n    var counter = await _quotaCounterProvider.GetCounter(tenantId, featureName);\n    \n    if (counter.CurrentUsage >= limit)\n    {\n        return Result.Forbidden(\n            $\"Quota exceeded: {featureName} \" +\n            $\"(usage: {counter.CurrentUsage}, limit: {limit})\");\n    }\n    \n    // Increment counter after successful operation\n    await _quotaCounterProvider.Increment(tenantId, featureName);\n    \n    return await next();\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_26_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    req[\"Feature Request\"]\n    %% req: IRequireFeature command\n    cache[\"FeatureCache\"]\n    %% cache: In-memory cache\n    miss[\"Cache Miss\"]\n    %% miss: First access\n    resolve[\"Resolution Chain\"]\n    %% resolve: Override → Edition → Default\n    hit[\"Cache Hit\"]\n    %% hit: Instant return\n    req -->|\"GetResolvedValue()\"| cache\n    cache -->|\"exists?\"| hit\n    cache -->|\"not found\"| miss\n    miss -->|\"query DB\"| resolve\n    resolve -->|\"store result\"| cache",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.features.section_28_title",
    "contentKey": "modules.features.section_28_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_30_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_31_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Step 1: Mark your command\npublic class SendBulkEmailCommand : ICommand, IRequireFeature\n{\n    public string RequiredFeatureName => \"BulkEmail.Enabled\";\n    \n    public List<string> Recipients { get; set; } = [];\n    public string Subject { get; set; } = string.Empty;\n    public string Body { get; set; } = string.Empty;\n}\n\n// Step 2: That's it! FeatureCheckBehavior handles the rest.\n// If \"BulkEmail.Enabled\" is false for the tenant → 403 Forbidden\n// If \"BulkEmail.Enabled\" is true → command proceeds normally\n\n// For numeric features with quotas:\npublic class CreateProjectCommand : ICommand<Guid>, IRequireFeature\n{\n    public string RequiredFeatureName => \"MaxProjects\";\n    \n    // FeatureCheckBehavior checks: current_projects < MaxProjects limit\n    // If over limit → 403 \"Quota exceeded\"\n    // If under limit → auto-increment QuotaCounter + proceed\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.features.section_34_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.features.section_35_hdr_0",
      "modules.features.section_35_hdr_1",
      "modules.features.section_35_hdr_2",
      "modules.features.section_35_hdr_3",
      "modules.features.section_35_hdr_4"
    ],
    "rows": [
      [
        "modules.features.section_35_cell_0_0",
        "modules.features.section_35_cell_0_1",
        "modules.features.section_35_cell_0_2",
        "modules.features.section_35_cell_0_3",
        "modules.features.section_35_cell_0_4"
      ],
      [
        "modules.features.section_35_cell_1_0",
        "modules.features.section_35_cell_1_1",
        "modules.features.section_35_cell_1_2",
        "modules.features.section_35_cell_1_3",
        "modules.features.section_35_cell_1_4"
      ],
      [
        "modules.features.section_35_cell_2_0",
        "modules.features.section_35_cell_2_1",
        "modules.features.section_35_cell_2_2",
        "modules.features.section_35_cell_2_3",
        "modules.features.section_35_cell_2_4"
      ],
      [
        "modules.features.section_35_cell_3_0",
        "modules.features.section_35_cell_3_1",
        "modules.features.section_35_cell_3_2",
        "modules.features.section_35_cell_3_3",
        "modules.features.section_35_cell_3_4"
      ],
      [
        "modules.features.section_35_cell_4_0",
        "modules.features.section_35_cell_4_1",
        "modules.features.section_35_cell_4_2",
        "modules.features.section_35_cell_4_3",
        "modules.features.section_35_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.features.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.features.section_37_item_0",
      "modules.features.section_37_item_1",
      "modules.features.section_37_item_2"
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
