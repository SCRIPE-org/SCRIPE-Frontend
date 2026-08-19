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
    editLoadFailed: "تعذّر تحميل هذا الحقل المخصص للتعديل. يُرجى المحاولة مرة أخرى.",

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
      validatorKind: "أداة التحقق",
      validatorParam: "مُعامل أداة التحقق",
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

    // منتقي أداة التحقق — المهمة 10 من الموجة 2 الخطوة 2.5. يظهر فقط في
    // نموذج تعريف الحقل الخاص بالمسؤول (القرار D5)، ولحقول النص فقط، بنفس
    // آلية الإظهار الشرطي التي يستخدمها حقل "الخيارات" أعلاه لحقول الاختيار.
    // المجموعة المغلقة ذات الـ13 نوعًا هي ALL_VALIDATOR_KINDS/
    // VALIDATOR_KIND_CATALOG (validatorKindRegistry.ts، المهمة 8) — هذه
    // المفاتيح نصوص عرض فقط، وليست مصدرًا ثانيًا لمعرفة الأنواع الموجودة.
    validatorKindNone: "بدون تحقق",
    validatorKindDescription:
      "فحص تنسيق اختياري يُطبَّق عند حفظ هذا الحقل. اتركه على \"بدون تحقق\" لحقل نصي حر الصيغة.",
    validatorKinds: {
      iban: "آيبان (IBAN)",
      egyptianNationalId: "الرقم القومي المصري",
      saudiNationalId: "رقم الهوية السعودية",
      emiratiNationalId: "رقم الهوية الإماراتية",
      imei: "رقم IMEI",
      swiftBic: "رمز SWIFT / BIC",
      vehiclePlate: "رقم لوحة المركبة",
      postalCode: "الرمز البريدي",
      numericRange: "نطاق رقمي",
      lengthRange: "نطاق طول النص",
      oneOfList: "أحد قيم قائمة محددة",
      wildcardContains: "يحتوي على نص",
      wildcardStartsWith: "يبدأ بنص",
    },
    // تلميح لكل نوع يظهر بجانب حقل "مُعامل أداة التحقق"، للأنواع الستة التي
    // تتطلب معاملًا فقط (paramHintKey في validatorKindRegistry.ts).
    validatorKindParamHints: {
      postalCode: "اختر الدولة التي يجب أن يتطابق الرمز البريدي لهذا الحقل مع صيغتها.",
      numericRange:
        'أقل وأكبر رقم مسموح به، مفصولين بفاصلة، مثل "1,100". يمكن ترك أي طرف فارغًا لعدم تحديد حد له.',
      lengthRange:
        'أقل وأكبر عدد أحرف مسموح به، مفصولين بفاصلة، مثل "2,50". يمكن ترك أي طرف فارغًا لعدم تحديد حد له.',
      oneOfList: "قيمة واحدة مسموح بها في كل سطر. يجب أن تُطابق القيمة المحفوظة إحداها تمامًا (مع مراعاة حالة الأحرف).",
      wildcardContains: "يجب أن تحتوي القيمة على هذا النص (مع مراعاة حالة الأحرف).",
      wildcardStartsWith: "يجب أن تبدأ القيمة بهذا النص (مع مراعاة حالة الأحرف).",
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

    // CustomFieldValueType enum (0..16) -- المهمة 10 من الموجة 3.1 أضافت
    // longText/dateTime/multiSelect (LongText=5, DateTime=6, MultiSelect=7)؛
    // الدفعة 3 من الموجة 3.2 تضيف email/url/phone/percent/rating (Email=8,
    // Url=9, Phone=10, Percent=11, Rating=12)؛ الدفعة C من الموجة 3.3 تضيف
    // currency/duration/time/color (Currency=13, Duration=14, Time=15,
    // Color=16).
    valueTypes: {
      text: "نص",
      number: "رقم",
      boolean: "قيمة منطقية",
      date: "تاريخ",
      select: "اختيار",
      longText: "نص طويل",
      dateTime: "التاريخ والوقت",
      multiSelect: "اختيار متعدد",
      email: "بريد إلكتروني",
      url: "رابط",
      phone: "هاتف",
      percent: "نسبة مئوية",
      rating: "تقييم",
      currency: "عملة",
      duration: "المدة",
      time: "الوقت",
      color: "لون",
    },

    // رسائل التحقق الخاصة بكل نوع قيمة. أُضيفت مبكرًا ضمن المهمة 4 من الموجة 2
    // الخطوة 2.2 (فرع الاختيار في renderCustomFieldControl، والتحقق من انتماء
    // القيمة للخيارات وفق القرار D5) — المهمة 11 من الموجة 3.1 توسّع هذا
    // القسم للاختيار المتعدد بدلاً من إعادة إنشاء selectInvalidOption، تمامًا
    // كما طلب هذا التعليق أصلاً من أي مهمة تالية توسّعه.
    values: {
      // تهيئة بصيغة {value}/{field}، بما يطابق تقاليد هذه الوحدة ({x} وليس
      // {{x}}). الصياغة تعكس رسالة الخلفية نفسها
      // customFields.values.selectInvalidOption (في SelectValueTypeHandler.Validate)
      // حتى يرى المستخدم نفس الحكم الذي سيرفضه الحفظ بخطأ 422.
      // تُستخدم أيضًا حرفيًا في التحقق من انتماء خيارات الاختيار المتعدد
      // (المهمة 11) — "ليست ضمن الخيارات المسموح بها" مفهوم واحد للنوعين.
      selectInvalidOption: "'{value}' ليست خيارًا صالحًا لحقل {field}.",
      // تعكس رسالة الخلفية customFields.values.multiSelectTooManySelections
      // (في MultiSelectValueTypeHandler.Validate) — تظهر على العميل قبل أن
      // يصطدم الحفظ بخطأ 422 لنفس السبب.
      multiSelectTooManySelections: "يسمح حقل {field} باختيار {max} خيارات كحد أقصى.",
      // تعكس رسالة الخلفية customFields.values.multiSelectDuplicateOption.
      // قيمة الاختيار المتعدد هي مجموعة (Set) لا قائمة مكررة — اختيار نفس
      // الخيار مرتين يُرفض بنفس الطريقة على الواجهتين.
      multiSelectDuplicateOption: "تم اختيار '{value}' أكثر من مرة لحقل {field}.",
      // الدفعة C من الموجة 3.3: تحقق الحقل الناقص لنوع العملة — كلا الجزأين
      // (المبلغ ورمز العملة) مطلوبان معًا بمجرد إدخال أحدهما.
      currencyIncomplete: "يحتاج حقل {field} إلى مبلغ ورمز عملة معًا.",
    },

    // تلميح العدّاد الحي/الحد الأقصى للاختيار المتعدد (المهمة 11 من الموجة
    // 3.1) — يُعرض أسفل الحقل بواسطة MultiSelectCustomFieldControl.tsx، وليس
    // رسالة خطأ تحقّق أبدًا: هذا نص واجهة، وليس رسالة رفض حفظ (تلك موجودة في
    // قسم values أعلاه).
    multiSelect: {
      selectionCount: "{count} من {max} محدد",
      maxSelectionsReached: "تم الوصول للحد الأقصى ({max}) — أزل خيارًا لإضافة آخر.",
    },

    // عدّاد الأحرف لحقل النص الطويل (المهمة 12 من الموجة 3.1) — يُعرض أسفل
    // الحقل بواسطة LongTextCustomFieldControl.tsx. نص واجهة، وليس رسالة رفض
    // حفظ. charactersOverLimit تذكر مقدار الزيادة نفسه وليس العدد الكلي.
    longText: {
      characterCount: "{count} من {max} حرفًا",
      charactersOverLimit: "زيادة {overBy} حرفًا عن الحد الأقصى ({max})",
    },

    // إظهار المنطقة الزمنية وإمكانية تغييرها لحقل التاريخ والوقت (المهمة 12
    // من الموجة 3.1) — تُعرض بواسطة DateTimeCustomFieldControl.tsx. المنطقة
    // الزمنية تُعرض دائمًا كنص، وليست سؤالًا يُطرح على المستخدم.
    dateTime: {
      zoneDisclosure: "المنطقة الزمنية: {zone}",
      changeTimezone: "تغيير",
      cancelTimezoneChange: "إلغاء",
      timezonePickerLabel: "المنطقة الزمنية لحقل {field}",
    },

    // وحدة المدة الصريحة (الدفعة C من الموجة 3.3) — تُعرض بجانب حقل التحرير
    // وفي التنسيق عند القراءة أيضًا، حتى لا يبقى عدد الدقائق المخزّن بلا
    // وحدة واضحة في أي من الاتجاهين.
    duration: {
      unitLabel: "دقيقة",
    },

    // حقل العملة المزدوج: المبلغ + رمز العملة (الدفعة C من الموجة 3.3،
    // القرارين R1/R2) — يُعرض بواسطة CurrencyCustomFieldControl.tsx.
    currency: {
      amountLabel: "مبلغ {field}",
      codeLabel: "رمز عملة {field}",
      codePlaceholder: "USD",
      pairHint: "المبلغ ورمز العملة مطلوبان معًا.",
    },

    // منتقي اللون المُعمَّم (الدفعة C من الموجة 3.3، القرار R5) — يُعيد
    // استخدام core/ui/rich-text-editor/ColorPickerField.tsx عبر خاصية
    // i18nKeyPrefix الجديدة الخاصة به.
    color: {
      swatch: "استخدم اللون {color}",
      custom: "لون سداسي مخصص",
      hexPlaceholder: "3b82f6",
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

    // كتالوج أنواع القيم -- الصف 5.4 من الموجة 5. صفحة مرجعية للعرض فقط على
    // /custom-fields/value-types، يمكن الوصول إليها عبر رابط في شاشة
    // التعريفات أعلاه. عمود "قفل الأهلية" (entitlement lock) حُذف عمدًا --
    // حقلا Availability/RequiredFeature في §4.6 لم يُنفَّذا على أي من
    // الواجهتين (تحليل ما قبل الخطة، القرار R5)، فلا توجد بيانات حقيقية
    // لعرضها؛ عمود مُلفَّق أو فارغ دائمًا أسوأ من عدم وجود عمود إطلاقًا.
    valueTypeCatalog: {
      title: "أنواع القيم",
      description:
        "كل نوع قيمة يمكن أن يستخدمه حقل مخصص، والغرض منه، وسلوكه. هذا الكتالوج للعرض فقط -- أنواع القيم ثابتة على مستوى المنصة ولا يمكن إضافتها أو تعديلها أو حذفها من هنا.",
      browseLink: "استعراض أنواع القيم",
      stats: {
        total: "أنواع القيم",
        withOptions: "تملك قائمة خيارات",
        withValidator: "تدعم أداة تحقق",
      },
      columns: {
        valueType: "نوع القيمة",
        description: "الوصف",
        placeholder: "نص توضيحي",
        options: "قائمة خيارات",
        validator: "أداة تحقق",
      },
      // جملة واحدة لكل نوع قيمة: الغرض منه وشكل عنصر التحكم الخاص به معًا.
      // أسماء المفاتيح هنا مطابقة عمدًا لأسماء valueTypes أعلاه -- الشاشة
      // تشتق هذا المفتاح من نهاية labelKey الخاص بكل عنصر في الكتالوج بدلاً
      // من خريطة ثانية مُدارة يدويًا، حتى لا ينحرف القسمان عن بعضهما أبدًا.
      descriptions: {
        text: "حقل نصي حر من سطر واحد. النوع الوحيد الذي يمكن أن يحمل أداة تحقق اختيارية من التنسيق (انظر عمود أداة التحقق).",
        number: "حقل رقمي لإدخال قيم صحيحة أو عشرية.",
        boolean: "مفتاح تبديل تشغيل/إيقاف. لا يملك نصًا توضيحيًا ولا خيارات.",
        date: "منتقي تاريخ من تقويم، بدون عنصر وقت.",
        select: "اختيار واحد من قائمة خيارات ثابتة تحددها عند إنشاء الحقل.",
        longText: "منطقة نص متعددة الأسطر لمحتوى حر أطول، بحد أقصى 10,000 حرف.",
        dateTime: "منتقي مُركّب للتاريخ والوقت معًا. اللحظة المحفوظة تحمل منطقة زمنية صريحة.",
        multiSelect: "اختيارات متعددة من قائمة خيارات ثابتة تحددها، بحد أقصى 19 اختيارًا.",
        email: "حقل من سطر واحد لعنوان بريد إلكتروني.",
        url: "حقل من سطر واحد لعنوان ويب. تُقبل روابط http وhttps فقط.",
        phone: "حقل رقم هاتف، يُخزَّن ويُتحقق منه بصيغة دولية (E.164).",
        percent: "قيمة رقمية بين 0 و100، تُعرض مع رمز %.",
        rating: "تقييم من 1 إلى 5 يُلتقط عبر شريط تمرير. لا يوجد إدخال نصي حر.",
        currency: "مبلغ ورمز عملة مقترنان -- كلاهما مطلوب معًا.",
        duration: "مدة زمنية، تُدخَل وتُخزَّن بالدقائق.",
        time: "منتقي وقت اليوم، بدون عنصر تاريخ.",
        color: "منتقي لون بعينة مرئية مع إدخال رمز سداسي مخصص.",
      },
    },
  },
};
