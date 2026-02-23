import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      // € Architecture €
      { type: "heading", level: 2, titleKey: "features.webhookSystem.architectureTitle", id: "architecture" },
      { type: "paragraph", contentKey: "features.webhookSystem.architectureIntro" },
      {
            type: "flowchart",
            direction: "vertical",
            title: "Webhook Delivery Flow",
            nodes: [
                  { id: "event", label: "Domain Event", type: "default" },
                  { id: "whs", label: "WebhookService", type: "primary" },
                  { id: "db", label: "Match event â†’ active subscriptions", type: "info" },
                  { id: "sign", label: "HMAC-SHA256 Sign Payload", type: "success" },
                  { id: "send", label: "HTTP POST to subscriber URL", type: "warning" },
                  { id: "log", label: "Log delivery attempt", type: "success" },
                  { id: "retry", label: "Retry with exponential backoff", type: "danger" },
                  { id: "circuit", label: "Circuit breaker if MaxConsecutiveFailures reached", type: "danger" },
            ],
            connections: [
                  { from: "event", to: "whs" },
                  { from: "whs", to: "db" },
                  { from: "db", to: "sign" },
                  { from: "sign", to: "send" },
                  { from: "send", to: "log", label: "Success" },
                  { from: "send", to: "retry", label: "Failure" },
                  { from: "retry", to: "circuit", label: "Max retries exceeded" },
            ],
      },

      // € Entity €
      { type: "heading", level: 2, titleKey: "features.webhookSystem.entityTitle", id: "entity" },
      {
            type: "code",
            language: "csharp",
            filename: "WebhookSubscription Entity",
            code: `public class WebhookSubscription : AuditableEntity<Guid>
{
    [Required] [MaxLength(500)]
    public string Url { get; set; } = null!;            // Delivery URL

    [Required] [MaxLength(100)]
    public string Secret { get; set; } = null!;          // HMAC signing key

    [MaxLength(100)]
    public string? PreviousSecret { get; set; }          // Old key during rotation
    public DateTime? PreviousSecretExpiresAt { get; set; }  // 24h grace

    public bool IsActive { get; set; } = true;           // Circuit breaker toggle

    public string EventsJson { get; set; } = "[]";       // Subscribed events

    public bool IncludeChildren { get; set; } = false;   // Tenant hierarchy events

    public int MaxRetries { get; set; } = 5;
    public int MaxConsecutiveFailures { get; set; } = 10; // Auto-disable threshold
    public int ConsecutiveFailures { get; set; } = 0;    // Current failure count

    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;
}`,
            highlightLines: [10, 11, 16, 19, 20],
      },

      // € HMAC Signing €
      { type: "heading", level: 2, titleKey: "features.webhookSystem.hmacTitle", id: "hmac" },
      { type: "paragraph", contentKey: "features.webhookSystem.hmacIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "HMAC Signing & Verification",
            code: `// Server-side: Sign payload
using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(subscription.Secret));
var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
var signature = Convert.ToBase64String(hash);

// HTTP Headers sent:
// X-Webhook-Signature: {signature}
// X-Webhook-Signature-Old: {signatureWithOldSecret} During rotation
// X-Webhook-Event: {eventType}
// X-Webhook-Delivery-Id: {deliveryId}

// Receiver: Verify signature
var computedSignature = Convert.ToBase64String(
    new HMACSHA256(Encoding.UTF8.GetBytes(mySecret))
        .ComputeHash(Encoding.UTF8.GetBytes(requestBody))
);
bool isValid = computedSignature == request.Headers["X-Webhook-Signature"];`,
            highlightLines: [8, 9, 10],
      },

      // € Secret Rotation 
      { type: "heading", level: 2, titleKey: "features.webhookSystem.secretRotationTitle", id: "secret-rotation" },
      { type: "paragraph", contentKey: "features.webhookSystem.secretRotationIntro" },
      {
            type: "flowchart",
            title: "Secret Rotation with 24h Grace Period",
            direction: "horizontal",
            nodes: [
                  { id: "rotate", label: "POST /webhooks/{id}/rotate-secret", type: "primary" },
                  { id: "new", label: "New Secret generated", type: "success" },
                  { id: "old", label: "Old Secret â†’ PreviousSecret", type: "warning" },
                  { id: "grace", label: "PreviousSecretExpiresAt = Now + 24h", type: "info" },
                  { id: "dual", label: "Dual-sign payloads (24h)", type: "default" },
                  { id: "expire", label: "PreviousSecret = null", type: "danger" },
            ],
            connections: [
                  { from: "rotate", to: "new" },
                  { from: "rotate", to: "old" },
                  { from: "old", to: "grace" },
                  { from: "grace", to: "dual" },
                  { from: "dual", to: "expire", label: "After 24h" },
            ],
      },

      // € Tenant Hierarchy €
      { type: "heading", level: 2, titleKey: "features.webhookSystem.includeChildrenTitle", id: "include-children" },
      { type: "paragraph", contentKey: "features.webhookSystem.includeChildrenIntro" },
      {
            type: "table",
            headers: ["IncludeChildren", "Events Received", "Use Case"],
            rows: [
                  ["false (default)", "Only events from own tenant", "Single-site integration"],
                  ["true", "Events from own tenant + all descendants", "Parent company monitoring all branches"],
            ],
      },

      // € Circuit Breaker 
      { type: "heading", level: 2, titleKey: "features.webhookSystem.circuitBreakerTitle", id: "circuit-breaker" },
      { type: "paragraph", contentKey: "features.webhookSystem.circuitBreakerIntro" },
      {
            type: "flowchart",
            title: "Circuit Breaker Flow",
            direction: "vertical",
            nodes: [
                  { id: "fail", label: "Delivery fails", type: "warning" },
                  { id: "inc", label: "ConsecutiveFailures++", type: "default" },
                  { id: "check", label: "ConsecutiveFailures >= MaxConsecutiveFailures?", type: "info" },
                  { id: "no", label: "Schedule retry", type: "primary" },
                  { id: "yes", label: "IsActive = false (auto-disabled)", type: "danger" },
                  { id: "audit", label: "AuditLog: WebhookCircuitBroken", type: "warning" },
            ],
            connections: [
                  { from: "fail", to: "inc" },
                  { from: "inc", to: "check" },
                  { from: "check", to: "no", label: "No" },
                  { from: "check", to: "yes", label: "Yes" },
                  { from: "yes", to: "audit" },
            ],
      },

      // € Retry Policy 
      { type: "heading", level: 2, titleKey: "features.webhookSystem.retryTitle", id: "retry" },
      { type: "paragraph", contentKey: "features.webhookSystem.retryIntro" },
      {
            type: "table",
            headers: ["Attempt", "Delay", "Cumulative Wait"],
            rows: [
                  ["1st retry", "30 seconds", "30s"],
                  ["2nd retry", "1 minute", "1m 30s"],
                  ["3rd retry", "5 minutes", "6m 30s"],
                  ["4th retry", "30 minutes", "36m 30s"],
                  ["5th retry (final)", "2 hours", "2h 36m 30s"],
            ],
      },

      // € Delivery Logs €
      { type: "heading", level: 2, titleKey: "features.webhookSystem.deliveryLogsTitle", id: "delivery-logs" },
      { type: "paragraph", contentKey: "features.webhookSystem.deliveryLogsIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "WebhookDeliveryLog Entity",
            code: `public class WebhookDeliveryLog : AuditableEntity<Guid>
{
    public Guid SubscriptionId { get; set; }
    public string EventType { get; set; } = null!;
    public int? StatusCode { get; set; }         // null = connection failed
    public string? ResponseBody { get; set; }    // First 1000 chars
    public string? ErrorMessage { get; set; }
    public int AttemptNumber { get; set; }
    public long DurationMs { get; set; }
    public bool IsSuccess { get; set; }
}`,
            highlightLines: [5, 6, 9],
      },

      // € Events 
      { type: "heading", level: 2, titleKey: "features.webhookSystem.eventsTitle", id: "events" },
      {
            type: "table",
            headers: ["Event", "Payload", "Trigger"],
            rows: [
                  ["admin.created", "Admin details + TenantId", "New admin account created"],
                  ["admin.updated", "Changed fields + old/new values", "Admin profile modified"],
                  ["admin.deleted", "AdminId + DeletedBy", "Admin soft-deleted"],
                  ["tenant.created", "Tenant + auto-created roles", "New tenant with settings"],
                  ["tenant.updated", "Changed settings/details", "Tenant settings modified"],
                  ["tenant.deleted", "TenantId + cascade info", "Tenant soft-deleted"],
                  ["role.created", "Role + initial permissions", "New role created"],
                  ["role.permissions_changed", "Added/Removed lists", "Role permissions modified"],
                  ["audit.security_event", "EventType + metadata", "Guardian or security event"],
            ],
      },

      // € Subscription Management Endpoints 
      { type: "heading", level: 2, titleKey: "features.webhookSystem.endpointsManagementTitle", id: "management-endpoints" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/webhooks", descriptionKey: "List subscriptions (tenant-scoped)", auth: "webhooks.view" },
                  { method: "GET", path: "/api/v1/webhooks/{id}", descriptionKey: "Get subscription detail", auth: "webhooks.view" },
                  { method: "POST", path: "/api/v1/webhooks", descriptionKey: "Create subscription (with IncludeChildren, MaxRetries, MaxConsecutiveFailures)", auth: "webhooks.create" },
                  { method: "PUT", path: "/api/v1/webhooks/{id}", descriptionKey: "Update subscription URL, events, settings", auth: "webhooks.edit" },
                  { method: "DELETE", path: "/api/v1/webhooks/{id}", descriptionKey: "Delete subscription", auth: "webhooks.delete" },
            ],
      },

      // € Operations Endpoints €
      { type: "heading", level: 2, titleKey: "features.webhookSystem.endpointsOperationsTitle", id: "operations-endpoints" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/webhooks/{id}/rotate-secret", descriptionKey: "HMAC rotation with 24h grace period", auth: "webhooks.edit" },
                  { method: "PUT", path: "/api/v1/webhooks/{id}/toggle", descriptionKey: "Activate/deactivate subscription", auth: "webhooks.edit" },
                  { method: "POST", path: "/api/v1/webhooks/{id}/test", descriptionKey: "Send test ping payload", auth: "webhooks.edit" },
                  { method: "GET", path: "/api/v1/webhooks/{id}/delivery-logs", descriptionKey: "Paginated delivery history with status filter", auth: "webhooks.view" },
                  { method: "GET", path: "/api/v1/webhooks/available-events", descriptionKey: "Catalog of all subscribable event types", auth: "webhooks.view" },
            ],
      },
];

registerPage({
      slug: "features/webhook-system",
      titleKey: "features.webhookSystem.title",
      descriptionKey: "features.webhookSystem.description",
      category: "features",
      order: 6,
      sections,
      relatedSlugs: ["features/audit-system", "features/multi-tenancy"],
      lastUpdated: "2026-02-20",
});
