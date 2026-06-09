import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/background-jobs",
  titleKey: "infrastructure.backgroundJobs.title",
  category: "infrastructure",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    config([\"appsettings.json\nProvider + Per-Job Overrides\"])\n    %% config: Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }\n    startup([\"BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()\"])\n    %% startup: Reads provider, discovers all jobs, schedules them\n    discovery{{\"Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()\"}}\n    %% discovery: Scans DI container for every registered IAutoRegisteredJob\n    schedule([\"Schedule Each Job\nIf Enabled -> Register with provider API\"])\n    %% schedule: Uses CronExpression from appsettings override or job default\n    execute[\"job.ExecuteAsync(ct)\nAt every cron tick\"]\n    %% execute: Provider-agnostic - job has zero knowledge of which provider runs it\n    config -->|\"drives\"| startup\n    startup -->|\"triggers\"| discovery\n    discovery -->|\"for each job\"| schedule\n    schedule -->|\"on cron tick\"| execute",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_6_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface IAutoRegisteredJob\n{\n    // Unique job identifier — kebab-case: \"{module}-{purpose}\"\n    // Examples: \"identity-soft-delete-cleanup\", \"compliance-dsr-execution\"\n    string JobId { get; }\n\n    // Standard 5-field CRON expression\n    // Can be overridden per-job in appsettings.json at runtime\n    string CronExpression { get; }\n\n    // Default true — can be disabled in appsettings.json\n    bool Enabled => true;\n\n    // MUST be idempotent — safe to call multiple times\n    // Provider calls this on every cron tick\n    Task ExecuteAsync(CancellationToken ct = default);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_10_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_11_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Line 1: Concrete type (enables constructor injection)\nservices.AddScoped<MyJob>();\n\n// Line 2: Factory delegate (enables auto-discovery) — NEVER SKIP THIS\nservices.AddScoped<IAutoRegisteredJob>(sp =>\n    sp.GetRequiredService<MyJob>());\n\n// WHY TWO LINES?\n// GetServices<IAutoRegisteredJob>() scans for everything registered AS IAutoRegisteredJob.\n// Without line 2, the scan returns nothing for MyJob — it is invisible to all providers.",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "danger",
    "titleKey": "infrastructure.backgroundJobs.section_13_title",
    "contentKey": "infrastructure.backgroundJobs.section_13_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_16_hdr_0",
      "infrastructure.backgroundJobs.section_16_hdr_1",
      "infrastructure.backgroundJobs.section_16_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_16_cell_0_0",
        "infrastructure.backgroundJobs.section_16_cell_0_1",
        "infrastructure.backgroundJobs.section_16_cell_0_2"
      ],
      [
        "infrastructure.backgroundJobs.section_16_cell_1_0",
        "infrastructure.backgroundJobs.section_16_cell_1_1",
        "infrastructure.backgroundJobs.section_16_cell_1_2"
      ],
      [
        "infrastructure.backgroundJobs.section_16_cell_2_0",
        "infrastructure.backgroundJobs.section_16_cell_2_1",
        "infrastructure.backgroundJobs.section_16_cell_2_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_17_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public abstract class RecurringJobBase : IAutoRegisteredJob\n{\n    protected ILogger Logger { get; }\n\n    public abstract string JobId { get; }\n    public abstract string CronExpression { get; }\n\n    public async Task ExecuteAsync(CancellationToken ct = default)\n    {\n        var sw = Stopwatch.StartNew();\n        Logger.LogInformation(\"[{JobId}] Starting\", JobId);\n        try\n        {\n            await ExecuteJobAsync(ct);\n            Logger.LogInformation(\"[{JobId}] Completed in {Elapsed}ms\", JobId, sw.ElapsedMilliseconds);\n        }\n        catch (Exception ex)\n        {\n            Logger.LogError(ex, \"[{JobId}] Failed after {Elapsed}ms\", JobId, sw.ElapsedMilliseconds);\n            throw; // Let the provider handle retry\n        }\n    }\n\n    protected abstract Task ExecuteJobAsync(CancellationToken ct);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_20_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_21_hdr_0",
      "infrastructure.backgroundJobs.section_21_hdr_1",
      "infrastructure.backgroundJobs.section_21_hdr_2",
      "infrastructure.backgroundJobs.section_21_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_21_cell_0_0",
        "infrastructure.backgroundJobs.section_21_cell_0_1",
        "infrastructure.backgroundJobs.section_21_cell_0_2",
        "infrastructure.backgroundJobs.section_21_cell_0_3"
      ],
      [
        "infrastructure.backgroundJobs.section_21_cell_1_0",
        "infrastructure.backgroundJobs.section_21_cell_1_1",
        "infrastructure.backgroundJobs.section_21_cell_1_2",
        "infrastructure.backgroundJobs.section_21_cell_1_3"
      ],
      [
        "infrastructure.backgroundJobs.section_21_cell_2_0",
        "infrastructure.backgroundJobs.section_21_cell_2_1",
        "infrastructure.backgroundJobs.section_21_cell_2_2",
        "infrastructure.backgroundJobs.section_21_cell_2_3"
      ],
      [
        "infrastructure.backgroundJobs.section_21_cell_3_0",
        "infrastructure.backgroundJobs.section_21_cell_3_1",
        "infrastructure.backgroundJobs.section_21_cell_3_2",
        "infrastructure.backgroundJobs.section_21_cell_3_3"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_22_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"BackgroundJobs\": {\n    \"Provider\": \"Hangfire\",          // \"Native\" | \"Hangfire\" | \"Quartz\"\n    \"PollingIntervalSeconds\": 60,    // Native only\n    \"Jobs\": {\n      \"identity-soft-delete-cleanup\": {\n        \"Enabled\": true,\n        \"CronExpression\": \"0 3 * * *\"  // Override default cron\n      },\n      \"analytics-report\": {\n        \"Enabled\": false               // Disable a job in this environment\n      },\n      \"compliance-dsr-execution\": {\n        \"CronExpression\": \"*/2 * * * *\"  // Override cron only\n      }\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_25_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_27_hdr_0",
      "infrastructure.backgroundJobs.section_27_hdr_1",
      "infrastructure.backgroundJobs.section_27_hdr_2",
      "infrastructure.backgroundJobs.section_27_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_27_cell_0_0",
        "infrastructure.backgroundJobs.section_27_cell_0_1",
        "infrastructure.backgroundJobs.section_27_cell_0_2",
        "infrastructure.backgroundJobs.section_27_cell_0_3"
      ],
      [
        "infrastructure.backgroundJobs.section_27_cell_1_0",
        "infrastructure.backgroundJobs.section_27_cell_1_1",
        "infrastructure.backgroundJobs.section_27_cell_1_2",
        "infrastructure.backgroundJobs.section_27_cell_1_3"
      ],
      [
        "infrastructure.backgroundJobs.section_27_cell_2_0",
        "infrastructure.backgroundJobs.section_27_cell_2_1",
        "infrastructure.backgroundJobs.section_27_cell_2_2",
        "infrastructure.backgroundJobs.section_27_cell_2_3"
      ],
      [
        "infrastructure.backgroundJobs.section_27_cell_3_0",
        "infrastructure.backgroundJobs.section_27_cell_3_1",
        "infrastructure.backgroundJobs.section_27_cell_3_2",
        "infrastructure.backgroundJobs.section_27_cell_3_3"
      ],
      [
        "infrastructure.backgroundJobs.section_27_cell_4_0",
        "infrastructure.backgroundJobs.section_27_cell_4_1",
        "infrastructure.backgroundJobs.section_27_cell_4_2",
        "infrastructure.backgroundJobs.section_27_cell_4_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_29_hdr_0",
      "infrastructure.backgroundJobs.section_29_hdr_1",
      "infrastructure.backgroundJobs.section_29_hdr_2",
      "infrastructure.backgroundJobs.section_29_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_29_cell_0_0",
        "infrastructure.backgroundJobs.section_29_cell_0_1",
        "infrastructure.backgroundJobs.section_29_cell_0_2",
        "infrastructure.backgroundJobs.section_29_cell_0_3"
      ],
      [
        "infrastructure.backgroundJobs.section_29_cell_1_0",
        "infrastructure.backgroundJobs.section_29_cell_1_1",
        "infrastructure.backgroundJobs.section_29_cell_1_2",
        "infrastructure.backgroundJobs.section_29_cell_1_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "infrastructure.backgroundJobs.section_30_title",
    "contentKey": "infrastructure.backgroundJobs.section_30_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_32_hdr_0",
      "infrastructure.backgroundJobs.section_32_hdr_1",
      "infrastructure.backgroundJobs.section_32_hdr_2",
      "infrastructure.backgroundJobs.section_32_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_32_cell_0_0",
        "infrastructure.backgroundJobs.section_32_cell_0_1",
        "infrastructure.backgroundJobs.section_32_cell_0_2",
        "infrastructure.backgroundJobs.section_32_cell_0_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_1_0",
        "infrastructure.backgroundJobs.section_32_cell_1_1",
        "infrastructure.backgroundJobs.section_32_cell_1_2",
        "infrastructure.backgroundJobs.section_32_cell_1_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_2_0",
        "infrastructure.backgroundJobs.section_32_cell_2_1",
        "infrastructure.backgroundJobs.section_32_cell_2_2",
        "infrastructure.backgroundJobs.section_32_cell_2_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_3_0",
        "infrastructure.backgroundJobs.section_32_cell_3_1",
        "infrastructure.backgroundJobs.section_32_cell_3_2",
        "infrastructure.backgroundJobs.section_32_cell_3_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_4_0",
        "infrastructure.backgroundJobs.section_32_cell_4_1",
        "infrastructure.backgroundJobs.section_32_cell_4_2",
        "infrastructure.backgroundJobs.section_32_cell_4_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_5_0",
        "infrastructure.backgroundJobs.section_32_cell_5_1",
        "infrastructure.backgroundJobs.section_32_cell_5_2",
        "infrastructure.backgroundJobs.section_32_cell_5_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_6_0",
        "infrastructure.backgroundJobs.section_32_cell_6_1",
        "infrastructure.backgroundJobs.section_32_cell_6_2",
        "infrastructure.backgroundJobs.section_32_cell_6_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_7_0",
        "infrastructure.backgroundJobs.section_32_cell_7_1",
        "infrastructure.backgroundJobs.section_32_cell_7_2",
        "infrastructure.backgroundJobs.section_32_cell_7_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_8_0",
        "infrastructure.backgroundJobs.section_32_cell_8_1",
        "infrastructure.backgroundJobs.section_32_cell_8_2",
        "infrastructure.backgroundJobs.section_32_cell_8_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_9_0",
        "infrastructure.backgroundJobs.section_32_cell_9_1",
        "infrastructure.backgroundJobs.section_32_cell_9_2",
        "infrastructure.backgroundJobs.section_32_cell_9_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_10_0",
        "infrastructure.backgroundJobs.section_32_cell_10_1",
        "infrastructure.backgroundJobs.section_32_cell_10_2",
        "infrastructure.backgroundJobs.section_32_cell_10_3"
      ],
      [
        "infrastructure.backgroundJobs.section_32_cell_11_0",
        "infrastructure.backgroundJobs.section_32_cell_11_1",
        "infrastructure.backgroundJobs.section_32_cell_11_2",
        "infrastructure.backgroundJobs.section_32_cell_11_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_34_hdr_0",
      "infrastructure.backgroundJobs.section_34_hdr_1",
      "infrastructure.backgroundJobs.section_34_hdr_2",
      "infrastructure.backgroundJobs.section_34_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_34_cell_0_0",
        "infrastructure.backgroundJobs.section_34_cell_0_1",
        "infrastructure.backgroundJobs.section_34_cell_0_2",
        "infrastructure.backgroundJobs.section_34_cell_0_3"
      ],
      [
        "infrastructure.backgroundJobs.section_34_cell_1_0",
        "infrastructure.backgroundJobs.section_34_cell_1_1",
        "infrastructure.backgroundJobs.section_34_cell_1_2",
        "infrastructure.backgroundJobs.section_34_cell_1_3"
      ],
      [
        "infrastructure.backgroundJobs.section_34_cell_2_0",
        "infrastructure.backgroundJobs.section_34_cell_2_1",
        "infrastructure.backgroundJobs.section_34_cell_2_2",
        "infrastructure.backgroundJobs.section_34_cell_2_3"
      ],
      [
        "infrastructure.backgroundJobs.section_34_cell_3_0",
        "infrastructure.backgroundJobs.section_34_cell_3_1",
        "infrastructure.backgroundJobs.section_34_cell_3_2",
        "infrastructure.backgroundJobs.section_34_cell_3_3"
      ],
      [
        "infrastructure.backgroundJobs.section_34_cell_4_0",
        "infrastructure.backgroundJobs.section_34_cell_4_1",
        "infrastructure.backgroundJobs.section_34_cell_4_2",
        "infrastructure.backgroundJobs.section_34_cell_4_3"
      ],
      [
        "infrastructure.backgroundJobs.section_34_cell_5_0",
        "infrastructure.backgroundJobs.section_34_cell_5_1",
        "infrastructure.backgroundJobs.section_34_cell_5_2",
        "infrastructure.backgroundJobs.section_34_cell_5_3"
      ],
      [
        "infrastructure.backgroundJobs.section_34_cell_6_0",
        "infrastructure.backgroundJobs.section_34_cell_6_1",
        "infrastructure.backgroundJobs.section_34_cell_6_2",
        "infrastructure.backgroundJobs.section_34_cell_6_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_36_hdr_0",
      "infrastructure.backgroundJobs.section_36_hdr_1",
      "infrastructure.backgroundJobs.section_36_hdr_2",
      "infrastructure.backgroundJobs.section_36_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_36_cell_0_0",
        "infrastructure.backgroundJobs.section_36_cell_0_1",
        "infrastructure.backgroundJobs.section_36_cell_0_2",
        "infrastructure.backgroundJobs.section_36_cell_0_3"
      ],
      [
        "infrastructure.backgroundJobs.section_36_cell_1_0",
        "infrastructure.backgroundJobs.section_36_cell_1_1",
        "infrastructure.backgroundJobs.section_36_cell_1_2",
        "infrastructure.backgroundJobs.section_36_cell_1_3"
      ],
      [
        "infrastructure.backgroundJobs.section_36_cell_2_0",
        "infrastructure.backgroundJobs.section_36_cell_2_1",
        "infrastructure.backgroundJobs.section_36_cell_2_2",
        "infrastructure.backgroundJobs.section_36_cell_2_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_38_hdr_0",
      "infrastructure.backgroundJobs.section_38_hdr_1",
      "infrastructure.backgroundJobs.section_38_hdr_2",
      "infrastructure.backgroundJobs.section_38_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_38_cell_0_0",
        "infrastructure.backgroundJobs.section_38_cell_0_1",
        "infrastructure.backgroundJobs.section_38_cell_0_2",
        "infrastructure.backgroundJobs.section_38_cell_0_3"
      ],
      [
        "infrastructure.backgroundJobs.section_38_cell_1_0",
        "infrastructure.backgroundJobs.section_38_cell_1_1",
        "infrastructure.backgroundJobs.section_38_cell_1_2",
        "infrastructure.backgroundJobs.section_38_cell_1_3"
      ],
      [
        "infrastructure.backgroundJobs.section_38_cell_2_0",
        "infrastructure.backgroundJobs.section_38_cell_2_1",
        "infrastructure.backgroundJobs.section_38_cell_2_2",
        "infrastructure.backgroundJobs.section_38_cell_2_3"
      ],
      [
        "infrastructure.backgroundJobs.section_38_cell_3_0",
        "infrastructure.backgroundJobs.section_38_cell_3_1",
        "infrastructure.backgroundJobs.section_38_cell_3_2",
        "infrastructure.backgroundJobs.section_38_cell_3_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_40_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_42_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_43_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// {Module}.Infrastructure/BackgroundJobs/ProductExpiryJob.cs\npublic class ProductExpiryJob : IAutoRegisteredJob\n{\n    private readonly IProductRepository _repo;\n    private readonly IUnitOfWork _uow;\n    private readonly ILogger<ProductExpiryJob> _logger;\n\n    public ProductExpiryJob(\n        IProductRepository repo,\n        IUnitOfWork uow,\n        ILogger<ProductExpiryJob> logger)\n    {\n        _repo = repo;\n        _uow = uow;\n        _logger = logger;\n    }\n\n    // Convention: \"{module}-{purpose}\" in kebab-case\n    public string JobId => \"products-expiry-check\";\n    public string CronExpression => \"0 6 * * *\"; // Daily at 6 AM\n\n    public async Task ExecuteAsync(CancellationToken ct = default)\n    {\n        var expired = await _repo.GetExpiredProductsAsync(ct);\n        foreach (var product in expired)\n            product.MarkExpired();\n        await _uow.SaveChangesAsync(ct);\n        _logger.LogInformation(\"[{JobId}] Marked {Count} expired\", JobId, expired.Count);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_45_title",
    "id": "sec_45"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_46_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_47_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Products.Infrastructure/DependencyInjection.cs\n// BOTH lines are mandatory — never skip line 2\nservices.AddScoped<ProductExpiryJob>();\nservices.AddScoped<IAutoRegisteredJob>(sp =>\n    sp.GetRequiredService<ProductExpiryJob>());",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_49_title",
    "id": "sec_49"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_50_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_51_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"BackgroundJobs\": {\n    \"Jobs\": {\n      \"products-expiry-check\": {\n        \"Enabled\": true,\n        \"CronExpression\": \"0 6 * * *\"\n      }\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.backgroundJobs.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_54_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_55_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "scripe build backend\n# Must output: Build succeeded. 0 Error(s)\n# Auto-discovery handles the rest — no other wiring needed",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_57_title",
    "id": "sec_57"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_58_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    cron[\"Cron Tick (3:00 AM)\"]\n    %% cron: Default cron for Soft Delete jobs\n    init[\"SoftDeleteCleanupJob<TContext>\"]\n    %% init: Instantiated by DI container\n    scan[\"Discover ISoftDeletable\"]\n    %% scan: Reflection scan on DbContext for entities implementing ISoftDeletable\n    filter[\"Filter Expired Entities\"]\n    %% filter: Find records where IsDeleted = true AND DeletedAt < DateTime.UtcNow.AddDays(-30)\n    cascade[\"FK-Aware Cascading\"]\n    %% cascade: Handles foreign key constraints in correct deletion order\n    execute[\"Hard Delete\"]\n    %% execute: Execute native SQL for bulk deletion, bypassing EF change tracking\n    cron -->|\"triggers\"| init\n    init -->|\"starts\"| scan\n    scan -->|\"builds query\"| filter\n    filter -->|\"orders\"| cascade\n    cascade -->|\"removes\"| execute",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_60_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Add soft-delete cleanup job to a module\nscripe add-bg-service Products\n\n# This generates:\n# 1. Products.Infrastructure/BackgroundJobs/ProductsSoftDeleteCleanupJob.cs\n# 2. Registers BOTH DI lines in Products.Infrastructure/DependencyInjection.cs",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.backgroundJobs.section_62_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Minimum implementation — inherits FK-aware deletion logic\n// Auto-discovers all ISoftDeletable entities in ProductsDbContext\npublic class ProductsSoftDeleteCleanupJob\n    : SoftDeleteCleanupJob<ProductsDbContext>\n{\n    public ProductsSoftDeleteCleanupJob(\n        ProductsDbContext context,\n        IOptions<SoftDeleteCleanupOptions> options,\n        ILogger<ProductsSoftDeleteCleanupJob> logger)\n        : base(context, options, logger) { }\n\n    public override string JobId => \"products-soft-delete-cleanup\";\n    // CronExpression defaults to \"0 3 * * *\" from base class\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "infrastructure.backgroundJobs.section_64_title",
    "contentKey": "infrastructure.backgroundJobs.section_64_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_65_title",
    "id": "sec_65"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.backgroundJobs.section_66_hdr_0",
      "infrastructure.backgroundJobs.section_66_hdr_1"
    ],
    "rows": [
      [
        "infrastructure.backgroundJobs.section_66_cell_0_0",
        "infrastructure.backgroundJobs.section_66_cell_0_1"
      ],
      [
        "infrastructure.backgroundJobs.section_66_cell_1_0",
        "infrastructure.backgroundJobs.section_66_cell_1_1"
      ],
      [
        "infrastructure.backgroundJobs.section_66_cell_2_0",
        "infrastructure.backgroundJobs.section_66_cell_2_1"
      ],
      [
        "infrastructure.backgroundJobs.section_66_cell_3_0",
        "infrastructure.backgroundJobs.section_66_cell_3_1"
      ],
      [
        "infrastructure.backgroundJobs.section_66_cell_4_0",
        "infrastructure.backgroundJobs.section_66_cell_4_1"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "infrastructure.backgroundJobs.section_67_title",
    "contentKey": "infrastructure.backgroundJobs.section_67_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.backgroundJobs.section_68_title",
    "id": "sec_68"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.backgroundJobs.section_69_item_0",
      "infrastructure.backgroundJobs.section_69_item_1",
      "infrastructure.backgroundJobs.section_69_item_2",
      "infrastructure.backgroundJobs.section_69_item_3"
    ]
  }
],
  relatedSlugs: [
  "architecture/domain-events",
  "security/audit-compliance",
  "infrastructure/resilience",
  "infrastructure/database-migrations"
],
  lastUpdated: "2026-06-09",
});
