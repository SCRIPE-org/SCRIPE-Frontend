// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.auditTrail.intro" },

  // ─── Audit Log Architecture ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.auditTrail.architectureTitle",
    id: "architecture",
  },
  {
    type: "flowchart",
    title: "Audit Trail Data Flow",
    direction: "horizontal",
    nodes: [
      { id: "action", label: "User Action", type: "primary" },
      {
        id: "middleware",
        label: "AuditMiddleware",
        type: "info",
        description: "HTTP request capture",
      },
      {
        id: "behavior",
        label: "AuditBehavior",
        type: "info",
        description: "AstraFlow mediator pipeline",
      },
      { id: "service", label: "AuditService", type: "warning", description: "Module auto-detect" },
      { id: "db", label: "AuditLogs Table", type: "success", description: "Persistent storage" },
      { id: "signalr", label: "SignalR Hub", type: "danger", description: "Real-time broadcast" },
    ],
    connections: [
      { from: "action", to: "middleware" },
      { from: "middleware", to: "behavior" },
      { from: "behavior", to: "service" },
      { from: "service", to: "db" },
      { from: "service", to: "signalr" },
    ],
  },

  // ─── AuditLog Entity ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.auditTrail.entityTitle",
    id: "entity",
  },
  { type: "paragraph", contentKey: "infrastructure.auditTrail.entityIntro" },
  {
    type: "table",
    headers: ["Column", "Type", "Nullable", "Purpose"],
    rows: [
      ["Id", "Guid", "No", "Unique audit entry identifier (auto-generated)"],
      ["EventType", "string(50)", "No", "Event classification — see Event Types table below"],
      ["HttpMethod", "string(10)", "Yes", "HTTP verb (GET, POST, PUT, DELETE)"],
      ["Endpoint", "string(500)", "Yes", "API path that was called (e.g., /api/admins/123)"],
      ["EntityType", "string(100)", "Yes", "Entity affected (Admin, Role, Tenant, Edition, etc.)"],
      ["EntityId", "string(100)", "Yes", "Encrypted entity ID (AES-256 encrypted)"],
      [
        "OldValues",
        "JSON (nvarchar max)",
        "Yes",
        "Previous state snapshot — stored for update/delete operations",
      ],
      [
        "NewValues",
        "JSON (nvarchar max)",
        "Yes",
        "New state snapshot — stored for create/update operations",
      ],
      ["ChangedProperties", "string(1000)", "Yes", "Comma-separated list of changed field names"],
      ["UserId", "Guid", "Yes", "Who performed the action (null for anonymous/system)"],
      ["TenantId", "Guid", "Yes", "Tenant context — used for scoping in tenant dashboards"],
      ["Username", "string(100)", "Yes", "Display name of the user who performed the action"],
      ["IsAdmin", "bool", "No", "Whether the user is an admin (for client-user distinction)"],
      ["IpAddress", "string(50)", "Yes", "Client IP address (IPv4 or IPv6)"],
      ["UserAgent", "string(500)", "Yes", "Browser/device user agent string"],
      ["CorrelationId", "string(50)", "Yes", "Links all audit entries from the same HTTP request"],
      [
        "ModuleTag",
        "string(50)",
        "Yes",
        "Auto-detected module (Identity, Entitlements, System, etc.)",
      ],
      ["StatusCode", "int", "Yes", "HTTP response status code (200, 400, 401, 403, 500, etc.)"],
      ["DurationMs", "long", "Yes", "Request processing time in milliseconds"],
      ["IsSuccess", "bool", "No", "Whether the operation succeeded (default: true)"],
      ["ErrorMessage", "string(max)", "Yes", "Error details if operation failed"],
      [
        "Metadata",
        "JSON (nvarchar max)",
        "Yes",
        "Additional context data as JSON (e.g., batch counts, custom data)",
      ],
      ["Timestamp", "DateTime", "No", "UTC timestamp of the event (default: DateTime.UtcNow)"],
    ],
  },

  // ─── Module Auto-Detection ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.auditTrail.moduleDetectionTitle",
    id: "module-detection",
  },
  { type: "paragraph", contentKey: "infrastructure.auditTrail.moduleDetectionIntro" },
  {
    type: "table",
    headers: ["Detection Source", "Example Input", "Detected Module", "Priority"],
    rows: [
      [
        "Event Type (hardcoded)",
        "Login, LoginFailed, Logout",
        "Identity",
        "Highest — event-based override",
      ],
      ["Endpoint path", "/api/admins/123", "Identity", "Primary — URL-based detection"],
      ["Endpoint path", "/api/roles", "Identity", "Primary"],
      ["Endpoint path", "/api/tenants", "Identity", "Primary"],
      ["Endpoint path", "/api/editions", "Entitlements", "Primary"],
      ["Endpoint path", "/api/features", "Entitlements", "Primary"],
      ["Endpoint path", "/api/subscriptions", "Entitlements", "Primary"],
      ["Endpoint path", "/api/audit-logs", "System", "Primary"],
      [
        "Endpoint path",
        "/api/products",
        "Products (auto-capitalized)",
        "Fallback — unknown modules auto-mapped",
      ],
      ["Entity Type name", "Admin, Role, Tenant", "Identity", "Secondary — entity-based detection"],
      ["Entity Type name", "Edition, Feature", "Entitlements", "Secondary"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "AuditService.cs — Module Detection Logic",
    code: `private string DetectModule(AuditLog log)
{
    // Priority 1: Event-type hardcoded mapping
    if (log.EventType is AuditEventTypes.Login
        or AuditEventTypes.LoginFailed
        or AuditEventTypes.Logout
        or AuditEventTypes.TokenRefresh)
        return "Identity";

    // Priority 2: Endpoint path-based mapping
    if (!string.IsNullOrEmpty(log.Endpoint))
    {
        var segment = ExtractFirstSegment(log.Endpoint);
        return _endpointModuleMap.GetValueOrDefault(
            segment, Capitalize(segment));
    }

    // Priority 3: Entity type-based mapping
    if (!string.IsNullOrEmpty(log.EntityType))
        return _entityModuleMap.GetValueOrDefault(
            log.EntityType, "System");

    return "System"; // Fallback
}`,
  },

  // ─── Event Types ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.auditTrail.eventTypesTitle",
    id: "event-types",
  },
  {
    type: "table",
    headers: ["Category", "Event Types", "Description"],
    rows: [
      [
        "Authentication",
        "Login, LoginFailed, Logout, TokenRefresh",
        "User session lifecycle events",
      ],
      [
        "CRUD Operations",
        "Create, Update, Delete",
        "Entity data mutations with old/new value snapshots",
      ],
      [
        "Security",
        "AccessDenied, PrivilegeEscalationAttempt, AdminImpersonation",
        "Security-sensitive or blocked actions",
      ],
      [
        "Password",
        "PasswordChange, PasswordReset, PasswordChanged",
        "Credential management events",
      ],
      ["Account", "AccountLocked, AccountUnlocked, AdminStatusChanged", "Account state changes"],
      [
        "2FA",
        "TwoFactorEnabled, TwoFactorDisabled, TwoFactorVerified, BackupCodeUsed, BackupCodesRegenerated",
        "Multi-factor authentication lifecycle",
      ],
      ["Session", "SessionRevoked, AllSessionsRevoked", "Session management and forced logout"],
      [
        "RBAC",
        "RoleAssigned, RoleUnassigned, PermissionGranted, PermissionRevoked, ScopeChanged",
        "Access control changes",
      ],
      [
        "Tenant",
        "TenantAccess, HierarchyAccess, TenantPermissionsUpdated, BulkTenantCascadeDelete",
        "Tenant hierarchy and cross-tenant operations",
      ],
      [
        "Bulk Operations",
        "BulkAdminDelete, BulkAdminStatusUpdate",
        "Batch mutations affecting multiple entities",
      ],
      ["Profile", "ProfileUpdated", "User self-service profile changes"],
      [
        "Guardian",
        "GuardianAdminDeleteBlocked, GuardianAdminTransferBlocked, GuardianAdminDemoteBlocked, GuardianAdminDeactivateBlocked, GuardianRoleDeleteBlocked, GuardianRolePermissionBlocked, GuardianTenantCreated",
        "Protection system enforcement — prevents destruction of critical resources",
      ],
      ["System", "Request, Error", "HTTP request logging and unhandled error tracking"],
    ],
  },

  // ─── Real-Time Broadcasting ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.auditTrail.realtimeTitle",
    id: "realtime",
  },
  { type: "paragraph", contentKey: "infrastructure.auditTrail.realtimeIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "SignalR Audit Broadcasting",
    code: `// Audit events are broadcast to connected dashboards in real-time.
// Routine HTTP request logs (EventType == "Request") are excluded
// to avoid flooding the WebSocket channel.

if (log.EventType != AuditEventTypes.Request)
{
    var dto = MapToSignalRDto(log);

    // 1. Tenant-specific group (tenant admins see their own events)
    if (log.TenantId.HasValue)
    {
        await _hubContext.Clients
            .Group(HubGroupNames.ForTenant(log.TenantId.Value))
            .AuditEvent(dto);
    }

    // 2. Global group (super admins see everything)
    await _hubContext.Clients
        .Group(HubGroupNames.Global)
        .AuditEvent(dto);
}`,
  },

  // ─── Query API ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.auditTrail.queryTitle",
    id: "query-api",
  },
  { type: "paragraph", contentKey: "infrastructure.auditTrail.queryIntro" },
  {
    type: "code",
    language: "bash",
    filename: "AuditLog Query Examples",
    code: `# Get all audit logs (paginated)
GET /api/audit-logs?page=1&pageSize=20

# Filter by event type
GET /api/audit-logs?eventType=Login&page=1&pageSize=50

# Filter by module
GET /api/audit-logs?moduleTag=Identity

# Filter by date range
GET /api/audit-logs?dateFrom=2026-04-01&dateTo=2026-04-06

# Filter by user
GET /api/audit-logs?userId=<encrypted-id>

# Trace a request (find all logs from one HTTP request)
GET /api/audit-logs?correlationId=abc-123-def

# Combined filters
GET /api/audit-logs?eventType=Create&entityType=Admin&moduleTag=Identity&dateFrom=2026-04-01`,
  },
  {
    type: "table",
    headers: ["Filter Parameter", "Type", "Description"],
    rows: [
      ["eventType", "string", "Filter by AuditEventType (Login, Create, Update, Delete, etc.)"],
      ["entityType", "string", "Filter by entity name (Admin, Role, Tenant, Edition)"],
      ["userId", "string (encrypted)", "Filter by the user who performed the action"],
      ["tenantId", "string (encrypted)", "Filter by tenant context"],
      ["moduleTag", "string", "Filter by module (Identity, Entitlements, System)"],
      ["dateFrom", "datetime", "Start of date range (ISO 8601 format)"],
      ["dateTo", "datetime", "End of date range (ISO 8601 format)"],
      ["correlationId", "string", "Trace all entries from a single HTTP request"],
      ["isSuccess", "bool", "Filter by success/failure status"],
      ["search", "string", "Full-text search across Endpoint, EntityType, Username"],
      ["page", "int", "Page number (default: 1)"],
      ["pageSize", "int", "Items per page (default: 20, max: 100)"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "infrastructure.auditTrail.queryTip",
  },
];

registerPage({
  slug: "infrastructure/audit-trail",
  titleKey: "infrastructure.auditTrail.title",
  descriptionKey: "infrastructure.auditTrail.description",
  category: "infrastructure",
  order: 9,
  sections,
  relatedSlugs: [
    "features/audit-system",
    "security/audit-compliance",
    "infrastructure/observability",
  ],
  lastUpdated: "2026-04-06",
});
