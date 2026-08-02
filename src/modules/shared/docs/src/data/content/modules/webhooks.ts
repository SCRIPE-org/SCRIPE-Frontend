// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.webhooks.intro" },

  // ─── Engine Architecture ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.webhooks.engineTitle",
    id: "engine",
  },
  { type: "paragraph", contentKey: "modules.webhooks.engineContent" },
  {
    type: "flowchart",
    title: "Webhook Dispatch Flow",
    direction: "vertical",
    nodes: [
      { id: "n1", label: "Domain Event Raised", type: "default" },
      { id: "n2", label: "WebhookDispatcher (INotificationHandler)", type: "primary" },
      { id: "n3", label: "Lookup Active Tenant Webhooks (filtered by EventType)", type: "info" },
      { id: "n4", label: "HTTP POST to Endpoint URL", type: "default" },
      { id: "n5", label: "Success (2xx)", type: "success" },
      { id: "n6", label: "Failure (non-2xx or timeout)", type: "danger" },
      { id: "n7", label: "Queue to WebhookDeliveryAttempts", type: "warning" },
    ],
    connections: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n4" },
      { from: "n4", to: "n5", label: "2xx" },
      { from: "n4", to: "n6", label: "non-2xx" },
      { from: "n6", to: "n7" },
    ],
  },

  // ─── Webhook Payload Format ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.webhooks.payloadTitle",
    id: "payload",
  },
  { type: "paragraph", contentKey: "modules.webhooks.payloadContent" },
  {
    type: "code",
    language: "json",
    filename: "Webhook Payload Envelope",
    code: `{
  "id": "evt_01HXZ8FQ2N4JMKRV9C3T6S7YBW",
  "type": "admin.created",
  "timestamp": "2026-06-28T14:30:00.000Z",
  "tenantId": "enc_a1b2c3d4e5",
  "data": {
    "id": "enc_f6g7h8i9j0",
    "email": "admin@company.com",
    "name": "Alice Johnson",
    "createdAt": "2026-06-28T14:30:00.000Z"
  }
}`,
  },
  {
    type: "code",
    language: "csharp",
    filename: "Signature Verification (C# Receiving Server)",
    code: `// Verify the X-Scripe-Signature header on your webhook receiver
public static bool VerifySignature(
    string rawBody,
    string receivedSignature,
    string secretKey)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
    var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody));
    var computed = Convert.ToHexString(hash).ToLower();

    // Constant-time comparison — prevents timing attacks
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(computed),
        Encoding.UTF8.GetBytes(receivedSignature));
}`,
  },

  // ─── Retry & Backoff Schedule ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.webhooks.retryTitle",
    id: "retry",
  },
  { type: "paragraph", contentKey: "modules.webhooks.retryContent" },
  {
    type: "table",
    headers: ["Attempt #", "Delay After Previous", "Cumulative Wait"],
    rows: [
      ["1 (initial)", "0 min", "Immediate"],
      ["2", "5 min", "5 min"],
      ["3", "30 min", "35 min"],
      ["4", "2 h", "~2 h 35 min"],
      ["5", "8 h", "~11 h"],
      ["6 (final)", "24 h", "~35 h — marks Abandoned"],
    ],
  },

  // ─── Security: Signature Verification ────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.webhooks.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "modules.webhooks.securityContent" },
  {
    type: "info",
    variant: "caution",
    contentKey: "modules.webhooks.signatureWarning",
  },

  // ─── Registering a Webhook ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.webhooks.registeringTitle",
    id: "registering",
  },
  {
    type: "table",
    headers: ["Method", "Endpoint", "Description"],
    rows: [
      ["GET", "/api/webhooks", "List all registered webhooks for the tenant"],
      ["POST", "/api/webhooks", "Register a new webhook endpoint"],
      ["PUT", "/api/webhooks/{id}", "Update endpoint URL or event filter"],
      ["DELETE", "/api/webhooks/{id}", "Remove a webhook registration"],
      ["POST", "/api/webhooks/{id}/test", "Send a test ping to the endpoint"],
    ],
  },
];

registerPage({
  slug: "modules/webhooks",
  titleKey: "modules.webhooks.title",
  descriptionKey: "modules.webhooks.description",
  category: "modules",
  order: 6,
  sections,
  relatedSlugs: [
    "modules/security-monitoring",
    "modules/marketplace",
    "architecture/domain-events",
  ],
  lastUpdated: "2026-06-28",
});
