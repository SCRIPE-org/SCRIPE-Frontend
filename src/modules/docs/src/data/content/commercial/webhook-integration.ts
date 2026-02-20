import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.webhookIntegration.intro" },
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.eventsTitle", id: "events" },
      {
            type: "table",
            headers: ["Event", "Trigger", "Payload"],
            rows: [
                  ["user.created", "New user registration", "User details, tenant, role"],
                  ["user.updated", "User profile change", "Changed fields, before/after"],
                  ["tenant.created", "New tenant provisioned", "Tenant settings, parent"],
                  ["tenant.deactivated", "Tenant suspended", "Tenant ID, reason, timestamp"],
                  ["role.permissions.changed", "Permission assignment", "Role, added/removed permissions"],
                  ["entity.created/updated/deleted", "Any entity CRUD", "Entity type, ID, changes"],
            ],
      },
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
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.retryTitle", id: "retry" },
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
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.managementTitle", id: "management" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/webhooks", description: "List subscriptions", auth: true, permission: "Webhooks.View" },
                  { method: "POST", path: "/api/webhooks", description: "Create subscription", auth: true, permission: "Webhooks.Create" },
                  { method: "PUT", path: "/api/webhooks/{id}", description: "Update subscription", auth: true, permission: "Webhooks.Update" },
                  { method: "DELETE", path: "/api/webhooks/{id}", description: "Delete subscription", auth: true, permission: "Webhooks.Delete" },
                  { method: "POST", path: "/api/webhooks/{id}/test", description: "Send test event", auth: true, permission: "Webhooks.View" },
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
