// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.overview.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.baseInfoTitle",
    id: "base-info",
  },
  {
    type: "table",
    headers: ["Property", "Value"],
    rows: [
      ["Base URL", "https://localhost:5035/api/v1"],
      ["API Versioning", "URL path versioning (/api/v1/)"],
      ["Content Type", "application/json"],
      ["Authentication", "Bearer JWT token in Authorization header"],
      ["Rate Limiting", "100 requests/minute per IP"],
      ["Swagger UI", "https://localhost:5035/swagger"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.authEndpointsTitle",
    id: "auth-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/auth/login",
        descriptionKey: "Authenticate user with email/password",
        auth: "None",
      },
      {
        method: "POST",
        path: "/auth/refresh",
        descriptionKey: "Refresh access token using refresh token",
        auth: "Refresh Token",
      },
      {
        method: "POST",
        path: "/auth/logout",
        descriptionKey: "Invalidate refresh token and end session",
        auth: "Bearer",
      },
      {
        method: "POST",
        path: "/auth/verify-2fa",
        descriptionKey: "Verify two-factor authentication OTP",
        auth: "Partial",
      },
      {
        method: "POST",
        path: "/auth/forgot-password",
        descriptionKey: "Send password reset email",
        auth: "None",
      },
      {
        method: "POST",
        path: "/auth/reset-password",
        descriptionKey: "Reset password with token",
        auth: "None",
      },
      {
        method: "GET",
        path: "/auth/me",
        descriptionKey: "Get current authenticated user",
        auth: "Bearer",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.adminEndpointsTitle",
    id: "admin-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/admin",
        descriptionKey: "List admins with pagination/search",
        auth: "admin.read",
      },
      {
        method: "POST",
        path: "/admin",
        descriptionKey: "Create a new admin user",
        auth: "admin.create",
      },
      {
        method: "GET",
        path: "/admin/{id}",
        descriptionKey: "Get admin by ID with roles",
        auth: "admin.read",
      },
      {
        method: "PUT",
        path: "/admin/{id}",
        descriptionKey: "Update admin details",
        auth: "admin.update",
      },
      {
        method: "DELETE",
        path: "/admin/{id}",
        descriptionKey: "Soft-delete admin",
        auth: "admin.delete",
      },
      {
        method: "PUT",
        path: "/admin/{id}/block",
        descriptionKey: "Block/unblock admin account",
        auth: "admin.block",
      },
      {
        method: "POST",
        path: "/admin/{id}/impersonate",
        descriptionKey: "Impersonate admin user",
        auth: "admin.impersonate",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.userEndpointsTitle",
    id: "user-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/users",
        descriptionKey: "List users (tenant-scoped)",
        auth: "users.read",
      },
      { method: "POST", path: "/users", descriptionKey: "Create user", auth: "users.create" },
      {
        method: "GET",
        path: "/users/{id}",
        descriptionKey: "Get user details",
        auth: "users.read",
      },
      { method: "PUT", path: "/users/{id}", descriptionKey: "Update user", auth: "users.update" },
      {
        method: "DELETE",
        path: "/users/{id}",
        descriptionKey: "Soft-delete user",
        auth: "users.delete",
      },
      {
        method: "PUT",
        path: "/users/{id}/block",
        descriptionKey: "Block/unblock user",
        auth: "users.block",
      },
      {
        method: "PUT",
        path: "/users/{id}/avatar",
        descriptionKey: "Upload user avatar",
        auth: "users.update",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.roleEndpointsTitle",
    id: "role-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/roles",
        descriptionKey: "List roles (tenant-scoped)",
        auth: "roles.read",
      },
      {
        method: "POST",
        path: "/roles",
        descriptionKey: "Create custom role",
        auth: "roles.create",
      },
      {
        method: "GET",
        path: "/roles/{id}",
        descriptionKey: "Get role with permissions",
        auth: "roles.read",
      },
      { method: "PUT", path: "/roles/{id}", descriptionKey: "Update role", auth: "roles.update" },
      {
        method: "PUT",
        path: "/roles/{id}/permissions",
        descriptionKey: "Assign permissions to role",
        auth: "roles.assign",
      },
      {
        method: "DELETE",
        path: "/roles/{id}",
        descriptionKey: "Delete role",
        auth: "roles.delete",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.tenantEndpointsTitle",
    id: "tenant-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      { method: "GET", path: "/tenants", descriptionKey: "List tenants", auth: "tenants.read" },
      { method: "POST", path: "/tenants", descriptionKey: "Create tenant", auth: "tenants.create" },
      {
        method: "GET",
        path: "/tenants/{id}",
        descriptionKey: "Get tenant details + settings",
        auth: "tenants.read",
      },
      {
        method: "PUT",
        path: "/tenants/{id}",
        descriptionKey: "Update tenant",
        auth: "tenants.update",
      },
      {
        method: "PUT",
        path: "/tenants/{id}/logo",
        descriptionKey: "Upload tenant logo",
        auth: "tenants.update",
      },
      {
        method: "PUT",
        path: "/tenants/{id}/settings",
        descriptionKey: "Update tenant settings",
        auth: "tenants.settings",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.otherEndpointsTitle",
    id: "other-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/dashboard/stats",
        descriptionKey: "Dashboard KPI statistics",
        auth: "dashboard.stats",
      },
      {
        method: "GET",
        path: "/dashboard/charts",
        descriptionKey: "Chart data (users over time)",
        auth: "dashboard.charts",
      },
      { method: "GET", path: "/audit", descriptionKey: "Search audit logs", auth: "audit.read" },
      {
        method: "GET",
        path: "/audit/export",
        descriptionKey: "Export audit logs (CSV/PDF)",
        auth: "audit.export",
      },
      { method: "GET", path: "/menus", descriptionKey: "Get menu tree", auth: "menus.read" },
      { method: "POST", path: "/menus", descriptionKey: "Create menu item", auth: "menus.create" },
      {
        method: "PUT",
        path: "/menus/reorder",
        descriptionKey: "Reorder menu items",
        auth: "menus.reorder",
      },
      {
        method: "GET",
        path: "/notifications",
        descriptionKey: "List notifications",
        auth: "Bearer",
      },
      {
        method: "PUT",
        path: "/notifications/{id}/read",
        descriptionKey: "Mark notification read",
        auth: "Bearer",
      },
      {
        method: "GET",
        path: "/recycle-bin",
        descriptionKey: "List soft-deleted items",
        auth: "recycleBin.read",
      },
      {
        method: "PUT",
        path: "/recycle-bin/{id}/restore",
        descriptionKey: "Restore deleted item",
        auth: "recycleBin.restore",
      },
      { method: "GET", path: "/health", descriptionKey: "Health check (liveness)", auth: "None" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.overview.responseFormatTitle",
    id: "response-format",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Success Response",
        language: "json",
        code: `{
  "isSuccess": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "Operation completed successfully",
  "statusCode": 200
}`,
      },
      {
        label: "Error Response",
        language: "json",
        code: `{
  "isSuccess": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is already taken" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ],
  "statusCode": 400
}`,
      },
      {
        label: "Paginated Response",
        language: "json",
        code: `{
  "isSuccess": true,
  "data": {
    "items": [...],
    "totalCount": 250,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 25,
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "statusCode": 200
}`,
      },
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "apiReference.overview.swaggerTip",
  },
];

registerPage({
  slug: "api-reference/overview",
  titleKey: "apiReference.overview.title",
  descriptionKey: "apiReference.overview.description",
  category: "api-reference",
  order: 1,
  sections,
  relatedSlugs: ["features/authentication", "architecture/data-flow"],
  lastUpdated: "2026-02-19",
});
