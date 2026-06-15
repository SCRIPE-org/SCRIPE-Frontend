export const ar = {
  signup: {
    createWorkspace: "أنشئ حساب مؤسستك",
    getStarted: "ابدأ مع سكرايب في أقل من دقيقتين",

    // تسميات خطوات المعالج
    steps: {
      organization: "نوع المؤسسة",
      plan: "الخطة",
      account: "الحساب",
      verify: "التحقق",
      workspace: "مساحة العمل",
      review: "المراجعة",
      setup: "الإعداد",
      welcome: "مرحباً",
    },
    stepper: {
      label: "تقدم التسجيل",
    },

    // الشريط العلوي الثابت
    header: {
      haveAccount: "هل لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
    },

    // الهيكل — العناصر المشتركة عبر جميع مراحل المعالج الجديد
    shell: {
      themeToLight: "التبديل إلى الوضع الفاتح",
      themeToDark: "التبديل إلى الوضع الداكن",
      preview: "معاينة",
    },

    // شاشة الترحيب (إعادة تصميم Elevate الجديدة — المرحلة F2)
    welcome: {
      // نصوص احتياطية فقط — المحتوى الحي يأتي من getWelcomeContent()، وتُعرض هذه
      // النصوص إذا تعذّر الوصول إلى نقطة المحتوى حتى لا تظهر الشاشة فارغة.
      headlineFallback: "ابنِ مساحة عملك",
      subcopyFallback:
        "منصة واحدة لإدارة عملك بالكامل — جاهزة خلال دقائق، وتتوسّع بلا حدود.",
      ctaFallback: "ابدأ الآن",
      trustedByFallback: "فريق يعتمد على SCRIPE",
      // تسميات الأقسام
      proofTitle: "موثوق به من فرق تأخذ عملياتها على محمل الجد",
      complianceTitle: "مُدقّق ومتوافق",
      logosTitle: "يدعم فرقاً في مختلف القطاعات",
      // الحالات
      loadError: "تعذّر تحميل أحدث التفاصيل، لكن يمكنك المتابعة بأمان.",
      retry: "إعادة المحاولة",
      reassurance: "لا حاجة لبطاقة ائتمان للبدء.",
    },

    // عنصر نائب مؤقت للمراحل التي لم تُبنَ بعد (يُحذف بعد F1–F2)
    stub: {
      title: "قيد التجميع",
      body: "هذه الخطوة من تجربة التسجيل الجديدة قيد الإنشاء.",
      phaseLabel: "المرحلة: {{phase}}",
      back: "رجوع",
    },

    // الخطوة 1 — الخطة
    plan: {
      title: "اختر خطتك",
      subtitle: "حدد الخطة التي تناسب احتياجاتك",
      monthly: "شهري",
      annual: "سنوي",
      mo: "شهر",
      yr: "سنة",
      free: "مجاني",
      custom: "تسعير مخصص",
      startFree: "ابدأ مجاناً",
      choosePlan: "اختر {{plan}}",
      loadFailed: "فشل تحميل الخطط. يرجى المحاولة مرة أخرى.",
      contactSales: "تواصل مع المبيعات",
      compareAll: "قارن جميع المزايا",
      showComparison: "قارن بين جميع الخطط والمزايا",
      hideComparison: "إخفاء المقارنة",
      savePercent: "وفّر {{percent}}%",
      billedAnnually: "يُفوتر سنوياً",
      trialDays: "تجربة مجانية لمدة {{days}} يوم",
      freeTagline: "ابدأ مجاناً",
      allCategories: "الكل",
      included: "مشمول",
      notIncluded: "غير مشمول",
      categoryFilterLabel: "تصفية حسب القطاع",
      billingCycleLabel: "دورة الفوترة",
      compareTitle: "قارن جميع الخطط",
      compareSubtitle: "اطلع على ما تتضمنه كل خطة بالتفصيل",
      noFeatures: "لا توجد مزايا مُعدّة بعد. أضف مزايا من لوحة الإدارة.",
      noFeaturesData: "لا تتوفر بيانات مزايا لهذه الخطة بعد.",
      scrollToCompare: "مرر للأسفل لمقارنة جميع الميزات",
      comparePricesNote:
        "جميع الأسعار معروضة بالـ {{currency}}. الاشتراك السنوي يُدفع كدفعة واحدة.",
      feature: "الميزة",
      featureSingle: "ميزة",
      featurePlural: "ميزات",
      unlimited: "غير محدود",
      expandAll: "توسيع الكل",
      collapseAll: "طي الكل",
      expandSection: "توسيع القسم",
      collapseSection: "طي القسم",
      featuresCount: "{{count}} ميزات في {{categoriesCount}} فئات",
      featuresHeader: "الميزات",
      features: "الميزات",
      forever: "للأبد",
      currencyNote: "الأسعار بـ {{currency}}",
      currencyLockedNote: "الأسعار معروضة بـ {{currency}} بناءً على موقعك",
      currencyDetected: "تم اكتشاف العملة من موقعك",
      whyRecommended: "لماذا نوصي بهذه الخطة",
      detected: "مُكتشَف",
      searchCurrency: "ابحث عن عملة…",
      noCurrencyFound: "لا توجد عملة",
      selectCurrency: "اختر العملة",
      inheritanceText: "كل مميزات {{prevEditionName}}، بالإضافة إلى:",
      recommended: "موصى به لك",
      recommendedForYou: "موصى به لك",
      fxConvertedTooltip: "سعر تقريبي. يُحسب بالدولار الأمريكي عند الدفع.",
      approximateNote: "تقريباً",
      legacyFeatures: {
        basic: "المزايا الأساسية",
        singleAdmin: "مستخدم مسؤول واحد",
        communitySupport: "دعم المجتمع",
      },
    },

    // الخطوة 2 — الحساب
    account: {
      fullName: "الاسم الكامل",
      fullNamePlaceholder: "أحمد محمد",
      workEmail: "البريد الإلكتروني للعمل",
      emailPlaceholder: "you@example.com",
      password: "كلمة المرور",
      passwordPlaceholder: "12 حرفاً على الأقل",
      acceptTerms: "أوافق على",
      termsOfService: "شروط الخدمة",
      privacyPolicy: "سياسة الخصوصية",
      and: "و",
      continue: "متابعة",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
      trustCue: "تشفير 256 بت · لا حاجة لبطاقة ائتمان",
      passwordStrength: {
        veryWeak: "ضعيفة جداً",
        weak: "ضعيفة",
        fair: "مقبولة",
        good: "جيدة",
        strong: "قوية",
      },
    },

    // قوة كلمة المرور
    password: {
      veryWeak: "ضعيفة جداً",
      weak: "ضعيفة",
      fair: "مقبولة",
      strong: "قوية",
      veryStrong: "قوية جداً",
    },

    // الخطوة 3 — التحقق
    verification: {
      title: "تحقق من بريدك الإلكتروني",
      sentCode: "أرسلنا رمزاً مكوناً من 6 أرقام إلى",
      enterCode: "يرجى إدخال الرمز المكون من 6 أرقام.",
      verifyAndContinue: "تحقق ومتابعة",
      resendCode: "إعادة إرسال الرمز",
      resendIn: "إعادة الإرسال خلال {{seconds}} ثانية",
      back: "رجوع",
      invalidCode: "رمز غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.",
      verificationFailed: "فشل التحقق. يرجى المحاولة مرة أخرى.",
    },

    // الخطوة 4 — مساحة العمل
    workspace: {
      title: "إعداد مساحة العمل",
      subtitle: "المقر الرقمي لفريقك على سكرايب",
      orgName: "اسم المؤسسة",
      orgNamePlaceholder: "شركة أكمي",
      workspaceUrl: "رابط مساحة العمل",
      subdomainPlaceholder: "acme",
      domainSuffix: ".admin.scripe.org",
      createWorkspace: "إنشاء مساحة العمل",
      subdomainTaken: "هذا النطاق الفرعي مأخوذ بالفعل.",
      subdomainReserved: "هذا النطاق الفرعي محجوز.",
      subdomainInvalid: "صيغة غير صالحة. استخدم أحرفاً صغيرة وأرقاماً وشرطات.",
      subdomainAvailable: "{{subdomain}}.admin.scripe.org متاح!",
      trySuggestion: 'جرّب "{{suggestion}}"؟',
      adminUsername: "اسم مستخدم المسؤول",
      adminUsernamePlaceholder: "admin",
      usernameHint: "اسم مستخدم تسجيل الدخول النهائي سيكون: ",
      back: "رجوع",
    },

    // الخطوة 6 — الإعداد
    provisioning: {
      creatingWorkspace: "إنشاء مساحة العمل",
      settingDefaults: "إعداد الافتراضيات",
      registeringAccount: "تسجيل حسابك",
      configuringPermissions: "إعداد الصلاحيات",
      almostReady: "أوشك الانتهاء…",
      usuallyTakes: "يستغرق ذلك عادةً بضع ثوانٍ",
    },

    // الخطوة 7 — الإكمال
    complete: {
      welcomeTitle: "مرحباً بك في سكرايب! 🎉",
      workspaceReady: "مساحة العمل {{name}} جاهزة. يتم تحويلك إلى لوحة التحكم…",
      inviteTeam: "ادعُ أعضاء فريقك",
      customizeBranding: "خصّص هوية العلامة التجارية",
      exploreModules: "استكشف الوحدات والمزايا",
      redirecting: "جارٍ التحويل…",
    },

    // عام
    common: {
      back: "رجوع →",
      optional: "اختياري",
      backLabel: "العودة إلى السؤال السابق",
      loading: "جاري التحميل...",
    },

    // أخطاء
    errors: {
      fullNameRequired: "يرجى إدخال اسمك الكامل.",
      emailRequired: "يرجى إدخال عنوان بريدك الإلكتروني.",
      passwordMinLength: "يجب أن تكون كلمة المرور 12 حرفاً على الأقل.",
      termsRequired: "يجب الموافقة على شروط الخدمة.",
      workspaceNameRequired: "يرجى إدخال اسم مساحة العمل.",
      subdomainMinLength: "يجب أن يكون النطاق الفرعي 3 أحرف على الأقل.",
      subdomainUnavailable: "يرجى اختيار نطاق فرعي متاح.",
      emailVerificationExpired: "انتهت صلاحية التحقق من البريد. يرجى العودة والتحقق مرة أخرى.",
      signupFailed: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
    },

    // حقوق النشر
    copyright: "جميع الحقوق محفوظة",

    // الخطوة 0 — الفئة
    category: {
      title: "ما الذي يصف مؤسستك بشكل أفضل؟",
      subtitle: "سنعرض لك الخطط المناسبة لصناعتك.",
      allIndustries: "جميع الصناعات",
      continue: "متابعة →",
      fromPrice: "من {{price}}/شهر",
      freeAvailable: "خطة مجانية متاحة",
      notSure: "لست متأكداً؟ ابدأ بالعامة",
      skipButton: "تخطي - اعرض جميع الخطط",
    },

    // الخطوة 0b — الاستكشاف الذكي (3 أسئلة تحاورية)
    discovery: {
      badge: "اكتشاف ذكي · نجد لك الخطة المثالية",
      loadError: "تعذر تحميل الأسئلة. يمكنك تخطيها والانتقال مباشرة إلى الخطط.",
      // عناوين الأسئلة (تأثير الكتابة المتحركة)
      seePlans: "اكتشف الخطط المناسبة لك",
      q1Title: "ما طبيعة عملك؟",
      q2Title: "كم حجم فريقك؟",
      q3Title: "ما أهم شيء بالنسبة لك؟",

      // العناوين الفرعية
      q1Sub: "سنخصص توصيات الخطط لتناسب قطاع عملك.",
      q2Sub: "سنطابق الميزات والحصص مع حجم فريقك.",
      q3Sub: "سنبرز الميزة الأهم بالنسبة لك في خطتك الموصى بها.",

      // إجراءات التخطي
      skipQ: "تخطي · سأختار لاحقاً",
      skipToPlans: "تخطي · أرني الخطط",
      skipAll: "تخطي جميع الأسئلة · اذهب مباشرة إلى الخطط",
      q3Confirm: "تم · أظهر خطتي ←",
      q3MaxReached: "تم تحديد ٣ من ٣ (الحد الأقصى)",
      q3Count: "تم تحديد {{count}} من {{max}}",
      q3GroupLabel: "اختر أهم أولوياتك (حتى ٣)",
      selected: "محدد",
      limitReached: "تم الوصول للحد الأقصى",
      q3ConfirmLabel: "تأكيد الأولويات ورؤية الخطة الموصى بها",
      skipToPlansLabel: "تخطي الأولويات والانتقال مباشرة إلى الخطط",

      // س2 — تسميات حجم الفريق
      teamSize: {
        solo: "منفرد",
        soloSub: "أنا وحدي",
        small: "صغير",
        smallSub: "٢ – ١٠ أشخاص",
        medium: "متوسط",
        mediumSub: "١١ – ٥٠ شخصاً",
        growing: "نامٍ",
        growingSub: "٥١ – ٢٠٠ شخص",
        enterprise: "مؤسسي",
        enterpriseSub: "٢٠٠+ شخص",
      },

      // س3 — تسميات الأولويات (عامة)
      priority: {
        analytics: "التحليلات والرؤى",
        automation: "الأتمتة وسير العمل",
        security: "الأمان والامتثال",
        collaboration: "تعاون الفريق",
        integrations: "التكاملات وواجهات API",
        support: "دعم العملاء",
        speed: "السرعة والأداء",
        customization: "التخصيص",
        // خاص بـ ERP
        multiTenant: "متعدد المستأجرين",
        compliance: "الامتثال التنظيمي",
        apiAccess: "الوصول لواجهة API",
        whiteLabel: "العلامة البيضاء",
        sso: "الدخول الأحادي (SSO)",
        // خاص بالرعاية الصحية
        hipaa: "امتثال HIPAA",
        patientData: "أمان بيانات المرضى",
        audit: "سجلات التدقيق",
        dedicatedSupport: "دعم مخصص",
      },

      // تلميح التوصية (يظهر قبل السؤال الثالث)
      hint: {
        free: "المجانية",
        pro: "برو",
        ultra: "ألترا",
        enterprise: "المؤسسية",
        message: "بناءً على ملفك، سنبرز خطة {{plan}} لك.",
      },

      // مؤشر حالة التقييم الذكي
      scoring: "نجد أفضل خطة لك…",

      // تسميات التنقل / الحالة (Task 32)
      skip: "تخطي",
      pickUpTo: "اختر حتى {{max}}",
      next: "التالي",
      back: "رجوع",
      loading: "جارٍ تحميل الأسئلة...",
      error: "تعذّر تحميل الأسئلة",
      retry: "حاول مرة أخرى",

      // ── مرحلة الاكتشاف التكيّفية (إعادة تصميم Elevate — F3) ────────────────
      // نصوص الواجهة فقط؛ نص الأسئلة والخيارات يصل مترجماً من الـ API.
      stage: {
        progressLabel: "تقدّم الاكتشاف",
        next: "التالي",
        back: "رجوع",
        skipStep: "تخطّي هذا",
        skipAll: "تخطّي — أرني الخطط",
        skipToPlans: "الانتقال إلى الخطط",
        seePlans: "اعرض خطتي",
        topPriority: "الأهم",

        // المعاينة الحيّة للملف (العمود الجانبي / مضمّنة على الجوال)
        profileTitle: "ملفك",
        profileEmpty: "أجب عن بضعة أسئلة وسنصمّم خطة تناسب طريقة عملك.",
        profileBuilding: "إليك ما لدينا حتى الآن.",
        profileTease: "سنستخدم هذا لنوصي بالخطة الأنسب لك.",

        // استرداد الخطأ / الحالة الفارغة
        errorTitle: "تعذّر تحميل الأسئلة",
        errorBody: "حدث ما قاطع الاتصال. حاول مرة أخرى، أو انتقل مباشرة إلى الخطط.",
        retry: "حاول مرة أخرى",
      },
    },

    // تواصل مع المبيعات
    contactSales: {
      title: "تحدث مع فريق المبيعات",
      interested: "مهتم بـ:",
      company: "اسم الشركة",
      companyPlaceholder: "شركة أكمي",
      companySize: "حجم الشركة",
      noteLabel: "هل هناك ما تود مشاركته؟",
      notePlaceholder: "الجدول الزمني، المتطلبات المحددة، التكاملات التي تحتاجها…",
      cta: "طلب عرض توضيحي",
      successTitle: "سنتواصل معك قريباً!",
      successSubtitle: "سيتواصل معك فريق المبيعات خلال ١–٢ أيام عمل.",
      fallback: "أو راسلنا على {{email}}",
      backToPlans: "→ رجوع إلى الخطط",
      phone: "رقم الهاتف",
      phonePlaceholder: "+966 55 000 0000",
      whatsNext: "ما الذي سيحدث بعد ذلك",
      next1: "يراجع فريقنا متطلباتك",
      next2: "ستتلقى دعوة لعرض توضيحي مخصص",
      next3: "تسعير مخصص يناسب عملك",
      yourAnswers: "ملفك الشخصي",
      people: "أشخاص",
    },

    // الخطوة 5 — المراجعة
    review: {
      freeTitle: "أنت جاهز!",
      freeSubtitle: "راجع تفاصيلك وأنشئ مساحة عملك.",
      createWorkspace: "أنشئ مساحة عملك",
      trialTitle: "ابدأ تجربتك المجانية لمدة {{days}} يوم",
      trialSubtitle: "أضف بطاقة في صفحة الدفع الآمنة - لن يتم خصم أي مبلغ خلال التجربة.",
      trialStarts: "تجربة مجانية لمدة {{days}} يوم - تبدأ عند إتمام الدفع",
      thenPrice: "ثم {{price}}/{{cycle}}",
      cancelAnytime: "إلغاء في أي وقت",
      reminder: "سنذكّرك قبل 3 أيام من أي رسوم",
      startTrialCta: "ابدأ التجربة المجانية - تابع إلى الدفع الآمن",
      checkoutTitle: "راجع خطتك",
      checkoutSubtitle: "يرجى تأكيد تفاصيلك قبل الانتقال إلى الدفع الآمن.",
      billedTotal: "يُفوتر اليوم",
      checkoutCta: "تابع إلى الدفع الآمن",
      planLabel: "الخطة",
      billingLabel: "الفوترة",
      workspaceLabel: "مساحة العمل",
      accountLabel: "الحساب",
      perMonth: "شهر",
      perYear: "سنة",
      editPlan: "تعديل الخطة",
      launchWorkspace: "أطلق مساحة عملك",
      goToCheckout: "الانتقال إلى الدفع",
      changePlan: "تغيير الخطة",
      promoHint: "هل لديك رمز ترويجي؟ طبّقه في صفحة الدفع الآمنة.",
      paymentPageNote: "ستتم إعادة توجيهك إلى صفحة دفع آمنة باللغة الإنجليزية.",
      checkoutCanceled: "تم إلغاء الدفع - يمكنك المحاولة مرة أخرى أو تغيير خطتك.",
    },

    // صفحة الإنهاء (بعد Stripe)
    finalize: {
      processing: "جارٍ إعداد مساحة عملك…",
      waiting: "جارٍ تأكيد الدفع مع مزود الدفع.",
      slow: "يكتمل هذا عادةً خلال 15 دقيقة - سنرسل لك رابط الوصول بالبريد.",
      paymentConfirmed: "تم تأكيد الدفع!",
      opening: "جارٍ فتح مساحة عملك…",
      successTitle: "مساحة عملك جاهزة!",
      redirecting: "جارٍ نقلك إلى لوحة التحكم…",
      failed: "لم يكتمل التسجيل. لم يتم خصم أي مبلغ من بطاقتك.",
      expired: "انتهت صلاحية هذا الرابط.",
      startAgain: "ابدأ تسجيلاً جديداً - لم يتم خصم أي مبلغ",
      consumedTitle: "اكتمل التسجيل مسبقاً",
      consumedSubtitle: "مساحة عملك جاهزة - سجّل الدخول باستخدام بياناتك.",
      changePlan: "تغيير الخطة",
      timeoutTitle: "يستغرق الأمر وقتاً أطول من المعتاد",
      timeoutSubtitle: "لا يزال الإعداد جارياً. سنرسل لك رابط مساحة العمل بمجرد اكتمالها.",
    },

    // دورة الفوترة
    billing: {
      monthly: "شهري",
      yearly: "سنوي",
    },

    // نافذة استئناف التسجيل
    resume: {
      title: "استئناف تسجيلك",
      subtitle: "لديك جلسة تسجيل معلقة. هل تريد المتابعة؟",
      pendingPlan: "الخطة المعلقة: {{plan}}",
      continue: "متابعة التسجيل",
      changePlan: "اختيار خطة مختلفة",
      startFresh: "البدء من جديد",
    },
  },

  // ── أسباب التوصية ────────────────────────────────────────────────────────
  // مساحة أسماء علوية (شقيقة لـ signup): الخادم يرسل مفاتيح "recommendation.reason.*"
  // المجردة من GET /auth/signup/recommendation وتُعرض كما هي على بطاقة الخطة.
  recommendation: {
    reason: {
      scored: "مُختار بناءً على ملفك",
      catalog_empty: "نقطة انطلاق ممتازة — يمكنك تغيير الخطة في أي وقت",
      team: {
        solo: "مناسب للمؤسس الفردي",
        small: "يناسب فريقًا صغيرًا",
        medium: "ينمو مع فريقك المتنامي",
        large: "مصمم للفرق الكبيرة",
        enterprise: "جاهز لمستوى المؤسسات",
        unknown: "مرن لأي حجم فريق",
      },
      priority: {
        security: "يلبي احتياجات الأمان والامتثال لديك",
        scale: "يتعامل مع احتياجات التوسع وواجهات API",
        support: "يشمل مستوى الدعم الذي تريده",
      },
      vertical_match: "مُصمم خصيصًا لمجال عملك",
    },
  },
};
