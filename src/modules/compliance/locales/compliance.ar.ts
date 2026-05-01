export const ar = {
  compliance: {
    // Navigation / section titles
    title: "مركز الامتثال",
    subtitle: "إدارة اللوائح — GDPR وCCPA والمزيد",
    dashboard: "لوحة التحكم",
    consent: "إدارة الموافقة",
    dsrQueue: "طلبات موضوع البيانات",
    retentionPolicies: "سياسات الاحتفاظ",
    dataInventory: "جرد البيانات",
    reports: "التقارير",

    // Dashboard KPIs
    openDsrs: "الطلبات المفتوحة",
    pendingDsrs: "في انتظار المراجعة",
    overdueDsrs: "متأخرة",
    slaCompliance: "الالتزام بالـ SLA",
    consentOptIn: "نسبة الموافقة",
    requiresReConsent: "تتطلب إعادة موافقة",

    // Regulation
    regulations: "اللوائح",
    regulation: "لائحة",
    gdpr: "GDPR",
    ccpa: "CCPA",
    active: "نشط",
    inactive: "غير نشط",
    deadlineDays: "المهلة (بالأيام)",
    purposes: "أغراض الموافقة",

    // Consent
    consentStatus: "حالة الموافقة",
    granted: "ممنوحة",
    withdrawn: "مسحوبة",
    lastUpdated: "آخر تحديث",
    recordConsent: "تسجيل الموافقة",
    updateConsent: "تحديث الموافقة",
    consentVersion: "إصدار الموافقة",
    reConsentRequired: "مطلوب إعادة الموافقة",
    purposeKey: "الغرض",
    purposeName: "اسم الغرض",
    legalBasis: "الأساس القانوني",
    required: "إلزامي",
    optional: "اختياري",

    // DSR
    dsr: "طلب موضوع البيانات",
    dsrId: "معرّف الطلب",
    requestType: "نوع الطلب",
    status: "الحالة",
    subject: "موضوع البيانات",
    subjectEmail: "البريد الإلكتروني",
    subjectType: "نوع الموضوع",
    deadline: "الموعد النهائي",
    daysRemaining: "الأيام المتبقية",
    slaProgress: "تقدم الـ SLA",
    submittedAt: "تاريخ التقديم",
    completedAt: "تاريخ الإكمال",
    reviewedBy: "المراجع",
    notes: "ملاحظات",
    resolution: "القرار",
    requesterNotes: "ملاحظات مقدم الطلب",

    // DSR Types
    export: "تصدير البيانات",
    erasure: "حذف البيانات",
    rectification: "تصحيح البيانات",
    restriction: "تقييد المعالجة",

    // DSR Status
    pending: "قيد الانتظار",
    inReview: "قيد المراجعة",
    approved: "تمت الموافقة",
    processing: "قيد المعالجة",
    partiallyCompleted: "مكتمل جزئياً",
    completed: "مكتمل",
    rejected: "مرفوض",
    cancelled: "ملغى",

    // DSR Actions
    approveDsr: "الموافقة على الطلب",
    rejectDsr: "رفض الطلب",
    cancelDsr: "إلغاء الطلب",
    submitDsr: "تقديم طلب",
    confirmErasure: "تأكيد الحذف",
    downloadExport: "تحميل البيانات",
    viewDetail: "عرض التفاصيل",
    moduleExecutions: "تنفيذات الوحدات",

    // Erasure gate
    erasureGate: "بوابة تأكيد الحذف",
    erasureGateWarning: "هذا الإجراء لا يمكن التراجع عنه. ستُجهَّل جميع البيانات الشخصية بشكل دائم.",
    erasureGraceNotice: "تنطبق فترة سماح قبل التنفيذ.",
    confirmErasureTitle: "تأكيد الحذف النهائي",

    // Retention
    retentionCategory: "الفئة",
    retentionDays: "فترة الاحتفاظ",
    minRetention: "الحد الأدنى للأيام",
    maxRetention: "الحد الأقصى للأيام",
    expiryAction: "إجراء الانتهاء",
    anonymize: "تجهيل",
    delete: "حذف",
    nextEvaluation: "التقييم التالي",
    executionHistory: "سجل التنفيذ",
    recordsProcessed: "السجلات المعالَجة",
    recordsAnonymized: "مجهَّلة",
    recordsDeleted: "محذوفة",
    updatePolicy: "تحديث السياسة",

    // Data Inventory
    module: "الوحدة",
    entity: "الكيان",
    field: "الحقل",
    dataCategory: "فئة البيانات",
    isAnonymized: "يُجهَّل عند الحذف",
    isExported: "مشمول في التصدير",

    // Reports
    reportType: "نوع التقرير",
    period: "الفترة",
    periodStart: "بداية الفترة",
    periodEnd: "نهاية الفترة",
    generateReport: "إنشاء تقرير",
    reportReady: "جاهز",
    reportPending: "قيد الإنشاء...",
    downloadReport: "تحميل",

    // Messages
    consentRecorded: "تم تسجيل الموافقة بنجاح",
    dsrSubmitted: "تم تقديم طلب موضوع البيانات",
    dsrApproved: "تمت الموافقة على الطلب",
    dsrRejected: "تم رفض الطلب",
    dsrCancelled: "تم إلغاء الطلب",
    erasureConfirmed: "تم تأكيد الحذف — بدأت فترة السماح",
    policyUpdated: "تم تحديث سياسة الاحتفاظ",
    reportQueued: "تم جدولة إنشاء التقرير",

    // Errors
    dsrNotFound: "الطلب غير موجود",
    regulationNotFound: "اللائحة غير موجودة",
    invalidStatus: "الإجراء غير متاح في الحالة الحالية للطلب",
    gracePeriodActive: "لا يزال الحذف في فترة السماح",

    // Empty states
    noDsrs: "لا توجد طلبات موضوع بيانات",
    noDsrsDesc: "ستظهر طلبات DSR هنا",
    noPolicies: "لم يتم تكوين سياسات احتفاظ",
    noInventory: "لا توجد عناصر في جرد البيانات",
    noReports: "لم يتم إنشاء تقارير",
  },
};
