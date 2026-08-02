/**
 * Docs security — DE
 * Auto-filled 25 keys from EN.
 */
export const de = {
  security: {
    overview: {
      title: "Sicherheitsübersicht",
      description:
        "5-Schichten-Verteidigungsstrategie, CORS-Konfiguration, Rate Limiting und Passwortrichtlinien.",
      intro:
        "SCRIPE implementiert eine Defense-in-Depth-Strategie mit mehreren Sicherheitsprüfungen.",
      layersTitle: "Verteidigungsschichten",
      featuresTitle: "Sicherheitsfunktionen",
      featureJwt: "JWT-Authentifizierung",
      featureJwtDesc: "Kurzlebige Access-Tokens mit HMAC-SHA256 Signatur.",
      feature2fa: "Zwei-Faktor-Auth (2FA)",
      feature2faDesc: "TOTP-basiertes 2FA, pro Mandant erzwingbar.",
      featureRbac: "RBAC-Berechtigungen",
      featureRbacDesc: "Umfassende PBAC-Durchsetzung für Rollen, Gruppen und Felder.",
      featureRateLimit: "Rate Limiting",
      featureRateLimitDesc:
        "4-stufiger Schutz: DDoS, pro IP, pro Endpunkt und für Authentifizierung.",
      featureAudit: "Audit Logging",
      featureAuditDesc: "Wer, Was, Wann, Wo mit Echtzeit-Broadcasting.",
      featureCors: "CORS Konfiguration",
      featureCorsDesc: "Strenge Validierung in Produktion, offenes CORS für localhost.",
      corsTitle: "CORS Konfiguration",
      corsIntro: "Unterscheidet sich zwischen Entwicklungs- und Produktionsumgebungen.",
      rateLimitTitle: "Rate Limiting Richtlinien",
      passwordTitle: "Passwortrichtlinien",
      securityWarning:
        "Überprüfen Sie immer die Sicherheitseinstellungen vor dem Production-Deployment.",
    },
    authDeep: {
      title: "Authentifizierung im Detail",
      description: "JWT-Lebenszyklus, BCrypt, Account-Lockout, OAuth, OTP und Impersonation.",
      intro: "Tiefer Einblick in alle Authentifizierungsmechanismen von SCRIPE.",
      jwtLifecycleTitle: "JWT Token-Lebenszyklus",
      jwtLifecycleIntro: "Rotierende Refresh-Tokens nach jeder Benutzung.",
      tokenStructureTitle: "JWT Token-Struktur",
      bcryptTitle: "BCrypt Passwort-Hashing",
      bcryptIntro: "Konfigurierbarer Work Factor zum Schutz vor Brute-Force.",
      lockoutTitle: "Account-Lockout (Sperre)",
      lockoutIntro: "5 Minuten Sperre nach 5 Fehlversuchen.",
      tfaTitle: "Zwei-Faktor-Authentifizierung (TOTP)",
      tfaIntro: "Kompatibel mit Google Authenticator und Authy.",
      externalAuthTitle: "Externe Authentifizierung (OAuth)",
      externalAuthIntro: "Integration von Google, Facebook, Apple, Microsoft.",
      otpTitle: "OTP System (Einmalpasswörter)",
      otpIntro: "Für E-Mail-Verifizierung und Passwort-Resets.",
      impersonationTitle: "Admin-Impersonation (Identitätsannahme)",
      impersonationIntro: "Erlaubt SuperAdmins Fehlerbehebung mit angehängtem Audit-Trail.",
      impersonationWarning: "Alle Aktionen werden der Identität des Impersonators zugeordnet.",
      sessionTitle: "Sitzungsmanagement (Session Management)",
      sessionIntro: "Zustandsloses JWT-Modell, Refresh-Tokens in der DB.",
      cookieAuthTip: "Senden Sie Refresh-Tokens als HttpOnly, Secure, SameSite=Strict Cookies.",
    },
    sso: {
      title: "Single Sign-On (SSO)",
      description: "OIDC-Authentifizierung, externe Identitätsverknüpfung und OAuth-Apps.",
      intro:
        "Das SCRIPE-System unterstützt die Authentifizierung über externe Anbieter basierend auf dem OIDC-Protokoll und die Bereitstellung von Anmeldeinformationen über OAuth-Anwendungen. Das System ist auf Mandantenfähigkeit ausgelegt, mit starkem Fokus auf PKCE-Sicherheit.",
      architectureTitle: "OIDC/OAuth Auth-Architektur",
      endpointsTitle: "Endpunkte & Flow",
      flowIntro:
        "Der SSO-Authentifizierungsprozess besteht aus einem mehrstufigen Flow, um maximale Sicherheit zu gewährleisten:",
      authEndpointTitle: "1. Autorisierungs-Endpunkt",
      authEndpointDesc:
        "Leitet den Benutzer zur Anmeldeseite des externen Identitätsanbieters weiter. Enthält PKCE-Verifizierung und Status-Token-Generierung.",
      callbackEndpointTitle: "2. Callback-Endpunkt",
      callbackEndpointDesc:
        "Empfängt den Benutzer nach erfolgreicher Authentifizierung und tauscht den Autorisierungscode gegen Sicherheitstokens auf der Serverseite aus – ohne Eingriff des Browsers.",
      linkingTitle: "Verknüpfung und Identitätsverarbeitung",
      linkingIntro:
        "Wenn ein Benutzer den Login abschließt, wird die E-Mail-Adresse mit der vorhandenen Benutzer-Datenbank abgeglichen. Wenn es sich um den ersten Login handelt, wird das externe OIDC-Konto mit dem internen SCRIPE-Konto verknüpft, um Duplikate zu vermeiden.",
      pkceWarning:
        "Die Unterstützung für veraltete implizite OAuth-Flows (Implicit Flow) entfällt. Stattdessen ist PKCE in allen Varianten zwingend erforderlich.",
      howItWorksTitle: "How SSO Works",
      howItWorksContent:
        "SCRIPE uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
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
      linkingContent:
        "Before SSO login works, a SCRIPE admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the SCRIPE account.",
      oauthAppsTitle: "OAuth Applications",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against SCRIPE as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      claimMappingTitle: "Claim Mapping",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to SCRIPE's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      tenantScopingTitle: "Tenant Scoping",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      apiTitle: "API Endpoints",
    },
    dataProtection: {
      title: "Datenschutz (Data Protection)",
      description:
        "Mandantenisolierung, Verschlüsselung, Field-Level-Security und DSGVO-Compliance.",
      intro: "SCRIPE schützt Daten auf jeder Ebene, vom Netzwerk bis zur Zeile in der Datenbank.",
      tenantIsolationTitle: "Datenisolierung für Mandanten",
      tenantIsolationIntro: "Alle Abfragen werden über globale Query Filter beschränkt.",
      tenantScopingTitle: "Query Filter Scoping",
      tenantServicesTitle: "Tenant-Aware Services",
      tenantServicesIntro: "Verwendet den IDataScopeService für Zugriff auf die Mandanten-ID.",
      dataAtRestTitle: "Verschlüsselung gespeicherter Daten (Data at Rest)",
      dataAtRestIntro: "Datenbankseitiges TDE und ASP.NET Core Data Protection API.",
      dataInTransitTitle: "Verschlüsselung bei der Übertragung (Data in Transit)",
      dataInTransitIntro: "Ausschließlich TLS 1.2+ mit HSTS-Headern.",
      restrictedFieldsTitle: "Eingeschränkte Felder (Field-Level Security)",
      restrictedFieldsIntro:
        "FieldProjectionMiddleware entfernt sensible Felder aus der JSON-Antwort.",
      idEncryptionTitle: "ID-Verschlüsselung",
      idEncryptionIntro: "Maskiert interne Guid-IDs vor externen Benutzern mittels AES-256.",
      gdprTitle: "DSGVO Compliance (GDPR)",
      gdprIntro: "Recht auf Löschung, Datenübertragbarkeit und Zustimmungsverwaltung.",
      rightToDeleteTitle: "Recht auf Löschung",
      dataPortabilityTitle: "Datenübertragbarkeit",
      consentTitle: "Zustimmungsverwaltung (Consent Management)",
      retentionTitle: "Datenaufbewahrungsrichtlinien",
      auditTrailTitle: "Audit-Trail für Compliance",
      bypassWarning:
        "Vorsicht bei der Verwendung von IgnoreQueryFilters() in Bezug auf Datenlecks.",
    },
    apiSecurity: {
      title: "API-Sicherheit",
      description: "Rate Limiting, CORS, Input Validierung, CSRF-Schutz und Security Headers.",
      intro: "Mehrere Verteidigungslinien für die Web-API.",
      rateLimitTitle: "Rate Limiting",
      rateLimitIntro: "4-stufiges Rate Limiting über den in ASP.NET Core integrierten Limiter.",
      corsTitle: "CORS Konfiguration",
      corsIntro: "Eingeschränkt in der Produktion, offen für localhost-Entwicklung.",
      inputValidationTitle: "Input-Validierung",
      inputValidationIntro:
        "Strukturierte Validierungsfehler über FluentValidation in der Pipeline.",
      csrfTitle: "CSRF-Schutz",
      csrfIntro: "Bear-Tokens und SameSite-Cookies schützen vor Cross-Site Request Forgery.",
      headersTitle: "Security Headers",
      headersIntro: "A+ Score Standard: nosniff, DENY, CSP.",
      headersTip: "Testen Sie Ihre Header immer über securityheaders.com.",
      replayTitle: "Schutz vor Replay-Angriffen",
      replayIntro: "Einmal-Tokens und Zeitstempel verhindern Replays.",
    },
    middlewarePipeline: {
      title: "Middleware-Pipeline",
      description: "11 Middleware-Komponenten in strikter Ausführungsreihenfolge.",
      intro: "Jede Komponente ist für einen spezifischen Sicherheits- oder Kontext-Task zuständig.",
      overviewTitle: "Pipeline-Übersicht",
      overviewIntro: "Der Flow verläuft von oben nach unten. Die Reihenfolge ist heilig.",
      globalExceptionTitle: "1. Global Exception Handler",
      globalExceptionIntro:
        "Fängt ungehandelte Ausnahmen ab und gibt standardisiertes JSON zurück.",
      correlationIdTitle: "2. Correlation ID",
      correlationIdIntro: "Für Distributed Tracing und Logs.",
      requestLoggingTitle: "3. Request Logging",
      requestLoggingIntro: "Protokolliert Metadaten; maskiert sensible Routen (wie /login).",
      cookieAuthTitle: "4. Cookie-to-Bearer Conversion",
      cookieAuthIntro: "Projiziert HttpOnly Cookies in den Authorization-Header für das Frontend.",
      tenantContextTitle: "5. Tenant Context",
      tenantContextIntro: "Extrahiert die tenant_id für IDataScopeService.",
      tenantContextNote: "MUSS nach Auth und vor jedem DB-Zugriff ausgeführt werden.",
      cacheHeadersTitle: "6. Cache Headers",
      cacheHeadersIntro: "Setzt No-Cache für APIs und Max-Age für statische Dateien.",
      fieldProjectionTitle: "7. Field Projection",
      fieldProjectionIntro:
        "Löscht aus der Antwort jene Felder, für die der User keine Berechtigung hat.",
      observabilityTitle: "Observability Middleware",
      observabilityIntro: "OpenTelemetry und Prometheus /metrics-Endpunkt.",
      registrationTitle: "Registrierungsreihenfolge",
      registrationIntro: "Wird in Program.cs definiert.",
      summaryTitle: "Middleware Zusammenfassung",
      orderWarning: "Ändern Sie diese Reihenfolge niemals leichtfertig.",
    },
    auditCompliance: {
      title: "Audit & Compliance",
      description:
        "Vollständige Audit-Pipeline, Entitätsverfolgung, SignalR-Streaming, CSV/Excel/PDF-Export und Compliance-Funktionen.",
      intro: "Ein lückenloses Protokoll jeder Datenänderung und API-Anfrage.",
      architectureTitle: "Audit-Architektur",
      architectureIntro:
        "Das Audit-System besteht aus der HTTP-Anforderungsprotokollierung und dem Abfangen von Entitätsänderungen auf Datenbankebene. Anforderungsmetadaten werden asynchron auf Host-Ebene über die RequestLoggingMiddleware protokolliert, während Änderungen auf Datenbankebene durch den AuditableEntityInterceptor vor SaveChanges erfasst werden.",
      interceptorTitle: "Entity Change Interceptor",
      interceptorIntro:
        "Der AuditableEntityInterceptor klinkt sich in die SaveChangesAsync-Pipeline von EF Core ein. Für jede hinzugefügte, geänderte oder gelöschte Entität (einschließlich Soft Deletes) erfasst er die alten und neuen Werte als JSON, den ausführenden Benutzer und den Zeitstempel. AuditLog-Entitäten werden übersprungen, um unendliche Rekursionen zu verhindern.",
      auditLogEntityTitle: "AuditLog Entitäts-Struktur",
      signalrTitle: "Echtzeit SignalR-Streaming",
      signalrIntro:
        "Audit-Logs werden in Echtzeit über den SignalR AuditHub übertragen. Verbundene Admin-Clients erhalten sofortige Benachrichtigungen bei Datenänderungen, was Live-Überwachungs-Dashboards ermöglicht.",
      exportTitle: "Exportfunktionen",
      exportIntro: "Unterstützt CSV, Excel und PDF gefiltert nach Mandant.",
      exportDetail:
        "Der AuditExportService bietet Exporte in mehreren Formaten. Der CSV-Export nutzt CsvHelper mit erzwungenen Anführungszeichen (RFC 4180) zur Vermeidung von CSV-Injektionen und fügt ein UTF-8-BOM für Excel hinzu. Der Excel-Export generiert eine ClosedXML-Arbeitsmappe mit drei Tabellenblättern: Executive Summary (KPIs und Statistiken), Audit Data (mit Auto-Filtern, fixierten Kopfzeilen und bedingter Formatierung in Grün/Rot) sowie Security Analysis. Der PDF-Export basiert auf QuestPDF und ist für große Datenmengen als veraltet (Obsolete) markiert. Zum Schutz der Systemressourcen sind alle Exporte auf 10.000 Zeilen begrenzt und werden vor der Übertragung vollständig im Arbeitsspeicher gepuffert.",
      queryApiTitle: "Abfrage- & Export-API",
      queryApiIntro:
        "Die Audit-API bietet Such-, Filter- und Exportfunktionen für Audit-Logs. Alle Endpunkte erfordern eine Admin-Authentifizierung sowie die Berechtigung audit.view oder audit.export.",
      querySearchDesc: "Audit-Logs durchsuchen.",
      queryExportCsvDesc: "Audit-Logs als CSV exportieren.",
      queryExportExcelDesc: "Als Excel-Tabelle exportieren.",
      queryExportPdfDesc: "Als PDF-Dokument exportieren.",
      scopingTitle: "Hierarchische Mandantenabgrenzung und Sicherheitsisolation",
      scopingDetail:
        "Die Datenisolation wird dynamisch bei der Abfrageausführung erzwungen. Der DataScopeService ermittelt den effektiven Bereich des Administrators basierend auf einer strikten Prioritätskette: ContextTenant (Drilldown über AES-verschlüsselte Kontext-Header), Berechtigungs-Overrides, SystemProtectedAdmin, Hierarchy (einschließlich Unterkunden) oder OwnTenant. Nachkommen werden in konstanter Zeit über materialisierte Pfade durchlaufen, wobei Starts-With-Abfragen in indexierte SQL-LIKE-Befehle übersetzt werden. Das Repository wendet AuditByTenantScopeSpec an, um die Filterung per 'WHERE TenantId IN (...)' sicherzustellen, während direkte GUID-Abfragen durch GetAuditLogDetailQueryHandler validiert werden, um horizontale Rechteausweitung zu verhindern.",
      complianceTitle: "Compliance-Funktionen",
      immutableTitle: "Unveränderliche Logs",
      immutableDesc:
        "Protokolle sind gesperrt und schreibgeschützt gespeichert, um Löschungen oder Änderungen nach dem Speichern zu verhindern.",
      fullTraceTitle: "Lückenlose Nachverfolgbarkeit",
      fullTraceDesc:
        "Erfasst HTTP-Header, Anforderungskontext und Entitätsänderungen, um eine vollständige Nachverfolgbarkeit zu gewährleisten.",
      searchableTitle: "Durchsuchbar",
      searchableDesc:
        "Optimierte Indizes auf Timestamp, UserId, EventType und CorrelationId ermöglichen eine sofortige Suche.",
      tenantScopedTitle: "Mandantenbezogen (Tenant Scoped)",
      tenantScopedDesc:
        "Protokolle werden automatisch durch TenantId- und Mandantenhierarchie-Grenzen isoliert, um Datenlecks zu verhindern.",
      realtimeTitle: "In Echtzeit",
      realtimeDesc:
        "Streamen Sie Sicherheitsereignisse und Mutationen direkt an mandantenspezifische SignalR-Dashboards.",
      retentionTitle: "Aufbewahrungsrichtlinie",
      retentionDesc:
        "Konfigurierte Aufbewahrungsfristen löschen abgelaufene Audit-Logs automatisch über Hintergrunddienste.",
    },
  },
};
