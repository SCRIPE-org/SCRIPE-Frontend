import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      // ─── Architecture ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.webhookSystem.architectureTitle", id: "architecture" },
      { type: "paragraph", contentKey: "features.webhookSystem.architectureIntro" },
      {
            type: "flowchart",
            direction: "vertical",
            title: "Webhook Delivery Flow",
            nodes: [
                  { id: "event", label: "Domain Event", type: "default" },
                  { id: "whs", label: "WebhookService (19KB)", type: "primary" },
                  { id: "db", label: "WebhookSubscriptions DB", type: "info" },
                  { id: "match", label: "Match event → subscriptions", type: "default" },
                  { id: "sign", label: "HMAC-SHA256 Sign Payload", type: "success" },
                  { id: "send", label: "HTTP POST to subscriber URL", type: "warning" },
                  { id: "log", label: "Log delivery", type: "success" },
                  { id: "retry", label: "Retry with exponential backoff", type: "danger" },
                  { id: "dead", label: "Dead letter log", type: "danger" },
            ],
            connections: [
                  { from: "event", to: "whs" },
                  { from: "whs", to: "db" },
                  { from: "whs", to: "match" },
                  { from: "match", to: "sign" },
                  { from: "sign", to: "send" },
                  { from: "send", to: "log", label: "Success" },
                  { from: "send", to: "retry", label: "Failure" },
                  { from: "retry", to: "dead", label: "Max retries exceeded" },
            ],
      },

      // ─── Subscription Entity ────────────────────────────
      { type: "heading", level: 2, titleKey: "features.webhookSystem.entityTitle", id: "entity" },
      {
            type: "code",
            language: "csharp",
            filename: "WebhookSubscription.cs",
            code: `public class WebhookSubscription : AuditableEntity<Guid>
{
    public string Url { get; set; }           // Subscriber endpoint
    public string Secret { get; set; }         // HMAC signing secret
    public List<string> Events { get; set; }   // ["tenant.created", "admin.blocked"]
    public bool IsActive { get; set; }
    public Guid TenantId { get; set; }
}`,
      },

      // ─── HMAC Signing ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.webhookSystem.hmacTitle", id: "hmac" },
      { type: "paragraph", contentKey: "features.webhookSystem.hmacIntro" },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Signing (Server)",
                        language: "csharp",
                        code: `var signature = ComputeHmacSha256(payload, subscription.Secret);
// Header: X-Webhook-Signature: sha256=abc123...`,
                  },
                  {
                        label: "Verification (Subscriber)",
                        language: "csharp",
                        code: `var expectedSignature = ComputeHmacSha256(requestBody, mySecret);
if (expectedSignature != request.Headers["X-Webhook-Signature"])
    return Unauthorized();`,
                  },
            ],
      },

      // ─── Retry Policy ──────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.webhookSystem.retryTitle", id: "retry" },
      {
            type: "table",
            headers: ["Attempt", "Delay", "Total Wait"],
            rows: [
                  ["1st retry", "30 seconds", "30s"],
                  ["2nd retry", "2 minutes", "2.5 min"],
                  ["3rd retry", "10 minutes", "12.5 min"],
                  ["4th retry", "30 minutes", "42.5 min"],
                  ["5th retry", "1 hour", "1h 42.5min"],
                  ["Max retries exceeded", "Dead letter", "—"],
            ],
      },

      // ─── Webhook Events ─────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.webhookSystem.eventsTitle", id: "events" },
      {
            type: "table",
            headers: ["Event", "Trigger"],
            rows: [
                  ["tenant.created", "New tenant created"],
                  ["tenant.updated", "Tenant settings changed"],
                  ["tenant.deleted", "Tenant soft-deleted"],
                  ["admin.created", "New admin added"],
                  ["admin.blocked", "Admin blocked"],
                  ["admin.unblocked", "Admin unblocked"],
                  ["user.created", "New user registered"],
                  ["role.updated", "Role permissions changed"],
            ],
      },

      // ─── Controller Endpoints ───────────────────────────
      { type: "heading", level: 2, titleKey: "features.webhookSystem.endpointsTitle", id: "endpoints" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/webhooks", description: "List subscriptions", auth: "JWT" },
                  { method: "POST", path: "/api/webhooks", description: "Create subscription", auth: "JWT" },
                  { method: "PUT", path: "/api/webhooks/{id}", description: "Update subscription", auth: "JWT" },
                  { method: "DELETE", path: "/api/webhooks/{id}", description: "Delete subscription", auth: "JWT" },
                  { method: "POST", path: "/api/webhooks/{id}/test", description: "Test webhook delivery", auth: "JWT" },
                  { method: "GET", path: "/api/webhooks/{id}/deliveries", description: "View delivery history", auth: "JWT" },
            ],
      },
];

registerPage({
      slug: "features/webhook-system",
      titleKey: "features.webhookSystem.title",
      descriptionKey: "features.webhookSystem.description",
      category: "features",
      order: 7,
      sections,
      relatedSlugs: ["features/notification-system", "features/email-system"],
      lastUpdated: "2026-02-20",
});
