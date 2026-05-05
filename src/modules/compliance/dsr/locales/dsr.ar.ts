/**
 * Compliance — DSR sub-module locale (Arabic)
 */
export const ar = {
  compliance: {
    dsrTitle: "طلبات موضوع البيانات",
    dsr: "طلب موضوع البيانات",
    dsrId: "معرّف الطلب",
    requestType: "نوع الطلب",
    status: "الحالة",
    subject: "موضوع البيانات",
    subjectEmail: "البريد الإلكتروني",
    subjectType: "نوع الموضوع",
    deadline: "الموعد النهائي",
    daysRemaining: "الأيام المتبقية",
    remaining: "متبقية",
    sla: "مؤشر SLA",
    slaProgress: "تقدم الـ SLA",
    submittedAt: "تاريخ التقديم",
    completedAt: "تاريخ الإكمال",
    reviewedBy: "المراجع",
    notes: "ملاحظات",
    resolution: "القرار",
    requesterNotes: "ملاحظات مقدم الطلب",
    overdue: "متأخر",
    completed: "مكتمل",
    allTypes: "جميع الأنواع",
    total: "الإجمالي",

    // DSR Types
    export: "تصدير البيانات",
    erasure: "حذف البيانات",
    rectification: "تصحيح البيانات",
    restriction: "تقييد المعالجة",

    requestTypes: {
      export: "تصدير",
      erasure: "حذف",
      rectification: "تصحيح",
      restriction: "تقييد",
    },
    regulations: {
      gdpr: "GDPR",
      ccpa: "CCPA",
      pdpa: "PDPA",
    },

    // DSR Status (flat — used by DsrView filter pills via dynamic key construction)
    pending: "قيد الانتظار",
    inReview: "قيد المراجعة",
    approved: "تمت الموافقة",
    processing: "قيد المعالجة",
    partiallyCompleted: "مكتمل جزئياً",
    rejected: "مرفوض",
    cancelled: "ملغى",

    // DSR Status labels (nested — used by DsrDetailView STATUS_META.labelKey)
    statusLabels: {
      pending: "قيد الانتظار",
      inReview: "قيد المراجعة",
      approved: "تمت الموافقة",
      processing: "قيد المعالجة",
      partiallyCompleted: "مكتمل جزئياً",
      completed: "مكتمل",
      rejected: "مرفوض",
      cancelled: "ملغى",
    },

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
    erasureGateWarning:
      "هذا الإجراء لا يمكن التراجع عنه. ستُجهَّل جميع البيانات الشخصية بشكل دائم.",
    erasureGraceNotice: "تنطبق فترة سماح قبل التنفيذ.",
    confirmErasureTitle: "تأكيد الحذف النهائي",

    // Detail View Keys
    dsrDetailTitle: "تفاصيل طلب موضوع البيانات",
    confirmErasureBtn: "تأكيد الحذف",
    downloadExportBtn: "تحميل التصدير",
    details: "التفاصيل",
    records: "سجلات",
    statusHistory: "سجل الحالة",
    noHistory: "لا يوجد سجل متاح.",
    erasureStatusTitle: "حالة الحذف",
    erasureScheduledDesc: "تم تأكيد الحذف. التنفيذ مجدول.",
    erasurePendingDesc: "في انتظار تأكيد الحذف النهائي.",
    confirmErasureDialogTitle: "تأكيد حذف البيانات",
    confirmErasureDialogDesc: "هذا الإجراء لا يمكن التراجع عنه. سيتم تجهيل أو حذف جميع البيانات الشخصية المرتبطة عبر جميع الوحدات بشكل دائم وفقاً لسياسات الاحتفاظ.",
    typeConfirmToContinue: "اكتب CONFIRM لتنفيذ الحذف:",
    executeErasureBtn: "تنفيذ الحذف",
    columns: {
      requestType: "نوع الطلب",
      status: "الحالة",
      deadline: "الموعد النهائي",
      regulation: "اللائحة",
      subjectEmail: "الموضوع",
    },

    // Empty states & errors
    noDsrs: "لا توجد طلبات موضوع بيانات",
    noDsrsDesc: "ستظهر طلبات DSR هنا",
    dsrNotFound: "الطلب غير موجود",
    invalidStatus: "الإجراء غير متاح في الحالة الحالية للطلب",
    gracePeriodActive: "لا يزال الحذف في فترة السماح",

    // Messages
    dsrSubmitted: "تم تقديم طلب موضوع البيانات",
    dsrApproved: "تمت الموافقة على الطلب",
    dsrRejected: "تم رفض الطلب",
    dsrCancelled: "تم إلغاء الطلب",
    erasureConfirmed: "تم تأكيد الحذف — بدأت فترة السماح",

    // Dialog / form extras
    submitDsrDesc: "تقديم طلب بيانات جديد نيابةً عن صاحب البيانات.",
    resolutionPlaceholder: "أضف ملاحظات القرار…",
    notesPlaceholder: "ملاحظات اختيارية لمقدم الطلب…",

    // Shared labels
    active: "نشط",
    inactive: "غير نشط",
    regulation: "اللائحة",
  },
};
