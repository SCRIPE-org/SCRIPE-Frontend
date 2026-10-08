import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.finance.invoices.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.finance.invoices.infoTitle",
    contentKey: "modules.finance.invoices.infoContent",
  },

  // ─── Customer Invoice Lifecycle ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.invoices.lifecycleTitle",
    id: "invoice-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.finance.invoices.lifecycleDesc" },

  // ─── Payment Allocation & Partial Settlements ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.invoices.allocationTitle",
    id: "payment-allocation",
  },
  { type: "paragraph", contentKey: "modules.finance.invoices.allocationDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.invoices.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/finance/customer-invoices",
        descriptionKey: "modules.finance.invoices.apiList",
        auth: "Bearer JWT",
        permission: "finance.invoices.view",
      },
      {
        method: "POST",
        path: "/api/v1/finance/recorded-payments",
        descriptionKey: "modules.finance.invoices.apiRecordPayment",
        auth: "Bearer JWT",
        permission: "finance.payments.create",
      },
    ],
  },
];

registerPage({
  slug: "modules/finance/invoices-payments",
  titleKey: "modules.finance.invoices.title",
  descriptionKey: "modules.finance.invoices.description",
  category: "module-finance",
  order: 3,
  sections,
  relatedSlugs: ["modules/finance-overview", "modules/finance/double-entry-ledger"],
  lastUpdated: "2026-10-03",
});
