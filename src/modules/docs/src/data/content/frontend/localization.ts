import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "frontend/localization",
  titleKey: "frontend.localization.title",
  category: "frontend",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.localization.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    provider([\"LanguageProvider\"])\n    %% provider: React Context + localStorage\n    hook([\"Language() Hook\"])\n    %% hook: language, direction, t()\n    en([\"en.ts Dictionary\"])\n    ar([\"ar.ts Dictionary\"])\n    html{{\"<html> Element\"}}\n    %% html: dir, lang attributes\n    body{{\"<body> Element\"}}\n    %% body: font-class\n    provider --> hook\n    provider --> en\n    provider --> ar\n    provider -->|\"sets dir/lang\"| html\n    provider -->|\"sets font\"| body",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.localization.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "frontend.localization.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_6_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export const en = {\n  common: {\n    loading: \"Loading...\",\n    save: \"Save\",\n    cancel: \"Cancel\",\n    delete: \"Delete\",\n    edit: \"Edit\",\n    create: \"Create\",\n    search: \"Search\",\n    noData: \"No data available\",\n    confirm: \"Confirm\",\n    back: \"Back\",\n  },\n  auth: {\n    login: \"Login\",\n    logout: \"Logout\",\n    email: \"Email\",\n    password: \"Password\",\n    forgotPassword: \"Forgot Password?\",\n    register: \"Register\",\n  },\n  admins: {\n    title: \"Admin Management\",\n    create: \"Create Admin\",\n    searchPlaceholder: \"Search by name or email...\",\n    form: {\n      firstName: \"First Name\",\n      lastName: \"Last Name\",\n      email: \"Email Address\",\n      role: \"Role\",\n    },\n  },\n  errors: {\n    required: \"This field is required\",\n    minLength: \"Must be at least {{min}} characters\",\n    invalidEmail: \"Invalid email address\",\n    serverError: \"An error occurred. Please try again.\",\n  },\n};",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "frontend.localization.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_9_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export const ar = {\n  common: {\n    loading: \"جاري التحميل...\",\n    save: \"حفظ\",\n    cancel: \"إلغاء\",\n    delete: \"حذف\",\n    edit: \"تعديل\",\n    create: \"إنشاء\",\n    search: \"بحث\",\n    noData: \"لا توجد بيانات\",\n    confirm: \"تأكيد\",\n    back: \"رجوع\",\n  },\n  auth: {\n    login: \"تسجيل الدخول\",\n    logout: \"تسجيل الخروج\",\n    email: \"البريد الإلكتروني\",\n    password: \"كلمة المرور\",\n    forgotPassword: \"نسيت كلمة المرور؟\",\n    register: \"تسجيل\",\n  },\n  admins: {\n    title: \"إدارة المشرفين\",\n    create: \"إنشاء مشرف\",\n    searchPlaceholder: \"البحث بالاسم أو البريد...\",\n    form: {\n      firstName: \"الاسم الأول\",\n      lastName: \"الاسم الأخير\",\n      email: \"البريد الإلكتروني\",\n      role: \"الدور\",\n    },\n  },\n  errors: {\n    required: \"هذا الحقل مطلوب\",\n    minLength: \"يجب أن لا يقل عن {{min}} أحرف\",\n    invalidEmail: \"بريد إلكتروني غير صالح\",\n    serverError: \"حدث خطأ. يرجى المحاولة مرة أخرى.\",\n  },\n};",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.localization.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_12_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import { Language } from '@core/providers/LanguageProvider';\n\nexport function AdminForm() {\n  const { t, language, direction } = Language();\n\n  // Simple key access (dot notation)\n  const title = t('admins.title');            // \"Admin Management\"\n\n  // Nested key access\n  const label = t('admins.form.firstName');   // \"First Name\"\n\n  // With variable interpolation\n  const error = t('errors.minLength', { min: '8' });\n  // → \"Must be at least 8 characters\"\n\n  // RTL-aware layout\n  const align = direction === 'rtl' ? 'text-right' : 'text-left';\n\n  // Language-specific logic\n  const dateLocale = language === 'ar' ? 'ar-EG' : 'en-GB';\n\n  return (\n    <form dir={direction}>\n      <label className={align}>{label}</label>\n      <input placeholder={t('common.search')} />\n    </form>\n  );\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.localization.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "frontend.localization.section_16_hdr_0",
      "frontend.localization.section_16_hdr_1",
      "frontend.localization.section_16_hdr_2"
    ],
    "rows": [
      [
        "frontend.localization.section_16_cell_0_0",
        "frontend.localization.section_16_cell_0_1",
        "frontend.localization.section_16_cell_0_2"
      ],
      [
        "frontend.localization.section_16_cell_1_0",
        "frontend.localization.section_16_cell_1_1",
        "frontend.localization.section_16_cell_1_2"
      ],
      [
        "frontend.localization.section_16_cell_2_0",
        "frontend.localization.section_16_cell_2_1",
        "frontend.localization.section_16_cell_2_2"
      ],
      [
        "frontend.localization.section_16_cell_3_0",
        "frontend.localization.section_16_cell_3_1",
        "frontend.localization.section_16_cell_3_2"
      ],
      [
        "frontend.localization.section_16_cell_4_0",
        "frontend.localization.section_16_cell_4_1",
        "frontend.localization.section_16_cell_4_2"
      ],
      [
        "frontend.localization.section_16_cell_5_0",
        "frontend.localization.section_16_cell_5_1",
        "frontend.localization.section_16_cell_5_2"
      ],
      [
        "frontend.localization.section_16_cell_6_0",
        "frontend.localization.section_16_cell_6_1",
        "frontend.localization.section_16_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.localization.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.localization.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_19_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.localization.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_21_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.localization.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.localization.section_23_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "frontend.localization.section_24_title",
    "contentKey": "frontend.localization.section_24_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.localization.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "frontend.localization.section_26_item_0",
      "frontend.localization.section_26_item_1",
      "frontend.localization.section_26_item_2"
    ]
  }
],
  relatedSlugs: [
  "frontend/state-management",
  "architecture/frontend",
  "frontend/crud-system"
],
  lastUpdated: "2026-06-09",
});
