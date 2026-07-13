// FILE-EXCEPTION: file length
/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  modules: {
    customFields: {
      overview: {
        title: "Custom Fields Module",
        description:
          "Tenant-configurable custom field definitions attached to any registered entity type by stable key — no schema changes, no cross-module coupling.",
        intro:
          "The Custom Fields module lets each tenant extend the platform's records with their own typed fields — for example a 'shirt size' on a person or a 'preferred foot' on a player — without any database migration or code change. Field definitions are tenant-scoped and attach to a host entity through the cross-module Entity-Type Registry rather than a foreign key, so the module never couples to another module's schema.",
        infoTitle: "Design Principle",
        infoContent:
          "Custom fields are attached by stable entity-type key (e.g. \"party.person\"), validated against the Entity-Type Registry, not by a database foreign key. This keeps the module fully decoupled and safe to evolve independently.",
        whatIsTitle: "What Are Custom Fields?",
        whatIsIntro:
          "A custom field is a tenant-defined extension to an existing entity. Each definition carries a machine key (unique per tenant and entity type), bilingual labels, a value type, an optional required flag, an optional list of allowed options for Select fields, and a sort order. Values are stored typed rather than in an untyped JSON blob.",
        featureTenant: "Tenant-Scoped",
        featureTenantDesc:
          "Every definition is owned by a tenant and isolated by the global tenant query filter. System-level (shared) definitions are supported for platform operators.",
        featureRegistry: "Registry-Validated Attachment",
        featureRegistryDesc:
          "Fields attach to a host entity via its canonical entity-type key, validated against the cross-module Entity-Type Registry — never via a foreign key.",
        featureTyped: "Typed Values",
        featureTypedDesc:
          "Each field declares a value type (Text, Number, Boolean, Date, or Select), avoiding an untyped metadata blob and enabling proper validation.",
        featureIsolation: "Immutable Keys",
        featureIsolationDesc:
          "The entity-type key and machine key are immutable after creation so already-stored values remain addressable; only display and behaviour metadata can be edited.",
        valueTypesTitle: "Value Types",
        valueTypesIntro:
          "Supported value types are Text, Number, Boolean, Date, and Select. Select fields carry a newline-separated list of allowed options; non-Select fields must not carry options. The API enforces this on both create and update.",
        modelTitle: "Data Model",
        modelIntro:
          "A CustomField carries: EntityTypeKey (registered), Key (machine key, unique per tenant + entity type), LabelEn / LabelAr, ValueType, IsRequired, Options (Select only), SortOrder, and IsActive. Uniqueness is enforced per (TenantId, EntityTypeKey, Key).",
        isolationTitle: "Tenant Isolation",
        isolationIntro:
          "Reads run under the module's global tenant filter, so a tenant only sees its own definitions plus shared system-level ones. Create stamps the current tenant automatically. Update and Delete enforce an ownership guard so a tenant admin can never modify or remove a shared or another tenant's definition.",
        isolationWarnTitle: "System-Level Fields",
        isolationWarnContent:
          "Definitions with no tenant are treated as shared/global and are visible to every tenant. Only system principals (no tenant context) may modify or delete them; tenant-scoped admins are blocked by the ownership guard.",
        permsTitle: "Permissions",
        permsIntro:
          "The module owns the resource custom-fields with the standard CRUD actions: custom-fields.view, custom-fields.create, custom-fields.update, and custom-fields.delete.",
      },
    },
    entitlementsOverview: {
      title: "Entitlements Overview",
      description:
        "Edition-based feature gating with Features, Editions, Subscriptions, and per-tenant Overrides.",
      intro:
        "The Entitlements module is SCRIPE's plan-and-feature management engine. It defines what capabilities each tenant gets, how plans (editions) bundle those capabilities, and how subscriptions link tenants to plans.",
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
        "SCRIPE integrates entitlements directly into the SCRIPE mediator CQRS pipeline via FeatureCheckBehavior. Commands and queries that implement IRequireFeature are automatically gated — if the tenant's resolved feature value is disabled, the request is rejected before reaching the handler.",
      pipelineTip:
        "To gate a command behind a feature, simply implement IRequireFeature and set RequiredFeatureName to the feature's stable system key (e.g. 'Chat.Enabled'). No additional code is needed.",
      backendTitle: "Backend Structure",
      backendIntro:
        "The Entitlements backend follows SCRIPE's standard Clean Architecture module layout with Domain, Application, and Infrastructure layers.",
      frontendTitle: "Frontend Structure",
      frontendIntro:
        "The frontend mirrors the backend with four sub-modules (editions, features, subscriptions, overrides), each following the SOLID View/ViewModel pattern.",
      controllersTitle: "API Controllers",
      controllersIntro:
        "The Entitlements module exposes 31 API endpoints across 4 controllers, all authenticated with JWT and protected by permission-based authorization.",
      noOpTitle: "NoOp Fallback",
      noOpIntro:
        "When the Entitlements module is not loaded (e.g. in a microservice that doesn't include Entitlements), SCRIPE registers a NoOpFeatureCache. This allows IRequireFeature commands to pass through without errors — all features are treated as enabled by default.",
      noOpNote:
        "The NoOp fallback ensures that modules can use IRequireFeature without a hard dependency on the Entitlements module. In production monolith mode, the real FeatureCache is always available.",
      resolutionTip:
        "The resolution chain is evaluated lazily — values are cached after first resolution and invalidated when subscriptions, editions, or overrides change.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "The Entitlements module registers 31 SCRIPE request handlers spanning the four domains. Each command has a corresponding FluentValidation validator for input validation.",
      diTitle: "Dependency Injection Registration",
      diIntro:
        "All Entitlements services are registered via the AddEntitlementsModule extension method in DependencyInjection.cs. The module follows SCRIPE's standard registration pattern.",
      comparisonTitle: "With vs Without Entitlements",
      comparisonIntro:
        "The following table shows the difference in capabilities when the Entitlements module is enabled versus running without it:",
      gettingStartedTitle: "Getting Started",
      gettingStartedIntro:
        "Follow these 5 steps to set up the Entitlements system for your platform. Each step builds on the previous one:",
      contextAwareTitle: "Context-Aware Scoping",
      contextAwareIntro:
        "All entitlements pages (Features, Editions, Permissions) are context-aware. The frontend detects whether the user is a system admin (tenantId is null), tenant admin, or in drill-down mode, and calls different backend endpoints accordingly. System admins see the full catalog with CRUD; tenant admins see only their effective data in read-only mode.",
      quotaGatingTitle: "Quota Gating & Slot Reservations",
      quotaGatingIntro:
        "Numeric features represent quotas that are enforced when creating tenant resources. SCRIPE uses a concurrency-safe, atomic reservation pattern to manage these limits.",
      quotaGatingNote:
        "The QuotaCounterRepository TryReserveSlotAsync increments the Reserved counter. The handler confirms this reservation on success, or releases it on failure, with a fail-open strategy on database exception.",
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
        "SCRIPE provides two ways to update edition features, each suited for different scenarios:",
      workflowTip:
        "Use 'Apply Now' for urgent fixes and small changes. Use 'Save as Version' for major plan updates that need staged rollout and audit trail.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The Editions controller exposes 11 endpoints for managing editions, their features, and version lifecycle:",
      scopingTitle: "System vs Retail Editions",
      scopingIntro:
        "SCRIPE supports two types of editions: System editions created by platform admins visible to all tenants, and Retail editions created by reseller tenants for their child tenants only.",
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
      seededTitle: "Seeded System Editions",
      seededIntro:
        "The platform seeds two standard system editions out of the box on startup via EditionSeeder, establishing default limits for features.",
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
        "All 8 subscription commands have dedicated FluentValidation validators in SubscriptionCommandValidators.cs. Validators inject ILocalizer for localized error messages (EN + AR). Business rules include: cannot renew as Trial, cannot convert to Trial, positive refund amounts, string length limits, and required field checks. Validation runs in the SCRIPE mediator pipeline before the handler executes.",
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
        "SCRIPE distingscripehes between system features (seeded at startup, read-only) and custom features (created by admins via API):",
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
      mergingTitle: "Subscription Merging & Sorting",
      mergingIntro:
        "When a tenant has multiple active subscriptions (such as a base plan and an add-on), features are merged. Subscriptions are loaded and sorted by their type ascending: Lifetime (0) → Monthly (1) → Yearly (2) → Trial (3) → AddOn (4) → Free (5).",
      permissionsSyncTitle: "Permission Auto-Population",
      permissionsSyncIntro:
        "When a subscription becomes active or trialing, a SubscriptionChangedEvent is published. This is handled by SubscriptionChangedEventHandler in the Identity module to automatically synchronize the tenant's permissions pool and super admin role permissions.",
    },
    compliance: {
      overview: {
        title: "Compliance Module",
        description:
          "GDPR, CCPA, and PDPA compliance automation — regulations, DSR handling, consent management, data retention, inventory, and report generation.",
        intro:
          "The Compliance module is SCRIPE's built-in regulatory compliance engine. It helps platform operators and their tenants stay compliant with major data protection laws (GDPR, CCPA, PDPA) through automated tools for managing data subject requests, consent records, retention policies, and generating audit-ready compliance reports.",
        infoTitle: "Compliance Notice",
        infoContent:
          "The Compliance module is critical for maintaining regulatory adherence and avoiding fines. Ensure all features are correctly mapped to data processing policies.",
        // Feature Grid
        featureDsr: "Data Subject Requests",
        featureDsrDesc:
          "Handles Subject Requests including Export, Erasure, Rectification, and Restriction with full lifecycle tracking and SLA monitoring.",
        featureConsent: "Consent Management",
        featureConsentDesc:
          "Immutable tracking of consent states, snapshots, and audit trails for GDPR Article 6 and CCPA compliance.",
        featureRetention: "Retention Policies",
        featureRetentionDesc:
          "Enforces data destruction policies based on configurable retention periods with automated Delete or Anonymize actions.",
        featureInventory: "Data Inventory",
        featureInventoryDesc:
          "Maps sensitive PII locations across modules — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        featureReports: "Compliance Reports",
        featureReportsDesc:
          "Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        featureWebhooks: "Webhook Events",
        featureWebhooksDesc:
          "11 real-time webhook events covering DSR lifecycle, consent changes, retention enforcement, and report generation.",
        // Sub-Modules
        descDsr: "Handles Subject Requests (Export, Erasure, Rectification)",
        descConsent: "Immutable tracking of consent states & snapshots",
        descRet: "Enforces data destruction policies based on age",
        descInv: "Maps sensitive PII locations across modules",
        descRep: "Generates RoPA and DPIA compliance reports",
        descId: "Identity Module",
        descIdDesc: "Provides User/Admin context & Auth",
        descEnt: "Entitlements Module",
        descEntDesc: "Feature-gates compliance capabilities",
        conn1: "initiates requests",
        conn2: "grants/revokes",
        conn3: "gates policies",
        conn4: "guides erasure",
        conn5: "targets data",
        conn6: "audit trails",
        conn7: "audit trails",
        // Frontend Table
        th1: "Component",
        th2: "Responsibility",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Handles the pagination, filtering, and assignment of incoming Data Subject Requests.",
        tr2_1: "ConsentRecordView",
        tr2_2:
          "Renders the immutable consent snapshot alongside user agent and timestamp metadata.",
        // What Is
        whatIsTitle: "What is the Compliance Module?",
        whatIsIntro:
          "The Compliance module provides six interconnected sub-systems that cover the full compliance lifecycle. Instead of building compliance tooling from scratch, SCRIPE tenants get a production-ready system that tracks, automates, and reports on their data protection obligations.",
        subModulesTitle: "Six Sub-Systems",
        subModulesIntro: "Each sub-system handles a specific compliance domain:",
        sub1: "Regulation Profiles — Stores the regulatory frameworks (GDPR, CCPA, PDPA) that the platform operates under.",
        sub2: "Data Subject Requests (DSR) — Manages rights requests from data subjects (export, erasure, rectification, restriction).",
        sub3: "Consent Management — Records, tracks, and audits user consent grants and withdrawals.",
        sub4: "Data Retention Policies — Defines how long data is kept and what happens when it expires (delete or anonymize).",
        sub5: "Data Inventory — A registry of all personal data categories the platform processes.",
        sub6: "Compliance Reports — Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, etc.).",
        // Regulations
        regulationsTitle: "Supported Regulations",
        regulationsIntro:
          "SCRIPE's Compliance module supports enforcement of these major data protection regulations. Each regulation is pre-seeded with its SLA deadlines and penalty structures.",
        regName: "Regulation",
        regRegion: "Region / Jurisdiction",
        regSla: "Response SLA",
        regPenalty: "Maximum Penalty",
        regGdprRegion: "European Union (EU/EEA)",
        regCcpaRegion: "California, USA",
        regLgpdRegion: "Brazil",
        regPopiaRegion: "South Africa",
        regPdpaRegion: "Singapore",
        // Backend Architecture
        backendTitle: "Backend Architecture",
        backendIntro:
          "The Compliance backend follows the standard SCRIPE 3-project module layout (Domain / Application / Infrastructure) with a dedicated ComplianceDbContext and ComplianceController.",
        // CQRS
        cqrsTitle: "CQRS Commands & Queries",
        cqrsIntro:
          "The Compliance module uses the standard SCRIPE mediator CQRS pattern. Commands handle write operations and Queries handle read operations, each with dedicated FluentValidation validators.",
        cqrsType: "Type",
        cqrsExample: "Handler",
        cqrsDesc: "Description",
        cqrsSubmit: "Submits a new Data Subject Request with validation and SLA calculation",
        cqrsReview: "Reviews and updates the status of a DSR (approve, reject, complete)",
        cqrsConsent: "Records a consent grant with full audit metadata (IP, user agent, version)",
        cqrsRetention: "Updates retention policy configuration (days, action, active status)",
        cqrsDsrList: "Lists all DSRs with pagination, filtering by status/type/regulation",
        cqrsConsentAnalytics: "Aggregates consent statistics by purpose, status, and time period",
        cqrsDashboard: "Returns a summary dashboard with counts across all compliance sub-systems",
        // Frontend Architecture
        frontendTitle: "Frontend Architecture",
        frontendIntro:
          "The frontend is organized as six independent sub-modules under src/modules/compliance/, each with its own domain, data, and presentation layers following the View/ViewModel pattern.",
        // API Endpoints
        endpointsTitle: "API Endpoints Overview",
        endpointsIntro:
          "All endpoints are under /api/v1/compliances/ and require authentication with the compliance.view permission.",
        apiRegList: "List all regulation profiles configured for the platform",
        apiDsrSubmit:
          "Submit a new Data Subject Request (Export, Erasure, Rectification, Restriction)",
        apiDsrList: "List all DSRs with pagination, filtering by status/type/regulation",
        apiDsrReview: "Review a DSR — approve, reject, or mark as completed with resolution notes",
        apiConsentRecord: "Record a new consent grant with full audit metadata",
        apiConsentAnalytics: "Retrieve consent analytics (grant/withdrawal rates by purpose)",
        apiRetentionList: "List all retention policies with enforcement status",
        apiRetentionUpdate: "Update a retention policy (days, action, active status)",
        apiInventoryList: "List all data inventory items (GDPR Article 30 RoPA)",
        apiReportsList: "List all compliance reports with status and type filters",
        apiReportDownload: "Download a generated report in CSV, JSON, XLSX, or PDF format",
        apiReportGenerate: "Queue a new async compliance report generation job",
        apiDashboard: "Retrieve the compliance dashboard summary (counts, SLA status, alerts)",
        // Webhook Events
        webhooksTitle: "Webhook Events",
        webhooksIntro:
          "The Compliance module fires 11 real-time webhook events that external systems can subscribe to. Events are auto-registered via the ComplianceWebhookEventCatalog and dispatched through the IWebhookDispatcher pipeline.",
        webhookEvent: "Event Key",
        webhookCategory: "Category",
        webhookDesc: "Description",
        whDsrSubmitted: "Fired when a new Data Subject Request is submitted",
        whDsrStatusChanged:
          "Fired when a DSR status transitions (Pending → InProgress → Completed/Rejected)",
        whDsrCompleted: "Fired when a DSR is fully completed (data exported, erased, or rectified)",
        whDsrErasure: "Fired when an erasure DSR is confirmed by an admin (nuclear action)",
        whDsrCancelled: "Fired when a DSR is cancelled before completion",
        whConsentGranted: "Fired when a user grants consent for a specific purpose",
        whConsentWithdrawn: "Fired when a user withdraws previously granted consent",
        whRetentionUpdated: "Fired when a retention policy configuration is updated",
        whRetentionExec: "Fired when a retention enforcement job completes execution",
        whReportGenerated: "Fired when a compliance report generation completes successfully",
        whReportFailed: "Fired when a compliance report generation fails",
        // Quick Start Guide
        quickStartTitle: "Quick Start Guide",
        step1Title: "Seed Compliance Data",
        step1Content:
          "Run the development seeder to populate regulation profiles, sample consent purposes, and retention policies for your test environment.",
        step2Title: "Configure Regulation Profiles",
        step2Content:
          "Navigate to Compliance → Regulations in the admin panel. Enable the regulations your platform operates under (GDPR, CCPA, PDPA). Each regulation defines the SLA deadlines and penalty structures that will be enforced.",
        step3Title: "Submit a Test DSR",
        step3Content:
          "Create a Data Subject Request to test the full lifecycle. The system will validate the request, calculate the SLA deadline, and make it available for assignment to a compliance officer.",
        step4Title: "Record Consent & Configure Retention",
        step4Content:
          "Set up consent purposes (Marketing, Analytics, Third-Party) and configure retention policies for each data category. The retention enforcement job will automatically apply the configured actions when data ages past the retention period.",
        step5Title: "Generate a Compliance Report",
        step5Content:
          "Queue an async compliance report. The report will be generated in the background and appear in the Reports list once ready. Download it in CSV, JSON, XLSX, or PDF format.",
        // Security
        securityTitle: "Security Considerations",
        securityIntro:
          "Compliance data is among the most sensitive in the platform. All endpoints are protected by JWT authentication, role-based authorization, and encrypted ID transit. Personal data in DSRs and consent records is subject to field-level security restrictions.",
        securityWarningTitle: "Data Protection Warning",
        securityWarningContent:
          "Compliance data contains personally identifiable information (PII). Ensure proper access controls, audit logging, and data encryption are configured. Never expose raw compliance endpoints without authentication.",
        secDoTitle: "Recommended Practices",
        secDo1: "Enable field-level security for PII fields in DSR responses",
        secDo2: "Configure webhook secrets for all compliance event subscriptions",
        secDo3: "Set retention policies for compliance data itself (meta-compliance)",
        secDo4: "Review audit logs regularly for unauthorized access attempts",
        secDontTitle: "Anti-Patterns to Avoid",
        secDont1: "Never expose DSR endpoints without AdminOnly authentication",
        secDont2: "Never skip consent version tracking — it invalidates the audit trail",
        secDont3: "Never hard-delete compliance records — always use soft-delete",
        secDont4: "Never bypass the webhook dispatcher for compliance events",
      },
      dsr: {
        title: "Data Subject Rights (DSR)",
        description: "Description",
        intro:
          "Data Subject Requests (DSRs) are formal requests from individuals exercising their rights under data protection laws. The Compliance module provides a complete, structured DSR workflow: submission, assignment, review, processing, and closure — with a full append-only audit trail and SLA tracking.",
        typesTitle: "Request Types",
        typesIntro: "The system supports five DSR types as defined by GDPR and CCPA regulations:",
        typesType: "Request Type",
        typesDesc: "Description",
        typesGdpr: "GDPR Reference",
        typesAccessDesc:
          "Right of Access (Article 15). Subject requests a list of processing purposes, categories of personal data, and recipients.",
        typesExportDesc:
          "Right to Data Portability (Article 20). Subject requests a machine-readable copy of their personal data.",
        typesErasureDesc:
          "Right to Erasure / Right to be Forgotten (Article 17). Subject requests permanent deletion or anonymization of their PII.",
        typesRectificationDesc:
          "Right to Rectification (Article 16). Subject requests correction of inaccurate or incomplete personal data.",
        typesRestrictionDesc:
          "Right to Restriction of Processing (Article 18). Subject requests suspension of data processing while maintaining data storage.",
        lifecycleTitle: "Request Lifecycle",
        lifecycleIntro:
          "DSR tickets are modeled as state transitions with a review cycle and safety confirmation gates to prevent accidental and irreversible deletions:",
        lifecycleFlowTitle: "DSR Request Lifecycle & Safety Gates",
        nodeSubmit: "1. Submit Request",
        descSubmit:
          "Subject submits DSR via SubmitDsrCommand. Status is set to Pending and SLA deadline is calculated.",
        nodeReview: "2. Admin Review",
        descReview:
          "Admin reviews request via ReviewDsrCommand, transitioning state to Approved or Rejected.",
        nodeConfirm: "3. Confirm Erasure",
        descConfirm:
          "Erasure requests require manual confirmation via ConfirmErasureCommand, setting ErasureConfirmed = true.",
        nodeProcessing: "4. DSR Execution Job",
        descProcessing:
          "DsrExecutionJob running every 5 min picks up confirmed/approved requests in batches of 50.",
        nodeCompleted: "5. Status: Completed",
        descCompleted: "Successfully executed across all modules, storing completion timestamp.",
        nodeRejected: "Status: Rejected",
        descRejected: "Request is rejected by admin during review. Resolution notes are saved.",
        nodeCancelled: "Status: Cancelled",
        descCancelled:
          "Pending, InReview, or Approved requests can be manually cancelled at any time.",
        nodePartial: "6. Partially Completed",
        descPartial:
          "If any module provider fails, DSR transitions to PartiallyCompleted and increments RetryCount (max 3).",
        connSubmitReview: "Assigns and moves to InReview",
        connReviewApprove: "Approves request",
        connReviewReject: "Rejects request",
        connApproveConfirm: "Required for Erasure",
        connConfirmExec: "Picks up for processing",
        connExecComplete: "All modules succeed",
        connExecPartial: "Any module fails",
        connPartialRetry: "Retries failed modules",
        connCancel: "Cancels request",
        executionFlowTitle: "DSR Anonymization Execution Flow",
        nodeExecJob: "DsrExecutionJob Trigger",
        descExecJob: "Runs every 5 minutes and retrieves approved requests ready for erasure.",
        nodeCheckSafety: "Safety Check Gate",
        descCheckSafety:
          "Verifies that ErasureConfirmed = true and ErasureExecuteAfter grace period has passed.",
        nodeGenToken: "Generate Anonymization Token",
        descGenToken: "Generates secure SHA-256 anonymization token based on Subject ID.",
        nodeFanOut: "Module Fan-Out",
        descFanOut:
          "Iterates through all registered compliance providers implementing IUserDataAnonymizer.",
        nodeModuleExec: "Zero-Allocation Execution",
        descModuleExec:
          "Executes database updates via EF Core's ExecuteUpdateAsync to wipe PII fields.",
        nodeEvalStatus: "Evaluate Results",
        descEvalStatus: "Checks module execution records for successful completions.",
        nodeComplete: "Set Status: Completed",
        descComplete: "DSR ticket is marked Completed and CompletedAt timestamp is stored.",
        nodePartialLimit: "Set Status: PartiallyCompleted",
        descPartialLimit:
          "Logs error, increments RetryCount, and queues failed modules for retry (max 3).",
        connJobCheck: "fetches batch",
        connCheckGen: "if safety gates passed",
        connGenFan: "builds token",
        connFanMod: "invokes anonymizers",
        connModEval: "gathers statuses",
        connEvalComplete: "if all succeeded",
        connEvalPartial: "if any failed",
        slaTitle: "SLA Tracking & Deadline Calculations",
        slaIntro:
          "Compliance regulations dictate strict response timelines. SCRIPE automatically calculates and tracks SLA metrics on the admin dashboard:",
        slaWarningTitle: "SLA Deadline Logic",
        slaWarningContent:
          "Deadlines are computed upon submission by reading the active RegulationProfile (GDPR: 30 days, CCPA: 45 days). SLA progress is calculated dynamically as a percentage: (Current Time - CreatedAt) / (Deadline - CreatedAt) * 100.",
        escalationTitle: "Escalation Engine & Alerts",
        escalationIntro:
          "The DsrEscalationJob runs daily at 08:00 UTC to evaluate SLA consumption and escalate overdue tickets:",
        escalationTier1:
          "Tier 1 (50% SLA) — Standard reminder alert sent to the assigned admin. Logs status history note: [SLA-ESCALATION-50%].",
        escalationTier2:
          "Tier 2 (75% SLA) — Warning escalation. Logs status history note: [SLA-ESCALATION-75%] and dispatches compliance.dsr_sla_escalated webhook.",
        escalationTier3:
          "Tier 3 (90% SLA) — Critical escalation. Logs status history note: [SLA-ESCALATION-90%], alerts system managers, and sends critical webhook.",
        providerTitle: "Extensible Provider Architecture",
        providerIntro:
          "To maintain loose coupling, the Compliance module communicates with other modules using the IUserDataProvider and IUserDataAnonymizer abstractions:",
        providerIdentityTitle: "Identity Module Integration",
        providerIdentityContent:
          "The IdentityUserDataProvider exports profile metadata, active login sessions, and linked external logins. The IdentityUserDataAnonymizer uses high-performance zero-allocation database updates to replace names with the anonymization token, format emails as {token}@anonymized.invalid, set phone numbers to null, and mark active session IPs as 'ANONYMIZED'.",
        providerComplianceTitle: "Compliance Module Integration",
        providerComplianceContent:
          "The ComplianceUserDataProvider exports request logs and consent ledger entries. The ComplianceUserDataAnonymizer clears personal information from past DSRs (SubjectEmail and RequesterNotes) and consent logs (IpAddress and UserAgent).",
        entitiesTitle: "Entity Reference",
        entityName: "Entity Name",
        entityDesc: "Description",
        entityDsrDesc:
          "Represents a data subject request containing the type, status, SLA deadline, and execution parameters.",
        entityModuleDesc:
          "Tracks the execution status and retry attempts of a fanned-out DSR execution for each module provider.",
        entityStatusDesc:
          "An append-only ledger tracking DSR state transitions, resolution comments, and SLA escalations.",
        codeTitle: "Code Implementation",
        endpointsTitle: "API Endpoints",
        endpointsIntro:
          "The DSR controller exposes the following endpoints for request submission, review, and execution control:",
        ep: {
          list: "List all DSRs (paginated, filterable by status/type/regulation)",
          get: "Get DSR details by ID",
          create: "Submit a new DSR (calculates SLA deadline)",
          updateStatus: "Update DSR status (InProgress, Completed, Rejected)",
          assign: "Assign DSR to a compliance officer",
          delete: "Soft-delete a DSR",
          confirm: "Explicitly confirm an approved Erasure DSR to unlock execution",
        },
        field: "Field",
        type: "Type",
        fId: "Unique identifier for the DSR request.",
        fTenantId: "Foreign key referencing the tenant context.",
        fSubjectEmail: "Data subject email address (anonymized upon erasure).",
        fRequestType: "Type of DSR (Access, Export, Erasure, Rectification, Restriction).",
        fStatus: "Current lifecycle status of the request.",
        fDeadline: "Calculated SLA response deadline.",
        fErasureConfirmed: "Boolean flag unlocking Erasure requests for background jobs.",
        fErasureExecuteAfter: "Execution threshold enforcing the adaptive grace period.",
        fExportFileUrl: "URL to download fanned-out exported data zip.",
        fAssignedTo: "Foreign key referencing the assigned admin user.",
        fRetryCount: "Current retry attempt count for failed module executions.",
        fCompletedAt: "Timestamp indicating when the DSR was completed.",
        quickStartTitle: "Quick Start Guide",
        step1Title: "Seed Compliance Profiles",
        step1Content:
          "Run the development seeder to populate GDPR and CCPA regulation profiles with SLA days.",
        step2Title: "Submit a Data Subject Request",
        step2Content:
          "Use the POST endpoint to log a new request. The system validates input constraints and calculates the response deadline.",
        step3Title: "Review and Approve",
        step3Content:
          "The assigned compliance officer reviews the ticket. Approving an Erasure DSR sets the grace period and awaits final nuclear confirmation.",
        executionFlowIntro:
          "Erasure request execution anonymizes personal data asynchronously across modules via fanned-out provider implementations:",
      },
      consent: {
        title: "Consent Management",
        description: "Description",
        intro:
          "Consent Management provides an immutable record of user consent states. To support high-performance lookups alongside a legally defensible audit trail, SCRIPE uses a dual-table architecture split between an append-only transaction ledger and a cached materialized view.",
        purposesTitle: "Consent Purposes & Settings",
        purposesIntro:
          "Consent tracking is regulated by global profiles and structured consent purposes seeded at application startup:",
        purposesKey: "Purpose Key",
        purposesBasis: "Legal Basis",
        purposesRequired: "Mandatory",
        purposesSort: "Sort Order",
        purposesActive: "Active",
        purposesEssentialDesc:
          "Essential capabilities required for the platform to function. (Required, contract legal basis).",
        purposesMarketingDesc:
          "Promotional newsletters, emails, and campaign communications. (Optional, consent legal basis).",
        purposesAnalyticsDesc:
          "Usage analytics, user behavior tracking, and product improvement telemetry. (Optional, consent legal basis).",
        basisContract: "Contract",
        basisConsent: "Consent",
        basisLegitimate: "Legitimate Interest",
        basisObligation: "Legal Obligation",
        flowTitle: "Consent Logging & Verification Flow",
        nodeSubmit: "Consent Submission",
        descSubmit: "User updates preferences or submits a consent form.",
        nodeValidate: "FluentValidation",
        descValidate: "Validates regulation constraints and purpose key syntax.",
        nodeLedger: "Append Ledger",
        descLedger:
          "Writes an immutable ConsentRecord transaction containing IP address, user agent, version, and action.",
        nodeUpsert: "Upsert Snapshot",
        descUpsert:
          "Materializes current state in ConsentSnapshot cache for high-performance permission checks.",
        nodeEvents: "Domain Events",
        descEvents: "Publishes ConsentGrantedEvent or ConsentWithdrawnEvent via MediatR.",
        nodeExpiry: "ConsentExpiryJob",
        descExpiry:
          "Weekly background job scans version mismatches and flags stale records for re-consent.",
        connSubmitValidate: "submits details to",
        connValidateLedger: "appends transaction if valid",
        connLedgerUpsert: "updates current cache state from",
        connUpsertEvents: "dispatches events on success",
        connExpiryUpsert: "marks RequiresReConsent = true in",
        immutabilityTitle: "Dual-Table Database Architecture",
        immutabilityIntro:
          "To ensure both database performance and compliance audit integrity, consent tracking separates write-heavy transactions from read-heavy authorization checks:",
        entitiesTitle: "Entity Reference",
        entitiesIntro:
          "The following tables define the schema properties for both the append-only ledger and the materialized cache snapshots:",
        field: "Field",
        type: "Type",
        fId: "Unique identifier for the record.",
        fTenantId: "Foreign key referencing the tenant context.",
        fSubjectId: "Foreign key referencing the data subject (user).",
        fPurposeId: "Foreign key referencing the ConsentPurpose configuration.",
        fAction: "Consent action recorded (Granted or Withdrawn).",
        fCurrentAction: "Latest consent status cached for the subject and purpose.",
        fRequiresReConsent:
          "Flag indicating the user must re-consent due to a policy version update.",
        fLastUpdatedAt: "Timestamp representing the last snapshot modification.",
        fRecordedAt: "Timestamp representing when the ledger transaction occurred.",
        fIpAddress: "Client IP address captured at the time of recording.",
        fUserAgent: "Browser user agent captured at the time of recording.",
        fRegulationBasis: "Regulatory context (GDPR, CCPA) active during submission.",
        fCollectionMethod: "Method used to collect consent (Web Form, Mobile App, API).",
        fConsentVersion: "Consent policy document version active during submission.",
        bestPracticesTitle: "Best Practices",
        doTitle: "Recommended Practices",
        dontTitle: "Anti-Patterns to Avoid",
        do1: "Verify the purpose key matches lowercase alphanumeric regex constraints.",
        do2: "Always run the weekly ConsentExpiryJob to enforce re-consent on version updates.",
        do3: "Consume MediatR ConsentWithdrawnEvents to restrict downstream data processing.",
        dont1: "Never bypass the append-only ledger by modifying ConsentRecord rows directly.",
        dont2:
          "Never execute direct database queries against ConsentRecord for frontend permission checks; always read ConsentSnapshot.",
        dont3: "Never expose raw unauthenticated consent recording endpoints.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "List all consent ledger records (Admin-only, paginated, filterable)",
          get: "Get consent record details by ID",
          record: "Record a new consent grant or withdrawal (User/Admin)",
          withdraw: "Withdraw a previously granted consent (User/Admin)",
          getMy: "Retrieve the active consent snapshots for the currently authenticated user",
          analytics: "Get consent statistics by purpose and state (Admin-only)",
        },
        entitiesLedgerTitle: "ConsentRecord (Append-Only Ledger)",
        entitiesSnapshotTitle: "ConsentSnapshot (Materialized Cache)",
        epWithdraw: "Withdraw a previously granted consent",
      },

      retention: {
        title: "Data Retention Policies",
        description:
          "Define data retention periods and automated expiry actions (Delete or Anonymize) for GDPR Article 5(1)(e) compliance.",
        intro:
          "Data Retention Policies define how long specific categories of data must be kept and what happens when the retention period expires. SCRIPE enforces these policies automatically via background jobs, removing the manual overhead of managing data lifecycles.",
        policiesTitle: "Policy Configuration",
        policiesIntro: "Each retention policy specifies:",
        field1:
          "DataCategory — The type of data (e.g. 'User Profiles', 'Transaction Logs', 'Consent Records').",
        field2: "RetentionDays — How many days the data must be retained.",
        field3: "ExpiryAction — What happens when the period expires: Delete or Anonymize.",
        field4:
          "RegulationCode — Which regulation requires this retention period (GDPR, CCPA, etc.).",
        actionsTitle: "Expiry Actions",
        actionsIntro: "When a retention period expires, SCRIPE applies one of two actions:",
        action1: "Delete — Permanently removes all records matching the data category.",
        action2:
          "Anonymize — Replaces personally identifiable information with pseudonymous tokens, preserving aggregate analytics data.",
        automationTitle: "Automated Enforcement",
        automationIntro:
          "The RetentionEnforcementJob runs daily at 3:00 AM UTC, scanning all active retention policies and applying the configured expiry action to eligible records. Each enforcement run creates a RetentionExecution audit record.",
        nodePolicy: "Retention Policy",
        descPolicy: "Defines entity type, age limit, and destruction strategy",
        nodeEnforcement: "Retention Enforcement Job",
        descEnforcement: "Weekly job to evaluate policies",
        nodeExecution: "Retention Execution",
        descExecution: "Audit trail of the destruction action",
        nodeAction: "Data Destruction",
        descAction: "Hard deletion or Anonymization via ISuspendableModule",
        conn1: "scanned by",
        conn2: "triggers",
        conn3: "logs",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "List all retention policies",
          executions: "List enforcement execution history",
          update: "Update a retention policy (days, action, active status)",
        },
      },
      inventory: {
        title: "Data Inventory",
        description:
          "A registry of all personal data categories the platform processes — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        intro:
          "The Data Inventory is a structured registry of all personal data categories that the platform processes. Under GDPR Article 30, controllers must maintain Records of Processing Activities (RoPA) — the Data Inventory is SCRIPE's implementation of this requirement.",
        fieldsTitle: "Inventory Fields",
        fieldsIntro: "Each inventory item documents:",
        field1:
          "DataCategory — Human-readable name of the data category (e.g. 'Email Addresses', 'Payment Information').",
        field2:
          "LegalBasis — The GDPR lawful basis for processing (Consent, Contract, Legal Obligation, Vital Interests, Public Task, Legitimate Interests).",
        field3:
          "DataSubjects — Who the data belongs to (e.g. 'End users', 'Employees', 'Customers').",
        field4:
          "ProcessingPurpose — Why the data is processed (e.g. 'Order fulfillment', 'Marketing', 'Legal compliance').",
        field5:
          "StorageLocation — Where the data is stored (country/region for cross-border transfer compliance).",
        field6: "RetentionPeriod — How long the data is retained (linked to the retention policy).",
        field7: "ThirdPartySharing — Whether the data is shared with third parties and which ones.",
        ropaTitle: "Article 30 Compliance",
        ropaIntro:
          "Organizations with 250+ employees or processing high-risk data must maintain a RoPA under GDPR Article 30. SCRIPE's Data Inventory serves as a live, queryable RoPA that can be exported for regulatory inspections.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "List all data inventory items (paginated, searchable)",
          get: "Get item by ID",
          create: "Add a new data category to the inventory",
          update: "Update an existing inventory item",
          delete: "Remove an item from the inventory",
        },
      },
      reports: {
        title: "Compliance Reports",
        description:
          "Generate async audit-ready compliance reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        intro:
          "Compliance Reports are asynchronously generated documents that provide audit-ready summaries of your compliance posture. Reports are generated in the background and stored for download once ready, supporting regulatory inspections, internal audits, and executive reporting.",
        reportTypesTitle: "Report Types",
        reportTypesIntro: "Five report types are available:",
        type1:
          "GDPR Overview — High-level summary of GDPR compliance status across all sub-modules.",
        type2:
          "DSR Activity Summary — Statistics on DSR volume, types, completion rates, and SLA adherence.",
        type3:
          "Consent Audit — Full log of consent grants and withdrawals by purpose and time period.",
        type4: "Retention Analysis — Current enforcement status of all active retention policies.",
        type5: "Data Inventory Export — Full export of the data inventory (Article 30 RoPA).",
        asyncTitle: "Asynchronous Generation",
        asyncIntro:
          "Reports are generated asynchronously to avoid blocking HTTP requests for large datasets. When you request a report, the system immediately creates a ComplianceReport record with IsReady=false and queues the generation job. Poll the reports list to check when IsReady becomes true.",
        asyncTip:
          "Use the Refresh button in the Reports UI to poll for report readiness. Reports typically complete within 30–60 seconds for datasets up to 10,000 records.",
        downloadTitle: "Downloading Reports",
        downloadIntro:
          "Once a report is ready (IsReady=true), a DownloadUrl is available. The download endpoint serves the report file securely. Report files are retained for 90 days before automatic cleanup.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "List all compliance reports (paginated, filterable by type/status)",
          get: "Get report details and download URL by ID",
          generate: "Queue a new report generation job",
          download: "Download the generated report file",
        },
      },
      regulationProfiles: {
        title: "Regulation Profiles",
        description:
          "Configure the data protection regulations (GDPR, CCPA, LGPD, PDPA) your platform enforces — each profile defines DSR deadlines, default retention periods, and consent versioning.",
        intro:
          "Regulation Profiles are the foundation of SCRIPE's Compliance module. Each profile represents a specific data protection law that the platform enforces, storing the legal DSR response deadline, default retention periods, and the active consent document version. Profiles are seeded on startup and can be extended or overridden by platform administrators.",
        whatIsTitle: "What Are Regulation Profiles?",
        whatIsIntro:
          "A RegulationProfile is the authoritative record of a regulatory framework's enforcement parameters. When a Data Subject Request is submitted, the system reads the active RegulationProfile to calculate the SLA deadline. When the CurrentConsentVersion changes, the ConsentExpiryJob flags all active consents as requiring re-consent per GDPR Article 7.",
        entityTitle: "RegulationProfile Entity",
        entityIntro:
          "Each row represents one regulation and stores all the parameters needed to enforce it across DSR, consent, and retention sub-systems.",
        seededTitle: "Pre-Seeded Regulations",
        seededIntro:
          "SCRIPE seeds the following regulations on startup. Administrators can extend this list or override parameters without code changes via the compliance admin panel.",
        consentVersionTitle: "Consent Version & Re-Consent Trigger",
        consentVersionIntro:
          "The CurrentConsentVersion field stores the semantic version of the active consent policy document. When this value is updated (e.g. from '1.0' to '2.0'), the ConsentExpiryJob automatically scans all active ConsentSnapshots and sets RequiresReConsent = true, forcing users to re-acknowledge the updated terms before their consent is valid again.",
        consentVersionWarning:
          "Changing CurrentConsentVersion is a high-impact operation. ALL active consents for this regulation will be invalidated and users will be prompted to re-consent on next visit. Coordinate this with your legal team before making changes in production.",
        retentionJsonTitle: "DefaultRetentionJson Format",
        retentionJsonIntro:
          "The DefaultRetentionJson field stores a JSON object mapping retention category keys to their default period in days. These defaults pre-populate new RetentionPolicy rows when the regulation is first activated for a tenant. Values of -1 indicate indefinite retention.",
        retentionJsonNote:
          "DefaultRetentionJson is informational — actual enforcement is done by RetentionPolicy rows, which can be customized per tenant beyond these defaults.",
        endpointsTitle: "API Endpoints",
        endpointsIntro:
          "Regulation profile endpoints allow admins to configure which regulations the platform enforces. System-seeded profiles can be updated but not deleted.",
        "ep.list": "List all regulation profiles configured for the platform",
        "ep.get": "Get a specific regulation profile by ID",
        "ep.create": "Create a new custom regulation profile",
        "ep.update":
          "Update an existing regulation profile (DSR deadline, consent version, retention defaults)",
        "ep.delete":
          "Soft-delete a custom regulation profile (system-seeded profiles cannot be deleted)",
        bestPracticesTitle: "Best Practices",
        bestPracticesTip:
          "Always bump CurrentConsentVersion when your privacy policy changes materially. This triggers the automated re-consent flow and provides a legally defensible audit trail of when users re-acknowledged the updated policy.",
      },
    },
    // ── Plugins Module (Phase 15) ────────────────────────────
    plugins: {
      overview: {
        title: "Plugin System Overview",
        description:
          "Two-Tier enterprise plugin platform with certified in-process plugins and sandboxed marketplace plugins.",
        intro:
          "The Plugin System is SCRIPE's extensibility engine. It allows platform operators to install certified Tier 1 plugins that run in-process with full infrastructure access, and third-party Tier 2 plugins that run in a sandboxed REST gateway with an isolated key-value data store.",
        infoTitle: "Phase 15 — Enterprise Plugin Platform",
        infoContent:
          "The Plugin System was introduced in Phase 15. It covers the full plugin lifecycle: definition, installation, activation, upgrade, health monitoring, execution logging, webhook subscriptions, and a complete frontend SDK for host–iframe communication.",
        whatIsTitle: "What Is the Plugin System?",
        whatIsIntro:
          "The Plugin System provides a Two-Tier architecture for extending SCRIPE with additional capabilities. Tier 1 plugins are trusted, certified modules that integrate directly into the .NET runtime via IPluginStartup. Tier 2 plugins are third-party applications that integrate via a secure REST gateway and communicate with the host using a postMessage-based SDK.",
        featureTier1: "Tier 1 — Certified Plugins",
        featureTier1Desc:
          "In-process plugins with full DI access, Module Federation frontend, and IPluginStartup contract.",
        featureTier2: "Tier 2 — Sandboxed Plugins",
        featureTier2Desc:
          "Third-party plugins isolated via REST gateway with rate limiting, scoped auth tokens, and an isolated key-value store.",
        featureSDK: "Plugin SDK",
        featureSDKDesc:
          "postMessage-based communication protocol with typed bridge classes for theme, auth, navigation, and toast.",
        featureGateway: "API Gateway",
        featureGatewayDesc:
          "Authenticated plugin-api gateway with per-tenant rate limiting, execution logging, and API key management.",
        featureLogs: "Execution Logs",
        featureLogsDesc:
          "Append-only execution log per installation. Records endpoint, duration, status code, and success/failure.",
        featureWebhooks: "Webhook Events",
        featureWebhooksDesc:
          "7 platform events (installed, uninstalled, activated, deactivated, upgraded, health failed, rate limited).",
        tiersTitle: "Two-Tier Comparison",
        tiersIntro:
          "The Two-Tier model separates trusted internal plugins from third-party marketplace plugins with clear security boundaries.",
        thAspect: "Aspect",
        thTier1: "Tier 1 (Certified)",
        thTier2: "Tier 2 (Marketplace)",
        rowWho: "Who",
        rowWhoT1: "Internal / certified plugins",
        rowWhoT2: "Third-party marketplace plugins",
        rowRuntime: "Runtime",
        rowRuntimeT1: "In-process (.NET shared runtime)",
        rowRuntimeT2: "Sandboxed REST gateway",
        rowFrontend: "Frontend",
        rowFrontendT1: "Module Federation (shared React)",
        rowFrontendT2: "iframe + postMessage SDK",
        rowData: "Data Access",
        rowDataT1: "Full DI access",
        rowDataT2: "Isolated key-value store only",
        rowAuth: "Auth",
        rowAuthT1: "Host JWT",
        rowAuthT2: "Scoped plugin token",
        rowQuota: "Quota",
        rowQuotaT1: "None (trusted)",
        rowQuotaT2: "60 API calls per minute",
        architectureTitle: "System Architecture",
        architectureIntro:
          "The plugin system orchestrates from catalog registration through lifecycle management, health monitoring, and execution logging.",
        nodeCatalog: "Plugin Catalog",
        nodeCatalogDesc:
          "Registry of all available plugin definitions with tier, status, manifest.",
        nodeInstall: "Installation",
        nodeInstallDesc: "Tenant-scoped install record with settings JSON and health status.",
        nodeTier1Host: "Tier 1 Host",
        nodeTier1HostDesc: "IPluginHost — discovers IPluginStartup and activates in-process.",
        nodeTier2Gateway: "Tier 2 Gateway",
        nodeTier2GatewayDesc: "IPluginGateway — forwards HTTP to plugin BaseUrl with auth.",
        nodeSandbox: "Rate Limiter",
        nodeSandboxDesc: "PluginSandbox — 60 req/min per tenant+installation sliding window.",
        nodeLogs: "Execution Logs",
        nodeLogsDesc: "Append-only PluginExecutionLog records per gateway call.",
        connInstall: "install",
        connTier1: "Tier 1",
        connTier2: "Tier 2",
        connRate: "rate check",
        connLog: "log result",
        backendTitle: "Backend Architecture",
        backendIntro:
          "The backend follows SCRIPE's standard 3-project Clean Architecture module layout: Plugins.Domain → Plugins.Application → Plugins.Infrastructure.",
        cqrsTitle: "CQRS Commands & Queries",
        cqrsIntro:
          "The Plugins module registers 15 request handlers via AstraFlow.Mediator. All commands have a corresponding FluentValidation validator.",
        cqrsType: "Type",
        cqrsName: "Handler",
        cqrsDesc: "Description",
        cqrsInstall: "Install a plugin definition for a tenant",
        cqrsUninstall: "Remove a plugin installation and clean up data",
        cqrsActivate: "Set installation status to Active",
        cqrsDeactivate: "Set installation status to Disabled",
        cqrsUpgrade: "Upgrade to a new plugin version",
        cqrsSettings: "Update the installation settings JSON",
        cqrsRegister: "Register a new plugin definition in the catalog",
        cqrsSetData: "Upsert a key-value entry in the plugin data store",
        cqrsGrant: "Grant a permission to a plugin installation",
        cqrsSubscribe: "Subscribe to a platform webhook event",
        cqrsCatalog: "List all published plugins in the catalog",
        cqrsInstalled: "List all installations for a tenant",
        cqrsDetails: "Get full details of a plugin definition",
        cqrsGetData: "Read data store entries for a namespace",
        cqrsLogs: "Get paginated execution logs for an installation",
        entitiesTitle: "Domain Entities",
        entitiesIntro:
          "The Plugins domain defines 8 entities. PluginExecutionLog is append-only (Entity<Guid>); all others are AuditableEntity<Guid> with soft-delete support.",
        entityName: "Entity",
        entityBase: "Base Class",
        entityPurpose: "Purpose",
        entityDefPurpose: "Plugin catalog entry — global, not tenant-scoped",
        entityVerPurpose: "Version history per plugin definition",
        entityInstPurpose: "Per-tenant installation record with settings JSON",
        entityGrantPurpose: "Consent record for a permission granted to a plugin",
        entityDataPurpose: "Tier 2 key-value sandbox (namespace + key + value JSON)",
        entityKeyPurpose: "SHA-256 hashed API key for gateway authentication",
        entityWebhookPurpose: "Webhook subscription to platform events",
        entityLogPurpose: "Append-only gateway call log (no soft-delete)",
        frontendTitle: "Frontend Architecture",
        frontendIntro:
          "The frontend follows SCRIPE's MVVM pattern with strict layer separation. Views are dumb UI; ViewModels handle all state and mutations via TanStack Query.",
        sdkTitle: "Plugin SDK",
        sdkIntro:
          "The Plugin SDK lives in src/core/plugins/ and provides all infrastructure for host-plugin communication via iframe postMessage for Tier 2, and Module Federation for Tier 1.",
        endpointsTitle: "API Endpoints",
        endpointsIntro:
          "All plugin endpoints are under /api/v1/plugins/ for admin operations and /api/v1/plugin-api/v1/ for the sandboxed Tier 2 gateway.",
        apiCatalog: "Browse published plugins in the catalog",
        apiCatalogId: "Get full details of a specific plugin definition",
        apiInstalled: "List all plugins installed for a tenant",
        apiInstall: "Install a plugin for a tenant",
        apiUninstall: "Uninstall a plugin and trigger data cleanup",
        apiActivate: "Activate a disabled plugin installation",
        apiDeactivate: "Deactivate an active plugin installation",
        apiUpgrade: "Upgrade an installation to a new version",
        apiSettings: "Update the JSON settings for an installation",
        apiLogs: "Get paginated execution logs (page + pageSize)",
        apiDefinitions: "Register a new plugin definition (super admin only)",
        apiContextTenant: "Get tenant profile and enabled features for plugin context",
        apiWebhookSub: "Subscribe an installation to a platform webhook event",
        apiWebhookUnsub: "Unsubscribe from a webhook event",
        apiTokenExchange: "Exchange API key for a short-lived scoped access token",
        apiDataGet: "List all key-value entries in a data store namespace",
        apiDataSet: "Upsert a value in the data store (max 64KB)",
        apiDataDelete: "Delete a key-value entry from the data store",
        webhooksTitle: "Webhook Events",
        webhooksIntro:
          "The Plugin System publishes 7 webhook events that third-party systems can subscribe to via the webhook subscription API.",
        webhookEvent: "Event",
        webhookTrigger: "Trigger",
        webhookDesc: "Description",
        whInstalled: "InstallPluginCommandHandler success",
        whInstalledDesc: "Fired after a plugin is successfully installed for a tenant",
        whUninstalled: "UninstallPluginCommandHandler + cleanup",
        whUninstalledDesc: "Fired after uninstall and data store cleanup completes",
        whActivated: "ActivatePluginCommand success",
        whActivatedDesc: "Fired when an installation status changes to Active",
        whDeactivated: "DeactivatePluginCommand success",
        whDeactivatedDesc: "Fired when an installation status changes to Disabled",
        whUpgraded: "UpgradePluginCommand success",
        whUpgradedDesc: "Fired when an installation is upgraded to a new version",
        whHealthFailed: "PluginHealthCheckJob",
        whHealthFailedDesc: "Fired when a health check returns non-2xx for an active plugin",
        whRateLimit: "PluginSandbox.IsAllowed() = false",
        whRateLimitDesc: "Fired when a Tier 2 plugin exceeds its 60 req/min quota",
        jobsTitle: "Background Jobs",
        jobsIntro:
          "Three background jobs manage plugin health, data cleanup, and soft-delete purging.",
        jobId: "Job ID",
        jobSchedule: "Schedule",
        jobDesc: "Description",
        jobSched1: "Daily at 03:00",
        jobDesc1: "Hard-deletes soft-deleted plugin entities older than 30 days",
        jobSched2: "Every 5 minutes",
        jobDesc2: "Calls GET {baseUrl}/health for every active Tier 2 installation",
        jobSched3: "Daily at 02:00",
        jobDesc3: "Removes orphaned data store entries for uninstalled plugins",
        permissionsTitle: "Permissions Reference",
        permissionsIntro:
          "All plugin endpoints are protected by permission-based authorization. Permissions are seeded at startup by PluginsPermissionProvider.",
        permKey: "Permission Key",
        permGrants: "Grants Access To",
        permCatalogView: "Browse published plugin catalog",
        permCatalogInstall: "Install plugins for a tenant",
        permCatalogUninstall: "Uninstall plugins from a tenant",
        permInstalledView: "View installed plugins list",
        permInstalledManage: "Activate, deactivate, upgrade, update settings",
        permLogs: "View execution logs for an installation",
        permDefCreate: "Register new plugin definitions (platform admin)",
        permPermManage: "Grant and revoke plugin permissions",
        permWebhooks: "Subscribe and unsubscribe webhook events",
        quickStartTitle: "Quick Start Guide",
        step1Title: "Run Database Migration",
        step1Content:
          "Create the Plugins module database and apply migrations using the SCRIPE CLI.",
        step2Title: "Register a Plugin Definition",
        step2Content:
          "Register your plugin in the catalog by calling the definitions endpoint as super admin.",
        step3Title: "Install for a Tenant",
        step3Content: "Install the plugin for a specific tenant using the install endpoint.",
        step4Title: "Activate the Installation",
        step4Content: "Activate the installation to make it available to users.",
        step5Title: "Open the Plugin UI",
        step5Content:
          "Navigate to /plugins/installed in the frontend. You will see the plugin with its health badge, and can click Settings or Logs for per-installation views.",
        securityTitle: "Security",
        securityIntro:
          "The Plugin System enforces multiple security boundaries to protect tenants from malicious or buggy plugins.",
        securityWarningTitle: "Tier 1 plugins run in-process",
        securityWarningContent:
          "Tier 1 plugins have full access to SCRIPE's DI container and database. Only install certified plugins from your own team or thoroughly audited sources. The plugins_definition.create permission is restricted to super admins by default.",
        secDoTitle: "Do",
        secDontTitle: "Don't",
        secDo1: "Validate event.origin in every iframe message listener",
        secDo2: "Use the plugins_definition.create permission for catalog registration",
        secDo3: "Store sensitive config in SettingsJson (encrypted at rest)",
        secDo4: "Monitor execution logs for unusual latency spikes",
        secDont1: "Allow iframe navigation to external (non-/) paths",
        secDont2: "Store raw API keys in the database (only KeyHash is stored)",
        secDont3: "Grant plugins_definition.create to non-admin roles",
        secDont4: "Disable the PluginSandbox rate limiter in production",
      },
      sdk: {
        title: "Plugin SDK Reference",
        description:
          "Complete reference for the host-plugin communication SDK — PluginBridge, message types, bridge classes, and Tier 1/2 development guides.",
        intro:
          "The Plugin SDK provides all infrastructure for bidirectional communication between the SCRIPE host application and plugin frontends. Tier 2 plugins communicate via iframe postMessage; Tier 1 plugins use Module Federation with shared React.",
        infoTitle: "SDK lives in src/core/plugins/",
        infoContent:
          "The SDK is framework-agnostic at the message protocol level. Tier 2 plugin iframes can be built with any framework (React, Vue, Svelte, vanilla JS) as long as they implement the postMessage contract.",
        protocolTitle: "Message Protocol",
        protocolIntro:
          "All host-plugin communication uses a typed union of messages. The host sends HostToPluginMessage; the plugin sends PluginToHostMessage.",
        bridgeTitle: "PluginBridge",
        bridgeIntro:
          "PluginBridge is the low-level communication channel. It validates event.origin on every incoming message to prevent spoofing, and targets messages to the correct iframe window.",
        frameTitle: "PluginFrame",
        frameIntro:
          "PluginFrame is the React component that renders a Tier 2 plugin in a sandboxed iframe. It automatically creates a PluginBridge, handles READY/RESIZE/NAVIGATE_REQUEST/TOAST messages, and shows a skeleton while loading.",
        bridgesTitle: "Bridge Classes",
        bridgesIntro:
          "Each bridge class handles a specific concern. Mount them after creating a PluginBridge and unmount on cleanup.",
        bridgeClass: "Class",
        bridgeRole: "Responsibility",
        bridgeMsg: "Message Handled",
        roleTheme: "Push host theme (mode, accent, direction) to iframe",
        roleAuth: "Serve scoped tokens when iframe requests one",
        roleNav: "Allow iframe to trigger host-side navigation",
        roleToast: "Forward iframe toast requests to host notification system",
        providerTitle: "PluginHostProvider",
        providerIntro:
          "PluginHostProvider is a React context that wires all bridges and relays together. Wrap plugin pages with it to provide createBridgeFor, syncTheme, and mountRelays to child components.",
        eventBusTitle: "PluginEventBus",
        eventBusIntro:
          "The in-process PluginEventBus allows any part of the host application to react to plugin lifecycle events without direct coupling. A singleton pluginEventBus is exported for convenience.",
        tier1Title: "Tier 1 Plugin Development",
        tier1Intro:
          "Tier 1 plugins integrate at the .NET level via IPluginStartup and at the frontend level via Module Federation. They share the host's React instance.",
        tab1Backend: "Backend (C#)",
        tab1Frontend: "Frontend (webpack)",
        tab1Host: "Host Usage",
        tier2Title: "Tier 2 Plugin Development",
        tier2Intro:
          "Tier 2 plugins are independent web applications hosted at their own URL. The host embeds them in a sandboxed iframe. The plugin must implement the postMessage protocol.",
        dataStoreTitle: "Data Store API",
        dataStoreIntro:
          "Tier 2 plugins get an isolated key-value store. All keys are scoped to the installation ID + namespace. Maximum value size is 64KB.",
        dataStoreWarningTitle: "Rate limiting applies to Data Store calls",
        dataStoreWarningContent:
          "Data store reads and writes go through the Tier 2 gateway and count toward the 60 req/min quota per installation.",
      },
    },
    // ── CRM Leads Module ────────────────────────────────────────
    crmLeads: {
      title: "CRM Leads",
      description:
        "Enterprise contact-sales pipeline — capture, qualify, assign, and convert prospects to tenants from the admin panel.",
      intro:
        "The CRM Leads module is SCRIPE's built-in sales pipeline. It captures prospects who submit the Contact Sales form during the signup wizard, enriches each lead with discovery intelligence (business type, team size, priorities, recommended tier), and provides a full admin CRM workflow: list, detail drawer, status transitions, assignment, and one-click tenant conversion.",
      ingestionTitle: "Ingestion and Deduplication Lifecycle",
      ingestionIntro:
        "When a prospect submits a lead via the website signup wizard, the system performs validation and deduplication before creating a PlatformLead record. This includes checking for workspace subdomain conflicts, identifying colleague submissions for ABM targeting, and enforcing a daily lead registration cap.",
      whatIsTitle: "What is the Leads CRM?",
      whatIsIntro:
        "A Lead represents a prospective customer who has expressed interest in the platform. Each lead carries contact info, discovery context from the signup wizard, and a lifecycle status that tracks the sales engagement from first contact to conversion. All data is soft-deleted, fully audited, and accessible only to admins with the appropriate permissions.",
      lifecycleTitle: "Lead Lifecycle",
      lifecycleIntro:
        "Leads move through a defined set of statuses. Status transitions are tracked in the activity timeline so the entire team can see the history of each opportunity.",
      discoveryTitle: "Discovery Intelligence",
      discoveryIntro:
        "Every lead captured via the signup wizard Contact Sales form is enriched with five discovery fields that the prospect answered during the onboarding questionnaire. These fields give the sales team instant context without requiring a follow-up call.",
      discoveryTip:
        "The RecommendedTier field is computed by the signup wizard's recommendation engine based on the prospect's answers. It provides a data-driven starting point for the sales conversation and pre-fills the tier selection in the Convert to Tenant dialog.",
      backendTitle: "Backend Architecture",
      backendIntro:
        "The Leads feature follows the standard SCRIPE 3-project module layout. The PlatformLead entity lives in the Entitlements domain and is managed via a dedicated repository and CQRS command/query pipeline.",
      entityTitle: "PlatformLead Entity",
      entityIntro:
        "PlatformLead inherits from AuditableEntity (CreatedBy, CreatedAt, UpdatedBy, UpdatedAt, IsDeleted, RowVersion). All IDs are AES-encrypted in API transit. The entity is designed to hold both CRM lifecycle data and the discovery intelligence gathered during the signup wizard questionnaire.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "The LeadsController exposes 9 endpoints covering the full lead lifecycle. All endpoints require AdminOnly JWT authentication. The contact-sales submission endpoint is the only public route.",
      endpointsNote:
        "All entity IDs returned by the API are AES-encrypted via IdEncryptionHelper. The frontend should never construct or manipulate raw GUIDs — always use the encrypted strings returned from the API.",
      convertTitle: "Convert to Tenant",
      convertIntro:
        "The ConvertLeadToTenant command is an atomic operation that creates a live tenant from a qualified lead. The handler orchestrates tenant provisioning, edition assignment, activity logging, and status update in a single database transaction. If any step fails, the entire operation rolls back.",
      emailsTitle: "Email Notifications",
      emailsIntro:
        "When a Contact Sales form is submitted, two branded HTML emails are dispatched asynchronously (fire-and-forget via Task.Run) to avoid blocking the API response. Both templates use inline CSS for maximum email client compatibility.",
      emailsTip:
        "Configure Leads:SalesNotificationEmail in appsettings.json to set the inbox that receives sales alerts. The SMTP settings use the shared SmtpSettings block. Emails are dispatched fire-and-forget — a delivery failure does not fail the lead creation.",
      frontendTitle: "Frontend Architecture",
      frontendIntro:
        "The frontend leads sub-module follows the strict SCRIPE sub-module pattern: domain entities, data layer (service → mapper → repository), and presentation layer (viewmodel → view → components). All HTTP calls go through IApiService via DI — never directly in hooks.",
      frontendEntityTitle: "PlatformLead Entity (Frontend)",
      frontendEntityIntro:
        "The PlatformLead domain entity wraps the raw DTO data with computed getters and display logic. The relativeTime getter uses Intl.RelativeTimeFormat for locale-aware relative timestamps. The discoveryTags getter aggregates the three discovery fields into a tag array for the drawer's discovery intelligence section.",
      permissionsTitle: "Permissions",
      permissionsIntro:
        "Leads are gated behind five granular permissions following the standard SCRIPE permission format (module.action). Assign the leads.convert permission only to senior sales admins — it triggers tenant provisioning which is a high-impact operation.",
      permissionsTip:
        "Frontend permission checks (usePermission, PermissionGate) are UX-only. The backend always enforces the permission check via the AuthorizationBehavior pipeline regardless of what the UI shows.",
      quickStartTitle: "Quick Start",
      quickStartIntro:
        "The typical CRM flow from prospect submission to live tenant takes 5 steps. Conversion is the only step requiring senior admin permissions — all other transitions can be performed by any admin with leads.update.",
    },
    subscriptions2: {
      title: "Subscriptions Module",
      description:
        "TenantSubscription entity, subscription status lifecycle (Trial → Active → Suspended → Expired), API endpoints, and feature gating integration.",
      intro:
        "Subscriptions link a tenant to an edition and track their billing lifecycle. A single tenant may have multiple concurrent subscriptions (e.g., base plan + add-ons). The subscription status drives access: only Active tenants can log in and use features. Trial, Suspended, and Expired tenants have access restrictions enforced by AstraFlow's AuthorizationBehavior pipeline.",
      entityTitle: "TenantSubscription Entity",
      lifecycleTitle: "Subscription Status Lifecycle",
      statusEnumTitle: "SubscriptionStatus Enum Reference",
      endpointsTitle: "API Endpoints",
      featureGatingTip:
        "Feature gating is NOT checked in subscription endpoints themselves. It is enforced by the FeatureCheckBehavior AstraFlow pipeline on any command that implements IRequireFeature. Changing a tenant's subscription immediately propagates to the feature resolution chain via SubscriptionChangedEvent, with no additional calls needed from the API layer.",
    },
    editions2: {
      title: "Editions Module",
      description:
        "Edition entity, feature value types (Boolean/Numeric/String), feature resolution chain (TenantFeatureOverride → EditionFeature → DefaultValue), and multi-subscription merge rules.",
      intro:
        "An Edition is the product tier definition that determines what a tenant can do. Each edition can define values for any registered Feature. The resolution chain is hierarchical: tenant-level overrides always win, then edition values, then the feature's global default. When a tenant has multiple active subscriptions, values are merged using type-specific rules (boolean OR, numeric MAX, string from primary plan).",
      entityTitle: "Edition Entity",
      featureValueTypesTitle: "Feature Value Types",
      resolutionTitle: "Feature Value Resolution Chain",
      resolutionContent:
        "IFeatureChecker.IsEnabledAsync() executes the resolution chain in strict priority order. TenantFeatureOverride is checked first — these are direct admin overrides that bypass the edition entirely. If no override exists, the edition's EditionFeature value is used. If the current edition doesn't define the feature, the Feature.DefaultValue is used as the fallback. For multi-subscription tenants, the merge step occurs BEFORE the per-feature override check.",
      addingFeaturesTitle: "Adding Features to Editions",
      mergeRulesTitle: "Multi-Subscription Merge Rules",
      overrideTip:
        "TenantFeatureOverride is the escape hatch for enterprise negotiations. Use it when a specific tenant needs a value that differs from their edition tier (e.g., a Growth tenant that negotiated unlimited API calls). Overrides persist until explicitly removed — they are NOT reset when the tenant upgrades or changes subscriptions.",
    },
    auditLogs: {
      title: "Audit Logs Module",
      description:
        "AuditBehavior pipeline, AuditLog entity, tamper-proof persistence, searchable audit trail, and retention policies.",
      intro:
        "SCRIPE's audit logging system captures a tamper-proof record of every mutation in the platform. The AuditBehavior at position 6 in the AstraFlow pipeline automatically intercepts every command, capturing the request payload, user identity, tenant context, client IP, and HTTP metadata — then persisting it to a dedicated, append-only AuditLog table. Audit logs are never soft-deleted; they retain permanently unless an explicit retention cleanup job runs.",
      architectureTitle: "AuditBehavior Architecture",
      architectureContent:
        "The AuditBehavior runs for every command (not queries) at pipeline position 6, just before the handler. It captures the request via JSON serialization and persists the AuditLog entry synchronously in the same database transaction as the entity mutation. This ensures atomicity — the audit record and the entity change commit together or both roll back.",
      entityTitle: "AuditLog Entity",
      entityContent:
        "The AuditLog entity is append-only. It inherits from BaseEntity (not AuditableEntity) to avoid recursive audit-of-audit cycles. The payload is stored as serialized JSON for full-text search capability. CommandName identifies the CQRS command class name.",
      searchTitle: "Searching Audit Logs",
      searchContent:
        "The AuditLogsController exposes a paginated GET endpoint with filters for EntityId, CommandName, UserId, TenantId, and date range. Results are sorted descending by CreatedAt. The table uses a composite index on (TenantId, CreatedAt) and a partial index on EntityId for optimal query performance.",
      retentionTitle: "Retention Policy",
      retentionContent:
        "A configurable AuditLogCleanupJob runs daily and permanently deletes AuditLog entries older than the configured retention period. The default retention is 90 days for standard editions. Enterprise editions can configure up to 7 years. GDPR data subject erasure requests will remove entity-level data but retain the audit log entries with payload data anonymized (user details replaced with REDACTED).",
      retentionWarning:
        "Audit log cleanup is a hard delete — there is no recycle bin for audit records. Ensure your retention period complies with your jurisdiction's regulatory requirements (e.g., GDPR Article 17, SOC 2) before configuring a short retention window.",
    },
    webhooks: {
      title: "Webhooks Module",
      description:
        "Outbound webhook engine with HMAC-SHA256 signatures, automatic retry with exponential backoff, per-tenant endpoint configuration, and event filtering.",
      intro:
        "The SCRIPE webhook system allows external applications to receive real-time push notifications when system events occur. Webhooks are outbound only — SCRIPE sends HTTP POST payloads to registered endpoint URLs. The engine supports event filtering (per webhook, select which event types to receive), HMAC-SHA256 request signing for authenticity verification, and automatic retry with exponential backoff (up to 5 attempts over 24 hours).",
      engineTitle: "Webhook Engine Architecture",
      engineContent:
        "WebhookDispatcher is an INotificationHandler that subscribes to all domain events that implement IWebhookTriggered. When an event fires, the dispatcher looks up all active tenant webhooks filtered by event type and dispatches HTTP POST payloads asynchronously via background Task. Failed deliveries are queued to WebhookDeliveryAttempts for the retry scheduler.",
      payloadTitle: "Webhook Payload Format",
      payloadContent:
        "All webhook payloads follow a standard envelope. The X-Scripe-Signature header contains an HMAC-SHA256 signature of the raw JSON body using the webhook's secret key. Always verify this signature on your receiving server before processing the payload.",
      retryTitle: "Retry & Backoff Schedule",
      retryContent:
        "Failed webhook deliveries are automatically retried by WebhookRetryJob (a daily IAutoRegisteredJob). The retry schedule uses exponential backoff: 5 min, 30 min, 2 h, 8 h, 24 h. After 5 failed attempts, the webhook delivery is marked Abandoned and the webhook endpoint is flagged for review. If a webhook endpoint fails consistently across 10 events, the webhook is automatically disabled to prevent wasted calls.",
      securityTitle: "Security: Signature Verification",
      securityContent:
        "Generate a unique secret key per webhook endpoint. On your server, compute HMAC-SHA256 of the raw request body using the secret key and compare it to the X-Scripe-Signature header. NEVER verify signatures using reconstructed JSON — always use the raw bytes of the request body.",
      signatureWarning:
        "Never skip signature verification in production. Without it, any party that discovers your webhook URL can send fake payloads. Always compare signatures using a constant-time comparison function (e.g., CryptographicOperations.FixedTimeEquals) to prevent timing attacks.",
      registeringTitle: "Registering a Webhook Endpoint",
    },
    tenantPlans: {
      title: "Tenant Plans",
      description:
        "Tenant-defined subscription plans (Tier 2) that businesses configure for their end-user customers. Supports multi-currency pricing, versioning, and subscriber grandfathering.",
      intro:
        "Tenant Plans form the Tier 2 of SCRIPE's B2B2C architecture. While Editions (Tier 1) are configured by the platform operator and govern what a tenant can do, TenantPlans are configured by the tenant themselves to offer subscription plans to their own end-user customers. This makes SCRIPE a full B2B2C engine: operators sell to businesses, businesses sell to their customers — all within one platform.",
      conceptTitle: "B2B2C Model",
      conceptIntro:
        "SCRIPE's dual-tier subscription model enables platform operators to monetize tenants (businesses) via Editions, while those same tenants can independently monetize their end-users via TenantPlans. Each tier is fully isolated — a tenant's plan configuration is scoped to their TenantId and never visible to other tenants.",
      entityTitle: "TenantPlan Entity",
      entityIntro:
        "A TenantPlan is the business's self-managed subscription product. It defines the plan name, pricing, billing cycles, trial configuration, and feature assignments for their customers.",
      entityNote:
        "Pricing is NOT stored directly on TenantPlan. Instead, a separate TenantPlanPrice table stores multi-currency × multi-cycle pricing matrices (one row per Currency + BillingCycle combination). This allows a single plan to be priced in USD monthly, USD yearly, EUR monthly, etc.",
      lifecycleTitle: "Plan Lifecycle",
      lifecycleIntro:
        "Plans follow a three-state lifecycle. Draft plans are invisible to subscribers and can be freely edited. Publishing a plan increments CurrentVersion and makes it available for new subscribers. Archiving prevents new subscribers while preserving existing ones.",
      versioningTitle: "Versioning & Subscriber Grandfathering",
      versioningIntro:
        "Each time a plan is published, CurrentVersion increments. Existing subscribers are optionally pinned to their subscription's TenantPlanVersionNumber, preserving the plan features they signed up for (grandfathering). Subscribers with TenantPlanVersionNumber = null always use the latest published version.",
      versioningTip:
        "Use versioning when making breaking changes to a plan's features. Existing subscribers stay on their pinned version; new subscribers get the latest. This allows safe, non-disruptive plan evolution.",
      pricingTitle: "Pricing Architecture",
      pricingIntro:
        "Pricing is stored in a relational matrix to support multi-currency and multi-billing-cycle configurations independently.",
      featureEntityTitle: "Plan Features (TenantPlanFeature)",
      featureEntityIntro:
        "Each plan can have multiple TenantPlanFeature records that link the plan to the tenant's feature catalog. Features are key-value pairs where the key is the feature's stable system key and the value is a string representation (e.g. 'true', '50', 'priority').",
      contextTitle: "Tenant Context Required",
      contextIntro:
        "All TenantPlan operations are tenant-scoped. The current tenant's ID is injected from the JWT token. System admins in drill-down mode operate within the target tenant's context.",
      contextWarning:
        "TenantPlans are fully isolated per tenant. A tenant can never view or modify another tenant's plans. The API enforces this via the ITenantContext middleware — TenantId is always sourced from the authenticated token, never from the request body.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "All TenantPlan endpoints require JWT authentication and appropriate permissions.",
      permissionsTitle: "Permissions",
      permissionsIntro:
        "Access to tenant plan management is controlled by the following RBAC permissions:",
      "ep.list": "Get all plans for the current tenant (paginated)",
      "ep.get": "Get a single plan by ID",
      "ep.create": "Create a new plan draft",
      "ep.update": "Update plan fields or lifecycle (publish/archive)",
      "ep.delete": "Soft-delete a plan",
    },
    invoices: {
      title: "Invoices & Billing",
      description:
        "Invoice entity lifecycle, line items, payment transactions, multi-currency billing, and the Stripe webhook integration that drives automated invoice generation.",
      intro:
        "The Invoice system is the financial backbone of SCRIPE's billing engine. Invoices are automatically generated by Stripe webhook events (e.g. invoice.payment_succeeded) or manually created by platform admins for custom billing scenarios. Each invoice carries a human-readable sequenced number (INV-YYYY-NNNNN), is denominated in the tenant's subscription currency, and has a full audit trail of payment attempts via PaymentTransaction records.",
      invoiceEntityTitle: "Invoice Entity",
      invoiceEntityIntro:
        "Each Invoice represents one billing cycle charge. It links to a TenantSubscription and captures the complete financial picture: amount before and after discounts, tax, final total, and Stripe gateway references.",
      invoiceFieldsNote:
        "Exchange rate normalization (USD equivalent amounts) lives on TenantSubscription, NOT on Invoice. Invoice stores the amounts in the billed currency only.",
      lineItemTitle: "Invoice Line Items",
      lineItemIntro:
        "Each invoice has one or more InvoiceLineItem records describing exactly what was charged. This enables detailed, transparent invoicing with subscription charges, add-ons, discounts, and tax shown separately.",
      transactionTitle: "Payment Transactions",
      transactionIntro:
        "PaymentTransaction records each payment attempt against an invoice. Multiple transactions per invoice are possible (e.g., a failed attempt followed by a successful retry). The Gateway field uses the PaymentGatewayType enum (Stripe, PayPal, Paymob, Manual).",
      statusTitle: "Invoice Status Lifecycle",
      statusIntro:
        "Invoices follow a linear status progression. Manual admin actions can Void a Pending invoice. Stripe webhook events drive the Pending → Paid transition.",
      numberingTitle: "Invoice Numbering",
      numberingIntro:
        "Invoice numbers use a DB-native IDENTITY/SERIAL/SEQUENCE (SequenceNumber column) for atomic, gap-free sequence generation under concurrency. The InvoiceNumber string is formatted as INV-YYYY-NNNNN from SequenceNumber.",
      dashboardTitle: "Revenue Dashboard",
      dashboardIntro:
        "SCRIPE provides a real-time revenue analytics dashboard at /api/v1/billing/dashboard, aggregating all invoice and subscription data into KPI metrics.",
      metricsTitle: "Dashboard KPIs",
      metricsIntro: "The dashboard exposes the following key metrics:",
      metric1: "MRR (Monthly Recurring Revenue) — normalized to USD",
      metric2: "ARR (Annual Recurring Revenue) — normalized to USD",
      metric3: "Total active subscriptions (by type: Base, Trial, AddOn)",
      metric4: "New subscriptions this period",
      metric5: "Churn rate (%) — cancellations / start of period active",
      metric6: "Trial conversions",
      metric7: "Revenue by edition tier",
      metric8: "Revenue by currency (before USD normalization)",
      currencyTitle: "Multi-Currency Support",
      currencyIntro:
        "SCRIPE supports all Stripe-compatible currencies. The currency handling in Stripe API calls depends on the decimal precision of the currency:",
      exportTitle: "Export Formats",
      exportIntro:
        "Invoices and subscription data can be exported via the /api/v1/subscriptions/export endpoint:",
      exportCsv: "CSV — for spreadsheet import and financial reconciliation",
      exportExcel: "Excel (.xlsx) — formatted invoice report",
      exportPdf: "PDF — professional invoice documents with tenant branding",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "Invoice endpoints are read-only for tenant users. Only platform admins can create or void invoices manually.",
      "ep.list": "Get paginated invoice list for the current tenant",
      "ep.get": "Get invoice details by ID",
      "ep.pdf": "Download the PDF version of an invoice",
      "ep.dashboard": "Get revenue analytics dashboard KPIs",
      "ep.export": "Export invoices and subscriptions to CSV/Excel",
    },
    identityAuthSessions: {
      title: "Auth Sessions & Token Management",
      description:
        "Deep-dive into the six session and authentication entities: RefreshToken, OtpCode, QrLoginSession, WebAuthnChallenge, AdminPasskey, and ExternalLogin — including all fields, security semantics, and the QR login flow.",
      intro:
        "SCRIPE supports multiple concurrent authentication mechanisms. Each mechanism has a dedicated entity in the Identity module. RefreshToken manages sliding session windows. OtpCode handles time-limited one-time codes. QrLoginSession enables cross-device login via QR scanning. WebAuthnChallenge powers FIDO2 passkey ceremonies. AdminPasskey stores registered FIDO2 credentials. ExternalLogin links third-party identity providers to Admin and User accounts.",
      refreshTokenTitle: "RefreshToken Entity",
      refreshTokenIntro:
        "RefreshToken stores a long-lived opaque token issued alongside a JWT access token. Tokens are rotated on each use — the old token is revoked with a ReplacedByToken pointer, and a new token is issued. Impersonation sessions are tracked via ImpersonatorAdminId, enabling the StopImpersonation flow to restore the original admin's session.",
      otpCodeTitle: "OtpCode Entity",
      otpCodeIntro:
        "OtpCode is a polymorphic one-time code that serves both users and admins. The Purpose integer maps to an enum (email verification, password reset, 2FA, etc.). Codes are invalidated via Invalidate() after successful use. The Attempts / MaxAttempts pair implements brute-force protection.",
      otpCodeNote:
        "OtpCode.Purpose is stored as an integer for database efficiency. The application-layer enum is defined in Identity.Application. Always check IsUsed and ExpiresAt before trusting a code — do NOT rely solely on the code value.",
      qrLoginTitle: "QrLoginSession Entity",
      qrLoginIntro:
        "QrLoginSession orchestrates cross-device login: a desktop browser creates a session (status = Pending) and displays a QR code containing the SessionToken. An authenticated mobile device scans the QR (Scanned), the user approves (Approved), the backend generates tokens, and the polling desktop browser consumes them (Consumed). Sessions are cleaned up by QrSessionCleanupJob after the 5-minute TTL.",
      qrLoginWarning:
        "QR session tokens are single-use. Once Consumed or Rejected, the session cannot be reused. The desktop browser must create a new session. Never cache or re-display a QR code after its session has advanced past Pending — it provides no security value and may confuse users.",
      webAuthnChallengeTitle: "WebAuthnChallenge Entity",
      webAuthnChallengeIntro:
        "WebAuthnChallenge is a short-lived (5-minute) server-side nonce generated at the start of each WebAuthn ceremony (registration or authentication). The challenge is sent to the browser, signed by the authenticator, and verified on return. IsUsed = true prevents replay attacks. Origin binding prevents cross-origin ceremony hijacking.",
      adminPasskeyTitle: "AdminPasskey Entity",
      adminPasskeyIntro:
        "AdminPasskey stores a registered FIDO2/WebAuthn credential for an admin. Each admin can have multiple passkeys (Touch ID, YubiKey, Windows Hello, etc.). The SignatureCounter is incremented by the authenticator on each use — a counter that goes backwards indicates a cloned credential. IsDiscoverable = true enables true passwordless login (no username entry required).",
      adminPasskeyNote:
        "The PublicKey field stores the COSE-encoded public key (not a PEM certificate). Never confuse it with a TLS certificate. Authenticators with Aaguid all-zeros (00000000-0000-0000-0000-000000000000) are privacy-preserving — the authenticator model is deliberately not disclosed.",
      externalLoginTitle: "ExternalLogin Entity",
      externalLoginIntro:
        "ExternalLogin creates a polymorphic link between an external identity (any OAuth / OIDC / SAML provider) and an Admin or User. AdminId and UserId are mutually exclusive — an external login linked to an Admin cannot authenticate a User. IdentityProviderId is null for built-in social providers (Google, Facebook, Apple, Microsoft) and set for custom OIDC/SAML providers configured per-tenant.",
      externalLoginNote:
        "The ProviderKey (the OIDC 'sub' claim) combined with ProviderName forms a globally unique external identity. Never rely on the Email field alone for matching — emails can change in external providers. Always use ProviderName + ProviderKey as the stable identity.",
    },
    identityMenuSystem: {
      title: "Menu System Entities",
      description:
        "Entity-level documentation for SCRIPE's dynamic navigation menu system: MenuItem, RoleMenuItem, MenuOverrideScope, and TenantMenuOverride — including the full menu resolution priority chain.",
      intro:
        "SCRIPE's navigation menu is fully dynamic and data-driven. MenuItems define the global navigation tree, seeded by IModuleMenuProvider instances at startup. RoleMenuItems control per-role visibility. TenantMenuOverrides allow tenant-level and personal menu customization without touching base data. The resolution chain (base → role filter → tenant override → user override) ensures the highest-priority override always wins.",
      menuItemTitle: "MenuItem Entity",
      menuItemIntro:
        "MenuItem is the core navigation node. Items form a tree via ParentMenuItemId. WorkspaceId links each item to the Nexus dual-rail workspace it belongs to. IsSystem items are seeded by module providers and refreshed on startup — display names and routes are updated, but admin-only fields (Order, TenantScopeJson) are preserved. Non-system items are fully user-editable.",
      roleMenuItemTitle: "RoleMenuItem Entity",
      roleMenuItemIntro:
        "RoleMenuItem provides explicit per-role menu visibility control. When IsVisible = true, the item is shown for that role. When false, it is hidden. If no RoleMenuItem record exists for a role/item pair, the system falls back to auto-inherit: the item is shown if the role has the corresponding resource permission.",
      roleMenuItemNote:
        "RoleMenuItem records are auditable — AuditableEntityInterceptor captures who changed menu visibility for which role. This provides a complete audit trail for menu permission changes, which is important for compliance in regulated environments.",
      menuOverrideScopeTitle: "MenuOverrideScope Enum",
      menuOverrideScopeIntro:
        "MenuOverrideScope is a two-value enum controlling the reach of a TenantMenuOverride. User scope is personal (only the admin who created the override sees it). Tenant scope affects all admins in the tenant. Super admins without a tenant can only use User scope — to change menus for everyone, they edit the base MenuItem directly.",
      menuOverrideScopeNote:
        "The simplified 2-scope model (User / Tenant) replaces a previous 4-scope model. Super admins who want to change menus globally should update the base MenuItem or use the IModuleMenuProvider interface — not create Tenant-scoped overrides.",
      tenantMenuOverrideTitle: "TenantMenuOverride Entity",
      tenantMenuOverrideIntro:
        "TenantMenuOverride allows each tenant (or individual admin) to customize menu item names, order, parent, and visibility without modifying the underlying MenuItem. Overrides are nullable — a null override field means 'inherit from base'. IsHidden = true completely suppresses the item for the scope regardless of role permissions.",
      resolutionFlowTitle: "Menu Resolution Priority Chain",
      resolutionFlowIntro:
        "When building the final menu for a request, SCRIPE applies overrides in priority order. The highest-priority override wins for each attribute (name, order, visibility).",
      resolutionNote:
        "The resolution chain is applied per-attribute, not per-item. For example, a user override may change only the display name, while the tenant override changes the order. Both are applied independently — SCRIPE does not require an override to be 'complete' to be effective.",
    },
    identityTenantConfig: {
      title: "Tenant Configuration Entities",
      description:
        "Deep-dive into TenantDomain (custom domain management with DNS verification), TenantPermission (per-tenant permission grants), SystemSettings (singleton platform defaults), and SettingsAuditLog (append-only change history).",
      intro:
        "Tenant configuration entities govern how each tenant is isolated, branded, and permissioned on the platform. TenantDomain manages custom hostnames with Shopify-style DNS verification. TenantPermission tracks which platform permissions a tenant's admins can exercise. SystemSettings is a singleton entity providing platform-wide defaults for branding, themes, and layout. SettingsAuditLog is an append-only log capturing every settings publish event for rollback and compliance.",
      tenantDomainTitle: "TenantDomain Entity",
      tenantDomainIntro:
        "TenantDomain represents a hostname attached to a tenant — either an auto-generated subdomain ({code}.scripe.org) or a custom domain added by the tenant admin. Auto-generated domains are created at tenant creation, always verified, and cannot be deleted. Custom domains require DNS verification via TXT record before activation. Only one domain can be primary at a time.",
      tenantDomainNote:
        "Domain verification uses a DNS TXT record: TXT _scr-verify.{domain} = 'scr_{token}'. The VerificationToken is a 128-bit random value generated at domain registration. Verification is polled or triggered manually — it does not happen automatically. Reserved prefixes (www, api, admin, auth, login, etc.) cannot be used as custom domains.",
      tenantPermissionTitle: "TenantPermission Entity",
      tenantPermissionIntro:
        "TenantPermission is the junction entity that grants a specific Permission to a specific Tenant. When a tenant is created, the creating admin assigns a subset of their own permissions to the new tenant. This prevents privilege escalation — a tenant admin can never grant a permission they don't hold themselves.",
      tenantPermissionNote:
        "AssignedBy and AssignedAt are redundant with AuditableEntity.CreatedBy and CreatedAt but are kept for backward compatibility with older migration-based audit queries. New code should prefer the AuditableEntity fields.",
      systemSettingsTitle: "SystemSettings Entity",
      systemSettingsIntro:
        "SystemSettings is a singleton entity (one row in the database) that acts as the platform-wide defaults layer. It stores the default theme configuration, the layout catalog, the slot registry, and default login/dashboard branding that tenants without their own customization inherit. The SettingsVersion field enables optimistic concurrency — each publish increments the version and is recorded in SettingsAuditLog.",
      systemSettingsNote:
        "SystemSettings is managed exclusively by system admins. Tenant admins can customize their own TenantSettings but cannot modify SystemSettings. The DraftBrandingJson and DraftDashboardThemeJson fields hold auto-saved Studio drafts — they are cleared on publish or discard, ensuring the live settings are always in LoginBrandingJson / DashboardThemeJson.",
      settingsAuditLogTitle: "SettingsAuditLog Entity",
      settingsAuditLogIntro:
        "SettingsAuditLog is an append-only log that captures every settings change — publish, rollback, safe-mode toggle, or draft discard. Each entry stores a full before/after JSON snapshot for rollback capability. The VersionNumber field is monotonically increasing and corresponds to SettingsVersion at the time of the change.",
      settingsAuditLogWarning:
        "SettingsAuditLog entries cannot be modified or deleted by any admin through the application API. This immutability is enforced at the repository layer. Rollback uses PreviousValueJson as the source of truth — verify the VersionNumber matches your intended rollback target before applying it.",
    },
    identityThemesWorkspace: {
      title: "Themes, Workspaces & Pinning Entities",
      description:
        "Entity-level documentation for theme lifecycle entities (LoginThemePurchase, TenantThemeFavorite, ThemeApplyLog) and the Nexus dual-rail workspace system (Workspace, AdminWorkspacePin, DashboardPreset).",
      intro:
        "SCRIPE's visual layer is powered by six supporting entities. LoginThemePurchase records theme transactions for the marketplace. TenantThemeFavorite lets admins bookmark themes. ThemeApplyLog provides an append-only analytics trail of theme applications. Workspace defines top-level navigation contexts in the Nexus dual-rail layout. AdminWorkspacePin stores per-admin pinned workspaces. DashboardPreset holds reusable dashboard theme snapshots.",
      loginThemePurchaseTitle: "LoginThemePurchase Entity",
      loginThemePurchaseIntro:
        "LoginThemePurchase records a theme acquisition by a tenant. In v1, system admins manually grant purchases (TransactionRef = 'manual-grant'). In v2, Stripe webhooks create records automatically (TransactionRef = Stripe PaymentIntent ID). The PaidAmount is locked at purchase time and is unaffected by future price changes — ensuring accurate revenue reporting.",
      loginThemePurchaseNote:
        "IsRefunded and RefundedAt are set by the billing system on refund events. A refunded purchase does NOT automatically remove the theme from the tenant — theme access revocation is a separate operation handled by the subscription/access layer.",
      tenantThemeFavoriteTitle: "TenantThemeFavorite Entity",
      tenantThemeFavoriteIntro:
        "TenantThemeFavorite is a lightweight bookmark entity — an admin marks a theme as favorited in the marketplace. It uses Entity (not AuditableEntity) since favorite operations are ephemeral user preferences that don't need a full audit trail.",
      themeApplyLogTitle: "ThemeApplyLog Entity",
      themeApplyLogIntro:
        "ThemeApplyLog is an append-only analytics and audit record created whenever an admin applies a theme to a tenant's login page draft. ThemeSlug is denormalized for analytics efficiency. WasPublished is updated asynchronously when the tenant publishes, enabling analytics on theme adoption vs. theme evaluation.",
      workspaceTitle: "Workspace Entity",
      workspaceIntro:
        "Workspace is the top-level navigation container in SCRIPE's Nexus dual-rail layout. The primary rail shows workspace icons; clicking one switches the secondary rail to that workspace's menu tree. System workspaces are seeded by IModuleMenuProvider at startup (smart-sync by Key). The Key field is an immutable stable identifier — changing it would break all FK references in MenuItem.",
      adminWorkspacePinTitle: "AdminWorkspacePin Entity",
      adminWorkspacePinIntro:
        "AdminWorkspacePin stores an admin's pinned workspaces in the primary rail. Pins are context-scoped: platform-level pins (TenantId = null) are shown when the admin has no tenant selected; tenant-level pins (TenantId = GUID) are shown when that tenant is active. This entity intentionally does NOT use soft delete — unpinning permanently removes the row (pins are ephemeral preferences, not business data).",
      adminWorkspacePinNote:
        "AdminWorkspacePin uses a factory method (AdminWorkspacePin.Create) and private setters to enforce invariants. This is a deliberate domain design choice — the entity is immutable after creation except for SortOrder via SetSortOrder(). Bootstrap auto-pinning happens via BootstrapAdminPinsCommand on first workspace fetch.",
      dashboardPresetTitle: "DashboardPreset Entity",
      dashboardPresetIntro:
        "DashboardPreset stores a complete DashboardThemeJson snapshot that can be applied to any tenant's dashboard. System presets (IsSystem = true) are seeded and available to all tenants; admin-created presets are tenant-scoped. Applying a preset replaces the tenant's DashboardThemeJson in full — this is a snapshot-based, not patch-based, apply operation.",
    },
    identityAccessControlDeep: {
      title: "Access Control Deep Dive",
      description:
        "Entity-level documentation for AdminRole (role assignment junction with tenant scoping and expiry), AdminUserGroup (group membership), and UserGroupRestriction (additive field-level restrictions for group members).",
      intro:
        "SCRIPE's access control system is built on three junction/restriction entities. AdminRole links an admin to a role, optionally scoped to a specific tenant with an optional expiry date. AdminUserGroup links an admin to a user group, granting all roles inherited by that group. UserGroupRestriction defines field-level restrictions that are applied additively (UNION) to all group members' API responses. These three entities work together to produce a fine-grained, auditable access control model.",
      adminRoleTitle: "AdminRole Entity",
      adminRoleIntro:
        "AdminRole is the junction entity between Admin and Role. TenantId scoping enables a single admin to have different roles across different tenants — a common pattern where a platform admin has SuperAdmin at platform level but only ReadOnly when drilling into a specific tenant. InheritToChildren cascades the role to all child tenants in a hierarchy. ExpiresAt enables time-limited role grants for contractors or temporary access.",
      adminRoleNote:
        "Expired AdminRole records (ExpiresAt < UtcNow) are treated as inactive by the AuthorizationBehavior pipeline without requiring deletion. A daily cleanup job removes expired records after a grace period. AssignedBy is kept alongside AuditableEntity.CreatedBy for explicit tracking in permission audit reports.",
      adminUserGroupTitle: "AdminUserGroup Entity",
      adminUserGroupIntro:
        "AdminUserGroup is the membership junction between Admin and UserGroup. An admin inherits all roles assigned to a group via RolePermission records. Groups simplify bulk role management — instead of assigning roles individually, assign them to a group and add admins to that group. AdminUserGroup is auditable via AuditableEntity.",
      adminUserGroupNote:
        "Role inheritance through groups is additive: an admin's effective permissions are the UNION of their direct AdminRole assignments and all roles inherited through every group they belong to. Removing an admin from a group immediately revokes group-inherited permissions.",
      userGroupRestrictionTitle: "UserGroupRestriction Entity",
      userGroupRestrictionIntro:
        "UserGroupRestriction defines field-level data restrictions for a user group. When an admin belongs to a group with restrictions, the listed fields are nullified in API responses for that resource. Restrictions are additive — group restrictions UNION with role-level restrictions, never override or reduce them. This means belonging to more groups can only increase restrictions, never decrease them.",
      userGroupRestrictionWarning:
        "Field restrictions are enforced server-side in the FieldProjection pipeline behavior — they are NOT a client-side UI feature. However, restrictions only nullify field values in responses; they do not prevent create/update operations on those fields. Use role permissions to control write access, and UserGroupRestriction to control read visibility.",
      restrictionFlowTitle: "Restriction Evaluation Flow",
      restrictionFlowIntro:
        "When an admin makes an API request for a restricted resource, SCRIPE evaluates all applicable restrictions and applies them as a UNION to the response payload.",
      restrictionFlowNote:
        "Restriction evaluation is lazy — it runs per-request, not at login time. This means adding a restriction to a group takes effect immediately on the next API call without requiring a session refresh. The UNION merge strategy guarantees restrictions only accumulate — an admin who belongs to two groups with overlapping restrictions sees both restriction sets applied.",
    },
    userSubscriptions: {
      title: "User Subscriptions",
      description:
        "End-user subscription management for Tier 2 of the B2B2C model. Users subscribe to TenantPlans configured by the tenant. Supports versioning, promotions, trial periods, and immutable audit trail via Cancel + Replace.",
      intro:
        "UserSubscription records link an end-user to a TenantPlan. This is Tier 2 of SCRIPE's B2B2C model — the tenant manages plans, users subscribe to those plans. UserSubscriptions are intentionally immutable after creation: there is no 'edit' action. To change a plan, the admin cancels the existing subscription and creates a new one (Cancel + Replace flow). This preserves a clean audit trail and aligns with Stripe Connect billing semantics.",
      entityTitle: "UserSubscription Entity",
      entityIntro:
        "Each UserSubscription represents one user's current or historical subscription to a TenantPlan. The UserId is a plain Guid (no navigation property) to preserve module boundary isolation — Entitlements never imports Identity entities directly.",
      statusTitle: "Status Lifecycle",
      statusIntro:
        "UserSubscription statuses follow the user's payment and trial journey. The Cancel + Replace pattern means Cancelled subscriptions are terminal — a new subscription record is always created for plan changes.",
      featureCheckerTitle: "UserFeatureCheckerService",
      featureCheckerIntro:
        "The UserFeatureCheckerService resolves which features a user can access based on their active UserSubscription and the linked TenantPlanFeature records. It returns a key-value dictionary of feature values that can be used for runtime feature gating.",
      reconciliationTitle: "Subscription Reconciliation Job",
      reconciliationIntro:
        "A daily IAutoRegisteredJob (UserSubscriptionReconciliationJob) runs to transition subscriptions whose ExpiresAt has passed to Expired status. It also handles trial-to-active promotions for subscribers with IsAutoRenew = true.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "User subscription endpoints support both admin operations (create, cancel) and user-facing queries (my subscription, feature access).",
      permissionsTitle: "Permissions",
      permissionsIntro:
        "Access to user subscription management is controlled by the following RBAC permissions:",
      "ep.list": "Get all user subscriptions for the tenant (paginated)",
      "ep.get": "Get a specific user's subscription details",
      "ep.create": "Assign a subscription plan to a user",
      "ep.cancel": "Cancel an active user subscription",
      "ep.mySubscription": "Get the calling user's own subscription",
      "ep.myFeatures": "Get the calling user's feature access dictionary",
    },
    stripeConnect: {
      title: "Stripe Connect",
      description:
        "Marketplace payment splitting via Stripe Connect Express — tenant accounts, commission rate resolution chain, ledger entries, commission invoicing, promotion redemption, and operational alerts.",
      intro:
        "Stripe Connect enables SCRIPE's marketplace payment splitting model. When a tenant processes a user payment, the platform automatically deducts a commission via Stripe's application_fee_amount and routes the net amount to the tenant's Stripe Express account. This page covers the full domain model, commission resolution chain, and operational tooling.",
      whatIsTitle: "What Is Stripe Connect?",
      whatIsIntro:
        "Stripe Connect is Stripe's multi-party payment infrastructure. In SCRIPE, it powers the B2B2C marketplace: tenants sell plans to their end-users, Stripe routes payments, and SCRIPE's commission engine deducts the platform fee automatically on each charge without requiring tenant cooperation.",
      architectureTitle: "Payment Split Architecture",
      architectureIntro:
        "Every user payment flows through Stripe, which instantly splits it between the tenant and the platform based on the resolved commission rate.",
      accountEntityTitle: "TenantStripeAccount Entity",
      accountEntityIntro:
        "One TenantStripeAccount row exists per tenant. It tracks the Stripe account ID, onboarding lifecycle, charge/payout capability, commission rate override, and cumulative payout statistics.",
      onboardingTitle: "Onboarding Status Lifecycle",
      onboardingIntro:
        "Tenant accounts go through a Stripe-managed KYC/identity verification process before they can accept charges or receive payouts.",
      commissionTitle: "Commission Rate Resolution Chain",
      commissionIntro:
        "The effective commission rate is resolved from most-specific to most-general. The first non-null value in the chain wins.",
      commChain1: "Per-tenant override — set by platform admin in the Stripe Connect admin panel.",
      commChain2:
        "Per-edition rate — configured on the Edition entity via ConnectCommissionRate field.",
      commChain3: "Platform-wide default — stored in the ConnectPlatformSettings singleton row.",
      commChain4: "Hardcoded safety fallback — 10% — only used if the singleton row is missing.",
      settingsTitle: "ConnectPlatformSettings (Singleton)",
      settingsIntro:
        "A single row (ID: 00000001-0000-0000-0000-000000000001) stores platform-wide Connect defaults. Always access via ConnectPlatformSettings.SingletonId — never insert a second row.",
      settingsSingletonNote:
        "ConnectPlatformSettings uses the Singleton pattern: exactly ONE row always exists, identified by the well-known SingletonId constant. The admin UI surfaces it as an editable settings form rather than a list.",
      ledgerTitle: "Commission Ledger & Invoicing",
      ledgerIntro:
        "Three entities form the commission accounting system. For Stripe Connect payments, commissions are collected instantly via application_fee_amount. For non-Connect gateways (PayPal, Paymob), commissions are tracked in CommissionLedgerEntry and billed monthly or on threshold.",
      invoiceTriggerTitle: "Commission Invoice Triggers",
      invoiceTriggerIntro:
        "CommissionInvoice rows are generated by one of three triggers, configurable in ConnectPlatformSettings.",
      promoTitle: "Promotion Redemption (FirstTimeOnly Enforcement)",
      promoIntro:
        "PromotionRedemption records each promotional code usage at signup activation. Because SCRIPE creates a new Stripe Customer per signup, Stripe's first_time_transaction flag is unreliable. SCRIPE instead stores a SHA-256 hash of the subscriber's email to enforce FirstTimeOnly promotions locally for up to 12 months.",
      promoNote:
        "PromotionRedemption rows are hard-deleted after 12 months (not soft-deleted — accepted v1 trade-off). FirstTimeOnly enforcement weakens past this horizon. Raw email addresses are never stored — only the SHA-256 hex hash.",
      alertsTitle: "Operational Alerts",
      alertsIntro:
        "OperationalAlert is a dead-letter table for events requiring human review. Every alert also triggers an ops notification email via the email outbox. Alerts are visible in the admin panel where operators can acknowledge and resolve them inline.",
      configTitle: "Configuration",
      configIntro:
        "Stripe Connect requires two webhook secrets: the standard webhook secret for SaaS subscription events, and a Connect webhook secret for account-level events (charges, payouts, account.updated).",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "Connect management endpoints are restricted to super-admin roles. Tenant-facing onboarding links are generated per-tenant and are single-use.",
      "ep.create": "Register a new Stripe Connect Express account for a tenant",
      "ep.get": "Get the Stripe account status and onboarding details for a tenant",
      "ep.onboardingLink": "Generate a single-use Stripe Connect onboarding link for a tenant",
      "ep.ledger": "List commission ledger entries (filterable by tenant, status, gateway)",
      "ep.invoices": "List commission invoices (filterable by tenant, status, trigger)",
      "ep.invoiceGenerate": "Manually trigger commission invoice generation for a tenant",
      "ep.settings": "Get the ConnectPlatformSettings singleton",
      "ep.settingsUpdate":
        "Update platform-wide Connect defaults (commission rate, payout delay, threshold)",
      "ep.alerts": "List all operational alerts (filterable by type, status, severity)",
      "ep.alertResolve": "Acknowledge or resolve an operational alert with a resolution note",
    },
    signupCustomization: {
      title: "Signup Customization",
      description:
        "Intelligence Engine for self-service signup — configurable onboarding questions with branching logic, option-level visibility conditions, and declarative recommendation rules that map user answers to the right edition.",
      intro:
        "The Signup Customization system is SCRIPE's Intelligence Engine for the self-service signup flow. Platform administrators define a question tree, each answer option carries a signal weight, and declarative RecommendationRules map answer patterns to specific editions — automatically guiding users to the plan best suited to their needs.",
      whatIsTitle: "What Is the Intelligence Engine?",
      whatIsIntro:
        "The Intelligence Engine is the recommendation system behind SCRIPE's self-service signup. Instead of presenting a static pricing table, users answer a short onboarding questionnaire. The engine matches their answers against RecommendationRules and presents a personalized edition recommendation with a localized reason. Administrators configure questions, options, and rules without code changes.",
      flowTitle: "Signup Flow Overview",
      flowIntro: "The full signup flow from category selection through recommendation.",
      questionTitle: "OnboardingQuestion Entity",
      questionIntro:
        "Each OnboardingQuestion represents a single step in the onboarding flow. Questions can be global (shown to all users) or scoped to an EditionCategory. Question-level branching is supported via DependsOnQuestionKey + DependsOnAnswerValue.",
      optionTitle: "OnboardingAnswerOption Entity",
      optionIntro:
        "Each OnboardingAnswerOption is a selectable answer choice for a question. Options carry scoring signals (SignalWeight) for the recommendation engine and optional visibility relevance boosts (RelevanceBoost) that re-rank options based on earlier answers.",
      conditionTitle: "Option-Level Visibility Conditions",
      conditionIntro:
        "OnboardingAnswerOptionCondition enables fine-grained client-side visibility control at the individual option level. Unlike question-level branching (which shows/hides entire questions), option conditions show/hide specific answer choices based on earlier answers.",
      conditionNote:
        'Condition evaluation happens client-side only. The backend stores and returns conditions in the onboarding-flow payload — no server-side filtering is applied. MatchValuesRaw stores the set as a comma-delimited string (e.g. "2-10,11-50") for DB portability across SQL Server, Oracle, and PostgreSQL without provider-specific JSON columns.',
      sessionAnswerTitle: "SignupSessionAnswer Entity",
      sessionAnswerIntro:
        "SignupSessionAnswer persists each user's answer during an in-progress signup. It deliberately uses SignupSessionRef (a plain string) instead of a FK to the SignupSession entity to avoid cross-module coupling — the Entitlements module never imports Identity session types.",
      sessionAnswerTip:
        'SignupSessionAnswer enables session resume: if a user closes the browser mid-flow, their answers can be reloaded on return via the SignupSessionRef. The ValueJson field stores both single-select ("\\"solo\\"") and multi-select ("[\\"compliance\\",\\"scale\\"]") answers in a uniform format.',
      ruleTitle: "RecommendationRule Entity",
      ruleIntro:
        "RecommendationRules are the declarative matching engine. Each rule defines a ConditionJson predicate, a target edition (by tier level or specific ID), and a ScoreBonus. Rules evaluated in Priority order accumulate scores per candidate edition — the highest-scoring edition wins.",
      scoringTitle: "Scoring Algorithm",
      scoringIntro:
        "The recommendation engine evaluates all active rules, accumulates scores, and returns the top-scoring edition with the reason from the highest-priority matching rule.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "Admin endpoints for question/rule management require entitlements.manage permission. Flow and answer endpoints are public — no authentication required during signup.",
      "ep.questions": "List all onboarding questions with their options and conditions",
      "ep.createQuestion": "Create a new onboarding question with answer options",
      "ep.updateQuestion": "Update an existing question (label, hint, sort order, branching)",
      "ep.deleteQuestion": "Delete a non-system onboarding question",
      "ep.flow": "Get the full onboarding flow for a given category (public — used during signup)",
      "ep.submitAnswers": "Submit answers for a signup session step (public)",
      "ep.recommend": "Get edition recommendation based on submitted answers (public)",
      "ep.rules": "List all recommendation rules",
      "ep.createRule": "Create or upsert a recommendation rule by stable Name slug",
    },
    platformManagement: {
      title: "Platform Management",
      description:
        "Concurrency-safe quota counters with pooled enforcement, trial resource snapshots, and the non-Connect commission ledger for PayPal and Paymob gateway commissions.",
      intro:
        "Platform Management covers the operational infrastructure that keeps SCRIPE's multi-tenant platform numerically consistent: quota counters that prevent resource over-provisioning, trial snapshots that enable accurate downgrade enforcement, and the commission ledger that tracks platform revenue from non-Stripe-Connect payment gateways.",
      whatIsTitle: "What Is Platform Management?",
      whatIsIntro:
        "Platform Management is the collection of domain entities responsible for enforcing tenant resource limits (quotas), capturing resource state at trial start, and tracking platform commissions from PayPal and Paymob gateway payments. These components work together to ensure billing integrity and fair resource allocation across the multi-tenant hierarchy.",
      quotaTitle: "QuotaCounter Entity",
      quotaIntro:
        "QuotaCounter tracks resource usage per tenant with optional pooled enforcement. One row exists per tenant per resource type (admin, role, subtenant, usergroup). The reservation pattern prevents race conditions under concurrent creation requests.",
      reservationTitle: "Atomic Reservation Pattern",
      reservationIntro:
        "The reservation pattern is a three-phase protocol that prevents quota over-provisioning even under high concurrency.",
      reservationNote:
        "TryReserveSlotAsync uses a database-level atomic increment of Reserved. On failure (e.g. database exception), the strategy is fail-open to preserve availability — the reservation is released and the creation is allowed with a warning logged. This matches the quota enforcement philosophy: approximate limits are preferable to service unavailability.",
      pooledTitle: "Quota Enforcement Modes",
      pooledIntro:
        "QuotaCounter supports two enforcement modes controlled by PoolRootTenantId. Per-tenant enforcement is the default; pooled enforcement enables resource sharing across a tenant hierarchy (e.g. a parent tenant that allocates admins across its sub-tenants).",
      trialSnapshotTitle: "TrialSnapshot Entity",
      trialSnapshotIntro:
        "A TrialSnapshot captures the resource counts (admin, role, sub-tenant, user-group) at the exact moment a trial subscription begins. At trial expiry, the system compares current counts against the snapshot to determine if the tenant provisioned resources beyond the base edition's limits during the trial period.",
      trialSnapshotTip:
        "TrialSnapshot enables the trial downgrade safety check: if AdminCount grew from 2 (snapshot) to 8 (current) and the post-trial edition allows only 5, the system can trigger the OverflowPolicy action (Freeze or Notify) before activating the downgraded subscription.",
      ledgerEntryTitle: "CommissionLedgerEntry Entity",
      ledgerEntryIntro:
        "CommissionLedgerEntry records commissions from non-Connect gateway payments (PayPal, Paymob). For Stripe Connect payments, commissions are collected instantly via application_fee_amount — this entity is only for post-billing gateway flows that require deferred commission collection.",
      revenueTitle: "Revenue Analytics Integration",
      revenueIntro:
        "The commission ledger feeds directly into the Revenue Analytics module for platform-wide financial reporting.",
      endpointsTitle: "API Endpoints",
      endpointsIntro:
        "Platform management endpoints are restricted to super-admin roles. Quota data is read-only for standard platform admins.",
      "ep.quotaList": "List all quota counters (filterable by tenant, resource type)",
      "ep.quotaGet": "Get the quota counter for a specific tenant and resource type",
      "ep.quotaReset":
        "Reset quota counters for a tenant (use with caution — clears Reserved and resets Used)",
      "ep.trialSnapshot":
        "Get the trial snapshot for a subscription (used by downgrade enforcement)",
      "ep.ledger": "List commission ledger entries (filterable by tenant, gateway, status)",
      "ep.waive": "Waive a commission ledger entry with an admin note",
      "ep.dashboard":
        "Get platform management dashboard KPIs (total commissions, quota utilization, trial snapshots)",
    },

    // ─── Marketplace Module (Phase 16) ────────────────────────────
    marketplaceOverview: {
      title: "Marketplace Overview",
      description:
        "The SCRIPE Marketplace — ecosystem of installable apps, categories, developer profiles, and the entity map for all 13 domain entities.",
      intro:
        "The Marketplace module powers SCRIPE's app ecosystem: developers publish plugins as commercial listings, tenants browse and purchase them, and the platform enforces a multi-stage review pipeline before any app goes live. This page covers the full entity map and the two organizational entities — AppCategory and AppCategoryMapping.",
      infoTitle: "Marketplace + Plugins",
      infoContent:
        "The Marketplace module builds on top of the Plugins module. An AppListing is the commercial 'face' of a PluginDefinition. Tenants install the underlying plugin; the marketplace handles discovery, pricing, and payments.",
      featuresTitle: "Key Capabilities",
      featurePublish: "App Publishing",
      featurePublishDesc:
        "Developers create AppListings that link PluginDefinitions to a storefront presence with name, tagline, screenshots, and pricing.",
      featureInstall: "One-Click Install",
      featureInstallDesc:
        "Tenants browse the catalog, purchase or trial apps, and trigger plugin installation in a single flow.",
      featureReview: "Ratings & Reviews",
      featureReviewDesc:
        "Users submit 1–5 star ratings with review text. Developers can reply once per review. AverageRating is denormalized on AppListing for fast catalog queries.",
      featurePricing: "Flexible Pricing",
      featurePricingDesc:
        "Six pricing models: Free, PaidOnce, Subscription, Freemium, PerSeat, UsageBased — all configured via AppPricing with trial-day support.",
      featureAnalytics: "Install Analytics",
      featureAnalyticsDesc:
        "Daily AppInstallCount snapshots power developer dashboards showing install trends, growth rates, and active install counts.",
      featureReviewGate: "Submission Review Gate",
      featureReviewGateDesc:
        "Every new version goes through automated scan → manual admin review (AppSubmission + AppReviewTask) before it can be published.",
      entitiesTitle: "Domain Entity Map",
      entitiesIntro:
        "The Marketplace module contains 13 domain entities across five functional areas: listings, developer portal, purchases, analytics, and reviews.",
      categoryTitle: "AppCategory Entity",
      categoryIntro:
        'Represents a marketplace category used to organize app listings (e.g. "Productivity", "Analytics", "Communication"). Supports bilingual names (EN/AR) and a URL-safe slug for routing.',
      mappingTitle: "AppCategoryMapping Entity",
      mappingIntro:
        "Join entity implementing the many-to-many relationship between AppListing and AppCategory. An app can belong to multiple categories, and a category can contain multiple apps.",
      architectureTitle: "Entity Relationship Overview",
      architectureIntro:
        "The diagram below shows how the 13 Marketplace entities relate. DeveloperProfile is the root — it owns AppListings, which are the hub connecting pricing, submissions, purchases, reviews, screenshots, and analytics.",
    },

    marketplaceListings: {
      title: "App Listings & Screenshots",
      description:
        "AppListing — the central marketplace storefront entity linking a PluginDefinition to its commercial presence, plus AppScreenshot for the media gallery.",
      intro:
        "An AppListing is the storefront face of a Plugin. It carries everything a tenant sees in the catalog: name, tagline, icon, version, ratings, and install counts. Screenshots provide the visual gallery on the listing detail page.",
      listingTitle: "AppListing Entity",
      listingIntro:
        "The central entity of the Marketplace module. It connects a Plugin to its commercial presence including pricing, reviews, screenshots, and install metrics. AverageRating and ReviewCount are denormalized for query performance and recalculated whenever a review is added or updated.",
      listingNote:
        "AverageRating and ReviewCount are denormalized on AppListing for catalog query performance. They are recalculated atomically by the domain logic every time an AppReview is created, updated, or deleted.",
      codeTitle: "Entity Source",
      screenshotTitle: "AppScreenshot Entity",
      screenshotIntro:
        "Represents a screenshot image for an app listing's detail page. Screenshots are ordered by SortOrder and displayed in a carousel on the storefront.",
      statusTitle: "Listing Status Lifecycle",
      statusIntro:
        "An AppListing moves through several states from first draft to public visibility. The IsPublished flag controls storefront visibility; IsFeatured promotes a listing to the hero section.",
    },

    marketplaceDeveloper: {
      title: "Developer Portal",
      description:
        "DeveloperProfile, AppSubmission, and DeveloperPayout — the three entities powering the developer-side of the SCRIPE Marketplace.",
      intro:
        "The developer portal covers everything from registering a developer account to publishing apps and receiving revenue-sharing payouts. Three entities work together: DeveloperProfile (identity and payment details), AppSubmission (version review pipeline), and DeveloperPayout (settlement records).",
      profileTitle: "DeveloperProfile Entity",
      profileIntro:
        "Represents a developer (tenant) registered to publish apps on the marketplace. Each tenant can have at most one developer profile. Admin verification is required before the developer can publish paid apps.",
      profileNote:
        "StripeConnectAccountId links the developer's marketplace earnings to their Stripe Connect account. Payouts are transferred via Stripe's Connect Transfers API. IsVerified must be true before paid listings are accepted.",
      submissionTitle: "AppSubmission Entity",
      submissionIntro:
        "Represents a version submission of an app listing for marketplace review. Each submission goes through a lifecycle: Submitted → InAutomatedScan → InManualReview → Approved/Rejected. Only approved submissions result in the listing being published.",
      payoutTitle: "DeveloperPayout Entity",
      payoutIntro:
        "Records a revenue-sharing payout to a developer for a specific period. Payouts are calculated from purchase commissions and transferred to the developer's Stripe Connect account.",
      onboardingTitle: "Developer Onboarding Flow",
      onboardingIntro:
        "The end-to-end onboarding flow from profile creation to receiving first payout.",
    },

    marketplacePurchases: {
      title: "App Purchases & Analytics",
      description:
        "AppPricing, AppPurchase, and AppInstallCount — the three entities handling pricing models, transaction records, and daily install-metric snapshots.",
      intro:
        "Purchases and analytics form the commercial backbone of the Marketplace. AppPricing defines how an app is monetized; AppPurchase records each transaction; AppInstallCount provides daily snapshots for developer analytics dashboards.",
      pricingTitle: "AppPricing Entity",
      pricingIntro:
        "Defines the pricing configuration for an app listing. One AppPricing record exists per listing (one-to-one relationship). Supports six pricing models.",
      pricingNote:
        "PricingModel options: Free (Price=0, no purchase needed), PaidOnce (single payment, permanent access), Subscription (recurring billing), Freemium (free tier + paid upgrades), PerSeat (price × admin count), UsageBased (metered via Stripe Meters).",
      purchaseTitle: "AppPurchase Entity",
      purchaseIntro:
        "Records a purchase transaction when a tenant buys or installs a paid app. Tracks the amount paid, currency, and transaction status for financial reporting and developer payout calculations.",
      installCountTitle: "AppInstallCount Entity",
      installCountIntro:
        "Daily snapshot of installation metrics for an app listing. Used by the analytics dashboard to display install trend charts and calculate growth rates over time.",
      installCountTip:
        "AppInstallCount records are created by a nightly background job that calculates NetInstalls (installs - uninstalls) and TotalActiveInstalls from AppPurchase and plugin installation data for each listing.",
      flowTitle: "Purchase Flow",
      flowIntro:
        "The end-to-end flow from browsing the catalog to a plugin being installed and analytics being updated.",
    },

    marketplaceReviews: {
      title: "Ratings & Reviews",
      description:
        "AppReview, AppReviewReply, and AppReviewTask — the three entities powering user ratings, developer replies, and the admin submission review pipeline.",
      intro:
        "The review system serves two purposes: user-facing ratings and text reviews that appear on listing pages, and the admin review pipeline that gates new app versions before publication.",
      reviewTitle: "AppReview Entity",
      reviewIntro:
        "Represents a user-submitted rating and review for an app listing. Each tenant user can leave one review per app. Reviews include a 1–5 star rating and optional text content. Developers can reply via AppReviewReply.",
      reviewNote:
        "Each user (UserId) can submit at most one AppReview per AppListing. A unique constraint on (AppListingId, UserId) enforces this at the database level. Updating a review recalculates AverageRating on the parent AppListing.",
      replyTitle: "AppReviewReply Entity",
      replyIntro:
        "Represents a developer's reply to a user review on their app listing. Each review can have at most one reply from the developer.",
      taskTitle: "AppReviewTask Entity",
      taskIntro:
        "Represents an admin review task assigned to evaluate an app submission. Tracks the assigned reviewer, current review status (Pending → InProgress → Approved/Rejected/Escalated), and feedback provided to the developer during the review process.",
      moderationTitle: "Submission Review Pipeline",
      moderationIntro:
        "Every app version submission passes through an automated scan followed by manual admin review before it can be published to the storefront.",
    },

    // ─── Plugins Entity Pages (Phase 16) ─────────────────────────
    pluginEntities: {
      title: "Plugin Definition & Versioning",
      description:
        "PluginDefinition and PluginVersion — the two root entities of the Plugins module that define a plugin's identity, capabilities, and release history.",
      intro:
        "Every plugin in the SCRIPE ecosystem starts with a PluginDefinition — the immutable identity record. Versions are snapshotted releases of that definition. Together they form the foundation that installations, API keys, and data stores build upon.",
      definitionTitle: "PluginDefinition Entity",
      definitionIntro:
        "Core entity representing a registered plugin in the platform. Contains metadata (name, description, icon), configuration (manifest, tier, scope), and developer association. Supports both Tier 1 (embedded .NET assembly) and Tier 2 (external HTTP service) plugin architectures.",
      definitionNote:
        "Tier 1 plugins use AssemblyName + EntryPointType to locate the .NET class loaded into the host process. Tier 2 plugins use BaseUrl + FrontendUrl + WebhookUrl to communicate with an external service. Fields for the other tier are left null.",
      codeTitle: "Entity Source",
      versionTitle: "PluginVersion Entity",
      versionIntro:
        "Represents a specific release version of a PluginDefinition. Tracks version number, bilingual release notes, manifest snapshot, and whether this is the latest active version. Each installation pins to a specific version at install time.",
      versionLifecycleTitle: "Version Lifecycle",
      versionLifecycleIntro:
        "When a new version is published, it becomes IsLatest = true and the previous version is demoted to IsLatest = false. Existing installations remain pinned to their installed version until an admin explicitly runs the upgrade command.",
    },

    pluginInstallation: {
      title: "Plugin Installation & Security",
      description:
        "PluginInstallation, PluginApiKey, and PluginPermissionGrant — the three entities managing per-tenant plugin deployment, API authentication, and permission grants.",
      intro:
        "When a tenant installs a plugin, three core entities are created: a PluginInstallation record tracking deployment state, a PluginApiKey for secure plugin-to-platform API calls, and PluginPermissionGrant records for each platform capability the plugin is allowed to access.",
      installationTitle: "PluginInstallation Entity",
      installationIntro:
        "Represents a tenant's installation of a specific PluginDefinition at a particular PluginVersion. A tenant can install the same plugin only once — enforced by a unique constraint on (TenantId + PluginDefinitionId).",
      installationNote:
        "ConsecutiveHealthCheckFails is incremented by the plugins-health-check background job on each failed check and reset to 0 when the health check passes again. The Status is automatically transitioned to Error after a configurable failure threshold.",
      lifecycleTitle: "Installation Lifecycle",
      lifecycleIntro:
        "A PluginInstallation starts in Installing status while the platform provisions resources, then transitions to Active. Admins can deactivate/reactivate it. Persistent health-check failures move it to Error.",
      apiKeyTitle: "PluginApiKey Entity",
      apiKeyIntro:
        "Represents an API key issued to a plugin installation for authenticating plugin-to-platform API calls. Stores the hashed key value, a human-readable prefix for identification, activation status, and optional expiration.",
      apiKeyWarning:
        "The raw API key value is shown only once at creation time and is never stored — only the hash is persisted. Plugins must store the key securely in their own secrets management system.",
      permGrantTitle: "PluginPermissionGrant Entity",
      permGrantIntro:
        "Records an explicit permission grant to a plugin installation within a tenant. Each grant authorizes the plugin to access a specific platform capability. Platform admins must explicitly approve each permission during the installation setup wizard.",
    },

    pluginRuntime: {
      title: "Plugin Runtime & Data",
      description:
        "PluginDataStore, PluginExecutionLog, and PluginWebhookSubscription — the three entities powering plugin data persistence, execution monitoring, and event subscription.",
      intro:
        "Once a plugin is installed and active, three runtime entities handle its ongoing operation: PluginDataStore for persisting plugin state, PluginExecutionLog for monitoring API call health, and PluginWebhookSubscription for receiving platform events.",
      dataStoreTitle: "PluginDataStore Entity",
      dataStoreIntro:
        "Key-value data store entry scoped to a plugin installation and tenant. Plugins use this to persist arbitrary JSON data organized by namespace and key. Tracks the serialized size for quota enforcement.",
      dataStoreNote:
        "Data isolation is enforced at two levels: the unique constraint on (PluginInstallationId + TenantId + Namespace + Key) prevents collisions, and TenantId is always required to prevent cross-tenant data leakage. Plugins cannot read another tenant's data store entries.",
      execLogTitle: "PluginExecutionLog Entity",
      execLogIntro:
        "Immutable audit log entry recording a single plugin API execution. Captures the HTTP method, endpoint, response status code, duration in milliseconds, and success/failure status. Used for monitoring plugin health and debugging.",
      execLogTip:
        "The plugins-health-check background job queries PluginExecutionLog to compute ConsecutiveHealthCheckFails and update HealthCheckPassing on PluginInstallation. High DurationMs values are flagged as performance warnings.",
      webhookTitle: "PluginWebhookSubscription Entity",
      webhookIntro:
        "Represents a webhook subscription registered by a plugin installation. When the specified platform event type fires, the system dispatches an HTTP POST to the callback URL. Subscriptions can be deactivated (IsActive=false) without deletion.",
      webhookFlowTitle: "Webhook Delivery Flow",
      webhookFlowIntro:
        "The platform uses an outbox pattern for reliable webhook delivery. Events are first written to the outbox, then delivered asynchronously to the plugin's CallbackUrl with exponential backoff retries.",
    },
  },
};
