import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "apiReference.tenantApi.intro" },

      // ─── Base Config ──────────────────────────────────────────
      {
            type: "table",
            headers: ["Setting", "Value"],
            rows: [
                  ["Base URL", "/api/v1/tenants"],
                  ["Auth Required", "Yes — Bearer Token"],
                  ["Permission Prefix", "tenants.*"],
                  ["Tenant-Scoped", "Parent tenant sees children"],
            ],
      },

      // ─── CRUD Endpoints ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.tenantApi.crudTitle", id: "crud",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants", descriptionKey: "apiReference.tenantApi.listDesc", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}", descriptionKey: "apiReference.tenantApi.getByIdDesc", auth: "tenants.view" },
                  { method: "POST", path: "/api/v1/tenants", descriptionKey: "apiReference.tenantApi.createDesc", auth: "tenants.create" },
                  { method: "PUT", path: "/api/v1/tenants/{id}", descriptionKey: "apiReference.tenantApi.updateDesc", auth: "tenants.update" },
                  { method: "DELETE", path: "/api/v1/tenants/{id}", descriptionKey: "apiReference.tenantApi.deleteDesc", auth: "tenants.delete" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Get Tenant",
                        language: "json",
                        filename: "GET /tenants/{id} — Response",
                        code: `{
  "id": "tenant-uuid",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "logoUrl": "/uploads/tenants/acme-logo.png",
  "parentTenantId": null,
  "isActive": true,
  "settings": {
    "allowUserRegistration": true,
    "defaultLanguage": "en",
    "maxAdmins": 50,
    "maxUsers": 1000,
    "maxStorageMB": 5120,
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireDigit": true,
      "requireSpecialChar": true,
      "historyCount": 5
    }
  },
  "statistics": {
    "adminCount": 12,
    "userCount": 342,
    "roleCount": 8,
    "storageUsedMB": 1240
  },
  "createdAt": "2025-06-15T00:00:00Z"
}`,
                  },
                  {
                        label: "Create Tenant",
                        language: "json",
                        filename: "POST /tenants — Request",
                        code: `{
  "name": "New Branch Office",
  "slug": "branch-office",
  "parentTenantId": "parent-tenant-uuid",
  "settings": {
    "allowUserRegistration": false,
    "defaultLanguage": "ar",
    "maxAdmins": 10,
    "maxUsers": 100
  }
}`,
                  },
            ],
      },

      // ─── Hierarchy ────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.tenantApi.hierarchyTitle", id: "hierarchy",
      },
      { type: "paragraph", contentKey: "apiReference.tenantApi.hierarchyIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/hierarchy", descriptionKey: "apiReference.tenantApi.hierarchyDesc", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/children", descriptionKey: "apiReference.tenantApi.childrenDesc", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/my-children", descriptionKey: "apiReference.tenantApi.myChildrenDesc", auth: "Bearer Token" },
                  { method: "GET", path: "/api/v1/tenants/{id}/statistics", descriptionKey: "apiReference.tenantApi.statsDesc", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/admins", descriptionKey: "apiReference.tenantApi.adminsDesc", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/roles", descriptionKey: "apiReference.tenantApi.rolesDesc", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/permissions", descriptionKey: "apiReference.tenantApi.permissionsDesc", auth: "tenants.view" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "GET /tenants/hierarchy — Tree Response",
            code: `[
  {
    "id": "root-uuid",
    "name": "Headquarters",
    "slug": "hq",
    "level": 0,
    "children": [
      {
        "id": "branch-1-uuid",
        "name": "East Branch",
        "slug": "east-branch",
        "level": 1,
        "children": [
          {
            "id": "sub-branch-uuid",
            "name": "East Sub-Office",
            "level": 2,
            "children": []
          }
        ]
      },
      {
        "id": "branch-2-uuid",
        "name": "West Branch",
        "slug": "west-branch",
        "level": 1,
        "children": []
      }
    ]
  }
]`,
      },

      // ─── Settings ─────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.tenantApi.settingsTitle", id: "settings",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/{id}/settings", descriptionKey: "apiReference.tenantApi.getSettingsDesc", auth: "tenants.view" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/settings", descriptionKey: "apiReference.tenantApi.updateSettingsDesc", auth: "tenants.update" },
                  { method: "PUT", path: "/api/v1/tenants/my-settings", descriptionKey: "apiReference.tenantApi.mySettingsDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/tenants/{id}/logo", descriptionKey: "apiReference.tenantApi.uploadLogoDesc", auth: "tenants.update" },
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
      relatedSlugs: ["api-reference/admin-api", "api-reference/role-permission-api", "security/data-protection"],
      lastUpdated: "2026-02-20",
});
