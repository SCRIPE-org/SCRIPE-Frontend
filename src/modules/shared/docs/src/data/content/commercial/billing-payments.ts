import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "💳",
        titleKey: "commercial.billingPayments.selfServiceTitle",
        descriptionKey: "commercial.billingPayments.selfServiceDesc",
      },
      {
        icon: "📄",
        titleKey: "commercial.billingPayments.automatedInvoicingTitle",
        descriptionKey: "commercial.billingPayments.automatedInvoicingDesc",
      },
      {
        icon: "🔁",
        titleKey: "commercial.billingPayments.smartDunningTitle",
        descriptionKey: "commercial.billingPayments.smartDunningDesc",
      },
      {
        icon: "📊",
        titleKey: "commercial.billingPayments.revenueDashboardTitle",
        descriptionKey: "commercial.billingPayments.revenueDashboardDesc",
      },
      {
        icon: "🌍",
        titleKey: "commercial.billingPayments.multiCurrencyTitle",
        descriptionKey: "commercial.billingPayments.multiCurrencyDesc",
      },
      {
        icon: "🔗",
        titleKey: "commercial.billingPayments.paymentLinksTitle",
        descriptionKey: "commercial.billingPayments.paymentLinksDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.billingPayments.checkoutModesTitle",
    id: "checkout-modes",
  },
  {
    type: "table",
    headers: ["Mode", "Best For", "How It Works"],
    rows: [
      [
        "Self-Service",
        "Standard SaaS subscriptions",
        "Tenant clicks 'Subscribe', pays via Stripe Checkout, subscription activates automatically.",
      ],
      [
        "Contact Sales",
        "Enterprise/custom pricing",
        "Admin generates a Stripe Payment Link and sends it to the client. Same automatic activation on payment.",
      ],
      [
        "Manual Assignment",
        "Free tiers, partnerships, trials",
        "Admin assigns the plan directly — no payment required. Instant activation.",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.billingPayments.invoicingTitle",
    id: "invoicing",
  },
  {
    type: "table",
    headers: ["Invoice Status", "Meaning"],
    rows: [
      ["Draft", "Generated, not yet sent"],
      ["Pending", "Awaiting payment"],
      ["Paid", "Payment confirmed by Stripe"],
      ["Void", "Cancelled before payment"],
      ["Refunded", "Charge reversed"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.billingPayments.dunningTitle",
    id: "dunning",
  },
  {
    type: "table",
    headers: ["Stage", "Timing", "Action"],
    rows: [
      ["Stage 1: Payment Failed", "Day 0", "Immediate email with link to update payment method"],
      [
        "Stage 2: Grace Warning",
        "Mid grace period",
        "Follow-up email, yellow warning banner in portal",
      ],
      ["Stage 3: Final Warning", "≤2 days before suspension", "Urgent email with red banner"],
      [
        "Stage 4: Suspend",
        "Grace period expires",
        "Access restricted, admins deactivated, auto-fallback to free tier",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.billingPayments.revenueAnalyticsTitle",
    id: "analytics",
  },
  {
    type: "table",
    headers: ["Metric", "Description"],
    rows: [
      ["MRR", "Monthly Recurring Revenue — sum of all active monthly subscriptions"],
      ["ARR", "Annual Recurring Revenue — MRR × 12"],
      ["Total Revenue", "All-time cumulative paid invoices"],
      ["Churn Rate", "% subscriptions cancelled in the last 30 days"],
      ["Platform Health Score", "Composite score: MRR trend + churn + trial conversion"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.billingPayments.exportOptionsTitle",
    id: "export",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "CSV — importable into any spreadsheet or BI tool",
      "Excel (XLSX) — styled workbook with conditional formatting and multiple sheets",
      "PDF — branded print-ready report with cover page and data tables",
    ],
  },
];

registerPage({
  slug: "commercial/billing-payments",
  titleKey: "commercial.billingPayments.title",
  descriptionKey: "commercial.billingPayments.description",
  category: "commercial-modules",
  order: 20,
  sections,
  relatedSlugs: ["commercial/entitlements-overview", "commercial/entitlements-subscriptions"],
  lastUpdated: "2026-04-18",
});
