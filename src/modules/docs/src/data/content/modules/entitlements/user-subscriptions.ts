import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.userSubscriptions.intro" },

  // ─── UserSubscription Entity ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.entityTitle",
    id: "user-subscription-entity",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.entityIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["UserId", "Guid", "The subscribing user (Identity.User.Id — no FK nav prop)"],
      ["TenantPlanId", "Guid", "The TenantPlan being subscribed to"],
      ["TenantId", "Guid", "Tenant owning this subscription"],
      ["Status", "UserSubscriptionStatus", "Active | Trialing | Cancelled | Expired | PastDue"],
      ["StartedAt", "DateTime", "When the subscription became active (after trial if applicable)"],
      ["ExpiresAt", "DateTime?", "When the subscription expires (null = Lifetime plan)"],
      ["TrialEndsAt", "DateTime?", "When the trial period expires. Null if no trial."],
      ["IsAutoRenew", "bool", "Whether to automatically renew this subscription on expiry"],
      ["CancelledAt", "DateTime?", "When the user explicitly cancelled the subscription"],
      ["TenantPlanVersionNumber", "int?", "Version the subscriber is pinned to for grandfathering. Null = latest."],
      ["PromotionId", "Guid?", "The promotion applied at subscription time. Null = no promo."],
      ["PromotionCode", "string?", "Snapshot of the promo code used (survives promotion deletion)"],
      ["DiscountAmount", "decimal(18,2)", "Discount amount applied from the promotion"],
      ["OriginalPrice", "decimal(18,2)?", "Original pre-discount price"],
      ["ExternalRef", "string?", "External payment reference (e.g. Stripe subscription ID — reserved for Phase 10)"],
      ["Notes", "string?", "Admin notes about this subscription (internal only)"],
    ],
  },

  // ─── Status Lifecycle ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.statusTitle",
    id: "status-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.statusIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "free", label: "Free", type: "default" },
      { id: "trial", label: "Trial", type: "info" },
      { id: "active", label: "Active", type: "success" },
      { id: "pastdue", label: "PastDue", type: "warning" },
      { id: "cancelled", label: "Cancelled", type: "danger" },
      { id: "expired", label: "Expired", type: "danger" },
    ],
    connections: [
      { from: "free", to: "trial", label: "assign trial plan" },
      { from: "free", to: "active", label: "assign paid plan" },
      { from: "trial", to: "active", label: "trial ends + auto-renew" },
      { from: "trial", to: "expired", label: "trial ends, no renew" },
      { from: "active", to: "pastdue", label: "payment fails" },
      { from: "active", to: "cancelled", label: "manual cancel" },
      { from: "active", to: "expired", label: "period ends, no renew" },
      { from: "pastdue", to: "active", label: "payment recovered", style: "dashed" },
      { from: "pastdue", to: "expired", label: "grace expires" },
    ],
  },
  {
    type: "table",
    headers: ["Status", "Description", "Terminal?"],
    rows: [
      ["Free", "User is on a free plan with no billing", "No"],
      ["Trial", "User is in a trial period (expires at TrialEndsAt)", "No"],
      ["Active", "User has a paid, active subscription", "No"],
      ["PastDue", "Payment has failed, grace period in progress", "No"],
      ["Cancelled", "Subscription was manually cancelled", "Yes"],
      ["Expired", "Subscription period ended without renewal", "Yes"],
    ],
  },

  // ─── UserFeatureCheckerService ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.featureCheckerTitle",
    id: "feature-checker",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.featureCheckerIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "UserFeatureCheckerService.cs",
    code: `// Resolve features for a user
var features = await _userFeatureChecker.GetFeaturesAsync(userId);
// Returns key/value dict from the user's active TenantPlanFeature records

// Check a specific feature
bool hasApiAccess = features.ContainsKey("apiAccess") && features["apiAccess"] == "true";
int maxProjects = int.Parse(features.GetValueOrDefault("maxProjects", "-1"));`,
  },

  // ─── Reconciliation Job ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.reconciliationTitle",
    id: "reconciliation-job",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.reconciliationIntro" },
  {
    type: "table",
    headers: ["Transition", "Condition", "Action"],
    rows: [
      [
        "Trial → Active",
        "TrialEndsAt ≤ now, AutoRenew = true",
        "Create new Active row for next period",
      ],
      ["Trial → Expired", "TrialEndsAt ≤ now, AutoRenew = false", "Mark current row as Expired"],
      ["Active → Expired", "EndDate ≤ now, AutoRenew = false", "Mark current row as Expired"],
      ["Auto-Renew", "EndDate ≤ now, AutoRenew = true", "Create new Active row for next period"],
    ],
  },

  // ─── Immutable Design ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.immutableTitle",
    id: "immutable-design",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.immutableIntro" },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.userSubscriptions.immutableIntro",
  },

  // ─── Self-Service /me ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.selfServiceTitle",
    id: "self-service-me",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.selfServiceIntro" },
  {
    type: "code",
    language: "http",
    code: `GET /api/v1/user-subscriptions/me
Authorization: Bearer <user-jwt>

// Response
{
  "id": "encrypted-id",
  "planId": "encrypted-id",
  "planName": "Pro",
  "status": "Active",
  "startDate": "2026-04-01T00:00:00Z",
  "endDate": "2026-05-01T00:00:00Z",
  "autoRenew": true
}`,
  },

  // ─── Domain Events ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.eventsTitle",
    id: "domain-events",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.eventsIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "modules.userSubscriptions.event1",
      "modules.userSubscriptions.event2",
      "modules.userSubscriptions.event3",
    ],
  },

  // ─── Tenant Context Required ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.contextTitle",
    id: "tenant-context",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.contextIntro" },

  // ─── API Endpoints ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.userSubscriptions.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.userSubscriptions.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/user-subscriptions",
        descriptionKey: "modules.userSubscriptions.ep.list",
        auth: "JWT",
        permission: "user_subscriptions.view",
      },
      {
        method: "GET",
        path: "/api/v1/user-subscriptions/{id}",
        descriptionKey: "modules.userSubscriptions.ep.get",
        auth: "JWT",
        permission: "user_subscriptions.view",
      },
      {
        method: "POST",
        path: "/api/v1/user-subscriptions",
        descriptionKey: "modules.userSubscriptions.ep.create",
        auth: "JWT",
        permission: "user_subscriptions.create",
      },
      {
        method: "POST",
        path: "/api/v1/user-subscriptions/{id}/cancel",
        descriptionKey: "modules.userSubscriptions.ep.cancel",
        auth: "JWT",
        permission: "user_subscriptions.update",
      },
      {
        method: "POST",
        path: "/api/v1/user-subscriptions/{id}/renew",
        descriptionKey: "modules.userSubscriptions.ep.renew",
        auth: "JWT",
        permission: "user_subscriptions.update",
      },
      {
        method: "GET",
        path: "/api/v1/user-subscriptions/me",
        descriptionKey: "modules.userSubscriptions.ep.me",
        auth: "JWT (User)",
        permission: "",
      },
    ],
  },
];

registerPage({
  slug: "modules/user-subscriptions",
  titleKey: "modules.userSubscriptions.title",
  descriptionKey: "modules.userSubscriptions.description",
  category: "modules",
  order: 10,
  sections,
  relatedSlugs: ["modules/tenant-plans", "modules/subscriptions", "features/tenant-context-gate"],
  lastUpdated: "2026-04-18",
});
