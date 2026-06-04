/**
 * Docs integration — DE
 * Auto-filled 28 keys from EN.
 */
export const de = {
  commercial: {
    apiDesign: {
      conventionsTitle: "Enterprise-Konventionen",
      description:
        "Entdecken Sie die strengen RESTful API-Designprinzipien, die strikt durchgesetzte Versionierung und die vorhersehbaren Konventionen, die SCRIPE antreiben.",
      errorTitle: "Standardisierte Fehlerbehandlung",
      intro:
        "Die API-Oberfläche von SCRIPE ist auf Skalierbarkeit und Vorhersehbarkeit ausgelegt. Von einheitlichen Namenskonventionen bis hin zu standardisierter Paginierung und RFC 7807 Problem Details zur Fehlerbehandlung – unsere zustandslose (stateless) RESTful-Architektur gewährleistet eine reibungslose Integration für nachgelagerte Verbraucher.",
      pipelineContent:
        "Die API-Pipeline nutzt einen hochoptimierten AstraFlow mediator-Request-Lebenszyklus. Jeder Endpunkt erbt automatisch Validierung, Leistungsverfolgung, Caching und Audit-Protokollierung, bevor auch nur eine einzige Zeile Geschäftslogik ausgeführt wird.",
      pipelineTitle: "Robuste Request-Pipeline",
      resultContent:
        "SCRIPE eliminiert die try-catch-Hölle durch ein einheitliches Result-Pattern. Jede API-Antwort ist streng typisiert und mathematisch vorhersehbar, sodass Verbraucher standardisierte HTTP-Statuscodes erhalten, die eine identische JSON-Antwortstruktur umschließen, unabhängig davon, auf welches Modul zugegriffen wird.",
      resultTitle: "Vorhersehbares Result-Pattern",
      statusCodesTitle: "Semantische Statuscodes",
      swaggerContent:
        "Erkunden Sie die Live-Swagger/OpenAPI 3.0-Dokumentation, um sofort mit über 400 vorkonfigurierten Endpunkten zu interagieren. Wir generieren strenge OpenAPI-Spezifikationen, die eine nahtlose SDK-Generierung für Frontend- und Mobile-Plattformen ermöglichen.",
      swaggerTitle: "Interaktive Swagger-UI",
      title: "API-Design & Architektur",
    },
    emailIntegration: {
      bilingual: "Zweisprachiges Template-Routing",
      bilingualDesc:
        "Erkennen Sie automatisch Mandanten-Lokalisierungen und versenden Sie hochgradig personalisierte HTML-E-Mails in Arabisch (RTL) oder Englisch (LTR) aus streng kategorisierten Vorlagen.",
      configTitle: "Dynamische SMTP-Konfigurationen",
      description:
        "Asynchrone, warteschlangenbasierte Transaktions-E-Mail-Zustellung mit reichem, anpassbarem Scriban-Templating.",
      featuresTitle: "Enterprise-Zustellungsfunktionen",
      intro:
        "Transaktionskommunikation darf niemals eine API-Anfrage blockieren. SCRIPE beinhaltet ein Outbox-Pattern- und Queue-basiertes Versand-System, das Background-Worker-Prozesse nutzt, um eine hyperschnelle, zuverlässige E-Mail-Zustellung über Standard-SMTP oder direkte REST-APIs wie SendGrid und Mailgun zu garantieren.",
      pipelineTitle: "Die Transaktions-Pipeline",
      providersTitle: "Agnostische Transport-Anbieter",
      queueBased: "Background-Versand",
      queueBasedDesc:
        "APIs antworten strikt unter 50ms, während schwere String-Manipulationen und externe Netzwerkaufrufe an persistente Hintergrunddienste delegiert werden.",
      retryLogic: "Exponential Backoff",
      retryLogicDesc:
        "Behandeln Sie temporäre Netzwerkpartitionen oder Rate-Limits von externen Anbietern elegant mit integrierten, konfigurierbaren resilienten Retry-Richtlinien.",
      templatesContent:
        "Schreiben Sie Logik direkt in Ihre E-Mail-Layouts. Mit der blitzschnellen Scriban-Templating-Sprache können Sie bedingte Blöcke ausführen, über Elemente iterieren und Daten perfekt formatieren, ohne Geschäftslogik in Ihre Anwendungsschicht auslaufen zu lassen.",
      templatesTitle: "Intelligentes Scriban-Templating",
      title: "Resiliente E-Mail-Infrastruktur",
      tracking: "Audit & Zustellungsverfolgung",
      trackingDesc:
        "Erfassen Sie die Versand-ID, den exakten Zeitstempel und die Provider-Antwort für jede einzelne gesendete E-Mail, wodurch ein unbestreitbarer Audit-Trail entsteht.",
    },
    messageTemplates: {
      bilingualContent:
        "Jede Vorlage versteht nativ den Kontext des Benutzers. Senden Sie exakt denselben Transaktions-Payload, und die Engine wertet das bevorzugte Locale des Empfängers aus, um sofort wunderschön formatierte RTL (Arabisch) oder LTR (Englisch) Kommunikation zu generieren.",
      bilingualTitle: "Intelligentes kontextuelles Rendering",
      builtInTitle: "Vorkonfigurierte Systemvorlagen",
      description:
        "Turing-vollständige, durch Scriban angetriebene dynamische Template-Engine für lokalisierte E-Mails, SMS, Benachrichtigungen und PDF-Dokumentengenerierung.",
      engineContent:
        "Warum Code neu kompilieren, um eine E-Mail-Betreffzeile zu ändern? SCRIPE nutzt Scriban – eine blitzschnelle, Liquid-kompatible Templating-Sprache. Sie wertet if/else-Logik, String-Manipulationen und Daten-Loops sicher direkt im Inhalt aus und führt sie in unter einer Millisekunde aus.",
      engineTitle: "Turing-vollständiges Templating",
      intro:
        "Kundenkommunikation muss dynamisch, tief personalisiert und sofort einsetzbar sein. SCRIPE entkoppelt Kommunikations-Markup von der zugrunde liegenden Anwendungslogik mithilfe einer hochsicheren, Sandbox-Template-Engine.",
      managementTitle: "Zentraler Vorlagen-Hub",
      previewContent:
        "Entwickler und Product Owner können das Vorlagendesign über die integrierte Live-Vorschau-Oberfläche sofort iterieren. Injizieren Sie Mock-JSON-Payloads, um komplexe Logik-Schleifen und Fehlerbehandlung zu testen, ohne jemals Code bereitzustellen.",
      previewLive: "Echtzeit-Payload-Injektion",
      previewLiveDesc:
        "Visualisieren Sie exakte gerenderte Ausgaben, indem Sie der Sandbox dynamische Datenobjekte zuführen.",
      previewTitle: "Live-Sandbox-Umgebung",
      previewVariables: "Sicheres Model Binding",
      previewVariablesDesc:
        "Nur explizit erlaubte ViewModels können von der Vorlage aufgerufen werden, was die Datensicherheit garantiert.",
      title: "Dynamisches Nachrichten-Templating",
    },
    restApiOverview: {
      authContent:
        "Jeder einzelne Controller ist standardmäßig gesperrt. SCRIPE verwendet eine robuste JWT-Token-Validierung, die präzise, granulare Berechtigungen und validierte Mandanten-Claims (Tenant Claims) erfordert, bevor ein einziges Byte JSON zurückgegeben wird.",
      authTitle: "Strikte kryptographische Autorisierung",
      controllersTitle: "Strikte Controller-Topographie",
      description:
        "Eine makellose, vollständig dokumentierte RESTful API-Oberfläche mit dynamischer Filterung, Cursor-basierter Paginierung und reichen HATEOAS-Antworten.",
      intro:
        "Das Backend ist nicht nur ein Datenbank-Wrapper; es ist eine akribisch gestaltete HTTP-Oberfläche. SCRIPE bietet eine makellose RESTful API, die sich strikt an Standard-HTTP-Verben, Statuscodes und Hypermedia-Konventionen hält.",
      lstSwagI1: "Automatisch generiert aus Controller-Attributen und XML-Dokumentation",
      lstSwagI2: "Try-it-out-Modus zum direkten Testen von Endpunkten",
      lstSwagI3: "JWT-Authentifizierungsunterstützung in der Swagger-UI",
      lstSwagI4: "Request/Response-Schema-Dokumentation mit Beispielen",
      lstSwagI5: "Gruppiert nach Controller für einfache Navigation",
      lstSwagI6: "Verfügbar unter /swagger im Entwicklungsmodus",
      paginationTitle: "Cursor & Offset Paginierung",
      responseContent:
        "Kein Parsen zufälliger Fehlerstrings mehr. Jede API-Antwort – ob erfolgreich oder ein katastrophaler Ausfall – ist in unserer standardisierten `Result<T>` Problem Details-Struktur verpackt, die absolute Vorhersehbarkeit für Frontends und Drittanbieter-Konsumenten garantiert.",
      responseTitle: "Standardisierte, vorhersehbare Payloads",
      swaggerContent:
        "Wir generieren umfassende, tief annotierte Swagger (OpenAPI 3.0)-Dokumentation direkt aus dem C#-Quellcode zur Laufzeit. Entwickler können authentifizierte Payloads direkt in ihrem Browser interaktiv testen, sobald das System bootet.",
      swaggerTitle: "Interaktive OpenAPI-Portale",
      tblCtrlHeader1: "Controller",
      tblCtrlHeader2: "Endpunkte",
      tblCtrlHeader3: "Beschreibung",
      tblCtrlR10C1: "SettingsController",
      tblCtrlR10C2: "4",
      tblCtrlR10C3: "Systemeinstellungen, Mandanteneinstellungen",
      tblCtrlR11C1: "DashboardController",
      tblCtrlR11C2: "3",
      tblCtrlR11C3: "KPI-Daten, Chart-Daten, Zusammenfassungen",
      tblCtrlR12C1: "WebhookController",
      tblCtrlR12C2: "5",
      tblCtrlR12C3: "Abonnementverwaltung, Event-Katalog",
      tblCtrlR13C1: "RecycleBinController",
      tblCtrlR13C2: "4",
      tblCtrlR13C3: "Soft-deleted Elemente, Wiederherstellen, Purge",
      tblCtrlR14C1: "EditionsController",
      tblCtrlR14C2: "11",
      tblCtrlR14C3: "Edition CRUD, Funktionen, Versionierung, Rollout",
      tblCtrlR15C1: "FeaturesController",
      tblCtrlR15C2: "5",
      tblCtrlR15C3: "Feature CRUD, Wertetypen, Systemfunktionen",
      tblCtrlR16C1: "SubscriptionsController",
      tblCtrlR16C2: "12",
      tblCtrlR16C3: "Zuweisen, Hochstufen, Herabstufen, Lebenszyklus, Auswirkungsanalyse",
      tblCtrlR17C1: "TenantFeaturesController",
      tblCtrlR17C2: "4",
      tblCtrlR17C3: "Mandantenspezifische Überschreibungen, aufgelöste Funktionen",
      tblCtrlR1C1: "AuthController",
      tblCtrlR1C2: "8",
      tblCtrlR1C3: "Login, Registrierung, 2FA, Passwort-Reset, Sessions",
      tblCtrlR2C1: "UserController",
      tblCtrlR2C2: "27",
      tblCtrlR2C3: "CRUD, Bulk-Ops, Enterprise-Operationen",
      tblCtrlR3C1: "RoleController",
      tblCtrlR3C2: "12",
      tblCtrlR3C3: "Rollenverwaltung, Berechtigungszuweisung",
      tblCtrlR4C1: "TenantController",
      tblCtrlR4C2: "10",
      tblCtrlR4C3: "Mandanten-Lebenszyklus, Einstellungen, Aktivierung",
      tblCtrlR5C1: "AuditController",
      tblCtrlR5C2: "6",
      tblCtrlR5C3: "Audit-Log Abfrage, Export, Streaming",
      tblCtrlR6C1: "NotificationController",
      tblCtrlR6C2: "5",
      tblCtrlR6C3: "Push-Benachrichtigungen, als gelesen markieren, Präferenzen",
      tblCtrlR7C1: "FileController",
      tblCtrlR7C2: "4",
      tblCtrlR7C3: "Upload, Download, Löschen, Metadaten",
      tblCtrlR8C1: "TemplateController",
      tblCtrlR8C2: "5",
      tblCtrlR8C3: "E-Mail/Nachrichten-Vorlagen CRUD, Vorschau",
      tblCtrlR9C1: "MenuController",
      tblCtrlR9C2: "6",
      tblCtrlR9C3: "Dynamisches Menümanagement, Overrides",
      title: "Die RESTful Oberfläche",
    },
    ssoEnterprise: {
      brandingContent:
        "Deliver a seamless, uncompromising login aesthetic. Tenant administrators simply configure their external SSO within the UI, and the login interface autonomously generates flawlessly styled, tenant-bound SSO buttons ensuring user trust.",
      brandingTitle: "Architected for Corporate Branding",
      comparisonTitle: "How SCRIPE Compares",
      description:
        "Zentralisieren Sie den Identitätszugriff. Verbinden Sie Unternehmensverzeichnisse nahtlos mit der Multi-Tenant-Authentifizierung von SCRIPE.",
      intro:
        "Sicherheit auf Unternehmensebene erfordert zentralisiertes Vertrauen. SCRIPE SSO ermöglicht es Ihren Kunden, Authentifizierungsabläufe an ihre bestehenden Identitätsanbieter (IdPs) zu delegieren und dabei unsere strikte Multi-Tenant-Isolierung und Rollenzuweisung beizubehalten.",
      linkingContent:
        "Keine manuellen Einladungen mehr. Wenn sich Mitarbeiter über Unternehmens-SSO anmelden, referenziert SCRIPE automatisch E-Mail-Adressen und verknüpft föderierte IDs nahtlos mit lokalen Administratorprofilen und RBAC-Rollen.",
      linkingTitle: "Automatische Identitätsverknüpfung",
      multiIdpContent:
        "Legacy platforms often bind identity to the root infrastructure, forcing all tenants to share an IdP, or requiring massively complex infrastructure scaling. SCRIPE natively supports infinite, uniquely mapped Identity Providers per tenant—all governed through the integrated Admin UI without touching the deployment pipeline.",
      multiIdpTitle: "Infinite Multi-IdP Per Tenant",
      oauth1Desc:
        "Server-side applications with secure backend storage for client secrets. Perfect for B2B API integrations enforcing the full Authorization Code flow with PKCE.",
      oauth1Title: "Confidential Clients (Backend)",
      oauth2Desc:
        "React, Vue, iOS, and Android applications that cannot securely store static secrets. Strictly leverages the PKCE-only flow, ensuring access tokens are generated flawlessly without risking a compromised client secret.",
      oauth2Title: "Public Clients (SPA & Mobile)",
      oauthAppsContent:
        "Ermöglichen Sie es dem Software-Ökosystem Ihrer Kunden, sicher mit SCRIPE zu integrieren. Registrieren Sie unbegrenzt viele OAuth-Web-, Desktop- oder SPA-Anwendungen und verwalten Sie Scopes und Lebenszyklen von Zugriffstoken programmatisch.",
      oauthAppsTitle: "OAuth-Brokerage für Drittanbieter",
      oauthContent:
        "Invert the identity paradigm. By registering third-party software as OAuth Applications within SCRIPE, you instantly transform your application into a centralized enterprise Identity Provider. Mobile applications, partner portals, and decoupled internal microservices can all aggressively rely on SCRIPE for unified identity resolution.",
      oauthTitle: "OAuth Application Registry (SCRIPE as Server)",
      oidcContent:
        "Verbinden Sie nahtlos mit Azure Active Directory (Entra ID), Okta, Auth0, Google Workspace oder jedem standardkonformen OpenID Connect-Anbieter. Wir übernehmen den kryptografischen Handshake; Ihre Benutzer erhalten den Ein-Klick-Zugang, den sie erwarten.",
      oidcTitle: "Universelle OIDC-Integration",
      pkceSecurityContent:
        "Wir verweigern verletzliche Legacy-Flows. Alle OAuth-Abläufe in SCRIPE erzwingen PKCE und gewährleisten damit absolute Immunität gegen Auth-Code-Interception, selbst bei nativen mobilen Clients oder SPA-Frameworks.",
      pkceSecurityTitle: "Proof Key for Code Exchange (PKCE)",
      protocolsContent:
        "SCRIPE mandates adherence to immutable industry standards, ensuring frictionless topological compatibility with every major identity provider globally.",
      protocolsTitle: "Supported Authentication Protocols",
      securityModelContent:
        "The deprecated Implicit Flow is eradicated. Every SSO login flows exclusively through PKCE (Proof Key for Code Exchange), the definitive standard dictated by OAuth 2.1. Authorization codes are strictly one-time-use, instantly exchanged server-side, with full discovery document caching.",
      securityModelTitle: "PKCE Security Architecture",
      tenantIsolationContent:
        "SCRIPE bindet SSO-Konfigurationen strikt an die Mandantengrenze. Tenant A kann sich per Entra ID authentifizieren, während Tenant B Okta nutzt – auf demselben System, mit null Gefahr von Cross-Pollination der Identitäten.",
      tenantIsolationTitle: "Mandantenspezifische Identitätsdienste",
      title: "Enterprise Single Sign-On (SSO)",
      val1Desc:
        "Every authentication flow is fortified with stringent PKCE (Proof Key for Code Exchange) validation. We enforce strict state-checking to thwart CSRF attacks and encrypt all latent client secrets at rest. Secret keys never touch the browser.",
      val1Title: "Zero-Trust Identity Protocol",
      val2Desc:
        "Employees and B2B clients sign in instantly with their existing corporate credentials. Connect Azure AD, Google Workspace, Okta, or AWS Cognito directly from the Admin Panel in exactly 30 seconds—no custom backend middleware required.",
      val2Title: "Zero-Code Federation (IdP)",
      val3Desc:
        "Why pay for Auth0 or deploy Keycloak? Turn SCRIPE into your primary authentication broker. Register distinct OAuth applications (SPAs, Mobile Apps, external dashboards) to securely consume SCRIPE's JWTs.",
      val3Title: "SCRIPE as the Identity Server",
      val4Desc:
        "B2B SaaS superpower: Every single tenant can configure their own isolated SSO providers. Tenant A's Azure AD is mathematically invisible to Tenant B's Google Workspace. SuperAdmins can also provide Global SSO fallbacks.",
      val4Title: "Absolute Tenant IAM Isolation",
      val5Desc:
        "Every configured Identity Provider dynamically renders on the login screen with custom hex colors, branded labels, and distinct vectorized SVGs perfectly matching the tenant's brand identity.",
      val5Title: "White-Labeled Login Experience",
      val6Desc:
        "SCRIPE relies entirely on the battle-tested OpenIddict framework for robust OIDC and OAuth 2.0 compliance, with planned architecture expansions into SAML 2.0 for legacy government system compliance.",
      val6Title: "Future-Proof Standardization",
      valueTitle: "Strategic IAM Value",
    },
    webhookIntegration: {
      description:
        "Ein massiv resilienter, asynchroner, ereignisgesteuerter Webhook-Dispatcher, der eine sichere, sofortige Datensynchronisierung mit immensen externen APIs ermöglicht.",
      eventsTitle: "Global unterstützte Broadcast-Ereignisse",
      intro:
        "Moderne Enterprise-Systeme müssen kommunizieren. Anstatt Clients zu zwingen, Ihre REST-API aggressiv abzufragen (Polling), enthält SCRIPE einen nativen, massiv effizienten ausgehenden Webhook-Dispatcher. Pushen Sie kritische Domain-Ereignisse sofort und sicher über HTTPS an jedes externe System.",
      logsTitle: "Forensisches Dispatch-Auditing",
      managementTitle: "Dynamische Abonnementverwaltung",
      retryContent:
        "Wenn der Server eines Abonnenten offline geht, verwirft SCRIPE den Payload nicht. Mithilfe eines intelligenten, exponentiell verzögerten persistenten Outbox-Patterns wird die Anfrage mathematisch wiederholt (z.B. 5 Sekunden, 1 Minute, 1 Stunde, 1 Tag), bis der Empfang durch einen HTTP 2xx-Status bestätigt wird.",
      retryTitle: "Exponentieller persistenter Backoff",
      securityContent:
        "Jeder ausgehende Payload ist sicher mit einer HMAC-SHA256 Signatur signiert, die aus dem geheimen Schlüssel (Secret Key) des Mandanten generiert wird. Drittanbieter-Integrationen können definitiv verifizieren, dass der Webhook von Ihren SCRIPE-Servern stammte und der Payload global nicht abgefangen oder manipuliert wurde.",
      securityTitle: "Kryptographische HMAC-Signaturen",
      title: "High-Volume Webhook-Dispatch",
    },
  },
};
