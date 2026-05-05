/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  architecture: {
    overview: {
      title: "Architektur-Übersicht",
      description:
        "Clean-Architecture-Schichten, Backend-Pipeline, Frontend-SOLID-Fluss und Modulgrenzen.",
      intro:
        "NEXORA folgt einer strikten Clean Architecture mit vier Schichten: Presentation, Application, Domain und Infrastructure. Die Dependency Rule stellt sicher, dass innere Schichten nie von äußeren abhängen. Dieses Muster gilt konsistent für Backend und Frontend.",
      layersTitle: "Clean Architecture Schichten",
      backendArchTitle: "Backend-Architektur",
      backendArchIntro:
        "Das Backend folgt einer Request-Pipeline-Architektur, bei der jede HTTP-Anfrage durch Middleware, Controller, NEXORA mediator-Verhaltensweisen (Behaviors) und schließlich den CQRS-Handler fließt. Dies gewährleistet konsistente Validierung, Auditierung und Fehlerbehandlung.",
      frontendArchTitle: "Frontend-Architektur",
      frontendArchIntro:
        "Das Frontend verwendet ein SOLID View/ViewModel-Muster, bei dem Views reine Benutzeroberflächen sind (kein State, keine Logik) und ViewModels die gesamte Geschäftslogik enthalten. Das Connector-Muster trennt das Next.js-Routing (Server Components) von der Anwendungslogik (Client Components).",
      moduleBoundariesTitle: "Modulgrenzen",
      moduleBoundariesIntro:
        "Module sind isolierte Inseln. Sie können nicht voneinander importieren. Dies ermöglicht unabhängige Entwicklung, isolierte Fehler und die Möglichkeit, Module in separate Repositories auszulagern.",
      withBoundaries: "Mit Modulgrenzen",
      withoutBoundaries: "Ohne Modulgrenzen",
      communicationPatternsTitle: "Modulübergreifende Kommunikation",
      crossModuleNote:
        "Das Event-Bus-Muster ist für zukünftige Releases geplant. Derzeit kommunizieren Module ausschließlich über URL-Navigation und gemeinsame IDs.",
    },
    backend: {
      title: "Backend-Architektur",
      description:
        "Anatomie der Program.cs, Middleware-Pipeline, DI-Service-Map, Modulregistrierungsmuster und Controller-Katalog.",
      intro:
        "Das NEXORA-Backend ist ein .NET 10 Modular Monolith mit 288 Zeilen in der Program.cs, die 16 Service-Registrierungen, 10 Middleware-Komponenten und 18 REST-Controller miteinander verbinden. Diese Seite zerlegt jede Schicht der Backend-Architektur.",
      programCsTitle: "Anatomie der Program.cs",
      programCsIntro:
        "Die Program.cs ist der Einstiegspunkt und das Verdrahtungszentrum der Anwendung. Sie erkennt den Deployment-Modus, registriert Services in einer bestimmten Reihenfolge und baut die Middleware-Pipeline auf. Die Datei folgt einer klaren 5-Abschnitts-Struktur.",
      middlewarePipelineTitle: "Middleware-Pipeline",
      middlewarePipelineIntro:
        "Die Middleware-Pipeline verarbeitet jede HTTP-Anfrage in einer bestimmten Reihenfolge. Jede Middleware kann die Pipeline kurzschließen (z. B. Rate Limiter gibt 429 zurück, Auth gibt 401 zurück). Die Reihenfolge ist entscheidend – Änderungen können die Sicherheit beeinträchtigen.",
      diMapTitle: "DI Service Map",
      diMapIntro:
        "Die folgende Tabelle zeigt alle wichtigen Service-Schnittstellen, ihre Implementierungen, Lebensdauern und wo sie registriert sind. Das Verständnis dieser Map ist für das Debugging und die Erweiterung des Systems unerlässlich.",
      modulePatternTitle: "Modul-Registrierungsmuster",
      modulePatternIntro:
        "Jedes neue Modul folgt dem gleichen DI-Registrierungsmuster. Die Erweiterungsmethode AddXxxModule() registriert den DbContext des Moduls, Repositories, Services und den Modul-Registrierungsmarker.",
      controllersTitle: "Controller",
      controllerTip:
        "Alle Controller erben von einem Basis-ApiController, der eine standardisierte Result<T>-Antwortzuordnung bietet. Controller sollten schlank sein – sie validieren nur das Request-Modell und delegieren an NEXORA mediator.",
    },
    frontend: {
      title: "Frontend-Architektur",
      description:
        "SOLID View/ViewModel-Muster, Modulstruktur und das Connector-Muster für die Next.js-Integration.",
      intro:
        "Das NEXORA-Frontend basiert auf Next.js 16 (App Router) und folgt einem strengen SOLID View/ViewModel-Muster. Jede Seite besteht aus einer reinen UI-View, die die gesamte Logik an ViewModel-Hooks delegiert. Diese Trennung gewährleistet Testbarkeit, Wiederverwendbarkeit und Wartbarkeit.",
      solidPatternTitle: "SOLID View/ViewModel-Muster",
      solidPatternIntro:
        "Das SOLID-Muster stellt sicher, dass jeder Teil der Benutzeroberfläche eine einzige Verantwortung hat. Views rendern JSX, ViewModels verwalten Zustand und Logik, und Components bieten wiederverwendbare UI-Abschnitte.",
      viewRulesTitle: "View-Regeln",
      viewDo: "Eine View SOLLTE",
      viewDont: "Eine View SOLLTE NICHT",
      viewExampleTitle: "View-Beispiel",
      viewModelRulesTitle: "ViewModel-Regeln",
      viewModelRulesIntro:
        "ViewModels sind React-Hooks, die die gesamte Geschäftslogik enthalten. Sie setzen sich aus abschnittsspezifischen ViewModels zusammen (Statistiken, Filter, Tabelle) und geben typisierte Schnittstellen zurück, die von Views konsumiert werden.",
      moduleStructureTitle: "Modul-Dateistruktur",
      connectorPatternTitle: "Connector-Muster",
      connectorPatternIntro:
        "Das Connector-Muster trennt Next.js App Router-Seiten (Server Components) von Modul-Views (Client Components). Seiten in src/app/ sind dünne Konnektoren, die Modul-Views importieren und rendern. Sie verarbeiten nur Routing, Metadaten und URL-Parameter.",
      connectorWarning:
        "Legen Sie NIEMALS Geschäftslogik, Datenabrufe, Formulare oder State-Management in Dateien unter src/app/ ab. Dies sind Server Components, die nur Routen mit Modul-Views verbinden.",
    },
    cqrs: {
      title: "CQRS-Muster",
      description:
        "Trennung von Befehlen und Abfragen (CQRS) mit NEXORA mediator-Pipeline, Behaviors, Validierung und Caching.",
      intro:
        "NEXORA verwendet das CQRS-Muster (Command Query Responsibility Segregation), um Lese- und Schreibvorgänge zu trennen. Befehle (Commands) ändern den Zustand und durchlaufen Validierungs- und Audit-Behaviors. Abfragen (Queries) lesen den Zustand und können Caching nutzen. NEXORA mediator fungiert als Vermittler zwischen Controllern und Handlern.",
      whatIsCqrsTitle: "Was ist CQRS?",
      whatIsCqrsIntro:
        "CQRS trennt Ihre Anwendung in zwei Seiten: Befehle (Schreibvorgänge) und Abfragen (Lesevorgänge). Jede Seite kann unabhängig optimiert werden – Befehle konzentrieren sich auf Datenintegrität und Validierung, während Abfragen auf Leistung und Caching fokussiert sind.",
      commandSide: "Befehlsseite (Schreiben)",
      querySide: "Abfrageseite (Lesen)",
      pipelineTitle: "NEXORA mediator-Pipeline",
      validationBehaviorTitle: "Validierungs-Behavior",
      commandExampleTitle: "Befehls-Beispiel (Command)",
      queryExampleTitle: "Abfrage-Beispiel (Query)",
      cachingTip:
        "Abfragen können serverseitiges Caching verwenden, um die Datenbank nicht bei jeder Anfrage zu belasten. Der Cache-Schlüssel sollte alle Abfrageparameter enthalten, um Eindeutigkeit zu gewährleisten. Der Cache wird nach erfolgreichen verwandten Befehlen automatisch invalidiert.",
    },
    modules: {
      title: "Modul-System",
      description:
        "Regeln zur Modulisolierung, Backend-/Frontend-Templates, Modul-Registry und modulübergreifende Kommunikation.",
      intro:
        "NEXORA verwendet ein strenges Modulsystem, bei dem jedes Modul eine isolierte Insel mit klaren Grenzen ist. Module können nicht voneinander importieren – sie kommunizieren nur über URLs, gemeinsame IDs oder den Core-Event-Bus. Dies sichert Unabhängigkeit, Testbarkeit und die Möglichkeit zur Auslagerung.",
      isolationRulesTitle: "Regeln zur Modulisolierung",
      allowedImportsTitle: "Erlaubte Importe",
      forbiddenImportsTitle: "Verbotene Importe",
      backendModuleTitle: "Backend-Modul Template",
      backendModuleIntro:
        "Jedes Backend-Modul folgt dem DDD (Domain-Driven Design) mit drei Projekten: Domain, Application und Infrastructure. Die Domain ist reines C# ohne externe Abhängigkeiten.",
      frontendModuleTitle: "Frontend-Modul Template",
      registryTitle: "Modul-Registry",
      registryIntro:
        "Die Modul-Registry verfolgt alle aktiven Module zur Laufzeit. Sie wird während des Anwendungsstarts gefüllt, wenn die IModuleRegistration-Implementierung jedes Moduls aufgelöst und registriert wird.",
      communicationTitle: "Modulübergreifende Kommunikationsmuster",
      pattern1Title: "Muster 1: URL-Navigation",
      pattern1Content:
        "Navigieren Sie über Standard-URL-Links zur Seite eines anderen Moduls. Keine Importe erforderlich.",
      pattern2Title: "Muster 2: Nur gemeinsame IDs",
      pattern2Content:
        "Speichern Sie nur die Entitäts-ID des fremden Moduls. Betten Sie niemals die gesamte Entität ein.",
      pattern3Title: "Muster 3: Core Event Bus",
      pattern3Content:
        "Veröffentlichen und Abonnieren von Ereignissen über einen gemeinsamen Event-Bus in @core/. (Zukünftiges Muster).",
      boundaryWarning:
        "Modulgrenzen sind absolut verbindlich. Wenn Sie Code zwischen Modulen teilen müssen, MUSS dieser in @core/ abgelegt werden. Jeder Import aus @modules/{other}/ ist ein Verstoß und wird beim Code-Review abgelehnt.",
    },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description:
        "Seitentyp-Szenarien: CRUD-Listen, Dashboards, Profile, Einstellungen, Wizards und Berichts-Generatoren.",
      intro:
        "Das SOLID View/ViewModel-Muster ist für alle Seiten in src/modules/ obligatorisch. Dieser Leitfaden behandelt 7 Seitentyp-Szenarien mit ihren genauen Verzeichnisstrukturen, ViewModel-Mustern und Codebeispielen.",
      principlesTitle: "Angewandte SOLID-Prinzipien",
      scenariosTitle: "Seitentyp-Szenarien",
      scenariosIntro:
        "Wählen Sie das Szenario, das zu Ihrem Seitentyp passt. Jedes bietet eine bewährte Struktur, die Konsistenz in der gesamten Anwendung gewährleistet.",
      scenario1Title: "Szenario 1: CRUD-Listenseite",
      scenario1Intro:
        "Verwendung für die Verwaltung von Entitätssammlungen (Benutzer, Produkte, Bestellungen). Der Orchestrator setzt sich aus ViewModels für Statistiken, Filter und Tabelle zusammen.",
      scenario2Title: "Szenario 2: Dashboard / Analytics",
      scenario2Intro:
        "Verwendung für KPIs, Diagramme und Metriken. Jeder Diagramm- oder Kartenbereich erhält ein eigenes ViewModel mit Zeitraumauswahl und Datentransformation.",
      scenario3Title: "Szenario 3: Detail- / Profilseite",
      scenario3Intro:
        "Verwendung für die Anzeige einer einzelnen Entität mit Tabs und Abschnitten. Der Orchestrator ruft die Hauptentität ab und stellt die Tab-ViewModels zusammen.",
      scenario4Title: "Szenario 4: Einstellungsseite",
      scenario4Intro:
        "Verwendung für mehrere unabhängig speicherbare Formularabschnitte. Jeder Einstellungsbereich erhält ein eigenes ViewModel mit Formularstatus und Speichermutation.",
      scenario5Title: "Szenario 5: Wizard / Mehrstufiges Formular",
      scenario5Intro:
        "Verwendung für komplexe mehrstufige Abläufe wie Onboarding oder Checkout. Das Wizard-ViewModel koordiniert die Schritt-Navigation, Validierungs-Gates und die gemeinsame Übermittlung.",
      rulesTitle: "Goldene Regeln",
      antiPatternWarning:
        "Anti-Pattern: Direkte Verwendung von useState, useEffect oder useQuery in einer View-Komponente. SÄMTLICHER Status und Logik müssen in ViewModels leben. Views dienen ausschließlich der UI-Zusammenstellung.",
    },
    stateManagement: {
      title: "State Management",
      description:
        "TanStack Query für Server-State, Zustand für globalen UI-State und LanguageProvider für Lokalisierung.",
      intro:
        "NEXORA verwendet drei Tools zur Zustandsverwaltung, jedes für eine bestimmte Kategorie: TanStack Query für Serverdaten (API-Ergebnisse), Zustand für den globalen UI-State (Auth, Sidebar, Theme) und useState für komponentenlokalen State (Formulare, Toggles).",
      decisionTitle: "Entscheidungsmatrix",
      tanstackTitle: "TanStack Query (Server State)",
      tanstackIntro:
        "Verwenden Sie TanStack Query für alle Daten, die von der API kommen. Es verarbeitet automatisch Caching, Refetching im Hintergrund, Paginierung, optimistische Updates und die Deduplizierung von Anfragen.",
      zustandTitle: "Zustand (Globaler UI-State)",
      zustandIntro:
        "Verwenden Sie Zustand für globalen UI-Status, der über Komponenten hinweg geteilt werden muss, aber nicht vom Server stammt. Es gibt genau 3 zugelassene Stores.",
      antiPatternsTitle: "Anti-Patterns",
      doTitle: " DO",
      dontTitle: " DON'T",
      localizationTitle: "Lokalisierung (LanguageProvider)",
      localizationIntro:
        "Die Lokalisierung nutzt einen benutzerdefinierten LanguageProvider mit localStorage-Persistenz. Er unterstützt 7 Sprachen, automatische RTL/LTR-Erkennung und Dot-Notation-Übersetzungsschlüssel mit Interpolation.",
      noLocaleFoldersWarning:
        "Verwenden Sie KEINE [locale]-Ordner in src/app/! Die Lokalisierung wird über den LanguageProvider-Context und nicht über dateibasiertes Routing abgewickelt. Kein next-intl, kein next-i18next, keine URL-basierte Sprache (/en/, /de/).",
    },
    dataFlow: {
      title: "Datenfluss",
      description:
        "End-to-End Datenflussdiagramme: Abfrage, Mutation, Backend-Pipeline, Fehlerbehandlung und Caching-Strategie.",
      intro:
        "Das Verständnis des Datenflusses durch NEXORA ist entscheidend für das Debugging und die Erweiterung des Systems. Diese Seite verfolgt die Daten von einem Klick in der Benutzeroberfläche bis zur Datenbank und zurück.",
      queryFlowTitle: "Abfrage-Fluss (Lesen)",
      queryFlowIntro:
        "Wenn ein Benutzer Daten betrachtet (z. B. das Öffnen der Benutzerseite), beginnt der Fluss bei der View, geht durch das ViewModel, TanStack Query, das Repository, den API-Service und schließlich die Backend-API.",
      mutationFlowTitle: "Mutations-Fluss (Schreiben)",
      backendPipelineTitle: "Backend-Request-Pipeline",
      backendPipelineIntro:
        "Jede Backend-Anfrage durchläuft 10 Middleware-Komponenten und 3 NEXORA mediator-Pipeline-Behaviors, bevor sie den Handler erreicht. Dies gewährleistet konsistente Protokollierung, Authentifizierung, Autorisierung, Validierung und Auditierung.",
      errorFlowTitle: "Fehlerbehandlung",
      errorFlowIntro:
        "Fehler werden auf mehreren Ebenen behandelt. Jede Fehlerquelle hat einen spezifischen Handler, Antwortcode und eine Frontend-Behandlungsstrategie.",
      cachingFlowTitle: "Caching-Strategie",
      cachingFlowIntro:
        "Das Backend verwendet eine zweistufige Caching-Strategie: L1 (in-process IMemoryCache) und L2 (verteiltes Redis). Das Frontend nutzt den integrierten Cache von TanStack Query mit konfigurierbarer staleTime.",
      cacheTip:
        "Setzen Sie die staleTime auf 5 Minuten für Daten, die sich selten ändern (Rollen, Berechtigungen). Verwenden Sie 0 für Daten, die sich häufig ändern (Audit-Logs, Benachrichtigungen). Invalidieren Sie immer verwandte Abfragen nach erfolgreichen Mutationen.",
    },
    domainModel: {
      title: "Domain Model",
      description:
        "Entitätsvererbungshierarchie, AuditableEntity, ITenantAwareEntity, Soft-Delete-Lebenszyklus, Repository-Abstraktionen und globale Abfragefilter.",
      intro:
        "Das Domain-Modell von NEXORA folgt einer strengen Vererbungshierarchie, bei der alle Geschäftsentitäten von AuditableEntity erben, die Audit-Felder und Soft-Delete-Unterstützung bietet. Mandantenspezifische Entitäten implementieren zusätzlich ITenantAwareEntity für eine automatische Isolierung auf Zeilenebene.",
      entityHierarchyTitle: "Entitätsvererbungshierarchie",
      entityHierarchyIntro:
        "Alle Domain-Entitäten folgen einer dreistufigen Vererbungskette: IEntity (Marker-Interface) → Entity<TId> (Identität + Gleichheit + Domain-Events) → AuditableEntity (Audit-Felder + Soft-Delete). Entitäten, die zu einem bestimmten Mandanten gehören, implementieren zudem die Schnittstelle ITenantAwareEntity.",
      ientityTitle: "IEntity-Schnittstelle",
      entityBaseTitle: "Basisklasse Entity<TId>",
      entityBaseIntro:
        "Die Basisklasse Entity<TId> bietet Identitätsgleichheit, Hashcode-Generierung und Unterstützung für Domain-Events.",
      entityDomainEventNote:
        "Domain-Events, die über RaiseDomainEvent() ausgelöst werden, werden vom OutboxInterceptor während SaveChanges gesammelt und in derselben Transaktion persistiert.",
      auditableEntityTitle: "AuditableEntity",
      auditableEntityIntro:
        "AuditableEntity fügt der Basis-Entity 7 Audit- und Soft-Delete-Felder hinzu. Diese Felder werden automatisch vom AuditableEntityInterceptor ausgefüllt – Sie setzen sie niemals manuell.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantAwareIntro:
        "Entitäten, die ITenantAwareEntity implementieren, werden über globale Abfragefilter von EF Core automatisch auf den aktuellen Mandanten beschränkt.",
      tenantIsolationWarning:
        "Umgehen Sie die Mandantenisolierung niemals ohne ausdrückliche Autorisierung. Die Verwendung von IgnoreQueryFilters() entfernt ALLE Filter, einschließlich des Mandantenbereichs.",
      softDeleteTitle: "Soft-Delete-Lebenszyklus",
      softDeleteIntro:
        "Alle Entitäten verwenden Soft-Delete über das IsDeleted-Flag. Ein DELETE-Endpunkt wandelt die Anforderung in ein Soft-Delete um. Die Entität bleibt in der Datenbank, ist aber verborgen.",
      repositoryTitle: "Repository-Abstraktionen",
      repositoryIntro:
        "NEXORA definiert drei Repository-Schnittstellen: IReadRepository<T> für Abfragen, IWriteRepository<T> für Mutationen und IRepository<T>, das beide mit einer SaveChangesAsync-Methode kombiniert.",
      concreteEntitiesTitle: "Register der konkreten Entitäten",
      queryFiltersTitle: "Globale Abfragefilter (Query Filters)",
      queryFiltersIntro:
        "Globale EF Core-Abfragefilter werden auf jede Entität angewendet, die von AuditableEntity erbt (Soft-Delete-Filter) und ITenantAwareEntity implementiert (Mandanten-Isolationsfilter).",
      ignoreFiltersTip:
        "Verwenden Sie IgnoreQueryFilters() nur bei Papierkorb-Operationen und mandantenübergreifenden Abfragen durch SuperAdmins. Kombinieren Sie es immer mit einem expliziten Mandantenfilter.",
      bestPracticesTitle: "Best Practices",
      doTitle: "✅ DO",
      dontTitle: "❌ DON'T",
    },
    domainEvents: {
      title: "Domain Events",
      description:
        "IDomainEvent-Schnittstelle, Outbox-Pattern, OutboxInterceptor, OutboxProcessor und zuverlässige Ereignisübermittlung.",
      intro:
        "Domain-Events repräsentieren signifikante Vorkommnisse in der Geschäftsdomäne. NEXORA verwendet das Outbox-Pattern, um eine zuverlässige Übermittlung zu garantieren.",
      interfaceTitle: "IDomainEvent-Schnittstelle",
      interfaceIntro:
        "Alle Domain-Events implementieren die IDomainEvent-Schnittstelle, die von NEXORA mediators INotification erbt. Dies ermöglicht In-Process-Pub/Sub.",
      publishingTitle: "Veröffentlichungs- & Behandlungsfluss",
      publishingIntro:
        "Domain-Events folgen einem 6-stufigen Lebenszyklus: Entität löst Event aus, OutboxInterceptor fängt es ab, wird als OutboxMessage persistiert, OutboxProcessor ruft es ab und veröffentlicht es via NEXORA mediator.",
      publisherTitle: "IDomainEventPublisher",
      outboxTitle: "Outbox-Pattern",
      outboxIntro:
        "Das Outbox-Pattern löst das Dual-Write-Problem: Wie man atomar die Datenbank aktualisiert UND ein Ereignis veröffentlicht.",
      outboxWarning:
        "Das Outbox-Pattern bietet eine At-Least-Once-Zustellung, keine Exactly-Once. Event-Handler müssen idempotent sein.",
      outboxMessageTitle: "OutboxMessage Entität",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxInterceptorIntro:
        "Der OutboxInterceptor sammelt alle Domain-Events von getrackten Entitäten, serialisiert sie und fügt sie demselben Datenbankkontext hinzu.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxProcessorIntro:
        "Ein BackgroundService, der die OutboxMessage-Tabelle alle 5 Sekunden nach unverarbeiteten Nachrichten abfragt.",
      outboxCleanupTitle: "Outbox Cleanup Job",
      outboxCleanupIntro:
        "Ein wiederkehrender Hangfire-Job läuft täglich, um verarbeitete Outbox-Nachrichten zu löschen, die älter als 7 Tage sind.",
      architectureSummaryTitle: "Outbox Architektur-Zusammenfassung",
      customEventsTitle: "Erstellen benutzerdefinierter Domain-Events",
      customEventsIntro: "Folgen Sie diesen 3 Schritten, um ein neues Domain-Event hinzuzufügen.",
      step1Title: "1. Event definieren",
      step1Content: "Erstellen Sie einen Record, der IDomainEvent implementiert.",
      step2Title: "2. Aus dem Command Handler auslösen",
      step2Content: "Rufen Sie entity.RaiseDomainEvent() auf, dann SaveChangesAsync.",
      step3Title: "3. Event-Handler erstellen",
      step3Content: "Implementieren Sie INotificationHandler<DomainEventNotification>.",
      reliabilityTitle: "Zuverlässigkeitsgarantien",
      withOutboxTitle: "✅ Mit Outbox-Pattern",
      withoutOutboxTitle: "❌ Ohne Outbox-Pattern",
    },
    cqrsPipeline: {
      title: "CQRS-Pipeline",
      description:
        "NEXORA-Mediator-Pipeline-Behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, Result-Pattern und vollständiger Command/Query-Katalog.",
      intro:
        "Jeder Command und jede Query in NEXORA läuft durch eine konfigurierbare NEXORA-Mediator-Pipeline mit 5 integrierten Behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior und CachingBehavior. Die Reihenfolge wird über appsettings oder Umgebungsvariablen gesteuert und beim Start validiert.",
      overviewTitle: "Pipeline-Übersicht",
      overviewIntro:
        "Die Standardreihenfolge ist Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. Validierung und Feature-Prüfung laufen bewusst vor dem Cache-Lookup, während Cache-Invalidierung nach erfolgreichen Mutationen vor dem Webhook-Versand entrollt.",
      separationTitle: "Trennung von Command vs Query",
      separationIntro: "CQRS trennt Schreibvorgänge (Commands) von Lesevorgängen (Queries).",
      commandsTitle: "Commands (Schreiben)",
      queriesTitle: "Queries (Lesen)",
      resultPatternTitle: "Result-Muster (Result Pattern)",
      resultPatternIntro:
        "Alle Handler geben Result<T> zurück, anstatt Exceptions für erwartete Fehler auszulösen.",
      validationTitle: "ValidationBehavior",
      validationIntro:
        "ValidationBehavior läuft direkt nach dem Logging. Es sammelt alle IValidator<TRequest>-Validatoren, gibt strukturierte Result-Fehler für ungültige Requests zurück und verhindert, dass ungültige Requests Handler oder Cache erreichen.",
      validatorExampleTitle: "Beispiele für Validatoren",
      loggingTitle: "LoggingBehavior",
      loggingIntro:
        "Protokolliert jede NEXORA mediator-Anfrage mit Benutzer-ID, Mandanten-ID, Request-Typ und Ausführungszeit.",
      cachingTitle: "CachingBehavior",
      cachingIntro:
        "Überprüft den Cache auf vorhandene Ergebnisse für ICacheable-Abfragen, bevor der Handler ausgeführt wird.",
      commandMapTitle: "Katalog der Commands & Queries",
      commandMapIntro:
        "Die folgende Tabelle listet jeden Befehl, jede Abfrage und jeden Validator im System auf.",
      registrationTitle: "Pipeline-Registrierung",
      registrationIntro: "Behaviors werden in AddCoreApplication() registriert.",
      behaviorOrderTip:
        "Die Standardsicherheitsprüfung lehnt Pipeline-Reihenfolgen ab, in denen Caching vor Validation oder FeatureCheck läuft. Deaktiviere Mediator__EnforceSecurityPipelineOrder nur, wenn du das Risiko vollständig kontrollierst.",
      featureCheckTitle: "FeatureCheckBehavior",
      featureCheckIntro:
        "Das FeatureCheckBehavior fängt Commands ab, die IRequireFeature implementieren. Es prüft, ob die Edition des Mandanten das angeforderte Feature erlaubt, indem IFeatureChecker.IsEnabledAsync aufgerufen wird. Ist das Feature deaktiviert, wird ein Forbidden-Fehler zurückgegeben, ohne den Handler auszuführen. Operationen auf Systemebene (ohne TenantId) umgehen diese Prüfung.",
      featureCheckMarkerTitle: "IRequireFeature-Marker",
      featureCheckMarkerIntro:
        "Commands aktivieren das Feature-Gating, indem sie das IRequireFeature-Interface mit einer RequiredFeatureName-Eigenschaft implementieren. Wenn das Entitlements-Modul nicht bereitgestellt ist, gibt NoOpFeatureChecker für alle Prüfungen true zurück — wodurch dieses Behavior zu einem stillen Durchlauf wird.",
    },
    dependencyInjection: {
      title: "Dependency Injection (DI)",
      description:
        "Program.cs Registrierungsablauf, Modul-DI-Muster, Service Discovery, Core + Identity Service Maps, Lebenszyklus-Regeln und YARP Gateway.",
      intro:
        "NEXORA verwendet den in .NET integrierten Dependency-Injection-Container mit einem strukturierten Registrierungsmuster.",
      architectureTitle: "DI-Registrierungsarchitektur",
      architectureIntro:
        "Die Program.cs folgt einer strengen 4-Phasen-Registrierungsreihenfolge: (1) Kerninfrastruktur, (2) CORS & Rate Limiting, (3) Module, (4) Application Layer (NEXORA mediator).",
      moduleRegTitle: "Modul-Registrierungsmuster",
      moduleRegIntro:
        "Jedes Modul stellt eine Erweiterungsmethode AddXxxModule() bereit, die all seine Services registriert.",
      monolithNote:
        "Im Monolith-Modus werden ALLE Module geladen. Im Microservice-Modus läuft jedes Modul als eigenständiger Prozess.",
      controllerProviderTitle: "Module Controller Feature Provider",
      controllerProviderIntro:
        "Filtert, welche Controller beim Start basierend auf MODULE_NAME geladen werden.",
      serviceDiscoveryTitle: "Service Discovery",
      serviceDiscoveryIntro:
        "Konfigurationsbasierte Service Discovery zur Auflösung von Dienstnamen in URLs.",
      coreServicesTitle: "Core Infrastructure Services",
      coreServicesIntro: "Von AddCoreInfrastructure() registriert und für alle Module verfügbar.",
      identityModuleTitle: "Identity Module Services",
      identityModuleIntro:
        "Registriert Repository-Schnittstellen und Service-Schnittstellen (Scoped).",
      lifetimeTitle: "Regeln zur Lebensdauer von Services",
      singletonTitle: "Singleton Lifetime",
      scopedTitle: "Scoped Lifetime",
      gatewayTitle: "YARP Gateway-Konfiguration",
      gatewayIntro:
        "Das Gateway routet Anfragen an Backend-Microservices basierend auf dem URL-Präfix.",
      bestPracticesTitle: "DI Best Practices",
      captiveTip:
        "Achten Sie auf Captive Dependencies (wenn ein Singleton einen Scoped-Service injiziert).",
    },
  },
};
