export const ar = {
  signup: {
    createWorkspace: "أنشئ مساحة عملك",
    getStarted: "ابدأ مع سكرايب في أقل من دقيقتين",

    // تسميات خطوات المعالج
    steps: {
      plan: "الخطة",
      account: "الحساب",
      verify: "التحقق",
      workspace: "مساحة العمل",
      payment: "الدفع",
      setup: "الإعداد",
      welcome: "مرحباً",
    },
    stepper: {
      label: "تقدم التسجيل",
    },

    // الخطوة 1 — الخطة
    plan: {
      title: "اختر خطتك",
      subtitle: "حدد الخطة التي تناسب احتياجاتك",
      monthly: "شهري",
      annual: "سنوي",
      mo: "شهر",
      free: "مجاني",
      custom: "تسعير مخصص",
      startFree: "ابدأ مجاناً",
      choosePlan: "اختر {{plan}}",
      contactSales: "تواصل مع المبيعات",
      compareAll: "قارن جميع المزايا",
      hideComparison: "إخفاء المقارنة",
      savePercent: "وفّر {{percent}}٪",
      billedAnnually: "يُفوتر سنوياً",
      trialDays: "تجربة مجانية لمدة {{days}} يوم",
      freeTagline: "ابدأ مجاناً",
      allCategories: "الكل",
      compareTitle: "قارن جميع الخطط",
      compareSubtitle: "اطلع على ما تتضمنه كل خطة بالتفصيل",
      noFeatures: "لا توجد مزايا مُعدّة بعد. أضف مزايا من لوحة الإدارة.",
      comparePricesNote: "جميع الأسعار بالدولار الأمريكي. الاشتراك السنوي يُدفع كدفعة واحدة.",
      feature: "الميزة",
      unlimited: "غير محدود",
      features: {
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
      emailPlaceholder: "you@company.com",
      password: "كلمة المرور",
      passwordPlaceholder: "12 حرفاً على الأقل",
      acceptTerms: "أوافق على",
      termsOfService: "شروط الخدمة",
      privacyPolicy: "سياسة الخصوصية",
      and: "و",
      continue: "متابعة",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
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
      domainSuffix: ".scripe.app",
      createWorkspace: "إنشاء مساحة العمل",
      subdomainTaken: "هذا النطاق الفرعي مأخوذ بالفعل.",
      subdomainReserved: "هذا النطاق الفرعي محجوز.",
      subdomainInvalid: "صيغة غير صالحة. استخدم أحرفاً صغيرة وأرقاماً وشرطات.",
      subdomainAvailable: "{{subdomain}}.scripe.app متاح!",
      trySuggestion: "جرّب \"{{suggestion}}\"؟",
      back: "رجوع",
    },

    // الخطوة 5 — الدفع
    payment: {
      freeTitle: "أنت جاهز!",
      freeSubtitle: "لا يلزم الدفع للخطة المجانية.",
      trialTitle: "ابدأ تجربتك لمدة {{days}} يوم",
      paidTitle: "أكمل عملية الشراء",
      plan: "خطة",
      cardNotRequired: "لا يلزم بطاقة ائتمان",
      trialNote: "بدون رسوم اليوم. ستتم الفوترة بعد انتهاء فترة التجربة.",
      trialCta: "← ابدأ التجربة المجانية",
      payCta: "← أكمل الشراء",
      continueFree: "← متابعة",
      processing: "جارٍ المعالجة…",
      promoCode: "رمز ترويجي",
      promoApply: "تطبيق",
      promoApplied: "تم تطبيق الرمز الترويجي!",
      promoInvalid: "رمز ترويجي غير صالح.",
      promoExpired: "انتهت صلاحية هذا الرمز الترويجي.",
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
  },
};
