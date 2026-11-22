import type {
  BreakdownItem,
  ExecutiveInsightItem,
  MonthlyFinancialPoint,
  SupportingDocumentItem,
} from "../types";

export const FINANCIAL_KPIS = {
  totalRevenueEgp: 4_850_000,
  totalExpensesEgp: 3_720_000,
  operatingSurplusEgp: 1_130_000,
  outstandingReceivablesEgp: 740_000,
  revenueFormattedEn: "EGP 4.85M",
  revenueFormattedAr: "4.85 مليون ج.م",
  expensesFormattedEn: "EGP 3.72M",
  expensesFormattedAr: "3.72 مليون ج.م",
  surplusFormattedEn: "EGP 1.13M",
  surplusFormattedAr: "1.13 مليون ج.م",
  receivablesFormattedEn: "EGP 740K",
  receivablesFormattedAr: "740 ألف ج.م",
  revenueGrowthPct: 12.3,
  expenseGrowthPct: 4.8,
  operatingMarginPct: 23.3,
} as const;

/**
 * Reconciled monthly series:
 * Revenue:  1.48 + 1.62 + 1.75 = 4.85M
 * Expenses: 1.18 + 1.24 + 1.30 = 3.72M
 * Surplus:  0.30 + 0.38 + 0.45 = 1.13M
 */
export const MONTHLY_FINANCIAL_SERIES: MonthlyFinancialPoint[] = [
  {
    id: "jul",
    monthEn: "Jul 2026",
    monthAr: "يوليو 2026",
    revenueM: 1.48,
    expensesM: 1.18,
    surplusM: 0.3,
  },
  {
    id: "aug",
    monthEn: "Aug 2026",
    monthAr: "أغسطس 2026",
    revenueM: 1.62,
    expensesM: 1.24,
    surplusM: 0.38,
  },
  {
    id: "sep",
    monthEn: "Sep 2026",
    monthAr: "سبتمبر 2026",
    revenueM: 1.75,
    expensesM: 1.3,
    surplusM: 0.45,
  },
];

/**
 * Reconciled Revenue by Business Unit:
 * 1.80M + 1.15M + 1.55M + 0.35M = 4.85M (100.0%)
 */
export const REVENUE_BY_UNIT: BreakdownItem[] = [
  {
    id: "football-academies",
    labelKey: "financial.unitFootball",
    amountEgp: 1_800_000,
    formattedAmountEn: "EGP 1.80M",
    formattedAmountAr: "1.80 مليون ج.م",
    sharePercent: 37.1,
    chartSlot: 1,
  },
  {
    id: "venue-bookings",
    labelKey: "financial.unitVenues",
    amountEgp: 1_550_000,
    formattedAmountEn: "EGP 1.55M",
    formattedAmountAr: "1.55 مليون ج.م",
    sharePercent: 32.0,
    chartSlot: 2,
  },
  {
    id: "other-academies",
    labelKey: "financial.unitOtherSports",
    amountEgp: 1_150_000,
    formattedAmountEn: "EGP 1.15M",
    formattedAmountAr: "1.15 مليون ج.م",
    sharePercent: 23.7,
    chartSlot: 3,
  },
  {
    id: "other-revenue",
    labelKey: "financial.unitOtherRev",
    amountEgp: 350_000,
    formattedAmountEn: "EGP 350K",
    formattedAmountAr: "350 ألف ج.م",
    sharePercent: 7.2,
    chartSlot: 8,
  },
];

/**
 * Reconciled Expense Breakdown:
 * 1.85M + 0.92M + 0.60M + 0.35M = 3.72M (49.7% + 24.7% + 16.1% + 9.4% ≈ 100%)
 */
export const EXPENSE_BREAKDOWN: BreakdownItem[] = [
  {
    id: "payroll",
    labelKey: "financial.expPayroll",
    amountEgp: 1_850_000,
    formattedAmountEn: "EGP 1.85M",
    formattedAmountAr: "1.85 مليون ج.م",
    sharePercent: 49.7,
    chartSlot: 5,
  },
  {
    id: "facility-costs",
    labelKey: "financial.expFacility",
    amountEgp: 920_000,
    formattedAmountEn: "EGP 920K",
    formattedAmountAr: "920 ألف ج.م",
    sharePercent: 24.7,
    chartSlot: 3,
  },
  {
    id: "operations",
    labelKey: "financial.expOperations",
    amountEgp: 600_000,
    formattedAmountEn: "EGP 600K",
    formattedAmountAr: "600 ألف ج.م",
    sharePercent: 16.1,
    chartSlot: 1,
  },
  {
    id: "other-expenses",
    labelKey: "financial.expOther",
    amountEgp: 350_000,
    formattedAmountEn: "EGP 350K",
    formattedAmountAr: "350 ألف ج.م",
    sharePercent: 9.4,
    chartSlot: 8,
  },
];

export const EXECUTIVE_INSIGHTS: ExecutiveInsightItem[] = [
  {
    id: "insight-growth",
    tone: "success",
    titleKey: "financial.insight1Title",
    summaryKey: "financial.insight1Summary",
    metricBadge: "+12.3% QoQ",
  },
  {
    id: "insight-payroll-share",
    tone: "info",
    titleKey: "financial.insight2Title",
    summaryKey: "financial.insight2Summary",
    metricBadge: "49.7%",
  },
  {
    id: "insight-receivables",
    tone: "warning",
    titleKey: "financial.insight3Title",
    summaryKey: "financial.insight3Summary",
    metricBadge: "EGP 740K",
  },
  {
    id: "insight-payroll-reconcile",
    tone: "warning",
    titleKey: "financial.insight4Title",
    summaryKey: "financial.insight4Summary",
    metricBadge: "EGP 18.4K",
  },
];

export const DATA_SOURCES_SCOPE = [
  {
    id: "src-football",
    nameKey: "financial.source1Name",
    branchesKey: "financial.source1Branches",
    volumeKey: "financial.source1Vol",
    contributionEn: "EGP 1.80M",
    contributionAr: "1.80 مليون ج.م",
  },
  {
    id: "src-other-sports",
    nameKey: "financial.source2Name",
    branchesKey: "financial.source2Branches",
    volumeKey: "financial.source2Vol",
    contributionEn: "EGP 1.15M",
    contributionAr: "1.15 مليون ج.م",
  },
  {
    id: "src-venues",
    nameKey: "financial.source3Name",
    branchesKey: "financial.source3Branches",
    volumeKey: "financial.source3Vol",
    contributionEn: "EGP 1.55M",
    contributionAr: "1.55 مليون ج.م",
  },
  {
    id: "src-payroll-ops",
    nameKey: "financial.source4Name",
    branchesKey: "financial.source4Branches",
    volumeKey: "financial.source4Vol",
    contributionEn: "EGP 3.72M (Exp)",
    contributionAr: "3.72 مليون ج.م (مصروفات)",
  },
] as const;

export const SUPPORTING_DOCUMENTS: SupportingDocumentItem[] = [
  {
    id: "doc-invoices",
    code: "INV-Q3-2026-REG",
    categoryKey: "financial.docCategoryInvoices",
    titleKey: "financial.docInvTitle",
    fileName: "q3-2026-invoices-register.demo",
    dateRange: "01 Jul – 30 Sep 2026",
    recordCount: "412",
    amountSummaryEn: "EGP 4.85M Billed (EGP 740K Open)",
    amountSummaryAr: "4.85 مليون ج.م مفوتر (740 ألف ج.م مستحق)",
    status: "verified",
    previewSummaryKey: "financial.receivablesNote",
    previewLines: [
      { labelKey: "financial.unitFootball", valueEn: "EGP 1.80M", valueAr: "1.80 مليون ج.م" },
      { labelKey: "financial.unitVenues", valueEn: "EGP 1.55M", valueAr: "1.55 مليون ج.م" },
      { labelKey: "financial.unitOtherSports", valueEn: "EGP 1.15M", valueAr: "1.15 مليون ج.م" },
      { labelKey: "financial.unitOtherRev", valueEn: "EGP 350K", valueAr: "350 ألف ج.م" },
    ],
  },
  {
    id: "doc-receipts",
    code: "RCPT-Q3-2026-POS",
    categoryKey: "financial.docCategoryReceipts",
    titleKey: "financial.docRcptTitle",
    fileName: "q3-2026-payment-receipts.demo",
    dateRange: "01 Jul – 30 Sep 2026",
    recordCount: "1,284",
    amountSummaryEn: "EGP 4.11M Collected",
    amountSummaryAr: "4.11 مليون ج.م محصّل",
    status: "verified",
    previewSummaryKey: "financial.kpiRevenueSub",
    previewLines: [
      { labelKey: "financial.unitFootball", valueEn: "EGP 1.58M settled", valueAr: "1.58 مليون ج.م مسدد" },
      { labelKey: "financial.unitVenues", valueEn: "EGP 1.31M settled", valueAr: "1.31 مليون ج.م مسدد" },
      { labelKey: "financial.unitOtherSports", valueEn: "EGP 940K settled", valueAr: "940 ألف ج.م مسدد" },
      { labelKey: "financial.unitOtherRev", valueEn: "EGP 280K settled", valueAr: "280 ألف ج.م مسدد" },
    ],
  },
  {
    id: "doc-bank",
    code: "BANK-REC-Q3-2026",
    categoryKey: "financial.docCategoryBank",
    titleKey: "financial.docBankTitle",
    fileName: "q3-2026-bank-reconciliation.demo",
    dateRange: "30 Sep 2026 Close",
    recordCount: "3 Branches",
    amountSummaryEn: "EGP 1.13M Net Operating Cash Delta",
    amountSummaryAr: "1.13 مليون ج.م صافي الفائض التشغيلي",
    status: "verified",
    previewSummaryKey: "financial.kpiSurplusSub",
    previewLines: [
      { labelKey: "financial.kpiRevenue", valueEn: "EGP 4.85M", valueAr: "4.85 مليون ج.م" },
      { labelKey: "financial.kpiExpenses", valueEn: "EGP 3.72M", valueAr: "3.72 مليون ج.م" },
      { labelKey: "financial.kpiSurplus", valueEn: "EGP 1.13M", valueAr: "1.13 مليون ج.م" },
    ],
  },
  {
    id: "doc-payroll",
    code: "PAYROLL-AGG-Q3-2026",
    categoryKey: "financial.docCategoryPayroll",
    titleKey: "financial.docPayrollTitle",
    fileName: "q3-2026-aggregate-payroll.demo",
    dateRange: "Jul – Sep 2026",
    recordCount: "4 Cost Centers",
    amountSummaryEn: "EGP 1.85M Aggregate (1 Variance Flagged)",
    amountSummaryAr: "1.85 مليون ج.م إجمالي (فرق واحد للمراجعة)",
    status: "review",
    privacyMasked: true,
    previewSummaryKey: "financial.privacyBody",
    previewLines: [
      { labelKey: "financial.unitFootball", valueEn: "EGP 780K (Agg)", valueAr: "780 ألف ج.م (إجمالي)" },
      { labelKey: "financial.unitOtherSports", valueEn: "EGP 490K (Agg)", valueAr: "490 ألف ج.م (إجمالي)" },
      { labelKey: "financial.unitVenues", valueEn: "EGP 360K (Agg)", valueAr: "360 ألف ج.م (إجمالي)" },
      { labelKey: "financial.expOperations", valueEn: "EGP 220K (1 variance: 18.4K)", valueAr: "220 ألف ج.م (فرق: 18.4 ألف)" },
    ],
  },
  {
    id: "doc-expenses",
    code: "EXP-VOUCH-Q3-2026",
    categoryKey: "financial.docCategoryExpenses",
    titleKey: "financial.docExpTitle",
    fileName: "q3-2026-expense-vouchers.demo",
    dateRange: "01 Jul – 30 Sep 2026",
    recordCount: "189",
    amountSummaryEn: "EGP 1.87M Non-Payroll Expenses",
    amountSummaryAr: "1.87 مليون ج.م مصروفات غير الرواتب",
    status: "verified",
    previewSummaryKey: "financial.chartExpensesDesc",
    previewLines: [
      { labelKey: "financial.expFacility", valueEn: "EGP 920K", valueAr: "920 ألف ج.م" },
      { labelKey: "financial.expOperations", valueEn: "EGP 600K", valueAr: "600 ألف ج.م" },
      { labelKey: "financial.expOther", valueEn: "EGP 350K", valueAr: "350 ألف ج.م" },
    ],
  },
];
