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
        id: "logging",
        label: "RequestLoggingMiddleware",
        type: "info",
        description: "Logs method, path, duration, user",
      },
      {
        id: "interceptor",
        label: "AuditableEntityInterceptor",
        type: "warning",
        description: "Captures entity changes (before/after)",
      },
      {
        id: "behavior",
        label: "AuditBehavior (AstraFlow mediator)",
        type: "success",
        description: "Business-level audit events",
      },
      { id: "service", label: "IAuditService", type: "primary" },
      { id: "db", label: "AuditLog Table", type: "info" },
      {
        id: "hub",
        label: "AuditHub (SignalR)",
        type: "success",
        description: "Real-time streaming to dashboard",
      },
    ],
    connections: [
      { from: "req", to: "logging" },
      { from: "logging", to: "service" },
      { from: "interceptor", to: "service" },
      { from: "behavior", to: "service" },
      { from: "service", to: "db", label: "persist" },
      { from: "service", to: "hub", label: "broadcast" },
    ],
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
public class AuditLog : Entity<Guid>
{
    public string UserId { get; set; }        // Who performed the action
    public string? UserName { get; set; }      // Display name
    public string Action { get; set; }         // CRUD operation type
    public string EntityName { get; set; }     // Entity type (Admin, User, etc.)
    public string? EntityId { get; set; }      // ID of affected entity
    public string? OldValues { get; set; }     // JSON: values before change
    public string? NewValues { get; set; }     // JSON: values after change
    public string? AffectedColumns { get; set; } // JSON: list of changed columns
    public string? IpAddress { get; set; }     // Client IP
    public string? UserAgent { get; set; }     // Browser/client info
    public DateTime Timestamp { get; set; }    // UTC timestamp
    public Guid? TenantId { get; set; }        // Tenant scope
    public string? CorrelationId { get; set; } // Request correlation ID
    public int? StatusCode { get; set; }       // HTTP status code
    public long? Duration { get; set; }        // Request duration (ms)
    public string? RequestPath { get; set; }   // API endpoint path
    public string? RequestMethod { get; set; } // HTTP method
}`,
  },
  {
    type: "table",
    headers: ["Field", "Type", "Indexed", "Purpose"],
    rows: [
      ["UserId", "string", "✅", "Quick lookup by user"],
      ["Action", "string", "✅", "Filter by CRUD type"],
      ["EntityName", "string", "✅", "Filter by entity type"],
      ["Timestamp", "DateTime", "✅", "Date range queries"],
      ["TenantId", "Guid?", "✅", "Tenant isolation"],
      ["CorrelationId", "string?", "✅", "Distributed tracing"],
      ["OldValues", "string? (JSON)", "—", "Change tracking"],
      ["NewValues", "string? (JSON)", "—", "Change tracking"],
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
/// For each Modified or Deleted entity, records old/new values.
/// </summary>
public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct)
    {
        var context = eventData.Context!;
        var auditEntries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Unchanged) continue;

            var auditEntry = new AuditEntry
            {
                EntityName = entry.Entity.GetType().Name,
                EntityId = entry.Property("Id").CurrentValue?.ToString(),
                Action = entry.State.ToString(), // Added, Modified, Deleted
                UserId = _currentUser.GetUserId(),
                Timestamp = DateTime.UtcNow,
            };

            foreach (var property in entry.Properties)
            {
                if (entry.State == EntityState.Added)
                {
                    auditEntry.NewValues[property.Metadata.Name]
                        = property.CurrentValue;
                }
                else if (entry.State == EntityState.Modified && property.IsModified)
                {
                    auditEntry.OldValues[property.Metadata.Name]
                        = property.OriginalValue;
                    auditEntry.NewValues[property.Metadata.Name]
                        = property.CurrentValue;
                    auditEntry.AffectedColumns.Add(property.Metadata.Name);
                }
                else if (entry.State == EntityState.Deleted)
                {
                    auditEntry.OldValues[property.Metadata.Name]
                        = property.OriginalValue;
                }
            }

            auditEntries.Add(auditEntry);
        }

        // Save audit entries via IAuditService
        _auditService.EnqueueAsync(auditEntries);

        return base.SavingChangesAsync(eventData, result, ct);
    }
}`,
    highlightLines: [13, 17, 18, 19, 20, 33, 34, 35, 36, 37, 38],
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
  { type: "paragraph", contentKey: "security.auditCompliance.exportIntro" },
  {
    type: "table",
    headers: ["Export Format", "Service", "Features"],
    rows: [
      ["CSV", "CsvExportService", "Lightweight, spreadsheet-compatible, UTF-8 BOM for Excel"],
      [
        "Excel (.xlsx)",
        "ExcelExportService",
        "Formatted headers, auto-width columns, color-coded rows",
      ],
      ["PDF", "PdfExportService", "Branded header, summary stats, pagination, A4 landscape"],
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
