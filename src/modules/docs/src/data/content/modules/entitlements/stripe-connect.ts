import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.stripeConnect.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.flowTitle",
    id: "stripe-connect-onboarding",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.flowIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "modules.stripeConnect.step1Title",
        contentKey: "modules.stripeConnect.step1Content",
      },
      {
        titleKey: "modules.stripeConnect.step2Title",
        contentKey: "modules.stripeConnect.step2Content",
      },
      {
        titleKey: "modules.stripeConnect.step3Title",
        contentKey: "modules.stripeConnect.step3Content",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.commissionTitle",
    id: "platform-commissions",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.commissionIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CommissionEntities.cs",
    code: `public class PlatformCommission : AuditableEntity
{
    public Guid TenantId { get; set; }
    public decimal Percentage { get; set; }
    public decimal FixedFee { get; set; }
    public string Currency { get; set; } = "USD";
    public bool IsActive { get; set; } = true;
}

public class CommissionLedgerEntry : AuditableEntity
{
    public Guid TenantId { get; set; }
    public decimal TransactionAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public string ReferenceType { get; set; } = string.Empty;
    public string ReferenceId { get; set; } = string.Empty;
    public LedgerStatus Status { get; set; } = LedgerStatus.Pending;
}

public class CommissionInvoice : AuditableEntity
{
    public Guid TenantId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime BillingPeriodStart { get; set; }
    public DateTime BillingPeriodEnd { get; set; }
    public CommissionInvoiceStatus Status { get; set; } = CommissionInvoiceStatus.Unpaid;
}`,
    highlightLines: [3, 11, 23],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.controllerTitle",
    id: "commission-controllers",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.controllerIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/stripe-connect/onboard",
        descriptionKey: "modules.stripeConnect.apiOnboard",
        auth: "AdminOnly",
        permission: "stripe_connect.onboard",
      },
      {
        method: "GET",
        path: "/api/v1/stripe-connect/account-status",
        descriptionKey: "modules.stripeConnect.apiAccountStatus",
        auth: "AdminOnly",
        permission: "stripe_connect.view",
      },
      {
        method: "GET",
        path: "/api/v1/commissions/dashboard",
        descriptionKey: "modules.stripeConnect.apiCommissionsDashboard",
        auth: "AdminOnly",
        permission: "commissions.view",
      },
      {
        method: "GET",
        path: "/api/v1/commissions/invoices",
        descriptionKey: "modules.stripeConnect.apiCommissionsInvoices",
        auth: "AdminOnly",
        permission: "commissions.view",
      },
      {
        method: "POST",
        path: "/api/v1/commissions/invoices/{id}/waive",
        descriptionKey: "modules.stripeConnect.apiWaiveInvoice",
        auth: "AdminOnly",
        permission: "commissions.waive",
      },
      {
        method: "POST",
        path: "/api/v1/commissions/invoices/{id}/retry",
        descriptionKey: "modules.stripeConnect.apiRetryCharge",
        auth: "AdminOnly",
        permission: "commissions.retry_charge",
      },
    ],
  },
];

registerPage({
  slug: "modules/stripe-connect",
  titleKey: "modules.stripeConnect.title",
  descriptionKey: "modules.stripeConnect.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: ["modules/entitlements-overview", "modules/billing-engine", "modules/invoices"],
  lastUpdated: "2026-06-04",
});
