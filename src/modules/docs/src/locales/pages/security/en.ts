/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  security: {
    overview: {
      title: "Security Overview",
      description:
        "5-layer defense strategy, security features, CORS configuration, rate limiting, and password policies.",
      intro:
        "NEXORA implements a defense-in-depth security strategy with five layers: network protection, authentication, authorization, data isolation, and audit logging. Every request passes through multiple security checks before reaching business logic.",
      layersTitle: "Security Defense Layers",
      featuresTitle: "Security Features",
      featureJwt: "JWT Authentication",
      featureJwtDesc:
        "Short-lived access tokens (15 min) with automatic refresh. HMAC-SHA256 signing with configurable secret.",
      feature2fa: "Two-Factor Auth",
      feature2faDesc:
        "TOTP-based 2FA with QR code setup. Optional per-user, enforceable per-tenant or globally.",
      featureRbac: "RBAC Permissions",
      featureRbacDesc:
        "A complete PBAC enforcement engine executing Role-Based (RBAC), Group-Based (GBAC), and Attribute/Field-Based (ABAC) rules instantly via zero-latency server-side JWT caching.",
      featureRateLimit: "Rate Limiting",
      featureRateLimitDesc:
        "4-tier rate limiting: global DDoS, per-IP, per-endpoint, and authentication-specific.",
      featureAudit: "Audit Logging",
      featureAuditDesc:
        "Every action logged with who, what, when, where. Real-time SignalR broadcasting.",
      featureCors: "CORS Configuration",
      featureCorsDesc:
        "Strict origin validation in production. Open CORS for localhost in development.",
      corsTitle: "CORS Configuration",
      corsIntro:
        "CORS policies differ between development and production environments. In development, all localhost origins are allowed. In production, only explicitly configured origins are accepted.",
      rateLimitTitle: "Rate Limiting Policies",
      passwordTitle: "Password Policies",
      securityWarning:
        "Always review security settings before deploying to production. Change default secrets, configure CORS origins, and set appropriate rate limits. Enable 2FA for all admin accounts.",
    },
    authDeep: {
      title: "Authentication Deep Dive",
      description:
        "JWT lifecycle, BCrypt hashing, account lockout, 2FA TOTP, external OAuth, OTP system, impersonation, and session management.",
      intro:
        "This page dives deep into every authentication mechanism in NEXORA  from JWT token issuance and refresh rotation, through BCrypt password hashing and account lockout, to TOTP-based two-factor authentication, external OAuth providers, OTP codes, admin impersonation, and session management.",
      jwtLifecycleTitle: "JWT Token Lifecycle",
      jwtLifecycleIntro:
        "Access tokens are short-lived (15 minutes) JWT tokens signed with HMAC-SHA256. When an access token expires, the client uses the refresh token to obtain a new token pair. Refresh tokens are single-use and rotated on every use.",
      tokenStructureTitle: "JWT Token Structure",
      bcryptTitle: "BCrypt Password Hashing",
      bcryptIntro:
        "Passwords are hashed using BCrypt with a configurable work factor (default: 12). BCrypt is intentionally slow to resist brute-force attacks  each hash takes ~250ms, making mass password cracking impractical.",
      lockoutTitle: "Account Lockout",
      lockoutIntro:
        "After 5 consecutive failed login attempts, the account is locked for 5 minutes. The counter resets on successful login. Admins can manually unlock accounts via the admin panel.",
      tfaTitle: "Two-Factor Authentication (TOTP)",
      tfaIntro:
        "NEXORA supports TOTP-based 2FA compatible with Google Authenticator, Authy, and Microsoft Authenticator. When enabled, users must enter a 6-digit time-based code after password verification.",
      externalAuthTitle: "External Authentication (OAuth)",
      externalAuthIntro:
        "NEXORA integrates with Google, Facebook, Apple, and Microsoft OAuth providers. External tokens are validated server-side before creating or linking local accounts.",
      otpTitle: "OTP System (One-Time Passwords)",
      otpIntro:
        "OTP codes are used for email verification, phone verification, and password reset flows. Codes are 6-digit, cryptographically random, stored as BCrypt hashes, and expire after 15 minutes with a maximum of 3 verification attempts.",
      impersonationTitle: "Admin Impersonation",
      impersonationIntro:
        "SuperAdmins can impersonate other admins to troubleshoot issues. An impersonation token carries the target admin's claims plus an impersonator_id claim. All actions during impersonation are audited with the original admin's identity.",
      impersonationWarning:
        "Impersonation is a privileged operation. The impersonator must be a SuperAdmin, cannot impersonate protected admins or admins with equal/higher roles, and all actions are logged with the impersonator's identity for accountability.",
      sessionTitle: "Session Management",
      sessionIntro:
        "NEXORA uses a stateless JWT-based session model. Access tokens are held in client memory (never localStorage), refresh tokens are stored as HttpOnly secure cookies or in the database, and 2FA session tokens are temporary in-memory tokens valid for 5 minutes.",
      cookieAuthTip:
        "For maximum security, configure refresh tokens to be sent as HttpOnly, Secure, SameSite=Strict cookies. This prevents XSS attacks from accessing refresh tokens via JavaScript.",
    },
    dataProtection: {
      title: "Data Protection",
      description:
        "Tenant isolation, data encryption at rest and in transit, restricted fields, ID encryption, and GDPR compliance.",
      intro:
        "NEXORA protects data at every layer  from network encryption (TLS 1.2+) and database encryption (TDE), through row-level tenant isolation and field-level access control, to GDPR-compliant data portability and right-to-delete mechanisms.",
      tenantIsolationTitle: "Tenant Data Isolation",
      tenantIsolationIntro:
        "Every query is automatically scoped to the current tenant via EF Core global query filters. The ITenantAwareEntity interface marks entities that must be tenant-scoped, and the TenantContextMiddleware extracts the tenant ID from the JWT token.",
      tenantScopingTitle: "Query Filter Scoping",
      tenantServicesTitle: "Tenant-Aware Services",
      tenantServicesIntro:
        "Services that need to access tenant-specific data inject IDataScopeService to get the current tenant ID. This service reads the tenant_id claim from the JWT token and makes it available throughout the request pipeline.",
      dataAtRestTitle: "Data at Rest Encryption",
      dataAtRestIntro:
        "Database-level Transparent Data Encryption (TDE) encrypts data files. Application-level encryption using ASP.NET Core Data Protection API secures sensitive fields like HMAC secrets and backup codes.",
      dataInTransitTitle: "Data in Transit Encryption",
      dataInTransitIntro:
        "All communication uses TLS 1.2 or higher. HSTS headers enforce HTTPS in production. Internal service communication between YARP gateway and backend modules also uses TLS.",
      restrictedFieldsTitle: "Restricted Fields (Field-Level Security)",
      restrictedFieldsIntro:
        "Roles can restrict access to specific entity fields. When a role has restricted fields configured, the FieldProjectionMiddleware automatically removes those fields from API responses, preventing unauthorized data exposure.",
      idEncryptionTitle: "ID Encryption",
      idEncryptionIntro:
        "NEXORA can encrypt Guid entity IDs in API responses using AES-256. This prevents enumeration attacks and hides internal database identifiers from external consumers.",
      gdprTitle: "GDPR Compliance",
      gdprIntro:
        "NEXORA provides mechanisms for GDPR compliance including data portability (export user data as JSON), right to delete (anonymize or purge user data), consent tracking, and configurable data retention policies.",
      rightToDeleteTitle: "Right to Delete",
      dataPortabilityTitle: "Data Portability",
      consentTitle: "Consent Management",
      retentionTitle: "Data Retention Policies",
      auditTrailTitle: "Audit Trail for Compliance",
      bypassWarning:
        "IgnoreQueryFilters() bypasses ALL global query filters including tenant isolation. Always add explicit tenant filtering when using this method to prevent cross-tenant data leaks.",
    },
    apiSecurity: {
      title: "API Security",
      description:
        "Rate limiting, CORS configuration, input validation, CSRF protection, security headers, and replay attack prevention.",
      intro:
        "NEXORA applies multiple layers of API security: rate limiting prevents abuse, CORS restricts cross-origin access, input validation rejects malformed data, security headers protect against common web attacks, and anti-replay mechanisms prevent request replay attacks.",
      rateLimitTitle: "Rate Limiting",
      rateLimitIntro:
        "NEXORA implements 4-tier rate limiting using ASP.NET Core's built-in rate limiter: global DDoS protection, per-IP limits, per-endpoint limits, and authentication-specific limits for login and token refresh.",
      corsTitle: "CORS Configuration",
      corsIntro:
        "Cross-Origin Resource Sharing policies differ between environments. Development allows all localhost origins. Production requires explicitly configured allowed origins, methods, and headers.",
      inputValidationTitle: "Input Validation",
      inputValidationIntro:
        "All incoming requests are validated through FluentValidation at the MediatR pipeline level. The ValidationBehavior runs before the command handler and returns structured validation errors with field-level messages.",
      csrfTitle: "CSRF Protection",
      csrfIntro:
        "NEXORA uses the SameSite cookie attribute and anti-forgery tokens to prevent Cross-Site Request Forgery attacks. API endpoints rely on Bearer token authentication which is inherently CSRF-resistant.",
      headersTitle: "Security Headers",
      headersIntro:
        "Production responses include security headers: X-Content-Type-Options (nosniff), X-Frame-Options (DENY), X-XSS-Protection, Referrer-Policy, and Content-Security-Policy.",
      headersTip:
        "Test your security headers using securityheaders.com. NEXORA's default configuration scores A+ when properly configured.",
      replayTitle: "Replay Attack Prevention",
      replayIntro:
        "Short-lived access tokens (15 minutes), single-use refresh tokens with rotation, and TOTP time-step validation prevent replay attacks across all authentication flows.",
    },
    middlewarePipeline: {
      title: "Middleware Pipeline",
      description:
        "11 middleware components in execution order  from exception handling through tenant context to field projection.",
      intro:
        "NEXORA's HTTP request pipeline consists of 11 middleware components executed in a specific order. Each middleware has a single responsibility and can short-circuit the pipeline on failure. Understanding the order is critical for debugging and extending the system.",
      overviewTitle: "Pipeline Overview",
      overviewIntro:
        "Requests flow through the middleware pipeline from top to bottom. Each middleware can process the request, modify it, or short-circuit by returning a response directly. The order matters  tenant context must be established before any tenant-scoped operation.",
      globalExceptionTitle: "1. Global Exception Handler",
      globalExceptionIntro:
        "Catches all unhandled exceptions and returns structured JSON error responses. In development, includes stack traces. In production, returns generic error messages to prevent information leakage.",
      correlationIdTitle: "2. Correlation ID",
      correlationIdIntro:
        "Generates or reads an X-Correlation-ID header for distributed tracing. The same ID is attached to all log entries, audit records, and downstream API calls for the request.",
      requestLoggingTitle: "3. Request Logging",
      requestLoggingIntro:
        "Logs request metadata (method, path, status, duration) with Serilog structured logging. Sensitive paths (login, password) have their body masked to prevent credential leakage in logs.",
      cookieAuthTitle: "4. Cookie-to-Bearer Conversion",
      cookieAuthIntro:
        "Reads the access_token cookie and injects it as a Bearer token in the Authorization header. This allows the frontend to use HttpOnly cookies while maintaining JWT-based authentication.",
      tenantContextTitle: "5. Tenant Context",
      tenantContextIntro:
        "Extracts the tenant_id claim from the JWT token and sets the current tenant in IDataScopeService. All subsequent database queries are automatically scoped to this tenant via EF Core global query filters.",
      tenantContextNote:
        "The Tenant Context middleware must run AFTER authentication but BEFORE any database access. If a request has no tenant claim (e.g., SuperAdmin without tenant), the middleware allows tenant-less operations for global endpoints.",
      cacheHeadersTitle: "6. Cache Headers",
      cacheHeadersIntro:
        "Sets appropriate Cache-Control headers based on response type. API responses use no-cache, no-store. Static files use max-age with ETag validation. Uploaded files use tenant-specific cache keys.",
      fieldProjectionTitle: "7. Field Projection",
      fieldProjectionIntro:
        "Removes restricted fields from JSON responses based on the current user's role permissions. Uses the restrictedFields configuration to filter out sensitive properties before the response is sent to the client.",
      observabilityTitle: "Observability Middleware",
      observabilityIntro:
        "Collects request metrics (duration, status codes, error rates) and exposes them via a /metrics endpoint for Prometheus scraping. Includes distributed tracing with OpenTelemetry integration.",
      registrationTitle: "Middleware Registration Order",
      registrationIntro:
        "The middleware registration order in Program.cs determines execution order. Changing the order can break functionality  for example, registering TenantContext before Authentication would fail because the JWT hasn't been validated yet.",
      summaryTitle: "Middleware Summary",
      orderWarning:
        "Changing middleware registration order can cause cascading failures. Always test the full request pipeline after modifying middleware order.",
    },
    auditCompliance: {
      title: "Audit & Compliance",
      description:
        "Complete audit pipeline  interceptors, entity tracking, SignalR streaming, CSV/Excel/PDF export, and compliance features.",
      intro:
        "NEXORA provides a comprehensive audit system that tracks every data modification, API request, and security event. Audit logs are automatically generated by EF Core interceptors, streamed in real-time via SignalR, and exportable in CSV, Excel, and PDF formats.",
      architectureTitle: "Audit Architecture",
      architectureIntro:
        "The audit system consists of three layers: the AuditableEntityInterceptor captures entity changes during SaveChanges, the AuditBehavior in the MediatR pipeline logs command execution, and the RequestLoggingMiddleware records HTTP request metadata.",
      interceptorTitle: "Entity Change Interceptor",
      interceptorIntro:
        "The AuditableEntityInterceptor hooks into EF Core's SaveChangesAsync pipeline. For every Added, Modified, or Deleted entity, it captures the old and new values as JSON, the user who made the change, and the timestamp.",
      auditLogEntityTitle: "AuditLog Entity Structure",
      signalrTitle: "Real-Time SignalR Streaming",
      signalrIntro:
        "Audit logs are broadcast in real-time via the AuditHub SignalR hub. Connected admin clients receive instant notifications when any data changes occur, enabling live monitoring dashboards.",
      exportTitle: "Export Capabilities",
      exportIntro:
        "Audit logs can be exported in three formats: CSV for data analysis, Excel for business reporting, and PDF for compliance documentation. Exports support date range filtering, user filtering, and entity type filtering.",
      queryApiTitle: "Query & Export API",
      queryApiIntro:
        "The audit API provides search, filter, and export capabilities for audit logs. All endpoints require admin authentication and the audit.view or audit.export permission.",
      querySearchDesc: "Search and filter audit logs with pagination",
      queryExportCsvDesc: "Export audit logs as CSV file",
      queryExportExcelDesc: "Export audit logs as Excel spreadsheet",
      queryExportPdfDesc: "Export audit logs as PDF document",
      complianceTitle: "Compliance Features",
      immutableTitle: "Immutable Logs",
      fullTraceTitle: "Full Trace",
      searchableTitle: "Searchable",
      tenantScopedTitle: "Tenant Scoped",
      realtimeTitle: "Real-Time",
      retentionTitle: "Retention Policy",
    },
    sso: {
      title: "SSO & Identity Providers",
      description:
        "OIDC/OAuth2 SSO architecture, PKCE flow, identity provider model, external login linking, OAuth applications, claim mapping, and full API reference.",
      intro:
        "NEXORA supports Single Sign-On (SSO) via external OIDC identity providers. This page covers the complete SSO architecture: PKCE authorization code flow, the identity provider entity model, external login linking, OAuth application registration, claim mapping, tenant scoping, and all API endpoints.",
      howItWorksTitle: "How SSO Works",
      howItWorksContent:
        "NEXORA uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      step1Title: "1. Provider Discovery",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step2Title: "2. PKCE Challenge",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step3Title: "3. IdP Redirect",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step4Title: "4. User Authentication",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step5Title: "5. Callback & Token Exchange",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      pkceTitle: "PKCE Security Model",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      entityModelTitle: "Identity Provider Entity",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      linkingTitle: "External Login Linking",
      linkingContent:
        "Before SSO login works, a NEXORA admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the NEXORA account.",
      oauthAppsTitle: "OAuth Applications",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against NEXORA as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      claimMappingTitle: "Claim Mapping",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to NEXORA's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      tenantScopingTitle: "Tenant Scoping",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      apiTitle: "API Endpoints",
    },
  },
};
