/**
 * Entitlements Module Permissions
 *
 * Covers: Editions, Features, Subscriptions, Billing, Invoices,
 * Tenant Plans, User Subscriptions, Promotions, Stripe Connect,
 * Commissions, Payment Gateways, Revenue Analytics
 */
export const ENTITLEMENTS_PERMISSIONS = {
  // ── Editions ────────────────────────────────────────────
  EDITIONS_VIEW: "editions.view",
  EDITIONS_CREATE: "editions.create",
  EDITIONS_UPDATE: "editions.update",
  EDITIONS_DELETE: "editions.delete",
  EDITIONS_ASSIGN: "editions.assign",

  // ── Features ────────────────────────────────────────────
  FEATURES_VIEW: "features.view",
  FEATURES_CREATE: "features.create",
  FEATURES_UPDATE: "features.update",
  FEATURES_DELETE: "features.delete",
  FEATURES_OVERRIDE: "features.override",
  FEATURES_RESOLVE: "features.resolve",

  // ── Subscriptions ───────────────────────────────────────
  SUBSCRIPTIONS_VIEW: "subscriptions.view",
  SUBSCRIPTIONS_ASSIGN: "subscriptions.assign",

  // ── Billing ─────────────────────────────────────────────
  INVOICES_VIEW: "invoices.view",
  INVOICES_EXPORT: "invoices.export",
  TRANSACTIONS_VIEW: "transactions.view",
  BILLING_MANAGE: "billing.manage",
  BILLING_DASHBOARD_VIEW: "billing.manage",
  PAYMENT_GATEWAYS_MANAGE: "payment_gateways.manage",

  // ── Tenant Plans (Tier 2) ──────────────────────────────
  TENANT_PLANS_VIEW: "tenant_plans.view",
  TENANT_PLANS_CREATE: "tenant_plans.create",
  TENANT_PLANS_UPDATE: "tenant_plans.update",
  TENANT_PLANS_DELETE: "tenant_plans.delete",

  // ── Tenant Feature Definitions (Tier 2) ────────────────
  TENANT_FEATURE_DEFINITIONS_VIEW: "tenant_feature_definitions.view",
  TENANT_FEATURE_DEFINITIONS_CREATE: "tenant_feature_definitions.create",
  TENANT_FEATURE_DEFINITIONS_UPDATE: "tenant_feature_definitions.update",
  TENANT_FEATURE_DEFINITIONS_DELETE: "tenant_feature_definitions.delete",

  // ── User Subscriptions (Tier 2) ────────────────────────
  USER_SUBSCRIPTIONS_VIEW: "user_subscriptions.view",
  USER_SUBSCRIPTIONS_CREATE: "user_subscriptions.create",
  USER_SUBSCRIPTIONS_UPDATE: "user_subscriptions.update",
  USER_SUBSCRIPTIONS_DELETE: "user_subscriptions.delete",

  // ── Tenant Plan Promotions (Tier 2) ────────────────────
  TENANT_PLAN_PROMOTIONS_VIEW: "tenant_plan_promotions.view",
  TENANT_PLAN_PROMOTIONS_CREATE: "tenant_plan_promotions.create",
  TENANT_PLAN_PROMOTIONS_UPDATE: "tenant_plan_promotions.update",
  TENANT_PLAN_PROMOTIONS_DELETE: "tenant_plan_promotions.delete",

  // ── Stripe Connect ─────────────────────────────────────
  STRIPE_CONNECT_VIEW: "stripe_connect.view",
  STRIPE_CONNECT_CREATE: "stripe_connect.create",
  STRIPE_CONNECT_UPDATE: "stripe_connect.update",
  STRIPE_CONNECT_DELETE: "stripe_connect.delete",

  // ── Commissions ─────────────────────────────────────────
  COMMISSIONS_VIEW: "commissions.view",
  COMMISSIONS_EXPORT: "commissions.export",
  COMMISSIONS_MANAGE: "commissions.manage",
  COMMISSIONS_WAIVE: "commissions.waive",

  // ── Tenant Stripe Connect (self-service) ───────────────
  TENANT_STRIPE_CONNECT_VIEW: "tenant_stripe_connect.view",
  TENANT_STRIPE_CONNECT_MANAGE: "tenant_stripe_connect.manage",

  // ── Platform Stripe Dashboard (system admins) ──────────
  PLATFORM_STRIPE_VIEW: "platform_stripe.view",

  // ── Revenue Analytics ──────────────────────────────────
  ANALYTICS_REVENUE_VIEW: "revenue_analytics.view",
  ANALYTICS_HEALTH_VIEW: "revenue_analytics.view_health",
  ANALYTICS_REPORTS_MANAGE: "revenue_analytics.manage_reports",

  // ── Tenant Payment Gateways (Tier 2 self-service) ─────
  TENANT_PAYMENT_GATEWAYS_VIEW: "tenant_payment_gateways.view",
  TENANT_PAYMENT_GATEWAYS_CONFIGURE: "tenant_payment_gateways.configure",
  TENANT_PAYMENT_GATEWAYS_VERIFY: "tenant_payment_gateways.verify",
  TENANT_PAYMENT_GATEWAYS_REMOVE: "tenant_payment_gateways.remove",

  // ── Platform Leads / CRM (Phase 5) ────────────────────
  LEADS_VIEW: "leads.view",
  LEADS_CREATE: "leads.create",
  LEADS_UPDATE: "leads.update",
  LEADS_DELETE: "leads.delete",
  LEADS_ASSIGN: "leads.assign",
  LEADS_CONVERT: "leads.convert",

  // ── Onboarding Engine ──────────────────────────────────
  ONBOARDING_QUESTIONS_VIEW: "onboarding_questions.view",
  ONBOARDING_QUESTIONS_CREATE: "onboarding_questions.create",
  ONBOARDING_QUESTIONS_UPDATE: "onboarding_questions.update",
  ONBOARDING_QUESTIONS_DELETE: "onboarding_questions.delete",
  ONBOARDING_RULES_VIEW: "onboarding_rules.view",
  ONBOARDING_RULES_CREATE: "onboarding_rules.create",
  ONBOARDING_RULES_UPDATE: "onboarding_rules.update",
  ONBOARDING_RULES_DELETE: "onboarding_rules.delete",

  // ── Signup Content (Welcome Screen CMS) ───────────────────────────────
  SIGNUP_CONTENT_VIEW: "signup_content.view",
  SIGNUP_CONTENT_MANAGE: "signup_content.manage",
} as const;
