import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.intro",
  },

  // ─── Subscription Entity ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.entityTitle",
    id: "subscription-entity",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.entityIntro",
  },
  {
    type: "table",
    headers: ["Property", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["TenantId", "Guid", "The tenant this subscription belongs to"],
      ["EditionId", "Guid", "The edition (plan) the tenant is subscribed to"],
      ["SubscriptionType", "enum", "Monthly, Annual, Lifetime, Trial"],
      ["Status", "enum", "Active, Suspended, Cancelled, Expired, PendingActivation"],
      ["StartDate", "DateTime", "When the subscription started"],
      ["EndDate", "DateTime?", "When the subscription ends (null for lifetime)"],
      ["TrialEndDate", "DateTime?", "Trial expiration (if trial subscription)"],
      ["IsTrialConverted", "bool", "Whether the trial was converted to a paid plan"],
      ["ExpiryBehavior", "enum", "What happens on expiry: Downgrade, Suspend, Grace"],
      ["GracePeriodDays", "int?", "Days after expiry before enforcement (if Grace behavior)"],
      ["SuspendedAt", "DateTime?", "When the subscription was suspended"],
      ["SuspendedReason", "string?", "Reason for suspension"],
      ["CancelledAt", "DateTime?", "When the subscription was cancelled"],
      ["CancellationReason", "string?", "Reason for cancellation"],
      ["LastBillingDate", "DateTime?", "Last successful billing date"],
      ["NextBillingDate", "DateTime?", "Next billing date"],
      ["AutoRenew", "bool", "Whether to auto-renew on expiry"],
      ["AssignedBy", "Guid", "Admin who assigned the subscription"],
      ["EditionVersionId", "Guid?", "Pinned edition version (null = latest)"],
      ["CreatedAt", "DateTime", "When the subscription was created"],
      ["UpdatedAt", "DateTime?", "Last modification timestamp"],
    ],
  },

  // ─── Subscription Status Lifecycle ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.lifecycleTitle",
    id: "lifecycle",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.lifecycleIntro",
  },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "pending", label: "Pending", description: "Awaiting activation" },
      { id: "active", label: "Active", description: "Full access" },
      { id: "suspended", label: "Suspended", description: "Access paused" },
      { id: "cancelled", label: "Cancelled", description: "Terminated" },
      { id: "expired", label: "Expired", description: "Past end date" },
    ],
    connections: [
      { from: "pending", to: "active", label: "Activate" },
      { from: "active", to: "suspended", label: "Suspend" },
      { from: "suspended", to: "active", label: "Resume" },
      { from: "active", to: "cancelled", label: "Cancel" },
      { from: "active", to: "expired", label: "End date passes" },
    ],
  },

  // ─── Subscription Types ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.typesTitle",
    id: "types",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.typesIntro",
  },
  {
    type: "table",
    headers: ["Type", "Duration", "Billing", "Auto-Renew", "Use Case"],
    rows: [
      ["Monthly", "30 days", "Recurring monthly", "Yes (configurable)", "Standard SaaS billing"],
      ["Annual", "365 days", "Recurring yearly", "Yes (configurable)", "Discounted yearly plans"],
      ["Lifetime", "Unlimited", "One-time", "N/A", "Perpetual licenses, early adopter deals"],
      ["Trial", "7-30 days (configurable)", "Free", "No", "Free trial before committing"],
    ],
  },

  // ─── Expiry Behavior ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.expiryTitle",
    id: "expiry-behavior",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.expiryIntro",
  },
  {
    type: "table",
    headers: ["Behavior", "When Triggered", "What Happens", "Ideal For"],
    rows: [
      [
        "Downgrade",
        "Subscription end date passes",
        "Tenant auto-assigned to a free/basic edition",
        "Freemium models — always have a free tier",
      ],
      [
        "Suspend",
        "Subscription end date passes",
        "Tenant access is fully blocked, data preserved",
        "Strict enforcement — pay or lose access",
      ],
      [
        "Grace",
        "Subscription end date passes",
        "Full access for GracePeriodDays, then suspend",
        "Give tenants time to renew (e.g. 7-day grace)",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "ExpiryBehavior Enum",
    code: `public enum ExpiryBehavior
{
    /// <summary>Auto-assign tenant to the default/free edition</summary>
    Downgrade = 0,
    
    /// <summary>Suspend the tenant's access entirely</summary>
    Suspend = 1,
    
    /// <summary>Allow a grace period before suspending</summary>
    Grace = 2,
}`,
  },

  // ─── Operations ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.operationsTitle",
    id: "operations",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.operationsIntro",
  },

  // Assign
  {
    type: "heading",
    level: 3,
    titleKey: "modules.subscriptions.assignTitle",
    id: "assign",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.assignIntro",
  },
  {
    type: "code",
    language: "json",
    filename: "POST /api/v1/subscriptions",
    code: `{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "editionId": "660e8400-e29b-41d4-a716-446655440001",
  "subscriptionType": "Monthly",
  "autoRenew": true,
  "expiryBehavior": "Grace",
  "gracePeriodDays": 7
}`,
  },

  // Upgrade/Downgrade
  {
    type: "heading",
    level: 3,
    titleKey: "modules.subscriptions.upgradeTitle",
    id: "upgrade-downgrade",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.upgradeIntro",
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.subscriptions.downgradeWarning",
  },

  // Downgrade Impact
  {
    type: "heading",
    level: 3,
    titleKey: "modules.subscriptions.impactTitle",
    id: "downgrade-impact",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.impactIntro",
  },
  {
    type: "code",
    language: "json",
    filename: "GET /api/v1/subscriptions/{id}/downgrade-impact?targetEditionId={edId}",
    code: `{
  "canDowngrade": false,
  "impacts": [
    {
      "featureName": "MaxAdmins",
      "currentValue": "50",
      "newValue": "5",
      "currentUsage": 12,
      "isOverflow": true,
      "overflowAmount": 7,
      "resolution": "Must remove 7 admins before downgrading"
    },
    {
      "featureName": "Chat.Enabled",
      "currentValue": "true",
      "newValue": "false",
      "currentUsage": null,
      "isOverflow": false,
      "resolution": "Feature will be disabled"
    }
  ],
  "overflowPolicy": "Block",
  "recommendation": "Remove 7 admin users or choose a plan with ≥12 admin slots"
}`,
  },

  // Trial Conversion
  {
    type: "heading",
    level: 3,
    titleKey: "modules.subscriptions.trialTitle",
    id: "trial-conversion",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.trialIntro",
  },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "trial", label: "Trial", description: "Free trial period" },
      { id: "convert", label: "Convert", description: "Choose paid plan" },
      { id: "paid", label: "Paid", description: "Full subscription" },
      { id: "exp", label: "Expired", description: "Trial not converted" },
    ],
    connections: [
      { from: "trial", to: "convert", label: "Upgrade" },
      { from: "convert", to: "paid", label: "Auto-assign" },
      { from: "trial", to: "exp", label: "TrialEndDate passes" },
    ],
  },

  // ─── Renewal — New Row Pattern (B2) ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.renewalTitle",
    id: "renewal-new-row",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.renewalIntro",
  },
  {
    type: "heading",
    level: 3,
    titleKey: "modules.subscriptions.renewalAuditTitle",
    id: "revenue-audit-trail",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.renewalAuditIntro",
  },

  // ─── Promotion Expiry Tracking (A1) ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.promoExpiryTitle",
    id: "promo-expiry",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.promoExpiryIntro",
  },

  // ─── Optimistic Concurrency (E1) ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.concurrencyTitle",
    id: "concurrency",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.concurrencyIntro",
  },

  // ─── Input Validation (G1) ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.validationTitle",
    id: "validation",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.validationIntro",
  },

  // ─── Cross-Module Integration (H1) ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.crossModuleTitle",
    id: "cross-module",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.crossModuleIntro",
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.subscriptions.crossModuleReasons",
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions.endpointsTitle",
    id: "api-endpoints",
  },
  {
    type: "paragraph",
    contentKey: "modules.subscriptions.endpointsIntro",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/subscriptions",
        descriptionKey: "modules.subscriptions.ep.list",
        auth: "JWT",
        permission: "subscriptions.view",
      },
      {
        method: "GET",
        path: "/api/v1/subscriptions/{id}",
        descriptionKey: "modules.subscriptions.ep.get",
        auth: "JWT",
        permission: "subscriptions.view",
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions",
        descriptionKey: "modules.subscriptions.ep.assign",
        auth: "JWT",
        permission: "subscriptions.create",
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions/{id}/upgrade",
        descriptionKey: "modules.subscriptions.ep.upgrade",
        auth: "JWT",
        permission: "subscriptions.update",
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions/{id}/downgrade",
        descriptionKey: "modules.subscriptions.ep.downgrade",
        auth: "JWT",
        permission: "subscriptions.update",
      },
      {
        method: "GET",
        path: "/api/v1/subscriptions/{id}/downgrade-impact",
        descriptionKey: "modules.subscriptions.ep.impact",
        auth: "JWT",
        permission: "subscriptions.view",
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions/{id}/suspend",
        descriptionKey: "modules.subscriptions.ep.suspend",
        auth: "JWT",
        permission: "subscriptions.update",
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions/{id}/resume",
        descriptionKey: "modules.subscriptions.ep.resume",
        auth: "JWT",
        permission: "subscriptions.update",
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions/{id}/cancel",
        descriptionKey: "modules.subscriptions.ep.cancel",
        auth: "JWT",
        permission: "subscriptions.update",
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions/{id}/renew",
        descriptionKey: "modules.subscriptions.ep.renew",
        auth: "JWT",
        permission: "subscriptions.update",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{tenantId}/subscription",
        descriptionKey: "modules.subscriptions.ep.tenantActive",
        auth: "JWT",
        permission: "subscriptions.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/subscriptions",
  titleKey: "modules.subscriptions.title",
  descriptionKey: "modules.subscriptions.description",
  category: "modules",
  order: 3,
  sections,
  relatedSlugs: ["modules/entitlements-overview", "modules/editions", "modules/overrides"],
  lastUpdated: "2026-03-02",
});
