import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "frontend.localization.intro" },

      // ─── Architecture ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.localization.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "Localization Architecture",
            direction: "horizontal",
            nodes: [
                  { id: "provider", label: "LanguageProvider", type: "primary", description: "React Context + localStorage" },
                  { id: "hook", label: "Language() Hook", type: "info", description: "language, direction, t()" },
                  { id: "en", label: "en.ts Dictionary", type: "success" },
                  { id: "ar", label: "ar.ts Dictionary", type: "success" },
                  { id: "html", label: "<html> Element", type: "warning", description: "dir, lang attributes" },
                  { id: "body", label: "<body> Element", type: "warning", description: "font-class" },
            ],
            connections: [
                  { from: "provider", to: "hook" },
                  { from: "provider", to: "en" },
                  { from: "provider", to: "ar" },
                  { from: "provider", to: "html", label: "sets dir/lang" },
                  { from: "provider", to: "body", label: "sets font" },
            ],
      },

      // ─── Dictionary Structure ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.localization.dictionaryTitle", id: "dictionary",
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "English (en.ts)",
                        language: "typescript",
                        filename: "src/core/locales/en.ts — Sample",
                        code: `export const en = {
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    noData: "No data available",
    confirm: "Confirm",
    back: "Back",
  },
  auth: {
    login: "Login",
    logout: "Logout",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    register: "Register",
  },
  admins: {
    title: "Admin Management",
    create: "Create Admin",
    searchPlaceholder: "Search by name or email...",
    form: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      role: "Role",
    },
  },
  errors: {
    required: "This field is required",
    minLength: "Must be at least {{min}} characters",
    invalidEmail: "Invalid email address",
    serverError: "An error occurred. Please try again.",
  },
};`,
                  },
                  {
                        label: "Arabic (ar.ts)",
                        language: "typescript",
                        filename: "src/core/locales/ar.ts — Sample",
                        code: `export const ar = {
  common: {
    loading: "جاري التحميل...",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    create: "إنشاء",
    search: "بحث",
    noData: "لا توجد بيانات",
    confirm: "تأكيد",
    back: "رجوع",
  },
  auth: {
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    register: "تسجيل",
  },
  admins: {
    title: "إدارة المشرفين",
    create: "إنشاء مشرف",
    searchPlaceholder: "البحث بالاسم أو البريد...",
    form: {
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      email: "البريد الإلكتروني",
      role: "الدور",
    },
  },
  errors: {
    required: "هذا الحقل مطلوب",
    minLength: "يجب أن لا يقل عن {{min}} أحرف",
    invalidEmail: "بريد إلكتروني غير صالح",
    serverError: "حدث خطأ. يرجى المحاولة مرة أخرى.",
  },
};`,
                  },
            ],
      },

      // ─── t() Function Usage ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.localization.tFunctionTitle", id: "t-function",
      },
      {
            type: "code",
            language: "typescript",
            filename: "t() Function — Usage Examples",
            code: `import { Language } from '@core/providers/LanguageProvider';

export function AdminForm() {
  const { t, language, direction } = Language();

  // Simple key access (dot notation)
  const title = t('admins.title');            // "Admin Management"

  // Nested key access
  const label = t('admins.form.firstName');   // "First Name"

  // With variable interpolation
  const error = t('errors.minLength', { min: '8' });
  // → "Must be at least 8 characters"

  // RTL-aware layout
  const align = direction === 'rtl' ? 'text-right' : 'text-left';

  // Language-specific logic
  const dateLocale = language === 'ar' ? 'ar-EG' : 'en-GB';

  return (
    <form dir={direction}>
      <label className={align}>{label}</label>
      <input placeholder={t('common.search')} />
    </form>
  );
}`,
      },

      // ─── RTL Support ──────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.localization.rtlTitle", id: "rtl-support",
      },
      { type: "paragraph", contentKey: "frontend.localization.rtlIntro" },
      {
            type: "table",
            headers: ["Feature", "LTR (English)", "RTL (Arabic)"],
            rows: [
                  ["<html dir>", "ltr", "rtl"],
                  ["<html lang>", "en", "ar"],
                  ["<body class>", "font-english", "font-arabic"],
                  ["Text alignment", "text-left", "text-right"],
                  ["Sidebar position", "Left", "Right"],
                  ["Icon direction", "→", "←"],
                  ["Number format", "1,234.56", "١٬٢٣٤٫٥٦"],
            ],
      },

      // ─── Adding New Keys ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.localization.addingKeysTitle", id: "adding-keys",
      },
      {
            type: "step-guide",
            steps: [
                  {
                        titleKey: "frontend.localization.step1Title",
                        contentKey: "frontend.localization.step1Desc",
                  },
                  {
                        titleKey: "frontend.localization.step2Title",
                        contentKey: "frontend.localization.step2Desc",
                  },
                  {
                        titleKey: "frontend.localization.step3Title",
                        contentKey: "frontend.localization.step3Desc",
                  },
            ],
      },
      {
            type: "info",
            variant: "warning",
            contentKey: "frontend.localization.noLocaleRoutes",
      },
];

registerPage({
      slug: "frontend/localization",
      titleKey: "frontend.localization.title",
      descriptionKey: "frontend.localization.description",
      category: "frontend",
      order: 4,
      sections,
      relatedSlugs: ["frontend/state-management", "architecture/frontend", "frontend/crud-system"],
      lastUpdated: "2026-02-20",
});
