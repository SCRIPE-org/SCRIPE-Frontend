import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.localizationI18n.intro" },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.localizationI18n.languagesTitle",
    id: "languages",
  },
  {
    type: "table",
    headers: ["Language", "Code", "Direction", "Font", "Status"],
    rows: [
      ["English", "en", "LTR", "Inter / System", "Production"],
      ["Arabic", "ar", "RTL", "Noto Sans Arabic", "Production"],
      ["French", "fr", "LTR", "Inter / System", "Supported"],
      ["German", "de", "LTR", "Inter / System", "Supported"],
      ["Spanish", "es", "LTR", "Inter / System", "Supported"],
      ["Chinese", "zh", "LTR", "Noto Sans SC", "Supported"],
      ["Japanese", "ja", "LTR", "Noto Sans JP", "Supported"],
    ],
  },

  { type: "heading", level: 2, titleKey: "commercial.localizationI18n.rtlTitle", id: "rtl" },
  { type: "paragraph", contentKey: "commercial.localizationI18n.rtlContent" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "commercial.localizationI18n.nexoraRTL",
        variant: "positive",
        items: [
          "Full RTL layout system built from day 1",
          "CSS logical properties (margin-inline-start)",
          "Auto-flipping icons and navigation",
          "RTL-aware form layouts and validation",
          "Bilingual data tables with proper alignment",
          "Dynamic font loading per language",
        ],
      },
      {
        titleKey: "commercial.localizationI18n.competitorRTL",
        variant: "negative",
        items: [
          "RTL added as CSS overrides after launch",
          "Physical properties (margin-left) cause bugs",
          "Icons and navigation break in RTL",
          "Form layouts misaligned in RTL mode",
          "Tables render incorrectly for Arabic text",
          "Single font for all languages",
        ],
      },
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.localizationI18n.bilingualTitle",
    id: "bilingual-entities",
  },
  { type: "paragraph", contentKey: "commercial.localizationI18n.bilingualContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Bilingual Entity Pattern",
    code: `public class Department : AuditableEntity
{
    public string NameEn { get; set; }   // "Human Resources"
    public string NameAr { get; set; }   // "الموارد البشرية"
    
    // Auto-resolve based on current language context
    public string GetLocalizedName(string lang) =>
        lang == "ar" ? NameAr : NameEn;
}`,
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.localizationI18n.templatesTitle",
    id: "templates",
  },
  { type: "paragraph", contentKey: "commercial.localizationI18n.templatesContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "globe",
        titleKey: "commercial.localizationI18n.templateBilingual",
        descriptionKey: "commercial.localizationI18n.templateBilingualDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.localizationI18n.templatePreview",
        descriptionKey: "commercial.localizationI18n.templatePreviewDesc",
      },
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.localizationI18n.frontendTitle",
    id: "frontend",
  },
  { type: "paragraph", contentKey: "commercial.localizationI18n.frontendContent" },
  {
    type: "code",
    language: "typescript",
    filename: "Frontend Language Context Usage",
    code: `// Any component can access localization
const { t, language, direction, setLanguage } = Language();

return (
  <div dir={direction}>
    <h1>{t('dashboard.title')}</h1>
    <p>{t('dashboard.welcome', { name: user.name })}</p>
    <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
      {language === 'ar' ? 'English' : 'العربية'}
    </button>
  </div>
);`,
  },
];

registerPage({
  slug: "commercial/localization-i18n",
  titleKey: "commercial.localizationI18n.title",
  descriptionKey: "commercial.localizationI18n.description",
  category: "commercial-enterprise",
  order: 5,
  sections,
  relatedSlugs: ["commercial/real-time-capabilities", "commercial/message-templates"],
  lastUpdated: "2026-02-20",
});
