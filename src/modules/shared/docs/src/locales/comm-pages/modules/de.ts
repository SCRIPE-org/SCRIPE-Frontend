// FILE-EXCEPTION: file length
/**
 * Docs commercial page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  commercial: {
    moduleCatalog: {
      tblCoreR7C1: "Berechtigungen",
      tblCoreR7C2: "Editionsbasiertes Feature-Gating & Planverwaltung",
      tblCoreR7C3:
        "Funktionen, Editionen, Abonnements, Überschreibungen, Kontingentdurchsetzung, versionierte Rollouts, Reseller-Eingrenzung",
      businessContent:
        "SCRIPE ist keine leere Hülle; es ist vom ersten Tag an ein funktionierendes Enterprise-Ökosystem. Nutzen Sie unsere bestehenden Geschäftsmodule – wie Benutzerverwaltung, Audit-Logging und Benachrichtigungen – als sofortige Startpunkte oder klonen Sie diese, um proprietäre Funktionen schnell aufzubauen.",
      businessTitle: "Beschleunigte Geschäftslogik",
      commTitle: "Kommunikation & Webhooks",
      coreContent:
        "Die Foundation-Schicht bietet das absolut Nicht-Verhandelbare: den Identity Provider, Multi-Tenant-Auflösungsstrategien, EF Core-Context-Abstraktionen und den zentralisierten SCRIPE mediator-Dispatcher. Sie ist das felsenfeste Fundament, auf dem Ihre gesamte Anwendung skaliert.",
      coreTitle: "Das Kern-Fundament (Core Foundation)",
      crmModule: "Headless CRM Modul",
      crmModuleDesc:
        "Verwalten Sie Organisationshierarchien, Kundenbeziehungen und benutzerdefinierte Attribute mit einer vollständig API-gesteuerten CRM-Architektur.",
      customModule: "Proprietäres Integrationsmodul",
      customModuleDesc:
        "Eine makellose Sandbox, die exakt dieselben Clean Architecture-Grenzen nutzt, um Ihre einzigartige Branchenlogik aufzunehmen.",
      dataTitle: "Daten & Auditing",
      description:
        "Ein umfassendes Verzeichnis der vorgefertigten, produktionsreifen Enterprise-Bounded-Contexts, die in der SCRIPE-Plattform enthalten sind.",
      financeModule: "Invoicing & Billing Engine",
      financeModuleDesc:
        "Generieren Sie PDF-Rechnungen, verwalten Sie Steuerlokalitäten und integrieren Sie Stripe oder benutzerdefinierte Zahlungs-Gateways.",
      hrModule: "Identity & Access Management",
      hrModuleDesc:
        "Steuern Sie granulare rollenbasierte Berechtigungen, JWT-Lebensdauern und Verzeichnissynchronisationen.",
      independenceContent:
        "Jedes Modul im Katalog ist streng isoliert. Das Notification-Modul teilt null Status mit dem User Management-Modul. Sie kommunizieren rein über asynchrone Events, was garantiert, dass ein katastrophaler Ausfall in einer Domain niemals auf eine andere übergreift.",
      independenceTitle: "Kryptographische Modulisolierung",
      intro:
        "SCRIPE wird mit einer massiven Bibliothek an Enterprise-tauglichen, vorgetesteten Bounded Contexts ausgeliefert. Vom ersten Tag an besitzen Sie die operative Reife einer 5 Jahre alten SaaS-Anwendung.",
      inventoryModule: "Asset Tracking Modul",
      inventoryModuleDesc:
        "Bilden Sie komplexe hierarchische Bestände ab und verfolgen Sie Statusänderungen durch strikt angewendete Domain-Events.",
      projectModule: "Workflow & Project Modul",
      projectModuleDesc:
        "Verwalten Sie komplexe Zustandsautomaten (State Machines) und mehrstufige organisatorische Genehmigungs-Workflows.",
      title: "Katalog der Enterprise-Module",
      tblCoreHeader1: "Modul",
      tblCoreHeader2: "Beschreibung",
      tblCoreHeader3: "Kernfunktionen",
      tblCoreR1C1: "Identity & Auth",
      tblCoreR1C2: "Vollständige Authentifizierung und Benutzerverwaltung",
      tblCoreR1C3: "JWT, 2FA, Session Management, Geräte-Tracking, Social Login",
      tblCoreR2C1: "Mandantenfähigkeit (Multi-Tenancy)",
      tblCoreR2C2: "Mandantenisolierung und hierarchische Organisation",
      tblCoreR2C3:
        "Isolierung auf Zeilenebene, Parent/Child-Mandanten, mandantenspezifische Einstellungen, White-Labeling",
      tblCoreR3C1: "Rollen & Berechtigungen",
      tblCoreR3C2: "Feingranulare Zugriffskontrolle",
      tblCoreR3C3: "RBAC, Einschränkungen auf Feldebene, Berechtigungskategorien, Rollen-Klonen",
      tblCoreR4C1: "Audit System",
      tblCoreR4C2: "Umfassende Aktivitätsverfolgung",
      tblCoreR4C3:
        "4-Quellen-Pipeline: API, Entitätsänderungen, Sicherheitsereignisse, Geschäftsoperationen",
      tblCoreR5C1: "Menü-System",
      tblCoreR5C2: "Dynamisches Navigationsmanagement",
      tblCoreR5C3: "Selbstreferenzierender Baum, Mandanten-Overrides, rollenbasierte Sichtbarkeit",
      tblCoreR6C1: "Benutzergruppen (User Groups)",
      tblCoreR6C2: "Batch-Zuweisung von Rollen & Einschränkungen",
      tblCoreR6C3:
        "Gruppenbasierte RBAC, Feldeinschränkungen, Mitgliederverwaltung, mandantenbezogene Gruppen",
      tblCommHeader1: "Modul",
      tblCommHeader2: "Beschreibung",
      tblCommHeader3: "Kernfunktionen",
      tblCommR1C1: "Benachrichtigungen",
      tblCommR1C2: "Echtzeit-Push-Benachrichtigungen",
      tblCommR1C3:
        "SignalR WebSockets, Auto-Join nach Mandant, als gelesen/ungelesen markieren, Glocken-UI",
      tblCommR2C1: "E-Mail-System",
      tblCommR2C2: "Transaktionale E-Mail-Pipeline",
      tblCommR2C3:
        "Warteschlangenbasierter Versand, Scriban-Templates, Retry mit Backoff, SMTP/SendGrid",
      tblCommR3C1: "Webhooks",
      tblCommR3C2: "Ereignisgesteuerte Integrationen",
      tblCommR3C3:
        "HMAC-SHA256 signiert, exponentieller Retry, Abonnementverwaltung, Event-Katalog",
      tblCommR4C1: "Nachrichtenvorlagen",
      tblCommR4C2: "Zweisprachiges Nachrichten-Rendering",
      tblCommR4C3:
        "Scriban-Syntax, Variablenvorschau, 6 integrierte Vorlagen, zweisprachige Entität",
      tblDataHeader1: "Modul",
      tblDataHeader2: "Beschreibung",
      tblDataHeader3: "Kernfunktionen",
      tblDataR1C1: "Datei-Upload",
      tblDataR1C2: "Sichere Dateiverarbeitung",
      tblDataR1C3:
        "Bildverarbeitungs-Pipeline, Virus-Scan bereit, mandantenbezogener Speicher, 4 Backends",
      tblDataR2C1: "Download & Export",
      tblDataR2C2: "Datenexport und Dateiauslieferung",
      tblDataR2C3:
        "Fortsetzbare Downloads (Range), ETag Caching, Session-basiert, Schutz vor Path-Traversal",
      tblDataR3C1: "Papierkorb",
      tblDataR3C2: "Soft-Delete Management",
      tblDataR3C3:
        "Wiederherstellung mit Abhängigkeiten, geplante Bereinigung, kaskadierende Wiederherstellung, Richtlinien pro Entität",
      tblDataR4C1: "User Management",
      tblDataR4C2: "Administrative Benutzeroperationen",
      tblDataR4C3:
        "27 Endpunkte, Bulk-Operationen, Enterprise-Operationen, geschützte Admin-Regeln",
      tblAnalyticsHeader1: "Modul",
      tblAnalyticsHeader2: "Beschreibung",
      tblAnalyticsHeader3: "Kernfähigkeiten",
      tblAnalyticsR1C1: "Revenue Analytics",
      tblAnalyticsR1C2: "BI-Grade Umsatzintelligenz-Dashboard",
      tblAnalyticsR1C3:
        "MRR/ARR-Tracking, Kohortenanalyse, LTV-Modellierung, Umsatzprognose, Gesundheitsbewertung, PDF-Berichte",
      analyticsTitle: "Umsatzintelligenz",
      analyticsContent:
        "Die Revenue-Analytics-Engine transformiert rohe Abonnementdaten in umsetzbare Business-Intelligence. Mit 7 spezialisierten Dashboard-Tabs, automatisierten nächtlichen Snapshots und prädiktiver Prognose erhalten Plattformbetreiber CFO-Level-Sichtbarkeit ohne externe BI-Tools. Das Tenant-Gesundheitsscoring identifiziert Abwanderungsrisiken proaktiv, bevor sie sich materialisieren.",
      dbAgnosticTip:
        "Die Datenbank-Abstraktionsschicht von SCRIPE unterstützt PostgreSQL, SQL Server und SQLite nativ ohne Änderungen am Anwendungscode.",
    },
    complianceOverview: {
      title: "Compliance & Datenschutz",
      description:
        "Integrierte Automatisierung für DSGVO, CCPA und PDPA — Schützen Sie die Daten Ihrer Kunden ohne ein Heer von Juristen und Sicherheitsingenieuren.",
      intro:
        "Das SCRIPE Compliance-Modul stattet jeden Mandanten auf Ihrer Plattform ab Tag 1 mit unternehmensweitem Datenschutz aus, ohne dass Sie eine einzige Zeile Integrationscode schreiben müssen.",
      valueTitle: "Warum Compliance entscheidend ist",
      valueIntro:
        "Datenschutzgesetze verhängen drakonische Strafen: bis zu 20 Millionen Euro oder 4 % des weltweiten Jahresumsatzes bei DSGVO-Verstößen.",
      capabilitiesTitle: "Kernfähigkeiten",
      cap1: "DSR-Management — Automatisierte Workflows für Datenexport, Löschung, Berichtigung und Einschränkung mit SLA-Fristenüberwachung.",
      cap2: "Einwilligungs-Audit-Trail — Unveränderliche Historie jeder Einwilligung mit Zeitstempel, IP-Adresse und Versionsstand der Richtlinie.",
      cap3: "Aufbewahrungsrichtlinien — Automatisierte Durchsetzung von Aufbewahrungsfristen mit endgültiger Löschung oder Anonymisierung.",
      cap4: "Datenverarbeitungsverzeichnis — DSGVO-Artikel-30-konformes Verzeichnis von Verarbeitungstätigkeiten (RoPA) mit Sofort-Export.",
      cap5: "Prüfberichte — Asynchrone Generierung von DSGVO-Übersichten, DSR-Zusammenfassungen und Einwilligungsprüfungen.",
      targetTitle: "Zielgruppen",
      target1:
        "SaaS-Plattformen mit Kunden in der EU und im UK, die DSGVO-Funktionen bereitstellen müssen.",
      target2: "Unternehmen in Kalifornien, die den CCPA-Anforderungen unterliegen.",
      target3:
        "Sport-, Gesundheits- und Finanzorganisationen mit strengen gesetzlichen Aufbewahrungspflichten.",
      benefitsTitle: "Vorteile für Enterprise-Compliance",
      featureAutomatedDsrTitle: "Automatisierte DSR-Verarbeitung",
      featureAutomatedDsrDesc:
        "Reduzieren Sie die Bearbeitungszeit von Betroffenenanfragen von Wochen auf Minuten mit automatisierten Lösch- und Export-Pipelines.",
      featureConsentTitle: "Manipulationssichere Einwilligungsprotokollierung",
      featureConsentDesc:
        "Führen Sie unanfechtbare Prüfprotokolle über erteilte und widerrufene Einwilligungen für behördliche Prüfungen.",
      featureRetentionTitle: "Automatische Richtliniendurchsetzung",
      featureRetentionDesc:
        "Planen Sie Archivierungs- und Bereinigungsroutinen, um unzulässige Datenhaltung von vornherein auszuschließen.",
    },
    complianceGdpr: {
      title: "DSGVO-Konformität",
      description:
        "Wie SCRIPE Plattformbetreibern und Mandanten hilft, alle Pflichten der DSGVO über sechs Kernbereiche hinweg zu erfüllen.",
      intro:
        "Die Datenschutz-Grundverordnung (DSGVO) gilt für jede Organisation, die Daten von EU-Bürgern verarbeitet. SCRIPE automatisiert die Einhaltung standardmäßig.",
      articlesTitle: "Abgedeckte Kernartikel",
      art12:
        "Artikel 12–14 — Transparenz, verständliche Datenschutzerklärungen und granulare Nachweise.",
      art15: "Artikel 15–22 — Vollständige Umsetzung aller acht Betroffenenrechte (DSR).",
      art25:
        "Artikel 25 — Datenschutz durch Technikgestaltung und datenschutzfreundliche Voreinstellungen.",
      art30: "Artikel 30 — Automatisches Verzeichnis von Verarbeitungstätigkeiten (RoPA).",
      art32:
        "Artikel 32 — Sicherheit der Verarbeitung, Ende-zu-Ende-Verschlüsselung im Ruhezustand und bei der Übertragung.",
      mappingTitle: "DSGVO-Verarbeitungsverzeichnis & Mapping",
      articleCol: "DSGVO-Artikel / Rechtliche Vorgabe",
      scripeFeatureCol: "Integrierte SCRIPE-Funktion",
      featureAccess:
        "Art. 15 (Auskunftsrecht) automatisierter Export personenbezogener Datenpakete",
      featureErasure:
        "Art. 17 (Recht auf Löschung) kaskadierende Lösch- und Anonymisierungs-Engine",
      featureRopa:
        "Art. 30 (Verzeichnis von Verarbeitungstätigkeiten) exportierbares Live-Verzeichnis",
    },
    complianceDsr: {
      title: "Betroffenenrechte (DSR)",
      description:
        "Vollständige Orchestrierung von Datenzugriffs-, Lösch- und Berichtigungsanfragen gemäß Art. 15–22 DSGVO.",
      intro:
        "Unternehmen müssen DSR-Anfragen innerhalb von 30 Tagen beantworten. SCRIPE automatisiert den gesamten Lebenszyklus und verhindert Fristüberschreitungen.",
      workflowTitle: "DSR-Bearbeitungszyklus",
      step1: "Der Nutzer reicht eine Anfrage ein (Export, Löschung, Berichtigung oder Sperrung).",
      step2: "Das System legt einen unveränderlichen Datensatz im Status 'Ausstehend' an.",
      step3:
        "Ein Compliance-Beauftragter wird zugewiesen; der Status wechselt auf 'In Bearbeitung'.",
      step4:
        "Die Anfrage wird ausgeführt und mit detaillierter Begründung als 'Abgeschlossen' oder 'Abgelehnt' archiviert.",
      slaTitle: "SLA- und Fristenüberwachung",
      slaIntro:
        "Echtzeit-Tracking der gesetzlichen 30-Tage-Frist mit automatischen Warnmeldungen vor Fristablauf.",
      automationTitle: "DSR-Automatisierung für Betroffenenrechte",
      automationIntro:
        "Recht auf Auskunft, Berichtigung und Löschung auf Knopfdruck über alle Systemmodule hinweg ausführen.",
    },
    complianceRoi: {
      title: "Wirtschaftlichkeit & ROI von Compliance",
      description:
        "Kosteneinsparungen, Risikominimierung und Wettbewerbsvorteile durch native Compliance-Automatisierung.",
      intro:
        "Mit SCRIPE wird Datenschutz vom reinen Kostenfaktor zum überzeugenden Verkaufsargument im Enterprise-Vertrieb.",
      savingsTitle: "Messbare Kostenvorteile",
      savings1:
        "Vermeidung existenzbedrohender Bußgelder durch lückenlose automatisierte Durchsetzung.",
      savings2:
        "Einsparung von über 200 Entwicklerstunden pro Jahr im Vergleich zu selbst entwickelten DSR-Systemen.",
      savings3:
        "Drastische Reduzierung externer Rechtsberatungskosten durch prüfungsbereite Berichte auf Knopfdruck.",
      competitiveTitle: "Wettbewerbsvorteile",
      competitive1:
        "Schnellere Abschlüsse im Enterprise-Segment durch vorgefertigte Compliance-Zertifikate.",
      competitive2: "Reibungslose internationale Expansion in regulierte Märkte (EU, UK, USA).",
      competitive3: "Höchstes Vertrauen bei Endnutzern, Sportlern und Erziehungsberechtigten.",
      metricCol: "Compliance-Risikobereich / Kosten",
      impactCol: "Wirtschaftlicher Effekt durch SCRIPE",
      metricManualDsr: "Manueller Aufwand für Betroffenenrechte (DSR)",
      impactManualDsr: "85 % Zeitersparnis durch automatisierte Auffindung und Erledigung",
      metricFines: "Bußgeldrisiko bei Nichteinhaltung gesetzlicher Vorgaben",
      impactFines:
        "Minimiertes Risiko durch integrierte DSGVO-Kontrollen und lückenlose Audit-Trails",
    },
    pluginsOverview: {
      title: "Plugin- & Ökosystem-Plattform",
      description:
        "Erweiterbarkeit auf Enterprise-Niveau: In-Process-Plugins für maximale Geschwindigkeit oder isolierte Sandbox-Plugins für den Marktplatz.",
      intro:
        "Das SCRIPE Plugin-System ermöglicht unbegrenzte funktionale Erweiterungen, ohne den Plattformkern oder die Stabilität zu gefährden.",
      valueTitle: "Strategischer Mehrwert",
      featureExtTitle: "Grenzenlose Skalierbarkeit",
      featureExtDesc:
        "Integrieren Sie neue Funktionen – CRM-Kopplungen, KI-Assistenten, spezialisierte Widgets – ohne Quellcode-Änderungen am Kern.",
      featureSandboxTitle: "Sichere Sandbox-Isolation",
      featureSandboxDesc:
        "Tier-2-Plugins laufen vollkommen isoliert in einem geschützten REST-Gateway ohne direkten Datenbankzugriff.",
      featureMarketTitle: "Bereit für Marktplätze",
      featureMarketDesc:
        "Integrierter Kurskatalog, Installations-Workflows und Berechtigungsprüfungen für Partner und Entwickler.",
      featureFastTitle: "Schnelle Integration",
      featureFastDesc:
        "Nahtlose Einbindung von Menüeinträgen, Einstellungsseiten und Hintergrundaufgaben über ein standardisiertes SDK.",
      featureLogsTitle: "Detaillierte Ausführungslogs",
      featureLogsDesc:
        "Vollständige Protokollierung jedes API-Aufrufs mit Latenz, Statuscode und Mandantenkontext zur einfachen Fehleranalyse.",
      featureI18nTitle: "Mehrsprachig & RTL-fähig",
      featureI18nDesc:
        "Automatische Übergabe von Sprache, LTR/RTL-Ausrichtung und Farbschemata an alle Plugin-Oberflächen.",
      tiersTitle: "Tier 1 vs. Tier 2 Architektur",
      tiersIntro:
        "Tier 1 für zertifizierte Hochleistungskomponenten, Tier 2 für Drittanbieter- und Marktplatz-Plugins.",
      tier1Title: "Tier 1 — Zertifiziert & In-Process",
      tier1Point1: "Ausführung im gleichen Prozess — minimale Latenz unter 1 Millisekunde",
      tier1Point2: "Voller Zugriff auf Dependency Injection, Entity Framework und Domain-Events",
      tier1Point3: "Frontend-Integration über moderne Module Federation",
      tier1Point4: "Implementiert den IPluginStartup-Lebenszyklusvertrag",
      tier2Title: "Tier 2 — Isolierter Marktplatz",
      tier2Point1: "Vollständig gekapselt — kein Zugriff auf Geheimnisse des Host-Systems",
      tier2Point2: "Rate-Limiting (Standard: 60 Anfragen pro Minute je Installation)",
      tier2Point3: "Sichere iframe-Einbettung mit typisiertem postMessage-SDK",
      tier2Point4: "Separater Key-Value-Datenspeicher pro Mandant und Installation",
      audienceTitle: "Mehrwert nach Rollen",
      audienceIntro:
        "Das Plugin-Ökosystem schafft greifbare Vorteile für alle Akteure der Plattform.",
      audRole: "Rolle",
      audBenefit: "Vorteil",
      audPlatform: "Plattformbetreiber",
      audPlatformBenefit:
        "Schnelle Einführung neuer Funktionen ohne Kern-Releases und flexible Monetarisierung.",
      audTenant: "Mandanten-Administrator",
      audTenantBenefit:
        "Aktivierung maßgeschneiderter Werkzeuge für den eigenen Verein oder Betrieb in wenigen Klicks.",
      audPartner: "Entwickler & Partner",
      audPartnerBenefit:
        "Entwicklung und Vermarktung eigener Lösungen auf einer stabilen, zukunftssicheren Plattform.",
      audDeveloper: "Kern-Entwickler",
      audDeveloperBenefit:
        "Klare Trennung von Basisfunktionen und Spezialanforderungen durch modulare Verträge.",
      securityTitle: "Sicherheitsarchitektur",
      securityIntro:
        "Sicherheit by Design: Schlüsselverschlüsselung, Ursprungsprüfung und strikte Trennung von Mandantendaten.",
      securityNoteTitle: "Schutz vor Übergriffen",
      securityNoteContent:
        "Plugins berühren niemals fremde Mandantendaten; API-Schlüssel werden als SHA-256-Hashes gespeichert.",
    },
    venueOperations: {
      title: "Sportstätten- & Ressourcenmanagement",
      description:
        "Maximale Auslastung von Hallen, Plätzen und Trainingszonen, 100 % konfliktfreie Buchungen durch atomare Sperren und flexible Belegungspläne.",
      intro:
        "Verwandeln Sie Sportanlagen und Sportparks in hochrentable, automatisierte Umsatzquellen mit Echtzeit-Verfügbarkeitsabfragen und intelligenter Ressourcenplanung.",
      statConflicts: "Doppelbuchungs-Garantie",
      statUtilization: "Höhere Flächenauslastung",
      statHoldTtl: "Atomare Buchungssperre",
      statSync: "Kanalübergreifender Echtzeitabgleich",
      valueTitle: "Warum führende Sportanlagenbetreiber SCRIPE wählen",
      featMultiFacility: "Komplexe Anlagen-Topologie",
      featMultiFacilityDesc:
        "Strukturieren Sie Großanlagen mit Hallen, Halbfeldern, Geräten und Besprechungsräumen in einer zentralen Übersicht.",
      featHoldEngine: "Atomare Buchungssperren",
      featHoldEngineDesc:
        "Eine 15-minütige Reservierungssperre garantiert null Konflikte zwischen mobilen Buchungen und der Rezeption.",
      featDynamicSchedules: "Dynamische Betriebszeiten",
      featDynamicSchedulesDesc:
        "Automatisieren Sie saisonale Öffnungszeiten, Flutlichtzeiten und Feiertagsregelungen ohne manuellen Aufwand.",
      featBlackouts: "Sofortige Sperrzeiten",
      featBlackoutsDesc:
        "Sperren Sie Plätze bei schlechtem Wetter oder Turnieren im Handumdrehen mit automatischer Kundenbenachrichtigung.",
      featMonetization: "Direkte Abrechnungsanbindung",
      featMonetizationDesc:
        "Nahtlose Verknüpfung mit der Preisfindungs-Engine für Spitzenzeitenaufschläge und automatische Rechnungserstellung.",
      featMobileReady: "Self-Service für Sportler",
      featMobileReadyDesc:
        "Spieler und Trainer finden freie Plätze, reservieren und bezahlen in unter 30 Sekunden direkt am Smartphone.",
      roiTitle: "Wirtschaftlicher Vergleich",
      tableHeaderMetric: "Betriebskennzahl",
      tableHeaderTraditional: "Herkömmliche Software / Tabellen",
      tableHeaderScripe: "SCRIPE Venue Engine",
      metricBookingLatency: "Online-Buchungslatenz",
      tradBookingLatency: "Manuelle Terminabstimmung per Telefon/E-Mail dauert 15–45 Minuten",
      scripeBookingLatency:
        "Sofortige Self-Service-Buchung in Sekundenbruchteilen mit automatischer Bestätigung",
      metricDoubleBookings: "Doppelbuchungen",
      tradDoubleBookings: "2 – 5 % aller Monatsbuchungen",
      scripeDoubleBookings: "0 % (Kryptographisch garantiert)",
      metricUnsoldSlots: "Auslastung außerhalb der Spitzenzeiten",
      tradUnsoldSlots: "Hoher Leerstand (35–50 %) durch starre Preise und fehlendes Marketing",
      scripeUnsoldSlots: "Automatisierte dynamische Rabatte senken den Leerstand auf unter 12 %",
      metricAdminLabor: "Verwaltungsaufwand des Personals",
      tradAdminLabor:
        "Über 25 Stunden wöchentlich für Terminplanung, Zahlungsverfolgung und Mahnwesen",
      scripeAdminLabor:
        "Unter 3 Stunden wöchentlich: 90 % Automatisierung von Rechnungen und Bestätigungen",
      ctaTitle: "Bereit für moderne Sportstättenverwaltung?",
      ctaSubtitle:
        "Entdecken Sie unsere interaktiven Preispläne oder lesen Sie die technische Dokumentation.",
      ctaPrimary: "Preise ansehen",
      ctaSecondary: "Technische Doku lesen",
    },
    catalogPricing: {
      title: "Katalog & Dynamische Preisfindung",
      description:
        "Schutz vor Margenverlusten, automatisierte Firmenverträge und dynamische Tarife für alle Produkte, Dienstleistungen und Abonnements.",
      intro:
        "Verwandeln Sie starre Preislisten in hochflexible Vertriebswerkzeuge mit versionierten Preisbüchern und Staffelrabatten.",
      statAuditability: "Prüfsichere Preisschnappschüsse",
      statQuotingSpeed: "Angebotserstellung in Echtzeit",
      statCurrencies: "Multi-Währungsfähig",
      statDiscounts: "Automatischer Margenschutz",
      valueTitle: "Strategische Geschäftsvorteile",
      featPriceBooks: "Versionierte Preisbücher",
      featPriceBooksDesc:
        "Planen Sie Preisänderungen im Voraus mit Stichtagslogik, saisonalen Raten und mandantenspezifischen Anpassungen.",
      featQuotation: "Sub-Sekunden-Kalkulation",
      featQuotationDesc:
        "Berechnen Sie komplexe Positionen, Mengenrabatte, Steuersätze und Aktionen in Millisekunden.",
      featDiscounts: "Kombinierbare Rabattregeln",
      featDiscountsDesc:
        "Erstellen Sie zielgerichtete Frühbucherrabatte und Bundle-Aktionen mit strikten Margenuntergrenzen.",
      featAgreements: "B2B-Firmenkundenverträge",
      featAgreementsDesc:
        "Hinterlegen Sie individuelle Vertragskonditionen und Sponsorenpreise, die automatisch angewendet werden.",
      featTaxes: "Präzise Steuerkonformität",
      featTaxesDesc:
        "Länder- und standortspezifische Mehrwertsteuersätze werden deterministisch auf jede Position angewendet.",
      featVersioning: "Unveränderliche Schnappschüsse",
      featVersioningDesc:
        "Bestätigte Angebote frieren die Konditionen ein; spätere Katalogänderungen berühren historische Rechnungen nicht.",
      roiTitle: "Wirtschaftlicher Mehrwert",
      tableHeaderMetric: "Kennzahl",
      tableHeaderTraditional: "Manuelle Kalkulation / Excel",
      tableHeaderScripe: "SCRIPE Catalog & Pricing",
      metricTurnaround: "Angebotsdauer",
      tradTurnaround: "15 – 45 Minuten manuelle Arbeit",
      scripeTurnaround: "< 10 Millisekunden vollautomatisch",
      metricMarginLeakage: "Margenverlust durch Rabatte",
      tradMarginLeakage: "3 – 8 % unkontrollierte Nachlässe",
      scripeMarginLeakage: "0 % dank strikter Systemregeln",
      metricTaxCompliance: "Steuerberechnungsfehler",
      tradTaxCompliance: "Häufige Abweichungen bei Prüfungen",
      scripeTaxCompliance: "100 % fehlerfreie Steuerlogik",
      ctaTitle: "Aktivieren Sie dynamisches Preiswachstum",
      ctaSubtitle:
        "Erfahren Sie, wie automatisierte Preisbücher Ihren Deckungsbeitrag nachhaltig steigern.",
      ctaPrimary: "Tarife entdecken",
      ctaSecondary: "Entwickler-Dokumentation",
    },
    financeSettlement: {
      title: "Finanzen & Multi-POS-Abrechnung",
      description:
        "Schnellerer Cashflow, Beseitigung manueller Abstimmungsfehler und lückenlose doppelte Buchführung für Wirtschaftsprüfer.",
      intro:
        "Schluss mit monatlichen Abstimmungsmarathons: SCRIPE Finance bietet automatisierte Rechnungsstellung, Multi-Channel-Zahlungserfassung und deterministische FIFO-Mittelverwendung.",
      statAuditability: "Prüfungsbereiter Audit-Trail",
      statUnreconciled: "Nicht abgestimmte Posten",
      statAllocation: "Automatisierte Zahlungszuordnung",
      statChannels: "Einheitliche Kanalerfassung",
      valueTitle: "Finanz-Governance für Großorganisationen",
      featInvoices: "Automatisierte Kundenfaktura",
      featInvoicesDesc:
        "Generieren Sie mehrsprachige PDF-Rechnungen für Platzmieten, Akademie-Beiträge und Gastronomie.",
      featPayments: "Multi-Channel-Zahlungseingang",
      featPaymentsDesc:
        "Verarbeiten Sie Online-Zahlungs-Gateways, Terminal-Kartenzahlungen, Überweisungen und Bargeld in einer zentralen Kasse.",
      featAllocation: "Atomare Zahlungszuordnung",
      featAllocationDesc:
        "Trennen Sie Zahlungen von Rechnungen und ordnen Sie Gelder deterministisch (FIFO oder manuell) centgenau zu.",
      featRefunds: "Rechtssichere Rückerstattungen",
      featRefundsDesc:
        "Verknüpfen Sie Teil- oder Vollrückerstattungen direkt mit der Ursprungstransaktion zur Vermeidung von Doppelüberweisungen.",
      featAdjustments: "Gutschriften & Korrekturbuchungen",
      featAdjustmentsDesc:
        "Buchen Sie Kulanzgutschriften und Streitbeilegungen mit verpflichtender Angabe von Prüfgründen.",
      featLedgerSync: "Hauptbuch-kompatibler Export",
      featLedgerSyncDesc:
        "Exportieren Sie strukturierte Buchungssätze für DATEV, SAP, QuickBooks, Xero und Microsoft Dynamics.",
      roiTitle: "Finanzielle Effizienzmetriken",
      tableHeaderMetric: "Finanzprozess",
      tableHeaderTraditional: "Herkömmliche Buchhaltung / Insellösungen",
      tableHeaderScripe: "SCRIPE Finance Engine",
      metricDaysSalesOutstanding: "Forderungslaufzeit (DSO)",
      tradDso: "45 – 60 Tage im Schnitt",
      scripeDso: "14 Tage durch automatisierte Erinnerungen",
      metricReconciliationTime: "Monatsabschluss-Dauer",
      tradReconTime: "4 – 6 Tage mühsame Kleinarbeit",
      scripeReconTime: "< 2 Stunden vollautomatisch",
      metricManualErrors: "Abstimmungsdifferenzen",
      tradErrors: "3 – 7 % Fehlerrate über Filialen hinweg",
      scripeErrors: "0 % dank mathematisch bewiesener Doppelbuchung",
      ctaTitle: "Bringen Sie Transparenz in Ihre Finanzen",
      ctaSubtitle:
        "Skalieren Sie Ihren Betrieb mit voller Buchungskontrolle und ohne Umsatzausfälle.",
      ctaPrimary: "Finanzlösungen ansehen",
      ctaSecondary: "Technische Details",
    },
    workforceHrms: {
      title: "Mitarbeiterverwaltung & Trainer-Compliance",
      description:
        "Automatische Prüfung von Trainerlizenzen, Minimierung von Haftungsrisiken und einfache Schichtplanung über alle Sportanlagen.",
      intro:
        "Schützen Sie Ihre Athleten und sichern Sie die Ausbildungsqualität: SCRIPE HRMS überwacht Qualifikationen, Erste-Hilfe-Zertifikate und Verfügbarkeiten in Echtzeit.",
      statCompliance: "Konforme Trainingseinheiten",
      statExpiredCerts: "Vorfälle mit abgelaufenen Lizenzen",
      statRosterSync: "Mobile Dienstplan-Synchronisation",
      statSchedulingLabor: "Schichtplanungs-Aufwand",
      valueTitle: "Warum sportliche Leiter auf SCRIPE HRMS vertrauen",
      featStaffProfiles: "Ganzheitliche Trainerprofile",
      featStaffProfilesDesc:
        "Zentrale Verwaltung von Lizenzen, Fachgebieten, Notfallkontakten und Beschäftigungsverhältnissen.",
      featCertTracking: "Automatische Fristenwarnungen",
      featCertTrackingDesc:
        "Rechtzeitige Benachrichtigungen vor Ablauf von Trainerlizenzen, Erste-Hilfe-Scheinen und Führungszeugnissen.",
      featRosters: "Intelligente Schicht- & Platzzuweisung",
      featRostersDesc:
        "Weisen Sie Trainer verfügbaren Plätzen und Kursen zu – mit Prüfung von Überschneidungen und Ruhezeiten.",
      featSkillMatching: "Qualifikationsbasierte Besetzung",
      featSkillMatchingDesc:
        "Das System stellt sicher, dass für Jugend- oder Leistungskurse nur Trainer mit passender Lizenzstufe eingeteilt werden.",
      featMobileAccess: "Mobiles Trainerportal",
      featMobileAccessDesc:
        "Mitarbeiter sehen ihre Einsätze, tragen Verfügbarkeiten ein und erhalten Änderungen sofort per Push-Nachricht.",
      featContractTypes: "Flexible Vertragsmodelle",
      featContractTypesDesc:
        "Verwaltung von Festangestellten, Honorartrainern, Minijobbern und ehrenamtlichen Helfern.",
      roiTitle: "HR-Kennzahlen im Vergleich",
      tableHeaderMetric: "Prozess",
      tableHeaderTraditional: "Excel / WhatsApp-Gruppen",
      tableHeaderScripe: "SCRIPE HRMS",
      metricAuditReadiness: "Prüfbereitschaft von Lizenzen",
      tradAuditReadiness: "Tage mühsamer Ordnersuche",
      scripeAuditReadiness: "Echtzeit-Nachweis in 5 Sekunden",
      metricSchedulingHours: "Planungszeit pro Woche",
      tradSchedulingHours: "8 – 12 Stunden für Manager",
      scripeSchedulingHours: "< 1 Stunde durch Vorlagen & Zuweisung",
      metricLiabilityRisk: "Haftungsrisiko abgelaufener Lizenzen",
      tradLiabilityRisk: "Hoch (oft unbemerkt)",
      scripeLiabilityRisk: "0 % durch automatische Einteilungssperren",
      ctaTitle: "Optimieren Sie Ihre Trainer- und Personalverwaltung",
      ctaSubtitle:
        "Verbinden Sie Dienstpläne, Platzbuchungen und Qualifikationsprüfungen in einem System.",
      ctaPrimary: "HRMS entdecken",
      ctaSecondary: "Architektur einsehen",
      featCertificationTracking: "Zertifizierungs- & Lizenzüberwachung",
      featCertificationTrackingDesc:
        "Verwalten Sie Trainerlizenzen, Gesundheitszeugnisse und Qualifikationen mit automatischen Ablauferinnerungen.",
      featAvailabilityEngine: "Verfügbarkeits- & Schichtplanung",
      featAvailabilityEngineDesc:
        "Konfigurieren Sie Arbeitszeitmodelle, Urlaubspläne und Sperrzeiten zur fehlerfreien Trainingsplanung.",
      featShiftRostering: "Dienstplanerstellung & Zuweisung",
      featShiftRosteringDesc:
        "Erstellen Sie komplexe Dienstpläne und weisen Sie Teams Sportanlagen und Trainingszeiten flexibel zu.",
      featComplianceGates: "Automatisierte Compliance-Prüfungen",
      featComplianceGatesDesc:
        "Sperren Sie Trainer automatisch für Einsätze, falls Pflichtzertifikate oder Nachweise abgelaufen sind.",
      featCoachAppIntegration: "Nahtlose Trainer-App-Anbindung",
      featCoachAppIntegrationDesc:
        "Echtzeit-Synchronisierung von Dienstplänen und Aufgaben direkt auf die Mobilgeräte des Trainerstabs.",
    },
    customer360: {
      title: "Kunden-360 & Party-Kernel",
      description:
        "Konsolidierte Stammkundenprofile, flexible Familien- und Betreuerverknüpfungen und KI-gestützte Duplikaterkennung.",
      intro:
        "Verabschieden Sie sich von zersplitterten Kundendaten: Der Party-Kernel vereint Sportler, Eltern, Sponsoren und Lieferanten in einem sauberen Beziehungsnetz.",
      statDuplication: "Duplikat-Quote im Stamm",
      statProfileTime: "Profilabruf-Latenz",
      statRelations: "Unterstützte Beziehungsarten",
      statMergeSafety: "Verlustfreie Zusammenführung",
      valueTitle: "Das Herzstück Ihrer Kundendaten",
      featPolymorphic: "Polymorphe Akteurs-Architektur",
      featPolymorphicDesc:
        "Ein einheitliches Modell für natürliche Personen, juristische Körperschaften, Schulen und Sponsoren.",
      featFamilyGraph: "Dynamische Beziehungsbäume",
      featFamilyGraphDesc:
        "Bilden Sie Eltern-Kind-Verknüpfungen, Firmen-Mitarbeiter-Beziehungen und Bevollmächtigungen transparent ab.",
      featMultiRole: "Mehrfachrollen pro Akteur",
      featMultiRoleDesc:
        "Eine Person kann gleichzeitig aktiver Spieler, Trainer und zahlender Elternteil sein – ohne Profilduplikate.",
      featDeduplication: "Phonetische Duplikaterkennung",
      featDeduplicationDesc:
        "Intelligente Erkennung ähnlicher Namen und Schreibweisen mit sicherem Vorschlags- und Zusammenführungs-Workflow.",
      featTimeline: "Vollständige Kundenhistorie",
      featTimelineDesc:
        "Zentraler Zeitstrahl mit allen Buchungen, Rechnungen, Supportanfragen und Kommunikationsereignissen.",
      featPrivacy: "Integrierter DSGVO-Schutz",
      featPrivacyDesc:
        "Rechtssichere Anonymisierung und einfache Datenauskunft direkt aus der Akteursakte heraus.",
      roiTitle: "Datenqualität im Vergleich",
      tableHeaderMetric: "Qualitätskriterium",
      tableHeaderTraditional: "Verteilte Datentöpfe / Silos",
      tableHeaderScripe: "SCRIPE Customer 360",
      metricDuplicates: "Doppelte Datensätze",
      tradDuplicates: "12 – 25 % Datenmüll",
      scripeDuplicates: "< 1 % dank proaktivem Abgleich",
      metricServiceSpeed: "Auskunftszeit am Telefon",
      tradServiceSpeed: "3 – 5 Minuten Systemwechsel",
      scripeServiceSpeed: "< 5 Sekunden auf einen Blick",
      metricMarketingPrecision: "Treffsicherheit im Marketing",
      tradMarketingPrecision: "Niedrig durch Streuverluste",
      scripeMarketingPrecision: "Hoch durch präzise Rollensegmentierung",
      ctaTitle: "Gewinnen Sie den vollständigen Überblick über Ihre Kunden",
      ctaSubtitle:
        "Stärken Sie die Kundenbindung mit personalisiertem Service auf Enterprise-Niveau.",
      ctaPrimary: "Lösung kennenlernen",
      ctaSecondary: "Entwickler-Dokumentation",
      featUnifiedParties: "Einheitliches Akteursmodell (Party Core)",
      featUnifiedPartiesDesc:
        "Konsolidiertes Modell für Personen, juristische Einheiten und Partner in einem zentralen Stammdatensatz.",
      featRelationships: "Vielschichtige Beziehungsstrukturen",
      featRelationshipsDesc:
        "Erfassen Sie Eltern-Kind-Verhältnisse, Sponsorenkontakte und Vereinszugehörigkeiten flexibel.",
      featDynamicRoles: "Dynamische Rollenverteilung",
      featDynamicRolesDesc:
        "Eine Person kann parallel mehrere Rollen (z. B. Trainer, Erziehungsberechtigter, Mitglied) ohne Datenduplikate einnehmen.",
      featSmartDeduplication: "Intelligente Dublettenbereinigung",
      featSmartDeduplicationDesc:
        "Abgleichsalgorithmen verhindern doppelte Kontaktdatensätze und garantieren Datenqualität.",
      featOmniContacts: "Omnichannel-Kontakthistorie",
      featOmniContactsDesc:
        "Bündelung von Telefonnummern, E-Mail-Adressen und Rechnungsanschriften mit Verifikationsstatus.",
      featGdprReadiness: "DSGVO-konforme Datenverwaltung",
      featGdprReadinessDesc:
        "Direkte Anbindung an Compliance-Pipelines für den sofortigen Datenexport und das Recht auf Vergessenwerden.",
    },
    organizationCore: {
      title: "Unternehmenshierarchie & Filialstruktur",
      description:
        "Modellieren Sie Holding-Strukturen, regionale Niederlassungen, Sportzentren und Abteilungen mit strikter Datenisolierung.",
      intro:
        "Von der Dachgesellschaft bis zum einzelnen Trainingsplatz: SCRIPE bildet mehrstufige Unternehmensstrukturen ab und delegiert Befugnisse punktgenau.",
      statTiers: "Hierarchie-Ebenen",
      statIsolation: "Mandanten- & Standorttrennung",
      statRollup: "Finanz-Konsolidierung",
      statPermissions: "Granulare Standortrechte",
      valueTitle: "Strukturierte Kontrolle für wachsende Organisationen",
      featTiers: "6-stufige Hierarchie-Modellierung",
      featTiersDesc:
        "Rechtsträger → Geschäftsbereiche → Regionen → Standorte → Abteilungen → Teams in einer sauberen Baumstruktur.",
      featScoping: "Kontextbezogene Datenfilterung",
      featScopingDesc:
        "Standortleiter sehen nur ihre eigenen Kennzahlen, während die Geschäftsführung aggregierte Berichte erhält.",
      featLegalEntities: "Eigenständige Rechtsträger",
      featLegalEntitiesDesc:
        "Hinterlegen Sie separate Steuernummern, Firmenbezeichnungen und Bankverbindungen pro Gesellschaft.",
      featBranding: "Standortspezifisches Branding",
      featBrandingDesc:
        "Individuelle Logos, Farben und E-Mail-Vorlagen für einzelne Akademien oder Center.",
      featResourceSharing: "Standortübergreifende Ressourcen",
      featResourceSharingDesc:
        "Ermöglichen Sie Sportlern die Nutzung mehrerer Standorte mit einer gemeinsamen Mitgliedschaft.",
      featAudit: "Zentraler Revisionspfad",
      featAuditDesc:
        "Lückenlose Nachverfolgung aller strukturellen Anpassungen für Wirtschaftsprüfer und Compliance-Audits.",
      roiTitle: "Organisatorische Leistungsfähigkeit",
      tableHeaderMetric: "Dimension",
      tableHeaderTraditional: "Getrennte Einzelsysteme",
      tableHeaderScripe: "SCRIPE Organization Core",
      metricMultiSiteSetup: "Neuen Standort anbinden",
      tradMultiSiteSetup: "Wochenlange IT-Projekte",
      scripeMultiSiteSetup: "< 10 Minuten über die Admin-Konsole",
      metricReportingEffort: "Konzernweites Reporting",
      tradReportingEffort: "Tage manueller Excel-Zusammenführung",
      scripeReportingEffort: "Echtzeit-Dashboards auf Knopfdruck",
      metricComplianceOverhead: "Audit-Nachweise",
      tradComplianceOverhead: "Extrem fehleranfällig",
      scripeComplianceOverhead: "Lückenlos und revisionssicher",
      ctaTitle: "Strukturieren Sie Ihre Sportorganisation professionell",
      ctaSubtitle: "Schaffen Sie das Fundament für profitables, standortübergreifendes Wachstum.",
      ctaPrimary: "Hierarchie-Lösung entdecken",
      ctaSecondary: "Architekturhandbuch lesen",
      featBusinessUnits: "Geschäftsbereiche & Sparten",
      featBusinessUnitsDesc:
        "Strukturieren Sie das Unternehmen in autonome Organisationseinheiten mit eigener Kostenstellenrechnung.",
      featRegionalBranches: "Regionale Niederlassungen",
      featRegionalBranchesDesc:
        "Standortverwaltung unter Berücksichtigung lokaler Zeitzonen, Währungen und gesetzlicher Vorschriften.",
      featCampusesSites: "Sportstätten & Liegenschaften",
      featCampusesSitesDesc:
        "Verwaltung von Sportanlagen, Trainingszentren und Hallen mit Verknüpfung zu den zuständigen Standorten.",
      featOperationalTeams: "Fach- & Projektteams",
      featOperationalTeamsDesc:
        "Interdisziplinäre Teamzusammensetzungen für standortübergreifende Aufgaben und Wettkämpfe.",
      featCrossBranchGovernance: "Zentrale Unternehmens-Governance",
      featCrossBranchGovernanceDesc:
        "Einheitliche Sicherheits- und Compliance-Richtlinien für alle Niederlassungen und Standorte.",
    },
    mediaDam: {
      title: "Digital Asset Management & Mediendienst",
      description:
        "Sicherer Upload großer Dateien, automatische Virenprüfung, Cloud-Speicheranbindung und geschützte Download-URLs.",
      intro:
        "Verwalten Sie Sportlerfotos, Trainerzertifikate, Spielaufzeichnungen und Rechnungsbelege mit Ausfallsicherheit und Banken-Sicherheitsstandards.",
      statUploadSpeed: "Wiederaufnehmbare Uploads",
      statSecurity: "Automatische Virenprüfung",
      statBackends: "Unterstützte Speicher-Backends",
      statAccess: "Zeitbegrenzte Signierte URLs",
      valueTitle: "Medienverwaltung ohne Sicherheitsrisiken",
      featChunked: "Resumable Multipart-Uploads",
      featChunkedDesc:
        "Laden Sie Videos und große Dokumente zuverlässig hoch – selbst bei schwankenden Mobilfunkverbindungen.",
      featAntiVirus: "Echtzeit-Malware-Scanning",
      featAntiVirusDesc:
        "Jede hochgeladene Datei wird vor der Freigabe automatisch mit ClamAV auf Viren und Malware gescannt.",
      featStorage: "Flexible Cloud-Speicher",
      featStorageDesc:
        "Kompatibel mit AWS S3, Azure Blob Storage, MinIO und lokalem Festplattenspeicher bei voller Mandantentrennung.",
      featSignedUrls: "Kryptographisch signierte Download-Links",
      featSignedUrlsDesc:
        "Vertrauliche Dokumente wie Personalausweise oder Verträge werden nur über zeitlich begrenzte HMAC-URLs ausgeliefert.",
      featThumbnails: "Automatische Bildoptimierung",
      featThumbnailsDesc:
        "Erstellung responsiver Vorschaubilder für Web und Mobile spart Bandbreite und beschleunigt Ladezeiten.",
      featFolderTaxonomy: "Hierarchische Ordnerstrukturen",
      featFolderTaxonomyDesc:
        "Organisieren Sie Medien nach Verein, Mannschaft, Saison oder Kategorie mit vererbbaren Zugriffsrechten.",
      roiTitle: "Medien-Infrastruktur im Vergleich",
      tableHeaderMetric: "Merkmal",
      tableHeaderTraditional: "Ungeschützter Server-Speicher",
      tableHeaderScripe: "SCRIPE Media DAM",
      metricUploadReliability: "Upload-Zuverlässigkeit großer Dateien",
      tradUploadReliability: "Häufige Abbrüche bei > 100 MB",
      scripeUploadReliability: "100 % fortsetzbar (Resumable Chunks)",
      metricSecurityStandard: "Schutz vor Schadsoftware",
      tradSecurityStandard: "Kein automatischer Virenscan",
      scripeSecurityStandard: "Integrierter ClamAV-Prüfpfad",
      metricHotlinking: "Schutz vor Datenlecks",
      tradHotlinking: "Öffentliche statische Links",
      scripeHotlinking: "HMAC-SHA256 zeitlich limitierte URLs",
      ctaTitle: "Sichern Sie Ihre Vereinsmedien und Dokumente",
      ctaSubtitle: "Verbinden Sie modernen Medienkomfort mit kompromissloser Datensicherheit.",
      ctaPrimary: "Media-Features entdecken",
      ctaSecondary: "Entwickler-Spezifikation",
      featResumableUploads: "Unterbrechungsfreier Datei-Upload (TUS)",
      featResumableUploadsDesc:
        "Robuster Upload von großen Videos und Fotogalerien mit automatischer Wiederaufnahme bei Netzwerkunterbrechung.",
      featAutomatedSecurity: "Integrierter Antiviren- & Malware-Scan",
      featAutomatedSecurityDesc:
        "Automatisches Scannen jeder hochgeladenen Datei vor der Freigabe mit sofortiger Quarantäne verdächtiger Inhalte.",
      featDelegatedGrants: "Zeitlich limitierte Zugriffs-Token",
      featDelegatedGrantsDesc:
        "Sichere Freigabelinks mit automatischer Befristung zum Schutz vor unberechtigter Weitergabe.",
      featMultiCloudStorage: "Multi-Cloud-Speicheranbindung",
      featMultiCloudStorageDesc:
        "Natives Zusammenspiel mit Azure Blob Storage, AWS S3 und lokalen Enterprise-Speichersystemen.",
      featBrandedDelivery: "Gebrandetes Content Delivery Network",
      featBrandedDeliveryDesc:
        "Weltweit hochperformante Bereitstellung digitaler Medien über CDN mit eigener Subdomain.",
    },
    communication: {
      title: "Omnichannel-Kommunikation & Benachrichtigungen",
      description:
        "Zuverlässiger Versand von SMS, E-Mail, WhatsApp und Push mit intelligentem Gateway-Failover und zweisprachigen Vorlagen.",
      intro:
        "Erreichen Sie Sportler, Eltern und Mitarbeiter garantiert: SCRIPE Communication kombiniert mehrkanaligen Versand mit ausfallsicheren Routen und Empfangsbestätigungen.",
      statChannels: "Integrierte Kanäle",
      statFailover: "Automatisches Gateway-Failover",
      statDelivery: "Zustellnachweis-Quote",
      statTemplates: "Zweisprachige Vorlagen (LTR/RTL)",
      valueTitle: "Ausfallsichere Kommunikation im Großbetrieb",
      featOmnichannel: "Vollständige Kanalabdeckung",
      featOmnichannelDesc:
        "Versenden Sie Nachrichten synchron über SMS, E-Mail, WhatsApp Business und mobile In-App-Push-Nachrichten.",
      featFailover: "Intelligenter Gateway-Failover",
      featFailoverDesc:
        "Fällt ein SMS- oder Mail-Provider aus, schaltet das System in Millisekunden auf den konfigurierten Ausweichkanal um.",
      featTemplates: "Dynamische Vorlagen-Engine",
      featTemplatesDesc:
        "Gestalten Sie zweisprachige Vorlagen mit Platzhaltern, Vorschau-Funktion und Unterstützung für Rechts-nach-Links-Schriften.",
      featReceipts: "Unveränderliche Zustellnachweise",
      featReceiptsDesc:
        "Lückenlose Protokollierung von Sendezeitpunkt, Provider-IDs, Lesebestätigungen und Fehlercodes für den Streitfall.",
      featPreferences: "Kunden-Präferenzverwaltung",
      featPreferencesDesc:
        "Empfänger bestimmen selbst, über welche Kanäle sie Erinnerungen, Spielberichte oder Rechnungen erhalten möchten.",
      featHighThroughput: "Hohe Durchsatzleistung",
      featHighThroughputDesc:
        "Optimiert für Lastspitzen bei Turnier-Absagen, Notfallwarnungen oder Beginn von Anmeldephasen.",
      roiTitle: "Zustellqualität im Vergleich",
      tableHeaderMetric: "Kriterium",
      tableHeaderTraditional: "Einzelne isolierte Mailer",
      tableHeaderScripe: "SCRIPE Communication",
      metricDeliveryRate: "Zustellrate kritischer Nachrichten",
      tradDeliveryRate: "85 – 92 % (Verluste bei Störungen)",
      scripeDeliveryRate: "99,9 % dank automatischem Failover",
      metricTemplateMaintenance: "Pflegeaufwand für Vorlagen",
      tradTemplateMaintenance: "Mehrere Tage in HTML-Code",
      scripeTemplateMaintenance: "Minuten im visuellen Template-Editor",
      metricDisputeProof: "Nachweisbarkeit im Streitfall",
      tradDisputeProof: "Kaum verlässliche Protokolle",
      scripeDisputeProof: "Kryptographischer Zustell-Audit-Trail",
      ctaTitle: "Halten Sie Ihre Sport-Community zuverlässig informiert",
      ctaSubtitle:
        "Verhindern Sie verpasste Trainingseinheiten und Abrechnungskonflikte durch ausfallsichere Benachrichtigungen.",
      ctaPrimary: "Kommunikation testen",
      ctaSecondary: "API-Dokumentation lesen",
      featMultiGateway: "Multi-Gateway-Versandplattform",
      featMultiGatewayDesc:
        "Unterstützung führender Versanddienstleister für E-Mail und SMS wie Twilio, SendGrid und lokaler Gateways.",
      featIntelligentFailover: "Intelligentes Automatisches Failover",
      featIntelligentFailoverDesc:
        "Automatisches Umschalten auf Backup-Provider bei Zustellproblemen zur Gewährleistung kritischer Alerts.",
      featBilingualTemplates: "Zweisprachige dynamische Vorlagen",
      featBilingualTemplatesDesc:
        "Zentral verwaltete Benachrichtigungsvorlagen mit flexiblen Platzhaltern und Mehrsprachigkeit.",
      featReceiptAuditability: "Lückenlose Zustell- & Lesebestätigung",
      featReceiptAuditabilityDesc:
        "Exakte Protokollierung von Versand-, Öffnungs- und Klickraten in revisionssicheren Logdateien.",
      featRealtimePush: "Echtzeit-Push & In-App-Mitteilungen",
      featRealtimePushDesc:
        "Verzögerungsfreie Zustellung via WebSockets und SignalR direkt auf Browser und Smartphones.",
      featSpamCompliance: "Anti-Spam- & Opt-Out-Konformität",
      featSpamComplianceDesc:
        "Automatisches Management von Abmeldungen und Schutzklauseln zur Sicherung der Domain-Reputation.",
    },
    integrationsEcosystem: {
      title: "Entwickler-Schnittstellen & API-Gateway",
      description:
        "Sichere API-Schlüsselverwaltung mit Constant-Time SHA-256, verteiltes Redis-Rate-Limiting und Webhook-Ereignisse.",
      intro:
        "Öffnen Sie Ihre Plattform sicher für Partner, mobile Apps und externe Buchungsportale mit einem extrem schnellen API-Gateway.",
      statLatency: "Authentifizierungs-Overhead",
      statProtection: "Constant-Time SHA-256 Schutz",
      statRateLimit: "Verteiltes Redis-Rate-Limiting",
      statWebhooks: "Signierte Webhook-Ereignisse",
      valueTitle: "Offene Schnittstellen ohne Sicherheitskompromisse",
      featApiKeys: "Granulare API-Schlüssel",
      featApiKeysDesc:
        "Erzeugen Sie Schlüssel mit Präfixen (sk_live_..., sk_test_...), Ablaufdaten und individuellen Bezeichnungen.",
      featScopes: "Feingliedrige OAuth-Scopes",
      featScopesDesc:
        "Vergeben Sie punktgenaue Rechte (z. B. venue:read, billing:write) und verhindern Sie überprivilegierte Zugriffe.",
      featRateLimiting: "Verteiltes Rate-Limiting",
      featRateLimitingDesc:
        "Schützen Sie Ihre Server vor Überlastung mit Redis-Token-Bucket-Algorithmen je Mandant und API-Schlüssel.",
      featConstantTime: "Constant-Time-Validierung",
      featConstantTimeDesc:
        "Verhinderung von Timing-Angriffen durch bytegenaue Gleichheitsprüfungen bei der Schlüsselerkennung.",
      featTelemetry: "Echtzeit-API-Telemetrie",
      featTelemetryDesc:
        "Detailliertes Dashboard mit Aufrufzahlen, Fehlerraten, IP-Adressen und Latenzen zur Diagnose.",
      featWebhooks: "HMAC-signierte Webhooks",
      featWebhooksDesc:
        "Informieren Sie Drittsysteme in Echtzeit über Buchungen, Zahlungen und Stornierungen mit automatischen Retries.",
      roiTitle: "API-Leistungsfähigkeit im Vergleich",
      tableHeaderMetric: "Sicherheits- & Leistungsmerkmal",
      tableHeaderTraditional: "Eigenbau-Token / Ungeschützt",
      tableHeaderScripe: "SCRIPE API Gateway",
      metricAuthOverhead: "Authentifizierungslatenz",
      tradAuthOverhead: "15 – 45 ms Datenbank-Lookups",
      scripeAuthOverhead: "< 1 ms dank speicheroptimierter Hashes",
      metricAbuseProtection: "Schutz vor Überlastungsangriffen",
      tradAbuseProtection: "Server stürzt bei Lastspitzen ab",
      scripeAbuseProtection: "Verteiltes Redis-Throttling schützt den Kern",
      metricSideChannel: "Resistenz gegen Timing-Attacken",
      tradSideChannel: "Verwundbar durch String-Vergleich",
      scripeSideChannel: "Mathematisch sicher via Constant-Time Equal",
      ctaTitle: "Bauen Sie ein starkes Partner-Ökosystem auf",
      ctaSubtitle:
        "Ermöglichen Sie nahtlose Integrationen mit professionellen Entwickler-Werkzeugen.",
      ctaPrimary: "Entwickler-Portal öffnen",
      ctaSecondary: "Sicherheits-Whitepaper lesen",
      featKeyManagement: "Sichere API-Schlüsselverwaltung",
      featKeyManagementDesc:
        "Erzeugung und automatisierte Rotation kryptografischer API-Keys mit definierbaren Gültigkeitszeiträumen.",
      featScopeDelegation: "Granulare Rechte- & Scope-Delegation",
      featScopeDelegationDesc:
        "Zuweisung präziser Lese- und Schreibrechte pro Drittanwendung zur Minimierung von Sicherheitsrisiken.",
      featQuotaEnforcement: "Rate-Limiting & Quotenverwaltung",
      featQuotaEnforcementDesc:
        "Drosselung und Ratenbegrenzung zum Schutz der Kerninfrastruktur vor Überlastung.",
      featApiTelemetry: "Umfassende API-Telemetrie",
      featApiTelemetryDesc:
        "Echtzeit-Überwachung von Latenzen, Fehlerraten und Durchsatz für jede angebundene Schnittstelle.",
      featPartnerEcosystem: "Entwicklerportal für Partner",
      featPartnerEcosystemDesc:
        "Sandboxes und Dokumentationen zur schnellen Integration von Partner-Lösungen in SCRIPE.",
      featIpWhitelisting: "IP-Zugriffsbeschränkung (Whitelisting)",
      featIpWhitelistingDesc:
        "Zusätzliche Firewall-Ebene zur Beschränkung von API-Aufrufen auf freigegebene Server-IPs.",
    },
    customFields: {
      title: "Benutzerdefinierte Felder & Datenerweiterung",
      description:
        "Mandantenkonfigurierbare Felddefinitionen für jeden registrierten Entitätstyp — ohne Datenbankschemaänderungen oder Codeanpassungen.",
      intro:
        "Geben Sie Ihren Mandanten die Freiheit, eigene Datenfelder zu definieren – von Trikotgrößen bis zu Notfallkontakten – ohne Eingriffe in den Quellcode.",
      valueTitle: "Geschäftliche Flexibilität ohne technische Schulden",
      featNoMigrationTitle: "Keine Datenbankmigrationen",
      featNoMigrationDesc:
        "Neue Felder stehen sofort zur Verfügung, ohne dass Tabellenschemata geändert oder Server neu gestartet werden müssen.",
      featTypedTitle: "22 Strikte Datentypen",
      featTypedDesc:
        "Unterstützung für Text, Zahlen, Datumsangaben, Auswahllisten, Datei-Uploads und formatierte Texte mit Validierung.",
      featTenantTitle: "Strikte Mandantentrennung",
      featTenantDesc:
        "Jedes Feld gehört exklusiv dem jeweiligen Mandanten. Globale Systemfelder stehen Plattformbetreibern zur Verfügung.",
      featApiTitle: "Automatische API-Integration",
      featApiDesc:
        "Erweiterte Felder werden automatisch in standardisierten API-Payloads und Exporten mitgeliefert.",
      targetTitle: "Typische Anwendungsfälle",
      target1:
        "Sportvereine: Erfassung von Spielerposition, starkem Fuß und Trikotnummer im Sportlerprofil.",
      target2:
        "Betriebliche Anlagen: Speicherung von Kostenstellen und internen Projektnummern bei Buchungen.",
      target3:
        "Akademien: Verwaltung von Ausbildungsstufen, Notfallvollmachten und Ernährungsbesonderheiten.",
      feat22Types: "22 vielseitige Feldtypen",
      feat22TypesDesc:
        "Von Währungen, Datumsangaben und Auswahllisten bis zu Markdown-Text, GPS-Koordinaten und Dateianhängen.",
      featEncryption: "Verschlüsselte sensible Datenfelder",
      featEncryptionDesc:
        "Schutz vertraulicher medizinischer Diagnosen oder Finanzdaten durch automatische AES-256-Verschlüsselung.",
      featFieldGroups: "Strukturierte Feldgruppen",
      featFieldGroupsDesc:
        "Gliederung verwandter Attribute in logische UI-Reiter mit individueller Sortierung und Übersetzung.",
      featValidationRules: "Individuelle Validierungsregeln",
      featValidationRulesDesc:
        "Erzwingen von Pflichtfeldern, Regex-Mustern, Wertebereichen und Eindeutigkeitsprüfungen.",
      featReferences: "Dynamische Entitäts-Querverweise",
      featReferencesDesc:
        "Verknüpfung von Feldern mit bestehenden Systemdatensätzen ohne starre Fremdschlüsselbindung.",
      featTenantScoping: "Mandantenspezifische Erweiterungen",
      featTenantScopingDesc:
        "Jeder Mandant konfiguriert eigene Felder, während Systemadministratoren globale Pflichtfelder vorgeben können.",
      ctaTitle: "Erweitern Sie Ihre Plattform ohne Programmieraufwand",
      ctaSubtitle:
        "Geben Sie Betriebsteams die Möglichkeit, genau die Daten zu erfassen, die sie benötigen – ohne jeglichen Entwicklungsaufwand.",
      ctaPrimary: "Feature-Matrix anzeigen",
      ctaSecondary: "Technische Dokumentation lesen",
    },
    workManagement: {
      title: "Aufgaben- & Arbeitsverwaltung",
      description:
        "Integrierte Kanban-Boards, Sprint-Planung, Arbeitszeiterfassung und Meilenstein-Tracking direkt in der Unternehmensplattform.",
      intro:
        "Verbinden Sie operatives Tagesgeschäft mit strategischen Zielen: SCRIPE Work Management organisiert Platzwart-Aufgaben, Event-Vorbereitungen und interne Projekte.",
      valueTitle: "Produktivität auf den Punkt gebracht",
      featKanbanTitle: "Flexible Kanban- & Listenansichten",
      featKanbanDesc:
        "Visualisieren Sie Arbeitsabläufe, verschieben Sie Aufgaben per Drag & Drop und behalten Sie Engpässe im Blick.",
      featSprintsTitle: "Sprint- & Meilenstein-Planung",
      featSprintsDesc:
        "Bündeln Sie Aufgaben in zeitlich begrenzten Sprints für Turniervorbereitungen oder saisonale Platzinstandsetzungen.",
      featTimeTitle: "Integrierte Zeiterfassung",
      featTimeDesc:
        "Mitarbeiter erfassen Arbeitszeiten direkt auf Aufgaben – ideal für Lohnabrechnung und Nachkalkulation.",
      featCollabTitle: "Team-Zusammenarbeit",
      featCollabDesc:
        "Kommentare, Dateianhänge und Aufgaben-Zuweisungen halten alle Beteiligten synchron.",
      targetTitle: "Wer profitiert",
      target1: "Facility Manager: Koordination von Reparaturen, Rasenpflege und Reinigungsplänen.",
      target2:
        "Event-Veranstalter: Meilensteinplanung für Turniere, Feriencamps und Großveranstaltungen.",
      target3:
        "Verwaltungsteams: Abarbeitung von Mitgliederanträgen, Verträgen und behördlichen Auflagen.",
      featPolymorphicTasks: "Universelle Aufgabenverknüpfung",
      featPolymorphicTasksDesc:
        "Binden Sie Aufgaben an beliebige Entitäten – Plätze, Trainerakten oder Rechnungen – ohne neue Tabellen.",
      featSlaTracking: "SLA-Fristen & Automatisierte Eskalation",
      featSlaTrackingDesc:
        "Fristenüberwachung mit optischen Countdowns und automatischer Prioritätserhöhung bei Fristüberschreitung.",
      featTeamAssignment: "Funktionsübergreifende Zuweisung",
      featTeamAssignmentDesc:
        "Zuweisung von Workflows an Trainer, Platzwarte oder Buchhaltung mit Push-Benachrichtigungen.",
      featPriorityEscalation: "Dynamische Prioritätensteuerung",
      featPriorityEscalationDesc:
        "Klassifizierung von Niedrig bis Dringend mit automatischer Umsortierung der Arbeitslisten nach Dringlichkeit.",
      featLifecycleStates: "Flexible Statusübergänge",
      featLifecycleStatesDesc:
        "Strukturierte Führung von Entwurf über In Bearbeitung und Blockiert bis hin zu Abgeschlossen und Geprüft.",
      featWorkloadMetrics: "Auslastungs- & Kapazitätsanalysen",
      featWorkloadMetricsDesc:
        "Echtzeit-Einblick in offene Vorgänge, durchschnittliche Bearbeitungszeiten und personelle Engpässe.",
      ctaTitle: "Optimieren Sie Ihre operativen Arbeitsprozesse",
      ctaSubtitle:
        "Stellen Sie mit SLA-gesteuertem, polymorphem Aufgabenmanagement sicher, dass keine Vorgänge verloren gehen.",
      ctaPrimary: "Produktivitäts-Tools entdecken",
      ctaSecondary: "Technische Dokumentation lesen",
    },
    analytics: {
      title: "Revenue Analytics & Business Intelligence",
      description:
        "Finanzanalysen in BI-Qualität, Kohorten-Tracking, Abwanderungsprognosen und Mandanten-Gesundheitsscores auf CFO-Niveau.",
      intro:
        "Treffen Sie fundierte Wachstumsentscheidungen: Das Analytics-Modul verwandelt operative Buchungs- und Abonnementdaten in strategische Geschäftseinblicke.",
      valueTitle: "Transparenz für Plattformbetreiber & Betreiber",
      featMrrTitle: "MRR- & ARR-Umsatzverfolgung",
      featMrrDesc:
        "Detaillierte Aufschlüsselung von monatlich und jährlich wiederkehrenden Umsätzen nach Plänen, Standorten und Kohorten.",
      featCohortTitle: "Kohorten- & Churn-Analysen",
      featCohortDesc:
        "Verfolgen Sie das Kundenbindungsverhalten über Zeiträume hinweg und erkennen Sie Abwanderungsmuster frühzeitig.",
      featHealthTitle: "Mandanten-Gesundheitsscore",
      featHealthDesc:
        "Ein KI-gestützter Score bewertet Aktivität, Auslastung und Zahlungsmoral, um gefährdete Kunden proaktiv zu sichern.",
      featForecastTitle: "Prädiktive Umsatzprognosen",
      featForecastDesc:
        "Statistische Modelle berechnen erwartete Einnahmen auf Basis historischer Buchungstrends und Saisonalitäten.",
      targetTitle: "Entscheidungsträger im Fokus",
      target1:
        "Geschäftsführer & CFOs: Klare Übersicht über Gesamterlöse, Wachstumsraten und Liquiditätsentwicklung.",
      target2:
        "Sportstättenleiter: Analyse von ertragsstärksten Plätzen, Zeiten und Kundenkategorien.",
      target3:
        "Investoren & Beiräte: Verlässliche, revisionssichere Kennzahlen für Berichterstattung und Finanzierungsrunden.",
      featEventStream: "Revisionssicherer Event-Stream",
      featEventStreamDesc:
        "Unveränderliche Protokollierung aller operativen Transaktionen als manipulationssichere Datenbasis.",
      featDailyRollups: "Vorkalkulierte Tagesverdichtungen",
      featDailyRollupsDesc:
        "Beseitigen Sie langsame Datenbankabfragen durch vorkompilierte Metriken über Millionen Datensätze hinweg.",
      featInProcessRecording: "Latenzfreie Erfassung im Prozess",
      featInProcessRecordingDesc:
        "Direkte Aufzeichnung von Kennzahlen innerhalb der laufenden Transaktion ohne externe Message-Broker.",
      featTenantIsolation: "Strikte Mandantenisolation",
      featTenantIsolationDesc:
        "Jedes Ereignis und jede aggregierte Kennzahl ist hermetisch an den jeweiligen Mandanten gekoppelt.",
      featExecutiveMetrics: "Visualisierung strategischer KPIs",
      featExecutiveMetricsDesc:
        "Gegenüberstellung von Buchungsvolumen, Umsatzzuwachs, Mitgliederbindung und Anlagenauslastung.",
      featZeroLatencyDashboards: "Blitzschnelle Dashboard-Ladezeiten",
      featZeroLatencyDashboardsDesc:
        "Geschäftsführung und Standortleiter laden Auswertungen über mehrere Monate in unter 300 Millisekunden.",
      ctaTitle: "Echtzeit-Einblicke für fundierte Führungsentscheidungen",
      ctaSubtitle:
        "Statten Sie Ihr Führungsteam mit sofortigen Dashboards und verlässlichen Ereignisströmen aus.",
      ctaPrimary: "Analytics-Editionen entdecken",
      ctaSecondary: "Technische Dokumentation lesen",
    },
  },
};
