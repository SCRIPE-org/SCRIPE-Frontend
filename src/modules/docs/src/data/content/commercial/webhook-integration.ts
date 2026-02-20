import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.webhookIntegration.intro" },
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.eventsTitle", id: "webhook-events" },
      {
            type: "table", headers: ["Event", "Trigger", "Payload Contains"], rows: [
                  ["admin.created", "New admin registered", "Admin ID, name, email, tenant"],
                  ["admin.updated", "Admin profile changed", "Admin ID, changed fields"],
                  ["admin.deleted", "Admin soft-deleted", "Admin ID, deleted by"],
                  ["admin.blocked", "Admin deactivated", "Admin ID, blocked by"],
                  ["role.created", "New role created", "Role ID, name, tenant"],
                  ["role.updated", "Role permissions changed", "Role ID, new permissions"],
                  ["tenant.created", "New tenant created", "Tenant ID, name, parent"],
                  ["tenant.deleted", "Tenant soft-deleted", "Tenant ID, deleted by"],
                  ["auth.login", "Successful login", "Admin ID, IP, user agent"],
                  ["auth.failed", "Failed login attempt", "Email, IP, failure reason"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.managementTitle", id: "subscription-management" },
      {
            type: "table", headers: ["Method", "Endpoint", "Purpose"], rows: [
                  ["GET", "/webhooks", "List subscriptions"],
                  ["GET", "/webhooks/{id}", "Subscription detail + delivery history"],
                  ["POST", "/webhooks", "Create subscription"],
                  ["PUT", "/webhooks/{id}", "Update subscription"],
                  ["DELETE", "/webhooks/{id}", "Delete subscription"],
                  ["POST", "/webhooks/{id}/test", "Send test ping"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.createTitle", id: "create-subscription" },
      {
            type: "code", language: "json", filename: "Create Webhook Subscription",
            code: `POST /api/v1/webhooks
{
  "url": "https://your-app.com/webhooks/nexora",
  "events": ["admin.created", "admin.deleted", "role.updated"],
  "secret": "your-hmac-secret-key",
  "isActive": true,
  "description": "HR system integration"
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.hmacTitle", id: "hmac-verification" },
      { type: "paragraph", contentKey: "commercial.webhookIntegration.hmacIntro" },
      {
            type: "code", language: "python", filename: "Verify Webhook Signature (Python)",
            code: `import hmac, hashlib

def verify_webhook(payload_body, signature_header, secret):
    expected = hmac.new(secret.encode(), payload_body, hashlib.sha256).hexdigest()
    received = signature_header.replace("sha256=", "")
    return hmac.compare_digest(expected, received)`,
      },
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.retryTitle", id: "retry-policy" },
      {
            type: "table", headers: ["Attempt", "Delay", "Total Wait"], rows: [
                  ["1st retry", "10 seconds", "10s"],
                  ["2nd retry", "30 seconds", "40s"],
                  ["3rd retry", "1 minute", "1m 40s"],
                  ["4th retry", "5 minutes", "6m 40s"],
                  ["5th retry", "15 minutes", "21m 40s"],
                  ["Final failure", "—", "Marked as permanently failed"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.webhookIntegration.payloadTitle", id: "payload-format" },
      {
            type: "code", language: "json", filename: "Webhook Delivery Payload",
            code: `{
  "id": "evt-550e8400-...",
  "event": "admin.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "tenantId": "660e8400-...",
  "data": {
    "adminId": "770e8400-...",
    "name": "John Doe",
    "email": "john@acme.com",
    "createdBy": "880e8400-..."
  }
}`,
      },
];

registerPage({
      slug: "commercial/webhook-integration",
      titleKey: "commercial.webhookIntegration.title",
      descriptionKey: "commercial.webhookIntegration.description",
      category: "commercial-integration",
      order: 2,
      sections,
      relatedSlugs: ["commercial/rest-api", "commercial/email-templates"],
      lastUpdated: "2026-02-19",
});
