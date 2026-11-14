/**
 * Arabic translations for data transfer jobs sub-module.
 */
export const ar = {
  adminDataTransferJobs: {
    title: "مهام وعمليات النقل",
    subtitle: "مراقبة حية وتتبع للتقدم وإدارة ملفات المخرجات لجميع مسارات الاستيراد والتصدير والترحيل الخلفية.",
    searchPlaceholder: "البحث برمز المهمة أو الكيان أو اسم الملف...",
    empty: {
      title: "لا توجد مهام نقل",
      description: "لم يتم العثور على أي مهام نقل تطابق معايير التصفية المحددة.",
    },
    kpis: {
      totalJobs: "إجمالي المهام",
      activeJobs: "قيد التنفيذ / بالانتظار",
      completedJobs: "مكتملة بنجاح",
      failedJobs: "فاشلة / ملغاة",
    },
    columns: {
      jobId: "رمز المهمة",
      kind: "النوع",
      entityKey: "الكيان المستهدف",
      status: "حالة التنفيذ",
      progress: "التقدم",
      rowsSummary: "المعالج / الإجمالي",
      metrics: "المعتمد / المرفوض",
      createdAt: "تاريخ الإنشاء",
      actions: "الإجراءات",
    },
    kinds: {
      Import: "استيراد",
      Export: "تصدير",
      Migration: "ترحيل",
    },
    statuses: {
      Pending: "قيد الانتظار",
      Running: "جارٍ التنفيذ",
      Completed: "مكتمل",
      Failed: "فشل",
      Cancelled: "ملغي",
      Expired: "منتهي الصلاحية",
    },
    actions: {
      cancel: "إلغاء المهمة",
      cancelPrompt: "إلغاء تنفيذ هذه المهمة؟",
      downloadRejected: "تنزيل المرفوضات",
      downloadExport: "تنزيل المخرجات",
      refresh: "تحديث البيانات",
    },
    cancelDialog: {
      title: "إلغاء مهمة النقل",
      description: "هل أنت متأكد من رغبتك في طلب إلغاء المهمة {jobId}؟ سيتم إيقاف الدفعات النشطة بأمان مع الحفاظ على السجلات المعتمدة.",
      confirm: "نعم، قم بإلغاء المهمة",
      cancelling: "جارٍ إلغاء المهمة...",
      success: "تم طلب الإلغاء بنجاح.",
      error: "فشل طلب إلغاء المهمة.",
    },
    download: {
      starting: "جارٍ تجهيز الملف للتنزيل...",
      success: "تم تنزيل الملف بنجاح.",
      failed: "فشل في تنزيل ملف المخرجات.",
    },
    filters: {
      allStatuses: "كافة الحالات",
      allKinds: "كافة الأنواع",
    },
  },
};
