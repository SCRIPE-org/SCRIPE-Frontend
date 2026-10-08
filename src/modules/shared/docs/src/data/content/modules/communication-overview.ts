import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.communication.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.communication.overview.infoTitle",
    contentKey: "modules.communication.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.communication.overview.archTitle",
    id: "communication-architecture",
  },
  { type: "paragraph", contentKey: "modules.communication.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Radio",
        titleKey: "modules.communication.overview.featureChannels",
        descriptionKey: "modules.communication.overview.featureChannelsDesc",
      },
      {
        icon: "Mail",
        titleKey: "modules.communication.overview.featureEmail",
        descriptionKey: "modules.communication.overview.featureEmailDesc",
      },
      {
        icon: "MessageSquare",
        titleKey: "modules.communication.overview.featureSms",
        descriptionKey: "modules.communication.overview.featureSmsDesc",
      },
      {
        icon: "FileCode",
        titleKey: "modules.communication.overview.featureTemplates",
        descriptionKey: "modules.communication.overview.featureTemplatesDesc",
      },
      {
        icon: "RefreshCw",
        titleKey: "modules.communication.overview.featureFailover",
        descriptionKey: "modules.communication.overview.featureFailoverDesc",
      },
      {
        icon: "CheckSquare",
        titleKey: "modules.communication.overview.featureDeliveryReceipts",
        descriptionKey: "modules.communication.overview.featureDeliveryReceiptsDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.communication.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.communication.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Communication/Communication.Domain/Entities/ChannelConfiguration.cs",
    code: `public sealed class ChannelConfiguration : TenantAggregateRoot
{
    public CommunicationChannelType ChannelType { get; private set; } // Email, Sms, WhatsApp, Push
    public string ProviderName { get; private set; } = string.Empty; // SendGrid, Twilio, Unifonic, Smtp
    public string ConfigurationJson { get; private set; } = "{}";
    public bool IsPrimary { get; private set; }
    public bool IsActive { get; private set; }
    public int RateLimitPerMinute { get; private set; } = 100;
    public List<DeliveryAttempt> RecentDeliveryAttempts { get; private set; } = new();

    public void RecordDeliveryAttempt(string messageId, bool success, string? errorMessage)
    {
        RecentDeliveryAttempts.Add(new DeliveryAttempt(Id, messageId, success, errorMessage, DateTimeOffset.UtcNow));
        RaiseDomainEvent(new DeliveryAttemptRecordedDomainEvent(Id, TenantId, messageId, success));
    }
}`,
  },

  // ─── Failover Dispatch Pipeline ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.communication.overview.dispatchFlowTitle",
    id: "failover-dispatch-pipeline",
  },
  { type: "paragraph", contentKey: "modules.communication.overview.dispatchFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Event Trigger (e.g. BookingConfirmed, InvoiceIssued)", type: "default" },
      { id: "B", label: "Resolve MessageTemplate by key + recipient language", type: "info" },
      { id: "C", label: "Interpolate Liquid/Scriban variables with event payload", type: "info" },
      { id: "D", label: "Select Primary Channel (e.g. Twilio SMS)", type: "primary" },
      { id: "E", label: "Dispatch attempt; verify HTTP status & webhook receipt", type: "warning" },
      {
        id: "F",
        label: "If failed: Route to secondary fallback channel (e.g. Unifonic)",
        type: "danger",
      },
      {
        id: "G",
        label: "Record immutable SentSmsLog & DeliveryAttempt audit record",
        type: "success",
      },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "E", to: "G" },
      { from: "F", to: "G" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.communication.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.communication.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/communication/channels",
        descriptionKey: "modules.communication.api.listChannels",
        auth: "Bearer JWT",
        permission: "communication.channels.view",
      },
      {
        method: "POST",
        path: "/api/v1/communication/channels",
        descriptionKey: "modules.communication.api.createChannel",
        auth: "Bearer JWT",
        permission: "communication.channels.create",
      },
      {
        method: "GET",
        path: "/api/v1/communication/templates",
        descriptionKey: "modules.communication.api.listTemplates",
        auth: "Bearer JWT",
        permission: "communication.templates.view",
      },
      {
        method: "POST",
        path: "/api/v1/communication/templates/render-preview",
        descriptionKey: "modules.communication.api.renderPreview",
        auth: "Bearer JWT",
        permission: "communication.templates.view",
      },
      {
        method: "POST",
        path: "/api/v1/communication/messages/send-sms",
        descriptionKey: "modules.communication.api.sendSms",
        auth: "Bearer JWT",
        permission: "communication.messages.create",
      },
      {
        method: "GET",
        path: "/api/v1/communication/logs/sms",
        descriptionKey: "modules.communication.api.listSmsLogs",
        auth: "Bearer JWT",
        permission: "communication.logs.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/communication-overview",
  titleKey: "modules.communication.overview.title",
  descriptionKey: "modules.communication.overview.description",
  category: "modules",
  order: 2.38,
  sections,
  relatedSlugs: [
    "infrastructure/communication",
    "features/email-system",
    "features/notification-system",
  ],
  lastUpdated: "2026-10-03",
});
