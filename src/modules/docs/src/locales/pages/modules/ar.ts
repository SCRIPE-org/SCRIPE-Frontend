/**
 * Docs modules — AR
 * Auto-filled 75 keys from EN.
 */
export const ar = {
  modules: {
    compliance: {
      consent: {
        conn1: "القوالب",
        conn2: "تولد عند التغيير",
        conn3: "سحب تلقائي في حالة انتهاء الصلاحية",
        descJob: "مهمة يومية تسحب الموافقات منتهية الصلاحية",
        descPurpose: "يحدد ما يتم الموافقة عليه (مثل التسويق)",
        descRecord: "حالة المستخدم الحالية (ممنوح/مسحوب) لكل غرض",
        description:
          "تسجيل وتتبع وتدقيق منح موافقة المستخدمين وسحبها للامتثال للمادة 6 من GDPR وCCPA.",
        descSnapshot: "التقاط غير قابل للتغيير لمنح/سحب الموافقة في نقطة زمنية",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          get: "الحصول على سجل الموافقة حسب المعرف",
          list: "قائمة جميع سجلات الموافقة (مع ترقيم الصفحات، قابلة للتصفية حسب الغرض/الحالة)",
          record: "تسجيل منح موافقة جديدة",
          withdraw: "سحب موافقة ممنوحة سابقاً",
        },
        flowTitle: "مسار حالة الموافقة",
        gdprIntro:
          "بموجب المادة 6 من GDPR، يجب أن تكون الموافقة: طوعية ومحددة ومستنيرة ولا لبس فيها. تسجل SCRIPE النسخة الدقيقة من نص الموافقة المعروضة للمستخدم والطابع الزمني لقبوله، مما يوفر مسار تدقيق قابلاً للدفاع عنه قانونياً.",
        gdprTitle: "الأساس القانوني لـ GDPR",
        immutabilityIntro: "سجلات الموافقة غير قابلة للتغيير وتتتبع السلامة.",
        immutabilityTitle: "ثبات",
        intro:
          "تسجل إدارة الموافقة في كل مرة يمنح فيها المستخدم موافقته أو يسحبها لغرض محدد (مثل رسائل البريد الإلكتروني التسويقية، تتبع التحليلات). تخزن SCRIPE مسار تدقيق الموافقة الكامل بما في ذلك الطابع الزمني وعنوان IP ووكيل المستخدم والنسخة الدقيقة من نص الموافقة المعروضة.",
        nodeJob: "مهمة انتهاء صلاحية الموافقة",
        nodePurpose: "غرض الموافقة",
        nodeRecord: "سجل الموافقة",
        nodeSnapshot: "لقطة الموافقة",
        purpose1: "التسويق — التسويق عبر البريد الإلكتروني والاتصالات الترويجية.",
        purpose2: "التحليلات — تحليلات الاستخدام وتحسين المنتج.",
        purpose3: "طرف ثالث — مشاركة البيانات مع خدمات طرف ثالث.",
        purpose4: "التخصيص — المحتوى المخصص والتوصيات.",
        purposesIntro: "كل سجل موافقة مرتبط بغرض محدد. تشمل الأغراض الشائعة:",
        purposesTitle: "أغراض الموافقة",
        title: "إدارة الموافقة",
        withdrawalIntro:
          "يمكن للمستخدمين سحب موافقتهم في أي وقت. عند سحب الموافقة، يُحدَّث ConsentRecord بطابع زمني WithdrawnAt. يجب إعلام الأنظمة المتلقية عبر أحداث النطاق لإيقاف معالجة البيانات للغرض المسحوب.",
        withdrawalTitle: "سحب الموافقة",
      },
      dsr: {
        codeTitle: "مثال كود",
        conn1: "يبدأ",
        conn2: "تلتقط مهمة الخلفية",
        conn3: "إذا تمت المعالجة تلقائيًا (تصدير)",
        conn4: "إذا كان جذريًا (حذف)",
        conn5: "يؤكد المسؤول",
        conn6: "يرفض المسؤول",
        descApproval: "تتطلب الإجراءات الجذرية (الحذف) تأكيدًا يدويًا من المسؤول",
        descCompleted: "تم إنشاء التصدير أو مسح البيانات؛ تم استيفاء اتفاقية مستوى الخدمة",
        descPending: "يتم تسجيل الطلب، ويتم حساب الموعد النهائي لاتفاقية مستوى الخدمة",
        descProcessing:
          "تبدأ مهمة تنفيذ طلب موضوع البيانات بمعالجة الوحدات عبر الوحدة القابلة للتعليق",
        descRejected: "تم رفض الطلب من قبل المسؤول مع ملاحظات الحل",
        description:
          "إدارة طلبات حقوق GDPR/CCPA — تصدير، حذف، تصحيح، وتقييد — مع تتبع دورة الحياة الكاملة.",
        descSubmit: "يطلب الموضوع التصدير أو الحذف أو التصحيح",
        endpointsIntro: "يكشف وحدة تحكم DSR عن 6 نقاط نهاية لدورة حياة DSR الكاملة:",
        endpointsTitle: "نقاط نهاية API",
        entitiesTitle: "الكيانات",
        entityDesc: "الوصف",
        entityDsrDesc: "يمثل طلب موضوع بيانات.",
        entityModuleDesc: "حالة تنفيذ الوحدة.",
        entityName: "اسم الكيان",
        entityStatusDesc: "سجل تغييرات الحالة.",
        ep: {
          assign: "تعيين DSR لمسؤول امتثال",
          create: "تقديم طلب DSR جديد",
          delete: "حذف ناعم لـ DSR",
          get: "الحصول على تفاصيل DSR حسب المعرف",
          list: "قائمة جميع طلبات DSR (مع ترقيم الصفحات، قابلة للتصفية حسب الحالة/النوع/اللائحة)",
          updateStatus: "تحديث حالة DSR (قيد التنفيذ، مكتمل، مرفوض)",
        },
        intro:
          "طلبات موضوع البيانات (DSR) هي طلبات رسمية من الأفراد لممارسة حقوقهم بموجب قوانين حماية البيانات. تقدم وحدة الامتثال سير عمل DSR كاملاً: التقديم والتعيين والمعالجة والإغلاق — مع مسار تدقيق كامل وتتبع معدل الاستجابة.",
        lifecycleFlowTitle: "مسار دورة حياة طلب موضوع البيانات",
        lifecycleIntro: "تمر طلبات DSR عبر مجموعة محددة من الحالات من التقديم حتى الإغلاق:",
        lifecycleTitle: "دورة حياة الطلب",
        nodeApproval: "في انتظار المسؤول",
        nodeCompleted: "الحالة: مكتمل",
        nodePending: "الحالة: معلق",
        nodeProcessing: "الحالة: قيد المعالجة",
        nodeRejected: "الحالة: مرفوض",
        nodeSubmit: "تقديم الطلب",
        slasIntro:
          "بموجب المادة 12 من GDPR، يجب على المتحكمين في البيانات الرد على طلبات DSR خلال 30 يوماً (قابل للتمديد إلى 3 أشهر للطلبات المعقدة). تتتبع SCRIPE تاريخ التقديم لكل DSR لمساعدتك على الالتزام بهذه المواعيد.",
        slasTitle: "متطلبات SLA لـ GDPR",
        status1: "معلق — الحالة الأولية عند استلام الطلب.",
        status2: "قيد التنفيذ — تم تعيين مسؤول امتثال ويعالج الطلب.",
        status3: "مكتمل — تم الوفاء بالطلب (البيانات مُصدَّرة أو محذوفة أو مُصحَّحة أو مُقيَّدة).",
        status4: "مرفوض — تم رفض الطلب (مثل عدم كفاية التحقق من الهوية).",
        title: "طلبات موضوع البيانات (DSR)",
        type1: "التصدير — طلب قابلية نقل البيانات. يريد الموضوع نسخة من بياناته الشخصية.",
        type2: "الحذف — الحق في النسيان. يجب حذف جميع البيانات الشخصية أو إخفاء هويتها.",
        type3: "التصحيح — طلب تصحيح. يجب تحديث البيانات الشخصية غير الدقيقة.",
        type4: "التقييد — تقييد المعالجة. يمكن الاحتفاظ بالبيانات ولكن لا تتم معالجتها بنشاط.",
        typesIntro: "يدعم النظام أربعة أنواع DSR كما هو محدد في المادة 17 من GDPR وCCPA:",
        typesTitle: "أنواع الطلبات",
      },
      inventory: {
        description:
          "سجل لجميع فئات البيانات الشخصية التي تعالجها المنصة — مطلوب لسجلات أنشطة المعالجة (RoPA) وفق المادة 30 من GDPR.",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          create: "إضافة فئة بيانات جديدة إلى الجرد",
          delete: "إزالة عنصر من الجرد",
          get: "الحصول على عنصر حسب المعرف",
          list: "قائمة جميع عناصر جرد البيانات (مع ترقيم الصفحات، قابل للبحث)",
          update: "تحديث عنصر جرد موجود",
        },
        field1:
          "DataCategory — الاسم المقروء لفئة البيانات (مثل 'عناوين البريد الإلكتروني'، 'معلومات الدفع').",
        field2:
          "LegalBasis — الأساس القانوني لـ GDPR للمعالجة (الموافقة، العقد، الالتزام القانوني، المصالح الحيوية، المهمة العامة، المصالح المشروعة).",
        field3:
          "DataSubjects — من تنتمي إليه البيانات (مثل 'المستخدمون النهائيون'، 'الموظفون'، 'العملاء').",
        field4:
          "ProcessingPurpose — لماذا تتم معالجة البيانات (مثل 'الوفاء بالطلبات'، 'التسويق'، 'الامتثال القانوني').",
        field5:
          "StorageLocation — أين تُخزَّن البيانات (البلد/المنطقة للامتثال لعمليات النقل عبر الحدود).",
        field6: "RetentionPeriod — المدة التي يتم فيها الاحتفاظ بالبيانات (مرتبط بسياسة الاحتفاظ).",
        field7: "ThirdPartySharing — ما إذا كانت البيانات تُشارَك مع أطراف ثالثة وأيها.",
        fieldsIntro: "كل عنصر جرد يوثق:",
        fieldsTitle: "حقول الجرد",
        intro:
          "جرد البيانات هو سجل منظم لجميع فئات البيانات الشخصية التي تعالجها المنصة. بموجب المادة 30 من GDPR، يجب على المتحكمين الاحتفاظ بسجلات أنشطة المعالجة (RoPA) — جرد البيانات هو تطبيق SCRIPE لهذا المتطلب.",
        ropaIntro:
          "يجب على المنظمات التي تضم 250+ موظفاً أو التي تعالج بيانات عالية الخطورة الاحتفاظ بـ RoPA بموجب المادة 30 من GDPR. يعمل جرد بيانات SCRIPE كـ RoPA حي وقابل للاستعلام يمكن تصديره للتفتيش التنظيمي.",
        ropaTitle: "الامتثال للمادة 30",
        title: "جرد البيانات",
      },
      overview: {
        backendIntro:
          "تتبع خلفية الامتثال تخطيط وحدة SCRIPE القياسي ذي 3 مشاريع (النطاق / التطبيق / البنية التحتية) مع ComplianceDbContext وComplianceController مخصصين.",
        backendTitle: "معمارية الخلفية",
        conn1: "يبدأ الطلبات",
        conn2: "يمنح/يلغي",
        conn3: "يتحكم في السياسات",
        conn4: "يوجه الحذف",
        conn5: "يستهدف البيانات",
        conn6: "مسارات التدقيق",
        conn7: "مسارات التدقيق",
        descConsent: "تتبع غير قابل للتغيير لحالات الموافقة واللقطات",
        descDsr: "يتعامل مع طلبات الموضوع (التصدير، الحذف، التصحيح)",
        descEnt: "وحدة الاستحقاقات",
        descEntDesc: "يتحكم في قدرات الامتثال عبر الميزات",
        descId: "وحدة الهوية",
        descIdDesc: "يوفر سياق المستخدم/المسؤول والمصادقة",
        descInv: "يعين مواقع معلومات تحديد الهوية الشخصية الحساسة عبر الوحدات",
        descRep: "يولد تقارير امتثال سجلات أنشطة المعالجة وتقييم تأثير حماية البيانات",
        descRet: "يفرض سياسات إتلاف البيانات بناءً على العمر",
        description:
          "أتمتة الامتثال لـ GDPR وCCPA وPDPA — بروفايلات اللوائح، إدارة طلبات الموضوعات، الموافقة، الاحتفاظ بالبيانات، الجرد، وإنشاء التقارير.",
        endpointsIntro:
          "جميع نقاط النهاية تحت /api/v1/compliances/ وتتطلب المصادقة بصلاحية compliance.view.",
        endpointsTitle: "نظرة عامة على نقاط نهاية API",
        frontendIntro:
          "تُنظَّم الواجهة الأمامية كستة وحدات فرعية مستقلة ضمن src/modules/compliance/، كل منها مع طبقاتها الخاصة للنطاق والبيانات والعرض.",
        frontendTitle: "معمارية الواجهة الأمامية",
        infoContent:
          "تعتبر وحدة الامتثال حاسمة للحفاظ على الالتزام التنظيمي وتجنب الغرامات. تأكد من ربط جميع الميزات بشكل صحيح بسياسات معالجة البيانات.",
        infoTitle: "ملاحظة الامتثال",
        intro:
          "وحدة الامتثال هي محرك الامتثال التنظيمي المدمج في SCRIPE. تساعد مشغلي المنصة ومستأجريهم على الالتزام بأبرز قوانين حماية البيانات (GDPR وCCPA وPDPA) من خلال أدوات مؤتمتة لإدارة طلبات الموضوعات وسجلات الموافقة وسياسات الاحتفاظ وإنشاء تقارير جاهزة للتدقيق.",
        sub1: "بروفايلات اللوائح — تخزن الأطر التنظيمية (GDPR وCCPA وPDPA) التي تعمل المنصة في إطارها.",
        sub2: "طلبات موضوع البيانات (DSR) — تدير طلبات الحقوق من أصحاب البيانات (تصدير، حذف، تصحيح، تقييد).",
        sub3: "إدارة الموافقة — تسجل وتتتبع وتدقق منح الموافقة وسحبها من المستخدمين.",
        sub4: "سياسات الاحتفاظ بالبيانات — تحدد المدة التي يتم فيها الاحتفاظ بالبيانات وما يحدث عند انتهائها (حذف أو إخفاء هوية).",
        sub5: "جرد البيانات — سجل لجميع فئات البيانات الشخصية التي تعالجها المنصة.",
        sub6: "تقارير الامتثال — تنشئ تقارير غير متزامنة جاهزة للتدقيق (نظرة عامة على GDPR، ملخص DSR، تدقيق الموافقة، إلخ).",
        subModulesIntro: "يتعامل كل نظام فرعي مع مجال امتثال محدد:",
        subModulesTitle: "ستة أنظمة فرعية",
        th1: "المكون",
        th2: "المسؤولية",
        title: "وحدة الامتثال",
        tr1_1: "نموذج عرض قائمة طلبات موضوع البيانات",
        tr1_2: "يتعامل مع ترقيم الصفحات، والتصفية، وتعيين طلبات موضوع البيانات الواردة.",
        tr2_1: "عرض سجل الموافقة",
        tr2_2:
          "يعرض لقطة الموافقة غير القابلة للتغيير إلى جانب وكيل المستخدم والبيانات الوصفية للطابع الزمني.",
        whatIsIntro:
          "توفر وحدة الامتثال ستة أنظمة فرعية مترابطة تغطي دورة حياة الامتثال الكاملة. بدلاً من بناء أدوات الامتثال من الصفر، يحصل مستأجرو SCRIPE على نظام جاهز للإنتاج يتتبع ويؤتمت ويُعلم عن التزاماتهم بحماية البيانات.",
        whatIsTitle: "ما هي وحدة الامتثال؟",
      },
      reports: {
        asyncIntro:
          "تُنشأ التقارير بشكل غير متزامن لتجنب حجب طلبات HTTP لمجموعات البيانات الكبيرة. عند طلب تقرير، ينشئ النظام فوراً سجل ComplianceReport بقيمة IsReady=false ويضع مهمة الإنشاء في قائمة الانتظار. تحقق من قائمة التقارير لمراقبة متى تصبح IsReady صحيحة.",
        asyncTip:
          "استخدم زر التحديث في واجهة التقارير لاستطلاع جاهزية التقرير. تكتمل التقارير عادةً خلال 30-60 ثانية لمجموعات البيانات حتى 10,000 سجل.",
        asyncTitle: "الإنشاء غير المتزامن",
        description:
          "إنشاء تقارير امتثال غير متزامنة جاهزة للتدقيق (نظرة عامة على GDPR، ملخص DSR، تدقيق الموافقة، تحليل الاحتفاظ، تصدير جرد البيانات).",
        downloadIntro:
          "بمجرد أن يصبح التقرير جاهزاً (IsReady=true)، يتوفر رابط DownloadUrl. تقدم نقطة نهاية التنزيل ملف التقرير بشكل آمن. تُحتفظ بملفات التقارير لمدة 90 يوماً قبل التنظيف التلقائي.",
        downloadTitle: "تنزيل التقارير",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          download: "تنزيل ملف التقرير المُنشأ",
          generate: "وضع مهمة إنشاء تقرير جديد في قائمة الانتظار",
          get: "الحصول على تفاصيل التقرير ورابط التنزيل حسب المعرف",
          list: "قائمة جميع تقارير الامتثال (مع ترقيم الصفحات، قابلة للتصفية حسب النوع/الحالة)",
        },
        intro:
          "تقارير الامتثال هي مستندات تُنشأ بشكل غير متزامن وتوفر ملخصات جاهزة للتدقيق لوضع الامتثال لديك. تُنشأ التقارير في الخلفية وتُخزَّن للتنزيل عند الجاهزية.",
        reportTypesIntro: "خمسة أنواع تقارير متاحة:",
        reportTypesTitle: "أنواع التقارير",
        title: "تقارير الامتثال",
        type1:
          "نظرة عامة على GDPR — ملخص رفيع المستوى لحالة الامتثال لـ GDPR عبر جميع الوحدات الفرعية.",
        type2:
          "ملخص نشاط DSR — إحصاءات حجم DSR والأنواع ومعدلات الاستكمال والالتزام بمعدل الاستجابة.",
        type3: "تدقيق الموافقة — سجل كامل لمنح الموافقة وسحبها حسب الغرض والفترة الزمنية.",
        type4: "تحليل الاحتفاظ — حالة التطبيق الحالية لجميع سياسات الاحتفاظ النشطة.",
        type5: "تصدير جرد البيانات — تصدير كامل لجرد البيانات (RoPA وفق المادة 30).",
      },
      retention: {
        action1: "الحذف — يزيل بشكل دائم جميع السجلات المطابقة لفئة البيانات.",
        action2:
          "إخفاء الهوية — يستبدل المعلومات الشخصية بعلامات مجهولة الهوية مع الحفاظ على بيانات التحليلات الإجمالية.",
        actionsIntro: "عند انتهاء فترة الاحتفاظ، تطبق SCRIPE أحد إجراءين:",
        actionsTitle: "إجراءات انتهاء الصلاحية",
        automationIntro:
          "تعمل RetentionEnforcementJob يومياً في 3:00 صباحاً UTC، تفحص جميع سياسات الاحتفاظ النشطة وتطبق إجراء انتهاء الصلاحية المكوَّن على السجلات المؤهلة. ينشئ كل تشغيل تطبيق سجل تدقيق RetentionExecution.",
        automationTitle: "التطبيق الآلي",
        conn1: "فُحصت بواسطة",
        conn2: "يثير",
        conn3: "سجلات",
        descAction: "حذف نهائي أو إخفاء الهوية عبر الوحدة القابلة للتعليق",
        descEnforcement: "مهمة أسبوعية لتقييم السياسات",
        descExecution: "مسار تدقيق لإجراء الإتلاف",
        descPolicy: "تحدد نوع الكيان، والحد العمري، واستراتيجية الإتلاف",
        description:
          "تحديد فترات الاحتفاظ بالبيانات وإجراءات انتهاء الصلاحية الآلية (حذف أو إخفاء هوية) للامتثال للمادة 5(1)(ه) من GDPR.",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          executions: "قائمة سجل عمليات التطبيق",
          list: "قائمة جميع سياسات الاحتفاظ",
          update: "تحديث سياسة احتفاظ (الأيام، الإجراء، حالة النشاط)",
        },
        field1:
          "DataCategory — نوع البيانات (مثل 'بروفايلات المستخدمين'، 'سجلات المعاملات'، 'سجلات الموافقة').",
        field2: "RetentionDays — عدد الأيام التي يجب الاحتفاظ فيها بالبيانات.",
        field3: "ExpiryAction — ما يحدث عند انتهاء الفترة: حذف أو إخفاء هوية.",
        field4: "RegulationCode — اللائحة التي تتطلب فترة الاحتفاظ هذه (GDPR، CCPA، إلخ).",
        intro:
          "تحدد سياسات الاحتفاظ بالبيانات المدة التي يجب فيها الاحتفاظ بفئات محددة من البيانات وما يحدث عند انتهاء فترة الاحتفاظ. تطبق SCRIPE هذه السياسات تلقائياً عبر مهام الخلفية.",
        nodeAction: "إتلاف البيانات",
        nodeEnforcement: "مهمة تنفيذ الاحتفاظ",
        nodeExecution: "تنفيذ الاحتفاظ",
        nodePolicy: "سياسة الاحتفاظ",
        policiesIntro: "كل سياسة احتفاظ تحدد:",
        policiesTitle: "تكوين السياسة",
        title: "سياسات الاحتفاظ بالبيانات",
      },
    },
    editions: {
      description: "خطط اشتراك مسماة مع حزم ميزات وسياسات تجاوز الحدود وإصدارات واستراتيجيات طرح.",
      drillDownIntro:
        "عندما يغوص مسؤول النظام في مستأجر، يتم تحديد نطاق قائمة الإصدارات تلقائياً لتظهر فقط الإصدارات المرئية لذلك المستأجر. يستخدم الخادم رأس X-Tenant-Context للتصفية: إصدارات النظام + إصدارات التجزئة المنشأة من قبل المستأجر المُغاص فيه. تخفي الواجهة الأمامية عمليات CRUD في وضع الغوص.",
      drillDownTitle: "سلوك الغوص في التفاصيل",
      endpointsCreate: "Create a new edition",
      endpointsCreateVersion: "Create a new draft version with feature snapshot",
      endpointsDelete: "Soft-delete an edition",
      endpointsDirectApply: "Apply feature changes immediately (no versioning)",
      endpointsGet: "Get edition details by ID",
      endpointsGetFeatures: "List features configured for this edition",
      endpointsGetVersions: "List all versions for this edition",
      endpointsIntro:
        "يكشف وحدة التحكم في الإصدارات عن 11 نقطة نهاية لإدارة الإصدارات وميزاتها ودورة حياة الإصدارات:",
      endpointsList: "List all editions (paginated, filterable)",
      endpointsPublishVersion: "Publish a draft version with chosen rollout strategy",
      endpointsSetFeatures: "Set/update features for this edition",
      endpointsTitle: "نقاط نهاية API",
      endpointsUpdate: "Update edition metadata",
      entityIntro:
        "الإصدار هو خطة مسماة تجمع قيم الميزات. إصدارات النظام تُنشأ من قبل مسؤولي المنصة؛ إصدارات التجزئة تُنشأ من قبل مستأجري التجزئة.",
      entityTitle: "كيان الإصدار",
      featuresIntro:
        "يحتوي كل إصدار على مجموعة من سجلات EditionFeature التي تربط الميزات بقيمها ضمن تلك الخطة.",
      featuresTip:
        "Features not explicitly set in an edition fall back to Feature.DefaultValue. You only need to configure features that differ from the global default.",
      featuresTitle: "ميزات الإصدار",
      intro:
        "الإصدارات هي خطط مسماة (مثل Basic، Pro، Enterprise) تجمع قيم الميزات معاً. يشترك كل مستأجر في إصدار يحدد أذونات وصوله للميزات. تدعم الإصدارات الإصدار المتدرج مع استراتيجيات طرح متحكم بها.",
      overflowIntro:
        "عندما يتم تخفيض مستأجر إلى إصدار بحدود أقل، قد تتجاوز موارده الحالية الحدود الجديدة. تحدد سياسة التجاوز ما يحدث:",
      overflowTitle: "سياسة تجاوز الحدود",
      rolloutIntro: "عند نشر إصدار، يختار المسؤولون كيفية نشر التغييرات للمستأجرين المشتركين:",
      rolloutTitle: "استراتيجيات الطرح",
      scopingIntro:
        "SCRIPE supports two types of editions: System editions created by platform admins visible to all tenants, and Retail editions created by reseller tenants for their child tenants only.",
      scopingNote:
        "Tenant administrators only see system editions plus their own retail editions. During drill-down, the system admin sees only the drilled-down tenant's visible editions (system + that tenant's retail). This ensures edition isolation between reseller tenants.",
      scopingTitle: "System vs Retail Editions",
      title: "الإصدارات",
      versionsIntro:
        "توفر إصدارات الإصدار نظام إصدار وطرح لتغييرات الميزات. بدلاً من تعديل الميزات مباشرة، يمكن للمسؤولين إنشاء إصدار جديد واختيار استراتيجية طرح ونشره.",
      versionsTitle: "إصدارات الإصدار",
      workflowIntro:
        "توفر SCRIPE طريقتين لتحديث ميزات الإصدار، كل منهما مناسبة لسيناريوهات مختلفة:",
      workflowTip:
        "استخدم 'التطبيق الفوري' للإصلاحات العاجلة والتغييرات الصغيرة. استخدم 'الحفظ كإصدار' لتحديثات الخطط الكبيرة.",
      workflowTitle: "التطبيق الفوري مقابل الحفظ كإصدار",
    },
    entitlementsOverview: {
      architectureIntro:
        "يتكون نظام الاستحقاقات من أربعة نطاقات مترابطة تعمل معاً لتقديم حل متكامل لبوابة الميزات.",
      architectureTitle: "البنية",
      backendIntro:
        "تتبع الواجهة الخلفية للاستحقاقات تخطيط وحدة البنية النظيفة القياسي في SCRIPE مع طبقات النطاق والتطبيق والبنية التحتية.",
      backendTitle: "هيكل الواجهة الخلفية",
      comparisonIntro:
        "The following table shows the difference in capabilities when the Entitlements module is enabled versus running without it:",
      comparisonTitle: "With vs Without Entitlements",
      contextAwareIntro:
        "جميع صفحات الاستحقاقات (الميزات، الإصدارات، الأذونات) واعية بالسياق. تكتشف الواجهة الأمامية ما إذا كان المستخدم مسؤول نظام (tenantId فارغ)، مسؤول مستأجر، أو في وضع الغوص، وتستدعي نقاط نهاية خلفية مختلفة وفقاً لذلك. يرى مسؤولو النظام الكتالوج الكامل مع عمليات CRUD؛ بينما يرى مسؤولو المستأجرين بياناتهم الفعلية فقط في وضع القراءة.",
      contextAwareTitle: "النطاق الواعي بالسياق",
      controllersIntro:
        "تكشف وحدة الاستحقاقات عن 31 نقطة نهاية API عبر 4 وحدات تحكم، جميعها مصادقة بـ JWT ومحمية بتفويض قائم على الأذونات.",
      controllersTitle: "وحدات تحكم API",
      cqrsMapIntro:
        "The Entitlements module registers 31 SCRIPE request handlers spanning the four domains. Each command has a corresponding FluentValidation validator for input validation.",
      cqrsMapTitle: "CQRS Command & Query Map",
      description:
        "بوابة الميزات المبنية على الإصدارات مع الميزات والإصدارات والاشتراكات والتجاوزات لكل مستأجر.",
      diIntro:
        "All Entitlements services are registered via the AddEntitlementsModule extension method in DependencyInjection.cs. The module follows SCRIPE's standard registration pattern.",
      diTitle: "Dependency Injection Registration",
      domainsIntro: "يتعامل كل نطاق مع جانب محدد من دورة حياة الاستحقاقات:",
      domainsTitle: "أربعة نطاقات",
      frontendIntro:
        "تعكس الواجهة الأمامية الواجهة الخلفية بأربع وحدات فرعية (الإصدارات، الميزات، الاشتراكات، التجاوزات).",
      frontendTitle: "هيكل الواجهة الأمامية",
      gettingStartedIntro:
        "Follow these 5 steps to set up the Entitlements system for your platform. Each step builds on the previous one:",
      gettingStartedTitle: "Getting Started",
      intro:
        "وحدة الاستحقاقات هي محرك إدارة الخطط والميزات في SCRIPE. تحدد ما هي القدرات التي يحصل عليها كل مستأجر، وكيف تجمع الخطط (الإصدارات) تلك القدرات، وكيف تربط الاشتراكات المستأجرين بالخطط.",
      noOpIntro:
        "عندما لا يتم تحميل وحدة الاستحقاقات، تسجل SCRIPE NoOpFeatureCache مما يسمح بمرور أوامر IRequireFeature دون أخطاء.",
      noOpNote:
        "يضمن البديل الاحتياطي NoOp أن الوحدات يمكنها استخدام IRequireFeature بدون اعتماد صارم على وحدة الاستحقاقات.",
      noOpTitle: "البديل الاحتياطي NoOp",
      pipelineIntro:
        "تدمج SCRIPE الاستحقاقات مباشرة في مسار AstraFlow mediator عبر FeatureCheckBehavior. الأوامر والاستعلامات التي تنفذ IRequireFeature يتم بوابتها تلقائياً.",
      pipelineTip:
        "لبوابة أمر خلف ميزة، قم ببساطة بتنفيذ IRequireFeature وعيّن RequiredFeatureName لمفتاح الميزة الثابت. لا حاجة لكود إضافي.",
      pipelineTitle: "التكامل مع المسار",
      resolutionIntro:
        "عندما يحتاج النظام لتحديد قيمة ميزة لمستأجر، يتبع سلسلة أولوية صارمة. المصدر الأعلى أولوية هو الذي يسود.",
      resolutionTip:
        "The resolution chain is evaluated lazily — values are cached after first resolution and invalidated when subscriptions, editions, or overrides change.",
      resolutionTitle: "سلسلة حل قيم الميزات",
      title: "نظرة عامة على الاستحقاقات",
      whatIsIntro:
        "الاستحقاقات هي الوحدة المسؤولة عن التحكم في الميزات التي يمكن لكل مستأجر الوصول إليها بناءً على الإصدار المشترك فيه. توفر سلسلة حل ثلاثية المستويات: القيم الافتراضية ← قيم الإصدار ← تجاوزات المستأجر.",
      whatIsTitle: "ما هي الاستحقاقات؟",
    },
    features: {
      cacheIntro:
        "تُخزن قيم الميزات المحلولة مؤقتاً في IFeatureCache لتجنب استعلامات قاعدة البيانات عند كل طلب.",
      cacheNote:
        "The cache is automatically invalidated when: (1) an edition's features are modified, (2) a subscription is assigned/changed, (3) an override is set/removed. No manual cache busting is needed.",
      cacheTitle: "ذاكرة التخزين المؤقت للميزات",
      contextAwareIntro:
        "صفحة قائمة الميزات واعية بالسياق. يرى مسؤولو النظام كتالوج الميزات الكامل مع عمليات CRUD. أما مسؤولو المستأجرين وجلسات الغوص فيرون فقط الميزات الفعلية للمستأجر (المحلولة من الإصدار + التجاوزات) في وضع القراءة فقط. يتم كل ذلك عبر الخادم عبر GET /features (الكتالوج) مقابل GET /features/effective (النطاق حسب المستأجر).",
      contextAwareTitle: "عرض الميزات الواعي بالسياق",
      description: "قدرات المنصة القابلة للتحكم بأنواع Boolean و Numeric و String.",
      endpointsIntro:
        "The Features controller exposes 5 CRUD endpoints. System features cannot be deleted:",
      endpointsTitle: "نقاط نهاية API",
      entityIntro:
        "تحدد الميزة قدرة منصة قابلة للتحكم. حقل Name هو مفتاح نظام ثابت يُستخدم في الكود.",
      entityTitle: "كيان الميزة",
      ep: {
        create: "Create a new custom feature",
        delete: "Soft-delete a custom feature (system features cannot be deleted)",
        get: "Get feature details by ID",
        list: "List all features (paginated, filterable by category/type)",
        update: "Update feature metadata (system features: DefaultValue/Description only)",
      },
      intro:
        "الميزات هي اللبنات الأساسية لنظام الاستحقاقات. تمثل كل ميزة قدرة قابلة للتحكم — مفتاح تشغيل/إيقاف، حصة رقمية، أو إعداد نصي. لكل ميزة مفتاح نظام ثابت (Name) لا يتغير أبداً.",
      patternIntro:
        "To gate any CQRS command behind a feature check, simply implement the IRequireFeature marker interface. The FeatureCheckBehavior automatically intercepts the request, resolves the tenant's feature value, and rejects if disabled or over quota.",
      patternTitle: "IRequireFeature Pattern",
      quotaIntro:
        "Numeric features support automatic quota enforcement via the QuotaCounter entity. The FeatureCheckBehavior checks the current usage against the resolved limit for every IRequireFeature command targeting a numeric feature.",
      quotaTitle: "Quota Tracking (QuotaCounter)",
      requireFeatureIntro:
        "لبوابة أمر أو استعلام CQRS خلف ميزة، نفذ واجهة IRequireFeature. يقوم سلوك FeatureCheckBehavior تلقائياً بحل القيمة الحالية للمستأجر.",
      requireFeatureNote:
        "يعمل IRequireFeature مع كل من ميزات Boolean (التحقق من التمكين/التعطيل) والميزات الرقمية (التحقق من الحصة المتبقية).",
      requireFeatureTitle: "واجهة IRequireFeature",
      seedingIntro:
        "System features are automatically seeded at application startup by EntitlementsStartupSeeder. The seeder checks if each system feature already exists (by Name) and only creates missing ones — existing features are never overwritten.",
      seedingTitle: "Feature Seeding",
      systemVsCustomIntro:
        "تميز SCRIPE بين ميزات النظام (المزروعة عند بدء التشغيل، للقراءة فقط) والميزات المخصصة (المنشأة من قبل المسؤولين):",
      systemVsCustomTitle: "ميزات النظام مقابل المخصصة",
      title: "الميزات",
      valueTypesIntro: "تُخزن قيم الميزات كنصوص لكن تُفسر حسب ValueType الخاص بها.",
      valueTypesTip:
        "للميزات الرقمية، استخدم -1 لتمثيل 'غير محدود'. يتعرف FeatureCheckBehavior على -1 كقيمة خاصة ولا يحجب الطلبات أبداً.",
      valueTypesTitle: "أنواع القيم",
    },
    overrides: {
      auditIntro:
        "Every override operation is tracked with full audit information. The Reason field on each override provides context for why the custom value was applied.",
      auditTitle: "Audit Trail",
      bestPracticesIntro:
        "Follow these guidelines to keep your override system maintainable and auditable.",
      bestPracticesTitle: "Best Practices",
      bestPracticesWarning:
        "Overrides should be used sparingly. If many tenants need the same override, consider creating a new edition instead. Excessive overrides make the system harder to manage and create maintenance debt.",
      description: "تخصيص قيم الميزات لكل مستأجر يتجاوز إعدادات الإصدار الافتراضية.",
      endpointsIntro:
        "The TenantFeatures controller exposes 4 endpoints for managing per-tenant overrides and resolved values:",
      endpointsTitle: "نقاط نهاية API",
      entityIntro:
        "يعيّن TenantFeatureOverride قيمة مخصصة لميزة محددة على مستأجر محدد مع حقل سبب اختياري للتدقيق.",
      entityTitle: "كيان التجاوز",
      ep: {
        list: "List all overrides for a specific tenant",
        remove: "Remove (deactivate) a feature override",
        resolved:
          "Get all resolved feature values for a tenant (shows source: Override/Edition/Default)",
        set: "Set or update a feature override for a tenant",
      },
      expiryIntro:
        "Overrides can have an optional ExpiresAt date. When the expiration date passes, the override is automatically deactivated and the feature falls back to the edition value (or global default).",
      expiryNote:
        "Expired overrides are soft-deactivated (IsActive = false), not deleted. This preserves the audit trail and allows re-activation if needed.",
      expiryTitle: "Expiring Overrides",
      intro:
        "تتيح تجاوزات الميزات لمسؤولي المنصة تخصيص قيم الميزات للمستأجرين الأفراد بغض النظر عن الإصدار المشترك فيه.",
      overuseWarning:
        "يجب استخدام التجاوزات بحذر. إذا احتاج العديد من المستأجرين لنفس التجاوز، فكر في إنشاء إصدار جديد بدلاً من ذلك.",
      priorityIntro:
        "تقع التجاوزات في أعلى سلسلة الحل. عندما يحل النظام قيمة ميزة لمستأجر، يتحقق من التجاوز أولاً:",
      priorityTitle: "أولوية الحل",
      resolvedIntro:
        "تُرجع نقطة نهاية الميزات المحلولة القيمة الفعلية النهائية لكل ميزة لمستأجر معين مع مصدر الحل.",
      resolvedTitle: "نقطة نهاية الميزات المحلولة",
      scenariosIntro:
        "The following real-world scenarios demonstrate when overrides provide the most value:",
      scenariosTitle: "Use Case Scenarios",
      settingIntro:
        "To set an override, POST to the tenant features endpoint with the feature ID, custom value, and an optional reason for audit purposes.",
      settingTip:
        "Always include a reason when setting overrides — it makes audit trails meaningful and helps future admins understand why the override was applied.",
      settingTitle: "Setting an Override",
      title: "تجاوزات الميزات",
      useCase1: "صفقات المؤسسات المخصصة — 'أعطِ شركة Acme 500 مشرف بدلاً من الـ 50 القياسية'",
      useCase2: "العروض الترويجية — 'فعّل الدردشة المتقدمة لهذا المستأجر لمدة 30 يوماً'",
      useCase3: "الاختبار التجريبي — 'فعّل وحدة الفوترة الجديدة للمتبنين المبكرين'",
      useCase4: "التصعيد المؤقت — 'ارفع حد رفع الملفات خلال عملية الترحيل'",
      whenIntro:
        "صُممت التجاوزات للحالات الاستثنائية حيث يحتاج المستأجر لقيمة مختلفة عما يوفره إصداره:",
      whenTitle: "متى تستخدم التجاوزات",
    },
    subscriptions: {
      assignIntro:
        "Create a new subscription linking a tenant to an edition. If the tenant already has an active subscription, the previous one is automatically cancelled. Supports optional currency, promo code, and expiry behavior parameters.",
      assignTitle: "Assign Subscription",
      concurrencyIntro:
        "يحتوي كل TenantSubscription على ConcurrencyStamp (Guid) مع [ConcurrencyCheck]. يُحدَّث الطابع عند كل عملية كتابة. يمنع ذلك حالات التسابق — مثل إلغاء متزامن + مهمة تسوية — عبر طرح DbUpdateConcurrencyException عند حدوث تصادم.",
      concurrencyTitle: "التزامن التفاؤلي (E1)",
      crossModuleIntro:
        "تنشر أحداث دورة حياة الاشتراك أحداث نطاق تستهلكها وحدة الهوية. عند تعليق اشتراك، يتم تعطيل جميع مسؤولي المستأجر مع DeactivationReason='SubscriptionSuspended'. عند الاستئناف، يُعاد تفعيل المسؤولين المعطلين بسبب التعليق فقط.",
      crossModuleReasons:
        "ثلاثة أسباب للتعطيل: 'يدوي' (لا يُعاد تفعيله تلقائياً)، 'SubscriptionSuspended' (يُعاد تفعيله عند الاستئناف)، 'SubscriptionExpired' (يُعطَّل عند انتهاء الصلاحية).",
      crossModuleTitle: "التكامل عبر الوحدات (H1)",
      description:
        "ربط المستأجر بالإصدار مع إدارة دورة حياة كاملة، تسعير متعدد العملات، عروض ترويجية، تجارب، تخفيضات، سلوك انتهاء الصلاحية، وتصدير تحليلات متقدم.",
      downgradeIntro:
        "عندما يتم تخفيض مستأجر، يتتبع النظام تفاصيل الاشتراك الأصلي للتدقيق والاستعادة المحتملة.",
      downgradeTitle: "تتبع التخفيض",
      downgradeWarning:
        "عند التخفيض، تحدد سياسة تجاوز الحدود للإصدار المستهدف ما يحدث للموارد التي تتجاوز الحدود الجديدة.",
      endpointsIntro: "يقدم وحدة تحكم الاشتراكات 13 نقطة نهاية تغطي دورة حياة الاشتراك الكاملة:",
      endpointsTitle: "نقاط نهاية API",
      entityIntro:
        "يربط TenantSubscription المستأجر بإصدار مع تتبع دورة الحياة. يدعم أنواع وحالات اشتراك متعددة.",
      entityTitle: "كيان الاشتراك",
      ep: {
        assign: "Create a new subscription (assign tenant to edition with currency/promo)",
        cancel: "Cancel subscription permanently",
        downgrade: "Downgrade to a lower edition (checks OverflowPolicy)",
        export: "Export subscriptions as CSV, Excel, or PDF with advanced filters",
        get: "Get subscription details by ID",
        impact: "Preview downgrade impact before executing",
        list: "List all subscriptions (paginated, filterable by status/type/tenant)",
        renew: "Renew an expiring subscription",
        resume: "Resume a suspended subscription",
        suspend: "Suspend subscription (block tenant access)",
        tenantActive: "Get the active subscription for a specific tenant",
        upgrade: "Upgrade to a higher edition",
      },
      exchangeRateIntro:
        "يتم توحيد جميع المبالغ بالدولار عبر ExchangeRateToUsd لتقارير MRR/ARR متسقة. يُحسب حقل TotalAmountUsd عند إنشاء الاشتراك ويُخزن للدقة التاريخية.",
      exchangeRateTitle: "التوحيد بالدولار الأمريكي",
      expiryIntro: "عندما ينتهي اشتراك، يحدد إعداد ExpiryBehavior ما يحدث بعد ذلك:",
      expiryTitle: "سلوك انتهاء الصلاحية",
      exportDaysLeftIntro:
        "تتضمن التقارير عمود 'الأيام المتبقية' المحسوب مع تلوين شرطي: أحمر (≤7 أيام)، أصفر (≤30 يوماً)، أخضر (>30 يوماً). يتيح هذا التعرف الفوري على الاشتراكات التي تحتاج تجديد.",
      exportDaysLeftTitle: "الأيام المتبقية للانتهاء",
      exportFilterCurrency: "العملة — عرض المبالغ بالعملة المحددة",
      exportFilterDate:
        "النطاق الزمني — تصفية حسب تاريخ إنشاء الاشتراك (آخر 7/30/90 يوماً، السنة الأخيرة، أو نطاق مخصص)",
      exportFilterEdition: "الإصدار — تصفية حسب خطة/إصدار محدد",
      exportFilterExpiring: "تنتهي قريباً — البحث عن اشتراكات تنتهي خلال 5/7/14/30/60/90 يوماً",
      exportFiltersIntro: "تدعم التقارير فلاتر متقدمة للتحليلات المستهدفة:",
      exportFilterStatus: "الحالة — نشط، معلق، ملغي، منتهي",
      exportFiltersTitle: "فلاتر التصدير",
      exportFormatCsv: "CSV — خفيف الوزن، قابل للاستيراد في أي جدول بيانات أو أداة BI",
      exportFormatExcel:
        "XLSX — مصنف Excel احترافي مع رؤوس منسقة، ورقة بيانات الفلاتر، تنسيقات شرطية، وأعمدة بحجم تلقائي (ClosedXML)",
      exportFormatPdf:
        "PDF — مستند جاهز للطباعة مع صفحة غلاف ذات علامة تجارية وملخص إحصائي وجداول بيانات مرقمة (QuestPDF)",
      exportFormatsTitle: "تفاصيل تنسيقات التصدير",
      exportIntro:
        "يولد نظام تصدير الاشتراكات تقارير شاملة بتنسيقات CSV وExcel (XLSX) وPDF. يتضمن كل تقرير صفحة غلاف مع بيانات الفلاتر وجداول ملونة وملخصات إحصائية.",
      exportTitle: "التصدير والتقارير المتقدمة",
      impactIntro:
        "قبل تغيير إصدار المستأجر، استخدم نقطة نهاية تأثير التخفيض لمعاينة الموارد التي ستتجاوز الحدود.",
      impactTitle: "تحليل تأثير التخفيض",
      intro:
        "تربط الاشتراكات المستأجرين بالإصدارات (الخطط). لكل مستأجر اشتراك أساسي يحدد إصداره، واختيارياً اشتراكات إضافية للقدرات الإضافية. يتعامل نظام الاشتراكات مع دورة الحياة الكاملة — مع دعم مدمج للتسعير متعدد العملات وتتبع الخصومات الترويجية.",
      lifecycleIntro: "تنتقل الاشتراكات عبر سلسلة من الحالات خلال دورة حياتها:",
      lifecycleTitle: "دورة حياة الحالة",
      operationsIntro:
        "The subscription module supports a comprehensive set of lifecycle operations. Each operation transitions the subscription to a new state with full audit tracking.",
      operationsTitle: "Subscription Operations",
      pricingIntro:
        "يحمل كل اشتراك بيانات تسعير كاملة: العملة (رمز ISO)، المبلغ الأساسي، مبلغ التعديل، المبلغ الإجمالي، سعر الصرف مقابل الدولار، والمبلغ الإجمالي بالدولار. يتيح هذا تتبع الإيرادات بدقة عبر 9+ عملات مدعومة.",
      pricingTitle: "التسعير متعدد العملات",
      promoExpiryIntro:
        "عند تطبيق عرض ترويجي بمدة DurationDays > 0، يحسب النظام طابعاً زمنياً لـ PromotionExpiresAt. عند كل تجديد، يتحقق المعالج مما إذا كان UtcNow > PromotionExpiresAt — إذا انتهى العرض، يُزال الخصم ولا يُنقل إلى صف الاشتراك الجديد.",
      promoExpiryTitle: "تتبع انتهاء العرض الترويجي (A1)",
      promotionsIntro:
        "تدعم الاشتراكات أكواد العروض عبر حقل AppliedPromoCode. عند تطبيق عرض صالح، يُسجل PromotionDiscount كنسبة مئوية ويعكس AdjustmentAmount الخصم المطبق على المبلغ الأساسي.",
      promotionsTitle: "الخصومات الترويجية",
      renewalAuditIntro:
        "تُنتج كل دورة فوترة صفاً غير قابل للتغيير في قاعدة البيانات مع تسعير ثابت وقت التجديد. يتيح ذلك تقارير مالية دقيقة: اتجاهات MRR، تحليل الاشتراكات الملغاة حسب الفترة، وتتبع الاستردادات لكل دورة.",
      renewalAuditTitle: "مسار تدقيق الإيرادات",
      renewalIntro:
        "تُنشئ التجديدات صفاً جديداً في TenantSubscription بدلاً من الكتابة فوق السجل القائم (نمط Stripe). يتم تعليم الاشتراك القديم بحالة منتهي الصلاحية (IsActive=false)، بينما يُنشأ صف جديد بمعرّف جديد وتاريخ بدء جديد وتسعير مُعاد حسابه وتفاصيل العروض المنقولة. هذا يحفظ مسار تدقيق إيرادات كامل لكل دورة فوترة.",
      renewalTitle: "التجديد — نمط الصف الجديد (B2)",
      title: "الاشتراكات",
      trialIntro:
        "Trial subscriptions have a TrialEndDate. When a trial is upgraded to a paid plan, IsTrialConverted is set to true and the subscription transitions to the new type. If the trial expires without conversion, ExpiryBehavior determines what happens next.",
      trialTitle: "Trial Conversion",
      typesIntro: "لكل اشتراك نوع يحدد دورة الفوترة وسلوكه:",
      typesTitle: "أنواع الاشتراكات",
      upgradeIntro:
        "Tenants can move between editions. Upgrades apply immediately with the new edition's features taking effect right away. Downgrades check the OverflowPolicy first to handle resources that exceed new limits.",
      upgradeTitle: "Upgrade & Downgrade",
      validationIntro:
        "تمتلك جميع أوامر الاشتراك الثمانية مدققات FluentValidation مخصصة. تستخدم المدققات ILocalizer لرسائل خطأ مترجمة (EN + AR). تشمل القواعد: لا يمكن التجديد كتجريبي، مبالغ استرداد موجبة، حدود طول النصوص.",
      validationTitle: "التحقق من المدخلات (G1)",
    },
  },
};
