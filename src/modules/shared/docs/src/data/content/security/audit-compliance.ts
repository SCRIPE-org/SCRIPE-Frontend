// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "security.auditCompliance.intro" },

  // ─── Audit Architecture ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.architectureTitle",
    id: "audit-architecture",
  },
  { type: "paragraph", contentKey: "security.auditCompliance.architectureIntro" },
  {
    type: "flowchart",
    title: "Audit Log Pipeline",
    direction: "horizontal",
    nodes: [
      { id: "req", label: "HTTP Request", type: "primary" },
      {
        id: "middleware",
        label: "RequestLoggingMiddleware",
        type: "info",
        description: "Synchronously captures context, awaits next, Task.Run background write",
      },
      {
        id: "mediator",
        label: "AstraFlow Mediator Behaviors",
        type: "default",
        description: "LoggingBehavior & StreamLoggingBehavior console tracing",
      },
      {
        id: "handler",
        label: "Command / Query Handler",
        type: "primary",
        description: "Processes request, triggers unit of work save changes",
      },
      {
        id: "interceptor",
        label: "AuditableEntityInterceptor",
        type: "warning",
        description: "ChangeTracker inspection for CRUD & Soft Delete before saving",
      },
      {
        id: "service",
        label: "AuditService",
        type: "primary",
        description: "Orchestrates database writes & hub broadcasting",
      },
      {
        id: "db",
        label: "IdentityDbContext (AuditLogs Table)",
        type: "success",
        description: "Multi-provider indexed persistent store",
      },
      {
        id: "hub",
        label: "SignalR AuditHub",
        type: "info",
        description: "Broadcasts events to tenant-scoped groups",
      },
    ],
    connections: [
      { from: "req", to: "middleware" },
      { from: "middleware", to: "mediator", label: "Pipeline" },
      { from: "middleware", to: "service", label: "Task.Run", style: "dashed" },
      { from: "mediator", to: "handler" },
      { from: "handler", to: "interceptor", label: "SaveChanges" },
      { from: "interceptor", to: "service", label: "LogEntityChange", style: "dashed" },
      { from: "service", to: "db", label: "persist" },
      { from: "service", to: "hub", label: "broadcast" },
    ],
  },

  // ─── Scoping & Tenant Isolation ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.scopingTitle",
    id: "tenant-scoping",
  },
  {
    type: "flowchart",
    title: "Hierarchical Scope Check Logs Traversal",
    direction: "horizontal",
    nodes: [
      {
        id: "request",
        label: "Fetch Log Request",
        type: "primary",
        description: "Admin requests audit log lists or detail by ID",
      },
      {
        id: "datascope",
        label: "DataScopeService Resolution",
        type: "info",
        description: "Resolves effective scope: SuperAdmin, Drill-down, Hierarchy, or OwnTenant",
      },
      {
        id: "hierarchy",
        label: "TenantHierarchyService",
        type: "warning",
        description: "Looks up materialized HierarchyPath (/parent/child/) & caches result",
      },
      {
        id: "db_desc",
        label: "Descendants Lookup (SQL LIKE)",
        type: "default",
        description: "Query: HierarchyPath.StartsWith(parentPath) on indexed path",
      },
      {
        id: "verify",
        label: "Security Verification Gate",
        type: "danger",
        description: "Checks if requested AuditLog.TenantId matches accessible tenant list",
      },
      {
        id: "spec",
        label: "AuditByTenantScopeSpec",
        type: "success",
        description: "Applies 'WHERE TenantId IN (...)' filter to EF Core query",
      },
      {
        id: "result",
        label: "Secure Data Returned",
        type: "success",
        description: "Returns isolated audit log data",
      },
    ],
    connections: [
      { from: "request", to: "datascope" },
      { from: "datascope", to: "hierarchy", label: "If Hierarchy/Drilldown" },
      { from: "datascope", to: "verify", label: "Direct ID fetch" },
      { from: "hierarchy", to: "db_desc", label: "Cache miss" },
      { from: "db_desc", to: "verify" },
      { from: "verify", to: "spec", label: "Approved" },
      { from: "spec", to: "result" },
    ],
  },
  {
    type: "paragraph",
    contentKey: "security.auditCompliance.scopingDetail",
  },

  // ─── AuditLog Entity ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.auditLogEntityTitle",
    id: "audit-log-entity",
  },
  {
    type: "code",
    language: "csharp",
    filename: "AuditLog Entity — Database Schema",
    code: `/// <summary>
/// Represents a single audit log entry in the database.
/// Captures WHO did WHAT to WHICH entity, WHEN, and from WHERE.
/// </summary>
public class AuditLog : AuditableEntity
{
    public string EventType { get; set; } = string.Empty;
    public string? HttpMethod { get; set; }
    public string? Endpoint { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? ChangedProperties { get; set; }
    public Guid? UserId { get; set; }
    public Guid? TenantId { get; set; }
    public string? Username { get; set; }
    public bool IsAdmin { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? CorrelationId { get; set; }
    public int? StatusCode { get; set; }
    public long? DurationMs { get; set; }
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Metadata { get; set; }
    public string? ModuleTag { get; set; }
}`,
  },
  {
    type: "table",
    headers: ["Field", "Type", "Indexed", "Description & Purpose"],
    rows: [
      ["Id", "Guid", "Primary Key", "Unique identifier for the audit record"],
      [
        "EventType",
        "string",
        "✅ Single / ✅ Composite",
        "Event category (Create, Update, Delete, Login, etc.)",
      ],
      [
        "Timestamp",
        "DateTime",
        "✅ Single / ✅ Composite",
        "Execution timestamp in UTC. Sorts & filters logs",
      ],
      ["UserId", "Guid?", "✅ Single", "User ID of the actor executing the transaction"],
      [
        "CorrelationId",
        "string?",
        "✅ Single",
        "Trace ID correlating HTTP requests to database transactions",
      ],
      [
        "TenantId",
        "Guid?",
        "✅ Single / ✅ Composite",
        "Tenant context enforcing boundary isolation",
      ],
      ["Endpoint", "string?", "✅ Composite", "Request API endpoint path, indexed with Timestamp"],
      ["OldValues", "string? (JSON)", "—", "JSON serialization of properties before mutation"],
      ["NewValues", "string? (JSON)", "—", "JSON serialization of properties after mutation"],
    ],
  },

  // ─── AuditableEntityInterceptor ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.interceptorTitle",
    id: "entity-interceptor",
  },
  { type: "paragraph", contentKey: "security.auditCompliance.interceptorIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "AuditableEntityInterceptor — Change Tracking",
    code: `/// <summary>
/// EF Core interceptor that captures entity changes before SaveChanges.
/// Handles standard CRUD mutations, Soft Deletes, and prevents infinite recursion.
/// </summary>
public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly IAuditService _auditService;

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct)
    {
        var context = eventData.Context;
        if (context == null) return await base.SavingChangesAsync(eventData, result, ct);

        // 1. Intercept Soft Delete BEFORE state is modified by BaseDbContext
        var softDeleteEntries = context.ChangeTracker.Entries<ISoftDeletable>()
            .Where(e => e.State == EntityState.Deleted)
            .ToList();

        foreach (var entry in softDeleteEntries)
        {
            await _auditService.LogEntityChangeAsync(
                AuditEventTypes.Delete,
                entry.Entity.GetType().Name,
                GetEntityId(entry.Entity),
                "Soft Deleted",
                null,
                "IsDeleted",
                ct
            );
        }

        // 2. Intercept Standard CRUD mutations
        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog) // Prevent infinite recursion StackOverflow
                continue;

            if (entry.State == EntityState.Unchanged || entry.State == EntityState.Detached)
                continue;

            string eventType = entry.State switch
            {
                EntityState.Added => AuditEventTypes.Create,
                EntityState.Modified => AuditEventTypes.Update,
                EntityState.Deleted => AuditEventTypes.Delete,
                _ => "Unknown"
            };

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();
            var changedProps = new List<string>();

            foreach (var prop in entry.Properties)
            {
                if (prop.Metadata.IsPrimaryKey()) continue;

                if (entry.State == EntityState.Added)
                {
                    newValues[prop.Metadata.Name] = prop.CurrentValue;
                }
                else if (entry.State == EntityState.Modified && prop.IsModified)
                {
                    var original = entry.OriginalValues[prop.Metadata.Name];
                    var current = prop.CurrentValue;
                    if (!Equals(original, current))
                    {
                        oldValues[prop.Metadata.Name] = original;
                        newValues[prop.Metadata.Name] = current;
                        changedProps.Add(prop.Metadata.Name);
                    }
                }
                else if (entry.State == EntityState.Deleted)
                {
                    oldValues[prop.Metadata.Name] = entry.OriginalValues[prop.Metadata.Name];
                }
            }

            if (entry.State == EntityState.Modified && !changedProps.Any())
                continue; // Skip if no properties changed

            await _auditService.LogEntityChangeAsync(
                eventType,
                entry.Entity.GetType().Name,
                GetEntityId(entry.Entity),
                entry.State.ToString(),
                Serialize(oldValues),
                Serialize(newValues),
                ct
            );
        }

        return await base.SavingChangesAsync(eventData, result, ct);
    }
}`,
    highlightLines: [14, 15, 16, 32, 33, 39, 41, 42],
  },

  // ─── SignalR Streaming ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.signalrTitle",
    id: "signalr-streaming",
  },
  { type: "paragraph", contentKey: "security.auditCompliance.signalrIntro" },
  {
    type: "tabs",
    tabs: [
      {
        label: "AuditHub (Backend)",
        language: "csharp",
        filename: "AuditHub.cs — SignalR Hub",
        code: `/// <summary>
/// SignalR hub for real-time audit log streaming.
/// Clients join tenant-specific groups for scoped updates.
/// </summary>
[Authorize]
public class AuditHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        if (tenantId != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, tenantId);
        }
        await base.OnConnectedAsync();
    }
}

// In IAuditService — broadcast after persisting
public async Task LogAsync(AuditEntry entry)
{
    await _dbContext.AuditLogs.AddAsync(entry.ToAuditLog());
    await _dbContext.SaveChangesAsync();

    // Broadcast to tenant group in real-time
    await _hubContext.Clients
        .Group(entry.TenantId.ToString())
        .SendAsync("AuditLogCreated", entry.ToDto());
}`,
      },
      {
        label: "Frontend Listener",
        language: "typescript",
        filename: "useAuditStream.ts — Frontend Hook",
        code: `// Frontend hook for real-time audit log streaming
/**
 * React hook/ViewModel orchestrating state and data flows for audit stream.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useAuditStream() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const connection = useSignalR(); // From SignalRProvider

  useEffect(() => {
    connection?.on("AuditLogCreated", (log: AuditLogDto) => {
      setLogs(prev => [log, ...prev].slice(0, 100)); // Keep latest 100
    });

    return () => connection?.off("AuditLogCreated");
  }, [connection]);

  return logs;
}`,
      },
    ],
  },

  // ─── Export System ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.exportTitle",
    id: "export",
  },
  { type: "paragraph", contentKey: "security.auditCompliance.exportDetail" },
  {
    type: "table",
    headers: ["Export Format", "Service", "Features"],
    rows: [
      [
        "CSV",
        "CsvExportService",
        "Lightweight, spreadsheet-compatible, RFC 4180 quote enforcement, UTF-8 BOM for Excel",
      ],
      [
        "Excel (.xlsx)",
        "ExcelExportService",
        "ClosedXML workbook with Executive Summary (KPI metrics dashboard), Audit Data (auto-filters, frozen headers, green/red conditional formatting), and Security Analysis sheets",
      ],
      [
        "PDF",
        "PdfExportService",
        "QuestPDF community license, Cover page, executive summary charts, Obsolete for large datasets due to RAM overhead",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "ExportService — Common Interface",
    code: `public interface IExportService
{
    Task<byte[]> ExportAsync<T>(
        IEnumerable<T> data,
        ExportOptions options,
        CancellationToken ct = default);
}

public class ExportOptions
{
    public string Title { get; set; } = "Export";
    public string[] Columns { get; set; } = Array.Empty<string>();
    public string DateFormat { get; set; } = "yyyy-MM-dd HH:mm:ss";
    public bool IncludeHeaders { get; set; } = true;
    public string? WatermarkText { get; set; }     // PDF only
    public string? BrandingLogoPath { get; set; }   // PDF only
}`,
  },

  // ─── Audit Query API ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.queryApiTitle",
    id: "query-api",
  },
  { type: "paragraph", contentKey: "security.auditCompliance.queryApiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/audit",
        descriptionKey: "security.auditCompliance.querySearchDesc",
        auth: "Admin + audit.view",
      },
      {
        method: "GET",
        path: "/api/v1/audit/export?format=csv",
        descriptionKey: "security.auditCompliance.queryExportCsvDesc",
        auth: "Admin + audit.export",
      },
      {
        method: "GET",
        path: "/api/v1/audit/export?format=excel",
        descriptionKey: "security.auditCompliance.queryExportExcelDesc",
        auth: "Admin + audit.export",
      },
      {
        method: "GET",
        path: "/api/v1/audit/export?format=pdf",
        descriptionKey: "security.auditCompliance.queryExportPdfDesc",
        auth: "Admin + audit.export",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "Search Audit Logs — Query Parameters",
    code: `GET /api/v1/audit?
  userId=a1b2c3d4...
  &action=Modified
  &entityName=Admin
  &from=2026-01-01T00:00:00Z
  &to=2026-02-20T23:59:59Z
  &search=password
  &page=1
  &pageSize=25
  &sortBy=timestamp
  &sortDirection=desc`,
  },

  // ─── Compliance Features ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.auditCompliance.complianceTitle",
    id: "compliance",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "📝",
        titleKey: "security.auditCompliance.fullTraceTitle",
        descriptionKey: "security.auditCompliance.fullTraceDesc",
      },
      {
        icon: "🔒",
        titleKey: "security.auditCompliance.immutableTitle",
        descriptionKey: "security.auditCompliance.immutableDesc",
      },
      {
        icon: "🏢",
        titleKey: "security.auditCompliance.tenantScopedTitle",
        descriptionKey: "security.auditCompliance.tenantScopedDesc",
      },
      {
        icon: "📊",
        titleKey: "security.auditCompliance.retentionTitle",
        descriptionKey: "security.auditCompliance.retentionDesc",
      },
      {
        icon: "🔍",
        titleKey: "security.auditCompliance.searchableTitle",
        descriptionKey: "security.auditCompliance.searchableDesc",
      },
      {
        icon: "📡",
        titleKey: "security.auditCompliance.realtimeTitle",
        descriptionKey: "security.auditCompliance.realtimeDesc",
      },
    ],
  },
];

registerPage({
  slug: "security/audit-compliance",
  titleKey: "security.auditCompliance.title",
  descriptionKey: "security.auditCompliance.description",
  category: "security",
  order: 6,
  sections,
  relatedSlugs: ["security/overview", "security/middleware-pipeline", "security/data-protection"],
  lastUpdated: "2026-02-20",
});
