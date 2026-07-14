// FILE-EXCEPTION: file length
/**
 * Docs modules — AR
 * Auto-filled 75 keys from EN.
 */
export const ar = {
  modules: {
    analytics: {
      overview: {
        title: "أساس أحداث التحليلات",
        description:
          "مخزن أحداث قياس داخلي، محصور بالمستأجر، للإلحاق فقط، مع إسقاط تشغيلي يومي أولي. تسجّل الوحدات الأخرى الأحداث داخل العملية، ويقرأ المشغّلون التدفق وتجميعه.",
        intro:
          "أساس أحداث التحليلات هو النواة المشتركة التي تسجّل فيها كل وحدة منتج أحداث القياس التشغيلية. إنه بنية تحتية داخلية: تستدعي الوحدات واجهة IAnalyticsRecorder داخل العملية لإلحاق حدث قياس (مثل إنشاء حجز، أو تأكيد تسجيل، أو اكتمال جلسة)، فيحفظه الأساس في تدفق أحداث محصور بالمستأجر للإلحاق فقط ويطويه في إسقاط تشغيلي يومي. وهو عمداً ليس وحدة CRUD موجهة للمستخدم — لا تُعدَّل الأحداث أو تُحذف عبر الواجهة.",
        infoTitle: "مبدأ التصميم",
        infoContent:
          "أحداث التحليلات حقائق للإلحاق فقط. تُكتب مرة واحدة من الوحدة المالكة للإجراء، وتُشار إلى الكيان تعدّدياً عبر مفتاح نوع كيان مُسجّل بدلاً من مفتاح خارجي، ولا تُعدَّل بعد ذلك أبداً. التحليلات اللاحقة (تقارير المرافق والأكاديمية وكرة القدم) تُبنى على تدفق الأحداث نفسه.",
        whatIsTitle: "ما هو أساس الأحداث؟",
        whatIsIntro:
          "حدث القياس حقيقة مسجّلة واحدة تحمل اسم حدث، والوحدة المصدر، وكياناً موضوعاً اختيارياً (عبر مفتاح نوع كيان مُسجّل ومعرّف)، وطابعاً زمنياً للحدوث (UTC)، وقيمة رقمية اختيارية، ومفتاح تكرار اختياري. تُخزَّن الأحداث حرفياً؛ ويجمّع الإسقاط اليومي العدد والقيمة المجمّعة لكل مستأجر واسم حدث ويوم تقويمي لقراءات تشغيلية سريعة.",
        featureAppendOnly: "للإلحاق فقط",
        featureAppendOnlyDesc:
          "الأحداث حقائق غير قابلة للتغيير تُكتب مرة واحدة من الوحدة المالكة ولا تُعدَّل أو تُحذف عبر الواجهة، فيكون التدفق سجلاً موثوقاً لما حدث.",
        featureTenant: "محصور بالمستأجر",
        featureTenantDesc:
          "كل حدث وصف إسقاط مملوك لمستأجر ومعزول عبر مرشّح الاستعلام العام للمستأجر؛ ولا تحدث قراءات عبر المستأجرين ضمنياً.",
        featureProjection: "إسقاط تشغيلي",
        featureProjectionDesc:
          "يُطوى كل حدث مسجّل في تجميع يومي (العدد والقيمة المجمّعة لكل مستأجر واسم حدث ويوم) لتقرأ لوحات المعلومات التجميعات دون مسح التدفق الخام.",
        featureIdempotent: "تسجيل غير مكرَّر",
        featureIdempotentDesc:
          "مفتاح تكرار اختياري (فريد لكل مستأجر) يجعل الأحداث المُعاد تسليمها آمنة: التسجيل المكرَّر يعيد الحدث القائم بدلاً من العدّ المزدوج.",
        modelTitle: "نموذج البيانات",
        modelIntro:
          "يحمل AnalyticsEvent: معرّف المستأجر، واسم الحدث، والوحدة المصدر، ومفتاح نوع الكيان الموضوع الاختياري (مُسجّل) ومعرّف الموضوع، وطابع الحدوث الزمني (UTC)، وقيمة رقمية اختيارية، ومفتاح تكرار اختياري. ويحمل AnalyticsDailyMetric: معرّف المستأجر، واسم الحدث، وتاريخ الدلو (يوم UTC)، وعدد الحدوث، والقيمة المجمّعة. الإسقاط فريد لكل (مستأجر، اسم حدث، تاريخ دلو).",
        recorderTitle: "تسجيل الأحداث",
        recorderIntro:
          "تعتمد الوحدات على IAnalyticsRecorder وتستدعيه داخل العملية ضمن حدود معاملتها. يتحقق المسجّل من مفتاح نوع الكيان الموضوع الاختياري مقابل سجل أنواع الكيانات المشترك، ويختم المستأجر الحالي، ويلحق الحدث، ويطوي الإسقاط اليومي في وحدة عمل واحدة.",
        isolationTitle: "عزل المستأجر",
        isolationIntro:
          "كل من تدفق الأحداث والإسقاط اليومي محصور بالمستأجر ومُرشَّح عبر مرشّح الاستعلام العام للمستأجر. فرادة التكرار ومفاتيح تجميع الإسقاط جميعها محصورة بمعرّف المستأجر، فلا يمكن لأي مستأجر قراءة أو التأثير في قياسات مستأجر آخر.",
        permsTitle: "الصلاحيات",
        permsIntro:
          "لأن الأحداث تُسجَّل داخل العملية لا من قبل المستخدمين، تملك الوحدة صلاحية عرض واحدة فقط — analytics-events.view — للسطح القرائي الموجّه للمشغّل (تدفق الأحداث وإسقاطه اليومي). وهي عمداً لا تعرض مجموعة صلاحيات الإنشاء/التحديث/الحذف القياسية.",
      },
    },
    customFields: {
      overview: {
        title: "وحدة الحقول المخصصة",
        description:
          "تعريفات حقول مخصصة قابلة للتهيئة لكل مستأجر، تُربط بأي نوع كيان مُسجّل عبر مفتاح ثابت — دون تغيير المخطط ودون اقتران بين الوحدات.",
        intro:
          "تتيح وحدة الحقول المخصصة لكل مستأجر توسيع سجلات المنصة بحقوله المخصصة المُعرّفة نوعياً — مثل «مقاس القميص» على شخص أو «القدم المفضّلة» على لاعب — دون أي ترحيل لقاعدة البيانات أو تغيير في الشيفرة. تعريفات الحقول محصورة بالمستأجر وتُربط بالكيان المضيف عبر سجل أنواع الكيانات المشترك بين الوحدات بدلاً من مفتاح خارجي، فلا تقترن الوحدة بمخطط وحدة أخرى.",
        infoTitle: "مبدأ التصميم",
        infoContent:
          "تُربط الحقول المخصصة عبر مفتاح نوع الكيان الثابت (مثل \"party.person\")، ويُتحقق منه مقابل سجل أنواع الكيانات، وليس عبر مفتاح خارجي في قاعدة البيانات. هذا يبقي الوحدة منفصلة تماماً وآمنة للتطوير المستقل.",
        whatIsTitle: "ما هي الحقول المخصصة؟",
        whatIsIntro:
          "الحقل المخصص هو امتداد يُعرّفه المستأجر لكيان قائم. يحمل كل تعريف مفتاحاً آلياً (فريداً لكل مستأجر ونوع كيان)، وتسميات ثنائية اللغة، ونوع قيمة، وعلامة إلزامية اختيارية، وقائمة خيارات مسموحة اختيارية لحقول الاختيار، وترتيب فرز. تُخزَّن القيم نوعياً بدلاً من كتلة JSON غير مُنمّطة.",
        featureTenant: "محصور بالمستأجر",
        featureTenantDesc:
          "كل تعريف مملوك لمستأجر ومعزول عبر مرشّح الاستعلام العام للمستأجر. التعريفات على مستوى النظام (المشتركة) مدعومة لمشغّلي المنصة.",
        featureRegistry: "ربط مُتحقَّق عبر السجل",
        featureRegistryDesc:
          "تُربط الحقول بالكيان المضيف عبر مفتاح نوع الكيان القانوني الخاص به، ويُتحقق منه مقابل سجل أنواع الكيانات المشترك — وليس عبر مفتاح خارجي.",
        featureTyped: "قيم مُنمّطة",
        featureTypedDesc:
          "يعلن كل حقل عن نوع قيمته (نص، رقم، منطقي، تاريخ، أو اختيار)، متجنباً كتلة بيانات وصفية غير مُنمّطة وممكّناً التحقق السليم.",
        featureIsolation: "مفاتيح غير قابلة للتغيير",
        featureIsolationDesc:
          "مفتاح نوع الكيان والمفتاح الآلي غير قابلين للتغيير بعد الإنشاء لتبقى القيم المخزّنة قابلة للعنونة؛ ولا يمكن تعديل سوى بيانات العرض والسلوك.",
        valueTypesTitle: "أنواع القيم",
        valueTypesIntro:
          "أنواع القيم المدعومة هي نص ورقم ومنطقي وتاريخ واختيار. تحمل حقول الاختيار قائمة خيارات مسموحة مفصولة بأسطر؛ وعلى الحقول غير الاختيارية ألا تحمل خيارات. تفرض واجهة البرمجة ذلك عند الإنشاء والتحديث.",
        modelTitle: "نموذج البيانات",
        modelIntro:
          "يحمل الحقل المخصص: مفتاح نوع الكيان (مُسجّل)، والمفتاح (مفتاح آلي فريد لكل مستأجر ونوع كيان)، والتسمية الإنجليزية/العربية، ونوع القيمة، والإلزامية، والخيارات (للاختيار فقط)، وترتيب الفرز، والحالة النشطة. تُفرض الفرادة لكل (المستأجر، مفتاح نوع الكيان، المفتاح).",
        isolationTitle: "عزل المستأجر",
        isolationIntro:
          "تُجرى القراءات تحت مرشّح المستأجر العام للوحدة، فلا يرى المستأجر سوى تعريفاته وتلك المشتركة على مستوى النظام. يختم الإنشاء المستأجر الحالي تلقائياً. يفرض التحديث والحذف حارس ملكية يمنع مدير المستأجر من تعديل أو إزالة تعريف مشترك أو تعريف مستأجر آخر.",
        isolationWarnTitle: "الحقول على مستوى النظام",
        isolationWarnContent:
          "تُعامل التعريفات بلا مستأجر على أنها مشتركة/عامة وتظهر لكل مستأجر. لا يجوز سوى لأصحاب صلاحية النظام (بلا سياق مستأجر) تعديلها أو حذفها؛ ويُمنع مديرو المستأجرين عبر حارس الملكية.",
        permsTitle: "الصلاحيات",
        permsIntro:
          "تملك الوحدة المورد custom-fields مع إجراءات CRUD القياسية: custom-fields.view وcustom-fields.create وcustom-fields.update وcustom-fields.delete.",
      },
    },
    workManagement: {
      overview: {
        title: "وحدة إدارة العمل",
        description:
          "عناصر عمل (مهام) محصورة بالمستأجر يمكن لأي وحدة ربطها بأحد كياناتها عبر مفتاح نوع كيان ثابت — تعدد الأشكال، دون اقتران عبر مفتاح خارجي.",
        intro:
          "توفّر وحدة إدارة العمل وحدة عمل عامة محصورة بالمستأجر — مهمة — يمكن لأي وحدة أخرى ربطها بأحد سجلاتها. يشير عنصر العمل إلى مالكه متعدد الأشكال عبر سجل أنواع الكيانات المشترك (مفتاح ثابت مثل \"party.person\" أو \"hrms.staff-member\") مع معرّف المالك، وليس عبر مفتاح خارجي في قاعدة البيانات، فتبقى إدارة العمل منفصلة تماماً عن مخطط كل وحدة أخرى.",
        infoTitle: "مبدأ التصميم",
        infoContent:
          "يشير عنصر العمل إلى كيانه المالك عبر مفتاح نوع الكيان الثابت مع المعرّف، ويُتحقق منه مقابل سجل أنواع الكيانات — وليس عبر مفتاح خارجي. المُكلَّف هو معرّف فاعل من الهوية، وليس مفتاحاً خارجياً أيضاً. هذا يبقي الوحدة مستقلة وآمنة للتطوير.",
        whatIsTitle: "ما هو عنصر العمل؟",
        whatIsIntro:
          "عنصر العمل هو مهمة تحمل عنواناً ووصفاً اختيارياً وحالة دورة حياة (قيد الانتظار، قيد التنفيذ، محجوب، منجز، ملغى) وأولوية (منخفضة، عادية، عالية، حرجة) وتاريخ استحقاق اختياري ومالكاً اختيارياً متعدد الأشكال (مفتاح نوع الكيان + المعرّف) ومعرّف فاعل مُكلَّف اختياري وطابع زمني للإنجاز يُختم عند بلوغ حالة نهائية. كل عنصر عمل مملوك لمستأجر ومعزول عبر مرشّح الاستعلام العام للمستأجر.",
        featurePolymorphic: "ملكية متعددة الأشكال",
        featurePolymorphicDesc:
          "تُربط المهمة بأي كيان مضيف مُسجّل عبر مفتاح نوع الكيان القانوني ومعرّفه — يُتحقق منه مقابل سجل أنواع الكيانات، وليس عبر مفتاح خارجي بين الوحدات.",
        featureTenant: "محصور بالمستأجر",
        featureTenantDesc:
          "كل عنصر عمل مملوك لمستأجر ومعزول عبر مرشّح المستأجر العام للوحدة؛ ويختم الإنشاء المستأجر الحالي تلقائياً.",
        featureStatus: "حالة دورة الحياة",
        featureStatusDesc:
          "تنتقل عناصر العمل عبر قيد الانتظار ← قيد التنفيذ ← محجوب وتبلغ حالة نهائية منجز أو ملغى، فيُختم الطابع الزمني للإنجاز.",
        featureAssignee: "تكليف الفاعل",
        featureAssigneeDesc:
          "يمكن تكليف المهمة لفاعل من الهوية عبر معرّف مرجعي (وليس مفتاحاً خارجياً)، أو تركها دون تكليف.",
        modelTitle: "نموذج البيانات",
        modelIntro:
          "يحمل عنصر العمل: العنوان، والوصف، والحالة، والأولوية، وتاريخ الاستحقاق (بالتوقيت العالمي)، ومفتاح نوع الكيان المالك (مُسجّل) مع معرّف الكيان المالك للربط متعدد الأشكال، ومعرّف المُكلَّف (معرّف فاعل)، وطابع الإنجاز، والحالة النشطة، والطوابع الزمنية القياسية للتدقيق. لا توجد مفاتيح خارجية بين الوحدات.",
        isolationTitle: "عزل المستأجر",
        isolationIntro:
          "تُجرى القراءات تحت مرشّح المستأجر العام للوحدة، فلا يرى المستأجر سوى عناصر عمله. يختم الإنشاء المستأجر الحالي تلقائياً، وتُحصر التعديلات بمستأجر المُنادي، فلا يمكن لمستأجر قراءة أو تعديل مهام مستأجر آخر.",
        permsTitle: "الصلاحيات",
        permsIntro:
          "تملك الوحدة المورد work-items مع إجراءات CRUD القياسية: work-items.view وwork-items.create وwork-items.update وwork-items.delete.",
      },
    },
    entitlementsOverview: {
      title: "نظرة عامة على الاستحقاقات",
      description:
        "بوابة الميزات المبنية على الإصدارات مع الميزات والإصدارات والاشتراكات والتجاوزات لكل وحدة.",
      intro:
        "وحدة الاستحقاقات هي محرك إدارة الخطط والميزات في SCRIPE. تحدد ما هي القدرات التي يحصل عليها كل وحدة، وكيف تجمع الخطط (الإصدارات) تلك القدرات، وكيف تربط الاشتراكات الوحدات بالخطط.",
      whatIsTitle: "ما هي الاستحقاقات؟",
      whatIsIntro:
        "الاستحقاقات هي الوحدة المسؤولة عن التحكم في الميزات التي يمكن لكل وحدة الوصول إليها بناءً على الإصدار المشترك فيه. توفر سلسلة حل ثلاثية المستويات: القيم الافتراضية ← قيم الإصدار ← تجاوزات الوحدة.",
      architectureTitle: "البنية",
      architectureIntro:
        "يتكون نظام الاستحقاقات من أربعة نطاقات مترابطة تعمل معاً لتقديم حل متكامل لبوابة الميزات.",
      domainsTitle: "أربعة نطاقات",
      domainsIntro: "يتعامل كل نطاق مع جانب محدد من دورة حياة الاستحقاقات:",
      resolutionTitle: "سلسلة حل قيم الميزات",
      resolutionIntro:
        "عندما يحتاج النظام لتحديد قيمة ميزة لوحدة، يتبع سلسلة أولوية صارمة. المصدر الأعلى أولوية هو الذي يسود.",
      pipelineTitle: "التكامل مع المسار",
      pipelineIntro:
        "تدمج SCRIPE الاستحقاقات مباشرة في مسار SCRIPE mediator عبر FeatureCheckBehavior. الأوامر والاستعلامات التي تنفذ IRequireFeature يتم بوابتها تلقائياً.",
      pipelineTip:
        "لبوابة أمر خلف ميزة، قم ببساطة بتنفيذ IRequireFeature وعيّن RequiredFeatureName لمفتاح الميزة الثابت. لا حاجة لكود إضافي.",
      backendTitle: "هيكل الواجهة الخلفية",
      backendIntro:
        "تتبع الواجهة الخلفية للاستحقاقات تخطيط وحدة البنية النظيفة القياسي في SCRIPE مع طبقات النطاق والتطبيق والبنية التحتية.",
      frontendTitle: "هيكل الواجهة الأمامية",
      frontendIntro:
        "تعكس الواجهة الأمامية الواجهة الخلفية بأربع وحدات فرعية (الإصدارات، الميزات، الاشتراكات، التجاوزات).",
      controllersTitle: "وحدات تحكم API",
      controllersIntro:
        "تكشف وحدة الاستحقاقات عن 31 نقطة نهاية API عبر 4 وحدات تحكم، جميعها مصادقة بـ JWT ومحمية بتفويض قائم على الأذونات.",
      noOpTitle: "البديل الاحتياطي NoOp",
      noOpIntro:
        "عندما لا يتم تحميل وحدة الاستحقاقات، تسجل SCRIPE NoOpFeatureCache مما يسمح بمرور أوامر IRequireFeature دون أخطاء.",
      noOpNote:
        "يضمن البديل الاحتياطي NoOp أن الوحدات يمكنها استخدام IRequireFeature بدون اعتماد صارم على وحدة الاستحقاقات.",
      contextAwareTitle: "النطاق الواعي بالسياق",
      contextAwareIntro:
        "جميع صفحات الاستحقاقات (الميزات، الإصدارات، الأذونات) واعية بالسياق. تكتشف الواجهة الأمامية ما إذا كان المستخدم مسؤول نظام (tenantId فارغ)، مسؤول وحدة، أو في وضع الغوص، وتستدعي نقاط نهاية خلفية مختلفة وفقاً لذلك. يرى مسؤولو النظام الكتالوج الكامل مع عمليات CRUD؛ بينما يرى مسؤولو الوحدات بياناتهم الفعلية فقط في وضع القراءة.",
      resolutionTip:
        "The resolution chain is evaluated lazily — values are cached after first resolution and invalidated when subscriptions, editions, or overrides change.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "The Entitlements module registers 31 SCRIPE request handlers spanning the four domains. Each command has a corresponding FluentValidation validator for input validation.",
      diTitle: "Dependency Injection Registration",
      diIntro:
        "All Entitlements services are registered via the AddEntitlementsModule extension method in DependencyInjection.cs. The module follows SCRIPE's standard registration pattern.",
      comparisonTitle: "With vs Without Entitlements",
      comparisonIntro:
        "The following table shows the difference in capabilities when the Entitlements module is enabled versus running without it:",
      gettingStartedTitle: "Getting Started",
      gettingStartedIntro:
        "Follow these 5 steps to set up the Entitlements system for your platform. Each step builds on the previous one:",
      quotaGatingTitle: "بوابة الحصص وحجوزات الخانات",
      quotaGatingIntro:
        "تمثل الميزات الرقمية حصصاً يتم تطبيقها عند إنشاء موارد المستأجر. يستخدم SCRIPE نمط حجز ذري آمن للتزامن لإدارة هذه الحدود.",
      quotaGatingNote:
        "يقوم القائم بالتحقق بزيادة عداد الحجز. يقوم المعالج بتأكيد هذا الحجز عند النجاح أو تحريره عند الفشل مع استراتيجية الفتح عند الفشل عند حدوث خطأ استثنائي في قاعدة البيانات.",
    },
    editions: {
      title: "الإصدارات",
      description: "خطط اشتراك مسماة مع حزم ميزات وسياسات تجاوز الحدود وإصدارات واستراتيجيات طرح.",
      intro:
        "الإصدارات هي خطط مسماة (مثل Basic، Pro، Enterprise) تجمع قيم الميزات معاً. يشترك كل وحدة في إصدار يحدد أذونات وصوله للميزات. تدعم الإصدارات الإصدار المتدرج مع استراتيجيات طرح متحكم بها.",
      entityTitle: "كيان الإصدار",
      entityIntro:
        "الإصدار هو خطة مسماة تجمع قيم الميزات. إصدارات النظام تُنشأ من قبل مسؤولي المنصة؛ إصدارات التجزئة تُنشأ من قبل وحدةي التجزئة.",
      overflowTitle: "سياسة تجاوز الحدود",
      overflowIntro:
        "عندما يتم تخفيض وحدة إلى إصدار بحدود أقل، قد تتجاوز موارده الحالية الحدود الجديدة. تحدد سياسة التجاوز ما يحدث:",
      featuresTitle: "ميزات الإصدار",
      featuresIntro:
        "يحتوي كل إصدار على مجموعة من سجلات EditionFeature التي تربط الميزات بقيمها ضمن تلك الخطة.",
      versionsTitle: "إصدارات الإصدار",
      versionsIntro:
        "توفر إصدارات الإصدار نظام إصدار وطرح لتغييرات الميزات. بدلاً من تعديل الميزات مباشرة، يمكن للمسؤولين إنشاء إصدار جديد واختيار استراتيجية طرح ونشره.",
      rolloutTitle: "استراتيجيات الطرح",
      rolloutIntro: "عند نشر إصدار، يختار المسؤولون كيفية نشر التغييرات للوحدات المشتركين:",
      workflowTitle: "التطبيق الفوري مقابل الحفظ كإصدار",
      workflowIntro:
        "توفر SCRIPE طريقتين لتحديث ميزات الإصدار، كل منهما مناسبة لسيناريوهات مختلفة:",
      workflowTip:
        "استخدم 'التطبيق الفوري' للإصلاحات العاجلة والتغييرات الصغيرة. استخدم 'الحفظ كإصدار' لتحديثات الخطط الكبيرة.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "يكشف وحدة التحكم في الإصدارات عن 11 نقطة نهاية لإدارة الإصدارات وميزاتها ودورة حياة الإصدارات:",
      drillDownTitle: "سلوك الغوص في التفاصيل",
      drillDownIntro:
        "عندما يغوص مسؤول النظام في وحدة، يتم تحديد نطاق قائمة الإصدارات تلقائياً لتظهر فقط الإصدارات المرئية لذلك الوحدة. يستخدم الخادم رأس X-Tenant-Context للتصفية: إصدارات النظام + إصدارات التجزئة المنشأة من قبل الوحدة المُغاص فيه. تخفي الواجهة الأمامية عمليات CRUD في وضع الغوص.",
      scopingTitle: "System vs Retail Editions",
      scopingIntro:
        "SCRIPE supports two types of editions: System editions created by platform admins visible to all tenants, and Retail editions created by reseller tenants for their child tenants only.",
      scopingNote:
        "Tenant administrators only see system editions plus their own retail editions. During drill-down, the system admin sees only the drilled-down tenant's visible editions (system + that tenant's retail). This ensures edition isolation between reseller tenants.",
      featuresTip:
        "Features not explicitly set in an edition fall back to Feature.DefaultValue. You only need to configure features that differ from the global default.",
      endpointsList: "List all editions (paginated, filterable)",
      endpointsGet: "Get edition details by ID",
      endpointsCreate: "Create a new edition",
      endpointsUpdate: "Update edition metadata",
      endpointsDelete: "Soft-delete an edition",
      endpointsGetFeatures: "List features configured for this edition",
      endpointsSetFeatures: "Set/update features for this edition",
      endpointsDirectApply: "Apply feature changes immediately (no versioning)",
      endpointsGetVersions: "List all versions for this edition",
      endpointsCreateVersion: "Create a new draft version with feature snapshot",
      endpointsPublishVersion: "Publish a draft version with chosen rollout strategy",
      seededTitle: "الإصدارات النظامية المسبقة",
      seededIntro:
        "يقوم النظام بزرع إصدارين نظاميين قياسيين عند بدء التشغيل عبر EditionSeeder، مما يحدد القيود الافتراضية للميزات.",
    },
    subscriptions: {
      title: "الاشتراكات",
      description:
        "ربط الوحدة بالإصدار مع إدارة دورة حياة كاملة، تسعير متعدد العملات، عروض ترويجية، تجارب، تخفيضات، سلوك انتهاء الصلاحية، وتصدير تحليلات متقدم.",
      intro:
        "تربط الاشتراكات الوحدات بالإصدارات (الخطط). لكل وحدة اشتراك أساسي يحدد إصداره، واختيارياً اشتراكات إضافية للقدرات الإضافية. يتعامل نظام الاشتراكات مع دورة الحياة الكاملة — مع دعم مدمج للتسعير متعدد العملات وتتبع الخصومات الترويجية.",
      entityTitle: "كيان الاشتراك",
      entityIntro:
        "يربط TenantSubscription الوحدة بإصدار مع تتبع دورة الحياة. يدعم أنواع وحالات اشتراك متعددة.",
      typesTitle: "أنواع الاشتراكات",
      typesIntro: "لكل اشتراك نوع يحدد دورة الفوترة وسلوكه:",
      lifecycleTitle: "دورة حياة الحالة",
      lifecycleIntro: "تنتقل الاشتراكات عبر سلسلة من الحالات خلال دورة حياتها:",
      downgradeTitle: "تتبع التخفيض",
      downgradeIntro:
        "عندما يتم تخفيض وحدة، يتتبع النظام تفاصيل الاشتراك الأصلي للتدقيق والاستعادة المحتملة.",
      downgradeWarning:
        "عند التخفيض، تحدد سياسة تجاوز الحدود للإصدار المستهدف ما يحدث للموارد التي تتجاوز الحدود الجديدة.",
      expiryTitle: "سلوك انتهاء الصلاحية",
      expiryIntro: "عندما ينتهي اشتراك، يحدد إعداد ExpiryBehavior ما يحدث بعد ذلك:",
      pricingTitle: "التسعير متعدد العملات",
      pricingIntro:
        "يحمل كل اشتراك بيانات تسعير كاملة: العملة (رمز ISO)، المبلغ الأساسي، مبلغ التعديل، المبلغ الإجمالي، سعر الصرف مقابل الدولار، والمبلغ الإجمالي بالدولار. يتيح هذا تتبع الإيرادات بدقة عبر 9+ عملات مدعومة.",
      exchangeRateTitle: "التوحيد بالدولار الأمريكي",
      exchangeRateIntro:
        "يتم توحيد جميع المبالغ بالدولار عبر ExchangeRateToUsd لتقارير MRR/ARR متسقة. يُحسب حقل TotalAmountUsd عند إنشاء الاشتراك ويُخزن للدقة التاريخية.",
      promotionsTitle: "الخصومات الترويجية",
      promotionsIntro:
        "تدعم الاشتراكات أكواد العروض عبر حقل AppliedPromoCode. عند تطبيق عرض صالح، يُسجل PromotionDiscount كنسبة مئوية ويعكس AdjustmentAmount الخصم المطبق على المبلغ الأساسي.",
      exportTitle: "التصدير والتقارير المتقدمة",
      exportIntro:
        "يولد نظام تصدير الاشتراكات تقارير شاملة بتنسيقات CSV وExcel (XLSX) وPDF. يتضمن كل تقرير صفحة غلاف مع بيانات الفلاتر وجداول ملونة وملخصات إحصائية.",
      exportFiltersTitle: "فلاتر التصدير",
      exportFiltersIntro: "تدعم التقارير فلاتر متقدمة للتحليلات المستهدفة:",
      exportFilterDate:
        "النطاق الزمني — تصفية حسب تاريخ إنشاء الاشتراك (آخر 7/30/90 يوماً، السنة الأخيرة، أو نطاق مخصص)",
      exportFilterExpiring: "تنتهي قريباً — البحث عن اشتراكات تنتهي خلال 5/7/14/30/60/90 يوماً",
      exportFilterStatus: "الحالة — نشط، معلق، ملغي، منتهي",
      exportFilterEdition: "الإصدار — تصفية حسب خطة/إصدار محدد",
      exportFilterCurrency: "العملة — عرض المبالغ بالعملة المحددة",
      exportDaysLeftTitle: "الأيام المتبقية للانتهاء",
      exportDaysLeftIntro:
        "تتضمن التقارير عمود 'الأيام المتبقية' المحسوب مع تلوين شرطي: أحمر (≤7 أيام)، أصفر (≤30 يوماً)، أخضر (>30 يوماً). يتيح هذا التعرف الفوري على الاشتراكات التي تحتاج تجديد.",
      exportFormatsTitle: "تفاصيل تنسيقات التصدير",
      exportFormatCsv: "CSV — خفيف الوزن، قابل للاستيراد في أي جدول بيانات أو أداة BI",
      exportFormatExcel:
        "XLSX — مصنف Excel احترافي مع رؤوس منسقة، ورقة بيانات الفلاتر، تنسيقات شرطية، وأعمدة بحجم تلقائي (ClosedXML)",
      exportFormatPdf:
        "PDF — مستند جاهز للطباعة مع صفحة غلاف ذات علامة تجارية وملخص إحصائي وجداول بيانات مرقمة (QuestPDF)",
      renewalTitle: "التجديد — نمط الصف الجديد (B2)",
      renewalIntro:
        "تُنشئ التجديدات صفاً جديداً في TenantSubscription بدلاً من الكتابة فوق السجل القائم (نمط Stripe). يتم تعليم الاشتراك القديم بحالة منتهي الصلاحية (IsActive=false)، بينما يُنشأ صف جديد بمعرّف جديد وتاريخ بدء جديد وتسعير مُعاد حسابه وتفاصيل العروض المنقولة. هذا يحفظ مسار تدقيق إيرادات كامل لكل دورة فوترة.",
      renewalAuditTitle: "مسار تدقيق الإيرادات",
      renewalAuditIntro:
        "تُنتج كل دورة فوترة صفاً غير قابل للتغيير في قاعدة البيانات مع تسعير ثابت وقت التجديد. يتيح ذلك تقارير مالية دقيقة: اتجاهات MRR، تحليل الاشتراكات الملغاة حسب الفترة، وتتبع الاستردادات لكل دورة.",
      promoExpiryTitle: "تتبع انتهاء العرض الترويجي (A1)",
      promoExpiryIntro:
        "عند تطبيق عرض ترويجي بمدة DurationDays > 0، يحسب النظام طابعاً زمنياً لـ PromotionExpiresAt. عند كل تجديد، يتحقق المعالج مما إذا كان UtcNow > PromotionExpiresAt — إذا انتهى العرض، يُزال الخصم ولا يُنقل إلى صف الاشتراك الجديد.",
      concurrencyTitle: "التزامن التفاؤلي (E1)",
      concurrencyIntro:
        "يحتوي كل TenantSubscription على ConcurrencyStamp (Guid) مع [ConcurrencyCheck]. يُحدَّث الطابع عند كل عملية كتابة. يمنع ذلك حالات التسابق — مثل إلغاء متزامن + مهمة تسوية — عبر طرح DbUpdateConcurrencyException عند حدوث تصادم.",
      validationTitle: "التحقق من المدخلات (G1)",
      validationIntro:
        "تمتلك جميع أوامر الاشتراك الثمانية مدققات FluentValidation مخصصة. تستخدم المدققات ILocalizer لرسائل خطأ مترجمة (EN + AR). تشمل القواعد: لا يمكن التجديد كتجريبي، مبالغ استرداد موجبة، حدود طول النصوص.",
      crossModuleTitle: "التكامل عبر الوحدات (H1)",
      crossModuleIntro:
        "تنشر أحداث دورة حياة الاشتراك أحداث نطاق تستهلكها وحدة الهوية. عند تعليق اشتراك، يتم تعطيل جميع مسؤولي الوحدة مع DeactivationReason='SubscriptionSuspended'. عند الاستئناف، يُعاد تفعيل المسؤولين المعطلين بسبب التعليق فقط.",
      crossModuleReasons:
        "ثلاثة أسباب للتعطيل: 'يدوي' (لا يُعاد تفعيله تلقائياً)، 'SubscriptionSuspended' (يُعاد تفعيله عند الاستئناف)، 'SubscriptionExpired' (يُعطَّل عند انتهاء الصلاحية).",
      impactTitle: "تحليل تأثير التخفيض",
      impactIntro:
        "قبل تغيير إصدار الوحدة، استخدم نقطة نهاية تأثير التخفيض لمعاينة الموارد التي ستتجاوز الحدود.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro: "يقدم وحدة تحكم الاشتراكات 13 نقطة نهاية تغطي دورة حياة الاشتراك الكاملة:",
      operationsTitle: "Subscription Operations",
      operationsIntro:
        "The subscription module supports a comprehensive set of lifecycle operations. Each operation transitions the subscription to a new state with full audit tracking.",
      assignTitle: "Assign Subscription",
      assignIntro:
        "Create a new subscription linking a tenant to an edition. If the tenant already has an active subscription, the previous one is automatically cancelled. Supports optional currency, promo code, and expiry behavior parameters.",
      upgradeTitle: "Upgrade & Downgrade",
      upgradeIntro:
        "Tenants can move between editions. Upgrades apply immediately with the new edition's features taking effect right away. Downgrades check the OverflowPolicy first to handle resources that exceed new limits.",
      trialTitle: "Trial Conversion",
      trialIntro:
        "Trial subscriptions have a TrialEndDate. When a trial is upgraded to a paid plan, IsTrialConverted is set to true and the subscription transitions to the new type. If the trial expires without conversion, ExpiryBehavior determines what happens next.",
      ep: {
        list: "List all subscriptions (paginated, filterable by status/type/tenant)",
        get: "Get subscription details by ID",
        assign: "Create a new subscription (assign tenant to edition with currency/promo)",
        upgrade: "Upgrade to a higher edition",
        downgrade: "Downgrade to a lower edition (checks OverflowPolicy)",
        impact: "Preview downgrade impact before executing",
        suspend: "Suspend subscription (block tenant access)",
        resume: "Resume a suspended subscription",
        cancel: "Cancel subscription permanently",
        renew: "Renew an expiring subscription",
        tenantActive: "Get the active subscription for a specific tenant",
        export: "Export subscriptions as CSV, Excel, or PDF with advanced filters",
      },
    },
    features: {
      title: "الميزات",
      description: "قدرات المنصة القابلة للتحكم بأنواع Boolean و Numeric و String.",
      intro:
        "الميزات هي اللبنات الأساسية لنظام الاستحقاقات. تمثل كل ميزة قدرة قابلة للتحكم — مفتاح تشغيل/إيقاف، حصة رقمية، أو إعداد نصي. لكل ميزة مفتاح نظام ثابت (Name) لا يتغير أبداً.",
      entityTitle: "كيان الميزة",
      entityIntro:
        "تحدد الميزة قدرة منصة قابلة للتحكم. حقل Name هو مفتاح نظام ثابت يُستخدم في الكود.",
      valueTypesTitle: "أنواع القيم",
      valueTypesIntro: "تُخزن قيم الميزات كنصوص لكن تُفسر حسب ValueType الخاص بها.",
      valueTypesTip:
        "للميزات الرقمية، استخدم -1 لتمثيل 'غير محدود'. يتعرف FeatureCheckBehavior على -1 كقيمة خاصة ولا يحجب الطلبات أبداً.",
      systemVsCustomTitle: "ميزات النظام مقابل المخصصة",
      systemVsCustomIntro:
        "تميز SCRIPE بين ميزات النظام (المزروعة عند بدء التشغيل، للقراءة فقط) والميزات المخصصة (المنشأة من قبل المسؤولين):",
      cacheTitle: "ذاكرة التخزين المؤقت للميزات",
      cacheIntro:
        "تُخزن قيم الميزات المحلولة مؤقتاً في IFeatureCache لتجنب استعلامات قاعدة البيانات عند كل طلب.",
      requireFeatureTitle: "واجهة IRequireFeature",
      requireFeatureIntro:
        "لبوابة أمر أو استعلام CQRS خلف ميزة، نفذ واجهة IRequireFeature. يقوم سلوك FeatureCheckBehavior تلقائياً بحل القيمة الحالية للوحدة.",
      requireFeatureNote:
        "يعمل IRequireFeature مع كل من ميزات Boolean (التحقق من التمكين/التعطيل) والميزات الرقمية (التحقق من الحصة المتبقية).",
      endpointsTitle: "نقاط نهاية API",
      contextAwareTitle: "عرض الميزات الواعي بالسياق",
      contextAwareIntro:
        "صفحة قائمة الميزات واعية بالسياق. يرى مسؤولو النظام كتالوج الميزات الكامل مع عمليات CRUD. أما مسؤولو الوحدات وجلسات الغوص فيرون فقط الميزات الفعلية للوحدة (المحلولة من الإصدار + التجاوزات) في وضع القراءة فقط. يتم كل ذلك عبر الخادم عبر GET /features (الكتالوج) مقابل GET /features/effective (النطاق حسب الوحدة).",
      endpointsIntro:
        "The Features controller exposes 5 CRUD endpoints. System features cannot be deleted:",
      seedingTitle: "Feature Seeding",
      seedingIntro:
        "System features are automatically seeded at application startup by EntitlementsStartupSeeder. The seeder checks if each system feature already exists (by Name) and only creates missing ones — existing features are never overwritten.",
      quotaTitle: "Quota Tracking (QuotaCounter)",
      quotaIntro:
        "Numeric features support automatic quota enforcement via the QuotaCounter entity. The FeatureCheckBehavior checks the current usage against the resolved limit for every IRequireFeature command targeting a numeric feature.",
      cacheNote:
        "The cache is automatically invalidated when: (1) an edition's features are modified, (2) a subscription is assigned/changed, (3) an override is set/removed. No manual cache busting is needed.",
      patternTitle: "IRequireFeature Pattern",
      patternIntro:
        "To gate any CQRS command behind a feature check, simply implement the IRequireFeature marker interface. The FeatureCheckBehavior automatically intercepts the request, resolves the tenant's feature value, and rejects if disabled or over quota.",
      ep: {
        list: "List all features (paginated, filterable by category/type)",
        get: "Get feature details by ID",
        create: "Create a new custom feature",
        update: "Update feature metadata (system features: DefaultValue/Description only)",
        delete: "Soft-delete a custom feature (system features cannot be deleted)",
      },
    },
    overrides: {
      title: "تجاوزات الميزات",
      description: "تخصيص قيم الميزات لكل وحدة يتجاوز إعدادات الإصدار الافتراضية.",
      intro:
        "تتيح تجاوزات الميزات لمسؤولي المنصة تخصيص قيم الميزات للوحدات الأفراد بغض النظر عن الإصدار المشترك فيه.",
      entityTitle: "كيان التجاوز",
      entityIntro:
        "يعيّن TenantFeatureOverride قيمة مخصصة لميزة محددة على وحدة محدد مع حقل سبب اختياري للتدقيق.",
      priorityTitle: "أولوية الحل",
      priorityIntro:
        "تقع التجاوزات في أعلى سلسلة الحل. عندما يحل النظام قيمة ميزة لوحدة، يتحقق من التجاوز أولاً:",
      whenTitle: "متى تستخدم التجاوزات",
      whenIntro:
        "صُممت التجاوزات للحالات الاستثنائية حيث يحتاج الوحدة لقيمة مختلفة عما يوفره إصداره:",
      useCase1: "صفقات المؤسسات المخصصة — 'أعطِ شركة Acme 500 مستخدم بدلاً من الـ 50 القياسية'",
      useCase2: "العروض الترويجية — 'فعّل الدردشة المتقدمة لهذا الوحدة لمدة 30 يوماً'",
      useCase3: "الاختبار التجريبي — 'فعّل وحدة الفوترة الجديدة للمتبنين المبكرين'",
      useCase4: "التصعيد المؤقت — 'ارفع حد رفع الملفات خلال عملية الترحيل'",
      overuseWarning:
        "يجب استخدام التجاوزات بحذر. إذا احتاج العديد من الوحدات لنفس التجاوز، فكر في إنشاء إصدار جديد بدلاً من ذلك.",
      resolvedTitle: "نقطة نهاية الميزات المحلولة",
      resolvedIntro:
        "تُرجع نقطة نهاية الميزات المحلولة القيمة الفعلية النهائية لكل ميزة لوحدة معين مع مصدر الحل.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "The TenantFeatures controller exposes 4 endpoints for managing per-tenant overrides and resolved values:",
      scenariosTitle: "Use Case Scenarios",
      scenariosIntro:
        "The following real-world scenarios demonstrate when overrides provide the most value:",
      settingTitle: "Setting an Override",
      settingIntro:
        "To set an override, POST to the tenant features endpoint with the feature ID, custom value, and an optional reason for audit purposes.",
      settingTip:
        "Always include a reason when setting overrides — it makes audit trails meaningful and helps future admins understand why the override was applied.",
      expiryTitle: "Expiring Overrides",
      expiryIntro:
        "Overrides can have an optional ExpiresAt date. When the expiration date passes, the override is automatically deactivated and the feature falls back to the edition value (or global default).",
      expiryNote:
        "Expired overrides are soft-deactivated (IsActive = false), not deleted. This preserves the audit trail and allows re-activation if needed.",
      auditTitle: "Audit Trail",
      auditIntro:
        "Every override operation is tracked with full audit information. The Reason field on each override provides context for why the custom value was applied.",
      bestPracticesTitle: "Best Practices",
      bestPracticesIntro:
        "Follow these guidelines to keep your override system maintainable and auditable.",
      bestPracticesWarning:
        "Overrides should be used sparingly. If many tenants need the same override, consider creating a new edition instead. Excessive overrides make the system harder to manage and create maintenance debt.",
      ep: {
        list: "List all overrides for a specific tenant",
        set: "Set or update a feature override for a tenant",
        remove: "Remove (deactivate) a feature override",
        resolved:
          "Get all resolved feature values for a tenant (shows source: Override/Edition/Default)",
      },
      mergingTitle: "دمج وفرز الاشتراكات",
      mergingIntro:
        "عندما يكون للمستأجر اشتراكات نشطة متعددة (مثل خطة أساسية وخدمة إضافية)، يتم دمج الميزات. يتم تحميل الاشتراكات وفرزها تصاعدياً حسب نوعها: مدى الحياة (0) ← شهري (1) ← سنوي (2) ← تجريبي (3) ← إضافي (4) ← مجاني (5).",
      permissionsSyncTitle: "التعبئة التلقائية للأذونات",
      permissionsSyncIntro:
        "عندما يصبح الاشتراك نشطاً أو تجريبياً، يتم نشر SubscriptionChangedEvent. يتم التعامل مع هذا عبر SubscriptionChangedEventHandler في وحدة الهوية لمزامنة مجموعة أذونات المستأجر وأذونات دور المسؤول الفائق تلقائياً.",
    },
    compliance: {
      overview: {
        title: "وحدة الامتثال",
        description:
          "أتمتة الامتثال لـ GDPR وCCPA وPDPA — بروفايلات اللوائح، إدارة طلبات الموضوعات، الموافقة، الاحتفاظ بالبيانات، الجرد، وإنشاء التقارير.",
        intro:
          "وحدة الامتثال هي محرك الامتثال التنظيمي المدمج في SCRIPE. تساعد مشغلي المنصة ووحدةيهم على الالتزام بأبرز قوانين حماية البيانات (GDPR وCCPA وPDPA) من خلال أدوات مؤتمتة لإدارة طلبات الموضوعات وسجلات الموافقة وسياسات الاحتفاظ وإنشاء تقارير جاهزة للتدقيق.",
        infoTitle: "ملاحظة الامتثال",
        infoContent:
          "تعتبر وحدة الامتثال حاسمة للحفاظ على الالتزام التنظيمي وتجنب الغرامات. تأكد من ربط جميع الميزات بشكل صحيح بسياسات معالجة البيانات.",
        featureDsr: "طلبات حقوق أصحاب البيانات",
        featureDsrDesc:
          "يعالج طلبات أصحاب البيانات بما في ذلك التصدير، الحذف، التصحيح، والتقييد مع تتبع كامل لدورة الحياة ومراقبة اتفاقية مستوى الخدمة.",
        featureConsent: "إدارة الموافقة",
        featureConsentDesc:
          "تتبع غير قابل للتغيير لحالات الموافقة، اللقطات، ومسارات التدقيق للامتثال للمادة 6 من GDPR وCCPA.",
        featureRetention: "سياسات الاحتفاظ",
        featureRetentionDesc:
          "يفرض سياسات إتلاف البيانات بناءً على فترات احتفاظ قابلة للتكوين مع إجراءات حذف أو إخفاء هوية مؤتمتة.",
        featureInventory: "جرد البيانات",
        featureInventoryDesc:
          "يعين مواقع معلومات تحديد الهوية الشخصية (PII) الحساسة عبر الوحدات — مطلوب لسجلات أنشطة المعالجة (RoPA) بموجب المادة 30 من GDPR.",
        featureReports: "تقارير الامتثال",
        featureReportsDesc:
          "يولد تقارير غير متزامنة جاهزة للتدقيق (نظرة عامة على GDPR، ملخص DSR، تدقيق الموافقة، تحليل الاحتفاظ، تصدير جرد البيانات).",
        featureWebhooks: "أحداث الويب هوك",
        featureWebhooksDesc:
          "11 حدث ويب هوك في الوقت الفعلي تغطي دورة حياة DSR، تغييرات الموافقة، فرض الاحتفاظ، وإنشاء التقارير.",
        descDsr: "يتعامل مع طلبات الموضوع (التصدير، الحذف، التصحيح)",
        descConsent: "تتبع غير قابل للتغيير لحالات الموافقة واللقطات",
        descRet: "يفرض سياسات إتلاف البيانات بناءً على العمر",
        descInv: "يعين مواقع معلومات تحديد الهوية الشخصية الحساسة عبر الوحدات",
        descRep: "يولد تقارير امتثال سجلات أنشطة المعالجة وتقييم تأثير حماية البيانات",
        descId: "وحدة الهوية",
        descIdDesc: "يوفر سياق المستخدم/المسؤول والمصادقة",
        descEnt: "وحدة الاستحقاقات",
        descEntDesc: "يتحكم في قدرات الامتثال عبر الميزات",
        conn1: "يبدأ الطلبات",
        conn2: "يمنح/يلغي",
        conn3: "يتحكم في السياسات",
        conn4: "يوجه الحذف",
        conn5: "يستهدف البيانات",
        conn6: "مسارات التدقيق",
        conn7: "مسارات التدقيق",
        th1: "المكون",
        th2: "المسؤولية",
        tr1_1: "نموذج عرض قائمة طلبات موضوع البيانات",
        tr1_2: "يتعامل مع ترقيم الصفحات، والتصفية، وتعيين طلبات موضوع البيانات الواردة.",
        tr2_1: "عرض سجل الموافقة",
        tr2_2:
          "يعرض لقطة الموافقة غير القابلة للتغيير إلى جانب وكيل المستخدم والبيانات الوصفية للطابع الزمني.",
        whatIsTitle: "ما هي وحدة الامتثال؟",
        whatIsIntro:
          "توفر وحدة الامتثال ستة أنظمة فرعية مترابطة تغطي دورة حياة الامتثال الكاملة. بدلاً من بناء أدوات الامتثال من الصفر، يحصل وحدةو SCRIPE على نظام جاهز للإنتاج يتتبع ويؤتمت ويُعلم عن التزاماتهم بحماية البيانات.",
        subModulesTitle: "ستة أنظمة فرعية",
        subModulesIntro: "يتعامل كل نظام فرعي مع مجال امتثال محدد:",
        sub1: "بروفايلات اللوائح — تخزن الأطر التنظيمية (GDPR وCCPA وPDPA) التي تعمل المنصة في إطارها.",
        sub2: "طلبات موضوع البيانات (DSR) — تدير طلبات الحقوق من أصحاب البيانات (تصدير، حذف، تصحيح، تقييد).",
        sub3: "إدارة الموافقة — تسجل وتتتبع وتدقق منح الموافقة وسحبها من المستخدمين.",
        sub4: "سياسات الاحتفاظ بالبيانات — تحدد المدة التي يتم فيها الاحتفاظ بالبيانات وما يحدث عند انتهائها (حذف أو إخفاء هوية).",
        sub5: "جرد البيانات — سجل لجميع فئات البيانات الشخصية التي تعالجها المنصة.",
        sub6: "تقارير الامتثال — تنشئ تقارير غير متزامنة جاهزة للتدقيق (نظرة عامة على GDPR، ملخص DSR، تدقيق الموافقة، إلخ).",
        regulationsTitle: "اللوائح المدعومة",
        regulationsIntro:
          "تدعم وحدة الامتثال في SCRIPE فرض لوائح حماية البيانات الرئيسية التالية. يتم إعداد كل لائحة مسبقاً بمواعيد SLA وهياكل العقوبات الخاصة بها.",
        regName: "اللائحة",
        regRegion: "المنطقة / الولاية القضائية",
        regSla: "اتفاقية مستوى الخدمة للاستجابة",
        regPenalty: "العقوبة القصوى",
        regGdprRegion: "الاتحاد الأوروبي (EU/EEA)",
        regCcpaRegion: "كاليفورنيا، الولايات المتحدة الأمريكية",
        regLgpdRegion: "البرازيل",
        regPopiaRegion: "جنوب أفريقيا",
        regPdpaRegion: "سنغافورة",
        backendTitle: "معمارية الخلفية",
        backendIntro:
          "تتبع خلفية الامتثال تخطيط وحدة SCRIPE القياسي ذي 3 مشاريع (النطاق / التطبيق / البنية التحتية) مع ComplianceDbContext وComplianceController مخصصين.",
        cqrsTitle: "أوامر واستعلامات CQRS",
        cqrsIntro:
          "تستخدم وحدة الامتثال نمط CQRS للوسيط القياسي في SCRIPE. تتعامل الأوامر مع عمليات الكتابة وتتعامل الاستعلامات مع عمليات القراءة، ولكل منها مدققات FluentValidation مخصصة.",
        cqrsType: "النوع",
        cqrsExample: "المعالج",
        cqrsDesc: "الوصف",
        cqrsSubmit: "يرسل طلباً جديداً لموضوع البيانات مع التحقق وحساب اتفاقية مستوى الخدمة",
        cqrsReview: "يراجع ويحدث حالة طلب DSR (موافقة، رفض، اكتمال)",
        cqrsConsent: "يسجل منح الموافقة مع بيانات وصفية كاملة للتدقيق (IP، وكيل المستخدم، الإصدار)",
        cqrsRetention: "يحدث تكوين سياسة الاحتفاظ (الأيام، الإجراء، حالة النشاط)",
        cqrsDsrList: "يسرد جميع طلبات DSR مع ترقيم الصفحات، والتصفية حسب الحالة/النوع/اللائحة",
        cqrsConsentAnalytics: "يجمع إحصاءات الموافقة حسب الغرض، الحالة، والفترة الزمنية",
        cqrsDashboard:
          "يعيد لوحة معلومات ملخصة تحتوي على الأعداد عبر جميع الأنظمة الفرعية للامتثال",
        frontendTitle: "معمارية الواجهة الأمامية",
        frontendIntro:
          "تُنظَّم الواجهة الأمامية كستة وحدات فرعية مستقلة ضمن src/modules/compliance/، كل منها مع طبقاتها الخاصة للنطاق والبيانات والعرض.",
        endpointsTitle: "نظرة عامة على نقاط نهاية API",
        endpointsIntro:
          "جميع نقاط النهاية تحت /api/v1/compliances/ وتتطلب المصادقة بصلاحية compliance.view.",
        apiRegList: "يسرد جميع بروفايلات اللوائح المكونة للمنصة",
        apiDsrSubmit: "إرسال طلب موضوع بيانات جديد (تصدير، حذف، تصحيح، تقييد)",
        apiDsrList: "سرد جميع طلبات DSR مع ترقيم الصفحات، والتصفية حسب الحالة/النوع/اللائحة",
        apiDsrReview: "مراجعة DSR — الموافقة، الرفض، أو وضع علامة مكتمل مع ملاحظات الحل",
        apiConsentRecord: "تسجيل منح موافقة جديد مع بيانات وصفية كاملة للتدقيق",
        apiConsentAnalytics: "استرداد تحليلات الموافقة (معدلات المنح/السحب حسب الغرض)",
        apiRetentionList: "سرد جميع سياسات الاحتفاظ مع حالة الفرض",
        apiRetentionUpdate: "تحديث سياسة الاحتفاظ (الأيام، الإجراء، حالة النشاط)",
        apiInventoryList: "سرد جميع عناصر جرد البيانات (RoPA بموجب المادة 30 من GDPR)",
        apiReportsList: "سرد جميع تقارير الامتثال مع فلاتر الحالة والنوع",
        apiReportDownload: "تنزيل تقرير تم إنشاؤه بصيغة CSV أو JSON أو XLSX أو PDF",
        apiReportGenerate: "وضع مهمة جديدة لإنشاء تقرير امتثال غير متزامن في قائمة الانتظار",
        apiDashboard: "استرداد ملخص لوحة معلومات الامتثال (الأعداد، حالة SLA، التنبيهات)",
        webhooksTitle: "أحداث الويب هوك",
        webhooksIntro:
          "تطلق وحدة الامتثال 11 حدث ويب هوك في الوقت الفعلي يمكن للأنظمة الخارجية الاشتراك فيها. يتم تسجيل الأحداث تلقائياً عبر ComplianceWebhookEventCatalog وتوزيعها من خلال خط أنابيب IWebhookDispatcher.",
        webhookEvent: "مفتاح الحدث",
        webhookCategory: "الفئة",
        webhookDesc: "الوصف",
        whDsrSubmitted: "يتم إطلاقه عند تقديم طلب موضوع بيانات جديد",
        whDsrStatusChanged:
          "يتم إطلاقه عند انتقال حالة DSR (قيد الانتظار ← قيد المعالجة ← مكتمل/مرفوض)",
        whDsrCompleted: "يتم إطلاقه عند اكتمال DSR بالكامل (تصدير البيانات، حذفها، أو تصحيحها)",
        whDsrErasure: "يتم إطلاقه عند تأكيد طلب حذف DSR من قبل المسؤول (إجراء نووي)",
        whDsrCancelled: "يتم إطلاقه عند إلغاء DSR قبل اكتماله",
        whConsentGranted: "يتم إطلاقه عندما يمنح المستخدم الموافقة لغرض معين",
        whConsentWithdrawn: "يتم إطلاقه عندما يسحب المستخدم موافقة ممنوحة مسبقاً",
        whRetentionUpdated: "يتم إطلاقه عند تحديث تكوين سياسة الاحتفاظ",
        whRetentionExec: "يتم إطلاقه عند اكتمال تنفيذ مهمة فرض الاحتفاظ",
        whReportGenerated: "يتم إطلاقه عند اكتمال إنشاء تقرير الامتثال بنجاح",
        whReportFailed: "يتم إطلاقه عند فشل إنشاء تقرير الامتثال",
        quickStartTitle: "دليل البدء السريع",
        step1Title: "تهيئة بيانات الامتثال",
        step1Content:
          "قم بتشغيل أداة التهيئة للتطوير لملء بروفايلات اللوائح، وأغراض الموافقة النموذجية، وسياسات الاحتفاظ لبيئة الاختبار الخاصة بك.",
        step2Title: "تكوين بروفايلات اللوائح",
        step2Content:
          "انتقل إلى الامتثال ← اللوائح في لوحة التحكم. قم بتمكين اللوائح التي تعمل منصتك بموجبها (GDPR، CCPA، PDPA). تحدد كل لائحة مواعيد SLA وهياكل العقوبات التي سيتم تطبيقها.",
        step3Title: "تقديم طلب DSR تجريبي",
        step3Content:
          "أنشئ طلب موضوع بيانات لاختبار دورة الحياة الكاملة. سيقوم النظام بالتحقق من الطلب، وحساب الموعد النهائي لاتفاقية مستوى الخدمة، وجعله متاحاً للتعيين لمسؤول الامتثال.",
        step4Title: "تسجيل الموافقة وتكوين الاحتفاظ",
        step4Content:
          "قم بإعداد أغراض الموافقة (التسويق، التحليلات، الطرف الثالث) وتكوين سياسات الاحتفاظ لكل فئة بيانات. ستقوم مهمة فرض الاحتفاظ تلقائياً بتطبيق الإجراءات المكونة عندما تتقادم البيانات وتتجاوز فترة الاحتفاظ.",
        step5Title: "إنشاء تقرير امتثال",
        step5Content:
          "ضع تقرير امتثال غير متزامن في قائمة الانتظار. سيتم إنشاء التقرير في الخلفية ويظهر في قائمة التقارير بمجرد جاهزيته. قم بتنزيله بصيغة CSV أو JSON أو XLSX أو PDF.",
        securityTitle: "الاعتبارات الأمنية",
        securityIntro:
          "بيانات الامتثال هي من بين البيانات الأكثر حساسية في المنصة. جميع نقاط النهاية محمية بمصادقة JWT، والترخيص المستند إلى الأدوار، وتشفير المعرفات أثناء الانتقال. تخضع البيانات الشخصية في طلبات DSR وسجلات الموافقة لقيود أمنية على مستوى الحقل.",
        securityWarningTitle: "تحذير حماية البيانات",
        securityWarningContent:
          "تحتوي بيانات الامتثال على معلومات تحديد الهوية الشخصية (PII). تأكد من تكوين ضوابط الوصول المناسبة، وتسجيل التدقيق، وتشفير البيانات. لا تكشف أبداً عن نقاط نهاية الامتثال الخام بدون مصادقة.",
        secDoTitle: "الممارسات الموصى بها",
        secDo1: "تمكين الأمن على مستوى الحقل لحقول PII في استجابات DSR",
        secDo2: "تكوين أسرار الويب هوك لجميع اشتراكات أحداث الامتثال",
        secDo3: "تعيين سياسات الاحتفاظ لبيانات الامتثال نفسها (الامتثال الفوقي)",
        secDo4: "مراجعة سجلات التدقيق بانتظام للكشف عن محاولات الوصول غير المصرح بها",
        secDontTitle: "الأنماط المضادة لتجنبها",
        secDont1: "لا تكشف أبداً عن نقاط نهاية DSR بدون مصادقة المسؤول فقط (AdminOnly)",
        secDont2: "لا تتجاهل أبداً تتبع إصدار الموافقة — فهذا يبطل مسار التدقيق",
        secDont3: "لا تحذف أبداً سجلات الامتثال نهائياً — استخدم دائماً الحذف الناعم",
        secDont4: "لا تتجاوز أبداً موزع الويب هوك لأحداث الامتثال",
      },

      dsr: {
        title: "طلبات موضوع البيانات (DSR)",
        description: "الوصف",
        intro:
          "طلبات موضوع البيانات (DSRs) هي طلبات رسمية من الأفراد لممارسة حقوقهم بموجب قوانين حماية البيانات. تقدم وحدة الامتثال سير عمل DSR متكاملًا ومنظمًا: التقديم والتعيين والمراجعة والمعالجة والإغلاق — مع مسار تدقيق كامل للإضافة فقط وتتبع اتفاقية مستوى الخدمة (SLA).",
        typesTitle: "أنواع الطلبات",
        typesIntro: "يدعم النظام خمسة أنواع DSR كما هو محدد في لوائح GDPR وCCPA:",
        typesType: "نوع الطلب",
        typesDesc: "الوصف",
        typesGdpr: "مرجع GDPR",
        typesAccessDesc:
          "حق الوصول (المادة 15). يطلب صاحب البيانات قائمة بأغراض المعالجة وفئات البيانات الشخصية والمستلمين.",
        typesExportDesc:
          "حق نقل البيانات (المادة 20). يطلب صاحب البيانات نسخة مقروءة آليًا من بياناته الشخصية.",
        typesErasureDesc:
          "الحق في الحذف / الحق في النسيان (المادة 17). يطلب صاحب البيانات حذف بياناته الشخصية نهائيًا أو إخفاء هويتها.",
        typesRectificationDesc:
          "حق التصحيح (المادة 16). يطلب صاحب البيانات تصحيح البيانات الشخصية غير الدقيقة أو غير المكتملة.",
        typesRestrictionDesc:
          "حق تقييد المعالجة (المادة 18). يطلب صاحب البيانات تعليق معالجة البيانات مع الاحتفاظ بتخزينها.",
        lifecycleTitle: "دورة حياة الطلب",
        lifecycleIntro:
          "تُمثَّل تذاكر DSR كانتقالات بين الحالات مع دورة مراجعة وبوابات تأكيد السلامة لمنع عمليات الحذف العرضية وغير القابلة للتراجع:",
        lifecycleFlowTitle: "دورة حياة طلب DSR وبوابات السلامة",
        nodeSubmit: "1. تقديم الطلب",
        descSubmit:
          "يقدم صاحب البيانات طلب DSR عبر SubmitDsrCommand. يتم تعيين الحالة إلى معلق وحساب الموعد النهائي لاتفاقية مستوى الخدمة.",
        nodeReview: "2. مراجعة المسؤول",
        descReview: "يراجع المسؤول الطلب عبر ReviewDsrCommand، وينقل الحالة إلى مقبول أو مرفوض.",
        nodeConfirm: "3. تأكيد الحذف",
        descConfirm:
          "تتطلب طلبات الحذف تأكيدًا يدويًا عبر ConfirmErasureCommand، مما يحدد القيمة ErasureConfirmed = true.",
        nodeProcessing: "4. وظيفة تنفيذ DSR",
        descProcessing:
          "تقوم وظيفة DsrExecutionJob التي تعمل كل 5 دقائق بمعالجة الطلبات المؤكدة/المقبولة في دفعات تصل إلى 50 عضوًا.",
        nodeCompleted: "5. الحالة: مكتمل",
        descCompleted: "تم التنفيذ بنجاح عبر جميع الوحدات، وتخزين الطابع الزمني للاكتمال.",
        nodeRejected: "الحالة: مرفوض",
        descRejected: "يتم رفض الطلب من قبل المسؤول أثناء المراجعة. يتم حفظ ملاحظات الحل.",
        nodeCancelled: "الحالة: ملغى",
        descCancelled: "يمكن إلغاء الطلبات المعلقة أو قيد المراجعة أو المقبولة يدويًا في أي وقت.",
        nodePartial: "6. مكتمل جزئيًا",
        descPartial:
          "إذا فشل أي مزود وحدة، ينتقل DSR إلى مكتمل جزئيًا ويزيد RetryCount (الحد الأقصى 3).",
        connSubmitReview: "يعين وينقل إلى قيد المراجعة",
        connReviewApprove: "يوافق على الطلب",
        connReviewReject: "يرفض الطلب",
        connApproveConfirm: "مطلوب للحذف",
        connConfirmExec: "يلتقط للمعالجة",
        connExecComplete: "تنجح جميع الوحدات",
        connExecPartial: "تفشل أي وحدة",
        connPartialRetry: "يعيد محاولة الوحدات الفاشلة",
        connCancel: "يلغي الطلب",
        executionFlowTitle: "مسار تنفيذ إخفاء هوية DSR",
        nodeExecJob: "بدء DsrExecutionJob",
        descExecJob: "يعمل كل 5 دقائق ويسترجع طلبات الحذف المقبولة والجاهزة للتنفيذ.",
        nodeCheckSafety: "بوابة فحص السلامة",
        descCheckSafety:
          "يتحقق من أن ErasureConfirmed = true وأن فترة سماح ErasureExecuteAfter قد انتهت.",
        nodeGenToken: "توليد رمز إخفاء الهوية",
        descGenToken: "يولد رمز إخفاء هوية آمنًا باستخدام SHA-256 بناءً على معرف صاحب البيانات.",
        nodeFanOut: "توزيع الوحدات",
        descFanOut: "يمر عبر جميع مزودي الامتثال المسجلين الذين ينفذون IUserDataAnonymizer.",
        nodeModuleExec: "تنفيذ بدون تخصيص ذاكرة",
        descModuleExec:
          "ينفذ تحديثات قاعدة البيانات عبر ExecuteUpdateAsync لـ EF Core لمسح حقول PII.",
        nodeEvalStatus: "تقييم النتائج",
        descEvalStatus: "يفحص سجلات تنفيذ الوحدات للتأكد من اكتمالها بنجاح.",
        nodeComplete: "تعيين الحالة: مكتمل",
        descComplete: "يتم وضع علامة مكتمل على تذكرة DSR وتخزين الطابع الزمني لـ CompletedAt.",
        nodePartialLimit: "تعيين الحالة: مكتمل جزئيًا",
        descPartialLimit:
          "يسجل الخطأ، ويزيد RetryCount، ويضع الوحدات الفاشلة في قائمة الانتظار لإعادة المحاولة (الحد الأقصى 3).",
        connJobCheck: "يسترجع الدفعة",
        connCheckGen: "إذا تم تجاوز بوابات السلامة",
        connGenFan: "يبني الرمز",
        connFanMod: "يستدعي أدوات إخفاء الهوية",
        connModEval: "يجمع الحالات",
        connEvalComplete: "إذا نجح الجميع",
        connEvalPartial: "إذا فشل أي منها",
        slaTitle: "تتبع اتفاقية مستوى الخدمة وحسابات المواعيد النهائية",
        slaIntro:
          "تفرض لوائح الامتثال جداول زمنية صارمة للاستجابة. تقوم SCRIPE تلقائيًا بحساب وتتبع مقاييس اتفاقية مستوى الخدمة على لوحة تحكم المسؤول:",
        slaWarningTitle: "منطق الموعد النهائي لاتفاقية مستوى الخدمة",
        slaWarningContent:
          "يتم حساب المواعيد النهائية عند التقديم بقراءة RegulationProfile النشط (GDPR: 30 يومًا، CCPA: 45 يومًا). يُحسب تقدم أندكس اتفاقية مستوى الخدمة ديناميكيًا كنسبة مئوية: (الوقت الحالي - CreatedAt) / (الموعد النهائي - CreatedAt) * 100.",
        escalationTitle: "محرك التصعيد والتنبيهات",
        escalationIntro:
          "تعمل وظيفة DsrEscalationJob يوميًا في الساعة 08:00 UTC لتقييم استهلاك اتفاقية مستوى الخدمة وتصعيد التذاكر المتأخرة:",
        escalationTier1:
          "المستوى 1 (50% من SLA) — تنبيه تذكير قياسي يُرسل إلى المسؤول المعين. يسجل ملاحظة تاريخ الحالة: [SLA-ESCALATION-50%].",
        escalationTier2:
          "المستوى 2 (75% من SLA) — تصعيد تحذيري. يسجل ملاحظة تاريخ الحالة: [SLA-ESCALATION-75%] ويرسل ويب هوك compliance.dsr_sla_escalated.",
        escalationTier3:
          "المستوى 3 (90% من SLA) — تصعيد حرج. يسجل ملاحظة تاريخ الحالة: [SLA-ESCALATION-90%]، وينبه مديري النظام، ويرسل ويب هوك حرجًا.",
        providerTitle: "معمارية الموفر القابلة للتوسيع",
        providerIntro:
          "للحفاظ على الاقتران الضعيف، تتصل وحدة الامتثال بالوحدات الأخرى باستخدام تجريدات IUserDataProvider وIUserDataAnonymizer:",
        providerIdentityTitle: "التكامل مع وحدة الهوية",
        providerIdentityContent:
          "يصدر IdentityUserDataProvider البيانات الوصفية للملف الشخصي، وجلسات تسجيل الدخول النشطة، والارتباطات الخارجية. يستخدم IdentityUserDataAnonymizer تحديثات قاعدة البيانات عالية الأداء وبدون تخصيص ذاكرة لاستبدال الأسماء برمز إخفاء الهوية، وتنسيق البريد الإلكتروني كـ {token}@anonymized.invalid، وتعيين أرقام الهواتف إلى null، وتعليم عناوين IP للجلسات النشطة كـ 'ANONYMIZED'.",
        providerComplianceTitle: "التكامل مع وحدة الامتثال",
        providerComplianceContent:
          "يصدر ComplianceUserDataProvider سجلات الطلبات ومدخلات سجل الموافقة. يقوم ComplianceUserDataAnonymizer بمسح المعلومات الشخصية من طلبات DSR السابقة (SubjectEmail وRequesterNotes) وسجلات الموافقة (IpAddress وUserAgent).",
        entitiesTitle: "مرجع الكيانات",
        entityName: "اسم الكيان",
        entityDesc: "الوصف",
        entityDsrDesc:
          "يمثل طلب موضوع بيانات يحتوي على النوع والحالة والموعد النهائي لاتفاقية مستوى الخدمة ومعلمات التنفيذ.",
        entityModuleDesc:
          "يتتبع حالة التنفيذ ومحاولات إعادة المحاولة لتنفيذ DSR الموزع لكل موفر وحدة.",
        entityStatusDesc:
          "سجل للإضافة فقط يتتبع انتقالات حالة DSR، وتعليقات الحل، وتصعيد اتفاقية مستوى الخدمة.",
        codeTitle: "تنفيذ الكود",
        endpointsTitle: "نقاط نهاية API",
        endpointsIntro:
          "يكشف وحدة تحكم DSR عن نقاط النهاية التالية لتقديم الطلبات والمراجعة والتحكم في التنفيذ:",
        ep: {
          list: "قائمة جميع طلبات DSR (مع ترقيم الصفحات، قابلة للتصفية حسب الحالة/النوع/اللائحة)",
          get: "الحصول على تفاصيل DSR حسب المعرف",
          create: "تقديم طلب DSR جديد (يحسب الموعد النهائي لاتفاقية مستوى الخدمة)",
          updateStatus: "تحديث حالة DSR (قيد التنفيذ، مكتمل، مرفوض)",
          assign: "تعيين DSR لمسؤول امتثال",
          delete: "حذف ناعم لـ DSR",
          confirm: "تأكيد صريح لطلب DSR حذف مقبول لفتح قفل التنفيذ",
        },
        field: "الحقل",
        type: "النوع",
        fId: "معرف فريد لطلب DSR.",
        fTenantId: "مفتاح خارجي يشير إلى سياق المستأجر.",
        fSubjectEmail: "عنوان البريد الإلكتروني لصاحب البيانات (يتم إخفاء هويته عند الحذف).",
        fRequestType: "نوع طلب DSR (وصول، تصدير، حذف، تصحيح، تقييد).",
        fStatus: "الحالة الحالية لدورة حياة الطلب.",
        fDeadline: "الموعد النهائي المحسوب للاستجابة لاتفاقية مستوى الخدمة.",
        fErasureConfirmed: "علامة منطقية لفتح قفل طلبات الحذف لوظائف الخلفية.",
        fErasureExecuteAfter: "حد التنفيذ الذي يفرض فترة السماح التكيفية.",
        fExportFileUrl: "رابط لتنزيل ملف zip للبيانات المصدرة الموزعة.",
        fAssignedTo: "مفتاح خارجي يشير إلى المسؤول المعين.",
        fRetryCount: "عدد محاولات إعادة المحاولة الحالية لتنفيذ الوحدات الفاشلة.",
        fCompletedAt: "طابع زمني يشير إلى وقت اكتمال DSR.",
        quickStartTitle: "دليل البدء السريعة",
        step1Title: "تهيئة بروفايلات الامتثال",
        step1Content:
          "قم بتشغيل أداة التهيئة لملء ملفات لوائح GDPR وCCPA مع أيام اتفاقية مستوى الخدمة.",
        step2Title: "تقديم طلب موضوع بيانات",
        step2Content:
          "استخدم نقطة نهاية POST لتسجيل طلب جديد. يتحقق النظام من قيود المدخلات ويحسب الموعد النهائي للاستجابة.",
        step3Title: "المراجعة والموافقة",
        step3Content:
          "يراجع مسؤول الامتثال المعين التذكرة. تؤدي الموافقة على DSR حذف إلى تعيين فترة السماح وانتظار التأكيد النهائي الحرج.",
        executionFlowIntro:
          "ينفذ محرك الحذف إخفاء هوية البيانات الشخصية بشكل غير متزامن عبر الوحدات من خلال تطبيق موفرين موزعين:",
      },
      consent: {
        title: "إدارة الموافقة",
        description: "الوصف",
        intro:
          "توفر إدارة الموافقة سجلاً غير قابل للتغيير لحالات موافقة المستخدم. لدعم عمليات البحث عالية الأداء إلى جانب مسار تدقيق قابل للدفاع عنه قانونيًا، تستخدم SCRIPE بنية جدول ثنائية مقسمة بين سجل معاملات للإضافة فقط وعرض لقطة مخزن مؤقتًا.",
        purposesTitle: "أغراض وإعدادات الموافقة",
        purposesIntro:
          "يتم تنظيم تتبع الموافقة بواسطة بروفايلات عالمية وأغراض موافقة هيكلية تمت تهيئتها عند بدء التطبيق:",
        purposesKey: "مفتاح الغرض",
        purposesBasis: "الأساس القانوني",
        purposesRequired: "إلزامي",
        purposesSort: "ترتيب الفرز",
        purposesActive: "نشط",
        purposesEssentialDesc:
          "القدرات الأساسية المطلوبة لتشغيل المنصة. (مطلوب، أساس قانوني تعاقدي).",
        purposesMarketingDesc:
          "الرسائل الإخبارية الترويجية ورسائل البريد الإلكتروني واتصالات الحملات. (اختياري، أساس قانوني للموافقة).",
        purposesAnalyticsDesc:
          "تحليلات الاستخدام، وتتبع سلوك المستخدم، وتيليمترية تحسين المنتج. (اختياري، أساس قانوني للموافقة).",
        basisContract: "عقد",
        basisConsent: "موافقة",
        basisLegitimate: "مصلحة مشروعة",
        basisObligation: "التزام قانوني",
        flowTitle: "مسار تسجيل والتحقق من الموافقة",
        nodeSubmit: "تقديم الموافقة",
        descSubmit: "يقوم المستخدم بتحديث تفضيلاته أو تقديم نموذج موافقة.",
        nodeValidate: "تحقق FluentValidation",
        descValidate: "يتحقق من قيود اللائحة وصيغة مفتاح الغرض.",
        nodeLedger: "إضافة سجل المعاملات",
        descLedger:
          "يكتب معاملة ConsentRecord غير قابلة للتغيير تحتوي على عنوان IP ووكيل المستخدم والنسخة والإجراء.",
        nodeUpsert: "تحديث لقطة الحالة",
        descUpsert:
          "يخزن الحالة الحالية في ذاكرة التخزين المؤقت ConsentSnapshot لفحص الأذونات عالي الأداء.",
        nodeEvents: "أحداث النطاق",
        descEvents: "ينشر أحداث ConsentGrantedEvent أو ConsentWithdrawnEvent عبر MediatR.",
        nodeExpiry: "وظيفة انتهاء الموافقة",
        descExpiry:
          "تفحص وظيفة الخلفية الأسبوعية عدم تطابق النسخ وتعلم السجلات القديمة لإعادة الموافقة.",
        connSubmitValidate: "يقدم التفاصيل إلى",
        connValidateLedger: "يضيف المعاملة إذا كانت صالحة",
        connLedgerUpsert: "يحدث حالة التخزين المؤقت الحالية من",
        connUpsertEvents: "يوزع الأحداث عند النجاح",
        connExpiryUpsert: "يعلم RequiresReConsent = true في",
        immutabilityTitle: "معمارية قاعدة البيانات ثنائية الجداول",
        immutabilityIntro:
          "لضمان أداء قاعدة البيانات وسلامة تدقيق الامتثال، يفصل تتبع الموافقة بين المعاملات الكثيرة الكتابة وفحوصات الأذونات الكثيرة القراءة:",
        entitiesTitle: "مرجع الكيانات",
        entitiesIntro:
          "تحدد الجداول التالية خصائص المخطط لكل من سجل الإضافة فقط ولقطات التخزين المؤقت للحالة الحالية:",
        field: "الحقل",
        type: "النوع",
        fId: "معرف فريد للسجل.",
        fTenantId: "مفتاح خارجي يشير إلى سياق المستأجر.",
        fSubjectId: "مفتاح خارجي يشير إلى صاحب البيانات (المستخدم).",
        fPurposeId: "مفتاح خارجي يشير إلى تكوين ConsentPurpose.",
        fAction: "إجراء الموافقة المسجل (ممنوح أو مسحوب).",
        fCurrentAction: "أحدث حالة موافقة مخزنة مؤقتًا للموضوع والغرض.",
        fRequiresReConsent: "علامة تشير إلى وجوب إعادة موافقة المستخدم بسبب تحديث نسخة السياسة.",
        fLastUpdatedAt: "طابع زمني يمثل آخر تعديل للقطة.",
        fRecordedAt: "طابع زمني يمثل وقت حدوث معاملة سجل المعاملات.",
        fIpAddress: "عنوان IP للعميل الذي تم التقاطه وقت التسجيل.",
        fUserAgent: "وكيل متصفح العميل الذي تم التقاطه وقت التسجيل.",
        fRegulationBasis: "السياق التنظيمي (GDPR, CCPA) النشط أثناء التقديم.",
        fCollectionMethod: "الطريقة المستخدمة لجمع الموافقة (نموذج ويب، تطبيق جوال، API).",
        fConsentVersion: "نسخة وثيقة سياسة الموافقة النشطة أثناء التقديم.",
        bestPracticesTitle: "أفضل الممارسات",
        doTitle: "الممارسات الموصى بها",
        dontTitle: "ممارسات يجب تجنبها",
        do1: "التحقق من أن مفتاح الغرض يطابق قيود التعبير النمطي للأحرف الصغيرة والأرقام.",
        do2: "تشغيل وظيفة ConsentExpiryJob الأسبوعية دائماً لفرض إعادة الموافقة عند تحديثات النسخ.",
        do3: "استهلاك أحداث ConsentWithdrawnEvents لـ MediatR لتقييد معالجة البيانات اللاحقة.",
        dont1: "تجنب تعديل صفوف ConsentRecord مباشرة لتفادي كسر سلامة السجل غير القابل للتغيير.",
        dont2:
          "تجنب تشغيل استعلامات قاعدة بيانات مباشرة على ConsentRecord لفحص أذونات الواجهة الأمامية؛ اقرأ دائماً ConsentSnapshot.",
        dont3: "تجنب كشف نقاط نهاية تسجيل موافقة خام وغير مصادق عليها.",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          list: "قائمة سجلات الموافقة (للمسؤولين فقط، قابلة للتصفية مع ترقيم الصفحات)",
          get: "الحصول على تفاصيل سجل الموافقة حسب المعرف",
          record: "تسجيل منح أو سحب موافقة جديدة (للمستخدم/المسؤول)",
          withdraw: "سحب موافقة ممنوحة سابقاً (للمستخدم/المسؤول)",
          getMy: "استرجاع لقطات الموافقة النشطة للمستخدم المصادق عليه حالياً",
          analytics: "الحصول على إحصاءات الموافقة حسب الغرض والحالة (للمسؤولين فقط)",
        },
        entitiesLedgerTitle: "ConsentRecord (سجل المعاملات للإضافة فقط)",
        entitiesSnapshotTitle: "ConsentSnapshot (عرض لقطة مخزن مؤقتًا)",
        epWithdraw: "سحب موافقة ممنوحة سابقاً",
      },

      retention: {
        title: "سياسات الاحتفاظ بالبيانات",
        description:
          "تحديد فترات الاحتفاظ بالبيانات وإجراءات انتهاء الصلاحية الآلية (حذف أو إخفاء هوية) للامتثال للمادة 5(1)(ه) من GDPR.",
        intro:
          "تحدد سياسات الاحتفاظ بالبيانات المدة التي يجب فيها الاحتفاظ بفئات محددة من البيانات وما يحدث عند انتهاء فترة الاحتفاظ. تطبق SCRIPE هذه السياسات تلقائياً عبر مهام الخلفية.",
        policiesTitle: "تكوين السياسة",
        policiesIntro: "كل سياسة احتفاظ تحدد:",
        field1:
          "DataCategory — نوع البيانات (مثل 'بروفايلات المستخدمين'، 'سجلات المعاملات'، 'سجلات الموافقة').",
        field2: "RetentionDays — عدد الأيام التي يجب الاحتفاظ فيها بالبيانات.",
        field3: "ExpiryAction — ما يحدث عند انتهاء الفترة: حذف أو إخفاء هوية.",
        field4: "RegulationCode — اللائحة التي تتطلب فترة الاحتفاظ هذه (GDPR، CCPA، إلخ).",
        actionsTitle: "إجراءات انتهاء الصلاحية",
        actionsIntro: "عند انتهاء فترة الاحتفاظ، تطبق SCRIPE أحد إجراءين:",
        action1: "الحذف — يزيل بشكل دائم جميع السجلات المطابقة لفئة البيانات.",
        action2:
          "إخفاء الهوية — يستبدل المعلومات الشخصية بعلامات مجهولة الهوية مع الحفاظ على بيانات التحليلات الإجمالية.",
        automationTitle: "التطبيق الآلي",
        automationIntro:
          "تعمل RetentionEnforcementJob يومياً في 3:00 صباحاً UTC، تفحص جميع سياسات الاحتفاظ النشطة وتطبق إجراء انتهاء الصلاحية المكوَّن على السجلات المؤهلة. ينشئ كل تشغيل تطبيق سجل تدقيق RetentionExecution.",
        nodePolicy: "سياسة الاحتفاظ",
        descPolicy: "تحدد نوع الكيان، والحد العمري، واستراتيجية الإتلاف",
        nodeEnforcement: "مهمة تنفيذ الاحتفاظ",
        descEnforcement: "مهمة أسبوعية لتقييم السياسات",
        nodeExecution: "تنفيذ الاحتفاظ",
        descExecution: "مسار تدقيق لإجراء الإتلاف",
        nodeAction: "إتلاف البيانات",
        descAction: "حذف نهائي أو إخفاء الهوية عبر الوحدة القابلة للتعليق",
        conn1: "فُحصت بواسطة",
        conn2: "يثير",
        conn3: "سجلات",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          list: "قائمة جميع سياسات الاحتفاظ",
          executions: "قائمة سجل عمليات التطبيق",
          update: "تحديث سياسة احتفاظ (الأيام، الإجراء، حالة النشاط)",
        },
      },
      inventory: {
        title: "جرد البيانات",
        description:
          "سجل لجميع فئات البيانات الشخصية التي تعالجها المنصة — مطلوب لسجلات أنشطة المعالجة (RoPA) وفق المادة 30 من GDPR.",
        intro:
          "جرد البيانات هو سجل منظم لجميع فئات البيانات الشخصية التي تعالجها المنصة. بموجب المادة 30 من GDPR، يجب على المتحكمين الاحتفاظ بسجلات أنشطة المعالجة (RoPA) — جرد البيانات هو تطبيق SCRIPE لهذا المتطلب.",
        fieldsTitle: "حقول الجرد",
        fieldsIntro: "كل عنصر جرد يوثق:",
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
        ropaTitle: "الامتثال للمادة 30",
        ropaIntro:
          "يجب على المنظمات التي تضم 250+ موظفاً أو التي تعالج بيانات عالية الخطورة الاحتفاظ بـ RoPA بموجب المادة 30 من GDPR. يعمل جرد بيانات SCRIPE كـ RoPA حي وقابل للاستعلام يمكن تصديره للتفتيش التنظيمي.",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          list: "قائمة جميع عناصر جرد البيانات (مع ترقيم الصفحات، قابل للبحث)",
          get: "الحصول على عنصر حسب المعرف",
          create: "إضافة فئة بيانات جديدة إلى الجرد",
          update: "تحديث عنصر جرد موجود",
          delete: "إزالة عنصر من الجرد",
        },
      },
      reports: {
        title: "تقارير الامتثال",
        description:
          "إنشاء تقارير امتثال غير متزامنة جاهزة للتدقيق (نظرة عامة على GDPR، ملخص DSR، تدقيق الموافقة، تحليل الاحتفاظ، تصدير جرد البيانات).",
        intro:
          "تقارير الامتثال هي مستندات تُنشأ بشكل غير متزامن وتوفر ملخصات جاهزة للتدقيق لوضع الامتثال لديك. تُنشأ التقارير في الخلفية وتُخزَّن للتنزيل عند الجاهزية.",
        reportTypesTitle: "أنواع التقارير",
        reportTypesIntro: "خمسة أنواع تقارير متاحة:",
        type1:
          "نظرة عامة على GDPR — ملخص رفيع المستوى لحالة الامتثال لـ GDPR عبر جميع الوحدات الفرعية.",
        type2:
          "ملخص نشاط DSR — إحصاءات حجم DSR والأنواع ومعدلات الاستكمال والالتزام بمعدل الاستجابة.",
        type3: "تدقيق الموافقة — سجل كامل لمنح الموافقة وسحبها حسب الغرض والفترة الزمنية.",
        type4: "تحليل الاحتفاظ — حالة التطبيق الحالية لجميع سياسات الاحتفاظ النشطة.",
        type5: "تصدير جرد البيانات — تصدير كامل لجرد البيانات (RoPA وفق المادة 30).",
        asyncTitle: "الإنشاء غير المتزامن",
        asyncIntro:
          "تُنشأ التقارير بشكل غير متزامن لتجنب حجب طلبات HTTP لمجموعات البيانات الكبيرة. عند طلب تقرير، ينشئ النظام فوراً سجل ComplianceReport بقيمة IsReady=false ويضع مهمة الإنشاء في قائمة الانتظار. تحقق من قائمة التقارير لمراقبة متى تصبح IsReady صحيحة.",
        asyncTip:
          "استخدم زر التحديث في واجهة التقارير لاستطلاع جاهزية التقرير. تكتمل التقارير عادةً خلال 30-60 ثانية لمجموعات البيانات حتى 10,000 سجل.",
        downloadTitle: "تنزيل التقارير",
        downloadIntro:
          "بمجرد أن يصبح التقرير جاهزاً (IsReady=true)، يتوفر رابط DownloadUrl. تقدم نقطة نهاية التنزيل ملف التقرير بشكل آمن. تُحتفظ بملفات التقارير لمدة 90 يوماً قبل التنظيف التلقائي.",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          list: "قائمة جميع تقارير الامتثال (مع ترقيم الصفحات، قابلة للتصفية حسب النوع/الحالة)",
          get: "الحصول على تفاصيل التقرير ورابط التنزيل حسب المعرف",
          generate: "وضع مهمة إنشاء تقرير جديد في قائمة الانتظار",
          download: "تنزيل ملف التقرير المُنشأ",
        },
      },
      regulationProfiles: {
        title: "ملفات تعريف اللوائح",
        description:
          "تكوين لوائح حماية البيانات (GDPR، CCPA، LGPD، PDPA) التي تطبقها المنصة — يحدد كل ملف تعريف مواعيد نهاية DSR وفترات الاحتفاظ الافتراضية وإصدار الموافقة.",
        intro:
          "ملفات تعريف اللوائح هي أساس وحدة الامتثال في SCRIPE. يمثل كل ملف تعريف قانون حماية بيانات محدداً تطبقه المنصة، مع تخزين الموعد النهائي القانوني لـ DSR وفترات الاحتفاظ الافتراضية وإصدار وثيقة الموافقة النشطة.",
        whatIsTitle: "ما هي ملفات تعريف اللوائح؟",
        whatIsIntro:
          "RegulationProfile هو السجل الموثوق لمعاملات تطبيق الإطار التنظيمي. عند تقديم طلب موضوع البيانات، يقرأ النظام RegulationProfile النشط لحساب الموعد النهائي لـ SLA.",
        entityTitle: "كيان RegulationProfile",
        entityIntro:
          "يمثل كل صف لائحة واحدة ويخزن جميع المعاملات اللازمة لتطبيقها عبر الأنظمة الفرعية لـ DSR والموافقة والاحتفاظ.",
        seededTitle: "اللوائح المبذرة مسبقاً",
        seededIntro:
          "يبذر SCRIPE اللوائح التالية عند بدء التشغيل. يمكن للمسؤولين توسيع هذه القائمة أو تجاوز المعاملات دون تغييرات في الكود.",
        consentVersionTitle: "إصدار الموافقة ومشغل إعادة الموافقة",
        consentVersionIntro:
          "يخزن حقل CurrentConsentVersion الإصدار الدلالي لوثيقة سياسة الموافقة النشطة. عند تحديث هذه القيمة، يقوم ConsentExpiryJob تلقائياً بمسح جميع ConsentSnapshots النشطة وتعيين RequiresReConsent = true.",
        consentVersionWarning:
          "تغيير CurrentConsentVersion هو عملية عالية التأثير. سيتم إبطال جميع الموافقات النشطة لهذه اللائحة وسيُطلب من المستخدمين إعادة الموافقة. نسّق مع فريقك القانوني قبل إجراء تغييرات في بيئة الإنتاج.",
        retentionJsonTitle: "تنسيق DefaultRetentionJson",
        retentionJsonIntro:
          "يخزن حقل DefaultRetentionJson كائن JSON يربط مفاتيح فئة الاحتفاظ بفترتها الافتراضية بالأيام. القيم -1 تعني الاحتفاظ إلى أجل غير مسمى.",
        retentionJsonNote:
          "DefaultRetentionJson إعلامي فقط — يتم التطبيق الفعلي بواسطة صفوف RetentionPolicy التي يمكن تخصيصها لكل مستأجر.",
        endpointsTitle: "نقاط نهاية API",
        endpointsIntro:
          "تسمح نقاط نهاية ملف تعريف اللائحة للمسؤولين بتكوين اللوائح التي تطبقها المنصة.",
        "ep.list": "عرض جميع ملفات تعريف اللوائح المكوّنة للمنصة",
        "ep.get": "الحصول على ملف تعريف لائحة محدد بالمعرف",
        "ep.create": "إنشاء ملف تعريف لائحة مخصص جديد",
        "ep.update":
          "تحديث ملف تعريف لائحة موجود (الموعد النهائي لـ DSR، إصدار الموافقة، افتراضيات الاحتفاظ)",
        "ep.delete": "الحذف الناعم لملف تعريف لائحة مخصص (لا يمكن حذف الملفات المبذرة من النظام)",
        bestPracticesTitle: "أفضل الممارسات",
        bestPracticesTip:
          "ارفع دائماً CurrentConsentVersion عند تغيير سياسة الخصوصية بشكل جوهري. يؤدي هذا إلى تشغيل تدفق إعادة الموافقة الآلي وتوفير سجل تدقيق قانوني.",
      },
    },
    // ── إدارة العملاء المحتملين (CRM Leads) ─────────────────────
    // ── Plugins Module (Phase 15) ────────────────────────────
    plugins: {
      overview: {
        title: "نظرة عامة على نظام المكونات الإضافية",
        description:
          "منصة مكونات إضافية مؤسسية ثنائية الفئات مع مكونات إضافية معتمدة تعمل داخل العمليات ومكونات سوق معزولة.",
        intro:
          "نظام المكونات الإضافية هو محرك التوسيع في SCRIPE. يسمح لمشغلي المنصة بتثبيت المكونات الإضافية المعتمدة من الفئة 1 التي تعمل داخل العمليات مع وصول كامل للبنية التحتية، ومكونات الطرف الثالث من الفئة 2 التي تعمل في بوابة REST معزولة مع مخزن بيانات مفتاح-قيمة مستقل.",
        infoTitle: "المرحلة 15 — منصة المكونات الإضافية للمؤسسات",
        infoContent:
          "تم تقديم نظام المكونات الإضافية في المرحلة 15. وهو يغطي دورة حياة المكون الإضافي الكاملة: التعريف، التثبيت، التنشيط، الترقية، مراقبة الصحة، تسجيل التنفيذ، اشتراكات الويب هوك، ومجموعة أدوات تطوير واجهة أمامية كاملة للاتصال بين المضيف والإطار.",
        whatIsTitle: "ما هو نظام المكونات الإضافية؟",
        whatIsIntro:
          "يوفر نظام المكونات الإضافية بنية ثنائية الفئات لتوسيع SCRIPE بقدرات إضافية. المكونات الإضافية من الفئة 1 هي وحدات موثوقة ومعتمدة تتكامل مباشرة في وقت تشغيل .NET عبر IPluginStartup. المكونات الإضافية من الفئة 2 هي تطبيقات طرف ثالث تتكامل عبر بوابة REST آمنة وتتصل بالمضيف باستخدام SDK يعتمد على postMessage.",
        featureTier1: "الفئة 1 — المكونات الإضافية المعتمدة",
        featureTier1Desc:
          "مكونات إضافية تعمل داخل العمليات مع وصول كامل لـ DI، وواجهة أمامية باتحاد الوحدات، وعقد IPluginStartup.",
        featureTier2: "الفئة 2 — المكونات الإضافية المعزولة",
        featureTier2Desc:
          "مكونات إضافية للطرف الثالث معزولة عبر بوابة REST مع تحديد معدل الطلبات، ورموز مصادقة محددة النطاق، ومخزن مفتاح-قيمة معزول.",
        featureSDK: "SDK للمكونات الإضافية",
        featureSDKDesc:
          "بروتوكول اتصال يعتمد على postMessage مع فئات جسر محددة للنسق، المصادقة، التنقل، والتنبيهات.",
        featureGateway: "بوابة واجهة برمجة التطبيقات (API Gateway)",
        featureGatewayDesc:
          "بوابة معتمدة لواجهة برمجة التطبيقات للمكونات مع تحديد معدل الطلبات لكل مستأجر، وتسجيل التنفيذ، وإدارة مفاتيح API.",
        featureLogs: "سجلات التنفيذ",
        featureLogsDesc:
          "سجل تنفيذ للإضافة فقط لكل تثبيت. يسجل نقطة النهاية، المدة، رمز الحالة، والنجاح/الفشل.",
        featureWebhooks: "أحداث الويب هوك",
        featureWebhooksDesc:
          "7 أحداث للمنصة (تم التثبيت، تم إلغاء التثبيت، تم التنشيط، تم إلغاء التنشيط، تمت الترقية، فشل الفحص الصحي، تم تجاوز حد المعدل).",
        tiersTitle: "مقارنة ثنائية الفئات",
        tiersIntro:
          "يفصل النموذج ثنائي الفئات بين المكونات الإضافية الداخلية الموثوقة ومكونات السوق التابعة لجهات خارجية مع حدود أمان واضحة.",
        thAspect: "الجانب",
        thTier1: "الفئة 1 (معتمدة)",
        thTier2: "الفئة 2 (سوق المكونات)",
        rowWho: "الجهة",
        rowWhoT1: "مكونات داخلية / معتمدة",
        rowWhoT2: "مكونات سوق جهات خارجية",
        rowRuntime: "وقت التشغيل",
        rowRuntimeT1: "داخل العمليات (وقت تشغيل .NET مشترك)",
        rowRuntimeT2: "بوابة REST معزولة",
        rowFrontend: "الواجهة الأمامية",
        rowFrontendT1: "اتحاد الوحدات (Module Federation) (React مشترك)",
        rowFrontendT2: "إطار iframe + SDK لـ postMessage",
        rowData: "الوصول للبيانات",
        rowDataT1: "وصول كامل لـ DI",
        rowDataT2: "مخزن مفتاح-قيمة معزول فقط",
        rowAuth: "المصادقة",
        rowAuthT1: "رمز JWT للمضيف",
        rowAuthT2: "رمز مكون إضافي محدد النطاق",
        rowQuota: "الحصة",
        rowQuotaT1: "بلا حدود (موثوقة)",
        rowQuotaT2: "60 مكالمة API في الدقيقة",
        architectureTitle: "بنية النظام",
        architectureIntro:
          "ينسق نظام المكونات الإضافية العمليات بدءًا من تسجيل الكتالوج مرورًا بإدارة دورة الحياة، ومراقبة الصحة، وتسجيل التنفيذ.",
        nodeCatalog: "كتالوج المكونات الإضافية",
        nodeCatalogDesc: "سجل لجميع تعريفات المكونات الإضافية المتاحة مع الفئة، الحالة، والبيان.",
        nodeInstall: "التثبيت",
        nodeInstallDesc: "سجل تثبيت محدد النطاق للمستأجر مع إعدادات JSON وحالة الصحة.",
        nodeTier1Host: "مضيف الفئة 1",
        nodeTier1HostDesc: "IPluginHost — يكتشف IPluginStartup وينشط داخل العمليات.",
        nodeTier2Gateway: "بوابة الفئة 2",
        nodeTier2GatewayDesc: "IPluginGateway — يوجه HTTP إلى BaseUrl للمكون الإضافي مع المصادقة.",
        nodeSandbox: "محدد المعدل",
        nodeSandboxDesc: "PluginSandbox — نافذة منزلقة لـ 60 طلب/دقيقة لكل مستأجر وتثبيت.",
        nodeLogs: "سجلات التنفيذ",
        nodeLogsDesc: "سجلات PluginExecutionLog للإضافة فقط لكل مكالمة بوابة.",
        connInstall: "تثبيت",
        connTier1: "الفئة 1",
        connTier2: "الفئة 2",
        connRate: "فحص المعدل",
        connLog: "تسجيل النتيجة",
        registrationTitle: "تسجيل المكون الإضافي ودورة الحياة",
        registrationIntro:
          "تتحكم دورة حياة المكون الإضافي في كيفية تسجيل التعريفات في الكتالوج العالمي، ونشرها لاكتشاف المشغل، وتثبيتها بواسطة المستأجرين، وترقيتها إلى إصدارات جديدة، أو إلغاء تثبيتها لتطهير البيانات.",
        nodeRegRegister: "تسجيل التعريف",
        nodeRegRegisterDesc:
          "يقوم المشغل بتسجيل التعريف في الكتالوج كمسودة. يتحقق من تفرد المفتاح وهيكل بيان JSON.",
        nodeRegPublish: "نشر التعريف",
        nodeRegPublishDesc: "يتم نشر التعريف، مما يجعله مرئيًا ومتاحًا للمستأجرين.",
        nodeRegVersion: "إطلاق الإصدار",
        nodeRegVersionDesc: "يتم إطلاق إصدارات جديدة وتحميلها إلى الكتالوج مع تفاصيل الإصدار.",
        nodeRegInstall: "تثبيت المستأجر",
        nodeRegInstallDesc:
          "يثبت المستأجر أحدث إصدار. يضبط الحالة إلى نشط، ويوصل إعدادات JSON الأولية، ويثير حدث PluginInstalledEvent.",
        nodeRegUpgrade: "الترقية / التراجع",
        nodeRegUpgradeDesc:
          "يقوم المشغل بترقية التثبيت إلى إصدار أحدث، أو يتراجع في حالة حدوث فشل في التوافق.",
        nodeRegUninstall: "إلغاء التثبيت / التطهير",
        nodeRegUninstallDesc:
          "يحذف سجل التثبيت حذفا ناعما، ويحدث الحالة إلى إلغاء التثبيت، ويطلق مهام التطهير لحذف سجلات قاعدة البيانات.",
        connRegDraft: "نشر",
        connRegPublish: "إطلاق الإصدار",
        connRegVersion: "تثبيت",
        connRegActive: "إدارة الحالة",
        connRegChange: "إزالة",
        backendTitle: "بنية الخلفية",
        backendIntro:
          "تتبع الخلفية تخطيط وحدة الهندسة النظيفة القياسي المكون من 3 مشاريع في SCRIPE: Plugins.Domain ← Plugins.Application ← Plugins.Infrastructure.",
        cqrsTitle: "أوامر واستعلامات CQRS",
        cqrsIntro:
          "تسجل وحدة المكونات الإضافية 15 معالج طلبات عبر AstraFlow.Mediator. جميع الأوامر تحتوي على التحقق من الصحة المقابل لها عبر FluentValidation.",
        cqrsType: "النوع",
        cqrsName: "المعالج",
        cqrsDesc: "الوصف",
        cqrsInstall: "تثبيت تعريف المكون الإضافي لمستأجر",
        cqrsUninstall: "إزالة تثبيت المكون الإضافي وتطهير البيانات",
        cqrsActivate: "ضبط حالة التثبيت إلى نشط",
        cqrsDeactivate: "ضبط حالة التثبيت إلى معطل",
        cqrsUpgrade: "الترقية إلى إصدار جديد للمكون الإضافي",
        cqrsSettings: "تحديث إعدادات JSON للتثبيت",
        cqrsRegister: "تسجيل تعريف مكون إضافي جديد في الكتالوج",
        cqrsSetData: "إدراج/تحديث إدخال مفتاح-قيمة في مخزن بيانات المكون الإضافي",
        cqrsGrant: "منح إذن لتثبيت المكون الإضافي",
        cqrsSubscribe: "الاشتراك في حدث ويب هوك للمنصة",
        cqrsCatalog: "قائمة بجميع المكونات الإضافية المنشورة في الكتالوج",
        cqrsInstalled: "قائمة بجميع التثبيتات لمستأجر",
        cqrsDetails: "الحصول على التفاصيل الكاملة لتعريف المكون الإضافي",
        cqrsGetData: "قراءة إدخالات مخزن البيانات لنطاق تسمية",
        cqrsLogs: "الحصول على سجلات التنفيذ المقسمة لصفحات لتثبيت معين",
        entitiesTitle: "كيانات النطاق",
        entitiesIntro:
          "يحدد نطاق المكونات الإضافية 8 كيانات. سجل PluginExecutionLog هو للإضافة فقط (Entity<Guid>)؛ وجميع الكيانات الأخرى هي AuditableEntity<Guid> مع دعم الحذف الناعم.",
        entityName: "الكيان",
        entityBase: "الفئة الأساسية",
        entityPurpose: "الغرض",
        entityDefPurpose: "إدخال كتالوج المكونات الإضافية — عالمي، وليس محدد النطاق للمستأجر",
        entityVerPurpose: "سجل تاريخ الإصدارات لكل تعريف مكون إضافي",
        entityInstPurpose: "سجل تثبيت لكل مستأجر مع إعدادات JSON",
        entityGrantPurpose: "سجل الموافقة على إذن ممنوح لمكون إضافي",
        entityDataPurpose: "صندوق حماية مفتاح-قيمة للفئة 2 (نطاق التسمية + المفتاح + القيمة JSON)",
        entityKeyPurpose: "مفتاح API مشفر بـ SHA-256 لمصادقة البوابة",
        entityWebhookPurpose: "اشتراك ويب هوك في أحداث المنصة",
        entityLogPurpose: "سجل استدعاء بوابة للإضافة فقط (لا حذف ناعم)",
        frontendTitle: "بنية الواجهة الأمامية",
        frontendIntro:
          "تتبع الواجهة الأمامية نمط MVVM الخاص بـ SCRIPE مع فصل صارم للطبقات. العروض هي واجهة مستخدم غبية؛ وتتعامل نماذج العروض مع جميع الحالات والتحولات عبر TanStack Query.",
        sdkTitle: "SDK للمكونات الإضافية",
        sdkIntro:
          "يعيش SDK للمكونات الإضافية في src/core/plugins/ ويوفر جميع البنية التحتية للاتصال بين المضيف والمكون الإضافي عبر postMessage للإطار في الفئة 2، واتحاد الوحدات (Module Federation) للفئة 1.",
        endpointsTitle: "نقاط نهاية API",
        endpointsIntro:
          "جميع نقاط نهاية المكونات الإضافية تقع تحت /api/v1/plugins/ للعمليات الإدارية وتحت /api/v1/plugin-api/v1/ لبوابة الفئة 2 المعزولة.",
        apiCatalog: "تصفح المكونات الإضافية المنشورة في الكتالوج",
        apiCatalogId: "الحصول على التفاصيل الكاملة لتعريف مكون إضافي معين",
        apiInstalled: "قائمة بجميع المكونات الإضافية المثبتة لمستأجر",
        apiInstall: "تثبيت مكون إضافي لمستأجر",
        apiUninstall: "إلغاء تثبيت مكون إضافي وتنشيط تطهير البيانات",
        apiActivate: "تنشيط تثبيت مكون إضافي معطل",
        apiDeactivate: "إلغاء تنشيط تثبيت مكون إضافي نشط",
        apiUpgrade: "ترقية تثبيت إلى إصدار جديد",
        apiSettings: "تحديث إعدادات JSON لتثبيت معين",
        apiLogs: "الحصول على سجلات التنفيذ المقسمة لصفحات (الصفحة + حجم الصفحة)",
        apiDefinitions: "تسجيل تعريف مكون إضافي جديد (مسؤول المنصة فقط)",
        apiContextTenant: "الحصول على ملف تعريف المستأجر والميزات الممكنة لسياق المكون الإضافي",
        apiWebhookSub: "اشتراك تثبيت في حدث ويب هوك للمنصة",
        apiWebhookUnsub: "إلغاء الاشتراك في حدث ويب هوك",
        apiTokenExchange: "تبادل مفتاح API للحصول على رمز وصول قصير الأجل ومحدد النطاق",
        apiDataGet: "قائمة بجميع إدخالات المفتاح والقيمة في نطاق تسمية مخزن البيانات",
        apiDataSet: "إدراج/تحديث قيمة في مخزن البيانات (الحد الأقصى 64 كيلوبايت)",
        apiDataDelete: "حذف إدخال مفتاح-قيمة من مخزن البيانات",
        webhooksTitle: "أحداث الويب هوك",
        webhooksIntro:
          "ينشر نظام المكونات الإضافية 7 أحداث ويب هوك يمكن للأنظمة الخارجية الاشتراك فيها عبر واجهة برمجة تطبيقات اشتراك الويب هوك.",
        webhookEvent: "الحدث",
        webhookTrigger: "المشغل",
        webhookDesc: "الوصف",
        whInstalled: "نجاح معالج InstallPluginCommand",
        whInstalledDesc: "يتم إطلاقه بعد تثبيت المكون الإضافي بنجاح لمستأجر",
        whUninstalled: "معالج UninstallPluginCommand + تطهير",
        whUninstalledDesc: "يتم إطلاقه بعد اكتمال إلغاء التثبيت وتطهير مخزن البيانات",
        whActivated: "نجاح أمر ActivatePlugin",
        whActivatedDesc: "يتم إطلاقه عندما تتغير حالة التثبيت إلى نشط",
        whDeactivated: "نجاح أمر DeactivatePlugin",
        whDeactivatedDesc: "يتم إطلاقه عندما تتغير حالة التثبيت إلى معطل",
        whUpgraded: "نجاح أمر UpgradePlugin",
        whUpgradedDesc: "يتم إطلاقه عندما يتم ترقية التثبيت إلى إصدار جديد",
        whHealthFailed: "مهمة PluginHealthCheckJob",
        whHealthFailedDesc: "يتم إطلاقه عندما يرجع الفحص الصحي نتيجة غير ناجحة لمكون نشط",
        whRateLimit: "فشل PluginSandbox.IsAllowed()",
        whRateLimitDesc: "يتم إطلاقه عندما يتجاوز مكون الفئة 2 حصته البالغة 60 طلبًا في الدقيقة",
        jobsTitle: "وظائف الخلفية",
        jobsIntro:
          "تدير ثلاث وظائف خلفية صحة المكون الإضافي، وتطهير البيانات، وتنظيف الكيانات المحذوفة ناعمًا.",
        jobId: "معرف الوظيفة",
        jobSchedule: "الجدول الزمني",
        jobDesc: "الوصف",
        jobSched1: "يوميًا الساعة 03:00",
        jobDesc1: "يحذف نهائيًا كيانات المكونات المحذوفة ناعمًا والأقدم من 30 يومًا",
        jobSched2: "كل 5 دقائق",
        jobDesc2: "يستدعي GET {baseUrl}/health لكل تثبيت نشط من الفئة 2",
        jobSched3: "يوميًا الساعة 02:00",
        jobDesc3: "يزيل إدخالات مخزن البيانات اليتيمة للمكونات الإضافية الملغاة التثبيت",
        permissionsTitle: "مرجع الأذونات",
        permissionsIntro:
          "جميع نقاط نهاية المكون الإضافي محمية بموجب ترخيص يعتمد على الأذونات. يتم بذر الأذونات عند بدء التشغيل بواسطة PluginsPermissionProvider.",
        permKey: "مفتاح الإذن",
        permGrants: "يمنح الوصول إلى",
        permCatalogView: "تصفح كتالوج المكونات الإضافية المنشورة",
        permCatalogInstall: "تثبيت المكونات الإضافية لمستأجر",
        permCatalogUninstall: "إلغاء تثبيت المكونات الإضافية من مستأجر",
        permInstalledView: "عرض قائمة المكونات الإضافية المثبتة",
        permInstalledManage: "التنشيط، إلغاء التنشيط، الترقية، تحديث الإعدادات",
        permLogs: "عرض سجلات التنفيذ لتثبيت معين",
        permDefCreate: "تسجيل تعريفات مكونات إضافية جديدة (مسؤول المنصة)",
        permPermManage: "منح وإلغاء أذونات المكون الإضافي",
        permWebhooks: "الاشتراك وإلغاء الاشتراك في أحداث الويب هوك",
        quickStartTitle: "دليل البداية السريعة",
        step1Title: "تشغيل هجرة قاعدة البيانات",
        step1Content: "أنشئ قاعدة بيانات وحدة المكونات الإضافية وطبق الهجرات باستخدام SCRIPE CLI.",
        step2Title: "تسجيل تعريف المكون الإضافي",
        step2Content:
          "سجل مكونك الإضافي في الكتالوج عن طريق استدعاء نقطة نهاية التعريفات كمسؤول فائق.",
        step3Title: "التثبيت للمستأجر",
        step3Content: "ثبت المكون الإضافي لمستأجر معين باستخدام نقطة نهاية التثبيت.",
        step4Title: "تنشيط التثبيت",
        step4Content: "نشط التثبيت لجعله متاحًا للمستخدمين.",
        step5Title: "افتح واجهة مستخدم المكون الإضافي",
        step5Content:
          "انتقل إلى /plugins/installed في الواجهة الأمامية. سترى المكون الإضافي مع شارة حالته الصحية، ويمكنك النقر فوق الإعدادات أو السجلات لطرق عرض التثبيت الفردية.",
        securityTitle: "الأمان",
        securityIntro:
          "يفرض نظام المكونات الإضافية حدود أمان متعددة لحماية المستأجرين من المكونات الإضافية الضارة أو التي تحتوي على أخطاء.",
        securityWarningTitle: "تعمل مكونات الفئة 1 داخل العمليات",
        securityWarningContent:
          "تتمتع مكونات الفئة 1 بوصول كامل إلى حاوية DI وقاعدة بيانات SCRIPE. قم بتثبيت المكونات الإضافية المعتمدة فقط من فريقك الخاص أو من مصادر تم تدقيتها بدقة. يقتصر إذن plugins_definition.create على المسؤولين الفائقين بشكل افتراضي.",
        secDoTitle: "افعل",
        secDontTitle: "لا تفعل",
        secDo1: "تحقق من event.origin في كل مستمع لرسائل iframe",
        secDo2: "استخدم إذن plugins_definition.create لتسجيل الكتالوج",
        secDo3: "خزن التكوينات الحساسة في SettingsJson (مشفرة في السكون)",
        secDo4: "راقب سجلات التنفيذ بحثًا عن أي ارتفاع غير عادي في زمن الانتقال",
        secDont1: "تسمح للتنقل داخل إطار iframe بالذهاب لمسارات خارجية (يسمح فقط بـ /)",
        secDont2: "تخزن مفاتيح API الخام في قاعدة البيانات (يتم تخزين KeyHash فقط)",
        secDont3: "تمنح إذن plugins_definition.create لأدوار غير المشرفين",
        secDont4: "تعطل محدد معدل الطلبات PluginSandbox في الإنتاج",
      },
      sdk: {
        title: "مرجع SDK للمكونات الإضافية",
        description:
          "مرجع كامل لـ SDK للاتصال بين المضيف والمكون الإضافي — PluginBridge، أنواع الرسائل، فئات الجسر، وأدلة تطوير الفئة 1 و2.",
        intro:
          "يوفر SDK للمكونات الإضافية جميع البنية التحتية للاتصال ثنائي الاتجاه بين تطبيق مضيف SCRIPE والواجهات الأمامية للمكون الإضافي. تتصل مكونات الفئة 2 عبر postMessage للإطار؛ وتستخدم مكونات الفئة 1 اتحاد الوحدات (Module Federation) مع React مشترك.",
        executionTitle: "دورة حياة التنفيذ المعزول",
        executionIntro:
          "تعزل دورة حياة التنفيذ المعزول كود الطرف الثالث. وهي تؤسس صندوق حماية إطار آمن، وبروتوكولات تبادل الرسائل، واسترجاع الرموز محددة النطاق، وتوجيه بوابة واجهة برمجة التطبيقات المقاسة، والتسجيل المضاف فقط.",
        nodeExecMount: "تحميل PluginFrame",
        nodeExecMountDesc:
          "المضيف يحمل إطار iframe. حذف allow-same-origin يعزل التخزين المحلي، الكوكيز، وسياق المستند.",
        nodeExecReady: "حدث READY",
        nodeExecReadyDesc:
          "الإطار يبث READY. يتحقق المضيف من أصل المرسل ويوصل قناة اتصال PluginBridge.",
        nodeExecToken: "تبادل الرموز",
        nodeExecTokenDesc:
          "الإطار يطلب رمز مصادقة. يرجع المضيف رمز JWT محدد النطاق وقصير الأجل مع admin=false ومطالبات إذن مخصصة.",
        nodeExecGateway: "وكيل البوابة",
        nodeExecGatewayDesc:
          "يطلب الإطار الخلفية عبر وكيل عكسي. يقوم بتصفية الترويسات العابرة ويفك تشفير معرفات التثبيت.",
        nodeExecSandbox: "حد معدل صندوق الحماية",
        nodeExecSandboxDesc:
          "يتحقق محدد معدل الطلبات المدعوم بريديس من القيود مقابل حصة Plugins.MaxApiCallsPerMinute للمستأجر.",
        nodeExecLog: "التدقيق والويب هوكس",
        nodeExecLogDesc:
          "يسجل سياق التنفيذ (الحالة، المدة) في قاعدة البيانات ويوزع الأحداث مثل plugin.rate_limit_exceeded.",
        connExecFrame: "تحميل",
        connExecReady: "مصافحة",
        connExecRequest: "استدعاء REST",
        connExecForward: "مقياس الحصة",
        connExecCheck: "تسجيل النتيجة",
        infoTitle: "يعيش SDK في src/core/plugins/",
        infoContent:
          "يعتبر SDK محايدًا لإطار العمل على مستوى بروتول الرسائل. يمكن بناء إطارات المكونات الإضافية للفئة 2 باستخدام أي إطار عمل (React, Vue, Svelte, vanilla JS) طالما أنها تطبق عقد postMessage.",
        protocolTitle: "بروتوكول الرسائل",
        protocolIntro:
          "يستخدم كل الاتصال بين المضيف والمكون الإضافي اتحادًا محددًا من الرسائل. يرسل المضيف HostToPluginMessage؛ ويرسل المكون الإضافي PluginToHostMessage.",
        bridgeTitle: "PluginBridge",
        bridgeIntro:
          "يعتبر PluginBridge هو قناة الاتصال منخفضة المستوى. يتحقق من event.origin في كل رسالة واردة لمنع الانتحال، ويوجه الرسائل إلى نافذة iframe الصحيحة.",
        frameTitle: "PluginFrame",
        frameIntro:
          "يعتبر PluginFrame هو مكون React الذي يعرض مكونًا إضافيًا من الفئة 2 في إطار iframe معزول. ينشئ تلقائيًا PluginBridge، ويتعامل مع رسائل READY/RESIZE/NAVIGATE_REQUEST/TOAST، ويعرض هيكلًا عظميًا أثناء التحميل.",
        bridgesTitle: "فئات الجسر",
        bridgesIntro:
          "تتعامل كل فئة جسر مع اهتمام محدد. قم بتحميلها بعد إنشاء PluginBridge وإلغاء تحميلها عند التطهير.",
        bridgeClass: "الفئة",
        bridgeRole: "المسؤولية",
        bridgeMsg: "الرسالة التي يتم التعامل معها",
        roleTheme: "دفع سمة المضيف (الوضع، اللكنة، الاتجاه) إلى إطار iframe",
        roleAuth: "تقديم رموز محددة النطاق عندما يطلبها الإطار",
        roleNav: "السماح للإطار ببدء التنقل من جانب المضيف",
        roleToast: "توجيه طلبات التنبيه من الإطار إلى نظام إشعارات المضيف",
        providerTitle: "PluginHostProvider",
        providerIntro:
          "يعتبر PluginHostProvider سياق React يربط جميع الجسور والمرحلات معًا. غلف صفحات المكون الإضافي به لتوفير createBridgeFor وsyncTheme وmountRelays للمكونات التابعة.",
        eventBusTitle: "PluginEventBus",
        eventBusIntro:
          "يسمح PluginEventBus داخل العمليات لأي جزء من التطبيق المضيف بالتفاعل مع أحداث دورة حياة المكون الإضافي دون اقتران مباشر. يتم تصدير مفرِّق فردي pluginEventBus للراحة.",
        tier1Title: "تتطوير المكونات الإضافية للفئة 1",
        tier1Intro:
          "تتكامل مكونات الفئة 1 على مستوى .NET عبر IPluginStartup وعلى مستوى الواجهة الأمامية عبر اتحاد الوحدات (Module Federation). وتشارك المكونات نسخة React الخاصة بالمضيف.",
        tab1Backend: "الخلفية (C#)",
        tab1Frontend: "الواجهة الأمامية (webpack)",
        tab1Host: "استخدام المضيف",
        tier2Title: "تطوير المكونات الإضافية للفئة 2",
        tier2Intro:
          "مكونات الفئة 2 هي تطبيقات ويب مستقلة تستضاف على عناوين URL الخاصة بها. يقوم المضيف بتضمينها في إطار iframe معزول. يجب أن يطبق المكون بروتوكول postMessage.",
        dataStoreTitle: "واجهة برمجة تطبيقات مخزن البيانات",
        dataStoreIntro:
          "تحصل مكونات الفئة 2 على مخزن مفتاح-قيمة معزول. تكون جميع المفاتيح محددة النطاق لمعرف التثبيت + نطاق التسمية. الحد الأقصى لحجم القيمة هو 64 كيلوبايت.",
        dataStoreWarningTitle: "ينطبق تحديد معدل الطلبات على استدعاءات مخزن البيانات",
        dataStoreWarningContent:
          "تمر عمليات القراءة والكتابة في مخزن البيانات عبر بوابة الفئة 2 وتحتسب ضمن حصة الـ 60 طلبًا/دقيقة لكل تثبيت.",
      },
    },

    crmLeads: {
      title: "إدارة العملاء المحتملين",
      description:
        "خط مبيعات التواصل المؤسسي — التقاط العملاء المحتملين وتأهيلهم وتعيينهم وتحويلهم إلى مستأجرين من لوحة التحكم.",
      intro:
        "وحدة إدارة العملاء المحتملين هي خط المبيعات المدمج في SCRIPE. تلتقط العملاء المحتملين الذين يقدمون نموذج التواصل مع المبيعات خلال معالج التسجيل، وتُثري كل عميل بذكاء الاكتشاف (نوع العمل، حجم الفريق، الأولويات، المستوى الموصى به)، وتوفر سير عمل CRM إداري كامل: قائمة، درج التفاصيل، انتقالات الحالة، التعيين، والتحويل الفوري إلى مستأجر.",
      ingestionTitle: "دورة حياة الاستيعاب وإلغاء التكرار",
      ingestionIntro:
        "عندما يقدم عميل محتمل نموذج تواصل عبر معالج التسجيل، يقوم النظام بإجراء عمليات التحقق وإلغاء التكرار قبل إنشاء سجل PlatformLead. ويشمل ذلك التحقق من تعارضات المجال الفرعي لمساحة العمل وتحديد تقديمات الزملاء للتسويق القائم على الحساب ABM وفرض حد أقصى يومي لتسجيل العملاء المحتملين.",
      whatIsTitle: "ما هي إدارة العملاء المحتملين؟",
      whatIsIntro:
        "يمثل العميل المحتمل مشترياً محتملاً أبدى اهتماماً بالمنصة. يحمل كل عميل معلومات الاتصال وسياق الاكتشاف من معالج التسجيل وحالة دورة حياة تتتبع التفاعل البيعي من أول اتصال حتى التحويل.",
      lifecycleTitle: "دورة حياة العميل المحتمل",
      lifecycleIntro:
        "تمر العملاء المحتملون عبر مجموعة محددة من الحالات. يتم تتبع انتقالات الحالة في جدول النشاط حتى يتمكن الفريق بأكمله من رؤية تاريخ كل فرصة.",
      discoveryTitle: "ذكاء الاكتشاف",
      discoveryIntro:
        "كل عميل محتمل تم التقاطه عبر نموذج التواصل مع المبيعات في معالج التسجيل يتم إثراؤه بخمسة حقول اكتشاف أجاب عنها المحتمل خلال استبيان التهيئة.",
      discoveryTip:
        "يتم حساب حقل المستوى الموصى به بواسطة محرك التوصيات في معالج التسجيل بناءً على إجابات المحتمل. يوفر نقطة بداية قائمة على البيانات لمحادثة المبيعات ويملأ مسبقاً اختيار المستوى في مربع حوار التحويل إلى مستأجر.",
      backendTitle: "معمارية الخلفية",
      backendIntro:
        "تتبع ميزة العملاء المحتملين تخطيط وحدة SCRIPE القياسي ذي 3 مشاريع. كيان PlatformLead يعيش في نطاق الاستحقاقات ويتم إدارته عبر مستودع مخصص وخط أنابيب CQRS للأوامر والاستعلامات.",
      entityTitle: "كيان العميل المحتمل",
      entityIntro:
        "PlatformLead يرث من AuditableEntity (CreatedBy، CreatedAt، UpdatedBy، UpdatedAt، IsDeleted، RowVersion). جميع المعرفات مشفرة بـ AES عند نقل API. صُمم الكيان لاحتواء بيانات دورة حياة CRM وذكاء الاكتشاف الذي تم جمعه خلال استبيان معالج التسجيل.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "يكشف LeadsController عن 9 نقاط نهاية تغطي دورة حياة العميل المحتمل الكاملة. جميع نقاط النهاية تتطلب مصادقة AdminOnly JWT. نقطة نهاية تقديم نموذج التواصل هي المسار العام الوحيد.",
      endpointsNote:
        "جميع معرفات الكيانات التي ترجعها API مشفرة بـ AES عبر IdEncryptionHelper. يجب على الواجهة الأمامية عدم إنشاء أو التلاعب بـ GUIDs الخام — استخدم دائماً السلاسل المشفرة التي ترجعها API.",
      convertTitle: "التحويل إلى مستأجر",
      convertIntro:
        "أمر ConvertLeadToTenant هو عملية ذرية تُنشئ مستأجراً حياً من عميل محتمل مؤهل. ينسق المعالج توفير المستأجر وتعيين الإصدار وتسجيل النشاط وتحديث الحالة في معاملة قاعدة بيانات واحدة.",
      emailsTitle: "إشعارات البريد الإلكتروني",
      emailsIntro:
        "عند تقديم نموذج التواصل مع المبيعات، يتم إرسال رسالتي بريد إلكتروني HTML ذات علامة تجارية بشكل غير متزامن (أرسل وانسَ عبر Task.Run) لتجنب تعطيل استجابة API.",
      emailsTip:
        "قم بتكوين Leads:SalesNotificationEmail في appsettings.json لتعيين البريد الوارد الذي يتلقى تنبيهات المبيعات. يتم إرسال رسائل البريد الإلكتروني بأسلوب أرسل وانسَ — فشل التسليم لا يفشل إنشاء العميل.",
      frontendTitle: "معمارية الواجهة الأمامية",
      frontendIntro:
        "تتبع وحدة العملاء المحتملين الأمامية نمط الوحدة الفرعية الصارم في SCRIPE: كيانات النطاق، طبقة البيانات (خدمة ← محول ← مستودع)، وطبقة العرض (نموذج عرض ← عرض ← مكونات). جميع مكالمات HTTP تمر عبر IApiService عبر حقن التبعية.",
      frontendEntityTitle: "كيان العميل المحتمل (الواجهة الأمامية)",
      frontendEntityIntro:
        "يغلف كيان النطاق PlatformLead بيانات DTO الخام مع getters محسوبة ومنطق العرض. يستخدم getter relativeTime الصنف Intl.RelativeTimeFormat للطوابع الزمنية النسبية الواعية باللغة.",
      permissionsTitle: "الأذونات",
      permissionsIntro:
        "يتم حماية العملاء المحتملين خلف خمسة أذونات دقيقة تتبع تنسيق أذونات SCRIPE القياسي. قم بتعيين إذن leads.convert فقط للمسؤولين الأقدم في المبيعات — فهو يُشغّل توفير المستأجر وهي عملية عالية التأثير.",
      permissionsTip:
        "فحوصات الأذونات في الواجهة الأمامية (usePermission، PermissionGate) هي للتجربة البصرية فقط. تُطبّق الخلفية دائماً فحص الإذن عبر خط أنابيب AuthorizationBehavior بغض النظر عما تُظهره واجهة المستخدم.",
      quickStartTitle: "دليل البداية السريعة",
      quickStartIntro:
        "يستغرق سير عمل CRM النموذجي من تقديم المحتمل إلى المستأجر الحي 5 خطوات. التحويل هو الخطوة الوحيدة التي تتطلب أذونات المسؤول الأقدم — يمكن إجراء جميع الانتقالات الأخرى بواسطة أي مسؤول لديه leads.update.",
    },
    subscriptions2: {
      title: "وحدة الاشتراكات",
      description:
        "كيان TenantSubscription، دورة حياة حالة الاشتراك (تجريبي ← نشط ← معلق ← منتهي)، نقاط API، وتكامل تقييد الميزات.",
      intro:
        "تربط الاشتراكات مستأجرًا بإصدار وتتتبع دورة حياته في الفواتير. يمكن للمستأجر الواحد الحصول على اشتراكات متزامنة متعددة (مثل الخطة الأساسية + الإضافات). تحدد حالة الاشتراك الوصول: فقط المستأجرون النشطون يمكنهم تسجيل الدخول واستخدام الميزات. يواجه المستأجرون التجريبيون والمعلقون والمنتهية اشتراكاتهم قيودًا مطبّقة بواسطة خط أنابيب AuthorizationBehavior.",
      entityTitle: "كيان TenantSubscription",
      lifecycleTitle: "دورة حياة حالة الاشتراك",
      statusEnumTitle: "مرجع مُعدِّدة SubscriptionStatus",
      endpointsTitle: "نقاط واجهة API",
      featureGatingTip:
        "لا يُفحص تقييد الميزات في نقاط الاشتراك نفسها. يُطبَّق بواسطة خط أنابيب FeatureCheckBehavior لأي أمر ينفذ IRequireFeature. يُشيع تغيير اشتراك المستأجر فورًا إلى سلسلة حل الميزات عبر SubscriptionChangedEvent دون الحاجة لاستدعاءات إضافية من طبقة API.",
    },
    editions2: {
      title: "وحدة الإصدارات",
      description:
        "كيان Edition، أنواع قيم الميزات (Boolean/Numeric/String)، سلسلة حل الميزات (TenantFeatureOverride ← EditionFeature ← DefaultValue)، وقواعد دمج الاشتراكات المتعددة.",
      intro:
        "الإصدار هو تعريف مستوى المنتج الذي يحدد ما يمكن للمستأجر فعله. يمكن لكل إصدار تعريف قيم لأي ميزة مسجلة. سلسلة الحل هرمية: تفوز التجاوزات على مستوى المستأجر دائمًا، ثم قيم الإصدار، ثم الافتراضي العام للميزة. عند امتلاك مستأجر اشتراكات نشطة متعددة، تُدمج القيم باستخدام قواعد خاصة بالنوع (OR للمنطقية، MAX للعددية، النص من الخطة الأساسية).",
      entityTitle: "كيان Edition",
      featureValueTypesTitle: "أنواع قيم الميزات",
      resolutionTitle: "سلسلة حل قيمة الميزة",
      resolutionContent:
        "تُنفّذ IFeatureChecker.IsEnabledAsync() سلسلة الحل بترتيب أولوية صارم. يُفحص TenantFeatureOverride أولًا — وهي تجاوزات مباشرة يقوم بها المسؤول تتجاوز الإصدار كليًا. إذا لم يوجد تجاوز، تُستخدم قيمة EditionFeature للإصدار. إذا لم يُعرّف الإصدار الحالي الميزة، تُستخدم Feature.DefaultValue كاحتياط. بالنسبة للمستأجرين متعددي الاشتراكات، تحدث خطوة الدمج قبل فحص التجاوز لكل ميزة.",
      addingFeaturesTitle: "إضافة ميزات إلى الإصدارات",
      mergeRulesTitle: "قواعد دمج الاشتراكات المتعددة",
      overrideTip:
        "TenantFeatureOverride هو مخرج الطوارئ للتفاوضات مع الشركات. استخدمه عندما يحتاج مستأجر معين إلى قيمة تختلف عن مستوى إصداره (مثل مستأجر Growth تفاوض على استدعاءات API غير محدودة). تستمر التجاوزات حتى تُحذف صراحةً — لا تُعاد تعيينها عند ترقية المستأجر أو تغيير اشتراكاته.",
    },
    auditLogs: {
      title: "وحدة سجلات التدقيق",
      description:
        "خط أنابيب AuditBehavior، كيان AuditLog، الاستمرارية المحمية من التلاعب، سجل تدقيق قابل للبحث، وسياسات الاحتفاظ.",
      intro:
        "يلتقط نظام تسجيل التدقيق في SCRIPE سجلًا محميًا من التلاعب لكل طفرة في المنصة. يعترض AuditBehavior في الموضع 6 من خط أنابيب AstraFlow كل أمر تلقائيًا، ويلتقط حمولة الطلب وهوية المستخدم وسياق المستأجر وعنوان IP الخاص بالعميل وبيانات HTTP الوصفية — ثم يُستمر في جدول AuditLog مخصص للإضافة فقط. لا تُحذف سجلات التدقيق بالحذف الناعم؛ تحتفظ بها بشكل دائم إلا إذا عمل مهمة تنظيف الاحتفاظ الصريحة.",
      architectureTitle: "بنية AuditBehavior",
      architectureContent:
        "يعمل AuditBehavior لكل أمر (وليس الاستعلامات) في الموضع 6 من خط الأنابيب، مباشرة قبل المعالج. يلتقط الطلب عبر تسلسل JSON ويُستمر إدخال AuditLog بشكل متزامن في نفس معاملة قاعدة البيانات مثل طفرة الكيان. هذا يضمن الذرية — يلتزم سجل التدقيق وتغيير الكيان معًا أو يتراجعان معًا.",
      entityTitle: "كيان AuditLog",
      entityContent:
        "كيان AuditLog للإضافة فقط. يرث من BaseEntity (وليس AuditableEntity) لتجنب دورات التدقيق التكرارية. تُخزَّن الحمولة كـ JSON متسلسل لإمكانية البحث في النص الكامل. يُحدّد CommandName اسم فئة أمر CQRS.",
      searchTitle: "البحث في سجلات التدقيق",
      searchContent:
        "يكشف AuditLogsController عن نقطة GET مع صفحات مع مرشحات لـ EntityId وCommandName وUserId وTenantId ونطاق التاريخ. تُفرز النتائج تنازليًا بـ CreatedAt. يستخدم الجدول فهرسًا مركبًا على (TenantId, CreatedAt) وفهرسًا جزئيًا على EntityId لأداء استعلام مثالي.",
      retentionTitle: "سياسة الاحتفاظ",
      retentionContent:
        "تعمل AuditLogCleanupJob قابلة للتهيئة يوميًا وتحذف إدخالات AuditLog الأقدم من فترة الاحتفاظ المهيأة بشكل دائم. فترة الاحتفاظ الافتراضية هي 90 يومًا لإصدارات الشركات القياسية. يمكن لإصدارات Enterprise تهيئة ما يصل إلى 7 سنوات. ستزيل طلبات مسح البيانات الخاصة بـ GDPR البيانات على مستوى الكيان لكن ستحتفظ بإدخالات سجل التدقيق مع إخفاء هوية بيانات الحمولة.",
      retentionWarning:
        "تنظيف سجل التدقيق هو حذف كامل — لا يوجد سلة مهملات لسجلات التدقيق. تأكد من أن فترة الاحتفاظ تتوافق مع متطلبات تنظيمية في نطاق ولايتك القضائية (مثل GDPR المادة 17، SOC 2) قبل تهيئة نافذة احتفاظ قصيرة.",
    },
    webhooks: {
      title: "وحدة Webhooks",
      description:
        "محرك webhook صادر مع تواقيع HMAC-SHA256، إعادة المحاولة التلقائية مع التراجع الأسي، تهيئة نقطة النهاية لكل مستأجر، وتصفية الأحداث.",
      intro:
        "يسمح نظام webhook في SCRIPE للتطبيقات الخارجية باستقبال إشعارات push في الوقت الحقيقي عند وقوع أحداث النظام. Webhooks للخارج فقط — يُرسل SCRIPE حمولات HTTP POST إلى عناوين نقطة النهاية المسجلة. يدعم المحرك تصفية الأحداث (لكل webhook، يختار أنواع الأحداث التي يستقبلها)، وتوقيع الطلبات HMAC-SHA256 للتحقق من الأصالة، وإعادة المحاولة التلقائية مع التراجع الأسي (حتى 5 محاولات على مدى 24 ساعة).",
      engineTitle: "بنية محرك Webhook",
      engineContent:
        "WebhookDispatcher هو INotificationHandler يشترك في جميع أحداث المجال التي تنفذ IWebhookTriggered. عند إطلاق حدث، يبحث المُرسّل عن جميع webhooks المستأجر النشطة المصفاة حسب نوع الحدث ويُرسل حمولات HTTP POST بشكل غير متزامن عبر background Task. تُضاف عمليات التسليم الفاشلة إلى WebhookDeliveryAttempts لجدولة إعادة المحاولة.",
      payloadTitle: "تنسيق حمولة Webhook",
      payloadContent:
        "تتبع جميع حمولات webhook غلافًا قياسيًا. يحتوي رأس X-Scripe-Signature على توقيع HMAC-SHA256 لجسم JSON الخام باستخدام المفتاح السري للـ webhook. تحقق دائمًا من هذا التوقيع على خادمك المُستقبِل قبل معالجة الحمولة.",
      retryTitle: "جدول إعادة المحاولة والتراجع",
      retryContent:
        "تُعاد محاولة عمليات تسليم webhook الفاشلة تلقائيًا بواسطة WebhookRetryJob (IAutoRegisteredJob يومي). يستخدم جدول إعادة المحاولة التراجع الأسي: 5 دقائق، 30 دقيقة، ساعتان، 8 ساعات، 24 ساعة. بعد 5 محاولات فاشلة، تُعلَّم عملية تسليم webhook بأنها Abandoned ونقطة نهاية webhook للمراجعة. إذا فشلت نقطة نهاية webhook باستمرار عبر 10 أحداث، يُعطَّل webhook تلقائيًا لمنع المكالمات المهدرة.",
      securityTitle: "الأمان: التحقق من التوقيع",
      securityContent:
        "أنشئ مفتاحًا سريًا فريدًا لكل نقطة نهاية webhook. على خادمك، احسب HMAC-SHA256 لجسم الطلب الخام باستخدام المفتاح السري وقارنه برأس X-Scripe-Signature. لا تتحقق أبدًا من التوقيعات باستخدام JSON معاد بناؤه — دائمًا استخدم البايتات الخام لجسم الطلب.",
      signatureWarning:
        "لا تتخطى أبدًا التحقق من التوقيع في الإنتاج. بدونه، يمكن لأي طرف يكتشف عنوان webhook URL الخاص بك إرسال حمولات مزيفة. دائمًا قارن التوقيعات باستخدام دالة مقارنة ثابتة الوقت (مثل CryptographicOperations.FixedTimeEquals) لمنع هجمات التوقيت.",
    },
    tenantPlans: {
      title: "خطط المستأجرين",
      description:
        "خطط الاشتراك التي تحددها الأعمال (المستوى الثاني) لعملائها من المستخدمين النهائيين. تدعم التسعير متعدد العملات، والإصدارات، وضمان امتيازات المشتركين الحاليين.",
      intro:
        "تشكّل خطط المستأجرين المستوى الثاني من بنية SCRIPE ذات النموذج B2B2C. بينما تُضبط الإصدارات (المستوى الأول) من قِبل مشغّل المنصة وتحكم ما يمكن للمستأجر فعله، تُعدّ خطط المستأجرين من قِبل المستأجر نفسه لتقديم خطط اشتراك لعملائه من المستخدمين النهائيين.",
      conceptTitle: "نموذج B2B2C",
      conceptIntro:
        "يُمكّن نموذج الاشتراك المزدوج في SCRIPE مشغّلي المنصة من تحقيق الدخل من المستأجرين (الأعمال) عبر الإصدارات، بينما يستطيع هؤلاء المستأجرون تحقيق الدخل من مستخدميهم النهائيين عبر خطط المستأجرين. كل مستوى معزول تمامًا — تقتصر تكوينات خطط المستأجر على TenantId الخاص به.",
      entityTitle: "كيان خطة المستأجر (TenantPlan)",
      entityIntro:
        "خطة المستأجر هي منتج الاشتراك الذي تديره الأعمال بنفسها. تحدد اسم الخطة، والتسعير، ودورات الفوترة، وإعداد الفترة التجريبية، وتعيينات الميزات لعملائها.",
      entityNote:
        "لا يُخزَّن التسعير مباشرةً على كيان TenantPlan. بدلاً من ذلك، يخزّن جدول TenantPlanPrice مصفوفات التسعير متعدد العملات × متعدد الدورات (صف واحد لكل مزيج من العملة ودورة الفوترة).",
      lifecycleTitle: "دورة حياة الخطة",
      lifecycleIntro:
        "تتبع الخطط دورة حياة من ثلاث حالات. الخطط في حالة المسودة غير مرئية للمشتركين ويمكن تعديلها بحرية. يؤدي نشر الخطة إلى زيادة CurrentVersion وإتاحتها للمشتركين الجدد. الأرشفة تمنع المشتركين الجدد مع الحفاظ على الموجودين.",
      versioningTitle: "الإصدارات وضمان امتيازات المشتركين",
      versioningIntro:
        "في كل مرة يُنشر فيها الخطة، تزداد CurrentVersion. يمكن تثبيت المشتركين الحاليين على TenantPlanVersionNumber الخاص باشتراكهم، مما يحافظ على ميزات الخطة التي اشتركوا فيها (الضمانات). المشتركون الذين لديهم TenantPlanVersionNumber = null يستخدمون دائمًا أحدث نسخة منشورة.",
      versioningTip:
        "استخدم الإصدارات عند إجراء تغييرات جذرية على ميزات الخطة. يبقى المشتركون الحاليون على نسختهم المثبتة؛ يحصل المشتركون الجدد على الأحدث. هذا يتيح تطوير الخطة بأمان دون انقطاع.",
      pricingTitle: "بنية التسعير",
      pricingIntro:
        "يُخزَّن التسعير في مصفوفة علائقية لدعم تكوينات متعددة العملات ومتعددة دورات الفوترة بشكل مستقل.",
      featureEntityTitle: "ميزات الخطة (TenantPlanFeature)",
      featureEntityIntro:
        "يمكن أن تحتوي كل خطة على سجلات TenantPlanFeature متعددة تربط الخطة بكتالوج ميزات المستأجر. الميزات هي أزواج مفتاح-قيمة حيث المفتاح هو المفتاح الثابت للميزة والقيمة هي تمثيل نصي.",
      contextTitle: "متطلب سياق المستأجر",
      contextIntro:
        "جميع عمليات TenantPlan محددة النطاق للمستأجر. يُحقن معرّف المستأجر الحالي من رمز JWT. يعمل مسؤولو النظام في وضع التعمق ضمن سياق المستأجر المستهدف.",
      contextWarning:
        "خطط المستأجرين معزولة تمامًا لكل مستأجر. لا يمكن للمستأجر عرض أو تعديل خطط مستأجر آخر. تفرض واجهة برمجة التطبيقات ذلك عبر وسيط ITenantContext.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro: "تتطلب جميع نقاط نهاية TenantPlan مصادقة JWT والأذونات المناسبة.",
      permissionsTitle: "الأذونات",
      permissionsIntro: "يتم التحكم في الوصول لإدارة خطط المستأجرين بواسطة أذونات RBAC التالية:",
      "ep.list": "الحصول على جميع الخطط للمستأجر الحالي (مقسّم إلى صفحات)",
      "ep.get": "الحصول على خطة واحدة بمعرّفها",
      "ep.create": "إنشاء مسودة خطة جديدة",
      "ep.update": "تحديث حقول الخطة أو دورة حياتها (نشر/أرشفة)",
      "ep.delete": "حذف ناعم للخطة",
    },
    invoices: {
      title: "الفواتير والفوترة",
      description:
        "دورة حياة كيان الفاتورة، وبنود السطور، ومعاملات الدفع، والفوترة متعددة العملات، وتكامل Stripe webhook الذي يقود إنشاء الفواتير الآلي.",
      intro:
        "نظام الفواتير هو العمود الفقري المالي لمحرك الفوترة في SCRIPE. يتم إنشاء الفواتير تلقائيًا بواسطة أحداث Stripe webhook أو يدويًا من قِبل مسؤولي المنصة. تحمل كل فاتورة رقمًا تسلسليًا مقروءًا (INV-YYYY-NNNNN)، ومحدودة بعملة اشتراك المستأجر.",
      invoiceEntityTitle: "كيان الفاتورة (Invoice)",
      invoiceEntityIntro:
        "تمثّل كل فاتورة رسوم دورة فوترة واحدة. ترتبط باشتراك المستأجر وتلتقط الصورة المالية الكاملة: المبلغ قبل وبعد الخصومات، والضريبة، والمجموع النهائي، ومراجع بوابة Stripe.",
      invoiceFieldsNote:
        "تطبيع سعر الصرف (المبالغ المكافئة بالدولار الأمريكي) موجود على TenantSubscription، وليس على Invoice. تخزّن الفاتورة المبالغ بالعملة المفوترة فقط.",
      lineItemTitle: "بنود السطور في الفاتورة",
      lineItemIntro:
        "لكل فاتورة سجل واحد أو أكثر من InvoiceLineItem يصف بدقة ما تم تحصيله. يُتيح ذلك إصدار فواتير مفصّلة وشفافة تعرض رسوم الاشتراك والإضافات والخصومات والضرائب بشكل منفصل.",
      transactionTitle: "معاملات الدفع",
      transactionIntro:
        "يسجّل PaymentTransaction كل محاولة دفع مقابل فاتورة. يمكن وجود معاملات متعددة لكل فاتورة. يستخدم حقل Gateway تعداد PaymentGatewayType (Stripe، PayPal، Paymob، Manual).",
      statusTitle: "دورة حياة حالة الفاتورة",
      statusIntro:
        "تتبع الفواتير تقدمًا خطيًا في الحالة. يمكن للمسؤولين إلغاء فاتورة معلّقة يدويًا. تقود أحداث Stripe webhook الانتقال من معلّقة إلى مدفوعة.",
      numberingTitle: "ترقيم الفواتير",
      numberingIntro:
        "تستخدم أرقام الفواتير IDENTITY/SERIAL/SEQUENCE الأصلي لقاعدة البيانات لإنشاء تسلسل ذري وخالٍ من الفجوات في ظل التزامن. يُنسَّق سلسلة InvoiceNumber كـ INV-YYYY-NNNNN من SequenceNumber.",
      dashboardTitle: "لوحة الإيرادات",
      dashboardIntro:
        "يوفر SCRIPE لوحة تحليلات إيرادات في الوقت الفعلي على /api/v1/billing/dashboard، تجمع بيانات الفواتير والاشتراكات في مؤشرات KPI.",
      metricsTitle: "مؤشرات KPI للوحة التحكم",
      metricsIntro: "تعرض اللوحة المؤشرات الرئيسية التالية:",
      metric1: "MRR (الإيرادات المتكررة الشهرية) — محوّلة إلى USD",
      metric2: "ARR (الإيرادات المتكررة السنوية) — محوّلة إلى USD",
      metric3: "إجمالي الاشتراكات النشطة (حسب النوع: Base، Trial، AddOn)",
      metric4: "الاشتراكات الجديدة في هذه الفترة",
      metric5: "معدل الخفض (%) — الإلغاءات / الاشتراكات النشطة في بداية الفترة",
      metric6: "تحويلات التجربة المجانية",
      metric7: "الإيرادات حسب مستوى الإصدار",
      metric8: "الإيرادات حسب العملة (قبل التطبيع إلى USD)",
      currencyTitle: "دعم متعدد العملات",
      currencyIntro:
        "يدعم SCRIPE جميع العملات المتوافقة مع Stripe. تعتمد معالجة العملة في استدعاءات Stripe API على دقة الكسر العشري للعملة.",
      exportTitle: "صيغ التصدير",
      exportIntro:
        "يمكن تصدير الفواتير وبيانات الاشتراكات عبر نقطة النهاية /api/v1/subscriptions/export:",
      exportCsv: "CSV — لاستيراد جداول البيانات والتسوية المالية",
      exportExcel: "Excel (.xlsx) — تقرير فاتورة منسّق",
      exportPdf: "PDF — مستندات فاتورة احترافية مع علامة تجارية المستأجر",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "نقاط نهاية الفواتير للقراءة فقط لمستخدمي المستأجر. يمكن لمسؤولي المنصة فقط إنشاء فواتير أو إلغاؤها يدويًا.",
      "ep.list": "الحصول على قائمة فواتير مقسّمة إلى صفحات للمستأجر الحالي",
      "ep.get": "الحصول على تفاصيل فاتورة بمعرّفها",
      "ep.pdf": "تنزيل النسخة PDF من الفاتورة",
      "ep.dashboard": "الحصول على مؤشرات KPI للوحة تحليلات الإيرادات",
      "ep.export": "تصدير الفواتير والاشتراكات إلى CSV/Excel",
    },
    identityAuthSessions: {
      title: "جلسات المصادقة وإدارة الرموز",
      description:
        "تعمق في كيانات الجلسة والمصادقة الستة: RefreshToken وOtpCode وQrLoginSession وWebAuthnChallenge وAdminPasskey وExternalLogin — بما في ذلك جميع الحقول والدلالات الأمنية وتدفق تسجيل الدخول عبر QR.",
      intro:
        "يدعم SCRIPE آليات مصادقة متزامنة متعددة. لكل آلية كيان مخصص في وحدة Identity. يدير RefreshToken نوافذ الجلسة المتجددة. يتعامل OtpCode مع الرموز ذات الاستخدام الواحد محدودة الوقت. يتيح QrLoginSession تسجيل الدخول عبر الأجهزة بمسح QR. يشغّل WebAuthnChallenge مراسم passkey بـ FIDO2. يخزن AdminPasskey بيانات اعتماد FIDO2 المسجلة. يربط ExternalLogin مزودي الهوية الخارجيين بحسابات Admin والمستخدم.",
      refreshTokenTitle: "كيان RefreshToken",
      refreshTokenIntro:
        "يخزن RefreshToken رمزًا مبهمًا طويل الأمد صادرًا مع رمز JWT. تُدار الرموز بالتناوب عند كل استخدام — يُلغى الرمز القديم مع مؤشر ReplacedByToken ويُصدر رمز جديد. تُتتبع جلسات الانتحال عبر ImpersonatorAdminId لتمكين تدفق StopImpersonation لاستعادة جلسة المسؤول الأصلية.",
      otpCodeTitle: "كيان OtpCode",
      otpCodeIntro:
        "OtpCode هو رمز ذو استخدام واحد متعدد الأشكال يخدم المستخدمين والمسؤولين معًا. تعيين Purpose يشير إلى enum (التحقق من البريد الإلكتروني، إعادة تعيين كلمة المرور، 2FA، إلخ). تُلغى الرموز عبر Invalidate() بعد الاستخدام الناجح. يُنفذ الزوج Attempts/MaxAttempts الحماية من القوة الغاشمة.",
      otpCodeNote:
        "يُخزَّن OtpCode.Purpose كعدد صحيح لكفاءة قاعدة البيانات. الـ enum على مستوى التطبيق معرَّف في Identity.Application. تحقق دائمًا من IsUsed وExpiresAt قبل الوثوق برمز — لا تعتمد فقط على قيمة الرمز.",
      qrLoginTitle: "كيان QrLoginSession",
      qrLoginIntro:
        "ينسق QrLoginSession تسجيل الدخول عبر الأجهزة: ينشئ متصفح سطح المكتب جلسة (الحالة = Pending) ويعرض رمز QR يحتوي على SessionToken. يمسح جهاز محمول مُصادق QR (Scanned)، يوافق المستخدم (Approved)، تُنشئ الخلفية الرموز، ويستلمها متصفح سطح المكتب الذي يستطلع (Consumed). تُنظف الجلسات بواسطة QrSessionCleanupJob بعد مهلة 5 دقائق.",
      qrLoginWarning:
        "رموز جلسة QR ذات استخدام واحد. بمجرد Consumed أو Rejected، لا يمكن إعادة استخدام الجلسة. يجب على متصفح سطح المكتب إنشاء جلسة جديدة. لا تخزن مؤقتًا أو تُعيد عرض رمز QR بعد أن تجاوزت جلسته Pending — لا تقدم أي قيمة أمنية وقد تُشوش المستخدمين.",
      webAuthnChallengeTitle: "كيان WebAuthnChallenge",
      webAuthnChallengeIntro:
        "WebAuthnChallenge هو nonce قصير العمر (5 دقائق) يُنشأ من طرف الخادم في بداية كل مراسم WebAuthn (تسجيل أو مصادقة). يُرسل التحدي إلى المتصفح، يوقعه المُصادق ويُتحقق منه عند العودة. IsUsed = true يمنع هجمات الإعادة. ربط Origin يمنع اختطاف المراسم عبر الأصول.",
      adminPasskeyTitle: "كيان AdminPasskey",
      adminPasskeyIntro:
        "يخزن AdminPasskey بيانات اعتماد FIDO2/WebAuthn مسجلة للمسؤول. يمكن لكل مسؤول امتلاك passkeys متعددة (Touch ID، YubiKey، Windows Hello، إلخ). تزداد SignatureCounter بالمُصادق عند كل استخدام — العداد المتراجع يشير إلى بيانات اعتماد مستنسخة. IsDiscoverable = true يتيح تسجيل الدخول بلا كلمة مرور حقيقية (لا حاجة لإدخال اسم المستخدم).",
      adminPasskeyNote:
        "يخزن حقل PublicKey المفتاح العام بترميز COSE (وليس شهادة PEM). لا تخلط بينه وبين شهادة TLS. المُصادقون ذوو Aaguid كلها أصفار يحافظون على الخصوصية — نموذج المُصادق لا يُكشف عمدًا.",
      externalLoginTitle: "كيان ExternalLogin",
      externalLoginIntro:
        "ينشئ ExternalLogin رابطًا متعدد الأشكال بين هوية خارجية (أي مزود OAuth/OIDC/SAML) وAdmin أو User. AdminId وUserId حصريان متبادلان — تسجيل الدخول الخارجي المرتبط بـ Admin لا يمكنه مصادقة User. IdentityProviderId فارغ لمزودي الشبكات الاجتماعية المدمجين ومُعيَّن لمزودي OIDC/SAML المخصصين لكل مستأجر.",
      externalLoginNote:
        "يُشكّل ProviderKey (المطالبة 'sub' في OIDC) مع ProviderName هوية خارجية فريدة عالميًا. لا تعتمد على حقل Email وحده للمطابقة — يمكن أن تتغير رسائل البريد الإلكتروني لدى المزودين الخارجيين. استخدم دائمًا ProviderName + ProviderKey كهوية مستقرة.",
    },
    identityMenuSystem: {
      title: "كيانات نظام القائمة",
      description:
        "توثيق على مستوى الكيان لنظام قائمة التنقل الديناميكي في SCRIPE: MenuItem وRoleMenuItem وMenuOverrideScope وTenantMenuOverride — بما في ذلك سلسلة أولوية حل القائمة الكاملة.",
      intro:
        "قائمة تنقل SCRIPE ديناميكية تمامًا ومدفوعة بالبيانات. تعرّف MenuItems شجرة التنقل العالمية، يزرعها IModuleMenuProvider عند بدء التشغيل. تتحكم RoleMenuItems في الرؤية لكل دور. تتيح TenantMenuOverrides تخصيص قائمة المستأجر والقائمة الشخصية دون تعديل البيانات الأساسية. تضمن سلسلة الحل (الأساسي ← فلتر الدور ← تجاوز المستأجر ← تجاوز المستخدم) فوز التجاوز ذي الأولوية الأعلى دائمًا.",
      menuItemTitle: "كيان MenuItem",
      menuItemIntro:
        "MenuItem هو عقدة التنقل الأساسية. تشكّل العناصر شجرة عبر ParentMenuItemId. يربط WorkspaceId كل عنصر بمساحة عمل Nexus ذات السكة المزدوجة التي ينتمي إليها. عناصر IsSystem يزرعها مزودو الوحدات وتُحدَّث عند بدء التشغيل — تُحدَّث أسماء العرض والمسارات، لكن الحقول الإدارية فقط (Order وTenantScopeJson) تُحفظ. العناصر غير النظامية قابلة للتحرير الكامل من قِبل المستخدم.",
      roleMenuItemTitle: "كيان RoleMenuItem",
      roleMenuItemIntro:
        "يوفر RoleMenuItem تحكمًا صريحًا في رؤية القائمة لكل دور. عندما IsVisible = true، يُعرض العنصر لذلك الدور. عندما false، يُخفى. إذا لم يوجد سجل RoleMenuItem للزوج دور/عنصر، يلجأ النظام إلى الوراثة التلقائية: يُعرض العنصر إذا كان الدور يمتلك إذن الموارد المقابل.",
      roleMenuItemNote:
        "سجلات RoleMenuItem قابلة للتدقيق — يلتقط AuditableEntityInterceptor من غيّر رؤية القائمة لأي دور. يوفر هذا مسار تدقيق كاملًا لتغييرات أذونات القائمة، مما يهم البيئات الخاضعة للامتثال.",
      menuOverrideScopeTitle: "تعداد MenuOverrideScope",
      menuOverrideScopeIntro:
        "MenuOverrideScope هو تعداد ذو قيمتين يتحكم في نطاق TenantMenuOverride. نطاق User شخصي (المسؤول الذي أنشأ التجاوز فقط يراه). نطاق Tenant يؤثر على جميع مسؤولي المستأجر. المسؤولون الخارقون بلا مستأجر يمكنهم استخدام نطاق User فقط — لتغيير القوائم للجميع يعدّلون MenuItem الأساسي مباشرةً.",
      menuOverrideScopeNote:
        "يحل النموذج المبسط ذو القيمتين (User/Tenant) محل نموذج سابق ذي 4 نطاقات. يجب على المسؤولين الخارقين الراغبين في تغيير القوائم عالميًا تحديث MenuItem الأساسي أو استخدام واجهة IModuleMenuProvider — وليس إنشاء تجاوزات بنطاق Tenant.",
      tenantMenuOverrideTitle: "كيان TenantMenuOverride",
      tenantMenuOverrideIntro:
        "يتيح TenantMenuOverride لكل مستأجر (أو مسؤول فردي) تخصيص أسماء عناصر القائمة والترتيب والأصل والرؤية دون تعديل MenuItem الأساسي. التجاوزات قابلة للإفراغ — حقل التجاوز الفارغ يعني 'ورث من الأساسي'. IsHidden = true يقمع العنصر تمامًا للنطاق بصرف النظر عن أذونات الدور.",
      resolutionFlowTitle: "سلسلة أولوية حل القائمة",
      resolutionFlowIntro:
        "عند بناء القائمة النهائية للطلب، يطبق SCRIPE التجاوزات بترتيب الأولوية. التجاوز ذو الأولوية الأعلى يفوز لكل سمة (الاسم والترتيب والرؤية).",
      resolutionNote:
        "تُطبَّق سلسلة الحل لكل سمة، وليس لكل عنصر. مثلًا، يمكن لتجاوز المستخدم تغيير اسم العرض فقط، بينما يغيّر تجاوز المستأجر الترتيب. يُطبَّق كلاهما بشكل مستقل — لا يشترط SCRIPE أن يكون التجاوز 'كاملًا' ليكون فعالًا.",
    },
    identityTenantConfig: {
      title: "كيانات تهيئة المستأجر",
      description:
        "تعمق في TenantDomain (إدارة النطاق المخصص بالتحقق عبر DNS) وTenantPermission (منح الأذونات لكل مستأجر) وSystemSettings (الإعدادات الافتراضية الفردية للمنصة) وSettingsAuditLog (سجل التغييرات للإضافة فقط).",
      intro:
        "تحكم كيانات تهيئة المستأجر كيفية عزل كل مستأجر وتمييزه بالعلامة التجارية ومنح أذوناته على المنصة. يدير TenantDomain أسماء المضيف المخصصة بالتحقق عبر DNS بأسلوب Shopify. يتتبع TenantPermission أذونات المنصة التي يمكن لمسؤولي المستأجر ممارستها. SystemSettings كيان فردي يوفر الافتراضيات العامة للمنصة للعلامة التجارية والمظاهر والتخطيط. SettingsAuditLog سجل للإضافة فقط يلتقط كل حدث نشر إعدادات للتراجع والامتثال.",
      tenantDomainTitle: "كيان TenantDomain",
      tenantDomainIntro:
        "يمثل TenantDomain اسم مضيف مرتبطًا بمستأجر — إما نطاق فرعي تلقائي ({code}.scripe.org) أو نطاق مخصص يضيفه مسؤول المستأجر. تُنشأ النطاقات التلقائية عند إنشاء المستأجر وتكون دائمًا مُتحققًا منها ولا يمكن حذفها. تتطلب النطاقات المخصصة التحقق عبر سجل DNS TXT قبل التفعيل. يمكن أن يكون نطاق واحد فقط أساسيًا في كل مرة.",
      tenantDomainNote:
        "يستخدم التحقق من النطاق سجل DNS TXT: TXT _scr-verify.{domain} = 'scr_{token}'. VerificationToken هو قيمة عشوائية 128 بت تُنشأ عند تسجيل النطاق. يتم الاستطلاع عن التحقق أو تشغيله يدويًا — لا يحدث تلقائيًا. لا يمكن استخدام البادئات المحجوزة (www وapi وadmin وauth وlogin وما إلى ذلك) كنطاقات مخصصة.",
      tenantPermissionTitle: "كيان TenantPermission",
      tenantPermissionIntro:
        "TenantPermission هو كيان الربط الذي يمنح إذنًا محددًا لمستأجر محدد. عند إنشاء مستأجر، يمنح المسؤول المُنشئ مجموعة فرعية من أذوناته الخاصة للمستأجر الجديد. يمنع هذا تصعيد الامتيازات — لا يمكن لمسؤول المستأجر منح إذن لا يمتلكه هو نفسه.",
      tenantPermissionNote:
        "AssignedBy وAssignedAt مكررتان مع AuditableEntity.CreatedBy وCreatedAt لكن يُحتفظ بهما لتوافق الاستعلامات القائمة على الهجرة القديمة. يجب أن تفضّل الأكواد الجديدة حقول AuditableEntity.",
      systemSettingsTitle: "كيان SystemSettings",
      systemSettingsIntro:
        "SystemSettings هو كيان فردي (صف واحد في قاعدة البيانات) يعمل كطبقة الافتراضيات العامة للمنصة. يخزن تهيئة المظهر الافتراضية وكتالوج التخطيطات وسجل الفتحات وعلامة تجارية تسجيل الدخول/لوحة التحكم الافتراضية التي يرثها المستأجرون دون تخصيص خاص بهم. يتيح حقل SettingsVersion التزامن المتفائل — كل نشر يزيد الإصدار ويُسجَّل في SettingsAuditLog.",
      systemSettingsNote:
        "يُدار SystemSettings حصريًا من قِبل مسؤولي النظام. يمكن لمسؤولي المستأجر تخصيص TenantSettings الخاصة بهم لكن لا يمكنهم تعديل SystemSettings. يحمل DraftBrandingJson وDraftDashboardThemeJson مسودات Studio المحفوظة تلقائيًا — تُمسح عند النشر أو الإلغاء لضمان أن الإعدادات الحية دائمًا في LoginBrandingJson/DashboardThemeJson.",
      settingsAuditLogTitle: "كيان SettingsAuditLog",
      settingsAuditLogIntro:
        "SettingsAuditLog سجل للإضافة فقط يلتقط كل تغيير في الإعدادات — نشر أو تراجع أو تبديل الوضع الآمن أو إلغاء المسودة. يخزن كل إدخال لقطة كاملة قبل/بعد بتنسيق JSON لإمكانية التراجع. حقل VersionNumber متزايد تلقائيًا ويقابل SettingsVersion وقت التغيير.",
      settingsAuditLogWarning:
        "لا يمكن تعديل أو حذف إدخالات SettingsAuditLog من قِبل أي مسؤول عبر واجهة برمجة التطبيقات. تُطبَّق هذه الثبات في طبقة المستودع. يستخدم التراجع PreviousValueJson كمصدر للحقيقة — تحقق من أن VersionNumber يطابق هدف التراجع المقصود قبل تطبيقه.",
    },
    identityThemesWorkspace: {
      title: "كيانات المظاهر ومساحات العمل والتثبيت",
      description:
        "توثيق على مستوى الكيان لكيانات دورة حياة المظهر (LoginThemePurchase وTenantThemeFavorite وThemeApplyLog) ونظام مساحة عمل Nexus ذي السكة المزدوجة (Workspace وAdminWorkspacePin وDashboardPreset).",
      intro:
        "تُشغَّل الطبقة المرئية في SCRIPE بستة كيانات داعمة. يسجل LoginThemePurchase معاملات المظهر للسوق. يسمح TenantThemeFavorite للمسؤولين بإشارة المظاهر المفضلة. يوفر ThemeApplyLog مسار تحليلات للإضافة فقط لتطبيقات المظهر. يعرّف Workspace سياقات التنقل العليا في تخطيط Nexus ذي السكة المزدوجة. يخزن AdminWorkspacePin مساحات العمل المثبتة لكل مسؤول. يحمل DashboardPreset لقطات مظهر لوحة تحكم قابلة لإعادة الاستخدام.",
      loginThemePurchaseTitle: "كيان LoginThemePurchase",
      loginThemePurchaseIntro:
        "يسجل LoginThemePurchase اقتناء مظهر من قِبل مستأجر. في v1، يمنح مسؤولو النظام المشتريات يدويًا (TransactionRef = 'manual-grant'). في v2، تنشئ Stripe webhooks السجلات تلقائيًا (TransactionRef = معرف Stripe PaymentIntent). يُقفَّل PaidAmount وقت الشراء وهو غير متأثر بتغييرات الأسعار المستقبلية.",
      loginThemePurchaseNote:
        "يُعيَّن IsRefunded وRefundedAt من نظام الفوترة عند أحداث الاسترداد. الاسترداد لا يزيل المظهر تلقائيًا من المستأجر — إلغاء وصول المظهر عملية منفصلة تتولاها طبقة الاشتراك/الوصول.",
      tenantThemeFavoriteTitle: "كيان TenantThemeFavorite",
      tenantThemeFavoriteIntro:
        "TenantThemeFavorite كيان إشارة خفيف الوزن — يُعلّم مسؤول مظهرًا كمفضل في السوق. يستخدم Entity (وليس AuditableEntity) لأن عمليات المفضلة بيانات تفضيل مستخدم مؤقتة لا تحتاج مسار تدقيق كامل.",
      themeApplyLogTitle: "كيان ThemeApplyLog",
      themeApplyLogIntro:
        "ThemeApplyLog سجل تحليلات وتدقيق للإضافة فقط يُنشأ عند كل مرة يطبق فيها مسؤول مظهرًا على مسودة صفحة تسجيل دخول المستأجر. ThemeSlug غير مُعيَّن للكفاءة التحليلية. يُحدَّث WasPublished بشكل غير متزامن عند نشر المستأجر، مما يتيح تحليلات اعتماد المظهر مقابل تقييمه.",
      workspaceTitle: "كيان Workspace",
      workspaceIntro:
        "Workspace هو حاوية التنقل العليا في تخطيط Nexus ذي السكة المزدوجة في SCRIPE. تعرض السكة الأولية أيقونات مساحة العمل؛ النقر على إحداها يبدّل السكة الثانوية إلى شجرة قائمة مساحة العمل تلك. تُزرع مساحات العمل النظامية بواسطة IModuleMenuProvider عند بدء التشغيل (مزامنة ذكية بواسطة Key). حقل Key معرّف مستقر غير قابل للتغيير — تغييره يكسر جميع مراجع FK في MenuItem.",
      adminWorkspacePinTitle: "كيان AdminWorkspacePin",
      adminWorkspacePinIntro:
        "يخزن AdminWorkspacePin مساحات العمل المثبتة للمسؤول في السكة الأولية. الدبابيس محددة النطاق بالسياق: دبابيس المستوى الأساسي (TenantId = null) تظهر عندما لا يختار المسؤول مستأجرًا؛ الدبابيس على مستوى المستأجر (TenantId = GUID) تظهر عند تفعيل ذلك المستأجر. هذا الكيان لا يستخدم الحذف الناعم عمدًا — إلغاء التثبيت يحذف الصف نهائيًا (الدبابيس بيانات تفضيلات مؤقتة وليست بيانات أعمال).",
      adminWorkspacePinNote:
        "يستخدم AdminWorkspacePin طريقة مصنع (AdminWorkspacePin.Create) وضابطات خاصة لفرض الثوابت. يعمل التثبيت التلقائي الأولي عبر BootstrapAdminPinsCommand عند أول جلب لمساحات العمل.",
      dashboardPresetTitle: "كيان DashboardPreset",
      dashboardPresetIntro:
        "يخزن DashboardPreset لقطة DashboardThemeJson كاملة يمكن تطبيقها على لوحة تحكم أي مستأجر. الإعدادات المسبقة النظامية (IsSystem = true) مُزرعة ومتاحة لجميع المستأجرين؛ الإعدادات المسبقة التي ينشئها المسؤولون محددة النطاق بالمستأجر. تطبيق إعداد مسبق يستبدل DashboardThemeJson للمستأجر بالكامل — هذا تطبيق قائم على اللقطات لا على التصحيح.",
    },
    identityAccessControlDeep: {
      title: "التعمق في التحكم بالوصول",
      description:
        "توثيق على مستوى الكيان لـ AdminRole (تقاطع تعيين الأدوار مع نطاق المستأجر وانتهاء الصلاحية) وAdminUserGroup (عضوية المجموعة) وUserGroupRestriction (قيود الحقول التراكمية لأعضاء المجموعة).",
      intro:
        "يُبنى نظام التحكم بالوصول في SCRIPE على ثلاثة كيانات تقاطع/قيود. يربط AdminRole مسؤولًا بدور، اختياريًا محدد النطاق بمستأجر معين مع تاريخ انتهاء اختياري. يربط AdminUserGroup مسؤولًا بمجموعة مستخدمين، منحًا جميع الأدوار التي ترثها المجموعة. يعرّف UserGroupRestriction قيودًا على مستوى الحقول تُطبَّق بشكل تراكمي (UNION) على استجابات API لجميع أعضاء المجموعة.",
      adminRoleTitle: "كيان AdminRole",
      adminRoleIntro:
        "AdminRole هو كيان التقاطع بين Admin وRole. يمكّن نطاق TenantId مسؤولًا واحدًا من امتلاك أدوار مختلفة عبر مستأجرين مختلفين. InheritToChildren يتتالى الدور لجميع المستأجرين الفرعيين في التسلسل الهرمي. ExpiresAt يتيح منح الدور محدود الوقت للمقاولين أو الوصول المؤقت.",
      adminRoleNote:
        "سجلات AdminRole منتهية الصلاحية (ExpiresAt < UtcNow) تُعامَل كغير نشطة بواسطة خط أنابيب AuthorizationBehavior دون الحاجة للحذف. مهمة يومية تزيل السجلات منتهية الصلاحية بعد فترة سماح. يُحتفظ بـ AssignedBy جنبًا إلى جنب مع AuditableEntity.CreatedBy للتتبع الصريح في تقارير تدقيق الأذونات.",
      adminUserGroupTitle: "كيان AdminUserGroup",
      adminUserGroupIntro:
        "AdminUserGroup هو تقاطع العضوية بين Admin وUserGroup. يرث المسؤول جميع الأدوار المعينة لمجموعة عبر سجلات RolePermission. تبسّط المجموعات إدارة الأدوار الجماعية — بدلًا من تعيين الأدوار بشكل فردي، عيّنها لمجموعة وأضف المسؤولين إليها. AdminUserGroup قابل للتدقيق عبر AuditableEntity.",
      adminUserGroupNote:
        "وراثة الدور عبر المجموعات تراكمية: الأذونات الفعلية للمسؤول هي UNION لتعيينات AdminRole المباشرة وجميع الأدوار الموروثة عبر كل مجموعة ينتمي إليها. إزالة مسؤول من مجموعة تلغي فورًا الأذونات الموروثة من المجموعة.",
      userGroupRestrictionTitle: "كيان UserGroupRestriction",
      userGroupRestrictionIntro:
        "يعرّف UserGroupRestriction قيودًا على بيانات مستوى الحقول لمجموعة مستخدمين. عندما ينتمي مسؤول لمجموعة بقيود، تُلغى الحقول المدرجة في استجابات API لذلك المورد. القيود تراكمية — قيود المجموعة UNION مع قيود مستوى الدور، لا تتجاوزها أو تقللها. هذا يعني الانتماء لمزيد من المجموعات يمكن فقط زيادة القيود وليس تقليلها.",
      userGroupRestrictionWarning:
        "تُطبَّق قيود الحقول من جانب الخادم في سلوك خط أنابيب FieldProjection — هي ليست ميزة واجهة مستخدم من جانب العميل. ومع ذلك، القيود تُلغي فقط قيم الحقول في الاستجابات؛ لا تمنع عمليات الإنشاء/التحديث على تلك الحقول. استخدم أذونات الدور للتحكم في وصول الكتابة، وUserGroupRestriction للتحكم في رؤية القراءة.",
      restrictionFlowTitle: "تدفق تقييم القيود",
      restrictionFlowIntro:
        "عندما يُقدم مسؤول طلب API لمورد مقيَّد، يُقيّم SCRIPE جميع القيود المعمول بها ويطبقها كـ UNION على حمولة الاستجابة.",
      restrictionFlowNote:
        "تقييم القيود كسول — يعمل عند كل طلب، وليس عند تسجيل الدخول. هذا يعني إضافة قيود لمجموعة تسري فورًا في استدعاء API التالي دون الحاجة لتحديث الجلسة. تضمن استراتيجية دمج UNION أن القيود تتراكم فقط — المسؤول الذي ينتمي لمجموعتين بقيود متداخلة يرى كلا مجموعتي القيود مطبَّقتين.",
    },
    userSubscriptions: {
      title: "اشتراكات المستخدمين",
      description:
        "إدارة اشتراكات المستخدمين النهائيين للمستوى الثاني من نموذج B2B2C. يشترك المستخدمون في خطط المستأجرين. يدعم الإصدارات والعروض الترويجية وفترات التجربة ومسار تدقيق غير قابل للتغيير عبر الإلغاء والاستبدال.",
      intro:
        "تربط سجلات UserSubscription مستخدمًا نهائيًا بـ TenantPlan. هذا هو المستوى الثاني من نموذج B2B2C في SCRIPE. اشتراكات المستخدمين غير قابلة للتغيير بعد الإنشاء: لا يوجد إجراء 'تعديل'. لتغيير خطة، يلغي المسؤول الاشتراك الحالي وينشئ اشتراكًا جديدًا (تدفق الإلغاء والاستبدال).",
      entityTitle: "كيان اشتراك المستخدم (UserSubscription)",
      entityIntro:
        "يمثل كل UserSubscription اشتراكًا حاليًا أو تاريخيًا لمستخدم في TenantPlan. UserId هو Guid عادي (لا خاصية تنقل) للحفاظ على عزل حدود الوحدة — لا تستورد Entitlements كيانات Identity مباشرةً.",
      statusTitle: "دورة حياة الحالة",
      statusIntro:
        "تتبع حالات UserSubscription رحلة دفع المستخدم وتجربته. نمط الإلغاء والاستبدال يعني أن الاشتراكات الملغاة نهائية — يُنشأ دائمًا سجل اشتراك جديد لتغييرات الخطة.",
      featureCheckerTitle: "UserFeatureCheckerService",
      featureCheckerIntro:
        "يحلّ UserFeatureCheckerService الميزات التي يمكن للمستخدم الوصول إليها بناءً على UserSubscription النشط وسجلات TenantPlanFeature المرتبطة. يعيد قاموس مفتاح-قيمة من قيم الميزات.",
      reconciliationTitle: "مهمة تسوية الاشتراكات",
      reconciliationIntro:
        "تعمل مهمة IAutoRegisteredJob يومية (UserSubscriptionReconciliationJob) لنقل الاشتراكات التي انتهت صلاحيتها ExpiresAt إلى حالة Expired. كما تتعامل مع الترقيات التلقائية من التجربة إلى الاشتراك المدفوع للمشتركين الذين لديهم IsAutoRenew = true.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "تدعم نقاط نهاية اشتراكات المستخدمين عمليات المسؤول (إنشاء، إلغاء) والاستعلامات الخاصة بالمستخدم.",
      permissionsTitle: "الأذونات",
      permissionsIntro:
        "يتم التحكم في الوصول لإدارة اشتراكات المستخدمين بواسطة أذونات RBAC التالية:",
      "ep.list": "الحصول على جميع اشتراكات المستخدمين للمستأجر (مقسّم إلى صفحات)",
      "ep.get": "الحصول على تفاصيل اشتراك مستخدم محدد",
      "ep.create": "تعيين خطة اشتراك لمستخدم",
      "ep.cancel": "إلغاء اشتراك مستخدم نشط",
      "ep.mySubscription": "الحصول على اشتراك المستخدم الحالي المُصادق عليه",
      "ep.myFeatures": "الحصول على قاموس وصول ميزات المستخدم الحالي",
    },
    stripeConnect: {
      title: "Stripe Connect",
      description:
        "تقسيم مدفوعات السوق عبر Stripe Connect Express — حسابات المستأجرين، سلسلة حل معدل العمولة، إدخالات دفتر الأستاذ، فوترة العمولات، استرداد الترقيات، والتنبيهات التشغيلية.",
      intro:
        "يتيح Stripe Connect نموذج تقسيم مدفوعات السوق في SCRIPE. عندما يعالج مستأجر مدفوعة مستخدم، تقوم المنصة تلقائياً بخصم عمولة عبر application_fee_amount من Stripe وتوجيه الصافي إلى حساب Stripe Express الخاص بالمستأجر.",
      whatIsTitle: "ما هو Stripe Connect؟",
      whatIsIntro:
        "Stripe Connect هو بنية تحتية للمدفوعات متعددة الأطراف من Stripe. في SCRIPE، يدعم سوق B2B2C: يبيع المستأجرون الخطط لمستخدميهم، ويوجه Stripe المدفوعات، ويخصم محرك عمولات SCRIPE رسوم المنصة تلقائياً.",
      architectureTitle: "بنية تقسيم المدفوعات",
      architectureIntro:
        "كل مدفوعة مستخدم تتدفق عبر Stripe، الذي يقسمها فوراً بين المستأجر والمنصة بناءً على معدل العمولة المحدد.",
      accountEntityTitle: "كيان TenantStripeAccount",
      accountEntityIntro:
        "يوجد صف TenantStripeAccount واحد لكل مستأجر. يتتبع معرف حساب Stripe، دورة حياة الإعداد، إمكانية الرسوم/المدفوعات، تجاوز معدل العمولة، وإحصائيات المدفوعات التراكمية.",
      onboardingTitle: "دورة حياة حالة الإعداد",
      onboardingIntro:
        "تمر حسابات المستأجرين بعملية التحقق من الهوية KYC المُدارة من Stripe قبل أن تتمكن من قبول الرسوم أو استلام المدفوعات.",
      commissionTitle: "سلسلة حل معدل العمولة",
      commissionIntro:
        "يتم حل معدل العمولة الفعلي من الأكثر تحديداً إلى الأكثر عمومية. تفوز أول قيمة غير فارغة في السلسلة.",
      commChain1: "تجاوز لكل مستأجر — يحدده مسؤول المنصة في لوحة إدارة Stripe Connect.",
      commChain2: "معدل لكل إصدار — مكوَّن على كيان Edition عبر حقل ConnectCommissionRate.",
      commChain3:
        "إعداد افتراضي على مستوى المنصة — مخزن في صف النمط الفردي ConnectPlatformSettings.",
      commChain4: "احتياطي مُشفر — 10% — يُستخدم فقط إذا كان صف النمط الفردي مفقوداً.",
      settingsTitle: "ConnectPlatformSettings (نمط فردي)",
      settingsIntro:
        "يخزن صف واحد (المعرف: 00000001-0000-0000-0000-000000000001) الإعدادات الافتراضية للمنصة. الوصول دائماً عبر ConnectPlatformSettings.SingletonId.",
      settingsSingletonNote:
        "يستخدم ConnectPlatformSettings نمط النمط الفردي: يوجد دائماً صف واحد بالضبط، يُعرَّف بثابت SingletonId المعروف. تعرض واجهة المسؤول هذا كنموذج إعدادات قابل للتعديل.",
      ledgerTitle: "دفتر الأستاذ والفوترة",
      ledgerIntro:
        "ثلاثة كيانات تشكل نظام محاسبة العمولات. لمدفوعات Stripe Connect، يتم تحصيل العمولات فوراً. للبوابات غير Connect، يتم تتبعها في CommissionLedgerEntry وفوترتها شهرياً أو عند الحد.",
      invoiceTriggerTitle: "مشغلات فاتورة العمولة",
      invoiceTriggerIntro:
        "يتم إنشاء صفوف CommissionInvoice بواحد من ثلاثة مشغلات، قابلة للتكوين في ConnectPlatformSettings.",
      promoTitle: "استرداد الترقيات (تطبيق FirstTimeOnly)",
      promoIntro:
        "يسجل PromotionRedemption كل استخدام لرمز ترقية عند تفعيل التسجيل. لأن SCRIPE ينشئ Stripe Customer جديد لكل تسجيل، تخزن SCRIPE تجزئة SHA-256 لبريد المشترك الإلكتروني لتطبيق ترقيات FirstTimeOnly محلياً.",
      promoNote:
        "يتم الحذف الصارم لصفوف PromotionRedemption بعد 12 شهراً. لا تُخزن عناوين البريد الإلكتروني الخام — فقط تجزئة SHA-256 بالتنسيق السداسي العشري.",
      alertsTitle: "التنبيهات التشغيلية",
      alertsIntro:
        "OperationalAlert هو جدول للرسائل الميتة للأحداث التي تتطلب مراجعة بشرية. كل تنبيه يطلق أيضاً بريداً إلكترونياً للعمليات عبر صندوق الصادر.",
      configTitle: "التكوين",
      configIntro:
        "يتطلب Stripe Connect مفتاحَي سر للـ webhook: مفتاح webhook القياسي لأحداث اشتراك SaaS، ومفتاح Connect webhook لأحداث مستوى الحساب.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "نقاط نهاية إدارة Connect مقيدة بأدوار المسؤول الفائق. روابط الإعداد الموجهة للمستأجر تتولد لكل مستأجر وتكون للاستخدام مرة واحدة.",
      "ep.create": "تسجيل حساب Stripe Connect Express جديد لمستأجر",
      "ep.get": "الحصول على حالة حساب Stripe وتفاصيل الإعداد لمستأجر",
      "ep.onboardingLink": "إنشاء رابط إعداد Stripe Connect أحادي الاستخدام لمستأجر",
      "ep.ledger": "عرض إدخالات دفتر أستاذ العمولة (قابل للتصفية حسب المستأجر والحالة والبوابة)",
      "ep.invoices": "عرض فواتير العمولة (قابل للتصفية حسب المستأجر والحالة والمشغل)",
      "ep.invoiceGenerate": "تشغيل إنشاء فاتورة عمولة يدوياً لمستأجر",
      "ep.settings": "الحصول على النمط الفردي ConnectPlatformSettings",
      "ep.settingsUpdate":
        "تحديث الإعدادات الافتراضية للمنصة (معدل العمولة، تأخير المدفوعات، الحد)",
      "ep.alerts": "عرض جميع التنبيهات التشغيلية (قابل للتصفية حسب النوع والحالة والخطورة)",
      "ep.alertResolve": "الإقرار بتنبيه تشغيلي أو حله مع ملاحظة حل",
    },
    signupCustomization: {
      title: "تخصيص التسجيل",
      description:
        "محرك الذكاء لتسجيل الخدمة الذاتية — أسئلة إعداد قابلة للتكوين مع منطق التفريع وشروط الرؤية على مستوى الخيار وقواعد توصية تعريفية تربط إجابات المستخدمين بالإصدار المناسب.",
      intro:
        "نظام تخصيص التسجيل هو محرك الذكاء في SCRIPE لتدفق التسجيل الذاتي. يحدد مسؤولو المنصة شجرة أسئلة، يحمل كل خيار إجابة وزن إشارة، وتربط قواعد التوصية التعريفية أنماط الإجابات بإصدارات محددة.",
      whatIsTitle: "ما هو محرك الذكاء؟",
      whatIsIntro:
        "محرك الذكاء هو نظام التوصية الذي يدعم التسجيل الذاتي في SCRIPE. بدلاً من عرض جدول تسعير ثابت، يجيب المستخدمون على استبيان قصير للإعداد، ويطابق المحرك إجاباتهم مع قواعد التوصية ويقدم توصية إصدار مخصصة.",
      flowTitle: "نظرة عامة على تدفق التسجيل",
      flowIntro: "تدفق التسجيل الكامل من اختيار الفئة حتى التوصية.",
      questionTitle: "كيان OnboardingQuestion",
      questionIntro:
        "يمثل كل OnboardingQuestion خطوة واحدة في تدفق الإعداد. يمكن أن تكون الأسئلة عالمية أو مقيدة بـ EditionCategory. يدعم التفريع على مستوى السؤال عبر DependsOnQuestionKey + DependsOnAnswerValue.",
      optionTitle: "كيان OnboardingAnswerOption",
      optionIntro:
        "كل OnboardingAnswerOption هو خيار إجابة قابل للاختيار للسؤال. تحمل الخيارات إشارات تسجيل نقاط (SignalWeight) لمحرك التوصية وتعزيزات صلة اختيارية (RelevanceBoost).",
      conditionTitle: "شروط رؤية على مستوى الخيار",
      conditionIntro:
        "تتيح OnboardingAnswerOptionCondition التحكم الدقيق في رؤية الخيارات الفردية من جانب العميل بناءً على إجابات سابقة.",
      conditionNote:
        "يتم تقييم الشروط من جانب العميل فقط. يخزن MatchValuesRaw المجموعة كسلسلة مفصولة بفاصلة لإمكانية نقل قاعدة البيانات عبر SQL Server وOracle وPostgreSQL.",
      sessionAnswerTitle: "كيان SignupSessionAnswer",
      sessionAnswerIntro:
        "يحتفظ SignupSessionAnswer بإجابة كل مستخدم أثناء تسجيل جاري. يستخدم SignupSessionRef (سلسلة نصية عادية) بدلاً من FK إلى كيان SignupSession لتجنب اقتران المودلات.",
      sessionAnswerTip:
        "يتيح SignupSessionAnswer استئناف الجلسة: إذا أغلق المستخدم المتصفح في منتصف التدفق، يمكن إعادة تحميل إجاباته عند العودة عبر SignupSessionRef.",
      ruleTitle: "كيان RecommendationRule",
      ruleIntro:
        "قواعد التوصية هي محرك المطابقة التعريفي. تحدد كل قاعدة محمول ConditionJson وإصداراً مستهدفاً وScoreBonus. تتراكم القواعد النقاط لكل إصدار مرشح — الإصدار الأعلى نقاطاً يفوز.",
      scoringTitle: "خوارزمية التسجيل",
      scoringIntro:
        "يقيّم محرك التوصية جميع القواعد النشطة، يجمع النقاط، ويعيد الإصدار الأعلى نقاطاً مع السبب من أعلى قاعدة مطابقة أولوية.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "نقاط نهاية إدارة الأسئلة/القواعد تتطلب إذن entitlements.manage. نقاط نهاية التدفق والإجابات عامة — لا يلزم المصادقة أثناء التسجيل.",
      "ep.questions": "عرض جميع أسئلة الإعداد مع خياراتها وشروطها",
      "ep.createQuestion": "إنشاء سؤال إعداد جديد مع خيارات الإجابات",
      "ep.updateQuestion": "تحديث سؤال موجود (التسمية، التلميح، ترتيب الفرز، التفريع)",
      "ep.deleteQuestion": "حذف سؤال إعداد غير نظامي",
      "ep.flow": "الحصول على تدفق الإعداد الكامل لفئة محددة (عام — يُستخدم أثناء التسجيل)",
      "ep.submitAnswers": "إرسال إجابات لخطوة جلسة تسجيل (عام)",
      "ep.recommend": "الحصول على توصية الإصدار بناءً على الإجابات المقدمة (عام)",
      "ep.rules": "عرض جميع قواعد التوصية",
      "ep.createRule": "إنشاء أو upsert قاعدة توصية بواسطة slug اسم مستقر",
    },
    platformManagement: {
      title: "إدارة المنصة",
      description:
        "عدادات حصص آمنة للتزامن مع التطبيق المجمّع، لقطات موارد التجربة، ودفتر أستاذ العمولة غير Connect لعمولات بوابة PayPal وPaymob.",
      intro:
        "تغطي إدارة المنصة البنية التحتية التشغيلية التي تحافظ على اتساق منصة SCRIPE متعددة المستأجرين عدداً: عدادات الحصص التي تمنع الإفراط في توفير الموارد، لقطات التجربة التي تتيح تطبيق التخفيض بدقة، ودفتر أستاذ العمولة الذي يتتبع إيرادات المنصة من بوابات الدفع غير Stripe Connect.",
      whatIsTitle: "ما هي إدارة المنصة؟",
      whatIsIntro:
        "إدارة المنصة هي مجموعة كيانات النطاق المسؤولة عن تطبيق حدود موارد المستأجر (الحصص)، والتقاط حالة الموارد في بداية التجربة، وتتبع عمولات المنصة من مدفوعات بوابات PayPal وPaymob.",
      quotaTitle: "كيان QuotaCounter",
      quotaIntro:
        "يتتبع QuotaCounter استخدام الموارد لكل مستأجر مع دعم اختياري للتطبيق المجمّع. يوجد صف واحد لكل مستأجر لكل نوع مورد (المسؤول، الدور، المستأجر الفرعي، مجموعة المستخدمين). يمنع نمط الحجز حالات السباق تحت طلبات الإنشاء المتزامنة.",
      reservationTitle: "نمط الحجز الذري",
      reservationIntro:
        "نمط الحجز هو بروتوكول ثلاثي المراحل يمنع الإفراط في توفير الحصص حتى في ظل التزامن العالي.",
      reservationNote:
        "يستخدم TryReserveSlotAsync زيادة ذرية على مستوى قاعدة البيانات للحقل Reserved. عند الفشل، الاستراتيجية fail-open للحفاظ على التوفر — يُحرر الحجز ويُسمح بالإنشاء مع تسجيل تحذير.",
      pooledTitle: "أوضاع تطبيق الحصص",
      pooledIntro:
        "يدعم QuotaCounter وضعَي تطبيق يتحكم بهما PoolRootTenantId. التطبيق لكل مستأجر هو الافتراضي؛ التطبيق المجمّع يتيح مشاركة الموارد عبر هرمية المستأجر.",
      trialSnapshotTitle: "كيان TrialSnapshot",
      trialSnapshotIntro:
        "يلتقط TrialSnapshot أعداد الموارد (المسؤول، الدور، المستأجر الفرعي، مجموعة المستخدمين) في اللحظة التي يبدأ فيها اشتراك التجربة. عند انتهاء التجربة، يقارن النظام الأعداد الحالية بالـ snapshot لتحديد ما إذا كان المستأجر قد وفّر موارد تتجاوز حدود الإصدار الأساسي.",
      trialSnapshotTip:
        "يتيح TrialSnapshot فحص أمان تخفيض التجربة: إذا نما AdminCount من 2 (لقطة) إلى 8 (حالي) والإصدار بعد التجربة يسمح بـ 5 فقط، يمكن للنظام تشغيل إجراء OverflowPolicy.",
      ledgerEntryTitle: "كيان CommissionLedgerEntry",
      ledgerEntryIntro:
        "يسجل CommissionLedgerEntry العمولات من مدفوعات بوابة غير Connect (PayPal, Paymob). لمدفوعات Stripe Connect، يتم تحصيل العمولات فوراً عبر application_fee_amount — هذا الكيان فقط لتدفقات البوابة التي تتطلب تحصيل عمولات مؤجلة.",
      revenueTitle: "تكامل تحليلات الإيرادات",
      revenueIntro:
        "يغذي دفتر أستاذ العمولة مباشرةً وحدة تحليلات الإيرادات للتقارير المالية على مستوى المنصة.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "نقاط نهاية إدارة المنصة مقيدة بأدوار المسؤول الفائق. بيانات الحصص للقراءة فقط للمسؤولين القياسيين.",
      "ep.quotaList": "عرض جميع عدادات الحصص (قابل للتصفية حسب المستأجر ونوع المورد)",
      "ep.quotaGet": "الحصول على عداد الحصة لمستأجر ونوع مورد محدد",
      "ep.quotaReset":
        "إعادة تعيين عدادات الحصص لمستأجر (استخدم بحذر — يمسح Reserved ويُعيد تعيين Used)",
      "ep.trialSnapshot": "الحصول على لقطة التجربة لاشتراك (يستخدمه تطبيق التخفيض)",
      "ep.ledger": "عرض إدخالات دفتر أستاذ العمولة (قابل للتصفية حسب المستأجر والبوابة والحالة)",
      "ep.waive": "إعفاء إدخال دفتر أستاذ عمولة مع ملاحظة مسؤول",
      "ep.dashboard":
        "الحصول على مؤشرات KPI للوحة إدارة المنصة (إجمالي العمولات، استخدام الحصص، لقطات التجربة)",
    },

    // ─── Marketplace Module (Phase 16) ────────────────────────────
    marketplaceOverview: {
      title: "نظرة عامة على السوق",
      description:
        "سوق SCRIPE — منظومة التطبيقات القابلة للتثبيت، الفئات، ملفات المطورين، وخريطة الكيانات الـ 13 في النطاق.",
      intro:
        "تُشغّل وحدة السوق منظومة التطبيقات في SCRIPE: يقوم المطورون بنشر المكونات الإضافية على شكل قوائم تجارية، ويتصفحها المستأجرون ويشترونها، وتُطبّق المنصة خط أنابيب مراجعة متعدد المراحل قبل أن يصبح أي تطبيق متاحاً للعموم. تغطي هذه الصفحة خريطة الكيانات الكاملة وكيانَي التنظيم — AppCategory وAppCategoryMapping.",
      infoTitle: "السوق + المكونات الإضافية",
      infoContent:
        "تعتمد وحدة السوق على وحدة المكونات الإضافية. AppListing هو الواجهة التجارية لـ PluginDefinition. يقوم المستأجرون بتثبيت المكون الأساسي؛ بينما يتولى السوق الاكتشاف والتسعير والمدفوعات.",
      featuresTitle: "الإمكانات الرئيسية",
      featurePublish: "نشر التطبيقات",
      featurePublishDesc:
        "يقوم المطورون بإنشاء AppListings التي تربط PluginDefinitions بواجهة متجر تحتوي على الاسم والشعار والصور والتسعير.",
      featureInstall: "تثبيت بنقرة واحدة",
      featureInstallDesc:
        "يتصفح المستأجرون الكتالوج، ويشترون التطبيقات أو يجربونها، ويُطلقون تثبيت المكون في خطوة واحدة.",
      featureReview: "التقييمات والمراجعات",
      featureReviewDesc:
        "يُرسل المستخدمون تقييمات من 1 إلى 5 نجوم مع نص المراجعة. يمكن للمطورين الرد مرة واحدة على كل مراجعة. AverageRating منسوخ على AppListing لاستعلامات الكتالوج السريعة.",
      featurePricing: "تسعير مرن",
      featurePricingDesc:
        "ستة نماذج تسعير: مجاني، مدفوع مرة واحدة، اشتراك، مجاني مع مدفوع، لكل مقعد، قائم على الاستخدام — كلها مُهيأة عبر AppPricing مع دعم أيام التجربة.",
      featureAnalytics: "تحليلات التثبيت",
      featureAnalyticsDesc:
        "توفر لقطات AppInstallCount اليومية لوحات بيانات المطورين التي تعرض اتجاهات التثبيت ومعدلات النمو وأعداد التثبيتات النشطة.",
      featureReviewGate: "بوابة مراجعة الإرسال",
      featureReviewGateDesc:
        "يمر كل إصدار جديد عبر مسح آلي ثم مراجعة يدوية من المسؤول (AppSubmission + AppReviewTask) قبل نشره.",
      entitiesTitle: "خريطة كيانات النطاق",
      entitiesIntro:
        "تحتوي وحدة السوق على 13 كيان نطاق عبر خمسة مجالات وظيفية: القوائم، بوابة المطورين، المشتريات، التحليلات، والمراجعات.",
      categoryTitle: "كيان AppCategory",
      categoryIntro:
        'يمثل فئة سوق تُستخدم لتنظيم قوائم التطبيقات (مثل "إنتاجية"، "تحليلات"، "تواصل"). يدعم الأسماء ثنائية اللغة (EN/AR) وعنوان URL آمن للتوجيه.',
      mappingTitle: "كيان AppCategoryMapping",
      mappingIntro:
        "كيان ربط يُنفّذ العلاقة من-متعدد-إلى-متعدد بين AppListing وAppCategory. يمكن أن ينتمي التطبيق إلى فئات متعددة، ويمكن أن تحتوي الفئة على تطبيقات متعددة.",
      architectureTitle: "نظرة عامة على علاقات الكيانات",
      architectureIntro:
        "يوضح الرسم البياني أدناه كيفية ارتباط الكيانات الـ 13 في السوق. DeveloperProfile هو الجذر — يمتلك AppListings التي تُعد المحور الرابط بين التسعير والإرساليات والمشتريات والمراجعات والصور ومقاييس التحليل.",
    },

    marketplaceListings: {
      title: "قوائم التطبيقات والصور",
      description:
        "AppListing — كيان واجهة المتجر المركزية الذي يربط PluginDefinition بحضوره التجاري، إضافة إلى AppScreenshot لمعرض الوسائط.",
      intro:
        "AppListing هو الواجهة التجارية للمكون الإضافي. يحتوي على كل ما يراه المستأجر في الكتالوج: الاسم والشعار والأيقونة والإصدار والتقييمات وأعداد التثبيتات. توفر الصور المعرض المرئي على صفحة تفاصيل القائمة.",
      listingTitle: "كيان AppListing",
      listingIntro:
        "الكيان المركزي لوحدة السوق. يربط المكون الإضافي بحضوره التجاري بما في ذلك التسعير والمراجعات والصور ومقاييس التثبيت. AverageRating وReviewCount منسوخان لأداء الاستعلام ويُعاد حسابهما في كل مرة تُضاف أو تُحدّث أو تُحذف مراجعة.",
      listingNote:
        "AverageRating وReviewCount منسوخان على AppListing لأداء استعلامات الكتالوج. يُعاد حسابهما ذرياً بواسطة منطق النطاق في كل مرة تُنشأ أو تُحدَّث أو تُحذف AppReview.",
      codeTitle: "شفرة الكيان المصدرية",
      screenshotTitle: "كيان AppScreenshot",
      screenshotIntro:
        "يمثل صورة لقطة شاشة لصفحة تفاصيل قائمة التطبيق. يتم ترتيب الصور حسب SortOrder وعرضها في عرض دوّار على المتجر.",
      statusTitle: "دورة حياة حالة القائمة",
      statusIntro:
        "تمر AppListing بعدة حالات من المسودة الأولى إلى الرؤية العامة. تتحكم علامة IsPublished في ظهور المتجر؛ وتُروّج IsFeatured للقائمة في القسم المميز.",
    },

    marketplaceDeveloper: {
      title: "بوابة المطور",
      description:
        "DeveloperProfile وAppSubmission وDeveloperPayout — الكيانات الثلاثة التي تُشغّل الجانب الخاص بالمطور في سوق SCRIPE.",
      intro:
        "تغطي بوابة المطور كل شيء من تسجيل حساب المطور إلى نشر التطبيقات وتلقي مدفوعات تقاسم الإيرادات. تعمل ثلاثة كيانات معاً: DeveloperProfile (الهوية وتفاصيل الدفع)، AppSubmission (خط أنابيب مراجعة الإصدارات)، وDeveloperPayout (سجلات التسوية).",
      profileTitle: "كيان DeveloperProfile",
      profileIntro:
        "يمثل مطوراً (مستأجراً) مسجلاً لنشر التطبيقات على السوق. يمكن لكل مستأجر امتلاك ملف مطور واحد فقط. يتطلب التحقق من قِبل مسؤولي المنصة قبل أن يتمكن المطور من نشر التطبيقات المدفوعة.",
      profileNote:
        "يربط StripeConnectAccountId أرباح المطور في السوق بحسابه في Stripe Connect. تُحوَّل المدفوعات عبر Stripe's Connect Transfers API. يجب أن تكون IsVerified صحيحة قبل قبول القوائم المدفوعة.",
      submissionTitle: "كيان AppSubmission",
      submissionIntro:
        "يمثل إرسال إصدار لقائمة تطبيق لمراجعة السوق. يمر كل إرسال عبر دورة حياة: Submitted → InAutomatedScan → InManualReview → Approved/Rejected. تؤدي الإرساليات المعتمدة فقط إلى نشر القائمة.",
      payoutTitle: "كيان DeveloperPayout",
      payoutIntro:
        "يسجل دفعة تقاسم إيرادات للمطور لفترة محددة. تُحسب المدفوعات من عمولات الشراء وتُحوَّل إلى حساب Stripe Connect الخاص بالمطور.",
      onboardingTitle: "تدفق إعداد المطور",
      onboardingIntro: "التدفق الشامل من إنشاء الملف إلى تلقي أول دفعة.",
    },

    marketplacePurchases: {
      title: "مشتريات التطبيقات والتحليلات",
      description:
        "AppPricing وAppPurchase وAppInstallCount — الكيانات الثلاثة التي تتعامل مع نماذج التسعير وسجلات المعاملات ولقطات مقاييس التثبيت اليومية.",
      intro:
        "تشكّل المشتريات والتحليلات العمود الفقري التجاري للسوق. يُحدد AppPricing كيفية تحقيق الدخل من التطبيق؛ يسجل AppPurchase كل معاملة؛ ويوفر AppInstallCount لقطات يومية للوحات بيانات المطورين.",
      pricingTitle: "كيان AppPricing",
      pricingIntro:
        "يُعرّف تهيئة التسعير لقائمة تطبيق. يوجد سجل AppPricing واحد لكل قائمة (علاقة واحد-لواحد). يدعم ستة نماذج تسعير.",
      pricingNote:
        "خيارات PricingModel: Free (السعر=0، لا يلزم شراء)، PaidOnce (دفعة واحدة، وصول دائم)، Subscription (فوترة متكررة)، Freemium (مستوى مجاني + ترقيات مدفوعة)، PerSeat (السعر × عدد المسؤولين)، UsageBased (مُقاس عبر Stripe Meters).",
      purchaseTitle: "كيان AppPurchase",
      purchaseIntro:
        "يسجل معاملة شراء عندما يشتري مستأجر تطبيقاً مدفوعاً أو يثبته. يتتبع المبلغ المدفوع والعملة وحالة المعاملة للتقارير المالية وحسابات مدفوعات المطور.",
      installCountTitle: "كيان AppInstallCount",
      installCountIntro:
        "لقطة يومية لمقاييس التثبيت لقائمة تطبيق. تُستخدم من قِبل لوحة التحليلات لعرض مخططات اتجاه التثبيت وحساب معدلات النمو بمرور الوقت.",
      installCountTip:
        "تُنشأ سجلات AppInstallCount بواسطة مهمة خلفية ليلية تحسب NetInstalls (التثبيتات - إلغاء التثبيتات) وTotalActiveInstalls من بيانات AppPurchase وتثبيت المكون لكل قائمة.",
      flowTitle: "تدفق الشراء",
      flowIntro: "التدفق الشامل من تصفح الكتالوج إلى تثبيت المكون وتحديث التحليلات.",
    },

    marketplaceReviews: {
      title: "التقييمات والمراجعات",
      description:
        "AppReview وAppReviewReply وAppReviewTask — الكيانات الثلاثة التي تُشغّل تقييمات المستخدمين وردود المطورين وخط أنابيب مراجعة إرسال المسؤول.",
      intro:
        "يخدم نظام المراجعة غرضين: تقييمات المستخدمين ومراجعات النصوص التي تظهر على صفحات القوائم، وخط أنابيب مراجعة المسؤول الذي يتحكم في الإصدارات الجديدة قبل النشر.",
      reviewTitle: "كيان AppReview",
      reviewIntro:
        "يمثل تقييماً ومراجعة يُرسلها المستخدم لقائمة تطبيق. يمكن لكل مستخدم مستأجر ترك مراجعة واحدة لكل تطبيق. تتضمن المراجعات تقييماً من 1 إلى 5 نجوم ومحتوى نصي اختياري. يمكن للمطورين الرد عبر AppReviewReply.",
      reviewNote:
        "يمكن لكل مستخدم (UserId) إرسال AppReview واحدة لكل AppListing. قيد فريد على (AppListingId، UserId) يُطبّق ذلك على مستوى قاعدة البيانات. تحديث مراجعة يُعيد حساب AverageRating على AppListing الأصل.",
      replyTitle: "كيان AppReviewReply",
      replyIntro:
        "يمثل رد المطور على مراجعة مستخدم لقائمة تطبيقه. يمكن أن تحتوي كل مراجعة على رد واحد فقط من المطور.",
      taskTitle: "كيان AppReviewTask",
      taskIntro:
        "يمثل مهمة مراجعة مسؤول مُعيَّنة لتقييم إرسال تطبيق. يتتبع المراجع المُعيَّن والحالة الحالية للمراجعة (Pending → InProgress → Approved/Rejected/Escalated) والتغذية الراجعة المقدمة للمطور خلال عملية المراجعة.",
      moderationTitle: "خط أنابيب مراجعة الإرسال",
      moderationIntro:
        "يمر كل إرسال إصدار تطبيق عبر مسح آلي يتبعه مراجعة يدوية من المسؤول قبل أن يمكن نشره في المتجر.",
    },

    // ─── Plugins Entity Pages (Phase 16) ─────────────────────────
    pluginEntities: {
      title: "تعريف المكون والإصدارات",
      description:
        "PluginDefinition وPluginVersion — الكيانان الجذريان لوحدة المكونات الإضافية اللذان يُحددان هوية المكون وقدراته وتاريخ إصداراته.",
      intro:
        "كل مكون إضافي في منظومة SCRIPE يبدأ بـ PluginDefinition — سجل الهوية الثابت. الإصدارات هي إصدارات منسوخة من ذلك التعريف. معاً يُشكّلان الأساس الذي تبني عليه التثبيتات ومفاتيح API ومخازن البيانات.",
      definitionTitle: "كيان PluginDefinition",
      definitionIntro:
        "الكيان الجوهري الذي يمثل مكوناً إضافياً مسجلاً في المنصة. يحتوي على البيانات الوصفية (الاسم والوصف والأيقونة) والتهيئة (البيان والمستوى والنطاق) وارتباط المطور. يدعم كلاً من المستوى الأول (تجميع .NET مضمّن) والمستوى الثاني (خدمة HTTP خارجية).",
      definitionNote:
        "تستخدم مكونات المستوى الأول AssemblyName + EntryPointType لتحديد فئة .NET المحملة في عملية المضيف. تستخدم مكونات المستوى الثاني BaseUrl + FrontendUrl + WebhookUrl للتواصل مع خدمة خارجية. تُترك حقول المستوى الآخر فارغة.",
      codeTitle: "شفرة الكيان المصدرية",
      versionTitle: "كيان PluginVersion",
      versionIntro:
        "يمثل إصداراً محدداً من PluginDefinition. يتتبع رقم الإصدار وملاحظات الإصدار ثنائية اللغة ولقطة البيان وما إذا كان هذا هو أحدث إصدار نشط. كل تثبيت يُثبَّت على إصدار محدد عند وقت التثبيت.",
      versionLifecycleTitle: "دورة حياة الإصدار",
      versionLifecycleIntro:
        "عند نشر إصدار جديد، يصبح IsLatest = true ويُخفَّض الإصدار السابق إلى IsLatest = false. تظل التثبيتات الحالية مُثبَّتة على إصدارها المثبّت حتى يُشغّل المسؤول صراحةً أمر الترقية.",
    },

    pluginInstallation: {
      title: "تثبيت المكون والأمان",
      description:
        "PluginInstallation وPluginApiKey وPluginPermissionGrant — الكيانات الثلاثة التي تُدير نشر المكون لكل مستأجر ومصادقة API ومنح الأذونات.",
      intro:
        "عند تثبيت مستأجر لمكون إضافي، تُنشأ ثلاثة كيانات أساسية: سجل PluginInstallation لتتبع حالة النشر، وPluginApiKey لاستدعاءات API المكون-للمنصة الآمنة، وسجلات PluginPermissionGrant لكل قدرة منصة مسموح للمكون بالوصول إليها.",
      installationTitle: "كيان PluginInstallation",
      installationIntro:
        "يمثل تثبيت مستأجر لـ PluginDefinition محدد في PluginVersion محدد. يمكن للمستأجر تثبيت نفس المكون مرة واحدة فقط — مُطبَّق بقيد فريد على (TenantId + PluginDefinitionId).",
      installationNote:
        "يتم زيادة ConsecutiveHealthCheckFails بواسطة مهمة plugins-health-check الخلفية عند كل فحص فاشل وإعادته إلى 0 عند نجاح الفحص. تنتقل الحالة تلقائياً إلى Error بعد عتبة فشل قابلة للتهيئة.",
      lifecycleTitle: "دورة حياة التثبيت",
      lifecycleIntro:
        "يبدأ PluginInstallation في حالة Installing بينما تُهيئ المنصة الموارد، ثم ينتقل إلى Active. يمكن للمسؤولين إلغاء تنشيطه/إعادة تنشيطه. أعطال فحص الصحة المستمرة تنقله إلى Error.",
      apiKeyTitle: "كيان PluginApiKey",
      apiKeyIntro:
        "يمثل مفتاح API مُصدَراً لتثبيت مكون لمصادقة استدعاءات API المكون-للمنصة. يخزن قيمة المفتاح المجزأة وبادئة مقروءة للمعرّف وحالة التنشيط وانتهاء الصلاحية الاختياري.",
      apiKeyWarning:
        "تظهر قيمة مفتاح API الخام مرة واحدة فقط عند الإنشاء ولا تُخزَّن مطلقاً — يُخزَّن فقط الـ hash. يجب على المكونات تخزين المفتاح بأمان في نظام إدارة أسرارها الخاص.",
      permGrantTitle: "كيان PluginPermissionGrant",
      permGrantIntro:
        "يسجل منح إذن صريح لتثبيت مكون ضمن مستأجر. كل منح يُخوّل المكون الوصول إلى قدرة منصة محددة. يجب على مسؤولي المنصة الموافقة صراحةً على كل إذن خلال معالج إعداد التثبيت.",
    },

    pluginRuntime: {
      title: "وقت تشغيل المكون والبيانات",
      description:
        "PluginDataStore وPluginExecutionLog وPluginWebhookSubscription — الكيانات الثلاثة التي تُشغّل استمرار بيانات المكون ومراقبة التنفيذ والاشتراك في الأحداث.",
      intro:
        "بمجرد تثبيت المكون وتنشيطه، تتعامل ثلاثة كيانات وقت تشغيل مع عمليته المستمرة: PluginDataStore لاستمرار حالة المكون، وPluginExecutionLog لمراقبة صحة استدعاءات API، وPluginWebhookSubscription لتلقي أحداث المنصة.",
      dataStoreTitle: "كيان PluginDataStore",
      dataStoreIntro:
        "إدخال مخزن مفتاح-قيمة مُقيَّد بتثبيت مكون ومستأجر. تستخدم المكونات هذا لاستمرار بيانات JSON التعسفية المنظمة حسب مساحة الأسماء والمفتاح. يتتبع الحجم المتسلسل لتطبيق الحصة.",
      dataStoreNote:
        "يُطبَّق عزل البيانات على مستويين: القيد الفريد على (PluginInstallationId + TenantId + Namespace + Key) يمنع التصادمات، وTenantId مطلوب دائماً لمنع تسرب البيانات بين المستأجرين. لا يمكن للمكونات قراءة إدخالات مخزن بيانات مستأجر آخر.",
      execLogTitle: "كيان PluginExecutionLog",
      execLogIntro:
        "إدخال سجل تدقيق غير قابل للتغيير يسجل تنفيذ API لمكون واحد. يلتقط طريقة HTTP ونقطة النهاية ورمز حالة الاستجابة والمدة بالميلي ثانية وحالة النجاح/الفشل. يُستخدم لمراقبة صحة المكون وتصحيح الأخطاء.",
      execLogTip:
        "تستعلم مهمة plugins-health-check الخلفية عن PluginExecutionLog لحساب ConsecutiveHealthCheckFails وتحديث HealthCheckPassing على PluginInstallation. تُمييز قيم DurationMs العالية كتحذيرات أداء.",
      webhookTitle: "كيان PluginWebhookSubscription",
      webhookIntro:
        "يمثل اشتراك webhook مُسجَّلاً بواسطة تثبيت مكون. عند إطلاق نوع حدث المنصة المحدد، يُرسل النظام HTTP POST إلى عنوان URL للاستدعاء. يمكن إلغاء تنشيط الاشتراكات (IsActive=false) دون حذفها.",
      webhookFlowTitle: "تدفق تسليم Webhook",
      webhookFlowIntro:
        "تستخدم المنصة نمط outbox لتسليم webhook الموثوق. تُكتب الأحداث أولاً في صندوق الصادر، ثم تُسلَّم بشكل غير متزامن إلى CallbackUrl الخاص بالمكون مع إعادة المحاولة بتراجع أسي.",
    },
  },
};
