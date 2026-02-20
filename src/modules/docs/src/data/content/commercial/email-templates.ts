import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.emailTemplates.intro" },
      { type: "heading", level: 2, titleKey: "commercial.emailTemplates.syntaxTitle", id: "scriban-syntax" },
      {
            type: "code", language: "html", filename: "Scriban Template Example",
            code: `<div style="font-family: Arial, sans-serif;">
  <img src="{{ tenant.logo_url }}" alt="{{ tenant.name }}" />
  <h1>Welcome to {{ tenant.name }}, {{ admin.name }}!</h1>

  <p>Your account has been created. Here are your details:</p>

  <table>
    <tr><td>Email:</td><td>{{ admin.email }}</td></tr>
    <tr><td>Role:</td><td>{{ admin.role_name }}</td></tr>
    {{ if admin.is_protected }}
    <tr><td>Status:</td><td><strong>Super Admin</strong></td></tr>
    {{ end }}
  </table>

  {{ if password_reset_url }}
  <a href="{{ password_reset_url }}">Set Your Password</a>
  {{ end }}
</div>`,
      },
      { type: "heading", level: 2, titleKey: "commercial.emailTemplates.builtInTitle", id: "built-in-templates" },
      {
            type: "table", headers: ["Template", "Trigger", "Variables"], rows: [
                  ["Welcome Email", "Admin created", "admin.name, admin.email, tenant.name, password_reset_url"],
                  ["Password Reset", "Reset requested", "admin.name, reset_url, expiration_hours"],
                  ["OTP Verification", "OTP requested", "admin.name, otp_code, expiration_minutes"],
                  ["Account Blocked", "Admin deactivated", "admin.name, tenant.name, blocked_by, reason"],
                  ["Account Unblocked", "Admin reactivated", "admin.name, tenant.name"],
                  ["Tenant Welcome", "Tenant created", "tenant.name, super_admin.name, login_url"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.emailTemplates.managementTitle", id: "template-management" },
      {
            type: "table", headers: ["Method", "Endpoint", "Permission", "Purpose"], rows: [
                  ["GET", "/message-templates", "templates.view", "List all templates"],
                  ["GET", "/message-templates/{id}", "templates.view", "Template detail with body"],
                  ["POST", "/message-templates", "templates.create", "Create custom template"],
                  ["PUT", "/message-templates/{id}", "templates.edit", "Update template body"],
                  ["DELETE", "/message-templates/{id}", "templates.delete", "Delete custom template"],
                  ["POST", "/message-templates/{id}/preview", "templates.view", "Preview with sample data"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.emailTemplates.entityTitle", id: "template-entity" },
      {
            type: "code", language: "csharp", filename: "MessageTemplate Entity",
            code: `public class MessageTemplate
{
    public Guid Id { get; set; }
    public string NameEn { get; set; }          // English name
    public string NameAr { get; set; }          // Arabic name
    public string SubjectEn { get; set; }       // English subject line
    public string SubjectAr { get; set; }       // Arabic subject line
    public string BodyEn { get; set; }          // Scriban template (English)
    public string BodyAr { get; set; }          // Scriban template (Arabic)
    public string? PlaceholderSchema { get; set; } // JSON schema of available variables
    public bool IsSystem { get; set; }          // Cannot delete system templates
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.emailTemplates.previewTitle", id: "preview-rendering" },
      {
            type: "code", language: "json", filename: "Preview Template with Sample Data",
            code: `POST /api/v1/message-templates/{id}/preview
{
  "sampleData": {
    "admin": { "name": "John Doe", "email": "john@acme.com" },
    "tenant": { "name": "ACME Corp", "logo_url": "/logos/acme.png" },
    "password_reset_url": "https://nexora.com/reset/abc123"
  }
}

// Response:
{
  "subjectHtml": "Welcome to ACME Corp, John Doe!",
  "bodyHtml": "<div>...(fully rendered HTML)...</div>"
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.emailTemplates.brandingTitle", id: "tenant-branding" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "image", titleKey: "commercial.emailTemplates.brandLogo", descriptionKey: "commercial.emailTemplates.brandLogoDesc" },
                  { icon: "type", titleKey: "commercial.emailTemplates.brandName", descriptionKey: "commercial.emailTemplates.brandNameDesc" },
                  { icon: "palette", titleKey: "commercial.emailTemplates.brandColors", descriptionKey: "commercial.emailTemplates.brandColorsDesc" },
                  { icon: "globe", titleKey: "commercial.emailTemplates.brandLanguage", descriptionKey: "commercial.emailTemplates.brandLanguageDesc" },
            ],
      },
];

registerPage({
      slug: "commercial/email-templates",
      titleKey: "commercial.emailTemplates.title",
      descriptionKey: "commercial.emailTemplates.description",
      category: "commercial-integration",
      order: 3,
      sections,
      relatedSlugs: ["commercial/webhook-integration", "commercial/rest-api"],
      lastUpdated: "2026-02-19",
});
