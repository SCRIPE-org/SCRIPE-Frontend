/**
 * W4-2 — subscriptions overview dashboard.
 *
 * `dashboard.kpi.*` is a namespace shared with the monitoring dashboard
 * module; most of the KPI copy this view needs (totalMrr, totalRevenue,
 * totalRefunded, netRevenue, active/trialDesc, suspended/canceledCount+Desc)
 * already ships from there and is merged in ahead of this shard, so it is not
 * repeated here. The four keys below (arpu, churnRate, renewals,
 * promoDiscount + their Desc pairs) are subscriptions-only metrics that
 * previously resolved to auto-generated placeholder copy (English titles of
 * their own key names, Arabic literally marked "missing") — this shard is the
 * first real copy either language has had for them.
 */
export const en = {
  entSubscriptions: {
    searchPlaceholder: "Search by tenant or edition...",
  },
  common: {
    type: "Type",
  },
  dashboard: {
    kpi: {
      arpu: "ARPU",
      arpuDesc: "Avg. revenue per paying user",
      churnRate: "Churn Rate",
      churnRateDesc: "30-day rolling churn",
      renewals: "Upcoming Renewals",
      renewalsDesc: "Within 30 days",
      promoDiscount: "Active Discounts",
      promoDiscountDesc: "Total promotional savings",
    },
  },
} as const;

export const ar = {
  entSubscriptions: {
    searchPlaceholder: "ابحث حسب المستأجر أو الإصدار...",
  },
  common: {
    type: "النوع",
  },
  dashboard: {
    kpi: {
      arpu: "متوسط الإيراد لكل مستخدم",
      arpuDesc: "متوسط الإيراد لكل مستخدم مدفوع",
      churnRate: "معدل التراجع",
      churnRateDesc: "معدل التراجع المتجدد خلال 30 يوماً",
      renewals: "التجديدات القادمة",
      renewalsDesc: "خلال 30 يوماً",
      promoDiscount: "الخصومات الفعالة",
      promoDiscountDesc: "إجمالي التوفير من العروض الترويجية",
    },
  },
} as const;
