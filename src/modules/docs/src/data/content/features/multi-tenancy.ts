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
        "/docs/features/multi-tenancy",
        "Registered route preserved; this page body now points to current source evidence rather than stale narrative claims.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/features/multi-tenancy.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Entitlements module",
        "SCRIPE-Backend/src/Modules/Entitlements",
        "Entitlements owns editions, tenant feature definitions, tenant plans, subscriptions, invoices, payment gateways, dunning, analytics, commissions, and Stripe Connect flows.",
      ],
      [
        "Entitlements controllers",
        "SCRIPE-Backend/src/Host/API/Controllers/Entitlements",
        "API controllers implement tenant plans, subscriptions, invoices, promotions, payment gateways, Stripe/PayPal/Paymob webhooks, platform Stripe, tenant Stripe Connect, analytics, and user subscription operations.",
      ],
      [
        "Frontend entitlements routes",
        "SCRIPE-Frontend/src/app/(modules)/(entitlements)",
        "Admin and self-service routes cover editions, tenant plans, features, subscriptions, invoices, payment hub, payment gateways, Stripe Connect, analytics, payouts, and commission pages.",
      ],
      [
        "Payment implementations",
        "SCRIPE-Backend/src/Modules/Entitlements/Entitlements.Infrastructure/Services",
        "Gateway services and export/reporting services are implemented in infrastructure; exact provider behavior depends on configuration and credentials.",
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
  slug: "features/multi-tenancy",
  titleKey: "features.multiTenancy.title",
  category: "features",
  order: 2,
  sections,
  relatedSlugs: ["features/authentication", "features/role-permissions"],
  lastUpdated: "2026-06-07",
});
