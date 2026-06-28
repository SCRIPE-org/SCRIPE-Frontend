import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

// ─── Get Started: Overview ──────────────────────────────────────
const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "getStarted.overview.intro",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "layers",
        titleKey: "getStarted.overview.featureModular",
        descriptionKey: "getStarted.overview.featureModularDesc",
      },
      {
        icon: "zap",
        titleKey: "getStarted.overview.featureCQRS",
        descriptionKey: "getStarted.overview.featureCQRSDesc",
      },
      {
        icon: "shield",
        titleKey: "getStarted.overview.featureSecurity",
        descriptionKey: "getStarted.overview.featureSecurityDesc",
      },
      {
        icon: "users",
        titleKey: "getStarted.overview.featureMultiTenant",
        descriptionKey: "getStarted.overview.featureMultiTenantDesc",
      },
      {
        icon: "database",
        titleKey: "getStarted.overview.featureMultiDB",
        descriptionKey: "getStarted.overview.featureMultiDBDesc",
      },
      {
        icon: "rocket",
        titleKey: "getStarted.overview.featureDeployment",
        descriptionKey: "getStarted.overview.featureDeploymentDesc",
      },
      {
        icon: "key",
        titleKey: "getStarted.overview.featureSSO",
        descriptionKey: "getStarted.overview.featureSSODesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.overview.architectureTitle",
    id: "architecture-topology",
  },
  {
    type: "paragraph",
    contentKey: "getStarted.overview.architectureIntro",
  },
  {
    type: "flowchart",
    title: "System Architecture",
    direction: "vertical",
    nodes: [
      { id: "client", label: "Client (Next.js 16)", type: "primary" },
      { id: "gateway", label: "API Gateway (YARP)", type: "info" },
      { id: "host", label: "Host Layer — Program.cs", type: "default" },
      { id: "middleware", label: "10 Middleware Pipeline", type: "warning" },
      { id: "controllers", label: "18 REST Controllers", type: "default" },
      { id: "cqrs", label: "AstraFlow mediator CQRS + 3 Behaviors", type: "success" },
      { id: "domain", label: "Domain Layer — 15 Entities", type: "primary" },
      { id: "infra", label: "Infrastructure — Multi-DB + Cache", type: "danger" },
    ],
    connections: [
      { from: "client", to: "gateway" },
      { from: "gateway", to: "host" },
      { from: "host", to: "middleware" },
      { from: "middleware", to: "controllers" },
      { from: "controllers", to: "cqrs" },
      { from: "cqrs", to: "domain" },
      { from: "domain", to: "infra" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.overview.deploymentModesTitle",
    id: "deployment-modes",
  },
  {
    type: "paragraph",
    contentKey: "getStarted.overview.deploymentModesIntro",
  },
  {
    type: "table",
    headers: ["Environment Variable", "Mode", "What Loads", "Use Case"],
    rows: [
      ["(empty / unset)", "Monolith", "All modules register", "Development, small deployments"],
      ["MODULE_NAME=Gateway", "Gateway", "YARP proxy only, no modules", "Microservice router"],
      ["MODULE_NAME=Identity", "Microservice", "Identity module only", "Independent scaling"],
      ["MODULE_NAME=Inventory", "Microservice", "Inventory module only", "Independent scaling"],
      ["MODULE_NAME=Orders", "Microservice", "Orders module only", "Independent scaling"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Program.cs — Deployment Detection",
    code: `var moduleName = Environment.GetEnvironmentVariable("MODULE_NAME") ?? "";
var isMonolith = string.IsNullOrEmpty(moduleName);
var isGateway = moduleName.Equals("Gateway", StringComparison.OrdinalIgnoreCase);

// Gate each module behind a simple check:
if (isMonolith || moduleName.Equals("Identity", StringComparison.OrdinalIgnoreCase))
{
    handlerAssemblies.Add(typeof(Identity.Application.DependencyInjection));
    builder.Services.AddIdentityModule(builder.Configuration);
}`,
    highlightLines: [1, 2, 3],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.overview.techStackTitle",
    id: "tech-stack",
  },
  {
    type: "table",
    headers: ["Layer", "Technology", "Version", "Purpose"],
    rows: [
      ["Backend Framework", ".NET", "10", "Core runtime and SDK"],
      ["API Style", "ASP.NET Core Web API", "10", "REST controllers with Swagger"],
      ["CQRS", "AstraFlow mediator", "12+", "Command/Query separation"],
      ["Validation", "FluentValidation", "11+", "Request validation pipeline"],
      ["ORM", "Entity Framework Core", "10", "Multi-database O/R mapping"],
      ["Caching", "IMemoryCache + Redis", "—", "L1/L2 cache layers"],
      ["Real-time", "SignalR", "10", "WebSocket hubs for live data"],
      ["Background Jobs", "Hangfire", "1.8+", "Recurring and fire-and-forget jobs"],
      ["Frontend Framework", "Next.js", "16 (App Router)", "Server/Client hybrid rendering"],
      ["UI Library", "Shadcn/ui + Radix", "—", "Accessible component primitives"],
      ["State Management", "TanStack Query + Zustand", "v5 / v5", "Server state + client state"],
      ["Styling", "Tailwind CSS + CSS Modules", "4", "Utility-first with scoped styles"],
      ["Localization", "Custom LanguageProvider", "—", "7-language RTL/LTR support"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.overview.serviceRegistrationTitle",
    id: "service-registration",
  },
  {
    type: "paragraph",
    contentKey: "getStarted.overview.serviceRegistrationIntro",
  },
  {
    type: "table",
    headers: ["Order", "Registration", "Size", "Purpose"],
    rows: [
      [
        "1",
        "AddInfrastructureServices",
        "11KB",
        "Serilog, API versioning, controllers, JSON options",
      ],
      ["2", "AddCorsConfiguration", "5KB", "Dev vs Production CORS policies"],
      ["3", "AddRateLimitingConfiguration", "13KB", "DDoS prevention, per-IP, login rate limits"],
      ["4", "AddSwaggerConfiguration", "8KB", "OpenAPI documentation"],
      ["5", "AddScripeObservability", "8KB", "OpenTelemetry tracing + metrics"],
      ["6", "AddCoreInfrastructure", "11KB", "ICurrentUser, Audit, Cache, DI container"],
      ["7", "AddBlobStorage", "2KB", "Local / Azure / S3 / MinIO storage"],
      ["8", "AddIdentityModule", "Module", "Identity-specific services"],
      ["9", "AddCoreApplication", "2KB", "AstraFlow mediator + Behaviors + Domain Events"],
      ["10", "AddHealthCheckConfiguration", "2KB", "Health endpoints"],
      ["11", "AddBackgroundJobsConfiguration", "9KB", "Hangfire + recurring jobs"],
      ["12", "AddSignalRConfiguration", "2KB", "Real-time WebSocket hubs"],
      ["13", "AddGatewayConfiguration", "4KB", "YARP reverse proxy (Gateway mode only)"],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "getStarted.overview.registrationOrderWarning",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.overview.environmentProfilesTitle",
    id: "environment-profiles",
  },
  {
    type: "table",
    headers: ["Environment", "Config File", "Features"],
    rows: [
      [
        "Development",
        "appsettings.Development.json",
        "Swagger enabled, verbose logging, UserSecrets",
      ],
      ["Production", "appsettings.json", "HSTS, minimal logging, no Swagger"],
      ["Oracle", "appsettings.Oracle.example.json", "Oracle provider configuration"],
      ["PostgreSQL", "appsettings.PostgreSQL.example.json", "PostgreSQL provider configuration"],
    ],
  },
  {
    type: "code",
    language: "text",
    filename: "Secrets Provider Chain (highest wins)",
    code: `Priority (highest wins):
  1. UserSecrets          (Development only)
  2. Environment Variables (prefix: UIS_)
  3. appsettings.Secrets.json (optional)
  4. appsettings.json         (base)`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "getStarted.overview.envVarPrefixTip",
  },
];

registerPage({
  slug: "get-started/overview",
  titleKey: "getStarted.overview.title",
  descriptionKey: "getStarted.overview.description",
  category: "get-started",
  order: 1,
  sections,
  relatedSlugs: ["get-started/prerequisites", "get-started/quick-start", "architecture/overview"],
  lastUpdated: "2026-02-19",
});
