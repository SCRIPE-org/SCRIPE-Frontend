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
        "/commercial/technology-stack",
        "Registered route preserved; this page body now points to current source evidence rather than stale narrative claims."
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/commercial/technology-stack.ts",
        "This TypeScript file is the portal source of truth for the page body."
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime."
      ],
      [
        "Commercial route",
        "SCRIPE-Frontend/src/app/(com-docs)/commercial/[...slug]/page.tsx",
        "Commercial pages use the same docs runtime with a /commercial route prefix and commercial navigation categories."
      ],
      [
        "Truth boundary",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/commercial",
        "Commercial content must describe implemented capability conservatively and avoid unsupported absolutes, exact counts, or roadmap-as-current claims."
      ],
      [
        "Implementation evidence",
        "SCRIPE-Backend, SCRIPE-Frontend, tools/scripe-cli, tools/scripe-studio",
        "Any commercial capability claim should trace back to source files, package manifests, routes, controllers, or configuration."
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
  slug: "commercial/technology-stack",
  titleKey: "commercial.technologyStack.title",
  category: "commercial-platform",
  order: 3,
  sections,
  relatedSlugs: ["commercial/platform-architecture","commercial/system-requirements"],
  lastUpdated: "2026-06-07",
});
