import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "🔄",
        titleKey: "Full Lifecycle",
        descriptionKey:
          "Free → Trial → Active → PastDue → Cancelled → Expired with automatic transitions.",
      },
      {
        icon: "🤖",
        titleKey: "Auto-Reconciliation",
        descriptionKey:
          "Daily background job handles trial expiry, auto-renewal, and expiration automatically.",
      },
      {
        icon: "🎛️",
        titleKey: "Feature Gating",
        descriptionKey:
          "UserFeatureCheckerService resolves which features each user can access based on their plan.",
      },
      {
        icon: "👤",
        titleKey: "Self-Service",
        descriptionKey: "Users can view their own subscription status via the /me endpoint.",
      },
      {
        icon: "📋",
        titleKey: "Audit Trail",
        descriptionKey:
          "Immutable Cancel+Replace pattern keeps a complete history per billing cycle.",
      },
      {
        icon: "🔔",
        titleKey: "Domain Events",
        descriptionKey:
          "Created, Cancelled, and Renewed events feed into webhook and notification systems.",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Subscription Lifecycle",
    id: "lifecycle",
  },
  {
    type: "table",
    headers: ["Status", "Description", "Can Transition To"],
    rows: [
      ["Free", "No billing, on free plan", "Trial, Active"],
      ["Trial", "Trial period active", "Active (auto-renew), Expired (no renew)"],
      ["Active", "Paid and current", "PastDue, Cancelled, Expired"],
      ["PastDue", "Payment failed, grace period active", "Active (recovered), Expired"],
      ["Cancelled", "Manually cancelled (terminal)", "—"],
      ["Expired", "Period ended (terminal)", "—"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Automatic Reconciliation",
    id: "reconciliation",
  },
  {
    type: "table",
    headers: ["Job", "Schedule", "What it does"],
    rows: [
      [
        "UserSubscriptionReconciliationJob",
        "Daily 5:00 AM UTC",
        "Trial expiry, period expiry, auto-renewal",
      ],
    ],
  },
];

registerPage({
  slug: "commercial/entitlements-user-subscriptions",
  titleKey: "User Subscriptions",
  descriptionKey:
    "Tier 2 user-to-plan subscription management with full lifecycle, auto-reconciliation, feature gating, and self-service capabilities.",
  category: "commercial-modules",
  order: 22,
  sections,
  relatedSlugs: [
    "commercial/entitlements-tenant-plans",
    "commercial/entitlements-overview",
    "commercial/billing-payments",
  ],
  lastUpdated: "2026-04-18",
});
