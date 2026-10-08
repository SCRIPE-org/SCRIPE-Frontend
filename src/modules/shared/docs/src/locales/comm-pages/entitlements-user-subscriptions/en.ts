/**
 * Documentation for module export
 */
export const en = {
  commercial: {
    entitlementsUserSubscriptions: {
        "title": "User Subscriptions",
        "description": "Tier 2 user-to-plan subscription management with full lifecycle, auto-reconciliation, feature gating, and self-service capabilities.",
        "fullLifecycleTitle": "Full Lifecycle",
        "fullLifecycleDesc": "Free → Trial → Active → PastDue → Cancelled → Expired with automatic transitions.",
        "autoReconciliationTitle": "Auto-Reconciliation",
        "autoReconciliationDesc": "Daily background job handles trial expiry, auto-renewal, and expiration automatically.",
        "featureGatingTitle": "Feature Gating",
        "featureGatingDesc": "UserFeatureCheckerService resolves which features each user can access based on their plan.",
        "selfServiceTitle": "Self-Service",
        "selfServiceDesc": "Users can view their own subscription status via the /me endpoint.",
        "auditTrailTitle": "Audit Trail",
        "auditTrailDesc": "Immutable Cancel+Replace pattern keeps a complete history per billing cycle.",
        "domainEventsTitle": "Domain Events",
        "domainEventsDesc": "Created, Cancelled, and Renewed events feed into webhook and notification systems.",
        "lifecycleTitle": "Subscription Lifecycle",
        "reconciliationTitle": "Automatic Reconciliation"
    }
  }
};
