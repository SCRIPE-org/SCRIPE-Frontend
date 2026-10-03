import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "tutorials.ujGettingStarted.infoTitle",
    contentKey: "tutorials.ujGettingStarted.infoContent",
  },

  // ─── Step 1: Developer CLI & Local Platform Boot ──────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujGettingStarted.step1Title",
    id: "step-1-cli-boot",
  },
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.step1Desc" },
  {
    type: "code",
    language: "bash",
    filename: "Terminal",
    code: `# 1. Clone the repository and initialize environment configurations
git clone https://github.com/scripe/scripe.git && cd scripe

# 2. Run developer bootstrap to spin up PostgreSQL, Redis, MinIO & RabbitMQ
scripe dev init --with-infrastructure

# 3. Apply baseline database schema migrations across all modular monolith layers
scripe dev db migrate

# 4. Start frontend and backend concurrently with hot reloading
scripe dev start`,
  },

  // ─── Step 2: Exploring Swagger, API Playground & CLI Tools ───────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujGettingStarted.step2Title",
    id: "step-2-dev-tools",
  },
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.step2Desc" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Terminal",
        titleKey: "tutorials.ujGettingStarted.toolCli",
        descriptionKey: "tutorials.ujGettingStarted.toolCliDesc",
      },
      {
        icon: "Code",
        titleKey: "tutorials.ujGettingStarted.toolSwagger",
        descriptionKey: "tutorials.ujGettingStarted.toolSwaggerDesc",
      },
      {
        icon: "Activity",
        titleKey: "tutorials.ujGettingStarted.toolHealth",
        descriptionKey: "tutorials.ujGettingStarted.toolHealthDesc",
      },
    ],
  },
  {
    type: "code",
    language: "bash",
    filename: "Health Verification Probe",
    code: `# Inspect cluster readiness and individual component health
curl -X GET http://localhost:5000/health/ready

# Response:
# {
#   "status": "Healthy",
#   "totalDuration": "00:00:00.0124",
#   "entries": {
#     "postgres": { "status": "Healthy", "duration": "00:00:00.003" },
#     "redis": { "status": "Healthy", "duration": "00:00:00.001" },
#     "rabbitmq": { "status": "Healthy", "duration": "00:00:00.002" },
#     "minio": { "status": "Healthy", "duration": "00:00:00.004" }
#   }
# }`,
  },

  // ─── Step 3: Super-Admin First Login & Security Setup ─────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujGettingStarted.step3Title",
    id: "step-3-first-login",
  },
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.step3Desc" },
  {
    type: "info",
    variant: "warning",
    titleKey: "tutorials.ujGettingStarted.mfaNoticeTitle",
    contentKey: "tutorials.ujGettingStarted.mfaNoticeContent",
  },
  {
    type: "code",
    language: "bash",
    filename: "SuperAdmin Initial Setup CLI",
    code: `# Create or verify the root SuperAdmin identity with mandatory MFA
scripe admin create \\
  --email="superadmin@scripe.internal" \\
  --role="PlatformSuperAdmin" \\
  --require-mfa=true`,
  },

  // ─── Prerequisite: Defining Editions & Entitlements ───────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujGettingStarted.stepEditionsTitle",
    id: "step-editions-entitlements",
  },
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.stepEditionsDesc" },
  {
    type: "code",
    language: "json",
    filename: "Create Commercial Edition (POST /api/v1/entitlements/editions)",
    code: `{
  "name": "Enterprise Athletics Tier",
  "slug": "enterprise-athletics",
  "description": "Full access to multi-campus venue operations, dynamic surge pricing, double-entry ledger, and workforce HRMS.",
  "monthlyPrice": 599.00,
  "annualPrice": 5990.00,
  "currency": "USD",
  "features": [
    { "key": "venue.operations", "isEnabled": true },
    { "key": "catalog.pricing", "isEnabled": true },
    { "key": "finance.ledger", "isEnabled": true },
    { "key": "hrms.workforce", "isEnabled": true },
    { "key": "customfields.encrypted", "isEnabled": true },
    { "key": "compliance.dsr", "isEnabled": true }
  ],
  "quotas": {
    "maxVenues": 50,
    "maxCoaches": 500,
    "maxMonthlyBookings": 50000,
    "storageGb": 500
  }
}`,
  },
  {
    type: "code",
    language: "json",
    filename: "Edition Response Output (Copy editionId for Step 4)",
    code: `{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Enterprise Athletics Tier",
  "slug": "enterprise-athletics",
  "status": "Active",
  "createdAt": "2026-10-03T12:00:00Z"
}`,
  },

  // ─── Step 4: Multi-Tenant Provisioning & Domain Binding ───────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujGettingStarted.step4Title",
    id: "step-4-tenant-provisioning",
  },
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.step4Desc" },
  {
    type: "code",
    language: "json",
    filename: "Tenant Provisioning Payload (POST /api/v1/tenancy/tenants)",
    code: `{
  "name": "Acme Athletics Worldwide",
  "identifier": "acme-athletics",
  "customDomain": "portal.acmeathletics.com",
  "editionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "adminEmail": "director@acmeathletics.com",
  "timeZone": "America/New_York",
  "currency": "USD",
  "isolationMode": "SharedDatabaseTenantSchema"
}`,
  },

  // ─── Step 5: 5-Tier Organizational Hierarchy ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujGettingStarted.stepOrgCoreTitle",
    id: "step-5-org-core",
  },
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.stepOrgCoreDesc" },
  {
    type: "code",
    language: "json",
    filename: "Organization Core Topology (POST /api/v1/organization-core/topology)",
    code: `{
  "organization": {
    "name": "Acme Global Sports Corporation",
    "businessUnits": [
      {
        "name": "North American Athletics",
        "code": "BU-NA",
        "departments": [
          {
            "name": "East Coast Facilities",
            "costCenters": [
              {
                "code": "CC-NY-ARENA",
                "budgetAmount": 1500000.00,
                "teams": [
                  { "name": "Facility Maintenance Team", "leadEmail": "ops.lead@acmeathletics.com" },
                  { "name": "Coaching & Training Staff", "leadEmail": "coaching.head@acmeathletics.com" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}`,
  },

  // ─── Step 6: Visual Branding & Studio Login Customization ────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujGettingStarted.step6Title",
    id: "step-6-branding",
  },
  { type: "paragraph", contentKey: "tutorials.ujGettingStarted.step6Desc" },
  {
    type: "code",
    language: "json",
    filename: "Tenant Studio Branding (PUT /api/v1/tenancy/branding)",
    code: `{
  "primaryColorHex": "#0ea5e9",
  "accentColorHex": "#f59e0b",
  "logoLightUrl": "https://assets.acmeathletics.com/brand/logo-light.svg",
  "logoDarkUrl": "https://assets.acmeathletics.com/brand/logo-dark.svg",
  "fontFamily": "Inter, system-ui, sans-serif",
  "borderRadius": "0.5rem",
  "loginLayout": "SplitPanelWithHeroImage",
  "customCssTokens": {
    "--brand-gradient": "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)"
  }
}`,
  },
];

registerPage({
  slug: "tutorials/user-journey-getting-started",
  titleKey: "tutorials.ujGettingStarted.title",
  descriptionKey: "tutorials.ujGettingStarted.description",
  category: "tutorials",
  order: 1,
  sections,
  relatedSlugs: [
    "get-started/quick-start",
    "features/authentication",
    "features/multi-tenancy",
    "infrastructure/enterprise-configuration",
  ],
  lastUpdated: "2026-10-03",
});
