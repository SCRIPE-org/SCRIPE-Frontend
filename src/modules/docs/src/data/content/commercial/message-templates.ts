import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/message-templates",
  titleKey: "commercial.messageTemplates.title",
  category: "commercial-enterprise",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.messageTemplates.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_4_content"
  },
  {
    "type": "code",
    "language": "html",
    "code": "<!-- Welcome Email Template -->\n<h1>Welcome {{ user.display_name }}!</h1>\n<p>Your account has been activated for <strong>{{ tenant.name }}</strong>.</p>\n\n{{ if user.role == \"admin\" }}\n  <p>As an administrator, you have full access to the dashboard.</p>\n{{ else }}\n  <p>Your role: {{ user.role | string.capitalize }}</p>\n{{ end }}\n\n<p>Login at: <a href=\"{{ login_url }}\">{{ login_url }}</a></p>",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.messageTemplates.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "table",
    "headers": [
      "commercial.messageTemplates.section_7_hdr_0",
      "commercial.messageTemplates.section_7_hdr_1",
      "commercial.messageTemplates.section_7_hdr_2"
    ],
    "rows": [
      [
        "commercial.messageTemplates.section_7_cell_0_0",
        "commercial.messageTemplates.section_7_cell_0_1",
        "commercial.messageTemplates.section_7_cell_0_2"
      ],
      [
        "commercial.messageTemplates.section_7_cell_1_0",
        "commercial.messageTemplates.section_7_cell_1_1",
        "commercial.messageTemplates.section_7_cell_1_2"
      ],
      [
        "commercial.messageTemplates.section_7_cell_2_0",
        "commercial.messageTemplates.section_7_cell_2_1",
        "commercial.messageTemplates.section_7_cell_2_2"
      ],
      [
        "commercial.messageTemplates.section_7_cell_3_0",
        "commercial.messageTemplates.section_7_cell_3_1",
        "commercial.messageTemplates.section_7_cell_3_2"
      ],
      [
        "commercial.messageTemplates.section_7_cell_4_0",
        "commercial.messageTemplates.section_7_cell_4_1",
        "commercial.messageTemplates.section_7_cell_4_2"
      ],
      [
        "commercial.messageTemplates.section_7_cell_5_0",
        "commercial.messageTemplates.section_7_cell_5_1",
        "commercial.messageTemplates.section_7_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.messageTemplates.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class MessageTemplate : AuditableEntity\n{\n    public string Key { get; set; }          // \"welcome-email\"\n    public string SubjectEn { get; set; }    // \"Welcome to {tenant}\"\n    public string SubjectAr { get; set; }    // \"مرحبا بك في {tenant}\"\n    public string BodyEn { get; set; }       // English Scriban template\n    public string BodyAr { get; set; }       // Arabic Scriban template\n    public string Category { get; set; }     // \"Authentication\"\n    public bool IsActive { get; set; }       // Enable/disable\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.messageTemplates.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.messageTemplates.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.messageTemplates.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.messageTemplates.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.messageTemplates.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "table",
    "headers": [
      "commercial.messageTemplates.section_19_hdr_0",
      "commercial.messageTemplates.section_19_hdr_1",
      "commercial.messageTemplates.section_19_hdr_2",
      "commercial.messageTemplates.section_19_hdr_3",
      "commercial.messageTemplates.section_19_hdr_4"
    ],
    "rows": [
      [
        "commercial.messageTemplates.section_19_cell_0_0",
        "commercial.messageTemplates.section_19_cell_0_1",
        "commercial.messageTemplates.section_19_cell_0_2",
        "commercial.messageTemplates.section_19_cell_0_3",
        "commercial.messageTemplates.section_19_cell_0_4"
      ],
      [
        "commercial.messageTemplates.section_19_cell_1_0",
        "commercial.messageTemplates.section_19_cell_1_1",
        "commercial.messageTemplates.section_19_cell_1_2",
        "commercial.messageTemplates.section_19_cell_1_3",
        "commercial.messageTemplates.section_19_cell_1_4"
      ],
      [
        "commercial.messageTemplates.section_19_cell_2_0",
        "commercial.messageTemplates.section_19_cell_2_1",
        "commercial.messageTemplates.section_19_cell_2_2",
        "commercial.messageTemplates.section_19_cell_2_3",
        "commercial.messageTemplates.section_19_cell_2_4"
      ],
      [
        "commercial.messageTemplates.section_19_cell_3_0",
        "commercial.messageTemplates.section_19_cell_3_1",
        "commercial.messageTemplates.section_19_cell_3_2",
        "commercial.messageTemplates.section_19_cell_3_3",
        "commercial.messageTemplates.section_19_cell_3_4"
      ],
      [
        "commercial.messageTemplates.section_19_cell_4_0",
        "commercial.messageTemplates.section_19_cell_4_1",
        "commercial.messageTemplates.section_19_cell_4_2",
        "commercial.messageTemplates.section_19_cell_4_3",
        "commercial.messageTemplates.section_19_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.messageTemplates.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.messageTemplates.section_21_item_0",
      "commercial.messageTemplates.section_21_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/localization-i18n",
  "commercial/email-integration"
],
  lastUpdated: "2026-06-09",
});
