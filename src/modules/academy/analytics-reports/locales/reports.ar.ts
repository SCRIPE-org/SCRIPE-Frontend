export const reportsAr = {
  title: "لوحات تحكم الأكاديمية والتحليلات التشغيلية",
  subtitle: "تقارير موثوقة وفورية للتسجيلات، الرياضيين المتعددين، نسب إشغال المجموعات بالتاريخ الفعلي، والتصدير المنضبط",
  asOf: "حتى تاريخ",
  refresh: "تحديث",
  exportData: "تصدير البيانات التشغيلية",
  sourceNotice: "مقاييس تشغيلية موثوقة لأكاديمية سكريبت. الأرقام المالية مسقطة حصرياً من نظام المالية SCRIPE Finance. مؤشرات حضور الجلسات S5/S6 مجمدة بموجب العقد.",

  // Filter Bar
  filters: {
    allBranches: "جميع الفروع",
    allPrograms: "جميع البرامج",
    allSeasons: "جميع المواسم",
    filterByBranch: "تصفية حسب الفرع",
    filterByProgram: "تصفية حسب البرنامج",
    filterBySeason: "تصفية حسب الموسم",
    apply: "تطبيق التصفية",
    reset: "إعادة ضبط"
  },

  // KPI Summary
  kpi: {
    uniqueAthletes: "الرياضيون الفريدون النشطون",
    uniqueAthletesSub: "إزالة التكرار للرياضيين المشتركين في برامج متعددة",
    registeredAthletes: "إجمالي الرياضيين المسجلين",
    withEnrollments: "مع تسجيلات",
    activeEnrollments: "التسجيلات النشطة",
    activeEnrollmentsSub: "المقاعد النشطة حالياً في البرامج",
    multiSport: "رياضيون متعددو الرياضات",
    multiSportSub: "رياضيون نشطون في رياضتين أو أكثر",
    groupCapacity: "متوسط إشغال المجموعات (المرجح)",
    groupCapacitySub: "القائمة النشطة المرجحة بالسعة القصوى",
    trialConversion: "معدل تحويل التجارب",
    trialConversionSub: "المقبولون مقابل القرارات الصادرة (قبول + رفض)"
  },

  // Group Capacity Table
  groupTable: {
    title: "سعة مجموعات التدريب ونسب الإشغال الفعلي",
    groupName: "اسم المجموعة",
    offering: "البرنامج / العرض التدريبي",
    branch: "الفرع",
    capacity: "السعة (الأدنى • الأقصى)",
    minMaxFormat: "الأدنى: {min} • الأقصى: {max}",
    activeMembers: "الأعضاء النشطون",
    fillRate: "نسبة الإشغال",
    status: "الحالة",
    statusActive: "نشطة (متاحة)",
    statusFull: "نشطة (مكتملة)",
    statusUncapped: "مفتوحة (دون حد)",
    empty: "لا توجد مجموعات تدريب مطابقة للتصفية المحددة.",
    zeroCapacityWarning: "غير محدد السعة (0.0%)"
  },

  // Trial Funnel
  trialFunnel: {
    title: "مسار التجارب ومعدل التحويل",
    totalTrials: "إجمالي التجارب",
    requested: "المطلوبة",
    scheduled: "المجدولة",
    attendedEvaluated: "الحاضرة / المقيمة",
    accepted: "المقبولة",
    rejected: "المرفوضة",
    conversionRate: "معدل تحويل القبول",
    conversionNote: "المحسوب: المقبولون / (المقبولون + المرفوضون). تُستبعد التجارب قيد الإجراء بانتظار القرار من المقام."
  },

  // Financial Snapshot
  finance: {
    title: "ملخص المستحقات المالية المعتمد",
    sourceBadge: "المصدر المالي المعتمد SCRIPE Finance",
    currency: "العملة",
    invoiced: "إجمالي الفواتير",
    paid: "إجمالي المسدد",
    outstanding: "الرصيد القائم",
    overdue: "المبلغ المتأخر",
    noData: "لا توجد مستحقات مالية مسجلة لهذا النطاق.",
    governanceNote: "مقروء مباشرة من سجل CustomerInvoice في نظام المالية. الأكاديمية لا تفترض حالة السداد مطلقاً."
  },

  // Codex Deferred Metrics
  deferredNotice: {
    title: "مؤشرات كودكس S5/S6 — وصلة تكامل مؤجلة",
    badge: "DEFERRED_PENDING_CODEX_S5_S6",
    attendanceRate: "معدل الحضور",
    coachWorkload: "ساعات عمل المدربين في الجلسات",
    sessionUtilization: "معدل استغلال الجلسات",
    pendingValue: "في انتظار دمج S5/S6",
    contractTitle: "في انتظار تسليم وحدات كودكس:",
    description: "تعتمد المؤشرات التشغيلية للجلسات والحضور على وحدتي كودكس S5 (جلسات التدريب) و S6 (الحضور) قيد التطوير حالياً. وفقاً لقواعد معمارية سكريبت، تُحجب هذه المؤشرات حتى يتم تسليم عقود كودكس. لا يتم عرض أي قيم وهمية."
  },

  // Export Dialog
  exportDialog: {
    title: "تصدير CSV التشغيلي المنضبط",
    description: "تصدير مجموعات البيانات التشغيلية مع تطبيق حدود المستأجر/الفروع، تعقيم معادلات CSV، وحجب بيانات حماية القاصرين.",
    datasetLabel: "اختر مجموعة البيانات",
    datasetAthletes: "الرياضيون (دون تكرار، حماية البيانات الشخصية)",
    datasetEnrollments: "التسجيلات (النشطة والسابقة)",
    datasetGroups: "مجموعات التدريب وسعة الإشغال",
    datasetTrials: "مسار التجارب والتقييمات",
    piiNotice: "سياسة حماية القاصرين مفعلة: أرقام هواتف أولياء الأمور، البريد الشخصي، والملاحظات الطبية محجوبة تماماً من التصدير.",
    csvSanitizationNotice: "حماية حقن المعادلات مفعلة: القيم التي تبدأ بـ =, +, -, @, \\t, \\r يتم حمايتها ببادئة علامة الاقتباس.",
    cancel: "إلغاء",
    download: "تحميل ملف CSV المنضبط"
  },

  // Status & Error
  loading: "جاري تحميل التحليلات التشغيلية المعتمدة...",
  error: "حدث خطأ أثناء تحميل التحليلات.",
  retry: "إعادة المحاولة"
};
