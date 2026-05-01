import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.apiDesign.intro" },

  // ─── RESTful Conventions ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.apiDesign.conventionsTitle",
    id: "conventions",
  },
  {
    type: "table",
    headers: ["Convention", "Pattern", "Example"],
    rows: [
      ["Resource naming", "Plural nouns", "/api/employees, /api/tenants"],
      ["HTTP methods", "Standard CRUD mapping", "GET=Read, POST=Create, PUT=Update, DELETE=Remove"],
      ["Pagination", "page + pageSize query params", "/api/employees?page=1&pageSize=20"],
      ["Filtering", "Query parameters", "/api/employees?department=eng&status=active"],
      ["Sorting", "orderBy query param", "/api/employees?orderBy=name:asc"],
      ["Search", "search query param", "/api/employees?search=john"],
      ["Versioning", "URL prefix (future)", "/api/v1/employees"],
      ["Nesting", "Sub-resources", "/api/tenants/{id}/users"],
    ],
  },

  // ─── Result Pattern ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.apiDesign.resultTitle", id: "result-pattern" },
  { type: "paragraph", contentKey: "commercial.apiDesign.resultContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Result Pattern — No Exceptions for Business Errors",
    code: `// Every handler returns Result<T>
public async Task<Result<EmployeeDto>> Handle(CreateEmployeeCommand cmd)
{
    // Validation happens in pipeline behavior (FluentValidation)
    
    var employee = Employee.Create(cmd.Name, cmd.Email);
    await _repository.AddAsync(employee);
    await _unitOfWork.SaveChangesAsync();
    
    return Result<EmployeeDto>.Success(_mapper.Map(employee));
}

// Controller auto-maps Result to HTTP response
// Result.Success → 200 OK
// Result.Failure → 400 Bad Request  
// Result.NotFound → 404 Not Found
// Result.Forbidden → 403 Forbidden`,
  },

  // ─── HTTP Status Codes ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.apiDesign.statusCodesTitle",
    id: "status-codes",
  },
  {
    type: "table",
    headers: ["Status Code", "Meaning", "When Used"],
    rows: [
      ["200 OK", "Success", "GET, PUT, PATCH operations"],
      ["201 Created", "Resource created", "POST operations"],
      ["204 No Content", "Success, no body", "DELETE operations"],
      ["400 Bad Request", "Validation error", "Invalid input data"],
      ["401 Unauthorized", "Not authenticated", "Missing or invalid JWT"],
      ["403 Forbidden", "Not authorized", "Insufficient permissions"],
      ["404 Not Found", "Resource missing", "Non-existent entity"],
      ["409 Conflict", "Duplicate resource", "Unique constraint violation"],
      ["429 Too Many Requests", "Rate limited", "Exceeds rate limit"],
      ["500 Internal Error", "Server error", "Unhandled exceptions"],
    ],
  },

  // ─── Error Response ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.apiDesign.errorTitle", id: "error-handling" },
  {
    type: "code",
    language: "json",
    filename: "Consistent Error Response Format",
    code: `{
  "isSuccess": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is already in use" },
    { "field": "name", "message": "Name must be at least 2 characters" }
  ],
  "traceId": "abc-123-def"
}`,
  },

  // ─── MediatR Pipeline ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.apiDesign.pipelineTitle", id: "pipeline" },
  { type: "paragraph", contentKey: "commercial.apiDesign.pipelineContent" },
  {
    type: "list",
    variant: "ordered",
    items: [
      "Request received → Controller forwards to MediatR",
      "ValidationBehavior → FluentValidation runs first",
      "AuthorizationBehavior → Permission checks",
      "TenantResolutionBehavior → Tenant context applied",
      "AuditBehavior → Audit entry created",
      "Handler execution → Business logic runs",
      "Response mapped → Result<T> → HTTP status code",
    ],
  },

  // ─── Swagger ────────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.apiDesign.swaggerTitle", id: "swagger" },
  { type: "paragraph", contentKey: "commercial.apiDesign.swaggerContent" },
];

registerPage({
  slug: "commercial/api-design",
  titleKey: "commercial.apiDesign.title",
  descriptionKey: "commercial.apiDesign.description",
  category: "commercial-developer",
  order: 3,
  sections,
  relatedSlugs: ["commercial/clean-architecture", "commercial/rest-api-overview"],
  lastUpdated: "2026-02-20",
});
