import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.adminApi.intro" },

  // ─── Base Config ──────────────────────────────────────────
  {
    type: "table",
    headers: ["Setting", "Value"],
    rows: [
      ["Base URL", "/api/v1/admins"],
      ["Auth Required", "Yes — Bearer Token + AdminOnly"],
      ["Permission Prefix", "admins.*"],
      ["Rate Limit", "global (100 req/min)"],
    ],
  },

  // ─── CRUD Endpoints ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminApi.crudTitle",
    id: "crud",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/admins",
        descriptionKey: "apiReference.adminApi.listDesc",
        auth: "admins.view",
      },
      {
        method: "GET",
        path: "/api/v1/admins/{id}",
        descriptionKey: "apiReference.adminApi.getByIdDesc",
        auth: "admins.view",
      },
      {
        method: "POST",
        path: "/api/v1/admins",
        descriptionKey: "apiReference.adminApi.createDesc",
        auth: "admins.create",
      },
      {
        method: "PUT",
        path: "/api/v1/admins/{id}",
        descriptionKey: "apiReference.adminApi.updateDesc",
        auth: "admins.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/admins/{id}",
        descriptionKey: "apiReference.adminApi.deleteDesc",
        auth: "admins.delete",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "List (GET)",
        language: "json",
        filename: "GET /admins?page=1&pageSize=10&search=john",
        code: `{
  "items": [
    {
      "id": "admin-uuid",
      "email": "admin@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": { "id": "role-uuid", "name": "SuperAdmin" },
      "isActive": true,
      "isBlocked": false,
      "lastLoginAt": "2026-02-20T14:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}`,
      },
      {
        label: "Create (POST)",
        language: "json",
        filename: "POST /admins — Request",
        code: `{
  "email": "newadmin@acme.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "AdminP@ss123!",
  "roleId": "role-uuid",
  "tenantId": "tenant-uuid",
  "phoneNumber": "+1234567890"
}`,
      },
      {
        label: "Update (PUT)",
        language: "json",
        filename: "PUT /admins/{id} — Request",
        code: `{
  "firstName": "Janet",
  "lastName": "Smith-Jones",
  "roleId": "new-role-uuid",
  "phoneNumber": "+9876543210",
  "isActive": true
}`,
      },
    ],
  },

  // ─── Account Actions ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminApi.actionsTitle",
    id: "actions",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/admins/{id}/activate",
        descriptionKey: "apiReference.adminApi.activateDesc",
        auth: "admins.update",
      },
      {
        method: "POST",
        path: "/api/v1/admins/{id}/deactivate",
        descriptionKey: "apiReference.adminApi.deactivateDesc",
        auth: "admins.update",
      },
      {
        method: "POST",
        path: "/api/v1/admins/{id}/block",
        descriptionKey: "apiReference.adminApi.blockDesc",
        auth: "admins.update",
      },
      {
        method: "POST",
        path: "/api/v1/admins/{id}/unblock",
        descriptionKey: "apiReference.adminApi.unblockDesc",
        auth: "admins.update",
      },
      {
        method: "POST",
        path: "/api/v1/admins/{id}/unlock",
        descriptionKey: "apiReference.adminApi.unlockDesc",
        auth: "admins.update",
      },
      {
        method: "POST",
        path: "/api/v1/admins/{id}/reset-password",
        descriptionKey: "apiReference.adminApi.resetPasswordDesc",
        auth: "admins.update",
      },
    ],
  },

  // ─── Bulk Operations ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminApi.bulkTitle",
    id: "bulk-operations",
  },
  { type: "paragraph", contentKey: "apiReference.adminApi.bulkIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/admins/bulk-activate",
        descriptionKey: "apiReference.adminApi.bulkActivateDesc",
        auth: "admins.update",
      },
      {
        method: "POST",
        path: "/api/v1/admins/bulk-deactivate",
        descriptionKey: "apiReference.adminApi.bulkDeactivateDesc",
        auth: "admins.update",
      },
      {
        method: "POST",
        path: "/api/v1/admins/bulk-delete",
        descriptionKey: "apiReference.adminApi.bulkDeleteDesc",
        auth: "admins.delete",
      },
      {
        method: "POST",
        path: "/api/v1/admins/bulk-delete-all",
        descriptionKey: "apiReference.adminApi.bulkDeleteAllDesc",
        auth: "admins.delete",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Bulk by IDs",
        language: "json",
        filename: "POST /admins/bulk-delete — By ID Selection",
        code: `{
  "ids": [
    "admin-uuid-1",
    "admin-uuid-2",
    "admin-uuid-3"
  ]
}

// Response (200)
{ "affected": 3, "message": "3 admins deleted" }`,
      },
      {
        label: "Bulk All (Filtered)",
        language: "json",
        filename: "POST /admins/bulk-delete-all — Filter-Based",
        code: `// Deletes ALL matching the current filter (scoped to tenant)
{
  "filter": {
    "search": "inactive",
    "isActive": false,
    "roleId": "role-uuid"
  },
  "excludeIds": ["protected-admin-uuid"]
}

// Response (200)
{ "affected": 47, "message": "47 admins deleted" }`,
      },
    ],
  },

  // ─── Impersonation ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminApi.impersonationTitle",
    id: "impersonation",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/admins/{id}/impersonate",
        descriptionKey: "apiReference.adminApi.impersonateDesc",
        auth: "SuperAdmin only",
      },
      {
        method: "POST",
        path: "/api/v1/admins/stop-impersonation",
        descriptionKey: "apiReference.adminApi.stopImpersonateDesc",
        auth: "Impersonating admin",
      },
      {
        method: "POST",
        path: "/api/v1/admins/{id}/transfer",
        descriptionKey: "apiReference.adminApi.transferDesc",
        auth: "SuperAdmin only",
      },
      {
        method: "POST",
        path: "/api/v1/admins/{id}/protect",
        descriptionKey: "apiReference.adminApi.protectDesc",
        auth: "SuperAdmin only",
      },
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "apiReference.adminApi.impersonationWarning",
  },

  // ─── Query Parameters ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminApi.queryParamsTitle",
    id: "query-params",
  },
  {
    type: "table",
    headers: ["Parameter", "Type", "Default", "Description"],
    rows: [
      ["page", "int", "1", "Page number (1-based)"],
      ["pageSize", "int", "10", "Items per page (max 100)"],
      ["search", "string", "—", "Search in name, email"],
      ["sortBy", "string", "createdAt", "Sort field"],
      ["sortDirection", "string", "desc", "asc or desc"],
      ["isActive", "bool?", "—", "Filter by active status"],
      ["isBlocked", "bool?", "—", "Filter by block status"],
      ["roleId", "Guid?", "—", "Filter by role"],
    ],
  },
];

registerPage({
  slug: "api-reference/admin-api",
  titleKey: "apiReference.adminApi.title",
  descriptionKey: "apiReference.adminApi.description",
  category: "api-reference",
  order: 4,
  sections,
  relatedSlugs: [
    "api-reference/authentication-api",
    "api-reference/role-permission-api",
    "api-reference/tenant-api",
  ],
  lastUpdated: "2026-02-20",
});
