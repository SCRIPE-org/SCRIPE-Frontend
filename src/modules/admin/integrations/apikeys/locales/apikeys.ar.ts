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
    more: "إضافي",
    statusLabel: "الحالة",
    createdAt: "تاريخ الإنشاء",
    expiresAt: "تاريخ انتهاء الصلاحية",
    revokedAt: "تاريخ الإلغاء",
    neverExpires: "لا ينتهي أبداً",
    untitled: "مفتاح API بدون عنوان",
    backToList: "مفاتيح API",
    lastUsed: "آخر استخدام",
    lastUsedAt: "آخر استخدام {{time}} (UTC)",
    copyPrefix: "نسخ بادئة المفتاح",
    rotateKey: "تدوير المفتاح",

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
    scopesSearch: "البحث في الصلاحيات...",
    scopesDescription: "نطاقات وصلاحيات المفتاح",

    // Actions & Buttons
    create: "إنشاء مفتاح API",
    generate: "إنشاء",
    viewDetails: "عرض التفاصيل",
    revoke: "إلغاء المفتاح",
    revoking: "جاري الإلغاء...",
    copyKey: "نسخ المفتاح",
    copied: "تم النسخ!",
    copiedDesc: "تم نسخ رمز مفتاح API إلى الحافظة الخاصة بك.",

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
    plainKeyWarning: "حافظ على سرية هذا المفتاح.",
    plainKeyDesc: "أي شخص يملك حق الوصول إليه يمكنه استخدام واجهات برمجة التطبيقات بصلاحياته.",
    close: "إغلاق",

    // Status mapping
    status: {
      active: "نشط",
      revoked: "ملغي",
      expired: "منتهي",
    },

    // --- Stats ---
    stats: {
      totalHits: "إجمالي الطلبات",
      thisMinute: "هذه الدقيقة",
      successRate: "نسبة النجاح",
      successful: "ناجحة",
      failed: "فاشلة",
      blocked: "محجوبة",
      monthlyQuota: "الحصة الشهرية",
      noLimit: "لا يوجد حد شهري",
      avgResponse: "متوسط الاستجابة",
      rateLimit: "حد الطلبات",
      perMin: "/دقيقة",
    },

    // --- Chart ---
    chart: {
      title: "نشاط الطلبات",
      viewGroup: "عرض الرسم البياني",
      rangeGroup: "النطاق الزمني",
      view: {
        volume: "الحجم",
        errors: "الأخطاء",
        response: "زمن الاستجابة",
      },
      range: {
        "24h": "24 ساعة",
        "7d": "7 أيام",
        "30d": "30 يومًا",
      },
      series: {
        success: "ناجحة",
        failures: "أخطاء",
        errorRate: "نسبة الأخطاء",
        avgResponse: "متوسط الاستجابة (مللي ثانية)",
      },
      noData: "لا توجد بيانات لهذه الفترة",
    },

    // --- Danger Zone ---
    dangerZone: {
      title: "منطقة الخطر",
      revokeTitle: "إلغاء هذا المفتاح",
      revokeDesc: "يلغي صلاحية هذا المفتاح فوراً. جميع الطلبات التي تستخدمه ستعود برمز 401. يمكن التراجع عن هذا بالتواصل مع الدعم.",
      deleteTitle: "حذف هذا المفتاح نهائياً",
      deleteDesc: "يحذف المفتاح وجميع سجلات الاستخدام والإحصائيات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.",
      deleteBtn: "حذف نهائي",
      deleteConfirmTitle: "حذف مفتاح API نهائياً؟",
      deleteConfirmDesc: "سيؤدي هذا إلى حذف المفتاح وجميع سجلاته نهائياً. اكتب اسم المفتاح للتأكيد.",
      typeToConfirm: "اكتب اسم المفتاح للتأكيد",
    },

    // --- Rotate Dialog ---
    rotate: {
      successTitle: "تم تدوير مفتاح API بنجاح",
      successDesc: "يرجى نسخ مفتاحك السري الجديد الآن. لن يتم عرضه مرة أخرى!",
    },

    // --- Settings Panel ---
    settings: {
      title: "إعدادات التهيئة",
      name: "اسم المفتاح",
      rateLimit: "حد الطلبات (طلب/دقيقة)",
      desc: "الوصف",
      descPlaceholder: "اشرح في ماذا يُستخدم هذا المفتاح...",
      quota: "الحصة الشهرية (إجمالي الطلبات)",
      resetDay: "يوم إعادة ضبط الحصة (1-28)",
      alert: "عتبة التنبيه (%)",
      whitelist: "القائمة البيضاء لعناوين IP (مفصولة بفاصلة)",
    },

    // --- Scopes Panel ---
    scopesPanel: {
      title: "صلاحيات ومجالات الوصول",
      selectAll: "تحديد الكل",
      deselectAll: "إلغاء تحديد الكل",
      searchPlaceholder: "بحث في الصلاحيات...",
      noPermissions: "لم يتم العثور على صلاحيات",
    },

    // --- Quickstart Onboarding ---
    quickstart: {
      title: "دليل البدء السريع وتكامل واجهة برمجة التطبيقات",
      desc: "ابدأ بإجراء أول طلب لواجهة برمجة التطبيقات. انسخ قصاصات الأكواد البرمجية أدناه لتهيئة تكامل تطبيقاتك.",
    },

    // --- Activity Log ---
    activity: {
      title: "سجلات الوصول الفورية",
      searchPlaceholder: "تصفية حسب نقطة النهاية...",
      statusPlaceholder: "رمز الحالة",
      methodPlaceholder: "الأسلوب",
      anyMethod: "أي أسلوب",
      method: "الأسلوب",
      endpoint: "نقطة النهاية",
      status: "الحالة",
      duration: "زمن الاستجابة",
      ip: "عنوان IP",
      time: "الوقت (UTC)",
      noLogs: "لم يتم تسجيل أي طلبات لهذا المفتاح بعد",
      showing: "إجمالي السجلات",
    },

    // --- Error Views ---
    error: {
      notFound: "مفتاح API غير موجود أو تم رفض الوصول.",
    },

    // --- Toast Alerts ---
    revokeToast: {
      successMsg: "تم إلغاء مفتاح API بنجاح.",
      errorMsg: "فشل إلغاء مفتاح API.",
    },
    deleteToast: {
      successMsg: "تم حذف مفتاح API نهائياً.",
      errorMsg: "فشل حذف مفتاح API نهائياً.",
    },
    updateToast: {
      successScopes: "تم تحديث صلاحيات مفتاح API بنجاح.",
      successSettings: "تم تحديث إعدادات مفتاح API بنجاح.",
    },
  },
};
