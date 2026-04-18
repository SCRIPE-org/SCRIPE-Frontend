export const ar = {
  entitlements: {
    tenantPlans: {
      // ── الصفحة ──
      title: "خطط المستأجر",
      description: "إنشاء وإدارة خطط التسعير للمستخدمين النهائيين.",
      planName: "اسم الخطة",
      namePlaceholder: "مثال: ذهبي، متميز، مؤسسي",
      descriptionPlaceholder: "وصف مختصر لهذه الخطة...",

      // ── التسعير والفوترة ──
      pricing: "السعر الابتدائي",
      billingCycles: "دورات الفوترة",
      monthly: "شهري",
      yearly: "سنوي",
      lifetime: "مدى الحياة",
      allowMonthly: "السماح بالفوترة الشهرية",
      allowYearly: "السماح بالفوترة السنوية",
      allowLifetime: "السماح بالشراء مدى الحياة",
      allowTrial: "السماح بالتجربة",

      // ── العرض ──
      displayNameEn: "اسم العرض (EN)",
      displayNameEnPlaceholder: "الاسم الظاهر للعملاء بالإنجليزية",
      displayNameAr: "اسم العرض (AR)",
      displayNameArPlaceholder: "اسم العرض بالعربية",
      tagline: "الشعار",
      taglinePlaceholder: "شعار تسويقي قصير",
      isPublic: "مرئي للعامة",
      isPublicDesc: "إذا كان مفعلاً، يمكن للمستخدمين رؤية واختيار هذه الخطة.",
      tier: "مستوى الطبقة",

      // ── الحدود والتجربة ──
      trialDays: "أيام التجربة",
      trialDaysDesc: "عدد أيام التجربة المجانية (0 = بدون تجربة).",
      maxUsers: "الحد الأقصى للمستخدمين",
      maxUsersDesc: "-1 يعني عدد غير محدود من المستخدمين.",
      maxSubscribers: "الحد الأقصى للمشتركين",
      sortOrder: "ترتيب العرض",
      subscribers: "المشتركون",
      gracePeriodDays: "أيام فترة السماح",

      // ── الإعدادات ──
      selfServiceEnabled: "الخدمة الذاتية مفعلة",
      contactSalesOnly: "الاتصال بالمبيعات فقط",

      // ── دورة الحياة ──
      publish: "نشر",
      publishDesc: "جعل هذه الخطة متاحة للاشتراكات.",
      published: "تم نشر الخطة",
      publishedDesc: "الخطة الآن متاحة للاشتراكات.",
      publishFailed: "فشل في نشر الخطة.",
      archive: "أرشفة",
      archiveDesc: "أرشفة هذه الخطة. يتم الحفاظ على الاشتراكات الحالية.",
      archived: "تم أرشفة الخطة",
      archivedDesc: "تم أرشفة الخطة. لا يسمح باشتراكات جديدة.",
      archiveFailed: "فشل في أرشفة الخطة.",
      statusDraft: "مسودة",
      statusPublished: "منشور",
      statusArchived: "مؤرشف",

      // ── علامات التبويب ──
      tabFeatures: "الميزات",
      tabPricing: "التسعير",
      tabVersions: "الإصدارات",
      tabPromotions: "العروض الترويجية",

      // ── علامة الميزات ──
      noFeatures: "لا توجد ميزات معينة لهذه الخطة بعد.",
      noFeaturesHint: "أضف ميزات من كتالوج الميزات لتحديد ما تتضمنه هذه الخطة.",

      // ── علامة التسعير ──
      noPricing: "لم يتم تكوين تسعير لهذه الخطة بعد.",
      noPricingHint: "أضف إدخالات تسعير لعملات ودورات فوترة مختلفة.",
      priceCount: "سعر",
      priceCountPlural: "أسعار",
      promo: "عرض",

      // ── علامة الإصدارات ──
      noVersions: "لا توجد نسخ بعد.",
      noVersionsHint: "يتم إنشاء نسخ عند نشر الخطة.",
      versionHistory: "سجل الإصدارات",
      versionHistoryDesc: "نسخ غير قابلة للتغيير تم إنشاؤها عند النشر. الاشتراكات النشطة مرتبطة بإصدارها.",

      // ── علامة العروض الترويجية ──
      promotionsTitle: "العروض الترويجية",
      promotionsDesc: "أكواد الخصم والعروض المرتبطة بهذه الخطة. إدارة جميع العروض من الصفحة الرئيسية للعروض.",
      promotionsPlaceholder: "إدارة العروض الترويجية متاحة من الصفحة المخصصة.",
      viewAllPromotions: "عرض جميع العروض الترويجية",

      // ── العمليات ──
      create: "إنشاء خطة",
      createDesc: "تحديد خطة تسعير جديدة للمستخدمين.",
      edit: "تعديل الخطة",
      editDesc: "تحديث تفاصيل الخطة.",
      deleteConfirmTitle: "حذف الخطة",
      deleteConfirmDesc: "سيتم حذف الخطة بشكل مؤقت. لا يمكنك حذف خطط بها مشتركون نشطون.",
      created: "تم إنشاء الخطة",
      createdDesc: "تم إنشاء الخطة الجديدة بنجاح.",
      updated: "تم تحديث الخطة",
      updatedDesc: "تم تحديث تفاصيل الخطة.",
      deleted: "تم حذف الخطة",
      deletedDesc: "تم إزالة الخطة.",

      // ── الحالات ──
      noPlans: "لا توجد خطط",
      activeBadge: "نشط",
      inactiveBadge: "غير نشط",
      publicBadge: "عام",
      privateBadge: "خاص",
      unlimitedUsers: "غير محدود",
      unlimited: "∞",
      cannotDeleteActive: "لا يمكن حذف خطة بها مشتركون نشطون.",
      noTenantContext: "خطط المستأجر متاحة فقط للمسؤولين المرتبطين بمستأجر.",
      noTenantContextHint: "يرجى انتحال صفة مسؤول مستأجر لإدارة الخطط.",

      // ── تبويب التسعير القابل للتحرير ──
      addPrice: "إضافة سعر",
      amount: "المبلغ",
      originalAmount: "السعر الأصلي",
    },

    // ── كتالوج الميزات ──
    featureDefinitions: {
      title: "كتالوج الميزات",
      tier2Badge: "المستوى ٢",
      description: "حدد ميزات قابلة لإعادة الاستخدام يمكن تعيينها لخططك. قيم منطقية أو رقمية أو نصية.",
      create: "إنشاء ميزة",
      edit: "تعديل ميزة",
      deleteTitle: "حذف ميزة",
      deleteDesc: "سيتم حذف هذه الميزة نهائياً. لا يمكن حذف الميزات المستخدمة في الخطط.",
      searchPlaceholder: "البحث بالمفتاح أو الاسم أو الفئة...",
      key: "مفتاح الميزة",
      keyPlaceholder: "مثال: max_projects، api_access، custom_branding",
      keyHint: "معرّف فريد. لا يمكن تغييره بعد الإنشاء.",
      displayName: "اسم العرض",
      displayNameEn: "اسم العرض (EN)",
      displayNameEnPlaceholder: "مثال: Maximum Projects",
      displayNameAr: "اسم العرض (AR)",
      displayNameArPlaceholder: "الحد الأقصى للمشاريع",
      valueType: "نوع القيمة",
      selectType: "اختر النوع...",
      valueTypeHint: "منطقي = تشغيل/إيقاف، رقمي = حصة/حد، نصي = قيمة نصية.",
      typeBoolean: "منطقي",
      typeNumeric: "رقمي",
      typeString: "نصي",
      defaultValue: "القيمة الافتراضية",
      category: "الفئة",
      categoryPlaceholder: "مثال: الحدود، الوصول، العلامة التجارية، التكاملات",
      descriptionLabel: "الوصف",
      descriptionPlaceholder: "ما الذي تتحكم به هذه الميزة...",
      sortOrder: "ترتيب العرض",
      usageCount: "الخطط المستخدمة",
      emptyCatalog: "لم يتم تحديد ميزات بعد. أنشئ ميزات لتعيينها لخططك.",
      goToCatalog: "الذهاب لكتالوج الميزات",
      addFeature: "إضافة ميزة",
      pickFeature: "إضافة ميزة من الكتالوج",
      pickFeatureDesc: "اختر ميزة لإضافتها لهذه الخطة. يمكنك تعيين قيمتها بعد الإضافة.",
    },
  },
};
