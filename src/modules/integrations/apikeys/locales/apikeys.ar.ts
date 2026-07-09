export const ar = {
  apikeys: {
    title: "مفاتيح API",
    description: "إنشاء وإدارة مفاتيح API الآمنة للوصول البرمجي إلى واجهات برمجة تطبيقات SCRIPE.",

    // List Columns
    name: "اسم المفتاح",
    namePlaceholder: "مثال: مفتاح تكامل CI/CD",
    prefix: "بادئة المفتاح",
    scopes: "الصلاحيات / النطاقات",
    scopesPlaceholder: "اختر نطاقات هذا المفتاح",
    selectScopes: "اختر النطاقات",
    statusLabel: "الحالة",
    createdAt: "تاريخ الإنشاء",
    expiresAt: "تاريخ انتهاء الصلاحية",
    revokedAt: "تاريخ الإلغاء",
    neverExpires: "لا ينتهي أبداً",
    untitled: "مفتاح API بدون عنوان",

    // Expiry Options
    expiration: "مدة الصلاحية",
    expirationPlaceholder: "اختر فترة الصلاحية",
    expirations: {
      never: "أبداً (بدون انتهاء)",
      days30: "30 يوم",
      days90: "90 يوم",
      days365: "سنة واحدة",
      custom: "عدد أيام مخصص",
    },
    customDays: "انتهاء مخصص (أيام)",
    customDaysPlaceholder: "عدد الأيام",

    // Scopes configuration
    availableScopes: "الصلاحيات المتاحة",
    allScopes: "جميع الصلاحيات",
    noScopesSelected: "يرجى تحديد صلاحية واحدة على الأقل",

    // Actions & Buttons
    create: "إنشاء مفتاح API",
    generate: "إنشاء",
    revoke: "إلغاء المفتاح",
    revoking: "جاري الإلغاء...",
    copyKey: "نسخ المفتاح",
    copied: "تم النسخ!",

    // Success Messages
    created: "تم إنشاء مفتاح API بنجاح",
    createdDesc: "تم إنشاء مفتاح API بنجاح. يرجى نسخ الرمز المميز المعروض أدناه وحفظه بشكل آمن. لدواعي أمنية، لن تتمكن من عرض هذا الرمز مرة أخرى.",
    revoked: "تم إلغاء مفتاح API",
    revokedDesc: "تم إلغاء مفتاح API بنجاح.",

    // Confirmation dialogs
    revokeConfirmTitle: "إلغاء مفتاح API؟",
    revokeConfirmDesc: "سيؤدي هذا إلى إبطال مفتاح API نهائياً. ستفشل أي برامج أو تكاملات خارجية تستخدمه فوراً برمز خطأ 401 Unauthorized. لا يمكن التراجع عن هذا الإجراء.",

    // Modals
    plainKeyLabel: "رمز مفتاح API الجديد الخاص بك",
    plainKeyWarning: "حافظ على سرية هذا المفتاح. أي شخص يملك حق الوصول إليه يمكنه استخدام واجهات برمجة التطبيقات بصلاحياته.",
    close: "إغلاق",

    // Status mapping
    status: {
      active: "نشط",
      revoked: "ملغي",
      expired: "منتهي",
    },
  },
};
