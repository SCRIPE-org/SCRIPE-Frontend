import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.restApiOverview.intro" },

      // ─── API Controllers ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.restApiOverview.controllersTitle", id: "controllers" },
      {
            type: "table",
            headers: [
                  "commercial.restApiOverview.tblCtrlHeader1",
                  "commercial.restApiOverview.tblCtrlHeader2",
                  "commercial.restApiOverview.tblCtrlHeader3"
            ],
            rows: [
                  ["commercial.restApiOverview.tblCtrlR1C1", "commercial.restApiOverview.tblCtrlR1C2", "commercial.restApiOverview.tblCtrlR1C3"],
                  ["commercial.restApiOverview.tblCtrlR2C1", "commercial.restApiOverview.tblCtrlR2C2", "commercial.restApiOverview.tblCtrlR2C3"],
                  ["commercial.restApiOverview.tblCtrlR3C1", "commercial.restApiOverview.tblCtrlR3C2", "commercial.restApiOverview.tblCtrlR3C3"],
                  ["commercial.restApiOverview.tblCtrlR4C1", "commercial.restApiOverview.tblCtrlR4C2", "commercial.restApiOverview.tblCtrlR4C3"],
                  ["commercial.restApiOverview.tblCtrlR5C1", "commercial.restApiOverview.tblCtrlR5C2", "commercial.restApiOverview.tblCtrlR5C3"],
                  ["commercial.restApiOverview.tblCtrlR6C1", "commercial.restApiOverview.tblCtrlR6C2", "commercial.restApiOverview.tblCtrlR6C3"],
                  ["commercial.restApiOverview.tblCtrlR7C1", "commercial.restApiOverview.tblCtrlR7C2", "commercial.restApiOverview.tblCtrlR7C3"],
                  ["commercial.restApiOverview.tblCtrlR8C1", "commercial.restApiOverview.tblCtrlR8C2", "commercial.restApiOverview.tblCtrlR8C3"],
                  ["commercial.restApiOverview.tblCtrlR9C1", "commercial.restApiOverview.tblCtrlR9C2", "commercial.restApiOverview.tblCtrlR9C3"],
                  ["commercial.restApiOverview.tblCtrlR10C1", "commercial.restApiOverview.tblCtrlR10C2", "commercial.restApiOverview.tblCtrlR10C3"],
                  ["commercial.restApiOverview.tblCtrlR11C1", "commercial.restApiOverview.tblCtrlR11C2", "commercial.restApiOverview.tblCtrlR11C3"],
                  ["commercial.restApiOverview.tblCtrlR12C1", "commercial.restApiOverview.tblCtrlR12C2", "commercial.restApiOverview.tblCtrlR12C3"],
                  ["commercial.restApiOverview.tblCtrlR13C1", "commercial.restApiOverview.tblCtrlR13C2", "commercial.restApiOverview.tblCtrlR13C3"],
                  ["commercial.restApiOverview.tblCtrlR14C1", "commercial.restApiOverview.tblCtrlR14C2", "commercial.restApiOverview.tblCtrlR14C3"],
                  ["commercial.restApiOverview.tblCtrlR15C1", "commercial.restApiOverview.tblCtrlR15C2", "commercial.restApiOverview.tblCtrlR15C3"],
                  ["commercial.restApiOverview.tblCtrlR16C1", "commercial.restApiOverview.tblCtrlR16C2", "commercial.restApiOverview.tblCtrlR16C3"],
                  ["commercial.restApiOverview.tblCtrlR17C1", "commercial.restApiOverview.tblCtrlR17C2", "commercial.restApiOverview.tblCtrlR17C3"],
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
                  "commercial.restApiOverview.lstSwagI1",
                  "commercial.restApiOverview.lstSwagI2",
                  "commercial.restApiOverview.lstSwagI3",
                  "commercial.restApiOverview.lstSwagI4",
                  "commercial.restApiOverview.lstSwagI5",
                  "commercial.restApiOverview.lstSwagI6",
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
