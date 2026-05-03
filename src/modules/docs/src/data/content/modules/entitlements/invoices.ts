import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.invoices.intro" },

  // ─── Invoice Entity ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.invoiceEntityTitle",
    id: "invoice-entity",
  },
  { type: "paragraph", contentKey: "modules.invoices.invoiceEntityIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["TenantId", "Guid", "Tenant this invoice belongs to"],
      ["SubscriptionId", "Guid?", "Linked TenantSubscription (nullable for manual invoices)"],
      ["InvoiceNumber", "string", "Auto-incremented: INV-YYYY-NNNNN"],
      ["Currency", "Currency", "ISO currency code (USD, EUR, SAR, etc.)"],
      ["SubTotal", "decimal(18,2)", "Pre-discount amount"],
      ["DiscountAmount", "decimal(18,2)", "Promotion discount applied"],
      ["TaxAmount", "decimal(18,2)", "Tax charged (if applicable)"],
      ["Total", "decimal(18,2)", "Final amount billed"],
      ["ExchangeRateToUsd", "decimal(18,6)", "Exchange rate at billing time"],
      ["TotalAmountUsd", "decimal(18,2)", "Total normalized to USD"],
      ["Status", "InvoiceStatus", "Draft | Pending | Paid | Void | Refunded"],
      ["DueDate", "DateTime", "Payment due date"],
      ["PaidAt", "DateTime?", "When the invoice was paid"],
      ["StripeInvoiceId", "string?", "Stripe invoice ID for idempotency"],
      ["PdfUrl", "string?", "Generated PDF file path"],
      ["Notes", "string?", "Optional admin notes"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.invoices.invoiceFieldsNote",
  },

  // ─── Invoice Line Items ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.lineItemTitle",
    id: "line-items",
  },
  { type: "paragraph", contentKey: "modules.invoices.lineItemIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Description", "string", "Human-readable line item label"],
      ["Quantity", "int", "Number of units (usually 1)"],
      ["UnitPrice", "decimal(18,2)", "Price per unit"],
      ["Total", "decimal(18,2)", "Quantity × UnitPrice"],
      ["Type", "LineItemType", "Subscription | Discount | Tax | Adjustment"],
    ],
  },

  // ─── PaymentTransaction ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.transactionTitle",
    id: "payment-transaction",
  },
  { type: "paragraph", contentKey: "modules.invoices.transactionIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["InvoiceId", "Guid", "Linked invoice"],
      ["TenantId", "Guid", "Tenant that was charged"],
      ["Gateway", "PaymentGateway", "Stripe | PayPal | Paymob | Manual"],
      ["GatewayTransactionId", "string", "Stripe Payment Intent ID or Charge ID"],
      ["Amount", "decimal(18,2)", "Amount charged"],
      ["Currency", "Currency", "Currency of the charge"],
      ["Status", "TransactionStatus", "Pending | Succeeded | Failed | Refunded"],
      ["FailureReason", "string?", "Gateway failure message"],
      ["GatewayResponse", "string?", "Full JSON response (for debugging)"],
      ["ProcessedAt", "DateTime?", "When the payment was processed"],
      ["RefundedAt", "DateTime?", "When the refund was processed"],
    ],
  },

  // ─── Invoice Status Lifecycle ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.statusTitle",
    id: "status-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.invoices.statusIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "draft", label: "Draft", type: "default" },
      { id: "pending", label: "Pending", type: "warning" },
      { id: "paid", label: "Paid", type: "success" },
      { id: "void", label: "Void", type: "danger" },
      { id: "refunded", label: "Refunded", type: "danger" },
    ],
    connections: [
      { from: "draft", to: "pending", label: "issued" },
      { from: "pending", to: "paid", label: "payment succeeds" },
      { from: "pending", to: "void", label: "cancelled" },
      { from: "paid", to: "refunded", label: "charge.refunded" },
    ],
  },

  // ─── Invoice Numbering ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.numberingTitle",
    id: "numbering",
  },
  { type: "paragraph", contentKey: "modules.invoices.numberingIntro" },

  // ─── Revenue Dashboard ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.dashboardTitle",
    id: "revenue-dashboard",
  },
  { type: "paragraph", contentKey: "modules.invoices.dashboardIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "modules.invoices.metricsTitle",
    id: "dashboard-kpis",
  },
  { type: "paragraph", contentKey: "modules.invoices.metricsIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "modules.invoices.metric1",
      "modules.invoices.metric2",
      "modules.invoices.metric3",
      "modules.invoices.metric4",
      "modules.invoices.metric5",
      "modules.invoices.metric6",
      "modules.invoices.metric7",
      "modules.invoices.metric8",
    ],
  },

  // ─── Multi-Currency ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.currencyTitle",
    id: "multi-currency",
  },
  { type: "paragraph", contentKey: "modules.invoices.currencyIntro" },
  {
    type: "table",
    headers: ["Currency Group", "Examples", "Stripe Handling"],
    rows: [
      ["Standard (×100 to cents)", "USD, EUR, GBP, SAR, AED, EGP", "Amount multiplied by 100"],
      ["Zero-decimal", "JPY, KWD, BHD", "Amount passed as-is"],
      ["3-decimal", "OMR, TND", "Amount multiplied by 1000"],
    ],
  },

  // ─── Export Formats ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.exportTitle",
    id: "export-formats",
  },
  { type: "paragraph", contentKey: "modules.invoices.exportIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "modules.invoices.exportCsv",
      "modules.invoices.exportExcel",
      "modules.invoices.exportPdf",
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.invoices.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.invoices.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/invoices",
        descriptionKey: "modules.invoices.ep.list",
        auth: "JWT",
        permission: "billing.view",
      },
      {
        method: "GET",
        path: "/api/v1/invoices/{id}",
        descriptionKey: "modules.invoices.ep.get",
        auth: "JWT",
        permission: "billing.view",
      },
      {
        method: "GET",
        path: "/api/v1/invoices/{id}/pdf",
        descriptionKey: "modules.invoices.ep.pdf",
        auth: "JWT",
        permission: "billing.view",
      },
      {
        method: "GET",
        path: "/api/v1/billing/dashboard",
        descriptionKey: "modules.invoices.ep.dashboard",
        auth: "JWT",
        permission: "billing.view",
      },
      {
        method: "GET",
        path: "/api/v1/subscriptions/export",
        descriptionKey: "modules.invoices.ep.export",
        auth: "JWT",
        permission: "billing.export",
      },
    ],
  },
];

registerPage({
  slug: "modules/invoices",
  titleKey: "modules.invoices.title",
  descriptionKey: "modules.invoices.description",
  category: "modules",
  order: 7,
  sections,
  relatedSlugs: ["modules/billing-engine", "modules/dunning", "modules/subscriptions"],
  lastUpdated: "2026-04-18",
});
