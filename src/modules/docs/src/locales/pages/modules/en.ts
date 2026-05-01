/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  modules: {
    entitlementsOverview: {
      title: "Entitlements Overview",
      description:
        "Edition-based feature gating with Features, Editions, Subscriptions, and per-tenant Overrides.",
      intro:
        "The Entitlements module is NEXORA's plan-and-feature management engine. It defines what capabilities each tenant gets, how plans (editions) bundle those capabilities, and how subscriptions link tenants to plans.",
      whatIsTitle: "What is Entitlements?",
      whatIsIntro:
        "Entitlements is the module responsible for controlling which features a tenant can access based on their subscribed edition (plan). It provides a three-level resolution chain: Feature defaults → Edition values → Per-tenant overrides, ensuring maximum flexibility for both platform operators and reseller tenants.",
      architectureTitle: "Architecture",
      architectureIntro:
        "The Entitlements system is composed of four interconnected domains that work together to provide a complete feature-gating solution.",
      domainsTitle: "Four Domains",
      domainsIntro: "Each domain handles a specific aspect of the entitlements lifecycle:",
      resolutionTitle: "Feature Value Resolution Chain",
      resolutionIntro:
        "When the system needs to determine a feature value for a tenant, it follows a strict priority chain. The highest-priority source that provides a value wins.",
      pipelineTitle: "Pipeline Integration",
      pipelineIntro:
        "NEXORA integrates entitlements directly into the MediatR CQRS pipeline via FeatureCheckBehavior. Commands and queries that implement IRequireFeature are automatically gated — if the tenant's resolved feature value is disabled, the request is rejected before reaching the handler.",
      pipelineTip:
        "To gate a command behind a feature, simply implement IRequireFeature and set RequiredFeatureName to the feature's stable system key (e.g. 'Chat.Enabled'). No additional code is needed.",
      backendTitle: "Backend Structure",
      backendIntro:
        "The Entitlements backend follows NEXORA's standard Clean Architecture module layout with Domain, Application, and Infrastructure layers.",
      frontendTitle: "Frontend Structure",
      frontendIntro:
        "The frontend mirrors the backend with four sub-modules (editions, features, subscriptions, overrides), each following the SOLID View/ViewModel pattern.",
      controllersTitle: "API Controllers",
      controllersIntro:
        "The Entitlements module exposes 31 API endpoints across 4 controllers, all authenticated with JWT and protected by permission-based authorization.",
      noOpTitle: "NoOp Fallback",
      noOpIntro:
        "When the Entitlements module is not loaded (e.g. in a microservice that doesn't include Entitlements), NEXORA registers a NoOpFeatureCache. This allows IRequireFeature commands to pass through without errors — all features are treated as enabled by default.",
      noOpNote:
        "The NoOp fallback ensures that modules can use IRequireFeature without a hard dependency on the Entitlements module. In production monolith mode, the real FeatureCache is always available.",
      resolutionTip:
        "The resolution chain is evaluated lazily — values are cached after first resolution and invalidated when subscriptions, editions, or overrides change.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "The Entitlements module registers 31 MediatR handlers spanning the four domains. Each command has a corresponding FluentValidation validator for input validation.",
      diTitle: "Dependency Injection Registration",
      diIntro:
        "All Entitlements services are registered via the AddEntitlementsModule extension method in DependencyInjection.cs. The module follows NEXORA's standard registration pattern.",
      comparisonTitle: "With vs Without Entitlements",
      comparisonIntro:
        "The following table shows the difference in capabilities when the Entitlements module is enabled versus running without it:",
      gettingStartedTitle: "Getting Started",
      gettingStartedIntro:
        "Follow these 5 steps to set up the Entitlements system for your platform. Each step builds on the previous one:",
      contextAwareTitle: "Context-Aware Scoping",
      contextAwareIntro:
        "All entitlements pages (Features, Editions, Permissions) are context-aware. The frontend detects whether the user is a system admin (tenantId is null), tenant admin, or in drill-down mode, and calls different backend endpoints accordingly. System admins see the full catalog with CRUD; tenant admins see only their effective data in read-only mode.",
    },
    editions: {
      title: "Editions",
      description:
        "Named subscription plans with feature bundles, overflow policies, versioning, and rollout strategies.",
      intro:
        "Editions are named plans (e.g. Basic, Pro, Enterprise) that bundle feature values together. Each tenant subscribes to an edition, which determines their feature access. Editions support versioning with controlled rollout strategies for safe deployment of changes.",
      entityTitle: "Edition Entity",
      entityIntro:
        "An Edition is a named plan that bundles feature values. System editions are created by platform admins; retail editions are created by reseller tenants for their child tenants.",
      overflowTitle: "Overflow Policy",
      overflowIntro:
        "When a tenant downgrades to an edition with lower limits, their existing resources may exceed the new limits. The OverflowPolicy determines what happens:",
      featuresTitle: "Edition Features",
      featuresIntro:
        "Each edition contains a set of EditionFeature records that map features to their values within that plan. Features not explicitly set in an edition fall back to the Feature.DefaultValue.",
      versionsTitle: "Edition Versions",
      versionsIntro:
        "Edition Versions provide a versioning and rollout system for feature changes. Instead of modifying features directly, admins can create a new version (snapshot), choose a rollout strategy, and publish it.",
      rolloutTitle: "Rollout Strategies",
      rolloutIntro:
        "When publishing an edition version, admins choose how the changes are deployed to subscribed tenants:",
      workflowTitle: "Apply Now vs Save as Version",
      workflowIntro:
        "NEXORA provides two ways to update edition features, each suited for different scenarios:",
      workflowTip:
        "Use 'Apply Now' for urgent fixes and small changes. Use 'Save as Version' for major plan updates that need staged rollout and audit trail.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The Editions controller exposes 11 endpoints for managing editions, their features, and version lifecycle:",
      scopingTitle: "System vs Retail Editions",
      scopingIntro:
        "NEXORA supports two types of editions: System editions created by platform admins visible to all tenants, and Retail editions created by reseller tenants for their child tenants only.",
      scopingNote:
        "Tenant administrators only see system editions plus their own retail editions. During drill-down, the system admin sees only the drilled-down tenant's visible editions (system + that tenant's retail). This ensures edition isolation between reseller tenants.",
      drillDownTitle: "Drill-Down Behavior",
      drillDownIntro:
        "When a system admin drills down into a tenant, the editions list is automatically scoped to show only editions visible to that tenant. The backend uses the X-Tenant-Context header to filter: system editions + retail editions created by the drilled-down tenant. The frontend hides CRUD actions in drill-down mode.",
      featuresTip:
        "Features not explicitly set in an edition fall back to Feature.DefaultValue. You only need to configure features that differ from the global default.",
      endpointsList: "List all editions (paginated, filterable)",
      endpointsGet: "Get edition details by ID",
      endpointsCreate: "Create a new edition",
      endpointsUpdate: "Update edition metadata",
      endpointsDelete: "Soft-delete an edition",
      endpointsGetFeatures: "List features configured for this edition",
      endpointsSetFeatures: "Set/update features for this edition",
      endpointsDirectApply: "Apply feature changes immediately (no versioning)",
      endpointsGetVersions: "List all versions for this edition",
      endpointsCreateVersion: "Create a new draft version with feature snapshot",
      endpointsPublishVersion: "Publish a draft version with chosen rollout strategy",
    },
    subscriptions: {
      title: "Subscriptions",
      description:
        "Tenant-to-edition binding with full lifecycle management, multi-currency pricing, promotions, trials, downgrades, expiry behavior, and advanced analytics export.",
      intro:
        "Subscriptions link tenants to editions (plans). Each tenant has a base subscription that determines their edition, and optionally add-on subscriptions for extra capabilities. The subscription system handles the full lifecycle from assignment through renewal, downgrade, suspension, and cancellation — complete with multi-currency pricing and promotional discount support.",
      entityTitle: "Subscription Entity",
      entityIntro:
        "A TenantSubscription binds a tenant to an edition with lifecycle tracking. It supports multiple subscription types and statuses for comprehensive lifecycle management.",
      typesTitle: "Subscription Types",
      typesIntro: "Each subscription has a type that determines its billing cycle and behavior:",
      lifecycleTitle: "Status Lifecycle",
      lifecycleIntro: "Subscriptions move through a series of statuses during their lifecycle:",
      downgradeTitle: "Downgrade Tracking",
      downgradeIntro:
        "When a tenant is downgraded (either manually or due to expiry), the system tracks the original subscription details for audit and potential restoration. The DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate, and DowngradedAt fields preserve the complete downgrade history.",
      downgradeWarning:
        "When downgrading, the OverflowPolicy of the target edition determines what happens to resources that exceed the new limits. Always use the Downgrade Impact endpoint to preview the effects before making changes.",
      expiryTitle: "Expiry Behavior",
      expiryIntro:
        "When a subscription expires, the ExpiryBehavior setting determines what happens next:",
      pricingTitle: "Multi-Currency Pricing",
      pricingIntro:
        "Each subscription carries full pricing metadata: Currency (ISO code), BaseAmount, AdjustmentAmount, TotalAmount, ExchangeRateToUsd, and TotalAmountUsd. This enables accurate revenue tracking across 9+ supported currencies (USD, EUR, GBP, SAR, AED, EGP, TRY, INR, and more).",
      exchangeRateTitle: "USD Normalization",
      exchangeRateIntro:
        "All amounts are normalized to USD via ExchangeRateToUsd for consistent MRR/ARR reporting. The TotalAmountUsd field is computed at subscription time and stored for historical accuracy — exchange rate fluctuations do not retroactively change past records.",
      promotionsTitle: "Promotional Discounts",
      promotionsIntro:
        "Subscriptions support promo codes via the AppliedPromoCode field. When a valid promotion is applied, a PromotionDiscount percentage is recorded and the AdjustmentAmount reflects the discount applied to the BaseAmount. Promotions are tracked per-subscription for audit and analytics.",
      exportTitle: "Advanced Export & Reporting",
      exportIntro:
        "The subscription export system generates comprehensive reports in CSV, Excel (XLSX), and PDF formats. Each report includes a cover page with filter metadata, color-coded data tables, and statistical summaries.",
      exportFiltersTitle: "Export Filters",
      exportFiltersIntro: "Reports support advanced filtering for targeted analytics:",
      exportFilterDate:
        "Date Range — filter by subscription creation date (last 7/30/90 days, last year, or custom range)",
      exportFilterExpiring:
        "Expiring Soon — find subscriptions expiring within 5/7/14/30/60/90 days",
      exportFilterStatus: "Status — Active, Suspended, Cancelled, Expired",
      exportFilterEdition: "Edition — filter by specific plan/edition",
      exportFilterCurrency: "Currency — display amounts in selected currency",
      exportDaysLeftTitle: "Days Until Expiry",
      exportDaysLeftIntro:
        "Reports include a computed 'Days Left' column with conditional color coding: red (≤7 days), yellow (≤30 days), green (>30 days). This enables at-a-glance identification of subscriptions requiring renewal attention.",
      exportFormatsTitle: "Export Format Details",
      exportFormatCsv: "CSV — lightweight, importable into any spreadsheet or BI tool",
      exportFormatExcel:
        "XLSX — professional Excel workbook with styled headers, filter metadata sheet, conditional formatting, and auto-sized columns (ClosedXML)",
      exportFormatPdf:
        "PDF — print-ready document with branded cover page, statistical summary, and paginated data tables (QuestPDF)",
      renewalTitle: "Renewal — New Row Pattern (B2)",
      renewalIntro:
        "Renewals create a NEW TenantSubscription row instead of overwriting the existing record in-place (Stripe pattern). The old subscription is marked Expired (IsActive=false), while a new row is created with a fresh Id, StartDate=UtcNow, recalculated pricing, and carried-forward promotion details. This preserves a complete revenue audit trail per billing cycle.",
      renewalAuditTitle: "Revenue Audit Trail",
      renewalAuditIntro:
        "Each billing cycle produces its own immutable database row with locked-in pricing at the time of renewal. This enables precise financial reporting: MRR trends, churn analysis by period, and refund tracking per cycle — never losing historical pricing data.",
      promoExpiryTitle: "Promotion Expiry Tracking (A1)",
      promoExpiryIntro:
        "When a promotion with DurationDays > 0 is applied, the system calculates a PromotionExpiresAt timestamp. On each renewal, the handler checks if UtcNow > PromotionExpiresAt — if the promo has expired, the discount is stripped and NOT carried forward to the new subscription row. Null PromotionExpiresAt means the promotion lasts forever.",
      concurrencyTitle: "Optimistic Concurrency (E1)",
      concurrencyIntro:
        "Each TenantSubscription has a ConcurrencyStamp (Guid) marked with [ConcurrencyCheck]. The stamp is refreshed (Guid.NewGuid()) on every write operation. This prevents race conditions — for example, a concurrent cancel + reconciliation job — by throwing DbUpdateConcurrencyException on mid-air collisions.",
      validationTitle: "Input Validation (G1)",
      validationIntro:
        "All 8 subscription commands have dedicated FluentValidation validators in SubscriptionCommandValidators.cs. Validators inject ILocalizer for localized error messages (EN + AR). Business rules include: cannot renew as Trial, cannot convert to Trial, positive refund amounts, string length limits, and required field checks. Validation runs in the MediatR pipeline before the handler executes.",
      crossModuleTitle: "Cross-Module Integration (H1)",
      crossModuleIntro:
        "Subscription lifecycle events publish domain events consumed by the Identity module. When a subscription is suspended, all tenant admins are deactivated with DeactivationReason='SubscriptionSuspended'. On resume, only admins with that specific reason are reactivated — manually-deactivated admins stay off. Expiry cascades deactivation to all descendant tenants.",
      crossModuleReasons:
        "Three deactivation reasons: 'Manual' (admin manually deactivated — never auto-reactivated), 'SubscriptionSuspended' (reactivated on resume), 'SubscriptionExpired' (deactivated on expiry).",
      impactTitle: "Downgrade Impact Analysis",
      impactIntro:
        "Before changing a tenant's edition, use the Downgrade Impact endpoint to preview which resources would overflow. The response lists every feature that would exceed the new edition's limits, along with the current usage vs. new limit.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The Subscriptions controller provides 13 endpoints covering the full subscription lifecycle:",
      operationsTitle: "Subscription Operations",
      operationsIntro:
        "The subscription module supports a comprehensive set of lifecycle operations. Each operation transitions the subscription to a new state with full audit tracking.",
      assignTitle: "Assign Subscription",
      assignIntro:
        "Create a new subscription linking a tenant to an edition. If the tenant already has an active subscription, the previous one is automatically cancelled. Supports optional currency, promo code, and expiry behavior parameters.",
      upgradeTitle: "Upgrade & Downgrade",
      upgradeIntro:
        "Tenants can move between editions. Upgrades apply immediately with the new edition's features taking effect right away. Downgrades check the OverflowPolicy first to handle resources that exceed new limits.",
      trialTitle: "Trial Conversion",
      trialIntro:
        "Trial subscriptions have a TrialEndDate. When a trial is upgraded to a paid plan, IsTrialConverted is set to true and the subscription transitions to the new type. If the trial expires without conversion, ExpiryBehavior determines what happens next.",
      ep: {
        list: "List all subscriptions (paginated, filterable by status/type/tenant)",
        get: "Get subscription details by ID",
        assign: "Create a new subscription (assign tenant to edition with currency/promo)",
        upgrade: "Upgrade to a higher edition",
        downgrade: "Downgrade to a lower edition (checks OverflowPolicy)",
        impact: "Preview downgrade impact before executing",
        suspend: "Suspend subscription (block tenant access)",
        resume: "Resume a suspended subscription",
        cancel: "Cancel subscription permanently",
        renew: "Renew an expiring subscription",
        tenantActive: "Get the active subscription for a specific tenant",
        export: "Export subscriptions as CSV, Excel, or PDF with advanced filters",
      },
    },
    features: {
      title: "Features",
      description:
        "Controllable platform capabilities with Boolean, Numeric, and String value types.",
      intro:
        "Features are the atomic building blocks of the Entitlements system. Each feature represents a controllable capability — a boolean toggle, a numeric quota, or a string configuration. Features have a stable system key (Name) that never changes, making them safe to reference in code.",
      entityTitle: "Feature Entity",
      entityIntro:
        "A Feature defines a controllable platform capability. The Name field is a stable system key used in code; DisplayNameEn/DisplayNameAr are user-facing labels.",
      valueTypesTitle: "Value Types",
      valueTypesIntro:
        "Feature values are stored as strings but interpreted according to their ValueType. The system validates values against the expected type at creation and update time.",
      valueTypesTip:
        "For Numeric features, use -1 to represent 'unlimited'. The FeatureCheckBehavior recognizes -1 as a special value and never blocks requests for features with an unlimited quota.",
      systemVsCustomTitle: "System vs Custom Features",
      systemVsCustomIntro:
        "NEXORA distinguishes between system features (seeded at startup, read-only) and custom features (created by admins via API):",
      cacheTitle: "Feature Cache",
      cacheIntro:
        "Resolved feature values are cached in the IFeatureCache to avoid database queries on every request. The cache is invalidated whenever an edition's features change, a subscription is modified, or an override is set/removed. In microservice deployments without the Entitlements module, a NoOpFeatureCache treats all features as enabled.",
      requireFeatureTitle: "IRequireFeature Interface",
      requireFeatureIntro:
        "To gate a CQRS command or query behind a feature, implement the IRequireFeature marker interface. The FeatureCheckBehavior pipeline behavior automatically resolves the tenant's current value and rejects the request if the feature is disabled.",
      requireFeatureNote:
        "IRequireFeature works for both Boolean features (checked as enabled/disabled) and Numeric features (checked as remaining quota). The behavior automatically determines the check type from the Feature.ValueType.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The Features controller exposes 5 CRUD endpoints. System features cannot be deleted:",
      seedingTitle: "Feature Seeding",
      seedingIntro:
        "System features are automatically seeded at application startup by EntitlementsStartupSeeder. The seeder checks if each system feature already exists (by Name) and only creates missing ones — existing features are never overwritten.",
      quotaTitle: "Quota Tracking (QuotaCounter)",
      quotaIntro:
        "Numeric features support automatic quota enforcement via the QuotaCounter entity. The FeatureCheckBehavior checks the current usage against the resolved limit for every IRequireFeature command targeting a numeric feature.",
      cacheNote:
        "The cache is automatically invalidated when: (1) an edition's features are modified, (2) a subscription is assigned/changed, (3) an override is set/removed. No manual cache busting is needed.",
      patternTitle: "IRequireFeature Pattern",
      patternIntro:
        "To gate any CQRS command behind a feature check, simply implement the IRequireFeature marker interface. The FeatureCheckBehavior automatically intercepts the request, resolves the tenant's feature value, and rejects if disabled or over quota.",
      contextAwareTitle: "Context-Aware Feature Display",
      contextAwareIntro:
        "The features list page is context-aware. System admins see the full feature catalog with CRUD operations. Tenant admins and drill-down sessions see only the tenant's effective features (resolved from their edition + overrides) in read-only mode. All scoping is backend-driven via GET /features (catalog) vs GET /features/effective (tenant-scoped).",
      ep: {
        list: "List all features (paginated, filterable by category/type)",
        get: "Get feature details by ID",
        create: "Create a new custom feature",
        update: "Update feature metadata (system features: DefaultValue/Description only)",
        delete: "Soft-delete a custom feature (system features cannot be deleted)",
      },
    },
    overrides: {
      title: "Feature Overrides",
      description: "Per-tenant feature value customization that bypasses edition defaults.",
      intro:
        "Feature Overrides allow platform administrators to customize feature values for individual tenants, regardless of their subscribed edition. Overrides take the highest priority in the resolution chain, making them perfect for custom sales deals, special promotions, or one-off exceptions.",
      entityTitle: "Override Entity",
      entityIntro:
        "A TenantFeatureOverride sets a custom value for a specific feature on a specific tenant. It includes an optional Reason field for audit purposes.",
      priorityTitle: "Resolution Priority",
      priorityIntro:
        "Overrides sit at the top of the resolution chain. When the system resolves a feature value for a tenant, it checks for an override first:",
      whenTitle: "When to Use Overrides",
      whenIntro:
        "Overrides are designed for exceptional cases where a tenant needs a different value than their edition provides:",
      useCase1: "Custom enterprise deals — 'Give Acme Corp 500 admins instead of the standard 50'",
      useCase2: "Promotional offers — 'Enable Premium Chat for this tenant for 30 days'",
      useCase3: "Beta testing — 'Enable the new Invoicing module for early adopters'",
      useCase4: "Temporary escalation — 'Increase file upload limit during their migration'",
      overuseWarning:
        "Overrides should be used sparingly. If many tenants need the same override, consider creating a new edition instead. Excessive overrides make the system harder to manage and audit.",
      resolvedTitle: "Resolved Features Endpoint",
      resolvedIntro:
        "The GET /api/v1/tenants/{tenantId}/features/resolved endpoint returns the final, effective value for every feature for a given tenant. It shows the resolution source (Override, Edition, or Default) for each entry, making it easy to debug and audit.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The TenantFeatures controller exposes 4 endpoints for managing per-tenant overrides and resolved values:",
      scenariosTitle: "Use Case Scenarios",
      scenariosIntro:
        "The following real-world scenarios demonstrate when overrides provide the most value:",
      settingTitle: "Setting an Override",
      settingIntro:
        "To set an override, POST to the tenant features endpoint with the feature ID, custom value, and an optional reason for audit purposes.",
      settingTip:
        "Always include a reason when setting overrides — it makes audit trails meaningful and helps future admins understand why the override was applied.",
      expiryTitle: "Expiring Overrides",
      expiryIntro:
        "Overrides can have an optional ExpiresAt date. When the expiration date passes, the override is automatically deactivated and the feature falls back to the edition value (or global default).",
      expiryNote:
        "Expired overrides are soft-deactivated (IsActive = false), not deleted. This preserves the audit trail and allows re-activation if needed.",
      auditTitle: "Audit Trail",
      auditIntro:
        "Every override operation is tracked with full audit information. The Reason field on each override provides context for why the custom value was applied.",
      bestPracticesTitle: "Best Practices",
      bestPracticesIntro:
        "Follow these guidelines to keep your override system maintainable and auditable.",
      bestPracticesWarning:
        "Overrides should be used sparingly. If many tenants need the same override, consider creating a new edition instead. Excessive overrides make the system harder to manage and create maintenance debt.",
      ep: {
        list: "List all overrides for a specific tenant",
        set: "Set or update a feature override for a tenant",
        remove: "Remove (deactivate) a feature override",
        resolved:
          "Get all resolved feature values for a tenant (shows source: Override/Edition/Default)",
      },
    },
  },
};
