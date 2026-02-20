import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.apiDesign.intro" },
      { type: "heading", level: 2, titleKey: "commercial.apiDesign.conventionsTitle", id: "conventions" },
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
            ],
      },
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
