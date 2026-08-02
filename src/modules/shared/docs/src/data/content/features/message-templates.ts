import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Template Architecture ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.messageTemplates.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.messageTemplates.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Template Architecture",
    nodes: [
      { id: "ctrl", label: "MessageTemplatesController", type: "default" },
      { id: "crud", label: "CRUD Operations", type: "info" },
      { id: "preview", label: "Preview Rendering", type: "info" },
      { id: "itr", label: "ITemplateRenderer", type: "primary" },
      { id: "scriban", label: "Scriban Engine (Liquid-like)", type: "success" },
      { id: "email", label: "EmailService", type: "warning" },
      { id: "notif", label: "NotificationService", type: "warning" },
      { id: "webhook", label: "WebhookService", type: "warning" },
    ],
    connections: [
      { from: "ctrl", to: "crud" },
      { from: "ctrl", to: "preview" },
      { from: "preview", to: "itr" },
      { from: "itr", to: "scriban" },
      { from: "email", to: "itr" },
      { from: "notif", to: "itr" },
      { from: "webhook", to: "itr" },
    ],
  },

  // ─── Scriban Syntax ─────────────────────────────────
  { type: "heading", level: 2, titleKey: "features.messageTemplates.syntaxTitle", id: "syntax" },
  {
    type: "code",
    language: "html",
    filename: "Scriban Template Syntax",
    code: `<!-- Variable substitution -->
Hello {{ admin.name }},

<!-- Conditional content -->
{{ if admin.is_protected }}
  You are the super admin for {{ tenant.name }}.
{{ end }}

<!-- Loops -->
{{ for role in admin.roles }}
  - {{ role.name }}
{{ end }}

<!-- Filters (pipes) -->
Created: {{ created_at | date.to_string "%B %d, %Y" }}
Amount: {{ amount | math.format "0.00" }}`,
  },

  // ─── Built-in Templates ─────────────────────────────
  { type: "heading", level: 2, titleKey: "features.messageTemplates.builtInTitle", id: "built-in" },
  {
    type: "table",
    headers: ["Template Key", "Trigger", "Variables"],
    rows: [
      ["welcome_admin", "Admin creation", "admin.name, admin.email, tenant.name, login_url"],
      ["password_reset", "Forgot password", "admin.name, reset_url, expiry_minutes"],
      ["otp_code", "Two-factor auth", "admin.name, otp_code, expiry_minutes"],
      ["admin_blocked", "Account blocked", "admin.name, reason, support_email"],
      ["admin_unblocked", "Account unblocked", "admin.name, login_url"],
      ["email_verification", "Email verification", "admin.name, verification_url, expiry_hours"],
    ],
  },

  // ─── MessageTemplate Entity ─────────────────────────
  { type: "heading", level: 2, titleKey: "features.messageTemplates.entityTitle", id: "entity" },
  {
    type: "code",
    language: "csharp",
    filename: "MessageTemplate.cs",
    code: `public class MessageTemplate : AuditableEntity<Guid>
{
    [Required] [MaxLength(100)]
    public string Key { get; set; } = null!;       // Unique key, e.g., "welcome_admin"
    
    public MessageChannel Channel { get; set; }    // Email, SMS, Push
    
    [MaxLength(500)]
    public string? Subject { get; set; }           // Subject with variables
    
    [Required] [MaxLength(50000)]
    public string Body { get; set; } = null!;      // HTML/Text body with Scriban template syntax
    
    [Required] [MaxLength(10)]
    public string Language { get; set; } = "en";   // "en" or "ar"
    
    public new bool IsActive { get; set; } = true;
    public Guid? TenantId { get; set; }            // Null = system-wide, set = tenant override
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [MaxLength(4000)]
    public string? PlaceholderSchema { get; set; } // JSON array of placehoders (key, type, required)
    
    [MaxLength(2000)]
    public string? DesignVariables { get; set; }   // Theme-able CSS variables in JSON format
    
    public int Version { get; set; } = 1;          // Auto-incremented version number
    
    [MaxLength(50)]
    public string? Category { get; set; }          // e.g. Transactional, Marketing
    
    [MaxLength(500)]
    public string? Tags { get; set; }
}`,
  },

  // ─── Template Renderer & Fallbacks ──────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.messageTemplates.rendererTitle",
    id: "renderer",
  },
  {
    type: "code",
    language: "csharp",
    filename: "TemplateRenderer.cs",
    code: `public class TemplateRenderer : ITemplateRenderer
{
    private static string RenderWithScriban(string templateText, Dictionary<string, object> data)
    {
        var parsedTemplate = Template.Parse(templateText);

        if (parsedTemplate.HasErrors)
        {
            // Syntax error fallback: Safe literal double curly braces replacement
            var result = templateText;
            foreach (var kvp in data)
            {
                result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value?.ToString() ?? "");
            }
            return result;
        }

        var scriptObject = new ScriptObject();
        foreach (var kvp in data)
        {
            scriptObject[kvp.Key] = kvp.Value;
        }

        var context = new TemplateContext();
        context.PushGlobal(scriptObject);
        return parsedTemplate.Render(context);
    }
}`,
  },

  // ─── Placeholder Schema & Validation ────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.messageTemplates.placeholderTitle",
    id: "placeholder-validation",
  },
  { type: "paragraph", contentKey: "features.messageTemplates.placeholderIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "UpdateMessageTemplateCommandValidator.cs",
    code: `// Validation rule enforcing correct JSON syntax on placeholder schema & design variables
RuleFor(x => x.PlaceholderSchema)
    .MaximumLength(4000)
    .Must(BeValidJson)
    .When(x => !string.IsNullOrWhiteSpace(x.PlaceholderSchema))
    .WithMessage("PlaceholderSchema must be valid JSON.");

private static bool BeValidJson(string? json)
{
    if (string.IsNullOrWhiteSpace(json)) return true;
    try
    {
        System.Text.Json.JsonDocument.Parse(json);
        return true;
    }
    catch { return false; }
}`,
  },

  // ─── Template Version Control ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.messageTemplates.versionTitle",
    id: "version-control",
  },
  { type: "paragraph", contentKey: "features.messageTemplates.versionIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "UpdateMessageTemplateCommandHandler.cs",
    code: `// Validate Scriban syntax and increment template version on change
var parsed = Template.Parse(request.Body);
if (parsed.HasErrors)
    return Error.Validation("Template body has syntax errors.");

template.Subject = request.Subject;
template.Body = request.Body;
template.PlaceholderSchema = request.PlaceholderSchema;
template.Version += 1; // Auto-increment version

await _unitOfWork.SaveChangesAsync(cancellationToken);`,
  },

  // ─── Controller Endpoints ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.messageTemplates.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/message-templates",
        descriptionKey: "List all templates",
        auth: "JWT",
        permission: "message-templates.view",
      },
      {
        method: "GET",
        path: "/message-templates/{id}",
        descriptionKey: "Get template detail",
        auth: "JWT",
        permission: "message-templates.view",
      },
      {
        method: "POST",
        path: "/message-templates",
        descriptionKey: "Create custom template",
        auth: "JWT",
        permission: "message-templates.create",
      },
      {
        method: "PUT",
        path: "/message-templates/{id}",
        descriptionKey: "Update template",
        auth: "JWT",
        permission: "message-templates.update",
      },
      {
        method: "DELETE",
        path: "/message-templates/{id}",
        descriptionKey: "Delete (non-system only)",
        auth: "JWT",
        permission: "message-templates.delete",
      },
      {
        method: "POST",
        path: "/message-templates/preview",
        descriptionKey: "Render with sample data",
        auth: "JWT",
        permission: "message-templates.view",
      },
    ],
  },

  // ─── Preview Feature ────────────────────────────────
  { type: "heading", level: 2, titleKey: "features.messageTemplates.previewTitle", id: "preview" },
  { type: "paragraph", contentKey: "features.messageTemplates.previewIntro" },
  {
    type: "code",
    language: "json",
    filename: "Preview Request",
    code: `// POST /api/v1/message-templates/preview
{
  "subject": "Welcome {{ admin.name }}",
  "body": "<p>Hello {{ admin.name }}, welcome to {{ tenant.name }}!</p>",
  "sampleData": {
    "admin": { "name": "John Doe", "email": "john@example.com" },
    "tenant": { "name": "ACME Corp" }
  }
}

// Response:
// {
//   "subject": "Welcome John Doe",
//   "body": "<p>Hello John Doe, welcome to ACME Corp!</p>"
// }`,
  },
];

registerPage({
  slug: "features/message-templates",
  titleKey: "features.messageTemplates.title",
  descriptionKey: "features.messageTemplates.description",
  category: "features",
  order: 13,
  sections,
  relatedSlugs: ["features/email-system", "features/notification-system"],
  lastUpdated: "2026-02-20",
});
