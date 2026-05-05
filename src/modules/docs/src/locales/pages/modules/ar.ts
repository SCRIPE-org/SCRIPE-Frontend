/**
 * Docs modules — AR
 * Auto-filled 75 keys from EN.
 */
export const ar = {
  modules: {
    entitlementsOverview: {
      title: "نظرة عامة على الاستحقاقات",
      description:
        "بوابة الميزات المبنية على الإصدارات مع الميزات والإصدارات والاشتراكات والتجاوزات لكل مستأجر.",
      intro:
        "وحدة الاستحقاقات هي محرك إدارة الخطط والميزات في NEXORA. تحدد ما هي القدرات التي يحصل عليها كل مستأجر، وكيف تجمع الخطط (الإصدارات) تلك القدرات، وكيف تربط الاشتراكات المستأجرين بالخطط.",
      whatIsTitle: "ما هي الاستحقاقات؟",
      whatIsIntro:
        "الاستحقاقات هي الوحدة المسؤولة عن التحكم في الميزات التي يمكن لكل مستأجر الوصول إليها بناءً على الإصدار المشترك فيه. توفر سلسلة حل ثلاثية المستويات: القيم الافتراضية ← قيم الإصدار ← تجاوزات المستأجر.",
      architectureTitle: "البنية",
      architectureIntro:
        "يتكون نظام الاستحقاقات من أربعة نطاقات مترابطة تعمل معاً لتقديم حل متكامل لبوابة الميزات.",
      domainsTitle: "أربعة نطاقات",
      domainsIntro: "يتعامل كل نطاق مع جانب محدد من دورة حياة الاستحقاقات:",
      resolutionTitle: "سلسلة حل قيم الميزات",
      resolutionIntro:
        "عندما يحتاج النظام لتحديد قيمة ميزة لمستأجر، يتبع سلسلة أولوية صارمة. المصدر الأعلى أولوية هو الذي يسود.",
      pipelineTitle: "التكامل مع المسار",
      pipelineIntro:
        "تدمج NEXORA الاستحقاقات مباشرة في مسار NEXORA mediator عبر FeatureCheckBehavior. الأوامر والاستعلامات التي تنفذ IRequireFeature يتم بوابتها تلقائياً.",
      pipelineTip:
        "لبوابة أمر خلف ميزة، قم ببساطة بتنفيذ IRequireFeature وعيّن RequiredFeatureName لمفتاح الميزة الثابت. لا حاجة لكود إضافي.",
      backendTitle: "هيكل الواجهة الخلفية",
      backendIntro:
        "تتبع الواجهة الخلفية للاستحقاقات تخطيط وحدة البنية النظيفة القياسي في NEXORA مع طبقات النطاق والتطبيق والبنية التحتية.",
      frontendTitle: "هيكل الواجهة الأمامية",
      frontendIntro:
        "تعكس الواجهة الأمامية الواجهة الخلفية بأربع وحدات فرعية (الإصدارات، الميزات، الاشتراكات، التجاوزات).",
      controllersTitle: "وحدات تحكم API",
      controllersIntro:
        "تكشف وحدة الاستحقاقات عن 31 نقطة نهاية API عبر 4 وحدات تحكم، جميعها مصادقة بـ JWT ومحمية بتفويض قائم على الأذونات.",
      noOpTitle: "البديل الاحتياطي NoOp",
      noOpIntro:
        "عندما لا يتم تحميل وحدة الاستحقاقات، تسجل NEXORA NoOpFeatureCache مما يسمح بمرور أوامر IRequireFeature دون أخطاء.",
      noOpNote:
        "يضمن البديل الاحتياطي NoOp أن الوحدات يمكنها استخدام IRequireFeature بدون اعتماد صارم على وحدة الاستحقاقات.",
      contextAwareTitle: "النطاق الواعي بالسياق",
      contextAwareIntro:
        "جميع صفحات الاستحقاقات (الميزات، الإصدارات، الأذونات) واعية بالسياق. تكتشف الواجهة الأمامية ما إذا كان المستخدم مسؤول نظام (tenantId فارغ)، مسؤول مستأجر، أو في وضع الغوص، وتستدعي نقاط نهاية خلفية مختلفة وفقاً لذلك. يرى مسؤولو النظام الكتالوج الكامل مع عمليات CRUD؛ بينما يرى مسؤولو المستأجرين بياناتهم الفعلية فقط في وضع القراءة.",
      resolutionTip:
        "The resolution chain is evaluated lazily — values are cached after first resolution and invalidated when subscriptions, editions, or overrides change.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "The Entitlements module registers 31 NEXORA request handlers spanning the four domains. Each command has a corresponding FluentValidation validator for input validation.",
      diTitle: "Dependency Injection Registration",
      diIntro:
        "All Entitlements services are registered via the AddEntitlementsModule extension method in DependencyInjection.cs. The module follows NEXORA's standard registration pattern.",
      comparisonTitle: "With vs Without Entitlements",
      comparisonIntro:
        "The following table shows the difference in capabilities when the Entitlements module is enabled versus running without it:",
      gettingStartedTitle: "Getting Started",
      gettingStartedIntro:
        "Follow these 5 steps to set up the Entitlements system for your platform. Each step builds on the previous one:",
    },
    editions: {
      title: "الإصدارات",
      description: "خطط اشتراك مسماة مع حزم ميزات وسياسات تجاوز الحدود وإصدارات واستراتيجيات طرح.",
      intro:
        "الإصدارات هي خطط مسماة (مثل Basic، Pro، Enterprise) تجمع قيم الميزات معاً. يشترك كل مستأجر في إصدار يحدد أذونات وصوله للميزات. تدعم الإصدارات الإصدار المتدرج مع استراتيجيات طرح متحكم بها.",
      entityTitle: "كيان الإصدار",
      entityIntro:
        "الإصدار هو خطة مسماة تجمع قيم الميزات. إصدارات النظام تُنشأ من قبل مسؤولي المنصة؛ إصدارات التجزئة تُنشأ من قبل مستأجري التجزئة.",
      overflowTitle: "سياسة تجاوز الحدود",
      overflowIntro:
        "عندما يتم تخفيض مستأجر إلى إصدار بحدود أقل، قد تتجاوز موارده الحالية الحدود الجديدة. تحدد سياسة التجاوز ما يحدث:",
      featuresTitle: "ميزات الإصدار",
      featuresIntro:
        "يحتوي كل إصدار على مجموعة من سجلات EditionFeature التي تربط الميزات بقيمها ضمن تلك الخطة.",
      versionsTitle: "إصدارات الإصدار",
      versionsIntro:
        "توفر إصدارات الإصدار نظام إصدار وطرح لتغييرات الميزات. بدلاً من تعديل الميزات مباشرة، يمكن للمسؤولين إنشاء إصدار جديد واختيار استراتيجية طرح ونشره.",
      rolloutTitle: "استراتيجيات الطرح",
      rolloutIntro: "عند نشر إصدار، يختار المسؤولون كيفية نشر التغييرات للمستأجرين المشتركين:",
      workflowTitle: "التطبيق الفوري مقابل الحفظ كإصدار",
      workflowIntro:
        "توفر NEXORA طريقتين لتحديث ميزات الإصدار، كل منهما مناسبة لسيناريوهات مختلفة:",
      workflowTip:
        "استخدم 'التطبيق الفوري' للإصلاحات العاجلة والتغييرات الصغيرة. استخدم 'الحفظ كإصدار' لتحديثات الخطط الكبيرة.",
      endpointsTitle: "نقاط نهاية API",
      endpointsIntro:
        "يكشف وحدة التحكم في الإصدارات عن 11 نقطة نهاية لإدارة الإصدارات وميزاتها ودورة حياة الإصدارات:",
      drillDownTitle: "سلوك الغوص في التفاصيل",
      drillDownIntro:
        "عندما يغوص مسؤول النظام في مستأجر، يتم تحديد نطاق قائمة الإصدارات تلقائياً لتظهر فقط الإصدارات المرئية لذلك المستأجر. يستخدم الخادم رأس X-Tenant-Context للتصفية: إصدارات النظام + إصدارات التجزئة المنشأة من قبل المستأجر المُغاص فيه. تخفي الواجهة الأمامية عمليات CRUD في وضع الغوص.",
      scopingTitle: "System vs Retail Editions",
      scopingIntro:
        "NEXORA supports two types of editions: System editions created by platform admins visible to all tenants, and Retail editions created by reseller tenants for their child tenants only.",
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
    },
    subscriptions: {
      title: "الاشتراكات",
      description:
        "ربط المستأجر بالإصدار مع إدارة دورة حياة كاملة، تسعير متعدد العملات، عروض ترويجية، تجارب، تخفيضات، سلوك انتهاء الصلاحية، وتصدير تحليلات متقدم.",
      intro:
        "تربط الاشتراكات المستأجرين بالإصدارات (الخطط). لكل مستأجر اشتراك أساسي يحدد إصداره، واختيارياً اشتراكات إضافية للقدرات الإضافية. يتعامل نظام الاشتراكات مع دورة الحياة الكاملة — مع دعم مدمج للتسعير متعدد العملات وتتبع الخصومات الترويجية.",
      entityTitle: "كيان الاشتراك",
      entityIntro:
        "يربط TenantSubscription المستأجر بإصدار مع تتبع دورة الحياة. يدعم أنواع وحالات اشتراك متعددة.",
      typesTitle: "أنواع الاشتراكات",
      typesIntro: "لكل اشتراك نوع يحدد دورة الفوترة وسلوكه:",
      lifecycleTitle: "دورة حياة الحالة",
      lifecycleIntro: "تنتقل الاشتراكات عبر سلسلة من الحالات خلال دورة حياتها:",
      downgradeTitle: "تتبع التخفيض",
      downgradeIntro:
        "عندما يتم تخفيض مستأجر، يتتبع النظام تفاصيل الاشتراك الأصلي للتدقيق والاستعادة المحتملة.",
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
        "تنشر أحداث دورة حياة الاشتراك أحداث نطاق تستهلكها وحدة الهوية. عند تعليق اشتراك، يتم تعطيل جميع مسؤولي المستأجر مع DeactivationReason='SubscriptionSuspended'. عند الاستئناف، يُعاد تفعيل المسؤولين المعطلين بسبب التعليق فقط.",
      crossModuleReasons:
        "ثلاثة أسباب للتعطيل: 'يدوي' (لا يُعاد تفعيله تلقائياً)، 'SubscriptionSuspended' (يُعاد تفعيله عند الاستئناف)، 'SubscriptionExpired' (يُعطَّل عند انتهاء الصلاحية).",
      impactTitle: "تحليل تأثير التخفيض",
      impactIntro:
        "قبل تغيير إصدار المستأجر، استخدم نقطة نهاية تأثير التخفيض لمعاينة الموارد التي ستتجاوز الحدود.",
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
        "تميز NEXORA بين ميزات النظام (المزروعة عند بدء التشغيل، للقراءة فقط) والميزات المخصصة (المنشأة من قبل المسؤولين):",
      cacheTitle: "ذاكرة التخزين المؤقت للميزات",
      cacheIntro:
        "تُخزن قيم الميزات المحلولة مؤقتاً في IFeatureCache لتجنب استعلامات قاعدة البيانات عند كل طلب.",
      requireFeatureTitle: "واجهة IRequireFeature",
      requireFeatureIntro:
        "لبوابة أمر أو استعلام CQRS خلف ميزة، نفذ واجهة IRequireFeature. يقوم سلوك FeatureCheckBehavior تلقائياً بحل القيمة الحالية للمستأجر.",
      requireFeatureNote:
        "يعمل IRequireFeature مع كل من ميزات Boolean (التحقق من التمكين/التعطيل) والميزات الرقمية (التحقق من الحصة المتبقية).",
      endpointsTitle: "نقاط نهاية API",
      contextAwareTitle: "عرض الميزات الواعي بالسياق",
      contextAwareIntro:
        "صفحة قائمة الميزات واعية بالسياق. يرى مسؤولو النظام كتالوج الميزات الكامل مع عمليات CRUD. أما مسؤولو المستأجرين وجلسات الغوص فيرون فقط الميزات الفعلية للمستأجر (المحلولة من الإصدار + التجاوزات) في وضع القراءة فقط. يتم كل ذلك عبر الخادم عبر GET /features (الكتالوج) مقابل GET /features/effective (النطاق حسب المستأجر).",
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
      description: "تخصيص قيم الميزات لكل مستأجر يتجاوز إعدادات الإصدار الافتراضية.",
      intro:
        "تتيح تجاوزات الميزات لمسؤولي المنصة تخصيص قيم الميزات للمستأجرين الأفراد بغض النظر عن الإصدار المشترك فيه.",
      entityTitle: "كيان التجاوز",
      entityIntro:
        "يعيّن TenantFeatureOverride قيمة مخصصة لميزة محددة على مستأجر محدد مع حقل سبب اختياري للتدقيق.",
      priorityTitle: "أولوية الحل",
      priorityIntro:
        "تقع التجاوزات في أعلى سلسلة الحل. عندما يحل النظام قيمة ميزة لمستأجر، يتحقق من التجاوز أولاً:",
      whenTitle: "متى تستخدم التجاوزات",
      whenIntro:
        "صُممت التجاوزات للحالات الاستثنائية حيث يحتاج المستأجر لقيمة مختلفة عما يوفره إصداره:",
      useCase1: "صفقات المؤسسات المخصصة — 'أعطِ شركة Acme 500 مشرف بدلاً من الـ 50 القياسية'",
      useCase2: "العروض الترويجية — 'فعّل الدردشة المتقدمة لهذا المستأجر لمدة 30 يوماً'",
      useCase3: "الاختبار التجريبي — 'فعّل وحدة الفوترة الجديدة للمتبنين المبكرين'",
      useCase4: "التصعيد المؤقت — 'ارفع حد رفع الملفات خلال عملية الترحيل'",
      overuseWarning:
        "يجب استخدام التجاوزات بحذر. إذا احتاج العديد من المستأجرين لنفس التجاوز، فكر في إنشاء إصدار جديد بدلاً من ذلك.",
      resolvedTitle: "نقطة نهاية الميزات المحلولة",
      resolvedIntro:
        "تُرجع نقطة نهاية الميزات المحلولة القيمة الفعلية النهائية لكل ميزة لمستأجر معين مع مصدر الحل.",
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
    },
    compliance: {
      overview: {
        title: "وحدة الامتثال",
        description: "أتمتة الامتثال لـ GDPR وCCPA وPDPA — بروفايلات اللوائح، إدارة طلبات الموضوعات، الموافقة، الاحتفاظ بالبيانات، الجرد، وإنشاء التقارير.",
        intro: "وحدة الامتثال هي محرك الامتثال التنظيمي المدمج في NEXORA. تساعد مشغلي المنصة ومستأجريهم على الالتزام بأبرز قوانين حماية البيانات (GDPR وCCPA وPDPA) من خلال أدوات مؤتمتة لإدارة طلبات الموضوعات وسجلات الموافقة وسياسات الاحتفاظ وإنشاء تقارير جاهزة للتدقيق.",
        infoTitle: "ملاحظة الامتثال",
        infoContent: "تعتبر وحدة الامتثال حاسمة للحفاظ على الالتزام التنظيمي وتجنب الغرامات. تأكد من ربط جميع الميزات بشكل صحيح بسياسات معالجة البيانات.",
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
        tr2_2: "يعرض لقطة الموافقة غير القابلة للتغيير إلى جانب وكيل المستخدم والبيانات الوصفية للطابع الزمني.",
        whatIsTitle: "ما هي وحدة الامتثال؟",
        whatIsIntro: "توفر وحدة الامتثال ستة أنظمة فرعية مترابطة تغطي دورة حياة الامتثال الكاملة. بدلاً من بناء أدوات الامتثال من الصفر، يحصل مستأجرو NEXORA على نظام جاهز للإنتاج يتتبع ويؤتمت ويُعلم عن التزاماتهم بحماية البيانات.",
        subModulesTitle: "ستة أنظمة فرعية",
        subModulesIntro: "يتعامل كل نظام فرعي مع مجال امتثال محدد:",
        sub1: "بروفايلات اللوائح — تخزن الأطر التنظيمية (GDPR وCCPA وPDPA) التي تعمل المنصة في إطارها.",
        sub2: "طلبات موضوع البيانات (DSR) — تدير طلبات الحقوق من أصحاب البيانات (تصدير، حذف، تصحيح، تقييد).",
        sub3: "إدارة الموافقة — تسجل وتتتبع وتدقق منح الموافقة وسحبها من المستخدمين.",
        sub4: "سياسات الاحتفاظ بالبيانات — تحدد المدة التي يتم فيها الاحتفاظ بالبيانات وما يحدث عند انتهائها (حذف أو إخفاء هوية).",
        sub5: "جرد البيانات — سجل لجميع فئات البيانات الشخصية التي تعالجها المنصة.",
        sub6: "تقارير الامتثال — تنشئ تقارير غير متزامنة جاهزة للتدقيق (نظرة عامة على GDPR، ملخص DSR، تدقيق الموافقة، إلخ).",
        backendTitle: "معمارية الخلفية",
        backendIntro: "تتبع خلفية الامتثال تخطيط وحدة NEXORA القياسي ذي 3 مشاريع (النطاق / التطبيق / البنية التحتية) مع ComplianceDbContext وComplianceController مخصصين.",
        frontendTitle: "معمارية الواجهة الأمامية",
        frontendIntro: "تُنظَّم الواجهة الأمامية كستة وحدات فرعية مستقلة ضمن src/modules/compliance/، كل منها مع طبقاتها الخاصة للنطاق والبيانات والعرض.",
        endpointsTitle: "نظرة عامة على نقاط نهاية API",
        endpointsIntro: "جميع نقاط النهاية تحت /api/v1/compliances/ وتتطلب المصادقة بصلاحية compliance.view.",
      },
      dsr: {
        title: "طلبات موضوع البيانات (DSR)",
        description: "إدارة طلبات حقوق GDPR/CCPA — تصدير، حذف، تصحيح، وتقييد — مع تتبع دورة الحياة الكاملة.",
        intro: "طلبات موضوع البيانات (DSR) هي طلبات رسمية من الأفراد لممارسة حقوقهم بموجب قوانين حماية البيانات. تقدم وحدة الامتثال سير عمل DSR كاملاً: التقديم والتعيين والمعالجة والإغلاق — مع مسار تدقيق كامل وتتبع معدل الاستجابة.",
        typesTitle: "أنواع الطلبات",
        typesIntro: "يدعم النظام أربعة أنواع DSR كما هو محدد في المادة 17 من GDPR وCCPA:",
        type1: "التصدير — طلب قابلية نقل البيانات. يريد الموضوع نسخة من بياناته الشخصية.",
        type2: "الحذف — الحق في النسيان. يجب حذف جميع البيانات الشخصية أو إخفاء هويتها.",
        type3: "التصحيح — طلب تصحيح. يجب تحديث البيانات الشخصية غير الدقيقة.",
        type4: "التقييد — تقييد المعالجة. يمكن الاحتفاظ بالبيانات ولكن لا تتم معالجتها بنشاط.",
        lifecycleTitle: "دورة حياة الطلب",
        lifecycleIntro: "تمر طلبات DSR عبر مجموعة محددة من الحالات من التقديم حتى الإغلاق:",
        status1: "معلق — الحالة الأولية عند استلام الطلب.",
        status2: "قيد التنفيذ — تم تعيين مسؤول امتثال ويعالج الطلب.",
        status3: "مكتمل — تم الوفاء بالطلب (البيانات مُصدَّرة أو محذوفة أو مُصحَّحة أو مُقيَّدة).",
        status4: "مرفوض — تم رفض الطلب (مثل عدم كفاية التحقق من الهوية).",
        slasTitle: "متطلبات SLA لـ GDPR",
        slasIntro: "بموجب المادة 12 من GDPR، يجب على المتحكمين في البيانات الرد على طلبات DSR خلال 30 يوماً (قابل للتمديد إلى 3 أشهر للطلبات المعقدة). تتتبع NEXORA تاريخ التقديم لكل DSR لمساعدتك على الالتزام بهذه المواعيد.",
        lifecycleFlowTitle: "مسار دورة حياة طلب موضوع البيانات",
        nodeSubmit: "تقديم الطلب",
        descSubmit: "يطلب الموضوع التصدير أو الحذف أو التصحيح",
        nodePending: "الحالة: معلق",
        descPending: "يتم تسجيل الطلب، ويتم حساب الموعد النهائي لاتفاقية مستوى الخدمة",
        nodeProcessing: "الحالة: قيد المعالجة",
        descProcessing: "تبدأ مهمة تنفيذ طلب موضوع البيانات بمعالجة الوحدات عبر الوحدة القابلة للتعليق",
        nodeApproval: "في انتظار المسؤول",
        descApproval: "تتطلب الإجراءات الجذرية (الحذف) تأكيدًا يدويًا من المسؤول",
        nodeCompleted: "الحالة: مكتمل",
        descCompleted: "تم إنشاء التصدير أو مسح البيانات؛ تم استيفاء اتفاقية مستوى الخدمة",
        nodeRejected: "الحالة: مرفوض",
        descRejected: "تم رفض الطلب من قبل المسؤول مع ملاحظات الحل",
        conn1: "يبدأ",
        conn2: "تلتقط مهمة الخلفية",
        conn3: "إذا تمت المعالجة تلقائيًا (تصدير)",
        conn4: "إذا كان جذريًا (حذف)",
        conn5: "يؤكد المسؤول",
        conn6: "يرفض المسؤول",
        entitiesTitle: "الكيانات",
        entityName: "اسم الكيان",
        entityDesc: "الوصف",
        entityDsrDesc: "يمثل طلب موضوع بيانات.",
        entityModuleDesc: "حالة تنفيذ الوحدة.",
        entityStatusDesc: "سجل تغييرات الحالة.",
        codeTitle: "مثال كود",
        endpointsTitle: "نقاط نهاية API",
        endpointsIntro: "يكشف وحدة تحكم DSR عن 6 نقاط نهاية لدورة حياة DSR الكاملة:",
        ep: {
          list: "قائمة جميع طلبات DSR (مع ترقيم الصفحات، قابلة للتصفية حسب الحالة/النوع/اللائحة)",
          get: "الحصول على تفاصيل DSR حسب المعرف",
          create: "تقديم طلب DSR جديد",
          updateStatus: "تحديث حالة DSR (قيد التنفيذ، مكتمل، مرفوض)",
          assign: "تعيين DSR لمسؤول امتثال",
          delete: "حذف ناعم لـ DSR",
        },
      },
      consent: {
        title: "إدارة الموافقة",
        description: "تسجيل وتتبع وتدقيق منح موافقة المستخدمين وسحبها للامتثال للمادة 6 من GDPR وCCPA.",
        intro: "تسجل إدارة الموافقة في كل مرة يمنح فيها المستخدم موافقته أو يسحبها لغرض محدد (مثل رسائل البريد الإلكتروني التسويقية، تتبع التحليلات). تخزن NEXORA مسار تدقيق الموافقة الكامل بما في ذلك الطابع الزمني وعنوان IP ووكيل المستخدم والنسخة الدقيقة من نص الموافقة المعروضة.",
        purposesTitle: "أغراض الموافقة",
        purposesIntro: "كل سجل موافقة مرتبط بغرض محدد. تشمل الأغراض الشائعة:",
        purpose1: "التسويق — التسويق عبر البريد الإلكتروني والاتصالات الترويجية.",
        purpose2: "التحليلات — تحليلات الاستخدام وتحسين المنتج.",
        purpose3: "طرف ثالث — مشاركة البيانات مع خدمات طرف ثالث.",
        purpose4: "التخصيص — المحتوى المخصص والتوصيات.",
        gdprTitle: "الأساس القانوني لـ GDPR",
        gdprIntro: "بموجب المادة 6 من GDPR، يجب أن تكون الموافقة: طوعية ومحددة ومستنيرة ولا لبس فيها. تسجل NEXORA النسخة الدقيقة من نص الموافقة المعروضة للمستخدم والطابع الزمني لقبوله، مما يوفر مسار تدقيق قابلاً للدفاع عنه قانونياً.",
        withdrawalTitle: "سحب الموافقة",
        withdrawalIntro: "يمكن للمستخدمين سحب موافقتهم في أي وقت. عند سحب الموافقة، يُحدَّث ConsentRecord بطابع زمني WithdrawnAt. يجب إعلام الأنظمة المتلقية عبر أحداث النطاق لإيقاف معالجة البيانات للغرض المسحوب.",
        flowTitle: "مسار حالة الموافقة",
        nodePurpose: "غرض الموافقة",
        descPurpose: "يحدد ما يتم الموافقة عليه (مثل التسويق)",
        nodeRecord: "سجل الموافقة",
        descRecord: "حالة المستخدم الحالية (ممنوح/مسحوب) لكل غرض",
        nodeSnapshot: "لقطة الموافقة",
        descSnapshot: "التقاط غير قابل للتغيير لمنح/سحب الموافقة في نقطة زمنية",
        nodeJob: "مهمة انتهاء صلاحية الموافقة",
        descJob: "مهمة يومية تسحب الموافقات منتهية الصلاحية",
        conn1: "القوالب",
        conn2: "تولد عند التغيير",
        conn3: "سحب تلقائي في حالة انتهاء الصلاحية",
        immutabilityTitle: "ثبات",
        immutabilityIntro: "سجلات الموافقة غير قابلة للتغيير وتتتبع السلامة.",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          list: "قائمة جميع سجلات الموافقة (مع ترقيم الصفحات، قابلة للتصفية حسب الغرض/الحالة)",
          get: "الحصول على سجل الموافقة حسب المعرف",
          record: "تسجيل منح موافقة جديدة",
          withdraw: "سحب موافقة ممنوحة سابقاً",
        },
      },
      retention: {
        title: "سياسات الاحتفاظ بالبيانات",
        description: "تحديد فترات الاحتفاظ بالبيانات وإجراءات انتهاء الصلاحية الآلية (حذف أو إخفاء هوية) للامتثال للمادة 5(1)(ه) من GDPR.",
        intro: "تحدد سياسات الاحتفاظ بالبيانات المدة التي يجب فيها الاحتفاظ بفئات محددة من البيانات وما يحدث عند انتهاء فترة الاحتفاظ. تطبق NEXORA هذه السياسات تلقائياً عبر مهام الخلفية.",
        policiesTitle: "تكوين السياسة",
        policiesIntro: "كل سياسة احتفاظ تحدد:",
        field1: "DataCategory — نوع البيانات (مثل 'بروفايلات المستخدمين'، 'سجلات المعاملات'، 'سجلات الموافقة').",
        field2: "RetentionDays — عدد الأيام التي يجب الاحتفاظ فيها بالبيانات.",
        field3: "ExpiryAction — ما يحدث عند انتهاء الفترة: حذف أو إخفاء هوية.",
        field4: "RegulationCode — اللائحة التي تتطلب فترة الاحتفاظ هذه (GDPR، CCPA، إلخ).",
        actionsTitle: "إجراءات انتهاء الصلاحية",
        actionsIntro: "عند انتهاء فترة الاحتفاظ، تطبق NEXORA أحد إجراءين:",
        action1: "الحذف — يزيل بشكل دائم جميع السجلات المطابقة لفئة البيانات.",
        action2: "إخفاء الهوية — يستبدل المعلومات الشخصية بعلامات مجهولة الهوية مع الحفاظ على بيانات التحليلات الإجمالية.",
        automationTitle: "التطبيق الآلي",
        automationIntro: "تعمل RetentionEnforcementJob يومياً في 3:00 صباحاً UTC، تفحص جميع سياسات الاحتفاظ النشطة وتطبق إجراء انتهاء الصلاحية المكوَّن على السجلات المؤهلة. ينشئ كل تشغيل تطبيق سجل تدقيق RetentionExecution.",
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
        description: "سجل لجميع فئات البيانات الشخصية التي تعالجها المنصة — مطلوب لسجلات أنشطة المعالجة (RoPA) وفق المادة 30 من GDPR.",
        intro: "جرد البيانات هو سجل منظم لجميع فئات البيانات الشخصية التي تعالجها المنصة. بموجب المادة 30 من GDPR، يجب على المتحكمين الاحتفاظ بسجلات أنشطة المعالجة (RoPA) — جرد البيانات هو تطبيق NEXORA لهذا المتطلب.",
        fieldsTitle: "حقول الجرد",
        fieldsIntro: "كل عنصر جرد يوثق:",
        field1: "DataCategory — الاسم المقروء لفئة البيانات (مثل 'عناوين البريد الإلكتروني'، 'معلومات الدفع').",
        field2: "LegalBasis — الأساس القانوني لـ GDPR للمعالجة (الموافقة، العقد، الالتزام القانوني، المصالح الحيوية، المهمة العامة، المصالح المشروعة).",
        field3: "DataSubjects — من تنتمي إليه البيانات (مثل 'المستخدمون النهائيون'، 'الموظفون'، 'العملاء').",
        field4: "ProcessingPurpose — لماذا تتم معالجة البيانات (مثل 'الوفاء بالطلبات'، 'التسويق'، 'الامتثال القانوني').",
        field5: "StorageLocation — أين تُخزَّن البيانات (البلد/المنطقة للامتثال لعمليات النقل عبر الحدود).",
        field6: "RetentionPeriod — المدة التي يتم فيها الاحتفاظ بالبيانات (مرتبط بسياسة الاحتفاظ).",
        field7: "ThirdPartySharing — ما إذا كانت البيانات تُشارَك مع أطراف ثالثة وأيها.",
        ropaTitle: "الامتثال للمادة 30",
        ropaIntro: "يجب على المنظمات التي تضم 250+ موظفاً أو التي تعالج بيانات عالية الخطورة الاحتفاظ بـ RoPA بموجب المادة 30 من GDPR. يعمل جرد بيانات NEXORA كـ RoPA حي وقابل للاستعلام يمكن تصديره للتفتيش التنظيمي.",
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
        description: "إنشاء تقارير امتثال غير متزامنة جاهزة للتدقيق (نظرة عامة على GDPR، ملخص DSR، تدقيق الموافقة، تحليل الاحتفاظ، تصدير جرد البيانات).",
        intro: "تقارير الامتثال هي مستندات تُنشأ بشكل غير متزامن وتوفر ملخصات جاهزة للتدقيق لوضع الامتثال لديك. تُنشأ التقارير في الخلفية وتُخزَّن للتنزيل عند الجاهزية.",
        reportTypesTitle: "أنواع التقارير",
        reportTypesIntro: "خمسة أنواع تقارير متاحة:",
        type1: "نظرة عامة على GDPR — ملخص رفيع المستوى لحالة الامتثال لـ GDPR عبر جميع الوحدات الفرعية.",
        type2: "ملخص نشاط DSR — إحصاءات حجم DSR والأنواع ومعدلات الاستكمال والالتزام بمعدل الاستجابة.",
        type3: "تدقيق الموافقة — سجل كامل لمنح الموافقة وسحبها حسب الغرض والفترة الزمنية.",
        type4: "تحليل الاحتفاظ — حالة التطبيق الحالية لجميع سياسات الاحتفاظ النشطة.",
        type5: "تصدير جرد البيانات — تصدير كامل لجرد البيانات (RoPA وفق المادة 30).",
        asyncTitle: "الإنشاء غير المتزامن",
        asyncIntro: "تُنشأ التقارير بشكل غير متزامن لتجنب حجب طلبات HTTP لمجموعات البيانات الكبيرة. عند طلب تقرير، ينشئ النظام فوراً سجل ComplianceReport بقيمة IsReady=false ويضع مهمة الإنشاء في قائمة الانتظار. تحقق من قائمة التقارير لمراقبة متى تصبح IsReady صحيحة.",
        asyncTip: "استخدم زر التحديث في واجهة التقارير لاستطلاع جاهزية التقرير. تكتمل التقارير عادةً خلال 30-60 ثانية لمجموعات البيانات حتى 10,000 سجل.",
        downloadTitle: "تنزيل التقارير",
        downloadIntro: "بمجرد أن يصبح التقرير جاهزاً (IsReady=true)، يتوفر رابط DownloadUrl. تقدم نقطة نهاية التنزيل ملف التقرير بشكل آمن. تُحتفظ بملفات التقارير لمدة 90 يوماً قبل التنظيف التلقائي.",
        endpointsTitle: "نقاط نهاية API",
        ep: {
          list: "قائمة جميع تقارير الامتثال (مع ترقيم الصفحات، قابلة للتصفية حسب النوع/الحالة)",
          get: "الحصول على تفاصيل التقرير ورابط التنزيل حسب المعرف",
          generate: "وضع مهمة إنشاء تقرير جديد في قائمة الانتظار",
          download: "تنزيل ملف التقرير المُنشأ",
        },
      },
    },
  },
};
