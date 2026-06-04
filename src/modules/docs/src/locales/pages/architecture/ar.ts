export const ar = {
  architecture: {
    overview: {
      title: "نظرة عامة على البنية",
      description:
        "طبقات Clean Architecture ومسار الخلفية وتدفق SOLID في الواجهة وقواعد حدود الوحدات.",
      intro:
        "تتبع SCRIPE بنية Clean Architecture صارمة بأربع طبقات: العرض، التطبيق، المجال، والبنية التحتية. تضمن قاعدة الاعتماد ألا تعتمد الطبقات الداخلية على الطبقات الخارجية، ويطبق ذلك في الخلفية والواجهة.",
      layersTitle: "طبقات البنية النظيفة",
      backendArchTitle: "بنية الواجهة الخلفية",
      backendArchIntro:
        "تتبع الواجهة الخلفية بنية مسار الطلبات حيث يتدفق كل طلب HTTP عبر البرمجيات الوسيطة (Middleware)، وحدات التحكم (Controllers)، سلوكيات AstraFlow mediator، وأخيراً معالج CQRS. يضمن هذا التحقق المتسق والتدقيق والتعامل مع الأخطاء.",
      frontendArchTitle: "بنية الواجهة الأمامية",
      frontendArchIntro:
        "تستخدم الواجهة الأمامية نمط (View/ViewModel) المتوافق مع مبادئ SOLID حيث تكون المشاهد (Views) مجرد واجهة مستخدم نقية (بدون حالة أو منطق) وتحتوي ViewModels على جميع منطق الأعمال. يفصل نمط الموصل (Connector) توجيه Next.js (مكونات الخادم) عن منطق التطبيق (مكونات العميل).",
      moduleBoundariesTitle: "حدود الوحدات",
      moduleBoundariesIntro:
        "الوحدات عبارة عن جزر معزولة. لا يمكنها الاستيراد من بعضها البعض. هذا يتيح التطوير المستقل، وحصر الأعطال، والقدرة على استخراج الوحدات إلى مستودعات منفصلة.",
      withBoundaries: "مع حدود الوحدات",
      withoutBoundaries: "بدون حدود الوحدات",
      communicationPatternsTitle: "التواصل عبر الوحدات",
      crossModuleNote:
        "نمط ناقل الأحداث (Event Bus) مخطط للإصدارات المستقبلية. حالياً، تتواصل الوحدات حصرياً عبر التنقل بالـ URL والمعرفات المشتركة.",
    },
    backend: {
      title: "بنية الواجهة الخلفية",
      description:
        "تشريح Program.cs، مسار البرمجيات الوسيطة، خريطة خدمات حقن التبعيات (DI)، نمط تسجيل الوحدات، وقائمة وحدات التحكم.",
      intro:
        "واجهة SCRIPE الخلفية هي نظام متجانس معياري مبني بـ .NET 10، ويحتوي ملف Program.cs الخاص به على 30 سطراً تفوض إعدادات بدء التشغيل لفئات توسيع مخصصة. تفكك هذه الصفحة كل طبقة من طبقات بنية الواجهة الخلفية.",
      programCsTitle: "تشريح Program.cs",
      programCsIntro:
        "ملف Program.cs هو نقطة الدخول للتطبيق ومركز الربط. يكتشف وضع النشر، يسجل الخدمات بترتيب معين، ويبني مسار البرمجيات الوسيطة. يتبع الملف هيكلاً واضحاً مكوناً من 5 أقسام.",
      middlewarePipelineTitle: "مسار البرمجيات الوسيطة (Middleware Pipeline)",
      middlewarePipelineIntro:
        "يعالج مسار البرمجيات الوسيطة كل طلب HTTP بترتيب محدد. يمكن لكل وسيط إنهاء المسار مبكراً (مثلاً، مقيّد الطلبات يُرجع 429، التحقق يُرجع 401). الترتيب مهم - تغييره قد يكسر الأمان.",
      diMapTitle: "خريطة خدمات حقن التبعيات (DI)",
      diMapIntro:
        "يوضح الجدول التالي جميع واجهات الخدمات الرئيسية، تطبيقاتها، فترات حياتها (Lifetimes)، وأين يتم تسجيلها. فهم هذه الخريطة ضروري لتصحيح أخطاء النظام وتوسيعه.",
      modulePatternTitle: "نمط تسجيل الوحدات",
      modulePatternIntro:
        "تتبع كل وحدة جديدة نفس نمط تسجيل الـ DI. تقوم طريقة الامتداد AddXxxModule() بتسجيل الـ DbContext الخاص بالوحدة، والمستودعات، والخدمات، وعلامة تسجيل الوحدة.",
      controllersTitle: "وحدات التحكم (Controllers)",
      controllerTip:
        "ترث جميع وحدات التحكم من وحدة تحكم أساسية (ApiController) توفر تخطيط استجابة موحد باستخدام Result<T>. يجب أن تكون وحدات التحكم نحيفة - حيث تكتفي بالتحقق من نموذج الطلب وتفويض العمل إلى AstraFlow mediator.",
    },
    frontend: {
      title: "بنية الواجهة الأمامية",
      description:
        "نمط View/ViewModel متوافق مع مبادئ SOLID، هيكل الوحدة، ونمط الموصل لتكامل Next.js.",
      intro:
        "تم بناء واجهة SCRIPE الأمامية باستخدام Next.js 16 باتباع نمط View/ViewModel الصارم والمتوافق مع مبادئ SOLID. تتكون كل صفحة من واجهة مستخدم نقية (View) تفوض جميع المنطق إلى خطافات (Hooks) الـ ViewModel. يضمن هذا الفصل قابلية الاختبار، وإعادة الاستخدام، وقابلية الصيانة.",
      solidPatternTitle: "نمط View/ViewModel المتوافق مع مبادئ SOLID",
      solidPatternIntro:
        "يضمن نمط SOLID أن يكون لكل جزء من واجهة المستخدم مسؤولية واحدة. تقوم الـ Views بتصيير (Render) أكواد JSX، وتدير الـ ViewModels الحالة والمنطق، بينما توفر المكونات (Components) أقسام واجهة مستخدم قابلة لإعادة الاستخدام.",
      viewRulesTitle: "قواعد المشهد (View)",
      viewDo: "ما يجب على المشهد فعله",
      viewDont: "ما لا يجب على المشهد فعله",
      viewExampleTitle: "مثال على المشهد",
      viewModelRulesTitle: "قواعد الـ ViewModel",
      viewModelRulesIntro:
        "الـ ViewModels عبارة عن خطافات React تحتوي على جميع منطق الأعمال. إنها تجمع ViewModels الخاصة بأقسام محددة (الإحصائيات، الفلاتر، الجدول) وتُرجع واجهات محددة النوع تستهلكها الـ Views.",
      moduleStructureTitle: "هيكل ملف الوحدة",
      connectorPatternTitle: "نمط الموصل (Connector)",
      connectorPatternIntro:
        "يفصل نمط الموصل صفحات موجه تطبيق Next.js (مكونات الخادم) عن Views الوحدة (مكونات العميل). الصفحات في src/app/ عبارة عن موصلات نحيفة تقوم باستيراد وتصيير الـ Views الخاصة بالوحدة. وهي تتعامل فقط مع التوجيه، والبيانات الوصفية، ومعلمات URL.",
      connectorWarning:
        "لا تضع أبداً منطق الأعمال، أو جلب البيانات، أو النماذج، أو إدارة الحالة في ملفات src/app/. هذه مكونات خادم تقوم فقط بربط المسارات بـ Views الوحدة.",
    },
    cqrs: {
      title: "نمط CQRS",
      description:
        "فصل مسؤولية الأوامر والاستعلامات عبر مسار AstraFlow mediator، السلوكيات، التحقق، والتخزين المؤقت (Caching).",
      intro:
        "تستخدم SCRIPE نمط CQRS (فصل مسؤولية الأوامر والاستعلامات) لفصل عمليات القراءة عن عمليات الكتابة. تقوم الأوامر بتغيير الحالة وتمر عبر سلوكيات التحقق والتدقيق. بينما تقرأ الاستعلامات الحالة ويمكنها الاستفادة من التخزين المؤقت. يعمل AstraFlow mediator كوسيط بين وحدات التحكم والمعالجات.",
      whatIsCqrsTitle: "ما هو CQRS؟",
      whatIsCqrsIntro:
        "يقسم CQRS تطبيقك إلى جانبين: الأوامر (الكتابة) والاستعلامات (القراءة). يمكن تحسين كل جانب بشكل مستقل - تركز الأوامر على سلامة البيانات والتحقق منها، بينما تركز الاستعلامات على الأداء والتخزين المؤقت.",
      commandSide: "جانب الأوامر (الكتابة)",
      querySide: "جانب الاستعلامات (القراءة)",
      pipelineTitle: "مسار AstraFlow mediator",
      validationBehaviorTitle: "سلوك التحقق",
      commandExampleTitle: "مثال على أمر (Command)",
      queryExampleTitle: "مثال على استعلام (Query)",
      cachingTip:
        "يمكن للاستعلامات استخدام التخزين المؤقت من جانب الخادم لتجنب ضرب قاعدة البيانات في كل طلب. يجب أن يتضمن مفتاح التخزين المؤقت جميع معلمات الاستعلام لضمان التفرد. يتم إبطال ذاكرة التخزين المؤقت تلقائياً عندما تنجح الأوامر ذات الصلة.",
    },
    modules: {
      title: "نظام الوحدات",
      description:
        "قواعد عزل الوحدات، قوالب الواجهة الخلفية/الأمامية، سجل الوحدات، والتواصل بين الوحدات.",
      intro:
        "تستخدم SCRIPE نظام وحدات صارم حيث تكون كل وحدة عبارة عن جزيرة معزولة بحدود واضحة. لا يمكن للوحدات الاستيراد من بعضها البعض - فهي تتواصل فقط من خلال عناوين URL، أو المعرفات المشتركة، أو ناقل أحداث النواة (Core Event Bus). وهذا يضمن الاستقلالية، وقابلية الاختبار، والقدرة على استخراج الوحدات.",
      isolationRulesTitle: "قواعد عزل الوحدات",
      allowedImportsTitle: "الواردات المسموح بها",
      forbiddenImportsTitle: "الواردات الممنوعة",
      backendModuleTitle: "قالب وحدة الواجهة الخلفية",
      backendModuleIntro:
        "تتبع كل وحدة في الواجهة الخلفية التصميم الموجه للمجال (DDD) بثلاثة مشاريع: النطاق (Domain)، التطبيق (Application)، والبنية التحتية (Infrastructure). النطاق هو كود C# نقي بدون تبعيات خارجية.",
      frontendModuleTitle: "قالب وحدة الواجهة الأمامية",
      registryTitle: "سجل الوحدات",
      registryIntro:
        "يتتبع سجل الوحدات جميع الوحدات النشطة في وقت التشغيل. تتم تعبئته أثناء بدء تشغيل التطبيق عندما يتم حل وتسجيل تطبيق IModuleRegistration الخاص بكل وحدة.",
      communicationTitle: "أنماط التواصل عبر الوحدات",
      pattern1Title: "النمط 1: التنقل عبر URL",
      pattern1Content: "انتقل إلى صفحة وحدة أخرى عبر روابط URL القياسية. لا حاجة للاستيراد.",
      pattern2Title: "النمط 2: المعرفات المشتركة فقط",
      pattern2Content:
        "قم بتخزين معرف (ID) كيان الوحدة الخارجية فقط. لا تقم أبداً بتضمين الكيان بالكامل.",
      pattern3Title: "النمط 3: ناقل الأحداث الأساسي (Core Event Bus)",
      pattern3Content:
        "نشر الأحداث والاشتراك فيها من خلال ناقل أحداث مشترك في @core/. نمط مستقبلي - لم يتم تنفيذه بعد.",
      boundaryWarning:
        "حدود الوحدة هي قانون مطلق. إذا كنت بحاجة إلى مشاركة الكود بين الوحدات، يجب وضعه في @core/. أي استيراد من @modules/{other}/ هو انتهاك وسيتم اكتشافه أثناء مراجعة الكود.",
    },
    solidPattern: {
      title: "مبدأ SOLID: الـ View والـ ViewModel",
      description:
        "سيناريوهات أنواع الصفحات: قوائم CRUD، لوحات التحكم، الملفات الشخصية، الإعدادات، النماذج المتعددة الخطوات، وبناة التقارير.",
      intro:
        "يعد نمط SOLID للـ View/ViewModel إلزامياً لجميع الصفحات في src/modules/. يغطي هذا الدليل 7 سيناريوهات لأنواع الصفحات بهياكل الدلائل الدقيقة، وأنماط ViewModel، وأمثلة على التعليمات البرمجية.",
      principlesTitle: "تطبيق مبادئ SOLID",
      scenariosTitle: "سيناريوهات أنواع الصفحات",
      scenariosIntro:
        "اختر السيناريو الذي يتوافق مع نوع صفحتك. يوفر كل منها هيكلاً مجرباً ومختبراً يضمن التناسق عبر التطبيق بأكمله.",
      scenario1Title: "السيناريو 1: صفحة قائمة CRUD",
      scenario1Intro:
        "تُستخدم لإدارة مجموعات الكيانات (المستخدمين، المنتجات، الطلبات). يقوم المنسق (Orchestrator) بتجميع ViewModels الخاصة بالإحصائيات، الفلاتر، والجدول.",
      scenario2Title: "السيناريو 2: لوحة التحكم / التحليلات",
      scenario2Intro:
        "تُستخدم لمؤشرات الأداء الرئيسية، الرسوم البيانية، والمقاييس. يحصل كل قسم أو رسم بياني على ViewModel الخاص به مع اختيار الفترة وتحويل البيانات.",
      scenario3Title: "السيناريو 3: صفحة التفاصيل / الملف الشخصي",
      scenario3Intro:
        "تُستخدم لعرض كيان واحد بعلامات تبويب وأقسام. يقوم المنسق بجلب الكيان الرئيسي وتجميع ViewModels لعلامات التبويب.",
      scenario4Title: "السيناريو 4: صفحة الإعدادات",
      scenario4Intro:
        "تُستخدم لعدة أقسام نماذج يمكن حفظها بشكل مستقل. يحصل كل قسم على ViewModel الخاص به لإدارة حالة النموذج وعملية الحفظ.",
      scenario5Title: "السيناريو 5: النموذج المتعدد الخطوات (Wizard)",
      scenario5Intro:
        "يُستخدم للتدفقات المعقدة متعددة الخطوات. ينسق الـ ViewModel للـ Wizard التنقل بين الخطوات، بوابات التحقق، والتقديم المدمج.",
      rulesTitle: "القواعد الذهبية",
      antiPatternWarning:
        "نمط سيء (Anti-pattern): وضع useState أو useEffect أو useQuery مباشرة داخل مكون View. يجب أن تعيش جميع الحالات والمنطق في ViewModels. مكونات المشهد (Views) مخصصة فقط لتكوين واجهة المستخدم.",
    },
    stateManagement: {
      title: "إدارة الحالة (State Management)",
      description:
        "TanStack Query لحالة الخادم، Zustand لحالة واجهة المستخدم العامة، و LanguageProvider للترجمة.",
      intro:
        "تستخدم SCRIPE ثلاث أدوات لإدارة الحالة، كل منها لفئة محددة: TanStack Query لبيانات الخادم (نتائج API)، Zustand لحالة واجهة المستخدم العامة (المصادقة، الشريط الجانبي، السمة)، و useState للحالة المحلية للمكونات.",
      decisionTitle: "مصفوفة اتخاذ القرار",
      tanstackTitle: "TanStack Query (حالة الخادم)",
      tanstackIntro:
        "استخدم TanStack Query لأي بيانات تأتي من الـ API. يتعامل مع التخزين المؤقت، جلب البيانات في الخلفية، الترحيل، التحديثات المتفائلة، وإلغاء تكرار الطلبات تلقائياً.",
      zustandTitle: "Zustand (حالة واجهة المستخدم العامة)",
      zustandIntro:
        "استخدم Zustand لحالة واجهة المستخدم العامة التي يجب مشاركتها عبر المكونات ولكنها لا تأتي من الخادم. هناك 3 مخازن (Stores) معتمدة فقط.",
      antiPatternsTitle: "الأنماط السيئة (Anti-Patterns)",
      doTitle: "افعل",
      dontTitle: "لا تفعل",
      localizationTitle: "الترجمة (LanguageProvider + ترجمات الوحدات)",
      localizationIntro:
        "تستخدم الترجمة LanguageProvider مخصصاً مع حفظ التفضيلات في localStorage بالإضافة إلى نظام ترجمة على مستوى الوحدات. المفاتيح المشتركة (~1,156) موجودة في core/locales/. المفاتيح الخاصة بكل وحدة تُسجل مسبقاً في ملف module-registry.ts لضمان تحميل الصفحات دون أي وميض للترجمة.",
      noLocaleFoldersWarning:
        "لا تستخدم مجلدات [locale] في src/app/! يتم التعامل مع الترجمة عبر سياق LanguageProvider، وليس توجيه الملفات.",
    },
    dataFlow: {
      title: "تدفق البيانات",
      description:
        "مخططات تدفق البيانات من البداية للنهاية: الاستعلام، التعديل (Mutation)، مسار الواجهة الخلفية، معالجة الأخطاء، واستراتيجية التخزين المؤقت.",
      intro:
        "فهم كيفية تدفق البيانات عبر SCRIPE ضروري لتصحيح الأخطاء وتوسيع النظام. تتتبع هذه الصفحة البيانات من نقرة زر في واجهة المستخدم وصولاً إلى قاعدة البيانات والعودة.",
      queryFlowTitle: "تدفق الاستعلام (القراءة)",
      queryFlowIntro:
        "عندما يعرض المستخدم البيانات، يبدأ التدفق عند المشهد (View)، يمر عبر ViewModel، TanStack Query، المستودع، خدمة API، وأخيراً API الواجهة الخلفية.",
      mutationFlowTitle: "تدفق التعديل (الكتابة)",
      backendPipelineTitle: "مسار طلبات الواجهة الخلفية",
      backendPipelineIntro:
        "يمر كل طلب واجهة خلفية عبر المكونات الوسيطة ثم سلوكيات وسيط SCRIPE قبل الوصول إلى المعالج. يضمن هذا التسجيل الموحد والمصادقة والتفويض والتحقق وبوابة الميزات وإرسال Webhook بعد النجاح.",
      errorFlowTitle: "معالجة الأخطاء",
      errorFlowIntro:
        "يتم التعامل مع الأخطاء على عدة مستويات. لكل مصدر خطأ معالج محدد، ورمز استجابة، واستراتيجية معالجة في الواجهة الأمامية.",
      cachingFlowTitle: "استراتيجية التخزين المؤقت (Caching)",
      cachingFlowIntro:
        "تستخدم الواجهة الخلفية استراتيجية تخزين مؤقت بمستويين: L1 (داخل الذاكرة) و L2 (Redis موزع). تستخدم الواجهة الأمامية ذاكرة التخزين المؤقت المدمجة في TanStack Query.",
      cacheTip:
        "قم بتعيين staleTime إلى 5 دقائق للبيانات التي تتغير بشكل غير متكرر. استخدم 0 للبيانات التي تتغير غالباً. قم دائماً بإبطال الاستعلامات ذات الصلة بعد التعديلات الناجحة.",
    },
    domainModel: {
      title: "نموذج النطاق (Domain Model)",
      description:
        "التسلسل الهرمي للكيانات، AuditableEntity، ITenantAwareEntity، دورة حياة الحذف المؤقت، والمستودعات.",
      intro:
        "يتبع نموذج نطاق SCRIPE تسلسلاً هرمياً صارماً للوراثة حيث ترث جميع كيانات الأعمال من AuditableEntity، مما يوفر حقول التدقيق ودعم الحذف المؤقت. تطبق الكيانات المرتبطة بمستأجر معين واجهة ITenantAwareEntity.",
      entityHierarchyTitle: "التسلسل الهرمي لوراثة الكيانات",
      entityHierarchyIntro:
        "تتبع جميع كيانات النطاق سلسلة وراثة من ثلاثة مستويات: IEntity -> Entity<TId> -> AuditableEntity. الكيانات التي تنتمي لمستأجر تطبق أيضاً ITenantAwareEntity.",
      ientityTitle: "واجهة IEntity",
      entityBaseTitle: "الفئة الأساسية Entity<TId>",
      entityBaseIntro:
        "توفر الفئة الأساسية Entity مساواة الهوية وإنشاء رمز التجزئة ودعم أحداث النطاق. يمكن لكل كيان إثارة أحداث تلتقط وتُنشر بشكل غير متزامن.",
      entityDomainEventNote:
        "يتم جمع أحداث النطاق المثارة عبر RaiseDomainEvent() بواسطة OutboxInterceptor أثناء عملية SaveChanges ويتم حفظها في نفس المعاملة.",
      auditableEntityTitle: "AuditableEntity (الكيان القابل للتدقيق)",
      auditableEntityIntro:
        "تضيف AuditableEntity 7 حقول تدقيق وحذف مؤقت إلى الكيان الأساسي. تتم تعبئتها تلقائياً؛ ولا يتم تعيينها يدوياً أبداً.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantAwareIntro:
        "الكيانات التي تطبق ITenantAwareEntity يتم نطاقها تلقائياً للمستأجر الحالي عبر فلاتر استعلام EF Core العامة.",
      tenantIsolationWarning:
        "لا تتجاوز عزل المستأجر دون تصريح صريح. استخدام IgnoreQueryFilters() يزيل كافة الفلاتر بما فيها تصفية المستأجر.",
      softDeleteTitle: "دورة حياة الحذف المؤقت",
      softDeleteIntro:
        "تستخدم جميع الكيانات الحذف المؤقت عبر علامة IsDeleted. تظل الكيانات في قاعدة البيانات ولكن يتم إخفاؤها عن الاستعلامات العادية.",
      repositoryTitle: "تجريدات المستودع (Repository Abstractions)",
      repositoryIntro:
        "تُعرّف SCRIPE ثلاث واجهات للمستودعات: IReadRepository للقراءة، IWriteRepository للكتابة، و IRepository الذي يجمع بينهما.",
      concreteEntitiesTitle: "سجل الكيانات الملموسة",
      queryFiltersTitle: "فلاتر الاستعلام العامة",
      queryFiltersIntro:
        "تُطبق فلاتر الاستعلام العامة (Global Query Filters) الخاصة بـ EF Core على كل كيان يرث من AuditableEntity (فلتر الحذف المؤقت) ويطبق ITenantAwareEntity (فلتر عزل المستأجر).",
      ignoreFiltersTip:
        "استخدم IgnoreQueryFilters() فقط في عمليات سلة المحذوفات (RecycleBin) واستعلامات الإدارة العليا (SuperAdmin) العابرة للمستأجرين.",
      bestPracticesTitle: "أفضل الممارسات",
      doTitle: "✅ افعل",
      dontTitle: "❌ لا تفعل",
    },
    domainEvents: {
      title: "أحداث النطاق (Domain Events)",
      description:
        "واجهة IDomainEvent، نمط Outbox، OutboxInterceptor، OutboxProcessor، والتسليم الموثوق.",
      intro:
        "تمثل أحداث النطاق وقوع أحداث مهمة في نطاق الأعمال. تستخدم SCRIPE نمط الـ Outbox لضمان تسليم الأحداث بشكل موثوق.",
      interfaceTitle: "واجهة IDomainEvent",
      interfaceIntro:
        "تنفذ جميع أحداث النطاق واجهة IDomainEvent، والتي ترث من INotification الخاصة بـ AstraFlow mediator. يمكّن هذا اشتراكات متعددة لنفس الحدث.",
      publishingTitle: "تدفق النشر والمعالجة",
      publishingIntro:
        "تتبع أحداث النطاق دورة حياة من 6 خطوات: إثارة الحدث، التقاطه بواسطة OutboxInterceptor، حفظه في قاعدة البيانات كـ OutboxMessage، استطلاعه بواسطة OutboxProcessor، ثم نشره.",
      publisherTitle: "IDomainEventPublisher",
      outboxTitle: "نمط صندوق الصادر (Outbox Pattern)",
      outboxIntro:
        "يحل نمط الـ Outbox مشكلة الكتابة المزدوجة (Dual-write problem): كيفية تحديث قاعدة البيانات ونشر حدث بشكل متزامن وبشكل ذري.",
      outboxWarning:
        "يوفر نمط الـ Outbox تسليماً بمعدل (مرة واحدة على الأقل). يجب أن تكون معالجات الأحداث غير متأثرة بالتكرار (Idempotent).",
      outboxMessageTitle: "كيان OutboxMessage",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxInterceptorIntro:
        "OutboxInterceptor هو معترض عمليات (Interceptor) يعمل قبل اعتماد المعاملة (Commit). يجمع جميع أحداث النطاق ويسجلها كـ OutboxMessage.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxProcessorIntro:
        "OutboxProcessor عبارة عن خدمة خلفية (BackgroundService) تستطلع جدول OutboxMessage كل 5 ثوانٍ للرسائل غير المعالجة.",
      outboxCleanupTitle: "وظيفة تنظيف الـ Outbox",
      outboxCleanupIntro:
        "تعمل وظيفة خلفية متكررة يومياً (عبر Hangfire مثلاً) لحذف رسائل الـ Outbox المعالجة الأقدم من 7 أيام.",
      architectureSummaryTitle: "ملخص بنية Outbox",
      customEventsTitle: "إنشاء أحداث نطاق مخصصة",
      customEventsIntro: "اتبع هذه الخطوات الـ 3 لإضافة حدث نطاق جديد في SCRIPE.",
      step1Title: "1. تعريف الحدث",
      step1Content: "قم بإنشاء كائن ينفذ IDomainEvent في مجلد Domain/Events/ الخاص بالوحدة.",
      step2Title: "2. الإثارة من معالج الأوامر",
      step2Content: "استدعِ entity.RaiseDomainEvent() في معالج الأمر، ثم استدعِ SaveChangesAsync.",
      step3Title: "3. إنشاء معالجات الحدث",
      step3Content: "نفّذ INotificationHandler<DomainEventNotification> للتفاعل مع الحدث.",
      reliabilityTitle: "ضمانات الموثوقية",
      withOutboxTitle: "✅ مع نمط الـ Outbox",
      withoutOutboxTitle: "❌ بدون نمط الـ Outbox",
    },
    cqrsPipeline: {
      title: "مسار CQRS",
      description:
        "سلوكيات مسار وسيط SCRIPE: LoggingBehavior و ValidationBehavior و FeatureCheckBehavior و WebhookDispatchBehavior و CachingBehavior ونمط Result وخريطة الأوامر والاستعلامات.",
      intro:
        "يمر كل أمر واستعلام في SCRIPE عبر مسار وسيط قابل للضبط يضم خمسة سلوكيات مدمجة: LoggingBehavior و ValidationBehavior و FeatureCheckBehavior و WebhookDispatchBehavior و CachingBehavior. تتم إدارة الترتيب من appsettings أو متغيرات البيئة ويتم التحقق منه عند بدء التشغيل.",
      overviewTitle: "نظرة عامة على المسار",
      overviewIntro:
        "الترتيب الافتراضي هو Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. يعمل التحقق وبوابة الميزات قبل قراءة التخزين المؤقت، بينما يحدث إبطال التخزين المؤقت قبل إرسال الويبهوك بعد نجاح أوامر التعديل.",
      separationTitle: "فصل الأوامر عن الاستعلامات",
      separationIntro:
        "يقسم CQRS التطبيق إلى مسارين مميزين: الأوامر (تغيير الحالة وتمر بتحقق كامل) والاستعلامات (للقراءة وتُحسن بالأداء مع التخزين المؤقت).",
      commandsTitle: "الأوامر (الكتابة)",
      queriesTitle: "الاستعلامات (القراءة)",
      resultPatternTitle: "نمط النتيجة (Result Pattern)",
      resultPatternIntro: "تُرجع جميع المعالجات Result<T> بدلاً من رمي الاستثناءات للفشل المتوقع.",
      validationTitle: "سلوك التحقق (ValidationBehavior)",
      validationIntro:
        "يعمل ValidationBehavior مباشرة بعد التسجيل. يجمع كل مدققي IValidator<TRequest>، ويرجع أخطاء Result منظمة للطلبات غير الصالحة، ويمنعها من الوصول إلى المعالجات أو التخزين المؤقت.",
      validatorExampleTitle: "أمثلة على أدوات التحقق",
      loggingTitle: "سلوك التسجيل (LoggingBehavior)",
      loggingIntro:
        "يسجل كل طلب AstraFlow mediator معرّف المستخدم، معرّف المستأجر، نوع الطلب، ووقت التنفيذ.",
      cachingTitle: "سلوك التخزين المؤقت (CachingBehavior)",
      cachingIntro:
        "يعترض CachingBehavior الاستعلامات التي تنفذ واجهة ICacheable ويفحص ذاكرة التخزين المؤقت أولاً.",
      commandMapTitle: "كتالوج الأوامر والاستعلامات",
      commandMapIntro: "يدرج الجدول التالي كل أمر واستعلام ومُدقق مسجل في النظام.",
      registrationTitle: "تسجيل المسار",
      registrationIntro: "يتم تسجيل سلوكيات المسار في AddCoreApplication() بترتيب التنفيذ.",
      behaviorOrderTip:
        "يرفض التحقق الآمن الافتراضي أي ترتيب يجعل Caching يعمل قبل Validation أو FeatureCheck. لا تعطل Mediator__EnforceSecurityPipelineOrder إلا إذا كنت تتحمل المخاطر بالكامل.",
      featureCheckTitle: "سلوك بوابة الميزات (FeatureCheckBehavior)",
      featureCheckIntro:
        "يعترض FeatureCheckBehavior الأوامر التي تنفذ IRequireFeature. يتحقق مما إذا كانت خطة المستأجر (Edition) تسمح بالميزة المطلوبة عبر IFeatureChecker.IsEnabledAsync. إذا كانت الميزة معطلة، يُرجع خطأ Forbidden دون تنفيذ المعالج.",
      featureCheckMarkerTitle: "واجهة IRequireFeature",
      featureCheckMarkerIntro:
        "تختار الأوامر بوابة الميزات عبر تطبيق واجهة IRequireFeature مع خاصية RequiredFeatureName. عندما لا تكون وحدة الاستحقاقات (Entitlements) منشورة، يُرجع NoOpFeatureChecker القيمة true لجميع الفحوصات.",
    },
    dependencyInjection: {
      title: "حقن التبعيات (Dependency Injection)",
      description:
        "تدفق تسجيل Program.cs، نمط DI للوحدة، اكتشاف الخدمة، خرائط الخدمة الأساسية، وقواعد فترة الحياة.",
      intro:
        "تستخدم SCRIPE حاوية DI المدمجة في .NET بنمط تسجيل مهيكل. ينسق Program.cs جميع التسجيلات.",
      architectureTitle: "بنية تسجيل الـ DI",
      architectureIntro:
        "يتبع Program.cs ترتيب تسجيل صارم من 4 مراحل: (1) البنية التحتية الأساسية. (2) CORS وقيود الطلبات. (3) الوحدات. (4) طبقة التطبيق مع AstraFlow mediator.",
      moduleRegTitle: "نمط تسجيل الوحدات",
      moduleRegIntro:
        "تعرض كل وحدة طريقة امتداد AddXxxModule() لتسجيل كافة خدماتها. يتحكم متغير البيئة MODULE_NAME في الوحدات التي يتم تحميلها.",
      monolithNote:
        "في وضع (Monolith)، يتم تحميل جميع الوحدات. في وضع (Microservice)، تعمل كل وحدة كعملية مستقلة.",
      controllerProviderTitle: "مزود ميزات وحدات التحكم",
      controllerProviderIntro:
        "يصفي ModuleControllerFeatureProvider وحدات التحكم المحملة عند بدء التشغيل بناءً على وضع النشر.",
      serviceDiscoveryTitle: "اكتشاف الخدمات",
      serviceDiscoveryIntro:
        "في وضع الخدمات المصغرة، تحتاج الخدمات إلى اكتشاف عناوين الـ URL لبعضها البعض. تستخدم SCRIPE الاكتشاف القائم على التكوين.",
      coreServicesTitle: "خدمات البنية التحتية الأساسية",
      coreServicesIntro:
        "يتم تسجيل الخدمات التالية عبر AddCoreInfrastructure() وهي متاحة لجميع الوحدات.",
      identityModuleTitle: "خدمات وحدة الهوية (Identity Module)",
      identityModuleIntro: "تقوم وحدة الهوية بتسجيل 24 واجهة مستودع و10 واجهات خدمات.",
      lifetimeTitle: "قواعد فترة حياة الخدمة (Service Lifetimes)",
      singletonTitle: "فترة حياة Singleton",
      scopedTitle: "فترة حياة Scoped",
      gatewayTitle: "تكوين بوابة YARP",
      gatewayIntro: "عند تعيين MODULE_NAME=Gateway، يعمل التطبيق كبوابة عكسية (YARP).",
      bestPracticesTitle: "أفضل الممارسات في حقن التبعيات",
      captiveTip:
        "تحدث التبعية المقيدة (Captive Dependency) عندما تقوم خدمة Singleton بحقن خدمة Scoped. استخدم IServiceScopeFactory لتجنب ذلك.",
    },
  },
};
