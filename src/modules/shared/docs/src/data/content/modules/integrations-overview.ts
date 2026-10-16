import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.integrations.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.integrations.overview.infoTitle",
    contentKey: "modules.integrations.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.integrations.overview.archTitle",
    id: "integrations-architecture",
  },
  { type: "paragraph", contentKey: "modules.integrations.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Key",
        titleKey: "modules.integrations.overview.featureApiKeys",
        descriptionKey: "modules.integrations.overview.featureApiKeysDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "modules.integrations.overview.featureScopes",
        descriptionKey: "modules.integrations.overview.featureScopesDesc",
      },
      {
        icon: "Activity",
        titleKey: "modules.integrations.overview.featureRateLimits",
        descriptionKey: "modules.integrations.overview.featureRateLimitsDesc",
      },
      {
        icon: "BarChart2",
        titleKey: "modules.integrations.overview.featureTelemetry",
        descriptionKey: "modules.integrations.overview.featureTelemetryDesc",
      },
      {
        icon: "Lock",
        titleKey: "modules.integrations.overview.featureHashing",
        descriptionKey: "modules.integrations.overview.featureHashingDesc",
      },
      {
        icon: "Cpu",
        titleKey: "modules.integrations.overview.featureConnectors",
        descriptionKey: "modules.integrations.overview.featureConnectorsDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.integrations.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.integrations.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Integrations/Integrations.Domain/Entities/ApiKey.cs",
    code: `public sealed class ApiKey : TenantAggregateRoot
{
    public string Name { get; private set; } = string.Empty;
    public string KeyPrefix { get; private set; } = string.Empty; // e.g. "sk_live_..."
    public string SecretHash { get; private set; } = string.Empty; // SHA-256 hash
    public List<string> Scopes { get; private set; } = new(); // "venue:read", "reservations:write"
    public List<string> AllowedIpAddresses { get; private set; } = new();
    public int RateLimitPerMinute { get; private set; } = 300;
    public DateTimeOffset? ExpiresAtUtc { get; private set; }
    public bool IsRevoked { get; private set; }

    public bool VerifySecret(string rawSecret)
    {
        if (IsRevoked || (ExpiresAtUtc.HasValue && ExpiresAtUtc.Value < DateTimeOffset.UtcNow))
            return false;

        var computedHash = ApiKeySecurity.ComputeSha256(rawSecret);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(SecretHash),
            Encoding.UTF8.GetBytes(computedHash)
        );
    }
}`,
  },

  // ─── API Key Authentication & Rate Limiting Pipeline ──────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.integrations.overview.authFlowTitle",
    id: "auth-ratelimit-pipeline",
  },
  { type: "paragraph", contentKey: "modules.integrations.overview.authFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "External Client sends request with 'X-API-Key' header", type: "default" },
      {
        id: "B",
        label: "Extract Key Prefix & look up active record in memory cache",
        type: "info",
      },
      { id: "C", label: "Validate SHA-256 secret hash in constant time", type: "primary" },
      { id: "D", label: "Enforce IP whitelist filter (CIDR blocks)", type: "warning" },
      {
        id: "E",
        label: "Verify token bucket rate limiter (Redis distributed counter)",
        type: "warning",
      },
      { id: "F", label: "Assert required scope permissions for targeted route", type: "info" },
      { id: "G", label: "Asynchronously record telemetry into ApiKeyUsageLog", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.integrations.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.integrations.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/integrations/api-keys",
        descriptionKey: "modules.integrations.api.listKeys",
        auth: "Bearer JWT",
        permission: "integrations.api-keys.view",
      },
      {
        method: "POST",
        path: "/api/v1/integrations/api-keys",
        descriptionKey: "modules.integrations.api.createKey",
        auth: "Bearer JWT",
        permission: "integrations.api-keys.create",
      },
      {
        method: "DELETE",
        path: "/api/v1/integrations/api-keys/{id}",
        descriptionKey: "modules.integrations.api.revokeKey",
        auth: "Bearer JWT",
        permission: "integrations.api-keys.delete",
      },
      {
        method: "GET",
        path: "/api/v1/integrations/api-keys/{id}/stats",
        descriptionKey: "modules.integrations.api.getKeyStats",
        auth: "Bearer JWT",
        permission: "integrations.api-keys.view",
      },
      {
        method: "PUT",
        path: "/api/v1/integrations/api-keys/{id}/scopes",
        descriptionKey: "modules.integrations.api.updateScopes",
        auth: "Bearer JWT",
        permission: "integrations.api-keys.update",
      },
    ],
  },
];

registerPage({
  slug: "modules/integrations-overview",
  titleKey: "modules.integrations.overview.title",
  descriptionKey: "modules.integrations.overview.description",
  category: "modules",
  order: 2.39,
  sections,
  relatedSlugs: ["infrastructure/integrations", "modules/webhooks", "security/api-security"],
  lastUpdated: "2026-10-03",
});
