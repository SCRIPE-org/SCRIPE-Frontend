/**
 * Plugins — Catalog sub-module locale (Arabic)
 *
 * Also includes shared keys (nav, tiers, statuses, actions, health)
 * that are used across multiple plugin sub-modules.
 */
export const ar = {
  plugins: {
    // ── Navigation / section titles (shared) ──────────────────────
    title: "نظام الإضافات",
    catalog: "كتالوج الإضافات",
    installed: "الإضافات المثبتة",
    logs: "سجلات التنفيذ",
    settings: "إعدادات الإضافة",

    // ── Shared tier labels ───────────────────────────────────────
    tier1: "المستوى الأول",
    tier1Label: "المستوى الأول — معتمد",
    tier2: "المستوى الثاني",
    tier2Label: "المستوى الثاني — معزول",

    // ── Shared status labels ─────────────────────────────────────
    statusActive: "نشط",
    statusDisabled: "معطل",
    statusInstalling: "جاري التثبيت",
    statusUninstalling: "جاري الإزالة",
    statusFailed: "فشل",
    statusUnknown: "غير معروف",

    // ── Shared actions ───────────────────────────────────────────
    install: "تثبيت",
    uninstall: "إزالة",
    activate: "تفعيل",
    deactivate: "تعطيل",
    installing: "جاري التثبيت...",
    retry: "إعادة المحاولة",
    refresh: "تحديث",

    // ── Shared health ────────────────────────────────────────────
    healthy: "يعمل بشكل سليم",
    unhealthy: "يعاني من مشكلة",
    healthUnknown: "حالة الصحة غير معروفة",
    lastChecked: "آخر فحص {{time}}",

    // ── Catalog page ─────────────────────────────────────────────
    catalogEmpty: "لا توجد إضافات متاحة في الكتالوج.",
    catalogError: "فشل تحميل كتالوج الإضافات.",
    catalogInstalled: "مثبتة",

    // ── Plugin card ──────────────────────────────────────────────
    cardInstall: "تثبيت",
    cardInstalled: "مثبتة",
    cardInstalling: "جاري التثبيت...",

    // ── Install dialog ───────────────────────────────────────────
    dialogTitle: "تثبيت الإضافة",
    dialogCancel: "إلغاء",
    dialogConfirm: "تثبيت الإضافة",
    dialogInstalling: "جاري التثبيت...",
    dialogTier2ConsentTitle: "موافقة على الأذونات",
    dialogTier2ConsentDesc: "ستحصل هذه الإضافة الخارجية على الوصول التالي:",
    dialogTier2ConsentCheck: "أفهم وأوافق على هذه الأذونات",
    dialogTier1Warning:
      "تعمل إضافات المستوى الأول داخل التطبيق ولها وصول كامل لبنية SCRIPE التحتية. ثبّت فقط الإضافات المعتمدة من مصادر موثوقة.",

    // ── Tier 2 permission list ────────────────────────────────────
    perm1: "قراءة ملف المستأجر وخصائص الميزات",
    perm2: "تخزين بيانات معزولة في صندوق الرمل",
    perm3: "تسجيل اشتراكات الويب هوك لأحداث المنصة",
    perm4: "استدعاء واجهات SCRIPE عبر بوابة محدودة السرعة (60 طلب/دقيقة)",
  },
};
