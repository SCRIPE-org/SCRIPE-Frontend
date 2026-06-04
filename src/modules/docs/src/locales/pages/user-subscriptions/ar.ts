export const ar = {
  modules: {
    userSubscriptions: {
      contextIntro:
        "User Subscriptions require a valid tenant context. The menu item is gated by RequiresTenantContext = true. System admins must drill down into a tenant or use impersonation to access this page.",
      contextTitle: "Tenant Context Required",
      description:
        "Tier 2 user-to-plan binding with full lifecycle management, feature resolution, reconciliation job, and self-service /me endpoint.",
      endpointsIntro:
        "The UserSubscriptionsController exposes 11 endpoints. All require the user_subscriptions.* permission:",
      endpointsTitle: "API Endpoints",
      entityIntro:
        "A UserSubscription links a User to a TenantPlan. It captures the full lifecycle with optional billing fields, trial tracking, and auto-renewal configuration.",
      entityTitle: "UserSubscription Entity",
      ep: {
        cancel: "Cancel a subscription",
        create: "Assign a user to a plan (create subscription)",
        get: "Get subscription details by ID",
        list: "List subscriptions (paginated, filterable by status/plan/user)",
        me: "Get the current user's active subscription (self-service)",
        renew: "Renew a cancelled subscription (creates new row)",
      },
      event1: "UserSubscriptionCreatedEvent — Fired when a new subscription is assigned",
      event2: "UserSubscriptionCancelledEvent — Fired when a subscription is cancelled",
      event3: "UserSubscriptionRenewedEvent — Fired when a subscription is renewed",
      eventsIntro:
        "The following domain events are fired by user subscription commands and can be consumed by webhook handlers or notification systems:",
      eventsTitle: "Domain Events",
      featureCheckerIntro:
        "The UserFeatureCheckerService resolves which features a user can access based on their active UserSubscription. For Active and Trial subscribers, features come from the TenantPlan's TenantPlanFeature records. For Free subscribers, features come from the Free plan if one exists.",
      featureCheckerTitle: "UserFeatureCheckerService",
      immutableIntro:
        "Following the 'New Row Pattern', renewals create a NEW UserSubscription row rather than updating the existing record. Cancellations mark the current subscription as Cancelled. This preserves a complete audit trail per billing cycle.",
      immutableTitle: "Immutable Design (Cancel + Replace)",
      intro:
        "User Subscriptions bind end-users to TenantPlans. Each user can have one active subscription at a time. The system handles the full lifecycle from assignment through trial, active billing, past-due recovery, cancellation, expiry, and auto-renewal — mirroring the Tier 1 TenantSubscription lifecycle.",
      reconciliationIntro:
        "A daily background job (5:00 AM UTC) handles automatic subscription transitions: Trial → Active (when trial ends and auto-renew is on), Active → Expired (when subscription period ends and auto-renew is off), and Auto-Renew (create a new subscription row for the next period). This mirrors the SubscriptionReconciliationJob for Tier 1.",
      reconciliationTitle: "UserSubscriptionReconciliationJob",
      selfServiceIntro:
        "Users can view their own subscription status via GET /api/v1/user-subscriptions/me. This endpoint resolves the current user's active subscription without needing an explicit subscription ID, making it suitable for client-facing applications.",
      selfServiceTitle: "Self-Service /me Endpoint",
      statusActive: "Active — User has a paid, active subscription",
      statusCancelled: "Cancelled — Subscription was manually cancelled",
      statusExpired: "Expired — Subscription period ended without renewal",
      statusFree: "Free — User is on a free plan with no billing",
      statusIntro:
        "User subscriptions move through 6 states. Terminal states (Cancelled, Expired) cannot be reactivated — a new subscription must be created instead.",
      statusPastDue: "PastDue — Payment has failed, grace period in progress",
      statusTitle: "Subscription Status Lifecycle",
      statusTrial: "Trial — User is in a trial period (expires at TrialEndsAt)",
      title: "User Subscriptions",
    },
  },
};
