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
        "/docs/architecture/cqrs-pipeline",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/architecture/cqrs-pipeline.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Pipeline registration",
        "SCRIPE-Backend/src/Core/Core.Application/DependencyInjection.cs",
        "Core application registration wires AstraFlow mediator behaviors in source order: logging, validation, feature checks, webhook dispatch, and caching.",
      ],
      [
        "Behavior implementations",
        "SCRIPE-Backend/src/Core/Core.Application/Behaviors",
        "The behavior folder contains the registered pipeline behaviors plus stream logging, request timing, cache warming, exception metrics, and domain exception handling helpers.",
      ],
      [
        "Request contracts",
        "SCRIPE-Backend/src/Core/Core.Application/Abstractions/ICommand.cs; SCRIPE-Backend/src/Core/Core.Application/Abstractions/IQuery.cs",
        "Commands and queries are modeled as semantic AstraFlow request contracts so handlers can be discovered and executed through the mediator pipeline.",
      ],
      [
        "Handler examples",
        "SCRIPE-Backend/src/Modules/Identity/Identity.Application/Commands; SCRIPE-Backend/src/Modules/Identity/Identity.Application/Queries",
        "Module application layers expose command and query handlers that receive pipeline processing before business logic runs.",
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
  slug: "architecture/cqrs-pipeline",
  titleKey: "architecture.cqrsPipeline.title",
  category: "architecture",
  order: 11,
  sections,
  relatedSlugs: ["architecture/cqrs", "architecture/domain-events", "architecture/backend"],
  lastUpdated: "2026-06-07",
});
