import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.authSecurity.intro" },
      { type: "heading", level: 2, titleKey: "commercial.authSecurity.jwtTitle", id: "jwt-authentication" },
      { type: "paragraph", contentKey: "commercial.authSecurity.jwtIntro" },
      {
            type: "table",
            headers: ["Claim", "Example", "Purpose"],
            rows: [
                  ["sub", "550e8400-...", "Admin ID"],
                  ["email", "admin@acme.com", "Email address"],
                  ["tenant_id", "660e8400-...", "Tenant association"],
                  ["admin", "true", "Admin flag"],
                  ["is_protected", "true", "Super admin flag"],
                  ["exp", "1707849600", "Expiration timestamp"],
                  ["jti", "uuid-v4", "Unique token ID"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.authSecurity.refreshTitle", id: "refresh-token-rotation" },
      { type: "paragraph", contentKey: "commercial.authSecurity.refreshIntro" },
      { type: "info", variant: "warning", contentKey: "commercial.authSecurity.refreshWarning" },
      { type: "heading", level: 2, titleKey: "commercial.authSecurity.otpTitle", id: "otp-support" },
      {
            type: "table",
            headers: ["Method", "Flow", "Expiration"],
            rows: [
                  ["TOTP", "Admin scans QR code → generates 6-digit code from authenticator app", "30 seconds"],
                  ["Email OTP", "System sends 6-digit code to registered email", "10 minutes"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.authSecurity.rbacTitle", id: "rbac-authorization" },
      { type: "paragraph", contentKey: "commercial.authSecurity.rbacIntro" },
      {
            type: "code",
            language: "text",
            filename: "Permission Categories (~40 Permissions)",
            code: `admins.*          roles.*          tenants.*        menus.*
├── view          ├── view         ├── view         ├── view
├── create        ├── create       ├── create       ├── create
├── edit          ├── edit         ├── edit         ├── edit
├── delete        ├── delete       ├── delete       └── delete
└── block         └── assign       └── settings

audit.*           webhooks.*       emails.*         templates.*
├── view          ├── view         ├── view         ├── view
└── export        ├── create       ├── create       ├── create
                  └── delete       └── send         ├── edit
                                                    └── delete

dashboard.*       recycle-bin.*    downloads.*      settings.*
├── view          ├── view         └── export       ├── view
└── export        ├── restore                       └── edit
                  └── purge`,
      },
      { type: "heading", level: 2, titleKey: "commercial.authSecurity.scopingTitle", id: "tenant-permission-scoping" },
      {
            type: "code",
            language: "text",
            filename: "Tenant Permission Scoping",
            code: `System Permissions:     40 total
Enterprise Tenant:      40 granted (all)
Starter Tenant:         20 granted (subset)
│
├── Role "Manager":     15 permissions (from tenant's 20)
└── Role "Viewer":       5 permissions (from tenant's 20)`,
      },
      { type: "heading", level: 2, titleKey: "commercial.authSecurity.fieldTitle", id: "field-level-access" },
      { type: "paragraph", contentKey: "commercial.authSecurity.fieldIntro" },
      {
            type: "code",
            language: "json",
            filename: "Field-Level Access Control",
            code: `// Role "HR Manager" — can see everything
{ "restrictedFields": [] }

// Role "Department Head" — salary hidden
{ "restrictedFields": ["salary", "ssn", "bankAccount"] }`,
      },
];

registerPage({
      slug: "commercial/auth-security",
      titleKey: "commercial.authSecurity.title",
      descriptionKey: "commercial.authSecurity.description",
      category: "commercial-security",
      order: 2,
      sections,
      relatedSlugs: ["commercial/security-overview", "commercial/data-protection"],
      lastUpdated: "2026-02-19",
});
