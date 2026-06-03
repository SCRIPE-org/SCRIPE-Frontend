/**
 * Messaging Module Permissions
 *
 * Covers: Notifications, Message Templates, Emails, Webhooks
 */
export const MESSAGING_PERMISSIONS = {
  // ── Notifications ───────────────────────────────────────
  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_CREATE: "notifications.create",
  NOTIFICATIONS_UPDATE: "notifications.update",
  NOTIFICATIONS_DELETE: "notifications.delete",

  // ── Message Templates ──────────────────────────────────
  MESSAGE_TEMPLATES_VIEW: "message-templates.view",
  MESSAGE_TEMPLATES_CREATE: "message-templates.create",
  MESSAGE_TEMPLATES_UPDATE: "message-templates.update",
  MESSAGE_TEMPLATES_DELETE: "message-templates.delete",

  // ── Emails ──────────────────────────────────────────────
  EMAILS_VIEW: "emails.view",
  EMAILS_CREATE: "emails.create",

  // ── Webhooks ────────────────────────────────────────────
  WEBHOOKS_VIEW: "webhooks.view",
  WEBHOOKS_CREATE: "webhooks.create",
  WEBHOOKS_UPDATE: "webhooks.update",
  WEBHOOKS_DELETE: "webhooks.delete",
} as const;
