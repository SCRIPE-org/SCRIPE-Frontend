/**
 * Edition comparison surface copy.
 *
 * Every string here replaces a `t(key) || "English"` fallback that was shipping
 * untranslated copy in the Arabic build: the key never existed, so the fallback
 * was the only thing that ever rendered. Prices, trial terms and the boolean
 * matrix are the surface a prospective tenant reads first, so a half-translated
 * cell here is a half-translated pricing page.
 *
 * Interpolation uses the single-brace form the i18n provider supports, so the
 * numbers stay parameters and each language keeps its own word order.
 */

export const en = {
  entitlements: {
    editions: {
      comparison: {
        // ── Billing cycle ──────────────────────────────────
        billingCycle: "Billing cycle",
        monthly: "Monthly",
        yearly: "Yearly",
        lifetime: "Lifetime",
        monthShort: "mo",
        yearShort: "yr",
        once: "once",
        perMonth: "/ month",
        perYear: "/ year",
        oneTime: "one-time",
        billedMonthly: "Billed monthly",
        billedAnnually: "Billed annually",
        payOnce: "Pay once, use forever",
        billingUnavailable: "{cycle} billing not available",

        // ── Price ──────────────────────────────────────────
        free: "Free",
        freeForever: "Free forever",
        savePercent: "Save {percent}%",
        contactSales: "Contact Sales",
        contactForPricing: "Contact us for pricing",

        // ── Preview call to action ─────────────────────────
        getStarted: "Get Started",
        getStartedFree: "Get Started Free",
        startTrialDays: "Start {days}-Day Trial",
        mostPopular: "Most Popular",

        // ── Trial ──────────────────────────────────────────
        trialRow: "Free trial",
        freeTrialDays: "{days}-day free trial",
        discountedTrialDays: "{days}-day trial at {discount}% off",
        trialDaysFree: "{days} days free",
        trialDaysDiscount: "{days} days at {discount}% off",

        // ── Feature matrix ─────────────────────────────────
        included: "Included",
        notIncluded: "Not included",
        unlimited: "Unlimited",
        moreFeatures: "+ {count} more features",
        tierLevel: "Tier {level}",
        showAllFeaturesCount: "Show all {count} features",

        // ── Page states ────────────────────────────────────
        loading: "Loading edition data…",
        emptyTitle: "No editions to compare",
        emptyDescription:
          "Activate at least one edition to preview the public pricing page.",
      },
    },
  },
} as const;

export const ar = {
  entitlements: {
    editions: {
      comparison: {
        // ── دورة الفوترة ───────────────────────────────────
        billingCycle: "دورة الفوترة",
        monthly: "شهري",
        yearly: "سنوي",
        lifetime: "مدى الحياة",
        monthShort: "شهر",
        yearShort: "سنة",
        once: "مرة واحدة",
        perMonth: "/ شهريًا",
        perYear: "/ سنويًا",
        oneTime: "دفعة واحدة",
        billedMonthly: "يُفوتر شهريًا",
        billedAnnually: "يُفوتر سنويًا",
        payOnce: "ادفع مرة واحدة واستخدمه للأبد",
        billingUnavailable: "الفوترة {cycle} غير متاحة",

        // ── السعر ──────────────────────────────────────────
        free: "مجاني",
        freeForever: "مجاني للأبد",
        savePercent: "وفّر {percent}%",
        contactSales: "تواصل مع المبيعات",
        contactForPricing: "تواصل معنا لمعرفة الأسعار",

        // ── إجراء المعاينة ─────────────────────────────────
        getStarted: "ابدأ الآن",
        getStartedFree: "ابدأ مجانًا",
        startTrialDays: "ابدأ تجربة {days} يومًا",
        mostPopular: "الأكثر شيوعًا",

        // ── التجربة ────────────────────────────────────────
        trialRow: "تجربة مجانية",
        freeTrialDays: "تجربة مجانية لمدة {days} يومًا",
        discountedTrialDays: "تجربة لمدة {days} يومًا بخصم {discount}%",
        trialDaysFree: "{days} يومًا مجانًا",
        trialDaysDiscount: "{days} يومًا بخصم {discount}%",

        // ── مصفوفة الميزات ─────────────────────────────────
        included: "مُضمّن",
        notIncluded: "غير مُضمّن",
        unlimited: "غير محدود",
        moreFeatures: "+ {count} ميزة إضافية",
        tierLevel: "المستوى {level}",
        showAllFeaturesCount: "عرض جميع الميزات ({count})",

        // ── حالات الصفحة ───────────────────────────────────
        loading: "جارٍ تحميل بيانات الإصدارات…",
        emptyTitle: "لا توجد إصدارات للمقارنة",
        emptyDescription: "فعّل إصدارًا واحدًا على الأقل لمعاينة صفحة التسعير العامة.",
      },
    },
  },
} as const;
