import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.gatewayDeployment.intro" },

  // ─── YARP Gateway ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.gatewayDeployment.yarpTitle",
    id: "yarp-gateway",
  },
  { type: "paragraph", contentKey: "infrastructure.gatewayDeployment.yarpIntro" },
  {
    type: "flowchart",
    title: "Gateway Architecture",
    direction: "horizontal",
    nodes: [
      { id: "client", label: "Frontend / Mobile", type: "primary" },
      {
        id: "gateway",
        label: "YARP Gateway",
        type: "info",
        description: "Reverse proxy + load balancing",
      },
      {
        id: "identity",
        label: "Identity Module",
        type: "success",
        description: "Auth, Users, Roles",
      },
      { id: "entitlements", label: "Entitlements Role", type: "warning", description: "Platform billing + feature gating" },
      { id: "compliance", label: "Compliance Role", type: "info", description: "Governance APIs" },
    ],
    connections: [
      { from: "client", to: "gateway" },
      { from: "gateway", to: "identity", label: "/api/v1/auth/*" },
      { from: "gateway", to: "entitlements", label: "/api/v1/entitlements/*" },
      { from: "gateway", to: "compliance", label: "/api/v1/compliance/*" },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json - Gateway server role inputs",
    code: `{
  "Architecture": { "Mode": "Microservice" },
  "ServiceDiscovery": {
    "Services": {
      "Identity": "http://localhost:5001",
      "Entitlements": "http://localhost:5004",
      "Compliance": "http://localhost:5005",
      "Plugins": "http://localhost:5006",
      "Marketplace": "http://localhost:5007"
    }
  }
}`,  },

  // ─── Module System ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.gatewayDeployment.moduleTitle",
    id: "module-system",
  },
  { type: "paragraph", contentKey: "infrastructure.gatewayDeployment.moduleIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ModuleRegistration.cs - server role loading",
    code: `var rawModuleName = Environment.GetEnvironmentVariable("MODULE_NAME") ?? "";
var moduleName = new DynamicModuleName(rawModuleName, builder.Configuration);
var isMonolith = string.IsNullOrEmpty(rawModuleName);

// Empty MODULE_NAME loads all modules.
// MODULE_NAME=Identity or Auth is a server role; it may load Identity + Entitlements services.
// MODULE_NAME=Gateway loads no business modules and is YARP-only.
if (isMonolith || moduleName.Equals("Identity", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddIdentityModule(builder.Configuration, builder.Environment);
}

if (isMonolith || moduleName.Equals("Entitlements", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddEntitlementsModule(builder.Configuration);
}`,
    highlightLines: [1, 2, 5, 6, 7],  },

  // ─── Deployment Modes ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.gatewayDeployment.modesTitle",
    id: "deployment-modes",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "infrastructure.gatewayDeployment.monolithTitle",
        variant: "positive",
        items: [
          "MODULE_NAME is empty (all modules in one process)",
          "Single database connection string",
          "No YARP gateway needed",
          "Simpler deployment (1 process)",
          "Shared appsettings.json",
          "In-process mediator/domain event handlers",
        ],
      },
      {
        titleKey: "infrastructure.gatewayDeployment.microserviceTitle",
        variant: "neutral",
        items: [
          "MODULE_NAME=Identity/Auth is a composed server role, not a pure microservice",
          "Per-module database",
          "YARP gateway routes to each service",
          "Independent scaling per module",
          "Per-service configuration",
          "True distributed service-to-service flow is future work until the event bus is real",
        ],
      },
    ],
  },

  // ─── IIS Deployment ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.gatewayDeployment.iisTitle",
    id: "iis-deployment",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "infrastructure.gatewayDeployment.iisStep1",
        contentKey: "infrastructure.gatewayDeployment.iisStep1Desc",
      },
      {
        titleKey: "infrastructure.gatewayDeployment.iisStep2",
        contentKey: "infrastructure.gatewayDeployment.iisStep2Desc",
      },
      {
        titleKey: "infrastructure.gatewayDeployment.iisStep3",
        contentKey: "infrastructure.gatewayDeployment.iisStep3Desc",
      },
      {
        titleKey: "infrastructure.gatewayDeployment.iisStep4",
        contentKey: "infrastructure.gatewayDeployment.iisStep4Desc",
      },
    ],
  },

  // ─── Kestrel ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.gatewayDeployment.kestrelTitle",
    id: "kestrel",
  },
  {
    type: "code",
    language: "json",
    filename: "Kestrel Production Configuration",
    code: `{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://0.0.0.0:7001",
        "Certificate": {
          "Path": "/certs/scripe.pfx",
          "Password": "cert-password"
        }
      },
      "Http": {
        "Url": "http://0.0.0.0:5001"
      }
    },
    "Limits": {
      "MaxConcurrentConnections": 100,
      "MaxRequestBodySize": 10485760,
      "RequestHeadersTimeout": "00:00:30"
    }
  }
}`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "infrastructure.gatewayDeployment.portNote",
  },
];

registerPage({
  slug: "infrastructure/gateway-deployment",
  titleKey: "infrastructure.gatewayDeployment.title",
  descriptionKey: "infrastructure.gatewayDeployment.description",
  category: "infrastructure",
  order: 5,
  sections,
  relatedSlugs: [
    "architecture/dependency-injection",
    "architecture/backend",
    "infrastructure/resilience",
  ],
  lastUpdated: "2026-02-20",
});
