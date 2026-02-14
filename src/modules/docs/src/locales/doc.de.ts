/**
 * German locale for the Documentation Portal.
 * Contains all UI strings and content translations.
 */
import type { DocTranslations } from './doc.en';

export const docDe: DocTranslations = {
      // ─── Common UI ──────────────────────────────────────────────
      common: {
            search: 'Dokumentation durchsuchen...',
            searchPlaceholder: 'Suchbegriff eingeben...',
            searchShortcut: '⌘K',
            searchNoResults: 'Keine Ergebnisse gefunden',
            searchResultsTitle: 'Suchergebnisse',
            copyCode: 'Kopieren',
            codeCopied: 'Kopiert!',
            onThisPage: 'Auf dieser Seite',
            relatedDocs: 'Verwandte Dokumente',
            lastUpdated: 'Zuletzt aktualisiert',
            previous: 'Zurück',
            next: 'Weiter',
            backToTop: 'Nach oben',
            expandAll: 'Alle aufklappen',
            collapseAll: 'Alle zuklappen',
            menu: 'Menü',
            closeMenu: 'Menü schließen',
            tableOfContents: 'Inhaltsverzeichnis',
            readingTime: '{{min}} Min. Lesezeit',
            home: 'Startseite',
            editPage: 'Diese Seite bearbeiten',
            version: 'Version',
            language: 'Sprache',
      },

      // ─── Info Blocks ────────────────────────────────────────────
      info: {
            note: 'Hinweis',
            tip: 'Tipp',
            warning: 'Warnung',
            danger: 'Gefahr',
      },

      // ─── API Table ──────────────────────────────────────────────
      api: {
            method: 'Methode',
            endpoint: 'Endpunkt',
            description: 'Beschreibung',
            auth: 'Auth',
            authRequired: 'Erforderlich',
            noAuth: 'Öffentlich',
            permission: 'Berechtigung',
      },

      // ─── Navigation Categories ──────────────────────────────────
      nav: {
            getStarted: 'Erste Schritte',
            tutorials: 'Anleitungen',
            architecture: 'Architektur',
            features: 'Funktionen',
            frontend: 'Frontend-Module',
            security: 'Sicherheit',
            apiReference: 'API-Referenz',
            infrastructure: 'Infrastruktur',
      },

      // ─── Get Started ────────────────────────────────────────────
      getStarted: {
            overview: {
                  title: 'Übersicht',
                  description: 'Willkommen bei der Dokumentation der Verified ERP-Plattform.',
                  hero: 'Enterprise-Anwendungen schneller entwickeln',
                  heroSub: 'Eine produktionsreife Modular-Monolith-Plattform mit .NET 10 Backend, Next.js Frontend und allem, was Sie für skalierbare Enterprise-Anwendungen benötigen.',
                  whatIs: 'Was ist die Verified-Plattform?',
                  whatIsText: 'Verified ist eine unternehmenstaugliche ERP-Plattform mit Modular-Monolith-Architektur. Sie bietet eine bewährte Grundlage für komplexe Geschäftsanwendungen mit Authentifizierung, Autorisierung, Mandantenfähigkeit, Audit-Protokollierung und einem umfassenden Admin-Panel — alles sofort einsatzbereit.',
                  keyFeatures: 'Hauptfunktionen',
                  keyFeaturesText: 'Die Plattform enthält umfassende Funktionen für Enterprise-Anwendungen.',
                  feature1Title: 'Modular-Monolith-Architektur',
                  feature1Text: 'Klare Trennung der Zuständigkeiten mit isolierten Modulen, die unabhängig entwickelt und getestet werden können. Backend nutzt CQRS mit MediatR, Frontend folgt dem SOLID View/ViewModel-Pattern.',
                  feature2Title: 'Enterprise-Sicherheit',
                  feature2Text: 'Rollenbasierte Zugriffskontrolle (RBAC) mit serverseitigem Berechtigungs-Caching, Feldebenen-Sicherheit, Daten-Scoping, 2FA, Sitzungsverwaltung und umfassende Audit-Trails.',
                  feature3Title: 'Mandantenfähigkeit',
                  feature3Text: 'Integrierte Mandantenverwaltung mit hierarchischen Strukturen, isolierten Daten, mandantenspezifischen Einstellungen und mandantenbezogenen Berechtigungen.',
                  feature4Title: 'Full-Stack-Lösung',
                  feature4Text: '.NET 10 Backend mit EF Core, Next.js 16 Frontend mit TanStack Query v5, Zustand State Management und einer leistungsstarken generischen CRUD-Engine.',
                  techStack: 'Technologie-Stack',
                  backendStack: 'Backend',
                  frontendStack: 'Frontend',
                  quickLinks: 'Schnellzugriff',
                  quickLink1: 'Schnellstart-Anleitung',
                  quickLink2: 'Architekturübersicht',
                  quickLink3: 'Erstes Tutorial',
            },
            prerequisites: {
                  title: 'Voraussetzungen',
                  description: 'Anforderungen und Tools, die Sie vor dem Start benötigen.',
                  intro: 'Stellen Sie sicher, dass die folgenden Tools auf Ihrem Entwicklungsrechner installiert sind.',
                  required: 'Erforderliche Tools',
                  dotnet: '.NET 10 SDK',
                  dotnetText: 'Erforderlich für das Erstellen und Ausführen des Backends. Von der offiziellen .NET-Website herunterladen.',
                  nodejs: 'Node.js 20+ & npm',
                  nodejsText: 'Erforderlich für das Frontend. Wir empfehlen die neueste LTS-Version.',
                  database: 'SQL Server (oder PostgreSQL/Oracle)',
                  databaseText: 'Das Backend unterstützt mehrere Datenbankanbieter. SQL Server ist der Standard.',
                  ide: 'IDE / Code-Editor',
                  ideText: 'Visual Studio 2022+ oder VS Code mit C#-Erweiterung für das Backend. VS Code wird für das Frontend empfohlen.',
                  optional: 'Optionale Tools',
                  git: 'Git',
                  gitText: 'Für Versionskontrolle und das Klonen des Repositorys.',
                  docker: 'Docker',
                  dockerText: 'Zum Ausführen der Datenbank in einem Container (optional, aber empfohlen).',
                  postman: 'Postman / Thunder Client',
                  postmanText: 'Zum manuellen Testen von API-Endpunkten.',
            },
            quickStart: {
                  title: 'Schnellstart',
                  description: 'Die Plattform in 5 Minuten zum Laufen bringen.',
                  intro: 'Befolgen Sie diese Schritte, um die Plattform auf Ihrem lokalen Rechner zu klonen, konfigurieren und auszuführen.',
                  step1Title: 'Repository klonen',
                  step1Content: 'Klonen Sie das Repository mit Git auf Ihren lokalen Rechner.',
                  step2Title: 'Datenbank konfigurieren',
                  step2Content: 'Aktualisieren Sie die Verbindungszeichenfolge in der Backend-Konfigurationsdatei.',
                  step3Title: 'Datenbank-Migrationen ausführen',
                  step3Content: 'Wenden Sie die Datenbankschema-Migrationen an, um alle Tabellen zu erstellen.',
                  step4Title: 'Backend starten',
                  step4Content: 'Starten Sie den Backend-API-Server.',
                  step5Title: 'Frontend starten',
                  step5Content: 'Installieren Sie die Abhängigkeiten und starten Sie den Frontend-Entwicklungsserver.',
                  step6Title: 'Anwendung aufrufen',
                  step6Content: 'Öffnen Sie Ihren Browser und navigieren Sie zur Anwendung. Verwenden Sie die Standard-Admin-Anmeldedaten.',
                  defaultCredentials: 'Standard-Anmeldedaten',
                  successTip: 'Wenn alles korrekt eingerichtet ist, sollten Sie das Admin-Dashboard sehen. Der Standard-Admin hat vollständige Berechtigungen.',
            },
            projectStructure: {
                  title: 'Projektstruktur',
                  description: 'Verstehen Sie das Verzeichnislayout beider Projekte.',
                  intro: 'Die Verified-Plattform ist als Monorepo mit zwei Hauptprojekten organisiert. Beide folgen einer modularen Architektur.',
                  backendTitle: 'Backend-Struktur',
                  backendText: 'Das Backend folgt einer Modular-Monolith-Architektur mit CQRS-Pattern.',
                  frontendTitle: 'Frontend-Struktur',
                  frontendText: 'Das Frontend folgt einer modularen Architektur mit SOLID View/ViewModel-Pattern.',
                  keyDirectories: 'Wichtige Verzeichnisse erklärt',
            },
      },

      // ─── Tutorials ──────────────────────────────────────────────
      tutorials: {
            firstBackendModule: {
                  title: 'Erstes Modul erstellen (Backend)',
                  description: 'Schritt-für-Schritt-Anleitung zur Erstellung eines neuen Backend-Moduls mit CQRS.',
            },
            firstFrontendModule: {
                  title: 'Erstes Modul erstellen (Frontend)',
                  description: 'Erstellen Sie ein Frontend-Modul nach dem SOLID View/ViewModel-Pattern.',
            },
            addEntity: {
                  title: 'Domain-Entität hinzufügen',
                  description: 'Erstellen Sie eine neue Domain-Entität mit Validierung und Audit-Unterstützung.',
            },
            addCommand: {
                  title: 'Command hinzufügen (CQRS)',
                  description: 'Erstellen Sie einen Command mit Handler, Validierung und Pipeline-Behaviors.',
            },
            addQuery: {
                  title: 'Query hinzufügen (CQRS)',
                  description: 'Erstellen Sie eine Query mit Handler und Response-Mapping.',
            },
            addPermissions: {
                  title: 'Berechtigungen hinzufügen',
                  description: 'Berechtigungen einfügen und Endpunkte mit RBAC schützen.',
            },
            addApiEndpoint: {
                  title: 'API-Endpunkt hinzufügen',
                  description: 'Erstellen Sie einen Controller-Endpunkt mit Swagger-Doku und Auth.',
            },
            apiIntegration: {
                  title: 'Frontend-API-Integration',
                  description: 'Verbinden Sie Ihr Frontend-Modul mit der Backend-API.',
            },
      },

      // ─── Architecture ───────────────────────────────────────────
      architecture: {
            overview: {
                  title: 'Architekturübersicht',
                  description: 'Überblick über die Plattformarchitektur.',
            },
            backend: {
                  title: 'Backend-Architektur',
                  description: '.NET 10 Modular Monolith mit CQRS und DDD.',
            },
            frontend: {
                  title: 'Frontend-Architektur',
                  description: 'Next.js modularer Monolith mit SOLID-Patterns.',
            },
            cqrs: {
                  title: 'CQRS-Pattern',
                  description: 'Implementierung der Command Query Responsibility Segregation.',
            },
            modules: {
                  title: 'Modulsystem',
                  description: 'Wie Module strukturiert und isoliert werden.',
            },
            solidPattern: {
                  title: 'SOLID View/ViewModel',
                  description: 'Das SOLID-Pattern für Frontend-Views und ViewModels.',
            },
            stateManagement: {
                  title: 'State Management',
                  description: 'TanStack Query für Server-State, Zustand für UI-State.',
            },
            dataFlow: {
                  title: 'Datenfluss',
                  description: 'Wie Daten von der UI zur Datenbank und zurück fließen.',
            },
      },

      // ─── Features ───────────────────────────────────────────────
      features: {
            authentication: {
                  title: 'Authentifizierung',
                  description: 'Admin- und Benutzer-Login, JWT-Token, Refresh-Flow.',
                  overview: 'Übersicht',
                  overviewText: 'Das Authentifizierungssystem bietet sichere Anmeldung für Admin-Benutzer und reguläre Benutzer. Es verwendet JWT-Zugriffstoken mit serverseitigem Berechtigungs-Caching zur Autorisierung.',
                  flowTitle: 'Authentifizierungsablauf',
                  loginFlow: 'Anmeldeablauf',
                  loginFlowText: 'Bei der Admin-Anmeldung validiert das System die Anmeldedaten, prüft 2FA, generiert JWT-Token und cached Berechtigungen serverseitig.',
                  endpoints: 'API-Endpunkte',
                  backendImpl: 'Backend-Implementierung',
                  frontendImpl: 'Frontend-Integration',
                  securityFeatures: 'Sicherheitsfunktionen',
                  tipSecurity: 'Berechtigungen werden serverseitig gecached (nicht im JWT). Berechtigungsänderungen werden sofort wirksam, ohne Token-Aktualisierung.',
                  accountLockout: 'Kontosperrung',
                  accountLockoutText: 'Nach 5 fehlgeschlagenen Anmeldeversuchen wird das Konto für 15 Minuten gesperrt. Dies verhindert Brute-Force-Angriffe.',
            },
            twoFactorAuth: {
                  title: 'Zwei-Faktor-Authentifizierung',
                  description: 'TOTP-basierte 2FA-Einrichtung, Verifizierung und Wiederherstellung.',
            },
            sessionManagement: {
                  title: 'Sitzungsverwaltung',
                  description: 'Aktive Sitzungsverfolgung, Geräteinformationen und Sitzungswiderruf.',
            },
            profileManagement: {
                  title: 'Profilverwaltung',
                  description: 'Profilaktualisierungen, Avatar-Upload, Passwortänderung.',
            },
            adminManagement: {
                  title: 'Admin-Verwaltung',
                  description: 'Admin-CRUD, Rollenzuweisung, Impersonation und Massenoperationen.',
            },
            roleManagement: {
                  title: 'Rollenverwaltung',
                  description: 'Rollen-CRUD mit Berechtigungszuweisung und Klonen.',
            },
            permissionSystem: {
                  title: 'Berechtigungssystem',
                  description: 'RBAC mit serverseitigem Caching und Feldebenen-Sicherheit.',
            },
            tenantManagement: {
                  title: 'Mandantenverwaltung',
                  description: 'Multi-Mandanten-CRUD, Hierarchie, Einstellungen und Logos.',
            },
            menuSystem: {
                  title: 'Menüsystem',
                  description: 'Dynamische Menüverwaltung mit Neuanordnung und Sichtbarkeitssteuerung.',
            },
            dashboardAnalytics: {
                  title: 'Dashboard & Analysen',
                  description: 'KPIs, Diagramme, Sicherheitsereignisse und Datenexport.',
            },
            auditLogging: {
                  title: 'Audit-Protokollierung',
                  description: 'Umfassender Audit-Trail mit 4-Quellen-Pipeline.',
            },
            recycleBin: {
                  title: 'Papierkorb',
                  description: 'Anzeige weich gelöschter Datensätze mit Wiederherstellungsfunktion.',
            },
            fileManagement: {
                  title: 'Dateiverwaltung',
                  description: 'Upload in Teilen, fortsetzbarer Download, ETag-Validierung.',
            },
            userAuthentication: {
                  title: 'Benutzer-Authentifizierung',
                  description: 'Benutzerregistrierung, E-Mail-/Telefon-Verifizierung, OAuth.',
            },
      },

      // ─── Frontend Modules ───────────────────────────────────────
      frontend: {
            authModule: {
                  title: 'Auth-Modul',
                  description: 'Anmeldeablauf, 2FA-Verifizierung, Token-Verwaltung und Route Guards.',
            },
            profileModule: {
                  title: 'Profil-Modul',
                  description: 'Admin-Profil, Sicherheitseinstellungen, Sitzungen und Aktivität.',
            },
            systemModule: {
                  title: 'System-Modul',
                  description: 'Alle 12 System-Untermodule: Admin, Rollen, Berechtigungen, Mandanten usw.',
            },
            crudEngine: {
                  title: 'CRUD-Engine',
                  description: 'GenericCrudView, DataTable, Formulare und Spaltenhelfer.',
            },
      },

      // ─── Security ───────────────────────────────────────────────
      security: {
            rbac: {
                  title: 'RBAC & Berechtigungen',
                  description: 'Rollenbasierte Zugriffskontrolle mit serverseitigem Caching.',
            },
            fieldLevel: {
                  title: 'Feldebenen-Sicherheit',
                  description: 'Zugriff auf bestimmte Entitätsfelder pro Rolle einschränken.',
            },
            idEncryption: {
                  title: 'ID-Verschlüsselung',
                  description: 'AES-256 Entitäts-ID-Verschleierung für öffentliche APIs.',
            },
            tokens: {
                  title: 'Token-Sicherheit',
                  description: 'JWT-Struktur, Refresh-Token-Rotation und Token-Widerruf.',
            },
      },

      // ─── API Reference ──────────────────────────────────────────
      apiReference: {
            adminAuth: {
                  title: 'Admin Auth API',
                  description: 'Anmeldung, Aktualisierung, Abmeldung, 2FA, Sitzungen.',
            },
            userAuth: {
                  title: 'Benutzer Auth API',
                  description: 'Registrierung, Verifizierung, Anmeldung, Passwortzurücksetzung, OAuth.',
            },
            adminManagement: {
                  title: 'Admin-Verwaltungs-API',
                  description: 'CRUD, Massenoperationen, Rollenzuweisung, Impersonation.',
            },
            adminManagementApi: {
                  title: 'Admin-Verwaltungs-API',
                  description: 'Vollständige CRUD-Operationen für die Admin-Benutzerverwaltung.',
            },
            roles: {
                  title: 'Rollen-API',
                  description: 'Rollen-CRUD und Berechtigungszuweisung.',
            },
            tenants: {
                  title: 'Mandanten-API',
                  description: 'Mandanten-CRUD, Hierarchie, Einstellungen.',
            },
            menus: {
                  title: 'Menü-API',
                  description: 'Menü-CRUD, Neuanordnung, Sichtbarkeit.',
            },
            audit: {
                  title: 'Audit-API',
                  description: 'Audit-Protokollliste, Details und Export.',
            },
      },

      // ─── Infrastructure ─────────────────────────────────────────
      infrastructure: {
            database: {
                  title: 'Datenbankkonfiguration',
                  description: 'SQL Server, PostgreSQL oder Oracle konfigurieren.',
            },
            multiDatabase: {
                  title: 'Multi-Datenbank-Unterstützung',
                  description: 'Zwischen Datenbankanbietern wechseln.',
            },
            migrations: {
                  title: 'Migrationen',
                  description: 'Datenbank-Migrationen ausführen und verwalten.',
            },
            caching: {
                  title: 'Caching-Strategie',
                  description: 'Berechtigungs-Caching, Abfrage-Caching und Cache-Invalidierung.',
            },
      },
};
