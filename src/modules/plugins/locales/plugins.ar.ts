/**
 * Plugins Module — Shared locale (Arabic)
 * Keys shared across all plugin sub-modules (nav, common states, shared labels).
 */
export const ar = {
  plugins: {
    // ── Navigation / section titles ──────────────────────────────
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
  },
};
