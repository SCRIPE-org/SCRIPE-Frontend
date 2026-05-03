import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.billingEngine.intro" },

  // ─── IPaymentGateway Abstraction ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.abstractionTitle",
    id: "payment-gateway-abstraction",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.abstractionIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/Abstractions/Payment/IPaymentGateway.cs",
    code: `public interface IPaymentGateway
{
    Task<CreateCheckoutSessionResult> CreateCheckoutSessionAsync(CreateCheckoutSessionRequest request);
    Task<CreatePaymentLinkResult> CreatePaymentLinkAsync(CreatePaymentLinkRequest request);
    Task<CreatePortalSessionResult> CreatePortalSessionAsync(string customerId, string returnUrl);
    Task<CancelSubscriptionResult> CancelSubscriptionAsync(string subscriptionId, bool cancelAtPeriodEnd);
}`,
  },

  // ─── Three Subscription Modes ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.modesTitle",
    id: "subscription-modes",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.modesIntro" },

  // Mode 1
  {
    type: "heading",
    level: 3,
    titleKey: "modules.billingEngine.mode1Title",
    id: "mode-self-service",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.mode1Intro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Tenant selects edition + billing cycle", type: "default" },
      { id: "B", label: "POST /billing/checkout-session", type: "primary" },
      { id: "C", label: "Stripe Checkout Session created", type: "info" },
      { id: "D", label: "TenantSubscription → PendingPayment", type: "warning" },
      { id: "E", label: "Tenant redirected to Stripe Checkout", type: "default" },
      { id: "F", label: "checkout.session.completed webhook", type: "info" },
      { id: "G", label: "HMAC signature verified", type: "default" },
      { id: "H", label: "TenantSubscription → Active ✅", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
      { from: "G", to: "H" },
    ],
  },

  // Mode 2
  {
    type: "heading",
    level: 3,
    titleKey: "modules.billingEngine.mode2Title",
    id: "mode-contact-sales",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.mode2Intro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Admin negotiates deal with client", type: "default" },
      { id: "B", label: "POST /billing/payment-link", type: "primary" },
      { id: "C", label: "Stripe Payment Link created", type: "info" },
      { id: "D", label: "Admin sends URL to client", type: "default" },
      { id: "E", label: "Client pays via Stripe", type: "default" },
      { id: "F", label: "Same webhook flow as self-service", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
    ],
  },

  // Mode 3
  {
    type: "heading",
    level: 3,
    titleKey: "modules.billingEngine.mode3Title",
    id: "mode-manual",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.mode3Intro" },
  {
    type: "code",
    language: "http",
    code: `POST /api/v1/subscriptions/assign
Authorization: Bearer <admin-jwt>

{
  "tenantId": "encrypted-id",
  "editionId": "encrypted-id",
  "subscriptionType": "Monthly",
  "currency": "USD"
  // No Stripe interaction — instant activation
}`,
  },

  // ─── Stripe Webhook Handler ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.webhookTitle",
    id: "stripe-webhook-handler",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.webhookIntro" },
  {
    type: "table",
    headers: ["Event Type", "Handler Action"],
    rows: [
      ["checkout.session.completed", "Activate subscription, create Invoice + PaymentTransaction"],
      ["invoice.paid", "Record renewal payment, create new subscription row"],
      ["invoice.payment_failed", "Move to PastDue, start dunning, send warning email"],
      ["customer.subscription.updated", "Sync status (active/past_due/canceled/unpaid)"],
      ["customer.subscription.deleted", "Cancel subscription, trigger fallback edition"],
      ["charge.refunded", "Create refund record, void invoice"],
      ["payment_intent.succeeded", "Record successful payment intent"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.billingEngine.idempotencyIntro",
  },

  // ─── Idempotency ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.idempotencyTitle",
    id: "idempotency",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.idempotencyIntro" },

  // ─── Configuration ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.configTitle",
    id: "configuration",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.configIntro" },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json",
    code: `{
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublishableKey": "pk_test_...",
    "WebhookSecret": "whsec_...",
    "SuccessUrl": "https://app.nexora.io/billing/success",
    "CancelUrl": "https://app.nexora.io/billing/cancel"
  }
}`,
  },

  // ─── Stripe Customer Portal ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.portalTitle",
    id: "customer-portal",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.portalIntro" },

  // ─── Edition Self-Service Fields ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.selfServiceTitle",
    id: "self-service-fields",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.selfServiceIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Effect"],
    rows: [
      [
        "IsSelfServiceEnabled",
        "bool",
        "true = tenant can self-checkout. false = must contact sales.",
      ],
      [
        "IsContactSalesOnly",
        "bool",
        "true = checkout button triggers payment link flow, not checkout session.",
      ],
    ],
  },

  // ─── Zero-Decimal Currency ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.currencyTitle",
    id: "zero-decimal-currency",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.currencyIntro" },

  // ─── API Endpoints ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.billingEngine.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.billingEngine.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/billing/tenants/{id}/checkout-session",
        descriptionKey: "modules.billingEngine.ep.checkout",
        auth: "JWT",
        permission: "billing.manage",
      },
      {
        method: "POST",
        path: "/api/v1/billing/tenants/{id}/payment-link",
        descriptionKey: "modules.billingEngine.ep.paymentLink",
        auth: "JWT",
        permission: "billing.manage",
      },
      {
        method: "POST",
        path: "/api/v1/billing/tenants/{id}/portal-session",
        descriptionKey: "modules.billingEngine.ep.portal",
        auth: "JWT",
        permission: "billing.manage",
      },
      {
        method: "POST",
        path: "/api/v1/billing/tenants/{id}/cancel-stripe",
        descriptionKey: "modules.billingEngine.ep.cancel",
        auth: "JWT",
        permission: "billing.manage",
      },
      {
        method: "GET",
        path: "/api/v1/billing/dashboard",
        descriptionKey: "modules.billingEngine.ep.dashboard",
        auth: "JWT",
        permission: "billing.view",
      },
      {
        method: "POST",
        path: "/api/stripe-webhooks",
        descriptionKey: "Stripe webhook receiver — no auth, HMAC-verified",
        auth: "HMAC",
        permission: "",
      },
    ],
  },
];

registerPage({
  slug: "modules/billing-engine",
  titleKey: "modules.billingEngine.title",
  descriptionKey: "modules.billingEngine.description",
  category: "modules",
  order: 6,
  sections,
  relatedSlugs: [
    "modules/invoices",
    "modules/dunning",
    "modules/subscriptions",
    "features/webhook-system",
  ],
  lastUpdated: "2026-04-18",
});
