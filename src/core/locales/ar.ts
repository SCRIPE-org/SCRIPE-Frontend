export const ar = {
  // Authentication
  auth: {
    login: "تسجيل الدخول",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginButton: "دخول",
    loginError: "خطأ في اسم المستخدم أو كلمة المرور",
    welcome: "اسم التطبيق",
    pleaseLogin: "يرجى تسجيل الدخول للمتابعة",
    usernamePlaceholder: "المشرف العام",
    connectionError: "خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
    redirecting: "جاري التحويل...",
  },

  // Not Authorized Page
  notAuthorized: {
    title: "تم رفض الوصول",
    description:
      "ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى الاتصال بمدير النظام إذا كنت تعتقد أن هذا خطأ.",
    goBack: "العودة",
    goHome: "الذهاب إلى لوحة التحكم",
    contactAdmin: "تحتاج مساعدة؟ اتصل بمدير النظام.",
    accessDeniedAlert: "تم رفض الوصول:",
    accessDeniedMessage:
      "ليس لديك الصلاحيات المطلوبة لعرض هذه الصفحة. يرجى الاتصال بمدير النظام إذا كنت تعتقد أن هذا خطأ.",
    needAccessTitle: "تحتاج إلى صلاحية؟",
    needAccessDescription:
      "إذا كنت تحتاج إلى الوصول لهذا المورد، يرجى الاتصال بمدير النظام أو تقديم طلب من خلال القنوات المناسبة. قم بتضمين تفاصيل حول ما تحاول الوصول إليه ولماذا تحتاج إليه.",
  },

  // Navigation
  nav: {
    dashboard: "لوحة التحكم",
    demo: "تجريبي",
    tree: "شجرة",
    home: "الرئيسية",
    products: "المنتجات",
    richTextEditor: "محرر النصوص الغني",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل خروج",
    appUser: "مستخدمو التطبيق",
    organizationStructure: "الهيكل التنظيمي",
    city: "المدن",
    carType: "أنواع السيارات",
    carColor: "ألوان السيارات",
    state: "الولايات",
    ticketFare: "أسعار التذاكر",
    role: "الأدوار",
  },

  // Product
  product: {
    title: "إدارة المنتجات",
    description: "إدارة مخزون المنتجات والكتالوج",
    item: "منتج",
    items: "منتجات",
    product: "منتج",
    name: "الاسم",
    category: "الفئة",
    price: "السعر",
    stock: "المخزون",
    supplier: "المورد",
    status: "الحالة",
    sku: "رمز المنتج",
    weight: "الوزن",
    dimensions: "الأبعاد",
    color: "اللون",
    material: "المادة",
    warranty: "الضمان",
    active: "نشط",
    inactive: "غير نشط",
    discontinued: "متوقف",
    namePlaceholder: "أدخل اسم المنتج",
    categoryPlaceholder: "أدخل الفئة",
    pricePlaceholder: "أدخل السعر",
    stockPlaceholder: "أدخل كمية المخزون",
    supplierPlaceholder: "أدخل اسم المورد",
    descriptionPlaceholder: "أدخل وصف المنتج",
    skuPlaceholder: "أدخل رمز المنتج",
    weightPlaceholder: "أدخل الوزن",
    dimensionsPlaceholder: "أدخل الأبعاد",
    colorPlaceholder: "أدخل اللون",
    materialPlaceholder: "أدخل المادة",
    warrantyPlaceholder: "أدخل معلومات الضمان",
  },
  imageUploader: {
    placeholder: "انقر للتحميل أو اسحب وأفلت",
    selectFile: "اختر ملف",
    preview: "معاينة",
    remove: "إزالة الصورة",
    uploading: "جاري التحميل...",
    dropHere: "أفلت الصورة هنا",
    supportedFormats: "PNG، JPG، GIF، WEBP",
    errors: {
      invalidType: "نوع الملف غير صالح. يرجى اختيار صورة.",
      tooLarge: "الملف كبير جداً. الحد الأقصى للحجم هو {maxSize} ميجابايت.",
      readFailed: "فشل قراءة الملف.",
    }
  },
  // TreeNode
  treeNode: {
    title: "إدارة الهيكل الشجري",
    description: "إدارة الهيكل الهرمي الشجري",
    item: "عقدة",
    items: "عقد",
    name: "الاسم",
    type: "النوع",
    status: "الحالة",
    parentNode: "العقدة الأم",
    order: "الترتيب",
    active: "نشط",
    inactive: "غير نشط",
    pending: "معلق",
    root: "جذر",
    namePlaceholder: "أدخل اسم العقدة",
    typePlaceholder: "أدخل نوع العقدة",
    orderPlaceholder: "أدخل الترتيب",
    descriptionPlaceholder: "أدخل الوصف",
    selectStatus: "اختر الحالة",
    selectParentNode: "اختر العقدة الأم",
  },

  // Layout & App
  app: {
    title: "اسم التطبيق",
    subtitle: "الإدارية",
    tagline: "اسم التطبيق",
    modern: "العصرية",
    classic: "الكلاسيكية",
    elegant: "الأنيقة",
    minimal: "البسيطة",
    compact: "المدمجة",
    floating: "العائمة",
    floatingDesign: "تصميم عائم",
    version: "v2.1.0",
  },

  // Logo & Icons
  logo: {
    type: "sparkles", // Options: "sparkles", "shield", "image", "custom"
    image: "/placeholder-logo.svg", // Path to logo image
    text: "SA", // Text for shield/avatar fallback
  },

  // Dashboard
  dashboard: {
    title: "نظرة عامة على لوحة التحكم",
    welcome: "مرحباً بعودتك!",
    totalUsers: "إجمالي المستخدمين",
    revenue: "الإيرادات",
    orders: "الطلبات",
    growth: "النمو",
    revenueOverview: "نظرة عامة على الإيرادات",
  },

  // Analytics
  analytics: {
    description: "تحليلات وإحصائيات مفصلة",
    userGrowth: "نمو المستخدمين",
    revenueTrend: "اتجاه الإيرادات",
    combined: "التحليلات المجمعة",
    users: "المستخدمون",
    revenue: "الإيرادات",
  },

  // Charts
  charts: {
    title: "مكونات الرسوم البيانية",
    description: "مكونات رسوم بيانية تفاعلية مع بيانات نموذجية",
    lineCharts: "الرسوم الخطية",
    areaCharts: "رسوم المساحة",
    barCharts: "الرسوم العمودية",
    pieDonutCharts: "الرسوم الدائرية والحلقية",
    scatterBubbleCharts: "رسوم التشتت والفقاعات",
    mixedCharts: "الرسوم المختلطة",
    radarGaugeCharts: "رسوم الرادار والمقياس",
    heatmapTreemapCharts: "خرائط الحرارة والشجرة",
    timelineFunnelCharts: "رسوم الجدول الزمني والقمع",
    lineDesc: "عرض الاتجاهات والتغييرات عبر الزمن",
    areaDesc: "التأكيد على حجم التغيير بالمناطق المملوءة",
    barDesc: "مقارنة الفئات بالأعمدة الأفقية أو العمودية",
    pieDesc: "عرض البيانات النسبية بالتصورات الدائرية",
    scatterDesc: "تصور العلاقات بين المتغيرات بالنقاط المرسومة",
    mixedDesc: "دمج أنواع مختلفة من الرسوم البيانية للحصول على عروض شاملة",
    radarDesc: "بيانات متعددة الأبعاد وتصور مؤشرات الأداء الرئيسية",
    heatmapDesc: "التعرف على الأنماط وتصور البيانات الهرمية",
    timelineDesc: "تتبع المشاريع وتصور عمليات التحويل",

    // Chart types
    basicLine: "رسم خطي أساسي",
    multiSeries: "خط متعدد السلاسل",
    curved: "خط منحني",
    stepped: "خط متدرج",
    basicArea: "رسم مساحة أساسي",
    stackedArea: "مساحة مكدسة",
    basicBar: "رسم عمودي أساسي",
    stackedBar: "أعمدة مكدسة",
    horizontalBar: "أعمدة أفقية",
    negativeBar: "أعمدة بقيم سالبة",
    pieChart: "رسم دائري",
    donutChart: "رسم حلقي",
    scatterChart: "رسم تشتت",
    bubbleChart: "رسم فقاعات",
    composedChart: "رسم مركب",
    dualAxisChart: "رسم ثنائي المحاور",
    radarChart: "رسم رادار",
    gaugeChart: "رسم مقياس",
    heatmapChart: "خريطة حرارية",
    treemapChart: "خريطة شجرية",
    timelineChart: "رسم زمني",
    funnelChart: "رسم قمع",

    // Chart tabs
    tabs: {
      line: "خطي",
      area: "مساحي",
      bar: "عمودي",
      pie: "دائري ومجوف",
      scatter: "انتشاري وفقاعي",
      radar: "راداري وقطبي",
      mixed: "مختلط",
      heatmap: "خريطة حرارية",
      treemap: "خريطة شجرية",
      timeline: "زمني",
      funnel: "قمعي",
      gauge: "مقياس",
      comprehensive: "جميع الأمثلة"
    },

    // Comprehensive examples
    comprehensive: {
      title: "أمثلة شاملة للرسوم البيانية",
      description: "استكشف جميع أنواع الرسوم البيانية مع أنماط متقدمة، رسوم متحركة، وتفاعلات"
    },

    // Chart types with detailed examples
    line: {
      basic: {
        title: "رسم بياني خطي أساسي",
        description: "رسم بياني خطي بسيط يوضح اتجاهات البيانات بمرور الوقت"
      },
      multiSeries: {
        title: "رسم بياني خطي متعدد السلاسل",
        description: "رسم بياني خطي بسلاسل بيانات متعددة للمقارنة"
      },
      curved: {
        title: "رسم بياني خطي منحني",
        description: "رسم بياني خطي منحني ناعم مع جاذبية بصرية محسنة"
      },
      stepped: {
        title: "رسم بياني خطي متدرج",
        description: "رسم بياني خطي خطوة بخطوة يوضح التغييرات المنفصلة"
      },
      area: {
        title: "رسم بياني خطي مساحي",
        description: "رسم بياني خطي مع ملء المنطقة أسفل المنحنى"
      },
      gradient: {
        title: "رسم بياني خطي متدرج",
        description: "رسم بياني خطي مع تأثيرات ملء متدرجة"
      },
      animated: {
        title: "رسم بياني خطي متحرك",
        description: "رسم بياني خطي مع حركات سلسة وتحولات"
      },
      interactive: {
        title: "رسم بياني خطي تفاعلي",
        description: "رسم بياني خطي مع تأثيرات التمرير وتفاعلات نقاط البيانات"
      },
      realtime: {
        title: "رسم بياني خطي في الوقت الفعلي",
        description: "رسم بياني خطي محدث مباشرة لتصور البيانات الديناميكية"
      },
      stacked: {
        title: "رسم بياني خطي مكدس",
        description: "رسم بياني خطي مكدس يوضح قيم البيانات التراكمية"
      }
    },

    bar: {
      basic: {
        title: "رسم بياني عمودي أساسي",
        description: "رسم بياني عمودي بسيط لمقارنة البيانات الفئوية"
      },
      multiSeries: {
        title: "رسم بياني عمودي متعدد السلاسل",
        description: "رسم بياني عمودي بسلاسل بيانات متعددة"
      },
      horizontal: {
        title: "رسم بياني عمودي أفقي",
        description: "رسم بياني عمودي أفقي لقراءة أفضل للتسميات"
      },
      stacked: {
        title: "رسم بياني عمودي مكدس",
        description: "رسم بياني عمودي مكدس يوضح علاقات الجزء إلى الكل"
      },
      grouped: {
        title: "رسم بياني عمودي مجمع",
        description: "رسم بياني عمودي مجمع للمقارنات جنباً إلى جنب"
      },
      gradient: {
        title: "رسم بياني عمودي متدرج",
        description: "رسم بياني عمودي مع تأثيرات ألوان متدرجة"
      },
      animated: {
        title: "رسم بياني عمودي متحرك",
        description: "رسم بياني عمودي مع حركات تحميل سلسة"
      },
      interactive: {
        title: "رسم بياني عمودي تفاعلي",
        description: "رسم بياني عمودي مع تفاعلات النقر والتمرير"
      },
      floating: {
        title: "رسم بياني عمودي عائم",
        description: "رسم بياني عمودي عائم يوضح النطاقات والفواصل"
      },
      waterfall: {
        title: "مخطط شلال",
        description: "مخطط شلال يوضح التغييرات التراكمية"
      }
    },

    area: {
      basic: {
        title: "رسم بياني مساحي أساسي",
        description: "رسم بياني مساحي بسيط مع مناطق مملوءة"
      },
      stacked: {
        title: "رسم بياني مساحي مكدس",
        description: "رسم بياني مساحي مكدس يوضح البيانات التراكمية"
      },
      percentage: {
        title: "رسم بياني مساحي نسبة مئوية",
        description: "رسم بياني مساحي يوضح التوزيعات النسبة المئوية"
      },
      gradient: {
        title: "رسم بياني مساحي متدرج",
        description: "رسم بياني مساحي مع تدرجات مملوءة سلسة"
      },
      animated: {
        title: "رسم بياني مساحي متحرك",
        description: "رسم بياني مساحي مع حركات تحميل سلسة"
      },
      interactive: {
        title: "رسم بياني مساحي تفاعلي",
        description: "رسم بياني مساحي مع تأثيرات التمرير والاختيار"
      },
      multiAxis: {
        title: "رسم بياني مساحي متعدد المحاور",
        description: "رسم بياني مساحي مع محاور Y متعددة لمقاييس مختلفة"
      },
      smooth: {
        title: "رسم بياني مساحي سلس",
        description: "رسم بياني مساحي مع خطوط منحنية وتحولات سلسة"
      },
      realtime: {
        title: "رسم بياني مساحي في الوقت الفعلي",
        description: "رسم بياني مساحي محدث مباشرة لبيانات البث المباشر"
      },
      polar: {
        title: "رسم بياني مساحي قطبي",
        description: "رسم بياني مساحي دائري لتصور البيانات الشعاعية"
      },
      spline: {
        title: "رسم بياني مساحي منحني",
        description: "رسم بياني مساحي منحني ناعم لتمثيل البيانات بشكل أنيق"
      },
      range: {
        title: "رسم بياني مساحي نطاقي",
        description: "رسم بياني مساحي يوضح نطاقات البيانات وفترات الثقة"
      },
      filled: {
        title: "رسم بياني مساحي مملوء",
        description: "رسم بياني مساحي مع ملء ألوان صلبة وشفافية"
      },
      layered: {
        title: "رسم بياني مساحي متعدد الطبقات",
        description: "رسم بياني مساحي متعدد الطبقات مع مناطق متداخلة"
      }
    },

    pie: {
      basic: {
        title: "رسم بياني دائري أساسي",
        description: "رسم بياني دائري بسيط يوضح نسب البيانات"
      },
      donut: {
        title: "رسم بياني مجوف",
        description: "رسم بياني مجوف مع مركز مجوف لقراءة أفضل"
      },
      exploded: {
        title: "رسم بياني دائري منفجر",
        description: "رسم بياني دائري مع شرائح منفصلة للتأكيد"
      },
      gradient: {
        title: "رسم بياني دائري متدرج",
        description: "رسم بياني دائري مع تأثيرات ألوان متدرجة"
      },
      animated: {
        title: "رسم بياني دائري متحرك",
        description: "رسم بياني دائري مع حركات تحميل سلسة"
      },
      interactive: {
        title: "رسم بياني دائري تفاعلي",
        description: "رسم بياني دائري مع تفاعلات النقر والتمرير"
      },
      nested: {
        title: "رسم بياني دائري متداخل",
        description: "رسم بياني دائري متعدد المستويات يوضح البيانات الهرمية"
      },
      polar: {
        title: "رسم بياني دائري قطبي",
        description: "رسم بياني دائري في نظام الإحداثيات القطبية"
      },
      semiCircle: {
        title: "رسم بياني دائري نصف دائرة",
        description: "رسم بياني دائري نصف دائرة لتصور التقدم"
      },
      rose: {
        title: "مخطط وردة",
        description: "مخطط وردة يوضح أنماط البيانات الدورية"
      }
    },

    scatter: {
      basic: {
        title: "رسم بياني انتشاري أساسي",
        description: "رسم بياني انتشاري بسيط يوضح علاقات نقاط البيانات"
      },
      bubble: {
        title: "رسم بياني فقاعي",
        description: "رسم بياني فقاعات مع أحجام نقاط متغيرة"
      },
      animated: {
        title: "رسم بياني انتشاري متحرك",
        description: "رسم بياني انتشاري مع حركات نقاط سلسة"
      },
      interactive: {
        title: "رسم بياني انتشاري تفاعلي",
        description: "رسم بياني انتشاري مع تفاعلات التكبير والتحريك"
      },
      regression: {
        title: "رسم بياني انتشاري انحدار",
        description: "رسم بياني انتشاري مع خط الاتجاه وتحليل الانحدار"
      },
      multiColor: {
        title: "رسم بياني انتشاري متعدد الألوان",
        description: "رسم بياني انتشاري مع فئات بيانات مرمزة بالألوان"
      },
      timeSeries: {
        title: "رسم بياني انتشاري سلسلة زمنية",
        description: "رسم بياني انتشاري يوضح تغييرات البيانات عبر الوقت"
      },
      correlation: {
        title: "رسم بياني انتشاري ارتباط",
        description: "رسم بياني انتشاري يوضح الارتباط بين المتغيرات"
      },
      density: {
        title: "رسم بياني انتشاري كثافة",
        description: "رسم بياني انتشاري مع تصور الكثافة"
      },
      polar: {
        title: "رسم بياني انتشاري قطبي",
        description: "رسم بياني انتشاري في نظام الإحداثيات القطبية"
      }
    },

    radar: {
      basic: {
        title: "رسم بياني راداري أساسي",
        description: "رسم بياني راداري بسيط للبيانات متعددة الأبعاد"
      },
      filled: {
        title: "رسم بياني راداري مملوء",
        description: "رسم بياني راداري مع مناطق مملوءة"
      },
      multiSeries: {
        title: "رسم بياني راداري متعدد السلاسل",
        description: "رسم بياني راداري يقارن مجموعات بيانات متعددة"
      },
      animated: {
        title: "رسم بياني راداري متحرك",
        description: "رسم بياني راداري مع حركات تحميل سلسة"
      },
      interactive: {
        title: "رسم بياني راداري تفاعلي",
        description: "رسم بياني راداري مع تأثيرات التمرير والاختيار"
      },
      polar: {
        title: "رسم بياني راداري قطبي",
        description: "رسم بياني راداري في نظام الإحداثيات القطبية"
      },
      spider: {
        title: "مخطط عنكبوت",
        description: "مخطط راداري على شكل شبكة عنكبوت"
      },
      star: {
        title: "مخطط نجمة",
        description: "مخطط راداري على شكل نجمة لمقاييس الأداء"
      },
      windRose: {
        title: "مخطط وردة الرياح",
        description: "مخطط راداري وردة الرياح للبيانات الاتجاهية"
      },
      kiviat: {
        title: "مخطط كيفيات",
        description: "مخطط كيفيات لتحليل أداء النظام"
      }
    },

    mixed: {
      basic: {
        title: "رسم بياني مختلط أساسي",
        description: "رسم بياني مختلط يجمع أنواع مخططات مختلفة"
      },
      lineBar: {
        title: "رسم بياني مختلط خط-عمود",
        description: "رسم بياني مختلط يجمع عناصر الخط والعمود"
      },
      areaBar: {
        title: "رسم بياني مختلط منطقة-عمود",
        description: "رسم بياني مختلط يجمع عناصر المنطقة والعمود"
      },
      scatterLine: {
        title: "رسم بياني مختلط مبعثر-خط",
        description: "رسم بياني مختلط يجمع عناصر المبعثر والخط"
      },
      multiAxis: {
        title: "رسم بياني مختلط متعدد المحاور",
        description: "رسم بياني مختلط مع محاور Y متعددة"
      },
      animated: {
        title: "رسم بياني مختلط متحرك",
        description: "رسم بياني مختلط مع حركات منسقة"
      },
      interactive: {
        title: "رسم بياني مختلط تفاعلي",
        description: "رسم بياني مختلط مع تفاعلات موحدة"
      },
      dashboard: {
        title: "رسم بياني مختلط لوحة تحكم",
        description: "رسم بياني مختلط معقد لتصور لوحة التحكم"
      },
      comparison: {
        title: "رسم بياني مختلط مقارنة",
        description: "رسم بياني مختلط لمقارنة مقاييس مختلفة"
      },
      trend: {
        title: "رسم بياني مختلط اتجاه",
        description: "رسم بياني مختلط يوضح الاتجاهات والأنماط"
      }
    },




    funnel: {
      basic: {
        title: "رسم بياني قمعي أساسي",
        description: "رسم بياني قمعي بسيط يوضح مراحل العملية"
      },
      conversion: {
        title: "قمع التحويل",
        description: "رسم بياني قمعي لتحليل معدلات التحويل"
      },
      sales: {
        title: "قمع المبيعات",
        description: "رسم بياني قمعي للمبيعات لتحليل خط الأنابيب"
      },
      interactive: {
        title: "قمع تفاعلي",
        description: "رسم بياني قمعي مع قدرات التنقيب"
      },
      animated: {
        title: "قمع متحرك",
        description: "رسم بياني قمعي مع حركات تحميل سلسة"
      }
    },

    gauge: {
      title: "رسوم المقاييس",
      description: "مؤشرات الأداء الرئيسية ومؤشرات الأداء مع عروض المقياس",
      basic: {
        title: "مقياس أساسي",
        description: "مقياس بسيط يوضح القيم الحالية مقابل الحد الأقصى"
      },
      multi: {
        title: "مقياس متعدد المستويات",
        description: "مقياس مع مستويات متعددة للتقييم التفصيلي"
      },
      kpi: {
        title: "مقياس مؤشر الأداء الرئيسي",
        description: "مقياس مؤشر الأداء الرئيسي لقياس الأداء التنظيمي"
      },
      progress: {
        title: "مقياس التقدم",
        description: "مقياس يوضح تقدم المهام والمشاريع"
      },
      quality: {
        title: "مقياس الجودة",
        description: "مقياس يوضح مستويات الجودة والرضا"
      },
      health: {
        title: "مقياس الصحة",
        description: "مقياس يوضح حالة النظام والصحة العامة"
      },
      score: {
        title: "مقياس النقاط",
        description: "مقياس يوضح النقاط والإنجازات"
      },
      capacity: {
        title: "مقياس السعة",
        description: "مقياس يوضح استخدام السعة والموارد"
      }
    },

    heatmap: {
      title: "خرائط الحرارة",
      description: "تصور الأنماط والبيانات الهرمية مع خرائط الحرارة",
      basic: {
        title: "خريطة حرارية أساسية",
        description: "خريطة حرارية بسيطة تعرض كثافة البيانات"
      },
      intensity: {
        title: "خريطة حرارية الكثافة",
        description: "خريطة حرارية تعرض كثافة البيانات مع ألوان متدرجة"
      },
      calendar: {
        title: "خريطة حرارية تقويمية",
        description: "خريطة حرارية تعرض أنماط النشاط عبر فترات زمنية"
      },
      correlation: {
        title: "خريطة حرارية الارتباط",
        description: "خريطة حرارية تعرض الارتباطات بين المتغيرات"
      },
      performance: {
        title: "خريطة حرارية الأداء",
        description: "خريطة حرارية تعرض أداء الفرق والأقسام"
      },
      timeSeries: {
        title: "خريطة حرارية سلسلة زمنية",
        description: "خريطة حرارية تعرض البيانات عبر الوقت"
      },
      geographic: {
        title: "خريطة حرارية جغرافية",
        description: "خريطة حرارية تعرض البيانات حسب المناطق الجغرافية"
      }
    },

    treemap: {
      title: "خرائط الشجرة",
      description: "تصور البيانات الهرمية مع المستطيلات المتداخلة",
      basic: {
        title: "خريطة شجرة أساسية",
        description: "خريطة شجرة بسيطة تعرض البيانات الهرمية"
      },
      hierarchical: {
        title: "خريطة شجرة هرمية",
        description: "خريطة شجرة متعددة المستويات للبيانات التنظيمية"
      },
      category: {
        title: "خريطة شجرة فئوية",
        description: "خريطة شجرة تعرض البيانات حسب الفئات"
      },
      performance: {
        title: "خريطة شجرة الأداء",
        description: "خريطة شجرة تعرض أداء الأقسام والفروع"
      },
      budget: {
        title: "خريطة شجرة الميزانية",
        description: "خريطة شجرة تعرض توزيع الميزانية"
      },
      geographic: {
        title: "خريطة شجرة جغرافية",
        description: "خريطة شجرة تعرض البيانات حسب المناطق"
      },
      project: {
        title: "خريطة شجرة المشاريع",
        description: "خريطة شجرة تعرض توزيع المشاريع والمهام"
      }
    },

    timeline: {
      title: "الرسوم الزمنية",
      description: "تتبع المشاريع وتصور عمليات التحويل مع الرسوم الزمنية",
      project: {
        title: "جدول زمني للمشروع",
        description: "جدول زمني يوضح مراحل المشروع والتقدم"
      },
      milestone: {
        title: "جدول زمني للمعالم",
        description: "جدول زمني يوضح المعالم والإنجازات الرئيسية"
      },
      event: {
        title: "جدول زمني للأحداث",
        description: "جدول زمني يوضح الأحداث والأنشطة المهمة"
      },
      gantt: {
        title: "مخطط جانت",
        description: "مخطط جانت يوضح المهام والجداول الزمنية"
      },
      resource: {
        title: "جدول زمني للموارد",
        description: "جدول زمني يوضح تخصيص الموارد والاستخدام"
      },
      delivery: {
        title: "جدول زمني للتسليم",
        description: "جدول زمني يوضح عمليات التسليم والشحن"
      },
      sprint: {
        title: "جدول زمني للسباقات",
        description: "جدول زمني يوضح سباقات التطوير والتقدم"
      },
      release: {
        title: "جدول زمني للإصدارات",
        description: "جدول زمني يوضح إصدارات المنتج والتحديثات"
      }
    },

    // Common chart terms
    common: {
      more:"المزيد",
      sales: "المبيعات",
      revenue: "الإيرادات",
      users: "المستخدمون",
      profit: "الربح",
      growth: "النمو",
      performance: "الأداء",
      value: "القيمة",
      month: "الشهر",
      category: "الفئة",
      deviceUsage: "استخدام الأجهزة",
      browserUsage: "استخدام المتصفحات",
      quarterlySales: "المبيعات الربعية",
      departmentBudget: "ميزانية القسم",
      trafficSources: "مصادر الزيارات",
      subscriptionPlans: "خطط الاشتراك",
      regionalSales: "المبيعات الإقليمية",
      productSales: "مبيعات المنتجات",
      desktop: "سطح المكتب",
      mobile: "الهاتف المحمول",
      tablet: "التابلت",
      other: "أخرى",
      chrome: "كروم",
      firefox: "فايرفوكس",
      safari: "سافاري",
      edge: "إيدج",
      q1: "الربع الأول",
      q2: "الربع الثاني",
      q3: "الربع الثالث",
      q4: "الربع الرابع",
      marketing: "التسويق",
      development: "التطوير",
      support: "الدعم",
      organic: "عضوي",
      paid: "مدفوع",
      social: "اجتماعي",
      email: "البريد الإلكتروني",
      direct: "مباشر",
      starter: "مبتدئ",
      professional: "محترف",
      enterprise: "مؤسسي",
      north: "شمال",
      south: "جنوب",
      east: "شرق",
      west: "غرب",
      productA: "المنتج أ",
      productB: "المنتج ب",
      productC: "المنتج ج",
      productD: "المنتج د",
      salesVsMarketing: "المبيعات مقابل التسويق",
      companySize: "حجم الشركة",
      priceVsDemand: "السعر مقابل الطلب",
      performanceVsCost: "الأداء مقابل التكلفة",
      timeVsValue: "الوقت مقابل القيمة",
      cluster1: "المجموعة 1",
      cluster2: "المجموعة 2",
      cluster3: "المجموعة 3",
      cluster4: "المجموعة 4",
      categoryA: "الفئة أ",
      categoryB: "الفئة ب",
      categoryC: "الفئة ج",
      categoryD: "الفئة د",
      categoryE: "الفئة ه",
      categoryF: "الفئة و",
      categoryG: "الفئة ز",
      categoryH: "الفئة ح",
      parent1: "الأصل 1",
      child1_1: "الفرع 1-1",
      child1_2: "الفرع 1-2",
      parent2: "الأصل 2",
      child2_1: "الفرع 2-1",
      parent3: "الأصل 3",
      child3_1: "الفرع 3-1",
      child3_2: "الفرع 3-2",
      electronics: "الإلكترونيات",
      clothing: "الملابس",
      homeGoods: "أدوات المنزل",
      books: "الكتب",
      sports: "الرياضة",
      beauty: "الجمال",
      automotive: "السيارات",
      jewelry: "المجوهرات",
      departmentSales: "قسم المبيعات",
      departmentMarketing: "قسم التسويق",
      departmentHR: "قسم الموارد البشرية",
      departmentIT: "قسم تكنولوجيا المعلومات",
      departmentFinance: "قسم المالية",
      departmentOperations: "قسم العمليات",
      departmentLegal: "القسم القانوني",
      "departmentR&D": "قسم البحث والتطوير",
      budgetMarketing: "ميزانية التسويق",
      budgetDevelopment: "ميزانية التطوير",
      budgetOperations: "ميزانية العمليات",
      "budgetR&D": "ميزانية البحث والتطوير",
      budgetHR: "ميزانية الموارد البشرية",
      budgetIT: "ميزانية تكنولوجيا المعلومات",
      budgetLegal: "الميزانية القانونية",
      budgetFinance: "الميزانية المالية",
      countryUSA: "الولايات المتحدة",
      countryCanada: "كندا",
      countryMexico: "المكسيك",
      countryUK: "المملكة المتحدة",
      countryGermany: "ألمانيا",
      countryFrance: "فرنسا",
      countryJapan: "اليابان",
      countryChina: "الصين",
      projectAlpha: "مشروع ألفا",
      projectBeta: "مشروع بيتا",
      projectGamma: "مشروع جاما",
      projectDelta: "مشروع دلتا",
      projectEpsilon: "مشروع إبسيلون",
      projectZeta: "مشروع زيتا",
      projectEta: "مشروع إيتا",
      projectTheta: "مشروع ثيتا",
      phase1: "المرحلة 1",
      phase1Description: "مرحلة التخطيط والتحضير",
      phase2: "المرحلة 2",
      phase2Description: "مرحلة التطوير والتنفيذ",
      phase3: "المرحلة 3",
      phase3Description: "مرحلة الاختبار والتحسين",
      phase4: "المرحلة 4",
      phase4Description: "مرحلة الإطلاق والصيانة",
      completed: "مكتمل",
      inProgress: "قيد التقدم",
      pending: "معلق",
      milestoneA: "المعلم أ",
      milestoneADescription: "إنجاز المعلم الأول",
      milestoneB: "المعلم ب",
      milestoneBDescription: "إنجاز المعلم الثاني",
      milestoneC: "المعلم ج",
      milestoneCDescription: "إنجاز المعلم الثالث",
      event1: "الحدث 1",
      event1Description: "حدث مهم في المشروع",
      event2: "الحدث 2",
      event2Description: "حدث مهم في المشروع",
      event3: "الحدث 3",
      event3Description: "حدث مهم في المشروع",
      event4: "الحدث 4",
      event4Description: "حدث مهم في المشروع",
      upcoming: "قادم",
      taskA: "المهمة أ",
      taskADescription: "وصف المهمة الأولى",
      taskB: "المهمة ب",
      taskBDescription: "وصف المهمة الثانية",
      taskC: "المهمة ج",
      taskCDescription: "وصف المهمة الثالثة",
      taskD: "المهمة د",
      taskDDescription: "وصف المهمة الرابعة",
      allocated: "مخصص",
      available: "متاح",
      resource1: "المورد 1",
      resource1Description: "وصف المورد الأول",
      resource2: "المورد 2",
      resource2Description: "وصف المورد الثاني",
      resource3: "المورد 3",
      resource3Description: "وصف المورد الثالث",
      order1: "الطلب 1",
      order1Description: "وصف الطلب الأول",
      order2: "الطلب 2",
      order2Description: "وصف الطلب الثاني",
      order3: "الطلب 3",
      order3Description: "وصف الطلب الثالث",
      delivered: "تم التسليم",
      inTransit: "في الطريق",
      sprint1: "السباق 1",
      sprint1Description: "وصف السباق الأول",
      sprint2: "السباق 2",
      sprint2Description: "وصف السباق الثاني",
      sprint3: "السباق 3",
      sprint3Description: "وصف السباق الثالث",
      release1: "الإصدار 1",
      release1Description: "وصف الإصدار الأول",
      release2: "الإصدار 2",
      release2Description: "وصف الإصدار الثاني",
      released: "تم الإصدار",
      inDevelopment: "قيد التطوير"
    },

    // Sample data labels
    sampleData: "بيانات نموذجية",
    monthlyRevenue: "الإيرادات الشهرية",
    userGrowth: "نمو المستخدمين",
    salesData: "بيانات المبيعات",
    performanceMetrics: "مقاييس الأداء",
    marketShare: "حصة السوق",
    conversionRates: "معدلات التحويل",
    trafficSources: "مصادر الزيارات",

    // Chart descriptions (removed duplicates)
    // lineDesc, areaDesc, etc. already defined above
    users: "المستخدمون",
    revenue: "الإيرادات",

    radarSubjects: {
      performance: "الأداء",
      quality: "الجودة",
      efficiency: "الكفاءة",
      reliability: "الموثوقية",
      innovation: "الابتكار",
      support: "الدعم",
      security: "الأمان",
      scalability: "قابلية التوسع",
    },

    

    conversionFunnel: {
      websiteVisitors: {
        stage: "زوار الموقع",
        desc: "إجمالي الزوار الفريدين للموقع",
      },
      productViews: {
        stage: "مشاهدات المنتج",
        desc: "المستخدمون الذين شاهدوا منتجًا واحدًا على الأقل",
      },
      addToCart: {
        stage: "إضافة إلى السلة",
        desc: "المستخدمون الذين أضافوا عناصر إلى سلتهم",
      },
      checkoutStarted: {
        stage: "بدء الدفع",
        desc: "المستخدمون الذين بدأوا عملية الدفع",
      },
      paymentInfo: {
        stage: "معلومات الدفع",
        desc: "المستخدمون الذين أدخلوا معلومات الدفع",
      },
      purchaseCompleted: {
        stage: "إكمال الشراء",
        desc: "المشتريات المكتملة بنجاح",
      },
    },

    salesFunnel: {
      leadGeneration: {
        stage: "توليد العملاء المحتملين",
        desc: "العملاء المحتملون المؤهلون من التسويق",
      },
      initialContact: {
        stage: "الاتصال الأولي",
        desc: "العملاء المحتملون الذين تم الاتصال بهم من قبل فريق المبيعات",
      },
      needsAssessment: {
        stage: "تقييم الاحتياجات",
        desc: "العملاء المحتملون المؤهلون مع احتياجات محددة",
      },
      proposalSent: {
        stage: "إرسال العرض",
        desc: "العروض الرسمية المرسلة",
      },
      negotiation: {
        stage: "التفاوض",
        desc: "المفاوضات النشطة الجارية",
      },
      closedWon: {
        stage: "صفقات ناجحة",
        desc: "الصفقات التي تمت بنجاح",
      },
    },

   
  },

  // Months
  months: {
    jan: "يناير",
    feb: "فبراير",
    mar: "مارس",
    apr: "أبريل",
    may: "مايو",
    jun: "يونيو",
    jul: "يوليو",
    aug: "أغسطس",
    sep: "سبتمبر",
    oct: "أكتوبر",
    nov: "نوفمبر",
    dec: "ديسمبر",
  },

  daysShort: {
    sun: "ح",
    mon: "ن",
    tue: "ث",
    wed: "ر",
    thu: "خ",
    fri: "ج",
    sat: "س",
  },

  daysFull: {
    mon: "الاثنين",
    tue: "الثلاثاء",
    wed: "الأربعاء",
    thu: "الخميس",
    fri: "الجمعة",
    sat: "السبت",
    sun: "الأحد",
  },

  campaigns: {
    campaignA: "الحملة أ",
    campaignB: "الحملة ب",
    campaignC: "الحملة ج",
    campaignD: "الحملة د",
    campaignE: "الحملة هـ",
    campaignF: "الحملة و",
  },

  // Profile
  profile: {
    title: "الملف الشخصي",
    subtitle: "إدارة معلوماتك الشخصية وكلمة المرور",
    personalInformation: "المعلومات الشخصية",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phoneNumber: "رقم الهاتف",
    updateProfile: "تحديث الملف الشخصي",
    updateSuccess: "تم تحديث الملف الشخصي بنجاح!",

    // Header section
    online: "متصل",
    changePhoto: "تغيير الصورة",
    accountOverview: "نظرة عامة على الحساب",
    profileComplete: "اكتمال الملف الشخصي",
    accountStatus: "حالة الحساب",
    accessLevel: "مستوى الوصول",
    securityStatus: "حالة الأمان",
    active: "نشط",
    admin: "مدير",
    secure: "آمن",

    // Info cards
    username: "اسم المستخدم",
    phone: "الهاتف",
    role: "الدور",
    status: "الحالة",

    // Form descriptions
    personalInfoDescription: "تحديث تفاصيلك الشخصية ومعلومات الاتصال",
    passwordDescription: "تحديث كلمة المرور للحفاظ على أمان حسابك",

    // Password section
    password: {
      title: "تغيير كلمة المرور",
      current: "كلمة المرور الحالية",
      new: "كلمة المرور الجديدة",
      confirm: "تأكيد كلمة المرور الجديدة",
      requirements: "متطلبات كلمة المرور",
      requirementLength: "6 أحرف على الأقل",
      requirementCase: "مزيج من الأحرف الكبيرة والصغيرة",
      requirementNumbers: "تتضمن أرقام ورموز خاصة",
      success: "تم تحديث كلمة المرور بنجاح!",
      update: "تحديث كلمة المرور",
      updating: "جاري تحديث كلمة المرور...",
      description: "تحديث كلمة المرور للحفاظ على أمان حسابك",
    },

    // Sidebar sections
    accountSecurity: "أمان الحساب",
    twoFactorAuth: "المصادقة الثنائية",
    enabled: "مفعل",
    lastLogin: "آخر تسجيل دخول",
    loginLocation: "موقع تسجيل الدخول",
    quickActions: "الإجراءات السريعة",
    exportProfileData: "تصدير بيانات الملف الشخصي",
    privacySettings: "إعدادات الخصوصية",
    activityLog: "سجل النشاط",
    systemInfo: "معلومات النظام",
    accountType: "نوع الحساب",
    memberSince: "عضو منذ",
    profileVersion: "إصدار الملف الشخصي",

    // Time formats
    hoursAgo: "منذ {hours} ساعة",
    minutesAgo: "منذ {minutes} دقيقة",
    daysAgo: "منذ {days} يوم",

    errors: {
      fetch: "فشل في تحميل الملف الشخصي",
      update: "فشل في تحديث الملف الشخصي",
      passwordMismatch: "كلمات المرور الجديدة غير متطابقة",
      passwordLength: "يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل",
      currentPassword: "كلمة المرور الحالية غير صحيحة",
      updatePassword: "فشل في تحديث كلمة المرور",
      unexpected: "حدث خطأ غير متوقع",
    },
  },

  // Settings
  settings: {
    devices: {
      desktop: "Desktop",
      mobile: "Mobile",
      tablet: "Tablet",
      smarttv: "Smart TV",
      other: "Other",
    },
    appearance: "المظهر",
    layout: "التخطيط",
    localization: "اللغة",
    advanced: "متقدم",
    colorTheme: {
      title: "سمة الألوان",
      description: "اختر سمة الألوان المفضلة لديك",
    },
    switchStyle: {
      title: "أنماط المفاتيح",
      description: "اختر تصميم مكون المفتاح المفضل لديك",
      options: {
        default: {
          title: "افتراضي",
          description: "مفتاح كلاسيكي مع تصميم محسن",
        },
        modern: {
          title: "عصري",
          description: "تصميم متدرج أنيق مع تأثيرات زجاجية",
        },
        ios: {
          title: "نمط iOS",
          description: "تصميم مستوحى من Apple iOS",
        },
        android: {
          title: "نمط Android",
          description: "مفتاح Material Design",
        },
        toggle: {
          title: "زر التبديل",
          description: "تبديل مستطيل مع تأثيرات متميزة",
        },
        slider: {
          title: "نمط المنزلق",
          description: "تصميم منزلق متدرج متميز",
        },
        neon: {
          title: "توهج نيون",
          description: "توهج نيون مستقبلي مع حركة نابضة",
        },
        neumorphism: {
          title: "نيومورفيزم",
          description: "واجهة مستخدم ناعمة مع ظلال عمق واقعية",
        },
        liquid: {
          title: "حركة سائلة",
          description: "حركات وتدرجات سلسة تشبه السائل",
        },
        cyberpunk: {
          title: "سايبربانك",
          description: "تصميم تقني مستقبلي مع لمسات نيون",
        },
        glassmorphism: {
          title: "جلاسمورفيزم",
          description: "تأثير زجاج شفاف مع ضبابية الخلفية",
        },
        aurora: {
          title: "الشفق القطبي",
          description: "شفق قطبي سحري مع ألوان متحركة",
        },
        matrix: {
          title: "ماتريكس",
          description: "موضوع ماتريكس رقمي مع تأثيرات توهج خضراء",
        },
        cosmic: {
          title: "كوني",
          description: "موضوع الفضاء العميق مع حركات نجمية",
        },
        retro: {
          title: "ريترو",
          description: "نمط الثمانينات الريترو مع تدرجات برتقالية دافئة",
        },
      },
      labels: {
        off: "إيقاف",
        on: "تشغيل",
      },
    },
    tableStyle: {
      title: "أنماط الجداول",
      description: "اختر تصميم جداول البيانات المفضل لديك",
      options: {
        default: {
          title: "افتراضي",
          description: "تصميم جدول نظيف ومهني",
        },
        striped: {
          title: "مخطط",
          description: "ألوان صفوف متناوبة لقراءة أفضل",
        },
        bordered: {
          title: "محاط بحدود",
          description: "حدود محسنة لفصل البيانات بوضوح",
        },
        minimal: {
          title: "بسيط",
          description: "تصميم نظيف وبسيط مع تصميم أدنى",
        },
        glass: {
          title: "مورفولوجيا زجاجية",
          description: "تأثير زجاجي مذهل مع ضبابية الخلفية",
        },
        neon: {
          title: "توهج نيون",
          description: "تصميم نيون مستقبلي مع تأثيرات متوهجة",
        },
        gradient: {
          title: "تدفق متدرج",
          description: "تراكبات متدرجة جميلة وانتقالات سلسة",
        },
        neumorphism: {
          title: "نيومورفيزم",
          description: "تصميم واجهة مستخدم ناعمة مع عمق وظلال واقعية",
        },
        cyberpunk: {
          title: "سايبربانك",
          description: "تصميم مستوحى من التكنولوجيا مع حواف حادة ونيون",
        },
        luxury: {
          title: "ذهبي فاخر",
          description: "تصميم ذهبي متميز مع تصميم أنيق",
        },
        matrix: {
          title: "كود ماتريكس",
          description: "تصميم أخضر مستقبلي بنمط الماتريكس مع تأثيرات رقمية",
        },
        diamond: {
          title: "منشور الماس",
          description: "تصميم منشوري متعدد الألوان مع تدرجات قوس قزح",
        },
      },
    },
    toast: {
      title: "إشعارات التوست",
      description: "خصص مظهر وسلوك إشعارات التوست",
      designLabel: "تصميم التوست",

      showIconsLabel: "عرض الأيقونات في التوست",
      showIconsDesc: "إظهار الأيقونات في إشعارات التوست",
      durationLabel: "مدة التوست",
      durationOptions: {
        quick: { name: "1ث", description: "سريعة" },
        normal: { name: "3ث", description: "عادية" },
        long: { name: "5ث", description: "طويلة" },
        extended: { name: "10ث", description: "ممتدة" },
      },
      testLabel: "اختبار التوست",
      testButtons: {
        success: "نجاح",
        error: "خطأ",
        warning: "تحذير",
        info: "معلومة",
      },
      messages: {
        success: { title: "نجاح!", description: "تمت العملية بنجاح." },
        error: { title: "خطأ!", description: "حدث خطأ ما." },
        warning: { title: "تحذير!", description: "يرجى التحقق من الإدخال." },
        info: { title: "معلومة", description: "إليك بعض المعلومات." },
      },
      testHint: "انقر الأزرار لاختبار أنماط التوست مع إعداداتك الحالية",

      designOptions: {
        classic: { name: "كلاسيكي", description: "تصميم تقليدي بحواف خفيفة" },
        minimal: { name: "بسيط", description: "تصميم نظيف وبسيط" },
        modern: { name: "حديث", description: "معاصر مع تأثيرات ضبابية" },
        gradient: { name: "متدرج", description: "خلفيات متدرجة ملونة" },
        outlined: { name: "محاط", description: "تصميم شفاف يركز على الحدود" },
        neon: { name: "نيون", description: "نمط سايبربانك متوهج" },
        glassmorphism: {
          name: "زجاجي",
          description: "تأثير زجاجي شفاف مع ضبابية",
        },
        neumorphism: {
          name: "نيومورفيزم",
          description: "تأثير ثلاثي الأبعاد ناعم",
        },
        aurora: { name: "شفق", description: "تدرجات متحركة سحرية" },
        cosmic: { name: "كوني", description: "سمة فضائية مع تدرجات نجمية" },
        quick: { name: "سريع", description: "يظهر لمدة ثانية واحدة" },
        normal: { name: "عادي", description: "يظهر لمدة 3 ثوان" },
        long: { name: "طويل", description: "يظهر لمدة 5 ثوان" },
        extended: { name: "ممتد", description: "يظهر لمدة 10 ثوان" },
      },
      preview: {
        successTitle: "نجاح",
        successDesc: "تم إكمال المهمة",
        errorTitle: "خطأ",
        errorDesc: "حدث خطأ ما",
      },
      testMessages: {
        success: {
          title: "توست النجاح",
          desc: "هذا توست نجاح مع التصميم المختار",
        },
        error: { title: "توست الخطأ", desc: "هذا توست خطأ مع التصميم المختار" },
        warning: {
          title: "توست التحذير",
          desc: "هذا توست تحذير مع التصميم المختار",
        },
        info: {
          title: "توست المعلومات",
          desc: "هذا توست معلومات مع التصميم المختار",
        },
      },
    },
    darkMode: "الوضع المظلم",
    lightDarkToggle: "تبديل بين الوضع الفاتح والمظلم",
    selectColorTheme: "اختر سمة الألوان",
    logoType: "نوع الشعار",
    fontSize: "حجم الخط",
    layoutTemplates: "قوالب التخطيط",
    sidebarPosition: "موضع الشريط الجانبي",
    languageSettings: "إعدادات اللغة",
    selectLanguage: "اختر لغة الواجهة",
    currentLanguage: "اللغة الحالية",
    textDirection: "اتجاه النص",
    fontUsed: "الخط المستخدم",
    sidebarPos: "موضع الشريط الجانبي",
    animationLevel: {
      title: "مستوى التأثيرات الحركية",
      description: "اختر مستوى التأثيرات الحركية المفضل لديك",
    },
    resetSettings: "إعادة ضبط الإعدادات",
    resetDescription:
      "إعادة جميع إعدادات الواجهة إلى الوضع الافتراضي. هذا سيؤدي إلى إعادة ضبط جميع التخصيصات التي قمت بها.",
    resetAll: "إعادة ضبط جميع الإعدادات",
    saveSettings: "حفظ الإعدادات",
    settingsSaved: "تم الحفظ!",
    pageTitle: "الإعدادات",
    pageSubtitle: "خصص تجربة التطبيق",
    saveSuccess: "تم حفظ الإعدادات",
    saveSuccessDesc: "تم تخزين تفضيلاتك",
    saveFailed: "فشل الحفظ",
    saveFailedDesc: "تعذر حفظ الإعدادات",
    exportSuccess: "تم تصدير الإعدادات",
    exportSuccessDesc: "تم تصدير إعداداتك بنجاح.",
    importSuccess: "تم استيراد الإعدادات",
    importSuccessDesc: "تم استيراد إعداداتك بنجاح.",
    importFailed: "فشل الاستيراد",
    importFailedDesc: "فشل استيراد الإعدادات. يرجى التحقق من تنسيق الملف.",
    resetSuccess: "تمت إعادة الضبط",
    resetSuccessDesc: "تمت إعادة جميع الإعدادات إلى القيم الافتراضية.",
    invalidFormat: "تنسيق غير صالح",
    exportFileName: "إعدادات-التطبيق.json",
    // Common chart terms
    common: {
      sales: "المبيعات",
      revenue: "الإيرادات",
      users: "المستخدمون",
      profit: "الربح",
      growth: "النمو",
      performance: "الأداء",
      value: "القيمة",
      month: "الشهر",
      category: "الفئة",
      deviceUsage: "استخدام الأجهزة",
      browserUsage: "استخدام المتصفحات",
      quarterlySales: "المبيعات الربعية",
      departmentBudget: "ميزانية القسم",
      trafficSources: "مصادر الزيارات",
      subscriptionPlans: "خطط الاشتراك",
      regionalSales: "المبيعات الإقليمية",
      productSales: "مبيعات المنتجات",
      desktop: "سطح المكتب",
      mobile: "الهاتف المحمول",
      tablet: "التابلت",
      other: "أخرى",
      chrome: "كروم",
      firefox: "فايرفوكس",
      safari: "سافاري",
      edge: "إيدج",
      q1: "الربع الأول",
      q2: "الربع الثاني",
      q3: "الربع الثالث",
      q4: "الربع الرابع",
      marketing: "التسويق",
      development: "التطوير",
      support: "الدعم",
      organic: "عضوي",
      paid: "مدفوع",
      social: "اجتماعي",
      email: "البريد الإلكتروني",
      direct: "مباشر",
      starter: "مبتدئ",
      professional: "محترف",
      enterprise: "مؤسسي",
      north: "شمال",
      south: "جنوب",
      east: "شرق",
      west: "غرب",
      productA: "المنتج أ",
      productB: "المنتج ب",
      productC: "المنتج ج",
      productD: "المنتج د",
      salesVsMarketing: "المبيعات مقابل التسويق",
      companySize: "حجم الشركة",
      priceVsDemand: "السعر مقابل الطلب",
      performanceVsCost: "الأداء مقابل التكلفة",
      timeVsValue: "الوقت مقابل القيمة",
      cluster1: "المجموعة 1",
      cluster2: "المجموعة 2",
      cluster3: "المجموعة 3",
      normalData: "البيانات العادية",
      outliers: "القيم الشاذة",
      speed: "السرعة",
      reliability: "الموثوقية",
      comfort: "الراحة",
      safety: "الأمان",
      efficiency: "الكفاءة",
      price: "السعر",
      usability: "سهولة الاستخدام",
      design: "التصميم",
      features: "الميزات",
      frontend: "الواجهة الأمامية",
      backend: "الواجهة الخلفية",
      database: "قاعدة البيانات",
      devops: "تطوير العمليات",
      testing: "الاختبار",
      softSkills: "المهارات الناعمة",
      developerA: "المطور أ",
      marketShare: "حصة السوق",
      profitability: "الربحية",
      innovation: "الابتكار",
      customerSatisfaction: "رضا العملاء",
      brandStrength: "قوة العلامة التجارية",
      companyA: "الشركة أ",
      companyB: "الشركة ب",
      communication: "التواصل",
      collaboration: "التعاون",
      leadership: "القيادة",
      problemSolving: "حل المشاكل",
      creativity: "الإبداع",
      timeManagement: "إدارة الوقت",
      teamMember1: "عضو الفريق 1",
      teamMember2: "عضو الفريق 2",
      teamMember3: "عضو الفريق 3",
      quality: "الجودة",
      cost: "التكلفة",
      scope: "النطاق",
      risk: "المخاطر",
      resources: "الموارد",
      projectA: "المشروع أ",
      productQuality: "جودة المنتج",
      customerService: "خدمة العملاء",
      pricing: "التسعير",
      delivery: "التوصيل",
      satisfactionScore: "درجة الرضا",
      ourProduct: "منتجنا",
      competitor1: "المنافس 1",
      competitor2: "المنافس 2",
      liveData: "البيانات المباشرة",
      stockPrice: "سعر السهم",
      websiteTraffic: "زوار الموقع",
      seriesA: "السلسلة أ",
      seriesB: "السلسلة ب",
      seriesC: "السلسلة ج",
      temperature: "درجة الحرارة",
      minRange: "النطاق الأدنى",
      maxRange: "النطاق الأعلى",
      layer1: "الطبقة 1",
      layer2: "الطبقة 2",
      splineCurve: "منحنى سبلين",
      engagement: "التفاعل",
      filledArea: "المنطقة المملوءة",
      windDirection: "اتجاه الرياح",
      unitsSold: "الوحدات المباعة",
      group1: "المجموعة 1",
      group2: "المجموعة 2",
      duration: "المدة",
      score: "النتيجة",
      quantity: "الكمية",
      animated: "متحرك",
      interactive: "تفاعلي",
      gradient: "متدرج",
      smooth: "ناعم",
      range: "نطاق",
      layered: "متعدد الطبقات",
      spline: "سبلين",
      realtime: "في الوقت الفعلي",
      filled: "مملوء",
      polar: "قطبي",
      horizontal: "أفقي",
      stacked: "مكدس",
      grouped: "مجمع",
      waterfall: "شلال",
      floating: "عائم",
      multiAxis: "متعدد المحاور",
      basic: "أساسي",
      multiSeries: "متعدد السلاسل",
      curved: "منحني",
      stepped: "متدرج",
      doughnut: "مجوف",
      multiLevel: "متعدد المستويات",
      exploded: "منفجر",
      custom: "مخصص",
      bubble: "فقاعي",
      correlation: "ارتباط",
      timeSeries: "سلسلة زمنية",
      cluster: "مجموعة",
      outlier: "قيمة شاذة",
      skillAssessment: "تقييم المهارات",
      marketAnalysis: "تحليل السوق",
      teamPerformance: "أداء الفريق",
      projectMetrics: "مقاييس المشروع",
      competitiveAnalysis: "التحليل التنافسي",
    },
    tabs: {
      appearance: "المظهر",
      layout: "التخطيط",
      components: "المكونات",
      charts: "رسومات بيانية",
      typography: "الخطوط",
      behavior: "السلوك",
      checkboxRadio: "كشوفات & راديو",
    },
    lightBackground: {
      title: "سمة الخلفية الفاتحة",
      description: "اختر نمط الخلفية لوضع الإضاءة",
    },
    darkBackground: {
      title: "سمة الخلفية الداكنة",
      description: "اختر نمط الخلفية لوضع الظلام",
    },
    shadowIntensity: {
      title: "حدة الظلال",
      description: "اضبط عمق وحدة الظلال",
    },
    colors: {
      purple: "أرجواني",
      blue: "أزرق",
      green: "أخضر",
      orange: "برتقالي",
      red: "أحمر",
      teal: "تركوازي",
      pink: "وردي",
      indigo: "نيلي",
      cyan: "سماوي",
    },
    lightBg: {
      default: "افتراضي",
      warm: "دافئ",
      cool: "بارد",
      neutral: "محايد",
      soft: "ناعم",
      cream: "كريمي",
      mint: "نعناعي",
      lavender: "لافندر",
      rose: "وردي",
    },
    darkBg: {
      default: "افتراضي",
      darker: "أغمق",
      pitch: "قاتم",
      slate: "سليت",
      warmDark: "داكن دافئ",
      forest: "غابة",
      ocean: "محيط",
      purpleDark: "أرجواني داكن",
      crimson: "قرمزي",
    },
    shadow: {
      none: "بدون",
      subtle: "خفيف",
      moderate: "متوسط",
      strong: "قوي",
    },
    animation: {
      none: "بدون",
      noneDesc: "بدون حركات",
      minimal: "بسيط",
      minimalDesc: "انتقالات أساسية",
      moderate: "متوسط",
      moderateDesc: "حركات سلسة",
      high: "عالٍ",
      highDesc: "حركات غنية",
    },
    sampleTable: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      status: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      pending: "قيد الانتظار",
      role: "الدور",
      roles: {
        admin: "مسؤول",
        user: "مستخدم",
        editor: "محرر",
      },
      data: {
        john: "جون دو",
        jane: "جين سميث",
        bob: "بوب جونسون",
      },
      emails: {
        john: "john@example.com",
        jane: "jane@example.com",
        bob: "bob@example.com",
      },
    },

    layoutTemplate: {
      title: "قالب التخطيط",
      description: "اختر نمط التخطيط المفضل",
      options: {
        modern: { name: "حديث", description: "نظيف ومعاصر" },
        classic: { name: "كلاسيكي", description: "تخطيط تقليدي" },
        compact: { name: "مدمج", description: "فعال في المساحة" },
        elegant: { name: "أنيق", description: "تصميم راقٍ" },
        minimal: { name: "بسيط", description: "نظيف وبسيط" },
        floating: { name: "عائم", description: "بطاقات وتراكبات" },
        navigation: {
          name: "ملاحة",
          description: "نظام شريطين جانبيين",
        },
      },
    },
    headerStyle: {
      title: "نمط الرأس",
      description: "اختر كيفية ظهور الرأس",
      options: {
        default: { name: "افتراضي", description: "رأس قياسي" },
        compact: { name: "مدمج", description: "ارتفاع أصغر" },
        elevated: { name: "بارز", description: "مع ظل" },
        transparent: {
          name: "شفاف",
          description: "خلفية شفافة",
        },
      },
    },
    sidebarStyle: {
      title: "نمط الشريط الجانبي",
      description: "اختر كيفية ظهور الشريط الجانبي",
      options: {
        default: { name: "افتراضي", description: "شريط جانبي قياسي" },
        compact: { name: "مدمج", description: "عرض أضيق" },
        floating: { name: "عائم", description: "عائم بهامش" },
        minimal: { name: "بسيط", description: "تصميم نظيف" },
      },
    },
    cardStyle: {
      title: "نمط البطاقات",
      description: "اختر كيفية ظهور البطاقات في التطبيق",
    },
    cardStyleOptions: {
      serverSearchSdk: "SDK",
    },
    treeSelect: {
      title: "اختيار الشجرة",
      placeholder: "اختر...",
      searchPlaceholder: "ابحث هنا...",
      description: "اختيار شجري هرمي مع وظيفة التوسيع/الطي.",
    },
    buttonStyle: {
      title: "نمط الأزرار",
      description: "خصص مظهر الأزرار",
      options: {
        default: { name: "افتراضي", description: "حافة 6px" },
        smallRound: { name: "مدور صغير", description: "حافة 4px" },
        mediumRound: { name: "مدور متوسط", description: "حافة 8px" },
        largeRound: { name: "مدور كبير", description: "حافة 12px" },
        extraRound: { name: "مدور إضافي", description: "حافة 16px" },
        superRound: { name: "مدور جداً", description: "حافة 24px" },
        rounded: { name: "مدور بالكامل", description: "مدور بالكامل" },
        sharp: { name: "حاد", description: "بدون حافة" },
      },
    },
    treeStyle: {
      title: "نمط الشجرة",
      description: "اختر كيفية عرض الأشجار الهرمية في التطبيق",
      options: {
        lines: {
          name: "خطوط",
          description: "موصلات هرمية كلاسيكية",
        },
        cards: {
          name: "بطاقات",
          description: "بطاقات مكدسة مع ارتفاع",
        },
        minimal: {
          name: "بسيط",
          description: "موصلات منقطة خفية",
        },
        bubble: {
          name: "فقاعات",
          description: "مجموعات تشبه الرقائق مع التفاف",
        },
        modern: {
          name: "عصري",
          description: "تصميم متدرج أنيق مع رسوم متحركة سلسة",
        },
        glass: {
          name: "زجاجي",
          description: "ألواح زجاجية شفافة مع ضبابية الخلفية",
        },
        elegant: {
          name: "أنيق",
          description: "تصميم هرمي متطور بحدود يسارية",
        },
        professional: {
          name: "مهني",
          description: "نمط أعمال نظيف مع رسوم متحركة خفية",
        },
        gradient: {
          name: "متدرج",
          description: "تدرجات ملونة متدفقة مع تأثيرات ديناميكية",
        },
        neon: {
          name: "نيون",
          description: "نمط سايبر متوهج مع لمسات نيون",
        },
        organic: {
          name: "طبيعي",
          description: "تصميم متدفق طبيعي مع منحنيات ناعمة",
        },
        corporate: {
          name: "مؤسسي",
          description: "هرمية أعمال رسمية مع لمسات زرقاء",
        },
      },
      sample: { parent: "أصل", child1: "فرع 1", child2: "فرع 2" },
    },
    navigationStyle: {
      title: "نمط الملاحة",
      description: "اختر كيفية ظهور عناصر الملاحة",
      options: {
        default: { name: "افتراضي", description: "ملاحة قياسية" },
        pills: { name: "أزرار", description: "عناصر بشكل حبوب" },
        underline: {
          name: "تحته خط",
          description: "عناصر فعالة تحتها خط",
        },
        sidebar: {
          name: "شريط جانبي",
          description: "ملاحة بأسلوب الشريط الجانبي",
        },
      },
    },
    iconStyle: {
      title: "نمط الأيقونات",
      description: "اختر كيفية ظهور الأيقونات في التطبيق",
      options: {
        outline: { name: "مخطط", description: "أيقونات بخطوط" },
        filled: { name: "ممتلئ", description: "أيقونات ممتلئة" },
        duotone: { name: "ثنائي اللون", description: "أيقونات بلونين" },
        minimal: { name: "بسيط", description: "أيقونات بسيطة" },
      },
    },
    inputStyle: {
      title: "نمط الحقول",
      description: "اختر كيفية ظهور حقول الإدخال",
      options: {
        default: "افتراضي",
        rounded: "مدور",
        underlined: "تحته خط",
        filled: "ممتلئ",
      },
    },
    badgeStyle: {
      title: "نمط الشارات",
      description: "اختر كيفية ظهور الشارات في التطبيق",
      options: {
        default: { name: "افتراضي", description: "نمط الشارات الافتراضي" },
        modern: { name: "عصري", description: "نمط عصري" },
        glass: { name: "زجاجي", description: "أثر زجاجي مع تفاف" },
        neon: { name: "نيون", description: "نمط نيون" },
        gradient: { name: "متدرج", description: "أثر متدرج" },
        outlined: { name: "مخطط", description: "أثر مخطط" },
        filled: { name: "ممتلئ", description: "أثر ممتلئ" },
        minimal: { name: "بسيط", description: "أثر بسيط" },
        pill: { name: "بيضاوي", description: "أثر بيضاوي" },
        square: { name: "مربع", description: "أثر مربع" },
      },
    },
    avatarStyle: {
      title: "نمط الصور الرمزية",
      description: "اختر كيفية ظهور الصور الرمزية",
      options: {
        default: "افتراضي",
        rounded: "مدور",
        square: "مربع",
        hexagon: "سداسي",
      },
    },
    fontSizeSection: {
      title: "حجم الخط",
      description: "اضبط حجم الخط الأساسي لقراءة أفضل",
      sampleTexts: {
        small: "نص تجريبي بحجم صغير",
        default: "نص تجريبي بالحجم الافتراضي",
        large: "نص تجريبي بحجم كبير",
      },
    },
    borderRadius: {
      title: "استدارة الحواف",
      description: "اختر كيفية ظهور الحواف المستديرة",
    },
    spacing: {
      title: "التباعد",
      description: "تحكم في التباعد بين العناصر",
      options: {
        compact: "متقارب",
        default: "افتراضي",
        comfortable: "مريح",
        spacious: "متباعد",
      },
    },
    formStyle: {
      title: "نمط النماذج",
      description: "اختر كيفية ترتيب النماذج",
      options: {
        default: { name: "افتراضي", description: "تخطيط قياسي" },
        compact: { name: "مدمج", description: "تباعد أقل" },
        spacious: { name: "متباعد", description: "مساحة أكبر" },
        inline: { name: "أفقي", description: "تخطيط أفقي" },
        modern: { name: "عصري", description: "تصميم معاصر مع تدرجات" },
        glass: { name: "زجاجي", description: "تأثير زجاجي مع ضبابية" },
        minimal: { name: "بسيط", description: "تصميم نظيف مع حدود قليلة" },
        card: { name: "بطاقة", description: "حقول مجمعة في حاويات مرتفعة" },
        neon: { name: "نيون", description: "نمط سايبربانك مستقبلي متوهج" },
        elegant: { name: "أنيق", description: "تصميم فاخر متطور" },
        organic: { name: "عضوي", description: "منحنيات وأشكال طبيعية متدفقة" },
        retro: { name: "كلاسيكي", description: "تصميم عتيق مستوحى من الماضي" },
      },
    },
    loadingStyle: {
      title: "نمط التحميل",
      description: "اختر كيفية ظهور مؤشرات التحميل",
      options: {
        spinner: { name: "دوران", description: "مؤشر دوار" },
        dots: { name: "نقاط", description: "نقاط متحركة" },
        bars: { name: "أشرطة", description: "أشرطة تحميل" },
        pulse: { name: "نبض", description: "تأثير نابض" },
        wave: { name: "موجة", description: "حركة موجية متدرجة" },
        orbit: { name: "مدار", description: "نقطة تدور في مدار" },
        ripple: { name: "تموج", description: "تأثير تموج دائري" },
        gradient: { name: "تدرج", description: "تأثير تدرج دوار" },
        matrix: { name: "ماتريكس", description: "أعمدة رقمية بنمط الماتريكس" },
        helix: { name: "حلزوني", description: "حركة حلزونية ثلاثية الأبعاد" },
        quantum: { name: "كمي", description: "تأثير المجال الكمي" },
        morphing: { name: "متحول", description: "حركة تغيير الشكل" },
      },
    },
    tooltipStyle: {
      title: "نمط التلميحات",
      description: "اختر كيفية ظهور التلميحات",
      options: {
        default: { name: "افتراضي", description: "تلميح قياسي" },
        rounded: { name: "مدور", description: "زوايا مستديرة" },
        sharp: { name: "حاد", description: "زوايا حادة" },
        bubble: { name: "فقاعي", description: "شكل فقاعة" },
        glass: { name: "زجاجي", description: "تأثير زجاجي مع ضبابية" },
        neon: { name: "نيون", description: "نمط نيون متوهج" },
        minimal: { name: "بسيط", description: "تصميم بسيط ونظيف" },
        elegant: { name: "أنيق", description: "نمط متطور مع تدرج" },
      },
    },
    modalStyle: {
      title: "نمط النوافذ",
      description: "اختر كيفية ظهور النوافذ المنبثقة",
      options: {
        default: {
          name: "افتراضي",
          description: "نافذة منبثقة قياسية في الوسط",
        },
        centered: {
          name: "في الوسط",
          description: "نافذة منبثقة في الوسط دائماً",
        },
        fullscreen: { name: "ملء الشاشة", description: "تغطي الشاشة بالكامل" },
        drawer: { name: "درج", description: "نافذة منبثقة جانبية منزلقة" },
        glass: { name: "زجاجي", description: "تأثير زجاجي مع ضبابية" },
        floating: { name: "عائم", description: "مظهر عائم مرتفع" },
        card: { name: "بطاقة", description: "تصميم نظيف على شكل بطاقة" },
        overlay: { name: "تراكب", description: "تراكب كبير مع خلفية" },
      },
      testButton: "اختبار {{style}}",
      testInstructions:
        'انقر أزرار "اختبار" لمعاينة كل نمط حوار مع محتوى تجريبي',
      previewTitle: "معاينة نمط حوار {{style}}",
      previewDescription: "هذه معاينة لنمط حوار {{style}}.",
      sampleContentTitle: "محتوى تجريبي",
      sampleContentDescription:
        "يعرض هذا الحوار مظهر وسلوك نمط {{style}}. لاحظ الأسلوب والتنسيق والتأثيرات المختلفة.",
      closePreview: "إغلاق المعاينة",
      applyStyle: "تطبيق هذا النمط",
    },
    datePickerStyle: {
      title: "نمط منتقي التاريخ",
      description: "اختر كيفية ظهور حقول منتقي التاريخ",
      previewDate: "اليوم/الشهر/السنة",
      options: {
        default: {
          name: "افتراضي",
          description: "منتقي تاريخ قياسي بحدود نظيفة",
        },
        modern: { name: "حديث", description: "خلفية متدرجة مع ظلال محسنة" },
        glass: { name: "زجاجي", description: "تأثير زجاجي شفاف مع ضبابية" },
        outlined: { name: "مخطط", description: "حدود بارزة مع خلفية شفافة" },
        filled: { name: "ممتلئ", description: "خلفية صلبة مع حدود خفيفة" },
        minimal: { name: "بسيط", description: "حد سفلي فقط، نظيف وبسيط" },
        elegant: { name: "أنيق", description: "تدرج متطور مع خط مميز" },
      },
    },
    calendar: {
      sampleLabel: "{{month}} {{year}}",
    },
    calendarStyle: {
      title: "نمط التقويم",
      description: "اختر كيفية ظهور قوائم التقويم المنسدلة",
      options: {
        default: { name: "افتراضي", description: "تصميم تقويم نظيف وبسيط" },
        modern: { name: "حديث", description: "خلفيات متدرجة مع ظلال محسنة" },
        glass: { name: "زجاجي", description: "تأثير زجاجي شفاف مع ضبابية" },
        elegant: { name: "أنيق", description: "تصميم متطور مع ألوان مميزة" },
        minimal: {
          name: "بسيط",
          description: "تصميم فائق النظافة مع تنسيق بسيط",
        },
        dark: { name: "داكن", description: "تقويم بسمة داكنة مع ألوان غنية" },
      },
    },
    selectStyle: {
      title: "نمط القائمة المنسدلة",
      description: "اختر نمط التصميم لمكونات القائمة المنسدلة",
      regularSelect: "قائمة منسدلة عادية",
      searchableSelect: "قائمة منسدلة قابلة للبحث",
      selectPlaceholder: "اختر خيار...",
      searchPlaceholder: "بحث...",
      typeToSearch: "اكتب للبحث...",
      option1: "الخيار 1",
      option2: "الخيار 2",
      option3: "الخيار 3",
      searchResult1: "نتيجة البحث 1",
      searchResult2: "نتيجة البحث 2",
      options: {
        default: "افتراضي",
        modern: "حديث",
        glass: "زجاجي",
        outlined: "محدد الإطار",
        filled: "ممتلئ",
        minimal: "بسيط",
        elegant: "أنيق",
        professional: "احترافي",
        neon: "نيون",
        gradient: "تدرج لوني",
        neumorphism: "نيومورفيزم",
        cyberpunk: "سايبربانك",
        luxury: "فاخر",
        quantum: "كمومي",
        nebula: "سديم",
        prism: "موشور",
        stellar: "نجمي",
        vortex: "دوامة",
        phoenix: "عنقاء",
      },
    },

    logo: {
      title: "إعدادات الشعار",
      description: "خصص مظهر شعار التطبيق",
      typeLabel: "نوع الشعار",
      sizeLabel: "حجم الشعار",
      textLabel: "نص الشعار",
      textPlaceholder: "أدخل نص الشعار...",
      textHelp: "النص المعروض كشعار",
      imageInfo: "يستخدم الشعار الصوري الملف ‎/app-logo.png‎",
      previewLabel: "معاينة الشعار",
      previewHelp: "معاينة حية للشعار مع الإعدادات الحالية",
      sizeOptions: { xs: "XS", sm: "SM", md: "MD", lg: "LG", xl: "XL" },
      animationLabel: "حركة الشعار",
      animationOptions: {
        none: { name: "بدون", description: "بدون حركة" },
        spin: { name: "دوران", description: "حركة دوران" },
        pulse: { name: "نبض", description: "تأثير نابض" },
        fancy: { name: "مميز", description: "تأثيرات عند التحويم" },
      },
    },
    inputs: {
      title: "مكونات الإدخال",
      description: "تخصيص مظهر عناصر النماذج",
      checkbox: {
        title: "تصميم مربع الاختيار",
        description: "اختر النمط البصري لمربعات الاختيار",
        designOptions: {
          default: { name: "افتراضي", description: "تصميم مربع اختيار قياسي" },
          modern: { name: "عصري", description: "تصميم معاصر نظيف" },
          glass: { name: "زجاجي", description: "تأثير شفاف زجاجي" },
          neon: { name: "نيون", description: "حدود متوهجة مشرقة" },
          gradient: { name: "متدرج", description: "خلفيات متدرجة ملونة" },
          neumorphism: {
            name: "نيومورفيزم",
            description: "مظهر ثلاثي الأبعاد ناعم",
          },
          cyberpunk: {
            name: "سايبربانك",
            description: "جمالية تقنية مستقبلية",
          },
          luxury: { name: "فاخر", description: "لمسات ذهبية راقية" },
          aurora: { name: "شفق", description: "مستوحى من الأضواء الشمالية" },
          cosmic: { name: "كوني", description: "تصميم بموضوع الفضاء" },
          minimal: { name: "بسيط", description: "بساطة فائقة النظافة" },
          elegant: { name: "أنيق", description: "تصميم راقي ومتطور" },
          organic: { name: "عضوي", description: "أشكال منحنية طبيعية" },
          retro: { name: "ريترو", description: "نمط الحاسوب القديم" },
          matrix: { name: "ماتريكس", description: "تأثير المطر الرقمي" },
          diamond: { name: "ماسي", description: "تصميم بلوري متعدد الوجوه" },
          liquid: { name: "سائل", description: "أشكال متحولة سائلة" },
          crystal: { name: "كريستال", description: "بلوري شفاف" },
          plasma: { name: "بلازما", description: "تأثيرات طاقة كهربائية" },
          quantum: { name: "كمي", description: "مستوحى من فيزياء الجسيمات" },
          holographic: {
            name: "هولوغرافي",
            description: "تحولات قوس قزح متلألئة",
          },
          stellar: { name: "نجمي", description: "خلفية حقل النجوم" },
          vortex: { name: "دوامة", description: "أنماط طاقة دوارة" },
          phoenix: {
            name: "عنقاء",
            description: "موضوع النار والولادة الجديدة",
          },
        },
      },
      radio: {
        title: "تصميم أزرار الراديو",
        description: "اختر النمط البصري لأزرار الراديو",
        designOptions: {
          default: { name: "افتراضي", description: "تصميم زر راديو قياسي" },
          modern: { name: "عصري", description: "تصميم معاصر نظيف" },
          glass: { name: "زجاجي", description: "تأثير شفاف زجاجي" },
          neon: { name: "نيون", description: "حدود متوهجة مشرقة" },
          gradient: { name: "متدرج", description: "خلفيات متدرجة ملونة" },
          neumorphism: {
            name: "نيومورفيزم",
            description: "مظهر ثلاثي الأبعاد ناعم",
          },
          cyberpunk: {
            name: "سايبربانك",
            description: "جمالية تقنية مستقبلية",
          },
          luxury: { name: "فاخر", description: "لمسات ذهبية راقية" },
          aurora: { name: "شفق", description: "مستوحى من الأضواء الشمالية" },
          cosmic: { name: "كوني", description: "تصميم بموضوع الفضاء" },
          minimal: { name: "بسيط", description: "بساطة فائقة النظافة" },
          elegant: { name: "أنيق", description: "تصميم راقي ومتطور" },
          organic: { name: "عضوي", description: "أشكال منحنية طبيعية" },
          retro: { name: "ريترو", description: "نمط الحاسوب القديم" },
          matrix: { name: "ماتريكس", description: "تأثير المطر الرقمي" },
          diamond: { name: "ماسي", description: "تصميم بلوري متعدد الوجوه" },
          liquid: { name: "سائل", description: "أشكال متحولة سائلة" },
          crystal: { name: "كريستال", description: "بلوري شفاف" },
          plasma: { name: "بلازما", description: "تأثيرات طاقة كهربائية" },
          quantum: { name: "كمي", description: "مستوحى من فيزياء الجسيمات" },
          holographic: {
            name: "هولوغرافي",
            description: "تحولات قوس قزح متلألئة",
          },
          stellar: { name: "نجمي", description: "خلفية حقل النجوم" },
          vortex: { name: "دوامة", description: "أنماط طاقة دوارة" },
          phoenix: {
            name: "عنقاء",
            description: "موضوع النار والولادة الجديدة",
          },
        },
      },
      preview: "معاينة مباشرة",
      previewDescription: "شاهد كيف تبدو الأنماط المحددة في العمل",
    },

    behavior: {
      title: "سلوك الواجهة",
      description: "تحكم في كيفية تصرف الواجهة",
      breadcrumbs: {
        label: "إظهار مسار التنقل",
        description: "عرض مسار التنقل",
      },
      userAvatar: {
        label: "إظهار صورة المستخدم",
        description: "عرض صورة المستخدم في الرأس",
      },
      notifications: {
        label: "إظهار الإشعارات",
        description: "عرض أيقونة الإشعارات في الرأس",
      },
      logo: {
        label: "إظهار الشعار",
        description: "عرض الشعار في الشريط الجانبي والرأس",
      },
      compact: {
        label: "وضع مدمج",
        description: "تقليل المسافات في التطبيق",
      },
      contrast: {
        label: "تباين عالٍ",
        description: "زيادة التباين لإمكانية الوصول",
      },
      motion: {
        label: "تقليل الحركة",
        description: "تقليل الحركات والانتقالات",
      },
      sticky: {
        label: "رأس ثابت",
        description: "إبقاء الرأس مثبتاً أعلى الصفحة",
      },
      sidebar: {
        label: "شريط جانبي قابل للطي",
        description: "السماح بطي الشريط الجانبي",
      },
      footer: {
        label: "إظهار التذييل",
        description: "عرض التذييل أسفل الصفحات",
      },
      autoSave: {
        label: "حفظ تلقائي",
        description: "حفظ تغييرات الإعدادات تلقائياً",
      },
    },
    preview: {
      title: "معاينة حية",
      description: "شاهد تغييراتك في الوقت الحقيقي",
      buttons: {
        label: "الأزرار",
        primary: "زر أساسي",
        small: "زر صغير",
        default: "زر افتراضي",
        outline: "زر بإطار",
        secondary: "زر ثانوي",
      },
      badges: {
        label: "الشارات",
        default: "افتراضي",
        secondary: "ثانوي",
        outline: "إطار",
        error: "خطأ",
      },
      avatars: {
        label: "الرموز",
        sm: "صغير",
        md: "متوسط",
        lg: "كبير",
      },
      input: {
        label: "حقل الإدخال",
        placeholder: "حقل إدخال تجريبي...",
      },
      loading: { label: "مؤشر التحميل" },
      tooltip: {
        label: "تلميح",
        trigger: "مرر المؤشر",
        content: "هذا تلميح تجريبي",
      },
      table: { label: "معاينة الجدول" },
      card: {
        label: "معاينة البطاقة",
        title: "بطاقة تجريبية",
        description: "يوضح كيف تبدو البطاقات",
        content: "محتوى البطاقة يظهر هنا مع النمط الحالي.",
      },
      typography: {
        label: "الطباعة",
        heading: "عنوان تجريبي",
        paragraph: "هذا نص فقرة تجريبي يوضح حجم الخط الحالي والمسافات.",
      },
    },
  },

  // Layout Templates
  layout: {
    hide_panel: "اخفاء القائمة",
    show_panel: "إظهار القائمة",
    classic: "كلاسيكي",
    elegant: "أنيق",
    modern: "عصري",
    minimal: "بسيط",
    compact: "مدمج",
    floating: "عائم",
    classicDesc: "تصميم كلاسيكي مع شريط جانبي عريض وأيقونات كبيرة",
    elegantDesc: "تصميم أنيق مع خطوط ناعمة وألوان متدرجة",
    modernDesc: "تصميم عصري مع شريط جانبي مصغر وهيدر كبير",
    minimalDesc: "تصميم بسيط مع شريط علوي فقط وقوائم منسدلة",
    compactDesc: "تصميم مدمج مع عناصر صغيرة لتوفير مساحة أكبر للمحتوى",
    floatingDesc: "تصميم عائم مع بطاقات منفصلة وتأثيرات ثلاثية الأبعاد",
    items: "عناصر",
    search_placeholder: "بحث",
    click_to_expand: "انقر للتمديد",
    click_to_navigate: "انقر للتنقل",
  },

  // Color Themes
  color: {
    purple: "أرجواني",
    blue: "أزرق",
    green: "أخضر",
    orange: "برتقالي",
    red: "أحمر",
    teal: "فيروزي",
  },

  // Card Styles
  cardStyle: {
    default: "افتراضي",
    glass: "زجاجي",
    solid: "صلب",
    bordered: "إطار",
    defaultDesc: "بطاقات بتصميم بسيط",
    glassDesc: "تأثير زجاجي شفاف",
    solidDesc: "بطاقات ملونة بالكامل",
    borderedDesc: "بطاقات بإطار واضح",
  },

  // Logo Types
  logoType: {
    image: "صورة",
    sparkles: "شرر",
    shield: "درع",
    custom: "مخصص",
    customText: "نص مخصص",
    imageDesc: "استخدام صورة الشعار",
    sparklesDesc: "أيقونة شرر",
    shieldDesc: "أيقونة درع",
    customDesc: "شعار نصي مخصص",
  },

  // Animation Levels
  animation: {
    none: "بدون",
    minimal: "بسيط",
    moderate: "متوسط",
    high: "عالي",
    noneDesc: "بدون تأثيرات حركية",
    minimalDesc: "تأثيرات حركية بسيطة",
    moderateDesc: "تأثيرات حركية متوسطة",
    highDesc: "تأثيرات حركية متقدمة",
  },

  // Font Sizes
  fontSize: {
    small: "صغير",
    default: "متوسط",
    large: "كبير",
    smallDesc: "خط أصغر للواجهة",
    defaultDesc: "حجم الخط الافتراضي",
    largeDesc: "خط أكبر للواجهة",
  },

  // Border Radius
  radius: {
    none: "بدون",
    small: "صغير",
    default: "متوسط",
    large: "كبير",
    full: "دائري",
  },

  // Sidebar Position
  sidebar: {
    right: "يمين (RTL)",
    left: "يسار (LTR)",
  },

  // Theme
  theme: {
    light: "فاتح",
    dark: "داكن",
    system: "النظام",
  },

  // Language
  language: {
    arabic: "العربية",
    english: "الإنجليزية",
  },

  // Common
  common: {
    confirm: "تأكيد",
    close: "إغلاق",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    back: "عودة",
    yes: "نعم",
    no: "لا",
    active: "نشط",
    inActive: "غير نشط",
    collapseAll: "طي الكل",
    expandAll: "إظهار الكل",
    selectDate: "اختر التاريخ",
    search: "البحث...",
    filter: "تصفية",
    create: "إنشاء",
    export: "تصدير",
    import: "استيراد",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    view: "عرض",
    add: "إضافة",
    add_child: "إضافة فرع",
    will_add_under: "سيتم إضافته تحت",
    edit_location_under: "تعديل الموقع تحت",
    root: "الجذر",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات متاحة",
    error: "حدث خطأ",
    success: "تم بنجاح",
    refresh: "تحديث",
    retry: "إعادة المحاولة",
    unknown: "غير معروف",
    user: "مستخدم",
    confirmDelete: "تأكيد الحذف",
    deleteConfirmation: "هل أنت متأكد من حذف {name}؟",
    deleteWarning: "لا يمكن التراجع عن هذا الإجراء.",
    deleting: "جاري الحذف...",
    pageNotFound: "الصفحة غير موجودة",
    pageNotFoundDescription: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    goBack: "العودة",
    goHome: "الذهاب للرئيسية",
    unexpectedError:
      "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.",
    errorId: "معرف الخطأ",
  },

  // Table
  table: {
    select: "تحديد",
    actions: "الإجراءات",
    page: "صفحة",
    of: "من",
    previous: "السابق",
    next: "التالي",
    showing: "عرض",
    results: "نتيجة",
    show: "إظهار",
    perPage: "في الصفحة",
    firstPage: "الصفحة الأولى",
    lastPage: "الصفحة الأخيرة",
    previousPage: "الصفحة السابقة",
    nextPage: "الصفحة التالية",
    goToPage: "الذهاب للصفحة",
  },

  // Stats
  stats: {
    fromLastMonth: "من الشهر الماضي",
    increase: "زيادة",
    decrease: "انخفاض",
  },

  // Status
  status: {
    online: "متصل",
  },

  components: {
    select: {
      placeholder: "اختر......",
    },
    searchableSelect: {
      placeholder: "ابحث......",
    },
    multiSelect: {
      searchStates: {
        selected: "المحدد",
        searching: "جاري البحث .....",
        noResults: "لا يوجد نتائج",
      },
      title: "اختيار متعدد",
      description: "اختيار المتعدد من الاختيارات",
      currentStyle: "التصميم الحالي",
      placeholders: {
        selectTechnologies: "اختر التقنيات",
        searchTechnologies: "ابحث عن التقنيات...",
      },
      selected: "المحدد: لا يوجد",
      availableStyles: "الأنماط المتاحة",
      buttons: {
        selectAll: "اختر الكل",
        clearAll: "مسح الكل",
        apply: "تطبيق",
        active: "نشط",
      },
      categories: {
        webTech: {
          html: "HTML",
        },
        design: {
          figma: "فيجما",
        },
        backend: {
          nodejs: "Node.js",
        },
        database: {
          mysql: "MySQL",
        },
        devops: {
          git: "Git",
          docker: "Docker",
        },
        cloud: {
          aws: "خدمات أمازون السحابية (AWS)",
        },
        security: {
          cybersecurity: "الأمن السيبراني",
          blockchain: "سلسلة الكتل (Blockchain)",
        },
        ux: {
          uiDesign: "تصميم واجهة المستخدم",
        },
        mobile: {
          ios: "iOS",
        },
        business: {
          premium: "ممتاز",
        },
        ai: {
          quantumComputing: "الحوسبة الكمومية",
        },
        science: {
          spaceExploration: "استكشاف الفضاء",
          optics: "البصريات",
        },
        energy: {
          solarEnergy: "الطاقة الشمسية",
        },
        physics: {
          fluidDynamics: "ديناميكا الموائع",
        },
        gaming: {
          gameDesign: "تصميم الألعاب",
        },
      },
      serverSearchDemo: "عرض توضيحي للبحث من جانب الخادم...",
      serverSearchDescription: "هذا مثال على البحث الذي يتم معالجته في الخادم.",
      serverSearchPlaceholder: "عرض توضيحي للبحث من جانب الخادم...",
      serverSearchSearchPlaceholder: "اكتب للبحث في الخادم...",
      serverSearchSearchingText: "جاري البحث في الخادم...",
      serverSearchNoResultsText: "لم يتم العثور على نتائج من الخادم",
      serverSearchResult: "النتيجة {{index}}",
      serverSearchApi: "واجهة برمجة التطبيقات",
      serverSearchSdk: "مجموعة تطوير البرمجيات",
      features: "الميزات",
      featuresDescription: "عرض أهم ميزات أداة التحديد المتعدد.",
    },
    unifiedSelect: {
      types: {
        single: "اختيار مفرد",
        multi: "اختيار متعدد",
        searchable: "قابل للبحث",
      },
    },
  },

  searchPlaceholders: {
    default: "ابحث في الخيارات الافتراضية...",
    modern: "ابحث في الخيارات الحديثة...",
    glass: "ابحث في الخيارات الزجاجية...",
    outlined: "ابحث في الخيارات محددة الإطار...",
    filled: "ابحث في الخيارات الممتلئة...",
    minimal: "ابحث في الخيارات البسيطة...",
    elegant: "ابحث في الخيارات الأنيقة...",
    professional: "ابحث في الخيارات الاحترافية...",
    neon: "ابحث في خيارات النيون...",
    gradient: "ابحث في خيارات التدرج اللوني...",
    neumorphism: "ابحث في خيارات النيومورفيزم...",
    cyberpunk: "ابحث في خيارات السايبربانك...",
    luxury: "ابحث في الخيارات الفاخرة...",
    quantum: "ابحث في خيارات الكم...",
    nebula: "ابحث في خيارات السديم...",
    prism: "ابحث في خيارات الموشور...",
    stellar: "ابحث في الخيارات النجمية...",
    vortex: "ابحث في خيارات الدوامة...",
    phoenix: "ابحث في خيارات العنقاء...",
  },

  // Add this to your ar.ts file
  tinymce: {
    language: "ar",
    placeholder: "ابدأ الكتابة...",
    status: {
      ready: "محرر TinyMCE جاهز",
      loading: "جاري تحميل المحرر...",
    },
    features: {
      autoSave: "الحفظ التلقائي مفعل",
      spellCheck: "التحقق الإملائي مفعل",
      tables: "الجداول مفعلة",
    },
    toolbar: {
      undo: "تراجع",
      redo: "إعادة",
      bold: "عريض",
      italic: "مائل",
      underline: "تسطير",
      strikethrough: "خط في المنتصف",
      alignLeft: "محاذاة لليسار",
      alignCenter: "محاذاة للوسط",
      alignRight: "محاذاة لليمين",
      alignJustify: "محاذاة كاملة",
      outdent: "تقليل المسافة البادئة",
      indent: "زيادة المسافة البادئة",
      numlist: "قائمة مرقمة",
      bullist: "قائمة نقطية",
      forecolor: "لون النص",
      backcolor: "لون الخلفية",
      removeformat: "إزالة التنسيق",
      pagebreak: "فاصل صفحات",
      charmap: "رموز خاصة",
      emoticons: "رموز تعبيرية",
      fullscreen: "ملء الشاشة",
      preview: "معاينة",
      save: "حفظ",
      print: "طباعة",
      insertfile: "إدراج ملف",
      image: "إدراج صورة",
      media: "إدراج وسائط",
      template: "إدراج قالب",
      link: "إدراج رابط",
      anchor: "إدراج مرساة",
      codesample: "إدراج عينة كود",
      ltr: "من اليسار لليمين",
      rtl: "من اليمين لليسار",
      table: "إدراج جدول",
      help: "مساعدة",
    },
    menus: {
      file: "ملف",
      edit: "تحرير",
      view: "عرض",
      insert: "إدراج",
      format: "تنسيق",
      table: "جدول",
      tools: "أدوات",
      help: "مساعدة",
    },
    dialogs: {
      erpFeatures: {
        title: "ميزات نظام إدارة المؤسسات",
        description: "خيارات التنسيق الخاصة بنظام إدارة المؤسسات:",
        features: [
          "جداول البيانات",
          "حقول النماذج",
          "التقارير",
          "الرسوم البيانية",
        ],
        close: "إغلاق",
      },
      image: {
        url: "رابط الصورة",
        alt: "النص البديل",
        title: "عنوان الصورة",
        description: "وصف الصورة",
        caption: "التعليق التوضيحي",
        upload: "رفع صورة",
        browse: "تصفح الملفات",
      },
      link: {
        url: "الرابط",
        text: "نص الرابط",
        title: "عنوان الرابط",
        target: "الهدف",
        newWindow: "فتح في نافذة جديدة",
      },
      table: {
        title: "إدراج جدول",
        rows: "الصفوف",
        columns: "الأعمدة",
        width: "العرض",
        height: "الارتفاع",
        border: "الحدود",
        cellPadding: "حشو الخلية",
        cellSpacing: "تباعد الخلايا",
        caption: "التعليق التوضيحي",
        header: "صف الرأس",
      },
    },
    messages: {
      imageUploadFailed: "فشل في رفع الصورة",
      linkInvalidUrl: "يرجى إدخال رابط صحيح",
      tableInserted: "تم إدراج الجدول بنجاح",
      contentSaved: "تم حفظ المحتوى بنجاح",
      autoSaveEnabled: "الحفظ التلقائي مفعل",
      spellCheckEnabled: "التحقق الإملائي مفعل",
    },
  },

  errors: {
    boundary: {
      title: "حدث خطأ ما",
      description:
        "حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة أو الاتصال بالدعم إذا استمرت المشكلة.",
      details: "تفاصيل الخطأ",
      retry: "إعادة المحاولة",
      home: "العودة للرئيسية",
    },
    network: {
      offline:
        "أنت غير متصل بالإنترنت حالياً. يرجى التحقق من اتصالك بالإنترنت.",
      timeout: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
      serverError: "حدث خطأ في الخادم. يرجى المحاولة لاحقاً.",
    },
    auth: {
      unauthorized: "ليس لديك صلاحية للوصول إلى هذا المورد.",
      sessionExpired: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",
      loginRequired: "يرجى تسجيل الدخول للمتابعة.",
    },
  },
};
