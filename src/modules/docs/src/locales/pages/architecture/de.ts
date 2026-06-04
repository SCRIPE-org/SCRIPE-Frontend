export const de = {
  architecture: {
    backend: {
      controllersTitle: "Controller",
      controllerTip:
        "Alle Controller erben von einem Basis-ApiController, der eine standardisierte Result<T>-Antwortzuordnung bietet. Controller sollten schlank sein – sie validieren nur das Request-Modell und delegieren an AstraFlow mediator.",
      description:
        "Anatomie der Program.cs, Middleware-Pipeline, DI-Service-Map, Modulregistrierungsmuster und Controller-Katalog.",
      diMapIntro:
        "Die folgende Tabelle zeigt alle wichtigen Service-Schnittstellen, ihre Implementierungen, Lebensdauern und wo sie registriert sind. Das Verständnis dieser Map ist für das Debugging und die Erweiterung des Systems unerlässlich.",
      diMapTitle: "DI Service Map",
      intro:
        "Das SCRIPE-Backend ist ein .NET 10 Modular Monolith mit 30 Zeilen in der Program.cs, die die Startup-Konfiguration an dedizierte Erweiterungen delegieren. Diese Seite zerlegt jede Schicht der Backend-Architektur.",
      middlewarePipelineIntro:
        "Die Middleware-Pipeline verarbeitet jede HTTP-Anfrage in einer bestimmten Reihenfolge. Jede Middleware kann die Pipeline kurzschließen (z. B. Rate Limiter gibt 429 zurück, Auth gibt 401 zurück). Die Reihenfolge ist entscheidend – Änderungen können die Sicherheit beeinträchtigen.",
      middlewarePipelineTitle: "Middleware-Pipeline",
      modulePatternIntro:
        "Jedes neue Modul folgt dem gleichen DI-Registrierungsmuster. Die Erweiterungsmethode AddXxxModule() registriert den DbContext des Moduls, Repositories, Services und den Modul-Registrierungsmarker.",
      modulePatternTitle: "Modul-Registrierungsmuster",
      programCsIntro:
        "Die Program.cs ist der Einstiegspunkt und das Verdrahtungszentrum der Anwendung. Sie erkennt den Deployment-Modus, registriert Services in einer bestimmten Reihenfolge und baut die Middleware-Pipeline auf. Die Datei folgt einer klaren 5-Abschnitts-Struktur.",
      programCsTitle: "Anatomie der Program.cs",
      title: "Backend-Architektur",
    },
    cqrs: {
      cachingTip:
        "Abfragen können serverseitiges Caching verwenden, um die Datenbank nicht bei jeder Anfrage zu belasten. Der Cache-Schlüssel sollte alle Abfrageparameter enthalten, um Eindeutigkeit zu gewährleisten. Der Cache wird nach erfolgreichen verwandten Befehlen automatisch invalidiert.",
      commandExampleTitle: "Befehls-Beispiel (Command)",
      commandSide: "Befehlsseite (Schreiben)",
      description:
        "Trennung von Befehlen und Abfragen (CQRS) mit AstraFlow mediator-Pipeline, Behaviors, Validierung und Caching.",
      intro:
        "SCRIPE verwendet das CQRS-Muster (Command Query Responsibility Segregation), um Lese- und Schreibvorgänge zu trennen. Befehle (Commands) ändern den Zustand und durchlaufen Validierungs- und Audit-Behaviors. Abfragen (Queries) lesen den Zustand und können Caching nutzen. AstraFlow mediator fungiert als Vermittler zwischen Controllern und Handlern.",
      pipelineTitle: "AstraFlow mediator-Pipeline",
      queryExampleTitle: "Abfrage-Beispiel (Query)",
      querySide: "Abfrageseite (Lesen)",
      title: "CQRS-Muster",
      validationBehaviorTitle: "Validierungs-Behavior",
      whatIsCqrsIntro:
        "CQRS trennt Ihre Anwendung in zwei Seiten: Befehle (Schreibvorgänge) und Abfragen (Lesevorgänge). Jede Seite kann unabhängig optimiert werden – Befehle konzentrieren sich auf Datenintegrität und Validierung, während Abfragen auf Leistung und Caching fokussiert sind.",
      whatIsCqrsTitle: "Was ist CQRS?",
    },
    cqrsPipeline: {
      behaviorOrderTip:
        "Die Standardsicherheitsprüfung lehnt Pipeline-Reihenfolgen ab, in denen Caching vor Validation oder FeatureCheck läuft. Deaktiviere Mediator__EnforceSecurityPipelineOrder nur, wenn du das Risiko vollständig kontrollierst.",
      cachingIntro:
        "Überprüft den Cache auf vorhandene Ergebnisse für ICacheable-Abfragen, bevor der Handler ausgeführt wird.",
      cachingTitle: "CachingBehavior",
      commandMapIntro:
        "Die folgende Tabelle listet jeden Befehl, jede Abfrage und jeden Validator im System auf.",
      commandMapTitle: "Katalog der Commands & Queries",
      commandsTitle: "Commands (Schreiben)",
      description:
        "SCRIPE-Mediator-Pipeline-Behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, Result-Pattern und vollständiger Command/Query-Katalog.",
      featureCheckIntro:
        "Das FeatureCheckBehavior fängt Commands ab, die IRequireFeature implementieren. Es prüft, ob die Edition des Mandanten das angeforderte Feature erlaubt, indem IFeatureChecker.IsEnabledAsync aufgerufen wird. Ist das Feature deaktiviert, wird ein Forbidden-Fehler zurückgegeben, ohne den Handler auszuführen. Operationen auf Systemebene (ohne TenantId) umgehen diese Prüfung.",
      featureCheckMarkerIntro:
        "Commands aktivieren das Feature-Gating, indem sie das IRequireFeature-Interface mit einer RequiredFeatureName-Eigenschaft implementieren. Wenn das Entitlements-Modul nicht bereitgestellt ist, gibt NoOpFeatureChecker für alle Prüfungen true zurück — wodurch dieses Behavior zu einem stillen Durchlauf wird.",
      featureCheckMarkerTitle: "IRequireFeature-Marker",
      featureCheckTitle: "FeatureCheckBehavior",
      intro:
        "Jeder Command und jede Query in SCRIPE läuft durch eine konfigurierbare SCRIPE-Mediator-Pipeline mit 5 integrierten Behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior und CachingBehavior. Die Reihenfolge wird über appsettings oder Umgebungsvariablen gesteuert und beim Start validiert.",
      loggingIntro:
        "Protokolliert jede AstraFlow mediator-Anfrage mit Benutzer-ID, Mandanten-ID, Request-Typ und Ausführungszeit.",
      loggingTitle: "LoggingBehavior",
      overviewIntro:
        "Die Standardreihenfolge ist Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. Validierung und Feature-Prüfung laufen bewusst vor dem Cache-Lookup, während Cache-Invalidierung nach erfolgreichen Mutationen vor dem Webhook-Versand entrollt.",
      overviewTitle: "Pipeline-Übersicht",
      queriesTitle: "Queries (Lesen)",
      registrationIntro: "Behaviors werden in AddCoreApplication() registriert.",
      registrationTitle: "Pipeline-Registrierung",
      resultPatternIntro:
        "Alle Handler geben Result<T> zurück, anstatt Exceptions für erwartete Fehler auszulösen.",
      resultPatternTitle: "Result-Muster (Result Pattern)",
      separationIntro: "CQRS trennt Schreibvorgänge (Commands) von Lesevorgängen (Queries).",
      separationTitle: "Trennung von Command vs Query",
      title: "CQRS-Pipeline",
      validationIntro:
        "ValidationBehavior läuft direkt nach dem Logging. Es sammelt alle IValidator<TRequest>-Validatoren, gibt strukturierte Result-Fehler für ungültige Requests zurück und verhindert, dass ungültige Requests Handler oder Cache erreichen.",
      validationTitle: "ValidationBehavior",
      validatorExampleTitle: "Beispiele für Validatoren",
    },
    dataFlow: {
      backendPipelineIntro:
        "Jede Backend-Anfrage durchläuft 10 Middleware-Komponenten und 3 AstraFlow mediator-Pipeline-Behaviors, bevor sie den Handler erreicht. Dies gewährleistet konsistente Protokollierung, Authentifizierung, Autorisierung, Validierung und Auditierung.",
      backendPipelineTitle: "Backend-Request-Pipeline",
      cacheTip:
        "Setzen Sie die staleTime auf 5 Minuten für Daten, die sich selten ändern (Rollen, Berechtigungen). Verwenden Sie 0 für Daten, die sich häufig ändern (Audit-Logs, Benachrichtigungen). Invalidieren Sie immer verwandte Abfragen nach erfolgreichen Mutationen.",
      cachingFlowIntro:
        "Das Backend verwendet eine zweistufige Caching-Strategie: L1 (in-process IMemoryCache) und L2 (verteiltes Redis). Das Frontend nutzt den integrierten Cache von TanStack Query mit konfigurierbarer staleTime.",
      cachingFlowTitle: "Caching-Strategie",
      description:
        "End-to-End Datenflussdiagramme: Abfrage, Mutation, Backend-Pipeline, Fehlerbehandlung und Caching-Strategie.",
      errorFlowIntro:
        "Fehler werden auf mehreren Ebenen behandelt. Jede Fehlerquelle hat einen spezifischen Handler, Antwortcode und eine Frontend-Behandlungsstrategie.",
      errorFlowTitle: "Fehlerbehandlung",
      intro:
        "Das Verständnis des Datenflusses durch SCRIPE ist entscheidend für das Debugging und die Erweiterung des Systems. Diese Seite verfolgt die Daten von einem Klick in der Benutzeroberfläche bis zur Datenbank und zurück.",
      mutationFlowTitle: "Mutations-Fluss (Schreiben)",
      queryFlowIntro:
        "Wenn ein Benutzer Daten betrachtet (z. B. das Öffnen der Benutzerseite), beginnt der Fluss bei der View, geht durch das ViewModel, TanStack Query, das Repository, den API-Service und schließlich die Backend-API.",
      queryFlowTitle: "Abfrage-Fluss (Lesen)",
      title: "Datenfluss",
    },
    dependencyInjection: {
      architectureIntro:
        "Die Program.cs folgt einer strengen 4-Phasen-Registrierungsreihenfolge: (1) Kerninfrastruktur, (2) CORS & Rate Limiting, (3) Module, (4) Application Layer (AstraFlow mediator).",
      architectureTitle: "DI-Registrierungsarchitektur",
      bestPracticesTitle: "DI Best Practices",
      captiveTip:
        "Achten Sie auf Captive Dependencies (wenn ein Singleton einen Scoped-Service injiziert).",
      controllerProviderIntro:
        "Filtert, welche Controller beim Start basierend auf MODULE_NAME geladen werden.",
      controllerProviderTitle: "Module Controller Feature Provider",
      coreServicesIntro: "Von AddCoreInfrastructure() registriert und für alle Module verfügbar.",
      coreServicesTitle: "Core Infrastructure Services",
      description:
        "Program.cs Registrierungsablauf, Modul-DI-Muster, Service Discovery, Core + Identity Service Maps, Lebenszyklus-Regeln und YARP Gateway.",
      gatewayIntro:
        "Das Gateway routet Anfragen an Backend-Microservices basierend auf dem URL-Präfix.",
      gatewayTitle: "YARP Gateway-Konfiguration",
      identityModuleIntro:
        "Registriert Repository-Schnittstellen und Service-Schnittstellen (Scoped).",
      identityModuleTitle: "Identity Module Services",
      intro:
        "SCRIPE verwendet den in .NET integrierten Dependency-Injection-Container mit einem strukturierten Registrierungsmuster.",
      lifetimeTitle: "Regeln zur Lebensdauer von Services",
      moduleRegIntro:
        "Jedes Modul stellt eine Erweiterungsmethode AddXxxModule() bereit, die all seine Services registriert.",
      moduleRegTitle: "Modul-Registrierungsmuster",
      monolithNote:
        "Im Monolith-Modus werden ALLE Module geladen. Im Microservice-Modus läuft jedes Modul als eigenständiger Prozess.",
      scopedTitle: "Scoped Lifetime",
      serviceDiscoveryIntro:
        "Konfigurationsbasierte Service Discovery zur Auflösung von Dienstnamen in URLs.",
      serviceDiscoveryTitle: "Service Discovery",
      singletonTitle: "Singleton Lifetime",
      title: "Dependency Injection (DI)",
    },
    domainEvents: {
      architectureSummaryTitle: "Outbox Architektur-Zusammenfassung",
      customEventsIntro: "Folgen Sie diesen 3 Schritten, um ein neues Domain-Event hinzuzufügen.",
      customEventsTitle: "Erstellen benutzerdefinierter Domain-Events",
      description:
        "IDomainEvent-Schnittstelle, Outbox-Pattern, OutboxInterceptor, OutboxProcessor und zuverlässige Ereignisübermittlung.",
      interfaceIntro:
        "Alle Domain-Events implementieren die IDomainEvent-Schnittstelle, die von AstraFlow mediators INotification erbt. Dies ermöglicht In-Process-Pub/Sub.",
      interfaceTitle: "IDomainEvent-Schnittstelle",
      intro:
        "Domain-Events repräsentieren signifikante Vorkommnisse in der Geschäftsdomäne. SCRIPE verwendet das Outbox-Pattern, um eine zuverlässige Übermittlung zu garantieren.",
      outboxCleanupIntro:
        "Ein wiederkehrender Hangfire-Job läuft täglich, um verarbeitete Outbox-Nachrichten zu löschen, die älter als 7 Tage sind.",
      outboxCleanupTitle: "Outbox Cleanup Job",
      outboxInterceptorIntro:
        "Der OutboxInterceptor sammelt alle Domain-Events von getrackten Entitäten, serialisiert sie und fügt sie demselben Datenbankkontext hinzu.",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxIntro:
        "Das Outbox-Pattern löst das Dual-Write-Problem: Wie man atomar die Datenbank aktualisiert UND ein Ereignis veröffentlicht.",
      outboxMessageTitle: "OutboxMessage Entität",
      outboxProcessorIntro:
        "Ein BackgroundService, der die OutboxMessage-Tabelle alle 5 Sekunden nach unverarbeiteten Nachrichten abfragt.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxTitle: "Outbox-Pattern",
      outboxWarning:
        "Das Outbox-Pattern bietet eine At-Least-Once-Zustellung, keine Exactly-Once. Event-Handler müssen idempotent sein.",
      publisherTitle: "IDomainEventPublisher",
      publishingIntro:
        "Domain-Events folgen einem 6-stufigen Lebenszyklus: Entität löst Event aus, OutboxInterceptor fängt es ab, wird als OutboxMessage persistiert, OutboxProcessor ruft es ab und veröffentlicht es via AstraFlow mediator.",
      publishingTitle: "Veröffentlichungs- & Behandlungsfluss",
      reliabilityTitle: "Zuverlässigkeitsgarantien",
      step1Content: "Erstellen Sie einen Record, der IDomainEvent implementiert.",
      step1Title: "1. Event definieren",
      step2Content: "Rufen Sie entity.RaiseDomainEvent() auf, dann SaveChangesAsync.",
      step2Title: "2. Aus dem Command Handler auslösen",
      step3Content: "Implementieren Sie INotificationHandler<DomainEventNotification>.",
      step3Title: "3. Event-Handler erstellen",
      title: "Domain Events",
      withOutboxTitle: "✅ Mit Outbox-Pattern",
      withoutOutboxTitle: "❌ Ohne Outbox-Pattern",
    },
    domainModel: {
      auditableEntityIntro:
        "AuditableEntity fügt der Basis-Entity 7 Audit- und Soft-Delete-Felder hinzu. Diese Felder werden automatisch vom AuditableEntityInterceptor ausgefüllt – Sie setzen sie niemals manuell.",
      auditableEntityTitle: "AuditableEntity",
      bestPracticesTitle: "Best Practices",
      concreteEntitiesTitle: "Register der konkreten Entitäten",
      description:
        "Entitätsvererbungshierarchie, AuditableEntity, ITenantAwareEntity, Soft-Delete-Lebenszyklus, Repository-Abstraktionen und globale Abfragefilter.",
      dontTitle: "❌ DON'T",
      doTitle: "✅ DO",
      entityBaseIntro:
        "Die Basisklasse Entity<TId> bietet Identitätsgleichheit, Hashcode-Generierung und Unterstützung für Domain-Events.",
      entityBaseTitle: "Basisklasse Entity<TId>",
      entityDomainEventNote:
        "Domain-Events, die über RaiseDomainEvent() ausgelöst werden, werden vom OutboxInterceptor während SaveChanges gesammelt und in derselben Transaktion persistiert.",
      entityHierarchyIntro:
        "Alle Domain-Entitäten folgen einer dreistufigen Vererbungskette: IEntity (Marker-Interface) → Entity<TId> (Identität + Gleichheit + Domain-Events) → AuditableEntity (Audit-Felder + Soft-Delete). Entitäten, die zu einem bestimmten Mandanten gehören, implementieren zudem die Schnittstelle ITenantAwareEntity.",
      entityHierarchyTitle: "Entitätsvererbungshierarchie",
      ientityTitle: "IEntity-Schnittstelle",
      ignoreFiltersTip:
        "Verwenden Sie IgnoreQueryFilters() nur bei Papierkorb-Operationen und mandantenübergreifenden Abfragen durch SuperAdmins. Kombinieren Sie es immer mit einem expliziten Mandantenfilter.",
      intro:
        "Das Domain-Modell von SCRIPE folgt einer strengen Vererbungshierarchie, bei der alle Geschäftsentitäten von AuditableEntity erben, die Audit-Felder und Soft-Delete-Unterstützung bietet. Mandantenspezifische Entitäten implementieren zusätzlich ITenantAwareEntity für eine automatische Isolierung auf Zeilenebene.",
      queryFiltersIntro:
        "Globale EF Core-Abfragefilter werden auf jede Entität angewendet, die von AuditableEntity erbt (Soft-Delete-Filter) und ITenantAwareEntity implementiert (Mandanten-Isolationsfilter).",
      queryFiltersTitle: "Globale Abfragefilter (Query Filters)",
      repositoryIntro:
        "SCRIPE definiert drei Repository-Schnittstellen: IReadRepository<T> für Abfragen, IWriteRepository<T> für Mutationen und IRepository<T>, das beide mit einer SaveChangesAsync-Methode kombiniert.",
      repositoryTitle: "Repository-Abstraktionen",
      softDeleteIntro:
        "Alle Entitäten verwenden Soft-Delete über das IsDeleted-Flag. Ein DELETE-Endpunkt wandelt die Anforderung in ein Soft-Delete um. Die Entität bleibt in der Datenbank, ist aber verborgen.",
      softDeleteTitle: "Soft-Delete-Lebenszyklus",
      tenantAwareIntro:
        "Entitäten, die ITenantAwareEntity implementieren, werden über globale Abfragefilter von EF Core automatisch auf den aktuellen Mandanten beschränkt.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantIsolationWarning:
        "Umgehen Sie die Mandantenisolierung niemals ohne ausdrückliche Autorisierung. Die Verwendung von IgnoreQueryFilters() entfernt ALLE Filter, einschließlich des Mandantenbereichs.",
      title: "Domain Model",
    },
    frontend: {
      connectorPatternIntro:
        "Das Connector-Muster trennt Next.js App Router-Seiten (Server Components) von Modul-Views (Client Components). Seiten in src/app/ sind dünne Konnektoren, die Modul-Views importieren und rendern. Sie verarbeiten nur Routing, Metadaten und URL-Parameter.",
      connectorPatternTitle: "Connector-Muster",
      connectorWarning:
        "Legen Sie NIEMALS Geschäftslogik, Datenabrufe, Formulare oder State-Management in Dateien unter src/app/ ab. Dies sind Server Components, die nur Routen mit Modul-Views verbinden.",
      description:
        "SOLID View/ViewModel-Muster, Modulstruktur und das Connector-Muster für die Next.js-Integration.",
      intro:
        "Das SCRIPE-Frontend basiert auf Next.js 16 (App Router) und folgt einem strengen SOLID View/ViewModel-Muster. Jede Seite besteht aus einer reinen UI-View, die die gesamte Logik an ViewModel-Hooks delegiert. Diese Trennung gewährleistet Testbarkeit, Wiederverwendbarkeit und Wartbarkeit.",
      moduleStructureTitle: "Modul-Dateistruktur",
      solidPatternIntro:
        "Das SOLID-Muster stellt sicher, dass jeder Teil der Benutzeroberfläche eine einzige Verantwortung hat. Views rendern JSX, ViewModels verwalten Zustand und Logik, und Components bieten wiederverwendbare UI-Abschnitte.",
      solidPatternTitle: "SOLID View/ViewModel-Muster",
      title: "Frontend-Architektur",
      viewDo: "Eine View SOLLTE",
      viewDont: "Eine View SOLLTE NICHT",
      viewExampleTitle: "View-Beispiel",
      viewModelRulesIntro:
        "ViewModels sind React-Hooks, die die gesamte Geschäftslogik enthalten. Sie setzen sich aus abschnittsspezifischen ViewModels zusammen (Statistiken, Filter, Tabelle) und geben typisierte Schnittstellen zurück, die von Views konsumiert werden.",
      viewModelRulesTitle: "ViewModel-Regeln",
      viewRulesTitle: "View-Regeln",
    },
    modules: {
      allowedImportsTitle: "Erlaubte Importe",
      backendModuleIntro:
        "Jedes Backend-Modul folgt dem DDD (Domain-Driven Design) mit drei Projekten: Domain, Application und Infrastructure. Die Domain ist reines C# ohne externe Abhängigkeiten.",
      backendModuleTitle: "Backend-Modul Template",
      boundaryWarning:
        "Modulgrenzen sind absolut verbindlich. Wenn Sie Code zwischen Modulen teilen müssen, MUSS dieser in @core/ abgelegt werden. Jeder Import aus @modules/{other}/ ist ein Verstoß und wird beim Code-Review abgelehnt.",
      communicationTitle: "Modulübergreifende Kommunikationsmuster",
      description:
        "Regeln zur Modulisolierung, Backend-/Frontend-Templates, Modul-Registry und modulübergreifende Kommunikation.",
      forbiddenImportsTitle: "Verbotene Importe",
      frontendModuleTitle: "Frontend-Modul Template",
      intro:
        "SCRIPE verwendet ein strenges Modulsystem, bei dem jedes Modul eine isolierte Insel mit klaren Grenzen ist. Module können nicht voneinander importieren – sie kommunizieren nur über URLs, gemeinsame IDs oder den Core-Event-Bus. Dies sichert Unabhängigkeit, Testbarkeit und die Möglichkeit zur Auslagerung.",
      isolationRulesTitle: "Regeln zur Modulisolierung",
      pattern1Content:
        "Navigieren Sie über Standard-URL-Links zur Seite eines anderen Moduls. Keine Importe erforderlich.",
      pattern1Title: "Muster 1: URL-Navigation",
      pattern2Content:
        "Speichern Sie nur die Entitäts-ID des fremden Moduls. Betten Sie niemals die gesamte Entität ein.",
      pattern2Title: "Muster 2: Nur gemeinsame IDs",
      pattern3Content:
        "Veröffentlichen und Abonnieren von Ereignissen über einen gemeinsamen Event-Bus in @core/. (Zukünftiges Muster).",
      pattern3Title: "Muster 3: Core Event Bus",
      registryIntro:
        "Die Modul-Registry verfolgt alle aktiven Module zur Laufzeit. Sie wird während des Anwendungsstarts gefüllt, wenn die IModuleRegistration-Implementierung jedes Moduls aufgelöst und registriert wird.",
      registryTitle: "Modul-Registry",
      title: "Modul-System",
    },
    overview: {
      backendArchIntro:
        "Das Backend folgt einer Request-Pipeline-Architektur, bei der jede HTTP-Anfrage durch Middleware, Controller, AstraFlow mediator-Verhaltensweisen (Behaviors) und schließlich den CQRS-Handler fließt. Dies gewährleistet konsistente Validierung, Auditierung und Fehlerbehandlung.",
      backendArchTitle: "Backend-Architektur",
      communicationPatternsTitle: "Modulübergreifende Kommunikation",
      crossModuleNote:
        "Das Event-Bus-Muster ist für zukünftige Releases geplant. Derzeit kommunizieren Module ausschließlich über URL-Navigation und gemeinsame IDs.",
      description:
        "Clean-Architecture-Schichten, Backend-Pipeline, Frontend-SOLID-Fluss und Modulgrenzen.",
      frontendArchIntro:
        "Das Frontend verwendet ein SOLID View/ViewModel-Muster, bei dem Views reine Benutzeroberflächen sind (kein State, keine Logik) und ViewModels die gesamte Geschäftslogik enthalten. Das Connector-Muster trennt das Next.js-Routing (Server Components) von der Anwendungslogik (Client Components).",
      frontendArchTitle: "Frontend-Architektur",
      intro:
        "SCRIPE folgt einer strikten Clean Architecture mit vier Schichten: Presentation, Application, Domain und Infrastructure. Die Dependency Rule stellt sicher, dass innere Schichten nie von äußeren abhängen. Dieses Muster gilt konsistent für Backend und Frontend.",
      layersTitle: "Clean Architecture Schichten",
      moduleBoundariesIntro:
        "Module sind isolierte Inseln. Sie können nicht voneinander importieren. Dies ermöglicht unabhängige Entwicklung, isolierte Fehler und die Möglichkeit, Module in separate Repositories auszulagern.",
      moduleBoundariesTitle: "Modulgrenzen",
      title: "Architektur-Übersicht",
      withBoundaries: "Mit Modulgrenzen",
      withoutBoundaries: "Ohne Modulgrenzen",
    },
    solidPattern: {
      antiPatternWarning:
        "Anti-Pattern: Direkte Verwendung von useState, useEffect oder useQuery in einer View-Komponente. SÄMTLICHER Status und Logik müssen in ViewModels leben. Views dienen ausschließlich der UI-Zusammenstellung.",
      description:
        "Seitentyp-Szenarien: CRUD-Listen, Dashboards, Profile, Einstellungen, Wizards und Berichts-Generatoren.",
      intro:
        "Das SOLID View/ViewModel-Muster ist für alle Seiten in src/modules/ obligatorisch. Dieser Leitfaden behandelt 7 Seitentyp-Szenarien mit ihren genauen Verzeichnisstrukturen, ViewModel-Mustern und Codebeispielen.",
      principlesTitle: "Angewandte SOLID-Prinzipien",
      rulesTitle: "Goldene Regeln",
      scenario1Intro:
        "Verwendung für die Verwaltung von Entitätssammlungen (Benutzer, Produkte, Bestellungen). Der Orchestrator setzt sich aus ViewModels für Statistiken, Filter und Tabelle zusammen.",
      scenario1Title: "Szenario 1: CRUD-Listenseite",
      scenario2Intro:
        "Verwendung für KPIs, Diagramme und Metriken. Jeder Diagramm- oder Kartenbereich erhält ein eigenes ViewModel mit Zeitraumauswahl und Datentransformation.",
      scenario2Title: "Szenario 2: Dashboard / Analytics",
      scenario3Intro:
        "Verwendung für die Anzeige einer einzelnen Entität mit Tabs und Abschnitten. Der Orchestrator ruft die Hauptentität ab und stellt die Tab-ViewModels zusammen.",
      scenario3Title: "Szenario 3: Detail- / Profilseite",
      scenario4Intro:
        "Verwendung für mehrere unabhängig speicherbare Formularabschnitte. Jeder Einstellungsbereich erhält ein eigenes ViewModel mit Formularstatus und Speichermutation.",
      scenario4Title: "Szenario 4: Einstellungsseite",
      scenario5Intro:
        "Verwendung für komplexe mehrstufige Abläufe wie Onboarding oder Checkout. Das Wizard-ViewModel koordiniert die Schritt-Navigation, Validierungs-Gates und die gemeinsame Übermittlung.",
      scenario5Title: "Szenario 5: Wizard / Mehrstufiges Formular",
      scenariosIntro:
        "Wählen Sie das Szenario, das zu Ihrem Seitentyp passt. Jedes bietet eine bewährte Struktur, die Konsistenz in der gesamten Anwendung gewährleistet.",
      scenariosTitle: "Seitentyp-Szenarien",
      title: "SOLID View/ViewModel",
    },
    stateManagement: {
      antiPatternsTitle: "Anti-Patterns",
      decisionTitle: "Entscheidungsmatrix",
      description:
        "TanStack Query für Server-State, Zustand für globalen UI-State und LanguageProvider für Lokalisierung.",
      dontTitle: " DON'T",
      doTitle: " DO",
      intro:
        "SCRIPE verwendet drei Tools zur Zustandsverwaltung, jedes für eine bestimmte Kategorie: TanStack Query für Serverdaten (API-Ergebnisse), Zustand für den globalen UI-State (Auth, Sidebar, Theme) und useState für komponentenlokalen State (Formulare, Toggles).",
      localizationIntro:
        "Die Lokalisierung nutzt einen benutzerdefinierten LanguageProvider mit localStorage-Persistenz sowie ein modulbezogenes Gebietsschemasystem. Gemeinsame Schlüssel (~1.156) befinden sich in core/locales/. Modulspezifische Schlüssel befinden sich im Verzeichnis locales/ jedes Moduls und werden zur Erstellungzeit über module-registry.ts eifrig importiert, um seitenweise Laden ohne Flackern zu ermöglichen.",
      localizationTitle: "Lokalisierung (LanguageProvider)",
      noLocaleFoldersWarning:
        "Verwenden Sie KEINE [locale]-Ordner in src/app/! Die Lokalisierung wird über den LanguageProvider-Context und nicht über dateibasiertes Routing abgewickelt. Kein next-intl, kein next-i18next, keine URL-basierte Sprache (/en/, /de/).",
      tanstackIntro:
        "Verwenden Sie TanStack Query für alle Daten, die von der API kommen. Es verarbeitet automatisch Caching, Refetching im Hintergrund, Paginierung, optimistische Updates und die Deduplizierung von Anfragen.",
      tanstackTitle: "TanStack Query (Server State)",
      title: "State Management",
      zustandIntro:
        "Verwenden Sie Zustand für globalen UI-Status, der über Komponenten hinweg geteilt werden muss, aber nicht vom Server stammt. Es gibt genau 3 zugelassene Stores.",
      zustandTitle: "Zustand (Globaler UI-State)",
    },
  },
};
