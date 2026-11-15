/** Arabic locale translations for Data Transfer Entities catalog sub-module. */
export const ar = {
  dataTransferEntities: {
    title: "كيانات تبادل البيانات",
    subtitle: "فهرس مستأجر للقراءة فقط يتم اكتشافه ديناميكياً من موفّري الوحدات والحقول المخصصة وحصص الباقة النشطة — لتشغيل استوديو الاستيراد والترحيل متعدد الجداول والنماذج والتصدير.",
    catalogInfo: "يتم اكتشاف الكيانات والحصص تلقائياً من موفّري الوحدات المسجلين في الخادم والحقول المخصصة واستحقاقات باقة المستأجر.",
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
      multiSheetMigration: "ترحيل متعدد الجداول",
      viewDescriptor: "عرض المخطط",
    },
    empty: {
      title: "لم يتم العثور على كيانات",
      description: "لا توجد كيانات تطابق معايير البحث والوحدات المحددة.",
    },
    tenantRequired: {
      title: "مطلوب تحديد مساحة عمل مستأجر",
      description: "مخططات الكيانات والحصص والنماذج في تبادل البيانات مرتبطة بمساحة عمل مستأجر نشطة. يرجى اختيار مستأجر قبل تشغيل عمليات الاستيراد أو التصدير.",
      switchHint: "استخدم مبدّل مساحة عمل المستأجر في الشريط العلوي أو انتقل إلى صفحة المستأجرين للدخول إلى مساحة عمل نادٍ أو مؤسسة.",
      goToTenants: "الانتقال إلى المستأجرين",
      retry: "إعادة التحقق من السياق",
    },
    detail: {
      parentEntities: "الكيانات الأبوية المعتمدة",
      multiSheetGroup: "حزمة الترحيل متعددة الجداول",
      autoCreateLookups: "إنشاء القوائم المرجعية تلقائياً",
      identityOnboarding: "تأهيل الهويات",
      importEntitlement: "ميزة الاستيراد",
      exportEntitlement: "ميزة التصدير",
    },
  },
};
