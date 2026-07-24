/**
 * W5-2 — subscription detail record (HeroCard, BillingCard, PlanDetailsCard,
 * StripeCard, HistorySection).
 *
 * These rows and titles previously rendered as hardcoded English literals with
 * no `t()` call at all, or fell back to hardcoded English whenever a key was
 * absent. This shard supplies the real copy so both languages ship together.
 */
export const en = {
  entSubscriptions: {
    billing: "Billing",
    currency: "Currency",
    gateway: "Gateway",
    originalPrice: "Original Price",
    refundAmount: "Refund Amount",
    free: "Free",
    history: "Subscription History",
    historyDesc: "Previous subscription records for this tenant",
    timeRemaining: "{{time}} remaining",
    onExpiryFallback: "↓ Fallback",
    onExpirySuspend: "⏸ Suspend",
    loadError: "Failed to load subscription details.",
    downgradedFrom: "From {{edition}}",
    downgradedFromType: "From {{edition}} ({{type}})",
  },
  entitlements: {
    promotions: {
      promoCode: "Promo Code",
    },
  },
} as const;

export const ar = {
  entSubscriptions: {
    billing: "الفوترة",
    currency: "العملة",
    gateway: "البوابة",
    originalPrice: "السعر الأصلي",
    refundAmount: "مبلغ الاسترداد",
    free: "مجاني",
    history: "سجل الاشتراكات",
    historyDesc: "سجلات الاشتراك السابقة لهذا المستأجر",
    timeRemaining: "{{time}} متبقي",
    onExpiryFallback: "↓ احتياطي",
    onExpirySuspend: "⏸ إيقاف",
    loadError: "فشل تحميل تفاصيل الاشتراك.",
    downgradedFrom: "من {{edition}}",
    downgradedFromType: "من {{edition}} ({{type}})",
  },
  entitlements: {
    promotions: {
      promoCode: "رمز الترويج",
    },
  },
} as const;
