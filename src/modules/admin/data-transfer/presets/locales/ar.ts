/**
 * Arabic translations for data exchange presets sub-module.
 */
export const ar = {
  adminDataTransferPresets: {
    title: "نماذج المطابقة المحفوظة",
    subtitle: "قوالب مطابقة الأعمدة المؤسسية المحفوظة لمسارات استيراد المستأجر لضمان معالجة بيانات موحدة وقابلة للتكرار.",
    searchPlaceholder: "البحث في النماذج بالاسم أو الكيان أو النمط...",
    empty: {
      title: "لا توجد نماذج مطابقة",
      description: "لم يتم العثور على أي نماذج مطابقة تطابق معايير التصفية الحالية.",
    },
    kpis: {
      totalPresets: "إجمالي النماذج",
      defaultPresets: "النماذج الافتراضية",
      entitiesCovered: "الكيانات المغطاة",
      totalMappings: "إجمالي الحقول المطابقة",
    },
    columns: {
      name: "اسم النموذج",
      entityKey: "الكيان المستهدف",
      importMode: "نمط الاستيراد",
      mappingsCount: "الأعمدة المطابقة",
      isDefault: "افتراضي",
      createdAt: "تاريخ الإنشاء",
      actions: "الإجراءات",
    },
    columnsCount: "{count} أعمدة",
    modes: {
      Insert: "إدراج",
      Update: "تحديث",
      Upsert: "إدراج وتحديث",
      AppendOnly: "إضافة فقط",
      UpdateOnly: "تحديث فقط",
    },
    actions: {
      delete: "حذف النموذج",
      deletePrompt: "هل أنت متأكد من رغبتك في حذف هذا النموذج؟",
      refresh: "تحديث النماذج",
      createInStudio: "إنشاء نموذج في الاستوديو",
      useInStudio: "استخدام النموذج في استوديو الاستيراد",
      setDefault: "تعيين كافتراضي",
    },
    toast: {
      setDefaultSuccess: "تم تعيين نموذج المطابقة كافتراضي بنجاح.",
      setDefaultError: "فشل تعيين نموذج المطابقة كافتراضي.",
      deleteSuccess: "تم حذف نموذج المطابقة بنجاح.",
      deleteError: "فشل حذف نموذج المطابقة.",
    },
    deleteDialog: {
      title: "حذف نموذج المطابقة",
      description: "هل أنت متأكد من رغبتك في حذف النموذج \"{name}\"؟ سيتعين على المستخدمين مطابقة الأعمدة يدوياً في عمليات الاستيراد المستقبلية للكيان {entityKey}.",
      confirm: "حذف النموذج",
      deleting: "جارٍ حذف النموذج...",
      success: "تم حذف النموذج بنجاح.",
      error: "فشل حذف النموذج.",
    },
    status: {
      isDefaultBadge: "افتراضي",
      customBadge: "مخصص",
    },
    tenantRequired: {
      title: "مطلوب تحديد مساحة عمل مستأجر",
      description: "نماذج مطابقة الأعمدة المحفوظة تابعة لمساحة عمل مستأجر نشطة. يرجى اختيار مستأجر أو انتحال سياقه قبل إدارة النماذج.",
      switchHint: "استخدم مبدّل مساحة عمل المستأجر في الشريط العلوي أو انتقل إلى صفحة المستأجرين للتبديل إلى مساحة عمل مستأجر.",
      goToTenants: "الانتقال إلى المستأجرين",
      retry: "إعادة التحقق من السياق",
    },
  },
};
