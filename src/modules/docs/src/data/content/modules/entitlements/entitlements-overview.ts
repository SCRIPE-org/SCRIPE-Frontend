import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/entitlements-overview",
  titleKey: "modules.entitlementsOverview.title",
  category: "modules",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.entitlementsOverview.section_4_hdr_0",
      "modules.entitlementsOverview.section_4_hdr_1",
      "modules.entitlementsOverview.section_4_hdr_2"
    ],
    "rows": [
      [
        "modules.entitlementsOverview.section_4_cell_0_0",
        "modules.entitlementsOverview.section_4_cell_0_1",
        "modules.entitlementsOverview.section_4_cell_0_2"
      ],
      [
        "modules.entitlementsOverview.section_4_cell_1_0",
        "modules.entitlementsOverview.section_4_cell_1_1",
        "modules.entitlementsOverview.section_4_cell_1_2"
      ],
      [
        "modules.entitlementsOverview.section_4_cell_2_0",
        "modules.entitlementsOverview.section_4_cell_2_1",
        "modules.entitlementsOverview.section_4_cell_2_2"
      ],
      [
        "modules.entitlementsOverview.section_4_cell_3_0",
        "modules.entitlementsOverview.section_4_cell_3_1",
        "modules.entitlementsOverview.section_4_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_6_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    feat[\"Features\"]\n    %% feat: Boolean / Numeric / String capabilities\n    ed[\"Editions\"]\n    %% ed: Named plans (Basic, Pro, Enterprise)\n    sub[\"Subscriptions\"]\n    %% sub: Tenant ↔ Edition binding\n    ovr[\"Overrides\"]\n    %% ovr: Per-tenant custom values\n    cache[\"FeatureCache\"]\n    %% cache: In-memory resolved values\n    pipe[\"FeatureCheckBehavior\"]\n    %% pipe: AstraFlow mediator pipeline gate\n    feat -->|\"bundled into\"| ed\n    ed -->|\"linked via\"| sub\n    sub -->|\"resolved into\"| cache\n    ovr -->|\"overrides\"| cache\n    cache -->|\"checked by\"| pipe",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_9_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.entitlementsOverview.section_10_hdr_0",
      "modules.entitlementsOverview.section_10_hdr_1",
      "modules.entitlementsOverview.section_10_hdr_2",
      "modules.entitlementsOverview.section_10_hdr_3"
    ],
    "rows": [
      [
        "modules.entitlementsOverview.section_10_cell_0_0",
        "modules.entitlementsOverview.section_10_cell_0_1",
        "modules.entitlementsOverview.section_10_cell_0_2",
        "modules.entitlementsOverview.section_10_cell_0_3"
      ],
      [
        "modules.entitlementsOverview.section_10_cell_1_0",
        "modules.entitlementsOverview.section_10_cell_1_1",
        "modules.entitlementsOverview.section_10_cell_1_2",
        "modules.entitlementsOverview.section_10_cell_1_3"
      ],
      [
        "modules.entitlementsOverview.section_10_cell_2_0",
        "modules.entitlementsOverview.section_10_cell_2_1",
        "modules.entitlementsOverview.section_10_cell_2_2",
        "modules.entitlementsOverview.section_10_cell_2_3"
      ],
      [
        "modules.entitlementsOverview.section_10_cell_3_0",
        "modules.entitlementsOverview.section_10_cell_3_1",
        "modules.entitlementsOverview.section_10_cell_3_2",
        "modules.entitlementsOverview.section_10_cell_3_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_12_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_13_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "Priority (highest → lowest):\n\n┌─────────────────────────────────────────────────────────────────────────┐\n│  1. TenantFeatureOverride  →  Custom value set for THIS specific tenant │\n│     Example: \"MaxAdmins\" = 500 (override for Acme Corp)                 │\n├─────────────────────────────────────────────────────────────────────────┤\n│  2. EditionFeature         →  Value set in the tenant's active edition  │\n│     Example: \"MaxAdmins\" = 50 (Pro plan default)                        │\n├─────────────────────────────────────────────────────────────────────────┤\n│  3. Feature.DefaultValue   →  Global fallback for the feature           │\n│     Example: \"MaxAdmins\" = 5 (platform default)                         │\n└─────────────────────────────────────────────────────────────────────────┘\n\nResolution Order:\n  Check Override → exists? use it : Check Edition → exists? use it : use Default",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.entitlementsOverview.section_15_title",
    "contentKey": "modules.entitlementsOverview.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_17_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_18_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Mark a command to require a feature\npublic class CreateChatRoomCommand : ICommand<Guid>, IRequireFeature\n{\n    public string RequiredFeatureName => \"Chat.Enabled\";\n    \n    // ... command properties\n    public string Name { get; set; }\n    public string Description { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_20_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class FeatureCheckBehavior<TRequest, TResponse> \n    : IPipelineBehavior<TRequest, TResponse>\n    where TRequest : IRequireFeature\n{\n    private readonly IFeatureCache _cache;\n    private readonly ICurrentTenantAccessor _tenant;\n\n    public async Task<TResponse> Handle(\n        TRequest request, \n        RequestHandlerDelegate<TResponse> next, \n        CancellationToken ct)\n    {\n        var tenantId = _tenant.TenantId;\n        var featureName = request.RequiredFeatureName;\n        \n        // Resolve: Override → Edition → Default\n        var resolved = await _cache.GetResolvedValue(tenantId, featureName);\n        \n        if (resolved.ValueType == FeatureValueType.Boolean && resolved.Value == \"false\")\n            return Result.Forbidden(\"Feature is disabled for your plan\");\n            \n        if (resolved.ValueType == FeatureValueType.Numeric)\n        {\n            var limit = int.Parse(resolved.Value);\n            if (limit != -1) // -1 = unlimited\n            {\n                var usage = await _cache.GetCurrentUsage(tenantId, featureName);\n                if (usage >= limit)\n                    return Result.Forbidden(\"Quota exceeded for your plan\");\n            }\n        }\n        \n        return await next(); // Feature check passed\n    }\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.entitlementsOverview.section_22_title",
    "contentKey": "modules.entitlementsOverview.section_22_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.entitlementsOverview.section_25_hdr_0",
      "modules.entitlementsOverview.section_25_hdr_1",
      "modules.entitlementsOverview.section_25_hdr_2"
    ],
    "rows": [
      [
        "modules.entitlementsOverview.section_25_cell_0_0",
        "modules.entitlementsOverview.section_25_cell_0_1",
        "modules.entitlementsOverview.section_25_cell_0_2"
      ],
      [
        "modules.entitlementsOverview.section_25_cell_1_0",
        "modules.entitlementsOverview.section_25_cell_1_1",
        "modules.entitlementsOverview.section_25_cell_1_2"
      ],
      [
        "modules.entitlementsOverview.section_25_cell_2_0",
        "modules.entitlementsOverview.section_25_cell_2_1",
        "modules.entitlementsOverview.section_25_cell_2_2"
      ],
      [
        "modules.entitlementsOverview.section_25_cell_3_0",
        "modules.entitlementsOverview.section_25_cell_3_1",
        "modules.entitlementsOverview.section_25_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_27_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_28_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public static class DependencyInjection\n{\n    public static IServiceCollection AddEntitlementsModule(\n        this IServiceCollection services, IConfiguration config)\n    {\n        // Domain repositories\n        services.AddScoped<IFeatureRepository, FeatureRepository>();\n        services.AddScoped<IEditionRepository, EditionRepository>();\n        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();\n        services.AddScoped<IFeatureOverrideRepository, FeatureOverrideRepository>();\n        \n        // Application services\n        services.AddScoped<IFeatureCache, FeatureCache>();\n        services.AddScoped<IEditionConstraintValidator, EditionConstraintValidator>();\n        services.AddScoped<IDowngradeImpactValidator, DowngradeImpactValidator>();\n        services.AddScoped<IOverflowPolicyExecutor, OverflowPolicyExecutor>();\n        services.AddScoped<IQuotaCounterProvisioner, QuotaCounterProvisioner>();\n        \n        // AstraFlow mediator pipeline behavior\n        services.AddTransient(typeof(IPipelineBehavior<,>), \n            typeof(FeatureCheckBehavior<,>));\n        \n        // Startup seeder (seeds system features)\n        services.AddTransient<IStartupSeeder, EntitlementsStartupSeeder>();\n        \n        return services;\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_31_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_32_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "Entitlements/\n├── Entitlements.Domain/\n│   ├── Entities/\n│   │   ├── Feature.cs                  # Controllable capability\n│   │   ├── Edition.cs                  # Named plan (Basic, Pro, Enterprise)\n│   │   ├── EditionFeature.cs           # Feature value within an edition\n│   │   ├── EditionVersion.cs           # Versioned snapshot of edition features\n│   │   ├── TenantSubscription.cs       # Tenant ↔ Edition binding\n│   │   ├── TenantFeatureOverride.cs    # Per-tenant custom value\n│   │   └── QuotaCounter.cs            # Usage tracking for numeric features\n│   ├── Interfaces/\n│   │   ├── IFeatureRepository.cs\n│   │   ├── IEditionRepository.cs\n│   │   ├── ISubscriptionRepository.cs\n│   │   └── IFeatureOverrideRepository.cs\n│   ├── Enums/\n│   │   ├── FeatureValueType.cs         # Boolean, Numeric, String\n│   │   ├── OverflowPolicy.cs           # Block, Warn, Allow\n│   │   ├── SubscriptionType.cs         # Monthly, Annual, Lifetime, Trial\n│   │   ├── SubscriptionStatus.cs       # Active, Suspended, Cancelled, Expired\n│   │   ├── RolloutStrategy.cs          # Immediate, Gradual, Manual\n│   │   └── ExpiryBehavior.cs           # Downgrade, Suspend, Grace\n│   └── Specifications/\n│       └── FeatureSearchSpec.cs\n├── Entitlements.Application/\n│   ├── Commands/\n│   │   ├── Features/     # CreateFeature, UpdateFeature, DeleteFeature\n│   │   ├── Editions/     # CRUD + SetFeatures + DirectApply + Versions\n│   │   ├── Subscriptions/ # Assign, Upgrade, Downgrade, Suspend, Resume, Cancel\n│   │   └── Overrides/    # SetOverride, RemoveOverride\n│   ├── Queries/\n│   │   ├── Features/     # GetFeatures, GetFeatureById\n│   │   ├── Editions/     # GetEditions, GetById, GetFeatures, GetVersions\n│   │   ├── Subscriptions/ # GetSubscriptions, GetById, GetDowngradeImpact\n│   │   └── Overrides/    # GetOverrides, GetResolvedFeatures\n│   ├── DTOs/             # Request/Response DTOs\n│   ├── Mapping/          # explicit DTO mapping rules\n│   ├── Services/\n│   │   └── EditionConstraintValidator.cs\n│   └── Abstractions/\n│       ├── IFeatureCache.cs\n│       ├── IDowngradeImpactValidator.cs\n│       ├── IOverflowPolicyExecutor.cs\n│       └── IQuotaCounterProvisioner.cs\n└── Entitlements.Infrastructure/\n    ├── EntitlementsDbContextFactory.cs\n    ├── EntitlementsStartupSeeder.cs\n    ├── Persistence/\n    │   ├── FeatureRepository.cs\n    │   ├── EditionRepository.cs\n    │   ├── SubscriptionRepository.cs\n    │   └── FeatureOverrideRepository.cs\n    ├── Caching/\n    │   ├── FeatureCache.cs\n    │   └── NoOpFeatureCache.cs\n    └── DependencyInjection.cs",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_35_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_36_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/modules/entitlements/\n├── editions/                    # Edition management\n│   └── src/\n│       ├── domain/\n│       │   ├── entities/        # Edition.ts, EditionFeature.ts, EditionVersion.ts\n│       │   └── interfaces/      # IEditionRepository.ts\n│       ├── data/\n│       │   ├── models/          # EditionDto.ts, EditionFeatureDto.ts\n│       │   ├── mappers/         # EditionMapper.ts\n│       │   └── repositories/    # EditionRepository.ts\n│       └── presentation/\n│           ├── viewmodels/      # useEditionsViewModel.ts, useEditionDetailViewModel.ts\n│           ├── views/           # EditionsView.tsx, EditionDetailView.tsx\n│           └── components/      # EditionFeaturesTable.tsx, VersionHistory.tsx\n├── features/                    # Feature registry\n│   └── src/ { domain, data, presentation }\n├── subscriptions/               # Subscription lifecycle\n│   └── src/ { domain, data, presentation }\n└── overrides/                   # Per-tenant overrides\n    └── src/ { domain, data, presentation }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_39_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.entitlementsOverview.section_40_hdr_0",
      "modules.entitlementsOverview.section_40_hdr_1",
      "modules.entitlementsOverview.section_40_hdr_2",
      "modules.entitlementsOverview.section_40_hdr_3",
      "modules.entitlementsOverview.section_40_hdr_4"
    ],
    "rows": [
      [
        "modules.entitlementsOverview.section_40_cell_0_0",
        "modules.entitlementsOverview.section_40_cell_0_1",
        "modules.entitlementsOverview.section_40_cell_0_2",
        "modules.entitlementsOverview.section_40_cell_0_3",
        "modules.entitlementsOverview.section_40_cell_0_4"
      ],
      [
        "modules.entitlementsOverview.section_40_cell_1_0",
        "modules.entitlementsOverview.section_40_cell_1_1",
        "modules.entitlementsOverview.section_40_cell_1_2",
        "modules.entitlementsOverview.section_40_cell_1_3",
        "modules.entitlementsOverview.section_40_cell_1_4"
      ],
      [
        "modules.entitlementsOverview.section_40_cell_2_0",
        "modules.entitlementsOverview.section_40_cell_2_1",
        "modules.entitlementsOverview.section_40_cell_2_2",
        "modules.entitlementsOverview.section_40_cell_2_3",
        "modules.entitlementsOverview.section_40_cell_2_4"
      ],
      [
        "modules.entitlementsOverview.section_40_cell_3_0",
        "modules.entitlementsOverview.section_40_cell_3_1",
        "modules.entitlementsOverview.section_40_cell_3_2",
        "modules.entitlementsOverview.section_40_cell_3_3",
        "modules.entitlementsOverview.section_40_cell_3_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_42_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.entitlementsOverview.section_43_hdr_0",
      "modules.entitlementsOverview.section_43_hdr_1",
      "modules.entitlementsOverview.section_43_hdr_2"
    ],
    "rows": [
      [
        "modules.entitlementsOverview.section_43_cell_0_0",
        "modules.entitlementsOverview.section_43_cell_0_1",
        "modules.entitlementsOverview.section_43_cell_0_2"
      ],
      [
        "modules.entitlementsOverview.section_43_cell_1_0",
        "modules.entitlementsOverview.section_43_cell_1_1",
        "modules.entitlementsOverview.section_43_cell_1_2"
      ],
      [
        "modules.entitlementsOverview.section_43_cell_2_0",
        "modules.entitlementsOverview.section_43_cell_2_1",
        "modules.entitlementsOverview.section_43_cell_2_2"
      ],
      [
        "modules.entitlementsOverview.section_43_cell_3_0",
        "modules.entitlementsOverview.section_43_cell_3_1",
        "modules.entitlementsOverview.section_43_cell_3_2"
      ],
      [
        "modules.entitlementsOverview.section_43_cell_4_0",
        "modules.entitlementsOverview.section_43_cell_4_1",
        "modules.entitlementsOverview.section_43_cell_4_2"
      ],
      [
        "modules.entitlementsOverview.section_43_cell_5_0",
        "modules.entitlementsOverview.section_43_cell_5_1",
        "modules.entitlementsOverview.section_43_cell_5_2"
      ],
      [
        "modules.entitlementsOverview.section_43_cell_6_0",
        "modules.entitlementsOverview.section_43_cell_6_1",
        "modules.entitlementsOverview.section_43_cell_6_2"
      ],
      [
        "modules.entitlementsOverview.section_43_cell_7_0",
        "modules.entitlementsOverview.section_43_cell_7_1",
        "modules.entitlementsOverview.section_43_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_44_title",
    "id": "sec_44"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_45_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_46_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Registered when the Entitlements module is not loaded.\n/// All features are treated as enabled with unlimited quotas.\n/// </summary>\npublic class NoOpFeatureCache : IFeatureCache\n{\n    public Task<ResolvedFeature> GetResolvedValue(\n        Guid tenantId, string featureName)\n    {\n        return Task.FromResult(new ResolvedFeature\n        {\n            Name = featureName,\n            Value = \"true\",          // Always enabled\n            ValueType = FeatureValueType.Boolean,\n            Source = ResolutionSource.Default,\n        });\n    }\n\n    public Task<int> GetCurrentUsage(Guid tenantId, string featureName)\n        => Task.FromResult(0); // No usage tracked\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.entitlementsOverview.section_48_title",
    "contentKey": "modules.entitlementsOverview.section_48_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_49_title",
    "id": "sec_49"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_50_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.entitlementsOverview.section_51_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "Step 1: Define Features\n  → POST /api/v1/features\n  → Create features like \"Chat.Enabled\" (Boolean), \"MaxAdmins\" (Numeric)\n\nStep 2: Create Editions\n  → POST /api/v1/editions\n  → Create plans like \"Basic\", \"Pro\", \"Enterprise\"\n  → Set feature values per edition\n\nStep 3: Assign Subscriptions\n  → POST /api/v1/subscriptions\n  → Link each tenant to an edition\n\nStep 4: Gate Commands (Optional)\n  → Implement IRequireFeature on commands\n  → FeatureCheckBehavior automatically enforces\n\nStep 5: Apply Overrides (Optional)\n  → POST /api/v1/tenants/{id}/features/overrides\n  → Give specific tenants custom values",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.entitlementsOverview.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.entitlementsOverview.section_54_item_0",
      "modules.entitlementsOverview.section_54_item_1",
      "modules.entitlementsOverview.section_54_item_2",
      "modules.entitlementsOverview.section_54_item_3",
      "modules.entitlementsOverview.section_54_item_4"
    ]
  }
],
  relatedSlugs: [
  "modules/editions",
  "modules/subscriptions",
  "modules/features",
  "modules/overrides",
  "architecture/cqrs-pipeline"
],
  lastUpdated: "2026-06-09",
});
