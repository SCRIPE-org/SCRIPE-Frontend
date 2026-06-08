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
        "/docs/tutorials/add-module",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/tutorials/add-module.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "CLI command",
        "tools/scripe-cli/src/commands/new-module.ts",
        "The new-module command parses module options and routes backend-only, frontend-only, or full-stack generation through the CLI generators.",
      ],
      [
        "Backend module generator",
        "tools/scripe-cli/src/generators/backend/module-generator.ts; tools/scripe-cli/src/generators/backend/module-wirers.ts",
        "Backend generation creates module projects and applies wiring for the solution, host project, module registration, permissions, appsettings, and docker-compose.",
      ],
      [
        "Frontend module generator",
        "tools/scripe-cli/src/generators/frontend/module-generator.ts; tools/scripe-cli/src/generators/frontend/module-wirers.ts",
        "Frontend generation creates module scaffolding and wires routes, API factory metadata, permissions, env hints, locales, and the module registry.",
      ],
      [
        "Scaffolding registry",
        "tools/scripe-cli/src/registrars/scaffolding.ts; scripe.config.json",
        "The CLI resolves monorepo paths and scaffold definitions from the shared scaffolding registrar and project configuration.",
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
  slug: "tutorials/add-module",
  titleKey: "tutorials.addModule.title",
  category: "tutorials",
  order: 1,
  sections,
  relatedSlugs: ["architecture/frontend", "frontend/crud-system", "tutorials/add-backend-module"],
  lastUpdated: "2026-06-07",
});
