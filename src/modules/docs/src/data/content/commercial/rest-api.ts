import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.restApi.intro" },
      { type: "heading", level: 2, titleKey: "commercial.restApi.principlesTitle", id: "api-design-principles" },
      {
            type: "table", headers: ["Principle", "Implementation"], rows: [
                  ["RESTful", "Standard HTTP methods (GET, POST, PUT, DELETE)"],
                  ["Versioned", "URL-segment versioning: /api/v1/admins"],
                  ["Consistent errors", "All errors wrapped in Result<T> with error code + message"],
                  ["Paginated", "List endpoints return PagedResult<T> with metadata"],
                  ["Filterable", "Query parameters for search, sort, filter"],
                  ["Authenticated", "JWT Bearer tokens via HttpOnly cookie"],
                  ["CSRF Protected", "Mutating endpoints require X-CSRF-Token header"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.restApi.authTitle", id: "authentication-endpoints" },
      {
            type: "table", headers: ["Method", "Endpoint", "Auth", "Purpose"], rows: [
                  ["POST", "/auth/admin/login", "Open", "Admin login with email/password"],
                  ["POST", "/auth/admin/register", "Open", "Admin self-registration"],
                  ["POST", "/auth/admin/refresh", "Cookie", "Rotate access + refresh tokens"],
                  ["POST", "/auth/admin/logout", "Auth", "Invalidate tokens"],
                  ["GET", "/auth/admin/me", "Auth", "Current admin profile"],
                  ["POST", "/auth/admin/otp/verify", "Auth", "Verify OTP code"],
                  ["POST", "/auth/admin/impersonate/{id}", "Admin", "Impersonate another admin"],
                  ["POST", "/auth/admin/stop-impersonation", "Admin", "Return to own identity"],
                  ["POST", "/auth/user/login", "Open", "User login"],
                  ["POST", "/auth/user/register", "Open", "User registration"],
                  ["POST", "/auth/user/refresh", "Cookie", "User token rotation"],
                  ["POST", "/auth/user/logout", "Auth", "User logout"],
                  ["GET", "/auth/user/me", "Auth", "Current user profile"],
                  ["POST", "/auth/user/otp/verify", "Auth", "User OTP verification"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.restApi.adminTitle", id: "admin-management" },
      {
            type: "table", headers: ["Method", "Endpoint", "Permission", "Purpose"], rows: [
                  ["GET", "/admins", "admins.view", "List admins (paginated)"],
                  ["GET", "/admins/{id}", "admins.view", "Admin detail"],
                  ["POST", "/admins", "admins.create", "Create admin"],
                  ["PUT", "/admins/{id}", "admins.edit", "Update admin"],
                  ["DELETE", "/admins/{id}", "admins.delete", "Soft-delete admin"],
                  ["PUT", "/admins/{id}/active", "admins.block", "Toggle block status"],
                  ["PUT", "/admins/{id}/roles/sync", "admins.edit", "Replace all role assignments"],
                  ["POST", "/admins/bulk/activate", "admins.block", "Bulk activate"],
                  ["POST", "/admins/bulk/deactivate", "admins.block", "Bulk deactivate"],
                  ["POST", "/admins/bulk/delete", "admins.delete", "Bulk delete"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.restApi.rolesTitle", id: "roles-permissions" },
      {
            type: "table", headers: ["Method", "Endpoint", "Permission", "Purpose"], rows: [
                  ["GET", "/roles", "roles.view", "List roles"],
                  ["POST", "/roles", "roles.create", "Create role"],
                  ["PUT", "/roles/{id}", "roles.edit", "Update role"],
                  ["DELETE", "/roles/{id}", "roles.delete", "Delete role"],
                  ["GET", "/roles/{id}/permissions", "roles.view", "Role's permissions"],
                  ["PUT", "/roles/{id}/permissions", "roles.assign", "Set permissions"],
                  ["GET", "/permissions", "roles.view", "All system permissions"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.restApi.responseTitle", id: "response-formats" },
      {
            type: "code", language: "json", filename: "Success Response",
            code: `{
  "isSuccess": true,
  "value": {
    "id": "550e8400-...",
    "name": "John Doe",
    "email": "john@acme.com"
  }
}`,
      },
      {
            type: "code", language: "json", filename: "Paginated Response",
            code: `{
  "isSuccess": true,
  "value": {
    "items": [...],
    "totalCount": 150,
    "pageSize": 10,
    "currentPage": 2,
    "totalPages": 15,
    "hasPrevious": true,
    "hasNext": true
  }
}`,
      },
      {
            type: "code", language: "json", filename: "Error Response",
            code: `{
  "isSuccess": false,
  "error": {
    "code": "ADMIN_EMAIL_DUPLICATE",
    "message": "An admin with this email already exists"
  }
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.restApi.rateLimitTitle", id: "rate-limiting" },
      {
            type: "table", headers: ["Endpoint Group", "Limit", "Window"], rows: [
                  ["Authentication", "10 requests", "1 minute"],
                  ["All other endpoints", "100 requests", "1 minute"],
            ],
      },
];

registerPage({
      slug: "commercial/rest-api",
      titleKey: "commercial.restApi.title",
      descriptionKey: "commercial.restApi.description",
      category: "commercial-integration",
      order: 1,
      sections,
      relatedSlugs: ["commercial/webhook-integration", "commercial/auth-security"],
      lastUpdated: "2026-02-19",
});
