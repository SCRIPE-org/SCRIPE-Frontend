import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "heading",
    level: 2,
    titleKey: "Current Implementation",
    id: "current-implementation",
  },
  {
    type: "table",
    headers: ["Area", "Verified source", "Current status"],
    rows: [
      [
        "Page route",
        "/docs/infrastructure/load-testing",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/infrastructure/load-testing.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Database providers",
        "SCRIPE-Backend/src/Modules/*/*.Infrastructure/*DbContextFactory.cs",
        "Each current module factory contains SQL Server, Oracle, and PostgreSQL branches; runtime selection still depends on configuration and migrations.",
      ],
      [
        "Background jobs",
        "SCRIPE-Backend/src/Core/Core.Infrastructure/BackgroundJobs + SCRIPE-Backend/src/Modules/*/*.Infrastructure/BackgroundJobs",
        "Core and modules implement recurring job classes discovered through IAutoRegisteredJob/RecurringJobBase patterns and registered through background job configuration.",
      ],
      [
        "Storage",
        "SCRIPE-Backend/src/Core/Core.Infrastructure/Storage",
        "Blob storage implementations include local and cloud/object-storage providers; availability depends on configured provider settings.",
      ],
      [
        "Observability and health",
        "SCRIPE-Backend/src/Host/API/Health + SCRIPE-Backend/src/Host/API/Extensions",
        "Health endpoints, OpenTelemetry/Prometheus configuration, logging, rate limiting, SignalR, and gateway configuration are in host extensions and health files.",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Evidence Boundaries",
    id: "evidence-boundaries",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "The executable source tree is authoritative for behavior; this page avoids exact counts unless they are generated from source during the audit.",
      "Configuration-dependent features are described as configuration-dependent. Database provider, Redis, background job, payment, identity-provider, and observability behavior still depends on runtime settings and credentials.",
      "Legacy Markdown under docs/ and docs-export/ is treated as generated or reference material. Canonical documentation lives in SCRIPE-Frontend/src/modules/docs/src/data/content.",
      "Commercial language is constrained to implemented source evidence and should not be read as a guarantee for roadmap, compliance certification, deployment timing, or ROI.",
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Technology Snapshot",
    id: "technology-snapshot",
  },
  {
    type: "table",
    headers: ["Component", "Current evidence", "Source"],
    rows: [
      ["Backend target framework", "net10.0", "SCRIPE-Backend/**/*.csproj"],
      ["Frontend framework", "Next.js 16.1.7 with React 19.2.4", "SCRIPE-Frontend/package.json"],
      ["CLI package", "scripe-cli 4.0.0, Node >=20.0.0", "tools/scripe-cli/package.json"],
      [
        "Studio",
        "Engine/UI package version 4.0.0; Express + Socket.IO engine and Next.js UI",
        "tools/scripe-studio/package.json; tools/scripe-studio/engine/package.json; tools/scripe-studio/ui/package.json",
      ],
      [
        "Docs locale runtime",
        "Eager docs registry for en, ar, fr, ru, zh, es, and de",
        "SCRIPE-Frontend/src/modules/docs/src/presentation/providers/DocsI18nProvider.tsx",
      ],
    ],
  },
];

registerPage({
  slug: "infrastructure/load-testing",
  titleKey: "infrastructure.loadTesting.title",
  category: "infrastructure",
  order: 10,
  sections,
  relatedSlugs: [
    "infrastructure/observability",
    "infrastructure/resilience",
    "infrastructure/health-checks",
  ],
  lastUpdated: "2026-06-07",
});
