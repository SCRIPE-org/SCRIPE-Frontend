/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  getStarted: {
    overview: {
      title: "Übersicht",
      description:
        "Einführung in die Architektur, Funktionen und den Technologie-Stack der NEXORA Enterprise Plattform.",
      intro:
        "NEXORA ist eine produktionsbereite Enterprise-Plattform, die mit einer modularen Monolith-Architektur entwickelt wurde. Sie bietet alles, was Sie zum Erstellen skalierbarer Geschäftsanwendungen benötigen: Authentifizierung, Autorisierung, Mandantenfähigkeit (Multi-Tenancy), Audit-Protokollierung, Echtzeitereignisse und ein umfassendes Admin-Panel – alles sofort einsatzbereit. Die Plattform läuft als einzelne Binärdatei, die als Monolith bereitgestellt oder ohne Codeänderungen in Microservices zerlegt werden kann.",
      featureModular: "Modularer Monolith",
      featureModularDesc:
        "Isolierte Module mit klaren Grenzen – unabhängig entwickeln, testen und bereitstellen. Gleiche Binärdatei, flexibles Deployment.",
      featureCQRS: "CQRS + NEXORA mediator",
      featureCQRSDesc:
        "Trennung von Befehlen und Abfragen mit einer 4-stufigen Pipeline: Validierung, Feature-Gating, Caching und Leistungsüberwachung.",
      featureSecurity: "Enterprise-Sicherheit",
      featureSecurityDesc:
        "Einheitliche richtlinienbasierte Zugriffskontrolle (PBAC), die RBAC, GBAC und ABAC vereint. Inklusive 2FA, Einschränkungen auf Feldebene, Rate Limiting, Sitzungsmanagement und unveränderlichen Audit-Trails.",
      featureMultiTenant: "Mandantenfähigkeit",
      featureMultiTenantDesc:
        "Mandantenisolierung auf Zeilenebene mit globalen Abfragefiltern von EF Core. Mandantenspezifische Einstellungen, Branding und Datenbereiche.",
      featureMultiDB: "Flexible Datenbank",
      featureMultiDBDesc:
        "Wechseln Sie zwischen SQL Server, PostgreSQL oder Oracle. Betreiben Sie alle Module in einer gemeinsamen Datenbank (Single-Modus) oder geben Sie jedem Modul eine eigene Datenbank (Multi-Modus) — gesteuert über eine einzige Konfigurationsoption.",
      featureDeployment: "Flexibles Deployment",
      featureDeploymentDesc:
        "Bereitstellung als Monolith, Microservices oder Hybrid über eine einzige Umgebungsvariable (MODULE_NAME).",
      featureSSO: "Enterprise SSO & Identity Provider",
      featureSSODesc:
        "Nativer OIDC/OAuth2 Identity Provider für echtes Single Sign-On in Ihrem gesamten Ökosystem. Agieren Sie als primärer IDP (wie Keycloak), der externe Client-Anwendungen nahtlos verwaltet.",
      architectureTitle: "Architektur-Topologie",
      architectureIntro:
        "NEXORA arbeitet in drei Deployment-Modi, die vollständig durch eine einzige Umgebungsvariable gesteuert werden. Dieselbe kompilierte Binärdatei kann als Monolith (alle Module), als Microservice (einzelnes Modul) oder als API-Gateway (YARP-Proxy) ausgeführt werden.",
      deploymentModesTitle: "Deployment-Modi",
      deploymentModesIntro:
        "Die Umgebungsvariable MODULE_NAME bestimmt, welche Module beim Start geladen werden. Wenn sie leer ist, werden alle Module registriert (Monolith-Modus). Wenn ein Modulname angegeben ist, wird nur dieses Modul geladen (Microservice-Modus). Wenn sie auf 'Gateway' gesetzt ist, wird der YARP-Reverse-Proxy aktiviert.",
      techStackTitle: "Technologie-Stack",
      serviceRegistrationTitle: "Reihenfolge der Service-Registrierung",
      serviceRegistrationIntro:
        "Die Reihenfolge der Service-Registrierung in der Program.cs ist architektonisch von Bedeutung. Eine Änderung der Reihenfolge kann zu Laufzeitfehlern führen. Die Kerninfrastruktur muss vor den Modulen registriert werden, und NEXORA mediator benötigt zuerst die Assembly-Marker der Module.",
      registrationOrderWarning:
        "Ändern Sie NICHT die Reihenfolge der Service-Registrierungen in der Program.cs. AddCoreInfrastructure muss vor den Modulen stehen (sie hängen von ICurrentUser ab) und AddCoreApplication muss nach den Modulen stehen (NEXORA mediator benötigt deren Assemblies).",
      environmentProfilesTitle: "Umgebungsprofile",
      envVarPrefixTip:
        "Es werden nur Umgebungsvariablen geladen, die mit NEXORA_ beginnen. Beispielsweise überschreibt NEXORA_ConnectionStrings__DefaultConnection den Connection String. Doppelte Unterstriche (__) repräsentieren Verschachtelungen in der JSON-Konfiguration.",
    },
    prerequisites: {
      title: "Voraussetzungen",
      description:
        "Erforderliche Tools, Datenbank-Setup und Umgebungskonfiguration für die Entwicklung.",
      intro:
        "Bevor Sie mit der Entwicklung von NEXORA beginnen, stellen Sie sicher, dass auf Ihrem Entwicklungsrechner die erforderlichen Tools installiert sind. Diese Seite behandelt genaue Versionsanforderungen, Datenbankunterstützung, Schritt-für-Schritt-Einrichtung und den Docker-Schnellstart.",
      requiredToolsTitle: "Erforderliche Tools",
      databaseTitle: "Datenbankunterstützung",
      databaseIntro:
        "NEXORA unterstützt standardmäßig drei Datenbankanbieter: SQL Server, PostgreSQL und Oracle. Der Anbieter wird über Database.Provider in der appsettings.json konfiguriert. Zusätzlich steuert die Einstellung Database.Mode die Datenbankisolierung: 'Single' legt alle Modultabellen in eine gemeinsame Datenbank, während 'Multi' (Standard) jedem Modul eine eigene Datenbank mit separaten Verbindungszeichenfolgen ermöglicht.",
      databaseTip:
        "Für die lokale Entwicklung ist SQL Server mit Docker das schnellste Setup. Verwenden Sie die untenstehende Docker Compose-Datei, um SQL Server und Redis in Sekundenschnelle zu starten.",
      envSetupTitle: "Umgebung einrichten",
      step1Title: "Tool-Versionen überprüfen",
      step1Content:
        "Stellen Sie sicher, dass alle erforderlichen Tools installiert sind und die Mindestversionsanforderungen erfüllen.",
      step2Title: "Repository klonen",
      step2Content: "Klonen Sie das Monorepo mit Git-Submodulen für Backend und Frontend.",
      step3Title: "Connection String konfigurieren",
      step3Content:
        "Aktualisieren Sie den Datenbank-Connection-String, damit er auf Ihre lokale Datenbankinstanz verweist.",
      step4Title: "Backend-Setup",
      step4Content:
        "Stellen Sie die NuGet-Pakete wieder her und wenden Sie Entity Framework-Migrationen an, um das Datenbankschema zu erstellen.",
      step5Title: "Frontend-Setup",
      step5Content:
        "Installieren Sie die npm-Abhängigkeiten und erstellen Sie Ihre lokale Umgebungskonfigurationsdatei.",
      dockerTitle: "Docker Schnellstart",
      dockerNote:
        "Die obige Docker Compose-Datei richtet SQL Server 2022 und Redis 7 für die lokale Entwicklung ein. Der Service nexora-api wird aus dem Backend-Dockerfile erstellt und verbindet sich automatisch mit beiden Diensten.",
    },
    quickStart: {
      title: "Schnellstart",
      description:
        "Bringen Sie NEXORA in unter 5 Minuten lokal zum Laufen – mit Backend, Frontend und Überprüfungsschritten.",
      intro:
        "Dieser Leitfaden führt Sie durch das Starten des Backend-API-Servers und des Frontend-Entwicklungsservers und überprüft anschließend, ob alles mit Health-Checks und API-Tests funktioniert.",
      backendTitle: "Backend starten",
      backendStep1Title: "Abhängigkeiten wiederherstellen",
      backendStep1Content: "Stellen Sie alle NuGet-Pakete für die Solution wieder her.",
      backendStep2Title: "Migrationen anwenden",
      backendStep2Content:
        "Führen Sie Entity Framework-Migrationen aus, um das Datenbankschema zu erstellen oder zu aktualisieren.",
      backendStep3Title: "API-Server ausführen",
      backendStep3Content: "Starten Sie den Backend-API-Server auf https://localhost:5001.",
      backendRunningTip:
        "Der API-Server startet standardmäßig auf https://localhost:5001. Die Swagger-UI ist im Entwicklungsmodus unter /swagger verfügbar.",
      frontendTitle: "Frontend starten",
      frontendStep1Title: "Abhängigkeiten installieren",
      frontendStep1Content:
        "Installieren Sie alle npm-Abhängigkeiten mit pnpm für eine schnellere, speichereffizientere Installation.",
      frontendStep2Title: "Umgebung konfigurieren",
      frontendStep2Content:
        "Erstellen Sie eine .env.local-Datei mit der API-URL und dem App-Namen.",
      frontendStep3Title: "Dev-Server starten",
      frontendStep3Content: "Starten Sie den Next.js-Entwicklungsserver auf http://localhost:3000.",
      defaultCredentialsTitle: "Standard-Zugangsdaten",
      credentialsWarning:
        "Ändern Sie diese Passwörter in der Produktion sofort! Die Standard-Zugangsdaten werden durch die Datenbankmigration erstellt und sollten nur für die lokale Entwicklung verwendet werden.",
      verifyInstallTitle: "Installation überprüfen",
      verifyInstallIntro:
        "Sobald beide Server laufen, überprüfen Sie die Installation mit diesen Tests.",
      nexoraCliTitle: "NEXORA CLI",
      nexoraCliIntro:
        "Die NEXORA CLI (nexora-cli) bietet Scaffolding-Befehle, um Module, Entitäten, Befehle, Abfragen und mehr zu generieren. Sie folgt automatisch den Architekturkonventionen des Projekts.",
      cliDevTitle: "Entwicklung mit der CLI",
      cliDevIntro:
        "Anstatt Backend- und Frontend-Server manuell zu starten, verwenden Sie die NEXORA CLI für ein optimiertes Entwicklungserlebnis. Die CLI übernimmt automatisch die Port-Erkennung, den Browser-Start und die gleichzeitige Serververwaltung.",
      cliDevAllCmd:
        "nexora dev all — Beide Server gleichzeitig starten mit beschrifteter Ausgabe und automatischem Browser-Start.",
      cliDevFrontendCmd:
        "nexora dev frontend — Next.js-Entwicklungsserver mit automatischer Port-Erkennung und Browser-Start.",
      cliDevBackendCmd: "nexora dev backend — .NET-Backend im Entwicklungsmodus starten.",
      cliDevNoBrowser:
        "--no-browser zu jedem Dev-Befehl hinzufügen, um den automatischen Browser-Start zu verhindern (nützlich für CI/Headless-Umgebungen).",
      studioTitle: "NEXORA Studio",
      studioIntro:
        "NEXORA Studio ist ein visuelles Entwickler-Dashboard, das eine Echtzeit-Benutzeroberfläche für das Management Ihres gesamten Entwicklungsworkflows bietet. Es umfasst Modulverwaltung, Code-Generatoren, Dev-Server-Steuerung, Datenbankoperationen, Terminal-Zugang und mehr.",
      studioDevCmd:
        "nexora studio --dev — Studio im Entwicklungsmodus mit Hot-Reload starten. Öffnet automatisch den Browser auf Port 4200.",
      studioProdCmd:
        "nexora studio — Studio im Produktionsmodus starten. Baut Engine und UI, falls noch nicht vorhanden.",
      studioBuildCmd:
        "nexora studio build — Studio-Engine (TypeScript) und UI (Next.js) vorkompilieren, ohne zu starten.",
      studioPortCmd:
        "Verwenden Sie --port und --engine-port, um die UI-Ports (Standard: 4200) und Engine-Ports (Standard: 4201) anzupassen.",
      productionTitle: "Produktionsserver",
      productionIntro:
        "Für das Produktions-Deployment verwenden Sie den Befehl nexora start, der Server im Release-/Produktionsmodus mit optimierter Leistung ausführt.",
      prodStartAllCmd:
        "nexora start all — Backend (Release-Modus) und Frontend (next start) gleichzeitig starten. Öffnet automatisch den Browser.",
      prodStartPublishedCmd:
        "nexora start all --published — Aus vorkompilierter DLL für den schnellsten Start ausführen. Erfordert zuerst nexora build backend.",
      prodStartFrontendCmd: "nexora start frontend — Nur den Produktions-Frontend-Server starten.",
      prodStartBackendCmd:
        "nexora start backend — Nur den Produktions-Backend-Server starten (dotnet run --configuration Release).",
      prodBuildAllCmd:
        "nexora build all — Backend und Frontend für das Produktions-Deployment bauen.",
      prodNoBrowser:
        "--no-browser hinzufügen, um den automatischen Browser-Start im Produktionsmodus zu verhindern.",
    },
    projectStructure: {
      title: "Projektstruktur",
      description:
        "Vollständiges Verzeichnislayout des NEXORA-Monorepos – Root, Backend, Frontend und Modul-Aufbau.",
      intro:
        "NEXORA ist als Git-Submodul-Monorepo organisiert und besteht aus drei Hauptteilen: dem Root-Repository, dem Backend-Submodul und dem Frontend-Submodul. Das Verständnis dieser Struktur ist entscheidend für die Navigation durch den Code.",
      rootTitle: "Root Monorepo",
      backendTitle: "Backend-Struktur",
      frontendTitle: "Frontend-Struktur",
      toolsTitle: "Entwicklerwerkzeuge",
      toolsIntro:
        "Das Verzeichnis tools/ enthält die NEXORA CLI und das Studio. Die CLI bietet 62 Befehle für Scaffolding, Builds, Migrationen und Deployment. Studio ist ein visuelles Entwickler-Dashboard, gebaut mit Express (Engine) und Next.js (UI).",
      moduleAnatomyTitle: "Anatomie eines Moduls",
      moduleAnatomyIntro:
        "Jedes Frontend-Modul folgt einer identischen Struktur. Diese Konsistenz macht es einfach, in jedem Modul zu navigieren, sobald man eines verstanden hat. Jede Ebene hat strenge Zuständigkeiten und Importregeln.",
      allowedImports: "Erlaubte Importe",
      forbiddenImports: "Verbotene Importe",
      boundaryWarning:
        "Modulgrenzen sind absolut verpflichtend. Module DÜRFEN NICHT voneinander importieren. Wenn Code geteilt werden muss, muss er nach @core/ verschoben werden. Modulübergreifende Daten werden nur über Routenparameter (URL) oder gemeinsame IDs übergeben.",
    },
  },
};
