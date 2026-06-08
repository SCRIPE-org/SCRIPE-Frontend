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
        "/docs/architecture/domain-model",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/architecture/domain-model.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Domain primitives",
        "SCRIPE-Backend/src/Core/Core.Domain/Primitives/Entity.cs; SCRIPE-Backend/src/Core/Core.Domain/Primitives/AuditableEntity.cs; SCRIPE-Backend/src/Core/Core.Domain/Primitives/AggregateRoot.cs",
        "Core domain primitives define entity identity, audit fields, and aggregate roots that can collect domain events.",
      ],
      [
        "Domain abstractions",
        "SCRIPE-Backend/src/Core/Core.Domain/Abstractions",
        "Repository and unit-of-work contracts live in the domain/core abstraction layer and are implemented by infrastructure projects.",
      ],
      [
        "Module domain models",
        "SCRIPE-Backend/src/Modules/*/*.Domain/Entities; SCRIPE-Backend/src/Modules/*/*.Domain/Events",
        "Current modules keep entities, enums, events, interfaces, and specifications inside their Domain projects.",
      ],
      [
        "Audit persistence hook",
        "SCRIPE-Backend/src/Core/Core.Infrastructure/Persistence/AuditableEntityInterceptor.cs; SCRIPE-Backend/src/Core/Core.Infrastructure/Database/DatabaseExtensions.cs",
        "Audit timestamps are applied by infrastructure interceptors when module DbContexts are configured.",
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
  slug: "architecture/domain-model",
  titleKey: "architecture.domainModel.title",
  category: "architecture",
  order: 9,
  sections,
  relatedSlugs: ["architecture/backend", "architecture/cqrs", "architecture/data-flow"],
  lastUpdated: "2026-06-07",
});
