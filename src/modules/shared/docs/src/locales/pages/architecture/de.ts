// FILE-EXCEPTION: file length
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
        "SCRIPE folgt einer strikten Clean Architecture mit vier Schichten: Presentation, Application, Domain und Infrastructure. Die Dependency Rule stellt sicher, dass innere Schichten nie von äußeren abhängen. Dieses Muster gilt konsistent für Backend und Frontend.",
      layersTitle: "Clean Architecture Schichten",
      backendArchTitle: "Backend-Architektur",
      backendArchIntro:
        "Das Backend folgt einer Request-Pipeline-Architektur, bei der jede HTTP-Anfrage durch Middleware, Controller, SCRIPE mediator-Verhaltensweisen (Behaviors) und schließlich den CQRS-Handler fließt. Dies gewährleistet konsistente Validierung, Auditierung und Fehlerbehandlung.",
      frontendArchTitle: "Frontend-Architektur",
      frontendArchIntro:
        "Das Frontend verwendet ein SOLID View/ViewModel-Muster, bei dem Views reine Benutzeroberflächen sind (kein State, keine Logik) und ViewModels die gesamte Geschäftslogik enthalten. Das Connector-Muster trennt das Next.js-Routing (Server Components) von der Anwendungslogik (Client Components).",
      moduleBoundariesTitle: "Modulgrenzen",
      moduleBoundariesIntro:
        "Modules have strict code boundaries. This supports future extraction, but extraction is not the same as proven production microservices readiness.",
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
        "Das SCRIPE-Backend ist ein .NET 10 Modular Monolith mit 288 Zeilen in der Program.cs, die 16 Service-Registrierungen, 10 Middleware-Komponenten und 18 REST-Controller miteinander verbinden. Diese Seite zerlegt jede Schicht der Backend-Architektur.",
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
        "Alle Controller erben von einem Basis-ApiController, der eine standardisierte Result<T>-Antwortzuordnung bietet. Controller sollten schlank sein – sie validieren nur das Request-Modell und delegieren an SCRIPE mediator.",
    },
    frontend: {
      title: "Frontend-Architektur",
      description:
        "SOLID View/ViewModel-Muster, Modulstruktur und das Connector-Muster für die Next.js-Integration.",
      intro:
        "Das SCRIPE-Frontend basiert auf Next.js 16 (App Router) und folgt einem strengen SOLID View/ViewModel-Muster. Jede Seite besteht aus einer reinen UI-View, die die gesamte Logik an ViewModel-Hooks delegiert. Diese Trennung gewährleistet Testbarkeit, Wiederverwendbarkeit und Wartbarkeit.",
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
        "Trennung von Befehlen und Abfragen (CQRS) mit SCRIPE mediator-Pipeline, Behaviors, Validierung und Caching.",
      intro:
        "SCRIPE verwendet das CQRS-Muster (Command Query Responsibility Segregation), um Lese- und Schreibvorgänge zu trennen. Befehle (Commands) ändern den Zustand und durchlaufen Validierungs- und Audit-Behaviors. Abfragen (Queries) lesen den Zustand und können Caching nutzen. SCRIPE mediator fungiert als Vermittler zwischen Controllern und Handlern.",
      whatIsCqrsTitle: "Was ist CQRS?",
      whatIsCqrsIntro:
        "CQRS trennt Ihre Anwendung in zwei Seiten: Befehle (Schreibvorgänge) und Abfragen (Lesevorgänge). Jede Seite kann unabhängig optimiert werden – Befehle konzentrieren sich auf Datenintegrität und Validierung, während Abfragen auf Leistung und Caching fokussiert sind.",
      commandSide: "Befehlsseite (Schreiben)",
      querySide: "Abfrageseite (Lesen)",
      pipelineTitle: "SCRIPE mediator-Pipeline",
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
        "SCRIPE verwendet ein strenges Modulsystem, bei dem jedes Modul eine isolierte Insel mit klaren Grenzen ist. Module können nicht voneinander importieren – sie kommunizieren nur über URLs, gemeinsame IDs oder den Core-Event-Bus. Dies sichert Unabhängigkeit, Testbarkeit und die Möglichkeit zur Auslagerung.",
      isolationRulesTitle: "Regeln zur Modulisolierung",
      allowedImportsTitle: "Erlaubte Importe",
      forbiddenImportsTitle: "Verbotene Importe",
      backendModuleTitle: "Backend-Modul Template",
      backendModuleIntro:
        "Jedes Backend-Modul folgt dem DDD (Domain-Driven Design) mit drei Projekten: Domain, Application und Infrastructure. Die Domain ist reines C# ohne externe Abhängigkeiten.",
      frontendModuleTitle: "Frontend-Modul Template",
      registryTitle: "Modul-Registry",
      registryIntro:
        "The current backend modules verified in code are Identity, Entitlements, Compliance, Plugins, and Marketplace, plus host controller labels such as Auth, System, Communication, Media, and Customization. CRM, HRMS, Inventory, Finance, Documents, Workflow, and Service Management are future modules, not current backend modules.",
      communicationTitle: "Modulübergreifende Kommunikationsmuster",
      pattern1Title: "Muster 1: URL-Navigation",
      pattern1Content:
        "Navigieren Sie über Standard-URL-Links zur Seite eines anderen Moduls. Keine Importe erforderlich.",
      pattern2Title: "Muster 2: Nur gemeinsame IDs",
      pattern2Content:
        "Speichern Sie nur die Entitäts-ID des fremden Moduls. Betten Sie niemals die gesamte Entität ein.",
      pattern3Title: "Muster 3: Core Event Bus",
      pattern3Content:
        "Domain events currently dispatch in-process. RabbitMQ is a placeholder fallback, so do not use this as proof of true distributed microservices.",
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
        "SCRIPE verwendet drei Tools zur Zustandsverwaltung, jedes für eine bestimmte Kategorie: TanStack Query für Serverdaten (API-Ergebnisse), Zustand für den globalen UI-State (Auth, Sidebar, Theme) und useState für komponentenlokalen State (Formulare, Toggles).",
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
        "Das Verständnis des Datenflusses durch SCRIPE ist entscheidend für das Debugging und die Erweiterung des Systems. Diese Seite verfolgt die Daten von einem Klick in der Benutzeroberfläche bis zur Datenbank und zurück.",
      queryFlowTitle: "Abfrage-Fluss (Lesen)",
      queryFlowIntro:
        "Wenn ein Benutzer Daten betrachtet (z. B. das Öffnen der Benutzerseite), beginnt der Fluss bei der View, geht durch das ViewModel, TanStack Query, das Repository, den API-Service und schließlich die Backend-API.",
      mutationFlowTitle: "Mutations-Fluss (Schreiben)",
      backendPipelineTitle: "Backend-Request-Pipeline",
      backendPipelineIntro:
        "Jede Backend-Anfrage durchläuft 10 Middleware-Komponenten und 3 SCRIPE mediator-Pipeline-Behaviors, bevor sie den Handler erreicht. Dies gewährleistet konsistente Protokollierung, Authentifizierung, Autorisierung, Validierung und Auditierung.",
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
        "Das Domain-Modell von SCRIPE folgt einer strengen Vererbungshierarchie, bei der alle Geschäftsentitäten von AuditableEntity erben, die Audit-Felder und Soft-Delete-Unterstützung bietet. Mandantenspezifische Entitäten implementieren zusätzlich ITenantAwareEntity für eine automatische Isolierung auf Zeilenebene.",
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
        "SCRIPE definiert drei Repository-Schnittstellen: IReadRepository<T> für Abfragen, IWriteRepository<T> für Mutationen und IRepository<T>, das beide mit einer SaveChangesAsync-Methode kombiniert.",
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
        "Domain-Events repräsentieren signifikante Vorkommnisse in der Geschäftsdomäne. SCRIPE verwendet das Outbox-Pattern, um eine zuverlässige Übermittlung zu garantieren.",
      interfaceTitle: "IDomainEvent-Schnittstelle",
      interfaceIntro:
        "Alle Domain-Events implementieren die IDomainEvent-Schnittstelle, die von SCRIPE mediators INotification erbt. Dies ermöglicht In-Process-Pub/Sub.",
      publishingTitle: "Veröffentlichungs- & Behandlungsfluss",
      publishingIntro:
        "Domain-Events folgen einem 6-stufigen Lebenszyklus: Entität löst Event aus, OutboxInterceptor fängt es ab, wird als OutboxMessage persistiert, OutboxProcessor ruft es ab und veröffentlicht es via SCRIPE mediator.",
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
        "SCRIPE-Mediator-Pipeline-Behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, Result-Pattern und vollständiger Command/Query-Katalog.",
      intro:
        "Jeder Command und jede Query in SCRIPE läuft durch eine konfigurierbare SCRIPE-Mediator-Pipeline mit 5 integrierten Behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior und CachingBehavior. Die Reihenfolge wird über appsettings oder Umgebungsvariablen gesteuert und beim Start validiert.",
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
        "Protokolliert jede SCRIPE mediator-Anfrage mit Benutzer-ID, Mandanten-ID, Request-Typ und Ausführungszeit.",
      cachingTitle: "CachingBehavior",
      cachingIntro:
        "Das CachingBehavior fängt Abfragen ab, die das ICacheable-Interface implementieren, und führt mandantenspezifische Cache-Lookups durch. Um parallele Cache-Stampedes bei hoher Last zu verhindern, stützt es sich auf schlüsselspezifische SemaphoreSlim-Sperren, um Datenbanklesevorgänge bei einem Miss zu serialisieren. Es verarbeitet auch die Mutationsinvalidierung über IInvalidatesCache und löscht genaue Schlüssel oder präfixbasierte Namespaces. Darüber hinaus integriert es die Schlüsselbereinigung, um das Wachstum zu begrenzen, und verknüpft Feature-Konfigurationen mit einer globalen Eviction-Token-Quelle für eine sofortige, threadsichere Cache-Invalidierung.",
      cachingStampedeTitle: "Cache-Konkurrenz und Cache-Stampede-Vermeidung",
      cachingStampedeIntro:
        "Um Leistungseinbußen unter hoher Last zu vermeiden, das Caching-System implementiert eine Cache-Stampede-Minderung. Schlüssel-spezifische Semaphore stellen sicher, dass bei mehreren gleichzeitigen Anfragen nach einem fehlenden oder abgelaufenen Schlüssel nur der erste Thread die Datenbank-/API-Abfrage ausführt, während nachfolgende Anfragen auf das Semaphor warten und den frisch zwischengespeicherten Wert abrufen. Darüber hinaus wird unbegrenztes Wachstum verhindert, indem Cache-Schlüssel nachverfolgt und bei Überschreitung von 10.000 überwachten Schlüsseln zufällig 50 % davon entfernt werden. Feature-Cache-Einträge sind zudem an ein globales Eviction-Token für eine sofortige Löschung gebunden.",
      outboxTitle: "Domain-Events und Outbox-System-Pipeline",
      outboxIntro:
        "Um die transaktionale Konsistenz zu gewährleisten und das Problem des doppelten Schreibens zu vermeiden, verwendet SCRIPE das Outbox-Muster. Domain-Events werden in Aggregate Roots ausgelöst, vom EF Core SaveChangesInterceptor abgefangen, in JSON serialisiert und in derselben Datenbanktransaktion als OutboxMessage-Entitäten persistiert. Ein Hintergrundjob (OutboxProcessorJob) wird jede Minute ausgeführt, um nicht verarbeitete Nachrichten abzufragen und sie lokal (über den AstraFlow Mediator) oder extern (über den EventBus) zu veröffentlichen. Schließlich wird täglich um 5:00 Uhr ein OutboxCleanupJob ausgeführt, um verarbeitete Nachrichten zu löschen, die älter als 7 Tage sind.",
      flowStampedeTitle: "Cache-Stampede-Sperrsequenz",
      flowStampedeRequest: "Client-Anfrage\nGetOrCreateAsync(key)",
      flowStampedeMiss: "Cache-Miss?\nPrüfen InMemory/Redis",
      flowStampedeLock: "Sperre erwerben\nSemaphoreSlim(1,1)",
      flowStampedeCheck: "Doppelprüfung Cache\nInnerhalb der Sperre validieren",
      flowStampedeFound: "Cache-Hit\nWert von anderem Thread gefüllt",
      flowStampedeFactory: "Factory ausführen\nDatenbank- / API-Abfrage ausführen",
      flowStampedeWrite: "In Cache schreiben\nPostEvictionCallback hinzufügen",
      flowStampedeRelease: "Sperre freigeben\nWert an alle Threads zurückgeben",
      flowOutboxTitle: "Outbox-Nachrichtenverarbeitungs-Pipeline",
      flowOutboxRaise: "Domain-Event auslösen\nAggregateRoot.AddDomainEvent()",
      flowOutboxIntercept: "SaveChanges abfangen\nOutboxInterceptor scanne ChangeTracker",
      flowOutboxSerialize:
        "Event serialisieren\nIn JSON konvertieren und in OutboxMessage verpacken",
      flowOutboxCommit: "Atomare DB-Transaktion\nSpeichert Entitäten + OutboxMessage",
      flowOutboxPoll: "OutboxProcessorJob\nJede Minute unverarbeitete abfragen",
      flowOutboxDispatch: "Event veröffentlichen\nLokaler Mediator + Externer EventBus",
      flowOutboxComplete: "Als verarbeitet markieren\nProcessedOnUtc = UtcNow setzen",
      flowOutboxCleanup: "OutboxCleanupJob\nVerarbeitete Datensätze > 7 Tage bereinigen",
      connCacheQuery: "fragt Schlüssel ab",
      connCacheMiss: "Cache-Miss",
      connAcquireLock: "erwirbt Sperre",
      connDoubleCheck: "Cache-Hit",
      connCacheHit: "gibt Wert zurück",
      connDbQuery: "führt Abfrage aus",
      connCacheWrite: "aktualisiert Cache",
      connLockRelease: "gibt Sperre frei",
      connRaise: "löst Interceptor aus",
      connIntercept: "scannt Events",
      connSerialize: "serialisiert",
      connCommit: "schreibt atomar",
      connPoll: "fragt 50er-Batch ab",
      connDispatch: "leitet Event weiter",
      connComplete: "speichert Status",
      connCleanup: "tägliche Reinigung",
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
        "SCRIPE verwendet den in .NET integrierten Dependency-Injection-Container mit einem strukturierten Registrierungsmuster.",
      architectureTitle: "DI-Registrierungsarchitektur",
      architectureIntro:
        "Die Program.cs folgt einer strengen 4-Phasen-Registrierungsreihenfolge: (1) Kerninfrastruktur, (2) CORS & Rate Limiting, (3) Module, (4) Application Layer (SCRIPE mediator).",
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
    moduleCollab: {
      title: "Tiefenanalyse der Modul-Kollaboration",
      description:
        "Wie Identity und Entitlements über Core-Abstraktionen zusammenarbeiten, das NoOp-Sicherheitsmuster, der SubscriptionChangedEvent-Lebenszyklus und die Auswirkungen der Deployment-Topologie.",
      intro:
        "SCRIPE hat 5 Module (Identity, Entitlements, Compliance, Plugins, Marketplace). Sie sind hermetisch versiegelt — keine Cross-Imports erlaubt. Dennoch müssen sie zusammenarbeiten, um Berechtigungen, Abonnementfunktionen und Abrechnung zu steuern. Die Lösung: Die Core.Application.Abstractions-Schicht fungiert als typisierte, interfacebasierte Brücke. Jede modulübergreifende Interaktion fließt über diese Brücke — niemals durch direkte Modul-zu-Modul-Imports. Diese Seite dokumentiert jedes Interface, jedes Muster und jeden Laufzeitfluss, der dies ermöglicht.",
      coreBridgeTitle: "Die Core-Schicht-Brücke",
      coreBridgeIntro:
        "Core.Application.Abstractions ist das Herzstück der modulübergreifenden Kommunikation. Es definiert mehr als 32 Interface-Verträge. Identity.Infrastructure und Entitlements.Infrastructure implementieren jeweils ihre Seite dieser Verträge. Die AstraFlow-Pipeline-Behaviors und Modul-Handler konsumieren ausschließlich die Interfaces — nie die konkreten Implementierungen. Das bedeutet, das System kompiliert und läuft identisch, unabhängig davon, ob Entitlements bereitgestellt ist oder nicht.",
      catalogTitle: "Vollständiger Katalog modulübergreifender Interfaces",
      catalogIntro:
        "Die folgende Tabelle dokumentiert jedes Interface, das Modulgrenzen überschreitet. In Core.Application definiert, sind diese Interfaces der einzige legitime Weg für Module, miteinander zu kommunizieren.",
      noopTitle: "Das NoOp-Sicherheitsmuster",
      noopIntro:
        "Core.Infrastructure registriert eine NoOp-Implementierung (keine Operation) für jedes modulübergreifende Interface. Diese werden mit TryAddScoped registriert, was bedeutet, dass echte Modul-Implementierungen sie beim Deployment überschreiben. Wenn ein Modul nicht lädt, hält der NoOp das System still am Laufen. Startup-Diagnosen erkennen, wenn kritische Interfaces noch NoOp sind, und geben LogCritical-Warnungen aus.",
      noopWarning:
        "SICHERHEITSKRITISCH: Wenn IFeatureChecker in der Produktion als NoOpFeatureChecker verbleibt, erscheinen ALLE Editions-Features aktiviert und ALLE Kontingente sind für jeden Mandanten unbegrenzt. Die Startup-Diagnose gibt einen LogCritical-Log aus, aber dies stoppt den Server NICHT. Vergewissern Sie sich immer, dass das Entitlements-Modul geladen ist, wenn Sie abonnementbasierte Feature-Kontrolle nutzen.",
      noopTableTitle: "NoOp-Implementierungsregister",
      featureCheckTitle: "FeatureCheckBehavior — Der Kontrollpunkt",
      featureCheckIntro:
        "FeatureCheckBehavior ist ein AstraFlow-Pipeline-Behavior, das Commands abfängt, die IRequireFeature implementieren. Es löst die Mandanten-ID aus dem aktuellen Benutzerkontext auf, ruft IFeatureChecker.IsEnabledAsync auf und lässt die Anfrage entweder durch oder gibt ein 403 Forbidden-Ergebnis zurück. Da es IFeatureChecker (keine konkrete Klasse) verwendet, arbeitet es transparent, unabhängig davon, ob Entitlements bereitgestellt ist oder nicht. Wenn Entitlements fehlt, gibt NoOpFeatureChecker für jede Prüfung true zurück, wodurch das Behavior zu einem transparenten Pass-through ohne Overhead wird.",
      featureCheckFlowTitle: "FeatureCheck-Entscheidungsfluss",
      featureCheckCodeTitle: "Einen Command in das Feature-Gating einbinden",
      subscriptionEventTitle:
        "SubscriptionChangedEvent — Das Rückgrat der Berechtigungssynchronisation",
      subscriptionEventIntro:
        "SubscriptionChangedEvent ist das kritischste modulübergreifende Domain-Event in SCRIPE. Von Entitlements veröffentlicht, von Identity behandelt. Es trägt die vollständige effektive Feature-Sammlung, den Abonnementstatus und vorab erweiterte Bundle-Daten. Identity verwendet dieses Event, um den gesamten Berechtigungspool des Mandanten neu aufzubauen — Berechtigungen für neu aktivierte Module hinzuzufügen und Berechtigungen für deaktivierte zu entfernen. So wird eine Abrechnungsänderung in Entitlements zu einer Berechtigungsänderung in Identity, ohne direkte Modulkopplung.",
      subscriptionEventDefTitle: "Event-Definition",
      subscriptionEventTriggersTitle: "Alle Commands, die dieses Event veröffentlichen",
      permSyncTitle: "Berechtigungssynchronisations-Lebenszyklus — Schritt für Schritt",
      permSyncIntro:
        "Wenn sich das Abonnement eines Mandanten ändert, wird ein präziser 5-Schritte-Lebenszyklus ausgeführt, um seinen Berechtigungspool neu aufzubauen. Diesen Lebenszyklus zu verstehen ist unerlässlich für das Debugging von Berechtigungsproblemen und das Design neuer abonnementgesteuerter Features.",
      permSyncStep1Title: "Schritt 1 — Entitlements löst Editions-Features auf",
      permSyncStep1Content:
        "Der Entitlements-Command-Handler löst die vollständige effektive Feature-Karte für den Mandanten auf. Dies fügt die Basis-Features der Edition mit TenantFeatureOverrides und BundleExpansion-Ergänzungen zusammen. Das Ergebnis ist ein flaches Dictionary von Feature-Name zu Wert. Daraus leitet es ab, welche Modulnamen aktiviert sind.",
      permSyncStep2Title: "Schritt 2 — Event per Outbox veröffentlicht",
      permSyncStep2Content:
        "Das SubscriptionChangedEvent wird als Domain-Event ausgelöst. Der EF Core OutboxInterceptor erfasst es vor SaveChangesAsync. Das Event wird in derselben Datenbanktransaktion wie die Abonnementänderung persistiert. Nach dem Commit verteilt der OutboxProcessor das Event. Dies garantiert Exactly-once-Zustellung.",
      permSyncStep3Title: "Schritt 3 — Identity-Handler verarbeitet das Event",
      permSyncStep3Content:
        "Identity.Applications SubscriptionChangedEventHandler empfängt das Event. Wenn IsRevocation true ist, synchronisiert es mit leeren Modulen, um alle Berechtigungen zu entfernen. Andernfalls synchronisiert es für alle aktivierten Module und verarbeitet Bundle-Erweiterungen.",
      permSyncStep4Title: "Schritt 4 — ITenantPermissionManager synchronisiert den Pool",
      permSyncStep4Content:
        "TenantPermissionManager verwendet IPermissionReader, um Berechtigungs-IDs für aktivierte Module zu ermitteln. Es filtert nach RequiredFeature, vergleicht mit aktuellen Datensätzen, fügt fehlende hinzu und entfernt überschüssige Einträge atomar.",
      permSyncStep5Title: "Schritt 5 — Administrator-Berechtigungs-Cache invalidiert",
      permSyncStep5Content:
        "Nach der Synchronisation wird IAdminPermissionCache.InvalidateAll() aufgerufen. Die gecachten Berechtigungen jedes Administrators werden gelöscht. Bei der nächsten API-Anfrage lädt AuthorizationBehavior aus der Datenbank neu.",
      loginEnrichTitle: "Login-Antwort-Anreicherung — ISubscriptionStatusProvider",
      loginEnrichIntro:
        "Der Login-Handler von Identity reichert Antworten mit dem Abonnementstatus über ISubscriptionStatusProvider (von Entitlements implementiert) an. So kann das Frontend Warnungen für Kulanzzeiten anzeigen, ohne dass Identity Entitlements importiert.",
      loginEnrichNote:
        "Wenn Entitlements nicht bereitgestellt ist, gibt der NoOp null für Abonnementinformationen zurück. Das Frontend zeigt keinen Abonnementstatus an — ein sicheres, korrektes Verhalten für Deployments ohne Abrechnung.",
      deployTopologyTitle: "Auswirkungen der Deployment-Topologie",
      deployTopologyIntro:
        "Die Umgebungsvariable MODULE_NAME steuert, welche Module geladen werden, und verändert damit grundlegend die modulübergreifende Kommunikation. Der Monolith-Modus unterstützt alle Kollaborationsmuster. Der Microservice-Modus hat kritische Einschränkungen.",
      monolithMode: 'Monolith-Modus (MODULE_NAME="")',
      microserviceMode: 'Microservice-Modus (MODULE_NAME="Identity")',
      microserviceCaution:
        "KRITISCH: Self-Service-Anmeldung ist im Microservice-Modus blockiert. Der G15-Guard in PostBuildInitialization.cs wirft InvalidOperationException, wenn die Anmeldung mit einem bestimmten MODULE_NAME aktiviert ist. Anmeldungsereignisse gehen zwischen Prozessen lautlos verloren. v2-Roadmap: Outbox + Message-Bus wird diese Lücke schließen.",
      coDependencyTitle: "Modul-Co-Abhängigkeitskarte",
      coDependencyIntro:
        "Diese Tabelle dokumentiert jede formale Abhängigkeit zwischen Modulen und zeigt, was jedes Modul von einem anderen benötigt und wie es über Core-Interfaces erfüllt wird.",
      signupSagaTitle: "Die Self-Service-Anmeldung Cross-Module-Saga",
      signupSagaIntro:
        "Die B2B2C-Mandanten-Self-Service-Anmeldung ist die komplexeste modulübergreifende Saga in SCRIPE. Sie umspannt Identity, Entitlements und Stripe.",
      signupMonolithOnly:
        "NUR MONOLITH: Die Anmeldungs-Saga verwendet In-Process-Domain-Events, die Modulgrenzen überschreiten. Dies funktioniert nur, wenn beide Module im selben Prozess laufen. Der Microservice-Modus blockiert die Anmeldung beim Start über den G15-Guard.",
      signupStep1Title: "Phase 1 — Identity stellt den Mandanten bereit",
      signupStep1Content:
        "RegisterTenantSelfServiceCommand wird atomar ausgeführt: erstellt Mandant, richtet Subdomain ein, stellt Standard-Rollen bereit, erstellt Admin-Konto, veröffentlicht SignupPhase1CompletedEvent.",
      signupStep2Title: "Phase 2 — Entitlements verknüpft das Abonnement",
      signupStep2Content:
        "SignupPhase1CompletedEventHandler erstellt TenantSubscription. Die kostenlose Edition aktiviert sich sofort mit SubscriptionChangedEvent. Die kostenpflichtige Edition erstellt eine Stripe-Checkout-Session.",
      signupStep3Title: "Phase 3 — Stripe bestätigt, Entitlements aktiviert",
      signupStep3Content:
        "StripeWebhookHelper verarbeitet checkout.session.completed, aktiviert das Abonnement, veröffentlicht SubscriptionChangedEvent. Identity erteilt Editions-Berechtigungen.",
      signupStep4Title: "Kompensation — Bei abgebrochenem Checkout",
      signupStep4Content:
        "CompensatePhase1Async löscht den bereitgestellten Mandanten und Admin, um verwaiste Konten zu verhindern. SignupReconciliationSweepJob bereinigt täglich veraltete Anmeldungen.",
      devChecklistTitle:
        "Entwickler-Checkliste — Eine neue modulübergreifende Abhängigkeit hinzufügen",
      devChecklistIntro:
        "Wenn zwei Module Daten teilen müssen, folgen Sie diesem genauen Muster. Importieren Sie niemals ein Modul aus einem anderen. Gehen Sie immer über Core.Application.Abstractions.",
      checkStep1Title: "1. Den Vertrag in Core.Application.Abstractions definieren",
      checkStep1Content:
        "Erstellen Sie ein Interface in Core.Application/Abstractions/. Halten Sie es minimal. Fügen Sie XML-Kommentare hinzu, die erklären, welches Modul implementiert und welches konsumiert.",
      checkStep2Title: "2. Einen NoOp in Core.Infrastructure registrieren",
      checkStep2Content:
        "Erstellen Sie einen NoOp in Core.Infrastructure/Services/ und registrieren Sie ihn mit TryAddScoped. Geben Sie sichere neutrale Werte zurück. Verwenden Sie niemals NotImplementedException.",
      checkStep3Title: "3. In der Infrastructure des Zielmoduls implementieren",
      checkStep3Content:
        "Erstellen Sie eine echte Implementierung in {Module}.Infrastructure/CrossModule/. Registrieren Sie mit AddScoped (nicht TryAddScoped), um den von Core zuerst registrierten NoOp zu überschreiben.",
      checkStep4Title: "4. Startup-Diagnose in PostBuildInitialization.cs hinzufügen",
      checkStep4Content:
        "Fügen Sie eine Prüfung hinzu, um zu erkennen, ob das Interface zu NoOp auflöst. Loggen Sie LogCritical, wenn dies der Fall ist. Dies warnt Entwickler vor falsch konfigurierten Deployments, ohne den Server zu stoppen.",
      addScopedTip:
        "Verwenden Sie immer AddScoped (nicht TryAddScoped) für echte Modul-Implementierungen. TryAddScoped registriert nur, wenn noch nichts registriert ist — und der NoOp wurde zuerst registriert.",

      // NoOp Registration
      noopRegistrationTitle: "NoOp-Registrierung — TryAddScoped vs AddScoped",
      noopRegistrationIntro:
        "Der gesamte NoOp-Überschreibungsmechanismus hängt von einer kritischen Regel ab: Core.Infrastructure registriert NoOps mit TryAddScoped. Echte Modul-Implementierungen registrieren sich mit AddScoped. Da TryAddScoped nur registriert, wenn noch kein Service registriert ist, überschreibt ein nachfolgender AddScoped-Aufruf ihn bedingungslos. Die Reihenfolge ist wichtig: Core.Infrastructure wird immer zuerst geladen (es ist eine transitive Abhängigkeit aller Modul-Infrastructure-Projekte), sodass der NoOp immer zuerst registriert wird und die echte Implementierung des Moduls immer gewinnt.",

      // Startup Diagnostics
      startupDiagnosticsTitle: "Startdiagnosen — Erkennung von NoOp-Lecks",
      startupDiagnosticsIntro:
        "PostBuildInitialization.cs wird ausgeführt, nachdem der DI-Container erstellt und alle Module registriert wurden. Er überprüft den aufgelösten Typ für kritische Schnittstellen. Wenn der aufgelöste Typ noch eine NoOp-Implementierung ist, protokolliert er eine LogCritical-Meldung. Dies ist das Sicherheitsnetz in der Produktion — es stoppt den Server nicht, erzeugt aber eine sichtbare Warnung in Logs und Monitoring-Dashboards, auf die Betreiber sofort reagieren können.",

      // IRequireFeature Interface
      requireFeatureInterfaceTitle: "IRequireFeature — Die Opt-In-Markierungsschnittstelle",
      requireFeatureInterfaceIntro:
        "IRequireFeature ist eine Markierungsschnittstelle ohne Overhead. Befehle, die sie implementieren, entscheiden sich für editions-basiertes Feature-Gating über FeatureCheckBehavior. Befehle, die sie nicht implementieren, passieren das Verhalten ohne jeglichen Overhead. Dieses Design bedeutet, dass Feature-Gating explizit und opt-in ist — bestehende Befehle werden nie versehentlich geblockt, und neue Befehle deklarieren ihre Feature-Anforderungen bewusst.",

      // Event Triggers
      eventTriggersTitle: "Alle Befehle, die SubscriptionChangedEvent veröffentlichen",
      eventTriggersIntro:
        "SubscriptionChangedEvent wird von jedem Entitlements-Befehl oder -Service veröffentlicht, der den Abonnementstatus eines Mandanten ändert. Die folgende Tabelle dokumentiert jeden Auslösepunkt im System. Das Verständnis dieser Liste ist wichtig für das Debuggen von Berechtigungssynchronisierungsproblemen — wenn die Berechtigungen eines Mandanten falsch sind, ist einer dieser Auslöser die Quelle der letzten Synchronisierung.",

      // Signup Event Chain
      signupEventChainTitle: "Registrierungs-Ereigniskette — Modul-übergreifender Ereignisfluss",
      signupEventChainIntro:
        "Die Registrierungs-Saga überschreitet Modulgrenzen über drei In-Process-Domänenereignisse. SignupPhase1CompletedEvent fließt von Identity zu Entitlements. SignupCheckoutCompletedEvent fließt innerhalb von Entitlements (Stripe-Webhook zur Aktivierung). SubscriptionChangedEvent fließt von Entitlements zurück zu Identity. Diese bidirektionale Ereigniskette erklärt, warum die Registrierung NUR im Monolith-Modus funktioniert — alle drei Ereignisse erfordern, dass beide Module im selben Prozess laufen.",

      // Bundle Expansion
      bundleExpansionTitle: "Bundle-Erweiterung — Granulare Berechtigungszuweisungen",
      bundleExpansionIntro:
        "Bundle-Erweiterung ermöglicht es einer Edition, spezifische Berechtigungscodes über die Modul-Level-Aktivierung hinaus zu erteilen oder zu verweigern, die SubscriptionChangedEvent trägt. Wenn ein Abonnement Bundles enthält, trägt das SubscriptionChangedEvent vorab erweiterte BundleExpansionDto-Einträge. Der Ereignishandler von Identity verarbeitet jedes Bundle separat über ITenantPermissionManager.SyncBundlePermissionsAsync, der Erteilungs- und Verweigerungscodes gegen den aktuellen Berechtigungssatz des Mandanten abgleicht.",
      bundleExpansionNote:
        "Bundle-Erweiterungen werden NACH der Hauptmodul-Berechtigungssynchronisierung verarbeitet. Wenn der Erteilungscode eines Bundles mit einer Modulberechtigungsentfernung in Konflikt steht (d.h. das Modul ist deaktiviert, aber das Bundle versucht, eine Berechtigung davon zu erteilen), hat die Modulrevokation Vorrang. Bundle-Erweiterungen können keine Berechtigungen von deaktivierten Modulen neu erteilen.",

      // IAdminPermissionCache
      adminPermCacheTitle: "IAdminPermissionCache — Der Autorisierungscache",
      adminPermCacheIntro:
        "IAdminPermissionCache ist der serverseitige Redis-Cache, den AuthorizationBehavior verwendet, um Berechtigungen zu prüfen, ohne bei jeder Anfrage die Datenbank zu treffen. Er speichert einen denormalisierten Snapshot der Berechtigungen, Rollen und Feldprojektionen jedes Administrators. Der Cache-Eintrag wird bei der ersten Anfrage nach einem Cache-Miss lazy befüllt. InvalidateAll() wird nach Massen-Berechtigungssynchronisierungsoperationen (SubscriptionChangedEvent-Verarbeitung) aufgerufen, um alle Admins bei ihrer nächsten Anfrage zum Neuladen zu zwingen.",

      // ICurrentUser
      currentUserTitle: "ICurrentUser — Die allgegenwärtige Querschnittsschnittstelle",
      currentUserIntro:
        "ICurrentUser ist die einzige Schnittstelle, die jedes Modul direkt verwendet — es ist keine modulübergreifende Brücke wie die anderen, sondern eine grundlegende Querschnittsangelegenheit, die überall verfügbar ist. Sie wird von Identitys JWT-Middleware bei jeder authentifizierten Anfrage befüllt und stellt den aktuellen Admin-/Benutzerkontext jedem Handler in jedem Modul zur Verfügung. Jedes Modul hängt von Core.Application ab, das ICurrentUser definiert, sodass es immer ohne modulübergreifende Zeremonie verfügbar ist.",
      currentUserNote:
        "ICurrentUser unterscheidet sich von den anderen modulübergreifenden Schnittstellen. Sie wird von Identity-Middleware befüllt und universell konsumiert. Sie benötigt KEINEN NoOp-Fallback — sie wird immer von der JWT-Middleware von Core.Infrastructure implementiert, unabhängig davon, welche Module geladen sind. Sie ist die einzige Ausnahme vom NoOp-Muster.",

      // Feature Resolution
      featureResolutionTitle: "Feature-Wert-Auflösungskette",
      featureResolutionIntro:
        "Wenn IFeatureChecker.IsEnabledAsync() für einen Mandanten und ein Feature aufgerufen wird, löst Entitlements den Wert über eine Prioritätskette auf. TenantFeatureOverride (manuelle Überschreibung pro Mandant) gewinnt immer. Wenn keine Überschreibung existiert, wird der EditionFeature-Wert verwendet. Wenn die Edition das Feature nicht definiert, wird Feature.DefaultValue verwendet. Für numerische Features mit mehreren aktiven Abonnements (Trial + Basisplan) gewinnt der MAX-Wert. Für boolesche Features gewinnt true. Für String-Features gewinnt das Base-Abonnement.",

      // Architecture Rules
      archRulesTitle: "Modulzusammenarbeit — Zusammenfassung der Architekturregeln",
      archRulesIntro:
        "Dies sind die verbindlichen Regeln für die gesamte modulübergreifende Kommunikation in SCRIPE. Sie werden durchgesetzt durch scripe arch-check (30-Regel-Tiefenscan), Projektreferenz-Einschränkungen in der .sln-Datei und Code-Review. Verletzungen dieser Regeln erzeugen zirkuläre Abhängigkeiten, Deployment-Kopplung und Testunmöglichkeit.",
      doTitle: "✅ Tue dies",
      dontTitle: "❌ Tue dies niemals",

      // Security Boundary
      securityBoundaryTitle: "Durchsetzung von Sicherheitsgrenzen",
      securityBoundaryIntro:
        "Die Modul-Isolationsregeln sind nicht nur eine architektonische Präferenz — sie sind Sicherheitsgrenzen. Die modulübergreifende Isolation stellt sicher, dass ein Fehler oder Kompromittierung in einem Modul nicht direkt auf den Datenspeicher eines anderen Moduls zugreifen kann. Diese Regeln werden auf mehreren Ebenen durchgesetzt: Projektreferenz-Einschränkungen, Architektur-Lint-Regeln und Code-Review-Checklisten.",
      archCheckCaution:
        "Führen Sie scripe arch-check vor jedem PR aus, der modulübergreifenden Code berührt. Das --json-Flag beendet mit Code 1, wenn kritische Verletzungen gefunden werden, was es als CI-Gate geeignet macht. Architekturverletzungen sind bei der PR-Überprüfung viel günstiger zu beheben als nach einem Deployment.",

      // MODULE_NAME env
      moduleNameEnvTitle: "MODULE_NAME-Umgebungsvariablen-Referenz",
      moduleNameEnvIntro:
        "Die Umgebungsvariable MODULE_NAME wird beim Container-Start gesetzt und bestimmt, welche Module in den Prozess geladen werden. Die Datei ModuleRegistration.cs in Host/API liest diese Variable und registriert bedingt nur die DI-Registrierungen des angegebenen Moduls und seinen EF Core DbContext. Wenn sie leer ist (die Standardeinstellung), werden alle Module registriert — dies ist der Monolith-Modus, der alle modulübergreifenden Zusammenarbeitsmuster unterstützt.",
    },
    crossModule: {
      title: "Modulübergreifende Zusammenarbeit im Detail",
      description: "Wie Identity und Entitlements ohne direkte Abhängigkeiten zusammenarbeiten — über Core.Application-Abstraktionen, IRequireFeature und AstraFlow-Pipeline-Verhalten.",
      intro: "Die Module Identity und Entitlements müssen eng zusammenarbeiten: Entitlements steuert Berechtigungen für Identity-Befehle, während Identity die Berechtigungen speichert, die Entitlements bei Abonnementänderungen synchronisiert. Da direkte Importe zirkuläre Abhängigkeiten erzeugen würden, fungiert die Schicht Core.Application als neutrale Brücke.",
      bridgeTitle: "Die Drei-Schichten-Brücke",
      bridgeContent: "Der Namensraum Core.Application.Abstractions bildet das Herzstück der modulübergreifenden Kommunikation mit über 32 typisierten Schnittstellenverträgen.",
      gridCoreTitle: "Core.Application-Abstraktionen",
      gridCoreDesc: "Über 32 typisierte Verträge (IFeatureChecker, ITenantPermissionManager, ICurrentUser), von denen beide Module abhängen, die jedoch keines besitzt.",
      gridEventsTitle: "Domänenereignisse",
      gridEventsDesc: "Entitäten lösen Domänenereignisse aus, die von anderen Modulen über INotificationHandler ohne direkte Abhängigkeiten verarbeitet werden.",
      gridPipelineTitle: "AstraFlow-Pipeline",
      gridPipelineDesc: "FeatureCheckBehavior und AuthorizationBehavior erzwingen Richtlinien automatisch für jeden Befehl.",
      coreAbstractionsTitle: "Core.Application-Verträge",
      coreAbstractionsContent: "IFeatureChecker, ITenantPermissionManager und ITenantContext liegen in Core.Application. Core.Infrastructure registriert NoOp-Implementierungen mit TryAddScoped, echte Modul-Implementierungen überschreiben diese mit AddScoped.",
      requireFeatureTitle: "IRequireFeature: Feature-Gating in Befehlen",
      requireFeatureContent: "Befehle implementieren IRequireFeature, um benötigte Mandantenfunktionen zu deklarieren. FeatureCheckBehavior fängt diese Befehle an Position 4 der Pipeline ab.",
      pipelineTitle: "AstraFlow-Pipeline-Ausführungsreihenfolge",
      pipelineContent: "Jeder Befehl durchläuft 7 Pipeline-Verhaltensweisen in strikter Reihenfolge: Validierung vor Autorisierung und Feature-Prüfung vor dem Handler.",
      eventFlowTitle: "Domänenereignis-Fluss",
      eventFlowContent: "Ereignisse werden über EF Core OutboxInterceptor erfasst und vom OutboxProcessor asynchron an Handler anderer Module übermittelt.",
      realWorldTitle: "Praxisbeispiel: Identity ↔ Entitlements",
      realWorldContent: "Klare Trennung der Zuständigkeiten: Kein Modul greift jemals direkt auf die Datenbank eines anderen Moduls zu.",
      keyInsightTip: "Entscheidende Erkenntnis: Weder Identity importiert Entitlements noch umgekehrt. Beide hängen ausschließlich von Core.Application ab.",
    },
  },
};
