import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ─────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.stripeConnect.intro" },

  // ─── What Is Stripe Connect ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.whatIsTitle",
    id: "what-is-stripe-connect",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.whatIsIntro" },

  // ─── Architecture Overview ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "End Customer pays", type: "default" },
      { id: "B", label: "Stripe collects total charge", type: "primary" },
      { id: "C", label: "application_fee_amount deducted (commission)", type: "warning" },
      { id: "D", label: "Net amount → Tenant's Stripe Express account", type: "success" },
      { id: "E", label: "Platform holds commission in balance", type: "info" },
      { id: "F", label: "CommissionLedgerEntry created", type: "default" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "C", to: "E" },
      { from: "E", to: "F" },
    ],
  },

  // ─── TenantStripeAccount Entity ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.accountEntityTitle",
    id: "tenant-stripe-account-entity",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.accountEntityIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["TenantId", "Guid", "FK to the tenant. Unique — one Stripe account per tenant."],
      ["StripeAccountId", "string (max 255)", "Stripe Connect account ID (acct_xxx)."],
      ["AccountType", "StripeAccountType enum", "Express (recommended, Stripe-hosted dashboard) or Standard (full Stripe dashboard)."],
      ["OnboardingStatus", "ConnectOnboardingStatus enum", "Lifecycle: NotStarted → Pending → Restricted → Complete."],
      ["ChargesEnabled", "bool", "Whether the account can accept charges (set by Stripe webhook)."],
      ["PayoutsEnabled", "bool", "Whether the account can receive payouts (set by Stripe webhook)."],
      ["OnboardingCompletedAt", "DateTime?", "When onboarding was fully completed (ChargesEnabled + PayoutsEnabled = true)."],
      ["DisabledReason", "string? (max 1000)", "Reason if Stripe has restricted or disabled the account."],
      ["DefaultCurrency", "string? (max 3)", "Default currency for this Connect account (e.g. \"usd\")."],
      ["Country", "string? (max 2)", "Country code of the Connect account (e.g. \"US\", \"GB\")."],
      ["CommissionRate", "decimal? (5,4)", "Per-tenant commission rate override (0.00–1.00). Null = use edition or global default."],
      ["PayoutDelayDays", "int", "Payout delay in days. Default 7 (industry standard for fraud protection)."],
      ["LastPayoutAt", "DateTime?", "When the last payout was sent to this tenant's bank account."],
      ["TotalPayoutsAmount", "decimal (18,2)", "Lifetime total payouts amount sent to this tenant."],
      ["TotalPayoutsCount", "int", "Lifetime total number of payouts sent."],
      ["IsFullyOnboarded", "bool (computed)", "True if Status = Complete AND ChargesEnabled AND PayoutsEnabled. Not persisted."],
    ],
  },

  // ─── Onboarding Status Lifecycle ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.onboardingTitle",
    id: "onboarding-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.onboardingIntro" },
  {
    type: "table",
    headers: ["Status", "Meaning"],
    rows: [
      ["NotStarted (0)", "Tenant has not started Stripe Connect onboarding."],
      ["Pending (1)", "Onboarding link generated; awaiting Stripe KYC/identity verification."],
      ["Restricted (2)", "Partial onboarding — Stripe requires additional documents or information."],
      ["Complete (3)", "Fully verified — ChargesEnabled and PayoutsEnabled are both true."],
    ],
  },

  // ─── Commission Rate Resolution ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.commissionTitle",
    id: "commission-rate-resolution",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.commissionIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "TenantStripeAccount.CommissionRate (per-tenant override)", type: "primary", descriptionKey: "modules.stripeConnect.commChain1" },
      { id: "B", label: "Edition.ConnectCommissionRate (per-edition rate)", type: "info", descriptionKey: "modules.stripeConnect.commChain2" },
      { id: "C", label: "ConnectPlatformSettings.GlobalCommissionRate (platform default)", type: "warning", descriptionKey: "modules.stripeConnect.commChain3" },
      { id: "D", label: "0.10 hardcoded fallback (only if singleton row missing)", type: "default", descriptionKey: "modules.stripeConnect.commChain4" },
    ],
    connections: [
      { from: "A", to: "B", label: "if null →" },
      { from: "B", to: "C", label: "if null →" },
      { from: "C", to: "D", label: "if missing →" },
    ],
  },

  // ─── ConnectPlatformSettings ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.settingsTitle",
    id: "platform-settings",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.settingsIntro" },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.stripeConnect.settingsSingletonNote",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Default", "Description"],
    rows: [
      ["GlobalCommissionRate", "decimal (5,4)", "0.10", "Platform-wide default commission rate (0–50%). Applied when no tenant override exists."],
      ["DefaultPayoutDelayDays", "int", "7", "Default payout delay in days for newly created Connect accounts. Stripe minimum is 2."],
      ["ConnectEnabled", "bool", "true", "Master switch — disables Stripe Connect platform-wide when set to false."],
      ["CommissionInvoiceThresholdAmount", "decimal (10,2)", "50.00", "USD threshold triggering a mid-month commission invoice. Set 0 to disable threshold billing (monthly-only mode)."],
      ["CommissionInvoiceGraceDays", "int", "7", "Grace period (days) before an overdue commission invoice triggers tenant suspension."],
    ],
  },

  // ─── Commission Ledger & Invoicing ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.ledgerTitle",
    id: "commission-ledger",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.ledgerIntro" },
  {
    type: "table",
    headers: ["Entity", "Purpose"],
    rows: [
      ["CommissionLedgerEntry", "One row per payment. Stores TenantId, GrossAmount, CommissionAmount, CommissionRate, CommissionStatus, PaymentGatewayType, and GatewayTransactionId."],
      ["CommissionInvoice", "Monthly (or threshold-triggered) invoice for non-Connect gateway commissions. Format: CINV-{YYYY}-{NNNNN}. Statuses: Draft → Finalized → Paid / Overdue."],
      ["ConnectPlatformSettings", "Singleton row storing platform-wide defaults. Always accessed via ConnectPlatformSettings.SingletonId."],
    ],
  },

  // ─── Commission Invoice Triggers ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.invoiceTriggerTitle",
    id: "commission-invoice-triggers",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.invoiceTriggerIntro" },
  {
    type: "table",
    headers: ["Trigger", "When"],
    rows: [
      ["Monthly (0)", "Scheduled 1st-of-month rollup via background job."],
      ["Threshold (1)", "Unbilled commission exceeded CommissionInvoiceThresholdAmount (e.g. $50)."],
      ["Manual (2)", "Super admin manually triggered invoice generation from the admin panel."],
    ],
  },

  // ─── Promotion Redemption ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.promoTitle",
    id: "promotion-redemption",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.promoIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["PromotionId", "Guid", "FK to the EditionPromotion that was redeemed."],
      ["TenantId", "Guid", "The tenant that redeemed the promotion at activation time."],
      ["EmailHash", "string (64)", "SHA-256 hex-encoded lowercase hash of the subscriber's email. Never stores raw email — used for FirstTimeOnly checks."],
      ["RedeemedAt", "DateTime", "UTC timestamp when the promotion was redeemed at checkout."],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.stripeConnect.promoNote",
  },

  // ─── Operational Alerts ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.alertsTitle",
    id: "operational-alerts",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.alertsIntro" },
  {
    type: "table",
    headers: ["Alert Type", "Trigger Condition"],
    rows: [
      ["WebhookDeadLetter", "A Stripe webhook event was permanently unprocessable after all retries."],
      ["StaleSessionCompleted", "A non-current checkout session completed (possible duplicate payment)."],
      ["PromoFirstTimeViolation", "FirstTimeOnly promo redeemed by an email address with a prior redemption."],
      ["PermissionSyncFailed", "SubscriptionChangedEvent permission sync failed after all retries."],
      ["PromoSyncFailed", "Stripe promo code sync failed after all retries."],
      ["ReaperSkippedPaidSignup", "Reaper found a completed Stripe session but skipped it — handed to sweep job."],
    ],
  },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Type", "string (max 100)", "Alert type identifier for admin panel filtering and runbook lookup."],
      ["Severity", "int", "1 = Info, 2 = Warning, 3 = Error, 4 = Critical."],
      ["Title", "string (max 300)", "Short human-readable title for the alert list view."],
      ["Detail", "string? (max 2000)", "Detailed description including context identifiers."],
      ["RecommendedAction", "string? (max 1000)", "Actionable runbook text shown inline in the admin panel (U17)."],
      ["PayloadJson", "string?", "Raw JSON payload for debugging (e.g. full Stripe event body). Null when not applicable."],
      ["Status", "AlertStatus enum", "Open (1), Acknowledged (2), Resolved (3)."],
      ["CreatedAt", "DateTime", "UTC timestamp when the alert was created."],
      ["ResolvedAt", "DateTime?", "UTC timestamp when the alert was resolved. Null = not yet resolved."],
      ["ResolvedBy", "string? (max 256)", "Username or admin ID of who resolved the alert."],
    ],
  },

  // ─── Configuration ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.configTitle",
    id: "configuration",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.configIntro" },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json",
    code: `{
  "Stripe": {
    "SecretKey": "sk_live_...",
    "PublishableKey": "pk_live_...",
    "WebhookSecret": "whsec_...",
    "ConnectWebhookSecret": "whsec_connect_..."
  }
}`,
  },

  // ─── API Endpoints ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.stripeConnect.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.stripeConnect.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/connect/accounts",
        descriptionKey: "modules.stripeConnect.ep.create",
        auth: "JWT",
        permission: "connect.manage",
      },
      {
        method: "GET",
        path: "/api/v1/connect/accounts/{tenantId}",
        descriptionKey: "modules.stripeConnect.ep.get",
        auth: "JWT",
        permission: "connect.view",
      },
      {
        method: "POST",
        path: "/api/v1/connect/accounts/{tenantId}/onboarding-link",
        descriptionKey: "modules.stripeConnect.ep.onboardingLink",
        auth: "JWT",
        permission: "connect.manage",
      },
      {
        method: "GET",
        path: "/api/v1/connect/commission-ledger",
        descriptionKey: "modules.stripeConnect.ep.ledger",
        auth: "JWT",
        permission: "connect.view",
      },
      {
        method: "GET",
        path: "/api/v1/connect/commission-invoices",
        descriptionKey: "modules.stripeConnect.ep.invoices",
        auth: "JWT",
        permission: "connect.view",
      },
      {
        method: "POST",
        path: "/api/v1/connect/commission-invoices/generate",
        descriptionKey: "modules.stripeConnect.ep.invoiceGenerate",
        auth: "JWT",
        permission: "connect.manage",
      },
      {
        method: "GET",
        path: "/api/v1/connect/settings",
        descriptionKey: "modules.stripeConnect.ep.settings",
        auth: "JWT",
        permission: "connect.manage",
      },
      {
        method: "PUT",
        path: "/api/v1/connect/settings",
        descriptionKey: "modules.stripeConnect.ep.settingsUpdate",
        auth: "JWT",
        permission: "connect.manage",
      },
      {
        method: "GET",
        path: "/api/v1/connect/alerts",
        descriptionKey: "modules.stripeConnect.ep.alerts",
        auth: "JWT",
        permission: "connect.view",
      },
      {
        method: "PUT",
        path: "/api/v1/connect/alerts/{id}/resolve",
        descriptionKey: "modules.stripeConnect.ep.alertResolve",
        auth: "JWT",
        permission: "connect.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/stripe-connect",
  titleKey: "modules.stripeConnect.title",
  descriptionKey: "modules.stripeConnect.description",
  category: "modules",
  order: 14,
  sections,
  relatedSlugs: [
    "modules/billing-engine",
    "modules/subscriptions",
    "modules/platform-management",
    "features/webhook-system",
  ],
  lastUpdated: "2026-06-29",
});
