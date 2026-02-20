import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.webhookIntegration.intro" },

      // ─── Available Events ───────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.eventsTitle", id: "events" },
      {
            type: "table",
            headers: ["Event", "Trigger", "Payload"],
            rows: [
                  ["user.created", "New user registration", "User details, tenant, role"],
                  ["user.updated", "User profile change", "Changed fields, before/after"],
                  ["user.deleted", "User soft-deleted", "User ID, tenant, timestamp"],
                  ["tenant.created", "New tenant provisioned", "Tenant settings, parent"],
                  ["tenant.deactivated", "Tenant suspended", "Tenant ID, reason, timestamp"],
                  ["role.permissions.changed", "Permission assignment", "Role, added/removed permissions"],
                  ["entity.created/updated/deleted", "Any entity CRUD", "Entity type, ID, changes"],
                  ["auth.login.failed", "Failed login attempt", "Email, IP, attempt count"],
            ],
      },

      // ─── Security ──────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.securityTitle", id: "security" },
      { type: "paragraph", contentKey: "commercial.webhookIntegration.securityContent" },
      {
            type: "code",
            language: "text",
            filename: "Webhook Delivery Security",
            code: `POST /your-webhook-endpoint HTTP/1.1
Content-Type: application/json
X-Webhook-Signature: sha256=abc123...
X-Webhook-Id: evt_abc123
X-Webhook-Timestamp: 2026-02-20T12:00:00Z

{
  "event": "user.created",
  "timestamp": "2026-02-20T12:00:00Z",
  "tenantId": "tenant_123",
  "data": { ... }
}

// Verify: HMAC-SHA256(secret, body) == X-Webhook-Signature`,
      },

      // ─── Retry Policy ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.retryTitle", id: "retry" },
      { type: "paragraph", contentKey: "commercial.webhookIntegration.retryContent" },
      {
            type: "table",
            headers: ["Attempt", "Delay", "Timeout"],
            rows: [
                  ["1st", "Immediate", "30 seconds"],
                  ["2nd", "1 minute", "30 seconds"],
                  ["3rd", "5 minutes", "30 seconds"],
                  ["4th", "30 minutes", "30 seconds"],
                  ["5th", "2 hours", "30 seconds"],
                  ["6th (final)", "12 hours", "30 seconds"],
            ],
      },

      // ─── Delivery Logs ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.logsTitle", id: "logs" },
      {
            type: "table",
            headers: ["Log Field", "Description"],
            rows: [
                  ["Event ID", "Unique identifier for the webhook delivery"],
                  ["Status", "Pending, Delivered, Failed, Retrying"],
                  ["HTTP Status", "Response code from your endpoint"],
                  ["Duration", "Time taken for delivery (ms)"],
                  ["Attempt #", "Current retry attempt number"],
                  ["Response Body", "First 500 chars of response (for debugging)"],
            ],
      },

      // ─── Management API ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.managementTitle", id: "management" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/webhooks", descriptionKey: "List subscriptions", auth: "Required", permission: "Webhooks.View" },
                  { method: "POST", path: "/api/webhooks", descriptionKey: "Create subscription", auth: "Required", permission: "Webhooks.Create" },
                  { method: "PUT", path: "/api/webhooks/{id}", descriptionKey: "Update subscription", auth: "Required", permission: "Webhooks.Update" },
                  { method: "DELETE", path: "/api/webhooks/{id}", descriptionKey: "Delete subscription", auth: "Required", permission: "Webhooks.Delete" },
                  { method: "POST", path: "/api/webhooks/{id}/test", descriptionKey: "Send test event", auth: "Required", permission: "Webhooks.View" },
                  { method: "GET", path: "/api/webhooks/{id}/logs", descriptionKey: "View delivery logs", auth: "Required", permission: "Webhooks.View" },
            ],
      },
];

registerPage({
      slug: "commercial/webhook-integration",
      titleKey: "commercial.webhookIntegration.title",
      descriptionKey: "commercial.webhookIntegration.description",
      category: "commercial-integration",
      order: 2,
      sections,
      relatedSlugs: ["commercial/rest-api-overview", "commercial/email-integration"],
      lastUpdated: "2026-02-20",
});
