export const ar = {
  modules: {
    tenantPlans: {
      conceptIntro:
        "The standard SCRIPE Entitlements module manages Tenant → Platform subscriptions (Tier 1). The Tenant Plans module adds Tier 2: User → Tenant subscriptions. This two-tier model enables SaaS resellers, multi-sided marketplaces, and platform operators who want to monetize their end-users.",
      conceptTitle: "B2B2C Subscription Model",
      contextIntro:
        "The Tenant Plans module requires a valid tenant context. System admins (without an active tenant context) cannot access this page. The menu item is gated by RequiresTenantContext = true. System admins must use drill-down or impersonation to access tenant-level plan management.",
      contextTitle: "Tenant Context Required",
      description:
        "B2B2C plan builder allowing tenants to create subscription plans for their end-users with feature bundling, pricing, and lifecycle management.",
      endpointsIntro:
        "The TenantPlansController exposes 5 endpoints. All require the tenant_plans.* permission and a valid TenantId in the JWT context:",
      endpointsTitle: "API Endpoints",
      entityIntro:
        "A TenantPlan is created by a tenant admin and defines a subscription offering for their end-users. Plans are scoped to the creating tenant and are not visible to other tenants.",
      entityTitle: "TenantPlan Entity",
      ep: {
        create: "Create a new tenant plan",
        delete: "Soft-delete a plan",
        get: "Get plan details including features",
        list: "List plans for the current tenant (paginated)",
        update: "Update plan metadata or features",
      },
      featureEntityIntro:
        "Each TenantPlan can include a set of TenantPlanFeature records — key/value pairs that define what capabilities this plan provides to subscribers. These are free-form key/value strings defined by the tenant, not tied to the Entitlements feature catalog.",
      featureEntityTitle: "TenantPlanFeature Entity",
      intro:
        "Tenant Plans enable SCRIPE's B2B2C model — the platform operator sells subscriptions to tenants (B2B), and those tenants can in turn create their own subscription plans for their end-users (B2C). This is the 'Tier 2' subscription system. Each tenant can define multiple plans with different features, pricing, and billing cycles.",
      lifecycleIntro:
        "Plans are activated by setting IsActive = true. Deactivated plans prevent new subscribers but do not cancel existing subscriptions. Plans can be updated at any time — changes do not retroactively affect existing subscribers.",
      lifecycleTitle: "Plan Lifecycle",
      permissionsIntro:
        "Tenant Plans use the following permission constants: tenant_plans.view, tenant_plans.create, tenant_plans.update, tenant_plans.delete. These must be granted to the tenant admin's role to allow plan management.",
      permissionsTitle: "Permissions",
      title: "Tenant Plans",
    },
  },
};
