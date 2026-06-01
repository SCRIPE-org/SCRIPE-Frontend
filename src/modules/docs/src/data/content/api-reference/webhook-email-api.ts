import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.webhookEmailApi.intro" },

  // ─── Webhooks ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.webhookEmailApi.webhooksTitle",
    id: "webhooks",
  },
  { type: "paragraph", contentKey: "apiReference.webhookEmailApi.webhooksIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/webhooks",
        descriptionKey: "apiReference.webhookEmailApi.listWebhooksDesc",
        auth: "webhooks.view",
      },
      {
        method: "POST",
        path: "/api/v1/webhooks",
        descriptionKey: "apiReference.webhookEmailApi.createWebhookDesc",
        auth: "webhooks.create",
      },
      {
        method: "PUT",
        path: "/api/v1/webhooks/{id}",
        descriptionKey: "apiReference.webhookEmailApi.updateWebhookDesc",
        auth: "webhooks.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/webhooks/{id}",
        descriptionKey: "apiReference.webhookEmailApi.deleteWebhookDesc",
        auth: "webhooks.delete",
      },
      {
        method: "POST",
        path: "/api/v1/webhooks/{id}/test",
        descriptionKey: "apiReference.webhookEmailApi.testWebhookDesc",
        auth: "webhooks.update",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Create Webhook",
        language: "json",
        filename: "POST /webhooks — Request",
        code: `{
  "url": "https://api.example.com/webhooks/scripe",
  "secret": "whsec_a1b2c3d4e5f6...",
  "events": [
    "admin.created",
    "admin.updated",
    "admin.deleted",
    "user.registered",
    "tenant.settings_changed"
  ],
  "isActive": true,
  "description": "Sync admin changes to external system"
}`,
      },
      {
        label: "Webhook Payload",
        language: "json",
        filename: "Webhook Delivery Payload",
        code: `// POST to subscriber URL
{
  "id": "event-uuid",
  "type": "admin.created",
  "timestamp": "2026-02-20T15:30:00Z",
  "tenantId": "tenant-uuid",
  "data": {
    "adminId": "admin-uuid",
    "email": "new-admin@acme.com",
    "firstName": "John",
    "role": "Manager"
  },
  "signature": "sha256=abc123..."
}

// Headers:
// X-Webhook-Signature: sha256=HMAC(secret, body)
// X-Webhook-Id: event-uuid
// X-Webhook-Retry: 0`,
      },
    ],
  },
  {
    type: "table",
    headers: ["Event Type", "Trigger", "Data Fields"],
    rows: [
      ["admin.created", "New admin registered", "adminId, email, role, tenantId"],
      ["admin.updated", "Admin profile changed", "adminId, changedFields"],
      ["admin.deleted", "Admin soft-deleted", "adminId, deletedBy"],
      ["admin.blocked", "Admin account blocked", "adminId, blockedBy, reason"],
      ["user.registered", "New user registration", "userId, email, tenantId"],
      ["user.verified", "Email/phone verified", "userId, verificationType"],
      ["tenant.created", "New tenant created", "tenantId, name, parentId"],
      ["tenant.settings_changed", "Tenant settings updated", "tenantId, changedSettings"],
      ["role.permissions_changed", "Role permissions modified", "roleId, addedPerms, removedPerms"],
      ["security.login_failed", "Failed login attempt", "email, ip, attempts"],
      ["security.account_locked", "Account locked out", "userId, lockoutEnd"],
    ],
  },

  // ─── Email System ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.webhookEmailApi.emailTitle",
    id: "email-system",
  },
  { type: "paragraph", contentKey: "apiReference.webhookEmailApi.emailIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/emails",
        descriptionKey: "apiReference.webhookEmailApi.listEmailsDesc",
        auth: "emails.view",
      },
      {
        method: "POST",
        path: "/api/v1/emails/send",
        descriptionKey: "apiReference.webhookEmailApi.sendEmailDesc",
        auth: "emails.send",
      },
      {
        method: "POST",
        path: "/api/v1/emails/send-bulk",
        descriptionKey: "apiReference.webhookEmailApi.sendBulkDesc",
        auth: "emails.send",
      },
      {
        method: "DELETE",
        path: "/api/v1/emails/{id}/cancel",
        descriptionKey: "apiReference.webhookEmailApi.cancelEmailDesc",
        auth: "emails.send",
      },
      {
        method: "POST",
        path: "/api/v1/emails/{id}/resend",
        descriptionKey: "apiReference.webhookEmailApi.resendEmailDesc",
        auth: "emails.send",
      },
      {
        method: "GET",
        path: "/api/v1/emails/stats",
        descriptionKey: "apiReference.webhookEmailApi.emailStatsDesc",
        auth: "emails.view",
      },
      {
        method: "GET",
        path: "/api/v1/emails/search-recipients",
        descriptionKey: "apiReference.webhookEmailApi.searchRecipientsDesc",
        auth: "emails.send",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Send Email",
        language: "json",
        filename: "POST /emails/send — Request",
        code: `{
  "to": "user@example.com",
  "subject": "Welcome to SCRIPE",
  "templateId": "template-uuid",
  "variables": {
    "name": "Alice Johnson",
    "companyName": "Acme Corp",
    "activationUrl": "https://app.scripe.dev/activate?token=..."
  },
  "priority": "high",
  "scheduledAt": null
}`,
      },
      {
        label: "Send Bulk",
        language: "json",
        filename: "POST /emails/send-bulk — Request",
        code: `{
  "templateId": "template-uuid",
  "recipients": [
    {
      "email": "user1@example.com",
      "variables": { "name": "User 1" }
    },
    {
      "email": "user2@example.com",
      "variables": { "name": "User 2" }
    }
  ],
  "filter": {
    "roleId": "role-uuid",
    "isActive": true
  }
}`,
      },
    ],
  },

  // ─── Message Templates ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.webhookEmailApi.templatesTitle",
    id: "message-templates",
  },
  { type: "paragraph", contentKey: "apiReference.webhookEmailApi.templatesIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/message-templates",
        descriptionKey: "apiReference.webhookEmailApi.listTemplatesDesc",
        auth: "templates.view",
      },
      {
        method: "GET",
        path: "/api/v1/message-templates/{id}",
        descriptionKey: "apiReference.webhookEmailApi.getTemplateDesc",
        auth: "templates.view",
      },
      {
        method: "POST",
        path: "/api/v1/message-templates",
        descriptionKey: "apiReference.webhookEmailApi.createTemplateDesc",
        auth: "templates.create",
      },
      {
        method: "PUT",
        path: "/api/v1/message-templates/{id}",
        descriptionKey: "apiReference.webhookEmailApi.updateTemplateDesc",
        auth: "templates.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/message-templates/{id}",
        descriptionKey: "apiReference.webhookEmailApi.deleteTemplateDesc",
        auth: "templates.delete",
      },
      {
        method: "POST",
        path: "/api/v1/message-templates/{id}/preview",
        descriptionKey: "apiReference.webhookEmailApi.previewTemplateDesc",
        auth: "templates.view",
      },
      {
        method: "POST",
        path: "/api/v1/message-templates/{id}/render",
        descriptionKey: "apiReference.webhookEmailApi.renderTemplateDesc",
        auth: "templates.view",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "Message Template Example",
    code: `{
  "id": "template-uuid",
  "name": "welcome-admin",
  "subject": "Welcome to {{companyName}}!",
  "bodyHtml": "<h1>Hello {{name}}</h1><p>Welcome to {{companyName}}...</p>",
  "bodyText": "Hello {{name}}, Welcome to {{companyName}}...",
  "engine": "scriban",
  "variables": ["name", "companyName", "activationUrl"],
  "category": "onboarding",
  "isActive": true
}
// Template engine: Scriban (Liquid-compatible)
// Variables use {{variableName}} syntax`,
  },

  // ─── Notifications ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.webhookEmailApi.notificationsTitle",
    id: "notifications",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/notifications",
        descriptionKey: "apiReference.webhookEmailApi.listNotificationsDesc",
        auth: "Bearer Token",
      },
      {
        method: "GET",
        path: "/api/v1/notifications/unread-count",
        descriptionKey: "apiReference.webhookEmailApi.unreadCountDesc",
        auth: "Bearer Token",
      },
      {
        method: "PUT",
        path: "/api/v1/notifications/{id}/read",
        descriptionKey: "apiReference.webhookEmailApi.markReadDesc",
        auth: "Bearer Token",
      },
      {
        method: "PUT",
        path: "/api/v1/notifications/read-all",
        descriptionKey: "apiReference.webhookEmailApi.markAllReadDesc",
        auth: "Bearer Token",
      },
      {
        method: "DELETE",
        path: "/api/v1/notifications/{id}",
        descriptionKey: "apiReference.webhookEmailApi.deleteNotifDesc",
        auth: "Bearer Token",
      },
      {
        method: "GET",
        path: "/api/v1/notifications/search-targets",
        descriptionKey: "apiReference.webhookEmailApi.searchTargetsDesc",
        auth: "notifications.send",
      },
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "apiReference.webhookEmailApi.signalrTip",
  },
];

registerPage({
  slug: "api-reference/webhook-email-api",
  titleKey: "apiReference.webhookEmailApi.title",
  descriptionKey: "apiReference.webhookEmailApi.description",
  category: "api-reference",
  order: 7,
  sections,
  relatedSlugs: [
    "api-reference/system-api",
    "security/audit-compliance",
    "api-reference/admin-api",
  ],
  lastUpdated: "2026-02-20",
});
