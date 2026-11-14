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
  },
};
