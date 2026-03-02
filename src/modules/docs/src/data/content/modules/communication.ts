import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "modules.communication.intro" },

      // ─ Email
      {
            type: "heading", level: 2,
            titleKey: "modules.communication.emailTitle", id: "email",
      },
      { type: "paragraph", contentKey: "modules.communication.emailDesc" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Templated Emails", "Handlebars-based templates with variable interpolation"],
                  ["Multi-Provider", "SMTP, SendGrid, Mailgun (configurable)"],
                  ["Localized", "EN/AR subject lines and body content"],
                  ["Trial Notifications", "6-stage email pipeline for trial lifecycle"],
            ],
      },

      // ─ Notifications
      {
            type: "heading", level: 2,
            titleKey: "modules.communication.notificationsTitle", id: "notifications",
      },
      { type: "paragraph", contentKey: "modules.communication.notificationsDesc" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Real-time", "SignalR hub for instant push"],
                  ["Notification Center", "In-app with read/unread tracking"],
                  ["Types", "System, Subscription, Security, Alert"],
            ],
      },

      // ─ Webhooks
      {
            type: "heading", level: 2,
            titleKey: "modules.communication.webhooksTitle", id: "webhooks",
      },
      { type: "paragraph", contentKey: "modules.communication.webhooksDesc" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Event Triggers", "Subscribe to domain events (TenantCreated, AdminCreated, etc.)"],
                  ["Retry Policy", "Exponential backoff with configurable max retries"],
                  ["Signature", "HMAC-SHA256 payload signing for security"],
                  ["Delivery Logs", "Track success/failure for each webhook call"],
            ],
      },
];

registerPage({
      slug: "modules/communication",
      titleKey: "modules.communication.title",
      descriptionKey: "modules.communication.description",
      category: "modules",
      order: 3,
      sections,
      relatedSlugs: ["features/notification-system", "features/email-system", "features/webhook-system"],
      lastUpdated: "2026-03-02",
});
