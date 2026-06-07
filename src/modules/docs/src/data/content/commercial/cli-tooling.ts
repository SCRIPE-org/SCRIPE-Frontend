import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    "type": "heading",
    "level": 2,
    "titleKey": "Current Implementation",
    "id": "current-implementation"
  },
  {
    "type": "table",
    "headers": [
      "Area",
      "Verified source",
      "Current status"
    ],
    "rows": [
      [
        "Page route",
        "/commercial/cli-tooling",
        "Registered route preserved; this page body now points to current source evidence rather than stale narrative claims."
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/commercial/cli-tooling.ts",
        "This TypeScript file is the portal source of truth for the page body."
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime."
      ],
      [
        "CLI entry point",
        "tools/scripe-cli/bin/scripe.ts",
        "The scripe binary is registered from the CLI package and delegates command registration to docs, studio, diagnostics, list, and domain registrar groups."
      ],
      [
        "CLI package",
        "tools/scripe-cli/package.json",
        "scripe-cli is version 4.0.0 and requires Node >=20.0.0."
      ],
      [
        "Command registrars",
        "tools/scripe-cli/src/registrars",
        "Scaffolding, database, codegen, build/dev, quality, infrastructure, and enterprise commands are registered through dedicated registrar files."
      ],
      [
        "Docs commands",
        "tools/scripe-cli/src/commands/docs-sync.ts",
        "Implemented docs subcommands include sync, validate, coverage, health, ci, new, diff, list, stats, search, open, export, and clean."
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "Evidence Boundaries",
    "id": "evidence-boundaries"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "The executable source tree is authoritative for behavior; this page avoids exact counts unless they are generated from source during the audit.",
      "Configuration-dependent features are described as configuration-dependent. Database provider, Redis, background job, payment, identity-provider, and observability behavior still depends on runtime settings and credentials.",
      "Legacy Markdown under docs/ and docs-export/ is treated as generated or reference material. Canonical documentation lives in SCRIPE-Frontend/src/modules/docs/src/data/content.",
      "Commercial language is constrained to implemented source evidence and should not be read as a guarantee for roadmap, compliance certification, deployment timing, or ROI."
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "Verified Commands",
    "id": "verified-commands"
  },
  {
    "type": "code",
    "language": "bash",
    "filename": "CLI command groups verified from tools/scripe-cli/src",
    "code": "scripe docs sync\nscripe docs validate\nscripe docs health\nscripe validate-locales --docs\nscripe arch-check\nscripe studio --dev"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "Technology Snapshot",
    "id": "technology-snapshot"
  },
  {
    "type": "table",
    "headers": [
      "Component",
      "Current evidence",
      "Source"
    ],
    "rows": [
      [
        "Backend target framework",
        "net10.0",
        "SCRIPE-Backend/**/*.csproj"
      ],
      [
        "Frontend framework",
        "Next.js 16.1.7 with React 19.2.4",
        "SCRIPE-Frontend/package.json"
      ],
      [
        "CLI package",
        "scripe-cli 4.0.0, Node >=20.0.0",
        "tools/scripe-cli/package.json"
      ],
      [
        "Studio",
        "Engine/UI package version 4.0.0; Express + Socket.IO engine and Next.js UI",
        "tools/scripe-studio/package.json; tools/scripe-studio/engine/package.json; tools/scripe-studio/ui/package.json"
      ],
      [
        "Docs locale runtime",
        "Eager docs registry for en, ar, fr, ru, zh, es, and de",
        "SCRIPE-Frontend/src/modules/docs/src/presentation/providers/DocsI18nProvider.tsx"
      ]
    ]
  }
];

registerPage({
  slug: "commercial/cli-tooling",
  titleKey: "commercial.cliTooling.title",
  category: "commercial-developer",
  order: 1,
  sections,
  relatedSlugs: ["commercial/clean-architecture","commercial/api-design"],
  lastUpdated: "2026-06-07",
});
