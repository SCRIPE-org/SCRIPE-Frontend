export const ru = {
  modules: {
    billingEngine: {
      "title": "Billing Engine",
      "description": "Stripe-powered payment processing with self-service checkout, payment links, customer portal, and webhook-driven state synchronization.",
      "intro": "The Billing Engine integrates Stripe into NEXORA's subscription lifecycle. It provides three subscription modes: Self-Service (tenant picks a plan and pays via Stripe Checkout), Contact Sales (admin generates a payment link for enterprise deals), and Manual Assignment (admin assigns a plan and skips payment for partners or internal tenants). All payment events are synchronized via Stripe webhooks.",
      "abstractionTitle": "IPaymentGateway Abstraction",
      "abstractionIntro": "The payment system is built on an IPaymentGateway interface in Core.Application. This abstraction allows swapping payment providers (Stripe → PayPal → Paymob) without touching business logic. Only the Stripe implementation is currently active.",
      "modesTitle": "Three Subscription Modes",
      "modesIntro": "Every tenant onboarding follows one of three paths. The mode is chosen by whether the edition has IsSelfServiceEnabled or IsContactSalesOnly set.",
      "mode1Title": "Self-Service (Automated)",
      "mode1Intro": "The tenant selects an edition and billing cycle in the admin panel. NEXORA creates a Stripe Checkout Session, sets TenantSubscription to PendingPayment, and redirects the tenant to Stripe's hosted checkout page. On successful payment, the checkout.session.completed webhook fires and NEXORA activates the subscription automatically.",
      "mode2Title": "Contact Sales (Admin-Assisted)",
      "mode2Intro": "For enterprise or custom-priced deals, the admin creates a subscription with a payment link. NEXORA calls Stripe to create a Payment Link, returns the URL to the admin, who sends it to the client. The same webhook flow activates the subscription once the client pays.",
      "mode3Title": "Manual Assignment (Skip Payment)",
      "mode3Intro": "For partners, internal accounts, or free trials, the admin assigns an edition directly. No Stripe interaction occurs — the subscription is set to Active immediately. Use this for Free editions, internal tenants, or manually negotiated deals.",
      "webhookTitle": "Stripe Webhook Handler",
      "webhookIntro": "The StripeWebhooksController at POST /api/stripe-webhooks receives all Stripe events. It verifies the HMAC-SHA256 signature using the webhook secret, then dispatches to ProcessStripeWebhookCommandHandler which handles 7 event types:",
      "webhookEvents": "checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded, payment_intent.succeeded",
      "idempotencyTitle": "Idempotency",
      "idempotencyIntro": "All webhook handlers are idempotent — processing the same event twice has no side effects. The StripeInvoiceId and StripeSessionId fields are checked before creating new records. This protects against Stripe's at-least-once delivery guarantee.",
      "configTitle": "Configuration",
      "configIntro": "Stripe is configured in appsettings.json under the Stripe section. Use test keys for development and production keys for live deployments.",
      "portalTitle": "Stripe Customer Portal",
      "portalIntro": "Once a tenant has an active subscription, they can manage billing via Stripe's hosted Customer Portal. NEXORA creates a portal session and redirects the tenant to Stripe's page where they can update their card, view invoice history, download invoices as PDF, and cancel their subscription.",
      "endpointsTitle": "API Endpoints",
      "endpointsIntro": "The BillingController exposes 5 endpoints under /api/v1/billing:",
      "ep": {
        "checkout": "Create Stripe Checkout Session (self-service payment)",
        "paymentLink": "Generate Stripe Payment Link (Contact Sales flow)",
        "portal": "Create Stripe Customer Portal session (billing self-management)",
        "cancel": "Cancel Stripe subscription (immediate or at period end)",
        "dashboard": "Get revenue dashboard (MRR, ARR, churn, trends)"
      },
      "selfServiceTitle": "Edition Self-Service Fields",
      "selfServiceIntro": "Two fields on the Edition entity control which payment mode is available: IsSelfServiceEnabled (tenant can check out without contacting sales) and IsContactSalesOnly (the Checkout button shows 'Contact Sales' and triggers the payment link flow instead).",
      "currencyTitle": "Zero-Decimal Currency Handling",
      "currencyIntro": "NEXORA includes a CurrencyHelper that correctly converts amounts for Stripe's zero-decimal currencies (JPY, KWD, BHD, etc.). Regular currencies (USD, EUR, SAR, etc.) are multiplied by 100 to convert to cents. Zero-decimal currencies are passed as-is."
    }
  }
};
