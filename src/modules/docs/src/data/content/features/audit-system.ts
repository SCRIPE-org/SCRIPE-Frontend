import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/audit-system",
  titleKey: "features.auditSystem.title",
  category: "features",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    source2{{\"EF Core AuditableEntityInterceptor\"}}\n    source3([\"RequestLoggingMiddleware (HTTP)\"])\n    source4[\"Explicit IAuditService calls (security events)\"]\n    service[\"AuditService\"]\n    db([\"AuditLogs Table\"])\n    hub([\"SignalR AuditHub (real-time)\"])\n    source2 --> service\n    source3 --> service\n    source4 --> service\n    service --> db\n    service -->|\"Broadcast\"| hub",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.auditSystem.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_6_hdr_0",
      "features.auditSystem.section_6_hdr_1",
      "features.auditSystem.section_6_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_6_cell_0_0",
        "features.auditSystem.section_6_cell_0_1",
        "features.auditSystem.section_6_cell_0_2"
      ],
      [
        "features.auditSystem.section_6_cell_1_0",
        "features.auditSystem.section_6_cell_1_1",
        "features.auditSystem.section_6_cell_1_2"
      ],
      [
        "features.auditSystem.section_6_cell_2_0",
        "features.auditSystem.section_6_cell_2_1",
        "features.auditSystem.section_6_cell_2_2"
      ],
      [
        "features.auditSystem.section_6_cell_3_0",
        "features.auditSystem.section_6_cell_3_1",
        "features.auditSystem.section_6_cell_3_2"
      ],
      [
        "features.auditSystem.section_6_cell_4_0",
        "features.auditSystem.section_6_cell_4_1",
        "features.auditSystem.section_6_cell_4_2"
      ],
      [
        "features.auditSystem.section_6_cell_5_0",
        "features.auditSystem.section_6_cell_5_1",
        "features.auditSystem.section_6_cell_5_2"
      ],
      [
        "features.auditSystem.section_6_cell_6_0",
        "features.auditSystem.section_6_cell_6_1",
        "features.auditSystem.section_6_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.auditSystem.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_8_hdr_0",
      "features.auditSystem.section_8_hdr_1",
      "features.auditSystem.section_8_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_8_cell_0_0",
        "features.auditSystem.section_8_cell_0_1",
        "features.auditSystem.section_8_cell_0_2"
      ],
      [
        "features.auditSystem.section_8_cell_1_0",
        "features.auditSystem.section_8_cell_1_1",
        "features.auditSystem.section_8_cell_1_2"
      ],
      [
        "features.auditSystem.section_8_cell_2_0",
        "features.auditSystem.section_8_cell_2_1",
        "features.auditSystem.section_8_cell_2_2"
      ],
      [
        "features.auditSystem.section_8_cell_3_0",
        "features.auditSystem.section_8_cell_3_1",
        "features.auditSystem.section_8_cell_3_2"
      ],
      [
        "features.auditSystem.section_8_cell_4_0",
        "features.auditSystem.section_8_cell_4_1",
        "features.auditSystem.section_8_cell_4_2"
      ],
      [
        "features.auditSystem.section_8_cell_5_0",
        "features.auditSystem.section_8_cell_5_1",
        "features.auditSystem.section_8_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.auditSystem.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_10_hdr_0",
      "features.auditSystem.section_10_hdr_1",
      "features.auditSystem.section_10_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_10_cell_0_0",
        "features.auditSystem.section_10_cell_0_1",
        "features.auditSystem.section_10_cell_0_2"
      ],
      [
        "features.auditSystem.section_10_cell_1_0",
        "features.auditSystem.section_10_cell_1_1",
        "features.auditSystem.section_10_cell_1_2"
      ],
      [
        "features.auditSystem.section_10_cell_2_0",
        "features.auditSystem.section_10_cell_2_1",
        "features.auditSystem.section_10_cell_2_2"
      ],
      [
        "features.auditSystem.section_10_cell_3_0",
        "features.auditSystem.section_10_cell_3_1",
        "features.auditSystem.section_10_cell_3_2"
      ],
      [
        "features.auditSystem.section_10_cell_4_0",
        "features.auditSystem.section_10_cell_4_1",
        "features.auditSystem.section_10_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.auditSystem.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_12_hdr_0",
      "features.auditSystem.section_12_hdr_1",
      "features.auditSystem.section_12_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_12_cell_0_0",
        "features.auditSystem.section_12_cell_0_1",
        "features.auditSystem.section_12_cell_0_2"
      ],
      [
        "features.auditSystem.section_12_cell_1_0",
        "features.auditSystem.section_12_cell_1_1",
        "features.auditSystem.section_12_cell_1_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.auditSystem.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_14_hdr_0",
      "features.auditSystem.section_14_hdr_1",
      "features.auditSystem.section_14_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_14_cell_0_0",
        "features.auditSystem.section_14_cell_0_1",
        "features.auditSystem.section_14_cell_0_2"
      ],
      [
        "features.auditSystem.section_14_cell_1_0",
        "features.auditSystem.section_14_cell_1_1",
        "features.auditSystem.section_14_cell_1_2"
      ],
      [
        "features.auditSystem.section_14_cell_2_0",
        "features.auditSystem.section_14_cell_2_1",
        "features.auditSystem.section_14_cell_2_2"
      ],
      [
        "features.auditSystem.section_14_cell_3_0",
        "features.auditSystem.section_14_cell_3_1",
        "features.auditSystem.section_14_cell_3_2"
      ],
      [
        "features.auditSystem.section_14_cell_4_0",
        "features.auditSystem.section_14_cell_4_1",
        "features.auditSystem.section_14_cell_4_2"
      ],
      [
        "features.auditSystem.section_14_cell_5_0",
        "features.auditSystem.section_14_cell_5_1",
        "features.auditSystem.section_14_cell_5_2"
      ],
      [
        "features.auditSystem.section_14_cell_6_0",
        "features.auditSystem.section_14_cell_6_1",
        "features.auditSystem.section_14_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.auditSystem.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_16_hdr_0",
      "features.auditSystem.section_16_hdr_1",
      "features.auditSystem.section_16_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_16_cell_0_0",
        "features.auditSystem.section_16_cell_0_1",
        "features.auditSystem.section_16_cell_0_2"
      ],
      [
        "features.auditSystem.section_16_cell_1_0",
        "features.auditSystem.section_16_cell_1_1",
        "features.auditSystem.section_16_cell_1_2"
      ],
      [
        "features.auditSystem.section_16_cell_2_0",
        "features.auditSystem.section_16_cell_2_1",
        "features.auditSystem.section_16_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.auditSystem.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_18_hdr_0",
      "features.auditSystem.section_18_hdr_1",
      "features.auditSystem.section_18_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_18_cell_0_0",
        "features.auditSystem.section_18_cell_0_1",
        "features.auditSystem.section_18_cell_0_2"
      ],
      [
        "features.auditSystem.section_18_cell_1_0",
        "features.auditSystem.section_18_cell_1_1",
        "features.auditSystem.section_18_cell_1_2"
      ],
      [
        "features.auditSystem.section_18_cell_2_0",
        "features.auditSystem.section_18_cell_2_1",
        "features.auditSystem.section_18_cell_2_2"
      ],
      [
        "features.auditSystem.section_18_cell_3_0",
        "features.auditSystem.section_18_cell_3_1",
        "features.auditSystem.section_18_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_20_content"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_21_hdr_0",
      "features.auditSystem.section_21_hdr_1",
      "features.auditSystem.section_21_hdr_2"
    ],
    "rows": [
      [
        "features.auditSystem.section_21_cell_0_0",
        "features.auditSystem.section_21_cell_0_1",
        "features.auditSystem.section_21_cell_0_2"
      ],
      [
        "features.auditSystem.section_21_cell_1_0",
        "features.auditSystem.section_21_cell_1_1",
        "features.auditSystem.section_21_cell_1_2"
      ],
      [
        "features.auditSystem.section_21_cell_2_0",
        "features.auditSystem.section_21_cell_2_1",
        "features.auditSystem.section_21_cell_2_2"
      ],
      [
        "features.auditSystem.section_21_cell_3_0",
        "features.auditSystem.section_21_cell_3_1",
        "features.auditSystem.section_21_cell_3_2"
      ],
      [
        "features.auditSystem.section_21_cell_4_0",
        "features.auditSystem.section_21_cell_4_1",
        "features.auditSystem.section_21_cell_4_2"
      ],
      [
        "features.auditSystem.section_21_cell_5_0",
        "features.auditSystem.section_21_cell_5_1",
        "features.auditSystem.section_21_cell_5_2"
      ],
      [
        "features.auditSystem.section_21_cell_6_0",
        "features.auditSystem.section_21_cell_6_1",
        "features.auditSystem.section_21_cell_6_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.auditSystem.section_22_title",
    "contentKey": "features.auditSystem.section_22_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_24_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_25_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface IAuditService\n{\n    // 1. HTTP request logging (called from middleware)\n    Task LogRequestAsync(HttpContext context, int statusCode, long durationMs);\n\n    // 2. Authentication events\n    Task LogLoginAttemptAsync(string username, bool success, string? ip, string? userAgent);\n\n    // 3. Entity change tracking (called from EF interceptor)\n    Task LogEntityChangeAsync(string entityType, string entityId,\n        string action, object? oldValues, object? newValues);\n\n    // 4. Security events (Guardian, escalation, 2FA)\n    Task LogSecurityEventAsync(string eventType, string description,\n        Guid? adminId = null, Dictionary<string, object>? metadata = null);\n\n    // 5. Error logging\n    Task LogErrorAsync(Exception ex, string context, Guid? adminId = null);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_28_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_29_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// In AuditService.BroadcastAuditEventAsync:\nawait _hubContext.Clients\n    .Group($\"tenant-{tenantId}\")     // Tenant-scoped group\n    .SendAsync(\"ReceiveAuditEvent\", new {\n        Id = auditLog.Id,\n        EventType = auditLog.EventType,\n        Description = auditLog.Description,\n        Timestamp = auditLog.CreatedAt,\n        AdminName = auditLog.AdminName,\n        Metadata = auditLog.Metadata\n    });\n\n// Also broadcast to super admin global group\nawait _hubContext.Clients\n    .Group(\"global-audit\")\n    .SendAsync(\"ReceiveAuditEvent\", auditEvent);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "paragraph",
    "contentKey": "features.auditSystem.section_32_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "table",
    "headers": [
      "features.auditSystem.section_34_hdr_0",
      "features.auditSystem.section_34_hdr_1",
      "features.auditSystem.section_34_hdr_2",
      "features.auditSystem.section_34_hdr_3",
      "features.auditSystem.section_34_hdr_4"
    ],
    "rows": [
      [
        "features.auditSystem.section_34_cell_0_0",
        "features.auditSystem.section_34_cell_0_1",
        "features.auditSystem.section_34_cell_0_2",
        "features.auditSystem.section_34_cell_0_3",
        "features.auditSystem.section_34_cell_0_4"
      ],
      [
        "features.auditSystem.section_34_cell_1_0",
        "features.auditSystem.section_34_cell_1_1",
        "features.auditSystem.section_34_cell_1_2",
        "features.auditSystem.section_34_cell_1_3",
        "features.auditSystem.section_34_cell_1_4"
      ],
      [
        "features.auditSystem.section_34_cell_2_0",
        "features.auditSystem.section_34_cell_2_1",
        "features.auditSystem.section_34_cell_2_2",
        "features.auditSystem.section_34_cell_2_3",
        "features.auditSystem.section_34_cell_2_4"
      ],
      [
        "features.auditSystem.section_34_cell_3_0",
        "features.auditSystem.section_34_cell_3_1",
        "features.auditSystem.section_34_cell_3_2",
        "features.auditSystem.section_34_cell_3_3",
        "features.auditSystem.section_34_cell_3_4"
      ],
      [
        "features.auditSystem.section_34_cell_4_0",
        "features.auditSystem.section_34_cell_4_1",
        "features.auditSystem.section_34_cell_4_2",
        "features.auditSystem.section_34_cell_4_3",
        "features.auditSystem.section_34_cell_4_4"
      ],
      [
        "features.auditSystem.section_34_cell_5_0",
        "features.auditSystem.section_34_cell_5_1",
        "features.auditSystem.section_34_cell_5_2",
        "features.auditSystem.section_34_cell_5_3",
        "features.auditSystem.section_34_cell_5_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.auditSystem.section_35_title",
    "contentKey": "features.auditSystem.section_35_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.auditSystem.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.auditSystem.section_37_item_0",
      "features.auditSystem.section_37_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/authentication",
  "features/role-permissions"
],
  lastUpdated: "2026-06-09",
});
