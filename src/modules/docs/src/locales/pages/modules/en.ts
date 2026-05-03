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
    compliance: {
      overview: {
        title: "Compliance Module",
        description: "GDPR, CCPA, and PDPA compliance automation — regulations, DSR handling, consent management, data retention, inventory, and report generation.",
        intro: "The Compliance module is NEXORA's built-in regulatory compliance engine. It helps platform operators and their tenants stay compliant with major data protection laws (GDPR, CCPA, PDPA) through automated tools for managing data subject requests, consent records, retention policies, and generating audit-ready compliance reports.",
        infoTitle: "Compliance Notice",
        infoContent: "The Compliance module is critical for maintaining regulatory adherence and avoiding fines. Ensure all features are correctly mapped to data processing policies.",
        // Feature Grid
        featureDsr: "Data Subject Requests",
        featureDsrDesc: "Handles Subject Requests including Export, Erasure, Rectification, and Restriction with full lifecycle tracking and SLA monitoring.",
        featureConsent: "Consent Management",
        featureConsentDesc: "Immutable tracking of consent states, snapshots, and audit trails for GDPR Article 6 and CCPA compliance.",
        featureRetention: "Retention Policies",
        featureRetentionDesc: "Enforces data destruction policies based on configurable retention periods with automated Delete or Anonymize actions.",
        featureInventory: "Data Inventory",
        featureInventoryDesc: "Maps sensitive PII locations across modules — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        featureReports: "Compliance Reports",
        featureReportsDesc: "Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        featureWebhooks: "Webhook Events",
        featureWebhooksDesc: "11 real-time webhook events covering DSR lifecycle, consent changes, retention enforcement, and report generation.",
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
        tr1_2: "Handles the pagination, filtering, and assignment of incoming Data Subject Requests.",
        tr2_1: "ConsentRecordView",
        tr2_2: "Renders the immutable consent snapshot alongside user agent and timestamp metadata.",
        // What Is
        whatIsTitle: "What is the Compliance Module?",
        whatIsIntro: "The Compliance module provides six interconnected sub-systems that cover the full compliance lifecycle. Instead of building compliance tooling from scratch, NEXORA tenants get a production-ready system that tracks, automates, and reports on their data protection obligations.",
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
        regulationsIntro: "NEXORA's Compliance module supports enforcement of these major data protection regulations. Each regulation is pre-seeded with its SLA deadlines and penalty structures.",
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
        backendIntro: "The Compliance backend follows the standard NEXORA 3-project module layout (Domain / Application / Infrastructure) with a dedicated ComplianceDbContext and ComplianceController.",
        // CQRS
        cqrsTitle: "CQRS Commands & Queries",
        cqrsIntro: "The Compliance module uses the standard MediatR CQRS pattern. Commands handle write operations and Queries handle read operations, each with dedicated FluentValidation validators.",
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
        frontendIntro: "The frontend is organized as six independent sub-modules under src/modules/compliance/, each with its own domain, data, and presentation layers following the View/ViewModel pattern.",
        // API Endpoints
        endpointsTitle: "API Endpoints Overview",
        endpointsIntro: "All endpoints are under /api/v1/compliances/ and require authentication with the compliance.view permission.",
        apiRegList: "List all regulation profiles configured for the platform",
        apiDsrSubmit: "Submit a new Data Subject Request (Export, Erasure, Rectification, Restriction)",
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
        webhooksIntro: "The Compliance module fires 11 real-time webhook events that external systems can subscribe to. Events are auto-registered via the ComplianceWebhookEventCatalog and dispatched through the IWebhookDispatcher pipeline.",
        webhookEvent: "Event Key",
        webhookCategory: "Category",
        webhookDesc: "Description",
        whDsrSubmitted: "Fired when a new Data Subject Request is submitted",
        whDsrStatusChanged: "Fired when a DSR status transitions (Pending → InProgress → Completed/Rejected)",
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
        step1Content: "Run the development seeder to populate regulation profiles, sample consent purposes, and retention policies for your test environment.",
        step2Title: "Configure Regulation Profiles",
        step2Content: "Navigate to Compliance → Regulations in the admin panel. Enable the regulations your platform operates under (GDPR, CCPA, PDPA). Each regulation defines the SLA deadlines and penalty structures that will be enforced.",
        step3Title: "Submit a Test DSR",
        step3Content: "Create a Data Subject Request to test the full lifecycle. The system will validate the request, calculate the SLA deadline, and make it available for assignment to a compliance officer.",
        step4Title: "Record Consent & Configure Retention",
        step4Content: "Set up consent purposes (Marketing, Analytics, Third-Party) and configure retention policies for each data category. The retention enforcement job will automatically apply the configured actions when data ages past the retention period.",
        step5Title: "Generate a Compliance Report",
        step5Content: "Queue an async compliance report. The report will be generated in the background and appear in the Reports list once ready. Download it in CSV, JSON, XLSX, or PDF format.",
        // Security
        securityTitle: "Security Considerations",
        securityIntro: "Compliance data is among the most sensitive in the platform. All endpoints are protected by JWT authentication, role-based authorization, and encrypted ID transit. Personal data in DSRs and consent records is subject to field-level security restrictions.",
        securityWarningTitle: "Data Protection Warning",
        securityWarningContent: "Compliance data contains personally identifiable information (PII). Ensure proper access controls, audit logging, and data encryption are configured. Never expose raw compliance endpoints without authentication.",
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
        title: "Data Subject Requests (DSR)",
        description: "Manage GDPR/CCPA rights requests — export, erasure, rectification, and restriction — with full lifecycle tracking.",
        intro: "Data Subject Requests (DSRs) are formal requests from individuals exercising their rights under data protection laws. The Compliance module provides a complete DSR workflow: submission, assignment, processing, and closure — with full audit trail and SLA tracking.",
        typesTitle: "Request Types",
        typesIntro: "The system supports four DSR types as defined by GDPR Article 17 and CCPA:",
        type1: "Export — Data portability request. The subject wants a copy of their personal data.",
        type2: "Erasure — Right to be forgotten. All personal data must be deleted or anonymized.",
        type3: "Rectification — Correction request. Inaccurate personal data must be updated.",
        type4: "Restriction — Processing restriction. Data can be retained but not actively processed.",
        lifecycleTitle: "Request Lifecycle",
        lifecycleIntro: "DSRs move through a defined set of statuses from submission to closure:",
        status1: "Pending — Initial state when the request is received.",
        status2: "InProgress — A compliance officer has been assigned and is processing the request.",
        status3: "Completed — The request has been fulfilled (data exported, erased, corrected, or restricted).",
        status4: "Rejected — The request was rejected (e.g. insufficient identity verification).",
        slasTitle: "GDPR SLA Requirements",
        slasIntro: "Under GDPR Article 12, data controllers must respond to DSRs within 30 days (extendable to 3 months for complex requests). NEXORA tracks the submission date for each DSR to help you meet these deadlines.",
        lifecycleFlowTitle: "DSR Lifecycle Flow",
        nodeSubmit: "Submit Request",
        descSubmit: "Subject requests Export, Erasure, or Rectification",
        nodePending: "Status: Pending",
        descPending: "Request is logged, SLA deadline calculated",
        nodeProcessing: "Status: Processing",
        descProcessing: "DsrExecutionJob begins processing modules via ISuspendableModule",
        nodeApproval: "Wait For Admin",
        descApproval: "Nuclear actions (Erasure) require manual admin confirmation",
        nodeCompleted: "Status: Completed",
        descCompleted: "Export generated or data erased; SLA fulfilled",
        nodeRejected: "Status: Rejected",
        descRejected: "Request denied by admin with resolution notes",
        conn1: "initiates",
        conn2: "background job picks up",
        conn3: "if auto-processed (Export)",
        conn4: "if nuclear (Erasure)",
        conn5: "admin confirms",
        conn6: "admin rejects",
        entitiesTitle: "Entities",
        entityName: "Entity Name",
        entityDesc: "Description",
        entityDsrDesc: "Represents a data subject request.",
        entityModuleDesc: "Execution state of a module.",
        entityStatusDesc: "History of status changes.",
        codeTitle: "Code Example",
        endpointsTitle: "API Endpoints",
        endpointsIntro: "The DSR controller exposes 6 endpoints for the full DSR lifecycle:",
        ep: {
          list: "List all DSRs (paginated, filterable by status/type/regulation)",
          get: "Get DSR details by ID",
          create: "Submit a new DSR",
          updateStatus: "Update DSR status (InProgress, Completed, Rejected)",
          assign: "Assign DSR to a compliance officer",
          delete: "Soft-delete a DSR",
        },
      },
      consent: {
        title: "Consent Management",
        description: "Record, track, and audit user consent grants and withdrawals for GDPR Article 6 and CCPA compliance.",
        intro: "Consent Management records every time a user grants or withdraws consent for a specific purpose (e.g. marketing emails, analytics tracking). NEXORA stores the full consent audit trail including timestamp, IP address, user agent, and the exact consent version shown.",
        purposesTitle: "Consent Purposes",
        purposesIntro: "Each consent record is tied to a specific purpose. Common purposes include:",
        purpose1: "Marketing — Email marketing and promotional communications.",
        purpose2: "Analytics — Usage analytics and product improvement.",
        purpose3: "ThirdParty — Sharing data with third-party services.",
        purpose4: "Personalization — Personalized content and recommendations.",
        gdprTitle: "GDPR Lawful Basis",
        gdprIntro: "Under GDPR Article 6, consent must be: freely given, specific, informed, and unambiguous. NEXORA records the exact consent text version shown to the user and the timestamp it was accepted, providing a legally defensible audit trail.",
        withdrawalTitle: "Consent Withdrawal",
        withdrawalIntro: "Users can withdraw consent at any time. When consent is withdrawn, the ConsentRecord is updated with WithdrawnAt timestamp. Downstream systems should be notified via domain events to stop processing data for the withdrawn purpose.",
        flowTitle: "Consent State Flow",
        nodePurpose: "Consent Purpose",
        descPurpose: "Defines what is being consented to (e.g. Marketing)",
        nodeRecord: "Consent Record",
        descRecord: "User's current state (Granted/Revoked) per purpose",
        nodeSnapshot: "Consent Snapshot",
        descSnapshot: "Immutable point-in-time capture of consent grant/revoke",
        nodeJob: "Consent Expiry Job",
        descJob: "Daily job revokes expired consents",
        conn1: "templates",
        conn2: "generates on change",
        conn3: "auto-revokes if expired",
        immutabilityTitle: "Immutability",
        immutabilityIntro: "Consent records are immutable and track integrity.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "List all consent records (paginated, filterable by purpose/status)",
          get: "Get consent record by ID",
          record: "Record a new consent grant",
          withdraw: "Withdraw a previously granted consent",
        },
      },
      retention: {
        title: "Data Retention Policies",
        description: "Define data retention periods and automated expiry actions (Delete or Anonymize) for GDPR Article 5(1)(e) compliance.",
        intro: "Data Retention Policies define how long specific categories of data must be kept and what happens when the retention period expires. NEXORA enforces these policies automatically via background jobs, removing the manual overhead of managing data lifecycles.",
        policiesTitle: "Policy Configuration",
        policiesIntro: "Each retention policy specifies:",
        field1: "DataCategory — The type of data (e.g. 'User Profiles', 'Transaction Logs', 'Consent Records').",
        field2: "RetentionDays — How many days the data must be retained.",
        field3: "ExpiryAction — What happens when the period expires: Delete or Anonymize.",
        field4: "RegulationCode — Which regulation requires this retention period (GDPR, CCPA, etc.).",
        actionsTitle: "Expiry Actions",
        actionsIntro: "When a retention period expires, NEXORA applies one of two actions:",
        action1: "Delete — Permanently removes all records matching the data category.",
        action2: "Anonymize — Replaces personally identifiable information with pseudonymous tokens, preserving aggregate analytics data.",
        automationTitle: "Automated Enforcement",
        automationIntro: "The RetentionEnforcementJob runs daily at 3:00 AM UTC, scanning all active retention policies and applying the configured expiry action to eligible records. Each enforcement run creates a RetentionExecution audit record.",
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
        description: "A registry of all personal data categories the platform processes — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        intro: "The Data Inventory is a structured registry of all personal data categories that the platform processes. Under GDPR Article 30, controllers must maintain Records of Processing Activities (RoPA) — the Data Inventory is NEXORA's implementation of this requirement.",
        fieldsTitle: "Inventory Fields",
        fieldsIntro: "Each inventory item documents:",
        field1: "DataCategory — Human-readable name of the data category (e.g. 'Email Addresses', 'Payment Information').",
        field2: "LegalBasis — The GDPR lawful basis for processing (Consent, Contract, Legal Obligation, Vital Interests, Public Task, Legitimate Interests).",
        field3: "DataSubjects — Who the data belongs to (e.g. 'End users', 'Employees', 'Customers').",
        field4: "ProcessingPurpose — Why the data is processed (e.g. 'Order fulfillment', 'Marketing', 'Legal compliance').",
        field5: "StorageLocation — Where the data is stored (country/region for cross-border transfer compliance).",
        field6: "RetentionPeriod — How long the data is retained (linked to the retention policy).",
        field7: "ThirdPartySharing — Whether the data is shared with third parties and which ones.",
        ropaTitle: "Article 30 Compliance",
        ropaIntro: "Organizations with 250+ employees or processing high-risk data must maintain a RoPA under GDPR Article 30. NEXORA's Data Inventory serves as a live, queryable RoPA that can be exported for regulatory inspections.",
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
        description: "Generate async audit-ready compliance reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        intro: "Compliance Reports are asynchronously generated documents that provide audit-ready summaries of your compliance posture. Reports are generated in the background and stored for download once ready, supporting regulatory inspections, internal audits, and executive reporting.",
        reportTypesTitle: "Report Types",
        reportTypesIntro: "Five report types are available:",
        type1: "GDPR Overview — High-level summary of GDPR compliance status across all sub-modules.",
        type2: "DSR Activity Summary — Statistics on DSR volume, types, completion rates, and SLA adherence.",
        type3: "Consent Audit — Full log of consent grants and withdrawals by purpose and time period.",
        type4: "Retention Analysis — Current enforcement status of all active retention policies.",
        type5: "Data Inventory Export — Full export of the data inventory (Article 30 RoPA).",
        asyncTitle: "Asynchronous Generation",
        asyncIntro: "Reports are generated asynchronously to avoid blocking HTTP requests for large datasets. When you request a report, the system immediately creates a ComplianceReport record with IsReady=false and queues the generation job. Poll the reports list to check when IsReady becomes true.",
        asyncTip: "Use the Refresh button in the Reports UI to poll for report readiness. Reports typically complete within 30–60 seconds for datasets up to 10,000 records.",
        downloadTitle: "Downloading Reports",
        downloadIntro: "Once a report is ready (IsReady=true), a DownloadUrl is available. The download endpoint serves the report file securely. Report files are retained for 90 days before automatic cleanup.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "List all compliance reports (paginated, filterable by type/status)",
          get: "Get report details and download URL by ID",
          generate: "Queue a new report generation job",
          download: "Download the generated report file",
        },
      },
    },
  },
};

