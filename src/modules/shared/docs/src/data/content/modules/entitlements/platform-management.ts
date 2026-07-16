import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ─────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.platformManagement.intro" },

  // ─── What Is Platform Management ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.whatIsIntro" },

  // ─── QuotaCounter Entity ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.quotaTitle",
    id: "quota-counter",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.quotaIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["TenantId", "Guid", "The tenant this counter belongs to."],
      [
        "ResourceType",
        "string (max 50)",
        'Resource being tracked: "admin", "role", "subtenant", "usergroup".',
      ],
      ["Used", "int", "Number of confirmed resources (actual count after commit)."],
      [
        "Reserved",
        "int",
        "Number of in-flight reservations (being created but not yet committed).",
      ],
      ["Max", "int", "Maximum allowed for this tenant. -1 = unlimited."],
      [
        "PoolRootTenantId",
        "Guid?",
        "Links to the root tenant of a pooled quota. Null = no pooling (per-tenant limit only). When set, the SUM of (Used + Reserved) across all counters sharing this root must not exceed PoolMax.",
      ],
      [
        "PoolMax",
        "int",
        "Maximum for the entire pool. Only meaningful on the root counter row. -1 = unlimited.",
      ],
    ],
  },

  // ─── Reservation Pattern ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.reservationTitle",
    id: "reservation-pattern",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.reservationIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "TryReserveSlotAsync — increment Reserved", type: "primary" },
      { id: "B", label: "Create resource (e.g. new Admin)", type: "default" },
      { id: "C", label: "Commit — increment Used, decrement Reserved", type: "success" },
      { id: "D", label: "Release on failure — decrement Reserved", type: "warning" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C", label: "success" },
      { from: "B", to: "D", label: "failure" },
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.platformManagement.reservationNote",
  },

  // ─── Pooled Quotas ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.pooledTitle",
    id: "pooled-quotas",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.pooledIntro" },
  {
    type: "table",
    headers: ["Mode", "Enforcement"],
    rows: [
      [
        "Per-Tenant (PoolRootTenantId = null)",
        "Each tenant is enforced independently: (Used + Reserved) < Max.",
      ],
      [
        "Pooled (PoolRootTenantId set)",
        "SUM(Used + Reserved) across all rows sharing the same PoolRootTenantId must not exceed PoolMax (stored on the root's counter row).",
      ],
    ],
  },

  // ─── TrialSnapshot Entity ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.trialSnapshotTitle",
    id: "trial-snapshot",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.trialSnapshotIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["SubscriptionId", "Guid", "FK to the TenantSubscription this snapshot belongs to."],
      ["TenantId", "Guid", "The tenant this snapshot is for."],
      ["AdminCount", "int", "Number of admins at trial start."],
      ["RoleCount", "int", "Number of roles at trial start."],
      ["SubTenantCount", "int", "Number of sub-tenants at trial start."],
      ["UserGroupCount", "int", "Number of user groups at trial start."],
      ["CapturedAt", "DateTime", "UTC timestamp when the snapshot was captured."],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.platformManagement.trialSnapshotTip",
  },

  // ─── CommissionLedgerEntry ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.ledgerEntryTitle",
    id: "commission-ledger-entry",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.ledgerEntryIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["TenantId", "Guid", "The tenant whose user made the payment."],
      ["UserSubscriptionId", "Guid", "The UserSubscription that generated this commission."],
      ["PaymentTransactionId", "Guid?", "FK to the PaymentTransaction for this user payment."],
      [
        "CommissionInvoiceId",
        "Guid?",
        "FK to CommissionInvoice once invoiced. Null while Unbilled.",
      ],
      [
        "Gateway",
        "PaymentGatewayType",
        "Which gateway processed the payment (PayPal or Paymob). Not used for Stripe Connect — those use application_fee_amount directly.",
      ],
      [
        "GatewayTransactionId",
        "string (max 255)",
        "Gateway-specific transaction ID for reconciliation and deduplication.",
      ],
      [
        "GrossAmount",
        "decimal (18,2)",
        "Full amount paid by the user (arrived in the tenant's account).",
      ],
      [
        "CommissionRate",
        "decimal (5,4)",
        "Commission rate applied at the time of payment (e.g. 0.10 = 10%).",
      ],
      ["CommissionAmount", "decimal (18,2)", "Platform commission = GrossAmount × CommissionRate."],
      [
        "Currency",
        "Currency enum",
        "ISO 4217 currency code. Should match the tenant's billing currency.",
      ],
      [
        "Status",
        "CommissionLedgerStatus",
        "Lifecycle: Unbilled → Invoiced → Paid / Waived / WriteOff.",
      ],
      [
        "Notes",
        "string? (max 1000)",
        "Admin notes — used when waiving or writing off a commission.",
      ],
    ],
  },

  // ─── Revenue Analytics ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.revenueTitle",
    id: "revenue-analytics-integration",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.revenueIntro" },
  {
    type: "table",
    headers: ["Metric", "Source"],
    rows: [
      [
        "Total commission collected",
        "SUM(CommissionLedgerEntry.CommissionAmount) WHERE Status = Paid",
      ],
      [
        "Unbilled commission exposure",
        "SUM(CommissionLedgerEntry.CommissionAmount) WHERE Status = Unbilled",
      ],
      ["Tenant payout totals", "TenantStripeAccount.TotalPayoutsAmount"],
      ["Trial resource usage", "TrialSnapshot compared to current QuotaCounter.Used at expiry"],
    ],
  },

  // ─── API Endpoints ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.platformManagement.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.platformManagement.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/platform/quotas",
        descriptionKey: "modules.platformManagement.ep.quotaList",
        auth: "JWT",
        permission: "platform.view",
      },
      {
        method: "GET",
        path: "/api/v1/platform/quotas/{tenantId}/{resourceType}",
        descriptionKey: "modules.platformManagement.ep.quotaGet",
        auth: "JWT",
        permission: "platform.view",
      },
      {
        method: "POST",
        path: "/api/v1/platform/quotas/reset",
        descriptionKey: "modules.platformManagement.ep.quotaReset",
        auth: "JWT",
        permission: "platform.manage",
      },
      {
        method: "GET",
        path: "/api/v1/platform/trial-snapshots/{subscriptionId}",
        descriptionKey: "modules.platformManagement.ep.trialSnapshot",
        auth: "JWT",
        permission: "platform.view",
      },
      {
        method: "GET",
        path: "/api/v1/platform/commission-ledger",
        descriptionKey: "modules.platformManagement.ep.ledger",
        auth: "JWT",
        permission: "platform.view",
      },
      {
        method: "PUT",
        path: "/api/v1/platform/commission-ledger/{id}/waive",
        descriptionKey: "modules.platformManagement.ep.waive",
        auth: "JWT",
        permission: "platform.manage",
      },
      {
        method: "GET",
        path: "/api/v1/platform/dashboard",
        descriptionKey: "modules.platformManagement.ep.dashboard",
        auth: "JWT",
        permission: "platform.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/platform-management",
  titleKey: "modules.platformManagement.title",
  descriptionKey: "modules.platformManagement.description",
  category: "modules",
  order: 16,
  sections,
  relatedSlugs: [
    "modules/stripe-connect",
    "modules/subscriptions",
    "modules/revenue-analytics",
    "modules/entitlements-overview",
  ],
  lastUpdated: "2026-06-29",
});
