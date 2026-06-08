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
        "/docs/features/dashboard-hub",
        "Registered route preserved; this page now uses source-backed implementation evidence.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/features/dashboard-hub.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Workspace and dashboard APIs",
        "SCRIPE-Backend/src/Host/API/Controllers/System/WorkspacesController.cs; SCRIPE-Backend/src/Host/API/Controllers/System/DashboardController.cs",
        "Workspace metadata and dashboard summary endpoints support the hub-style navigation and monitoring surfaces.",
      ],
      [
        "Frontend hub route",
        "SCRIPE-Frontend/src/app/(hub)/hub/page.tsx",
        "The hub route is a frontend entry surface, separate from Entitlements billing administration.",
      ],
      [
        "Monitoring dashboard module",
        "SCRIPE-Frontend/src/modules/monitoring/dashboard",
        "Dashboard view models and components render KPI cards, login activity, recent changes, event distribution, and security sections.",
      ],
      [
        "Workspace menu evidence",
        "SCRIPE-Backend/src/Modules/Identity/Identity.Application/Commands/Menu; SCRIPE-Backend/src/Modules/Identity/Identity.Application/Queries/Menu",
        "Identity menu handlers drive workspace-aware navigation and pinned workspace behavior.",
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
  slug: "features/dashboard-hub",
  titleKey: "features.dashboardHub.title",
  category: "features",
  order: 20,
  sections,
  relatedSlugs: [
    "features/dashboard-builder",
    "features/audit-system",
    "infrastructure/audit-trail",
  ],
  lastUpdated: "2026-06-07",
});
