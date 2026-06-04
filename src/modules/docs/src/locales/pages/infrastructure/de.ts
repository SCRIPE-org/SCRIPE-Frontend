export const de = {
  infrastructure: {
    auditTrail: {
      architectureTitle: "Audit-Trail-Architektur",
      description:
        "Vollständiges Audit-Logging mit automatischer Modulerkennung, Korrelationsverfolgung, Echtzeit-SignalR-Broadcasting und 45+ Ereignistypen.",
      entityIntro:
        "Die AuditLog-Entität erfasst umfassenden Kontext für jedes auditierbare Ereignis. Alte und neue Werte werden als JSON-Snapshots gespeichert.",
      entityTitle: "AuditLog-Entitätsschema",
      eventTypesTitle: "Audit-Ereignistypen (45+)",
      intro:
        "SCRIPEs Enterprise Audit Trail erfasst jede bedeutende Aktion auf der Plattform — von Authentifizierungsereignissen über Entitätsmutationen bis hin zu Berechtigungsänderungen und Sicherheitsvorfällen.",
      moduleDetectionIntro:
        "Der AuditService bestimmt automatisch, welches Modul jedes Audit-Ereignis erzeugt hat, durch Analyse des API-Endpoint-Pfads oder Entitätstypnamens.",
      moduleDetectionTitle: "Automatische Modulerkennung",
      queryIntro:
        "Der Audit-Log-Abfrage-Endpoint unterstützt umfassende Filterung mit 12 Parametern. Alle Filter sind optional und kombinierbar. Ergebnisse sind paginiert (Standard: 20 Einträge, Maximum: 100) und nach Zeitstempel absteigend sortiert.",
      queryTip:
        "Profi-Tipp: Verwenden Sie CorrelationId, um den vollständigen Lebenszyklus einer einzelnen HTTP-Anfrage über alle Audit-Einträge hinweg zu verfolgen.",
      queryTitle: "Audit-Log-Abfrage-API",
      realtimeIntro:
        "Audit-Ereignisse (ausgenommen routinemäßige HTTP-Request-Logs) werden über SignalR an verbundene Clients gesendet. Ereignisse sind mandantenbezogen — Mandanten-Admins sehen nur ihre eigenen Ereignisse über mandantenspezifische Gruppen.",
      realtimeTitle: "Echtzeit-Broadcasting",
      title: "Enterprise Audit Trail",
    },
    backgroundJobs: {
      architectureFlowTitle: "Die Auto-Discovery Pipeline",
      architectureIntro:
        "Beim Start liest BackgroundJobsConfiguration den aktiven Anbieter aus appsettings.json und ruft GetServices<IAutoRegisteredJob>() auf, um jeden im DI-Container registrierten Job zu erkennen. Für jeden Job prüft es auf jobbezogene appsettings-Überschreibungen, parst Enabled und CronExpression und plant den Job dann über die API des Anbieters. Die Jobs selbst enthalten keinen anbieterspezifischen Code.",

      // Architecture
      architectureTitle: "Architekturübersicht",
      conn1: "[DE] drives",
      conn2: "[DE] triggers",
      conn3: "[DE] for each job",
      conn4: "[DE] on cron tick",
      connBuilds: "erstellt Abfrage",
      connOrders: "ordnet",
      connRemoves: "entfernt",
      connStarts: "startet",
      connTriggers: "löst aus",
      contractIntro:
        "Jeder wiederkehrende Hintergrundjob in SCRIPE implementiert eine einzige Schnittstelle: IAutoRegisteredJob. Das ist der gesamte Vertrag — drei Eigenschaften und eine Methode. Die Schnittstelle schließt absichtlich jedes anbieterspezifische Konzept aus (keine Hangfire-Attribute, keine Quartz-Annotationen). Der Job weiß nicht, welcher Anbieter ihn ausführt.",
      contractTitle: "Der IAutoRegisteredJob-Vertrag",
      descConfig:
        "[DE] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      descDiscovery: "[DE] Scans DI container for every registered IAutoRegisteredJob",
      descExecute: "[DE] Provider-agnostic - job has zero knowledge of which provider runs it",
      description:
        "Automatisch erkannte, anbieterunabhängige (Native, Hangfire, Quartz.NET) wiederkehrende Jobs — 31 Jobs in 6 Modulen ohne manuelle Verkabelung.",
      descSchedule: "[DE] Uses CronExpression from appsettings override or job default",
      descStartup: "[DE] Reads provider, discovers all jobs, schedules them",
      diIntro:
        "Jeder Job erfordert genau zwei Zeilen DI-Registrierung in der DependencyInjection.cs seines Moduls. Das Weglassen der zweiten Zeile macht den Job für alle Anbieter völlig unsichtbar — er wird niemals erkannt oder geplant, und es gibt keinen Fehler oder keine Warnung.",

      // DI Registration
      diTitle: "DI-Registrierung — Das kritische Zwei-Zeilen-Muster",
      diWarning:
        "Der IAutoRegisteredJob-Factory-Delegat (Zeile 2) ist der Schlüssel, der die automatische Erkennung funktioniert. GetServices<IAutoRegisteredJob>() gibt nur Jobs zurück, die als IAutoRegisteredJob registriert sind. Jobs, die nur durch ihren konkreten Typ registriert sind, sind für alle drei Anbieter unsichtbar.",
      diWarningTitle: "Überspringen Sie NIEMALS Zeile 2",
      flowCascadeDesc: "Behandelt Fremdschlüsseleinschränkungen in der richtigen Löschreihenfolge",
      flowCascadeLabel: "FK-bewusste Kaskade",
      flowCronDesc: "Standard-Cron für Soft-Delete-Aufgaben",
      flowCronLabel: "Cron Tick (3:00 Uhr)",
      flowExecuteDesc:
        "Ausführen von nativem SQL zum massenhaften Löschen unter Umgehung der EF-Änderungsverfolgung",
      flowExecuteLabel: "Hartes Löschen",
      flowFilterDesc:
        "Datensätze finden, bei denen IsDeleted = true UND DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowFilterLabel: "Abgelaufene Entitäten filtern",
      flowInitDesc: "Vom DI-Container instanziiert",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowScanDesc: "Reflexionsscan im DbContext für Entitäten, die ISoftDeletable implementieren",
      flowScanLabel: "ISoftDeletable entdecken",
      hierarchyColClass: "Klasse",
      hierarchyColGets: "Was Sie erhalten",
      hierarchyColUseWhen: "Wann zu verwenden",
      hierarchyIntro:
        "Je nach benötigter Struktur haben Sie drei Möglichkeiten. Leichtgewichtige Jobs implementieren IAutoRegisteredJob direkt. Jobs, die strukturierte Zeitprotokolle benötigen, erben von RecurringJobBase. Cleanup-Jobs für soft-deleted Entitäten erben von SoftDeleteCleanupJob<TContext>.",
      hierarchyRow1Gets: "Nur der Vertrag — volle Kontrolle, keine Extras",
      hierarchyRow1When: "Der Job ist einfach und braucht keine Struktur",
      hierarchyRow2Gets: "Automatische Start/Complete/Error-Logs mit verstrichener Zeit",
      hierarchyRow2When: "Sie benötigen strukturierte Zeit- und Fehlerprotokolle",
      hierarchyRow3Gets: "Automatische Entitätserkennung, geordnete FK-Löschung, Batching",
      hierarchyRow3When: "Das Modul benötigt permanente Soft-Delete-Bereinigung",

      // Class Hierarchy
      hierarchyTitle: "Klassenhierarchie — Wählen Sie Ihre Basisklasse",
      identityNote:
        "EmailProcessingJob und WebhookRetryJob/WebhookLogCleanupJob sind Basis-Infrastrukturjobs, die in der Identity-Modul-DI registriert sind, da sie von Identity-Diensten abhängen.",
      intro:
        "Das SCRIPE-Hintergrundjob-System basiert auf einem Prinzip: Einmal schreiben, auf jedem Anbieter ausführen. Jeder Job implementiert IAutoRegisteredJob und wird beim Start automatisch erkannt. Der Wechsel zwischen Native, Hangfire oder Quartz ist nur eine Konfigurationsänderung in appsettings.json — keine Codeänderungen.",
      inventoryColPurpose: "Zweck",
      inventoryComplianceTitle: "Compliance-Modul (7 Jobs)",
      inventoryCoreTitle: "Core-Modul (5 Jobs)",
      inventoryEntitlementsTitle: "Entitlements-Modul (12 Jobs)",
      inventoryIdentityTitle: "Identity-Modul (2 Jobs)",
      inventoryIntro:
        "Alle 33 wiederkehrenden Hintergrundjobs über die sechs Module hinweg. Jeder Job implementiert IAutoRegisteredJob. Standard-Crons können pro Umgebung in appsettings.json überschrieben werden.",
      inventoryMarketplaceTitle: "Marketplace-Modul (4 Jobs)",
      inventoryPluginsTitle: "Plugins-Modul (3 Jobs)",

      // Jobs Inventory
      inventoryTitle: "Vollständiges Job-Inventar — Alle 33",
      jobAnalyticsReport: "Wöchentliche Generierung von Analyseberichten",
      jobAnalyticsSnapshot: "Tägliche Umsatz/MRR/ARR-Snapshot-Aggregation",
      jobAuthSessionCleanup: "Bereinigt abgelaufene Authentifizierungssitzungen und Refresh-Token",
      jobCommissionAutoCharge: "Wiederholt fehlgeschlagene automatische Provisionsabbuchungen",
      jobCommissionInvoicing: "Generiert monatlich konsolidierte Provisionsrechnungen",
      jobComplianceSoftDelete: "Löscht permanent soft-deleted Compliance-Entitäten",
      jobConsentExpiry: "Erklärt abgelaufene Benutzerzustimmungen für ungültig",
      jobDsrEscalation: "Warnt vor nahenden SLA-Fristen für DSRs",
      jobDsrExecution: "Führt ausstehende DSR-Anfragen alle 5 Minuten aus",
      jobDsrExportCleanup: "Löscht abgelaufene DSR-Exporte",
      jobDunningNotification:
        "Sendet zunehmend dringliche Mahnungen bei fehlgeschlagenen Zahlungen",
      jobEditionRollout: "Wendet geplante Upgrades und Downgrades an",
      jobEmailProcessing: "Pusht verzögerte E-Mails über den EmailJobProcessor",
      jobEntitlementsSoftDelete: "Löscht permanent soft-deleted Entitlements-Entitäten",
      jobIdentitySoftDelete: "Löscht permanent soft-deleted Identity-Entitäten",
      jobInstallCountAggregation:
        "Aggregiert flüchtige Installationszahlen in statische App-Listing-Zähler",
      jobMarketplaceSoftDelete:
        "Löscht permanent soft-deleted Listings, Einreichungen, Profile und Bewertungen nach Ablauf der Aufbewahrungsfrist",
      jobOutboxCleanup: "Löscht verarbeitete Outbox-Nachrichten älter als 7 Tage",

      // Job purpose descriptions
      jobOutboxProcessor:
        "Verarbeitet ausstehende Outbox-Nachrichten und leitet sie an AstraFlow weiter",
      jobPaymobRecurringBilling: "Wiederkehrende Belastung gespeicherter Paymob-Kreditkarten",
      jobPayoutBatch:
        "Sammelt ausstehende Einnahmen in Batch-Überweisungen und führt Auszahlungen über Stripe Connect aus",
      jobPluginDataCleanup:
        "Bereinigt abgelaufene temporäre Datenbankschlüssel, die von Plugins erstellt wurden",
      jobPluginHealthCheck: "Fragt aktive Plugin-Sandbox-Umgebungen ab und meldet den Zustand",
      jobPluginsSoftDelete:
        "Löscht permanent soft-deleted Plugins, Definitionen und Ausführungsprotokolle nach Ablauf der Aufbewahrungsfrist",
      jobReportGeneration: "Pusht und generiert ausstehende Compliance-Berichte alle 2 Minuten",
      jobRetentionEnforcement: "Setzt Datenaufbewahrungsrichtlinien durch",
      jobStaleSubmissionReminder:
        "Sucht nach App-Einreichungen, deren Überprüfung seit >7 Tagen aussteht, und warnt Admins",
      jobSubscriptionReconciliation: "Lässt Trials ablaufen, erneuert aktive Abonnements",
      jobTenantHealthScore: "Berechnet Gesundheits-Scores für alle aktiven Mandanten neu",
      jobTrialNotification: "Sendet Trial-Ende-Erinnerungen 7, 3 oder 1 Tage vor Ablauf",
      jobUserSubscriptionReconciliation: "Tier-2 Benutzer-Abonnement-Abstimmung",
      jobWebhookLogCleanup: "Löscht Webhook-Lieferprotokolle älter als 90 Tage",
      jobWebhookRetry: "Verarbeitet persistierte Webhook-Retry-Warteschlange in 50er-Batches",
      newJobIntro:
        "Befolgen Sie diese vier Schritte genau. Die einzigen erforderlichen Dateien sind die Jobklasse selbst und die zweizeilige DI-Registrierung. Alles andere wird automatisch verdrahtet.",
      newJobStep1Desc:
        "Erstellen Sie eine neue Datei in {Module}.Infrastructure/BackgroundJobs/. Verwenden Sie die kebab-case JobId-Konvention: '{module}-{purpose}'. Machen Sie ExecuteAsync idempotent.",
      newJobStep1Title: "Schritt 1 — Erstellen der Jobklasse",
      newJobStep2Desc:
        "Fügen Sie in der DependencyInjection.cs des Moduls die genauen zwei Registrierungszeilen hinzu. Zeile 1 aktiviert die Konstruktorinjektion. Zeile 2 aktiviert die Auto-Erkennung. Überspringen Sie NIEMALS Zeile 2.",
      newJobStep2Title: "Schritt 2 — Registrieren der DI mit zwei Zeilen",
      newJobStep3Desc:
        "Für umgebungsspezifische Zeitpläne oder um den Job zu deaktivieren, fügen Sie eine Überschreibung in BackgroundJobs.Jobs hinzu, wobei die JobId als Schlüssel dient.",
      newJobStep3Title: "Schritt 3 — Appsettings-Überschreibung hinzufügen (Optional)",
      newJobStep4Desc:
        "Führen Sie scripe build backend aus. Null Fehler bedeuten, dass der Job bereit ist. Die Auto-Erkennung übernimmt den Rest — keine manuelle Registrierung an anderer Stelle erforderlich.",
      newJobStep4Title: "Schritt 4 — Kompilieren und Überprüfen",

      // Creating a New Job
      newJobTitle: "Erstellen eines neuen Jobs",

      // IAutoRegisteredJob Contract
      nodeConfig: "[DE] appsettings.json\nProvider + Per-Job Overrides",
      nodeDiscovery: "[DE] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      nodeExecute: "[DE] job.ExecuteAsync(ct)\nAt every cron tick",
      nodeSchedule: "[DE] Schedule Each Job\nIf Enabled -> Register with provider API",
      nodeStartup: "[DE] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      providerColFeature: "Feature",
      providerColHangfire: "Hangfire",
      providerColNative: "Native",
      providerColQuartz: "Quartz",
      providerHangfireBest: "Produktion mit SQL Server",
      providerHangfireDash: "/hangfire (Nur SuperAdmin)",
      providerHangfireRetry: "Ja (konfigurierbare Wiederholungsanzahl)",
      providerHangfireYes: "In SQL gespeichert — übersteht Neustarts",
      providerNativeBest: "Lokale Entwicklung, Unit-Tests",
      providerNativeDash: "Keines",
      providerNativeNo: "Nur Memory — verloren bei Neustart",
      providerNativeRetry: "Nein",
      providerQuartzBest: "Produktion mit Oracle oder PostgreSQL",
      providerQuartzDash: "Keines (Quartz.UI separat verfügbar)",
      providerQuartzOptional: "Memory (optionale DB-Speicherung)",
      providerQuartzRetry: "Ja (über misfire policies)",
      providerRowBestFor: "Am besten für",
      providerRowDashboard: "Dashboard",
      providerRowPersistence: "Job-Persistenz",
      providerRowRetry: "Automatische Wiederholungen",
      providersIntro:
        "Alle drei Anbieter verwenden genau dieselbe IAutoRegisteredJob-Schnittstelle. Der einzige Unterschied besteht darin, wie sie die Jobs planen und persistieren. Konfigurieren Sie den Anbieter in appsettings.json — das Wechseln erfordert null Codeänderungen.",

      // Providers
      providersTitle: "Anbietervergleich",
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
      rulesMustTitle: "✅ MUST DO",
      rulesNeverTitle: "❌ NEVER",
      rulesTitle: "Regeln",
      softDeleteFlowTitle: "Ausführungsfluss für weiches Löschen",
      softDeleteIntro:
        "Die Basisklasse SoftDeleteCleanupJob<TContext> ist die fortschrittlichste Option. Sie erkennt automatisch alle ISoftDeletable-Entitätstypen im DbContext, sortiert sie topologisch und führt Batch-Löschungen durch.",
      softDeleteTip:
        "Der CLI-Befehl 'scripe add-bg-service {Module}' generiert die Job-Datei und fügt beide DI-Registrierungen in einem Schritt hinzu. Dies ist der empfohlene Weg, um einen SoftDeleteCleanupJob hinzuzufügen.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — FK-geordnete automatische Löschung",

      tenantWarning:
        "Hintergrundjobs laufen AUSSERHALB des HTTP-Kontexts — es ist kein Mandantenkontext verfügbar. Jobs, die mandantenspezifische Daten manipulieren, MÜSSEN IServiceScopeFactory verwenden, um einen expliziten Mandanten-Scope zu erstellen.",
      title: "Hintergrundjobs (Background Jobs)",
    },
    databaseMigrations: {
      architectureContent:
        "Basierend auf einem abstrakten DbContext werden anbieterspezifische abgeleitete Klassen generiert.",
      architectureTitle: "Abgeleitete DbContext-Topologie",
      cliContent:
        "Die CLI generiert nahtlos parallele Migrationen für alle unterstützten Datenbanken.",
      cliRemoveContent: "Sicheres Zurücksetzen von Migrationen für alle inaktiven Provider.",
      cliRemoveTitle: "Smart Force Removal (Rückgängig machen)",
      cliTitle: "Generierung von Multi-Provider-Migrationen",
      cliUpdateContent:
        "Erkennt automatisch den aktiven Provider aus den Settings beim Ausführen von Updates.",
      cliUpdateTitle: "Automatische Provider-Updates",
      cliWarning: "Warnung: Bearbeiten Sie niemals die ModelSnapshot-Dateien manuell.",
      description: "Adaptive EF Core-Architektur für SQL Server, Oracle und PostgreSQL.",
      diContent: "Dynamische Registrierung des korrekten Datenbankanbieters über appsettings.json.",
      diTitle: "Laufzeit-Provider-Injektion",
      intro:
        "Statt eines monolithischen DbContext verwendet SCRIPE streng typisierte, abgeleitete DbContexts für eine saubere Trennung der ModelSnapshot-Dateien.",
      newProviderContent: "Einfacher 4-Schritte-Prozess zur Erweiterung (z.B. SQLite für Tests).",
      newProviderStep1: "Erstellen einer abgeleiteten DbContext-Klasse.",
      newProviderStep2: "Implementierung einer Factory.",
      newProviderStep3: "Registrierung im DI-Container.",
      newProviderStep4: "Ausführen des add-migration Befehls.",
      newProviderTitle: "Hinzufügen eines neuen Datenbankanbieters",
      title: "Enterprise Datenbank-Migrationen",
    },
    fileStorage: {
      architectureTitle: "Speicherarchitektur",
      configTitle: "Konfiguration",
      description: "Strategie-Muster für lokale Speicherung, Azure, S3 und MinIO.",
      intro: "Wechseln Sie Anbieter nahtlos; jeder Speicher ist mandantenbezogen.",
      providersTitle: "Speicheranbieter",
      tenantScopingTitle: "Mandantenbezogener Speicher",
      title: "Dateispeicher (File Storage)",
      validationTitle: "Dateivalidierung",
    },
    gatewayDeployment: {
      description: "YARP-Proxy, Modulsystem, IIS und Kestrel.",
      iisStep1Desc: "Führen Sie dotnet publish aus.",
      iisStep1Title: "1. Applikation veröffentlichen",
      iisStep2Desc: "Weisen Sie das Ausgabeverzeichnis der Site zu.",
      iisStep2Title: "2. IIS Site konfigurieren",
      iisStep3Desc: "Konfigurieren Sie MODULE_NAME und Connection Strings.",
      iisStep3Title: "3. Variablen setzen",
      iisStep4Desc: "Stellen Sie 'No Managed Code' für out-of-process Hosting ein.",
      iisStep4Title: "4. App Pool",
      iisTitle: "IIS Deployment",
      intro: "Routet Anfragen und ermöglicht den flexiblen Betrieb.",
      kestrelTitle: "Kestrel Konfiguration",
      microservicesTitle: "Microservices-Modus",
      modesTitle: "Deployment-Modi",
      moduleIntro: "Gesteuert über die MODULE_NAME Umgebungsvariable.",
      moduleTitle: "Modulsystem beim Start",
      monolithTitle: "Monolith-Modus",
      portNote: "Jeder Service lauscht im Microservice-Modus auf einem anderen Port.",
      title: "Gateway & Deployment",
      yarpIntro: "Das Gateway übernimmt SSL, Lastverteilung und Routing.",
      yarpTitle: "YARP Gateway",
    },
    healthChecks: {
      architectureTitle: "Health-Endpoint-Architektur",
      checksIntro:
        "Jede Prüfung validiert eine bestimmte Infrastrukturabhängigkeit. Prüfungen laufen parallel für minimale Latenz. Fehlgeschlagene Prüfungen liefern detaillierte Fehlerinformationen ohne sensible Verbindungszeichenfolgen preiszugeben. Der Fehlerstatus ist pro Prüfung konfigurierbar — Datenbank- und Startup-Fehler geben Unhealthy zurück, während Redis, SMTP und Storage Degraded zurückgeben.",
      checksTitle: "Individuelle Gesundheitsprüfungen",
      description:
        "Enterprise-Health-Endpoints für Kubernetes Liveness-, Readiness- und Startup-Probes mit 5 individuellen Prüfungen.",
      dockerIntro:
        "Für Docker Compose Deployments konfigurieren Sie Health Checks in der Service-Definition. Verwenden Sie /health/live für grundlegende Liveness und /health/ready für Readiness. Setzen Sie start_period, um Zeit für Datenbankmigrationen zu gewähren.",
      dockerTip:
        "Für IIS-Deployments: Konfigurieren Sie die Application Request Routing (ARR) Health Probe mit /health/ready als Health-Check-URL. Für Azure App Service: Konfigurieren Sie den Health Check-Pfad = /health/ready.",
      dockerTitle: "Docker Compose Health Check",
      endpointsTitle: "Health-Endpoints",
      environmentsTitle: "Umgebungsspezifischer Leitfaden",
      intro:
        "SCRIPE bietet 5 Enterprise-Health-Endpoints, die für Kubernetes-Orchestrierung, Load-Balancer-Integration und Betriebsüberwachung konzipiert sind. Jeder Endpoint validiert spezifische Infrastrukturabhängigkeiten und liefert strukturierte JSON-Antworten.",
      k8sIntro:
        "SCRIPEs Health-Endpoints korrespondieren direkt mit Kubernetes-Probe-Typen. Die Startup-Probe erlaubt bis zu 5 Minuten (30 Fehler × 10s Intervall) für die Datenbankmigration beim Erstdeployment.",
      k8sTitle: "Kubernetes-Probe-Konfiguration",
      registrationIntro:
        "Gesundheitsprüfungen werden zentral in HealthCheckExtensions.cs mit expliziten Tags und Fehlerstatus registriert. Tags bestimmen, welcher Endpoint jede Prüfung einschließt.",
      registrationTitle: "Registrierung der Gesundheitsprüfungen",
      responseIntro:
        "SCRIPE unterstützt zwei Antwortformate je nach Endpoint. Öffentliche Probe-Endpoints liefern minimales JSON. Authentifizierte Endpoints liefern detaillierte Antworten mit Dauern, Tags, Nutzdaten und Ausnahmedetails.",
      responseTitle: "Antwortformat",
      title: "Gesundheitsprüfungen & K8s-Probes",
    },
    loadTesting: {
      authFlowIntro:
        "Der auth-flow.js Test simuliert realistische Benutzerauthentifizierungsmuster: Login, Zugriff auf geschützte Endpoints mit JWT-Token und Health-Check-Verifizierung. Benutzerdefinierte Metriken (scr_login_duration, scr_login_fail_rate) verfolgen auth-spezifische SLAs.",
      authFlowTitle: "Auth-Flow-Testskript",
      backupIntro:
        "SCRIPE unterstützt Multi-Provider-Backup-Strategien mit spezifischen Werkzeugen und Frequenzen für jede Datenbank-Engine.",
      backupTitle: "Backup & Disaster Recovery",
      cicdIntro:
        "k6 integriert sich in GitHub Actions, GitLab CI und Azure Pipelines. Tests laufen gegen eine containerisierte Backend-Instanz mit Health-Readiness-Warten vor der Ausführung. Die Pipeline schlägt automatisch fehl, wenn ein SLA-Schwellenwert überschritten wird.",
      cicdTitle: "CI/CD-Integration",
      description:
        "k6-Performance-Testsuiten mit SLA-Schwellenwerten, CI/CD-Integration und Multi-Provider-Backup-Strategie.",
      drWarning:
        "Kritisch: Testen Sie Ihre Disaster-Recovery-Prozeduren vierteljährlich. Ein Backup, das nie wiederhergestellt wurde, ist kein Backup — es ist eine Hoffnung.",
      intro:
        "SCRIPE enthält k6-Lasttestskripte zur Validierung von Performance-SLAs sowie eine umfassende Backup- und Disaster-Recovery-Strategie.",
      overviewIntro:
        "Zwei vorgefertigte k6-Testsuiten decken die kritischen Benutzerreisen ab: Authentifizierungsabläufe und CRUD-Operationen.",
      overviewTitle: "k6-Testsuiten",
      runningTitle: "Lasttests ausführen",
      thresholdsTitle: "SLA-Schwellenwerte",
      title: "Lasttests & Backup",
    },
    observability: {
      alertsIntro:
        "Vorkonfigurierte Prometheus-Alarmregeln erkennen kritische und warnende Zustände. Kritische Alarme feuern bei hohen Fehlerraten, Datenbankausfällen und extremer Latenz.",
      alertsTitle: "Alarmregeln",
      configTitle: "Observability-Konfiguration",
      description:
        "OpenTelemetry-Tracing, Prometheus-Metriken, Grafana-Loki-Logging und vorkonfigurierte Alarmregeln für das Produktionsmonitoring.",
      intro:
        "SCRIPE implementiert einen vollständigen Observability-Stack auf Basis offener Standards: OpenTelemetry für verteiltes Tracing, Prometheus für die Metrikerfassung, Grafana Loki für zentralisiertes Logging und Jaeger für die Trace-Visualisierung.",
      loggingIntro:
        "Serilog reichert jeden Logeintrag mit Maschinenname, Umgebung, Korrelations-ID, Mandanten-ID und Modul-Tag an. Bei konfiguriertem Loki werden Logs in Echtzeit gepusht.",
      loggingTitle: "Zentralisiertes Logging (Serilog + Loki)",
      monitoringStackIntro:
        "Eine vorgefertigte Docker-Compose-Datei startet den kompletten Monitoring-Stack mit automatisch bereitgestellten Datenquellen, Dashboards und Alarmregeln.",
      monitoringStackTitle: "Docker-Monitoring-Stack",
      productionWarning:
        "In der Produktion: TraceSampleRatio auf 0.1 setzen, Standard-Grafana-Passwort ändern, /metrics-Zugriff über Reverse-Proxy IP-Whitelist beschränken.",
      prometheusIntro:
        "Der /metrics-Endpoint stellt OpenTelemetry-Metriken im Prometheus-Textformat bereit. Prometheus scrapt diesen Endpoint alle 15 Sekunden.",
      prometheusTitle: "Prometheus-Metriken",
      stackTitle: "Observability-Stack-Architektur",
      title: "Observability & Monitoring",
      tracingIntro:
        "Das TracingBehavior erstellt einen OpenTelemetry-Span für jeden Command- und Query-Handler mit automatischer Modulerkennung, Anfragetypidentifikation und Dauermessung.",
      tracingTitle: "Verteiltes Tracing (OpenTelemetry)",
    },
    resilience: {
      architectureTitle: "Resilienz-Architektur",
      circuitBreakerIntro:
        "Stoppt nach 5 Fehlern für 30 Sekunden Anrufe zum ausgefallenen Service.",
      circuitBreakerTitle: "Circuit Breaker",
      configTitle: "Konfiguration",
      description: "Polly-Richtlinien: Retry, Circuit Breaker und Timeouts.",
      intro: "Schutz vor vorübergehenden Ausfällen externer HTTP-Anrufe.",
      retryTitle: "Retry-Richtlinie",
      timeoutTitle: "Timeout-Richtlinie",
      title: "Resilienz-Muster (Resilience)",
      usageTitle: "Nutzung im HttpClient",
    },
    scripeCli: {
      autoWiringIntro:
        "Das wichtigste Feature: Die CLI trägt Klassen in DI, Routing und Docker vollautomatisch ein.",
      autoWiringTitle: "Auto-Wiring (Verdrahtung)",
      bgJobsIntro: "Direktes Einbinden neuer Background-Worker in Hangfire.",
      bgJobsTitle: "Hintergrund-Dienste",
      commandsIntro: "Zwei fundamentale Befehle zum Generieren kompletter Architekturen.",
      commandsReferenceIntro:
        "Die SCRIPE-CLI bietet 123 Befehle in 10 verschiedenen Kategorien, die alle Phasen des Entwicklungs- und Betriebslebenszyklus abdecken. Unten finden Sie die vollständige Referenztabelle.",
      commandsReferenceTitle: "Vollständige Befehlsreferenz (v4.0)",
      commandsTitle: "Kern-Befehle",
      configIntro: "Liest die scripe.config.json im Projektstamm.",
      configTitle: "CLI Projektkonfiguration",
      dbCliCmd: "Aktualisiert Datenbanken simultan.",
      dbSyncIntro: "Hält Frontend und Backend voll synchron.",
      dbSyncTitle: "Datenbank & API-Synchronisierung",
      description: "Produktivitäts-CLI mit 79 Scaffolding-Templates und automatischem Wiring.",
      destructionIntro: "Ermöglicht das saubere Entfernen (Rollback) experimenteller Features.",
      destructionTitle: "Destruktive Tools",
      dslIntro: "Verwendet die --properties (-p) Flag für schnelle Modell-Definition.",
      dslSyntaxInfo: "Syntax: PropertyName:Typ[:Modifier1][:Modifier2]",
      dslTitle: "Property DSL-Syntax",
      intro:
        "Eine node-basierte CLI für das fehlerfreie Scaffolding und Verdrahten (Wiring) von Modulen und Features.",
      namingIntro: "Behandelt PascalCase, kebab-case und Pluralisierung automatisch.",
      namingTitle: "Intelligente Namensgebung",
      newFeatureIntro: "Generiert Controller, CQRS-Handler, Views und Zod-Schemas aus einer DSL.",
      newFeatureTitle: "Feature-Scaffolding: new-feature",
      newModuleIntro: "Generiert 3-Schichten-Backend und Frontend-Skelett.",
      newModuleTitle: "Modul-Scaffolding: new-module",
      revertSafely: "Sauberes Entfernen aller Einträge ohne Breaking Changes.",
      securityIntro: "Die generierten Controller werden sofort mit RBAC-Attributen geschützt.",
      securityTitle: "Automatisierte Security",
      syncApiCmd: "Konsumiert OpenAPI/Swagger für TypeScript-Generierung.",
      templatesIntro:
        "Anstatt Standardarchitekturen manuell zu schreiben, erzwingt die CLI eine reine Clean Architecture durch 79 präzise Handlebars-Templates, die sich über 54 Backend-Dateien und 25 Frontend-Konfigurationen erstrecken und so die Qualität sichern.",
      templatesTitle: "79 unveränderliche Vorlagen",
      title: "SCRIPE CLI Tooling",
      utilityIntro: "Steuerung von Build-Pipelines und Entwicklungsservern aus einem Prompt.",
      utilityTitle: "Ecosystem-Werkzeuge",
      wiringDocker: "Microservice-Verweise im docker-compose.",
      wiringFrontendApp: "Server-Routing Registrierung.",
      wiringFrontEnv: "Proxy-Umgebungsvariablen.",
      wiringPermissions: "TypeScript Konstanten-Mapping für Next.js.",
      wiringProgram: "Registrierung in der Program.cs.",
      wiringSettings: "Datenbank-Verbindungen in der appsettings.json.",
      wiringSln: "Aktualisierung der .sln Datei.",
    },
    scripeStudio: {
      architectureIntro:
        "Das Studio besteht aus zwei Komponenten: die Engine (Express + Socket.io + SQLite, Port 4201) für API-Anfragen, Befehlsausführung und Echtzeit-Streaming. Die UI (Next.js, Port 4200) bietet 19 Seiten für alle Aspekte des Entwicklungsworkflows.",
      architectureTitle: "Studio-Architektur",
      cliCommandsIntro:
        "Studio wird vollständig über die SCRIPE CLI gestartet und verwaltet. Der Befehl scripe studio unterstützt Dev-Modus (--dev), Produktionsmodus, Build-only (studio build), benutzerdefinierte Ports (--port, --engine-port) und Headless-Modus (--no-browser).",
      cliCommandsTitle: "Studio-CLI-Befehle",
      description:
        "Visuelles Entwickler-Dashboard mit Echtzeit-Modulverwaltung, Code-Generatoren, Dev-Server-Steuerung und integriertem Terminal.",
      featureConfig:
        "Config-Editor — Umgebungsvariablen über .env, appsettings.json und scripe.config.json anzeigen und bearbeiten.",
      featureDashboard:
        "Dashboard — Gesundheitsscore, Aktivitäts-Feed, Modulstatistiken und Systemübersicht.",
      featureDatabase:
        "Datenbank — Migrationen ausführen, Daten seeden, Migrationsstatus prüfen, Backups erstellen und Module zurücksetzen.",
      featureDevServers:
        "Dev-Server — Backend und Frontend mit Ein-Klick-Steuerung starten, stoppen und neustarten.",
      featureDocker:
        "Docker — Docker Compose-Dienste verwalten, Logs anzeigen, Container-Gesundheit prüfen.",
      featureGenerators:
        "Code-Generatoren — Events, Spezifikationen, Validatoren, Enums, Hooks, Komponenten und Seiten über formularbasierte UI generieren.",
      featureModules:
        "Modul-Manager — Module erstellen, löschen, inspizieren und durchsuchen mit visueller UI und Echtzeit-Feedback.",
      featurePackages:
        "Paket-Manager — npm- und NuGet-Pakete für Frontend und Backend hinzufügen, entfernen und aktualisieren.",
      featureSecurity:
        "Sicherheits-Tools — JWT/AES-Schlüssel generieren, Schwachstellen-Audits durchführen und Umgebungsvollständigkeit prüfen.",
      featuresTitle: "Studio-Funktionen",
      featureTerminal:
        "Terminal — Integriertes Terminal mit Befehlshistorie, ANSI-Ausgabe-Rendering und WebSocket-Streaming.",
      intro:
        "SCRIPE Studio ist ein visuelles Entwickler-Dashboard mit einer Echtzeit-Web-Oberfläche für Modulverwaltung, Code-Generatoren, Dev-Server-Steuerung, Datenbankoperationen, Docker-Verwaltung und mehr — alles in einem einzigen Browser-Tab.",
      securityIntro:
        "Defense-in-Depth-Sicherheit: Token-Authentifizierung (pro Start generiert), Befehls-Whitelist-Validierung, zentralisierte Eingabesanierung, Rate Limiting (200 Req/Min pro IP), CORS-Whitelist (nur localhost) und URL-Validierung.",
      securityTitle: "Sicherheitsmodell",
      title: "SCRIPE Studio",
    },
  },
};
