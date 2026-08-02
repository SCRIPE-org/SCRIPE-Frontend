import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.tenantApi.intro" },

  // ─── Base Config ──────────────────────────────────────────
  {
    type: "table",
    headers: ["Setting", "Value", "Description"],
    rows: [
      ["Base URL", "/api/v1/Tenants", "All tenant management endpoints base path"],
      ["Auth Required", "Yes — Bearer Token", "Requires authentication and relevant permissions"],
      [
        "Permission Prefix",
        "tenants.*",
        "Standard actions map to tenants.view, tenants.create, tenants.update, tenants.delete",
      ],
      [
        "Tenant Gating",
        "Enforced",
        "Admins can only see/manage their own tenant and child/descendant tenants",
      ],
    ],
  },

  // ─── CRUD Endpoints ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.tenantApi.crudTitle",
    id: "crud",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Tenants",
        descriptionKey: "apiReference.tenantApi.listDesc",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}",
        descriptionKey: "apiReference.tenantApi.getByIdDesc",
        auth: "tenants.view_details",
      },
      {
        method: "POST",
        path: "/api/v1/Tenants",
        descriptionKey: "apiReference.tenantApi.createDesc",
        auth: "tenants.create",
      },
      {
        method: "PUT",
        path: "/api/v1/Tenants/{id}",
        descriptionKey: "apiReference.tenantApi.updateDesc",
        auth: "tenants.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/Tenants/{id}",
        descriptionKey: "apiReference.tenantApi.deleteDesc",
        auth: "tenants.delete",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Get Tenant (GET)",
        language: "json",
        filename: "GET /api/v1/Tenants/{id} — Response",
        code: `{
  "id": "tenant-uuid-f8e7d6c5",
  "name": "Acme Corporation",
  "code": "ACME",
  "logoUrl": "/uploads/tenants/acme-logo.png",
  "parentTenantId": null,
  "isActive": true,
  "description": "Acme Corporation global HQ",
  "address": "123 Main St, New York, NY",
  "createdAt": "2026-01-01T00:00:00Z"
}`,
      },
      {
        label: "Create Tenant (POST)",
        language: "json",
        filename: "POST /api/v1/Tenants — Request & Response",
        code: `// Request Body
{
  "name": "Acme East Branch",
  "code": "ACME_EAST",
  "parentTenantId": "parent-tenant-uuid", // Optional
  "description": "Acme East region branch",
  "address": "456 East Ave, Boston, MA",
  "adminEmail": "east-admin@acme.com",
  "adminUsername": "eastadmin",
  "editionId": "edition-uuid-optional",
  "subscriptionType": "Monthly", // "Monthly" or "Annually" (Identity -> Entitlements bridge)
  "currency": "USD",
  "promotionId": null,
  "promoCode": null,
  "skipPayment": true
}

// Response (201 Created)
{
  "tenantId": "new-tenant-uuid",
  "adminId": "new-admin-uuid",
  "adminUsername": "eastadmin",
  "adminEmail": "east-admin@acme.com",
  "accountSetupUrl": "https://scripe.com/setup-account?token=setup-token-uuid",
  "subscriptionId": "subscription-uuid-from-entitlements",
  "editionAssignmentError": null
}`,
      },
    ],
  },

  // ─── Hierarchy & Statistics ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.tenantApi.hierarchyTitle",
    id: "hierarchy",
  },
  { type: "paragraph", contentKey: "apiReference.tenantApi.hierarchyIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Tenants/tree",
        descriptionKey: "apiReference.tenantApi.hierarchyDesc",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/myChildren",
        descriptionKey: "apiReference.tenantApi.myChildrenDesc",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/myTenantAndChildren",
        descriptionKey: "apiReference.tenantApi.myTenantAndChildrenDesc",
        auth: "admins.transfer",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/children",
        descriptionKey: "apiReference.tenantApi.childrenDesc",
        auth: "tenants.view_subTenants",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/stats",
        descriptionKey: "apiReference.tenantApi.statsDesc",
        auth: "tenants.view_details",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/descendant-count",
        descriptionKey: "apiReference.tenantApi.descendantCountDesc",
        auth: "tenants.view",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Tenant Tree (GET /tree)",
        language: "json",
        filename: "GET /api/v1/Tenants/tree — Tree Response",
        code: `[
  {
    "id": "root-uuid",
    "name": "Headquarters",
    "code": "HQ",
    "level": 0,
    "children": [
      {
        "id": "branch-1-uuid",
        "name": "East Branch",
        "code": "EAST",
        "level": 1,
        "children": [
          {
            "id": "sub-branch-uuid",
            "name": "East Sub-Office",
            "code": "EAST_SUB",
            "level": 2,
            "children": []
          }
        ]
      }
    ]
  }
]`,
      },
      {
        label: "Tenant Statistics (GET /stats)",
        language: "json",
        filename: "GET /api/v1/Tenants/{id}/stats — Response",
        code: `{
  "adminCount": 12,
  "userCount": 342,
  "roleCount": 8,
  "subTenantCount": 3
}`,
      },
    ],
  },

  // ─── Tenant Admins & Roles Drill-down ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.adminEndpointsTitle",
    id: "drill-down",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/admins",
        descriptionKey: "apiReference.tenantApi.adminsDesc",
        auth: "tenants.view_admins",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/roles",
        descriptionKey: "apiReference.tenantApi.rolesDesc",
        auth: "tenants.view_roles",
      },
    ],
  },

  // ─── Permissions Gating ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.roleEndpointsTitle",
    id: "permissions",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Tenants/creation-permissions",
        descriptionKey: "apiReference.tenantApi.creationPermissionsDesc",
        auth: "tenants.create",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/permissions",
        descriptionKey: "apiReference.tenantApi.permissionsDesc",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/permissions/grouped",
        descriptionKey: "apiReference.tenantApi.permissionsGroupedDesc",
        auth: "tenants.view",
      },
      {
        method: "PUT",
        path: "/api/v1/Tenants/{id}/permissions",
        descriptionKey: "apiReference.tenantApi.updatePermissionsDesc",
        auth: "tenants.update",
      },
    ],
  },

  // ─── Settings & Branding ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.tenantApi.settingsTitle",
    id: "settings",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/settings",
        descriptionKey: "apiReference.tenantApi.getSettingsDesc",
        auth: "tenants.view",
      },
      {
        method: "PUT",
        path: "/api/v1/Tenants/{id}/settings",
        descriptionKey: "apiReference.tenantApi.updateSettingsDesc",
        auth: "tenants.update",
      },
      {
        method: "POST",
        path: "/api/v1/Tenants/{id}/logo",
        descriptionKey: "apiReference.tenantApi.uploadLogoDesc",
        auth: "tenants.update",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "GET /settings Response",
        language: "json",
        filename: "GET /api/v1/Tenants/{id}/settings — Response",
        code: `{
  "maxAdmins": 50,
  "maxRoles": 100,
  "maxSubTenants": 10,
  "passwordMinLength": 8,
  "passwordRequireUppercase": true,
  "passwordRequireNumber": true,
  "passwordRequireSpecial": true,
  "passwordExpiryDays": 90,
  "loginLockoutThreshold": 5,
  "loginLockoutMinutes": 15,
  "require2FA": false,
  "auditRetentionDays": 90,
  "auditEnabled": true,
  "logoUrl": "/uploads/tenants/acme-logo.png",
  "faviconUrl": "/uploads/tenants/favicon.ico",
  "primaryColor": "#1E40AF",
  "secondaryColor": "#1D4ED8",
  "companyName": "Acme Corporation",
  "loginHeadline": "Welcome to Acme Corp",
  "loginSubtitle": "Access the secure admin panel",
  "identityProviderMode": "Single",
  "loginBrandingJson": "{}",
  "dashboardThemeJson": "{}",
  "termsOfServiceUrl": "https://scripe.com/tos",
  "privacyPolicyUrl": "https://scripe.com/privacy"
}`,
      },
      {
        label: "PUT /settings Request",
        language: "json",
        filename: "PUT /api/v1/Tenants/{id}/settings — Request",
        code: `// Body contains updated fields to override parent defaults or edit values
{
  "maxAdmins": 50,
  "maxRoles": 100,
  "maxSubTenants": 10,
  "passwordMinLength": 10,
  "passwordRequireUppercase": true,
  "passwordRequireNumber": true,
  "passwordRequireSpecial": true,
  "passwordExpiryDays": 30,
  "loginLockoutThreshold": 3,
  "loginLockoutMinutes": 30,
  "require2FA": true,
  "companyName": "Acme Corp Extended",
  "primaryColor": "#1E3A8A"
}`,
      },
    ],
  },

  // ─── Domain Management ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.authApi.configTitle", // Custom configurations
    id: "domain-management",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Tenants/{id}/domains",
        descriptionKey: "apiReference.tenantApi.getDomainsDesc",
        auth: "tenants.view",
      },
      {
        method: "POST",
        path: "/api/v1/Tenants/{id}/domains",
        descriptionKey: "apiReference.tenantApi.addDomainDesc",
        auth: "tenants.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/Tenants/{id}/domains/{domainId}",
        descriptionKey: "apiReference.tenantApi.removeDomainDesc",
        auth: "tenants.update",
      },
      {
        method: "PUT",
        path: "/api/v1/Tenants/{id}/domains/{domainId}/primary",
        descriptionKey: "apiReference.tenantApi.setPrimaryDomainDesc",
        auth: "tenants.update",
      },
      {
        method: "POST",
        path: "/api/v1/Tenants/{id}/domains/{domainId}/verify",
        descriptionKey: "apiReference.tenantApi.verifyDomainDesc",
        auth: "tenants.update",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "GET /domains Response",
        language: "json",
        filename: "GET /api/v1/Tenants/{id}/domains — Response",
        code: `{
  "tenantId": "tenant-uuid-f8e7d6c5",
  "domains": [
    {
      "id": "domain-uuid-1",
      "domainName": "acme.myplatform.com",
      "isPrimary": true,
      "isCustom": false,
      "isVerified": true
    },
    {
      "id": "domain-uuid-2",
      "domainName": "custom.acme.com",
      "isPrimary": false,
      "isCustom": true,
      "isVerified": false,
      "verificationToken": "scripe-verification-token-xyz123...",
      "dnsRecordType": "TXT",
      "dnsRecordValue": "scripe-verification-token-xyz123..."
    }
  ]
}`,
      },
      {
        label: "POST /domains Request",
        language: "json",
        filename: "POST /api/v1/Tenants/{id}/domains — Request",
        code: `{
  "domain": "custom.acme.com"
}`,
      },
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "apiReference.tenantApi.settingsNote",
  },
];

registerPage({
  slug: "api-reference/tenant-api",
  titleKey: "apiReference.tenantApi.title",
  descriptionKey: "apiReference.tenantApi.description",
  category: "api-reference",
  order: 5,
  sections,
  relatedSlugs: [
    "api-reference/admin-api",
    "api-reference/role-permission-api",
    "security/data-protection",
  ],
  lastUpdated: "2026-06-28",
});
