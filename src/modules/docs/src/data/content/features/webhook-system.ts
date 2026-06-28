// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ── Architecture Section ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.webhookSystem.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Webhook Delivery & Signature Verification Flow",
    nodes: [
      { id: "webhook_event", label: "Domain Event Triggered", type: "default" },
      { id: "resolver", label: "Match active WebhookSubscriptions", type: "primary" },
      { id: "payload_check", label: "NFR-02: Size Check & Truncation", type: "info" },
      { id: "ssrf_filter", label: "SSRF URL Verification", type: "danger" },
      { id: "hmac_compute", label: "Compute HMAC-SHA256 Signature", type: "success" },
      { id: "prev_secret_check", label: "PreviousSecret Exists & Not Expired?", type: "info" },
      { id: "dual_sign", label: "Dual-Sign (Generate secondary signature)", type: "warning" },
      { id: "client_post", label: "HTTP POST (30s timeout)", type: "warning" },
      { id: "receiver_verify", label: "Receiver Signature Verification", type: "success" },
      { id: "retry_logic", label: "WebhookRetryJob (Backoff queues)", type: "danger" },
    ],
    connections: [
      { from: "webhook_event", to: "resolver" },
      { from: "resolver", to: "payload_check" },
      { from: "payload_check", to: "ssrf_filter" },
      { from: "ssrf_filter", to: "hmac_compute", label: "URL resolved & allowed" },
      { from: "hmac_compute", to: "prev_secret_check" },
      { from: "prev_secret_check", to: "dual_sign", label: "Yes (rotation active)" },
      { from: "prev_secret_check", to: "client_post", label: "No (regular state)" },
      { from: "dual_sign", to: "client_post" },
      { from: "client_post", to: "receiver_verify", label: "Request dispatched" },
      { from: "client_post", to: "retry_logic", label: "Failed attempt (non-2xx / timeout)" },
    ],
  },

  // ── Entity Details Section ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.entityTitle",
    id: "entity",
  },
  {
    type: "code",
    language: "csharp",
    filename: "WebhookSubscription.cs",
    code: `public class WebhookSubscription : AuditableEntity
{
    public Guid Id { get; set; }
    
    [Required] [MaxLength(500)]
    public string Url { get; set; } = string.Empty;       // Allowed HTTPS destination URL
    
    [Required] [MaxLength(100)]
    public string Secret { get; set; } = string.Empty;    // HMAC signature key
    
    [MaxLength(100)]
    public string? PreviousSecret { get; set; }           // Temporary old key
    public DateTime? PreviousSecretExpiresAt { get; set; } // 24-hour grace period threshold
    
    public bool IsActive { get; set; } = true;            // Toggle state (disabled by circuit breaker)
    public string EventsJson { get; set; } = "[]";        // Subscribed event types JSON array
    public WebhookScope Scope { get; set; }               // Scope filter settings
    
    public int MaxRetries { get; set; } = 4;              // Max retry attempts
    public int MaxConsecutiveFailures { get; set; } = 10; // Circuit breaker threshold
    public int ConsecutiveFailures { get; set; } = 0;     // Consecutive failure counter
    
    public Guid? TenantId { get; set; }                   // Owning tenant ID context
    public virtual Tenant? Tenant { get; set; }
}`,
  },

  // ── HMAC Signature Check ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.hmacTitle",
    id: "hmac",
  },
  { type: "paragraph", contentKey: "features.webhookSystem.hmacIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "WebhookSignatureVerification.cs",
    code: `// Server-side: Sign payload with timestamp prefix
long timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
string signatureInput = $"{timestamp}.{payloadJson}";
using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(subscription.Secret));
byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(signatureInput));
string signature = $"sha256={Convert.ToHexString(hashBytes).ToLowerInvariant()}";

// Dispatched HTTP Headers:
// X-Webhook-Signature: sha256={hash}
// X-Webhook-Signature-Old: sha256={oldHash} (only during secret rotation)
// X-Webhook-Timestamp: {timestamp}
// X-Webhook-Event: {eventType}
// X-Webhook-Delivery: {eventDeliveryId} (same for all retries)
// X-Webhook-Attempt: {attemptNumber}

// Receiver: Reconstruct signature input & verify
string receivedSignature = request.Headers["X-Webhook-Signature"];
string receivedTimestamp = request.Headers["X-Webhook-Timestamp"];
string requestBody = await ReadBodyAsStringAsync(request);

string computedInput = $"{receivedTimestamp}.{requestBody}";
using var verifierHmac = new HMACSHA256(Encoding.UTF8.GetBytes(mySecret));
byte[] computedHash = verifierHmac.ComputeHash(Encoding.UTF8.GetBytes(computedInput));
string computedSignature = $"sha256={Convert.ToHexString(computedHash).ToLowerInvariant()}";

bool isValid = CryptographicOperations.FixedTimeEquals(
    Encoding.UTF8.GetBytes(computedSignature),
    Encoding.UTF8.GetBytes(receivedSignature)
);`,
  },

  // ── Secret Rotation ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.secretRotationTitle",
    id: "secret-rotation",
  },
  { type: "paragraph", contentKey: "features.webhookSystem.secretRotationIntro" },
  {
    type: "flowchart",
    title: "Secret Rotation 24-Hour Grace Period Lifecycle",
    direction: "horizontal",
    nodes: [
      { id: "rotate", label: "POST /rotate-secret", type: "primary" },
      { id: "backup", label: "PreviousSecret = current Secret", type: "info" },
      { id: "expiry", label: "Set PreviousSecretExpiresAt = Now + 24h", type: "info" },
      { id: "generate", label: "Secret = new Secret", type: "success" },
      { id: "dual_sign", label: "Dual-sign payloads in dispatcher", type: "warning" },
      { id: "purge", label: "WebhookRetryJob removes expired PreviousSecrets", type: "danger" },
    ],
    connections: [
      { from: "rotate", to: "backup" },
      { from: "backup", to: "expiry" },
      { from: "expiry", to: "generate" },
      { from: "generate", to: "dual_sign", label: "Active transition" },
      { from: "dual_sign", to: "purge", label: "After 24 hours" },
    ],
  },

  // ── Tenant Hierarchy & Scopes ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.includeChildrenTitle",
    id: "include-children",
  },
  { type: "paragraph", contentKey: "features.webhookSystem.includeChildrenIntro" },
  {
    type: "table",
    headers: ["Webhook Scope Type", "TenantId Context", "Event Filtering Logic", "Common Use Case"],
    rows: [
      [
        "PlatformOnly",
        "null",
        "Receives events from the platform level only (TenantId = null)",
        "Global analytics / tenant management engines",
      ],
      [
        "AllTenants",
        "null / non-null",
        "Receives all events across all tenants in the system",
        "Super-admin audits & monitoring dashboard",
      ],
      [
        "TenantOnly",
        "non-null",
        "Receives events originating strictly from own tenant context",
        "Single tenant custom automation hooks",
      ],
      [
        "TenantWithChildren",
        "non-null",
        "Receives events from own tenant and all descendant tenants",
        "Parent companies monitoring branch subsidiaries",
      ],
    ],
  },

  // ── Circuit Breaker Section ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.circuitBreakerTitle",
    id: "circuit-breaker",
  },
  { type: "paragraph", contentKey: "features.webhookSystem.circuitBreakerIntro" },
  {
    type: "flowchart",
    title: "Webhook Circuit Breaker & Auto-Disable Logic",
    direction: "vertical",
    nodes: [
      { id: "deliver", label: "DeliverAsync execution", type: "default" },
      { id: "is_success", label: "Delivery successful (HTTP 2xx)?", type: "info" },
      { id: "reset_count", label: "Reset ConsecutiveFailures = 0", type: "success" },
      { id: "inc_count", label: "ConsecutiveFailures++", type: "warning" },
      { id: "check_breaker", label: "ConsecutiveFailures >= Max?", type: "info" },
      { id: "disable", label: "IsActive = false (Auto-Disabled)", type: "danger" },
      { id: "audit_log", label: "Log security event (WebhookCircuitBroken)", type: "danger" },
    ],
    connections: [
      { from: "deliver", to: "is_success" },
      { from: "is_success", to: "reset_count", label: "Yes" },
      { from: "is_success", to: "inc_count", label: "No" },
      { from: "inc_count", to: "check_breaker" },
      { from: "check_breaker", to: "disable", label: "Yes" },
      { from: "disable", to: "audit_log" },
    ],
  },

  // ── Retry Policy Section ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.retryTitle",
    id: "retry",
  },
  { type: "paragraph", contentKey: "features.webhookSystem.retryIntro" },
  {
    type: "table",
    headers: ["Retry Attempt", "Delay Offset", "Cumulative Retries Timeline", "Mechanism Details"],
    rows: [
      ["Initial Attempt", "Immediate", "0 seconds", "Dispatched synchronously in command pipeline"],
      [
        "1st Retry",
        "10 seconds",
        "10 seconds",
        "Queued as DeliveryStatus.Retrying, processed by WebhookRetryJob",
      ],
      ["2nd Retry", "60 seconds", "1 minute 10s", "Scheduled with exponential delay offset"],
      ["3rd Retry", "5 minutes", "6 minutes 10s", "Scheduled with exponential delay offset"],
      ["4th Retry (Final)", "30 minutes", "36 minutes 10s", "Last attempt before dead-lettering"],
      [
        "Exhausted",
        "No further retry",
        "Dead-lettered",
        "Status = DeadLettered, increments subscription.FailedDeliveries",
      ],
    ],
  },

  // ── Delivery Logs Details ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.deliveryLogsTitle",
    id: "delivery-logs",
  },
  { type: "paragraph", contentKey: "features.webhookSystem.deliveryLogsIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "WebhookDeliveryLog.cs",
    code: `public class WebhookDeliveryLog
{
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; }
    public Guid EventDeliveryId { get; set; }     // Matches across all retry attempts for de-duplication
    public Guid? EventTenantId { get; set; }       // Tenant context of origin event
    public string EventType { get; set; } = "";
    public string PayloadJson { get; set; } = "";
    
    public string RequestUrl { get; set; } = "";
    public string? RequestHeaders { get; set; }    // JSON string of headers (excluding secrets)
    public int HttpStatusCode { get; set; }        // HTTP response status code (0 for connection issues)
    public string? ResponseBody { get; set; }      // Snapped response snippet (max 2048 chars)
    
    public int AttemptNumber { get; set; }         // Attempt index: 1, 2, 3, etc.
    public double LatencyMs { get; set; }          // Network latency timing
    public bool IsSuccess { get; set; }            // Status flag: HTTP status 2xx
    public string? ErrorMessage { get; set; }      // Network error snippet (if any)
    public DeliveryStatus Status { get; set; }     // State enum: Delivered, Retrying, DeadLettered
    public DateTime CreatedAt { get; set; }
}`,
  },

  // ── Event Types Catalog ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.eventsTitle",
    id: "events",
  },
  {
    type: "table",
    headers: ["Subscribable Event Type", "Payload Attributes", "Trigger Point Description"],
    rows: [
      [
        "admin.created",
        "Admin ID, Username, Email, TenantId context",
        "Triggered when a new administrator is registered",
      ],
      [
        "admin.updated",
        "Modified property changes, old and new values",
        "Triggered when administrator profile changes are saved",
      ],
      [
        "admin.deleted",
        "Admin ID, Soft-delete timestamp, DeletedBy user",
        "Triggered when administrator account is soft-deleted",
      ],
      [
        "tenant.created",
        "Tenant details, plan setting overrides",
        "Triggered when a new tenant/workspace is registered",
      ],
      [
        "tenant.updated",
        "Modified settings or billing preferences",
        "Triggered when workspace configuration is updated",
      ],
      [
        "tenant.deleted",
        "Tenant ID, cascade deletion results status",
        "Triggered when a workspace is soft-deleted",
      ],
      [
        "role.created",
        "Role ID, assigned permissions array list",
        "Triggered when a new user role is created",
      ],
      [
        "role.permissions_changed",
        "Added permissions list, revoked permissions list",
        "Triggered when permission scopes are modified on a role",
      ],
      [
        "audit.security_event",
        "Security event type, host IP, actor details",
        "Triggered on unauthorized actions or guardian blocks",
      ],
    ],
  },

  // ── Subscription Management Endpoints ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.endpointsManagementTitle",
    id: "management-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/webhooks",
        descriptionKey: "List all subscriptions (tenant-scoped)",
        auth: "JWT",
        permission: "webhooks.view",
      },
      {
        method: "GET",
        path: "/api/v1/webhooks/{id}",
        descriptionKey: "Get subscription details (including stats and state)",
        auth: "JWT",
        permission: "webhooks.view",
      },
      {
        method: "POST",
        path: "/api/v1/webhooks",
        descriptionKey: "Create subscription (configurable url, events list, scope filters)",
        auth: "JWT",
        permission: "webhooks.create",
      },
      {
        method: "PUT",
        path: "/api/v1/webhooks/{id}",
        descriptionKey: "Update subscription URL, events catalog list, or status",
        auth: "JWT",
        permission: "webhooks.edit",
      },
      {
        method: "DELETE",
        path: "/api/v1/webhooks/{id}",
        descriptionKey: "Permanently remove a webhook subscription",
        auth: "JWT",
        permission: "webhooks.delete",
      },
    ],
  },

  // ── Operations Monitoring Endpoints ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.webhookSystem.endpointsOperationsTitle",
    id: "operations-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/webhooks/{id}/rotate-secret",
        descriptionKey: "Trigger secret rotation with a 24-hour grace period",
        auth: "JWT",
        permission: "webhooks.edit",
      },
      {
        method: "PUT",
        path: "/api/v1/webhooks/{id}/toggle",
        descriptionKey: "Manually enable/disable subscription (resets circuit breaker)",
        auth: "JWT",
        permission: "webhooks.edit",
      },
      {
        method: "POST",
        path: "/api/v1/webhooks/{id}/test",
        descriptionKey: "Dispatch a 'webhook.test' ping payload immediately without retries",
        auth: "JWT",
        permission: "webhooks.edit",
      },
      {
        method: "GET",
        path: "/api/v1/webhooks/{id}/delivery-logs",
        descriptionKey: "Get paginated delivery logs (filtering by status, latency)",
        auth: "JWT",
        permission: "webhooks.view",
      },
      {
        method: "GET",
        path: "/api/v1/webhooks/available-events",
        descriptionKey: "Get the complete catalog of subscribable event types",
        auth: "JWT",
        permission: "webhooks.view",
      },
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
  lastUpdated: "2026-06-28",
});
