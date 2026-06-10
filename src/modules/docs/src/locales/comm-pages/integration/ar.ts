/**
 * Docs integration — AR
 * Auto-filled 28 keys from EN.
 */
export const ar = {
  commercial: {
    restApiOverview: {
      tblCtrlR14C1: "EditionsController",
      tblCtrlR14C2: "11",
      tblCtrlR14C3: "عمليات CRUD للإصدارات، الميزات، إدارة الإصدارات، النشر",
      tblCtrlR15C1: "FeaturesController",
      tblCtrlR15C2: "5",
      tblCtrlR15C3: "عمليات CRUD للميزات، أنواع القيم، ميزات النظام",
      tblCtrlR16C1: "SubscriptionsController",
      tblCtrlR16C2: "12",
      tblCtrlR16C3: "تعيين، ترقية، تخفيض، دورة الحياة، تحليل التأثير",
      tblCtrlR17C1: "TenantFeaturesController",
      tblCtrlR17C2: "4",
      tblCtrlR17C3: "تجاوزات لكل وحدة، الميزات المحللة",
      authContent:
        "كل متحكم (Controller) مقفل افتراضياً. تستخدم SCRIPE التحقق القوي من رموز JWT المميزة، مما يتطلب أذونات دقيقة محددة ومطالبات وحدة (Tenant claims) تم التحقق منها قبل إرجاع بايت واحد من JSON.",
      authTitle: "تفويض تشفيري صارم",
      controllersTitle: "طوبولوجيا متحكمات (Controllers) صارمة",
      description:
        "واجهة برمجة تطبيقات RESTful نظيفة وموثقة بالكامل تتميز بتصفية ديناميكية (Dynamic filtering)، وتقسيم استناداً إلى المؤشر (Cursor-based pagination)، واستجابات HATEOAS الغنية.",
      intro:
        "الواجهة الخلفية ليست مجرد غلاف لقاعدة البيانات (Database wrapper)؛ إنها سطح HTTP مصنوع بدقة. تعرض SCRIPE واجهة برمجة تطبيقات RESTful أصلية تلتزم بصرامة بأفعال (Verbs) HTTP القياسية، ورموز الحالة، واصطلاحات الوسائط التشعبية (Hypermedia).",
      paginationTitle: "التقسيم باستخدام المؤشر والإزاحة (Cursor & Offset Pagination)",
      responseContent:
        "لا مزيد من تحليل سلاسل الأخطاء العشوائية. كل استجابة لواجهة برمجة التطبيقات — سواء كانت ناجحة أو فشل كارثي — مغلفة بهيكل تفاصيل المشكلة الموحد الخاص بنا `Result<T>`، مما يضمن القدرة على التنبؤ المطلق للواجهة الأمامية ومستهلكي الطرف الثالث.",
      responseTitle: "حمولات بيانات موحدة ومتوقعة (Predictable Payloads)",
      swaggerContent:
        "نقوم بإنشاء وثائق Swagger (OpenAPI 3.0) شاملة ومشروحة بعمق مباشرة من الكود المصدري لـ C# في وقت التشغيل. يمكن للمطورين اختبار الحمولات (Payloads) المصادق عليها تفاعلياً مباشرة من متصفحهم لحظة إقلاع النظام.",
      swaggerTitle: "بوابات OpenAPI التفاعلية",
      title: "سطح واجهة برمجة التطبيقات (RESTful Surface)",
      tblCtrlHeader1: "المتحكم (Controller)",
      tblCtrlHeader2: "نقاط النهاية (Endpoints)",
      tblCtrlHeader3: "الوصف",
      tblCtrlR1C1: "AuthController",
      tblCtrlR1C2: "8",
      tblCtrlR1C3: "تسجيل الدخول، التسجيل، 2FA، إعادة تعيين كلمة المرور، الجلسات",
      tblCtrlR2C1: "UserController",
      tblCtrlR2C2: "27",
      tblCtrlR2C3: "CRUD، العمليات المجمعة، عمليات المؤسسات",
      tblCtrlR3C1: "RoleController",
      tblCtrlR3C2: "12",
      tblCtrlR3C3: "إدارة الأدوار، تعيين الأذونات",
      tblCtrlR4C1: "TenantController",
      tblCtrlR4C2: "10",
      tblCtrlR4C3: "دورة حياة الوحدة، الإعدادات، التنشيط",
      tblCtrlR5C1: "AuditController",
      tblCtrlR5C2: "6",
      tblCtrlR5C3: "الاستعلام عن سجل التدقيق، التصدير، البث",
      tblCtrlR6C1: "NotificationController",
      tblCtrlR6C2: "5",
      tblCtrlR6C3: "إشعارات الدفع (Push)، وضع علامة مقروء، التفضيلات",
      tblCtrlR7C1: "FileController",
      tblCtrlR7C2: "4",
      tblCtrlR7C3: "الرفع، التنزيل، الحذف، البيانات الوصفية",
      tblCtrlR8C1: "TemplateController",
      tblCtrlR8C2: "5",
      tblCtrlR8C3: "عمليات CRUD لقوالب البريد الإلكتروني/الرسائل، المعاينة",
      tblCtrlR9C1: "MenuController",
      tblCtrlR9C2: "6",
      tblCtrlR9C3: "إدارة القوائم الديناميكية، التجاوزات",
      tblCtrlR10C1: "SettingsController",
      tblCtrlR10C2: "4",
      tblCtrlR10C3: "إعدادات النظام، إعدادات الوحدة",
      tblCtrlR11C1: "DashboardController",
      tblCtrlR11C2: "3",
      tblCtrlR11C3: "بيانات KPI (مؤشرات الأداء)، بيانات المخططات، الملخصات",
      tblCtrlR12C1: "WebhookController",
      tblCtrlR12C2: "5",
      tblCtrlR12C3: "إدارة الاشتراكات، كتالوج الأحداث",
      tblCtrlR13C1: "RecycleBinController",
      tblCtrlR13C2: "4",
      tblCtrlR13C3: "العناصر المحذوفة بشكل ناعم، الاستعادة، الإفراغ التام",
      lstSwagI1: "يتم إنشاؤه تلقائياً من سمات المتحكم (Attributes) ووثائق XML",
      lstSwagI2: "وضع (Try-it-out) لاختبار نقاط النهاية مباشرة",
      lstSwagI3: "دعم المصادقة عبر JWT في واجهة Swagger UI",
      lstSwagI4: "توثيق مخطط (Schema) الطلب/الاستجابة مع أمثلة",
      lstSwagI5: "مجمعة حسب المتحكم لتسهيل التنقل",
      lstSwagI6: "متاح على المسار /swagger في وضع التطوير (Development mode)",
    },
    apiDesign: {
      conventionsTitle: "الاصطلاحات المؤسسية",
      description:
        "اكتشف مبادئ تصميم واجهات برمجة التطبيقات (RESTful) الصارمة، وإدارة الإصدارات الدقيقة، والاصطلاحات المتوقعة التي تشغل منصة SCRIPE.",
      errorTitle: "معالجة الأخطاء الموحدة",
      intro:
        "تم تصميم واجهة برمجة تطبيقات SCRIPE من أجل التوسع والموثوقية. بدءاً من اصطلاحات التسمية المتسقة إلى التقسيم الموحد للصفحات وتفاصيل مشكلات RFC 7807 لمعالجة الأخطاء، تضمن بنيتنا عديمة الحالة (Stateless) تكاملاً سلساً للمستهلكين النهائيين.",
      pipelineContent:
        "تستخدم دورة حياة طلبات واجهة برمجة التطبيقات مكتبة SCRIPE mediator المحسنة بالكامل. ترث كل نقطة نهاية (Endpoint) تلقائياً عمليات التحقق من الصحة، وتتبع الأداء، والتخزين المؤقت، وتسجيل التدقيق قبل تنفيذ سطر واحد من منطق الأعمال.",
      pipelineTitle: "مسار طلبات قوي",
      resultContent:
        "تقضي منصة SCRIPE على فوضى (try-catch) من خلال نمط نتائج موحد (Result Pattern). كل استجابة من واجهة برمجة التطبيقات مكتوبة بدقة ويمكن التنبؤ بها برمجياً، مما يضمن تلقي المستهلكين لرموز حالة HTTP القياسية التي تغلف بنية استجابة JSON متطابقة بغض النظر عن الوحدة التي يتم الوصول إليها.",
      resultTitle: "نمط النتائج المتوقع",
      statusCodesTitle: "رموز الحالة الدلالية",
      swaggerContent:
        "استكشف وثائق Swagger/OpenAPI 3.0 الحية للتفاعل الفوري مع أكثر من 400 نقطة نهاية مُعدة مسبقاً. نقوم بإنشاء مواصفات OpenAPI دقيقة، مما يتيح إنشاء حزم SDK بسلاسة لمنصات الويب والأجهزة المحمولة.",
      swaggerTitle: "واجهة Swagger التفاعلية",
      title: "تصميم وبنية واجهة برمجة التطبيقات",
    },
    webhookIntegration: {
      description:
        "مُرسل Webhook هائل المرونة، وغير متزامن، ومدفوع بالأحداث، يتيح مزامنة بيانات آمنة وفورية مع واجهات برمجة التطبيقات (APIs) الخارجية الضخمة.",
      eventsTitle: "الأحداث المدعومة بالبث العالمي",
      intro:
        "يجب أن تتواصل أنظمة المؤسسات الحديثة. بدلاً من إجبار العملاء على إجراء استعلامات (Polling) متكررة وعنيفة على واجهة REST الخاصة بك، تتضمن SCRIPE مرسل Webhook خارجياً أصلياً وعالي الكفاءة. ادفع أحداث المجال الهامة على الفور إلى أي نظام خارجي بأمان عبر HTTPS.",
      logsTitle: "تدقيق جنائي للإرسال (Dispatch Auditing)",
      managementTitle: "إدارة الاشتراكات الديناميكية",
      retryContent:
        "إذا توقف خادم المشترك عن الاتصال، فلن تتجاهل SCRIPE الحمولة (Payload). باستخدام نمط الصندوق الصادر (Outbox) المستمر والذكي ذي التراجع الأسي، يتم إعادة المحاولة رياضياً (على سبيل المثال، 5 ثوانٍ، 1 دقيقة، 1 ساعة، 1 يوم) حتى يتم تأكيد الاستلام عبر حالة HTTP 2xx.",
      retryTitle: "تراجع أسي مستمر (Exponential Persistent Backoff)",
      securityContent:
        "يتم توقيع كل حمولة صادرة (Outbound) بأمان باستخدام توقيع (HMAC-SHA256) تم إنشاؤه من المفتاح السري للوحدة. يمكن لتكاملات الجهات الخارجية أن تتحقق بشكل قاطع من أن الـ webhook قد نشأ من خوادم SCRIPE الخاصة بك وأن الحمولة لم يتم اعتراضها أو تعديلها عالمياً.",
      securityTitle: "توقيعات تشفيرية (HMAC)",
      title: "إرسال Webhook بحجم ضخم",
    },
    emailIntegration: {
      bilingual: "توجيه القوالب ثنائي اللغة",
      bilingualDesc:
        "اكتشاف اللغات المحلية للوحدات تلقائياً وإرسال رسائل بريد إلكتروني HTML مخصصة بعمق باللغة العربية (RTL) أو الإنجليزية (LTR) من قوالب مصنفة بدقة.",
      configTitle: "تكوينات SMTP ديناميكية",
      description:
        "تسليم بريد إلكتروني للمعاملات غير متزامن وقائم على قوائم الانتظار (Queues) مع قوالب Scriban الغنية والقابلة للتخصيص.",
      featuresTitle: "ميزات تسليم البريد المؤسسي",
      intro:
        "يجب ألا تعيق اتصالات المعاملات (Transactional Communications) طلبات واجهة برمجة التطبيقات أبداً. تتضمن SCRIPE نظام إرسال قائم على قوائم الانتظار (Outbox-pattern) يستفيد من عمليات العمال (Workers) في الخلفية لضمان تسليم بريد إلكتروني سريع للغاية وموثوق عبر SMTP القياسي أو واجهات برمجة التطبيقات المباشرة (REST) مثل SendGrid و Mailgun.",
      pipelineTitle: "مسار المعاملات (Transactional Pipeline)",
      providersTitle: "مزودو نقل محايدون",
      queueBased: "إرساليات الخلفية (Background Dispatches)",
      queueBasedDesc:
        "تستجيب واجهات برمجة التطبيقات في أقل من 50 مللي ثانية، بينما يتم تفويض معالجات السلاسل النصية الثقيلة ومكالمات الشبكة الخارجية إلى خدمات الخلفية المستمرة.",
      retryLogic: "التراجع الأسي (Exponential Backoff)",
      retryLogicDesc:
        "التعامل بأناقة مع انقطاعات الشبكة المؤقتة أو حدود المعدل (Rate-limits) من المزودين الخارجيين مع سياسات إعادة المحاولة المرنة والمدمجة والقابلة للتكوين.",
      templatesContent:
        "اكتب المنطق مباشرة داخل تخطيطات البريد الإلكتروني الخاص بك. باستخدام لغة قوالب Scriban فائقة السرعة، يمكنك تنفيذ كتل شرطية (if/else)، والتكرار عبر العناصر (Loops)، وتنسيق التواريخ بشكل مثالي دون تسريب منطق الأعمال إلى طبقة التطبيق الخاصة بك.",
      templatesTitle: "قوالب Scriban الذكية",
      title: "بنية تحتية مرنة للبريد الإلكتروني",
      tracking: "تتبع التدقيق والتسليم",
      trackingDesc:
        "سجل مُعرّف الإرسال، والطابع الزمني الدقيق، واستجابة المزود لكل بريد إلكتروني يتم إرساله، مما ينشئ مسار تدقيق لا يمكن إنكاره.",
    },
    messageTemplates: {
      bilingualContent:
        "كل قالب يفهم سياق المستخدم أصلياً. أرسل نفس حمولة (Payload) المعاملات بالضبط، وسيقوم المحرك بتقييم اللغة المفضلة للمستلم، لإنشاء اتصالات عربية RTL أو إنجليزية LTR منسقة بشكل جميل على الفور.",
      bilingualTitle: "عرض سياقي ذكي",
      builtInTitle: "قوالب النظام المُكوَّنة مسبقاً",
      description:
        "محرك قوالب ديناميكي قوي يعمل بنظام Scriban لرسائل البريد الإلكتروني المترجمة، والرسائل القصيرة (SMS)، والإشعارات، وإنشاء مستندات PDF.",
      engineContent:
        "لماذا نعيد ترجمة (Recompile) الكود لتغيير سطر موضوع البريد الإلكتروني؟ تستخدم SCRIPE لغة Scriban — وهي لغة قوالب فائقة السرعة ومتوافقة مع Liquid. فهي تقيّم منطق (if/else) بأمان، ومعالجات السلاسل النصية، وتكرار البيانات مباشرة داخل المحتوى، وتُنفذ في أقل من مللي ثانية.",
      engineTitle: "قوالب (Turing-Complete) متقدمة",
      intro:
        "يجب أن تكون اتصالات العملاء ديناميكية، ومخصصة بعمق، وقابلة للنشر فوراً. تفصل SCRIPE ترميز الاتصال عن منطق التطبيق الأساسي باستخدام محرك قوالب آمن وموضوع في بيئة معزولة (Sandboxed).",
      managementTitle: "مركز القوالب المركزي",
      previewContent:
        "يمكن للمطورين وأصحاب المنتجات التكرار الفوري لتصميمات القوالب عبر واجهة المعاينة المباشرة المدمجة. قم بحقن (Inject) حمولات JSON وهمية لاختبار حلقات المنطق المعقدة ومعالجة الأخطاء دون نشر الكود على الإطلاق.",
      previewLive: "حقن الحمولة (Payload) في الوقت الفعلي",
      previewLiveDesc:
        "تصور المخرجات الدقيقة المعروضة عن طريق تغذية بيئة الحماية بكائنات بيانات ديناميكية.",
      previewTitle: "بيئة حماية حية (Sandbox)",
      previewVariables: "ربط النموذج الآمن (Model Binding)",
      previewVariablesDesc:
        "لا يمكن الوصول إلا إلى نماذج العرض (ViewModels) المسموح بها صراحةً بواسطة القالب، مما يضمن أمان البيانات.",
      title: "قوالب الرسائل الديناميكية",
    },
    ssoEnterprise: {
      title: "الدخول الموحد للمؤسسات وموفر الهوية (Enterprise SSO)",
      description:
        "SCRIPE هو خادم مصادقة OIDC/OAuth2 متكامل بالكامل. استبدل Keycloak و Auth0 باتحاد B2B أصلي، وفرض صارم لـ PKCE، ودعم لموفري الهوية المتعددين، وسجل تطبيقات OAuth يمكن إدارته بالكامل عبر لوحة الإدارة.",
      intro:
        "لا يمكن أن توجد برمجيات المؤسسات بدون هوية مؤسسية قوية. تتجاوز SCRIPE عمليات تسجيل الدخول البسيطة لـ SSO - إنها تعمل كمحرك كامل لإدارة الهوية والوصول (IAM). يعمل بشكل أصلي على OpenIddict، ويعمل كموفر هوية يتعامل مع الاتحاد الوارد (الاتصال بـ Azure AD للشركات) وكخادم تفويض يُصدر الرموز إلى تطبيقات خارجية.",
      oidcTitle: "اتحاد فوري وبدون كود (IdP)",
      oidcContent:
        "قم بتوصيل الدلائل الخارجية والوثوق بها فوراً دون كتابة تعليمة برمجية واحدة. من خلال واجهة المستخدم (Admin UI)، يمكن للمستخدم العام ومستخدمي الوحدة ربط Azure Active Directory (Entra) أو Google Workspace أو Okta أو Cognito ببساطة عن طريق عنوان رابط الاكتشاف ومعرفات العميل. تعمل SCRIPE كجهة اعتماد تلقائية وتدمج المطالبات الواردة.",
      oauthAppsTitle: "سجل بوابة تطبيقات OAuth كامل",
      oauthAppsContent:
        "أنشئ بيئتك المتكاملة بنفسك. اسمح لشركائك في B2B باستخدام حسابات SCRIPE كبوابة رئيسية الخاصة بهم لبرمجياتهم الثالثة. ينشئ المسؤول كل تطبيقات OAuth بشكل سلس، مع تخصيص الرموز السرية Client IDs وإصدار الأذونات.",
      tenantIsolationTitle: "عزل هوية الوحدة بصورة مطلقة",
      tenantIsolationContent:
        'يتم قفل كل إعداد وكل تفويض بالوحدة المالك بشكل مشفر (Cryptographically). الشركة "أ" لن ترى أبداً إعدادات الشركة "ب". تقوم فلاتر کیانات (Entity Framework) بعزل كل عمليات واجهة برمجة تطبيقات مصادقة OAuth لتأمين شامل لمقاييس SaaS.',
      pkceSecurityTitle: "هندسة أمان PKCE المشفرة",
      pkceSecurityContent:
        'لا نسمح بنمط "Implicit Flow" مطلقاً. يفرض نظام SCRIPE بصرامة استخدام (PKCE) لجميع حركات المصادقة، سواء الموبايل أو لوحات التحكم أو طرف ثالث خارجي. نمنع أي اختراق عبر شبكات CSRF في متصفحات المستخدم.',
      linkingTitle: "تسجيل دخول يحافظ على الهوية المؤسسية (White-Labeled)",
      linkingContent:
        "بدلاً من طرد المستخدمين لشاشات خارجية قبيحة، يتعامل SCRIPE كأنه هو جهاز التوجيه الأصلي لحزمة البروتوكولات. تظل الألوان وشعاراتك ظاهرة حتى لحظة نقر المستخدم على زر 'تسجيل الدخول عبر Google' للمؤسسات، في بيئة مخصصة ومصقولة بالكامل.",
      valueTitle: "Strategic IAM Value",
      val1Title: "Zero-Trust Identity Protocol",
      val1Desc:
        "Every authentication flow is fortified with stringent PKCE (Proof Key for Code Exchange) validation. We enforce strict state-checking to thwart CSRF attacks and encrypt all latent client secrets at rest. Secret keys never touch the browser.",
      val2Title: "Zero-Code Federation (IdP)",
      val2Desc:
        "Employees and B2B clients sign in instantly with their existing corporate credentials. Connect Azure AD, Google Workspace, Okta, or AWS Cognito directly from the Admin Panel in exactly 30 seconds—no custom backend middleware required.",
      val3Title: "SCRIPE as the Identity Server",
      val3Desc:
        "Why pay for Auth0 or deploy Keycloak? Turn SCRIPE into your primary authentication broker. Register distinct OAuth applications (SPAs, Mobile Apps, external dashboards) to securely consume SCRIPE's JWTs.",
      val4Title: "Absolute Tenant IAM Isolation",
      val4Desc:
        "B2B SaaS superpower: Every single tenant can configure their own isolated SSO providers. Tenant A's Azure AD is mathematically invisible to Tenant B's Google Workspace. SuperAdmins can also provide Global SSO fallbacks.",
      val5Title: "White-Labeled Login Experience",
      val5Desc:
        "Every configured Identity Provider dynamically renders on the login screen with custom hex colors, branded labels, and distinct vectorized SVGs perfectly matching the tenant's brand identity.",
      val6Title: "Future-Proof Standardization",
      val6Desc:
        "SCRIPE relies entirely on the battle-tested OpenIddict framework for robust OIDC and OAuth 2.0 compliance, with planned architecture expansions into SAML 2.0 for legacy government system compliance.",
      protocolsTitle: "Supported Authentication Protocols",
      protocolsContent:
        "SCRIPE mandates adherence to immutable industry standards, ensuring frictionless topological compatibility with every major identity provider globally.",
      comparisonTitle: "How SCRIPE Compares",
      multiIdpTitle: "Infinite Multi-IdP Per Tenant",
      multiIdpContent:
        "Legacy platforms often bind identity to the root infrastructure, forcing all tenants to share an IdP, or requiring massively complex infrastructure scaling. SCRIPE natively supports infinite, uniquely mapped Identity Providers per tenant—all governed through the integrated Admin UI without touching the deployment pipeline.",
      brandingTitle: "Architected for Corporate Branding",
      brandingContent:
        "Deliver a seamless, uncompromising login aesthetic. Tenant administrators simply configure their external SSO within the UI, and the login interface autonomously generates flawlessly styled, tenant-bound SSO buttons ensuring user trust.",
      securityModelTitle: "PKCE Security Architecture",
      securityModelContent:
        "The deprecated Implicit Flow is eradicated. Every SSO login flows exclusively through PKCE (Proof Key for Code Exchange), the definitive standard dictated by OAuth 2.1. Authorization codes are strictly one-time-use, instantly exchanged server-side, with full discovery document caching.",
      oauthTitle: "OAuth Application Registry (SCRIPE as Server)",
      oauthContent:
        "Invert the identity paradigm. By registering third-party software as OAuth Applications within SCRIPE, you instantly transform your application into a centralized enterprise Identity Provider. Mobile applications, partner portals, and decoupled internal microservices can all aggressively rely on SCRIPE for unified identity resolution.",
      oauth1Title: "Confidential Clients (Backend)",
      oauth1Desc:
        "Server-side applications with secure backend storage for client secrets. Perfect for B2B API integrations enforcing the full Authorization Code flow with PKCE.",
      oauth2Title: "Public Clients (SPA & Mobile)",
      oauth2Desc:
        "React, Vue, iOS, and Android applications that cannot securely store static secrets. Strictly leverages the PKCE-only flow, ensuring access tokens are generated flawlessly without risking a compromised client secret.",
    },
  },
};
