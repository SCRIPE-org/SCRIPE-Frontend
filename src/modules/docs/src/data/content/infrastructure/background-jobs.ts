import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "infrastructure.backgroundJobs.intro" },

      // ─── Hangfire Architecture ────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.backgroundJobs.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "Background Job Processing Pipeline",
            direction: "vertical",
            nodes: [
                  { id: "trigger", label: "Job Trigger", type: "primary", description: "Recurring, Enqueued, Scheduled, or Continuation" },
                  { id: "hangfire", label: "Hangfire Server", type: "info", description: "Worker threads process jobs" },
                  { id: "storage", label: "Job Storage", type: "warning", description: "SQL Server / Memory" },
                  { id: "dashboard", label: "Hangfire Dashboard", type: "success", description: "/hangfire (admin-only)" },
                  { id: "retry", label: "Retry Policy", type: "danger", description: "Auto-retry on failure" },
            ],
            connections: [
                  { from: "trigger", to: "hangfire" },
                  { from: "hangfire", to: "storage", label: "persists state" },
                  { from: "storage", to: "dashboard", label: "visualizes" },
                  { from: "hangfire", to: "retry", label: "on failure" },
            ],
      },

      // ─── Recurring Jobs ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.backgroundJobs.recurringTitle", id: "recurring-jobs",
      },
      {
            type: "table",
            headers: ["Job", "Schedule", "Description"],
            rows: [
                  ["SoftDeleteCleanupJob", "Daily at 2:00 AM", "Permanently deletes soft-deleted entities older than retention period"],
                  ["OutboxProcessorJob", "Every 30 seconds", "Processes pending domain events from Outbox table"],
                  ["OutboxCleanupJob", "Daily at 3:00 AM", "Removes processed outbox messages older than 7 days"],
                  ["TokenCleanupJob", "Every 6 hours", "Removes expired refresh tokens and 2FA session tokens"],
                  ["AuditLogArchiveJob", "Weekly on Sunday", "Archives old audit logs to compressed storage"],
                  ["TenantQuotaCheckJob", "Every hour", "Checks tenant storage/user quotas and sends warnings"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "Recurring Job Registration — Program.cs",
            code: `// In BackgroundJobsConfiguration.RegisterRecurringJobs()
RecurringJob.AddOrUpdate<ISoftDeleteCleanupJob>(
    "identity-soft-delete-cleanup",
    x => x.ExecuteAsync(CancellationToken.None),
    Cron.Daily(2, 0),             // 2:00 AM
    new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc }
);

RecurringJob.AddOrUpdate<IOutboxProcessor>(
    "outbox-processor",
    x => x.ProcessAsync(CancellationToken.None),
    "*/30 * * * * *",              // Every 30 seconds
    new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc }
);

RecurringJob.AddOrUpdate<IOutboxCleanupJob>(
    "outbox-cleanup",
    x => x.ExecuteAsync(CancellationToken.None),
    Cron.Daily(3, 0)               // 3:00 AM
);`,
      },

      // ─── Soft Delete Cleanup ──────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.backgroundJobs.softDeleteTitle", id: "soft-delete-cleanup",
      },
      { type: "paragraph", contentKey: "infrastructure.backgroundJobs.softDeleteIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "SoftDeleteCleanupJob — Deletion Order",
            code: `/// <summary>
/// Permanently deletes soft-deleted entities older than retention period.
/// CRITICAL: Must delete in correct order to respect foreign key constraints.
/// The tenant hierarchy (ParentTenantId → self-referencing FK) requires
/// children to be deleted before parents.
/// </summary>
public class SoftDeleteCleanupJob : ISoftDeleteCleanupJob
{
    // Deletion order: child entities first, then parents
    private static readonly Type[] DeletionOrder = new[]
    {
        typeof(AuditLog),          // No FK dependencies
        typeof(RolePermission),     // FK → Role, Permission
        typeof(AdminRole),          // FK → Admin, Role
        typeof(Admin),              // FK → Tenant
        typeof(User),               // FK → Tenant
        typeof(Role),               // FK → Tenant
        typeof(Permission),         // Can be independent
        typeof(Tenant),             // Self-referencing FK (children first!)
    };

    public async Task ExecuteAsync(CancellationToken ct)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-_retentionDays);

        foreach (var entityType in DeletionOrder)
        {
            // For Tenant: delete children before parents (deepest level first)
            if (entityType == typeof(Tenant))
            {
                await DeleteTenantsHierarchically(cutoffDate, ct);
                continue;
            }

            await _context.Set(entityType)
                .Where(e => e.IsDeleted && e.DeletedAt < cutoffDate)
                .ExecuteDeleteAsync(ct);
        }
    }
}`,
            highlightLines: [10, 11, 19, 32, 33],
      },

      // ─── Dashboard ────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.backgroundJobs.dashboardTitle", id: "dashboard",
      },
      { type: "paragraph", contentKey: "infrastructure.backgroundJobs.dashboardIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Dashboard Authorization Filter",
            code: `// Only authenticated admins can access /hangfire dashboard
public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        var user = httpContext.User;

        return user.Identity?.IsAuthenticated == true
            && user.IsInRole("SuperAdmin");
    }
}

// Registration:
app.MapHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireDashboardAuthorizationFilter() },
    IsReadOnlyFunc = _ => false,
    DashboardTitle = "NEXORA Background Jobs",
});`,
      },

      // ─── Configuration ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.backgroundJobs.configTitle", id: "configuration",
      },
      {
            type: "code",
            language: "json",
            filename: "appsettings.json — Hangfire Configuration",
            code: `{
  "Hangfire": {
    "WorkerCount": 5,
    "ServerName": "nexora-identity",
    "Storage": "SqlServer",
    "Queues": ["critical", "default", "low"],
    "HeartbeatInterval": "00:00:30",
    "JobExpirationTimeout": "7.00:00:00"
  },
  "SoftDeleteCleanup": {
    "RetentionDays": 30,
    "BatchSize": 100
  },
  "OutboxProcessor": {
    "BatchSize": 50,
    "MaxRetries": 3,
    "RetryDelaySeconds": 60
  }
}`,
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
      relatedSlugs: ["architecture/domain-events", "security/audit-compliance", "infrastructure/resilience"],
      lastUpdated: "2026-02-20",
});
