/**
 * W9-2 — tenant plan wizard/detail views and the pricing card.
 *
 * The comparison view used to hardcode a flat, un-computed savings percentage
 * next to the Yearly toggle. It is now a real percentage derived from each
 * plan's cheapest Monthly vs. Yearly price (averaged across plans that sell
 * both cycles) — the copy carries a `{percent}` placeholder rather than a
 * baked-in number so it never drifts from the underlying prices again.
 *
 * `monthShort` / `yearShort` / `once` mirror the pattern already established by
 * the editions module's comparison view (its own copy of these three lives in
 * `entitlements.editions.comparison.*` and is not reused here — a shared
 * component reading a sibling module's key is the kind of coupling the shard
 * system exists to avoid).
 */
export const en = {
  entitlements: {
    tenantPlans: {
      comparison: {
        savePercent: "Save {percent}%",
        monthShort: "mo",
        yearShort: "yr",
        once: "one-time",
        trialDaysFree: "{days}-day free trial",
        trialDaysShort: "{days}d free",
        corePlanLabel: "Core plan",
        emptyTitle: "No plans to compare",
        emptyDescription:
          "Publish at least one active plan to preview the comparison your users will see.",
        loading: "Loading comparison data…",
        // The base `showAllFeatures` key ("Show all features") predates this
        // wave and has no interpolation slot, so the count was being computed
        // and then silently discarded — the call site OR'd it against a raw
        // English template that a real key made unreachable. This one carries
        // the count instead of shadowing it.
        showAllFeaturesCount: "Show all {count} features",
      },
    },
    featureDefinitions: {
      typeBooleanHint: "e.g. true",
      typeNumericHint: "e.g. 10, 100, -1 (unlimited)",
      typeStringHint: "e.g. basic, premium, enterprise",
    },
  },
} as const;

export const ar = {
  entitlements: {
    tenantPlans: {
      comparison: {
        savePercent: "وفّر {percent}%",
        monthShort: "شهريًا",
        yearShort: "سنويًا",
        once: "دفعة واحدة",
        trialDaysFree: "تجربة مجانية لمدة {days} يوم",
        trialDaysShort: "{days} يوم مجانًا",
        corePlanLabel: "الخطة الأساسية",
        emptyTitle: "لا توجد خطط للمقارنة",
        emptyDescription: "انشر خطة نشطة واحدة على الأقل لمعاينة المقارنة التي سيراها مستخدموك.",
        loading: "جارٍ تحميل بيانات المقارنة…",
        showAllFeaturesCount: "عرض جميع الميزات ({count})",
      },
    },
    featureDefinitions: {
      typeBooleanHint: "مثال: true",
      typeNumericHint: "مثال: 10، 100، -1 (غير محدود)",
      typeStringHint: "مثال: أساسي، متميز، مؤسسي",
    },
  },
} as const;
