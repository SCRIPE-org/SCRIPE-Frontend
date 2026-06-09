import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "security/audit-compliance",
  titleKey: "security.auditCompliance.title",
  category: "security",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    req([\"HTTP Request\"])\n    logging([\"RequestLoggingMiddleware\"])\n    %% logging: Logs method, path, duration, user\n    interceptor{{\"AuditableEntityInterceptor\"}}\n    %% interceptor: Captures entity changes (before/after)\n    service([\"IAuditService\"])\n    db([\"AuditLog Table\"])\n    hub([\"AuditHub (SignalR)\"])\n    %% hub: Real-time streaming to dashboard\n    req --> logging\n    logging --> service\n    interceptor --> service\n    service -->|\"persist\"| db\n    service -->|\"broadcast\"| hub",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_6_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Represents a single audit log entry in the database.\n/// Captures WHO did WHAT to WHICH entity, WHEN, and from WHERE.\n/// </summary>\npublic class AuditLog : Entity<Guid>\n{\n    public string UserId { get; set; }        // Who performed the action\n    public string? UserName { get; set; }      // Display name\n    public string Action { get; set; }         // CRUD operation type\n    public string EntityName { get; set; }     // Entity type (Admin, User, etc.)\n    public string? EntityId { get; set; }      // ID of affected entity\n    public string? OldValues { get; set; }     // JSON: values before change\n    public string? NewValues { get; set; }     // JSON: values after change\n    public string? AffectedColumns { get; set; } // JSON: list of changed columns\n    public string? IpAddress { get; set; }     // Client IP\n    public string? UserAgent { get; set; }     // Browser/client info\n    public DateTime Timestamp { get; set; }    // UTC timestamp\n    public Guid? TenantId { get; set; }        // Tenant scope\n    public string? CorrelationId { get; set; } // Request correlation ID\n    public int? StatusCode { get; set; }       // HTTP status code\n    public long? Duration { get; set; }        // Request duration (ms)\n    public string? RequestPath { get; set; }   // API endpoint path\n    public string? RequestMethod { get; set; } // HTTP method\n}",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "security.auditCompliance.section_8_hdr_0",
      "security.auditCompliance.section_8_hdr_1",
      "security.auditCompliance.section_8_hdr_2",
      "security.auditCompliance.section_8_hdr_3"
    ],
    "rows": [
      [
        "security.auditCompliance.section_8_cell_0_0",
        "security.auditCompliance.section_8_cell_0_1",
        "security.auditCompliance.section_8_cell_0_2",
        "security.auditCompliance.section_8_cell_0_3"
      ],
      [
        "security.auditCompliance.section_8_cell_1_0",
        "security.auditCompliance.section_8_cell_1_1",
        "security.auditCompliance.section_8_cell_1_2",
        "security.auditCompliance.section_8_cell_1_3"
      ],
      [
        "security.auditCompliance.section_8_cell_2_0",
        "security.auditCompliance.section_8_cell_2_1",
        "security.auditCompliance.section_8_cell_2_2",
        "security.auditCompliance.section_8_cell_2_3"
      ],
      [
        "security.auditCompliance.section_8_cell_3_0",
        "security.auditCompliance.section_8_cell_3_1",
        "security.auditCompliance.section_8_cell_3_2",
        "security.auditCompliance.section_8_cell_3_3"
      ],
      [
        "security.auditCompliance.section_8_cell_4_0",
        "security.auditCompliance.section_8_cell_4_1",
        "security.auditCompliance.section_8_cell_4_2",
        "security.auditCompliance.section_8_cell_4_3"
      ],
      [
        "security.auditCompliance.section_8_cell_5_0",
        "security.auditCompliance.section_8_cell_5_1",
        "security.auditCompliance.section_8_cell_5_2",
        "security.auditCompliance.section_8_cell_5_3"
      ],
      [
        "security.auditCompliance.section_8_cell_6_0",
        "security.auditCompliance.section_8_cell_6_1",
        "security.auditCompliance.section_8_cell_6_2",
        "security.auditCompliance.section_8_cell_6_3"
      ],
      [
        "security.auditCompliance.section_8_cell_7_0",
        "security.auditCompliance.section_8_cell_7_1",
        "security.auditCompliance.section_8_cell_7_2",
        "security.auditCompliance.section_8_cell_7_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_10_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_11_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// EF Core interceptor that captures entity changes before SaveChanges.\n/// For each Modified or Deleted entity, records old/new values.\n/// </summary>\npublic class AuditableEntityInterceptor : SaveChangesInterceptor\n{\n    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(\n        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct)\n    {\n        var context = eventData.Context!;\n        var auditEntries = new List<AuditEntry>();\n\n        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())\n        {\n            if (entry.State == EntityState.Unchanged) continue;\n\n            var auditEntry = new AuditEntry\n            {\n                EntityName = entry.Entity.GetType().Name,\n                EntityId = entry.Property(\"Id\").CurrentValue?.ToString(),\n                Action = entry.State.ToString(), // Added, Modified, Deleted\n                UserId = _currentUser.GetUserId(),\n                Timestamp = DateTime.UtcNow,\n            };\n\n            foreach (var property in entry.Properties)\n            {\n                if (entry.State == EntityState.Added)\n                {\n                    auditEntry.NewValues\n                        = property.CurrentValue;\n                }\n                else if (entry.State == EntityState.Modified && property.IsModified)\n                {\n                    auditEntry.OldValues\n                        = property.OriginalValue;\n                    auditEntry.NewValues\n                        = property.CurrentValue;\n                    auditEntry.AffectedColumns.Add(property.Metadata.Name);\n                }\n                else if (entry.State == EntityState.Deleted)\n                {\n                    auditEntry.OldValues\n                        = property.OriginalValue;\n                }\n            }\n\n            auditEntries.Add(auditEntry);\n        }\n\n        // Save audit entries via IAuditService\n        _auditService.EnqueueAsync(auditEntries);\n\n        return base.SavingChangesAsync(eventData, result, ct);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_14_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "security.auditCompliance.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// SignalR hub for real-time audit log streaming.\n/// Clients join tenant-specific groups for scoped updates.\n/// </summary>\n[Authorize]\npublic class AuditHub : Hub\n{\n    public override async Task OnConnectedAsync()\n    {\n        var tenantId = Context.User?.FindFirst(\"tenant_id\")?.Value;\n        if (tenantId != null)\n        {\n            await Groups.AddToGroupAsync(Context.ConnectionId, tenantId);\n        }\n        await base.OnConnectedAsync();\n    }\n}\n\n// In IAuditService — broadcast after persisting\npublic async Task LogAsync(AuditEntry entry)\n{\n    await _dbContext.AuditLogs.AddAsync(entry.ToAuditLog());\n    await _dbContext.SaveChangesAsync();\n\n    // Broadcast to tenant group in real-time\n    await _hubContext.Clients\n        .Group(entry.TenantId.ToString())\n        .SendAsync(\"AuditLogCreated\", entry.ToDto());\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "security.auditCompliance.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_19_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Frontend hook for real-time audit log streaming\nexport function useAuditStream() {\n  const [logs, setLogs] = useState<AuditLogDto[]>([]);\n  const connection = useSignalR(); // From SignalRProvider\n\n  useEffect(() => {\n    connection?.on(\"AuditLogCreated\", (log: AuditLogDto) => {\n      setLogs(prev => [log, ...prev].slice(0, 100)); // Keep latest 100\n    });\n\n    return () => connection?.off(\"AuditLogCreated\");\n  }, [connection]);\n\n  return logs;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_22_content"
  },
  {
    "type": "table",
    "headers": [
      "security.auditCompliance.section_23_hdr_0",
      "security.auditCompliance.section_23_hdr_1",
      "security.auditCompliance.section_23_hdr_2"
    ],
    "rows": [
      [
        "security.auditCompliance.section_23_cell_0_0",
        "security.auditCompliance.section_23_cell_0_1",
        "security.auditCompliance.section_23_cell_0_2"
      ],
      [
        "security.auditCompliance.section_23_cell_1_0",
        "security.auditCompliance.section_23_cell_1_1",
        "security.auditCompliance.section_23_cell_1_2"
      ],
      [
        "security.auditCompliance.section_23_cell_2_0",
        "security.auditCompliance.section_23_cell_2_1",
        "security.auditCompliance.section_23_cell_2_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_24_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface IExportService\n{\n    Task<byte[]> ExportAsync<T>(\n        IEnumerable<T> data,\n        ExportOptions options,\n        CancellationToken ct = default);\n}\n\npublic class ExportOptions\n{\n    public string Title { get; set; } = \"Export\";\n    public string[] Columns { get; set; } = Array.Empty<string>();\n    public string DateFormat { get; set; } = \"yyyy-MM-dd HH:mm:ss\";\n    public bool IncludeHeaders { get; set; } = true;\n    public string? WatermarkText { get; set; }     // PDF only\n    public string? BrandingLogoPath { get; set; }   // PDF only\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_27_content"
  },
  {
    "type": "table",
    "headers": [
      "security.auditCompliance.section_28_hdr_0",
      "security.auditCompliance.section_28_hdr_1",
      "security.auditCompliance.section_28_hdr_2",
      "security.auditCompliance.section_28_hdr_3",
      "security.auditCompliance.section_28_hdr_4"
    ],
    "rows": [
      [
        "security.auditCompliance.section_28_cell_0_0",
        "security.auditCompliance.section_28_cell_0_1",
        "security.auditCompliance.section_28_cell_0_2",
        "security.auditCompliance.section_28_cell_0_3",
        "security.auditCompliance.section_28_cell_0_4"
      ],
      [
        "security.auditCompliance.section_28_cell_1_0",
        "security.auditCompliance.section_28_cell_1_1",
        "security.auditCompliance.section_28_cell_1_2",
        "security.auditCompliance.section_28_cell_1_3",
        "security.auditCompliance.section_28_cell_1_4"
      ],
      [
        "security.auditCompliance.section_28_cell_2_0",
        "security.auditCompliance.section_28_cell_2_1",
        "security.auditCompliance.section_28_cell_2_2",
        "security.auditCompliance.section_28_cell_2_3",
        "security.auditCompliance.section_28_cell_2_4"
      ],
      [
        "security.auditCompliance.section_28_cell_3_0",
        "security.auditCompliance.section_28_cell_3_1",
        "security.auditCompliance.section_28_cell_3_2",
        "security.auditCompliance.section_28_cell_3_3",
        "security.auditCompliance.section_28_cell_3_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "security.auditCompliance.section_29_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "GET /api/v1/audit?\n  userId=a1b2c3d4...\n  &action=Modified\n  &entityName=Admin\n  &from=2026-01-01T00:00:00Z\n  &to=2026-02-20T23:59:59Z\n  &search=password\n  &page=1\n  &pageSize=25\n  &sortBy=timestamp\n  &sortDirection=desc",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.auditCompliance.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.auditCompliance.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.auditCompliance.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.auditCompliance.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.auditCompliance.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.auditCompliance.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.auditCompliance.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "security.auditCompliance.section_39_item_0",
      "security.auditCompliance.section_39_item_1",
      "security.auditCompliance.section_39_item_2"
    ]
  }
],
  relatedSlugs: [
  "security/overview",
  "security/middleware-pipeline",
  "security/data-protection"
],
  lastUpdated: "2026-06-09",
});
