import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.localization.intro" },
      { type: "heading", level: 2, titleKey: "commercial.localization.languagesTitle", id: "supported-languages" },
      {
            type: "table", headers: ["Language", "Code", "Direction", "Font Stack"], rows: [
                  ["English", "en", "LTR (left-to-right)", "Inter, system-ui, sans-serif"],
                  ["Arabic", "ar", "RTL (right-to-left)", "Cairo, Noto Kufi Arabic, sans-serif"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.localization.rtlTitle", id: "rtl-ui-support" },
      {
            type: "table", headers: ["Element", "LTR Behavior", "RTL Behavior"], rows: [
                  ["Sidebar", "Left side", "Right side"],
                  ["Text alignment", "Left", "Right"],
                  ["Breadcrumbs", "Left → Right", "Right → Left"],
                  ["Form labels", "Left of input", "Right of input"],
                  ["Tables", "Left-aligned headers", "Right-aligned headers"],
                  ["Icons (arrows)", "→", "←"],
                  ["Scroll direction", "Normal", "Mirrored"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.localization.bilingualTitle", id: "bilingual-entities" },
      {
            type: "code", language: "text", filename: "Bilingual Entity Storage",
            code: `Every user-facing entity stores BOTH languages:

Tenant:     NameEn = "ACME Corp"        NameAr = "شركة أكمي"
Role:       NameEn = "Manager"          NameAr = "مدير"
Menu:       NameEn = "Dashboard"        NameAr = "لوحة القيادة"
Template:   SubjectEn = "Welcome!"      SubjectAr = "!أهلاً"
           BodyEn = "<html>..."         BodyAr = "<html dir='rtl'>..."`,
      },
      { type: "heading", level: 2, titleKey: "commercial.localization.translationTitle", id: "translation-keys" },
      {
            type: "code", language: "text", filename: "Dot-Notation Translation System",
            code: `Frontend uses dot-notation translation keys:

  t('common.save')           → "Save" | "حفظ"
  t('common.cancel')         → "Cancel" | "إلغاء"
  t('errors.required')       → "This field is required" | "هذا الحقل مطلوب"
  t('errors.minLength', {min: 5})  → "Must be at least 5 characters"

Interpolation: {{variable}} syntax in dictionary values`,
      },
      { type: "heading", level: 2, titleKey: "commercial.localization.switchingTitle", id: "language-switching" },
      {
            type: "table", headers: ["Feature", "Detail"], rows: [
                  ["Toggle", "Single click switches between EN ↔ AR"],
                  ["Persistence", "Saved to localStorage, survives refresh"],
                  ["Direction", "HTML dir and lang attributes updated automatically"],
                  ["Fonts", "Body class switches between font-english and font-arabic"],
                  ["SSR Fallback", "English used during server rendering, hydrated on client"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.localization.addingTitle", id: "adding-new-languages" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.localization.step1", contentKey: "commercial.localization.step1Desc" },
                  { titleKey: "commercial.localization.step2", contentKey: "commercial.localization.step2Desc" },
                  { titleKey: "commercial.localization.step3", contentKey: "commercial.localization.step3Desc" },
                  { titleKey: "commercial.localization.step4", contentKey: "commercial.localization.step4Desc" },
            ],
      },
];

registerPage({
      slug: "commercial/localization",
      titleKey: "commercial.localization.title",
      descriptionKey: "commercial.localization.description",
      category: "commercial-enterprise",
      order: 4,
      sections,
      relatedSlugs: ["commercial/enterprise-multi-tenancy", "commercial/technology-stack"],
      lastUpdated: "2026-02-19",
});
