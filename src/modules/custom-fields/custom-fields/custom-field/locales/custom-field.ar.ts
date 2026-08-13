export const ar = {
  customField: {
    title: "الحقول المخصصة",
    description: "عرّف حقولاً مخصصة قابلة للتهيئة لكل مستأجر على سجلاتك",
    addNew: "إضافة حقل مخصص",
    editTitle: "تعديل حقل مخصص",
    deleteTitle: "حذف حقل مخصص",
    deleteConfirm: "هل أنت متأكد من حذف هذا الحقل المخصص؟",
    noItems: "لا توجد حقول مخصصة",
    searchPlaceholder: "ابحث في الحقول المخصصة...",
    entityTypesLoadFailed: "تعذّر تحميل أنواع الكيانات. قد يكون حقل نوع الكيان غير متاح.",

    // Field labels — shared between the table columns and the create/edit forms
    fields: {
      entityTypeKey: "نوع الكيان",
      key: "المفتاح",
      labelEn: "التسمية (إنجليزي)",
      labelAr: "التسمية (عربي)",
      valueType: "نوع القيمة",
      options: "الخيارات",
      isRequired: "إلزامي",
      sortOrder: "ترتيب العرض",
      isActive: "نشط",
      scope: "النطاق",
    },

    // Form placeholders
    placeholders: {
      entityTypeKey: "مثال: party.person",
      key: "مثال: shirt_size",
      labelEn: "أدخل التسمية بالإنجليزية",
      labelAr: "أدخل التسمية بالعربية",
      options: "خيار واحد في كل سطر — لحقول الاختيار فقط",
    },

    // CustomFieldValueType enum (0..4)
    valueTypes: {
      text: "نص",
      number: "رقم",
      boolean: "قيمة منطقية",
      date: "تاريخ",
      select: "اختيار",
    },

    // Required / Optional flag
    required: "إلزامي",
    optional: "اختياري",

    // Platform-owned (TenantId == null) definition, inherited by every tenant
    global: "عام",

    // Shown on the definitions screen when a Super Admin has no tenant
    // context — the exact same form creates a GLOBAL definition here,
    // with no other visual difference from a tenant-scoped one.
    platformContext: {
      title: "سياق المنصة — لم يتم تحديد مستأجر",
      description:
        "أي حقل تنشئه هنا يكون عامًا: يُطبَّق تلقائيًا على كل مستأجر، وليس مقتصرًا على واحد. إذا كنت تقصد إنشاء حقل خاص بمستأجر معيّن، ادخل إلى سياق ذلك المستأجر أولاً.",
    },

    // Inline "+ Add custom field" trigger, opened from inside another
    // screen's create/edit form (not the /custom-fields definitions screen).
    inlineAdd: {
      trigger: "+ إضافة حقل مخصص",
      dialogTitle: "إضافة حقل مخصص — {entity}",
    },
  },
};
