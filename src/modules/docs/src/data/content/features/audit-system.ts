import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.auditSystem.intro" },

      // â”€â”€â”€ Architecture â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "4-Source Audit Pipeline",
            direction: "vertical",
            nodes: [
                  { id: "source1", label: "MediatR AuditBehavior (CQRS commands)", type: "info" },
                  { id: "source2", label: "EF Core AuditableEntityInterceptor", type: "warning" },
                  { id: "source3", label: "RequestLoggingMiddleware (HTTP)", type: "primary" },
                  { id: "source4", label: "Explicit IAuditService calls (security events)", type: "danger" },
                  { id: "service", label: "AuditService", type: "default" },
                  { id: "db", label: "AuditLogs Table", type: "success" },
                  { id: "hub", label: "SignalR AuditHub (real-time)", type: "info" },
            ],
            connections: [
                  { from: "source1", to: "service" },
                  { from: "source2", to: "service" },
                  { from: "source3", to: "service" },
                  { from: "source4", to: "service" },
                  { from: "service", to: "db" },
                  { from: "service", to: "hub", label: "Broadcast" },
            ],
      },

      // â”€â”€â”€ Event Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.eventTypesTitle", id: "event-types",
      },

      // Auth Events
      {
            type: "heading", level: 3,
            titleKey: "features.auditSystem.authEventsTitle", id: "auth-events",
      },
      {
            type: "table",
            headers: ["Event Type", "Trigger", "Metadata"],
            rows: [
                  ["LoginSuccess", "Successful login", "IP, UserAgent, AdminId"],
                  ["LoginFailed", "Wrong credentials", "IP, UserAgent, Username"],
                  ["Logout", "Token revocation", "AdminId, SessionId"],
                  ["TokenRefreshed", "Refresh token rotation", "AdminId, TokenId"],
                  ["PasswordChanged", "Admin changes password", "AdminId, ChangedBy"],
                  ["PasswordReset", "Admin/OTP password reset", "AdminId, Method"],
                  ["AccountLocked", "Exceeded failed login attempts", "AdminId, Duration"],
            ],
      },

      // RBAC Events
      {
            type: "heading", level: 3,
            titleKey: "features.auditSystem.rbacEventsTitle", id: "rbac-events",
      },
      {
            type: "table",
            headers: ["Event Type", "Trigger", "Metadata"],
            rows: [
                  ["RoleAssigned", "Role assigned to admin", "AdminId, RoleId, AssignedBy"],
                  ["RoleUnassigned", "Role removed from admin", "AdminId, RoleId, RemovedBy"],
                  ["PermissionGranted", "Permission added to role", "RoleId, PermissionId, Scope"],
                  ["PermissionRevoked", "Permission removed from role", "RoleId, PermissionId"],
                  ["ScopeChanged", "Scope override modified", "RolePermissionId, OldScope, NewScope"],
                  ["PrivilegeEscalationAttempt", "Admin tried to exceed permissions", "AdminId, AttemptedAction, TargetPermission"],
            ],
      },

      // 2FA Events
      {
            type: "heading", level: 3,
            titleKey: "features.auditSystem.twoFactorEventsTitle", id: "2fa-events",
      },
      {
            type: "table",
            headers: ["Event Type", "Trigger", "Metadata"],
            rows: [
                  ["TwoFactorEnabled", "Admin enables 2FA", "AdminId"],
                  ["TwoFactorDisabled", "Admin disables 2FA", "AdminId, DisabledBy"],
                  ["TwoFactorVerified", "Successful 2FA code entry", "AdminId"],
                  ["BackupCodeUsed", "Backup code consumed", "AdminId, CodesRemaining"],
                  ["BackupCodesRegenerated", "New backup codes generated", "AdminId"],
            ],
      },

      // Session Events
      {
            type: "heading", level: 3,
            titleKey: "features.auditSystem.sessionEventsTitle", id: "session-events",
      },
      {
            type: "table",
            headers: ["Event Type", "Trigger", "Metadata"],
            rows: [
                  ["SessionRevoked", "Single session termination", "AdminId, SessionId, RevokedBy"],
                  ["AllSessionsRevoked", "All sessions terminated", "AdminId, SessionCount"],
            ],
      },

      // Admin Management Events
      {
            type: "heading", level: 3,
            titleKey: "features.auditSystem.adminEventsTitle", id: "admin-events",
      },
      {
            type: "table",
            headers: ["Event Type", "Trigger", "Metadata"],
            rows: [
                  ["AdminCreated", "New admin account", "AdminId, CreatedBy, TenantId"],
                  ["AdminUpdated", "Profile modification", "AdminId, ChangedFields"],
                  ["AdminDeleted", "Soft-deleted", "AdminId, DeletedBy"],
                  ["AdminImpersonation", "Admin impersonated another", "ImpersonatorId, TargetAdminId"],
                  ["AdminStatusChanged", "Activated/Deactivated", "AdminId, NewStatus, ChangedBy"],
                  ["ProfileUpdated", "Self-profile update", "AdminId, ChangedFields"],
                  ["AdminTransferred", "Admin transferred between tenants", "AdminId, OldTenantId, NewTenantId"],
            ],
      },

      // Bulk Events
      {
            type: "heading", level: 3,
            titleKey: "features.auditSystem.bulkEventsTitle", id: "bulk-events",
      },
      {
            type: "table",
            headers: ["Event Type", "Trigger", "Metadata"],
            rows: [
                  ["BulkAdminDelete", "POST /admins/bulk/delete-all", "TenantId, Count, ExecutedBy"],
                  ["BulkAdminStatusUpdate", "POST /admins/bulk/activate-all or deactivate-all", "TenantId, Count, NewStatus"],
                  ["BulkTenantCascadeDelete", "DELETE /tenants/{id} with children", "TenantId, DescendantCount"],
            ],
      },

      // Tenant Events
      {
            type: "heading", level: 3,
            titleKey: "features.auditSystem.tenantEventsTitle", id: "tenant-events",
      },
      {
            type: "table",
            headers: ["Event Type", "Trigger", "Metadata"],
            rows: [
                  ["TenantCreated", "New tenant + auto-roles", "TenantId, ParentTenantId, Code"],
                  ["TenantUpdated", "Settings/details changed", "TenantId, ChangedFields"],
                  ["TenantDeleted", "Soft-deleted", "TenantId, DeletedBy, WasCascade"],
                  ["TenantPermissionsUpdated", "Permission pool modified", "TenantId, Added[], Removed[]"],
            ],
      },

      // â”€â”€â”€ Guardian Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.guardianTitle", id: "guardian",
      },
      { type: "paragraph", contentKey: "features.auditSystem.guardianIntro" },
      {
            type: "table",
            headers: ["Guardian Event", "Blocked Action", "Why It's Blocked"],
            rows: [
                  ["GuardianAdminDeleteBlocked", "Deleting last super admin", "Tenant would be orphaned with no admin access"],
                  ["GuardianTransferBlocked", "Transferring last super admin out", "Same as above  no admin left in source tenant"],
                  ["GuardianDemoteBlocked", "Removing super admin role from last holder", "Tenant needs at least one super admin"],
                  ["GuardianDeactivateBlocked", "Deactivating last super admin", "All remaining admins need active super admin"],
                  ["GuardianRoleDeleteBlocked", "Deleting a system/super-admin role", "System roles are protected from deletion"],
                  ["GuardianRolePermissionBlocked", "Modifying locked role's permissions", "IsPermissionLocked roles cannot be changed"],
                  ["GuardianTenantCreated", "N/A (informational)", "Logged when tenant auto-roles are created"],
            ],
      },
      {
            type: "info",
            variant: "warning",
            contentKey: "features.auditSystem.guardianIntro",
      },

      // â”€â”€â”€ Service Methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.serviceMethodsTitle", id: "service-methods",
      },
      { type: "paragraph", contentKey: "features.auditSystem.serviceMethodsIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "IAuditService Interface",
            code: `public interface IAuditService
{
    // 1. HTTP request logging (called from middleware)
    Task LogRequestAsync(HttpContext context, int statusCode, long durationMs);

    // 2. Authentication events
    Task LogLoginAttemptAsync(string username, bool success, string? ip, string? userAgent);

    // 3. Entity change tracking (called from EF interceptor)
    Task LogEntityChangeAsync(string entityType, string entityId,
        string action, object? oldValues, object? newValues);

    // 4. Security events (Guardian, escalation, 2FA)
    Task LogSecurityEventAsync(string eventType, string description,
        Guid? adminId = null, Dictionary<string, object>? metadata = null);

    // 5. Error logging
    Task LogErrorAsync(Exception ex, string context, Guid? adminId = null);
}`,
            highlightLines: [4, 7, 10, 14, 18],
      },

      // â”€â”€â”€ Real-Time Broadcasting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.realTimeTitle", id: "real-time",
      },
      { type: "paragraph", contentKey: "features.auditSystem.realTimeIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "AuditHub  SignalR Broadcasting",
            code: `// In AuditService.BroadcastAuditEventAsync:
await _hubContext.Clients
    .Group($"tenant-{tenantId}")     // Tenant-scoped group
    .SendAsync("ReceiveAuditEvent", new {
        Id = auditLog.Id,
        EventType = auditLog.EventType,
        Description = auditLog.Description,
        Timestamp = auditLog.CreatedAt,
        AdminName = auditLog.AdminName,
        Metadata = auditLog.Metadata
    });

// Also broadcast to super admin global group
await _hubContext.Clients
    .Group("global-audit")
    .SendAsync("ReceiveAuditEvent", auditEvent);`,
            highlightLines: [3, 15],
      },

      // â”€â”€â”€ Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.exportTitle", id: "export",
      },
      { type: "paragraph", contentKey: "features.auditSystem.exportIntro" },

      // â”€â”€â”€ API Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.endpointsTitle", id: "endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/audit-logs", descriptionKey: "Paginated list with filters (event type, date, admin, tenant)", auth: "audit.read" },
                  { method: "GET", path: "/api/v1/audit-logs/{id}", descriptionKey: "Single log detail with full metadata", auth: "audit.read" },
                  { method: "GET", path: "/api/v1/audit-logs/stats", descriptionKey: "Aggregate statistics by event type", auth: "audit.read" },
                  { method: "GET", path: "/api/v1/audit-logs/export", descriptionKey: "CSV/PDF export of filtered logs", auth: "audit.export" },
                  { method: "GET", path: "/api/v1/audit-logs/event-types", descriptionKey: "List all available event types", auth: "audit.read" },
                  { method: "DELETE", path: "/api/v1/audit-logs/purge", descriptionKey: "Purge logs older than retention period", auth: "audit.purge" },
            ],
      },

      {
            type: "info",
            variant: "tip",
            contentKey: "features.auditSystem.retentionTip",
      },
];

registerPage({
      slug: "features/audit-system",
      titleKey: "features.auditSystem.title",
      descriptionKey: "features.auditSystem.description",
      category: "features",
      order: 5,
      sections,
      relatedSlugs: ["features/authentication", "features/role-permissions"],
      lastUpdated: "2026-02-20",
});
