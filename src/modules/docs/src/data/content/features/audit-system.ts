import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.auditSystem.intro" },
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.architectureTitle", id: "audit-architecture",
      },
      {
            type: "flowchart",
            title: "Audit Logging Pipeline",
            direction: "vertical",
            nodes: [
                  { id: "action", label: "User Action", type: "default" },
                  { id: "behavior", label: "AuditBehavior (MediatR)", type: "info" },
                  { id: "interceptor", label: "AuditableEntityInterceptor (EF)", type: "warning" },
                  { id: "service", label: "IAuditService.LogAsync()", type: "success" },
                  { id: "db", label: "AuditLog Table", type: "primary" },
                  { id: "hub", label: "SignalR AuditHub (Real-time)", type: "danger" },
            ],
            connections: [
                  { from: "action", to: "behavior" },
                  { from: "behavior", to: "interceptor" },
                  { from: "interceptor", to: "service" },
                  { from: "service", to: "db" },
                  { from: "service", to: "hub", label: "Broadcast" },
            ],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.eventTypesTitle", id: "event-types",
      },
      {
            type: "table",
            headers: ["Event Type", "Source", "Data Captured", "Example"],
            rows: [
                  ["API Request", "RequestLoggingMiddleware", "Method, Path, Status, Duration, IP", "GET /api/v1/users → 200 (45ms)"],
                  ["Entity Change", "AuditableEntityInterceptor", "Entity, Old/New Values, Changed Fields", "User.Name: 'John' → 'Jane'"],
                  ["Auth Event", "AuthController", "Email, Success/Failure, IP, Device", "Login attempt: admin@nexora.com"],
                  ["Security Event", "SecurityService", "Action, UserId, Details", "Password changed, 2FA enabled"],
                  ["Admin Action", "AuditBehavior", "Command, Parameters, Result", "CreateAdminCommand executed"],
            ],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.realTimeTitle", id: "real-time",
      },
      { type: "paragraph", contentKey: "features.auditSystem.realTimeIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "AuditHub — Real-time audit broadcasting",
            code: `public class AuditHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Auto-join tenant group for scoped events
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant-{tenantId}");
        }
        await base.OnConnectedAsync();
    }

    // Called by IAuditService after each audit log
    public async Task BroadcastAuditEvent(AuditLogDto log)
    {
        await Clients.Group($"tenant-{log.TenantId}")
            .SendAsync("ReceiveAuditEvent", log);
    }
}`,
            highlightLines: [6, 17, 18],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.auditSystem.endpointsTitle", id: "endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/audit", description: "Search audit logs with filters", auth: "audit.read" },
                  { method: "GET", path: "/api/v1/audit/{id}", description: "Get audit log details", auth: "audit.read" },
                  { method: "GET", path: "/api/v1/audit/export", description: "Export audit logs (CSV/PDF)", auth: "audit.export" },
                  { method: "GET", path: "/api/v1/audit/stats", description: "Audit statistics dashboard", auth: "audit.read" },
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
      order: 4,
      sections,
      relatedSlugs: ["features/authentication", "security/overview"],
      lastUpdated: "2026-02-19",
});
