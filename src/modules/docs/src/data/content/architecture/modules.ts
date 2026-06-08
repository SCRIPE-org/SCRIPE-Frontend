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
        "/docs/architecture/modules",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/architecture/modules.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Backend module roots",
        "SCRIPE-Backend/src/Modules/Identity; SCRIPE-Backend/src/Modules/Entitlements; SCRIPE-Backend/src/Modules/Compliance; SCRIPE-Backend/src/Modules/Plugins; SCRIPE-Backend/src/Modules/Marketplace",
        "The implemented backend modules use the Domain, Application, and Infrastructure project split under src/Modules.",
      ],
      [
        "Runtime module loading",
        "SCRIPE-Backend/src/Host/API/Extensions/ModuleRegistration.cs",
        "MODULE_NAME controls all-modules monolith mode, Gateway mode, or a single backend module service.",
      ],
      [
        "Module registration contract",
        "SCRIPE-Backend/src/Core/Core.Infrastructure/Architecture/IModuleRegistration.cs; SCRIPE-Backend/src/Core/Core.Infrastructure/Architecture/ModuleBuilderExtensions.cs",
        "Module registration is expressed through a shared abstraction and extension helpers rather than hardcoded service setup inside controllers.",
      ],
      [
        "Frontend module roots",
        "SCRIPE-Frontend/src/modules/auth; SCRIPE-Frontend/src/modules/identity; SCRIPE-Frontend/src/modules/entitlements; SCRIPE-Frontend/src/modules/docs",
        "Frontend modules keep sub-module code, DI, entities, repositories, viewmodels, views, and co-located locales under src/modules.",
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
  slug: "architecture/modules",
  titleKey: "architecture.modules.title",
  category: "architecture",
  order: 5,
  sections,
  relatedSlugs: ["architecture/overview", "get-started/project-structure"],
  lastUpdated: "2026-06-07",
});
