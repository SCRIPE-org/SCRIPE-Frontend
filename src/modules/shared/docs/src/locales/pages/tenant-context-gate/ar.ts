// FILE-EXCEPTION: file length
/**
 * Docs page locale — AR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const ar = {
  features: {
    tenantContextGate: {
      title: "Tenant Context Gate",
      description:
        "RequiresTenantContext flag, multi-layer menu visibility defense, drill-down behavior, and impersonation scoping for tenant-only pages.",
      intro:
        "The Tenant Context Gate is a security mechanism that prevents system admins from accidentally (or intentionally) accessing tenant-scoped pages when they have no active tenant context. Pages like Tenant Plans, User Subscriptions, and the Customizer Studio only make sense within a specific tenant's context – showing them to a system admin with no tenant would either show incorrect data or expose cross-tenant information.",
      problemTitle: "The Problem",
      problemIntro:
        "System super-admins have a bypass flag (IsSystemProtectedAdmin) that normally grants them access to all pages. Without a gate, a super-admin with no tenant context could navigate to /tenant-plans and see data from all tenants, or crash the page because no TenantId is available.",
      solutionTitle: "The Solution: RequiresTenantContext",
      solutionIntro:
        "We introduced the RequiresTenantContext boolean flag in the DocNavigationItem schema. When this flag is set to true, the frontend actively checks if the current user has a valid tenantId. If they do not, the item is completely stripped from the navigation menu and the route redirects to the overview page.",
      layersTitle: "Defense In Depth",
      layersIntro: "The gate operates at three levels:",
      layer1:
        "1. Menu Visibility: The navigation builder strips the item from the sidebar if no tenant context is present.",
      layer2:
        "2. Route Protection: The page component uses useAppStore to verify the tenant context before attempting to fetch data.",
      layer3:
        "3. Backend Gate: The API endpoints themselves throw 403 Forbidden if a system admin attempts to fetch tenant-scoped data without an explicit drill-down tenant ID header.",
      drillDownTitle: "Drill-Down and Impersonation",
      drillDownIntro:
        "System admins can still access these pages, but only through explicit context-switching mechanisms:",
      drill1:
        'Enter Tenant World (Drill-Down): The admin clicks "Enter Tenant World" on a tenant record. This sets the tenantId in the global state and adds it to the X-Tenant-Id header for all subsequent API requests. The gate now opens, and the admin sees exactly what the tenant sees.',
      drill2:
        "User Impersonation: The admin impersonates a specific tenant user. This swaps the JWT entirely, providing a perfect replica of the user's experience, including all tenant-scoped pages.",
      layer1Title: "الطبقة 1: مرشح رؤية القائمة في الواجهة الأمامية",
      layer1Intro:
        "يفحص خط معالجة القوائم علامة RequiresTenantContext لكل عنصر. إذا لم يكن للمستخدم الحالي معرّف وحدة فعال، يتم استبعاد العنصر بالكامل من شجرة التنقل قبل إرسالها للعميل.",
      layer2Title: "الطبقة 2: حراس المسارات من جانب العميل",
      layer2Intro:
        "تتحقق طبقات وسيطة Next.js ومغلفات الصفحات من useAppStore للتحقق من وجود سياق وحدة فعال قبل تحميل الصفحة. تعيد المحاولات غير المصرح بها التوجيه تلقائيًا إلى نظرة عامة على مساحة العمل.",
      layer3Title: "الطبقة 3: جدار حماية المتحكمات والطبقة الوسيطة في الواجهة الخلفية",
      layer3Intro:
        "تتحقق المتحكمات ومعالجات CQRS بشكل مستقل من سياق الوحدة، مع إرجاع 401 Unauthorized أو 403 Forbidden إذا لم يوفر الطلب سياق وحدة صالح.",
      drillDownNote:
        "يقتصر الوصول عبر الغوص الإداري (Drill-Down) على مسؤولي النظام الذين يملكون إذن 'tenants.drill_down'. تخضع جميع عمليات الغوص للتدقيق مع تسجيل معرّف المسؤول ومعرّف الوحدة المستهدفة.",
      impersonationTitle: "نطاق انتحال هوية المستخدمين",
      impersonationIntro:
        "أثناء انتحال شخصية المستخدم، يستبدل خط الأمان رمز المطالبات برمز جلسة محدد بنطاق الوحدة، ليرث بدقة حدود الوحدة وصلاحياتها.",
      flaggedPagesTitle: "الصفحات المحمية الخاصة بالوحدات فقط",
      flaggedPagesIntro: "تفرض الواجهات الإدارية التالية بوابات سياق الوحدة بصرامة:",
      flaggedPage1: "خطط اشتراك الوحدات وتكوين الفوترة",
      flaggedPage2: "اشتراكات المستخدمين والصلاحيات الفردية",
      flaggedPage3: "استوديو تخصيص السمات وهوية مساحة العمل",
      flaggedPage4: "إعدادات تكوين الوحدة ونطاقات الربط المخصص",
      flaggedPage5: "قوالب الرسائل والإشعارات الخاصة بالوحدة",
      flaggedPage6: "سلة محذوفات النظام وسجلات الاسترجاع",
      addingTitle: "إضافة صفحات محمية جديدة",
      addingIntro:
        "لتأمين أي صفحة جديدة خاصة بالوحدة، أضف السمة RequiresTenantContext: true إلى تعريف عنصر التنقل في مسجل التوثيق ومسارات Next.js.",
      addingTip:
        "تأكد دائمًا من حقن مدقق TenantContextBehavior في مسار أوامر CQRS الخلفية لمنع أي استدعاء برمجي مباشر دون سياق وحدة.",
      seederTitle: "التهيئة الأولية وبيانات البذر",
      seederIntro:
        "يقوم نظام بذر البيانات الأساسي بضبط علامات سياق الوحدة تلقائيًا لجميع عناصر القوائم القياسية أثناء تشغيل النظام لأول مرة.",
    },
  },
};
