/**
 * Plugins — Definitions sub-module locale (Arabic)
 */
export const ar = {
  plugins: {
    // ── Page header ──────────────────────────────────────────────────
    defTitle: "تعريفات الإضافات",
    defSubtitle: "تسجيل وإدارة تعريفات الإضافات المتاحة على المنصة.",
    defNew: "تعريف جديد",

    // ── Definitions section ──────────────────────────────────────────
    definitions: "تعريفات الإضافات",
    definitionsDesc: "تسجيل وإدارة تعريفات الإضافات المتاحة على المنصة.",
    definitionsError: "فشل تحميل تعريفات الإضافات.",

    // ── Stats ────────────────────────────────────────────────────────
    defStatTotal: "الإجمالي",
    defStatPublished: "المنشورة",
    defStatDraft: "المسودات",
    defStatDeprecated: "المهجورة",

    // ── Table ────────────────────────────────────────────────────────
    defTableTitle: "جميع التعريفات",
    defTableSubtitle: "حزم الإضافات المسجلة على المنصة والمتاحة للتثبيت من قِبل المستأجرين.",
    defEmpty: "لا توجد تعريفات إضافات.",
    defEmptyHint: "استخدم «تعريف جديد» لتسجيل حزمة إضافة.",

    // ── Table columns ────────────────────────────────────────────────
    defColKey: "مفتاح الإضافة",
    defColName: "الاسم",
    defColTier: "المستوى",
    defColStatus: "الحالة",
    defColScope: "النطاق",
    defColCreated: "تاريخ الإنشاء",

    // ── Status labels ────────────────────────────────────────────────
    defStatusDraft: "مسودة",
    defStatusPending: "قيد المراجعة",
    defStatusApproved: "مُعتمدة",
    defStatusPublished: "منشورة",
    defStatusSuspended: "معلَّقة",
    defStatusDeprecated: "مهجورة",

    // ── Scope labels ─────────────────────────────────────────────────
    defScopeGlobal: "عام",
    defScopeTenant: "مستأجر",
    defScopeUser: "مستخدم",

    // ── Actions ──────────────────────────────────────────────────────
    defCreate: "تعريف جديد",
    defCreateDesc: "تسجيل تعريف إضافة جديدة على المنصة.",
    defEdit: "تعديل التعريف",
    defEditDesc: "تحديث تفاصيل تعريف الإضافة.",
    defDelete: "حذف التعريف",
    defDeleteConfirmDesc: "هل أنت متأكد من حذف تعريف الإضافة «{{name}}»؟ سيفقد المستأجرون الذين ثبّتوها الوصول إليها.",
    defPublish: "نشر",
    defDeprecate: "إهمال",
    defViewManifest: "عرض الملف التعريفي",

    // ── Additional Fields & Placeholders ─────────────────────────────
    defColBaseUrl: "رابط القاعدة (API)",
    defColFrontendUrl: "رابط الواجهة الأمامية",
    defColIconUrl: "رابط الأيقونة",
    defColManifest: "ملف المانيفست (JSON)",
    defErrKeyFormat: "يجب أن يتكون المفتاح من أحرف وأرقام صغيرة فقط (a-z، 0-9، -، .)",
    defErrInvalidJson: "صيغة JSON غير صالحة",
    defPlaceholderKey: "com.acme.my-plugin",
    defPlaceholderName: "إضافتي المميزة",
    defPlaceholderNameAr: "إضافتي",
    defPlaceholderDesc: "وصف موجز للإضافة...",
    defPlaceholderDescAr: "وصف موجز باللغة العربية...",
    defPlaceholderBaseUrl: "https://plugin.example.com/api",
    defPlaceholderFrontendUrl: "https://plugin.example.com/ui",
    defPlaceholderIconUrl: "https://cdn.example.com/icon.png",
    defPlaceholderManifest: '{"entryPoints": [], "permissions": []}',

    // ── Custom fields section (in the create/edit form) ───────────────
    defCustomFieldsSection: "الحقول المخصصة",
    defCustomFieldsSectionDesc: "حقول إضافية مُهيأة على مستوى المنصة لتعريف الإضافة هذا.",
    defNoCustomFields: "لا توجد حقول مخصصة بعد.",
    defCustomFieldsSaveError: "تم حفظ التعريف، لكن فشل حفظ قيم الحقول المخصصة.",
  },
};
