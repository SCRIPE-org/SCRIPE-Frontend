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
        "/docs/architecture/data-flow",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/architecture/data-flow.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "HTTP request entry",
        "SCRIPE-Backend/src/Host/API/Extensions/MiddlewarePipeline.cs; SCRIPE-Backend/src/Host/API/Program.cs",
        "Program delegates to the middleware extension, where requests pass through security, tenancy, auth, replay, ETag, controllers, hubs, metrics, and gateway routing.",
      ],
      [
        "CQRS dispatch",
        "SCRIPE-Backend/src/Core/Core.Application/Abstractions/ICommand.cs; SCRIPE-Backend/src/Core/Core.Application/Abstractions/IQuery.cs; SCRIPE-Backend/src/Core/Core.Application/DependencyInjection.cs",
        "Commands and queries flow through AstraFlow registrations and open behaviors before handlers execute.",
      ],
      [
        "Frontend request path",
        "SCRIPE-Frontend/src/modules/*/di.ts; SCRIPE-Frontend/src/core/services/api-factory.ts; SCRIPE-Frontend/src/core/services/api.service.ts",
        "Frontend viewmodels resolve repositories from module DI, repositories call services, and services use the shared API/network layer.",
      ],
      [
        "Persistence and events",
        "SCRIPE-Backend/src/Core/Core.Infrastructure/Persistence/AuditableEntityInterceptor.cs; SCRIPE-Backend/src/Core/Core.Infrastructure/Outbox/OutboxProcessor.cs",
        "Writes pass through persistence interceptors and queued event publication, so audit metadata and integration/domain events are handled outside controllers.",
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
  slug: "architecture/data-flow",
  titleKey: "architecture.dataFlow.title",
  category: "architecture",
  order: 8,
  sections,
  relatedSlugs: ["architecture/cqrs", "architecture/backend"],
  lastUpdated: "2026-06-07",
});
