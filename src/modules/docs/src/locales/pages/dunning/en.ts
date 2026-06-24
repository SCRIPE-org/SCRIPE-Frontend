/**
 * Constant definition representing en.
 */
export const en = {
  modules: {
    dunning: {
      title: "Dunning System",
      description:
        "4-stage failed payment recovery pipeline: warning emails, grace periods, suspension, cancellation, and auto-fallback to free edition.",
      intro:
        "The dunning system is SCRIPE's automated failed-payment recovery pipeline. When a payment fails, the system does not immediately suspend the tenant — instead, it moves through 4 graduated stages over 10-14 days, giving tenants ample opportunity to update their payment method before access is restricted. Each stage sends a targeted email and escalates the urgency.",
      stagesTitle: "4-Stage Dunning Pipeline",
      stagesIntro:
        "Dunning stages are managed by two background jobs: SubscriptionReconciliationJob (daily at 3:00 AM UTC) and DunningNotificationJob (daily at 4:00 AM UTC).",
      stage1Title: "Stage 1: Payment Failed (Day 0)",
      stage1Intro:
        "Triggered immediately when the invoice.payment_failed webhook arrives. Stripe's Smart Retry system attempts the payment again over days 1-3. SCRIPE sends the PaymentFailed email with a link to update the payment method via the Customer Portal.",
      stage2Title: "Stage 2: Grace Warning (Mid-Grace)",
      stage2Intro:
        "If the payment is still failing at mid-grace period, DunningNotificationJob sends the GraceWarning email. The subscription enters PastDue status. The tenant retains access but sees a colored GracePeriodBanner in the admin panel (yellow warning).",
      stage3Title: "Stage 3: Final Warning (≤2 Days Left)",
      stage3Intro:
        "When less than 2 days remain in the grace period, DunningNotificationJob sends the GraceFinalWarning email. The banner turns orange/red. This is the last chance before suspension.",
      stage4Title: "Stage 4: Suspend or Cancel",
      stage4Intro:
        "On grace period expiry, SubscriptionReconciliationJob suspends the subscription (Suspended status) and deactivates all tenant admins. If suspension continues past an extended grace period, the subscription is Cancelled and the tenant falls back to the FallbackEdition (typically the Free edition).",
      jobsTitle: "Background Jobs",
      jobsIntro:
        "Two jobs handle the dunning lifecycle. Both are fault-isolated — a failure for one tenant does not prevent processing of other tenants.",
      reconciliationJob:
        "SubscriptionReconciliationJob — Daily at 3:00 AM UTC. Processes subscription expiry, downgrade fallback, and grace period transitions for all active subscriptions.",
      notificationJob:
        "DunningNotificationJob — Daily at 4:00 AM UTC. Checks all PastDue subscriptions and sends grace warning or final warning emails based on days remaining.",
      deduplicationTitle: "Email Deduplication",
      deduplicationIntro:
        "A DunningNotification entity tracks which emails have been sent per subscription per stage. The jobs check this table before sending to prevent duplicate emails if the job runs multiple times.",
      crossModuleTitle: "Cross-Module Integration",
      crossModuleIntro:
        "When a subscription is suspended, the SubscriptionChangedEventHandler fires and deactivates all tenant admins with DeactivationReason='SubscriptionSuspended'. When the subscription is resumed (payment recovered), only admins with that specific reason are reactivated — admins manually deactivated by the tenant admin remain off.",
      fallbackTitle: "Auto-Fallback Edition",
      fallbackIntro:
        "Each Edition has an optional FallbackEditionId. When a subscription is cancelled due to non-payment, the tenant is automatically moved to the FallbackEdition (usually the Free tier). This keeps the tenant's data intact while restricting premium features.",
      promotionsTitle: "Promo Codes & Proration",
      promotionsIntro:
        "Promo codes are validated against the EditionPromotion entity before being passed to Stripe during checkout. Stripe handles proration automatically on upgrades/downgrades — the amount is calculated by Stripe and synchronized back via the customer.subscription.updated webhook.",
      promoExpiryTitle: "Promotion Expiry on Renewal",
      promoExpiryIntro:
        "When a promotion has DurationDays > 0, the system calculates a PromotionExpiresAt timestamp. On each renewal (New Row Pattern), the handler checks if the promotion has expired. Expired promotions are NOT carried forward to the new subscription row — the tenant pays full price from the next billing cycle.",
      emailsTitle: "Dunning Email Templates",
      emailsIntro:
        "SCRIPE includes 4 HTML email templates for the dunning pipeline, all with subdomain-aware CTA links and bilingual support (EN + AR).",
      email1:
        "payment-failed — Sent immediately on invoice.payment_failed. Links to Stripe Customer Portal.",
      email2:
        "grace-warning — Sent at mid-grace. Shows days remaining and links to update payment.",
      email3: "grace-final-warning — Sent ≤2 days before suspension. Maximum urgency.",
      email4:
        "subscription-expired — Sent after grace expires. Informs tenant of downgrade to free tier.",
    },
  },
};
