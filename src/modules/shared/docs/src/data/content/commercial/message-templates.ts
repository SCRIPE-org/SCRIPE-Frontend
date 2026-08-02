import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.messageTemplates.intro" },

  { type: "heading", level: 2, titleKey: "commercial.messageTemplates.engineTitle", id: "engine" },
  { type: "paragraph", contentKey: "commercial.messageTemplates.engineContent" },
  {
    type: "code",
    language: "html",
    filename: "Scriban Template Syntax",
    code: `<!-- Welcome Email Template -->
<h1>Welcome {{ user.display_name }}!</h1>
<p>Your account has been activated for <strong>{{ tenant.name }}</strong>.</p>

{{ if user.role == "admin" }}
  <p>As an administrator, you have full access to the dashboard.</p>
{{ else }}
  <p>Your role: {{ user.role | string.capitalize }}</p>
{{ end }}

<p>Login at: <a href="{{ login_url }}">{{ login_url }}</a></p>`,
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.messageTemplates.builtInTitle",
    id: "built-in",
  },
  {
    type: "table",
    headers: ["Template", "Trigger", "Variables Available"],
    rows: [
      ["Welcome Email", "User registration", "user.*, tenant.*, login_url"],
      ["Password Reset", "Reset request", "user.*, reset_url, expiry_hours"],
      ["Email Verification", "Email confirmation", "user.*, verification_url"],
      ["Role Assignment", "Role change", "user.*, role.*, assigned_by"],
      ["Account Locked", "Failed login threshold", "user.*, unlock_time, reason"],
      ["Tenant Invitation", "New tenant member", "user.*, tenant.*, invite_url"],
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.messageTemplates.bilingualTitle",
    id: "bilingual",
  },
  { type: "paragraph", contentKey: "commercial.messageTemplates.bilingualContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Bilingual Template Entity",
    code: `public class MessageTemplate : AuditableEntity
{
    public string Key { get; set; }          // "welcome-email"
    public string SubjectEn { get; set; }    // "Welcome to {tenant}"
    public string SubjectAr { get; set; }    // "مرحبا بك في {tenant}"
    public string BodyEn { get; set; }       // English Scriban template
    public string BodyAr { get; set; }       // Arabic Scriban template
    public string Category { get; set; }     // "Authentication"
    public bool IsActive { get; set; }       // Enable/disable
}`,
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.messageTemplates.previewTitle",
    id: "preview",
  },
  { type: "paragraph", contentKey: "commercial.messageTemplates.previewContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "globe",
        titleKey: "commercial.messageTemplates.previewLive",
        descriptionKey: "commercial.messageTemplates.previewLiveDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.messageTemplates.previewVariables",
        descriptionKey: "commercial.messageTemplates.previewVariablesDesc",
      },
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.messageTemplates.managementTitle",
    id: "management",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/templates",
        descriptionKey: "List all templates",
        auth: "Required",
        permission: "Templates.View",
      },
      {
        method: "GET",
        path: "/api/templates/{key}",
        descriptionKey: "Get template by key",
        auth: "Required",
        permission: "Templates.View",
      },
      {
        method: "PUT",
        path: "/api/templates/{id}",
        descriptionKey: "Update template content",
        auth: "Required",
        permission: "Templates.Update",
      },
      {
        method: "POST",
        path: "/api/templates/preview",
        descriptionKey: "Preview rendered output",
        auth: "Required",
        permission: "Templates.View",
      },
      {
        method: "POST",
        path: "/api/templates/reset/{key}",
        descriptionKey: "Reset to default",
        auth: "Required",
        permission: "Templates.Update",
      },
    ],
  },
];

registerPage({
  slug: "commercial/message-templates",
  titleKey: "commercial.messageTemplates.title",
  descriptionKey: "commercial.messageTemplates.description",
  category: "commercial-enterprise",
  order: 6,
  sections,
  relatedSlugs: ["commercial/localization-i18n", "commercial/email-integration"],
  lastUpdated: "2026-02-20",
});
