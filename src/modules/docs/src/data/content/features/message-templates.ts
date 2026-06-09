import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/message-templates",
  titleKey: "features.messageTemplates.title",
  category: "features",
  order: 13,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.messageTemplates.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "paragraph",
    "contentKey": "features.messageTemplates.section_2_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    ctrl[\"MessageTemplatesController\"]\n    crud([\"CRUD Operations\"])\n    preview([\"Preview Rendering\"])\n    itr([\"ITemplateRenderer\"])\n    scriban([\"Scriban Engine (Liquid-like)\"])\n    email{{\"EmailService\"}}\n    notif{{\"NotificationService\"}}\n    webhook{{\"WebhookService\"}}\n    ctrl --> crud\n    ctrl --> preview\n    preview --> itr\n    itr --> scriban\n    email --> itr\n    notif --> itr\n    webhook --> itr",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.messageTemplates.section_5_content"
  },
  {
    "type": "code",
    "language": "html",
    "code": "<!-- Variable substitution -->\nHello {{ admin.name }},\n\n<!-- Conditional content -->\n{{ if admin.is_protected }}\n ï¸ You are the super admin for {{ tenant.name }}.\n{{ end }}\n\n<!-- Loops -->\n{{ for role in admin.roles }}\n  - {{ role.name }}\n{{ end }}\n\n<!-- Filters (pipes) -->\nCreated: {{ created_at | date.to_string \"%B %d, %Y\" }}\nAmount: {{ amount | math.format \"0.00\" }}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "table",
    "headers": [
      "features.messageTemplates.section_8_hdr_0",
      "features.messageTemplates.section_8_hdr_1",
      "features.messageTemplates.section_8_hdr_2"
    ],
    "rows": [
      [
        "features.messageTemplates.section_8_cell_0_0",
        "features.messageTemplates.section_8_cell_0_1",
        "features.messageTemplates.section_8_cell_0_2"
      ],
      [
        "features.messageTemplates.section_8_cell_1_0",
        "features.messageTemplates.section_8_cell_1_1",
        "features.messageTemplates.section_8_cell_1_2"
      ],
      [
        "features.messageTemplates.section_8_cell_2_0",
        "features.messageTemplates.section_8_cell_2_1",
        "features.messageTemplates.section_8_cell_2_2"
      ],
      [
        "features.messageTemplates.section_8_cell_3_0",
        "features.messageTemplates.section_8_cell_3_1",
        "features.messageTemplates.section_8_cell_3_2"
      ],
      [
        "features.messageTemplates.section_8_cell_4_0",
        "features.messageTemplates.section_8_cell_4_1",
        "features.messageTemplates.section_8_cell_4_2"
      ],
      [
        "features.messageTemplates.section_8_cell_5_0",
        "features.messageTemplates.section_8_cell_5_1",
        "features.messageTemplates.section_8_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "features.messageTemplates.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class MessageTemplate : AuditableEntity<Guid>\n{\n    [Required] [MaxLength(200)]\n    public string Key { get; set; }           // Unique identifier e.g. \"welcome_admin\"\n    \n    [Required] [MaxLength(200)]\n    public string SubjectEn { get; set; }     // English subject line\n    \n    [Required] [MaxLength(200)]\n    public string SubjectAr { get; set; }     // Arabic subject line\n    \n    [Required]\n    public string BodyEn { get; set; }        // English HTML body (Scriban)\n    \n    [Required]\n    public string BodyAr { get; set; }        // Arabic HTML body (Scriban)\n    \n    public bool IsSystem { get; set; }        // System templates can't be deleted\n    \n    [MaxLength(2000)]\n    public string? PlaceholderSchema { get; set; } // JSON schema of available variables\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "features.messageTemplates.section_13_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class TemplateRenderer : ITemplateRenderer\n{\n    public async Task<string> RenderAsync(string template, object data)\n    {\n        // Parse Scriban template\n        var parsed = Template.Parse(template);\n        if (parsed.HasErrors)\n            throw new TemplateException(string.Join(\", \", parsed.Messages));\n\n        // Create script object from data\n        var scriptObject = new ScriptObject();\n        scriptObject.Import(data);\n\n        var context = new TemplateContext();\n        context.PushGlobal(scriptObject);\n\n        return await parsed.RenderAsync(context);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "table",
    "headers": [
      "features.messageTemplates.section_16_hdr_0",
      "features.messageTemplates.section_16_hdr_1",
      "features.messageTemplates.section_16_hdr_2",
      "features.messageTemplates.section_16_hdr_3",
      "features.messageTemplates.section_16_hdr_4"
    ],
    "rows": [
      [
        "features.messageTemplates.section_16_cell_0_0",
        "features.messageTemplates.section_16_cell_0_1",
        "features.messageTemplates.section_16_cell_0_2",
        "features.messageTemplates.section_16_cell_0_3",
        "features.messageTemplates.section_16_cell_0_4"
      ],
      [
        "features.messageTemplates.section_16_cell_1_0",
        "features.messageTemplates.section_16_cell_1_1",
        "features.messageTemplates.section_16_cell_1_2",
        "features.messageTemplates.section_16_cell_1_3",
        "features.messageTemplates.section_16_cell_1_4"
      ],
      [
        "features.messageTemplates.section_16_cell_2_0",
        "features.messageTemplates.section_16_cell_2_1",
        "features.messageTemplates.section_16_cell_2_2",
        "features.messageTemplates.section_16_cell_2_3",
        "features.messageTemplates.section_16_cell_2_4"
      ],
      [
        "features.messageTemplates.section_16_cell_3_0",
        "features.messageTemplates.section_16_cell_3_1",
        "features.messageTemplates.section_16_cell_3_2",
        "features.messageTemplates.section_16_cell_3_3",
        "features.messageTemplates.section_16_cell_3_4"
      ],
      [
        "features.messageTemplates.section_16_cell_4_0",
        "features.messageTemplates.section_16_cell_4_1",
        "features.messageTemplates.section_16_cell_4_2",
        "features.messageTemplates.section_16_cell_4_3",
        "features.messageTemplates.section_16_cell_4_4"
      ],
      [
        "features.messageTemplates.section_16_cell_5_0",
        "features.messageTemplates.section_16_cell_5_1",
        "features.messageTemplates.section_16_cell_5_2",
        "features.messageTemplates.section_16_cell_5_3",
        "features.messageTemplates.section_16_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "features.messageTemplates.section_18_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.messageTemplates.section_19_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// POST /message-templates/{id}/preview\n{\n  \"data\": {\n    \"admin\": { \"name\": \"John Doe\", \"email\": \"john@example.com\" },\n    \"tenant\": { \"name\": \"ACME Corp\" },\n    \"otp_code\": \"123456\"\n  }\n}\n\n// Response: rendered HTML body",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.messageTemplates.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.messageTemplates.section_22_item_0",
      "features.messageTemplates.section_22_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/email-system",
  "features/notification-system"
],
  lastUpdated: "2026-06-09",
});
