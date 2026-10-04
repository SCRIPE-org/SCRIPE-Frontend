import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "🔄",
        titleKey: "commercial.entitlementsUserSubscriptions.fullLifecycleTitle",
        descriptionKey: "commercial.entitlementsUserSubscriptions.fullLifecycleDesc",
      },
      {
        icon: "🤖",
        titleKey: "commercial.entitlementsUserSubscriptions.autoReconciliationTitle",
        descriptionKey: "commercial.entitlementsUserSubscriptions.autoReconciliationDesc",
      },
      {
        icon: "🎛️",
        titleKey: "commercial.entitlementsUserSubscriptions.featureGatingTitle",
        descriptionKey: "commercial.entitlementsUserSubscriptions.featureGatingDesc",
      },
      {
        icon: "👤",
        titleKey: "commercial.entitlementsUserSubscriptions.selfServiceTitle",
        descriptionKey: "commercial.entitlementsUserSubscriptions.selfServiceDesc",
      },
      {
        icon: "📋",
        titleKey: "commercial.entitlementsUserSubscriptions.auditTrailTitle",
        descriptionKey: "commercial.entitlementsUserSubscriptions.auditTrailDesc",
      },
      {
        icon: "🔔",
        titleKey: "commercial.entitlementsUserSubscriptions.domainEventsTitle",
        descriptionKey: "commercial.entitlementsUserSubscriptions.domainEventsDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.entitlementsUserSubscriptions.lifecycleTitle",
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
    titleKey: "commercial.entitlementsUserSubscriptions.reconciliationTitle",
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
  titleKey: "commercial.entitlementsUserSubscriptions.title",
  descriptionKey: "commercial.entitlementsUserSubscriptions.description",
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
