/**
 * Docs page locale — EN
 */
export const en = {
  modules: {
    compliance: {
      consent: {
        conn1: "templates",
        conn2: "generates on change",
        conn3: "auto-revokes if expired",
        descJob: "Daily job revokes expired consents",
        descPurpose: "Defines what is being consented to (e.g. Marketing)",
        descRecord: "User's current state (Granted/Revoked) per purpose",
        description:
          "Record, track, and audit user consent grants and withdrawals for GDPR Article 6 and CCPA compliance.",
        descSnapshot: "Immutable point-in-time capture of consent grant/revoke",
        endpointsTitle: "API Endpoints",
        ep: {
          get: "Get consent record by ID",
          list: "List all consent records (paginated, filterable by purpose/status)",
          record: "Record a new consent grant",
          withdraw: "Withdraw a previously granted consent",
        },
        flowTitle: "Consent State Flow",
        gdprIntro:
          "Under GDPR Article 6, consent must be: freely given, specific, informed, and unambiguous. SCRIPE records the exact consent text version shown to the user and the timestamp it was accepted, providing a legally defensible audit trail.",
        gdprTitle: "GDPR Lawful Basis",
        immutabilityIntro: "Consent records are immutable and track integrity.",
        immutabilityTitle: "Immutability",
        intro:
          "Consent Management records every time a user grants or withdraws consent for a specific purpose (e.g. marketing emails, analytics tracking). SCRIPE stores the full consent audit trail including timestamp, IP address, user agent, and the exact consent version shown.",
        nodeJob: "Consent Expiry Job",
        nodePurpose: "Consent Purpose",
        nodeRecord: "Consent Record",
        nodeSnapshot: "Consent Snapshot",
        purpose1: "Marketing — Email marketing and promotional communications.",
        purpose2: "Analytics — Usage analytics and product improvement.",
        purpose3: "ThirdParty — Sharing data with third-party services.",
        purpose4: "Personalization — Personalized content and recommendations.",
        purposesIntro:
          "Each consent record is tied to a specific purpose. Common purposes include:",
        purposesTitle: "Consent Purposes",
        title: "Consent Management",
        withdrawalIntro:
          "Users can withdraw consent at any time. When consent is withdrawn, the ConsentRecord is updated with WithdrawnAt timestamp. Downstream systems should be notified via domain events to stop processing data for the withdrawn purpose.",
        withdrawalTitle: "Consent Withdrawal",
      },
      dsr: {
        codeTitle: "Code Example",
        conn1: "initiates",
        conn2: "background job picks up",
        conn3: "if auto-processed (Export)",
        conn4: "if nuclear (Erasure)",
        conn5: "admin confirms",
        conn6: "admin rejects",
        descApproval: "Nuclear actions (Erasure) require manual admin confirmation",
        descCompleted: "Export generated or data erased; SLA fulfilled",
        descPending: "Request is logged, SLA deadline calculated",
        descProcessing: "DsrExecutionJob begins processing modules via ISuspendableModule",
        descRejected: "Request denied by admin with resolution notes",
        description:
          "Manage GDPR/CCPA rights requests — export, erasure, rectification, and restriction — with full lifecycle tracking.",
        descSubmit: "Subject requests Export, Erasure, or Rectification",
        endpointsIntro: "The DSR controller exposes 6 endpoints for the full DSR lifecycle:",
        endpointsTitle: "API Endpoints",
        entitiesTitle: "Entities",
        entityDesc: "Description",
        entityDsrDesc: "Represents a data subject request.",
        entityModuleDesc: "Execution state of a module.",
        entityName: "Entity Name",
        entityStatusDesc: "History of status changes.",
        ep: {
          assign: "Assign DSR to a compliance officer",
          create: "Submit a new DSR",
          delete: "Soft-delete a DSR",
          get: "Get DSR details by ID",
          list: "List all DSRs (paginated, filterable by status/type/regulation)",
          updateStatus: "Update DSR status (InProgress, Completed, Rejected)",
        },
        intro:
          "Data Subject Requests (DSRs) are formal requests from individuals exercising their rights under data protection laws. The Compliance module provides a complete DSR workflow: submission, assignment, processing, and closure — with full audit trail and SLA tracking.",
        lifecycleFlowTitle: "DSR Lifecycle Flow",
        lifecycleIntro: "DSRs move through a defined set of statuses from submission to closure:",
        lifecycleTitle: "Request Lifecycle",
        nodeApproval: "Wait For Admin",
        nodeCompleted: "Status: Completed",
        nodePending: "Status: Pending",
        nodeProcessing: "Status: Processing",
        nodeRejected: "Status: Rejected",
        nodeSubmit: "Submit Request",
        slasIntro:
          "Under GDPR Article 12, data controllers must respond to DSRs within 30 days (extendable to 3 months for complex requests). SCRIPE tracks the submission date for each DSR to help you meet these deadlines.",
        slasTitle: "GDPR SLA Requirements",
        status1: "Pending — Initial state when the request is received.",
        status2:
          "InProgress — A compliance officer has been assigned and is processing the request.",
        status3:
          "Completed — The request has been fulfilled (data exported, erased, corrected, or restricted).",
        status4: "Rejected — The request was rejected (e.g. insufficient identity verification).",
        title: "Data Subject Requests (DSR)",
        type1:
          "Export — Data portability request. The subject wants a copy of their personal data.",
        type2: "Erasure — Right to be forgotten. All personal data must be deleted or anonymized.",
        type3: "Rectification — Correction request. Inaccurate personal data must be updated.",
        type4:
          "Restriction — Processing restriction. Data can be retained but not actively processed.",
        typesIntro: "The system supports four DSR types as defined by GDPR Article 17 and CCPA:",
        typesTitle: "Request Types",
      },
      inventory: {
        description:
          "A registry of all personal data categories the platform processes — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        endpointsTitle: "API Endpoints",
        ep: {
          create: "Add a new data category to the inventory",
          delete: "Remove an item from the inventory",
          get: "Get item by ID",
          list: "List all data inventory items (paginated, searchable)",
          update: "Update an existing inventory item",
        },
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
        fieldsIntro: "Each inventory item documents:",
        fieldsTitle: "Inventory Fields",
        intro:
          "The Data Inventory is a structured registry of all personal data categories that the platform processes. Under GDPR Article 30, controllers must maintain Records of Processing Activities (RoPA) — the Data Inventory is SCRIPE's implementation of this requirement.",
        ropaIntro:
          "Organizations with 250+ employees or processing high-risk data must maintain a RoPA under GDPR Article 30. SCRIPE's Data Inventory serves as a live, queryable RoPA that can be exported for regulatory inspections.",
        ropaTitle: "Article 30 Compliance",
        title: "Data Inventory",
      },
      overview: {
        apiConsentAnalytics: "Retrieve consent analytics (grant/withdrawal rates by purpose)",
        apiConsentRecord: "Record a new consent grant with full audit metadata",
        apiDashboard: "Retrieve the compliance dashboard summary (counts, SLA status, alerts)",
        apiDsrList: "List all DSRs with pagination, filtering by status/type/regulation",
        apiDsrReview: "Review a DSR — approve, reject, or mark as completed with resolution notes",
        apiDsrSubmit:
          "Submit a new Data Subject Request (Export, Erasure, Rectification, Restriction)",
        apiInventoryList: "List all data inventory items (GDPR Article 30 RoPA)",
        apiRegList: "List all regulation profiles configured for the platform",
        apiReportDownload: "Download a generated report in CSV, JSON, XLSX, or PDF format",
        apiReportGenerate: "Queue a new async compliance report generation job",
        apiReportsList: "List all compliance reports with status and type filters",
        apiRetentionList: "List all retention policies with enforcement status",
        apiRetentionUpdate: "Update a retention policy (days, action, active status)",
        backendIntro:
          "The Compliance backend follows the standard SCRIPE 3-project module layout (Domain / Application / Infrastructure) with a dedicated ComplianceDbContext and ComplianceController.",
        // Backend Architecture
        backendTitle: "Backend Architecture",
        conn1: "initiates requests",
        conn2: "grants/revokes",
        conn3: "gates policies",
        conn4: "guides erasure",
        conn5: "targets data",
        conn6: "audit trails",
        conn7: "audit trails",
        cqrsConsent: "Records a consent grant with full audit metadata (IP, user agent, version)",
        cqrsConsentAnalytics: "Aggregates consent statistics by purpose, status, and time period",
        cqrsDashboard: "Returns a summary dashboard with counts across all compliance sub-systems",
        cqrsDesc: "Description",
        cqrsDsrList: "Lists all DSRs with pagination, filtering by status/type/regulation",
        cqrsExample: "Handler",
        cqrsIntro:
          "The Compliance module uses the standard AstraFlow mediator CQRS pattern. Commands handle write operations and Queries handle read operations, each with dedicated FluentValidation validators.",
        cqrsRetention: "Updates retention policy configuration (days, action, active status)",
        cqrsReview: "Reviews and updates the status of a DSR (approve, reject, complete)",
        cqrsSubmit: "Submits a new Data Subject Request with validation and SLA calculation",
        // CQRS
        cqrsTitle: "CQRS Commands & Queries",
        cqrsType: "Type",
        descConsent: "Immutable tracking of consent states & snapshots",
        // Sub-Modules
        descDsr: "Handles Subject Requests (Export, Erasure, Rectification)",
        descEnt: "Entitlements Module",
        descEntDesc: "Feature-gates compliance capabilities",
        descId: "Identity Module",
        descIdDesc: "Provides User/Admin context & Auth",
        descInv: "Maps sensitive PII locations across modules",
        descRep: "Generates RoPA and DPIA compliance reports",
        descRet: "Enforces data destruction policies based on age",
        description:
          "GDPR, CCPA, and PDPA compliance automation — regulations, DSR handling, consent management, data retention, inventory, and report generation.",
        endpointsIntro:
          "All endpoints are under /api/v1/compliances/ and require authentication with the compliance.view permission.",
        // API Endpoints
        endpointsTitle: "API Endpoints Overview",
        featureConsent: "Consent Management",
        featureConsentDesc:
          "Immutable tracking of consent states, snapshots, and audit trails for GDPR Article 6 and CCPA compliance.",
        // Feature Grid
        featureDsr: "Data Subject Requests",
        featureDsrDesc:
          "Handles Subject Requests including Export, Erasure, Rectification, and Restriction with full lifecycle tracking and SLA monitoring.",
        featureInventory: "Data Inventory",
        featureInventoryDesc:
          "Maps sensitive PII locations across modules — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        featureReports: "Compliance Reports",
        featureReportsDesc:
          "Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        featureRetention: "Retention Policies",
        featureRetentionDesc:
          "Enforces data destruction policies based on configurable retention periods with automated Delete or Anonymize actions.",
        featureWebhooks: "Webhook Events",
        featureWebhooksDesc:
          "11 real-time webhook events covering DSR lifecycle, consent changes, retention enforcement, and report generation.",
        frontendIntro:
          "The frontend is organized as six independent sub-modules under src/modules/compliance/, each with its own domain, data, and presentation layers following the View/ViewModel pattern.",
        // Frontend Architecture
        frontendTitle: "Frontend Architecture",
        infoContent:
          "The Compliance module is critical for maintaining regulatory adherence and avoiding fines. Ensure all features are correctly mapped to data processing policies.",
        infoTitle: "Compliance Notice",
        intro:
          "The Compliance module is SCRIPE's built-in regulatory compliance engine. It helps platform operators and their tenants stay compliant with major data protection laws (GDPR, CCPA, PDPA) through automated tools for managing data subject requests, consent records, retention policies, and generating audit-ready compliance reports.",
        // Quick Start Guide
        quickStartTitle: "Quick Start Guide",
        regCcpaRegion: "California, USA",
        regGdprRegion: "European Union (EU/EEA)",
        regLgpdRegion: "Brazil",
        regName: "Regulation",
        regPdpaRegion: "Singapore",
        regPenalty: "Maximum Penalty",
        regPopiaRegion: "South Africa",
        regRegion: "Region / Jurisdiction",
        regSla: "Response SLA",
        regulationsIntro:
          "SCRIPE's Compliance module supports enforcement of these major data protection regulations. Each regulation is pre-seeded with its SLA deadlines and penalty structures.",
        // Regulations
        regulationsTitle: "Supported Regulations",
        secDo1: "Enable field-level security for PII fields in DSR responses",
        secDo2: "Configure webhook secrets for all compliance event subscriptions",
        secDo3: "Set retention policies for compliance data itself (meta-compliance)",
        secDo4: "Review audit logs regularly for unauthorized access attempts",
        secDont1: "Never expose DSR endpoints without AdminOnly authentication",
        secDont2: "Never skip consent version tracking — it invalidates the audit trail",
        secDont3: "Never hard-delete compliance records — always use soft-delete",
        secDont4: "Never bypass the webhook dispatcher for compliance events",
        secDontTitle: "Anti-Patterns to Avoid",
        secDoTitle: "Recommended Practices",
        securityIntro:
          "Compliance data is among the most sensitive in the platform. All endpoints are protected by JWT authentication, role-based authorization, and encrypted ID transit. Personal data in DSRs and consent records is subject to field-level security restrictions.",
        // Security
        securityTitle: "Security Considerations",
        securityWarningContent:
          "Compliance data contains personally identifiable information (PII). Ensure proper access controls, audit logging, and data encryption are configured. Never expose raw compliance endpoints without authentication.",
        securityWarningTitle: "Data Protection Warning",
        step1Content:
          "Run the development seeder to populate regulation profiles, sample consent purposes, and retention policies for your test environment.",
        step1Title: "Seed Compliance Data",
        step2Content:
          "Navigate to Compliance → Regulations in the admin panel. Enable the regulations your platform operates under (GDPR, CCPA, PDPA). Each regulation defines the SLA deadlines and penalty structures that will be enforced.",
        step2Title: "Configure Regulation Profiles",
        step3Content:
          "Create a Data Subject Request to test the full lifecycle. The system will validate the request, calculate the SLA deadline, and make it available for assignment to a compliance officer.",
        step3Title: "Submit a Test DSR",
        step4Content:
          "Set up consent purposes (Marketing, Analytics, Third-Party) and configure retention policies for each data category. The retention enforcement job will automatically apply the configured actions when data ages past the retention period.",
        step4Title: "Record Consent & Configure Retention",
        step5Content:
          "Queue an async compliance report. The report will be generated in the background and appear in the Reports list once ready. Download it in CSV, JSON, XLSX, or PDF format.",
        step5Title: "Generate a Compliance Report",
        sub1: "Regulation Profiles — Stores the regulatory frameworks (GDPR, CCPA, PDPA) that the platform operates under.",
        sub2: "Data Subject Requests (DSR) — Manages rights requests from data subjects (export, erasure, rectification, restriction).",
        sub3: "Consent Management — Records, tracks, and audits user consent grants and withdrawals.",
        sub4: "Data Retention Policies — Defines how long data is kept and what happens when it expires (delete or anonymize).",
        sub5: "Data Inventory — A registry of all personal data categories the platform processes.",
        sub6: "Compliance Reports — Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, etc.).",
        subModulesIntro: "Each sub-system handles a specific compliance domain:",
        subModulesTitle: "Six Sub-Systems",
        // Frontend Table
        th1: "Component",
        th2: "Responsibility",
        title: "Compliance Module",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Handles the pagination, filtering, and assignment of incoming Data Subject Requests.",
        tr2_1: "ConsentRecordView",
        tr2_2:
          "Renders the immutable consent snapshot alongside user agent and timestamp metadata.",
        webhookCategory: "Category",
        webhookDesc: "Description",
        webhookEvent: "Event Key",
        webhooksIntro:
          "The Compliance module fires 11 real-time webhook events that external systems can subscribe to. Events are auto-registered via the ComplianceWebhookEventCatalog and dispatched through the IWebhookDispatcher pipeline.",
        // Webhook Events
        webhooksTitle: "Webhook Events",
        whatIsIntro:
          "The Compliance module provides six interconnected sub-systems that cover the full compliance lifecycle. Instead of building compliance tooling from scratch, SCRIPE tenants get a production-ready system that tracks, automates, and reports on their data protection obligations.",
        // What Is
        whatIsTitle: "What is the Compliance Module?",
        whConsentGranted: "Fired when a user grants consent for a specific purpose",
        whConsentWithdrawn: "Fired when a user withdraws previously granted consent",
        whDsrCancelled: "Fired when a DSR is cancelled before completion",
        whDsrCompleted: "Fired when a DSR is fully completed (data exported, erased, or rectified)",
        whDsrErasure: "Fired when an erasure DSR is confirmed by an admin (nuclear action)",
        whDsrStatusChanged:
          "Fired when a DSR status transitions (Pending → InProgress → Completed/Rejected)",
        whDsrSubmitted: "Fired when a new Data Subject Request is submitted",
        whReportFailed: "Fired when a compliance report generation fails",
        whReportGenerated: "Fired when a compliance report generation completes successfully",
        whRetentionExec: "Fired when a retention enforcement job completes execution",
        whRetentionUpdated: "Fired when a retention policy configuration is updated",
      },
      reports: {
        asyncIntro:
          "Reports are generated asynchronously to avoid blocking HTTP requests for large datasets. When you request a report, the system immediately creates a ComplianceReport record with IsReady=false and queues the generation job. Poll the reports list to check when IsReady becomes true.",
        asyncTip:
          "Use the Refresh button in the Reports UI to poll for report readiness. Reports typically complete within 30–60 seconds for datasets up to 10,000 records.",
        asyncTitle: "Asynchronous Generation",
        description:
          "Generate async audit-ready compliance reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        downloadIntro:
          "Once a report is ready (IsReady=true), a DownloadUrl is available. The download endpoint serves the report file securely. Report files are retained for 90 days before automatic cleanup.",
        downloadTitle: "Downloading Reports",
        endpointsTitle: "API Endpoints",
        ep: {
          download: "Download the generated report file",
          generate: "Queue a new report generation job",
          get: "Get report details and download URL by ID",
          list: "List all compliance reports (paginated, filterable by type/status)",
        },
        intro:
          "Compliance Reports are asynchronously generated documents that provide audit-ready summaries of your compliance posture. Reports are generated in the background and stored for download once ready, supporting regulatory inspections, internal audits, and executive reporting.",
        reportTypesIntro: "Five report types are available:",
        reportTypesTitle: "Report Types",
        title: "Compliance Reports",
        type1:
          "GDPR Overview — High-level summary of GDPR compliance status across all sub-modules.",
        type2:
          "DSR Activity Summary — Statistics on DSR volume, types, completion rates, and SLA adherence.",
        type3:
          "Consent Audit — Full log of consent grants and withdrawals by purpose and time period.",
        type4: "Retention Analysis — Current enforcement status of all active retention policies.",
        type5: "Data Inventory Export — Full export of the data inventory (Article 30 RoPA).",
      },
      retention: {
        action1: "Delete — Permanently removes all records matching the data category.",
        action2:
          "Anonymize — Replaces personally identifiable information with pseudonymous tokens, preserving aggregate analytics data.",
        actionsIntro: "When a retention period expires, SCRIPE applies one of two actions:",
        actionsTitle: "Expiry Actions",
        automationIntro:
          "The RetentionEnforcementJob runs daily at 3:00 AM UTC, scanning all active retention policies and applying the configured expiry action to eligible records. Each enforcement run creates a RetentionExecution audit record.",
        automationTitle: "Automated Enforcement",
        conn1: "scanned by",
        conn2: "triggers",
        conn3: "logs",
        descAction: "Hard deletion or Anonymization via ISuspendableModule",
        descEnforcement: "Weekly job to evaluate policies",
        descExecution: "Audit trail of the destruction action",
        descPolicy: "Defines entity type, age limit, and destruction strategy",
        description:
          "Define data retention periods and automated expiry actions (Delete or Anonymize) for GDPR Article 5(1)(e) compliance.",
        endpointsTitle: "API Endpoints",
        ep: {
          executions: "List enforcement execution history",
          list: "List all retention policies",
          update: "Update a retention policy (days, action, active status)",
        },
        field1:
          "DataCategory — The type of data (e.g. 'User Profiles', 'Transaction Logs', 'Consent Records').",
        field2: "RetentionDays — How many days the data must be retained.",
        field3: "ExpiryAction — What happens when the period expires: Delete or Anonymize.",
        field4:
          "RegulationCode — Which regulation requires this retention period (GDPR, CCPA, etc.).",
        intro:
          "Data Retention Policies define how long specific categories of data must be kept and what happens when the retention period expires. SCRIPE enforces these policies automatically via background jobs, removing the manual overhead of managing data lifecycles.",
        nodeAction: "Data Destruction",
        nodeEnforcement: "Retention Enforcement Job",
        nodeExecution: "Retention Execution",
        nodePolicy: "Retention Policy",
        policiesIntro: "Each retention policy specifies:",
        policiesTitle: "Policy Configuration",
        title: "Data Retention Policies",
      },
    },
    editions: {
      description:
        "Named subscription plans with feature bundles, overflow policies, versioning, and rollout strategies.",
      drillDownIntro:
        "When a system admin drills down into a tenant, the editions list is automatically scoped to show only editions visible to that tenant. The backend uses the X-Tenant-Context header to filter: system editions + retail editions created by the drilled-down tenant. The frontend hides CRUD actions in drill-down mode.",
      drillDownTitle: "Drill-Down Behavior",
      endpointsCreate: "Create a new edition",
      endpointsCreateVersion: "Create a new draft version with feature snapshot",
      endpointsDelete: "Soft-delete an edition",
      endpointsDirectApply: "Apply feature changes immediately (no versioning)",
      endpointsGet: "Get edition details by ID",
      endpointsGetFeatures: "List features configured for this edition",
      endpointsGetVersions: "List all versions for this edition",
      endpointsIntro:
        "The Editions controller exposes 11 endpoints for managing editions, their features, and version lifecycle:",
      endpointsList: "List all editions (paginated, filterable)",
      endpointsPublishVersion: "Publish a draft version with chosen rollout strategy",
      endpointsSetFeatures: "Set/update features for this edition",
      endpointsTitle: "API Endpoints",
      endpointsUpdate: "Update edition metadata",
      entityIntro:
        "An Edition is a named plan that bundles feature values. System editions are created by platform admins; retail editions are created by reseller tenants for their child tenants.",
      entityTitle: "Edition Entity",
      featuresIntro:
        "Each edition contains a set of EditionFeature records that map features to their values within that plan. Features not explicitly set in an edition fall back to the Feature.DefaultValue.",
      featuresTip:
        "Features not explicitly set in an edition fall back to Feature.DefaultValue. You only need to configure features that differ from the global default.",
      featuresTitle: "Edition Features",
      intro:
        "Editions are named plans (e.g. Basic, Pro, Enterprise) that bundle feature values together. Each tenant subscribes to an edition, which determines their feature access. Editions support versioning with controlled rollout strategies for safe deployment of changes.",
      overflowIntro:
        "When a tenant downgrades to an edition with lower limits, their existing resources may exceed the new limits. The OverflowPolicy determines what happens:",
      overflowTitle: "Overflow Policy",
      rolloutIntro:
        "When publishing an edition version, admins choose how the changes are deployed to subscribed tenants:",
      rolloutTitle: "Rollout Strategies",
      scopingIntro:
        "SCRIPE supports two types of editions: System editions created by platform admins visible to all tenants, and Retail editions created by reseller tenants for their child tenants only.",
      scopingNote:
        "Tenant administrators only see system editions plus their own retail editions. During drill-down, the system admin sees only the drilled-down tenant's visible editions (system + that tenant's retail). This ensures edition isolation between reseller tenants.",
      scopingTitle: "System vs Retail Editions",
      title: "Editions",
      versionsIntro:
        "Edition Versions provide a versioning and rollout system for feature changes. Instead of modifying features directly, admins can create a new version (snapshot), choose a rollout strategy, and publish it.",
      versionsTitle: "Edition Versions",
      workflowIntro:
        "SCRIPE provides two ways to update edition features, each suited for different scenarios:",
      workflowTip:
        "Use 'Apply Now' for urgent fixes and small changes. Use 'Save as Version' for major plan updates that need staged rollout and audit trail.",
      workflowTitle: "Apply Now vs Save as Version",
    },
    entitlementsOverview: {
      architectureIntro:
        "The Entitlements system is composed of four interconnected domains that work together to provide a complete feature-gating solution.",
      architectureTitle: "Architecture",
      backendIntro:
        "The Entitlements backend follows SCRIPE's standard Clean Architecture module layout with Domain, Application, and Infrastructure layers.",
      backendTitle: "Backend Structure",
      comparisonIntro:
        "The following table shows the difference in capabilities when the Entitlements module is enabled versus running without it:",
      comparisonTitle: "With vs Without Entitlements",
      contextAwareIntro:
        "All entitlements pages (Features, Editions, Permissions) are context-aware. The frontend detects whether the user is a system admin (tenantId is null), tenant admin, or in drill-down mode, and calls different backend endpoints accordingly. System admins see the full catalog with CRUD; tenant admins see only their effective data in read-only mode.",
      contextAwareTitle: "Context-Aware Scoping",
      controllersIntro:
        "The Entitlements module exposes 31 API endpoints across 4 controllers, all authenticated with JWT and protected by permission-based authorization.",
      controllersTitle: "API Controllers",
      cqrsMapIntro:
        "The Entitlements module registers 31 SCRIPE request handlers spanning the four domains. Each command has a corresponding FluentValidation validator for input validation.",
      cqrsMapTitle: "CQRS Command & Query Map",
      description:
        "Edition-based feature gating with Features, Editions, Subscriptions, and per-tenant Overrides.",
      diIntro:
        "All Entitlements services are registered via the AddEntitlementsModule extension method in DependencyInjection.cs. The module follows SCRIPE's standard registration pattern.",
      diTitle: "Dependency Injection Registration",
      domainsIntro: "Each domain handles a specific aspect of the entitlements lifecycle:",
      domainsTitle: "Four Domains",
      frontendIntro:
        "The frontend mirrors the backend with four sub-modules (editions, features, subscriptions, overrides), each following the SOLID View/ViewModel pattern.",
      frontendTitle: "Frontend Structure",
      gettingStartedIntro:
        "Follow these 5 steps to set up the Entitlements system for your platform. Each step builds on the previous one:",
      gettingStartedTitle: "Getting Started",
      intro:
        "The Entitlements module is SCRIPE's plan-and-feature management engine. It defines what capabilities each tenant gets, how plans (editions) bundle those capabilities, and how subscriptions link tenants to plans.",
      noOpIntro:
        "When the Entitlements module is not loaded (e.g. in a microservice that doesn't include Entitlements), SCRIPE registers a NoOpFeatureCache. This allows IRequireFeature commands to pass through without errors — all features are treated as enabled by default.",
      noOpNote:
        "The NoOp fallback ensures that modules can use IRequireFeature without a hard dependency on the Entitlements module. In production monolith mode, the real FeatureCache is always available.",
      noOpTitle: "NoOp Fallback",
      pipelineIntro:
        "SCRIPE integrates entitlements directly into the AstraFlow mediator CQRS pipeline via FeatureCheckBehavior. Commands and queries that implement IRequireFeature are automatically gated — if the tenant's resolved feature value is disabled, the request is rejected before reaching the handler.",
      pipelineTip:
        "To gate a command behind a feature, simply implement IRequireFeature and set RequiredFeatureName to the feature's stable system key (e.g. 'Chat.Enabled'). No additional code is needed.",
      pipelineTitle: "Pipeline Integration",
      resolutionIntro:
        "When the system needs to determine a feature value for a tenant, it follows a strict priority chain. The highest-priority source that provides a value wins.",
      resolutionTip:
        "The resolution chain is evaluated lazily — values are cached after first resolution and invalidated when subscriptions, editions, or overrides change.",
      resolutionTitle: "Feature Value Resolution Chain",
      title: "Entitlements Overview",
      whatIsIntro:
        "Entitlements is the module responsible for controlling which features a tenant can access based on their subscribed edition (plan). It provides a three-level resolution chain: Feature defaults → Edition values → Per-tenant overrides, ensuring maximum flexibility for both platform operators and reseller tenants.",
      whatIsTitle: "What is Entitlements?",
    },
    features: {
      cacheIntro:
        "Resolved feature values are cached in the IFeatureCache to avoid database queries on every request. The cache is invalidated whenever an edition's features change, a subscription is modified, or an override is set/removed. In microservice deployments without the Entitlements module, a NoOpFeatureCache treats all features as enabled.",
      cacheNote:
        "The cache is automatically invalidated when: (1) an edition's features are modified, (2) a subscription is assigned/changed, (3) an override is set/removed. No manual cache busting is needed.",
      cacheTitle: "Feature Cache",
      contextAwareIntro:
        "The features list page is context-aware. System admins see the full feature catalog with CRUD operations. Tenant admins and drill-down sessions see only the tenant's effective features (resolved from their edition + overrides) in read-only mode. All scoping is backend-driven via GET /features (catalog) vs GET /features/effective (tenant-scoped).",
      contextAwareTitle: "Context-Aware Feature Display",
      description:
        "Controllable platform capabilities with Boolean, Numeric, and String value types.",
      endpointsIntro:
        "The Features controller exposes 5 CRUD endpoints. System features cannot be deleted:",
      endpointsTitle: "API Endpoints",
      entityIntro:
        "A Feature defines a controllable platform capability. The Name field is a stable system key used in code; DisplayNameEn/DisplayNameAr are user-facing labels.",
      entityTitle: "Feature Entity",
      ep: {
        create: "Create a new custom feature",
        delete: "Soft-delete a custom feature (system features cannot be deleted)",
        get: "Get feature details by ID",
        list: "List all features (paginated, filterable by category/type)",
        update: "Update feature metadata (system features: DefaultValue/Description only)",
      },
      intro:
        "Features are the atomic building blocks of the Entitlements system. Each feature represents a controllable capability — a boolean toggle, a numeric quota, or a string configuration. Features have a stable system key (Name) that never changes, making them safe to reference in code.",
      patternIntro:
        "To gate any CQRS command behind a feature check, simply implement the IRequireFeature marker interface. The FeatureCheckBehavior automatically intercepts the request, resolves the tenant's feature value, and rejects if disabled or over quota.",
      patternTitle: "IRequireFeature Pattern",
      quotaIntro:
        "Numeric features support automatic quota enforcement via the QuotaCounter entity. The FeatureCheckBehavior checks the current usage against the resolved limit for every IRequireFeature command targeting a numeric feature.",
      quotaTitle: "Quota Tracking (QuotaCounter)",
      requireFeatureIntro:
        "To gate a CQRS command or query behind a feature, implement the IRequireFeature marker interface. The FeatureCheckBehavior pipeline behavior automatically resolves the tenant's current value and rejects the request if the feature is disabled.",
      requireFeatureNote:
        "IRequireFeature works for both Boolean features (checked as enabled/disabled) and Numeric features (checked as remaining quota). The behavior automatically determines the check type from the Feature.ValueType.",
      requireFeatureTitle: "IRequireFeature Interface",
      seedingIntro:
        "System features are automatically seeded at application startup by EntitlementsStartupSeeder. The seeder checks if each system feature already exists (by Name) and only creates missing ones — existing features are never overwritten.",
      seedingTitle: "Feature Seeding",
      systemVsCustomIntro:
        "SCRIPE distinguishes between system features (seeded at startup, read-only) and custom features (created by admins via API):",
      systemVsCustomTitle: "System vs Custom Features",
      title: "Features",
      valueTypesIntro:
        "Feature values are stored as strings but interpreted according to their ValueType. The system validates values against the expected type at creation and update time.",
      valueTypesTip:
        "For Numeric features, use -1 to represent 'unlimited'. The FeatureCheckBehavior recognizes -1 as a special value and never blocks requests for features with an unlimited quota.",
      valueTypesTitle: "Value Types",
    },
    overrides: {
      auditIntro:
        "Every override operation is tracked with full audit information. The Reason field on each override provides context for why the custom value was applied.",
      auditTitle: "Audit Trail",
      bestPracticesIntro:
        "Follow these guidelines to keep your override system maintainable and auditable.",
      bestPracticesTitle: "Best Practices",
      bestPracticesWarning:
        "Overrides should be used sparingly. If many tenants need the same override, consider creating a new edition instead. Excessive overrides make the system harder to manage and create maintenance debt.",
      description: "Per-tenant feature value customization that bypasses edition defaults.",
      endpointsIntro:
        "The TenantFeatures controller exposes 4 endpoints for managing per-tenant overrides and resolved values:",
      endpointsTitle: "API Endpoints",
      entityIntro:
        "A TenantFeatureOverride sets a custom value for a specific feature on a specific tenant. It includes an optional Reason field for audit purposes.",
      entityTitle: "Override Entity",
      ep: {
        list: "List all overrides for a specific tenant",
        remove: "Remove (deactivate) a feature override",
        resolved:
          "Get all resolved feature values for a tenant (shows source: Override/Edition/Default)",
        set: "Set or update a feature override for a tenant",
      },
      expiryIntro:
        "Overrides can have an optional ExpiresAt date. When the expiration date passes, the override is automatically deactivated and the feature falls back to the edition value (or global default).",
      expiryNote:
        "Expired overrides are soft-deactivated (IsActive = false), not deleted. This preserves the audit trail and allows re-activation if needed.",
      expiryTitle: "Expiring Overrides",
      intro:
        "Feature Overrides allow platform administrators to customize feature values for individual tenants, regardless of their subscribed edition. Overrides take the highest priority in the resolution chain, making them perfect for custom sales deals, special promotions, or one-off exceptions.",
      overuseWarning:
        "Overrides should be used sparingly. If many tenants need the same override, consider creating a new edition instead. Excessive overrides make the system harder to manage and audit.",
      priorityIntro:
        "Overrides sit at the top of the resolution chain. When the system resolves a feature value for a tenant, it checks for an override first:",
      priorityTitle: "Resolution Priority",
      resolvedIntro:
        "The GET /api/v1/tenants/{tenantId}/features/resolved endpoint returns the final, effective value for every feature for a given tenant. It shows the resolution source (Override, Edition, or Default) for each entry, making it easy to debug and audit.",
      resolvedTitle: "Resolved Features Endpoint",
      scenariosIntro:
        "The following real-world scenarios demonstrate when overrides provide the most value:",
      scenariosTitle: "Use Case Scenarios",
      settingIntro:
        "To set an override, POST to the tenant features endpoint with the feature ID, custom value, and an optional reason for audit purposes.",
      settingTip:
        "Always include a reason when setting overrides — it makes audit trails meaningful and helps future admins understand why the override was applied.",
      settingTitle: "Setting an Override",
      title: "Feature Overrides",
      useCase1: "Custom enterprise deals — 'Give Acme Corp 500 admins instead of the standard 50'",
      useCase2: "Promotional offers — 'Enable Premium Chat for this tenant for 30 days'",
      useCase3: "Beta testing — 'Enable the new Invoicing module for early adopters'",
      useCase4: "Temporary escalation — 'Increase file upload limit during their migration'",
      whenIntro:
        "Overrides are designed for exceptional cases where a tenant needs a different value than their edition provides:",
      whenTitle: "When to Use Overrides",
    },
    // ── Plugins Module (Phase 15) ────────────────────────────
    plugins: {
      overview: {
        apiActivate: "Activate a disabled plugin installation",
        apiCatalog: "Browse published plugins in the catalog",
        apiCatalogId: "Get full details of a specific plugin definition",
        apiContextTenant: "Get tenant profile and enabled features for plugin context",
        apiDataDelete: "Delete a key-value entry from the data store",
        apiDataGet: "List all key-value entries in a data store namespace",
        apiDataSet: "Upsert a value in the data store (max 64KB)",
        apiDeactivate: "Deactivate an active plugin installation",
        apiDefinitions: "Register a new plugin definition (super admin only)",
        apiInstall: "Install a plugin for a tenant",
        apiInstalled: "List all plugins installed for a tenant",
        apiLogs: "Get paginated execution logs (page + pageSize)",
        apiSettings: "Update the JSON settings for an installation",
        apiTokenExchange: "Exchange API key for a short-lived scoped access token",
        apiUninstall: "Uninstall a plugin and trigger data cleanup",
        apiUpgrade: "Upgrade an installation to a new version",
        apiWebhookSub: "Subscribe an installation to a platform webhook event",
        apiWebhookUnsub: "Unsubscribe from a webhook event",
        architectureIntro:
          "The plugin system orchestrates from catalog registration through lifecycle management, health monitoring, and execution logging.",
        architectureTitle: "System Architecture",
        backendIntro:
          "The backend follows SCRIPE's standard 3-project Clean Architecture module layout: Plugins.Domain → Plugins.Application → Plugins.Infrastructure.",
        backendTitle: "Backend Architecture",
        connInstall: "install",
        connLog: "log result",
        connRate: "rate check",
        connTier1: "Tier 1",
        connTier2: "Tier 2",
        cqrsActivate: "Set installation status to Active",
        cqrsCatalog: "List all published plugins in the catalog",
        cqrsDeactivate: "Set installation status to Disabled",
        cqrsDesc: "Description",
        cqrsDetails: "Get full details of a plugin definition",
        cqrsGetData: "Read data store entries for a namespace",
        cqrsGrant: "Grant a permission to a plugin installation",
        cqrsInstall: "Install a plugin definition for a tenant",
        cqrsInstalled: "List all installations for a tenant",
        cqrsIntro:
          "The Plugins module registers 15 request handlers via AstraFlow.Mediator. All commands have a corresponding FluentValidation validator.",
        cqrsLogs: "Get paginated execution logs for an installation",
        cqrsName: "Handler",
        cqrsRegister: "Register a new plugin definition in the catalog",
        cqrsSetData: "Upsert a key-value entry in the plugin data store",
        cqrsSettings: "Update the installation settings JSON",
        cqrsSubscribe: "Subscribe to a platform webhook event",
        cqrsTitle: "CQRS Commands & Queries",
        cqrsType: "Type",
        cqrsUninstall: "Remove a plugin installation and clean up data",
        cqrsUpgrade: "Upgrade to a new plugin version",
        description:
          "Two-Tier enterprise plugin platform with certified in-process plugins and sandboxed marketplace plugins.",
        endpointsIntro:
          "All plugin endpoints are under /api/v1/plugins/ for admin operations and /api/v1/plugin-api/v1/ for the sandboxed Tier 2 gateway.",
        endpointsTitle: "API Endpoints",
        entitiesIntro:
          "The Plugins domain defines 8 entities. PluginExecutionLog is append-only (Entity<Guid>); all others are AuditableEntity<Guid> with soft-delete support.",
        entitiesTitle: "Domain Entities",
        entityBase: "Base Class",
        entityDataPurpose: "Tier 2 key-value sandbox (namespace + key + value JSON)",
        entityDefPurpose: "Plugin catalog entry — global, not tenant-scoped",
        entityGrantPurpose: "Consent record for a permission granted to a plugin",
        entityInstPurpose: "Per-tenant installation record with settings JSON",
        entityKeyPurpose: "SHA-256 hashed API key for gateway authentication",
        entityLogPurpose: "Append-only gateway call log (no soft-delete)",
        entityName: "Entity",
        entityPurpose: "Purpose",
        entityVerPurpose: "Version history per plugin definition",
        entityWebhookPurpose: "Webhook subscription to platform events",
        featureGateway: "API Gateway",
        featureGatewayDesc:
          "Authenticated plugin-api gateway with per-tenant rate limiting, execution logging, and API key management.",
        featureLogs: "Execution Logs",
        featureLogsDesc:
          "Append-only execution log per installation. Records endpoint, duration, status code, and success/failure.",
        featureSDK: "Plugin SDK",
        featureSDKDesc:
          "postMessage-based communication protocol with typed bridge classes for theme, auth, navigation, and toast.",
        featureTier1: "Tier 1 — Certified Plugins",
        featureTier1Desc:
          "In-process plugins with full DI access, Module Federation frontend, and IPluginStartup contract.",
        featureTier2: "Tier 2 — Sandboxed Plugins",
        featureTier2Desc:
          "Third-party plugins isolated via REST gateway with rate limiting, scoped auth tokens, and an isolated key-value store.",
        featureWebhooks: "Webhook Events",
        featureWebhooksDesc:
          "7 platform events (installed, uninstalled, activated, deactivated, upgraded, health failed, rate limited).",
        frontendIntro:
          "The frontend follows SCRIPE's MVVM pattern with strict layer separation. Views are dumb UI; ViewModels handle all state and mutations via TanStack Query.",
        frontendTitle: "Frontend Architecture",
        infoContent:
          "The Plugin System was introduced in Phase 15. It covers the full plugin lifecycle: definition, installation, activation, upgrade, health monitoring, execution logging, webhook subscriptions, and a complete frontend SDK for host–iframe communication.",
        infoTitle: "Phase 15 — Enterprise Plugin Platform",
        intro:
          "The Plugin System is SCRIPE's extensibility engine. It allows platform operators to install certified Tier 1 plugins that run in-process with full infrastructure access, and third-party Tier 2 plugins that run in a sandboxed REST gateway with an isolated key-value data store.",
        jobDesc: "Description",
        jobDesc1: "Hard-deletes soft-deleted plugin entities older than 30 days",
        jobDesc2: "Calls GET {baseUrl}/health for every active Tier 2 installation",
        jobDesc3: "Removes orphaned data store entries for uninstalled plugins",
        jobId: "Job ID",
        jobSched1: "Daily at 03:00",
        jobSched2: "Every 5 minutes",
        jobSched3: "Daily at 02:00",
        jobSchedule: "Schedule",
        jobsIntro:
          "Three background jobs manage plugin health, data cleanup, and soft-delete purging.",
        jobsTitle: "Background Jobs",
        nodeCatalog: "Plugin Catalog",
        nodeCatalogDesc:
          "Registry of all available plugin definitions with tier, status, manifest.",
        nodeInstall: "Installation",
        nodeInstallDesc: "Tenant-scoped install record with settings JSON and health status.",
        nodeLogs: "Execution Logs",
        nodeLogsDesc: "Append-only PluginExecutionLog records per gateway call.",
        nodeSandbox: "Rate Limiter",
        nodeSandboxDesc: "PluginSandbox — 60 req/min per tenant+installation sliding window.",
        nodeTier1Host: "Tier 1 Host",
        nodeTier1HostDesc: "IPluginHost — discovers IPluginStartup and activates in-process.",
        nodeTier2Gateway: "Tier 2 Gateway",
        nodeTier2GatewayDesc: "IPluginGateway — forwards HTTP to plugin BaseUrl with auth.",
        permCatalogInstall: "Install plugins for a tenant",
        permCatalogUninstall: "Uninstall plugins from a tenant",
        permCatalogView: "Browse published plugin catalog",
        permDefCreate: "Register new plugin definitions (platform admin)",
        permGrants: "Grants Access To",
        permInstalledManage: "Activate, deactivate, upgrade, update settings",
        permInstalledView: "View installed plugins list",
        permissionsIntro:
          "All plugin endpoints are protected by permission-based authorization. Permissions are seeded at startup by PluginsPermissionProvider.",
        permissionsTitle: "Permissions Reference",
        permKey: "Permission Key",
        permLogs: "View execution logs for an installation",
        permPermManage: "Grant and revoke plugin permissions",
        permWebhooks: "Subscribe and unsubscribe webhook events",
        quickStartTitle: "Quick Start Guide",
        rowAuth: "Auth",
        rowAuthT1: "Host JWT",
        rowAuthT2: "Scoped plugin token",
        rowData: "Data Access",
        rowDataT1: "Full DI access",
        rowDataT2: "Isolated key-value store only",
        rowFrontend: "Frontend",
        rowFrontendT1: "Module Federation (shared React)",
        rowFrontendT2: "iframe + postMessage SDK",
        rowQuota: "Quota",
        rowQuotaT1: "None (trusted)",
        rowQuotaT2: "60 API calls per minute",
        rowRuntime: "Runtime",
        rowRuntimeT1: "In-process (.NET shared runtime)",
        rowRuntimeT2: "Sandboxed REST gateway",
        rowWho: "Who",
        rowWhoT1: "Internal / certified plugins",
        rowWhoT2: "Third-party marketplace plugins",
        sdkIntro:
          "The Plugin SDK lives in src/core/plugins/ and provides all infrastructure for host-plugin communication via iframe postMessage for Tier 2, and Module Federation for Tier 1.",
        sdkTitle: "Plugin SDK",
        secDo1: "Validate event.origin in every iframe message listener",
        secDo2: "Use the plugins_definition.create permission for catalog registration",
        secDo3: "Store sensitive config in SettingsJson (encrypted at rest)",
        secDo4: "Monitor execution logs for unusual latency spikes",
        secDont1: "Allow iframe navigation to external (non-/) paths",
        secDont2: "Store raw API keys in the database (only KeyHash is stored)",
        secDont3: "Grant plugins_definition.create to non-admin roles",
        secDont4: "Disable the PluginSandbox rate limiter in production",
        secDontTitle: "Don't",
        secDoTitle: "Do",
        securityIntro:
          "The Plugin System enforces multiple security boundaries to protect tenants from malicious or buggy plugins.",
        securityTitle: "Security",
        securityWarningContent:
          "Tier 1 plugins have full access to SCRIPE's DI container and database. Only install certified plugins from your own team or thoroughly audited sources. The plugins_definition.create permission is restricted to super admins by default.",
        securityWarningTitle: "Tier 1 plugins run in-process",
        step1Content:
          "Create the Plugins module database and apply migrations using the SCRIPE CLI.",
        step1Title: "Run Database Migration",
        step2Content:
          "Register your plugin in the catalog by calling the definitions endpoint as super admin.",
        step2Title: "Register a Plugin Definition",
        step3Content: "Install the plugin for a specific tenant using the install endpoint.",
        step3Title: "Install for a Tenant",
        step4Content: "Activate the installation to make it available to users.",
        step4Title: "Activate the Installation",
        step5Content:
          "Navigate to /plugins/installed in the frontend. You will see the plugin with its health badge, and can click Settings or Logs for per-installation views.",
        step5Title: "Open the Plugin UI",
        thAspect: "Aspect",
        thTier1: "Tier 1 (Certified)",
        thTier2: "Tier 2 (Marketplace)",
        tiersIntro:
          "The Two-Tier model separates trusted internal plugins from third-party marketplace plugins with clear security boundaries.",
        tiersTitle: "Two-Tier Comparison",
        title: "Plugin System Overview",
        webhookDesc: "Description",
        webhookEvent: "Event",
        webhooksIntro:
          "The Plugin System publishes 7 webhook events that third-party systems can subscribe to via the webhook subscription API.",
        webhooksTitle: "Webhook Events",
        webhookTrigger: "Trigger",
        whActivated: "ActivatePluginCommand success",
        whActivatedDesc: "Fired when an installation status changes to Active",
        whatIsIntro:
          "The Plugin System provides a Two-Tier architecture for extending SCRIPE with additional capabilities. Tier 1 plugins are trusted, certified modules that integrate directly into the .NET runtime via IPluginStartup. Tier 2 plugins are third-party applications that integrate via a secure REST gateway and communicate with the host using a postMessage-based SDK.",
        whatIsTitle: "What Is the Plugin System?",
        whDeactivated: "DeactivatePluginCommand success",
        whDeactivatedDesc: "Fired when an installation status changes to Disabled",
        whHealthFailed: "PluginHealthCheckJob",
        whHealthFailedDesc: "Fired when a health check returns non-2xx for an active plugin",
        whInstalled: "InstallPluginCommandHandler success",
        whInstalledDesc: "Fired after a plugin is successfully installed for a tenant",
        whRateLimit: "PluginSandbox.IsAllowed() = false",
        whRateLimitDesc: "Fired when a Tier 2 plugin exceeds its 60 req/min quota",
        whUninstalled: "UninstallPluginCommandHandler + cleanup",
        whUninstalledDesc: "Fired after uninstall and data store cleanup completes",
        whUpgraded: "UpgradePluginCommand success",
        whUpgradedDesc: "Fired when an installation is upgraded to a new version",
      },
      sdk: {
        bridgeClass: "Class",
        bridgeIntro:
          "PluginBridge is the low-level communication channel. It validates event.origin on every incoming message to prevent spoofing, and targets messages to the correct iframe window.",
        bridgeMsg: "Message Handled",
        bridgeRole: "Responsibility",
        bridgesIntro:
          "Each bridge class handles a specific concern. Mount them after creating a PluginBridge and unmount on cleanup.",
        bridgesTitle: "Bridge Classes",
        bridgeTitle: "PluginBridge",
        dataStoreIntro:
          "Tier 2 plugins get an isolated key-value store. All keys are scoped to the installation ID + namespace. Maximum value size is 64KB.",
        dataStoreTitle: "Data Store API",
        dataStoreWarningContent:
          "Data store reads and writes go through the Tier 2 gateway and count toward the 60 req/min quota per installation.",
        dataStoreWarningTitle: "Rate limiting applies to Data Store calls",
        description:
          "Complete reference for the host-plugin communication SDK — PluginBridge, message types, bridge classes, and Tier 1/2 development guides.",
        eventBusIntro:
          "The in-process PluginEventBus allows any part of the host application to react to plugin lifecycle events without direct coupling. A singleton pluginEventBus is exported for convenience.",
        eventBusTitle: "PluginEventBus",
        frameIntro:
          "PluginFrame is the React component that renders a Tier 2 plugin in a sandboxed iframe. It automatically creates a PluginBridge, handles READY/RESIZE/NAVIGATE_REQUEST/TOAST messages, and shows a skeleton while loading.",
        frameTitle: "PluginFrame",
        infoContent:
          "The SDK is framework-agnostic at the message protocol level. Tier 2 plugin iframes can be built with any framework (React, Vue, Svelte, vanilla JS) as long as they implement the postMessage contract.",
        infoTitle: "SDK lives in src/core/plugins/",
        intro:
          "The Plugin SDK provides all infrastructure for bidirectional communication between the SCRIPE host application and plugin frontends. Tier 2 plugins communicate via iframe postMessage; Tier 1 plugins use Module Federation with shared React.",
        protocolIntro:
          "All host-plugin communication uses a typed union of messages. The host sends HostToPluginMessage; the plugin sends PluginToHostMessage.",
        protocolTitle: "Message Protocol",
        providerIntro:
          "PluginHostProvider is a React context that wires all bridges and relays together. Wrap plugin pages with it to provide createBridgeFor, syncTheme, and mountRelays to child components.",
        providerTitle: "PluginHostProvider",
        roleAuth: "Serve scoped tokens when iframe requests one",
        roleNav: "Allow iframe to trigger host-side navigation",
        roleTheme: "Push host theme (mode, accent, direction) to iframe",
        roleToast: "Forward iframe toast requests to host notification system",
        tab1Backend: "Backend (C#)",
        tab1Frontend: "Frontend (webpack)",
        tab1Host: "Host Usage",
        tier1Intro:
          "Tier 1 plugins integrate at the .NET level via IPluginStartup and at the frontend level via Module Federation. They share the host's React instance.",
        tier1Title: "Tier 1 Plugin Development",
        tier2Intro:
          "Tier 2 plugins are independent web applications hosted at their own URL. The host embeds them in a sandboxed iframe. The plugin must implement the postMessage protocol.",
        tier2Title: "Tier 2 Plugin Development",
        title: "Plugin SDK Reference",
      },
    },
    subscriptions: {
      assignIntro:
        "Create a new subscription linking a tenant to an edition. If the tenant already has an active subscription, the previous one is automatically cancelled. Supports optional currency, promo code, and expiry behavior parameters.",
      assignTitle: "Assign Subscription",
      concurrencyIntro:
        "Each TenantSubscription has a ConcurrencyStamp (Guid) marked with [ConcurrencyCheck]. The stamp is refreshed (Guid.NewGuid()) on every write operation. This prevents race conditions — for example, a concurrent cancel + reconciliation job — by throwing DbUpdateConcurrencyException on mid-air collisions.",
      concurrencyTitle: "Optimistic Concurrency (E1)",
      crossModuleIntro:
        "Subscription lifecycle events publish domain events consumed by the Identity module. When a subscription is suspended, all tenant admins are deactivated with DeactivationReason='SubscriptionSuspended'. On resume, only admins with that specific reason are reactivated — manually-deactivated admins stay off. Expiry cascades deactivation to all descendant tenants.",
      crossModuleReasons:
        "Three deactivation reasons: 'Manual' (admin manually deactivated — never auto-reactivated), 'SubscriptionSuspended' (reactivated on resume), 'SubscriptionExpired' (deactivated on expiry).",
      crossModuleTitle: "Cross-Module Integration (H1)",
      description:
        "Tenant-to-edition binding with full lifecycle management, multi-currency pricing, promotions, trials, downgrades, expiry behavior, and advanced analytics export.",
      downgradeIntro:
        "When a tenant is downgraded (either manually or due to expiry), the system tracks the original subscription details for audit and potential restoration. The DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate, and DowngradedAt fields preserve the complete downgrade history.",
      downgradeTitle: "Downgrade Tracking",
      downgradeWarning:
        "When downgrading, the OverflowPolicy of the target edition determines what happens to resources that exceed the new limits. Always use the Downgrade Impact endpoint to preview the effects before making changes.",
      endpointsIntro:
        "The Subscriptions controller provides 13 endpoints covering the full subscription lifecycle:",
      endpointsTitle: "API Endpoints",
      entityIntro:
        "A TenantSubscription binds a tenant to an edition with lifecycle tracking. It supports multiple subscription types and statuses for comprehensive lifecycle management.",
      entityTitle: "Subscription Entity",
      ep: {
        assign: "Create a new subscription (assign tenant to edition with currency/promo)",
        cancel: "Cancel subscription permanently",
        downgrade: "Downgrade to a lower edition (checks OverflowPolicy)",
        export: "Export subscriptions as CSV, Excel, or PDF with advanced filters",
        get: "Get subscription details by ID",
        impact: "Preview downgrade impact before executing",
        list: "List all subscriptions (paginated, filterable by status/type/tenant)",
        renew: "Renew an expiring subscription",
        resume: "Resume a suspended subscription",
        suspend: "Suspend subscription (block tenant access)",
        tenantActive: "Get the active subscription for a specific tenant",
        upgrade: "Upgrade to a higher edition",
      },
      exchangeRateIntro:
        "All amounts are normalized to USD via ExchangeRateToUsd for consistent MRR/ARR reporting. The TotalAmountUsd field is computed at subscription time and stored for historical accuracy — exchange rate fluctuations do not retroactively change past records.",
      exchangeRateTitle: "USD Normalization",
      expiryIntro:
        "When a subscription expires, the ExpiryBehavior setting determines what happens next:",
      expiryTitle: "Expiry Behavior",
      exportDaysLeftIntro:
        "Reports include a computed 'Days Left' column with conditional color coding: red (≤7 days), yellow (≤30 days), green (>30 days). This enables at-a-glance identification of subscriptions requiring renewal attention.",
      exportDaysLeftTitle: "Days Until Expiry",
      exportFilterCurrency: "Currency — display amounts in selected currency",
      exportFilterDate:
        "Date Range — filter by subscription creation date (last 7/30/90 days, last year, or custom range)",
      exportFilterEdition: "Edition — filter by specific plan/edition",
      exportFilterExpiring:
        "Expiring Soon — find subscriptions expiring within 5/7/14/30/60/90 days",
      exportFiltersIntro: "Reports support advanced filtering for targeted analytics:",
      exportFilterStatus: "Status — Active, Suspended, Cancelled, Expired",
      exportFiltersTitle: "Export Filters",
      exportFormatCsv: "CSV — lightweight, importable into any spreadsheet or BI tool",
      exportFormatExcel:
        "XLSX — professional Excel workbook with styled headers, filter metadata sheet, conditional formatting, and auto-sized columns (ClosedXML)",
      exportFormatPdf:
        "PDF — print-ready document with branded cover page, statistical summary, and paginated data tables (QuestPDF)",
      exportFormatsTitle: "Export Format Details",
      exportIntro:
        "The subscription export system generates comprehensive reports in CSV, Excel (XLSX), and PDF formats. Each report includes a cover page with filter metadata, color-coded data tables, and statistical summaries.",
      exportTitle: "Advanced Export & Reporting",
      impactIntro:
        "Before changing a tenant's edition, use the Downgrade Impact endpoint to preview which resources would overflow. The response lists every feature that would exceed the new edition's limits, along with the current usage vs. new limit.",
      impactTitle: "Downgrade Impact Analysis",
      intro:
        "Subscriptions link tenants to editions (plans). Each tenant has a base subscription that determines their edition, and optionally add-on subscriptions for extra capabilities. The subscription system handles the full lifecycle from assignment through renewal, downgrade, suspension, and cancellation — complete with multi-currency pricing and promotional discount support.",
      lifecycleIntro: "Subscriptions move through a series of statuses during their lifecycle:",
      lifecycleTitle: "Status Lifecycle",
      operationsIntro:
        "The subscription module supports a comprehensive set of lifecycle operations. Each operation transitions the subscription to a new state with full audit tracking.",
      operationsTitle: "Subscription Operations",
      pricingIntro:
        "Each subscription carries full pricing metadata: Currency (ISO code), BaseAmount, AdjustmentAmount, TotalAmount, ExchangeRateToUsd, and TotalAmountUsd. This enables accurate revenue tracking across 9+ supported currencies (USD, EUR, GBP, SAR, AED, EGP, TRY, INR, and more).",
      pricingTitle: "Multi-Currency Pricing",
      promoExpiryIntro:
        "When a promotion with DurationDays > 0 is applied, the system calculates a PromotionExpiresAt timestamp. On each renewal, the handler checks if UtcNow > PromotionExpiresAt — if the promo has expired, the discount is stripped and NOT carried forward to the new subscription row. Null PromotionExpiresAt means the promotion lasts forever.",
      promoExpiryTitle: "Promotion Expiry Tracking (A1)",
      promotionsIntro:
        "Subscriptions support promo codes via the AppliedPromoCode field. When a valid promotion is applied, a PromotionDiscount percentage is recorded and the AdjustmentAmount reflects the discount applied to the BaseAmount. Promotions are tracked per-subscription for audit and analytics.",
      promotionsTitle: "Promotional Discounts",
      renewalAuditIntro:
        "Each billing cycle produces its own immutable database row with locked-in pricing at the time of renewal. This enables precise financial reporting: MRR trends, churn analysis by period, and refund tracking per cycle — never losing historical pricing data.",
      renewalAuditTitle: "Revenue Audit Trail",
      renewalIntro:
        "Renewals create a NEW TenantSubscription row instead of overwriting the existing record in-place (Stripe pattern). The old subscription is marked Expired (IsActive=false), while a new row is created with a fresh Id, StartDate=UtcNow, recalculated pricing, and carried-forward promotion details. This preserves a complete revenue audit trail per billing cycle.",
      renewalTitle: "Renewal — New Row Pattern (B2)",
      title: "Subscriptions",
      trialIntro:
        "Trial subscriptions have a TrialEndDate. When a trial is upgraded to a paid plan, IsTrialConverted is set to true and the subscription transitions to the new type. If the trial expires without conversion, ExpiryBehavior determines what happens next.",
      trialTitle: "Trial Conversion",
      typesIntro: "Each subscription has a type that determines its billing cycle and behavior:",
      typesTitle: "Subscription Types",
      upgradeIntro:
        "Tenants can move between editions. Upgrades apply immediately with the new edition's features taking effect right away. Downgrades check the OverflowPolicy first to handle resources that exceed new limits.",
      upgradeTitle: "Upgrade & Downgrade",
      validationIntro:
        "All 8 subscription commands have dedicated FluentValidation validators in SubscriptionCommandValidators.cs. Validators inject ILocalizer for localized error messages (EN + AR). Business rules include: cannot renew as Trial, cannot convert to Trial, positive refund amounts, string length limits, and required field checks. Validation runs in the AstraFlow mediator pipeline before the handler executes.",
      validationTitle: "Input Validation (G1)",
    },
  },
};
