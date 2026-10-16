/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  tutorials: {
    addModule: {
      title: "Add a Frontend Module",
      description:
        "Step-by-step guide to creating a new frontend module following SOLID View/ViewModel pattern.",
      intro:
        "This tutorial walks you through creating a complete frontend module from scratch, following the SOLID View/ViewModel pattern. You'll set up the module structure, create domain entities, build the data layer, implement ViewModels, and wire everything together.",
      prerequisitesTitle: "Prerequisites",
      stepsTitle: "Step-by-Step Guide",
      step1Title: "1. Create Module Structure",
      step1Desc:
        "Set up the standard module directory structure with domain, data, and presentation layers.",
      step2Title: "2. Define Domain Entity",
      step2Desc: "Create a Zod schema for your entity with validation rules.",
      step3Title: "3. Create Repository",
      step3Desc: "Implement the data layer with API calls and response mapping.",
      step4Title: "4. Set Up DI Container",
      step4Desc: "Register your repository in the module's dependency injection container.",
      step5Title: "5. Build ViewModel",
      step5Desc:
        "Create the main ViewModel that orchestrates CRUD operations using useCrudViewModel.",
      step6Title: "6. Create View",
      step6Desc: "Build the pure UI View component that consumes the ViewModel (max ~200 lines).",
      step7Title: "7. Add Route & Navigation",
      step7Desc: "Create the Next.js page connector and add navigation entries.",
      structureTitle: "Module Structure",
      entityTitle: "Domain Entity",
      repoTitle: "Repository",
      diTitle: "DI Container",
      viewModelTitle: "ViewModel",
      viewTitle: "View Component",
      routeTitle: "Route & Navigation",
      checklist:
        "Before submitting, verify:  Module follows SOLID pattern,  View is under 200 lines,  No cross-module imports,  Translations added to dictionaries,  Navigation entry added.",
    },
    addBackendModule: {
      title: "Add a Backend Module",
      description:
        "Step-by-step guide to creating a new backend module with Clean Architecture and CQRS.",
      intro:
        "This tutorial covers creating a complete backend module using Clean Architecture with CQRS. You'll define the entity, create commands and queries, implement the repository, register with DI, add the controller, and configure module registration.",
      prerequisitesTitle: "Prerequisites",
      stepsTitle: "Step-by-Step Guide",
      step1Title: "1. Create Project Structure",
      step1Desc:
        "Set up the module's class library projects following Clean Architecture layers (Domain, Application, Infrastructure, API).",
      step2Title: "2. Define Domain Entity",
      step2Desc: "Create the entity class inheriting from AuditableEntity with proper validation.",
      step3Title: "3. Create Commands",
      step3Desc:
        "Implement Create, Update, and Delete commands with FluentValidation and handlers.",
      step4Title: "4. Create Queries",
      step4Desc: "Implement GetById and GetPaged queries with response DTOs.",
      step5Title: "5. Implement Repository",
      step5Desc: "Create the EF Core repository with the generic repository base class.",
      step6Title: "6. Register with DI",
      step6Desc:
        "Configure dependency injection for the module's services, repositories, and SCRIPE request handlers.",
      step7Title: "7. Add Controller",
      step7Desc:
        "Create the API controller with RESTful endpoints, Swagger docs, and authorization attributes.",
      step8Title: "8. Module Registration",
      step8Desc:
        "Register the module in the gateway and add database migration for the new entity.",
      structureTitle: "Project Structure",
      entityTitle: "Domain Entity",
      commandTitle: "Commands & Handlers",
      diTitle: "Dependency Injection",
      controllerTitle: "API Controller",
      registerTitle: "Module Registration",
      migrationNote:
        "After creating your entity configuration, run 'scripe db add-migration AddYourEntity -m Inventory' to generate the database migration. Test with 'scripe db update -m Inventory' before committing.",
    },
    ujGettingStarted: {
      title: "Developer Setup to Enterprise Onboarding",
      description:
        "Complete walkthrough from running SCRIPE CLI and developer tools to first tenant configuration and corporate branding.",
      intro:
        "Welcome to SCRIPE's developer-to-production journey. This tutorial walks you through setting up your local environment, inspecting OpenAPI definitions, booting the platform, and configuring your first tenant.",
      infoTitle: "Enterprise Developer Stack",
      infoContent:
        "All SCRIPE services adhere to strict multi-tenancy, zero-trust authorization, and append-only auditing out of the box.",
      step1Title: "Step 1: Developer CLI & Local Platform Boot",
      step1Desc:
        "Initialize local infrastructure with Docker, seed initial tenant records, and start frontend and backend services.",
      step2Title: "Step 2: Exploring Swagger, API Playground & CLI Tools",
      step2Desc:
        "Leverage developer utilities including Swagger documentation, OpenAPI schemas, and health check endpoints.",
      toolCli: "Developer CLI",
      toolCliDesc: "Rich command-line tool for migrations, seeding, and tenant inspection.",
      toolSwagger: "Swagger UI",
      toolSwaggerDesc: "Interactive OpenAPI 3.0 documentation for all REST endpoints.",
      toolHealth: "Health Checks",
      toolHealthDesc: "Deep liveness and readiness probes across PostgreSQL, Redis, and RabbitMQ.",
      step3Title: "Step 3: First Super-Admin Login & MFA Setup",
      step3Desc:
        "Authenticate with the default super-admin credentials and configure mandatory multi-factor authentication.",
      mfaNoticeTitle: "Security Requirement",
      mfaNoticeContent:
        "Super-admin accounts require TOTP hardware or authenticator app registration before accessing tenant settings.",
      stepEditionsTitle: "Prerequisite: Create Commercial Editions & Feature Matrix",
      stepEditionsDesc:
        "Before provisioning any tenant, the Entitlements module requires at least one Edition definition. An Edition establishes the contractual feature flags, quota clamps, and billing prices that govern tenant capabilities. A tenant cannot exist without an Edition reference.",
      step4Title: "Step 4: Provisioning Your First Organization & Tenant",
      step4Desc:
        "Create your root tenant, configure slug routing, set custom domains, and establish tenant isolation boundaries.",
      step5Title: "Step 5: Customizing Themes, Portal Branding & Login Builder",
      step5Desc:
        "Apply corporate logos, color palettes, custom CSS tokens, and configure custom login layouts using the built-in builder.",

      stepOrgCoreTitle: "Step 5: Establishing the 5-Tier Organizational Hierarchy",
      stepOrgCoreDesc:
        "Structure the tenant's operational governance into Organization, Business Units, Departments, Cost Centers, and Teams using the Organization Core module.",
      step6Title: "Step 6: Visual Branding & Studio Login Customization",
      step6Desc:
        "Apply corporate logos, custom color tokens, and publish customized login page layouts via the built-in Studio Theme Builder.",
    },
    ujVenueBooking: {
      title: "Venue Hierarchy & Concurrent Booking",
      description:
        "End-to-end journey configuring physical sports facilities, schedulable resources, operating schedules, and 2-phase booking holds.",
      intro:
        "Learn how to set up multi-site facilities, manage schedulable resources, define blackout windows, and process high-concurrency bookings.",
      infoTitle: "Concurrency Control",
      infoContent:
        "SCRIPE's 2-phase hold engine prevents race conditions and double bookings through distributed Redis mutex locks.",
      step1Title: "Step 1: Structuring Multi-Campus Facilities",
      step1Desc:
        "Define geographic sites, buildings, and athletic zones with geo-coordinates and amenity tags.",
      step2Title: "Step 2: Creating Schedulable Resources & Hierarchies",
      step2Desc:
        "Configure pitches, courts, and equipment as atomic or composite schedulable assets with capacity limits.",
      step3Title: "Step 3: Configuring Operating Hours & Blackout Windows",
      step3Desc:
        "Set weekly recurring schedules, holiday exceptions, and maintenance closure intervals.",
      step4Title: "Step 4: The 2-Phase Concurrency Hold Engine",
      step4Desc:
        "Acquire atomic 15-minute reservations during checkout, ensuring instant lock acquisition with automatic TTL expiration.",
      step5Title: "Step 5: Operations Calendar & Reservation 360",
      step5Desc:
        "Manage the dispatch grid, review reservation lifecycles, and handle operational alterations.",
    },
    ujPricingFinance: {
      title: "Dynamic Pricing & Double-Entry Accounting",
      description:
        "User journey configuring rate cards, peak-hour surcharges, cryptographic quotes, and balanced ledger settlements.",
      intro:
        "Connect your catalog items to dynamic pricing algorithms, generate tamper-proof quotes, and settle balances in a double-entry ledger.",
      infoTitle: "Financial Integrity",
      infoContent:
        "Invariable debits-equal-credits balancing ensures total auditing compliance across all financial transactions.",
      step1Title: "Step 1: Creating Rate Cards & Multi-Currency Price Books",
      step1Desc:
        "Define base hourly rates, currency books, and tier structures for all bookable resources and services.",
      step2Title: "Step 2: Dynamic Rules & Peak-Hour Surcharges",
      step2Desc:
        "Apply conditional pricing rules based on time of day, customer tier, advance booking window, and seasonal demand.",
      step3Title: "Step 3: Cryptographic Price Quotes & Checkouts",
      step3Desc:
        "Generate HMAC-SHA256 signed price quotes that lock down rates during customer checkout to prevent price tampering.",
      step4Title: "Step 4: Double-Entry Ledger & Chart of Accounts",
      step4Desc:
        "Post transactional debits and credits into segregated general ledger accounts with automated balancing checks.",
      step5Title: "Step 5: Invoicing, Payments & Multi-Party Settlements",
      step5Desc:
        "Generate compliant VAT invoices, collect payment gateway receipts, and execute automated partner splits.",
    },
    ujWorkforceCrm: {
      title: "Workforce Rostering & Customer 360",
      description:
        "Guide to managing staff competencies, shift scheduling, customer relationship graphs, and deduplication.",
      intro:
        "Master human resource allocation and customer relationship management across all branches of your enterprise.",
      infoTitle: "Unified Identity",
      infoContent:
        "Polymorphic party architecture allows entities to act simultaneously as customers, coaches, or corporate contacts.",
      step1Title: "Step 1: Building the Staff Directory & Competencies",
      step1Desc:
        "Onboard staff members, track certifications, assign roles, and record coaching credentials.",
      step2Title: "Step 2: Roster Scheduling & Availability Matrices",
      step2Desc:
        "Create recurring shift templates, manage time-off requests, and prevent over-allocation.",
      step3Title: "Step 3: Customer 360 & Polymorphic Parties",
      step3Desc:
        "Consolidate person profiles, company accounts, communication logs, and booking histories into a single view.",
      step4Title: "Step 4: Relationship Graphs & Account Hierarchies",
      step4Desc:
        "Model complex parent-child, corporate sponsor, and family guardian relationships between parties.",
      step5Title: "Step 5: Automated Deduplication & Merging",
      step5Desc:
        "Detect duplicate customer profiles using phonetic fuzzy matching and safely merge histories without data loss.",
    },
    ujCustomFieldsPlugins: {
      title: "Extending SCRIPE: Custom Fields & Marketplace Plugins",
      description:
        "Walkthrough extending entity schemas with custom fields and installing sandboxed marketplace plugins.",
      intro:
        "Customize your platform without modifying backend code by using EAV custom fields and installing third-party marketplace plugins.",
      infoTitle: "Zero-Downtime Extensibility",
      infoContent:
        "Custom field changes take effect immediately across UI and API without requiring database migrations.",
      step1Title: "Step 1: Defining Custom Field Groups & Data Types",
      step1Desc:
        "Attach custom text, numeric, date, or lookup fields to core platform entities like reservations and parties.",
      step2Title: "Step 2: Field Validation & AES-256 Encryption",
      step2Desc:
        "Configure regex pattern matching, required flags, and secure sensitive fields with field-level encryption.",
      step3Title: "Step 3: Discovering & Installing Marketplace Plugins",
      step3Desc:
        "Browse the plugin directory, review security permissions, and install extensions in a single click.",
      step4Title: "Step 4: Webhook Integration & Event Subscriptions",
      step4Desc:
        "Connect external applications by subscribing to real-time webhook events with HMAC signature verification.",
    },
    ujComplianceGovernance: {
      title: "Enterprise Governance, Compliance & Analytics",
      description:
        "Journey covering real-time security alerts, tamper-evident audit logs, GDPR data subject rights, and BI dashboards.",
      intro:
        "Ensure strict compliance with global privacy regulations, monitor system access, and generate executive business intelligence reports.",
      infoTitle: "Regulatory Readiness",
      infoContent:
        "Automated retention rules and cryptographic audit trails help maintain continuous SOC2, ISO 27001, and GDPR readiness.",
      step1Title: "Step 1: Real-Time Security Monitoring & Alerts",
      step1Desc:
        "Configure alerts for suspicious logins, privilege escalations, and unusual data access patterns.",
      step2Title: "Step 2: Tamper-Evident Audit Trails & Forensics",
      step2Desc:
        "Search immutable activity logs capturing user identity, IP address, timestamp, and full diff of altered data.",
      step3Title: "Step 3: Executing GDPR Data Subject Requests (DSR)",
      step3Desc:
        "Process automated user data exports, consent revocations, and cryptographic right-to-be-forgotten erasures.",
      step4Title: "Step 4: Executive BI Dashboards & Operational Metrics",
      step4Desc:
        "Visualize venue utilization rates, financial revenue velocity, and staff productivity metrics in real-time.",
    },
  },
};
