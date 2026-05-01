/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  commercial: {
    securityOverview: {
      complianceTitle: "Grundlage für Compliance",
      description:
        "Eine umfassende Aufschlüsselung von NEXORAs mehrschichtigem Defense-in-Depth Sicherheitsperimeter, der alles von der Routing-Schicht bis zur Persistenz-Schicht schützt.",
      gdpr: "DSGVO Recht auf Vergessenwerden (Let-To-Forget)",
      gdprDesc:
        "Out-of-the-box-Unterstützung für strikte PII-Anonymisierung und Hard-Deletion-Protokolle.",
      headersTitle: "Defensive HTTP-Header",
      intro:
        "Wir vertrauen dem Netzwerk nicht, wir vertrauen dem Client nicht und wir vertrauen dem Payload nicht. NEXORA basiert auf einer Zero-Trust-Architekturmethodik und erzwingt aggressive Sicherheitsprotokolle an jeder einzelnen Grenze der Anwendungsmatrix.",
      modelContent:
        "Jede einzelne API-Anfrage wird sofort gegen die FluentValidation-Engine ausgewertet. Wenn eine Payload Domain-Einschränkungen verletzt (z. B. ungültige E-Mail-Formate, Zahlen außerhalb des zulässigen Bereichs), weist die Pipeline die Payload sofort mit einem 400 Bad Request ab, bevor jemals ein Controller instanziiert wird.",
      modelTitle: "Strikte Pipeline-Validierung",
      soc2: "SOC 2 Type II Bereitschaft",
      soc2Desc:
        "Integrierte forensische Audit-Trails und strikte Datenisolierung beschleunigen erfolgreiche SOC 2-Audits.",
      sox: "SOX-Compliance-Trigger",
      soxDesc:
        "Mathematische Unveränderlichkeit (Immutability) in Finanz-Audit-Logs zur Unterstützung stark regulierter Umgebungen.",
      summaryTitle: "Defense-In-Depth-Matrix",
      title: "Zero-Trust-Sicherheitshaltung",
    },
    authSecurity: {
      apiTitle: "API-Schlüsselverwaltung",
      description:
        "Erweiterte JWT-Authentifizierung, Brute-Force-Schutz, Multi-Faktor-Sicherheit und gehärtete Passwortrichtlinien.",
      intro:
        "Sicherheit ist fest in der DNA von NEXORA verankert. Unsere Zero-Trust-Identitätsarchitektur nutzt branchenführende Kryptographie, hochgradig konfigurierbare Passwortrichtlinien und strikte JWT-Validierung, um Ihre Anwendung vor modernen Angriffsvektoren zu schützen.",
      jwtContent:
        "Wir verwenden schnelle, zustandslose JSON Web Tokens (JWT), die mit asymmetrischen RSA-Schlüsseln signiert sind. Access-Tokens haben eine kurze Lebensdauer, während sichere, HTTP-only Refresh-Tokens eine reibungslose Benutzererfahrung ohne Kompromisse bei der Sicherheit gewährleisten.",
      jwtTitle: "Asymmetrisches JWT-Protokoll",
      passwordContent:
        "Setzen Sie NIST-konforme Passwortkomplexität durch. Diktieren Sie erforderliche Längen, spezielle Zeichenkombinationen und verhindern Sie die Wiederverwendung historischer Passwörter über konfigurierbare Zeiträume.",
      passwordTitle: "Adaptive Passwortrichtlinien",
      sessionTitle: "Kontrolle gleichzeitiger Sitzungen",
      title: "Authentifizierung & Sicherheit",
      twoFa1Content:
        "Integrieren Sie Standard-TOTP-Anwendungen wie Google Authenticator oder Authy nahtlos über die standardmäßige QR-Code-Bereitstellung.",
      twoFa1Title: "Zeitbasiertes OTP (TOTP)",
      twoFa2Content:
        "Greifen Sie auf sichere SMS-Verifizierung zurück, die über robuste Drittanbieter (Twilio, Nexmo) abgewickelt wird.",
      twoFa2Title: "SMS-Verifizierung",
      twoFa3Content:
        "Versenden Sie einmalige Challenge-Codes über integrierte SMTP-E-Mail-Lösungen mit anpassbaren Scriban-Vorlagen.",
      twoFa3Title: "E-Mail-OTP",
      twoFa4Content:
        "Stellen Sie druckbare, kryptographisch sichere Wiederherstellungscodes für Disaster-Recovery-Szenarien bereit.",
      twoFa4Title: "Sichere Wiederherstellungscodes",
      twoFaContent:
        "Passwörter allein reichen nicht aus. NEXORA erfordert nativ dynamische sekundäre Verifizierungsbarrieren, die Ihre Benutzer selbst im Falle von Credential Stuffing oder Phishing schützen.",
      twoFaTitle: "Multi-Faktor-Authentifizierung (MFA)",
    },
    dataProtection: {
      csrfContent:
        "Stoppen Sie Cross-Origin-Bleeding sofort. Alle mutierbaren API-Endpunkte erfordern kryptographische Antiforgery-Tokens. Indem CSRF-Zusicherungen automatisch an die JWT des Benutzers und sichere SameSite-Cookies gebunden werden, eliminiert NEXORA Cross-Site-Request-Forgery-Vektoren vollständig.",
      csrfTitle: "Undurchdringliche CSRF-Verteidigung",
      description:
        "Kryptographische Schutzmaßnahmen, At-Rest-Verschlüsselungsstrategien und umfassende Datenschutzkontrollen.",
      encryptionTitle: "End-to-End-Verschlüsselungsarchitektur",
      fieldProjectionContent:
        "Stoppen Sie Over-Fetching. Unser dynamisches Projektions-Mapping stellt sicher, dass APIs nur die exakten Spalten abfragen und serialisieren, die vom Frontend angefordert werden, wodurch die versehentliche Preisgabe sensibler Backend-Felder wie Passwort-Hashes oder Gehaltsdaten verhindert wird.",
      fieldProjectionTitle: "Strikte Datenprojektion",
      idEncContent:
        "Wir verwenden robuste, sequenzielle UUIDs (v7) und Hashids, um zu verhindern, dass leicht zu erratende sequenzielle Integer Geschäftsgeschwindigkeiten preisgeben. Objekt-IDs sind von Natur aus obskur und von der physischen Datenbankidentität entkoppelt.",
      idEncTitle: "Opake ID-Generierung",
      intro:
        "Der Schutz von Benutzerdaten steht an erster Stelle. NEXORA wendet Defense-in-Depth-Strategien an und nutzt militärische Kryptographie sowie logische Barrieren, um sicherzustellen, dass ein unautorisierter Datenzugriff mathematisch unmöglich ist.",
      replayContent:
        "Durch die Durchsetzung einer strikten JWT-Nonce-Validierung, Token-Ablauf und kryptographisch signierter Zeitstempel weist unser API-Gateway abgefangene oder duplizierte Request-Payloads automatisch zurück.",
      replayTitle: "Verhinderung von Replay-Angriffen",
      title: "Datenschutz & Privatsphäre",
    },
    infraSecurity: {
      corsContent:
        "Stoppen Sie Cross-Origin-Bleeding direkt im Ansatz. Die Standard-CORS-Richtlinien von NEXORA sind mit einem strikten Whitelist-Paradigma gesperrt, das unautorisierte Pre-Flight-Anfragen von schurkischen Domains sofort ablehnt.",
      corsTitle: "Strikte Cross-Origin-Richtlinien",
      cspContent:
        "Unsere vorkonfigurierten Content Security Policy (CSP)-Header eliminieren mathematisch massive Klassen von XSS-Schwachstellen, indem sie genau vorschreiben, welche externen Skripte, Schriftarten und Stylesheets der Browser legal ausführen darf.",
      cspTitle: "Undurchdringliche CSP-Header",
      description:
        "Ein Deep-Dive in den äußeren Verteidigungsgürtel: Rate Limiting, CORS, Eingabevalidierung und physische Infrastrukturhärtung.",
      intro:
        "Sicherheit darf kein nachträglicher Gedanke sein, der auf die Anwendungsebene aufgesetzt wird. NEXORA härtet den Perimeter auf Infrastrukturebene und baut einen gewaltigen Schutzschild gegen volumetrische DDoS-Angriffe, Cross-Site Scripting und unautorisiertes Netzwerk-Traversal auf.",
      ipFiltering: "Schicht-4-IP-Whitelisting",
      ipFilteringDesc:
        "Beschränken Sie hochsensible administrative Endpunkte auf Datenverkehr, der strikt aus Ihrem Unternehmens-VPN oder physischen Büro-Subnetzen stammt.",
      networkSegment: "Mikrosegmentierung",
      networkSegmentDesc:
        "Isolieren Sie Datenbanken und Background-Worker in private, nicht routbare Subnetze, die vollständig vom öffentlichen Internet getrennt sind.",
      networkTitle: "Topologische Abschirmung",
      rateLimitContent:
        "Überleben Sie plötzliche Verkehrsspitzen und Brute-Force-Sweeps. NEXORA enthält ein verteiltes, Redis-gestütztes Rate Limiting, das missbräuchliche IP-Adressen oder spezifische JWTs dynamisch drosselt, bevor sie Datenbank-Verbindungspools erschöpfen können.",
      rateLimitTitle: "Verteiltes Throttling",
      reverseProxy: "Proxy-Header-Validierung",
      reverseProxyDesc:
        "Lösen Sie ursprüngliche Client-IPs sicher hinter Load Balancern mithilfe streng validierter X-Forwarded-For-Header auf und verhindern Sie so IP-Spoofing.",
      secretsContent:
        "Hardcodierte Passwörter sind eine katastrophale Schwachstelle. Die NEXORA-Konfigurations-Pipeline fängt sichere Zeichenfolgen beim Booten dynamisch ab und injiziert sie direkt aus Enterprise-Secret-Managern.",
      secretsTitle: "Zero-Trust Secret-Management",
      title: "Perimeter- & Infrastruktursicherheit",
      tlsInspection: "Zwingendes TLS 1.3",
      tlsInspectionDesc:
        "Erzwingen Sie die höchsten kryptographischen Cipher Suites und lehnen Sie gleichzeitig veraltete, unsichere Protokolle wie TLS 1.1 oder SSLv3 aggressiv ab.",
      warningNote:
        "Warnung: Die Deaktivierung dieser Standard-Verteidigungsmechanismen ohne Rücksprache mit Ihrem CISO vergrößert Ihre organisatorische Angriffsfläche drastisch.",
    },
    complianceReadiness: {
      auditReadyContent:
        "Prüfer wollen keine Versprechungen; sie wollen Beweise. NEXORA bietet exportierbare, manipulationssichere Protokolle für jeden API-Aufruf, jede Privilegienerweiterung und Datenmutation und verwandelt eine 6-monatige SOC 2-Vorbereitung in eine 2-wöchige Formalität.",
      auditReadyTitle: "Sofortige Beweisartefakte",
      checklistTitle: "Der Compliance-Fast-Track",
      consentMgmt: "Erweitertes Consent-Management",
      consentMgmtDesc:
        "Verfolgen, versionieren und erzwingen Sie die Zustimmung der Benutzer programmgesteuert über mehrere Datenschutzrichtlinien und Nutzungsbedingungen hinweg.",
      dataMinimization: "Intelligente Datenminimierung",
      dataMinimizationDesc:
        "Automatisches Ablaufen oder Schwärzen von PII (Personenbezogene Daten) aus Ihren Datenbanken, wenn Aufbewahrungsrichtlinien erfüllt sind.",
      dataPortability: "Sofortige Datenportabilität",
      dataPortabilityDesc:
        "Ermöglichen Sie es Benutzern, ein kryptographisches Archiv ihres gesamten Daten-Fußabdrucks sicher in maschinenlesbaren JSON-Formaten herunterzuladen.",
      description:
        "Vorkonfigurierte technische Kontrollen, die eine extrem schnelle Zertifizierung für ISO 27001, SOC 2 und DSGVO ermöglichen.",
      disclaimer:
        "Haftungsausschluss: NEXORA bietet die technische Grundlage; konsultieren Sie für verfahrenstechnische Compliance einen Rechtsbeistand.",
      frameworkIntro:
        "Das Erreichen von Compliance entgleist technische Roadmaps normalerweise für Monate. NEXORA verkürzt diese Kurve drastisch, indem die schwierigsten technischen Kontrollen direkt in das grundlegende Framework integriert sind.",
      frameworkTitle: "Beschleunigter Framework-Support",
      gdprTitle: "DSGVO & CCPA Nativ",
      intro:
        "Regulatorische Frameworks fordern eine strenge Data Governance. NEXORA beschleunigt Ihren Weg zur Zertifizierung durch die Einbettung von militärischen Audit-, Verschlüsselungs- und Datenschutzkontrollen tief in die Anwendungsarchitektur.",
      rightToErasure: "Orchestrierte Recht auf Löschung",
      rightToErasureDesc:
        "Führen Sie plattformweite Soft- oder Hard-Deletes aus, die automatisch über alle relationalen Tabellen hinweg kaskadieren.",
      securityControlsTitle: "Zugeordnete Sicherheitskontrollen",
      title: "Compliance-Bereitschaft",
    },
    auditCompliance: {
      alerting: "Echtzeit-Warnungen",
      alertingDesc:
        "Automatisieren Sie Sicherheitswarnungen über Webhooks oder Slack, wenn bestimmte hochprivilegierte Audit-Grenzwerte überschritten werden.",
      complianceContent:
        "NEXORA bietet einen schlüsselfertigen Weg zur Einhaltung von ISO 27001, SOC 2, HIPAA und DSGVO. Mit unveränderlicher Ereigniserfassung, garantierter Zuordnung und strikter Isolierung können Prüfer die Integrität der Daten Ihres Mandanten (Tenant) sofort verifizieren.",
      complianceTitle: "Gebaut für Compliance",
      dashboard: "Visuelles Dashboard",
      dashboardDesc:
        "Analysieren Sie Gigabytes an Audit-Daten in Echtzeit mit unseren hochleistungsfähigen Vue/Next.js-Reporting-Dashboards.",
      description:
        "Eine Audit-Pipeline auf forensischem Niveau, die HTTP-Anfragen, Entitäts-Snapshots und Sicherheitsoperationen ohne Datenverlust erfasst.",
      exportContent:
        "Exportieren Sie massive Audit-Datensätze direkt in verschlüsselte CSV- oder Excel-Formate, oder streamen Sie diese sicher in Ihre bestehenden SIEM-Lösungen wie Splunk oder Datadog.",
      exportTitle: "Forensischer Export & SIEM",
      intro:
        "Data Governance ist nicht verhandelbar. NEXORA verfügt über ein im Hintergrund laufendes, militärisch sicheres Audit-Log-System, das jede Mutation, jeden Authentifizierungsversuch und jeden kritischen Lesezugriff im gesamten Monolithen erfasst, ohne die API-Leistung zu beeinträchtigen.",
      liveStream: "Live-SignalR-Stream",
      liveStreamDesc:
        "Beobachten Sie administrative und sicherheitsrelevante Ereignisse in Echtzeit über geschützte WebSockets auf der gesamten Plattform.",
      pipelineContent:
        "Basierend auf dem Interceptor-Constraint-Modell von Entity Framework Core erstellt die Audit-Pipeline einen zeitlichen Snapshot Ihrer Entitäten vor und nach der Mutation. Änderungen werden in JSON serialisiert und unveränderlich gespeichert.",
      pipelineTitle: "Asynchrone Erfassungs-Pipeline",
      realTimeContent:
        "Beobachten Sie Ihr System mit transparenter Observability. Webhook-Integration und SignalR-Streams liefern sofortige forensische Einblicke, sodass Ihre DevSecOps-Teams proaktiv statt reaktiv handeln können.",
      realTimeTitle: "Echtzeit-Observability",
      retention: "Adaptive Aufbewahrung (Retention)",
      retentionDesc:
        "Konfigurieren Sie Cold-Storage-Richtlinien, die Audit-Protokolle basierend auf Ihren spezifischen zeitlichen Compliance-Grenzen automatisch archivieren oder löschen.",
      sourcesTitle: "Vier Säulen der Erfassung",
      title: "Audit- & Compliance-Engine",
    },
  },
};
