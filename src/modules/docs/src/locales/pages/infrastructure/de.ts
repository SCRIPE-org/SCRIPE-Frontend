// FILE-EXCEPTION: file length
/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  infrastructure: {
    backgroundJobs: {
      title: "Hintergrundjobs (Background Jobs)",
      description:
        "Automatisch erkannte, anbieterunabhängige (Native, Hangfire, Quartz.NET) wiederkehrende Jobs — 24 Jobs in 4 Modulen ohne manuelle Verkabelung.",
      intro:
        "Das SCRIPE-Hintergrundjob-System basiert auf einem Prinzip: Einmal schreiben, auf jedem Anbieter ausführen. Jeder Job implementiert IAutoRegisteredJob und wird beim Start automatisch erkannt. Der Wechsel zwischen Native, Hangfire oder Quartz ist nur eine Konfigurationsänderung in appsettings.json — keine Codeänderungen.",

      // Architecture
      architectureTitle: "Architekturübersicht",
      architectureIntro:
        "Beim Start liest BackgroundJobsConfiguration den aktiven Anbieter aus appsettings.json und ruft GetServices<IAutoRegisteredJob>() auf, um jeden im DI-Container registrierten Job zu erkennen. Für jeden Job prüft es auf jobbezogene appsettings-Überschreibungen, parst Enabled und CronExpression und plant den Job dann über die API des Anbieters. Die Jobs selbst enthalten keinen anbieterspezifischen Code.",
      architectureFlowTitle: "Die Auto-Discovery Pipeline",

      // IAutoRegisteredJob Contract
      nodeConfig: "[DE] appsettings.json\nProvider + Per-Job Overrides",
      descConfig:
        "[DE] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      nodeStartup: "[DE] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      descStartup: "[DE] Reads provider, discovers all jobs, schedules them",
      nodeDiscovery: "[DE] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      descDiscovery: "[DE] Scans DI container for every registered IAutoRegisteredJob",
      nodeSchedule: "[DE] Schedule Each Job\nIf Enabled -> Register with provider API",
      descSchedule: "[DE] Uses CronExpression from appsettings override or job default",
      nodeExecute: "[DE] job.ExecuteAsync(ct)\nAt every cron tick",
      descExecute: "[DE] Provider-agnostic - job has zero knowledge of which provider runs it",
      conn1: "[DE] drives",
      conn2: "[DE] triggers",
      conn3: "[DE] for each job",
      conn4: "[DE] on cron tick",
      contractTitle: "Der IAutoRegisteredJob-Vertrag",
      contractIntro:
        "Jeder wiederkehrende Hintergrundjob in SCRIPE implementiert eine einzige Schnittstelle: IAutoRegisteredJob. Das ist der gesamte Vertrag — drei Eigenschaften und eine Methode. Die Schnittstelle schließt absichtlich jedes anbieterspezifische Konzept aus (keine Hangfire-Attribute, keine Quartz-Annotationen). Der Job weiß nicht, welcher Anbieter ihn ausführt.",

      // DI Registration
      diTitle: "DI-Registrierung — Das kritische Zwei-Zeilen-Muster",
      diIntro:
        "Jeder Job erfordert genau zwei Zeilen DI-Registrierung in der DependencyInjection.cs seines Moduls. Das Weglassen der zweiten Zeile macht den Job für alle Anbieter völlig unsichtbar — er wird niemals erkannt oder geplant, und es gibt keinen Fehler oder keine Warnung.",
      diWarningTitle: "Überspringen Sie NIEMALS Zeile 2",
      diWarning:
        "Der IAutoRegisteredJob-Factory-Delegat (Zeile 2) ist der Schlüssel, der die automatische Erkennung funktioniert. GetServices<IAutoRegisteredJob>() gibt nur Jobs zurück, die als IAutoRegisteredJob registriert sind. Jobs, die nur durch ihren konkreten Typ registriert sind, sind für alle drei Anbieter unsichtbar.",

      // Class Hierarchy
      hierarchyTitle: "Klassenhierarchie — Wählen Sie Ihre Basisklasse",
      hierarchyIntro:
        "Je nach benötigter Struktur haben Sie drei Möglichkeiten. Leichtgewichtige Jobs implementieren IAutoRegisteredJob direkt. Jobs, die strukturierte Zeitprotokolle benötigen, erben von RecurringJobBase. Cleanup-Jobs für soft-deleted Entitäten erben von SoftDeleteCleanupJob<TContext>.",
      hierarchyColClass: "Klasse",
      hierarchyColUseWhen: "Wann zu verwenden",
      hierarchyColGets: "Was Sie erhalten",
      hierarchyRow1When: "Der Job ist einfach und braucht keine Struktur",
      hierarchyRow1Gets: "Nur der Vertrag — volle Kontrolle, keine Extras",
      hierarchyRow2When: "Sie benötigen strukturierte Zeit- und Fehlerprotokolle",
      hierarchyRow2Gets: "Automatische Start/Complete/Error-Logs mit verstrichener Zeit",
      hierarchyRow3When: "Das Modul benötigt permanente Soft-Delete-Bereinigung",
      hierarchyRow3Gets: "Automatische Entitätserkennung, geordnete FK-Löschung, Batching",

      // Providers
      providersTitle: "Anbietervergleich",
      providersIntro:
        "Alle drei Anbieter verwenden genau dieselbe IAutoRegisteredJob-Schnittstelle. Der einzige Unterschied besteht darin, wie sie die Jobs planen und persistieren. Konfigurieren Sie den Anbieter in appsettings.json — das Wechseln erfordert null Codeänderungen.",
      providerColFeature: "Feature",
      providerColNative: "Native",
      providerColHangfire: "Hangfire",
      providerColQuartz: "Quartz",
      providerRowPersistence: "Job-Persistenz",
      providerNativeNo: "Nur Memory — verloren bei Neustart",
      providerHangfireYes: "In SQL gespeichert — übersteht Neustarts",
      providerQuartzOptional: "Memory (optionale DB-Speicherung)",
      providerRowDashboard: "Dashboard",
      providerNativeDash: "Keines",
      providerHangfireDash: "/hangfire (Nur SuperAdmin)",
      providerQuartzDash: "Keines (Quartz.UI separat verfügbar)",
      providerRowRetry: "Automatische Wiederholungen",
      providerNativeRetry: "Nein",
      providerHangfireRetry: "Ja (konfigurierbare Wiederholungsanzahl)",
      providerQuartzRetry: "Ja (über misfire policies)",
      providerRowBestFor: "Am besten für",
      providerNativeBest: "Lokale Entwicklung, Unit-Tests",
      providerHangfireBest: "Produktion mit SQL Server",
      providerQuartzBest: "Produktion mit Oracle oder PostgreSQL",

      // Jobs Inventory
      inventoryTitle: "Vollständiges Job-Inventar — Alle 24",
      inventoryIntro:
        "Alle 24 wiederkehrenden Hintergrundjobs über die vier Module hinweg. Jeder Job implementiert IAutoRegisteredJob. Standard-Crons können pro Umgebung in appsettings.json überschrieben werden.",
      inventoryColPurpose: "Zweck",
      inventoryCoreTitle: "Core-Modul (1 Job)",
      inventoryIdentityTitle: "Identity-Modul (4 Jobs)",
      inventoryEntitlementsTitle: "Entitlements-Modul (12 Jobs)",
      inventoryComplianceTitle: "Compliance-Modul (7 Jobs)",

      // Job purpose descriptions
      jobOutboxCleanup: "Löscht verarbeitete Outbox-Nachrichten älter als 7 Tage",
      jobIdentitySoftDelete: "Löscht permanent soft-deleted Identity-Entitäten",
      jobEmailProcessing: "Pusht verzögerte E-Mails über den EmailJobProcessor",
      jobWebhookRetry: "Verarbeitet persistierte Webhook-Retry-Warteschlange in 50er-Batches",
      jobWebhookLogCleanup: "Löscht Webhook-Lieferprotokolle älter als 90 Tage",
      identityNote:
        "EmailProcessingJob und WebhookRetryJob/WebhookLogCleanupJob sind Basis-Infrastrukturjobs, die in der Identity-Modul-DI registriert sind, da sie von Identity-Diensten abhängen.",
      jobEntitlementsSoftDelete: "Löscht permanent soft-deleted Entitlements-Entitäten",
      jobSubscriptionReconciliation: "Lässt Trials ablaufen, erneuert aktive Abonnements",
      jobTrialNotification: "Sendet Trial-Ende-Erinnerungen 7, 3 oder 1 Tage vor Ablauf",
      jobDunningNotification:
        "Sendet zunehmend dringliche Mahnungen bei fehlgeschlagenen Zahlungen",
      jobEditionRollout: "Wendet geplante Upgrades und Downgrades an",
      jobUserSubscriptionReconciliation: "Tier-2 Benutzer-Abonnement-Abstimmung",
      jobAnalyticsSnapshot: "Tägliche Umsatz/MRR/ARR-Snapshot-Aggregation",
      jobTenantHealthScore: "Berechnet Gesundheits-Scores für alle aktiven Mandanten neu",
      jobAnalyticsReport: "Wöchentliche Generierung von Analyseberichten",
      jobCommissionInvoicing: "Generiert monatlich konsolidierte Provisionsrechnungen",
      jobCommissionAutoCharge: "Wiederholt fehlgeschlagene automatische Provisionsabbuchungen",
      jobPaymobRecurringBilling: "Wiederkehrende Belastung gespeicherter Paymob-Kreditkarten",
      jobComplianceSoftDelete: "Löscht permanent soft-deleted Compliance-Entitäten",
      jobDsrExecution: "Führt ausstehende DSR-Anfragen alle 5 Minuten aus",
      jobDsrEscalation: "Warnt vor nahenden SLA-Fristen für DSRs",
      jobDsrExportCleanup: "Löscht abgelaufene DSR-Exporte",
      jobRetentionEnforcement: "Setzt Datenaufbewahrungsrichtlinien durch",
      jobConsentExpiry: "Erklärt abgelaufene Benutzerzustimmungen für ungültig",
      jobReportGeneration: "Pusht und generiert ausstehende Compliance-Berichte alle 2 Minuten",

      // Creating a New Job
      newJobTitle: "Erstellen eines neuen Jobs",
      newJobIntro:
        "Befolgen Sie diese vier Schritte genau. Die einzigen erforderlichen Dateien sind die Jobklasse selbst und die zweizeilige DI-Registrierung. Alles andere wird automatisch verdrahtet.",
      newJobStep1Title: "Schritt 1 — Erstellen der Jobklasse",
      newJobStep1Desc:
        "Erstellen Sie eine neue Datei in {Module}.Infrastructure/BackgroundJobs/. Verwenden Sie die kebab-case JobId-Konvention: '{module}-{purpose}'. Machen Sie ExecuteAsync idempotent.",
      newJobStep2Title: "Schritt 2 — Registrieren der DI mit zwei Zeilen",
      newJobStep2Desc:
        "Fügen Sie in der DependencyInjection.cs des Moduls die genauen zwei Registrierungszeilen hinzu. Zeile 1 aktiviert die Konstruktorinjektion. Zeile 2 aktiviert die Auto-Erkennung. Überspringen Sie NIEMALS Zeile 2.",
      newJobStep3Title: "Schritt 3 — Appsettings-Überschreibung hinzufügen (Optional)",
      newJobStep3Desc:
        "Für umgebungsspezifische Zeitpläne oder um den Job zu deaktivieren, fügen Sie eine Überschreibung in BackgroundJobs.Jobs hinzu, wobei die JobId als Schlüssel dient.",
      newJobStep4Title: "Schritt 4 — Kompilieren und Überprüfen",
      newJobStep4Desc:
        "Führen Sie scripe build backend aus. Null Fehler bedeuten, dass der Job bereit ist. Die Auto-Erkennung übernimmt den Rest — keine manuelle Registrierung an anderer Stelle erforderlich.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — FK-geordnete automatische Löschung",
      softDeleteIntro:
        "Die Basisklasse SoftDeleteCleanupJob<TContext> ist die fortschrittlichste Option. Sie erkennt automatisch alle ISoftDeletable-Entitätstypen im DbContext, sortiert sie topologisch und führt Batch-Löschungen durch.",
      softDeleteTip:
        "Der CLI-Befehl 'scripe add-bg-service {Module}' generiert die Job-Datei und fügt beide DI-Registrierungen in einem Schritt hinzu. Dies ist der empfohlene Weg, um einen SoftDeleteCleanupJob hinzuzufügen.",
      softDeleteFlowTitle: "Ausführungsfluss für weiches Löschen",
      flowCronLabel: "Cron Tick (3:00 Uhr)",
      flowCronDesc: "Standard-Cron für Soft-Delete-Aufgaben",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowInitDesc: "Vom DI-Container instanziiert",
      flowScanLabel: "ISoftDeletable entdecken",
      flowScanDesc: "Reflexionsscan im DbContext für Entitäten, die ISoftDeletable implementieren",
      flowFilterLabel: "Abgelaufene Entitäten filtern",
      flowFilterDesc:
        "Datensätze finden, bei denen IsDeleted = true UND DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowCascadeLabel: "FK-bewusste Kaskade",
      flowCascadeDesc: "Behandelt Fremdschlüsseleinschränkungen in der richtigen Löschreihenfolge",
      flowExecuteLabel: "Hartes Löschen",
      flowExecuteDesc:
        "Ausführen von nativem SQL zum massenhaften Löschen unter Umgehung der EF-Änderungsverfolgung",
      connTriggers: "löst aus",
      connStarts: "startet",
      connBuilds: "erstellt Abfrage",
      connOrders: "ordnet",
      connRemoves: "entfernt",
      rulesTitle: "Regeln",
      rulesMustTitle: "✅ MUST DO",
      rulesNeverTitle: "❌ NEVER",
      ruleMust1: "Eine Klasse pro Datei im BackgroundJobs/ Ordner",
      ruleMust2: "Registrieren Sie ZWEI Zeilen in DI (Konkreter Typ + Factory-Delegat)",
      ruleMust3: "Verwenden Sie 5-Feld-CRON (KEIN Quartz 6-Feld-Format)",
      ruleMust4: "Machen Sie ExecuteAsync idempotent",
      ruleMust5: "Nach jeder Änderung kompilieren — scripe build backend",
      ruleNever1: "Importieren Sie niemals Hangfire- oder Quartz-Namespaces in Jobs",
      ruleNever2:
        "Verwenden Sie niemals [AutomaticRetry] — globale Retries werden zentral konfiguriert",
      ruleNever3: "Rufen Sie niemals RecurringJob.AddOrUpdate<T>() in Modulcode auf",
      ruleNever4: "Legen Sie Jobs niemals in Services/ oder einem anderen Ordner ab",
      ruleNever5: "Registrieren Sie niemals als Singleton — verwenden Sie immer AddScoped",

      tenantWarning:
        "Hintergrundjobs laufen AUSSERHALB des HTTP-Kontexts — es ist kein Mandantenkontext verfügbar. Jobs, die mandantenspezifische Daten manipulieren, MÜSSEN IServiceScopeFactory verwenden, um einen expliziten Mandanten-Scope zu erstellen.",
    },
    fileStorage: {
      title: "Dateispeicher (File Storage)",
      description: "Strategie-Muster für lokale Speicherung, Azure, S3 und MinIO.",
      intro: "Wechseln Sie Anbieter nahtlos; jeder Speicher ist mandantenbezogen.",
      architectureTitle: "Speicherarchitektur",
      providersTitle: "Speicheranbieter",
      validationTitle: "Dateivalidierung",
      tenantScopingTitle: "Mandantenbezogener Speicher",
      configTitle: "Konfiguration",
    },
    resilience: {
      title: "Resilienz-Muster (Resilience)",
      description: "Polly-Richtlinien: Retry, Circuit Breaker und Timeouts.",
      intro: "Schutz vor vorübergehenden Ausfällen externer HTTP-Anrufe.",
      architectureTitle: "Resilienz-Architektur",
      retryTitle: "Retry-Richtlinie",
      circuitBreakerTitle: "Circuit Breaker",
      circuitBreakerIntro:
        "Stoppt nach 5 Fehlern für 30 Sekunden Anrufe zum ausgefallenen Service.",
      timeoutTitle: "Timeout-Richtlinie",
      usageTitle: "Nutzung im HttpClient",
      configTitle: "Konfiguration",
    },
    gatewayDeployment: {
      title: "Gateway & Deployment",
      description: "YARP-Proxy, Modulsystem, IIS und Kestrel.",
      intro: "Routet Anfragen und ermöglicht den flexiblen Betrieb.",
      yarpTitle: "YARP Gateway",
      yarpIntro: "Das Gateway übernimmt SSL, Lastverteilung und Routing.",
      moduleTitle: "Modulsystem beim Start",
      moduleIntro: "Gesteuert über die MODULE_NAME Umgebungsvariable.",
      modesTitle: "Deployment-Modi",
      monolithTitle: "Monolith-Modus",
      microservicesTitle: "Microservices-Modus",
      portNote: "Jeder Service lauscht im Microservice-Modus auf einem anderen Port.",
      iisTitle: "IIS Deployment",
      iisStep1Title: "1. Applikation veröffentlichen",
      iisStep1Desc: "Führen Sie dotnet publish aus.",
      iisStep2Title: "2. IIS Site konfigurieren",
      iisStep2Desc: "Weisen Sie das Ausgabeverzeichnis der Site zu.",
      iisStep3Title: "3. Variablen setzen",
      iisStep3Desc: "Konfigurieren Sie MODULE_NAME und Connection Strings.",
      iisStep4Title: "4. App Pool",
      iisStep4Desc: "Stellen Sie 'No Managed Code' für out-of-process Hosting ein.",
      kestrelTitle: "Kestrel Konfiguration",
    },
    databaseMigrations: {
      title: "Enterprise Datenbank-Migrationen",
      description: "Adaptive EF Core-Architektur für SQL Server, Oracle und PostgreSQL.",
      intro:
        "Statt eines monolithischen DbContext verwendet SCRIPE streng typisierte, abgeleitete DbContexts für eine saubere Trennung der ModelSnapshot-Dateien.",
      architectureTitle: "Abgeleitete DbContext-Topologie",
      architectureContent:
        "Basierend auf einem abstrakten DbContext werden anbieterspezifische abgeleitete Klassen generiert.",
      diTitle: "Laufzeit-Provider-Injektion",
      diContent: "Dynamische Registrierung des korrekten Datenbankanbieters über appsettings.json.",
      cliTitle: "Generierung von Multi-Provider-Migrationen",
      cliContent:
        "Die CLI generiert nahtlos parallele Migrationen für alle unterstützten Datenbanken.",
      cliWarning: "Warnung: Bearbeiten Sie niemals die ModelSnapshot-Dateien manuell.",
      cliUpdateTitle: "Automatische Provider-Updates",
      cliUpdateContent:
        "Erkennt automatisch den aktiven Provider aus den Settings beim Ausführen von Updates.",
      cliRemoveTitle: "Smart Force Removal (Rückgängig machen)",
      cliRemoveContent: "Sicheres Zurücksetzen von Migrationen für alle inaktiven Provider.",
      newProviderTitle: "Hinzufügen eines neuen Datenbankanbieters",
      newProviderContent: "Einfacher 4-Schritte-Prozess zur Erweiterung (z.B. SQLite für Tests).",
      newProviderStep1: "Erstellen einer abgeleiteten DbContext-Klasse.",
      newProviderStep2: "Implementierung einer Factory.",
      newProviderStep3: "Registrierung im DI-Container.",
      newProviderStep4: "Ausführen des add-migration Befehls.",
    },
    uisCli: {
      title: "SCRIPE CLI Tooling",
      description: "Produktivitäts-CLI mit 66 Scaffolding-Templates und automatischem Wiring.",
      intro:
        "Eine node-basierte CLI für das fehlerfreie Scaffolding und Verdrahten (Wiring) von Modulen und Features.",
      commandsTitle: "Kern-Befehle",
      commandsIntro: "Zwei fundamentale Befehle zum Generieren kompletter Architekturen.",
      newModuleTitle: "Modul-Scaffolding: new-module",
      newModuleIntro: "Generiert 3-Schichten-Backend und Frontend-Skelett.",
      newFeatureTitle: "Feature-Scaffolding: new-feature",
      newFeatureIntro: "Generiert Controller, CQRS-Handler, Views und Zod-Schemas aus einer DSL.",
      destructionTitle: "Destruktive Tools",
      destructionIntro: "Ermöglicht das saubere Entfernen (Rollback) experimenteller Features.",
      bgJobsTitle: "Hintergrund-Dienste",
      bgJobsIntro: "Direktes Einbinden neuer Background-Worker in Hangfire.",
      dslTitle: "Property DSL-Syntax",
      dslIntro: "Verwendet die --properties (-p) Flag für schnelle Modell-Definition.",
      dslSyntaxInfo: "Syntax: PropertyName:Typ[:Modifier1][:Modifier2]",
      templatesTitle: "66 Immutable Templates",
      templatesIntro:
        "Ersetzt das manuelle Schreiben durch Handlebars-Templates nach Clean Architecture.",
      securityTitle: "Automatisierte Security",
      securityIntro: "Die generierten Controller werden sofort mit RBAC-Attributen geschützt.",
      autoWiringTitle: "Auto-Wiring (Verdrahtung)",
      autoWiringIntro:
        "Das wichtigste Feature: Die CLI trägt Klassen in DI, Routing und Docker vollautomatisch ein.",
      wiringSln: "Aktualisierung der .sln Datei.",
      wiringProgram: "Registrierung in der Program.cs.",
      wiringSettings: "Datenbank-Verbindungen in der appsettings.json.",
      wiringDocker: "Microservice-Verweise im docker-compose.",
      wiringPermissions: "TypeScript Konstanten-Mapping für Next.js.",
      wiringFrontendApp: "Server-Routing Registrierung.",
      wiringFrontEnv: "Proxy-Umgebungsvariablen.",
      revertSafely: "Sauberes Entfernen aller Einträge ohne Breaking Changes.",
      dbSyncTitle: "Datenbank & API-Synchronisierung",
      dbSyncIntro: "Hält Frontend und Backend voll synchron.",
      dbCliCmd: "Aktualisiert Datenbanken simultan.",
      syncApiCmd: "Konsumiert OpenAPI/Swagger für TypeScript-Generierung.",
      configTitle: "CLI Projektkonfiguration",
      configIntro: "Liest die scripe.config.json im Projektstamm.",
      namingTitle: "Intelligente Namensgebung",
      namingIntro: "Behandelt PascalCase, kebab-case und Pluralisierung automatisch.",
      utilityTitle: "Ecosystem-Werkzeuge",
      utilityIntro: "Steuerung von Build-Pipelines und Entwicklungsservern aus einem Prompt.",
    },
    uisStudio: {
      title: "SCRIPE Studio",
      description:
        "Visuelles Entwickler-Dashboard mit Echtzeit-Modulverwaltung, Code-Generatoren, Dev-Server-Steuerung und integriertem Terminal.",
      intro:
        "SCRIPE Studio ist ein visuelles Entwickler-Dashboard mit einer Echtzeit-Web-Oberfläche für Modulverwaltung, Code-Generatoren, Dev-Server-Steuerung, Datenbankoperationen, Docker-Verwaltung und mehr — alles in einem einzigen Browser-Tab.",
      architectureTitle: "Studio-Architektur",
      architectureIntro:
        "Das Studio besteht aus zwei Komponenten: die Engine (Express + Socket.io + SQLite, Port 4201) für API-Anfragen, Befehlsausführung und Echtzeit-Streaming. Die UI (Next.js, Port 4200) bietet 19 Seiten für alle Aspekte des Entwicklungsworkflows.",
      securityTitle: "Sicherheitsmodell",
      securityIntro:
        "Defense-in-Depth-Sicherheit: Token-Authentifizierung (pro Start generiert), Befehls-Whitelist-Validierung, zentralisierte Eingabesanierung, Rate Limiting (200 Req/Min pro IP), CORS-Whitelist (nur localhost) und URL-Validierung.",
      featuresTitle: "Studio-Funktionen",
      featureDashboard:
        "Dashboard — Gesundheitsscore, Aktivitäts-Feed, Modulstatistiken und Systemübersicht.",
      featureModules:
        "Modul-Manager — Module erstellen, löschen, inspizieren und durchsuchen mit visueller UI und Echtzeit-Feedback.",
      featureGenerators:
        "Code-Generatoren — Events, Spezifikationen, Validatoren, Enums, Hooks, Komponenten und Seiten über formularbasierte UI generieren.",
      featureDevServers:
        "Dev-Server — Backend und Frontend mit Ein-Klick-Steuerung starten, stoppen und neustarten.",
      featureDatabase:
        "Datenbank — Migrationen ausführen, Daten seeden, Migrationsstatus prüfen, Backups erstellen und Module zurücksetzen.",
      featureDocker:
        "Docker — Docker Compose-Dienste verwalten, Logs anzeigen, Container-Gesundheit prüfen.",
      featureTerminal:
        "Terminal — Integriertes Terminal mit Befehlshistorie, ANSI-Ausgabe-Rendering und WebSocket-Streaming.",
      featureConfig:
        "Config-Editor — Umgebungsvariablen über .env, appsettings.json und scripe.config.json anzeigen und bearbeiten.",
      featurePackages:
        "Paket-Manager — npm- und NuGet-Pakete für Frontend und Backend hinzufügen, entfernen und aktualisieren.",
      featureSecurity:
        "Sicherheits-Tools — JWT/AES-Schlüssel generieren, Schwachstellen-Audits durchführen und Umgebungsvollständigkeit prüfen.",
      cliCommandsTitle: "Studio-CLI-Befehle",
      cliCommandsIntro:
        "Studio wird vollständig über die SCRIPE CLI gestartet und verwaltet. Der Befehl scripe studio unterstützt Dev-Modus (--dev), Produktionsmodus, Build-only (studio build), benutzerdefinierte Ports (--port, --engine-port) und Headless-Modus (--no-browser).",
    },
    healthChecks: {
      title: "Gesundheitsprüfungen & K8s-Probes",
      description:
        "Enterprise-Health-Endpoints für Kubernetes Liveness-, Readiness- und Startup-Probes mit 5 individuellen Prüfungen.",
      intro:
        "SCRIPE bietet 5 Enterprise-Health-Endpoints, die für Kubernetes-Orchestrierung, Load-Balancer-Integration und Betriebsüberwachung konzipiert sind. Jeder Endpoint validiert spezifische Infrastrukturabhängigkeiten und liefert strukturierte JSON-Antworten.",
      architectureTitle: "Health-Endpoint-Architektur",
      endpointsTitle: "Health-Endpoints",
      checksTitle: "Individuelle Gesundheitsprüfungen",
      checksIntro:
        "Jede Prüfung validiert eine bestimmte Infrastrukturabhängigkeit. Prüfungen laufen parallel für minimale Latenz. Fehlgeschlagene Prüfungen liefern detaillierte Fehlerinformationen ohne sensible Verbindungszeichenfolgen preiszugeben. Der Fehlerstatus ist pro Prüfung konfigurierbar — Datenbank- und Startup-Fehler geben Unhealthy zurück, während Redis, SMTP und Storage Degraded zurückgeben.",
      registrationTitle: "Registrierung der Gesundheitsprüfungen",
      registrationIntro:
        "Gesundheitsprüfungen werden zentral in HealthCheckExtensions.cs mit expliziten Tags und Fehlerstatus registriert. Tags bestimmen, welcher Endpoint jede Prüfung einschließt.",
      k8sTitle: "Kubernetes-Probe-Konfiguration",
      k8sIntro:
        "UISs Health-Endpoints korrespondieren direkt mit Kubernetes-Probe-Typen. Die Startup-Probe erlaubt bis zu 5 Minuten (30 Fehler × 10s Intervall) für die Datenbankmigration beim Erstdeployment.",
      dockerTitle: "Docker Compose Health Check",
      dockerIntro:
        "Für Docker Compose Deployments konfigurieren Sie Health Checks in der Service-Definition. Verwenden Sie /health/live für grundlegende Liveness und /health/ready für Readiness. Setzen Sie start_period, um Zeit für Datenbankmigrationen zu gewähren.",
      responseTitle: "Antwortformat",
      responseIntro:
        "SCRIPE unterstützt zwei Antwortformate je nach Endpoint. Öffentliche Probe-Endpoints liefern minimales JSON. Authentifizierte Endpoints liefern detaillierte Antworten mit Dauern, Tags, Nutzdaten und Ausnahmedetails.",
      environmentsTitle: "Umgebungsspezifischer Leitfaden",
      dockerTip:
        "Für IIS-Deployments: Konfigurieren Sie die Application Request Routing (ARR) Health Probe mit /health/ready als Health-Check-URL. Für Azure App Service: Konfigurieren Sie den Health Check-Pfad = /health/ready.",
    },
    observability: {
      title: "Observability & Monitoring",
      description:
        "OpenTelemetry-Tracing, Prometheus-Metriken, Grafana-Loki-Logging und vorkonfigurierte Alarmregeln für das Produktionsmonitoring.",
      intro:
        "SCRIPE implementiert einen vollständigen Observability-Stack auf Basis offener Standards: OpenTelemetry für verteiltes Tracing, Prometheus für die Metrikerfassung, Grafana Loki für zentralisiertes Logging und Jaeger für die Trace-Visualisierung.",
      stackTitle: "Observability-Stack-Architektur",
      tracingTitle: "Verteiltes Tracing (OpenTelemetry)",
      tracingIntro:
        "Das TracingBehavior erstellt einen OpenTelemetry-Span für jeden Command- und Query-Handler mit automatischer Modulerkennung, Anfragetypidentifikation und Dauermessung.",
      prometheusTitle: "Prometheus-Metriken",
      prometheusIntro:
        "Der /metrics-Endpoint stellt OpenTelemetry-Metriken im Prometheus-Textformat bereit. Prometheus scrapt diesen Endpoint alle 15 Sekunden.",
      loggingTitle: "Zentralisiertes Logging (Serilog + Loki)",
      loggingIntro:
        "Serilog reichert jeden Logeintrag mit Maschinenname, Umgebung, Korrelations-ID, Mandanten-ID und Modul-Tag an. Bei konfiguriertem Loki werden Logs in Echtzeit gepusht.",
      alertsTitle: "Alarmregeln",
      alertsIntro:
        "Vorkonfigurierte Prometheus-Alarmregeln erkennen kritische und warnende Zustände. Kritische Alarme feuern bei hohen Fehlerraten, Datenbankausfällen und extremer Latenz.",
      monitoringStackTitle: "Docker-Monitoring-Stack",
      monitoringStackIntro:
        "Eine vorgefertigte Docker-Compose-Datei startet den kompletten Monitoring-Stack mit automatisch bereitgestellten Datenquellen, Dashboards und Alarmregeln.",
      configTitle: "Observability-Konfiguration",
      productionWarning:
        "In der Produktion: TraceSampleRatio auf 0.1 setzen, Standard-Grafana-Passwort ändern, /metrics-Zugriff über Reverse-Proxy IP-Whitelist beschränken.",
    },
    auditTrail: {
      title: "Enterprise Audit Trail",
      description:
        "Vollständiges Audit-Logging mit automatischer Modulerkennung, Korrelationsverfolgung, Echtzeit-SignalR-Broadcasting und 45+ Ereignistypen.",
      intro:
        "UISs Enterprise Audit Trail erfasst jede bedeutende Aktion auf der Plattform — von Authentifizierungsereignissen über Entitätsmutationen bis hin zu Berechtigungsänderungen und Sicherheitsvorfällen.",
      architectureTitle: "Audit-Trail-Architektur",
      entityTitle: "AuditLog-Entitätsschema",
      entityIntro:
        "Die AuditLog-Entität erfasst umfassenden Kontext für jedes auditierbare Ereignis. Alte und neue Werte werden als JSON-Snapshots gespeichert.",
      moduleDetectionTitle: "Automatische Modulerkennung",
      moduleDetectionIntro:
        "Der AuditService bestimmt automatisch, welches Modul jedes Audit-Ereignis erzeugt hat, durch Analyse des API-Endpoint-Pfads oder Entitätstypnamens.",
      eventTypesTitle: "Audit-Ereignistypen (45+)",
      realtimeTitle: "Echtzeit-Broadcasting",
      realtimeIntro:
        "Audit-Ereignisse (ausgenommen routinemäßige HTTP-Request-Logs) werden über SignalR an verbundene Clients gesendet. Ereignisse sind mandantenbezogen — Mandanten-Admins sehen nur ihre eigenen Ereignisse über mandantenspezifische Gruppen.",
      queryTitle: "Audit-Log-Abfrage-API",
      queryIntro:
        "Der Audit-Log-Abfrage-Endpoint unterstützt umfassende Filterung mit 12 Parametern. Alle Filter sind optional und kombinierbar. Ergebnisse sind paginiert (Standard: 20 Einträge, Maximum: 100) und nach Zeitstempel absteigend sortiert.",
      queryTip:
        "Profi-Tipp: Verwenden Sie CorrelationId, um den vollständigen Lebenszyklus einer einzelnen HTTP-Anfrage über alle Audit-Einträge hinweg zu verfolgen.",
    },
    loadTesting: {
      title: "Lasttests & Backup",
      description:
        "k6-Performance-Testsuiten mit SLA-Schwellenwerten, CI/CD-Integration und Multi-Provider-Backup-Strategie.",
      intro:
        "SCRIPE enthält k6-Lasttestskripte zur Validierung von Performance-SLAs sowie eine umfassende Backup- und Disaster-Recovery-Strategie.",
      overviewTitle: "k6-Testsuiten",
      overviewIntro:
        "Zwei vorgefertigte k6-Testsuiten decken die kritischen Benutzerreisen ab: Authentifizierungsabläufe und CRUD-Operationen.",
      thresholdsTitle: "SLA-Schwellenwerte",
      authFlowTitle: "Auth-Flow-Testskript",
      authFlowIntro:
        "Der auth-flow.js Test simuliert realistische Benutzerauthentifizierungsmuster: Login, Zugriff auf geschützte Endpoints mit JWT-Token und Health-Check-Verifizierung. Benutzerdefinierte Metriken (uis_login_duration, uis_login_fail_rate) verfolgen auth-spezifische SLAs.",
      runningTitle: "Lasttests ausführen",
      cicdTitle: "CI/CD-Integration",
      cicdIntro:
        "k6 integriert sich in GitHub Actions, GitLab CI und Azure Pipelines. Tests laufen gegen eine containerisierte Backend-Instanz mit Health-Readiness-Warten vor der Ausführung. Die Pipeline schlägt automatisch fehl, wenn ein SLA-Schwellenwert überschritten wird.",
      backupTitle: "Backup & Disaster Recovery",
      backupIntro:
        "SCRIPE unterstützt Multi-Provider-Backup-Strategien mit spezifischen Werkzeugen und Frequenzen für jede Datenbank-Engine.",
      drWarning:
        "Kritisch: Testen Sie Ihre Disaster-Recovery-Prozeduren vierteljährlich. Ein Backup, das nie wiederhergestellt wurde, ist kein Backup — es ist eine Hoffnung.",
    },
  },
};
