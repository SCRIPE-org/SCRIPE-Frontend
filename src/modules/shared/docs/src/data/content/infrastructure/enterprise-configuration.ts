import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.enterpriseConfig.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "infrastructure.enterpriseConfig.infoTitle",
    contentKey: "infrastructure.enterpriseConfig.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.enterpriseConfig.archTitle",
    id: "configuration-topology",
  },
  { type: "paragraph", contentKey: "infrastructure.enterpriseConfig.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Shield",
        titleKey: "infrastructure.enterpriseConfig.featSecurity",
        descriptionKey: "infrastructure.enterpriseConfig.featSecurityDesc",
      },
      {
        icon: "Activity",
        titleKey: "infrastructure.enterpriseConfig.featRateLimiting",
        descriptionKey: "infrastructure.enterpriseConfig.featRateLimitingDesc",
      },
      {
        icon: "Globe",
        titleKey: "infrastructure.enterpriseConfig.featGeoIp",
        descriptionKey: "infrastructure.enterpriseConfig.featGeoIpDesc",
      },
      {
        icon: "Cpu",
        titleKey: "infrastructure.enterpriseConfig.featAstraFlow",
        descriptionKey: "infrastructure.enterpriseConfig.featAstraFlowDesc",
      },
      {
        icon: "Database",
        titleKey: "infrastructure.enterpriseConfig.featDatabases",
        descriptionKey: "infrastructure.enterpriseConfig.featDatabasesDesc",
      },
      {
        icon: "Clock",
        titleKey: "infrastructure.enterpriseConfig.featSweepers",
        descriptionKey: "infrastructure.enterpriseConfig.featSweepersDesc",
      },
    ],
  },

  // ─── Annotated appsettings.json Specification ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.enterpriseConfig.schemaTitle",
    id: "appsettings-specification",
  },
  { type: "paragraph", contentKey: "infrastructure.enterpriseConfig.schemaIntro" },
  {
    type: "code",
    language: "json",
    filename: "src/Host/API/appsettings.json",
    code: `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Security": {
    "EnableHsts": true,
    "EnableSecurityHeaders": true,
    "MaxFailedAttempts": 5,
    "LockoutMinutes": 15,
    "OtpExpirationMinutes": 5,
    "SessionTimeoutMinutes": 60,
    "InternalApiKey": "\${INTERNAL_API_KEY}"
  },
  "RateLimiting": {
    "Enabled": true,
    "GlobalLimit": 1000,
    "PerIpLimit": 200,
    "LoginLimit": 10,
    "ReadLimit": 200,
    "MutationLimit": 30,
    "PerUserLimit": 100,
    "ExportHeavyLimit": 5,
    "SignupLimit": 3,
    "PhoneOtpSendLimit": 3,
    "PasskeyAuthLimit": 5,
    "QrPollLimit": 60
  },
  "GeoIp": {
    "EnableIpApiFallback": true,
    "IpApiProviderUrl": "https://ipwho.is",
    "CacheHours": 12,
    "RequestTimeoutSeconds": 5,
    "TrustProxyHeaders": false,
    "RequireCloudflareOriginVerification": true,
    "OriginVerificationHeaderName": "X-Scripe-Origin-Verify",
    "OriginVerificationSecret": "\${ORIGIN_VERIFY_SECRET}"
  },
  "AstraFlow": {
    "Diagnostics": {
      "ValidateRequestCoverage": true,
      "ValidateMappingCatalog": true,
      "IncludeInfoFindings": true,
      "ThrowOnErrors": true,
      "LogFullMarkdownReport": false,
      "MinimumLogSeverity": "Error",
      "EnableDiagnosticsEndpoint": true
    }
  },
  "Signup": {
    "Enabled": true,
    "PendingTtlHours": 24,
    "OrphanTtlHours": 1,
    "SweepIntervalMinutes": 15,
    "SessionRetentionDays": 7,
    "LeadDailyCap": 100,
    "BlockDisposableEmails": true,
    "MaxTenantsPerEmail": 3,
    "RequireEmailVerification": true
  }
}`,
  },

  // ─── Distributed Rate Limiting & Protection Pipeline ──────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.enterpriseConfig.pipelineTitle",
    id: "security-pipeline",
  },
  { type: "paragraph", contentKey: "infrastructure.enterpriseConfig.pipelineIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Inbound HTTP Request from CDN / Cloudflare", type: "default" },
      {
        id: "B",
        label: "Verify Origin Shared Secret Header (X-Scripe-Origin-Verify)",
        type: "warning",
      },
      { id: "C", label: "Extract Client IP & evaluate GeoIP / CIDR blocklist cache", type: "info" },
      {
        id: "D",
        label: "Distributed Token-Bucket Rate Limiter (Redis counter per endpoint tier)",
        type: "primary",
      },
      {
        id: "E",
        label: "Tenant Context Resolver (Subdomain / Path / Header resolution)",
        type: "info",
      },
      { id: "F", label: "AstraFlow Diagnostic & Mapping Validation Gate", type: "success" },
      {
        id: "G",
        label: "Execute CQRS Handler within Tenant Database Filter Scope",
        type: "success",
      },
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
];

registerPage({
  slug: "infrastructure/enterprise-configuration",
  titleKey: "infrastructure.enterpriseConfig.title",
  descriptionKey: "infrastructure.enterpriseConfig.description",
  category: "infrastructure",
  order: 7.05,
  sections,
  relatedSlugs: [
    "security/overview",
    "infrastructure/gateway-deployment",
    "infrastructure/health-checks",
    "architecture/backend",
  ],
  lastUpdated: "2026-10-03",
});
