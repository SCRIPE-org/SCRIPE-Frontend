import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      {
            type: "paragraph",
            contentKey: "modules.features.intro",
      },

      // ─── Feature Entity ───────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.entityTitle",
            id: "feature-entity",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.entityIntro",
      },
      {
            type: "table",
            headers: ["Property", "Type", "Description"],
            rows: [
                  ["Id", "Guid", "Primary key"],
                  ["Name", "string", "Unique system key (e.g. 'Chat.Enabled', 'MaxAdmins')"],
                  ["DisplayName", "string", "Human-readable name for UI display"],
                  ["Description", "string?", "Detailed description of what this feature controls"],
                  ["Category", "string?", "Grouping category (e.g. 'Communication', 'Security', 'Limits')"],
                  ["ValueType", "enum", "Boolean, Numeric, String"],
                  ["DefaultValue", "string", "Fallback value when no edition or override specifies one"],
                  ["IsSystem", "bool", "System features are read-only (seeded, cannot be deleted)"],
                  ["IsVisible", "bool", "Whether to show this feature in the admin UI"],
                  ["MinValue", "string?", "Minimum allowed value (for Numeric type)"],
                  ["MaxValue", "string?", "Maximum allowed value (for Numeric type, -1 = unlimited)"],
                  ["AllowedValues", "string?", "Comma-separated valid values (for String type)"],
                  ["SortOrder", "int", "Display order in feature list"],
                  ["CreatedAt", "DateTime", "When the feature was created"],
                  ["UpdatedAt", "DateTime?", "Last modification timestamp"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "Feature Entity",
            code: `public class Feature : AuditableEntity, ISoftDeletable
{
    public string Name { get; set; } = string.Empty;        // Unique system key
    public string DisplayName { get; set; } = string.Empty;  // UI label
    public string? Description { get; set; }
    public string? Category { get; set; }                    // Grouping
    
    public FeatureValueType ValueType { get; set; } = FeatureValueType.Boolean;
    public string DefaultValue { get; set; } = "false";     // Global fallback
    
    public bool IsSystem { get; set; }                      // Read-only if true
    public bool IsVisible { get; set; } = true;
    
    // Validation constraints (Numeric features)
    public string? MinValue { get; set; }                   // e.g. "0"
    public string? MaxValue { get; set; }                   // e.g. "1000", "-1" = unlimited
    public string? AllowedValues { get; set; }              // e.g. "light,dark,custom"
    
    public int SortOrder { get; set; }
}`,
      },

      // ─── Value Types ──────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.valueTypesTitle",
            id: "value-types",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.valueTypesIntro",
      },
      {
            type: "table",
            headers: ["Type", "Stored As", "Example Values", "Quota Tracking", "Use Case"],
            rows: [
                  ["Boolean", "\"true\" / \"false\"", "\"true\"", "No", "Toggle capabilities on/off (Chat.Enabled, SSO.Enabled)"],
                  ["Numeric", "Integer string", "\"50\", \"1000\", \"-1\" (unlimited)", "Yes (QuotaCounter)", "Resource limits (MaxAdmins, MaxStorage, MaxApiCalls)"],
                  ["String", "Arbitrary string", "\"dark\", \"premium\", \"custom-logo.png\"", "No", "Configuration values (Theme, LogoUrl, SupportTier)"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "FeatureValueType Enum",
            code: `public enum FeatureValueType
{
    /// <summary>On/Off toggle, stored as "true" or "false"</summary>
    Boolean = 0,
    
    /// <summary>Numeric limit, stored as integer string. -1 = unlimited</summary>
    Numeric = 1,
    
    /// <summary>Arbitrary string configuration value</summary>
    String = 2,
}`,
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "modules.features.valueTypesTip",
      },

      // ─── System vs Custom Features ────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.systemVsCustomTitle",
            id: "system-vs-custom",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.systemVsCustomIntro",
      },
      {
            type: "table",
            headers: ["", "System Features", "Custom Features"],
            rows: [
                  ["Created By", "Startup seeder (EntitlementsStartupSeeder)", "Platform admin via API"],
                  ["Deletable", "No (ISoftDeletable guarded)", "Yes"],
                  ["Editable", "Only DefaultValue and Description", "Fully editable"],
                  ["Purpose", "Core platform capabilities", "Tenant-specific extensions"],
                  ["Examples", "Chat.Enabled, MaxAdmins, SSO.Enabled", "CustomReports, MaxProjects, WhiteLabel"],
            ],
      },

      // ─── Feature Seeding ──────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.seedingTitle",
            id: "seeding",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.seedingIntro",
      },
      {
            type: "code",
            language: "csharp",
            filename: "EntitlementsStartupSeeder.cs",
            code: `public class EntitlementsStartupSeeder : IStartupSeeder
{
    private readonly IFeatureRepository _features;

    public async Task SeedAsync(CancellationToken ct)
    {
        var systemFeatures = new[]
        {
            new Feature 
            { 
                Name = "Chat.Enabled", 
                DisplayName = "Chat", 
                ValueType = FeatureValueType.Boolean,
                DefaultValue = "false",
                IsSystem = true,
                Category = "Communication"
            },
            new Feature 
            { 
                Name = "MaxAdmins", 
                DisplayName = "Maximum Administrators",
                ValueType = FeatureValueType.Numeric,
                DefaultValue = "5",
                MinValue = "1",
                MaxValue = "-1",
                IsSystem = true,
                Category = "Limits"
            },
            new Feature 
            { 
                Name = "SSO.Enabled", 
                DisplayName = "Single Sign-On",
                ValueType = FeatureValueType.Boolean,
                DefaultValue = "false",
                IsSystem = true,
                Category = "Security"
            },
        };

        foreach (var feature in systemFeatures)
        {
            if (!await _features.ExistsByNameAsync(feature.Name, ct))
                await _features.AddAsync(feature, ct);
        }
    }
}`,
      },

      // ─── Quota Tracking ───────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.quotaTitle",
            id: "quota-tracking",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.quotaIntro",
      },
      {
            type: "table",
            headers: ["Property", "Type", "Description"],
            rows: [
                  ["TenantId", "Guid", "The tenant owning this counter"],
                  ["FeatureName", "string", "The numeric feature being tracked"],
                  ["CurrentUsage", "int", "Current resource count"],
                  ["LastUpdated", "DateTime", "When usage was last updated"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "Quota Enforcement Flow",
            code: `// Inside FeatureCheckBehavior for Numeric features:
if (resolved.ValueType == FeatureValueType.Numeric)
{
    var limit = int.Parse(resolved.Value);
    
    if (limit == -1) 
        return await next(); // -1 = unlimited, skip check
    
    var counter = await _quotaCounterProvider.GetCounter(tenantId, featureName);
    
    if (counter.CurrentUsage >= limit)
    {
        return Result.Forbidden(
            $"Quota exceeded: {featureName} " +
            $"(usage: {counter.CurrentUsage}, limit: {limit})");
    }
    
    // Increment counter after successful operation
    await _quotaCounterProvider.Increment(tenantId, featureName);
    
    return await next();
}`,
      },

      // ─── Feature Cache ────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.cacheTitle",
            id: "feature-cache",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.cacheIntro",
      },
      {
            type: "flowchart",
            direction: "vertical",
            nodes: [
                  { id: "req", label: "Feature Request", description: "IRequireFeature command" },
                  { id: "cache", label: "FeatureCache", description: "In-memory cache" },
                  { id: "miss", label: "Cache Miss", description: "First access" },
                  { id: "resolve", label: "Resolution Chain", description: "Override → Edition → Default" },
                  { id: "hit", label: "Cache Hit", description: "Instant return" },
            ],
            connections: [
                  { from: "req", to: "cache", label: "GetResolvedValue()" },
                  { from: "cache", to: "hit", label: "exists?" },
                  { from: "cache", to: "miss", label: "not found" },
                  { from: "miss", to: "resolve", label: "query DB" },
                  { from: "resolve", to: "cache", label: "store result" },
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "modules.features.cacheNote",
      },

      // ─── IRequireFeature Pattern ──────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.patternTitle",
            id: "irequirefeature",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.patternIntro",
      },
      {
            type: "code",
            language: "csharp",
            filename: "Using IRequireFeature",
            code: `// Step 1: Mark your command
public class SendBulkEmailCommand : IRequest<Result>, IRequireFeature
{
    public string RequiredFeatureName => "BulkEmail.Enabled";
    
    public List<string> Recipients { get; set; } = [];
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

// Step 2: That's it! FeatureCheckBehavior handles the rest.
// If "BulkEmail.Enabled" is false for the tenant → 403 Forbidden
// If "BulkEmail.Enabled" is true → command proceeds normally

// For numeric features with quotas:
public class CreateProjectCommand : IRequest<Result<Guid>>, IRequireFeature
{
    public string RequiredFeatureName => "MaxProjects";
    
    // FeatureCheckBehavior checks: current_projects < MaxProjects limit
    // If over limit → 403 "Quota exceeded"
    // If under limit → auto-increment QuotaCounter + proceed
}`,
      },

      // ─── API Endpoints ────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "modules.features.endpointsTitle",
            id: "api-endpoints",
      },
      {
            type: "paragraph",
            contentKey: "modules.features.endpointsIntro",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/features", descriptionKey: "modules.features.ep.list", auth: "JWT", permission: "features.view" },
                  { method: "GET", path: "/api/v1/features/{id}", descriptionKey: "modules.features.ep.get", auth: "JWT", permission: "features.view" },
                  { method: "POST", path: "/api/v1/features", descriptionKey: "modules.features.ep.create", auth: "JWT", permission: "features.create" },
                  { method: "PUT", path: "/api/v1/features/{id}", descriptionKey: "modules.features.ep.update", auth: "JWT", permission: "features.update" },
                  { method: "DELETE", path: "/api/v1/features/{id}", descriptionKey: "modules.features.ep.delete", auth: "JWT", permission: "features.delete" },
            ],
      },
];

registerPage({
      slug: "modules/features",
      titleKey: "modules.features.title",
      descriptionKey: "modules.features.description",
      category: "modules",
      order: 4,
      sections,
      relatedSlugs: ["modules/entitlements-overview", "modules/editions", "modules/overrides"],
      lastUpdated: "2026-03-02",
});
