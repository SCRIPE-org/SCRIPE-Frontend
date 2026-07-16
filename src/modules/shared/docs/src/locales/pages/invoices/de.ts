/**
 * Exported constant defining parameters and fields for de configurations.
 */
export const de = {
  modules: {
    invoices: {
      title: "Invoices & Revenue",
      description:
        "Invoice entity lifecycle, PaymentTransaction tracking, revenue dashboard (MRR/ARR/Churn), multi-currency support, and export formats.",
      intro:
        "The invoicing system tracks every payment event as an immutable Invoice record with one or more InvoiceLineItems and a corresponding PaymentTransaction. Invoices are created automatically by the Stripe webhook handler on successful payments. The revenue dashboard aggregates invoice data into MRR, ARR, churn rate, and edition-level analytics.",
      invoiceEntityTitle: "Invoice Entity",
      invoiceEntityIntro:
        "An Invoice represents a billing event for a tenant. It is created by the Stripe webhook handler when a payment succeeds or a subscription renews.",
      invoiceFieldsNote:
        "StripeInvoiceId is used for idempotency — the webhook handler checks this field before creating a new invoice. InvoiceNumber follows the pattern INV-YYYY-NNNNN (auto-incremented per tenant).",
      lineItemTitle: "Invoice Line Items",
      lineItemIntro:
        "Each Invoice contains one or more InvoiceLineItems. A line item represents a single billable unit — typically the subscription price for a billing cycle, a promo discount, or a manual adjustment.",
      transactionTitle: "PaymentTransaction Entity",
      transactionIntro:
        "A PaymentTransaction records the raw payment event from the gateway. It is linked to an Invoice and captures the gateway-specific transaction ID, the exact amount charged, the currency, and the processing status.",
      statusTitle: "Invoice Status Lifecycle",
      statusIntro:
        "Invoices move through a linear lifecycle from creation to settlement or cancellation.",
      numberingTitle: "Invoice Numbering",
      numberingIntro:
        "Invoice numbers follow the pattern INV-YYYY-NNNNN. The sequence is maintained per-tenant using IgnoreQueryFilters() to ensure soft-deleted invoices are included in the sequence count, preventing gaps in numbering for audit purposes.",
      dashboardTitle: "Revenue Dashboard",
      dashboardIntro:
        "The billing dashboard aggregates invoice data into 8 key performance indicators. It is accessible at GET /api/v1/billing/dashboard and requires the billing.view permission.",
      metricsTitle: "Dashboard KPIs",
      metricsIntro:
        "The dashboard provides the following metrics, all computed from the Invoice and TenantSubscription tables:",
      metric1: "MRR (Monthly Recurring Revenue) — Sum of all active monthly subscriptions",
      metric2: "ARR (Annual Recurring Revenue) — MRR × 12",
      metric3: "Total Revenue — All-time sum of paid invoices",
      metric4: "Churn Rate — Percentage of subscriptions cancelled in the last 30 days",
      metric5: "Active Subscriptions — Count of currently active tenants",
      metric6: "Trial Subscriptions — Count of tenants in trial phase",
      metric7: "Cancelled This Month — Count of cancellations in current month",
      metric8:
        "Platform Health Score — Composite score based on MRR trend, churn, and trial conversion",
      currencyTitle: "Multi-Currency Support",
      currencyIntro:
        "SCRIPE supports 28 Stripe-supported currencies. Each Invoice stores the Currency (ISO code), SubTotal, DiscountAmount, TaxAmount, and Total in the original currency. ExchangeRateToUsd and TotalAmountUsd fields normalize amounts for consistent USD-based reporting across all currencies.",
      exportTitle: "Export Formats",
      exportIntro:
        "The subscription export system (GET /api/v1/subscriptions/export) generates comprehensive reports in three formats.",
      exportCsv: "CSV — Lightweight, importable into any spreadsheet or BI tool",
      exportExcel:
        "XLSX — Professional Excel workbook with styled headers, filter metadata sheet, conditional formatting, and auto-sized columns (ClosedXML)",
      exportPdf:
        "PDF — Print-ready document with branded cover page, statistical summary, and paginated data tables (QuestPDF)",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "Invoice endpoints are exposed through the InvoicesController and the BillingController:",
      ep: {
        list: "List invoices with pagination and filters (status, tenant, date range)",
        get: "Get invoice details including line items",
        pdf: "Download invoice as PDF",
        dashboard: "Get revenue dashboard (MRR, ARR, churn, trends)",
        export: "Export subscriptions as CSV, Excel, or PDF",
      },
    },
  },
};
