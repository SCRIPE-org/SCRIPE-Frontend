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
        "/commercial/support-plans",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/commercial/support-plans.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Commercial support page",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/commercial/support-plans.ts",
        "Support plans are documented as commercial guidance; no dedicated runtime support-plan module or controller was found in the current source tree.",
      ],
      [
        "Support resource pages",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/commercial/documentation-training.ts; SCRIPE-Frontend/src/modules/docs/src/data/content/commercial/getting-started-guide.ts; SCRIPE-Frontend/src/modules/docs/src/data/content/commercial/faq.ts",
        "Documentation, onboarding, and FAQ content are represented as adjacent commercial support pages in the docs portal.",
      ],
      [
        "Legacy export reference",
        "docs/en/commercial-docs/17-pricing/03-support-plans.md; docs/en/commercial-docs/18-support",
        "Legacy Markdown exports exist for support-plan and support-resource content, but the frontend TypeScript docs portal remains authoritative.",
      ],
      [
        "Implementation boundary",
        "SCRIPE-Backend/src/Modules; SCRIPE-Backend/src/Host/API/Controllers",
        "The audited backend module/controller tree does not expose support-plan automation, SLA enforcement, ticketing, or support entitlement workflows.",
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
  slug: "commercial/support-plans",
  titleKey: "commercial.supportPlans.title",
  category: "commercial-pricing",
  order: 3,
  sections,
  relatedSlugs: ["commercial/licensing-model", "commercial/documentation-training"],
  lastUpdated: "2026-06-07",
});
