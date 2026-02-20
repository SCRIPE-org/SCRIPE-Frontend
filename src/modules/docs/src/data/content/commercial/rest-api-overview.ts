import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.restApiOverview.intro" },

      // ─── API Controllers ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.restApiOverview.controllersTitle", id: "controllers" },
      {
            type: "table",
            headers: ["Controller", "Endpoints", "Description"],
            rows: [
                  ["AuthController", "8", "Login, register, 2FA, password reset, sessions"],
                  ["UserController", "27", "CRUD, bulk ops, enterprise operations"],
                  ["RoleController", "12", "Role management, permission assignment"],
                  ["TenantController", "10", "Tenant lifecycle, settings, activation"],
                  ["AuditController", "6", "Audit log querying, export, streaming"],
                  ["NotificationController", "5", "Push notifications, mark read, preferences"],
                  ["FileController", "4", "Upload, download, delete, metadata"],
                  ["TemplateController", "5", "Email/message template CRUD, preview"],
                  ["MenuController", "6", "Dynamic menu management, overrides"],
                  ["SettingsController", "4", "System settings, tenant settings"],
                  ["DashboardController", "3", "KPI data, chart data, summaries"],
                  ["WebhookController", "5", "Subscription management, event catalog"],
                  ["RecycleBinController", "4", "Soft-deleted items, restore, purge"],
            ],
      },

      // ─── Response Format ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.restApiOverview.responseTitle", id: "response" },
      { type: "paragraph", contentKey: "commercial.restApiOverview.responseContent" },
      {
            type: "code",
            language: "json",
            filename: "Standard API Response",
            code: `// Success response
{
  "succeeded": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error response
{
  "succeeded": false,
  "errors": ["Validation failed: Email is required"],
  "errorCode": "VALIDATION_ERROR"
}`,
      },

      // ─── Pagination ─────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.restApiOverview.paginationTitle", id: "pagination" },
      {
            type: "code",
            language: "json",
            filename: "Paginated Response Format",
            code: `{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalCount": 95,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}`,
      },

      // ─── Authentication ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.restApiOverview.authTitle", id: "authentication" },
      { type: "paragraph", contentKey: "commercial.restApiOverview.authContent" },
      {
            type: "code",
            language: "text",
            filename: "Authentication Header",
            code: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000`,
      },

      // ─── Swagger / OpenAPI ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.restApiOverview.swaggerTitle", id: "swagger" },
      { type: "paragraph", contentKey: "commercial.restApiOverview.swaggerContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Auto-generated from controller attributes and XML documentation",
                  "Try-it-out mode for testing endpoints directly",
                  "JWT authentication support in the Swagger UI",
                  "Request/response schema documentation with examples",
                  "Grouped by controller for easy navigation",
                  "Available at /swagger in development mode",
            ],
      },
];

registerPage({
      slug: "commercial/rest-api-overview",
      titleKey: "commercial.restApiOverview.title",
      descriptionKey: "commercial.restApiOverview.description",
      category: "commercial-integration",
      order: 1,
      sections,
      relatedSlugs: ["commercial/webhook-integration", "commercial/api-design"],
      lastUpdated: "2026-02-20",
});
