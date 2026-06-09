import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/localization-i18n",
  titleKey: "commercial.localizationI18n.title",
  category: "commercial-enterprise",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.localizationI18n.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.localizationI18n.section_3_hdr_0",
      "commercial.localizationI18n.section_3_hdr_1",
      "commercial.localizationI18n.section_3_hdr_2",
      "commercial.localizationI18n.section_3_hdr_3",
      "commercial.localizationI18n.section_3_hdr_4"
    ],
    "rows": [
      [
        "commercial.localizationI18n.section_3_cell_0_0",
        "commercial.localizationI18n.section_3_cell_0_1",
        "commercial.localizationI18n.section_3_cell_0_2",
        "commercial.localizationI18n.section_3_cell_0_3",
        "commercial.localizationI18n.section_3_cell_0_4"
      ],
      [
        "commercial.localizationI18n.section_3_cell_1_0",
        "commercial.localizationI18n.section_3_cell_1_1",
        "commercial.localizationI18n.section_3_cell_1_2",
        "commercial.localizationI18n.section_3_cell_1_3",
        "commercial.localizationI18n.section_3_cell_1_4"
      ],
      [
        "commercial.localizationI18n.section_3_cell_2_0",
        "commercial.localizationI18n.section_3_cell_2_1",
        "commercial.localizationI18n.section_3_cell_2_2",
        "commercial.localizationI18n.section_3_cell_2_3",
        "commercial.localizationI18n.section_3_cell_2_4"
      ],
      [
        "commercial.localizationI18n.section_3_cell_3_0",
        "commercial.localizationI18n.section_3_cell_3_1",
        "commercial.localizationI18n.section_3_cell_3_2",
        "commercial.localizationI18n.section_3_cell_3_3",
        "commercial.localizationI18n.section_3_cell_3_4"
      ],
      [
        "commercial.localizationI18n.section_3_cell_4_0",
        "commercial.localizationI18n.section_3_cell_4_1",
        "commercial.localizationI18n.section_3_cell_4_2",
        "commercial.localizationI18n.section_3_cell_4_3",
        "commercial.localizationI18n.section_3_cell_4_4"
      ],
      [
        "commercial.localizationI18n.section_3_cell_5_0",
        "commercial.localizationI18n.section_3_cell_5_1",
        "commercial.localizationI18n.section_3_cell_5_2",
        "commercial.localizationI18n.section_3_cell_5_3",
        "commercial.localizationI18n.section_3_cell_5_4"
      ],
      [
        "commercial.localizationI18n.section_3_cell_6_0",
        "commercial.localizationI18n.section_3_cell_6_1",
        "commercial.localizationI18n.section_3_cell_6_2",
        "commercial.localizationI18n.section_3_cell_6_3",
        "commercial.localizationI18n.section_3_cell_6_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.localizationI18n.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_5_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.localizationI18n.section_6_hdr_0",
      "commercial.localizationI18n.section_6_hdr_1"
    ],
    "rows": [
      [
        "commercial.localizationI18n.section_6_cell_0_0",
        "commercial.localizationI18n.section_6_cell_0_1"
      ],
      [
        "commercial.localizationI18n.section_6_cell_1_0",
        "commercial.localizationI18n.section_6_cell_1_1"
      ],
      [
        "commercial.localizationI18n.section_6_cell_2_0",
        "commercial.localizationI18n.section_6_cell_2_1"
      ],
      [
        "commercial.localizationI18n.section_6_cell_3_0",
        "commercial.localizationI18n.section_6_cell_3_1"
      ],
      [
        "commercial.localizationI18n.section_6_cell_4_0",
        "commercial.localizationI18n.section_6_cell_4_1"
      ],
      [
        "commercial.localizationI18n.section_6_cell_5_0",
        "commercial.localizationI18n.section_6_cell_5_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.localizationI18n.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_9_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class Department : AuditableEntity\n{\n    public string NameEn { get; set; }   // \"Human Resources\"\n    public string NameAr { get; set; }   // \"الموارد البشرية\"\n    \n    // Auto-resolve based on current language context\n    public string GetLocalizedName(string lang) =>\n        lang == \"ar\" ? NameAr : NameEn;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.localizationI18n.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.localizationI18n.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.localizationI18n.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.localizationI18n.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_18_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.localizationI18n.section_19_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Any component can access localization\nconst { t, language, direction, setLanguage } = Language();\n\nreturn (\n  <div dir={direction}>\n    <h1>{t('dashboard.title')}</h1>\n    <p>{t('dashboard.welcome', { name: user.name })}</p>\n    <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>\n      {language === 'ar' ? 'English' : 'العربية'}\n    </button>\n  </div>\n);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.localizationI18n.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.localizationI18n.section_22_item_0",
      "commercial.localizationI18n.section_22_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/real-time-capabilities",
  "commercial/message-templates"
],
  lastUpdated: "2026-06-09",
});
