export const en = {
  security: {
    apiSecurity: {
      overviewTitle: "Overview",
      overview:
        "API endpoints support API key authentication (via header or query key) alongside cookie and bearer token JWT validation. Mutating requests enforce double-submit CSRF checks and cryptographic replay protection nonces tracked on every request.",
      architectureTitle: "Architecture & Integration",
      architectureDesc:
        "Designed following domain-driven design (DDD) and Clean Architecture principles, ensuring clear boundaries, high scalability, and loose coupling across backend and frontend layers.",
      dataTitle: "Data & Schema Model",
      dataDesc:
        "Includes EF Core entity configurations, AuditableEntity tracking fields, unique constraints, and automatic database provider switching support (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Governance & Security",
      governanceDesc:
        "Adheres strictly to multi-tenant isolation gates, field-level security checks, and detailed operational audit trail logging.",
      verificationTitle: "Verification & Validation",
      verificationDesc:
        "Fully verified through unit/integration tests and automated frontend check gates. Run the 'scripe check' command to verify compilation, lint rules, and tests.",
      sourceMapTitle: "Source Code Map",
      sourceMapIntro:
        "The following source files contain the primary implementation details of this feature in the codebase:",
      operatingModelTitle: "Operating Model",
      operatingModel:
        "Executes via AstraFlow CQRS handlers and middleware pipeline behaviors. Leverages distributed locking for high concurrency and transaction safety.",
      localizationNoteTitle: "Localization & i18n",
      localizationNote:
        "Localized eagerly in 7 languages (EN, AR, FR, RU, ZH, ES, DE) with zero-flash rendering and full RTL layout support.",
      title: "Api Security",
    },
    auditCompliance: {
      overviewTitle: "Overview",
      overview:
        "The Audit Compliance is a core component of the SCRIPE platform, providing essential management, business rules, and orchestration logic for this feature area.",
      architectureTitle: "Architecture & Integration",
      architectureDesc:
        "Designed following domain-driven design (DDD) and Clean Architecture principles, ensuring clear boundaries, high scalability, and loose coupling across backend and frontend layers.",
      dataTitle: "Data & Schema Model",
      dataDesc:
        "Includes EF Core entity configurations, AuditableEntity tracking fields, unique constraints, and automatic database provider switching support (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Governance & Security",
      governanceDesc:
        "Adheres strictly to multi-tenant isolation gates, field-level security checks, and detailed operational audit trail logging.",
      verificationTitle: "Verification & Validation",
      verificationDesc:
        "Fully verified through unit/integration tests and automated frontend check gates. Run the 'scripe check' command to verify compilation, lint rules, and tests.",
      sourceMapTitle: "Source Code Map",
      sourceMapIntro:
        "The following source files contain the primary implementation details of this feature in the codebase:",
      operatingModelTitle: "Operating Model",
      operatingModel:
        "Executes via AstraFlow CQRS handlers and middleware pipeline behaviors. Leverages distributed locking for high concurrency and transaction safety.",
      localizationNoteTitle: "Localization & i18n",
      localizationNote:
        "Localized eagerly in 7 languages (EN, AR, FR, RU, ZH, ES, DE) with zero-flash rendering and full RTL layout support.",
      title: "Audit Compliance",
    },
    authDeep: {
      overviewTitle: "Overview",
      overview:
        "Administrative authentication enforces multi-factor login policies via 2FA OTP codes, passwordless WebAuthn Passkeys, and secure mobile QR code session validation. Failed logins trigger lockouts after 5 attempts, rate-limited to 10 requests per 5 minutes.",
      architectureTitle: "Architecture & Integration",
      architectureDesc:
        "Designed following domain-driven design (DDD) and Clean Architecture principles, ensuring clear boundaries, high scalability, and loose coupling across backend and frontend layers.",
      dataTitle: "Data & Schema Model",
      dataDesc:
        "Includes EF Core entity configurations, AuditableEntity tracking fields, unique constraints, and automatic database provider switching support (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Governance & Security",
      governanceDesc:
        "Adheres strictly to multi-tenant isolation gates, field-level security checks, and detailed operational audit trail logging.",
      verificationTitle: "Verification & Validation",
      verificationDesc:
        "Fully verified through unit/integration tests and automated frontend check gates. Run the 'scripe check' command to verify compilation, lint rules, and tests.",
      sourceMapTitle: "Source Code Map",
      sourceMapIntro:
        "The following source files contain the primary implementation details of this feature in the codebase:",
      operatingModelTitle: "Operating Model",
      operatingModel:
        "Executes via AstraFlow CQRS handlers and middleware pipeline behaviors. Leverages distributed locking for high concurrency and transaction safety.",
      localizationNoteTitle: "Localization & i18n",
      localizationNote:
        "Localized eagerly in 7 languages (EN, AR, FR, RU, ZH, ES, DE) with zero-flash rendering and full RTL layout support.",
      title: "Auth Deep",
    },
    dataProtection: {
      overviewTitle: "Overview",
      overview:
        "Local blob storage systems validate absolute paths using SafeResolvePath checking, enforcing strict folder boundaries and throwing an InvalidOperationException if paths traverse outside base storage directories.",
      architectureTitle: "Architecture & Integration",
      architectureDesc:
        "Designed following domain-driven design (DDD) and Clean Architecture principles, ensuring clear boundaries, high scalability, and loose coupling across backend and frontend layers.",
      dataTitle: "Data & Schema Model",
      dataDesc:
        "Includes EF Core entity configurations, AuditableEntity tracking fields, unique constraints, and automatic database provider switching support (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Governance & Security",
      governanceDesc:
        "Adheres strictly to multi-tenant isolation gates, field-level security checks, and detailed operational audit trail logging.",
      verificationTitle: "Verification & Validation",
      verificationDesc:
        "Fully verified through unit/integration tests and automated frontend check gates. Run the 'scripe check' command to verify compilation, lint rules, and tests.",
      sourceMapTitle: "Source Code Map",
      sourceMapIntro:
        "The following source files contain the primary implementation details of this feature in the codebase:",
      operatingModelTitle: "Operating Model",
      operatingModel:
        "Executes via AstraFlow CQRS handlers and middleware pipeline behaviors. Leverages distributed locking for high concurrency and transaction safety.",
      localizationNoteTitle: "Localization & i18n",
      localizationNote:
        "Localized eagerly in 7 languages (EN, AR, FR, RU, ZH, ES, DE) with zero-flash rendering and full RTL layout support.",
      title: "Data Protection",
    },
    middlewarePipeline: {
      overviewTitle: "Overview",
      overview:
        "Requests flow through a rigid AstraFlow MediatR pipeline: LoggingBehavior -> UnhandledExceptionBehavior -> ValidationBehavior -> AuthorizationBehavior -> FeatureCheckBehavior -> WebhookDispatchBehavior -> CachingBehavior. Caching short-circuits execution on hits.",
      architectureTitle: "Architecture & Integration",
      architectureDesc:
        "Designed following domain-driven design (DDD) and Clean Architecture principles, ensuring clear boundaries, high scalability, and loose coupling across backend and frontend layers.",
      dataTitle: "Data & Schema Model",
      dataDesc:
        "Includes EF Core entity configurations, AuditableEntity tracking fields, unique constraints, and automatic database provider switching support (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Governance & Security",
      governanceDesc:
        "Adheres strictly to multi-tenant isolation gates, field-level security checks, and detailed operational audit trail logging.",
      verificationTitle: "Verification & Validation",
      verificationDesc:
        "Fully verified through unit/integration tests and automated frontend check gates. Run the 'scripe check' command to verify compilation, lint rules, and tests.",
      sourceMapTitle: "Source Code Map",
      sourceMapIntro:
        "The following source files contain the primary implementation details of this feature in the codebase:",
      operatingModelTitle: "Operating Model",
      operatingModel:
        "Executes via AstraFlow CQRS handlers and middleware pipeline behaviors. Leverages distributed locking for high concurrency and transaction safety.",
      localizationNoteTitle: "Localization & i18n",
      localizationNote:
        "Localized eagerly in 7 languages (EN, AR, FR, RU, ZH, ES, DE) with zero-flash rendering and full RTL layout support.",
      title: "Middleware Pipeline",
    },
    overview: {
      overviewTitle: "Overview",
      overview:
        "The Overview is a core component of the SCRIPE platform, providing essential management, business rules, and orchestration logic for this feature area.",
      architectureTitle: "Architecture & Integration",
      architectureDesc:
        "Designed following domain-driven design (DDD) and Clean Architecture principles, ensuring clear boundaries, high scalability, and loose coupling across backend and frontend layers.",
      dataTitle: "Data & Schema Model",
      dataDesc:
        "Includes EF Core entity configurations, AuditableEntity tracking fields, unique constraints, and automatic database provider switching support (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Governance & Security",
      governanceDesc:
        "Adheres strictly to multi-tenant isolation gates, field-level security checks, and detailed operational audit trail logging.",
      verificationTitle: "Verification & Validation",
      verificationDesc:
        "Fully verified through unit/integration tests and automated frontend check gates. Run the 'scripe check' command to verify compilation, lint rules, and tests.",
      sourceMapTitle: "Source Code Map",
      sourceMapIntro:
        "The following source files contain the primary implementation details of this feature in the codebase:",
      operatingModelTitle: "Operating Model",
      operatingModel:
        "Executes via AstraFlow CQRS handlers and middleware pipeline behaviors. Leverages distributed locking for high concurrency and transaction safety.",
      localizationNoteTitle: "Localization & i18n",
      localizationNote:
        "Localized eagerly in 7 languages (EN, AR, FR, RU, ZH, ES, DE) with zero-flash rendering and full RTL layout support.",
      title: "Overview",
    },
    sso: {
      overviewTitle: "Overview",
      overview:
        "The Sso is a core component of the SCRIPE platform, providing essential management, business rules, and orchestration logic for this feature area.",
      architectureTitle: "Architecture & Integration",
      architectureDesc:
        "Designed following domain-driven design (DDD) and Clean Architecture principles, ensuring clear boundaries, high scalability, and loose coupling across backend and frontend layers.",
      dataTitle: "Data & Schema Model",
      dataDesc:
        "Includes EF Core entity configurations, AuditableEntity tracking fields, unique constraints, and automatic database provider switching support (SQL Server, PostgreSQL, Oracle).",
      governanceTitle: "Governance & Security",
      governanceDesc:
        "Adheres strictly to multi-tenant isolation gates, field-level security checks, and detailed operational audit trail logging.",
      verificationTitle: "Verification & Validation",
      verificationDesc:
        "Fully verified through unit/integration tests and automated frontend check gates. Run the 'scripe check' command to verify compilation, lint rules, and tests.",
      sourceMapTitle: "Source Code Map",
      sourceMapIntro:
        "The following source files contain the primary implementation details of this feature in the codebase:",
      operatingModelTitle: "Operating Model",
      operatingModel:
        "Executes via AstraFlow CQRS handlers and middleware pipeline behaviors. Leverages distributed locking for high concurrency and transaction safety.",
      localizationNoteTitle: "Localization & i18n",
      localizationNote:
        "Localized eagerly in 7 languages (EN, AR, FR, RU, ZH, ES, DE) with zero-flash rendering and full RTL layout support.",
      title: "Sso",
    },
  },
};
