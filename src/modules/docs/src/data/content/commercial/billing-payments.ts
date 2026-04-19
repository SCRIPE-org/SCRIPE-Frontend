import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "feature-grid",
    columns: 3,
    items: [
      { icon: "💳", titleKey: "Self-Service Checkout", descriptionKey: "Tenants subscribe and pay instantly via Stripe-hosted checkout — no manual invoice steps." },
      { icon: "📄", titleKey: "Automated Invoicing", descriptionKey: "Every payment generates a numbered, downloadable invoice with line items and tax detail." },
      { icon: "🔁", titleKey: "Smart Dunning", descriptionKey: "4-stage failed payment recovery with graduated emails, grace periods, and auto-fallback." },
      { icon: "📊", titleKey: "Revenue Dashboard", descriptionKey: "Real-time MRR, ARR, churn rate, and platform health score from your billing data." },
      { icon: "🌍", titleKey: "Multi-Currency", descriptionKey: "28 Stripe-supported currencies with zero-decimal and 3-decimal handling built in." },
      { icon: "🔗", titleKey: "Payment Links", descriptionKey: "Enterprise sales? Generate Stripe Payment Links for custom deals without a checkout session." },
    ],
  },
  {
    type: "heading", level: 2,
    titleKey: "Three Checkout Modes",
    id: "checkout-modes",
  },
  {
    type: "table",
    headers: ["Mode", "Best For", "How It Works"],
    rows: [
      ["Self-Service", "Standard SaaS subscriptions", "Tenant clicks 'Subscribe', pays via Stripe Checkout, subscription activates automatically."],
      ["Contact Sales", "Enterprise/custom pricing", "Admin generates a Stripe Payment Link and sends it to the client. Same automatic activation on payment."],
      ["Manual Assignment", "Free tiers, partnerships, trials", "Admin assigns the plan directly — no payment required. Instant activation."],
    ],
  },
  {
    type: "heading", level: 2,
    titleKey: "Automated Invoice Management",
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
    type: "heading", level: 2,
    titleKey: "4-Stage Dunning Recovery",
    id: "dunning",
  },
  {
    type: "table",
    headers: ["Stage", "Timing", "Action"],
    rows: [
      ["Stage 1: Payment Failed", "Day 0", "Immediate email with link to update payment method"],
      ["Stage 2: Grace Warning", "Mid grace period", "Follow-up email, yellow warning banner in portal"],
      ["Stage 3: Final Warning", "≤2 days before suspension", "Urgent email with red banner"],
      ["Stage 4: Suspend", "Grace period expires", "Access restricted, admins deactivated, auto-fallback to free tier"],
    ],
  },
  {
    type: "heading", level: 2,
    titleKey: "Revenue Analytics",
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
    type: "heading", level: 2,
    titleKey: "Export Options",
    id: "export",
  },
  {
    type: "list",
    variant: "unordered",
    items: ["CSV — importable into any spreadsheet or BI tool", "Excel (XLSX) — styled workbook with conditional formatting and multiple sheets", "PDF — branded print-ready report with cover page and data tables"],
  },
];

registerPage({
  slug: "commercial/billing-payments",
  titleKey: "Billing & Payments",
  descriptionKey: "Stripe-powered billing with self-service checkout, automated invoicing, 4-stage dunning, multi-currency support, and revenue analytics.",
  category: "commercial-modules",
  order: 20,
  sections,
  relatedSlugs: ["commercial/entitlements-overview", "commercial/entitlements-subscriptions"],
  lastUpdated: "2026-04-18",
});
