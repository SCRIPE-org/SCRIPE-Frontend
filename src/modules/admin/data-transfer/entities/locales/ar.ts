/** Arabic locale translations for Data Transfer Entities catalog sub-module. */
export const ar = {
  dataTransferEntities: {
    title: "كيانات تبادل البيانات",
    subtitle: "إمكانات استيراد وتصدير الجداول المؤسسية وتوليد النماذج والحدود التوزيعية",
    searchPlaceholder: "البحث عن الكيانات بالمفتاح أو الاسم أو الوحدة...",
    filterModule: "كافة الوحدات",
    kpi: {
      totalEntities: "إجمالي الكيانات",
      importable: "جاهزة للاستيراد",
      exportable: "جاهزة للتصدير",
      quotaConstrained: "محمية بالحصص",
    },
    columns: {
      entity: "الكيان",
      owningModule: "الوحدة المالكة",
      supportedModes: "الأنماط المدعومة",
      quota: "حصة النسخة",
      actions: "الإجراءات",
    },
    quota: {
      unlimited: "غير محدود",
      slotsRemaining: "متبقي {remaining} من {limit} خانة",
      exhausted: "الحصة ممتلئة",
    },
    modes: {
      Insert: "إدراج",
      Update: "تحديث",
      Upsert: "إدراج وتحديث",
    },
    capabilities: {
      importAndExport: "استيراد وتصدير",
      importOnly: "استيراد فقط",
      exportOnly: "تصدير فقط",
    },
    actions: {
      downloadTemplate: "تنزيل النموذج",
      downloadingTemplate: "جارٍ التنزيل...",
      launchStudio: "تشغيل استوديو الاستيراد",
      quickExport: "تصدير البيانات",
      viewDescriptor: "عرض المخطط",
    },
    empty: {
      title: "لم يتم العثور على كيانات",
      description: "لا توجد كيانات تطابق معايير البحث والوحدات المحددة.",
    },
  },
};
