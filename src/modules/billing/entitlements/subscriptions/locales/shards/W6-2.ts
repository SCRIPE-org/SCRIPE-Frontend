/**
 * W6-2 — subscription action dialogs (assign/change/cancel/suspend/convert,
 * checkout, gateway selection, currency change).
 *
 * These call sites were reading several `entSubscriptions.*` /
 * `entitlements.promotions.*` keys through `t(key) || "<hardcoded English>"`.
 * Most of those keys already carried real copy in both languages and only
 * needed the fallback dropped, but a few had never been given real content —
 * the base dictionary held either an auto-generated echo of the key's own
 * name (e.g. `downgradeOverflowDetail: "Downgrade Overflow Detail"`, with no
 * `{{current}}`/`{{limit}}`/`{{excess}}` interpolation even though every call
 * site passes those params) or, in Arabic, the literal "[مفقود]" ("missing")
 * placeholder the base file uses to flag an absent translation. Removing the
 * inline fallback on those would have silently swapped real information for
 * a static label, so this shard overrides just those keys with real,
 * parameterised copy in both languages instead.
 */
export const en = {
  entSubscriptions: {
    downgradeWarningDesc: "Switching to this edition will exceed the following resource limits:",
    downgradeOverflowDetail: "Current: {{current}} / New limit: {{limit}} ({{excess}} excess)",
    customAmountPlaceholder: "e.g., 50.00",
    customAmountHint:
      "If empty, the system auto-calculates based on remaining subscription time.",
  },
  entitlements: {
    promotions: {
      noPromotionsAvailable: "No promotions available for this plan",
      selectPromotion: "Select promotion",
      enterCode: "Enter the promo code",
    },
  },
  billing: {
    dialogs: {
      qrCodeAlt: "Payment QR code",
    },
  },
} as const;

export const ar = {
  entSubscriptions: {
    downgradeWarningDesc: "التبديل إلى هذا الإصدار سيتجاوز حدود الموارد التالية:",
    downgradeOverflowDetail: "الحالي: {{current}} / الحد الجديد: {{limit}} (زيادة {{excess}})",
    customAmountPlaceholder: "مثال: 50.00",
    customAmountHint:
      "إذا تُرك فارغاً، سيقوم النظام بحساب المبلغ تلقائياً بناءً على الوقت المتبقي من الاشتراك.",
  },
  entitlements: {
    promotions: {
      noPromotionsAvailable: "لا توجد عروض ترويجية متاحة لهذه الخطة",
      selectPromotion: "اختر عرضاً ترويجياً",
      enterCode: "أدخل رمز الترويج",
    },
  },
  billing: {
    dialogs: {
      qrCodeAlt: "رمز الاستجابة السريعة للدفع",
    },
  },
} as const;
