/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  commercial: {
    performanceBenchmarks: {
      apiIntro:
        "Unsere Architektur priorisiert Geschwindigkeit, ohne Abstraktion zu opfern. Jede Schicht der API wird strengen Benchmarks unterzogen, um minimale Allokationen und maximalen Durchsatz zu gewährleisten.",
      apiTitle: "Anhaltende API-Geschwindigkeit",
      cachingContent:
        "Wir fragen die Datenbank nicht ab, es sei denn, es ist zwingend erforderlich. SCRIPE implementiert eine ausgeklügelte, mehrstufige Caching-Strategie. Kurzlebige L1-Memory-Caches fangen identische gleichzeitige Anfragen ab, während der verteilte L2-Redis-Cache massiven knotenübergreifenden Lesedurchsatz bietet.",
      cachingTitle: "Mehrstufiges aggressives Caching",
      dbTitle: "Entity Framework Optimierung",
      description:
        "Transparente, reale Leistungsmetriken, Optimierungsstrategien und Fähigkeiten zur horizontalen Skalierung.",
      frontendTitle: "Next.js Rendering-Engine",
      intro:
        "SCRIPE ist nicht nur skalierbar, es ist explosiv schnell. Durch die Nutzung der neuesten Leistungsverbesserungen von .NET 9 und aggressives verteiltes Caching bewältigt die Plattform massive gleichzeitige Lasten mit Effizienz auf Hardware-Niveau.",
      scaleTitle: "Unendliche horizontale Skalierung",
      tip: "Performance-Hinweis: Die enthaltenen mehrstufigen Dockerfiles garantieren die absolut kleinsten Container-Footprints, wodurch Instanz-Cluster in Millisekunden automatisch skalieren können.",
      title: "Performance Benchmarks",
    },
    realTimeCapabilities: {
      dashboardsContent:
        "Zwingen Sie Ihre Benutzer nicht länger, die Seite zu aktualisieren. Operative Dashboards werden in exakt der Millisekunde neu gerendert, in der sich zugrunde liegende Datenbankmetriken ändern, was einen massiven Wettbewerbsvorteil für Dispatch-, Trading- und Monitoring-Anwendungen bietet.",
      dashboardsTitle: "Live-Dashboards im Sub-Sekunden-Bereich",
      description:
        "Modernste WebSockets-Integration, die Live-Dashboards im Sub-Sekunden-Bereich, systemweites Broadcasting und kollaboratives Presence-Tracking ermöglicht.",
      intro:
        "Moderne Unternehmensanwendungen müssen lebendig sein. SCRIPE integriert out-of-the-box eine hochoptimierte, verteilte SignalR WebSocket-Backplane und liefert Echtzeit-, bidirektionale Kommunikation an Millionen gleichzeitiger Clients.",
      liveAudit: "Echtzeit forensisches Streaming",
      liveAuditDesc:
        "Streamen Sie kritische Sicherheits- und Audit-Protokolle direkt an Administrator-Dashboards, während sie global auftreten.",
      liveCharts: "Dynamisches Telemetrie-Rendering",
      liveChartsDesc:
        "Diagrammdatenpunkte animieren sich in dem Moment auf dem Bildschirm, in dem ein Backend-Ereignis veröffentlicht wird.",
      notificationsContent:
        "Der einheitliche Benachrichtigungs-Hub der Plattform kann transaktionale Alarme, Genehmigungsanfragen und Systemwarnungen sofort direkt in die React-UI pushen, ohne dass der Server gepollt wird, was die Datenbanklast und den Batterieverbrauch auf mobilen Clients drastisch reduziert.",
      notificationsTitle: "Verzögerungsfreie globale Benachrichtigungen",
      presenceTrack: "User Presence & Sperrung",
      presenceTrackDesc:
        "Geben Sie visuell an, wenn ein Kollege eine bestimmte Entität aktiv bearbeitet, um logische Überschreibungen zu verhindern.",
      scaleTitle: "Redis-gestützte globale Skalierung",
      securityAlert: "Sofortiges Threat-Broadcasting",
      securityAlertDesc:
        "Senden Sie kritische Änderungen des Sicherheitsprotokolls, die sofortige Reauthentifizierungen der Clients erzwingen.",
      signalrContent:
        "Sie betreiben mehrere API-Nodes? Kein Problem. Unsere vorkonfigurierte Redis-Backplane synchronisiert WebSocket-Nachrichten transparent über Ihren gesamten Kubernetes-Cluster und stellt sicher, dass ein mit Node A verbundener Benutzer eine von Node B generierte Nachricht erhält.",
      signalrTitle: "Verteilte WebSocket Backplane",
      title: "Echtzeit-Reaktivität",
    },
    resiliencePatterns: {
      circuitContent:
        "Wenn ein Zahlungsgateway eines Drittanbieters offline geht, 'lösen' die Circuit Breaker (Schutzschalter) von SCRIPE nach einem konfigurierten Schwellenwert von Fehlern sofort aus. Dies verhindert physisch, dass Ihre Anwendung Tausende zum Scheitern verurteilte Anfragen sendet, und gibt dem externen Dienst Zeit, sich zu erholen, während Ihre App schnell fehlschlägt (fail-fast).",
      circuitTitle: "Automatisierte Circuit Breakers",
      configTitle: "Dynamische Richtlinienkonfiguration",
      degradationContent:
        "Wenn eine externe Abhängigkeit fehlschlägt, stürzt das System nicht ab – es degradiert elegant. Wenn die Live-API für Versandtarife nicht erreichbar ist, stellt SCRIPE automatisch die zuletzt bekannten, zwischengespeicherten Tarife bereit, um sicherzustellen, dass Checkout-Abläufe ununterbrochen bleiben.",
      degradationTitle: "Elegante Graceful Degradation",
      description:
        "Fehlertoleranz auf militärischem Niveau durch intelligente Retry-Pipelines, automatisierte Circuit Breaker und elegante Fallback-Strategien.",
      healthContent:
        "SCRIPE wartet nicht darauf, dass ein Benutzer einen Fehler meldet. Das System führt kontinuierlich proaktive Health Checks gegen Datenbanken, Caches und Drittanbieter-APIs durch. Wenn eine Verschlechterung festgestellt wird, versucht es automatisch Abhilfemaßnahmen oder alarmiert sofort DevOps.",
      healthTitle: "Proaktive Gesundheits-Telemetrie",
      intro:
        "In einer verteilten Enterprise-Umgebung sind Netzwerkausfälle keine Möglichkeit; sie sind eine mathematische Gewissheit. SCRIPE ist darauf ausgelegt, katastrophale externe Ausfälle zu überleben, ohne das Kern-Benutzererlebnis zu beeinträchtigen.",
      retryTitle: "Jittered Exponential Backoff",
      tip: "Architektonischer Tipp: Schreiben Sie niemals Standard-try/catch-Blöcke für Netzwerkaufrufe. Nutzen Sie immer die zentralisierten Polly HTTP-Interceptoren, die in der gesamten Plattform injiziert werden.",
      title: "Defensive Resilience-Architektur",
    },
    observabilityMonitoring: {
      alertingContent:
        "Visuelle Dashboards bedeuten nichts, wenn niemand hinsieht. Konfigurieren Sie strikte Basis-Grenzwerte – zum Beispiel, wenn 500er Fehler in die Höhe schnellen oder die CPU der Datenbank 80 % überschreitet – und lösen Sie automatisch Incident-Response-Protokolle über Slack oder PagerDuty aus.",
      alertingTitle: "Schwellenwertbasierte Alarmierung",
      cacheMetrics: "Redis-Cache-Wirksamkeit",
      cacheMetricsDesc:
        "Überwachen Sie kontinuierlich Speicherfragmentierung, Treffer-/Fehl-Raten (Hit/Miss) und Räumungsmetriken (Eviction), um die Leistung abzustimmen.",
      dbMetrics: "Datenbank-Pool Erschöpfung",
      dbMetricsDesc:
        "Verfolgen Sie aktive Verbindungen, langsame Abfrageausführungen und Befehlskompilierungszeiten direkt von EF Core.",
      description:
        "Forensisches strukturiertes Logging, Zero-Downtime Health Probes, Prometheus-Metriken und verteiltes Tracing mit OpenTelemetry.",
      healthContent:
        "Out-of-the-box Kubernetes-native Liveness- und Readiness-Probes. Die API meldet kontinuierlich selbst den Betriebsstatus der SQL-Datenbank, des Redis-Caches und externer Abhängigkeiten. Fällt ein Node aus, nimmt ihn der Orchestrator sofort aus der Load-Balancer-Rotation.",
      healthTitle: "Kubernetes-Native Probes",
      intro:
        "Sie können nicht verwalten, was Sie nicht messen können. SCRIPE integriert einen Elite-Observability-Stack, der SREs und DevSecOps-Teams forensische Echtzeiteinblicke in das verteilte Verhalten der Plattform bietet.",
      loggingContent:
        "Traditionelle Textprotokolle sind bei Skalierung nutzlos. SCRIPE nutzt Serilog, um tief strukturiert JSON-Ereignisprotokolle zu generieren, die automatisch mit Correlation-IDs, Mandantenkontexten und Maschinennamen angereichert werden, um sie sofort in Datadog oder ELK abfragen zu können.",
      loggingTitle: "Strukturiertes forensisches Logging",
      metricsIntro:
        "Durch die Integration von OpenTelemetry-Standardprotokollen macht SCRIPE Tausende von internen Plattformmetriken direkt für Ihre bestehenden Prometheus- und Grafana-Dashboards zugänglich.",
      metricsTitle: "OpenTelemetry-Integration",
      requestMetrics: "API-Request-Durchsatz",
      requestMetricsDesc:
        "Überwachen Sie Latenz-Perzentile (p95, p99), Payload-Größen und präzise Ausführungsdauern pro Endpunkt.",
      tip: "Tipp für Führungskräfte: Implementieren Sie verteiltes Tracing, um eine einzelne Benutzeranfrage nahtlos über alle bereitgestellten Microservices hinweg zu verfolgen.",
      title: "Observability & Telemetrie",
      tracingContent:
        "In einem Microservice-Deployment kann ein einziger Klick fünf isolierte Dienste durchqueren. Verteiltes Tracing injiziert und propagiert Correlation-IDs durch HTTP-Header, sodass Sie komplexe Request-Journeys visuell abbilden und den Flaschenhals-Service sofort identifizieren können.",
      tracingTitle: "Serviceübergreifendes verteiltes Tracing",
      userMetrics: "Authentifizierungsgeschwindigkeit",
      userMetricsDesc:
        "Verfolgen Sie Login-Erfolge, Brute-Force-Versuche und spezifische Mandantenaktivitäten in Echtzeit.",
    },
    testingStrategy: {
      ci1Content:
        "Absolute Isolierung der Ausführungsumgebung. Bei jedem Pull Request stellt die CI-Pipeline Compiler-Toolchains deterministisch in einem hermetisch abgeriegelten, sterilen Linux-Container wieder her – wodurch 'bei mir funktioniert es'-Ausreden mathematisch ausgerottet werden.",
      ci1Title: "1. Sterile Umgebungs-Initialisierung",
      ci2Content:
        "Führen Sie die blitzschnelle xUnit-Suite mit intelligent gemockten Repositories aus. Dies garantiert, dass die CQRS-Geschäftslogik der reinen Application-Schicht in Millisekunden geprüft und zertifiziert wird, ohne eine physische Datenbankverbindung herzustellen.",
      ci2Title: "2. Reine Logik-Validierung",
      ci3Content:
        "Injizieren Sie temporäre (ephemere) Docker-Datenbanken mithilfe von Testcontainers. Dies garantiert, dass EF Core LINQ-Projektionen, globale Abfragefilter und physische Datenbank-Migrationen fehlerfrei gegen echte SQL-Engines ausgeführt werden, bevor sie sich selbst zerstören.",
      ci3Title: "3. Ephemere Integrations-Telemetrie",
      ci4Content:
        "Lösen Sie massive Playwright-Browser-Cluster aus. Headless-Chromium-Worker missbrauchen unerbittlich die kompilierte Next.js-Benutzeroberfläche und interagieren aggressiv mit jeder React-Komponente, um die End-to-End-Benutzerreise (User Journey) definitiv zu zertifizieren.",
      ci4Title: "4. Automatisierte Cross-Browser-Automatisierung",
      ciContent:
        "Testen ohne absolute Automatisierung ist ein Risiko. Das mitgelieferte Repository wird nativ mit einer massiv parallelisierten GitHub Actions / GitLab CI-Pipeline ausgeliefert. Sie verbarrikadiert aktiv den `main`-Branch und weist physisch jeden Code zurück, der Domänengrenzen verletzt, mathematische Assertions nicht besteht oder Regressionen auslöst.",
      ciTitle: "Kontinuierliche Sicherheits- & Integritäts-Pipelines",
      description:
        "Eine tiefgehende Analyse der SCRIPE-Testpyramide: Blitzschnelle CQRS-Unit-Assertions, ephemere Docker-Datenbank-Integrationen und unerbittliche Playwright-UI-Automatisierung.",
      e2eContent:
        "User Acceptance Testing (UAT) darf sich nicht auf menschliches Versagen verlassen. Wir integrieren Playwright, um Headless-Chromium-Ausführungscluster hochzufahren. Diese Cluster simulieren massive, hochkomplexe Benutzerinteraktionen – führen komplette mandantenfähige Onboarding-Abläufe aus, validieren den Status der React-Komponenten und stellen sicher, dass die Benutzeroberfläche unter aggressiv chaotischen Bedingungen perfekt widerstandsfähig bleibt, bevor manuelle QA sie jemals berührt.",
      e2eTitle: "Unerbittliche End-To-End Browser-Automatisierung",
      integrationContent:
        "Umfassendes Mocking der Datenbank führt zu gefährlichen False Positives. SCRIPE setzt Testcontainers ein, um reale physische Instanzen von PostgreSQL und Redis spezifisch für jede Test-Suite dynamisch bereitzustellen, auszuführen und zu zerstören. Dies stellt sicher, dass Ihre EF Core-Schemata gegen echte Infrastruktur getestet werden, anstatt gegen fragile In-Memory-Mocks.",
      integrationTitle: "Ephemere Infrastruktur-Tests",
      intro:
        "Ein kaskadierender Enterprise-Bug kostet Hunderttausende Dollar durch systemweite Ausfallzeiten. SCRIPE erzwingt eine rücksichtslose, mathematisch wasserdichte Teststrategie. Von isolierten Clean Architecture Logik-Tests bis hin zur destruktiven Headless-Browser-Automatisierung wird jedes einzelne Byte Code vor dem Mergen aggressiv geprüft und zertifiziert.",
      pyramidTitle: "Die geschichtete Code-Zertifizierungspyramide",
      pyramidLvl: "Zertifizierungs-Stratum",
      pyramidTech: "Ausführungs-Engine",
      pyramidScope: "Validierungsbereich",
      pyrE2E: "End-To-End Simulation",
      pyrE2ETech: "Playwright / Chromium Workers",
      pyrE2EScope: "Full Journey Validierung (UI bis DB)",
      pyrInt: "Ephemere Integration",
      pyrIntTech: "WebApplicationFactory + Testcontainers",
      pyrIntScope: "API Endpunkte & Physisches SQL",
      pyrUnit: "Reine Geschäftslogik",
      pyrUnitTech: "xUnit + Moq + FluentAssertions",
      pyrUnitScope: "Domain + Application Schichten",
      pyrStatic: "Statische Codeanalyse",
      pyrStaticTech: "TypeScript + ESLint + Roslyn",
      pyrStaticScope: "Syntax, Regeln & Typen",
      summaryTitle: "Mathematische Test-Gewissheit",
      tip: "Architektonische Direktive: Streben Sie nicht nach Vanity-Metriken. Erzwingen Sie eine Baseline von 100 % Abdeckung für Kern-Domain-Entitäten und CQRS-Handler und nutzen Sie Playwright UI-Cluster, um die Presentation-Oberfläche abzudecken.",
      title: "Automatisierte Resilienz & Testing",
      unitContent:
        "Durch die strikte Einhaltung der Clean Architecture-Prinzipien bleibt die Geschäftslogik von SCRIPE physisch von HTTP-Kontexten und SQL-Schemata isoliert. Ihr Engineering-Team kann sofort Tausende von xUnit-Testsuiten in nur wenigen Millisekunden gegen Core-Handler und Domain-Entitäten ausführen, was die Entwicklergeschwindigkeit und das Vertrauen in Deployments maximiert.",
      unitTitle: "Blitzschnelle isolierte Unit-Ausführung",
      lstIntI1: "WebApplicationFactory für realistische HTTP-Pipeline-Tests",
      lstIntI2: "TestContainers für Wegwerf-Datenbankinstanzen",
      lstIntI3: "Automatisches Testdaten-Seeding und Cleanup",
      lstIntI4: "Parallele Testausführung mit isolierten Datenbanken",
      lstIntI5: "Authentifizierungs-Simulation mit Test-JWT-Tokens",
      tblSumHeader1: "Test-Typ",
      tblSumHeader2: "Framework",
      tblSumHeader3: "Abdeckungs-Ziel",
      tblSumHeader4: "Ausführungshäufigkeit",
      tblSumR1C1: "Unit (Backend)",
      tblSumR1C2: "xUnit + FluentAssertions",
      tblSumR1C3: "Domain + Application Schichten",
      tblSumR1C4: "Jeder Commit",
      tblSumR2C1: "Unit (Frontend)",
      tblSumR2C2: "Vitest + Testing Library",
      tblSumR2C3: "ViewModels + Utilities",
      tblSumR2C4: "Jeder Commit",
      tblSumR3C1: "Integration",
      tblSumR3C2: "WebApplicationFactory",
      tblSumR3C3: "API-Endpunkte + Datenbank",
      tblSumR3C4: "PR Merges",
      tblSumR4C1: "E2E",
      tblSumR4C2: "Playwright",
      tblSumR4C3: "Kritische User Flows",
      tblSumR4C4: "Nächtlich / Pre-Release",
      tblSumR5C1: "Statische Analyse",
      tblSumR5C2: "ESLint + TypeScript + Roslyn",
      tblSumR5C3: "100% der Codebasis",
      tblSumR5C4: "Jedes Speichern (Save)",
      tblSumR6C1: "Performance",
      tblSumR6C2: "k6 / Artillery",
      tblSumR6C3: "Lasttests von Endpunkten",
      tblSumR6C4: "Pre-Release",
    },
    storageBackends: {
      configTitle: "Dynamische Provider-Konfiguration",
      description:
        "Abstrahierte, hyperskalierbare binäre Speicherarrays, die nahtlos Local Disk, AWS S3, Azure Blob und MinIO-Backends unterstützen.",
      featuresTitle: "Speichersubsystem-Funktionen",
      handlingTitle: "Sichere Dateiübertragung",
      imageProcessing: "On-The-Fly Bildoptimierung",
      imageProcessingDesc:
        "Hochgeladene Bilder automatisch komprimieren, in der Größe ändern und in moderne WebP-Formate konvertieren.",
      intro:
        "Unternehmensanwendungen generieren Terabytes an Binärdaten. SCRIPE abstrahiert den physischen Speicherort vollständig. Sie können während der Inkubation auf der lokalen Festplatte beginnen und in der Produktion mit einem einzigen Konfigurationsstring in globale AWS S3-Buckets migrieren, ohne ein einziges Modul neu schreiben zu müssen.",
      mig1Content: "Entwickeln Sie in rasender Geschwindigkeit mit dem lokalen Dateisystem.",
      mig1Title: "1. Lokale Entwicklung",
      mig2Content:
        "Stellen Sie nahtlos in der Staging-Umgebung mithilfe von Open-Source-MinIO-Containern bereit.",
      mig2Title: "2. Staging-Infrastruktur",
      mig3Content: "Skalieren Sie unendlich in der Produktion mit AWS S3 oder Azure Blob Storage.",
      mig3Title: "3. Unendliche Produktionsskalierung",
      migrationContent:
        "Die Schnittstelle `IStorageService` entkoppelt Ihre Geschäftslogik absolut vom Cloud-Anbieter. Der Wechsel von Anbietern ist streng genommen eine Infrastruktur-Konfigurationsoperation, die Sie vollständig vor Vendor-Lock-in schützt.",
      migrationTitle: "Absolute Herstellerunabhängigkeit",
      pluggable: "Provider-Agnostizismus",
      pluggableDesc:
        "Wechseln Sie Speicherparadigmen nahtlos über strikt standardisierte Schnittstellenabstraktionen.",
      providersIntro:
        "Die Plattform injiziert den entsprechenden Speicheranbieter dynamisch über Dependency Injection basierend auf Umgebungsvariablen.",
      providersTitle: "Unterstützte Storage Backends",
      resumableDownload: "Multi-Part-Uploads",
      resumableDownloadDesc:
        "Streamen Sie zuverlässig massive Dateien im Gigabyte-Maßstab, ohne API-Nodes abstürzen zu lassen oder den Speicher zu erschöpfen.",
      tenantIsolation: "Kryptographische Pfadisolierung",
      tenantIsolationDesc:
        "Dateien werden physisch nach `[TenantId]` gruppiert (bucketed), was eine massive Datensicherheit garantiert.",
      title: "Abstrahierte Speicherinfrastruktur",
    },
  },
};
