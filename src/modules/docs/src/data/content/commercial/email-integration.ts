import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.emailIntegration.intro" },

      // ─── Email Delivery Pipeline ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.emailIntegration.pipelineTitle", id: "pipeline" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "Email Delivery Pipeline",
            nodes: [
                  { id: "trigger", label: "Business Event", type: "default" },
                  { id: "resolve", label: "Resolve Template", type: "info" },
                  { id: "render", label: "Scriban Render", type: "primary" },
                  { id: "queue", label: "Channel Queue", type: "warning" },
                  { id: "send", label: "SMTP / SendGrid", type: "success" },
                  { id: "retry", label: "Retry on Failure", type: "danger" },
            ],
            connections: [
                  { from: "trigger", to: "resolve" }, { from: "resolve", to: "render" },
                  { from: "render", to: "queue" }, { from: "queue", to: "send" },
                  { from: "send", to: "retry", label: "Failed" },
            ],
      },

      // ─── Email Providers ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.emailIntegration.providersTitle", id: "providers" },
      {
            type: "table",
            headers: ["Provider", "Configuration", "Use Case"],
            rows: [
                  ["SMTP", "Host, port, credentials", "Self-hosted, on-premise"],
                  ["SendGrid", "API key", "Cloud, high-volume delivery"],
                  ["Mailgun", "API key + domain", "Developer-friendly API"],
                  ["Amazon SES", "Access key + region", "AWS infrastructure"],
                  ["Custom", "Implement IEmailSender", "Any provider via adapter"],
            ],
      },

      // ─── Template System ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.emailIntegration.templatesTitle", id: "templates" },
      { type: "paragraph", contentKey: "commercial.emailIntegration.templatesContent" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Scriban engine", "Full Liquid-compatible templating with loops, conditions, filters"],
                  ["Bilingual", "Arabic and English templates with automatic language detection"],
                  ["Placeholder validation", "Schema-validated variables prevent runtime template errors"],
                  ["Live preview", "WYSIWYG editor with real-time rendering in the admin panel"],
                  ["Version history", "Track template changes with rollback capability"],
            ],
      },

      // ─── Features ───────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.emailIntegration.featuresTitle", id: "features" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "zap", titleKey: "commercial.emailIntegration.queueBased", descriptionKey: "commercial.emailIntegration.queueBasedDesc" },
                  { icon: "globe", titleKey: "commercial.emailIntegration.bilingual", descriptionKey: "commercial.emailIntegration.bilingualDesc" },
                  { icon: "shield", titleKey: "commercial.emailIntegration.retryLogic", descriptionKey: "commercial.emailIntegration.retryLogicDesc" },
                  { icon: "bar-chart", titleKey: "commercial.emailIntegration.tracking", descriptionKey: "commercial.emailIntegration.trackingDesc" },
            ],
      },

      // ─── Configuration ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.emailIntegration.configTitle", id: "config" },
      {
            type: "code",
            language: "json",
            filename: "Email Configuration",
            code: `{
  "EmailSettings": {
    "Provider": "smtp",
    "FromEmail": "no-reply@nexora.io",
    "FromName": "NEXORA Platform",
    "Smtp": {
      "Host": "smtp.office365.com",
      "Port": 587,
      "EnableSsl": true
    },
    "RetryPolicy": {
      "MaxRetries": 3,
      "BackoffSeconds": [30, 120, 600]
    }
  }
}`,
      },
];

registerPage({
      slug: "commercial/email-integration",
      titleKey: "commercial.emailIntegration.title",
      descriptionKey: "commercial.emailIntegration.description",
      category: "commercial-integration",
      order: 3,
      sections,
      relatedSlugs: ["commercial/webhook-integration", "commercial/message-templates"],
      lastUpdated: "2026-02-20",
});
