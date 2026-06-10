export const es = {
  modules: {
    tenantPlans: {
      title: "Tenant Plans",
      description:
        "B2B2C plan builder allowing tenants to create subscription plans for their end-users with feature bundling, pricing, and lifecycle management.",
      intro:
        "Tenant Plans enable SCRIPE's B2B2C model — the platform operator sells subscriptions to tenants (B2B), and those tenants can in turn create their own subscription plans for their end-users (B2C). This is the 'Tier 2' subscription system. Each tenant can define multiple plans with different features, pricing, and billing cycles.",
      conceptTitle: "B2B2C Subscription Model",
      conceptIntro:
        "The standard SCRIPE Entitlements module manages Tenant → Platform subscriptions (Tier 1). The Tenant Plans module adds Tier 2: User → Tenant subscriptions. This two-tier model enables SaaS resellers, multi-sided marketplaces, and platform operators who want to monetize their end-users.",
      entityTitle: "TenantPlan Entity",
      entityIntro:
        "A TenantPlan is created by a tenant admin and defines a subscription offering for their end-users. Plans are scoped to the creating tenant and are not visible to other tenants.",
      featureEntityTitle: "TenantPlanFeature Entity",
      featureEntityIntro:
        "Each TenantPlan can include a set of TenantPlanFeature records — key/value pairs that define what capabilities this plan provides to subscribers. These are free-form key/value strings defined by the tenant, not tied to the Entitlements feature catalog.",
      lifecycleTitle: "Plan Lifecycle",
      lifecycleIntro:
        "Plans are activated by setting IsActive = true. Deactivated plans prevent new subscribers but do not cancel existing subscriptions. Plans can be updated at any time — changes do not retroactively affect existing subscribers.",
      contextTitle: "Tenant Context Required",
      contextIntro:
        "The Tenant Plans module requires a valid tenant context. System admins (without an active tenant context) cannot access this page. The menu item is gated by RequiresTenantContext = true. System admins must use drill-down or impersonation to access tenant-level plan management.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The TenantPlansController exposes 5 endpoints. All require the tenant_plans.* permission and a valid TenantId in the JWT context:",
      ep: {
        list: "List plans for the current tenant (paginated)",
        get: "Get plan details including features",
        create: "Create a new tenant plan",
        update: "Update plan metadata or features",
        delete: "Soft-delete a plan",
      },
      permissionsTitle: "Permissions",
      permissionsIntro:
        "Tenant Plans use the following permission constants: tenant_plans.view, tenant_plans.create, tenant_plans.update, tenant_plans.delete. These must be granted to the tenant admin's role to allow plan management.",
    },
  },
};
