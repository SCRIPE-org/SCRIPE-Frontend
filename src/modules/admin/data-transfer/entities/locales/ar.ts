/** Arabic locale translations for Data Transfer Entities catalog sub-module. */
export const ar = {
  dataTransferEntities: {
    title: "كيانات تبادل البيانات",
    subtitle: "فهرس مستأجر للقراءة فقط يتم اكتشافه ديناميكياً من موفّري الوحدات والحقول المخصصة وحصص الباقة النشطة — لتشغيل استوديو الاستيراد والترحيل متعدد الجداول والنماذج والتصدير.",
    catalogInfo: "يتم اكتشاف الكيانات والحصص تلقائياً من موفّري الوحدات المسجلين في الخادم والحقول المخصصة واستحقاقات باقة المستأجر.",
    searchPlaceholder: "البحث عن الكيانات بالمفتاح أو الاسم أو الوحدة...",
    filterModule: "كافة الوحدات",
    filters: {
      moduleLabel: "الوحدة",
    },
    modules: {
      CRM: "إدارة علاقات العملاء",
      Identity: "الهوية والصلاحيات",
      PartyKernel: "جهات الاتصال والأطراف",
      Academy: "الأكاديمية",
      Venue: "المنشآت والملاعب",
      Finance: "المالية",
      HRMS: "الموارد البشرية",
      WorkManagement: "إدارة المهام",
    },
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
      unfilteredTitle: "لا توجد كيانات متاحة لتبادل البيانات",
      unfilteredDescription:
        "لا توجد كيانات تبادل بيانات مفعلة حالياً لمساحة عمل هذا المستأجر.",
    },
    error: {
      title: "تعذر تحميل فهرس الكيانات",
      description: "حدث خطأ غير متوقع أثناء جلب بيانات الكيانات والحصص.",
      templateDownloadFailed: "فشل تنزيل ملف النموذج.",
    },
    tenantRequired: {
      title: "مطلوب تحديد مساحة عمل مستأجر",
      description: "مخططات الكيانات والحصص والنماذج في تبادل البيانات مرتبطة بمساحة عمل مستأجر نشطة. يرجى اختيار مستأجر قبل تشغيل عمليات الاستيراد أو التصدير.",
      switchHint: "استخدم مبدّل مساحة عمل المستأجر في الشريط العلوي أو انقر على «اختيار مساحة عمل مستأجر» للتبديل في نفس الصفحة.",
      goToTenants: "اختيار مساحة عمل مستأجر",
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
