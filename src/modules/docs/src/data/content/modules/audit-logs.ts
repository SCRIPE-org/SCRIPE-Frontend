// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.auditLogs.intro" },

  // ─── AuditBehavior Architecture ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.auditLogs.architectureTitle",
    id: "audit-behavior",
  },
  { type: "paragraph", contentKey: "modules.auditLogs.architectureContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/Behaviors/AuditBehavior.cs",
    code: `// Pipeline position 6 — runs for commands only (not queries)
public class AuditBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICommand
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        // Serialize BEFORE calling handler (payload is the request state)
        var payload = JsonSerializer.Serialize(request);

        var auditLog = new AuditLog
        {
            CommandName = typeof(TRequest).Name,
            Payload = payload,
            UserId = _currentUser.Id,
            TenantId = _currentUser.TenantId,
            IpAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = _httpContextAccessor.HttpContext?.Request.Headers.UserAgent,
        };

        await _auditLogRepository.AddAsync(auditLog, ct);
        // Saved in same transaction as the entity mutation
        var response = await next();
        return response;
    }
}`,
  },

  // ─── AuditLog Entity ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.auditLogs.entityTitle",
    id: "auditlog-entity",
  },
  { type: "paragraph", contentKey: "modules.auditLogs.entityContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Domain/Entities/AuditLog.cs",
    code: `// Inherits BaseEntity only — NOT AuditableEntity (prevents recursive audit loops)
public class AuditLog : BaseEntity
{
    public string CommandName { get; set; } = string.Empty;  // e.g. "CreateAdminCommand"
    public string Payload { get; set; } = string.Empty;      // Serialized command JSON
    public Guid? UserId { get; set; }                        // Null for system operations
    public Guid? TenantId { get; set; }                      // Null for super-admin ops
    public Guid? EntityId { get; set; }                      // Entity affected (if applicable)
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}`,
  },

  // ─── EF Entity Configuration ──────────────────────────────
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Infrastructure/Persistence/EntityConfigurations/AuditLogConfiguration.cs",
    code: `public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CommandName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Payload).HasColumnType("nvarchar(max)");  // SQL Server
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.Property(x => x.UserAgent).HasMaxLength(512);

        // Composite index for the most common query pattern
        builder.HasIndex(x => new { x.TenantId, x.CreatedAt });
        // Partial index for EntityId lookups
        builder.HasIndex(x => x.EntityId);
    }
}`,
  },

  // ─── Searching Audit Logs ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.auditLogs.searchTitle",
    id: "searching",
  },
  { type: "paragraph", contentKey: "modules.auditLogs.searchContent" },
  {
    type: "table",
    headers: ["Filter Parameter", "Type", "Description"],
    rows: [
      ["entityId", "string (encrypted)", "Filter by entity affected"],
      ["commandName", "string", "Filter by CQRS command class name"],
      ["userId", "string (encrypted)", "Filter by acting user"],
      ["tenantId", "string (encrypted)", "Filter by tenant (super-admin only)"],
      ["from", "ISO 8601 date", "CreatedAt >= from"],
      ["to", "ISO 8601 date", "CreatedAt <= to"],
      ["page", "int (default: 1)", "Pagination page number"],
      ["pageSize", "int (max: 100)", "Results per page"],
    ],
  },

  // ─── Retention Policy ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.auditLogs.retentionTitle",
    id: "retention",
  },
  { type: "paragraph", contentKey: "modules.auditLogs.retentionContent" },
  {
    type: "info",
    variant: "caution",
    contentKey: "modules.auditLogs.retentionWarning",
  },
];

registerPage({
  slug: "modules/audit-logs",
  titleKey: "modules.auditLogs.title",
  descriptionKey: "modules.auditLogs.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: ["modules/security-monitoring", "modules/ecosystem-recycle-bin", "architecture/cqrs-pipeline"],
  lastUpdated: "2026-06-28",
});
