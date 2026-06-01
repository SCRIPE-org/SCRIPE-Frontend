/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  commercial: {
    moduleCatalog: {
      businessContent:
        "SCRIPE isn't an empty shell; it's a functioning enterprise ecosystem from day one. Use our existing business modules—such as User Management, Audit Logging, and Notifications—as immediate starting points, or clone them to rapidly build proprietary features.",
      businessTitle: "Accelerated Business Logic",
      commTitle: "Communication & Webhooks",
      coreContent:
        "The Foundation layer provides the absolute non-negotiables: the Identity Provider, multi-tenant resolution strategies, EF Core context abstractions, and the centralized SCRIPE mediator dispatcher. It is the rock-solid bedrock upon which your entire application scales.",
      coreTitle: "The Core Foundation",
      crmModule: "Headless CRM Module",
      crmModuleDesc:
        "Manage organizational hierarchies, client relationships, and custom attributes with a fully API-driven CRM architecture.",
      customModule: "Proprietary Integration Module",
      customModuleDesc:
        "A pristine sandbox utilizing the exact same Clean Architecture boundaries to house your unique industry logic.",
      dataTitle: "Data & Auditing",
      description:
        "A comprehensive directory of the pre-built, production-ready enterprise bounded contexts included within the SCRIPE platform.",
      financeModule: "Invoicing & Billing Engine",
      financeModuleDesc:
        "Generate PDF invoices, manage tax localities, and integrate with Stripe or custom payment gateways.",
      hrModule: "Identity & Access Management",
      hrModuleDesc:
        "Control granular role-based permissions, JWT lifetimes, and directory synchronizations.",
      independenceContent:
        "Every module in the catalog is strictly isolated. The Notification module shares zero state with the User Management module. They communicate purely through asynchronous events, guaranteeing that a catastrophic failure in one domain never cascades to another.",
      independenceTitle: "Cryptographic Module Isolation",
      intro:
        "SCRIPE ships with a massive library of enterprise-grade, pre-tested bounded contexts. From day one, you possess the operational maturity of a 5-year-old SaaS application.",
      inventoryModule: "Asset Tracking Module",
      inventoryModuleDesc:
        "Map complex hierarchical inventories and track state changes through strictly applied domain events.",
      projectModule: "Workflow & Project Module",
      projectModuleDesc:
        "Manage complex state machines and multi-step organizational approval workflows.",
      title: "Enterprise Module Catalog",
      tblCoreHeader1: "Module",
      tblCoreHeader2: "Description",
      tblCoreHeader3: "Key Capabilities",
      tblCoreR1C1: "Identity & Auth",
      tblCoreR1C2: "Complete authentication and user management",
      tblCoreR1C3: "JWT, 2FA, session management, device tracking, social login",
      tblCoreR2C1: "Multi-Tenancy",
      tblCoreR2C2: "Tenant isolation and hierarchical organization",
      tblCoreR2C3: "Row-level isolation, parent/child tenants, per-tenant settings, white-labeling",
      tblCoreR3C1: "Role & Permissions",
      tblCoreR3C2: "Fine-grained access control",
      tblCoreR3C3: "RBAC, field-level restrictions, permission categories, role cloning",
      tblCoreR4C1: "Audit System",
      tblCoreR4C2: "Comprehensive activity tracking",
      tblCoreR4C3: "4-source pipeline: API, entity changes, security events, business operations",
      tblCoreR5C1: "Menu System",
      tblCoreR5C2: "Dynamic navigation management",
      tblCoreR5C3: "Self-referencing tree, per-tenant overrides, role-based visibility",
      tblCoreR6C1: "User Groups",
      tblCoreR6C2: "Batch role & restriction assignment",
      tblCoreR6C3:
        "Group-based RBAC, field-level restrictions, member management, tenant-scoped groups",
      tblCoreR7C1: "Entitlements",
      tblCoreR7C2: "Edition-based feature gating & plan management",
      tblCoreR7C3:
        "Features, editions, subscriptions, overrides, quota enforcement, versioned rollouts, reseller scoping",
      tblCommHeader1: "Module",
      tblCommHeader2: "Description",
      tblCommHeader3: "Key Capabilities",
      tblCommR1C1: "Notifications",
      tblCommR1C2: "Real-time push notifications",
      tblCommR1C3: "SignalR WebSockets, auto-join by tenant, mark read/unread, bell UI",
      tblCommR2C1: "Email System",
      tblCommR2C2: "Transactional email pipeline",
      tblCommR2C3: "Queue-based sending, Scriban templates, retry with backoff, SMTP/SendGrid",
      tblCommR3C1: "Webhooks",
      tblCommR3C2: "Event-driven integrations",
      tblCommR3C3: "HMAC-SHA256 signed, exponential retry, subscription management, event catalog",
      tblCommR4C1: "Message Templates",
      tblCommR4C2: "Bilingual message rendering",
      tblCommR4C3: "Scriban syntax, variable preview, 6 built-in templates, bilingual entity",
      tblDataHeader1: "Module",
      tblDataHeader2: "Description",
      tblDataHeader3: "Key Capabilities",
      tblDataR1C1: "File Upload",
      tblDataR1C2: "Secure file handling",
      tblDataR1C3: "Image processing pipeline, virus scan ready, tenant-scoped storage, 4 backends",
      tblDataR2C1: "Download & Export",
      tblDataR2C2: "Data export and file delivery",
      tblDataR2C3:
        "Resumable downloads (Range), ETag caching, session-based, path traversal prevention",
      tblDataR3C1: "Recycle Bin",
      tblDataR3C2: "Soft-delete management",
      tblDataR3C3:
        "Restore with dependencies, scheduled purge, cascade restore, per-entity policies",
      tblDataR4C1: "User Management",
      tblDataR4C2: "Administrative user operations",
      tblDataR4C3: "27 endpoints, bulk ops, enterprise operations, protected admin rules",
      tblAnalyticsHeader1: "Module",
      tblAnalyticsHeader2: "Description",
      tblAnalyticsHeader3: "Key Capabilities",
      tblAnalyticsR1C1: "Revenue Analytics",
      tblAnalyticsR1C2: "BI-grade revenue intelligence dashboard",
      tblAnalyticsR1C3:
        "MRR/ARR tracking, cohort analysis, LTV modeling, revenue forecasting, health scoring, PDF reports",
      analyticsTitle: "Revenue Intelligence",
      analyticsContent:
        "The Revenue Analytics Engine transforms raw subscription data into actionable business intelligence. With 7 specialized dashboard tabs, automated nightly snapshots, and predictive forecasting, platform operators gain CFO-level visibility without external BI tools. Tenant health scoring proactively identifies churn risks before they materialize.",
    },
    complianceOverview: {
      title: "Compliance Module",
      description:
        "Built-in GDPR, CCPA, and PDPA compliance automation — protect your customers' data rights without hiring a team of legal engineers.",
      intro:
        "SCRIPE's Compliance Module gives every tenant on your platform enterprise-grade data protection compliance out of the box. From automated DSR handling to real-time consent tracking and audit-ready reports, your customers stay compliant without building anything.",
      valueTitle: "Why Compliance Matters",
      valueIntro:
        "Data protection regulations carry significant penalties: GDPR fines can reach €20M or 4% of global annual turnover (whichever is higher). SCRIPE's Compliance module helps your customers avoid these risks while building trust with their end users.",
      capabilitiesTitle: "Module Capabilities",
      cap1: "DSR Management — Automated workflow for data export, erasure, rectification, and restriction requests with SLA tracking.",
      cap2: "Consent Audit Trail — Immutable record of every consent grant and withdrawal with timestamp, IP, and consent version.",
      cap3: "Data Retention — Automated enforcement of retention policies with configurable delete or anonymize actions.",
      cap4: "Data Inventory — Article 30 Records of Processing Activities (RoPA) registry with export capability.",
      cap5: "Compliance Reports — Async generation of GDPR Overview, DSR Summary, Consent Audit, and more.",
      targetTitle: "Who Benefits",
      target1:
        "SaaS platforms serving EU/UK customers who need GDPR compliance tools for their tenants.",
      target2:
        "Businesses operating in California that need CCPA consumer rights request handling.",
      target3:
        "Healthcare and financial services with strict data retention and audit requirements.",
    },
    complianceGdpr: {
      title: "GDPR Compliance",
      description:
        "How SCRIPE helps your platform and tenants meet GDPR obligations across all six compliance domains.",
      intro:
        "The General Data Protection Regulation (GDPR) applies to any organization that processes personal data of EU/EEA residents. SCRIPE's Compliance module addresses all key GDPR obligations through built-in tooling, reducing compliance overhead for you and your tenants.",
      articlesTitle: "Key GDPR Articles Addressed",
      art12:
        "Article 12-14 — Transparency. Consent records document exactly what was shown to users and when.",
      art15:
        "Article 15-22 — Data Subject Rights. DSR workflow handles all 8 rights: access, erasure, rectification, restriction, portability, objection, profiling, and automated decisions.",
      art25:
        "Article 25 — Privacy by Design. The system is architected with data minimization, retention limits, and purpose limitation built in.",
      art30:
        "Article 30 — Records of Processing Activities. The Data Inventory serves as a live RoPA registry.",
      art32:
        "Article 32 — Security of Processing. All data is encrypted at rest and in transit; access is audited.",
    },
    complianceDsr: {
      title: "Data Subject Requests",
      description:
        "How SCRIPE handles DSR requests end-to-end, keeping your customers compliant with GDPR Article 15-22 and CCPA rights.",
      intro:
        "Data Subject Requests (DSRs) are formal rights requests from individuals. Under GDPR, controllers must respond within 30 days. SCRIPE automates the entire DSR workflow — from submission to assignment to fulfillment — with SLA tracking built in.",
      workflowTitle: "DSR Workflow",
      step1: "User submits a DSR (export, erasure, rectification, or restriction).",
      step2:
        "System creates a DSR record with status 'Pending' and records the submission timestamp.",
      step3: "Compliance officer is assigned and status moves to 'InProgress'.",
      step4: "Request is fulfilled and status is set to 'Completed' or 'Rejected' with a reason.",
      slaTitle: "SLA Compliance",
      slaIntro:
        "SCRIPE tracks the submission date for every DSR. Your compliance team can filter by age to identify requests approaching the 30-day GDPR deadline.",
    },
    complianceRoi: {
      title: "Compliance ROI",
      description:
        "The business case for built-in compliance — cost savings, risk reduction, and competitive advantage.",
      intro:
        "Regulatory compliance is no longer optional — and building it from scratch is expensive. SCRIPE's built-in Compliance module turns a regulatory requirement into a competitive advantage.",
      savingsTitle: "Cost Savings",
      savings1: "Avoid €20M+ in GDPR fines through automated compliance enforcement.",
      savings2:
        "Save 200+ engineering hours per year versus building DSR, consent, and retention systems from scratch.",
      savings3: "Reduce legal overhead with audit-ready reports generated in seconds.",
      competitiveTitle: "Competitive Advantage",
      competitive1: "Win enterprise deals by demonstrating built-in compliance capabilities.",
      competitive2:
        "Serve EU, UK, and California markets without additional compliance engineering.",
      competitive3:
        "Build customer trust with transparent consent management and data rights handling.",
    },
    // ── Plugins (Phase 15) ──────────────────────────────────
    pluginsOverview: {
      title: "Plugin System",
      description: "Enterprise-grade extensibility — install certified internal plugins or sandboxed marketplace plugins with full lifecycle management.",
      intro: "SCRIPE's Plugin System gives your platform infinite extensibility without compromising security. Platform teams can publish certified Tier 1 plugins that run in-process with full infrastructure access. Third-party vendors can publish Tier 2 plugins that run in a secure sandbox — isolated from your core data, rate-limited, and audited.",
      valueTitle: "Business Value",
      featureExtTitle: "Infinite Extensibility",
      featureExtDesc: "Extend SCRIPE with any capability — CRM integrations, AI assistants, analytics dashboards — without forking the core codebase.",
      featureSandboxTitle: "Secure Sandbox",
      featureSandboxDesc: "Tier 2 plugins are isolated in a REST gateway. They cannot access your database, internal services, or other tenants.",
      featureMarketTitle: "Marketplace Ready",
      featureMarketDesc: "Built-in plugin catalog, install/uninstall lifecycle, and consent flow ready for a commercial marketplace.",
      featureFastTitle: "Fast Integration",
      featureFastDesc: "Plugins can inject navigation items, settings UIs, and backend services with zero changes to the host application.",
      featureLogsTitle: "Full Auditability",
      featureLogsDesc: "Every API call made by a Tier 2 plugin is logged with endpoint, duration, status code, and timestamp.",
      featureI18nTitle: "RTL & i18n Ready",
      featureI18nDesc: "The plugin SDK automatically pushes the host's language direction (LTR/RTL) and accent color to all plugin iframes.",
      tiersTitle: "Tier 1 vs Tier 2",
      tiersIntro: "Choose the right tier for each use case. Tier 1 for your own certified plugins; Tier 2 for third-party marketplace integrations.",
      tier1Title: "Tier 1 — Certified",
      tier1Point1: "In-process — zero network overhead",
      tier1Point2: "Full access to DI, database, and events",
      tier1Point3: "Module Federation frontend (shared React bundle)",
      tier1Point4: "IPluginStartup contract for clean registration",
      tier2Title: "Tier 2 — Marketplace",
      tier2Point1: "Sandboxed — cannot access host internals",
      tier2Point2: "Rate limited (60 req/min per installation)",
      tier2Point3: "iframe frontend with postMessage SDK",
      tier2Point4: "Isolated key-value data store per installation",
      audienceTitle: "Who Benefits",
      audienceIntro: "The Plugin System creates value for every stakeholder in the SCRIPE ecosystem.",
      audRole: "Role",
      audBenefit: "Benefit",
      audPlatform: "Platform Operator",
      audPlatformBenefit: "Extend the platform without modifying the core. Publish certified Tier 1 plugins for your team.",
      audTenant: "Tenant Admin",
      audTenantBenefit: "Install and configure marketplace plugins in minutes. Control which plugins are active for your team.",
      audPartner: "Third-Party Vendor",
      audPartnerBenefit: "Publish your product as a Tier 2 plugin. Get distribution, lifecycle management, and webhook events for free.",
      audDeveloper: "Platform Developer",
      audDeveloperBenefit: "Build plugins with clear contracts — IPluginStartup for Tier 1, postMessage SDK for Tier 2. No undocumented hooks.",
      securityTitle: "Security Architecture",
      securityIntro: "The Plugin System enforces strict security boundaries at every layer — origin validation, API key hashing, tenant isolation, and rate limiting.",
      securityNoteTitle: "Security by default",
      securityNoteContent: "Tier 2 plugins never touch your database. All API keys are stored as SHA-256 hashes. The iframe sandbox attribute prevents script injection. Origin validation on every postMessage prevents spoofing.",
    },
  },
};
