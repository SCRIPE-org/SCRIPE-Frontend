export const en = {
  modules: {
    billingEngine: {
      title: "Billing Engine",
      description:
        "Multi-gateway payment processing supporting Stripe, PayPal, and Paymob with self-service checkout, payment links, customer portal, and webhook-driven state synchronization.",
      intro:
        "The Billing Engine powers NEXORA's subscription lifecycle with a provider-agnostic payment architecture. It supports three payment gateways (Stripe, PayPal, Paymob) and three subscription modes: Self-Service (tenant picks a plan and pays via the configured gateway), Contact Sales (admin generates a payment link for enterprise deals), and Manual Assignment (admin assigns a plan without payment). All payment events are synchronized via gateway-specific webhooks.",
      abstractionTitle: "IPaymentGateway Abstraction",
      abstractionIntro:
        "The payment system is built on an IPaymentGateway interface in Core.Application with an IPaymentGatewayResolver that dynamically selects the correct provider per tenant. Three implementations are active: StripePaymentGateway (global, recurring, billing portal), PayPalPaymentGateway (international, OAuth2-based), and PaymobPaymentGateway (MENA region, card tokenization). Gateways are registered as Keyed DI services and resolved at runtime.",
      modesTitle: "Three Subscription Modes",
      modesIntro:
        "Every tenant onboarding follows one of three paths. The mode is chosen by whether the edition has IsSelfServiceEnabled or IsContactSalesOnly set.",
      mode1Title: "Self-Service (Automated)",
      mode1Intro:
        "The tenant selects an edition and billing cycle in the admin panel. NEXORA resolves the correct payment gateway (via tenant override or global default), creates a checkout session, sets TenantSubscription to PendingPayment, and redirects the tenant to the gateway's hosted checkout page. On successful payment, the gateway webhook fires and NEXORA activates the subscription automatically.",
      mode2Title: "Contact Sales (Admin-Assisted)",
      mode2Intro:
        "For enterprise or custom-priced deals, the admin creates a subscription with a payment link via the resolved gateway. NEXORA generates a reusable payment link URL, which the admin sends to the client. The same webhook flow activates the subscription once the client pays.",
      mode3Title: "Manual Assignment (Skip Payment)",
      mode3Intro:
        "For partners, internal accounts, or free trials, the admin assigns an edition directly. No gateway interaction occurs — the subscription is set to Active immediately. Use this for Free editions, internal tenants, or manually negotiated deals.",
      gatewayTitle: "Multi-Gateway Architecture",
      gatewayIntro:
        "NEXORA supports three payment gateways simultaneously. The IPaymentGatewayResolver resolves the correct gateway per tenant using a priority chain: explicit admin override, tenant-level configuration, then global default. Each subscription records which gateway processed its payment in the PaymentGateway field.",
      gatewayStripe:
        "Stripe — Full-featured: checkout, recurring billing, billing portal, payment links, refunds, 3D Secure, multi-currency. Ideal as the global default.",
      gatewayPaypal:
        "PayPal — International reach: checkout, recurring billing, refunds, multi-currency. OAuth2-based with sandbox support. No billing portal (managed via paypal.com).",
      gatewayPaymob:
        "Paymob Accept — MENA specialist: checkout, tokenized recurring (via saved card tokens), mobile wallets. Supports EGP, SAR, AED, PKR currencies. HMAC-SHA512 webhook verification.",
      webhookTitle: "Webhook Handlers",
      webhookIntro:
        "Each gateway has its own webhook endpoint with provider-specific signature verification. Stripe uses HMAC-SHA256 at POST /api/stripe-webhooks, PayPal uses transmission signature verification at POST /api/paypal-webhooks, and Paymob uses HMAC-SHA512 at POST /api/paymob-webhooks. All handlers dispatch to NEXORA mediator commands for processing.",
      webhookEvents:
        "Stripe: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded. PayPal: BILLING.SUBSCRIPTION.ACTIVATED, PAYMENT.SALE.COMPLETED, BILLING.SUBSCRIPTION.CANCELLED. Paymob: transaction.success, transaction.failed, transaction.refunded.",
      idempotencyTitle: "Idempotency",
      idempotencyIntro:
        "All webhook handlers are idempotent — processing the same event twice has no side effects. Gateway transaction IDs are checked before creating new records. This protects against at-least-once delivery guarantees from all providers.",
      configTitle: "Configuration",
      configIntro:
        "Each gateway is configured in appsettings.json under its own section (Stripe, PayPal, Paymob). The PaymentGateways section controls which gateways are enabled, which is the global default, and whether tenants can override the gateway selection. Use sandbox/test keys for development.",
      portalTitle: "Billing Portal (Stripe Only)",
      portalIntro:
        "Once a tenant has an active Stripe subscription, they can manage billing via Stripe's hosted Customer Portal. This feature is Stripe-exclusive — PayPal and Paymob subscriptions show gateway-specific management guidance instead. The UI automatically hides the portal button for non-Stripe gateways.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The BillingController exposes 5 endpoints under /api/v1/billing, plus gateway management at /api/v1/payment-gateways:",
      ep: {
        checkout:
          "Create checkout session via the resolved payment gateway (supports GatewayOverride parameter)",
        paymentLink: "Generate payment link via the resolved gateway (Contact Sales flow)",
        portal:
          "Create Stripe Customer Portal session (Stripe-only, returns error for other gateways)",
        cancel:
          "Cancel gateway subscription (resolves the correct gateway from the subscription's PaymentGateway field)",
        dashboard:
          "Get revenue dashboard (MRR, ARR, churn, trends — aggregated across all gateways)",
        gateways:
          "GET /api/v1/payment-gateways — Query enabled gateways and their feature support matrix",
      },
      selfServiceTitle: "Edition Self-Service Fields",
      selfServiceIntro:
        "Two fields on the Edition entity control which payment mode is available: IsSelfServiceEnabled (tenant can check out without contacting sales) and IsContactSalesOnly (the Checkout button shows 'Contact Sales' and triggers the payment link flow instead).",
      currencyTitle: "Zero-Decimal Currency Handling",
      currencyIntro:
        "NEXORA includes a CurrencyHelper that correctly converts amounts for zero-decimal currencies (JPY, KWD, BHD, etc.). Regular currencies (USD, EUR, SAR, etc.) are multiplied by 100 to convert to smallest units. Zero-decimal currencies are passed as-is. This applies across all gateways.",
    },
  },
};
