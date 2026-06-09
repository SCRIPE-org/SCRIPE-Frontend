import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/audit-trail",
  titleKey: "infrastructure.auditTrail.title",
  category: "infrastructure",
  order: 9,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.auditTrail.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    action([\"User Action\"])\n    middleware([\"RequestLoggingMiddleware\"])\n    %% middleware: HTTP request capture\n    interceptor([\"AuditableEntityInterceptor\"])\n    %% interceptor: Entity change tracking\n    service{{\"AuditService\"}}\n    %% service: Common audit handler\n    db([\"AuditLogs Table\"])\n    %% db: Persistent storage\n    signalr[\"SignalR Hub\"]\n    %% signalr: Real-time broadcast\n    action --> middleware\n    middleware --> service\n    interceptor --> service\n    service --> db\n    service --> signalr",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.auditTrail.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_5_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.auditTrail.section_6_hdr_0",
      "infrastructure.auditTrail.section_6_hdr_1",
      "infrastructure.auditTrail.section_6_hdr_2",
      "infrastructure.auditTrail.section_6_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.auditTrail.section_6_cell_0_0",
        "infrastructure.auditTrail.section_6_cell_0_1",
        "infrastructure.auditTrail.section_6_cell_0_2",
        "infrastructure.auditTrail.section_6_cell_0_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_1_0",
        "infrastructure.auditTrail.section_6_cell_1_1",
        "infrastructure.auditTrail.section_6_cell_1_2",
        "infrastructure.auditTrail.section_6_cell_1_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_2_0",
        "infrastructure.auditTrail.section_6_cell_2_1",
        "infrastructure.auditTrail.section_6_cell_2_2",
        "infrastructure.auditTrail.section_6_cell_2_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_3_0",
        "infrastructure.auditTrail.section_6_cell_3_1",
        "infrastructure.auditTrail.section_6_cell_3_2",
        "infrastructure.auditTrail.section_6_cell_3_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_4_0",
        "infrastructure.auditTrail.section_6_cell_4_1",
        "infrastructure.auditTrail.section_6_cell_4_2",
        "infrastructure.auditTrail.section_6_cell_4_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_5_0",
        "infrastructure.auditTrail.section_6_cell_5_1",
        "infrastructure.auditTrail.section_6_cell_5_2",
        "infrastructure.auditTrail.section_6_cell_5_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_6_0",
        "infrastructure.auditTrail.section_6_cell_6_1",
        "infrastructure.auditTrail.section_6_cell_6_2",
        "infrastructure.auditTrail.section_6_cell_6_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_7_0",
        "infrastructure.auditTrail.section_6_cell_7_1",
        "infrastructure.auditTrail.section_6_cell_7_2",
        "infrastructure.auditTrail.section_6_cell_7_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_8_0",
        "infrastructure.auditTrail.section_6_cell_8_1",
        "infrastructure.auditTrail.section_6_cell_8_2",
        "infrastructure.auditTrail.section_6_cell_8_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_9_0",
        "infrastructure.auditTrail.section_6_cell_9_1",
        "infrastructure.auditTrail.section_6_cell_9_2",
        "infrastructure.auditTrail.section_6_cell_9_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_10_0",
        "infrastructure.auditTrail.section_6_cell_10_1",
        "infrastructure.auditTrail.section_6_cell_10_2",
        "infrastructure.auditTrail.section_6_cell_10_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_11_0",
        "infrastructure.auditTrail.section_6_cell_11_1",
        "infrastructure.auditTrail.section_6_cell_11_2",
        "infrastructure.auditTrail.section_6_cell_11_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_12_0",
        "infrastructure.auditTrail.section_6_cell_12_1",
        "infrastructure.auditTrail.section_6_cell_12_2",
        "infrastructure.auditTrail.section_6_cell_12_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_13_0",
        "infrastructure.auditTrail.section_6_cell_13_1",
        "infrastructure.auditTrail.section_6_cell_13_2",
        "infrastructure.auditTrail.section_6_cell_13_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_14_0",
        "infrastructure.auditTrail.section_6_cell_14_1",
        "infrastructure.auditTrail.section_6_cell_14_2",
        "infrastructure.auditTrail.section_6_cell_14_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_15_0",
        "infrastructure.auditTrail.section_6_cell_15_1",
        "infrastructure.auditTrail.section_6_cell_15_2",
        "infrastructure.auditTrail.section_6_cell_15_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_16_0",
        "infrastructure.auditTrail.section_6_cell_16_1",
        "infrastructure.auditTrail.section_6_cell_16_2",
        "infrastructure.auditTrail.section_6_cell_16_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_17_0",
        "infrastructure.auditTrail.section_6_cell_17_1",
        "infrastructure.auditTrail.section_6_cell_17_2",
        "infrastructure.auditTrail.section_6_cell_17_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_18_0",
        "infrastructure.auditTrail.section_6_cell_18_1",
        "infrastructure.auditTrail.section_6_cell_18_2",
        "infrastructure.auditTrail.section_6_cell_18_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_19_0",
        "infrastructure.auditTrail.section_6_cell_19_1",
        "infrastructure.auditTrail.section_6_cell_19_2",
        "infrastructure.auditTrail.section_6_cell_19_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_20_0",
        "infrastructure.auditTrail.section_6_cell_20_1",
        "infrastructure.auditTrail.section_6_cell_20_2",
        "infrastructure.auditTrail.section_6_cell_20_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_21_0",
        "infrastructure.auditTrail.section_6_cell_21_1",
        "infrastructure.auditTrail.section_6_cell_21_2",
        "infrastructure.auditTrail.section_6_cell_21_3"
      ],
      [
        "infrastructure.auditTrail.section_6_cell_22_0",
        "infrastructure.auditTrail.section_6_cell_22_1",
        "infrastructure.auditTrail.section_6_cell_22_2",
        "infrastructure.auditTrail.section_6_cell_22_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.auditTrail.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_8_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.auditTrail.section_9_hdr_0",
      "infrastructure.auditTrail.section_9_hdr_1",
      "infrastructure.auditTrail.section_9_hdr_2",
      "infrastructure.auditTrail.section_9_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.auditTrail.section_9_cell_0_0",
        "infrastructure.auditTrail.section_9_cell_0_1",
        "infrastructure.auditTrail.section_9_cell_0_2",
        "infrastructure.auditTrail.section_9_cell_0_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_1_0",
        "infrastructure.auditTrail.section_9_cell_1_1",
        "infrastructure.auditTrail.section_9_cell_1_2",
        "infrastructure.auditTrail.section_9_cell_1_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_2_0",
        "infrastructure.auditTrail.section_9_cell_2_1",
        "infrastructure.auditTrail.section_9_cell_2_2",
        "infrastructure.auditTrail.section_9_cell_2_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_3_0",
        "infrastructure.auditTrail.section_9_cell_3_1",
        "infrastructure.auditTrail.section_9_cell_3_2",
        "infrastructure.auditTrail.section_9_cell_3_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_4_0",
        "infrastructure.auditTrail.section_9_cell_4_1",
        "infrastructure.auditTrail.section_9_cell_4_2",
        "infrastructure.auditTrail.section_9_cell_4_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_5_0",
        "infrastructure.auditTrail.section_9_cell_5_1",
        "infrastructure.auditTrail.section_9_cell_5_2",
        "infrastructure.auditTrail.section_9_cell_5_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_6_0",
        "infrastructure.auditTrail.section_9_cell_6_1",
        "infrastructure.auditTrail.section_9_cell_6_2",
        "infrastructure.auditTrail.section_9_cell_6_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_7_0",
        "infrastructure.auditTrail.section_9_cell_7_1",
        "infrastructure.auditTrail.section_9_cell_7_2",
        "infrastructure.auditTrail.section_9_cell_7_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_8_0",
        "infrastructure.auditTrail.section_9_cell_8_1",
        "infrastructure.auditTrail.section_9_cell_8_2",
        "infrastructure.auditTrail.section_9_cell_8_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_9_0",
        "infrastructure.auditTrail.section_9_cell_9_1",
        "infrastructure.auditTrail.section_9_cell_9_2",
        "infrastructure.auditTrail.section_9_cell_9_3"
      ],
      [
        "infrastructure.auditTrail.section_9_cell_10_0",
        "infrastructure.auditTrail.section_9_cell_10_1",
        "infrastructure.auditTrail.section_9_cell_10_2",
        "infrastructure.auditTrail.section_9_cell_10_3"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "private string DetectModule(AuditLog log)\n{\n    // Priority 1: Event-type hardcoded mapping\n    if (log.EventType is AuditEventTypes.Login\n        or AuditEventTypes.LoginFailed\n        or AuditEventTypes.Logout\n        or AuditEventTypes.TokenRefresh)\n        return \"Identity\";\n\n    // Priority 2: Endpoint path-based mapping\n    if (!string.IsNullOrEmpty(log.Endpoint))\n    {\n        var segment = ExtractFirstSegment(log.Endpoint);\n        return _endpointModuleMap.GetValueOrDefault(\n            segment, Capitalize(segment));\n    }\n\n    // Priority 3: Entity type-based mapping\n    if (!string.IsNullOrEmpty(log.EntityType))\n        return _entityModuleMap.GetValueOrDefault(\n            log.EntityType, \"System\");\n\n    return \"System\"; // Fallback\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.auditTrail.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.auditTrail.section_13_hdr_0",
      "infrastructure.auditTrail.section_13_hdr_1",
      "infrastructure.auditTrail.section_13_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.auditTrail.section_13_cell_0_0",
        "infrastructure.auditTrail.section_13_cell_0_1",
        "infrastructure.auditTrail.section_13_cell_0_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_1_0",
        "infrastructure.auditTrail.section_13_cell_1_1",
        "infrastructure.auditTrail.section_13_cell_1_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_2_0",
        "infrastructure.auditTrail.section_13_cell_2_1",
        "infrastructure.auditTrail.section_13_cell_2_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_3_0",
        "infrastructure.auditTrail.section_13_cell_3_1",
        "infrastructure.auditTrail.section_13_cell_3_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_4_0",
        "infrastructure.auditTrail.section_13_cell_4_1",
        "infrastructure.auditTrail.section_13_cell_4_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_5_0",
        "infrastructure.auditTrail.section_13_cell_5_1",
        "infrastructure.auditTrail.section_13_cell_5_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_6_0",
        "infrastructure.auditTrail.section_13_cell_6_1",
        "infrastructure.auditTrail.section_13_cell_6_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_7_0",
        "infrastructure.auditTrail.section_13_cell_7_1",
        "infrastructure.auditTrail.section_13_cell_7_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_8_0",
        "infrastructure.auditTrail.section_13_cell_8_1",
        "infrastructure.auditTrail.section_13_cell_8_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_9_0",
        "infrastructure.auditTrail.section_13_cell_9_1",
        "infrastructure.auditTrail.section_13_cell_9_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_10_0",
        "infrastructure.auditTrail.section_13_cell_10_1",
        "infrastructure.auditTrail.section_13_cell_10_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_11_0",
        "infrastructure.auditTrail.section_13_cell_11_1",
        "infrastructure.auditTrail.section_13_cell_11_2"
      ],
      [
        "infrastructure.auditTrail.section_13_cell_12_0",
        "infrastructure.auditTrail.section_13_cell_12_1",
        "infrastructure.auditTrail.section_13_cell_12_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.auditTrail.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Audit events are broadcast to connected dashboards in real-time.\n// Routine HTTP request logs (EventType == \"Request\") are excluded\n// to avoid flooding the WebSocket channel.\n\nif (log.EventType != AuditEventTypes.Request)\n{\n    var dto = MapToSignalRDto(log);\n\n    // 1. Tenant-specific group (tenant admins see their own events)\n    if (log.TenantId.HasValue)\n    {\n        await _hubContext.Clients\n            .Group(HubGroupNames.ForTenant(log.TenantId.Value))\n            .AuditEvent(dto);\n    }\n\n    // 2. Global group (super admins see everything)\n    await _hubContext.Clients\n        .Group(HubGroupNames.Global)\n        .AuditEvent(dto);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.auditTrail.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.auditTrail.section_20_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Get all audit logs (paginated)\nGET /api/audit-logs?page=1&pageSize=20\n\n# Filter by event type\nGET /api/audit-logs?eventType=Login&page=1&pageSize=50\n\n# Filter by module\nGET /api/audit-logs?moduleTag=Identity\n\n# Filter by date range\nGET /api/audit-logs?dateFrom=2026-04-01&dateTo=2026-04-06\n\n# Filter by user\nGET /api/audit-logs?userId=<encrypted-id>\n\n# Trace a request (find all logs from one HTTP request)\nGET /api/audit-logs?correlationId=abc-123-def\n\n# Combined filters\nGET /api/audit-logs?eventType=Create&entityType=Admin&moduleTag=Identity&dateFrom=2026-04-01",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.auditTrail.section_22_hdr_0",
      "infrastructure.auditTrail.section_22_hdr_1",
      "infrastructure.auditTrail.section_22_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.auditTrail.section_22_cell_0_0",
        "infrastructure.auditTrail.section_22_cell_0_1",
        "infrastructure.auditTrail.section_22_cell_0_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_1_0",
        "infrastructure.auditTrail.section_22_cell_1_1",
        "infrastructure.auditTrail.section_22_cell_1_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_2_0",
        "infrastructure.auditTrail.section_22_cell_2_1",
        "infrastructure.auditTrail.section_22_cell_2_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_3_0",
        "infrastructure.auditTrail.section_22_cell_3_1",
        "infrastructure.auditTrail.section_22_cell_3_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_4_0",
        "infrastructure.auditTrail.section_22_cell_4_1",
        "infrastructure.auditTrail.section_22_cell_4_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_5_0",
        "infrastructure.auditTrail.section_22_cell_5_1",
        "infrastructure.auditTrail.section_22_cell_5_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_6_0",
        "infrastructure.auditTrail.section_22_cell_6_1",
        "infrastructure.auditTrail.section_22_cell_6_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_7_0",
        "infrastructure.auditTrail.section_22_cell_7_1",
        "infrastructure.auditTrail.section_22_cell_7_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_8_0",
        "infrastructure.auditTrail.section_22_cell_8_1",
        "infrastructure.auditTrail.section_22_cell_8_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_9_0",
        "infrastructure.auditTrail.section_22_cell_9_1",
        "infrastructure.auditTrail.section_22_cell_9_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_10_0",
        "infrastructure.auditTrail.section_22_cell_10_1",
        "infrastructure.auditTrail.section_22_cell_10_2"
      ],
      [
        "infrastructure.auditTrail.section_22_cell_11_0",
        "infrastructure.auditTrail.section_22_cell_11_1",
        "infrastructure.auditTrail.section_22_cell_11_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "infrastructure.auditTrail.section_23_title",
    "contentKey": "infrastructure.auditTrail.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.auditTrail.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.auditTrail.section_25_item_0",
      "infrastructure.auditTrail.section_25_item_1",
      "infrastructure.auditTrail.section_25_item_2"
    ]
  }
],
  relatedSlugs: [
  "features/audit-system",
  "security/audit-compliance",
  "infrastructure/observability"
],
  lastUpdated: "2026-06-09",
});
