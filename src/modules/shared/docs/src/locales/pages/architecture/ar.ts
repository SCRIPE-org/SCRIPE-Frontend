// FILE-EXCEPTION: file length
/**
 * Docs page locale — AR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
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
        "تتبع الواجهة الخلفية بنية مسار الطلبات حيث يتدفق كل طلب HTTP عبر البرمجيات الوسيطة (Middleware)، وحدات التحكم (Controllers)، سلوكيات SCRIPE mediator، وأخيراً معالج CQRS. يضمن هذا التحقق المتسق والتدقيق والتعامل مع الأخطاء.",
      frontendArchTitle: "بنية الواجهة الأمامية",
      frontendArchIntro:
        "تستخدم الواجهة الأمامية نمط (View/ViewModel) المتوافق مع مبادئ SOLID حيث تكون المشاهد (Views) مجرد واجهة مستخدم نقية (بدون حالة أو منطق) وتحتوي ViewModels على جميع منطق الأعمال. يفصل نمط الموصل (Connector) توجيه Next.js (مكونات الخادم) عن منطق التطبيق (مكونات العميل).",
      moduleBoundariesTitle: "حدود الوحدات",
      moduleBoundariesIntro:
        "Modules have strict code boundaries. This supports future extraction, but extraction is not the same as proven production microservices readiness.",
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
        "واجهة SCRIPE الخلفية هي نظام متجانس معياري مبني بـ .NET 10، ويحتوي ملف Program.cs الخاص به على 288 سطراً تربط بين 16 تسجيلاً للخدمات، و10 برمجيات وسيطة، و18 وحدة تحكم REST. تفكك هذه الصفحة كل طبقة من طبقات بنية الواجهة الخلفية.",
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
        "ترث جميع وحدات التحكم من وحدة تحكم أساسية (ApiController) توفر تخطيط استجابة موحد باستخدام Result<T>. يجب أن تكون وحدات التحكم نحيفة - حيث تكتفي بالتحقق من نموذج الطلب وتفويض العمل إلى SCRIPE mediator.",
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
        "فصل مسؤولية الأوامر والاستعلامات عبر مسار SCRIPE mediator، السلوكيات، التحقق، والتخزين المؤقت (Caching).",
      intro:
        "تستخدم SCRIPE نمط CQRS (فصل مسؤولية الأوامر والاستعلامات) لفصل عمليات القراءة عن عمليات الكتابة. تقوم الأوامر بتغيير الحالة وتمر عبر سلوكيات التحقق والتدقيق. بينما تقرأ الاستعلامات الحالة ويمكنها الاستفادة من التخزين المؤقت. يعمل SCRIPE mediator كوسيط بين وحدات التحكم والمعالجات.",
      whatIsCqrsTitle: "ما هو CQRS؟",
      whatIsCqrsIntro:
        "يقسم CQRS تطبيقك إلى جانبين: الأوامر (الكتابة) والاستعلامات (القراءة). يمكن تحسين كل جانب بشكل مستقل - تركز الأوامر على سلامة البيانات والتحقق منها، بينما تركز الاستعلامات على الأداء والتخزين المؤقت.",
      commandSide: "جانب الأوامر (الكتابة)",
      querySide: "جانب الاستعلامات (القراءة)",
      pipelineTitle: "مسار SCRIPE mediator",
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
        "The current backend modules verified in code are Identity, Entitlements, Compliance, Plugins, and Marketplace, plus host controller labels such as Auth, System, Communication, Media, and Customization. CRM, HRMS, Inventory, Finance, Documents, Workflow, and Service Management are future modules, not current backend modules.",
      communicationTitle: "أنماط التواصل عبر الوحدات",
      pattern1Title: "النمط 1: التنقل عبر URL",
      pattern1Content: "انتقل إلى صفحة وحدة أخرى عبر روابط URL القياسية. لا حاجة للاستيراد.",
      pattern2Title: "النمط 2: المعرفات المشتركة فقط",
      pattern2Content:
        "قم بتخزين معرف (ID) كيان الوحدة الخارجية فقط. لا تقم أبداً بتضمين الكيان بالكامل.",
      pattern3Title: "النمط 3: ناقل الأحداث الأساسي (Core Event Bus)",
      pattern3Content:
        "Domain events currently dispatch in-process. RabbitMQ is a placeholder fallback, so do not use this as proof of true distributed microservices.",
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
        "تستخدم الترجمة LanguageProvider مخصصاً مع حفظ التفضيلات في localStorage بالإضافة إلى نظام ترجمة على مستوى الوحدات. المفاتيح المشتركة (~1,156) موجودة في core/locales/. المفاتيح الخاصة بكل وحدة تُحمّل كسولاً عبر useModuleLocales().",
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
        "يتبع نموذج نطاق SCRIPE تسلسلاً هرمياً صارماً للوراثة حيث ترث جميع كيانات الأعمال من AuditableEntity، مما يوفر حقول التدقيق ودعم الحذف المؤقت. تطبق الكيانات المرتبطة بوحدة معين واجهة ITenantAwareEntity.",
      entityHierarchyTitle: "التسلسل الهرمي لوراثة الكيانات",
      entityHierarchyIntro:
        "تتبع جميع كيانات النطاق سلسلة وراثة من ثلاثة مستويات: IEntity -> Entity<TId> -> AuditableEntity. الكيانات التي تنتمي لوحدة تطبق أيضاً ITenantAwareEntity.",
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
        "الكيانات التي تطبق ITenantAwareEntity يتم نطاقها تلقائياً للوحدة الحالي عبر فلاتر استعلام EF Core العامة.",
      tenantIsolationWarning:
        "لا تتجاوز عزل الوحدة دون تصريح صريح. استخدام IgnoreQueryFilters() يزيل كافة الفلاتر بما فيها تصفية الوحدة.",
      softDeleteTitle: "دورة حياة الحذف المؤقت",
      softDeleteIntro:
        "تستخدم جميع الكيانات الحذف المؤقت عبر علامة IsDeleted. تظل الكيانات في قاعدة البيانات ولكن يتم إخفاؤها عن الاستعلامات العادية.",
      repositoryTitle: "تجريدات المستودع (Repository Abstractions)",
      repositoryIntro:
        "تُعرّف SCRIPE ثلاث واجهات للمستودعات: IReadRepository للقراءة، IWriteRepository للكتابة، و IRepository الذي يجمع بينهما.",
      concreteEntitiesTitle: "سجل الكيانات الملموسة",
      queryFiltersTitle: "فلاتر الاستعلام العامة",
      queryFiltersIntro:
        "تُطبق فلاتر الاستعلام العامة (Global Query Filters) الخاصة بـ EF Core على كل كيان يرث من AuditableEntity (فلتر الحذف المؤقت) ويطبق ITenantAwareEntity (فلتر عزل الوحدة).",
      ignoreFiltersTip:
        "استخدم IgnoreQueryFilters() فقط في عمليات سلة المحذوفات (RecycleBin) واستعلامات الإدارة العليا (SuperAdmin) العابرة للوحدات.",
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
        "تنفذ جميع أحداث النطاق واجهة IDomainEvent، والتي ترث من INotification الخاصة بـ SCRIPE mediator. يمكّن هذا اشتراكات متعددة لنفس الحدث.",
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
        "يعمل ValidationBehavior مباشرة بعد التسجيل. يجمع كل مدققي IValidator<TRequest> validators، ويرجع أخطاء Result منظمة للطلبات غير الصالحة، ويمنعها من الوصول إلى المعالجات أو التخزين المؤقت.",
      validatorExampleTitle: "أمثلة على أدوات التحقق",
      loggingTitle: "سلوك التسجيل (LoggingBehavior)",
      loggingIntro:
        "يسجل كل طلب SCRIPE mediator معرّف المستخدم، معرّف الوحدة، نوع الطلب، ووقت التنفيذ.",
      cachingTitle: "سلوك التخزين المؤقت (CachingBehavior)",
      cachingIntro:
        "يعترض CachingBehavior الاستعلامات التي تطبّق واجهة ICacheable، ويقوم بإجراء عمليات بحث عن ذاكرة التخزين المؤقت بنطاق المستأجر. لمنع انهيال الذاكرة المؤقتة المتزامن (Cache Stampede) تحت الحمل الثقيل، فإنه يعتمد على أقفال SemaphoreSlim المحددة لكل مفتاح لتسلسل قراءات قاعدة البيانات عند الفقد. كما أنه يعالج إبطال التعديل عبر IInvalidatesCache، مما يؤدي إلى مسح مفاتيح محددة أو مساحات أسماء تستند إلى البادئات. علاوة على ذلك، فإنه يتضمن إخلاء المفاتيح للحد من النمو ويربط تكوينات الميزات بمصدر رمز إخلاء عالمي للإبطال الفوري والآمن من مؤشرات الترابط.",
      cachingStampedeTitle: "تزامن المخزن المؤقت ومنع الانهيال (Cache Stampede)",
      cachingStampedeIntro:
        "لمنع تدهور الأداء تحت الحمل العالي، يطبق نظام التخزين المؤقت ميزة منع الانهيال (Cache Stampede). تضمن السيمافورات المخصصة لكل مفتاح أنه في حالة طلبات متزامنة متعددة لمفتاح مفقود أو منتهي الصلاحية، فإن مؤشر الترابط الأول فقط هو من ينفذ استعلام قاعدة البيانات/واجهة برمجة التطبيقات، بينما تنتظر الطلبات اللاحقة السيمافور وتحصل على القيمة المخزنة مؤخرًا. بالإضافة إلى ذلك، يتم منع النمو غير المحدود عن طريق تتبع مفاتيح التخزين المؤقت وحذف 50٪ منها عشوائيًا عند تجاوز 10000 مفتاح متتبع. كما ترتبط إدخالات ذاكرة التخزين المؤقت للميزات برمز إخلاء عالمي للمسح الفوري.",
      outboxTitle: "أحداث النطاق وخط أنابيب نظام صندوق الصادر (Outbox)",
      outboxIntro:
        "لضمان الاتساق المعاملاتي ومنع مشكلة الكتابة المزدوجة، يستخدم SCRIPE نمط صندوق الصادر (Outbox). يتم رفع أحداث النطاق داخل جذور التجميع (Aggregate Roots)، واعتراضها بواسطة SaveChangesInterceptor الخاص بـ EF Core، وتسلسها إلى تنسيق JSON، وحفظها ككيانات OutboxMessage في نفس معاملة قاعدة البيانات. يتم تشغيل وظيفة خلفية (OutboxProcessorJob) كل دقيقة للاستعلام عن الرسائل غير المعالجة ونشرها محليًا (عبر وسيط AstraFlow) أو خارجيًا (عبر ناقل الأحداث). أخيرًا، يتم تشغيل وظيفة تنظيف يومية (OutboxCleanupJob) في الساعة 5:00 صباحًا لحذف الرسائل المعالجة التي يزيد عمرها عن 7 أيام.",
      flowStampedeTitle: "تسلسل قفل انهيال ذاكرة التخزين المؤقت",
      flowStampedeRequest: "طلب العميل\nGetOrCreateAsync(key)",
      flowStampedeMiss: "فقد في الذاكرة؟\nالتحقق من InMemory/Redis",
      flowStampedeLock: "الحصول على القفل\nSemaphoreSlim(1,1)",
      flowStampedeCheck: "التحقق المزدوج من الذاكرة\nالتحقق داخل القفل",
      flowStampedeFound: "إصابة الذاكرة المؤقتة\nتم تعبئة القيمة بواسطة مؤشر ترابط آخر",
      flowStampedeFactory: "تنفيذ المصنع\nتشغيل استعلام قاعدة البيانات / واجهة البرمجة",
      flowStampedeWrite: "الكتابة في الذاكرة المؤقتة\nإضافة PostEvictionCallback",
      flowStampedeRelease: "تحرير القفل\nإرجاع القيمة المخزنة لجميع مؤشرات الترابط",
      flowOutboxTitle: "خط أنابيب معالجة رسائل صندوق الصادر (Outbox)",
      flowOutboxRaise: "رفع حدث النطاق\nAggregateRoot.AddDomainEvent()",
      flowOutboxIntercept: "اعتراض SaveChanges\nOutboxInterceptor يمسح ChangeTracker",
      flowOutboxSerialize: "تسلسل الحدث\nتحويل إلى JSON وتغليفه في OutboxMessage",
      flowOutboxCommit: "معاملة قاعدة بيانات ذرية\nحفظ تحديثات الكيانات + OutboxMessage",
      flowOutboxPoll: "OutboxProcessorJob\nالاستعلام عن غير المعالج كل دقيقة",
      flowOutboxDispatch: "نشر الحدث\nالوسيط المحلي + ناقل الأحداث الخارجي",
      flowOutboxComplete: "تحديد كمعالج\nتعيين ProcessedOnUtc = UtcNow",
      flowOutboxCleanup: "OutboxCleanupJob\nتطهير السجلات المعالجة > 7 أيام",
      connCacheQuery: "يطلب المفتاح",
      connCacheMiss: "فقد في الذاكرة المؤقتة",
      connAcquireLock: "يحصل على القفل",
      connDoubleCheck: "إصابة الذاكرة المؤقتة",
      connDbQuery: "ينفذ الاستعلام",
      connCacheWrite: "يحدث الذاكرة المؤقتة",
      connLockRelease: "يحرر القفل",
      connRaise: "يطلق المعترض",
      connIntercept: "يمسح الأحداث",
      connSerialize: "يسلسل",
      connCommit: "يلتزم ذرياً",
      connPoll: "يستعلم عن دفعة من 50",
      connDispatch: "يرسل الحدث",
      connComplete: "يحفظ الحالة",
      connCleanup: "تطهير يومي",
      commandMapTitle: "كتالوج الأوامر والاستعلامات",
      commandMapIntro: "يدرج الجدول التالي كل أمر واستعلام ومُدقق مسجل في النظام.",
      registrationTitle: "تسجيل المسار",
      registrationIntro: "يتم تسجيل سلوكيات المسار في AddCoreApplication() بترتيب التنفيذ.",
      behaviorOrderTip:
        "يرفض التحقق الآمن الافتراضي أي ترتيب يجعل Caching يعمل قبل Validation أو FeatureCheck. لا تعطل Mediator__EnforceSecurityPipelineOrder إلا إذا كنت تتحمل المخاطر بالكامل.",
      featureCheckTitle: "سلوك بوابة الميزات (FeatureCheckBehavior)",
      featureCheckIntro:
        "يعترض FeatureCheckBehavior الأوامر التي تنفذ IRequireFeature. يتحقق مما إذا كانت خطة الوحدة (Edition) تسمح بالميزة المطلوبة عبر IFeatureChecker.IsEnabledAsync. إذا كانت الميزة معطلة، يُرجع خطأ Forbidden دون تنفيذ المعالج.",
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
        "يتبع Program.cs ترتيب تسجيل صارم من 4 مراحل: (1) البنية التحتية الأساسية. (2) CORS وقيود الطلبات. (3) الوحدات. (4) طبقة التطبيق مع SCRIPE mediator.",
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
    moduleCollab: {
      title: "التعاون بين الوحدات — تحليل معمق",
      description:
        "كيفية تعاون وحدتي Identity وEntitlements عبر تجريدات Core، ونمط NoOp للسلامة، ودورة حياة SubscriptionChangedEvent، وتأثير طوبولوجيا النشر.",
      intro:
        "يحتوي SCRIPE على 5 وحدات (Identity وEntitlements وCompliance وPlugins وMarketplace). وهي معزولة تمامًا — لا يُسمح بالاستيرادات المتقاطعة. غير أنها يجب أن تتعاون لإدارة الصلاحيات وميزات الاشتراكات والفوترة. الحل: تعمل طبقة Core.Application.Abstractions كجسر مبني على الواجهات البرمجية. كل تفاعل بين الوحدات يمر عبر هذا الجسر — ولا يمر أبدًا عبر استيرادات مباشرة بين الوحدات. تُوثق هذه الصفحة كل واجهة ونمط وتدفق وقت تشغيل يجعل هذا ممكنًا.",

      coreBridgeTitle: "جسر طبقة Core",
      coreBridgeIntro:
        "Core.Application.Abstractions هو قلب التواصل بين الوحدات. يُعرّف أكثر من 32 عقد واجهة برمجية. تُنفذ Identity.Infrastructure وEntitlements.Infrastructure كلٌّ منهما الجانب المقابل لها من هذه العقود. تستهلك سلوكيات خط أنابيب AstraFlow ومعالجات الوحدات هذه الواجهات فقط — ولا تستهلك أبدًا التطبيقات الفعلية. هذا يعني أن النظام يُجمَّع ويعمل بالتطابق سواء تم نشر Entitlements أم لا.",

      catalogTitle: "فهرس الواجهات المتقاطعة الكاملة",
      catalogIntro:
        "يُوثق الجدول التالي كل واجهة تتجاوز حدود الوحدات. مُعرَّفة في Core.Application، هذه الواجهات هي الطريقة القانونية الوحيدة للتواصل بين الوحدات.",

      noopTitle: "نمط سلامة NoOp",
      noopIntro:
        "تُسجِّل Core.Infrastructure تطبيق NoOp (عملية فارغة) لكل واجهة متقاطعة. تُسجَّل هذه التطبيقات باستخدام TryAddScoped، مما يعني أن تطبيقات الوحدات الحقيقية تتجاوزها عند النشر. إذا فشلت وحدة في التحميل، يُبقي NoOp النظام على قيد الحياة بصمت. تكتشف تشخيصات بدء التشغيل متى تظل الواجهات الحيوية في حالة NoOp وتُصدر تحذيرات LogCritical.",
      noopWarning:
        "تحذير أمني بالغ: إذا بقي IFeatureChecker في الإنتاج كـ NoOpFeatureChecker، ستبدو جميع ميزات الإصدار مُفعَّلة وجميع الحصص غير محدودة لكل مستأجر. تُصدر تشخيصات بدء التشغيل سجل LogCritical، لكن هذا لا يوقف الخادم. تحقق دائمًا من تحميل وحدة Entitlements عند استخدام بوابة الميزات المبنية على الاشتراكات.",
      noopTableTitle: "سجل تطبيقات NoOp",

      featureCheckTitle: "FeatureCheckBehavior — نقطة البوابة",
      featureCheckIntro:
        "FeatureCheckBehavior هو سلوك خط أنابيب AstraFlow يعترض الأوامر التي تُنفذ IRequireFeature. يُحل معرف المستأجر من سياق المستخدم الحالي، ويستدعي IFeatureChecker.IsEnabledAsync، ثم يمرر الطلب أو يُعيد نتيجة 403 ممنوع. بما أنه يستخدم IFeatureChecker (لا فئة فعلية)، فإنه يعمل بشفافية سواء تم نشر Entitlements أم لا. عند غياب Entitlements، يُعيد NoOpFeatureChecker القيمة true لكل فحص، مما يجعل السلوك ممرًا شفافًا بلا أعباء.",
      featureCheckFlowTitle: "تدفق قرار FeatureCheck",
      featureCheckCodeTitle: "إضافة أمر إلى بوابة الميزات",

      subscriptionEventTitle: "SubscriptionChangedEvent — العمود الفقري لمزامنة الصلاحيات",
      subscriptionEventIntro:
        "SubscriptionChangedEvent هو أهم حدث مجال متقاطع في SCRIPE. يُنشره Entitlements ويُعالجه Identity. يحمل مجموعة الميزات الفعالة الكاملة وحالة الاشتراك وبيانات الحزمة الموسعة مسبقًا. يستخدم Identity هذا الحدث لإعادة بناء مجموعة صلاحيات المستأجر بالكامل — بإضافة صلاحيات الوحدات المُفعَّلة حديثًا وإزالة صلاحيات الوحدات المُعطَّلة. هكذا يتحول تغيير الفوترة في Entitlements إلى تغيير في الصلاحيات في Identity دون أي اقتران مباشر بين الوحدات.",
      subscriptionEventDefTitle: "تعريف الحدث",
      subscriptionEventTriggersTitle: "جميع الأوامر التي تُنشر هذا الحدث",

      permSyncTitle: "دورة حياة مزامنة الصلاحيات — خطوة بخطوة",
      permSyncIntro:
        "عند تغيير اشتراك المستأجر، تُنفَّذ دورة حياة دقيقة من 5 خطوات لإعادة بناء مجموعة صلاحياته. يُعدّ فهم هذه الدورة ضروريًا لتشخيص مشاكل الصلاحيات وتصميم ميزات جديدة مدفوعة بالاشتراكات.",
      permSyncStep1Title: "الخطوة 1 — يحل Entitlements ميزات الإصدار",
      permSyncStep1Content:
        "يُحل معالج أمر Entitlements (مثل AssignEditionCommandHandler) خريطة الميزات الفعالة الكاملة للمستأجر. تدمج هذه الخريطة الميزات الأساسية للإصدار مع أي تجاوزات TenantFeatureOverrides وإضافات ميزات BundleExpansion. النتيجة قاموس مسطح من اسم الميزة إلى القيمة. منه يُشتق أسماء الوحدات المُفعَّلة.",
      permSyncStep2Title: "الخطوة 2 — نشر الحدث عبر Outbox",
      permSyncStep2Content:
        "يُرفع SubscriptionChangedEvent على الكيان كحدث مجال. يلتقطه OutboxInterceptor الخاص بـ EF Core قبل SaveChangesAsync. يُحفظ الحدث في جدول OutboxMessages في نفس معاملة قاعدة البيانات كتغيير الاشتراك. بعد الإيداع، يُرسل OutboxProcessor الحدث إلى جميع المعالجين المسجلين. هذا يضمن التسليم مرة واحدة بالضبط حتى لو تعطل العملية في منتصف التنفيذ.",
      permSyncStep3Title: "الخطوة 3 — معالج Identity يعالج الحدث",
      permSyncStep3Content:
        "يستقبل SubscriptionChangedEventHandler في Identity.Application الحدث. إذا كانت IsRevocation صحيحة، يستدعي SyncPermissionsForModulesAsync بقائمة وحدات فارغة، مما يُزيل جميع صلاحيات الإصدار. في الحالة غير الإلغائية، يزامن الصلاحيات لجميع الوحدات المُفعَّلة ويعالج كل BundleExpansion.",
      permSyncStep4Title: "الخطوة 4 — ITenantPermissionManager يزامن المجموعة",
      permSyncStep4Content:
        "يُنفذ Identity.Infrastructure.TenantPermissionManager واجهة ITenantPermissionManager. يستخدم IPermissionReader للحصول على جميع معرفات الصلاحيات للوحدات المُفعَّلة من قاعدة بيانات Identity. يُصفيها بـ RequiredFeature، ثم يُحدد الفرق ويُضيف المفقودة ويُزيل الزائدة بشكل ذري.",
      permSyncStep5Title: "الخطوة 5 — إبطال ذاكرة التخزين المؤقت للصلاحيات",
      permSyncStep5Content:
        "بعد مزامنة مجموعة الصلاحيات، يُستدعى IAdminPermissionCache.InvalidateAll() للمستأجر. تُمسح مجموعة الصلاحيات المخزنة مؤقتًا لكل مسؤول من الذاكرة المحلية وذاكرة Redis. في طلب API التالي، يعيد AuthorizationBehavior تحميل الصلاحيات من قاعدة البيانات ويُعيد ملء الذاكرة المؤقتة.",

      loginEnrichTitle: "إثراء استجابة تسجيل الدخول — ISubscriptionStatusProvider",
      loginEnrichIntro:
        "يحتاج معالج تسجيل الدخول في Identity إلى إعادة حالة اشتراك المستأجر حتى يتمكن الواجهة الأمامية من عرض تحذيرات فترة السماح وعروض الترقية وشارات الإصدار. لكن Identity لا يمكنه استيراد Entitlements. الحل: يُحقن ISubscriptionStatusProvider في معالج تسجيل الدخول. تُنفذ Entitlements.Infrastructure هذه الواجهة، وتُعيد TenantSubscriptionInfo بالحالة واسم الإصدار ومرحلة السماح وتاريخ الانتهاء.",
      loginEnrichNote:
        "إذا لم يتم نشر Entitlements، يُعيد تطبيق NoOp القيمة null لمعلومات الاشتراك. ستحتوي استجابة تسجيل الدخول على حقول اشتراك null، ولن تعرض الواجهة الأمامية أي حالة اشتراك — وهو سلوك آمن وصحيح للنشر بدون فوترة.",

      deployTopologyTitle: "تأثير طوبولوجيا النشر",
      deployTopologyIntro:
        "يتحكم متغير البيئة MODULE_NAME في الوحدات التي يتم تحميلها. هذا يغير جذريًا كيفية عمل التواصل بين الوحدات. يدعم وضع المونوليث جميع أنماط التعاون. أما وضع الخدمات المصغرة فله قيود حيوية يجب فهمها قبل استخراج الوحدات.",
      monolithMode: 'وضع المونوليث (MODULE_NAME="")',
      microserviceMode: 'وضع الخدمة المصغرة (MODULE_NAME="Identity")',
      microserviceCaution:
        "حرج: يُحظر التسجيل الذاتي عند بدء التشغيل في وضع الخدمات المصغرة. يحتوي PostBuildInitialization.cs على حارس G15 يُطلق InvalidOperationException إذا كان Signup:Enabled=true ومُحدَّد MODULE_NAME (غير بوابة). تعتمد ملحمة التسجيل على SignupCheckoutCompletedEvent وSubscriptionChangedEvent الموزَّعَين داخليًا. في وضع الخدمات المصغرة، تُفقد هذه الأحداث بصمت. خارطة طريق الإصدار الثاني: صندوق البريد الصادر + ناقل الرسائل سيسد هذه الثغرة.",

      coDependencyTitle: "خريطة الاعتماد المتبادل بين الوحدات",
      coDependencyIntro:
        "يُوثق هذا الجدول كل اعتماد رسمي بين الوحدات، ويُظهر بالضبط ما تحتاجه كل وحدة من الأخرى وكيف يُلبَّى هذا الاحتياج عبر واجهات Core. استخدمه كمرجع عند التخطيط لاستخراج الخدمات المصغرة أو عند تشخيص مشاكل تدفق البيانات المتقاطعة.",

      signupSagaTitle: "ملحمة التسجيل الذاتي متعددة الوحدات",
      signupSagaIntro:
        "التسجيل الذاتي للمستأجر B2B2C هو الملحمة المتقاطعة الأكثر تعقيدًا في SCRIPE. تمتد عبر Identity (توفير المستأجر) وEntitlements (ربط الاشتراك والفوترة) وStripe (معالجة الدفع). فهم هذا التدفق أساسي لدعم العملاء وصيانة البنية التحتية للتسجيل.",
      signupMonolithOnly:
        "مونوليث فقط: تستخدم ملحمة التسجيل أحداث مجال داخلية (SignupPhase1CompletedEvent وSignupCheckoutCompletedEvent وSubscriptionChangedEvent) تتجاوز حدود Identity وEntitlements. هذا يعمل فقط عندما تعمل كلتا الوحدتين في نفس العملية. يحظر وضع الخدمات المصغرة التسجيل عند بدء التشغيل عبر الحارس G15 في PostBuildInitialization.cs.",
      signupStep1Title: "المرحلة 1 — Identity يُوفِّر المستأجر",
      signupStep1Content:
        "يُنفَّذ RegisterTenantSelfServiceCommand (في وحدة Identity) في معاملة قاعدة بيانات ذرية واحدة. ينشئ كيان المستأجر ويُعدّ النطاق الفرعي والعلامة التجارية الافتراضية ويُوفر أدوار الأمان الافتراضية وينشئ حساب المسؤول المالك. عند النجاح، ينشر SignupPhase1CompletedEvent.",
      signupStep2Title: "المرحلة 2 — Entitlements يربط الاشتراك",
      signupStep2Content:
        "يعالج SignupPhase1CompletedEventHandler (في وحدة Entitlements) الحدث. ينشئ سجل TenantSubscription للإصدار المختار. إذا كان الإصدار مجانيًا، يُفعَّل فورًا وينشر SubscriptionChangedEvent لمنح الصلاحيات. إذا كان الإصدار مدفوعًا، ينشئ جلسة Stripe Checkout ويُعيد رابط الدفع.",
      signupStep3Title: "المرحلة 3 — Stripe يؤكد، Entitlements يُفعِّل",
      signupStep3Content:
        "عند إتمام المستخدم الدفع عبر Stripe، يُرسل Stripe خطاف checkout.session.completed. يعالج StripeWebhookHelper الحدث، يجد SignupSession المقابلة، يُفعِّل الاشتراك وينشر SubscriptionChangedEvent. يمنح معالج Identity جميع صلاحيات الإصدار لمجموعة صلاحيات المستأجر الجديد.",
      signupStep4Title: "التعويض — في حال التخلي عن الدفع",
      signupStep4Content:
        "إذا تخلى المستخدم عن دفع Stripe، يُستدعى CompensatePhase1Async لحذف المستأجر المُوفَّر وحساب المسؤول، مما يمنع الحسابات المعلقة. يعمل SignupReconciliationSweepJob يوميًا لتنظيف التسجيلات غير المكتملة.",

      devChecklistTitle: "قائمة تحقق المطور — إضافة اعتماد متقاطع جديد",
      devChecklistIntro:
        "عند الحاجة إلى مشاركة البيانات بين وحدتين، اتبع هذا النمط بالضبط. لا تستورد وحدة من أخرى أبدًا. اذهب دائمًا عبر Core.Application.Abstractions.",
      checkStep1Title: "1. عرِّف العقد في Core.Application.Abstractions",
      checkStep1Content:
        "أنشئ ملف واجهة جديدًا في Core.Application/Abstractions/. يجب أن تكون الواجهة في أدنى حد — فقط ما تحتاجه الوحدة المستهلكة فعليًا. أضف توثيق XML يوضح أي وحدة تُنفذها وأيها تستهلكها.",
      checkStep2Title: "2. سجِّل NoOp في Core.Infrastructure",
      checkStep2Content:
        "أنشئ تطبيق NoOp في Core.Infrastructure/Services/. سجِّله باستخدام TryAddScoped في Core.Infrastructure/DependencyInjection.cs. يجب أن يُعيد NoOp قيمة آمنة محايدة (null أو فارغة أو false أو -1 للقيم غير المحدودة). لا تستخدم NotImplementedException في NoOp أبدًا.",
      checkStep3Title: "3. نفِّذه في Infrastructure الوحدة الهدف",
      checkStep3Content:
        "أنشئ التطبيق الحقيقي في {Module}.Infrastructure/CrossModule/ أو {Module}.Infrastructure/Services/. سجِّله باستخدام AddScoped (ليس TryAddScoped) في DependencyInjection.cs للوحدة. استخدام AddScoped يضمن تجاوز التطبيق الحقيقي للـ NoOp المسجل أولًا بواسطة Core.",
      checkStep4Title: "4. أضف تشخيص بدء التشغيل في PostBuildInitialization.cs",
      checkStep4Content:
        "أضف فحصًا في PostBuildInitialization.cs لاكتشاف ما إذا كانت الواجهة لا تزال تحل كـ NoOp. سجِّل تحذيرًا LogCritical إذا كان كذلك. هذا هو شبكة الأمان التي تُنبه المطورين إلى عمليات النشر الخاطئة في الإنتاج دون إيقاف الخادم.",
      addScopedTip:
        "استخدم دائمًا AddScoped (ليس TryAddScoped) عند تسجيل تطبيقات الوحدات الحقيقية. TryAddScoped يسجل فقط إذا لم يكن هناك تسجيل موجود — وCore.Infrastructure سجّل بالفعل NoOp باستخدام TryAddScoped أولًا. للتجاوز، تحتاج إلى AddScoped غير المشروط.",

      // NoOp Registration
      noopRegistrationTitle: "تسجيل NoOp — TryAddScoped مقابل AddScoped",
      noopRegistrationIntro:
        "تعتمد آلية التجاوز بالكامل على قاعدة واحدة حاسمة: تُسجّل Core.Infrastructure الـ NoOps باستخدام TryAddScoped، بينما تُسجّل تطبيقات الوحدات الحقيقية باستخدام AddScoped. نظرًا لأن TryAddScoped لا يُسجّل إلا إذا لم تكن هناك خدمة مُسجَّلة بعد، فإن استدعاء AddScoped بعده يُلغيه دون شروط. الترتيب مهم: تُحمَّل Core.Infrastructure دائمًا أولًا (إذ إنها تبعية متعدية لجميع مشاريع Infrastructure الخاصة بالوحدات)، لذا يُسجَّل الـ NoOp أولًا دائمًا، وتفوز التطبيقات الحقيقية للوحدة دائمًا.",

      // Startup Diagnostics
      startupDiagnosticsTitle: "تشخيصات بدء التشغيل — اكتشاف تسرب NoOp",
      startupDiagnosticsIntro:
        "يعمل PostBuildInitialization.cs بعد بناء حاوية الحقن وتسجيل جميع الوحدات. يتحقق من النوع المُحلَّل للواجهات الحرجة. إذا كان النوع المُحلَّل لا يزال تطبيق NoOp، فإنه يُسجّل رسالة LogCritical. هذا هو شبكة الأمان في الإنتاج — لا تُوقف الخادم، لكنها تُنتج تنبيهًا مرئيًا في السجلات ولوحات المراقبة يمكن للمشغلين التصرف بناءً عليه فورًا.",

      // IRequireFeature Interface
      requireFeatureInterfaceTitle: "IRequireFeature — واجهة الوصول الاختياري",
      requireFeatureInterfaceIntro:
        "IRequireFeature هي واجهة علامة لا تُكلّف أي عبء. الأوامر التي تُطبّقها تختار بوابة الميزات المعتمدة على الإصدار عبر FeatureCheckBehavior. الأوامر التي لا تُطبّقها تمر عبر السلوك دون أي عبء. يعني هذا التصميم أن بوابة الميزات صريحة واختيارية — لا يُقيَّد أي أمر موجود بشكل عرضي، والأوامر الجديدة تُصرّح بمتطلبات ميزاتها بوعي.",

      // Event Triggers
      eventTriggersTitle: "جميع الأوامر التي تنشر SubscriptionChangedEvent",
      eventTriggersIntro:
        "يُنشَر SubscriptionChangedEvent من قِبَل أي أمر أو خدمة في Entitlements تُغيّر حالة اشتراك المستأجر. يوثّق الجدول التالي كل نقطة تشغيل في النظام. فهم هذه القائمة ضروري لتصحيح أخطاء مزامنة الأذونات — إذا كانت أذونات مستأجر خاطئة، فأحد هذه المُشغِّلات هو مصدر آخر مزامنة.",

      // Signup Event Chain
      signupEventChainTitle: "سلسلة أحداث التسجيل — تدفق الأحداث عبر الوحدات",
      signupEventChainIntro:
        "تعبر رحلة التسجيل حدود الوحدات عبر ثلاثة أحداث نطاق داخلية. ينتقل SignupPhase1CompletedEvent من Identity إلى Entitlements. ينتقل SignupCheckoutCompletedEvent داخل Entitlements (من Stripe webhook إلى التفعيل). ينتقل SubscriptionChangedEvent من Entitlements مرة أخرى إلى Identity. هذه السلسلة الثنائية الاتجاه هي سبب عمل التسجيل فقط في وضع الـ monolith — تتطلب الأحداث الثلاثة وجود كلتا الوحدتين في نفس العملية.",

      // Bundle Expansion
      bundleExpansionTitle: "توسعة الحزم — منح أذونات دقيقة",
      bundleExpansionIntro:
        "تتيح توسعة الحزم لإصدار ما منح أو رفض أكواد أذونات محددة تتجاوز تفعيل مستوى الوحدة الذي يحمله SubscriptionChangedEvent. عند احتواء اشتراك ما على حزم، يحمل SubscriptionChangedEvent إدخالات BundleExpansionDto مُوسَّعة مسبقًا. يعالج معالج الأحداث في Identity كل حزمة بشكل منفصل عبر ITenantPermissionManager.SyncBundlePermissionsAsync، الذي يُقارن أكواد المنح والرفض مقابل مجموعة أذونات المستأجر الحالية.",
      bundleExpansionNote:
        "تُعالَج توسعات الحزم بعد مزامنة أذونات الوحدة الرئيسية. إذا تعارض كود منح الحزمة مع إزالة إذن وحدة (أي أن الوحدة معطّلة لكن الحزمة تحاول منح إذن منها)، فإن إلغاء الوحدة يسود. لا يمكن لتوسعات الحزم إعادة منح أذونات من وحدات معطّلة.",

      // IAdminPermissionCache
      adminPermCacheTitle: "IAdminPermissionCache — ذاكرة التخزين المؤقت للتفويض",
      adminPermCacheIntro:
        "IAdminPermissionCache هي ذاكرة التخزين المؤقت Redis من جانب الخادم التي يستخدمها AuthorizationBehavior للتحقق من الأذونات دون الوصول إلى قاعدة البيانات في كل طلب. تخزّن لقطة مُبسَّطة من أذونات كل مدير وأدواره وإسقاطات حقوله. تُملأ إدخالات الذاكرة المؤقتة بشكل كسول عند أول طلب بعد عدم الإصابة. يُستدعى InvalidateAll() بعد عمليات مزامنة الأذونات الجماعية (معالجة SubscriptionChangedEvent) لإجبار جميع المديرين على إعادة التحميل عند طلبهم التالي.",

      // ICurrentUser
      currentUserTitle: "ICurrentUser — الواجهة الشاملة عبر القطاعات",
      currentUserIntro:
        "ICurrentUser هي الواجهة الوحيدة التي تستخدمها كل وحدة مباشرة — إنها ليست جسر عبر الوحدات كالواجهات الأخرى، بل هي اهتمام مشترك جوهري متاح في كل مكان. تُملأ بواسطة برمجية JWT في Identity عند كل طلب مُصادَق عليه وتوفر سياق المدير/المستخدم الحالي لأي معالج في أي وحدة. تعتمد كل وحدة على Core.Application التي تُعرّف ICurrentUser، لذا فهي متاحة دائمًا دون أي تعقيدات عبر الوحدات.",
      currentUserNote:
        "تختلف ICurrentUser عن واجهات التعاون الأخرى عبر الوحدات. تُملأ بواسطة برمجية Identity وتُستهلك عالميًا. لا تحتاج إلى بديل NoOp — فهي مُطبَّقة دائمًا بواسطة برمجية JWT في Core.Infrastructure بغض النظر عن الوحدات المُحمَّلة. إنها الاستثناء الوحيد لنمط NoOp.",

      // Feature Resolution
      featureResolutionTitle: "سلسلة دقة قيمة الميزة",
      featureResolutionIntro:
        "عند استدعاء IFeatureChecker.IsEnabledAsync() لمستأجر وميزة ما، يُحلّ Entitlements القيمة عبر سلسلة أولويات. TenantFeatureOverride (تجاوز يدوي لكل مستأجر) يفوز دائمًا. إذا لم يكن هناك تجاوز، تُستخدم قيمة EditionFeature. إذا لم يُعرّف الإصدار الميزة، تُستخدم Feature.DefaultValue. بالنسبة للميزات الرقمية ذات الاشتراكات النشطة المتعددة (تجريبي + خطة أساسية)، تفوز القيمة الأعلى. بالنسبة للميزات البوليانية، تفوز القيمة true. بالنسبة للميزات النصية، يفوز اشتراك Base.",

      // Architecture Rules
      archRulesTitle: "تعاون الوحدات — ملخص قواعد البنية",
      archRulesIntro:
        "هذه هي القواعد الملزمة لجميع الاتصالات عبر الوحدات في SCRIPE. تُطبَّق بواسطة scripe arch-check (فحص عميق بـ30 قاعدة)، وقيود مراجع المشاريع في ملف .sln، ومراجعة الكود. انتهاكات هذه القواعد تُنشئ تبعيات دائرية وتزاوج النشر واستحالة الاختبار.",
      doTitle: "✅ افعل هذا",
      dontTitle: "❌ لا تفعل هذا أبدًا",

      // Security Boundary
      securityBoundaryTitle: "تطبيق حدود الأمان",
      securityBoundaryIntro:
        "قواعد عزل الوحدات ليست مجرد تفضيل معماري — إنها حدود أمان. يضمن عزل الوحدات أن الخطأ أو الاختراق في وحدة واحدة لا يمكنه الوصول المباشر إلى مخزن بيانات وحدة أخرى. تُطبَّق هذه القواعد على مستويات متعددة: قيود مراجع المشاريع، وقواعد lint المعمارية، وقوائم مراجعة الكود.",
      archCheckCaution:
        "شغّل scripe arch-check قبل كل PR يلمس كود الوحدات المتقاطعة. علامة --json تخرج بكود 1 إذا وُجدت أي انتهاكات حرجة، مما يجعلها مناسبة كبوابة CI. انتهاكات البنية أرخص بكثير في الإصلاح عند مراجعة PR مقارنة بعد النشر.",

      // MODULE_NAME env
      moduleNameEnvTitle: "مرجع متغير بيئة MODULE_NAME",
      moduleNameEnvIntro:
        "يُضبَط متغير البيئة MODULE_NAME عند بدء تشغيل الحاوية ويحدد الوحدات المُحمَّلة في العملية. يقرأ ملف ModuleRegistration.cs في Host/API هذا المتغير ويُسجّل بشكل مشروط تسجيلات DI الخاصة بالوحدة المحددة وDbContext الخاص بها فقط. عندما يكون فارغًا (الافتراضي)، تُسجَّل جميع الوحدات — وهو وضع الـ monolith الذي يدعم جميع أنماط التعاون عبر الوحدات.",
    },
    crossModule: {
      title: "التعاون العميق بين الوحدات",
      description:
        "كيف تتعاون وحدتا Identity وEntitlements دون استيراد إحداهما للأخرى — عبر تجريدات Core.Application وIRequireFeature وسلوكيات AstraFlow.",
      intro:
        "يجب على وحدتي Identity وEntitlements في SCRIPE التعاون بشكل وثيق: تُقيّد Entitlements الميزات التي تستهلكها أوامر Identity؛ وتمتلك Identity الصلاحيات التي يجب على Entitlements مزامنتها عند تغيير الاشتراك. لكنهما لا تستطيعان استيراد إحداهما الأخرى — فعل ذلك سيُنشئ تبعية دائرية. الحل هو طبقة Core.Application: جسر محايد يُعرّف عقود الواجهات المكتوبة التي تعتمد عليها كلتا الوحدتين، لكن لا تملكها أي منهما.",
      bridgeTitle: "الجسر ذو الثلاث طبقات",
      bridgeContent:
        "مساحة الأسماء Core.Application.Abstractions هي قلب التواصل عبر الوحدات. تُعرّف أكثر من 32 عقد واجهة. تُطبّق كل من Identity.Infrastructure وEntitlements.Infrastructure جانبها المعني. تستهلك سلوكيات AstraFlow pipeline ومعالجات الوحدات هذه الواجهات فقط — وليس التطبيقات الفعلية. هذا يعني أن النظام يُجمَّع ويعمل بشكل متطابق سواء تم نشر Entitlements أم لا.",
      gridCoreTitle: "تجريدات Core.Application",
      gridCoreDesc:
        "أكثر من 32 عقد واجهة مكتوبة (IFeatureChecker وITenantPermissionManager وICurrentUser) تعتمد عليها كلتا الوحدتين لكن لا تملكها أي منهما.",
      gridEventsTitle: "أحداث المجال",
      gridEventsDesc:
        "ترفع الكيانات أحداث المجال (AdminCreatedEvent وSubscriptionChangedEvent). تعالجها الوحدات الأخرى عبر INotificationHandler دون أي استيراد مباشر.",
      gridPipelineTitle: "AstraFlow Pipeline",
      gridPipelineDesc:
        "يُطبّق FeatureCheckBehavior وAuthorizationBehavior سياسات الوحدات المتقاطعة تلقائيًا لكل أمر — صفر من الكود المتكرر في المعالجات.",
      coreAbstractionsTitle: "تجريدات Core.Application",
      coreAbstractionsContent:
        "تعيش كل من IFeatureChecker وITenantPermissionManager وITenantContext في Core.Application — مشروع تعتمد عليه كل من Identity وEntitlements. لا تستورد أي وحدة الأخرى. بدلًا من ذلك، تعتمد كلتاهما على طبقة العقد المشتركة هذه. تُسجّل Core.Infrastructure تطبيقات NoOp مع TryAddScoped؛ تتجاوزها تطبيقات الوحدات الحقيقية مع AddScoped.",
      requireFeatureTitle: "IRequireFeature: تقييد الميزات في الأوامر",
      requireFeatureContent:
        "تُطبّق الأوامر IRequireFeature للإعلان عن أنها تتطلب تفعيل ميزة معينة للمستأجر الحالي. يعترض FeatureCheckBehavior في AstraFlow pipeline هذه الأوامر تلقائيًا في الموضع 4، ويستدعي IFeatureChecker.CheckQuotaAsync، ويُرجع نتيجة Forbidden إذا فشل الفحص — قبل أن يعمل المعالج. هذا يعني صفر من كود فحص الميزات في أي معالج.",
      pipelineTitle: "ترتيب تنفيذ AstraFlow Pipeline",
      pipelineContent:
        "يتدفق كل أمر واستعلام في SCRIPE عبر 7 سلوكيات pipeline بترتيب صارم. الترتيب ليس اعتباطيًا — يجب أن يعمل Validation قبل Authorization (لا ينبغي للمدخلات السيئة الوصول إلى فحوصات المصادقة)، ويجب أن يعمل FeatureCheck بعد Authorization (فقط الطلبات المصادق عليها يجب أن تتكبد تكلفة فحص الميزات). يعمل المعالج فقط إذا مرّت السلوكيات الـ6 السابقة بنجاح.",
      eventFlowTitle: "تدفق أحداث المجال: إشعار عبر الوحدات",
      eventFlowContent:
        "عندما يكتمل معالج الأمر، يرفع أحداث المجال عبر entity.AddDomainEvent(). يلتقط OutboxInterceptor في EF Core هذه الأحداث في نفس المعاملة الخاصة بطفرة الكيان. يُرسلها OutboxProcessor لاحقًا إلى تطبيقات INotificationHandler المسجلة. يمكن لمعالج Entitlements الاشتراك في AdminCreatedEvent (التي رفعتها Identity) دون استيراد Identity من Entitlements.",
      realWorldTitle: "الواقع العملي: Identity ↔ Entitlements",
      realWorldContent:
        "يوضح الجدول التالي من يمتلك ماذا في علاقة Identity–Entitlements وكيف تصل إليه الوحدة الأخرى. لا تصل أي وحدة إلى مخزن بيانات وحدة أخرى مباشرة. يمر جميع الوصول عبر واجهات Core.Application، التي يحلها حاوية DI إلى التطبيق المناسب في وقت التشغيل.",
      keyInsightTip:
        "الفكرة الأساسية: لا تستورد Identity وحدة Entitlements أبدًا، ولا تستورد Entitlements وحدة Identity أبدًا. يعتمد كلاهما فقط على Core.Application — الأرضية المشتركة المحايدة. هذا يُتيح النشر المستقل والاختبار المعزول وصفر من مخاطر التبعية الدائرية.",
    },
  },
};
