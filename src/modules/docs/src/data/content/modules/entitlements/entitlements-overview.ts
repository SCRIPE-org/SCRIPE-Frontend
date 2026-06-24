// FILE-EXCEPTION: file length
import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.intro",
  },

  // ─── What is Entitlements ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.whatIsTitle",
    id: "what-is-entitlements",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.whatIsIntro",
  },
  {
    type: "table",
    headers: ["Concept", "Analogy", "Example"],
    rows: [
      ["Feature", "A switch or dial on your platform", "Chat.Enabled, MaxAdmins, Theme"],
      [
        "Edition",
        "A product SKU / pricing plan",
        "Basic ($29/mo), Pro ($99/mo), Enterprise (custom)",
      ],
      [
        "Subscription",
        "A customer's contract",
        "Acme Corp → Pro plan, monthly, active since Jan 2026",
      ],
      [
        "Override",
        "A one-off exception",
        "Give Acme Corp 500 admins instead of the Pro default of 50",
      ],
    ],
  },

  // ─── Architecture ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.architectureTitle",
    id: "architecture",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.architectureIntro",
  },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "feat", label: "Features", description: "Boolean / Numeric / String capabilities" },
      { id: "ed", label: "Editions", description: "Named plans (Basic, Pro, Enterprise)" },
      { id: "sub", label: "Subscriptions", description: "Tenant ↔ Edition binding" },
      { id: "ovr", label: "Overrides", description: "Per-tenant custom values" },
      { id: "cache", label: "FeatureCache", description: "In-memory resolved values" },
      {
        id: "pipe",
        label: "FeatureCheckBehavior",
        description: "AstraFlow mediator pipeline gate",
      },
    ],
    connections: [
      { from: "feat", to: "ed", label: "bundled into" },
      { from: "ed", to: "sub", label: "linked via" },
      { from: "sub", to: "cache", label: "resolved into" },
      { from: "ovr", to: "cache", label: "overrides" },
      { from: "cache", to: "pipe", label: "checked by" },
    ],
  },

  // ─── Four Domains ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.domainsTitle",
    id: "four-domains",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.domainsIntro",
  },
  {
    type: "table",
    headers: ["Domain", "Entity", "Responsibility", "Key Operations"],
    rows: [
      [
        "Features",
        "Feature",
        "Define controllable capabilities (boolean toggle, numeric quota, string config)",
        "CRUD, Seed system features, ValueType validation",
      ],
      [
        "Editions",
        "Edition, EditionVersion, EditionFeature",
        "Named plans that bundle feature values with versioning",
        "CRUD, Version management, Rollout strategies, Direct-apply",
      ],
      [
        "Subscriptions",
        "TenantSubscription",
        "Bind tenants to editions with full lifecycle",
        "Assign, Upgrade, Downgrade, Suspend, Resume, Cancel, Renew",
      ],
      [
        "Overrides",
        "TenantFeatureOverride",
        "Per-tenant custom values bypassing edition defaults",
        "Set, Remove, List, Resolve all features",
      ],
    ],
  },

  // ─── Resolution Chain ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.resolutionTitle",
    id: "resolution-chain",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.resolutionIntro",
  },
  {
    type: "code",
    language: "text",
    filename: "Feature Value Resolution Chain",
    code: `Priority (highest → lowest):

┌─────────────────────────────────────────────────────────────────────────┐
│  1. TenantFeatureOverride  →  Custom value set for THIS specific tenant │
│     Example: "MaxAdmins" = 500 (override for Acme Corp)                 │
├─────────────────────────────────────────────────────────────────────────┤
│  2. EditionFeature         →  Value set in the tenant's active edition  │
│     Example: "MaxAdmins" = 50 (Pro plan default)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  3. Feature.DefaultValue   →  Global fallback for the feature           │
│     Example: "MaxAdmins" = 5 (platform default)                         │
└─────────────────────────────────────────────────────────────────────────┘

Resolution Order:
  Check Override → exists? use it : Check Edition → exists? use it : use Default`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.entitlementsOverview.resolutionTip",
  },

  // ─── Pipeline Integration ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.pipelineTitle",
    id: "pipeline-integration",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.pipelineIntro",
  },
  {
    type: "code",
    language: "csharp",
    filename: "IRequireFeature Interface",
    code: `// Mark a command to require a feature
public class CreateChatRoomCommand : ICommand<Guid>, IRequireFeature
{
    public string RequiredFeatureName => "Chat.Enabled";
    
    // ... command properties
    public string Name { get; set; }
    public string Description { get; set; }
}`,
  },
  {
    type: "code",
    language: "csharp",
    filename: "FeatureCheckBehavior Pipeline",
    code: `public class FeatureCheckBehavior<TRequest, TResponse> 
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequireFeature
{
    private readonly IFeatureCache _cache;
    private readonly ICurrentTenantAccessor _tenant;

    public async Task<TResponse> Handle(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken ct)
    {
        var tenantId = _tenant.TenantId;
        var featureName = request.RequiredFeatureName;
        
        // Resolve: Override → Edition → Default
        var resolved = await _cache.GetResolvedValue(tenantId, featureName);
        
        if (resolved.ValueType == FeatureValueType.Boolean && resolved.Value == "false")
            return Result.Forbidden("Feature is disabled for your plan");
            
        if (resolved.ValueType == FeatureValueType.Numeric)
        {
            var limit = int.Parse(resolved.Value);
            if (limit != -1) // -1 = unlimited
            {
                var usage = await _cache.GetCurrentUsage(tenantId, featureName);
                if (usage >= limit)
                    return Result.Forbidden("Quota exceeded for your plan");
            }
        }
        
        return await next(); // Feature check passed
    }
}`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.entitlementsOverview.pipelineTip",
  },

  // ─── CQRS Command/Query Map ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.cqrsMapTitle",
    id: "cqrs-map",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.cqrsMapIntro",
  },
  {
    type: "table",
    headers: ["Domain", "Commands", "Queries"],
    rows: [
      [
        "Features",
        "CreateFeature, UpdateFeature, DeleteFeature",
        "GetFeatures (paginated), GetFeatureById",
      ],
      [
        "Editions",
        "CreateEdition, UpdateEdition, DeleteEdition, SetEditionFeatures, DirectApplyFeatures, CreateEditionVersion, PublishEditionVersion, RollbackEditionVersion",
        "GetEditions, GetEditionById, GetEditionFeatures, GetEditionVersions",
      ],
      [
        "Subscriptions",
        "AssignSubscription, UpgradeSubscription, DowngradeSubscription, SuspendSubscription, ResumeSubscription, CancelSubscription, RenewSubscription",
        "GetSubscriptions, GetSubscriptionById, GetDowngradeImpact, GetTenantActiveSubscription",
      ],
      [
        "Overrides",
        "SetFeatureOverride, RemoveFeatureOverride",
        "GetTenantOverrides, GetResolvedFeatures",
      ],
    ],
  },

  // ─── DI Registration ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.diTitle",
    id: "di-registration",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.diIntro",
  },
  {
    type: "code",
    language: "csharp",
    filename: "DependencyInjection.cs",
    code: `public static class DependencyInjection
{
    public static IServiceCollection AddEntitlementsModule(
        this IServiceCollection services, IConfiguration config)
    {
        // Domain repositories
        services.AddScoped<IFeatureRepository, FeatureRepository>();
        services.AddScoped<IEditionRepository, EditionRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IFeatureOverrideRepository, FeatureOverrideRepository>();
        
        // Application services
        services.AddScoped<IFeatureCache, FeatureCache>();
        services.AddScoped<IEditionConstraintValidator, EditionConstraintValidator>();
        services.AddScoped<IDowngradeImpactValidator, DowngradeImpactValidator>();
        services.AddScoped<IOverflowPolicyExecutor, OverflowPolicyExecutor>();
        services.AddScoped<IQuotaCounterProvisioner, QuotaCounterProvisioner>();
        
        // AstraFlow mediator pipeline behavior
        services.AddTransient(typeof(IPipelineBehavior<,>), 
            typeof(FeatureCheckBehavior<,>));
        
        // Startup seeder (seeds system features)
        services.AddTransient<IStartupSeeder, EntitlementsStartupSeeder>();
        
        return services;
    }
}`,
  },

  // ─── Backend Structure ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.backendTitle",
    id: "backend-structure",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.backendIntro",
  },
  {
    type: "code",
    language: "text",
    filename: "Backend Module Structure",
    code: `Entitlements/
├── Entitlements.Domain/
│   ├── Entities/
│   │   ├── Feature.cs                  # Controllable capability
│   │   ├── Edition.cs                  # Named plan (Basic, Pro, Enterprise)
│   │   ├── EditionFeature.cs           # Feature value within an edition
│   │   ├── EditionVersion.cs           # Versioned snapshot of edition features
│   │   ├── TenantSubscription.cs       # Tenant ↔ Edition binding
│   │   ├── TenantFeatureOverride.cs    # Per-tenant custom value
│   │   └── QuotaCounter.cs            # Usage tracking for numeric features
│   ├── Interfaces/
│   │   ├── IFeatureRepository.cs
│   │   ├── IEditionRepository.cs
│   │   ├── ISubscriptionRepository.cs
│   │   └── IFeatureOverrideRepository.cs
│   ├── Enums/
│   │   ├── FeatureValueType.cs         # Boolean, Numeric, String
│   │   ├── OverflowPolicy.cs           # Block, Warn, Allow
│   │   ├── SubscriptionType.cs         # Monthly, Annual, Lifetime, Trial
│   │   ├── SubscriptionStatus.cs       # Active, Suspended, Cancelled, Expired
│   │   ├── RolloutStrategy.cs          # Immediate, Gradual, Manual
│   │   └── ExpiryBehavior.cs           # Downgrade, Suspend, Grace
│   └── Specifications/
│       └── FeatureSearchSpec.cs
├── Entitlements.Application/
│   ├── Commands/
│   │   ├── Features/     # CreateFeature, UpdateFeature, DeleteFeature
│   │   ├── Editions/     # CRUD + SetFeatures + DirectApply + Versions
│   │   ├── Subscriptions/ # Assign, Upgrade, Downgrade, Suspend, Resume, Cancel
│   │   └── Overrides/    # SetOverride, RemoveOverride
│   ├── Queries/
│   │   ├── Features/     # GetFeatures, GetFeatureById
│   │   ├── Editions/     # GetEditions, GetById, GetFeatures, GetVersions
│   │   ├── Subscriptions/ # GetSubscriptions, GetById, GetDowngradeImpact
│   │   └── Overrides/    # GetOverrides, GetResolvedFeatures
│   ├── DTOs/             # Request/Response DTOs
│   ├── Mapping/          # explicit DTO mapping rules
│   ├── Services/
│   │   └── EditionConstraintValidator.cs
│   └── Abstractions/
│       ├── IFeatureCache.cs
│       ├── IDowngradeImpactValidator.cs
│       ├── IOverflowPolicyExecutor.cs
│       └── IQuotaCounterProvisioner.cs
└── Entitlements.Infrastructure/
    ├── EntitlementsDbContextFactory.cs
    ├── EntitlementsStartupSeeder.cs
    ├── Persistence/
    │   ├── FeatureRepository.cs
    │   ├── EditionRepository.cs
    │   ├── SubscriptionRepository.cs
    │   └── FeatureOverrideRepository.cs
    ├── Caching/
    │   ├── FeatureCache.cs
    │   └── NoOpFeatureCache.cs
    └── DependencyInjection.cs`,
  },

  // ─── Frontend Structure ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.frontendTitle",
    id: "frontend-structure",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.frontendIntro",
  },
  {
    type: "code",
    language: "text",
    filename: "Frontend Module Structure",
    code: `src/modules/entitlements/
├── editions/                    # Edition management
│   └── src/
│       ├── domain/
│       │   ├── entities/        # Edition.ts, EditionFeature.ts, EditionVersion.ts
│       │   └── interfaces/      # IEditionRepository.ts
│       ├── data/
│       │   ├── models/          # EditionDto.ts, EditionFeatureDto.ts
│       │   ├── mappers/         # EditionMapper.ts
│       │   └── repositories/    # EditionRepository.ts
│       └── presentation/
│           ├── viewmodels/      # useEditionsViewModel.ts, useEditionDetailViewModel.ts
│           ├── views/           # EditionsView.tsx, EditionDetailView.tsx
│           └── components/      # EditionFeaturesTable.tsx, VersionHistory.tsx
├── features/                    # Feature registry
│   └── src/ { domain, data, presentation }
├── subscriptions/               # Subscription lifecycle
│   └── src/ { domain, data, presentation }
└── overrides/                   # Per-tenant overrides
    └── src/ { domain, data, presentation }`,
  },

  // ─── API Controllers ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.controllersTitle",
    id: "api-controllers",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.controllersIntro",
  },
  {
    type: "table",
    headers: ["Controller", "Route Prefix", "Endpoints", "Permission Prefix", "Key Operations"],
    rows: [
      [
        "EditionsController",
        "/api/v1/editions",
        "11",
        "editions.*",
        "CRUD, SetFeatures, DirectApply, Versions, Publish, Rollback",
      ],
      [
        "FeaturesController",
        "/api/v1/features",
        "5",
        "features.*",
        "CRUD (system features are read-only)",
      ],
      [
        "SubscriptionsController",
        "/api/v1/subscriptions",
        "12",
        "subscriptions.*",
        "Assign, Upgrade, Downgrade, Suspend, Resume, Cancel, Renew, DowngradeImpact",
      ],
      [
        "TenantFeaturesController",
        "/api/v1/tenants/{id}/features",
        "4",
        "features.*",
        "SetOverride, RemoveOverride, GetOverrides, GetResolved",
      ],
    ],
  },

  // ─── Feature Comparison Table ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.comparisonTitle",
    id: "comparison",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.comparisonIntro",
  },
  {
    type: "table",
    headers: ["Capability", "Without Entitlements", "With Entitlements"],
    rows: [
      [
        "Feature Gating",
        "Manual if/else checks scattered in code",
        "Automatic pipeline-level gating via IRequireFeature",
      ],
      ["Plan Management", "Hard-coded tier logic", "Dynamic editions with feature bundles"],
      ["Quota Enforcement", "No enforcement", "Automatic quota tracking with QuotaCounter"],
      ["Plan Changes", "Manual DB updates", "Safe upgrade/downgrade with impact analysis"],
      ["Custom Deals", "Code changes required", "Override via API without touching code"],
      ["Version Control", "No versioning", "Edition versions with rollout strategies"],
      ["Audit Trail", "No tracking", "Every change audited automatically"],
      ["Reseller Support", "Not possible", "Tenant-scoped retail editions"],
    ],
  },

  // ─── NoOp Fallback ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.noOpTitle",
    id: "noop-fallback",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.noOpIntro",
  },
  {
    type: "code",
    language: "csharp",
    filename: "NoOpFeatureCache.cs",
    code: `/// <summary>
/// Registered when the Entitlements module is not loaded.
/// All features are treated as enabled with unlimited quotas.
/// </summary>
public class NoOpFeatureCache : IFeatureCache
{
    public Task<ResolvedFeature> GetResolvedValue(
        Guid tenantId, string featureName)
    {
        return Task.FromResult(new ResolvedFeature
        {
            Name = featureName,
            Value = "true",          // Always enabled
            ValueType = FeatureValueType.Boolean,
            Source = ResolutionSource.Default,
        });
    }

    public Task<int> GetCurrentUsage(Guid tenantId, string featureName)
        => Task.FromResult(0); // No usage tracked
}`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.entitlementsOverview.noOpNote",
  },

  // ─── Getting Started ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.entitlementsOverview.gettingStartedTitle",
    id: "getting-started",
  },
  {
    type: "paragraph",
    contentKey: "modules.entitlementsOverview.gettingStartedIntro",
  },
  {
    type: "code",
    language: "text",
    filename: "Quick Start Steps",
    code: `Step 1: Define Features
  → POST /api/v1/features
  → Create features like "Chat.Enabled" (Boolean), "MaxAdmins" (Numeric)

Step 2: Create Editions
  → POST /api/v1/editions
  → Create plans like "Basic", "Pro", "Enterprise"
  → Set feature values per edition

Step 3: Assign Subscriptions
  → POST /api/v1/subscriptions
  → Link each tenant to an edition

Step 4: Gate Commands (Optional)
  → Implement IRequireFeature on commands
  → FeatureCheckBehavior automatically enforces

Step 5: Apply Overrides (Optional)
  → POST /api/v1/tenants/{id}/features/overrides
  → Give specific tenants custom values`,
  },
];

registerPage({
  slug: "modules/entitlements-overview",
  titleKey: "modules.entitlementsOverview.title",
  descriptionKey: "modules.entitlementsOverview.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: [
    "modules/editions",
    "modules/subscriptions",
    "modules/features",
    "modules/overrides",
    "architecture/cqrs-pipeline",
  ],
  lastUpdated: "2026-03-02",
});
