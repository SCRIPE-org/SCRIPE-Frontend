/**
 * Docs page locale — EN
 */
export const en = {
  commercial: {
    entEditions: {
      apiTitle: "API Endpoints",
      description:
        "Define, manage, and version your SaaS product plans using SCRIPE's powerful Editions engine.",
      intro:
        "Editions are the building blocks of your SaaS pricing strategy. Each edition bundles a specific set of feature values (Boolean toggles, numeric limits, string configurations) into a named plan that can be assigned to tenants via subscriptions.",
      overflowBlock: "Hard Block",
      overflowBlockDesc:
        "Strictly enforce the limit. Commands are rejected with a clear error message indicating the feature is at capacity for the current plan.",
      overflowContent:
        "When a tenant exceeds their edition's limits, the overflow policy determines the behavior. This creates natural upsell paths without breaking the user experience.",
      overflowTitle: "Overflow Policies",
      overflowUpgrade: "Suggest Upgrade",
      overflowUpgradeDesc:
        "When limits are reached, the system returns an upgrade suggestion pointing to the overflow edition — creating a seamless upsell path.",
      scopeTitle: "System vs Retail Editions",
      tblRollH1: "Strategy",
      tblRollH2: "Behavior",
      tblRollH3: "Best For",
      tblRollR1C1: "Immediate",
      tblRollR1C2: "All subscribed tenants updated instantly",
      tblRollR1C3: "Bug fixes, security patches",
      tblRollR2C1: "Canary",
      tblRollR2C2: "Percentage-based gradual rollout",
      tblRollR2C3: "Feature experiments, risk mitigation",
      tblRollR3C1: "Scheduled",
      tblRollR3C2: "Deploy at a specific date/time",
      tblRollR3C3: "Aligned product launches, billing cycles",
      tblScopeH1: "Scope",
      tblScopeH2: "Created By",
      tblScopeH3: "Use Case",
      tblScopeR1C1: "System",
      tblScopeR1C2: "Platform owner (root tenant)",
      tblScopeR1C3: "Global plans available to all tenants (Basic, Pro, Enterprise)",
      tblScopeR2C1: "Retail",
      tblScopeR2C2: "Reseller tenants",
      tblScopeR2C3: "Custom plans for child tenants (white-label reselling)",
      tip: "Editions are never deleted from the database — they are soft-deleted to preserve subscription history and audit trails. Active subscriptions prevent edition deletion entirely.",
      title: "Editions & Plans",
      versionContent:
        "Edition versions allow you to modify plan features without disrupting existing subscribers. Create a new version with updated feature values, then choose your rollout strategy.",
      versionTitle: "Versioning & Rollouts",
      whatContent:
        "An Edition is a named plan (e.g., 'Basic', 'Pro', 'Enterprise') that defines a specific combination of feature values. When a tenant subscribes to an edition, they automatically gain access to exactly the features that edition defines — not more, not less.",
      whatTitle: "What Are Editions?",
    },
    entFeatures: {
      apiTitle: "API Endpoints",
      cacheContent:
        "Resolved feature values are aggressively cached per-tenant to ensure zero-latency authorization checks. The cache is automatically invalidated whenever editions, subscriptions, or overrides change.",
      cacheInv: "Automatic Invalidation",
      cacheInvDesc:
        "Any change to editions, subscriptions, or overrides immediately invalidates the affected tenant's feature cache.",
      cachePerf: "Sub-Millisecond Lookups",
      cachePerfDesc:
        "Resolved features are cached in-memory per tenant. Pipeline checks complete in microseconds, not milliseconds.",
      cacheTitle: "High-Performance Feature Caching",
      description:
        "Define, categorize, and enforce Boolean, Numeric, and String features with automatic quota tracking and high-performance caching.",
      fgCustom: "Custom Features",
      fgCustomDesc:
        "Created by administrators at runtime via the API. Perfect for module-specific features that evolve as your product grows.",
      fgSystem: "System Features",
      fgSystemDesc:
        "Pre-seeded at application startup. Immutable and always present. Define the core capabilities of your platform (e.g., MaxUsers, ApiAccess).",
      intro:
        "Features are the atomic building blocks of your entitlements system. Every capability that can be toggled, limited, or configured per plan is defined as a Feature. The system supports three value types, automatic seeding, and real-time quota enforcement.",
      quotaContent:
        "Numeric features can have associated QuotaCounter entities that track real-time usage. When a command implements IRequireFeature for a numeric feature, the FeatureCheckBehavior pipeline automatically compares the current count against the allowed limit.",
      quotaTitle: "Automatic Quota Enforcement",
      systemTitle: "System vs Custom Features",
      tblTypeH1: "Type",
      tblTypeH2: "Values",
      tblTypeH3: "Example",
      tblTypeH4: "Enforcement",
      tblTypeR1C1: "Boolean",
      tblTypeR1C2: "true / false",
      tblTypeR1C3: "ApiAccess, CustomDomain, SSO",
      tblTypeR1C4: "Feature gate: allow or block",
      tblTypeR2C1: "Numeric",
      tblTypeR2C2: "Integer value",
      tblTypeR2C3: "MaxUsers: 50, StorageGB: 100",
      tblTypeR2C4: "QuotaCounter: auto-reject when exceeded",
      tblTypeR3C1: "String",
      tblTypeR3C2: "Free text",
      tblTypeR3C3: "SupportTier: 'Priority', Theme: 'dark'",
      tblTypeR3C4: "Configuration value, no enforcement",
      tip: "System features are seeded automatically from your code on every application startup. This means your feature catalog stays perfectly synchronized with your actual codebase — no manual database management required.",
      title: "Feature Management",
      typesContent:
        "Each feature has a specific value type that determines how it is evaluated, stored, and enforced across editions and overrides.",
      typesTitle: "Feature Value Types",
    },
    entOverrides: {
      apiTitle: "API Endpoints",
      auditContent:
        "Every override action is fully audited. The system tracks who set the override, when it was set, the previous value, and the reason provided.",
      auditTitle: "Audit Trail",
      description:
        "Customize feature values for individual tenants regardless of their subscribed plan, with full audit trails and optional expiration.",
      intro:
        "Overrides are the escape hatch that makes your entitlements system flexible enough for the real world. Enterprise deals, promotional offers, beta testing, and regulatory exceptions all require the ability to customize features per-tenant without changing the underlying plan.",
      priorityContent:
        "Overrides sit at the top of the resolution priority chain. When the system resolves a feature value for a tenant, an override always wins — regardless of what the edition or default value says.",
      priorityTitle: "Resolution Priority Chain",
      settingContent:
        "Overrides are set via a simple API call. Each override includes the feature, the custom value, an optional expiration date, and a reason for audit purposes.",
      settingTitle: "Setting an Override",
      tblAuditH1: "Event",
      tblAuditH2: "Tracked Data",
      tblAuditH3: "Purpose",
      tblAuditR1C1: "Override Created",
      tblAuditR1C2: "Feature, tenant, value, reason, actor, timestamp",
      tblAuditR1C3: "Compliance and accountability",
      tblAuditR2C1: "Override Updated",
      tblAuditR2C2: "Previous value, new value, reason, actor",
      tblAuditR2C3: "Change history tracking",
      tblAuditR3C1: "Override Expired/Removed",
      tblAuditR3C2: "Feature, tenant, final value, actor",
      tblAuditR3C3: "Reversion verification",
      tip: "Overrides are the most powerful tool in your sales arsenal. They let your sales team close enterprise deals in minutes — not engineering sprints.",
      title: "Per-Tenant Overrides",
      ucBeta: "Beta Feature Access",
      ucBetaDesc:
        "Enable an experimental feature for select tenants before rolling it out to all plans. Override the feature for specific tenants during the beta.",
      ucEnterprise: "Enterprise Custom Deals",
      ucEnterpriseDesc:
        "A Fortune 500 client needs 10,000 users on a Pro plan that normally caps at 500. Set an override — no code changes, no custom builds.",
      ucExpiring: "Time-Limited Exceptions",
      ucExpiringDesc:
        "Regulatory requirements may demand temporary feature access. Set an override with an expiration date — the system automatically reverts when it expires.",
      ucPromo: "Promotional Upgrades",
      ucPromoDesc:
        "Give a tenant Premium features for 30 days as a promotional offer. Set an expiring override that automatically reverts after the promotion period.",
      useCasesTitle: "Real-World Use Cases",
    },
    entOverview: {
      description:
        "A complete, enterprise-grade entitlements engine that transforms your platform into a differentiated SaaS product with editions, subscriptions, and per-tenant feature control.",
      fgEditions: "Editions (Plans)",
      fgEditionsDesc:
        "Named feature bundles like Basic, Pro, Enterprise that define what each plan includes.",
      fgFeatures: "Feature Catalog",
      fgFeaturesDesc:
        "Boolean, Numeric, and String feature types with system-seeded defaults and custom extensibility.",
      fgOverrides: "Per-Tenant Overrides",
      fgOverridesDesc:
        "Customize any feature value for individual tenants — perfect for enterprise deals or beta access.",
      fgQuotas: "Quota Enforcement",
      fgQuotasDesc:
        "Numeric features with QuotaCounter entities are automatically enforced at the pipeline level.",
      fgSubscriptions: "Subscription Lifecycle",
      fgSubscriptionsDesc:
        "Assign, upgrade, downgrade, suspend, and renew tenant subscriptions with full audit trails.",
      fgVersioning: "Version & Rollout",
      fgVersioningDesc:
        "Deploy edition changes via immediate, canary, or scheduled rollout strategies.",
      howContent:
        "Every API command that implements IRequireFeature is intercepted by the FeatureCheckBehavior pipeline. The system resolves the tenant's effective feature values (overrides → edition → defaults) and either allows execution or returns a clear 'feature disabled' response.",
      howTitle: "How It Works",
      intro:
        "Stop hardcoding plan checks into your codebase. SCRIPE's Entitlements module provides a full-stack, API-level feature gating engine that automatically enforces what each tenant can and cannot do — based on their subscribed edition, active overrides, and real-time quota counters.",
      resolutionContent:
        "When the system resolves a feature value for a tenant, it checks sources in strict priority order. The first source that provides a value wins.",
      resolutionTitle: "Resolution Priority",
      tblResH1: "Priority",
      tblResH2: "Source",
      tblResH3: "Use Case",
      tblResR1C1: "1 (Highest)",
      tblResR1C2: "Tenant Override",
      tblResR1C3: "Custom enterprise deals, promotions, beta testing",
      tblResR2C1: "2",
      tblResR2C2: "Active Subscription → Edition",
      tblResR2C3: "Standard plan-based feature access",
      tblResR3C1: "3",
      tblResR3C2: "Add-on Subscriptions",
      tblResR3C3: "Optional feature packs purchased separately",
      tblResR4C1: "4 (Lowest)",
      tblResR4C2: "Feature Default Value",
      tblResR4C3: "Fallback when no other source applies",
      tblValH1: "Challenge",
      tblValH2: "Without SCRIPE",
      tblValH3: "With SCRIPE Entitlements",
      tblValR1C1: "Plan differentiation",
      tblValR1C2: "Hardcoded if/else checks scattered everywhere",
      tblValR1C3: "Automatic pipeline-level gating per edition",
      tblValR2C1: "Enterprise custom deals",
      tblValR2C2: "Code deployments for each special case",
      tblValR2C3: "Per-tenant overrides via API in seconds",
      tblValR3C1: "Usage limits",
      tblValR3C2: "Manual counting and validation",
      tblValR3C3: "Automatic QuotaCounter enforcement",
      tblValR4C1: "Plan changes",
      tblValR4C2: "Risky database migrations",
      tblValR4C3: "Real-time upgrade/downgrade with impact analysis",
      tblValR5C1: "Feature rollouts",
      tblValR5C2: "Big-bang deployments risking all tenants",
      tblValR5C3: "Canary and scheduled rollout strategies",
      tip: "The Entitlements module is fully integrated into the AstraFlow mediator pipeline. Commands implementing IRequireFeature are automatically gated — your business logic stays clean and focused.",
      title: "Entitlements Overview",
      valueTitle: "Business Value",
      whyContent:
        "Most SaaS platforms bolt on feature flags as an afterthought. SCRIPE integrates entitlements directly into the CQRS pipeline via the IRequireFeature interface, meaning every command can be automatically gated without a single line of custom middleware.",
      whyTitle: "Why Built-In Entitlements?",
    },
    entSubscriptions: {
      apiTitle: "API Endpoints",
      concurrencyDesc:
        "Optimistic concurrency stamps on every subscription prevent mid-air collisions between parallel operations. Enterprise-grade data integrity without performance penalties.",
      concurrencyTitle: "Race-Condition Protection",
      crossModuleDesc:
        "Subscription lifecycle events automatically cascade to Identity management. When suspended, all tenant admins are deactivated. On resume, only subscription-suspended admins are reactivated.",
      crossModuleTitle: "Cross-Module Admin Integration",
      description:
        "Full lifecycle management for tenant subscriptions with multi-currency pricing, promotional discounts, upgrade/downgrade impact analysis, trials, expiry handling, and comprehensive analytics export.",
      enterpriseTitle: "Enterprise Subscription Management",
      expiryTitle: "Expiry Behavior",
      exportContent:
        "Generate comprehensive subscription analytics reports in CSV, Excel, and PDF formats. Reports include advanced filtering (date range, expiring-soon, status, edition), multi-currency display, and color-coded expiry indicators.",
      exportTitle: "Advanced Analytics Export",
      fgExportCsv: "CSV Export",
      fgExportCsvDesc:
        "Lightweight comma-separated format, ideal for data analysis and import into BI tools like Power BI, Tableau, or Google Sheets.",
      fgExportExcel: "Excel Export",
      fgExportExcelDesc:
        "Professional XLSX workbook with styled headers, filter metadata, conditional formatting for expiry dates, and auto-sized columns — powered by ClosedXML.",
      fgExportPdf: "PDF Export",
      fgExportPdfDesc:
        "Print-ready document with branded cover page, statistical summary, and paginated data tables with color-coded 'Days Left' column — powered by QuestPDF.",
      fgPromoAdjust: "Automatic Adjustment",
      fgPromoAdjustDesc:
        "When a promo is applied, AdjustmentAmount is computed automatically from BaseAmount × PromotionDiscount, ensuring consistent pricing across all subscriptions.",
      fgPromoCode: "Promo Code Tracking",
      fgPromoCodeDesc:
        "Each subscription records its AppliedPromoCode and PromotionDiscount percentage. Analytics dashboards show which promotions drive the most conversions.",
      intro:
        "Subscriptions are the bridge between tenants and editions. They define which plan a tenant is on, when it starts and expires, and how the system behaves when the subscription lifecycle changes. With built-in multi-currency pricing and promotional discount tracking, SCRIPE provides everything you need for monetization.",
      lifecycleContent:
        "Every subscription follows a well-defined state machine. The system automatically enforces valid transitions and emits domain events at each stage for audit and integration purposes.",
      lifecycleTitle: "Subscription Lifecycle",
      opsAssign: "Assign Subscription",
      opsAssignDesc:
        "Link a tenant to an edition with start date, duration, currency, optional promo code, and auto-renewal configuration.",
      opsDowngrade: "Downgrade Plan",
      opsDowngradeDesc:
        "Move to a lower edition. The system provides a full impact analysis showing which features will be lost before confirming.",
      opsImpact: "Impact Analysis",
      opsImpactDesc:
        "Before any downgrade, the API returns a detailed analysis of affected features and current usage — preventing surprise data loss.",
      opsTitle: "Key Operations",
      opsUpgrade: "Upgrade Plan",
      opsUpgradeDesc:
        "Move a tenant to a higher edition. New features are available immediately and the subscription period can be adjusted.",
      pricingContent:
        "Every subscription stores its pricing in the tenant's native currency while automatically normalizing to USD for unified revenue analytics. Support for 9+ currencies out of the box — USD, EUR, GBP, SAR, AED, EGP, TRY, INR, and more.",
      pricingTitle: "Multi-Currency Pricing Engine",
      promoContent:
        "Drive acquisition and retention with promo code support built into every subscription. Applied promotions are tracked with the code name and discount percentage for full audit and analytics visibility.",
      promoExpiryDesc:
        "Time-bound promotions are automatically tracked via PromotionExpiresAt. Expired promotions are stripped on renewal — new pricing takes effect seamlessly without admin intervention.",
      promoExpiryTitle: "Intelligent Promotion Expiry",
      promoTitle: "Promotional Discounts",
      renewalDesc:
        "Renewals create NEW subscription rows instead of overwriting existing records. Each billing cycle preserves locked-in pricing for precise MRR trends, churn analysis, and financial audit compliance.",
      renewalTitle: "Immutable Renewal Audit Trail",
      tblExpH1: "Policy",
      tblExpH2: "Behavior",
      tblExpH3: "Use Case",
      tblExpR1C1: "Grace Period",
      tblExpR1C2: "Features remain active for N days after expiry",
      tblExpR1C3: "Give customers time to renew",
      tblExpR2C1: "Immediate Block",
      tblExpR2C2: "Features disabled the moment subscription expires",
      tblExpR2C3: "Strict quota enforcement",
      tblExpR3C1: "Fallback Edition",
      tblExpR3C2: "Automatically downgrade to the default (free) edition",
      tblExpR3C3: "Freemium models with paid upgrades",
      tblPriceH1: "Field",
      tblPriceH2: "Purpose",
      tblPriceH3: "Example",
      tblPriceR1C1: "Currency",
      tblPriceR1C2: "ISO 4217 currency code for this subscription",
      tblPriceR1C3: "SAR, USD, EUR",
      tblPriceR2C1: "BaseAmount",
      tblPriceR2C2: "Original price before any adjustments",
      tblPriceR2C3: "499.00",
      tblPriceR3C1: "AdjustmentAmount",
      tblPriceR3C2: "Discount or surcharge applied",
      tblPriceR3C3: "-49.90 (10% promo)",
      tblPriceR4C1: "TotalAmount",
      tblPriceR4C2: "Final amount charged in local currency",
      tblPriceR4C3: "449.10",
      tblPriceR5C1: "ExchangeRateToUsd",
      tblPriceR5C2: "Rate used to normalize to USD",
      tblPriceR5C3: "0.2667",
      tblPriceR6C1: "TotalAmountUsd",
      tblPriceR6C2: "Normalized USD value for analytics",
      tblPriceR6C3: "119.76",
      tblTypeH1: "Type",
      tblTypeH2: "Duration",
      tblTypeH3: "Use Case",
      tblTypeR1C1: "Standard",
      tblTypeR1C2: "Fixed period with expiry date",
      tblTypeR1C3: "Regular commercial subscriptions",
      tblTypeR2C1: "Trial",
      tblTypeR2C2: "Short-term evaluation period",
      tblTypeR2C3: "Free trials that auto-convert or expire",
      tblTypeR3C1: "Add-on",
      tblTypeR3C2: "Supplementary to main subscription",
      tblTypeR3C3: "Additional feature packs (e.g., extra storage)",
      tip: "The downgrade impact analysis API is a powerful sales retention tool. Show customers exactly what they'll lose before they downgrade — creating natural retention moments.",
      title: "Subscription Management",
      typesTitle: "Subscription Types",
      validationDesc:
        "All 8 subscription commands are guarded by FluentValidation validators with fully localized error messages in English and Arabic. Invalid requests are rejected before business logic executes.",
      validationTitle: "Pipeline-Level Validation",
    },
  },
};
