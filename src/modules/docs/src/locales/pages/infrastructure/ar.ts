export const ar = {
  infrastructure: {
    auditTrail: {
      architectureTitle: "بنية سجل المراجعة",
      description:
        "تسجيل مراجعة كامل مع 23 حقل كيان واكتشاف تلقائي للوحدة وتتبع الارتباط وبث فوري عبر SignalR وأكثر من 45 نوع حدث عبر 13 فئة.",
      entityIntro:
        "يلتقط كيان AuditLog سياقًا شاملاً لكل حدث قابل للمراجعة. تُخزن القيم القديمة والجديدة كلقطات JSON للتاريخ الكامل والامتثال التنظيمي. يتضمن الكيان بيانات جنائية (IpAddress وUserAgent) وبيانات تشغيلية وصفية (DurationMs وStatusCode وMetadata).",
      entityTitle: "مخطط كيان AuditLog (23 حقلاً)",
      eventTypesTitle: "أنواع أحداث المراجعة (45+)",
      intro:
        "يلتقط سجل المراجعة المؤسسي في SCRIPE كل إجراء مهم عبر المنصة — من أحداث المصادقة وتغييرات الكيانات إلى تعديلات الصلاحيات والحوادث الأمنية وإنفاذ نظام الحماية. يسجل كل إدخال 23 حقلاً بما في ذلك معرف الارتباط ومعرف المستأجر وعلامة الوحدة وعنوان IP ووكيل المستخدم للتحليل الجنائي.",
      moduleDetectionIntro:
        "تحدد خدمة المراجعة تلقائيًا الوحدة التي أنشأت كل حدث مراجعة باستخدام سلسلة اكتشاف ذات 3 أولويات: (1) تعيين ثابت لنوع الحدث لأحداث المصادقة، (2) تعيين قائم على مسار نقطة النهاية، (3) تعيين قائم على اسم نوع الكيان. الوحدات غير المعروفة تُكتب بأحرف كبيرة تلقائيًا من مقطع URL.",
      moduleDetectionTitle: "الاكتشاف التلقائي للوحدة",
      queryIntro:
        "تدعم نقطة نهاية استعلام سجل المراجعة التصفية الشاملة بـ 12 معاملاً. جميع الفلاتر اختيارية ويمكن دمجها. النتائج مقسمة إلى صفحات (افتراضي: 20 عنصر، حد أقصى: 100) ومرتبة حسب الطابع الزمني تنازليًا.",
      queryTip:
        "نصيحة احترافية: استخدم CorrelationId لتتبع دورة حياة طلب HTTP واحد بالكامل عبر جميع إدخالات المراجعة. هذا لا يُقدر بثمن في تصحيح الأخطاء والتحقيق في الحوادث.",
      queryTitle: "واجهة برمجة استعلام سجل المراجعة",
      realtimeIntro:
        "تُبث أحداث المراجعة (باستثناء سجلات طلبات HTTP الروتينية لتجنب الإغراق) عبر SignalR إلى العملاء المتصلين. تُحدد الأحداث حسب المستأجر عبر مجموعات خاصة بالمستأجر بينما يتلقى المشرفون العامون جميع الأحداث عبر المجموعة العالمية.",
      realtimeTitle: "البث في الوقت الفعلي",
      title: "سجل المراجعة المؤسسي",
    },
    backgroundJobs: {
      architectureFlowTitle: "خط أنابيب الاكتشاف التلقائي",
      architectureIntro:
        "عند بدء التشغيل، تقرأ BackgroundJobsConfiguration المزود النشط من appsettings.json وتستدعي GetServices<IAutoRegisteredJob>() لاكتشاف كل وظيفة مسجلة في حاوية الـ DI. لكل وظيفة، تتحقق من وجود تجاوز في appsettings وتحل Enabled وCronExpression ثم تجدول الوظيفة مع واجهة المزود. الوظيفة نفسها لا تحتوي على أي كود خاص بالمزود.",
      architectureTitle: "نظرة عامة على البنية",
      conn1: "[AR] drives",
      conn2: "[AR] triggers",
      conn3: "[AR] for each job",
      conn4: "[AR] on cron tick",
      connBuilds: "يبني الاستعلام",
      connOrders: "يُرتب",
      connRemoves: "يُزيل",
      connStarts: "يبدأ",
      connTriggers: "يُحفّز",
      contractIntro:
        "كل وظيفة خلفية متكررة في SCRIPE تطبّق واجهة واحدة: IAutoRegisteredJob. هذا هو العقد الكامل — ثلاث خصائص وطريقة واحدة. تستبعد الواجهة عمداً أي مفاهيم خاصة بالمزود.",
      contractTitle: "عقد IAutoRegisteredJob",
      descConfig:
        "[AR] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      descDiscovery: "[AR] Scans DI container for every registered IAutoRegisteredJob",
      descExecute: "[AR] Provider-agnostic - job has zero knowledge of which provider runs it",
      description:
        "وظائف متكررة مستقلة عن المزود (Native, Hangfire, Quartz.NET) — 31 وظيفة عبر 6 وحدات، بدون تسجيل يدوي.",
      descSchedule: "[AR] Uses CronExpression from appsettings override or job default",
      descStartup: "[AR] Reads provider, discovers all jobs, schedules them",
      diIntro:
        "كل وظيفة تتطلب بالضبط تسجيلين في DependencyInjection.cs الخاص بوحدتها. تخطي السطر الثاني يجعل الوظيفة غير مرئية تماماً لجميع المزودين.",
      diTitle: "تسجيل DI — نمط السطرين الحرج",
      diWarning:
        "مفوّض مصنع IAutoRegisteredJob (السطر 2) هو ما يجعل الاكتشاف التلقائي يعمل. GetServices<IAutoRegisteredJob>() تُعيد فقط الوظائف المسجلة AS IAutoRegisteredJob. الوظيفة المسجلة بنوعها الملموس فقط غير مرئية لجميع المزودين الثلاثة.",
      diWarningTitle: "لا تتخطَّ السطر الثاني أبداً",
      flowCascadeDesc: "يتعامل مع قيود المفاتيح الأجنبية بترتيب الحذف الصحيح",
      flowCascadeLabel: "تتالي واعي بـ FK",
      flowCronDesc: "الكرون الافتراضي لوظائف الحذف الناعم",
      flowCronLabel: "نبضة كرون (3:00 صباحًا)",
      flowExecuteDesc: "تنفيذ SQL أصلي للحذف الجماعي، متجاوزاً تتبع تغييرات EF",
      flowExecuteLabel: "حذف نهائي",
      flowFilterDesc:
        "إيجاد السجلات حيث IsDeleted = true و DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowFilterLabel: "تصفية الكيانات منتهية الصلاحية",
      flowInitDesc: "مُهيأ بواسطة حاوية DI",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowScanDesc: "مسح انعكاسي على DbContext للكيانات التي تنفذ ISoftDeletable",
      flowScanLabel: "اكتشاف ISoftDeletable",
      hierarchyColClass: "الفئة",
      hierarchyColGets: "تحصل على",
      hierarchyColUseWhen: "استخدم عند",
      hierarchyIntro:
        "ثلاثة خيارات حسب مقدار البنية المطلوبة. الوظائف الخفيفة تطبّق IAutoRegisteredJob مباشرة. الوظائف التي تحتاج سجلات توقيت منظمة تمتد RecurringJobBase. وظائف تنظيف سلة المحذوفات تمتد SoftDeleteCleanupJob<TContext>.",
      hierarchyRow1Gets: "العقد فقط — تحكم كامل، بدون إضافات",
      hierarchyRow1When: "الوظيفة بسيطة، يلزم الحد الأدنى",
      hierarchyRow2Gets: "سجلات بدء/اكتمال/خطأ تلقائية مع الوقت المنقضي",
      hierarchyRow2When: "تريد توقيت وسجلات خطأ منظمة",
      hierarchyRow3Gets: "اكتشاف كيانات تلقائي، حذف مرتب حسب FK، معالجة دفعية",
      hierarchyRow3When: "الوحدة تحتاج وظيفة تنظيف دائم للمحذوفات الناعمة",
      hierarchyTitle: "تسلسل الفئات — اختر قاعدتك",
      identityNote:
        "EmailProcessingJob وWebhookRetryJob/WebhookLogCleanupJob وظائف بنية تحتية أساسية مسجلة في DI وحدة Identity لأنها تعتمد على خدمات محددة بنطاق Identity.",
      intro:
        "نظام وظائف الخلفية في SCRIPE مبني على مبدأ واحد: اكتب مرة واحدة، شغّل على أي مزود. كل وظيفة تطبّق IAutoRegisteredJob وتُكتشف تلقائياً عند التشغيل. التبديل بين Native أو Hangfire أو Quartz تغيير إعداد واحد في appsettings.json — بدون أي تعديل في الكود.",
      inventoryColPurpose: "الغرض",
      inventoryComplianceTitle: "وحدة Compliance (7 وظائف)",
      inventoryCoreTitle: "وحدة Core (5 وظائف)",
      inventoryEntitlementsTitle: "وحدة Entitlements (12 وظيفة)",
      inventoryIdentityTitle: "وحدة Identity (وظيفتين)",
      inventoryIntro:
        "جميع الوظائف الـ 33 المتكررة عبر الوحدات الست. كل وظيفة تطبّق IAutoRegisteredJob. يمكن تجاوز CRON الافتراضي لكل بيئة في appsettings.json.",
      inventoryMarketplaceTitle: "وحدة Marketplace (4 وظائف)",
      inventoryPluginsTitle: "وحدة Plugins (3 وظائف)",
      inventoryTitle: "قائمة الوظائف الكاملة — 33 وظيفة",
      jobAnalyticsReport: "إنشاء تقرير تحليلات أسبوعي",
      jobAnalyticsSnapshot: "تجميع يومي للإيرادات/MRR/ARR",
      jobAuthSessionCleanup: "ينظف جلسات المصادقة ورموز التحديث المنتهية الصلاحية",
      jobCommissionAutoCharge: "إعادة محاولة رسوم العمولة الفاشلة تلقائياً",
      jobCommissionInvoicing: "تجميع فاتورة عمولة شهرية",
      jobComplianceSoftDelete: "يحذف نهائياً كيانات Compliance المحذوفة ناعماً بعد فترة الاحتفاظ",
      jobConsentExpiry: "تنتهي صلاحية موافقات المستخدمين المنتهية (يعمل عند منتصف الليل يومياً)",
      jobDsrEscalation: "يصعّد طلبات DSR المقتربة من موعد SLA",
      jobDsrExecution: "ينفذ طلبات موضوع البيانات المعلقة كل 5 دقائق",
      jobDsrExportCleanup: "يحذف ملفات تصدير DSR المنتهية الصلاحية",
      jobDunningNotification: "إشعارات فشل الدفع بإلحاح متصاعد",
      jobEditionRollout: "يطبق ترقيات وتخفيضات الإصدار المجدولة",
      jobEmailProcessing: "يستطلع ويرسل الرسائل الإلكترونية المؤجلة عبر EmailJobProcessor",
      jobEntitlementsSoftDelete:
        "يحذف نهائياً كيانات Entitlements المحذوفة ناعماً بعد فترة الاحتفاظ",
      jobIdentitySoftDelete: "يحذف نهائياً كيانات Identity المحذوفة ناعماً بعد فترة الاحتفاظ",
      jobInstallCountAggregation: "يجمع أعداد التثبيت المؤقتة في عدادات عرض التطبيقات الثابتة",
      jobMarketplaceSoftDelete:
        "يحذف نهائياً كيانات Marketplace والمراجعات وملفات تعريف المطورين المحذوفة ناعماً بعد فترة الاحتفاظ",
      jobOutboxCleanup: "يحذف رسائل Outbox المعالجة الأقدم من 7 أيام",
      jobOutboxProcessor: "يعالج رسائل outbox المعلقة ويرسلها إلى AstraFlow",
      jobPaymobRecurringBilling: "رسوم بطاقة Paymob المتكررة",
      jobPayoutBatch: "يجمع الأرباح المعلقة في تحويلات دفعية وينفذ المدفوعات عبر Stripe Connect",
      jobPluginDataCleanup:
        "يُقلّم مفاتيح تخزين قاعدة البيانات المؤقتة منتهية الصلاحية والمنشأة بواسطة البرمجيات المساعدة",
      jobPluginHealthCheck:
        "يستطلع بيئات صناديق الرمل للبرمجيات المساعدة النشطة ويبلغ عن حالة الصحة",
      jobPluginsSoftDelete:
        "يحذف نهائياً كيانات Plugins والتوجيهات وسجلات التنفيذ المحذوفة ناعماً بعد فترة الاحتفاظ",
      jobReportGeneration: "يستطلع وينشئ تقارير الامتثال المعلقة كل دقيقتين",
      jobRetentionEnforcement: "يطبق سياسات الاحتفاظ بالبيانات (يعمل كل أحد الساعة 1:00 صباحاً)",
      jobStaleSubmissionReminder:
        "يبحث عن طلبات مراجعة التطبيقات المعلقة لأكثر من 7 أيام وينبه المشرفين",
      jobSubscriptionReconciliation:
        "ينهي فترات التجربة، يجدد الاشتراكات النشطة، يعالج فترات السماح",
      jobTenantHealthScore: "يعيد حساب درجة صحة جميع المستأجرين النشطين",
      jobTrialNotification: "يرسل تذكيرات للتجارب المنتهية خلال 7 أو 3 أو 1 يوم",
      jobUserSubscriptionReconciliation: "تسوية اشتراكات المستخدمين في المستوى الثاني",
      jobWebhookLogCleanup: "يحذف سجلات تسليم Webhook الأقدم من 90 يوماً",
      jobWebhookRetry: "يعالج قائمة إعادة محاولة Webhook الدائمة في دفعات من 50",
      newJobIntro:
        "اتبع هذه الخطوات الأربع بالضبط. الملفات الإلزامية الوحيدة هي فئة الوظيفة وسطرا تسجيل DI. كل شيء آخر يربطه محرك الاكتشاف تلقائياً.",
      newJobStep1Desc:
        "أنشئ ملفاً جديداً في {Module}.Infrastructure/BackgroundJobs/. فئة واحدة لكل ملف. استخدم اصطلاح JobId: '{module}-{purpose}' بصيغة kebab-case.",
      newJobStep1Title: "الخطوة 1 — إنشاء فئة الوظيفة",
      newJobStep2Desc:
        "في DependencyInjection.cs الخاص بالوحدة، أضف بالضبط تسجيلين. السطر 1 يمكّن حقن المنشئ. السطر 2 يمكّن الاكتشاف التلقائي. لا تتخطَّ السطر 2 أبداً.",
      newJobStep2Title: "الخطوة 2 — تسجيل كلا سطري DI",
      newJobStep3Desc:
        "إذا أردت جدولاً خاصاً بالبيئة أو تعطيل الوظيفة في بيئات معينة، أضف تجاوزاً تحت BackgroundJobs.Jobs باستخدام JobId كمفتاح.",
      newJobStep3Title: "الخطوة 3 — إضافة تجاوز appsettings (اختياري)",
      newJobStep4Desc:
        "شغّل بناء الـ Backend. الأخطاء الصفرية تعني أن الوظيفة جاهزة. الاكتشاف التلقائي يتولى الباقي — لا تغييرات في BackgroundJobsConfiguration.cs، لا تسجيل يدوي في أي مكان.",
      newJobStep4Title: "الخطوة 4 — البناء والتحقق",
      newJobTitle: "إنشاء وظيفة خلفية جديدة",
      nodeConfig: "[AR] appsettings.json\nProvider + Per-Job Overrides",
      nodeDiscovery: "[AR] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      nodeExecute: "[AR] job.ExecuteAsync(ct)\nAt every cron tick",
      nodeSchedule: "[AR] Schedule Each Job\nIf Enabled -> Register with provider API",
      nodeStartup: "[AR] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      providerColFeature: "الميزة",
      providerColHangfire: "Hangfire",
      providerColNative: "Native",
      providerColQuartz: "Quartz",
      providerHangfireBest: "الإنتاج مع SQL Server",
      providerHangfireDash: "/hangfire (للمشرفين العامين فقط)",
      providerHangfireRetry: "نعم (محاولات قابلة للتكوين)",
      providerHangfireYes: "SQL مدعوم — يبقى بعد إعادة التشغيل",
      providerNativeBest: "التطوير المحلي، اختبار الوحدات",
      providerNativeDash: "لا يوجد",
      providerNativeNo: "في الذاكرة فقط — تضيع عند إعادة التشغيل",
      providerNativeRetry: "لا",
      providerQuartzBest: "الإنتاج مع Oracle أو PostgreSQL",
      providerQuartzDash: "لا يوجد (Quartz.UI متاح بشكل منفصل)",
      providerQuartzOptional: "في الذاكرة (مخزن DB اختياري)",
      providerQuartzRetry: "نعم (عبر سياسة misfire)",
      providerRowBestFor: "الأفضل لـ",
      providerRowDashboard: "لوحة التحكم",
      providerRowPersistence: "استمرارية الوظائف",
      providerRowRetry: "إعادة المحاولة التلقائية",
      providersIntro:
        "كل المزودين الثلاثة يستخدمون نفس واجهة IAutoRegisteredJob. الفرق الوحيد هو كيفية جدولة الوظائف والاحتفاظ بها. كوّن المزود في appsettings.json — لا يلزم تعديل كود للتبديل.",
      providersTitle: "مقارنة المزودين",
      ruleMust1: "فئة واحدة لكل ملف في مجلد BackgroundJobs/",
      ruleMust2: "سجّل كلا سطري DI (الملموس + مفوّض المصنع)",
      ruleMust3: "استخدم CRON من 5 حقول (ليس تنسيق Quartz من 6 حقول)",
      ruleMust4: "اجعل ExecuteAsync متوازنة (idempotent)",
      ruleMust5: "ابنِ بعد كل تغيير — scripe build backend",
      ruleNever1: "لا تستورد أبداً مساحات أسماء Hangfire أو Quartz في فئات الوظائف",
      ruleNever2:
        "لا تستخدم [AutomaticRetry] — إعادة المحاولة العالمية في BackgroundJobsConfiguration",
      ruleNever3: "لا تستدعِ RecurringJob.AddOrUpdate<T>() في كود الوحدة",
      ruleNever4: "لا تضع الوظائف في Services/ أو أي مجلد آخر",
      ruleNever5: "لا تسجّل كـ Singleton — دائماً AddScoped",
      rulesMustTitle: "✅ يجب فعله",
      rulesNeverTitle: "❌ لا تفعل أبداً",
      rulesTitle: "القواعد",
      softDeleteFlowTitle: "تدفق تنفيذ الحذف الناعم",
      softDeleteIntro:
        "فئة الأساس SoftDeleteCleanupJob<TContext> هي الخيار الأكثر تطوراً. تكتشف تلقائياً جميع أنواع كيانات ISoftDeletable في DbContext، وترتبها طوبولوجياً بناءً على علاقات FK (الأبناء قبل الآباء)، وتحذف دفعياً السجلات التي تجاوزت فترة الاحتفاظ.",
      softDeleteTip:
        "أمر CLI 'scripe add-bg-service {Module}' ينشئ ملف الوظيفة ويضيف كلا تسجيلي DI في خطوة واحدة. هذه هي الطريقة الموصى بها لإضافة SoftDeleteCleanupJob.",
      softDeleteTitle: "SoftDeleteCleanupJob — حذف مرتب تلقائياً حسب FK",
      tenantWarning:
        "تعمل وظائف الخلفية خارج سياق طلب HTTP — لا يتوفر سياق مستأجر. الوظائف التي تعالج بيانات خاصة بالمستأجر يجب أن تنشئ نطاق مستأجر صريحاً لكل عملية باستخدام IServiceScopeFactory. لا تفترض أبداً توفر HttpContext داخل وظيفة خلفية.",
      title: "وظائف الخلفية (Background Jobs)",
    },
    databaseMigrations: {
      architectureContent: "تبنى الفئات المشتقة لحماية كل بنية قاعدة بيانات من تأثير البنى الأخرى.",
      architectureTitle: "هيكلية DbContext المشتقة",
      cliContent: "تعمل أداة scripe-cli على توليد الترحيلات لكل المزودين بوقت واحد بضغطة زر.",
      cliRemoveContent: "استخدام الأداة لعكس أي عملية ترحيل خاطئة.",
      cliRemoveTitle: "الإزالة الذكية والآمنة",
      cliTitle: "توليد الترحيلات المتعددة المزودين",
      cliUpdateContent: "الأداة تكتشف قاعدة البيانات النشطة وتحدثها دون تدخل معقد.",
      cliUpdateTitle: "التحديث التلقائي للمزود",
      cliWarning: "مهم: لا تقم أبدًا بتعديل ملفات ModelSnapshot يدويًا.",
      description: "بنية معمارية تتكيف مع قواعد SQL Server, Oracle, و PostgreSQL.",
      diContent: "يُحقن المزود الصحيح تلقائيًا بناءً على التكوين المحدد.",
      diTitle: "حقن المزود في وقت التشغيل",
      intro: "تعتمد SCRIPE بنية تعتمد على فئات DbContext المشتقة لعزل تام بين المزودين.",
      newProviderContent: "تتبع الخطوات المعمارية التالية لإضافة SQLite مثلاً.",
      newProviderStep1: "1. إنشاء فئة DbContext مشتقة ومغلقة.",
      newProviderStep2: "2. تنفيذ IDesignTimeDbContextFactory.",
      newProviderStep3: "3. التسجيل ضمن InfrastructureDI.cs.",
      newProviderStep4: "4. تشغيل أمر scripe db add-migration.",
      newProviderTitle: "إضافة مزود قاعدة بيانات جديد",
      title: "ترحيلات قواعد بيانات المؤسسات (Migrations)",
    },
    fileStorage: {
      architectureTitle: "بنية التخزين",
      configTitle: "التكوين",
      description: "أنماط من مزودي الخدمة كـ S3 و Azure Blob والمحلي مع تحديد للمستأجر.",
      intro: "التبديل بين أنواع الخوادم لملفات التخزين سهل وموثق.",
      providersTitle: "مزودو التخزين",
      tenantScopingTitle: "النطاقات الخاصة بالمستأجرين",
      title: "تخزين الملفات",
      validationTitle: "التحقق من الملفات",
    },
    gatewayDeployment: {
      description: "البوابة العكسية لـ YARP وتحديثات الوحدات للنشر على الخوادم.",
      iisStep1Desc: "تشغيل أمر dotnet publish لنشر الملفات.",
      iisStep1Title: "1. نشر التطبيق",
      iisStep2Desc: "تعيين مسار الملفات الصادرة.",
      iisStep2Title: "2. تكوين موقع IIS",
      iisStep3Desc: "عبر متغيرات البيئة لـ MODULE_NAME والاتصال.",
      iisStep3Title: "3. تعيين المتغيرات",
      iisStep4Desc: "استخدام No Managed Code للحصول على الأداء الأفضل.",
      iisStep4Title: "4. تكوين مسابح التطبيقات (App Pools)",
      iisTitle: "النشر في IIS",
      intro: "مرونة في التشغيل تضمن نشر سهل في IIS وغيرها كخدمات منفصلة أو مدمجة.",
      kestrelTitle: "تكوين Kestrel",
      microservicesTitle: "وضع Microservices (الخدمات المصغرة)",
      modesTitle: "أنماط النشر",
      moduleIntro: "متغير MODULE_NAME يفصل بين تشغيل التطبيق كوحدة مدمجة أو منفصلة.",
      moduleTitle: "نظام الوحدات للتشغيل",
      monolithTitle: "وضع Monolith (النظام المتجانس)",
      portNote: "تستمع كل واجهة إلى منفذ مخصص عبر البوابة.",
      title: "البوابة والنشر (Gateway & Deployment)",
      yarpIntro: "توجه الطلبات بسلاسة نحو الواجهة المقصودة (Module).",
      yarpTitle: "بوابة YARP",
    },
    healthChecks: {
      architectureTitle: "بنية نقاط نهاية الصحة",
      checksIntro:
        "يتحقق كل فحص من تبعية بنية تحتية محددة. تعمل الفحوصات بالتوازي لتقليل زمن الاستجابة. تُعيد الفحوصات الفاشلة معلومات خطأ مفصلة دون تسريب سلاسل الاتصال الحساسة. حالة الفشل قابلة للتكوين — فشل قاعدة البيانات والبدء يُعيد Unhealthy بينما Redis وSMTP والتخزين يُعيد Degraded.",
      checksTitle: "فحوصات الصحة الفردية",
      description:
        "نقاط نهاية صحة مؤسسية لمسبارات الاستمرارية والجاهزية والبدء في Kubernetes مع 6 فحوصات مستقلة تغطي قاعدة البيانات وRedis وSMTP والتخزين والبدء وصحة الوحدات.",
      dockerIntro:
        "لنشر Docker Compose، قم بتكوين فحوصات الصحة على تعريف الخدمة. استخدم /health/live للاستمرارية الأساسية و/health/ready للجاهزية. اضبط start_period للسماح بوقت لترحيل قاعدة البيانات. في وضع الخدمات المصغرة كل خدمة وحدة تحصل على فحص صحة خاص بها.",
      dockerTip:
        "لنشر IIS: قم بتكوين مسبار صحة Application Request Routing (ARR) لاستخدام /health/ready كعنوان فحص الصحة. لخدمة تطبيقات Azure: قم بتكوين ميزة فحص الصحة في الإعدادات العامة مع مسار /health/ready.",
      dockerTitle: "فحص صحة Docker Compose",
      endpointsTitle: "نقاط نهاية الصحة",
      environmentsTitle: "دليل خاص بالبيئة",
      intro:
        "توفر SCRIPE 5 نقاط نهاية صحية مصممة لتنسيق Kubernetes وتكامل موازنات التحميل ومراقبة العمليات. تتحقق كل نقطة نهاية من تبعيات البنية التحتية المحددة وتُعيد استجابات JSON منظمة. يستخدم النظام بنية قائمة على العلامات حيث يتم تعليم كل فحص بعلامات محددة وتقوم نقاط النهاية بالتصفية حسب العلامات.",
      k8sIntro:
        "تتوافق نقاط نهاية الصحة مباشرة مع أنواع مسبارات Kubernetes. يسمح مسبار البدء بما يصل إلى 5 دقائق (30 فشل × 10 ثوانٍ) لترحيل قاعدة البيانات عند النشر الأول. مسبار الجاهزية يبوّب توجيه حركة المرور — إذا فشلت قاعدة البيانات أو Redis يزيل K8s الجراب من نقاط نهاية موازن التحميل.",
      k8sTitle: "تكوين مسبارات Kubernetes",
      registrationIntro:
        "تُسجل فحوصات الصحة مركزيًا في HealthCheckExtensions.cs مع علامات صريحة وحالات فشل. تحدد العلامات أي نقطة نهاية تتضمن كل فحص. التصميم القائم على العلامات يعني أن إضافة فحص جديد يتطلب تغيير سطر واحد فقط.",
      registrationTitle: "تسجيل فحوصات الصحة",
      responseIntro:
        "تدعم SCRIPE تنسيقين للاستجابة حسب نقطة النهاية. نقاط النهاية العامة تُعيد JSON مختصر مع الحالة والمدة وأسماء الفحوصات. نقاط النهاية المصادق عليها تُعيد استجابة مفصلة تتضمن مدد كل فحص والعلامات وبيانات الحمولة وتفاصيل الاستثناءات.",
      responseTitle: "تنسيق الاستجابة",
      title: "فحوصات الصحة ومسبارات Kubernetes",
    },
    loadTesting: {
      authFlowIntro:
        "يحاكي اختبار auth-flow.js أنماط مصادقة المستخدم الواقعية: تسجيل الدخول بالاعتمادات والوصول إلى نقطة محمية باستخدام رمز JWT والتحقق من نقطة فحص الصحة. المقاييس المخصصة (scr_login_duration وscr_login_fail_rate) تتتبع اتفاقيات SLA الخاصة بالمصادقة بشكل مستقل.",
      authFlowTitle: "سكربت اختبار تدفق المصادقة",
      backupIntro:
        "تدعم SCRIPE استراتيجيات نسخ احتياطي متعددة المزودين مع أدوات وتكرارات وأوامر استعادة مخصصة لكل محرك قاعدة بيانات. سجلات المراجعة لها نسخ احتياطي منفصل مع فترة احتفاظ ممتدة للامتثال.",
      backupTitle: "النسخ الاحتياطي واستعادة الكوارث",
      cicdIntro:
        "يتكامل k6 مع GitHub Actions وGitLab CI وAzure Pipelines. تعمل الاختبارات ضد نسخة حاوية من الخلفية مع انتظار جاهزية الصحة قبل التنفيذ. يفشل خط الأنابيب تلقائيًا إذا تم تجاوز أي عتبة SLA. يتم رفع النتائج كمرفقات لتحليل الاتجاهات.",
      cicdTitle: "تكامل CI/CD",
      description:
        "مجموعات اختبار أداء k6 مع مقاييس مخصصة وعتبات SLA وتكامل خط أنابيب CI/CD واستراتيجية نسخ احتياطي/استعادة كوارث متعددة المزودين مع أوامر استعادة فعلية.",
      drWarning:
        "تحذير حرج: اختبر إجراءات استعادة الكوارث كل ربع سنة. النسخة الاحتياطية التي لم تُستعاد أبدًا ليست نسخة احتياطية — بل هي أمنية. جدول تدريبات استعادة الكوارث على تقويم ووثّق خطوات الاستعادة وقِس RTO الفعلي.",
      intro:
        "تتضمن SCRIPE سكربتات اختبار حمل k6 مؤسسية تتحقق من اتفاقيات مستوى الخدمة باستخدام مقاييس مخصصة لـ SCRIPE. مع استراتيجية نسخ احتياطي واستعادة كوارث شاملة تغطي SQL Server وOracle وPostgreSQL وRedis — بما في ذلك أوامر الاستعادة الفعلية.",
      overviewIntro:
        "مجموعتا اختبار k6 جاهزتان تغطيان رحلات المستخدم الحرجة: تدفقات المصادقة (تسجيل الدخول واسترجاع JWT والنقاط المحمية وفحوصات الصحة) وعمليات CRUD (الترقيم والتصفية وسيناريوهات الذروة). كل مجموعة تحدد مراحل تصعيد المستخدمين الافتراضيين ومقاييس مخصصة.",
      overviewTitle: "مجموعات اختبار k6",
      runningTitle: "تشغيل اختبارات الحمل",
      thresholdsTitle: "عتبات اتفاقية مستوى الخدمة (SLA)",
      title: "اختبار الحمل والنسخ الاحتياطي",
    },
    observability: {
      alertsIntro:
        "قواعد تنبيه Prometheus مُعدة مسبقًا تكتشف الحالات الحرجة والتحذيرية. التنبيهات الحرجة تنطلق فورًا عند معدلات خطأ عالية وانقطاع قاعدة البيانات وتأخر شديد. تُخزن قواعد التنبيه في infrastructure/monitoring/prometheus/alerts/ ويتم تحميلها تلقائيًا.",
      alertsTitle: "قواعد التنبيه",
      configTitle: "تكوين المراقبة",
      description:
        "تتبع موزع عبر OpenTelemetry ومقاييس Prometheus وتسجيل مركزي عبر Grafana Loki وتصور التتبع عبر Jaeger مع قواعد تنبيه جاهزة.",
      intro:
        "تُنفذ SCRIPE مكدس مراقبة كامل مبني على معايير مفتوحة: OpenTelemetry للتتبع الموزع وPrometheus لجمع المقاييس وGrafana Loki للتسجيل المركزي وJaeger لتصور التتبع. يتم تتبع كل معالج AstraFlow mediator تلقائيًا. المكدس بالكامل اختياري — في بيئة التطوير يمكنك التشغيل مع إخراج وحدة التحكم فقط وبدون تبعيات خارجية.",
      loggingIntro:
        "يُثري Serilog كل سجل باسم الجهاز والبيئة ومعرف الارتباط ومعرف المستأجر وعلامة الوحدة. عند تكوين Loki (تعيين Loki:Url) يتم دفع السجلات في الوقت الفعلي. عندما يكون Loki:Url فارغًا يرجع التسجيل إلى وحدة التحكم فقط — وهذا هو الإعداد الافتراضي في بيئة التطوير.",
      loggingTitle: "التسجيل المركزي (Serilog + Loki)",
      monitoringStackIntro:
        "ملف Docker Compose مُسبق البناء (infrastructure/monitoring/docker-compose.monitoring.yml) يُشغل مكدس المراقبة الكامل: Prometheus v3.2.1 وGrafana v11.5.2 وLoki v3.4.2 وJaeger v2.4.0. جميع مصادر البيانات ولوحات المعلومات وقواعد التنبيه مُوزعة تلقائيًا. Grafana يعمل على المنفذ 3001 لتجنب التعارض مع خادم Next.js.",
      monitoringStackTitle: "مكدس المراقبة عبر Docker",
      productionWarning:
        "في الإنتاج: اضبط TraceSampleRatio على 0.1 (أخذ عينات 10%) لتقليل الحمل، غيّر كلمة مرور Grafana الافتراضية (admin/scripe-admin)، قيّد الوصول إلى /metrics عبر قائمة IP المسموح بها، لا تعرض منافذ المراقبة (9090، 3001، 16686) للإنترنت العام، وكوّن استبقاء تخزين Prometheus (افتراضي: 30 يومًا، 10GB).",
      prometheusIntro:
        "تعرض نقطة النهاية /metrics مقاييس OpenTelemetry بتنسيق نصي. يكشط Prometheus هذه النقطة كل 15 ثانية لجمع مدد طلبات HTTP والطلبات النشطة وجمع القمامة ووقت المعالج والذاكرة العاملة. في وضع الوحدة الواحدة هدف واحد يكفي. في وضع الخدمات المصغرة يجب تكوين مهمة كشط لكل خدمة.",
      prometheusTitle: "مقاييس Prometheus",
      stackTitle: "بنية مكدس المراقبة",
      title: "المراقبة وقابلية الملاحظة",
      tracingIntro:
        "ينشئ TracingBehavior نطاقًا لكل معالج أوامر واستعلامات مع اكتشاف تلقائي لاسم الوحدة ونوع الطلب وقياسات المدة. يتم تسجيل الأخطاء تلقائيًا مع تفاصيل الاستثناء. تتدفق التتبعات إلى Jaeger عبر بروتوكول OTLP gRPC عبر المنفذ 4317.",
      tracingTitle: "التتبع الموزع (OpenTelemetry)",
    },
    resilience: {
      architectureTitle: "بنية المرونة",
      circuitBreakerIntro: "يتوقف عن إرسال الطلبات للواجهة المتعطلة لفترة لمنع إجهاد الخادم.",
      circuitBreakerTitle: "قاطع الدائرة (Circuit Breaker)",
      configTitle: "التكوين",
      description: "إعادة المحاولة المدمجة وقواطع الدوائر لضمان عمل واجهة التطبيق باستمرار.",
      intro: "تُستخدم سياسات Polly لتفادي الانهيارات المتتالية للأعطال العابرة.",
      retryTitle: "سياسة إعادة المحاولة",
      timeoutTitle: "سياسة المهلة (Timeout)",
      title: "أنماط المرونة (Resilience Patterns)",
      usageTitle: "الاستخدام في HttpClient",
    },
    scripeCli: {
      autoWiringIntro: "لا تقم بنسخ الكود فقط، الأداة تقوم بالتسجيل عبر المشاريع.",
      autoWiringTitle: "عملية الربط التلقائي",
      bgJobsIntro: "لربط أي وحدة بنظام معالجة المهام الخلفية بضغطة زر.",
      bgJobsTitle: "عمليات المهام الخلفية",
      commandsIntro: "تضم أمرين أساسيين لعمل هيكل النظام.",
      commandsReferenceIntro:
        "تتميز واجهة خط أوامر SCRIPE بـ 123 أمراً عبر 10 فئات متميزة، تغطي كل جانب من جوانب دورة حياة التطوير والتشغيل. فيما يلي جدول المرجع الكامل.",
      commandsReferenceTitle: "مرجع الأوامر الكامل (v4.0)",
      commandsTitle: "أوامر الإنشاء الأساسية",
      configIntro: "يقرأ الإعدادات من scripe.config.json لتحديد المواقع المطلوبة.",
      configTitle: "تكوين مشاريع الـ CLI",
      dbCliCmd: "تحديثات الـ EF Core وقواعد البيانات المختلفة بذكاء.",
      dbSyncIntro: "عمليات التزامن القوية لحفظ استقرار البنية التحتية.",
      dbSyncTitle: "تزامن الـ Database و الـ API",
      description: "79 قالباً لزيادة الإنتاجية ودعم قواعد البيانات المتعددة وعمليات الربط العميق.",
      destructionIntro: "لإلغاء أثر إنشاء الخصائص أو الوحدات وتصحيح المسار.",
      destructionTitle: "الأدوات المدمرة",
      dslIntro: "تتيح التوصيف السريع لمواصفات الكيانات.",
      dslSyntaxInfo: "قواعد بناء الجملة: اسم_الخاصية:النوع[:مُعَدِّل1][:مُعَدِّل2]",
      dslTitle: "صياغة خصائص الـ DSL",
      intro: "توفر الأداة بناء كود نموذجي وهيكل لـ Backend و Frontend بسرعة قياسية.",
      namingIntro: "يتيح صياغة الـ PascalCase والمسميات المشابهة بدون أخطاء إملائية برمجية.",
      namingTitle: "طفرات التسمية الذكية",
      newFeatureIntro: "توليد نماذج العمليات (CRUD) باستخدام DSL لخصائص محددة.",
      newFeatureTitle: "إنشاء ميزة: new-feature",
      newModuleIntro: "توليد طبقات الـ Backend والـ Frontend للوحدات الجديدة.",
      newModuleTitle: "إنشاء وحدة: new-module",
      revertSafely: "الأوامر العكسية تمنع ترك أي مخلفات برمجية.",
      securityIntro: "توليد الأدوار وضبط الامتيازات على العمليات بشكل تلقائي.",
      securityTitle: "الأمان والدفاع العميق",
      syncApiCmd: "دمج Swagger مع Typescript و Zod بخطوة واحدة.",
      templatesIntro:
        "بدلاً من كتابة البنى القياسية يدوياً، تفرض واجهة خط الأوامر بنية نظيفة نقية من خلال 79 قالباً دقيقاً من Handlebars تغطي 54 ملفاً للواجهة الخلفية و25 تكويناً للواجهة الأمامية، مما يضمن الجودة.",
      templatesTitle: "79 قالباً ثابتاً",
      title: "أداة سطر الأوامر (SCRIPE CLI)",
      utilityIntro: "بناء وتشغيل خوادم التطوير من موجه أوامر واحد.",
      utilityTitle: "أدوات النظام البيئي",
      wiringDocker: "ربط الخدمة بـ docker-compose.yml.",
      wiringFrontendApp: "إنشاء الروابط في توجيهات الواجهة.",
      wiringFrontEnv: "تحديث متغيرات البيئة.",
      wiringPermissions: "تحديد الـ constants وصلاحيات الـ Next.js.",
      wiringProgram: "الحقن في ملف Program.cs.",
      wiringSettings: "ربط سلاسل الاتصال بـ appsettings.json.",
      wiringSln: "الحقن في ملف .sln للحلول.",
    },
    scripeStudio: {
      architectureIntro:
        "يتكون الاستوديو من مكونين: المحرك (Express + Socket.io + SQLite على المنفذ 4201) يعالج طلبات API وتنفيذ الأوامر والبث اللحظي. الواجهة (Next.js على المنفذ 4200) توفر 19 صفحة تغطي جميع جوانب سير العمل التطويري.",
      architectureTitle: "بنية الاستوديو",
      cliCommandsIntro:
        "يُطلق الاستوديو ويُدار بالكامل عبر أداة SCRIPE CLI. يدعم أمر scripe studio وضع التطوير (--dev) مع إعادة التحميل التلقائي، ووضع الإنتاج، ووضع البناء فقط (studio build)، والمنافذ المخصصة (--port و --engine-port)، والوضع بدون متصفح (--no-browser).",
      cliCommandsTitle: "أوامر CLI للاستوديو",
      description:
        "لوحة تحكم مرئية للمطورين مع إدارة وحدات لحظية ومولّدات أكواد وعناصر تحكم بخوادم التطوير وطرفية مدمجة.",
      featureConfig:
        "محرر التكوين — عرض وتعديل متغيرات البيئة عبر .env و appsettings.json و scripe.config.json.",
      featureDashboard:
        "لوحة المعلومات — نقاط الصحة وتغذية النشاط وإحصائيات الوحدات ونظرة عامة على النظام.",
      featureDatabase:
        "قاعدة البيانات — تشغيل الترحيلات وزرع البيانات والتحقق من حالة الترحيل والنسخ الاحتياطي وإعادة تعيين الوحدات.",
      featureDevServers:
        "خوادم التطوير — تشغيل وإيقاف وإعادة تشغيل خوادم الواجهة الخلفية والأمامية بنقرة واحدة.",
      featureDocker: "Docker — إدارة خدمات Docker Compose وعرض السجلات والتحقق من صحة الحاويات.",
      featureGenerators:
        "مولّدات الأكواد — توليد الأحداث والمواصفات والمدققات والتعدادات والخطافات والمكونات والصفحات عبر نماذج بصرية.",
      featureModules:
        "مدير الوحدات — إنشاء وحذف وفحص وتصفح الوحدات مع واجهة مرئية وتغذية راجعة لحظية.",
      featurePackages:
        "مدير الحزم — إضافة وإزالة وتحديث حزم npm و NuGet للواجهة الأمامية والخلفية.",
      featureSecurity:
        "أدوات الأمان — توليد مفاتيح JWT/AES وتشغيل فحوصات الثغرات والتحقق من اكتمال البيئة.",
      featuresTitle: "ميزات الاستوديو",
      featureTerminal: "الطرفية — طرفية مدمجة مع سجل الأوامر وعرض مخرجات ANSI والبث عبر WebSocket.",
      intro:
        "استوديو SCRIPE هو لوحة تحكم مرئية متكاملة للمطورين تعمل جنباً إلى جنب مع بيئة تطوير SCRIPE. يوفر واجهة ويب لحظية لإدارة الوحدات وتشغيل مولّدات الأكواد والتحكم بخوادم التطوير وتنفيذ عمليات قاعدة البيانات وإدارة حاويات Docker والمزيد — كل ذلك من تبويب متصفح واحد.",
      securityIntro:
        "ينفذ الاستوديو أمان الدفاع المتعمق: مصادقة بالرمز المميز (يُولَّد عند كل تشغيل)، والتحقق من قائمة الأوامر المسموحة، وتعقيم مركزي للمدخلات ضد حقن الأوامر، وتحديد معدل الطلبات، وقائمة CORS المسموحة.",
      securityTitle: "نموذج الأمان",
      title: "استوديو SCRIPE",
    },
  },
};
