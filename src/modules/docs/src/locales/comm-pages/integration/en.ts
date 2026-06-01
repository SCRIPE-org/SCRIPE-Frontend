/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  commercial: {
    restApiOverview: {
      authContent:
        "Every single controller is locked down by default. SCRIPE utilizes robust JWT token validation, requiring precise granular permissions and validated tenant claims before a single byte of JSON is returned.",
      authTitle: "Strict Cryptographic Authorization",
      controllersTitle: "Strict Controller Topography",
      description:
        "An immaculate, fully documented RESTful API surface area featuring dynamic filtering, cursor-based pagination, and rich HATEOAS responses.",
      intro:
        "The backend isn't just a database wrapper; it is a meticulously crafted HTTP surface. SCRIPE exposes a pristine RESTful API that adheres strictly to standard HTTP verbs, status codes, and hypermedia conventions.",
      paginationTitle: "Cursor & Offset Pagination",
      responseContent:
        "No more parsing random error strings. Every API response—whether successful or a catastrophic failure—is wrapped in our standardized `Result<T>` Problem Details structure, guaranteeing absolute predictability for frontend and third-party consumers.",
      responseTitle: "Standardized Predictable Payloads",
      swaggerContent:
        "We generate comprehensive, deeply annotated Swagger (OpenAPI 3.0) documentation directly from the C# source code at runtime. Developers can interactively test authenticated payloads directly from their browser the moment the system boots.",
      swaggerTitle: "Interactive OpenAPI Portals",
      title: "The RESTful Surface",
      tblCtrlHeader1: "Controller",
      tblCtrlHeader2: "Endpoints",
      tblCtrlHeader3: "Description",
      tblCtrlR1C1: "AuthController",
      tblCtrlR1C2: "8",
      tblCtrlR1C3: "Login, register, 2FA, password reset, sessions",
      tblCtrlR2C1: "UserController",
      tblCtrlR2C2: "27",
      tblCtrlR2C3: "CRUD, bulk ops, enterprise operations",
      tblCtrlR3C1: "RoleController",
      tblCtrlR3C2: "12",
      tblCtrlR3C3: "Role management, permission assignment",
      tblCtrlR4C1: "TenantController",
      tblCtrlR4C2: "10",
      tblCtrlR4C3: "Tenant lifecycle, settings, activation",
      tblCtrlR5C1: "AuditController",
      tblCtrlR5C2: "6",
      tblCtrlR5C3: "Audit log querying, export, streaming",
      tblCtrlR6C1: "NotificationController",
      tblCtrlR6C2: "5",
      tblCtrlR6C3: "Push notifications, mark read, preferences",
      tblCtrlR7C1: "FileController",
      tblCtrlR7C2: "4",
      tblCtrlR7C3: "Upload, download, delete, metadata",
      tblCtrlR8C1: "TemplateController",
      tblCtrlR8C2: "5",
      tblCtrlR8C3: "Email/message template CRUD, preview",
      tblCtrlR9C1: "MenuController",
      tblCtrlR9C2: "6",
      tblCtrlR9C3: "Dynamic menu management, overrides",
      tblCtrlR10C1: "SettingsController",
      tblCtrlR10C2: "4",
      tblCtrlR10C3: "System settings, tenant settings",
      tblCtrlR11C1: "DashboardController",
      tblCtrlR11C2: "3",
      tblCtrlR11C3: "KPI data, chart data, summaries",
      tblCtrlR12C1: "WebhookController",
      tblCtrlR12C2: "5",
      tblCtrlR12C3: "Subscription management, event catalog",
      tblCtrlR13C1: "RecycleBinController",
      tblCtrlR13C2: "4",
      tblCtrlR13C3: "Soft-deleted items, restore, purge",
      tblCtrlR14C1: "EditionsController",
      tblCtrlR14C2: "11",
      tblCtrlR14C3: "Edition CRUD, features, versioning, rollout",
      tblCtrlR15C1: "FeaturesController",
      tblCtrlR15C2: "5",
      tblCtrlR15C3: "Feature CRUD, value types, system features",
      tblCtrlR16C1: "SubscriptionsController",
      tblCtrlR16C2: "12",
      tblCtrlR16C3: "Assign, upgrade, downgrade, lifecycle, impact analysis",
      tblCtrlR17C1: "TenantFeaturesController",
      tblCtrlR17C2: "4",
      tblCtrlR17C3: "Per-tenant overrides, resolved features",
      lstSwagI1: "Auto-generated from controller attributes and XML documentation",
      lstSwagI2: "Try-it-out mode for testing endpoints directly",
      lstSwagI3: "JWT authentication support in the Swagger UI",
      lstSwagI4: "Request/response schema documentation with examples",
      lstSwagI5: "Grouped by controller for easy navigation",
      lstSwagI6: "Available at /swagger in development mode",
    },
    apiDesign: {
      conventionsTitle: "Enterprise Conventions",
      description:
        "Discover the rigorous RESTful API design principles, strictly enforced versioning, and predictable conventions that power SCRIPE.",
      errorTitle: "Standardized Error Handling",
      intro:
        "SCRIPE's API surface is designed for scale and predictability. From consistent naming conventions to standardized pagination and RFC 7807 problem details for error handling, our stateless RESTful architecture ensures friction-free integration for downstream consumers.",
      pipelineContent:
        "The API pipeline utilizes a highly optimized SCRIPE mediator request lifecycle. Every endpoint automatically inherits validation, performance tracking, caching, and audit logging before a single line of business logic executes.",
      pipelineTitle: "Robust Request Pipeline",
      resultContent:
        "SCRIPE eliminates try-catch hell through a unified Result pattern. Every API response is strictly typed and mathematically predictable, ensuring consumers receive standard HTTP status codes wrapping an identical JSON response structure regardless of the module being accessed.",
      resultTitle: "Predictable Result Pattern",
      statusCodesTitle: "Semantic Status Codes",
      swaggerContent:
        "Explore the live Swagger/OpenAPI 3.0 documentation to instantly interact with over 400 pre-configured endpoints. We generate strict OpenAPI specifications, enabling seamless SDK generation for frontend and mobile platforms.",
      swaggerTitle: "Interactive Swagger UI",
      title: "API Design & Architecture",
    },
    webhookIntegration: {
      description:
        "A massively resilient, asynchronous, event-driven Webhook dispatcher enabling secure, instantaneous data synchronization with immense external APIs.",
      eventsTitle: "Globally Broadcast Supported Events",
      intro:
        "Modern enterprise systems must communicate. Instead of forcing clients to aggressively poll your REST API, SCRIPE includes a native, massively efficient outbound Webhook dispatcher. Push critical domain events instantly to any external system securely over HTTPS.",
      logsTitle: "Forensic Dispatch Auditing",
      managementTitle: "Dynamic Subscription Management",
      retryContent:
        "If a subscriber's server goes offline, SCRIPE does not discard the payload. Utilizing an intelligent, exponentially backed-off persistent outbox pattern, it mathematically retries the request (e.g., 5 seconds, 1 minute, 1 hour, 1 day) until receipt is confirmed via an HTTP 2xx status.",
      retryTitle: "Exponential Persistent Backoff",
      securityContent:
        "Every outbound payload is securely signed using an HMAC-SHA256 signature generated from the tenant's secret key. Third-party integrations can definitively verify that the webhook originated from your SCRIPE servers and the payload was not intercepted or mutated globally.",
      securityTitle: "HMAC Cryptographic Signatures",
      title: "High-Volume Webhook Dispatch",
    },
    emailIntegration: {
      bilingual: "Bilingual Template Routing",
      bilingualDesc:
        "Automatically detect tenant locales and dispatch deeply personalized HTML emails in Arabic (RTL) or English (LTR) from strictly categorized templates.",
      configTitle: "Dynamic SMTP Configurations",
      description:
        "Asynchronous, queue-based transactional email delivery with rich customizable Scriban templating.",
      featuresTitle: "Enterprise Delivery Features",
      intro:
        "Transactional communications must never block an API request. SCRIPE includes an outbox-pattern, queue-based dispatch system leveraging background worker processes to guarantee hyper-fast, reliable email delivery via standard SMTP or direct REST APIs like SendGrid and Mailgun.",
      pipelineTitle: "The Transactional Pipeline",
      providersTitle: "Agnostic Transport Providers",
      queueBased: "Background Dispatches",
      queueBasedDesc:
        "APIs respond strictly under 50ms, while heavy string manipulations and external network calls are delegated to persistent background services.",
      retryLogic: "Exponential Backoff",
      retryLogicDesc:
        "Gracefully handle temporary network partitions or rate-limits from external providers with built-in, configurable resilient retry policies.",
      templatesContent:
        "Write logic immediately inside your email layouts. Using the blazing-fast Scriban templating language, you can execute conditional blocks, iterate over items, and perfectly format dates without leaking business logic into your application layer.",
      templatesTitle: "Intelligent Scriban Templating",
      title: "Resilient Email Infrastructure",
      tracking: "Audit & Delivery Tracking",
      trackingDesc:
        "Record the dispatch ID, exact timestamp, and provider response for every single email sent, creating an undeniable audit trail.",
    },
    messageTemplates: {
      bilingualContent:
        "Every template natively understands the context of the user. Send exactly the same transactional payload, and the engine evaluates the recipient's preferred locale, instantly generating beautifully formatted RTL Arabic or LTR English communications.",
      bilingualTitle: "Intelligent Contextual Rendering",
      builtInTitle: "Pre-Configured System Templates",
      description:
        "Turing-complete Scriban-powered dynamic template engine for localized emails, SMS, notifications, and PDF document generation.",
      engineContent:
        "Why recompile code to change an email subject line? SCRIPE utilizes Scriban—a blazing fast, Liquid-compatible templating language. It safely evaluates if/else logic, string manipulations, and data loops directly within the content, executing in under a millisecond.",
      engineTitle: "Turing-Complete Templating",
      intro:
        "Customer communications must be dynamic, deeply personalized, and instantly deployable. SCRIPE decouples communication markup from the underlying application logic using a highly secure, sandboxed templating engine.",
      managementTitle: "Centralized Template Hub",
      previewContent:
        "Developers and product owners can instantly iterate on template designs via the integrated live-preview interface. Inject mock JSON payloads to test complex logic loops and error handling without ever deploying code.",
      previewLive: "Real-Time Payload Injection",
      previewLiveDesc:
        "Visualize exact rendered outputs by feeding the sandbox dynamic data objects.",
      previewTitle: "Live Sandbox Environment",
      previewVariables: "Secure Model Binding",
      previewVariablesDesc:
        "Only explicitly allowed ViewModels can be accessed by the template, guaranteeing data security.",
      title: "Dynamic Message Templating",
    },
    ssoEnterprise: {
      title: "Enterprise SSO & Identity Federation",
      description:
        "SCRIPE serves as a standalone, enterprise-grade OIDC/OAuth2 Server—eliminating the need for external identity brokers like Keycloak or Auth0. It handles multi-provider Single Sign-On, tenant-scoped federated identity, PKCE security, and zero-code admin panel configuration for both Client and Server modes.",
      intro:
        "Eliminate password fatigue and centralize identity management completely. SCRIPE goes far beyond simple social logins. It is a full-fledged Identity and Access Management (IAM) engine. You can effortlessly federate external identity providers (like corporate Azure AD or Google Workspace) inward, while simultaneously registering third-party business applications outward to authenticate against SCRIPE's secure identity store. All of this is managed through a zero-code, highly intuitive Admin Panel.",
      valueTitle: "Strategic IAM Value",
      val1Title: "Zero-Trust Identity Protocol",
      val1Desc:
        "Every authentication flow is fortified with stringent PKCE (Proof Key for Code Exchange) validation. We enforce strict state-checking to thwart CSRF attacks and encrypt all latent client secrets at rest. Secret keys never touch the browser.",
      val2Title: "Zero-Code Federation (IdP)",
      val2Desc:
        "Employees and B2B clients sign in instantly with their existing corporate credentials. Connect Azure AD, Google Workspace, Okta, or AWS Cognito directly from the Admin Panel in exactly 30 seconds—no custom backend middleware required.",
      val3Title: "SCRIPE as the Identity Server",
      val3Desc:
        "Why pay for Auth0 or deploy Keycloak? Turn SCRIPE into your primary authentication broker. Register distinct OAuth applications (SPAs, Mobile Apps, external dashboards) to securely consume SCRIPE's JWTs.",
      val4Title: "Absolute Tenant IAM Isolation",
      val4Desc:
        "B2B SaaS superpower: Every single tenant can configure their own isolated SSO providers. Tenant A's Azure AD is mathematically invisible to Tenant B's Google Workspace. SuperAdmins can also provide Global SSO fallbacks.",
      val5Title: "White-Labeled Login Experience",
      val5Desc:
        "Every configured Identity Provider dynamically renders on the login screen with custom hex colors, branded labels, and distinct vectorized SVGs perfectly matching the tenant's brand identity.",
      val6Title: "Future-Proof Standardization",
      val6Desc:
        "SCRIPE relies entirely on the battle-tested OpenIddict framework for robust OIDC and OAuth 2.0 compliance, with planned architecture expansions into SAML 2.0 for legacy government system compliance.",
      protocolsTitle: "Supported Authentication Protocols",
      protocolsContent:
        "SCRIPE mandates adherence to immutable industry standards, ensuring frictionless topological compatibility with every major identity provider globally.",
      comparisonTitle: "How SCRIPE Compares",
      multiIdpTitle: "Infinite Multi-IdP Per Tenant",
      multiIdpContent:
        "Legacy platforms often bind identity to the root infrastructure, forcing all tenants to share an IdP, or requiring massively complex infrastructure scaling. SCRIPE natively supports infinite, uniquely mapped Identity Providers per tenant—all governed through the integrated Admin UI without touching the deployment pipeline.",
      brandingTitle: "Architected for Corporate Branding",
      brandingContent:
        "Deliver a seamless, uncompromising login aesthetic. Tenant administrators simply configure their external SSO within the UI, and the login interface autonomously generates flawlessly styled, tenant-bound SSO buttons ensuring user trust.",
      securityModelTitle: "PKCE Security Architecture",
      securityModelContent:
        "The deprecated Implicit Flow is eradicated. Every SSO login flows exclusively through PKCE (Proof Key for Code Exchange), the definitive standard dictated by OAuth 2.1. Authorization codes are strictly one-time-use, instantly exchanged server-side, with full discovery document caching.",
      oauthTitle: "OAuth Application Registry (SCRIPE as Server)",
      oauthContent:
        "Invert the identity paradigm. By registering third-party software as OAuth Applications within SCRIPE, you instantly transform your application into a centralized enterprise Identity Provider. Mobile applications, partner portals, and decoupled internal microservices can all aggressively rely on SCRIPE for unified identity resolution.",
      oauth1Title: "Confidential Clients (Backend)",
      oauth1Desc:
        "Server-side applications with secure backend storage for client secrets. Perfect for B2B API integrations enforcing the full Authorization Code flow with PKCE.",
      oauth2Title: "Public Clients (SPA & Mobile)",
      oauth2Desc:
        "React, Vue, iOS, and Android applications that cannot securely store static secrets. Strictly leverages the PKCE-only flow, ensuring access tokens are generated flawlessly without risking a compromised client secret.",
    },
  },
};
