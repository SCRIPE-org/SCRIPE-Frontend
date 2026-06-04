export const en = {
  commercial: {
    stripeConnect: {
      ben1: "Frictionless Billing",
      ben1Desc:
        "Let your tenants accept client payments globally while you take a cut automatically.",
      ben2: "Reduced Financial Risk",
      ben2Desc:
        "Funds flow directly through Stripe, avoiding complex regulatory compliance or escrow requirements.",
      ben3: "Automatic Commissions",
      ben3Desc: "Charge percentage or flat fees per transaction, creating a strong revenue engine.",
      benefitsIntro: "Enabling split payments via Stripe Connect provides huge business value.",
      benefitsTitle: "Why Split Payments?",
      commissionIntro:
        "Every transaction processed by your tenants can be split at the gateway level. For example, if a tenant sells a service for $100 with a 5% commission, Stripe Connect distributes $95 to the tenant and $5 directly to your corporate account.",
      commissionTitle: "Platform Fee Splits",
      intro:
        "Monetize your platform transactions instantly with a built-in split-payment and commission collection gateway powered by Stripe Connect.",
    },
  },
  stripeConnect: {
    apiAccountStatus: "Retrieve current tenant Connected Account status and payouts state",
    apiCommissionsDashboard: "Get global statistics, trends, and totals for platform commissions",
    apiCommissionsInvoices: "List system commission invoices with status filters",
    apiOnboard: "Initiate tenant Stripe Connect onboarding session",
    apiRetryCharge: "Trigger immediate manual retry charge for a tenant commission invoice",
    apiWaiveInvoice: "Waive a specific tenant commission invoice (marked as Paid)",
    commissionIntro:
      "Collect transaction fees on tenant sales dynamically through a ledger-based accounting system.",
    commissionTitle: "Platform Commission Engine",
    controllerIntro:
      "Endpoints for Stripe Connect and platform commissions are managed by StripeConnectController, TenantStripeConnectController, and CommissionsController.",
    controllerTitle: "Payment Hub Endpoints",
    description:
      "Detailed documentation for tenant onboarding, custom accounts, split payments, and platform commission management.",
    flowIntro:
      "Tenants onboard to the payment hub using a self-service OAuth or Custom onboarding flow.",
    flowTitle: "Tenant Onboarding Workflow",
    intro:
      "The Stripe Connect module provides multi-tenant billing capability. It enables platform tenants to connect their own Stripe accounts to receive payments from their customers. It also supports an automated platform commission engine to collect fees on tenant transactions.",
    step1Content:
      "The tenant admin clicks 'Connect Stripe' in the payments dashboard, which dispatches a command to retrieve a single-use onboarding URL.",
    step1Title: "Onboarding Trigger",
    step2Content:
      "The tenant is redirected to Stripe's onboarding portal to verify their business details, bank accounts, and compliance status.",
    step2Title: "Stripe Verification",
    step3Content:
      "Upon completion, Stripe redirects back to SCRIPE. The webhook handler captures account updates and activates the tenant's payment gateway status.",
    step3Title: "Account Activation",
    title: "Stripe Connect & Commissions",
  },
};
