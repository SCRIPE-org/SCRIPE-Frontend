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
      placeholderEn: "النص التوضيحي (إنجليزي)",
      placeholderAr: "النص التوضيحي (عربي)",
      valueType: "نوع القيمة",
      options: "الخيارات",
      isRequired: "إلزامي",
      sortOrder: "ترتيب العرض",
      isActive: "نشط",
      scope: "النطاق",
      isGlobal: "عام (لكل المستأجرين)",
    },

    // Form placeholders
    placeholders: {
      entityTypeKey: "مثال: party.person",
      key: "مثال: shirt_size",
      labelEn: "أدخل التسمية بالإنجليزية",
      labelAr: "أدخل التسمية بالعربية",
      placeholderEn: "مثال: Enter your shirt size",
      placeholderAr: "مثال: أدخل مقاس القميص",
      options: "خيار واحد في كل سطر — لحقول الاختيار فقط",
    },

    // منتقي نوع الكيان: مجمّع حسب ما إذا كانت هناك شاشة تعرض هذا الحقل
    // فعليًا. العناصر المرتبطة بشاشة تظهر أولاً؛ مجموعة "API فقط" تبقى
    // قابلة للاختيار (واجهة القيم تعمل في الحالتين)، لكنها موسومة حتى لا
    // يعرّف أحد حقلاً يتوقع ظهوره في مكان ما بينما لا يظهر فعليًا.
    entityTypeGroups: {
      onScreen: "متاح على شاشة",
      apiOnly: "عبر الواجهة البرمجية فقط — لا توجد شاشة بعد",
    },
    noFrontendScreenWarning:
      "لا توجد شاشة تعرض {entity} حتى الآن. سيُحفظ هذا التعريف بشكل صحيح وستعمل واجهة القيم البرمجية معه، لكنه لن يظهر في أي نموذج إلى أن يتم بناء شاشة له.",

    // CustomFieldValueType enum (0..4)
    valueTypes: {
      text: "نص",
      number: "رقم",
      boolean: "قيمة منطقية",
      date: "تاريخ",
      select: "اختيار",
    },

    // رسائل التحقق الخاصة بكل نوع قيمة (حاليًا لحقول الاختيار فقط). أُضيفت
    // مبكرًا ضمن المهمة 4 من الموجة 2 الخطوة 2.2 (فرع الاختيار في
    // renderCustomFieldControl، والتحقق من انتماء القيمة للخيارات وفق القرار
    // D5) بدلاً من انتظار المهمة 10 الخاصة بالخطة نفسها — يجب أن تُوسّع
    // المهمة 10 هذا القسم لاحقًا لا أن تعيد إنشاء selectInvalidOption.
    values: {
      // تهيئة بصيغة {value}/{field}، بما يطابق تقاليد هذه الوحدة ({x} وليس
      // {{x}}). الصياغة تعكس رسالة الخلفية نفسها
      // customFields.values.selectInvalidOption (في SelectValueTypeHandler.Validate)
      // حتى يرى المستخدم نفس الحكم الذي سيرفضه الحفظ بخطأ 422.
      selectInvalidOption: "'{value}' ليست خيارًا صالحًا لحقل {field}.",
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

    // يظهر بجانب مفتاح "عام" وقت الإنشاء — يُعرض فقط لمسؤول عام (Super Admin).
    isGlobalDescription: {
      platformContext: "لم يتم تحديد أي مستأجر، لذا هذا التعريف يكون عامًا دائمًا.",
      tenantContext:
        "عند الإيقاف، يقتصر هذا الحقل على المستأجر الذي تعرضه حاليًا. عند التفعيل، يصبح متاحًا لكل مستأجر.",
    },

    // Inline "+ Add custom field" trigger, opened from inside another
    // screen's create/edit form (not the /custom-fields definitions screen).
    inlineAdd: {
      trigger: "+ إضافة حقل مخصص",
      dialogTitle: "إضافة حقل مخصص — {entity}",
    },
  },
};
