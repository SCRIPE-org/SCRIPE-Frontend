import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.finance.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.finance.overview.infoTitle",
    contentKey: "modules.finance.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.overview.archTitle",
    id: "finance-architecture",
  },
  { type: "paragraph", contentKey: "modules.finance.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "FileCheck",
        titleKey: "modules.finance.overview.featureInvoices",
        descriptionKey: "modules.finance.overview.featureInvoicesDesc",
      },
      {
        icon: "CreditCard",
        titleKey: "modules.finance.overview.featurePayments",
        descriptionKey: "modules.finance.overview.featurePaymentsDesc",
      },
      {
        icon: "PieChart",
        titleKey: "modules.finance.overview.featureAllocations",
        descriptionKey: "modules.finance.overview.featureAllocationsDesc",
      },
      {
        icon: "RotateCcw",
        titleKey: "modules.finance.overview.featureRefunds",
        descriptionKey: "modules.finance.overview.featureRefundsDesc",
      },
      {
        icon: "Sliders",
        titleKey: "modules.finance.overview.featureAdjustments",
        descriptionKey: "modules.finance.overview.featureAdjustmentsDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "modules.finance.overview.featureAudit",
        descriptionKey: "modules.finance.overview.featureAuditDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.finance.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Finance/Finance.Domain/Entities/CustomerInvoice.cs",
    code: `public sealed class CustomerInvoice : TenantAggregateRoot
{
    public string InvoiceNumber { get; private set; } = string.Empty;
    public Guid CustomerPartyId { get; private set; }
    public DateTimeOffset IssueDateUtc { get; private set; }
    public DateTimeOffset DueDateUtc { get; private set; }
    public InvoiceStatus Status { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public decimal BalanceRemaining => TotalAmount - PaidAmount;
    public string Currency { get; private set; } = "USD";
    public List<CustomerInvoiceLine> Lines { get; private set; } = new();

    public Result ApplyPaymentAllocation(decimal allocationAmount)
    {
        if (allocationAmount <= 0)
            return Result.Failure("Allocation amount must be greater than zero.");
        if (PaidAmount + allocationAmount > TotalAmount)
            return Result.Failure("Allocation exceeds remaining balance.");

        PaidAmount += allocationAmount;
        if (PaidAmount >= TotalAmount)
            Status = InvoiceStatus.Paid;
        else
            Status = InvoiceStatus.PartiallyPaid;

        RaiseDomainEvent(new InvoicePaymentAppliedDomainEvent(Id, TenantId, allocationAmount, BalanceRemaining));
        return Result.Success();
    }
}`,
  },

  // ─── Double-Entry Payment Allocation & Reconciliation Cycle ───────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.overview.flowTitle",
    id: "payment-reconciliation-cycle",
  },
  { type: "paragraph", contentKey: "modules.finance.overview.flowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      {
        id: "A",
        label: "Payment received via Payment Gateway, Bank Transfer, or POS",
        type: "default",
      },
      { id: "B", label: "Record Payment into Immutable RecordedPayment table", type: "primary" },
      {
        id: "C",
        label: "Retrieve Outstanding Customer Invoices ordered by Due Date (FIFO)",
        type: "info",
      },
      {
        id: "D",
        label: "Create Atomic PaymentAllocation record per targeted Invoice",
        type: "warning",
      },
      { id: "E", label: "Update Invoice Status (PartiallyPaid or Paid)", type: "success" },
      { id: "F", label: "Generate Cryptographically-Hashed Payment Receipt", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.finance.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/finance/customer-invoices",
        descriptionKey: "modules.finance.api.listInvoices",
        auth: "Bearer JWT",
        permission: "finance.invoices.view",
      },
      {
        method: "POST",
        path: "/api/v1/finance/customer-invoices",
        descriptionKey: "modules.finance.api.createInvoice",
        auth: "Bearer JWT",
        permission: "finance.invoices.create",
      },
      {
        method: "POST",
        path: "/api/v1/finance/customer-invoices/{id}/adjustments",
        descriptionKey: "modules.finance.api.createAdjustment",
        auth: "Bearer JWT",
        permission: "finance.invoices.update",
      },
      {
        method: "GET",
        path: "/api/v1/finance/payments",
        descriptionKey: "modules.finance.api.listPayments",
        auth: "Bearer JWT",
        permission: "finance.payments.view",
      },
      {
        method: "POST",
        path: "/api/v1/finance/payments/record",
        descriptionKey: "modules.finance.api.recordPayment",
        auth: "Bearer JWT",
        permission: "finance.payments.create",
      },
      {
        method: "POST",
        path: "/api/v1/finance/payments/{id}/allocate",
        descriptionKey: "modules.finance.api.allocatePayment",
        auth: "Bearer JWT",
        permission: "finance.payments.update",
      },
      {
        method: "POST",
        path: "/api/v1/finance/payments/{id}/refund",
        descriptionKey: "modules.finance.api.refundPayment",
        auth: "Bearer JWT",
        permission: "finance.payments.delete",
      },
    ],
  },
];

registerPage({
  slug: "modules/finance-overview",
  titleKey: "modules.finance.overview.title",
  descriptionKey: "modules.finance.overview.description",
  category: "modules",
  order: 2.3,
  sections,
  relatedSlugs: [
    "modules/catalog-pricing-overview",
    "modules/venue-overview",
    "modules/entitlements/billing-engine",
  ],
  lastUpdated: "2026-10-03",
});
