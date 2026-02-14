/**
 * Arabic locale for the Documentation Portal.
 * Full translation - RTL supported.
 */
import type { DocTranslations } from "./doc.en";

export const docAr: DocTranslations = {
  common: {
    search: "ابحث في الوثائق...",
    searchPlaceholder: "اكتب للبحث...",
    searchShortcut: "⌘K",
    searchNoResults: "لا توجد نتائج",
    searchResultsTitle: "نتائج البحث",
    copyCode: "نسخ",
    codeCopied: "تم النسخ!",
    onThisPage: "في هذه الصفحة",
    relatedDocs: "وثائق ذات صلة",
    lastUpdated: "آخر تحديث",
    previous: "السابق",
    next: "التالي",
    backToTop: "العودة للأعلى",
    expandAll: "توسيع الكل",
    collapseAll: "طي الكل",
    menu: "القائمة",
    closeMenu: "إغلاق القائمة",
    tableOfContents: "جدول المحتويات",
    readingTime: "{{min}} دقيقة قراءة",
    home: "الرئيسية",
    editPage: "تعديل هذه الصفحة",
    version: "الإصدار",
    language: "اللغة",
  },
  info: {
    note: "ملاحظة",
    tip: "نصيحة",
    warning: "تحذير",
    danger: "خطر",
  },
  api: {
    method: "الطريقة",
    endpoint: "نقطة النهاية",
    description: "الوصف",
    auth: "المصادقة",
    authRequired: "مطلوبة",
    noAuth: "عام",
    permission: "الصلاحية",
  },
  nav: {
    getStarted: "البدء",
    tutorials: "الدروس التعليمية",
    architecture: "الهندسة المعمارية",
    features: "الميزات",
    frontend: "الواجهة الأمامية",
    security: "الأمان",
    apiReference: "مرجع API",
    infrastructure: "البنية التحتية",
  },
  getStarted: {
    overview: {
      title: "نظرة عامة",
      description: "مرحباً بك في وثائق منصة Verified ERP.",
      hero: "ابنِ تطبيقات المؤسسات بشكل أسرع",
      heroSub:
        "منصة Modular Monolith جاهزة للإنتاج مع .NET 10 ، Next.js ، وكل ما تحتاجه لبناء تطبيقات مؤسسية قابلة للتطوير.",
      whatIs: "ما هي منصة Verified؟",
      whatIsText:
        "Verified هي منصة ERP للمؤسسات مبنية بهندسة Modular Monolith. توفر أساساً قوياً لبناء تطبيقات أعمال معقدة مع المصادقة والتفويض وتعدد المستأجرين وسجلات المراجعة ولوحة إدارة شاملة.",
      keyFeatures: "الميزات الرئيسية",
      keyFeaturesText: "تتضمن المنصة مجموعة شاملة من الميزات المصممة لتطبيقات المؤسسات.",
      feature1Title: "هندسة Modular Monolith",
      feature1Text:
        "فصل واضح للمسؤوليات مع وحدات معزولة. الخلفية تستخدم CQRS مع MediatR، والواجهة تتبع نمط SOLID View/ViewModel.",
      feature2Title: "أمان المؤسسات",
      feature2Text:
        "التحكم في الوصول المبني على الأدوار (RBAC) مع التخزين المؤقت للصلاحيات على مستوى الخادم، أمان على مستوى الحقول، نطاق البيانات، المصادقة الثنائية، وإدارة الجلسات.",
      feature3Title: "تعدد المستأجرين",
      feature3Text:
        "إدارة مستأجرين مدمجة مع هياكل هرمية، بيانات معزولة، إعدادات لكل مستأجر، وصلاحيات محددة النطاق.",
      feature4Title: "حل شامل",
      feature4Text:
        ".NET 10 مع EF Core للخلفية، Next.js 16 مع TanStack Query v5 للواجهة، إدارة الحالة بـ Zustand، ومحرك CRUD عام قوي.",
      techStack: "الأدوات والتقنيات",
      backendStack: "الخلفية",
      frontendStack: "الواجهة الأمامية",
      quickLinks: "روابط سريعة",
      quickLink1: "دليل البدء السريع",
      quickLink2: "نظرة عامة على الهندسة",
      quickLink3: "أول درس تعليمي",
    },
    prerequisites: {
      title: "المتطلبات المسبقة",
      description: "المتطلبات والأدوات اللازمة قبل البدء.",
      intro: "قبل البدء، تأكد من تثبيت الأدوات التالية على جهاز التطوير الخاص بك.",
      required: "الأدوات المطلوبة",
      dotnet: ".NET 10 SDK",
      dotnetText: "مطلوب لبناء وتشغيل الخلفية. حمّله من موقع .NET الرسمي.",
      nodejs: "Node.js 20+ و npm",
      nodejsText: "مطلوب للواجهة الأمامية. نوصي باستخدام أحدث إصدار LTS.",
      database: "SQL Server (أو PostgreSQL/Oracle)",
      databaseText: "تدعم الخلفية عدة قواعد بيانات. SQL Server هو الافتراضي.",
      ide: "IDE / محرر الأكواد",
      ideText: "Visual Studio 2022+ أو VS Code مع إضافة C# للخلفية. VS Code موصى به للواجهة.",
      optional: "أدوات اختيارية",
      git: "Git",
      gitText: "لإدارة الإصدارات واستنساخ المستودع.",
      docker: "Docker",
      dockerText: "لتشغيل قاعدة البيانات في حاوية (اختياري لكن مُوصى به).",
      postman: "Postman / Thunder Client",
      postmanText: "لاختبار نقاط نهاية API يدوياً.",
    },
    quickStart: {
      title: "البدء السريع",
      description: "شغّل المنصة في 5 دقائق.",
      intro: "اتبع هذه الخطوات لاستنساخ المشروع وتهيئته وتشغيله على جهازك.",
      step1Title: "استنساخ المستودع",
      step1Content: "انسخ المستودع إلى جهازك باستخدام Git.",
      step2Title: "تهيئة قاعدة البيانات",
      step2Content: "حدّث سلسلة الاتصال في ملف تهيئة الخلفية.",
      step3Title: "تشغيل الهجرات",
      step3Content: "طبّق هجرات قاعدة البيانات لإنشاء جميع الجداول.",
      step4Title: "بدء الخلفية",
      step4Content: "شغّل خادم API الخلفية.",
      step5Title: "بدء الواجهة الأمامية",
      step5Content: "ثبّت التبعيات وشغّل خادم التطوير.",
      step6Title: "الوصول للتطبيق",
      step6Content: "افتح المتصفح وانتقل للتطبيق. استخدم بيانات المدير الافتراضية لتسجيل الدخول.",
      defaultCredentials: "بيانات الدخول الافتراضية",
      successTip:
        "إذا تم الإعداد بشكل صحيح، سترى لوحة التحكم. المدير الافتراضي لديه جميع الصلاحيات.",
    },
    projectStructure: {
      title: "هيكل المشروع",
      description: "فهم تخطيط المجلدات لمشروعي الخلفية والواجهة.",
      intro:
        "تم تنظيم المنصة كمستودع أحادي مع مشروعين رئيسيين. كل منهما يتبع هندسة معمارية وحدوية.",
      backendTitle: "هيكل الخلفية",
      backendText: "تتبع الخلفية هندسة Modular Monolith مع نمط CQRS.",
      frontendTitle: "هيكل الواجهة",
      frontendText: "تتبع الواجهة هندسة وحدوية مع نمط SOLID View/ViewModel.",
      keyDirectories: "شرح المجلدات الرئيسية",
    },
  },
  tutorials: {
    firstBackendModule: {
      title: "إنشاء أول وحدة (الخلفية)",
      description: "دليل خطوة بخطوة لإنشاء وحدة خلفية جديدة مع CQRS.",
    },
    firstFrontendModule: {
      title: "إنشاء أول وحدة (الواجهة)",
      description: "بناء وحدة واجهة تتبع نمط SOLID View/ViewModel.",
    },
    addEntity: {
      title: "إضافة كيان مجال",
      description: "إنشاء كيان مجال جديد مع التحقق ودعم المراجعة.",
    },
    addCommand: {
      title: "إضافة أمر (CQRS)",
      description: "إنشاء أمر مع معالج والتحقق وسلوكيات الأنبوب.",
    },
    addQuery: {
      title: "إضافة استعلام (CQRS)",
      description: "إنشاء استعلام مع معالج وتعيين الاستجابة.",
    },
    addPermissions: {
      title: "إضافة صلاحيات",
      description: "تعبئة الصلاحيات وحماية نقاط النهاية بـ RBAC.",
    },
    addApiEndpoint: {
      title: "إضافة نقطة نهاية API",
      description: "إنشاء نقطة نهاية في المتحكم مع توثيق Swagger والمصادقة.",
    },
    apiIntegration: {
      title: "تكامل API في الواجهة",
      description: "ربط وحدة الواجهة بـ API الخلفية.",
    },
  },
  architecture: {
    overview: { title: "نظرة عامة على الهندسة", description: "رؤية عالية المستوى لهندسة المنصة." },
    backend: { title: "هندسة الخلفية", description: ".NET 10 Modular Monolith مع CQRS و DDD." },
    frontend: { title: "هندسة الواجهة", description: "Next.js modular monolith مع أنماط SOLID." },
    cqrs: { title: "نمط CQRS", description: "تطبيق فصل مسؤولية الأوامر والاستعلامات." },
    modules: { title: "نظام الوحدات", description: "كيف يتم هيكلة وعزل الوحدات." },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description: "نمط SOLID لعروض الواجهة ونماذج العرض.",
    },
    stateManagement: {
      title: "إدارة الحالة",
      description: "TanStack Query لحالة الخادم، Zustand لحالة الواجهة.",
    },
    dataFlow: {
      title: "تدفق البيانات",
      description: "كيف تتدفق البيانات من الواجهة لقاعدة البيانات والعكس.",
    },
  },
  features: {
    authentication: {
      title: "المصادقة",
      description: "تسجيل دخول المدير والمستخدم، رموز JWT، تدفق التحديث.",
      overview: "نظرة عامة",
      overviewText:
        "يوفر نظام المصادقة تسجيل دخول آمن للمديرين والمستخدمين العاديين. يستخدم رموز JWT مع تخزين مؤقت للصلاحيات على مستوى الخادم.",
      flowTitle: "تدفق المصادقة",
      loginFlow: "تدفق تسجيل الدخول",
      loginFlowText:
        "عند تسجيل دخول المدير، يتحقق النظام من بيانات الاعتماد، يفحص المصادقة الثنائية، يُنشئ رموز JWT، ويخزن الصلاحيات مؤقتاً على الخادم.",
      endpoints: "نقاط نهاية API",
      backendImpl: "تطبيق الخلفية",
      frontendImpl: "تكامل الواجهة",
      securityFeatures: "ميزات الأمان",
      tipSecurity:
        "الصلاحيات مخزنة مؤقتاً على الخادم (وليس في JWT). هذا يعني أن تغييرات الصلاحيات تسري فوراً دون الحاجة لتحديث الرمز.",
      accountLockout: "قفل الحساب",
      accountLockoutText:
        "بعد 5 محاولات فاشلة لتسجيل الدخول، يُقفل الحساب لمدة 15 دقيقة. هذا يمنع هجمات القوة الغاشمة.",
    },
    twoFactorAuth: {
      title: "المصادقة الثنائية",
      description: "إعداد 2FA بـ TOTP، التحقق، والاسترداد.",
    },
    sessionManagement: {
      title: "إدارة الجلسات",
      description: "تتبع الجلسات النشطة، معلومات الجهاز، وإلغاء الجلسات.",
    },
    profileManagement: {
      title: "إدارة الملف الشخصي",
      description: "تحديث الملف، رفع الصورة، تغيير كلمة المرور.",
    },
    adminManagement: {
      title: "إدارة المديرين",
      description: "CRUD للمديرين، تعيين الأدوار، الانتحال، والعمليات المجمعة.",
    },
    roleManagement: {
      title: "إدارة الأدوار",
      description: "CRUD للأدوار مع تعيين الصلاحيات والاستنساخ.",
    },
    permissionSystem: {
      title: "نظام الصلاحيات",
      description: "RBAC مع التخزين المؤقت على الخادم وأمان على مستوى الحقول.",
    },
    tenantManagement: {
      title: "إدارة المستأجرين",
      description: "CRUD متعدد المستأجرين، التسلسل الهرمي، الإعدادات، والشعارات.",
    },
    menuSystem: {
      title: "نظام القوائم",
      description: "إدارة قوائم ديناميكية مع إعادة الترتيب وعناصر التحكم في الرؤية.",
    },
    dashboardAnalytics: {
      title: "لوحة المعلومات والتحليلات",
      description: "مؤشرات الأداء، الرسوم البيانية، أحداث الأمان، وتصدير البيانات.",
    },
    auditLogging: { title: "سجل المراجعة", description: "مسار مراجعة شامل مع أنبوب من 4 مصادر." },
    recycleBin: {
      title: "سلة المحذوفات",
      description: "عارض السجلات المحذوفة مع إمكانية الاستعادة.",
    },
    fileManagement: {
      title: "إدارة الملفات",
      description: "رفع مجزأ، تنزيل قابل للاستئناف، التحقق بـ ETag.",
    },
    userAuthentication: {
      title: "مصادقة المستخدمين",
      description: "تسجيل المستخدمين، التحقق بالبريد/الهاتف، OAuth.",
    },
  },
  frontend: {
    authModule: {
      title: "وحدة المصادقة",
      description: "تدفق تسجيل الدخول، التحقق من 2FA، إدارة الرموز، وحراسة المسارات.",
    },
    profileModule: {
      title: "وحدة الملف الشخصي",
      description: "ملف المدير، إعدادات الأمان، الجلسات، والنشاط.",
    },
    systemModule: {
      title: "وحدة النظام",
      description: "جميع 12 وحدة فرعية: المديرين، الأدوار، الصلاحيات، المستأجرين، إلخ.",
    },
    crudEngine: {
      title: "محرك CRUD",
      description: "GenericCrudView، DataTable، النماذج، ومساعدات الأعمدة.",
    },
  },
  security: {
    rbac: {
      title: "RBAC والصلاحيات",
      description: "التحكم في الوصول المبني على الأدوار مع التخزين المؤقت على الخادم.",
    },
    fieldLevel: { title: "أمان مستوى الحقول", description: "تقييد الوصول لحقول معينة لكل دور." },
    idEncryption: {
      title: "تشفير المعرفات",
      description: "تشويش معرفات الكيانات بـ AES-256 لواجهات API العامة.",
    },
    tokens: { title: "أمان الرموز", description: "هيكل JWT، تدوير رمز التحديث، وإلغاء الرموز." },
  },
  apiReference: {
    adminAuth: {
      title: "API مصادقة المدير",
      description: "تسجيل الدخول، التحديث، الخروج، 2FA، الجلسات.",
    },
    userAuth: {
      title: "API مصادقة المستخدم",
      description: "التسجيل، التحقق، الدخول، إعادة تعيين كلمة المرور، OAuth.",
    },
    adminManagement: {
      title: "API إدارة المديرين",
      description: "CRUD، العمليات المجمعة، تعيين الأدوار، الانتحال.",
    },
    adminManagementApi: {
      title: "API إدارة المديرين",
      description: "عمليات CRUD كاملة لإدارة حسابات المديرين.",
    },
    roles: { title: "API الأدوار", description: "CRUD للأدوار وتعيين الصلاحيات." },
    tenants: {
      title: "API المستأجرين",
      description: "CRUD للمستأجرين، التسلسل الهرمي، الإعدادات.",
    },
    menus: { title: "API القوائم", description: "CRUD للقوائم، إعادة الترتيب، الرؤية." },
    audit: { title: "API المراجعة", description: "قائمة سجل المراجعة، التفاصيل، والتصدير." },
  },
  infrastructure: {
    database: {
      title: "تهيئة قاعدة البيانات",
      description: "تهيئة SQL Server أو PostgreSQL أو Oracle.",
    },
    multiDatabase: {
      title: "دعم قواعد البيانات المتعددة",
      description: "التبديل بين مزودي قواعد البيانات.",
    },
    migrations: { title: "الهجرات", description: "تشغيل وإدارة هجرات قاعدة البيانات." },
    caching: {
      title: "استراتيجية التخزين المؤقت",
      description: "تخزين مؤقت للصلاحيات والاستعلامات وإبطال التخزين.",
    },
  },
};
