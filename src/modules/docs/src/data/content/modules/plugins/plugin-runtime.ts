import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.pluginRuntime.intro" },

  // ─── PluginDataStore Entity ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginRuntime.dataStoreTitle",
    id: "plugin-data-store",
  },
  { type: "paragraph", contentKey: "modules.pluginRuntime.dataStoreIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginInstallationId", "Guid", "FK to the plugin installation that owns this data entry"],
      ["TenantId", "Guid", "Tenant scope — ensures strict data isolation between tenants"],
      ["Namespace", "string", "Logical grouping for keys (e.g. \"config\", \"cache\", \"state\")"],
      ["Key", "string", "Key within the namespace (unique per installation + namespace + key)"],
      ["ValueJson", "string", "Serialized JSON value (default: \"{}\")"],
      ["ValueSizeBytes", "long", "Byte size of ValueJson for quota enforcement"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.pluginRuntime.dataStoreNote",
  },

  // ─── PluginExecutionLog Entity ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginRuntime.execLogTitle",
    id: "plugin-execution-log",
  },
  { type: "paragraph", contentKey: "modules.pluginRuntime.execLogIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginInstallationId", "Guid", "FK to the installation that made this API call"],
      ["TenantId", "Guid", "Tenant context for this log entry"],
      ["Endpoint", "string", "API endpoint path that was called (e.g. \"/api/v1/plugin-api/v1/data/...\")"],
      ["HttpMethod", "string", "HTTP method used (GET, POST, PUT, DELETE)"],
      ["HttpStatusCode", "int?", "HTTP response status code returned (null if request never completed)"],
      ["DurationMs", "int", "Total round-trip duration of the API call in milliseconds"],
      ["IsSuccess", "bool", "Whether the call completed with a 2xx status code"],
      ["ErrorMessage", "string?", "Error description if the call failed (null on success)"],
      ["ExecutedAt", "DateTime", "UTC timestamp when this API call was executed (default: DateTime.UtcNow)"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.pluginRuntime.execLogTip",
  },

  // ─── PluginWebhookSubscription Entity ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginRuntime.webhookTitle",
    id: "plugin-webhook-subscription",
  },
  { type: "paragraph", contentKey: "modules.pluginRuntime.webhookIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginInstallationId", "Guid", "FK to the installation registering this subscription"],
      ["TenantId", "Guid", "Tenant scope for this subscription"],
      ["EventType", "string", "Platform event type to listen for (e.g. \"user.created\", \"tenant.updated\")"],
      ["CallbackUrl", "string", "HTTPS URL that receives HTTP POST payloads when the event fires"],
      ["IsActive", "bool", "Whether this subscription is active and will receive deliveries (default: true)"],
    ],
  },

  // ─── Webhook Flow Diagram ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginRuntime.webhookFlowTitle",
    id: "webhook-flow",
  },
  { type: "paragraph", contentKey: "modules.pluginRuntime.webhookFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "event", label: "Platform Event Fired", type: "primary" },
      { id: "bus", label: "Event Bus Dispatches", type: "default" },
      { id: "subs", label: "Active Subscriptions Queried", type: "info" },
      { id: "deliver", label: "HTTP POST to CallbackUrl", type: "warning" },
      { id: "success", label: "2xx → Delivery Complete", type: "success" },
      { id: "fail", label: "Non-2xx → Retry with Backoff", type: "danger" },
      { id: "log", label: "Execution Logged", type: "default" },
    ],
    connections: [
      { from: "event", to: "bus", label: "raises domain event" },
      { from: "bus", to: "subs", label: "finds matching IsActive subs" },
      { from: "subs", to: "deliver", label: "for each subscription" },
      { from: "deliver", to: "success", label: "HTTP 2xx" },
      { from: "deliver", to: "fail", label: "HTTP 4xx/5xx" },
      { from: "fail", to: "deliver", label: "retry (exponential backoff)" },
      { from: "success", to: "log", label: "log result" },
      { from: "fail", to: "log", label: "log failure" },
    ],
  },
];

registerPage({
  slug: "modules/plugins/plugin-runtime",
  titleKey: "modules.pluginRuntime.title",
  descriptionKey: "modules.pluginRuntime.description",
  category: "modules",
  order: 83,
  sections,
  relatedSlugs: [
    "modules/plugins-overview",
    "modules/plugins/plugin-entities",
    "modules/plugins/plugin-installation",
  ],
  lastUpdated: "2026-06-29",
});
