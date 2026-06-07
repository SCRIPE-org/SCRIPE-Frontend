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
        "/docs/features/authentication",
        "Registered route preserved; this page body now points to current source evidence rather than stale narrative claims.",
      ],
      [
        "Canonical content file",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/features/authentication.ts",
        "This TypeScript file is the portal source of truth for the page body.",
      ],
      [
        "Registry and navigation",
        "SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts; SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
        "The page is registered and navigated through the docs portal runtime.",
      ],
      [
        "Auth controllers",
        "SCRIPE-Backend/src/Host/API/Controllers/Auth",
        "Implemented flows include admin/user password auth, refresh, logout, sessions, 2FA, passkeys, magic link, phone OTP, QR login, OIDC client/server, SAML client/server, account setup, and self-service signup.",
      ],
      [
        "Identity handlers",
        "SCRIPE-Backend/src/Modules/Identity/Identity.Application/Commands/Auth",
        "Auth work is dispatched through AstraFlow command/query handlers instead of controller business logic.",
      ],
      [
        "Identity persistence",
        "SCRIPE-Backend/src/Modules/Identity/Identity.Domain/Entities",
        "Admins, users, tokens, sessions, identity providers, OAuth apps, passkeys, external logins, tenants, roles, and user groups are modeled in the Identity domain.",
      ],
      [
        "Frontend auth routes",
        "SCRIPE-Frontend/src/app/(auth)",
        "Frontend routes exist for login, signup, password reset, magic link, QR approval, SSO callbacks, authorization, setup account, and policy pages.",
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
    titleKey: "Representative Implemented API Evidence",
    id: "api-evidence",
  },
  {
    type: "table",
    headers: ["Controller group", "Verified source", "Implemented surface"],
    rows: [
      [
        "AdminAuthController",
        "SCRIPE-Backend/src/Host/API/Controllers/Auth/AdminAuthController.cs",
        "Route prefix api/v{version:apiVersion}/auth/admin; includes login, refresh, workspace discovery, profile, logout, sessions, 2FA, impersonation, external links, and admin password reset.",
      ],
      [
        "UserAuthController",
        "SCRIPE-Backend/src/Host/API/Controllers/Auth/UserAuthController.cs",
        "Route prefix api/v{version:apiVersion}/auth/user; includes login, registration, verification, password reset, refresh, me, logout, 2FA, and external links.",
      ],
      [
        "Passkey/Magic/OTP/QR controllers",
        "SCRIPE-Backend/src/Host/API/Controllers/Auth",
        "PasskeyController, MagicLinkController, PhoneOtpLoginController, and QrLoginController implement alternate authentication flows.",
      ],
      [
        "OIDC/SAML controllers",
        "SCRIPE-Backend/src/Host/API/Controllers/Auth",
        "OidcClientController, OidcServerController, OidcLoginController, SamlClientController, and SamlServerController implement external and identity-provider flows.",
      ],
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
  slug: "features/authentication",
  titleKey: "features.authentication.title",
  category: "features",
  order: 1,
  sections,
  relatedSlugs: [
    "features/role-permissions",
    "features/audit-system",
    "security/authentication-deep",
  ],
  lastUpdated: "2026-06-07",
});
