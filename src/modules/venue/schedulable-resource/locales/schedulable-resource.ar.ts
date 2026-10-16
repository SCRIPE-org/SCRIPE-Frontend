export const ar = {
  schedulableResource: {
    title: "منشئ الموارد",
    description: "قم بتركيب الموارد القابلة للحجز، وتحديد سعتها، ونشرها للجدولة.",
    builderTitle: "منشئ الموارد",
    builderDescription: "قم بتركيب الموارد القابلة للحجز، وتحديد سعتها، ونشرها للجدولة.",
    addNew: "إضافة مورد",
    editTitle: "تعديل المورد",
    deleteTitle: "حذف المورد",
    deleteConfirm: "هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.",
    noItems: "لا توجد موارد قابلة للجدولة بعد",
    noItemsDescription: "أضف موردًا لبدء بناء مخزون الحجز الخاص بك.",
    empty: "لا توجد موارد قابلة للجدولة بعد",
    emptyDescription: "أضف موردًا لبدء بناء مخزون الحجز الخاص بك.",
    formDescription: "اربط بملف تعريف مورد المرفق وحدد كيفية تركيب هذا المورد وتخصيصه.",
    checklistTitle: "قائمة تحقق النشر",
    checklistAllClear: "تم استيفاء جميع المتطلبات — هذا المورد جاهز للنشر.",
    compositeHint: "مورد مركّب — تأتي سعته من الموارد الفرعية.",
    status: {
      draft: "مسودة",
      published: "منشور",
    },
    fields: {
      facilityResourceProfileId: "ملف تعريف مورد المرفق",
      name: "الاسم",
      description: "الوصف",
      parent: "المورد الأصل",
      noParent: "بدون أصل (مورد من المستوى الأعلى)",
      isComposite: "مركّب (مُجمّع من موارد فرعية)",
      namedUnitLabel: "تسمية الوحدة",
      unitCount: "عدد الوحدات",
      allocationMode: "وضع التخصيص",
      maxConcurrentUsage: "الحد الأقصى للاستخدام المتزامن",
    },
    placeholders: {
      facilityResourceProfileId: "ابحث عن ملف تعريف مورد...",
      namedUnitLabel: "مثال: ملعب، مسار، حجرة",
    },
    descriptions: {
      facilityResourceProfileId:
        "ملف تعريف مورد FacilityOperations الذي يُجدوَل هذا المورد بناءً عليه.",
      parent: "عيّن هذا المورد ضمن مورد مركّب لتضمينه تحته (مثل ملعب ضمن مجمع ملاعب).",
    },
    allocationMode: {
      singleUnit: "وحدة واحدة (حجز واحد في كل مرة)",
      pooledUnits: "وحدات مجمّعة (وحدات مسماة قابلة للتبديل)",
    },
    actions: {
      checklist: "عرض قائمة تحقق النشر",
      publish: "نشر",
    },
  },
};
