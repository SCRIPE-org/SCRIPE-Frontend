import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.intro" },

  // ─── Architecture Overview ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.architectureIntro" },
  {
    type: "flowchart",
    titleKey: "infrastructure.backgroundJobs.architectureFlowTitle",
    direction: "vertical",
    nodes: [
      {
        id: "config",
        labelKey: "infrastructure.backgroundJobs.nodeConfig",
        type: "primary",
        descriptionKey: "infrastructure.backgroundJobs.descConfig",
      },
      {
        id: "startup",
        labelKey: "infrastructure.backgroundJobs.nodeStartup",
        type: "info",
        descriptionKey: "infrastructure.backgroundJobs.descStartup",
      },
      {
        id: "discovery",
        labelKey: "infrastructure.backgroundJobs.nodeDiscovery",
        type: "warning",
        descriptionKey: "infrastructure.backgroundJobs.descDiscovery",
      },
      {
        id: "schedule",
        labelKey: "infrastructure.backgroundJobs.nodeSchedule",
        type: "success",
        descriptionKey: "infrastructure.backgroundJobs.descSchedule",
      },
      {
        id: "execute",
        labelKey: "infrastructure.backgroundJobs.nodeExecute",
        type: "default",
        descriptionKey: "infrastructure.backgroundJobs.descExecute",
      },
    ],
    connections: [
      { from: "config", to: "startup", labelKey: "infrastructure.backgroundJobs.conn1" },
      { from: "startup", to: "discovery", labelKey: "infrastructure.backgroundJobs.conn2" },
      { from: "discovery", to: "schedule", labelKey: "infrastructure.backgroundJobs.conn3" },
      { from: "schedule", to: "execute", labelKey: "infrastructure.backgroundJobs.conn4" },
    ],
  },

  // ─── IAutoRegisteredJob Contract ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.contractTitle",
    id: "contract",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.contractIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "IAutoRegisteredJob.cs — The Only Interface You Need",
    highlightLines: [5, 6, 14, 20, 25],
    code: `public interface IAutoRegisteredJob
{
    // Unique job identifier — kebab-case: "{module}-{purpose}"
    // Examples: "identity-soft-delete-cleanup", "compliance-dsr-execution"
    string JobId { get; }

    // Standard 5-field CRON expression
    // Can be overridden per-job in appsettings.json at runtime
    string CronExpression { get; }

    // Default true — can be disabled in appsettings.json
    bool Enabled => true;

    // MUST be idempotent — safe to call multiple times
    // Provider calls this on every cron tick
    Task ExecuteAsync(CancellationToken ct = default);
}`,
  },

  // ─── DI Registration ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.diTitle",
    id: "di-registration",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.diIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "DependencyInjection.cs — Critical Two-Line Pattern",
    highlightLines: [2, 5],
    code: `// Line 1: Concrete type (enables constructor injection)
services.AddScoped<MyJob>();

// Line 2: Factory delegate (enables auto-discovery) — NEVER SKIP THIS
services.AddScoped<IAutoRegisteredJob>(sp =>
    sp.GetRequiredService<MyJob>());

// WHY TWO LINES?
// GetServices<IAutoRegisteredJob>() scans for everything registered AS IAutoRegisteredJob.
// Without line 2, the scan returns nothing for MyJob — it is invisible to all providers.`,
  },
  {
    type: "info",
    variant: "danger",
    titleKey: "infrastructure.backgroundJobs.diWarningTitle",
    contentKey: "infrastructure.backgroundJobs.diWarning",
  },

  // ─── Class Hierarchy ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.hierarchyTitle",
    id: "class-hierarchy",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.hierarchyIntro" },
  {
    type: "table",
    headers: [
      "infrastructure.backgroundJobs.hierarchyColClass",
      "infrastructure.backgroundJobs.hierarchyColUseWhen",
      "infrastructure.backgroundJobs.hierarchyColGets",
    ],
    rows: [
      [
        "IAutoRegisteredJob (interface)",
        "infrastructure.backgroundJobs.hierarchyRow1When",
        "infrastructure.backgroundJobs.hierarchyRow1Gets",
      ],
      [
        "RecurringJobBase (abstract)",
        "infrastructure.backgroundJobs.hierarchyRow2When",
        "infrastructure.backgroundJobs.hierarchyRow2Gets",
      ],
      [
        "SoftDeleteCleanupJob<TContext> (abstract)",
        "infrastructure.backgroundJobs.hierarchyRow3When",
        "infrastructure.backgroundJobs.hierarchyRow3Gets",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "RecurringJobBase.cs — Timing + Structured Logging",
    code: `public abstract class RecurringJobBase : IAutoRegisteredJob
{
    protected ILogger Logger { get; }

    public abstract string JobId { get; }
    public abstract string CronExpression { get; }

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        Logger.LogInformation("[{JobId}] Starting", JobId);
        try
        {
            await ExecuteJobAsync(ct);
            Logger.LogInformation("[{JobId}] Completed in {Elapsed}ms", JobId, sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "[{JobId}] Failed after {Elapsed}ms", JobId, sw.ElapsedMilliseconds);
            throw; // Let the provider handle retry
        }
    }

    protected abstract Task ExecuteJobAsync(CancellationToken ct);
}`,
  },

  // ─── Provider Comparison ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.providersTitle",
    id: "providers",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.providersIntro" },
  {
    type: "table",
    headers: [
      "infrastructure.backgroundJobs.providerColFeature",
      "infrastructure.backgroundJobs.providerColNative",
      "infrastructure.backgroundJobs.providerColHangfire",
      "infrastructure.backgroundJobs.providerColQuartz",
    ],
    rows: [
      [
        "infrastructure.backgroundJobs.providerRowPersistence",
        "infrastructure.backgroundJobs.providerNativeNo",
        "infrastructure.backgroundJobs.providerHangfireYes",
        "infrastructure.backgroundJobs.providerQuartzOptional",
      ],
      [
        "infrastructure.backgroundJobs.providerRowDashboard",
        "infrastructure.backgroundJobs.providerNativeDash",
        "infrastructure.backgroundJobs.providerHangfireDash",
        "infrastructure.backgroundJobs.providerQuartzDash",
      ],
      [
        "infrastructure.backgroundJobs.providerRowRetry",
        "infrastructure.backgroundJobs.providerNativeRetry",
        "infrastructure.backgroundJobs.providerHangfireRetry",
        "infrastructure.backgroundJobs.providerQuartzRetry",
      ],
      [
        "infrastructure.backgroundJobs.providerRowBestFor",
        "infrastructure.backgroundJobs.providerNativeBest",
        "infrastructure.backgroundJobs.providerHangfireBest",
        "infrastructure.backgroundJobs.providerQuartzBest",
      ],
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json — Switching Providers (no code change needed)",
    code: `{
  "BackgroundJobs": {
    "Provider": "Hangfire",          // "Native" | "Hangfire" | "Quartz"
    "PollingIntervalSeconds": 60,    // Native only
    "Jobs": {
      "identity-soft-delete-cleanup": {
        "Enabled": true,
        "CronExpression": "0 3 * * *"  // Override default cron
      },
      "analytics-report": {
        "Enabled": false               // Disable a job in this environment
      },
      "compliance-dsr-execution": {
        "CronExpression": "*/2 * * * *"  // Override cron only
      }
    }
  }
}`,
  },

  // ─── Full Jobs Inventory ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.inventoryTitle",
    id: "jobs-inventory",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.inventoryIntro" },

  // Core Module
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.backgroundJobs.inventoryCoreTitle",
    id: "jobs-core",
  },
  {
    type: "table",
    headers: [
      "Job Class",
      "JobId",
      "Default Cron",
      "infrastructure.backgroundJobs.inventoryColPurpose",
    ],
    rows: [
      [
        "OutboxCleanupJob",
        "core-outbox-cleanup",
        "0 5 * * *",
        "infrastructure.backgroundJobs.jobOutboxCleanup",
      ],
      [
        "EmailProcessingJob",
        "core-email-processing",
        "* * * * *",
        "infrastructure.backgroundJobs.jobEmailProcessing",
      ],
      [
        "WebhookRetryJob",
        "webhook-retry",
        "* * * * *",
        "infrastructure.backgroundJobs.jobWebhookRetry",
      ],
      [
        "WebhookLogCleanupJob",
        "webhook-log-cleanup",
        "0 4 * * *",
        "infrastructure.backgroundJobs.jobWebhookLogCleanup",
      ],
    ],
  },

  // Identity Module
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.backgroundJobs.inventoryIdentityTitle",
    id: "jobs-identity",
  },
  {
    type: "table",
    headers: [
      "Job Class",
      "JobId",
      "Default Cron",
      "infrastructure.backgroundJobs.inventoryColPurpose",
    ],
    rows: [
      [
        "IdentitySoftDeleteCleanupJob",
        "identity-soft-delete-cleanup",
        "0 3 * * *",
        "infrastructure.backgroundJobs.jobIdentitySoftDelete",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "infrastructure.backgroundJobs.identityNote",
  },

  // Entitlements Module
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.backgroundJobs.inventoryEntitlementsTitle",
    id: "jobs-entitlements",
  },
  {
    type: "table",
    headers: [
      "Job Class",
      "JobId",
      "Default Cron",
      "infrastructure.backgroundJobs.inventoryColPurpose",
    ],
    rows: [
      [
        "EntitlementsSoftDeleteCleanupJob",
        "entitlements-soft-delete-cleanup",
        "0 3 * * *",
        "infrastructure.backgroundJobs.jobEntitlementsSoftDelete",
      ],
      [
        "SubscriptionReconciliationJob",
        "subscription-reconciliation",
        "0 2 * * *",
        "infrastructure.backgroundJobs.jobSubscriptionReconciliation",
      ],
      [
        "TrialNotificationJob",
        "trial-notification",
        "0 9 * * *",
        "infrastructure.backgroundJobs.jobTrialNotification",
      ],
      [
        "DunningNotificationJob",
        "dunning-notification",
        "0 10 * * *",
        "infrastructure.backgroundJobs.jobDunningNotification",
      ],
      [
        "EditionRolloutJob",
        "edition-rollout",
        "0 1 * * *",
        "infrastructure.backgroundJobs.jobEditionRollout",
      ],
      [
        "UserSubscriptionReconciliationJob",
        "user-subscription-reconciliation",
        "0 3 * * *",
        "infrastructure.backgroundJobs.jobUserSubscriptionReconciliation",
      ],
      [
        "AnalyticsSnapshotJob",
        "analytics-snapshot",
        "0 0 * * *",
        "infrastructure.backgroundJobs.jobAnalyticsSnapshot",
      ],
      [
        "TenantHealthScoreJob",
        "tenant-health-score",
        "0 6 * * *",
        "infrastructure.backgroundJobs.jobTenantHealthScore",
      ],
      [
        "AnalyticsReportJob",
        "analytics-report",
        "0 7 * * 1",
        "infrastructure.backgroundJobs.jobAnalyticsReport",
      ],
      [
        "CommissionInvoicingJob",
        "commission-invoicing",
        "0 2 1 * *",
        "infrastructure.backgroundJobs.jobCommissionInvoicing",
      ],
      [
        "CommissionAutoChargeJob",
        "commission-auto-charge",
        "0 6 * * *",
        "infrastructure.backgroundJobs.jobCommissionAutoCharge",
      ],
      [
        "PaymobRecurringBillingJob",
        "paymob-recurring-billing",
        "0 4 * * *",
        "infrastructure.backgroundJobs.jobPaymobRecurringBilling",
      ],
    ],
  },

  // Compliance Module
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.backgroundJobs.inventoryComplianceTitle",
    id: "jobs-compliance",
  },
  {
    type: "table",
    headers: [
      "Job Class",
      "JobId",
      "Default Cron",
      "infrastructure.backgroundJobs.inventoryColPurpose",
    ],
    rows: [
      [
        "ComplianceSoftDeleteCleanupJob",
        "compliance-soft-delete-cleanup",
        "0 3 * * *",
        "infrastructure.backgroundJobs.jobComplianceSoftDelete",
      ],
      [
        "DsrExecutionJob",
        "compliance-dsr-execution",
        "*/5 * * * *",
        "infrastructure.backgroundJobs.jobDsrExecution",
      ],
      [
        "DsrEscalationJob",
        "compliance-dsr-escalation",
        "0 8 * * *",
        "infrastructure.backgroundJobs.jobDsrEscalation",
      ],
      [
        "DsrExportCleanupJob",
        "compliance-dsr-export-cleanup",
        "0 4 * * *",
        "infrastructure.backgroundJobs.jobDsrExportCleanup",
      ],
      [
        "RetentionEnforcementJob",
        "compliance-retention-enforcement",
        "0 1 * * 0",
        "infrastructure.backgroundJobs.jobRetentionEnforcement",
      ],
      [
        "ConsentExpiryJob",
        "compliance-consent-expiry",
        "0 0 * * *",
        "infrastructure.backgroundJobs.jobConsentExpiry",
      ],
      [
        "ReportGenerationJob",
        "compliance-report-generation",
        "*/2 * * * *",
        "infrastructure.backgroundJobs.jobReportGeneration",
      ],
    ],
  },

  // ─── Creating a New Job ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.newJobTitle",
    id: "create-job",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.newJobIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "infrastructure.backgroundJobs.newJobStep1Title",
        contentKey: "infrastructure.backgroundJobs.newJobStep1Desc",
        code: `// {Module}.Infrastructure/BackgroundJobs/ProductExpiryJob.cs
public class ProductExpiryJob : IAutoRegisteredJob
{
    private readonly IProductRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<ProductExpiryJob> _logger;

    public ProductExpiryJob(
        IProductRepository repo,
        IUnitOfWork uow,
        ILogger<ProductExpiryJob> logger)
    {
        _repo = repo;
        _uow = uow;
        _logger = logger;
    }

    // Convention: "{module}-{purpose}" in kebab-case
    public string JobId => "products-expiry-check";
    public string CronExpression => "0 6 * * *"; // Daily at 6 AM

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var expired = await _repo.GetExpiredProductsAsync(ct);
        foreach (var product in expired)
            product.MarkExpired();
        await _uow.SaveChangesAsync(ct);
        _logger.LogInformation("[{JobId}] Marked {Count} expired", JobId, expired.Count);
    }
}`,
        codeLanguage: "csharp",
        codeFilename: "ProductExpiryJob.cs",
      },
      {
        titleKey: "infrastructure.backgroundJobs.newJobStep2Title",
        contentKey: "infrastructure.backgroundJobs.newJobStep2Desc",
        code: `// Products.Infrastructure/DependencyInjection.cs
// BOTH lines are mandatory — never skip line 2
services.AddScoped<ProductExpiryJob>();
services.AddScoped<IAutoRegisteredJob>(sp =>
    sp.GetRequiredService<ProductExpiryJob>());`,
        codeLanguage: "csharp",
        codeFilename: "DependencyInjection.cs",
      },
      {
        titleKey: "infrastructure.backgroundJobs.newJobStep3Title",
        contentKey: "infrastructure.backgroundJobs.newJobStep3Desc",
        code: `{
  "BackgroundJobs": {
    "Jobs": {
      "products-expiry-check": {
        "Enabled": true,
        "CronExpression": "0 6 * * *"
      }
    }
  }
}`,
        codeLanguage: "json",
        codeFilename: "appsettings.json (optional override)",
      },
      {
        titleKey: "infrastructure.backgroundJobs.newJobStep4Title",
        contentKey: "infrastructure.backgroundJobs.newJobStep4Desc",
        code: `scripe build backend
# Must output: Build succeeded. 0 Error(s)
# Auto-discovery handles the rest — no other wiring needed`,
        codeLanguage: "bash",
        codeFilename: "Terminal",
      },
    ],
  },

  // ─── Soft Delete Job (CLI) ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.softDeleteTitle",
    id: "soft-delete",
  },
  { type: "paragraph", contentKey: "infrastructure.backgroundJobs.softDeleteIntro" },
  {
    type: "flowchart",
    titleKey: "infrastructure.backgroundJobs.softDeleteFlowTitle",
    direction: "vertical",
    nodes: [
      {
        id: "cron",
        labelKey: "infrastructure.backgroundJobs.flowCronLabel",
        descriptionKey: "infrastructure.backgroundJobs.flowCronDesc",
        icon: "Clock",
      },
      {
        id: "init",
        labelKey: "infrastructure.backgroundJobs.flowInitLabel",
        descriptionKey: "infrastructure.backgroundJobs.flowInitDesc",
        icon: "Play",
      },
      {
        id: "scan",
        labelKey: "infrastructure.backgroundJobs.flowScanLabel",
        descriptionKey: "infrastructure.backgroundJobs.flowScanDesc",
        icon: "Search",
      },
      {
        id: "filter",
        labelKey: "infrastructure.backgroundJobs.flowFilterLabel",
        descriptionKey: "infrastructure.backgroundJobs.flowFilterDesc",
        icon: "Filter",
      },
      {
        id: "cascade",
        labelKey: "infrastructure.backgroundJobs.flowCascadeLabel",
        descriptionKey: "infrastructure.backgroundJobs.flowCascadeDesc",
        icon: "Layers",
      },
      {
        id: "execute",
        labelKey: "infrastructure.backgroundJobs.flowExecuteLabel",
        descriptionKey: "infrastructure.backgroundJobs.flowExecuteDesc",
        icon: "Trash2",
      },
    ],
    connections: [
      { from: "cron", to: "init", labelKey: "infrastructure.backgroundJobs.connTriggers" },
      { from: "init", to: "scan", labelKey: "infrastructure.backgroundJobs.connStarts" },
      { from: "scan", to: "filter", labelKey: "infrastructure.backgroundJobs.connBuilds" },
      { from: "filter", to: "cascade", labelKey: "infrastructure.backgroundJobs.connOrders" },
      { from: "cascade", to: "execute", labelKey: "infrastructure.backgroundJobs.connRemoves" },
    ],
  },
  {
    type: "code",
    language: "bash",
    filename: "CLI — One Command to Add SoftDeleteCleanupJob",
    code: `# Add soft-delete cleanup job to a module
scripe add-bg-service Products

# This generates:
# 1. Products.Infrastructure/BackgroundJobs/ProductsSoftDeleteCleanupJob.cs
# 2. Registers BOTH DI lines in Products.Infrastructure/DependencyInjection.cs`,
  },
  {
    type: "code",
    language: "csharp",
    filename: "ProductsSoftDeleteCleanupJob.cs — Auto-Generated",
    highlightLines: [3, 4],
    code: `// Minimum implementation — inherits FK-aware deletion logic
// Auto-discovers all ISoftDeletable entities in ProductsDbContext
public class ProductsSoftDeleteCleanupJob
    : SoftDeleteCleanupJob<ProductsDbContext>
{
    public ProductsSoftDeleteCleanupJob(
        ProductsDbContext context,
        IOptions<SoftDeleteCleanupOptions> options,
        ILogger<ProductsSoftDeleteCleanupJob> logger)
        : base(context, options, logger) { }

    public override string JobId => "products-soft-delete-cleanup";
    // CronExpression defaults to "0 3 * * *" from base class
}`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "infrastructure.backgroundJobs.softDeleteTip",
  },

  // ─── Rules ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.backgroundJobs.rulesTitle",
    id: "rules",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "infrastructure.backgroundJobs.rulesMustTitle",
        variant: "positive",
        items: [
          "infrastructure.backgroundJobs.ruleMust1",
          "infrastructure.backgroundJobs.ruleMust2",
          "infrastructure.backgroundJobs.ruleMust3",
          "infrastructure.backgroundJobs.ruleMust4",
          "infrastructure.backgroundJobs.ruleMust5",
        ],
      },
      {
        titleKey: "infrastructure.backgroundJobs.rulesNeverTitle",
        variant: "negative",
        items: [
          "infrastructure.backgroundJobs.ruleNever1",
          "infrastructure.backgroundJobs.ruleNever2",
          "infrastructure.backgroundJobs.ruleNever3",
          "infrastructure.backgroundJobs.ruleNever4",
          "infrastructure.backgroundJobs.ruleNever5",
        ],
      },
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "infrastructure.backgroundJobs.tenantWarning",
  },
];

registerPage({
  slug: "infrastructure/background-jobs",
  titleKey: "infrastructure.backgroundJobs.title",
  descriptionKey: "infrastructure.backgroundJobs.description",
  category: "infrastructure",
  order: 2,
  sections,
  relatedSlugs: [
    "architecture/domain-events",
    "security/audit-compliance",
    "infrastructure/resilience",
    "infrastructure/database-migrations",
  ],
  lastUpdated: "2026-05-03",
});
