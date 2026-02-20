import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      // ─── Template Architecture ──────────────────────────
      { type: "heading", level: 2, titleKey: "features.messageTemplates.architectureTitle", id: "architecture" },
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
⚠️ You are the super admin for {{ tenant.name }}.
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

      // ─── Template Entity ────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.messageTemplates.entityTitle", id: "entity" },
      {
            type: "code",
            language: "csharp",
            filename: "MessageTemplate.cs",
            code: `public class MessageTemplate : AuditableEntity<Guid>
{
    [Required] [MaxLength(200)]
    public string Key { get; set; }           // Unique identifier e.g. "welcome_admin"
    
    [Required] [MaxLength(200)]
    public string SubjectEn { get; set; }     // English subject line
    
    [Required] [MaxLength(200)]
    public string SubjectAr { get; set; }     // Arabic subject line
    
    [Required]
    public string BodyEn { get; set; }        // English HTML body (Scriban)
    
    [Required]
    public string BodyAr { get; set; }        // Arabic HTML body (Scriban)
    
    public bool IsSystem { get; set; }        // System templates can't be deleted
    
    [MaxLength(2000)]
    public string? PlaceholderSchema { get; set; } // JSON schema of available variables
}`,
      },

      // ─── Template Renderer ──────────────────────────────
      { type: "heading", level: 2, titleKey: "features.messageTemplates.rendererTitle", id: "renderer" },
      {
            type: "code",
            language: "csharp",
            filename: "TemplateRenderer.cs",
            code: `public class TemplateRenderer : ITemplateRenderer
{
    public async Task<string> RenderAsync(string template, object data)
    {
        // Parse Scriban template
        var parsed = Template.Parse(template);
        if (parsed.HasErrors)
            throw new TemplateException(string.Join(", ", parsed.Messages));

        // Create script object from data
        var scriptObject = new ScriptObject();
        scriptObject.Import(data);

        var context = new TemplateContext();
        context.PushGlobal(scriptObject);

        return await parsed.RenderAsync(context);
    }
}`,
      },

      // ─── Controller Endpoints ───────────────────────────
      { type: "heading", level: 2, titleKey: "features.messageTemplates.endpointsTitle", id: "endpoints" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/message-templates", description: "List all templates", auth: "JWT", permission: "templates.view" },
                  { method: "GET", path: "/message-templates/{id}", description: "Get template detail", auth: "JWT", permission: "templates.view" },
                  { method: "POST", path: "/message-templates", description: "Create custom template", auth: "JWT", permission: "templates.create" },
                  { method: "PUT", path: "/message-templates/{id}", description: "Update template", auth: "JWT", permission: "templates.edit" },
                  { method: "DELETE", path: "/message-templates/{id}", description: "Delete (non-system only)", auth: "JWT", permission: "templates.delete" },
                  { method: "POST", path: "/message-templates/{id}/preview", description: "Render with sample data", auth: "JWT", permission: "templates.view" },
            ],
      },

      // ─── Preview Feature ────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.messageTemplates.previewTitle", id: "preview" },
      { type: "paragraph", contentKey: "features.messageTemplates.previewIntro" },
      {
            type: "code",
            language: "json",
            filename: "Preview Request",
            code: `// POST /message-templates/{id}/preview
{
  "data": {
    "admin": { "name": "John Doe", "email": "john@example.com" },
    "tenant": { "name": "ACME Corp" },
    "otp_code": "123456"
  }
}

// Response: rendered HTML body`,
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
