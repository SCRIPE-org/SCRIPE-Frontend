import { registerPage } from "../../repositories/DocsRepository";
registerPage({
  slug: "architecture/backend",
  titleKey: "architecture.backend.title",
  descriptionKey: "architecture.backend.description",
  category: "architecture",
  order: 2,
  sections: [
    { type: "paragraph", contentKey: "architecture.backend.description" },
    { type: "heading", level: 2, titleKey: "architecture.backend.title", id: "pipeline" },
    { type: "paragraph", contentKey: "architecture.backend.description" },
    {
      type: "flowchart",
      title: "MediatR Pipeline",
      direction: "vertical",
      nodes: [
        { id: "request", label: "HTTP Request", type: "default" },
        { id: "middleware", label: "Middleware Stack", type: "info" },
        { id: "validation", label: "ValidationBehavior", type: "warning" },
        { id: "auth", label: "AuthorizationBehavior", type: "danger" },
        { id: "audit", label: "AuditBehavior", type: "info" },
        { id: "handler", label: "Command/Query Handler", type: "success" },
        { id: "response", label: "Result<T>", type: "primary" },
      ],
      connections: [
        { from: "request", to: "middleware" },
        { from: "middleware", to: "validation", label: "MediatR" },
        { from: "validation", to: "auth", label: "Valid ✓" },
        { from: "auth", to: "audit", label: "Authorized ✓" },
        { from: "audit", to: "handler", label: "Logged" },
        { from: "handler", to: "response" },
      ],
    },
    {
      type: "table",
      headers: ["Behavior", "Purpose", "Order"],
      rows: [
        ["ValidationBehavior", "Runs FluentValidation rules", "1"],
        ["AuthorizationBehavior", "Server-side permission check", "2"],
        ["AuditBehavior", "Logs command execution details", "3"],
      ],
    },
    { type: "heading", level: 2, titleKey: "architecture.backend.title", id: "result-pattern" },
    {
      type: "code",
      language: "csharp",
      filename: "Result Pattern",
      code: `public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public AppError? Error { get; }
    
    public static Result<T> Ok(T value) => new(value);
    public static Result<T> Fail(AppError error) => new(error);
}`,
    },
    { type: "info", variant: "tip", contentKey: "architecture.backend.description" },
  ],
  relatedSlugs: ["architecture/cqrs", "architecture/overview"],
});
