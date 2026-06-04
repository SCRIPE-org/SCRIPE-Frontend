/**
 * Docs security — DE
 * Auto-filled 25 keys from EN.
 */
export const de = {
  security: {
    apiSecurity: {
      corsIntro: "Eingeschränkt in der Produktion, offen für localhost-Entwicklung.",
      corsTitle: "CORS Konfiguration",
      csrfIntro: "Bear-Tokens und SameSite-Cookies schützen vor Cross-Site Request Forgery.",
      csrfTitle: "CSRF-Schutz",
      description: "Rate Limiting, CORS, Input Validierung, CSRF-Schutz und Security Headers.",
      headersIntro: "A+ Score Standard: nosniff, DENY, CSP.",
      headersTip: "Testen Sie Ihre Header immer über securityheaders.com.",
      headersTitle: "Security Headers",
      inputValidationIntro:
        "Strukturierte Validierungsfehler über FluentValidation in der Pipeline.",
      inputValidationTitle: "Input-Validierung",
      intro: "Mehrere Verteidigungslinien für die Web-API.",
      rateLimitIntro: "4-stufiges Rate Limiting über den in ASP.NET Core integrierten Limiter.",
      rateLimitTitle: "Rate Limiting",
      replayIntro: "Einmal-Tokens und Zeitstempel verhindern Replays.",
      replayTitle: "Schutz vor Replay-Angriffen",
      title: "API-Sicherheit",
    },
    auditCompliance: {
      architectureIntro: "Drei Schichten: Interceptors, AstraFlow mediator-Behavior, Middleware.",
      architectureTitle: "Audit-Architektur",
      auditLogEntityTitle: "AuditLog Entitäts-Struktur",
      complianceTitle: "Compliance-Funktionen",
      description: "Interceptors, Entity-Tracking, SignalR-Streaming und Export.",
      exportIntro: "Unterstützt CSV, Excel und PDF gefiltert nach Mandant.",
      exportTitle: "Exportfunktionen",
      fullTraceTitle: "Lückenlose Nachverfolgbarkeit",
      immutableTitle: "Unveränderliche Logs",
      interceptorIntro: "Fängt Added, Modified, Deleted ab und serialisiert sie als JSON.",
      interceptorTitle: "Entity Change Interceptor",
      intro: "Ein lückenloses Protokoll jeder Datenänderung und API-Anfrage.",
      queryApiIntro: "Vollständige Such- und Filter-API für Audit-Einträge.",
      queryApiTitle: "Abfrage- & Export-API",
      queryExportCsvDesc: "Audit-Logs als CSV exportieren.",
      queryExportExcelDesc: "Als Excel-Tabelle exportieren.",
      queryExportPdfDesc: "Als PDF-Dokument exportieren.",
      querySearchDesc: "Audit-Logs durchsuchen.",
      realtimeTitle: "In Echtzeit",
      retentionTitle: "Aufbewahrungsrichtlinie",
      searchableTitle: "Durchsuchbar",
      signalrIntro: "Verbindungen zu AuditHub ermöglichen Live-Dashboards.",
      signalrTitle: "Echtzeit SignalR-Streaming",
      tenantScopedTitle: "Mandantenbezogen (Tenant Scoped)",
      title: "Audit & Compliance",
    },
    authDeep: {
      bcryptIntro: "Konfigurierbarer Work Factor zum Schutz vor Brute-Force.",
      bcryptTitle: "BCrypt Passwort-Hashing",
      cookieAuthTip: "Senden Sie Refresh-Tokens als HttpOnly, Secure, SameSite=Strict Cookies.",
      description: "JWT-Lebenszyklus, BCrypt, Account-Lockout, OAuth, OTP und Impersonation.",
      externalAuthIntro: "Integration von Google, Facebook, Apple, Microsoft.",
      externalAuthTitle: "Externe Authentifizierung (OAuth)",
      impersonationIntro: "Erlaubt SuperAdmins Fehlerbehebung mit angehängtem Audit-Trail.",
      impersonationTitle: "Admin-Impersonation (Identitätsannahme)",
      impersonationWarning: "Alle Aktionen werden der Identität des Impersonators zugeordnet.",
      intro: "Tiefer Einblick in alle Authentifizierungsmechanismen von SCRIPE.",
      jwtLifecycleIntro: "Rotierende Refresh-Tokens nach jeder Benutzung.",
      jwtLifecycleTitle: "JWT Token-Lebenszyklus",
      lockoutIntro: "5 Minuten Sperre nach 5 Fehlversuchen.",
      lockoutTitle: "Account-Lockout (Sperre)",
      otpIntro: "Für E-Mail-Verifizierung und Passwort-Resets.",
      otpTitle: "OTP System (Einmalpasswörter)",
      passkeysIntro:
        "Passkeys bieten einen passwortlosen Authentifizierungsmechanismus unter Verwendung von Public-Key-Kryptographie. Bei der Registrierung generiert der Browser ein Schlüsselpaar aus öffentlichem und privatem Schlüssel, sendet den öffentlichen Schlüssel und die Anmelde-ID an den Server und speichert den privaten Schlüssel sicher im Authentifikator des Geräts. Beim Login stellt der Server eine Challenge, die der Authentifikator mit dem privaten Schlüssel signiert.",
      passkeysTitle: "Passkeys (WebAuthn / FIDO2)",
      qrIntro:
        "Der QR-Code-Login ermöglicht es Benutzern, sich sofort auf einem Web-Client zu authentifizieren, indem sie einen QR-Code mit ihrer bereits authentifizierten mobilen Anwendung scannen. Der Web-Client pollt den Sitzungsstatus, bis die mobile App die Sitzung bestätigt, indem sie das Sitzungstoken signiert und zusammen mit den aktiven Sitzungsdaten des Benutzers übermittelt.",
      qrTitle: "QR-Code-Login-Handshake",
      samlIntro:
        "SAML 2.0 ermöglicht Enterprise Single Sign-On (SSO) durch die Föderierung der Authentifizierung zwischen SCRIPE (als Service Provider) und Unternehmens-Identity-Providern (IdP) wie Okta oder Active Directory. Der Handshake nutzt XML-basierte Assertions, die mit X.509-Zertifikaten signiert sind, um die Identität zu überprüfen und Rollen zuzuweisen.",
      samlTitle: "SAML 2.0 Enterprise Föderation",
      sessionIntro: "Zustandsloses JWT-Modell, Refresh-Tokens in der DB.",
      sessionTitle: "Sitzungsmanagement (Session Management)",
      ssoSuspensionIntro:
        "Der ExternalLoginCommandHandler enthält jetzt ein Sicherheits-Gate für Mandantensperren. Vor dem Ausstellen eines JWT nach einer SSO/OIDC-Authentifizierung überprüft der Handler den Status des Mandanten des Administrators. Wenn der Mandant gesperrt oder gekündigt ist, wird der Login mit einer lokalisierten Fehlermeldung abgelehnt. Dies verhindert, dass deaktivierte Benutzer die Standard-Loginprüfungen über SSO umgehen.",
      ssoSuspensionTitle: "SSO Mandantensperr-Gate",
      ssoSuspensionWarning:
        "Ohne dieses Gate könnten SSO-Benutzer sich über einen externen IdP (z. B. Google, Azure AD) authentifizieren und ein gültiges SCRIPE-JWT erhalten, selbst wenn ihr Mandant gesperrt oder gekündigt wurde. Diese kritische Sicherheitslücke wurde behoben.",
      tfaIntro: "Kompatibel mit Google Authenticator und Authy.",
      tfaTitle: "Zwei-Faktor-Authentifizierung (TOTP)",
      title: "Authentifizierung im Detail",
      tokenStructureTitle: "JWT Token-Struktur",
    },
    dataProtection: {
      auditTrailTitle: "Audit-Trail für Compliance",
      bypassWarning:
        "Vorsicht bei der Verwendung von IgnoreQueryFilters() in Bezug auf Datenlecks.",
      consentTitle: "Zustimmungsverwaltung (Consent Management)",
      dataAtRestIntro: "Datenbankseitiges TDE und ASP.NET Core Data Protection API.",
      dataAtRestTitle: "Verschlüsselung gespeicherter Daten (Data at Rest)",
      dataInTransitIntro: "Ausschließlich TLS 1.2+ mit HSTS-Headern.",
      dataInTransitTitle: "Verschlüsselung bei der Übertragung (Data in Transit)",
      dataPortabilityTitle: "Datenübertragbarkeit",
      description:
        "Mandantenisolierung, Verschlüsselung, Field-Level-Security und DSGVO-Compliance.",
      gdprIntro: "Recht auf Löschung, Datenübertragbarkeit und Zustimmungsverwaltung.",
      gdprTitle: "DSGVO Compliance (GDPR)",
      idEncryptionIntro: "Maskiert interne Guid-IDs vor externen Benutzern mittels AES-256.",
      idEncryptionTitle: "ID-Verschlüsselung",
      intro: "SCRIPE schützt Daten auf jeder Ebene, vom Netzwerk bis zur Zeile in der Datenbank.",
      restrictedFieldsIntro:
        "FieldProjectionMiddleware entfernt sensible Felder aus der JSON-Antwort.",
      restrictedFieldsTitle: "Eingeschränkte Felder (Field-Level Security)",
      retentionTitle: "Datenaufbewahrungsrichtlinien",
      rightToDeleteTitle: "Recht auf Löschung",
      tenantIsolationIntro: "Alle Abfragen werden über globale Query Filter beschränkt.",
      tenantIsolationTitle: "Datenisolierung für Mandanten",
      tenantScopingTitle: "Query Filter Scoping",
      tenantServicesIntro: "Verwendet den IDataScopeService für Zugriff auf die Mandanten-ID.",
      tenantServicesTitle: "Tenant-Aware Services",
      title: "Datenschutz (Data Protection)",
    },
    middlewarePipeline: {
      cacheHeadersIntro: "Setzt No-Cache für APIs und Max-Age für statische Dateien.",
      cacheHeadersTitle: "6. Cache Headers",
      cookieAuthIntro: "Projiziert HttpOnly Cookies in den Authorization-Header für das Frontend.",
      cookieAuthTitle: "4. Cookie-to-Bearer Conversion",
      correlationIdIntro: "Für Distributed Tracing und Logs.",
      correlationIdTitle: "2. Correlation ID",
      description: "11 Middleware-Komponenten in strikter Ausführungsreihenfolge.",
      fieldProjectionIntro:
        "Löscht aus der Antwort jene Felder, für die der User keine Berechtigung hat.",
      fieldProjectionTitle: "7. Field Projection",
      globalExceptionIntro:
        "Fängt ungehandelte Ausnahmen ab und gibt standardisiertes JSON zurück.",
      globalExceptionTitle: "1. Global Exception Handler",
      intro: "Jede Komponente ist für einen spezifischen Sicherheits- oder Kontext-Task zuständig.",
      observabilityIntro: "OpenTelemetry und Prometheus /metrics-Endpunkt.",
      observabilityTitle: "Observability Middleware",
      orderWarning: "Ändern Sie diese Reihenfolge niemals leichtfertig.",
      overviewIntro: "Der Flow verläuft von oben nach unten. Die Reihenfolge ist heilig.",
      overviewTitle: "Pipeline-Übersicht",
      registrationIntro: "Wird in Program.cs definiert.",
      registrationTitle: "Registrierungsreihenfolge",
      requestLoggingIntro: "Protokolliert Metadaten; maskiert sensible Routen (wie /login).",
      requestLoggingTitle: "3. Request Logging",
      summaryTitle: "Middleware Zusammenfassung",
      tenantContextIntro: "Extrahiert die tenant_id für IDataScopeService.",
      tenantContextNote: "MUSS nach Auth und vor jedem DB-Zugriff ausgeführt werden.",
      tenantContextTitle: "5. Tenant Context",
      title: "Middleware-Pipeline",
    },
    overview: {
      corsIntro: "Unterscheidet sich zwischen Entwicklungs- und Produktionsumgebungen.",
      corsTitle: "CORS Konfiguration",
      description:
        "5-Schichten-Verteidigungsstrategie, CORS-Konfiguration, Rate Limiting und Passwortrichtlinien.",
      feature2fa: "Zwei-Faktor-Auth (2FA)",
      feature2faDesc: "TOTP-basiertes 2FA, pro Mandant erzwingbar.",
      featureAudit: "Audit Logging",
      featureAuditDesc: "Wer, Was, Wann, Wo mit Echtzeit-Broadcasting.",
      featureCors: "CORS Konfiguration",
      featureCorsDesc: "Strenge Validierung in Produktion, offenes CORS für localhost.",
      featureJwt: "JWT-Authentifizierung",
      featureJwtDesc: "Kurzlebige Access-Tokens mit HMAC-SHA256 Signatur.",
      featureRateLimit: "Rate Limiting",
      featureRateLimitDesc:
        "4-stufiger Schutz: DDoS, pro IP, pro Endpunkt und für Authentifizierung.",
      featureRbac: "RBAC-Berechtigungen",
      featureRbacDesc: "Umfassende PBAC-Durchsetzung für Rollen, Gruppen und Felder.",
      featuresTitle: "Sicherheitsfunktionen",
      intro:
        "SCRIPE implementiert eine Defense-in-Depth-Strategie mit mehreren Sicherheitsprüfungen.",
      layersTitle: "Verteidigungsschichten",
      passwordTitle: "Passwortrichtlinien",
      rateLimitTitle: "Rate Limiting Richtlinien",
      securityWarning:
        "Überprüfen Sie immer die Sicherheitseinstellungen vor dem Production-Deployment.",
      title: "Sicherheitsübersicht",
    },
    sso: {
      apiTitle: "API Endpoints",
      architectureTitle: "OIDC/OAuth Auth-Architektur",
      authEndpointDesc:
        "Leitet den Benutzer zur Anmeldeseite des externen Identitätsanbieters weiter. Enthält PKCE-Verifizierung und Status-Token-Generierung.",
      authEndpointTitle: "1. Autorisierungs-Endpunkt",
      callbackEndpointDesc:
        "Empfängt den Benutzer nach erfolgreicher Authentifizierung und tauscht den Autorisierungscode gegen Sicherheitstokens auf der Serverseite aus – ohne Eingriff des Browsers.",
      callbackEndpointTitle: "2. Callback-Endpunkt",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to SCRIPE's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      claimMappingTitle: "Claim Mapping",
      description: "OIDC-Authentifizierung, externe Identitätsverknüpfung und OAuth-Apps.",
      endpointsTitle: "Endpunkte & Flow",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      entityModelTitle: "Identity Provider Entity",
      flowIntro:
        "Der SSO-Authentifizierungsprozess besteht aus einem mehrstufigen Flow, um maximale Sicherheit zu gewährleisten:",
      howItWorksContent:
        "SCRIPE uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      howItWorksTitle: "How SSO Works",
      intro:
        "Das SCRIPE-System unterstützt die Authentifizierung über externe Anbieter basierend auf dem OIDC-Protokoll und die Bereitstellung von Anmeldeinformationen über OAuth-Anwendungen. Das System ist auf Mandantenfähigkeit ausgelegt, mit starkem Fokus auf PKCE-Sicherheit.",
      linkingContent:
        "Before SSO login works, a SCRIPE admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the SCRIPE account.",
      linkingIntro:
        "Wenn ein Benutzer den Login abschließt, wird die E-Mail-Adresse mit der vorhandenen Benutzer-Datenbank abgeglichen. Wenn es sich um den ersten Login handelt, wird das externe OIDC-Konto mit dem internen SCRIPE-Konto verknüpft, um Duplikate zu vermeiden.",
      linkingTitle: "Verknüpfung und Identitätsverarbeitung",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against SCRIPE as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      oauthAppsTitle: "OAuth Applications",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      pkceTitle: "PKCE Security Model",
      pkceWarning:
        "Die Unterstützung für veraltete implizite OAuth-Flows (Implicit Flow) entfällt. Stattdessen ist PKCE in allen Varianten zwingend erforderlich.",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step1Title: "1. Provider Discovery",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step2Title: "2. PKCE Challenge",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step3Title: "3. IdP Redirect",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step4Title: "4. User Authentication",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      step5Title: "5. Callback & Token Exchange",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      tenantScopingTitle: "Tenant Scoping",
      title: "Single Sign-On (SSO)",
    },
  },
};
