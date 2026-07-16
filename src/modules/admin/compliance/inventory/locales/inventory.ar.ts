/**
 * Compliance — Inventory sub-module locale (Arabic)
 */
export const ar = {
  compliance: {
    dataInventory: "جرد البيانات",
    dataInventoryDesc: "إدارة وتتبع حقول البيانات عبر جميع وحدات المنصة.",
    module: "الوحدة",
    entity: "الكيان",
    field: "الحقل",
    dataCategory: "فئة البيانات",
    legalBasis: "الأساس القانوني",
    isAnonymized: "يُجهَّل عند الحذف",
    isExported: "مدرج في التصدير",
    total: "الإجمالي",
    categories: {
      ContactData: "بيانات الاتصال",
      IdentityData: "بيانات الهوية",
      FinancialData: "البيانات المالية",
      TechnicalData: "البيانات الفنية",
      OrganisationData: "البيانات المؤسسية",
      ContentData: "بيانات المحتوى",
      // Database value aliases
      Contact: "بيانات الاتصال",
      Profile: "بيانات الملف الشخصي",
      Identity: "بيانات الهوية",
      Financial: "البيانات المالية",
      Security: "بيانات الأمان",
      Organisation: "البيانات المؤسسية",
      Content: "بيانات المحتوى",
      Behavioral: "البيانات السلوكية",
      Technical: "البيانات الفنية",
    },
    // New keys for GenericCrudView and modals
    addInventory: "إضافة جرد",
    inventoryAdded: "تمت إضافة الجرد بنجاح",
    inventoryUpdated: "تم تحديث الجرد بنجاح",
    inventoryDeleted: "تم حذف الجرد بنجاح",
    inventoryAddFailed: "فشل في إضافة الجرد",
    requiredFieldsMissing: "الحقول المطلوبة مفقودة",
    placeholders: {
      moduleName: "مثال: الهوية",
      entityName: "مثال: مستخدم",
      fieldName: "مثال: عنوان البريد الإلكتروني",
      selectCategory: "حدد الفئة",
      selectLegalBasis: "حدد الأساس القانوني",
    },
    legalBases: {
      Consent: "موافقة",
      Contract: "عقد",
      LegalObligation: "التزام قانوني",
      VitalInterests: "مصالح حيوية",
      PublicTask: "مهمة عامة",
      LegitimateInterest: "مصلحة مشروعة",
      // Database value aliases (lowercase/snake_case)
      consent: "موافقة",
      contract: "عقد",
      legal_obligation: "التزام قانوني",
      vital_interests: "مصالح حيوية",
      public_task: "مهمة عامة",
      legitimate_interest: "مصلحة مشروعة",
    },
    // Empty states
    noInventory: "لا توجد عناصر في جرد البيانات",
    noInventoryDesc: "لم يتم العثور على حقول مطابقة. حاول تعديل بحثك.",
  },
};
